import { resolvedZeroState } from '../../../test/fixtures/ccnlRecovery';
// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { FundLedgerEntry, NormativeData } from '../../../domain';
import { createEmptyFundData } from '../../../domain/emptyFund';
import { normalizeInput } from '../../../application/input/inputNormalizer';
import { projectCanonicalFadSections } from '../../../domain/canonicalFadProjection';
import { deriveCanonicalFundResult } from '../canonicalFundLedger';
import { calculateFundCompletely } from '../fundEngine';
import { buildFadLedgerInputSections, calculateFadTotals } from '../fundCalculations';

const entry = (overrides: Partial<FundLedgerEntry>): FundLedgerEntry => ({
  id: 'CCNL_014_CURRENT', component: 'STABLE', operation: 'ADDITION', amount: 1400,
  source: 'MANUAL', status: 'VALID', art23Treatment: 'EXCLUDED', competenceYear: 2026, ...overrides,
});

describe('ARCH01 canonical section projection', () => {
  it.each([
    ['stable only', 1400, 0, 1400], ['variable only', 0, 600, 600], ['mixed', 1400, 600, 2000], ['zero', 0, 0, 0],
  ])('%s uses canonical stable/variable/total and subject/excluded', (_name, stable, variable, total) => {
    const canonical = deriveCanonicalFundResult([entry({ amount: Number(stable) }),
      entry({ id: 'VARIABLE', amount: Number(variable), component: 'VARIABLE', art23Treatment: 'SUBJECT' })]);
    const view = projectCanonicalFadSections(canonical);
    expect([view.stableTotal, view.variableTotal, view.total]).toEqual([stable, variable, total]);
    expect(view.sections.stabili.total).toBe(canonical.verifiedStableTotal);
    expect(view.sections.vs_soggette.total).toBe(canonical.verifiedVariableTotal);
    expect(view.subject).toBe(canonical.art23Subject);
    expect(view.excluded).toBe(canonical.art23Excluded);
  });
  it.each(['MISSING', 'UNDETERMINED', 'INVALID'] as const)('preserves %s and never promotes a subtotal', status => {
    const canonical = deriveCanonicalFundResult([entry({}), entry({ id: 'UNRESOLVED', amount: 900, component: 'VARIABLE', status })]);
    const view = projectCanonicalFadSections(canonical);
    expect(view.total).toBeNull();
    expect(view.verifiedTotal).toBe(1400);
    expect(view.sections.vn_non_soggette.unresolvedItems[0]).toMatchObject({ id: 'UNRESOLVED', status, amount: 900 });
    expect(Object.values(view.sections).every(section => section.authoritativeTotal === null)).toBe(true);
  });
  it('missing canonical is distinct from valid zero', () => {
    const missing = projectCanonicalFadSections(undefined);
    expect(missing).toMatchObject({ canonicalAvailable: false, total: null, verifiedTotal: null, stableTotal: null });
    expect(projectCanonicalFadSections(deriveCanonicalFundResult([]))).toMatchObject({ canonicalAvailable: true, total: 0, stableTotal: 0 });
  });
  it('preserves provenance/status and excludes figurative entries from section economics', () => {
    const provenance = { reason: 'missing decision', origin: 'source snapshot' };
    const canonical = deriveCanonicalFundResult([entry({ id: 'DL25_CURRENT', source: 'TRANSFERRED', originYear: 2025, provenance }),
      entry({ id: 'ART60_CONSOLIDATION', amount: 127.44, operation: 'DEDUCTION', art23Treatment: 'SUBJECT' }),
      entry({ id: 'ART60_ART23_FIGURATIVE', amount: 127.44, economicEffect: false, art23Treatment: 'SUBJECT' })]);
    const before = JSON.stringify(canonical);
    const view = projectCanonicalFadSections(canonical);
    expect(view.stableTotal).toBe(canonical.stableTotal);
    expect(view.verifiedDeductions).toBe(127.44);
    expect(view.sections.stabili.items.map(item => item.key)).toEqual(['DL25_CURRENT', 'ART60_CONSOLIDATION']);
    expect(view.sections.stabili.items[0].canonicalEntry).toMatchObject({ provenance, originYear: 2025, source: 'TRANSFERRED', status: 'VALID' });
    expect(view.subject).toBe(canonical.art23Subject);
    expect(JSON.stringify(canonical)).toBe(before);
  });
  it('engine retires independent totals but preserves the atomic ledger inputs', () => {
    const normative = { riferimenti_normativi: {} } as NormativeData;
    const raw = { st_art58c1_CCNL2026_incremento014_MS2021: 1400,
      vn_art58c2_CCNL2026_incremento022_MS2021: 600, st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0 };
    const ccnl = { monteSalari2021: 1_000_000 };
    const legacy = calculateFadTotals(raw, undefined, false, undefined, normative, undefined, ccnl);
    expect(legacy.totaleStabile_Dipendenti).toBe(0); // frozen PRE counterexample remains latent
    const atomic = buildFadLedgerInputSections(raw, undefined, false, undefined, normative, undefined, ccnl);
    for (const key of Object.keys(atomic)) expect(atomic[key].items).toEqual(legacy.sections[key].items);
    expect(Object.values(atomic).every(section => section.total === 0)).toBe(true);
    const fund = createEmptyFundData(2026);
    fund.historicalData.manualPersonalFundLimit2016 = 100000;
    fund.annualData.art33ManualDecision = 'DO_NOT_APPLY';
    fund.annualData.ccnl2024 = ccnl;
    fund.annualData.ccnlRecovery = resolvedZeroState();
    fund.fondoAccessorioDipendenteData = raw;
    const result = calculateFundCompletely(normalizeInput(fund), normative);
    expect([result.canonicalFund.stableTotal, result.canonicalFund.variableTotal, result.canonicalFund.total]).toEqual([1400, 600, 2000]);
    expect(result.fondi.dipendente.constitution!.sections.stabili.total).toBe(1400);
    expect(result.fondi.dipendente.summary.totaleFondo).toBe(result.canonicalFund.verifiedTotal);
  });
  it('active authority census guards engine/UI imports and modern writer selection', () => {
    for (const path of ['src/logic/calculation/fundEngine.ts', 'src/pages/FundDetailsPage.tsx', 'src/pages/FondoAccessorioDipendentePage.tsx']) {
      const source = readFileSync(path, 'utf8');
      expect(source).not.toMatch(/\bcalculateFadTotals\b|\bfadTotals\b/);
      expect(source).toContain('projectCanonicalFadSections');
    }
    for (const path of ['src/services/documents/pdfReportService.ts', 'src/services/documents/xlsReportService.ts']) {
      const source = readFileSync(path, 'utf8');
      expect(source).toContain('fadCanonical');
      expect(source).not.toContain('.fondoDipendenti');
    }
  });
});
