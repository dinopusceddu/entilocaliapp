import { describe, it, expect } from 'vitest';
import { calculateCcnl2026Increments } from '../ccnl2026Increments';
import { validateWizard2026Ccnl2026Step } from '../../../features/wizard2026/validation';
import { buildWizard2026TransferPreview, simulateWizard2026Transfer } from '../../../features/wizard2026/transfer/transferPreviewEngine';
import { applyWizard2026Transfer } from '../../../features/wizard2026/transfer/applyWizard2026Transfer';
import { calculateFundCompletely } from '../../calculation/fundEngine';
import { normalizeInput } from '../../../application/input/inputNormalizer';
import { cor04Draft, cor04Fund } from '../../../test/fixtures/cor04Ccnl022';
import type { NormativeData } from '../../../domain';
const normative = { riferimenti_normativi: {} } as NormativeData;
const calc = (f: ReturnType<typeof cor04Fund>) => calculateFundCompletely(normalizeInput(f), normative);
const check = (f: ReturnType<typeof cor04Fund>) => calc(f).compliance.checks.find(c => c.id === 'limite_022_ms2021_complessivo')!;
describe('COR-04 independent annual 0.22% cap', () => {
  it.each([2000, 2200, 2200.01, 3000, 5000])('one annual cap 2200 for amount %s, across calculator, wizard, engine and Compliance', amount => {
    const d = cor04Draft(amount); const fundShare = Math.round(amount * 0.8 * 100) / 100; const f = cor04Fund(fundShare, Math.round((amount - fundShare) * 100) / 100); const before = JSON.stringify(f);
    expect(d.ccnl2026.result?.limiteMassimo022).toBe(2200);
    expect(d.ccnl2026.result?.isSuperamentoLimite022).toBe(amount > 2200);
    expect(validateWizard2026Ccnl2026Step(d).some(c => c.id === 'CCNL2026-022-SUPERAMENTO')).toBe(amount > 2200);
    expect(check(f).isCompliant).toBe(amount <= 2200);
    if (amount > 2200) expect(calc(f).canonicalFund.status).not.toBe('VALID');
    expect(JSON.stringify(f)).toBe(before);
  });
  it('Fondo and EQ cannot each consume the entire ceiling', () => {
    const f = cor04Fund(1800, 1000); expect(check(f).isCompliant).toBe(false);
    expect(calc(f).canonicalFund.status).not.toBe('VALID');
  });
  it('missing monte salari is indeterminate, including zero allocation', () => {
    const f = cor04Fund(0, 0); delete f.annualData.ccnl2024!.monteSalari2021;
    expect(check(f).isCompliant).toBe(false); expect(check(f).messaggio).toMatch(/NON DETERMINABILE/i);
    const d = cor04Draft(2200); delete d.ccnl2026.monteSalari2021;
    expect(validateWizard2026Ccnl2026Step(d).some(c => c.severity === 'error')).toBe(true);
    expect(() => applyWizard2026Transfer(d, cor04Fund(0, 0))).toThrow();
  });
  it('an unexercised option does not become a positive increment through a cached result', () => {
    const d = cor04Draft(2200); delete d.ccnl2026.incremento022Anno;
    const f = cor04Fund(0, 0); const before = JSON.stringify(f); const preview = simulateWizard2026Transfer(d, f);
    expect(preview.fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021).toBe(0);
    expect(preview.fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(0);
    expect(calculateCcnl2026Increments({ monteSalari2021: 1000000 }).incremento022Applicato).toBe(0);
    expect(JSON.stringify(f)).toBe(before);
  });
  it('preview and APPLY block an excess even when cached checks are empty', () => {
    const d = cor04Draft(3000); const f = cor04Fund(0, 0);
    expect(buildWizard2026TransferPreview(d, f).items.find(i => i.id === 'CCNL_022_CURRENT')?.status).toBe('BLOCKED');
    expect(() => applyWizard2026Transfer(d, f)).toThrow(/CCNL2026-022-SUPERAMENTO/);
  });
  it.each([2025, 2026, 2027])('the annual cap stays 2200 in year %s without multiplying previous years', year => {
    const d = cor04Draft(2200, year); expect(d.ccnl2026.result?.limiteMassimo022).toBe(2200);
    expect(check(cor04Fund(1760, 440, year)).isCompliant).toBe(true);
    expect(check(cor04Fund(2400, 600, year)).isCompliant).toBe(false);
  });
});

function missing022Target() {
  const f = cor04Fund(0, 0);
  delete f.fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021;
  delete f.fondoElevateQualificazioniData.va_incremento022_ms2021_eq;
  return f;
}
describe('COR-04 explicit transfer, recoveries and immutable inputs', () => {
  it('recalculates the current split from chosen inputs instead of trusting stale cached money', () => {
    const d = cor04Draft(2200); d.ccnl2026.result = calculateCcnl2026Increments({ annoRiferimento: 2026,
      monteSalari2021: 2000000, incremento022Anno: 4400, fondoRisorseDecentrate2024: 80000, risorseEQ2024: 20000 });
    const f = missing022Target(); const before = JSON.stringify(f); const r = applyWizard2026Transfer(d, f);
    expect(r.fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021).toBe(1760);
    expect(r.fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(440);
    expect(r.annualData.ccnl2024?.monteSalari2021).toBe(1000000);
    expect(r.wizard2026TransferSnapshot?.computed.limiteMassimo022).toBe(2200);
    expect(r.wizard2026TransferSnapshot?.computed.quota022Fondo).toBe(1760);
    expect(r.wizard2026TransferSnapshot?.computed.quota022EQ).toBe(440);
    expect(JSON.stringify(f)).toBe(before);
  });
  it('manual zero is protected before and after JSON/schema hydration, while an explicit zero choice stays zero', async () => {
    const { FundDataSchema } = await import('../../../schemas/fundDataSchemas');
    for (const f of [cor04Fund(0, 0), FundDataSchema.parse(JSON.parse(JSON.stringify(cor04Fund(0, 0)))) as ReturnType<typeof cor04Fund>]) {
      const before = JSON.stringify(f); const d = cor04Draft(2200);
      expect(buildWizard2026TransferPreview(d, f).items.find(i => i.id === 'CCNL_022_CURRENT')?.status).toBe('CONFLICT');
      const r = applyWizard2026Transfer(d, f);
      expect(r.fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021).toBe(0);
      expect(r.fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(0);
      const z = applyWizard2026Transfer(cor04Draft(0), f);
      expect(z.fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021).toBe(0);
      expect(JSON.stringify(f)).toBe(before);
    }
  });
  it('rejects a mixed allocation when conflict protection retains an old manual quota', () => {
    const f = cor04Fund(1800, 0); delete f.fondoElevateQualificazioniData.va_incremento022_ms2021_eq;
    const before = JSON.stringify(f); expect(() => applyWizard2026Transfer(cor04Draft(2200), f)).toThrow(/CCNL2026-022-SUPERAMENTO/);
    expect(JSON.stringify(f)).toBe(before);
  });
  it('non-exercise never creates a resource, including after applying a stale computed result', () => {
    const f = missing022Target(); const d = cor04Draft(2200); delete d.ccnl2026.incremento022Anno;
    const r = applyWizard2026Transfer(d, f);
    expect(r.fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021).toBeUndefined();
    expect(r.fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBeUndefined();
  });
  it('APPLY and reload remain idempotent without adding a second current contribution', async () => {
    const { FundDataSchema } = await import('../../../schemas/fundDataSchemas');
    const d = cor04Draft(2200); const r = applyWizard2026Transfer(d, missing022Target());
    const reloaded = FundDataSchema.parse(JSON.parse(JSON.stringify(r))) as ReturnType<typeof cor04Fund>;
    const again = applyWizard2026Transfer(d, reloaded);
    for (const fund of [r, reloaded, again]) {
      expect(fund.fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021).toBe(1760);
      expect(fund.fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(440);
      expect(check(fund).isCompliant).toBe(true);
      expect(calc(fund).canonicalFund.entries.filter(e => e.id === 'CCNL_022_CURRENT')).toHaveLength(1);
    }
  });
  it('CLOSED cannot be changed by preview, calculation or APPLY', () => {
    const f = cor04Fund(); f.metadata!.snapshotStatus = 'CLOSED' as any; const before = JSON.stringify(f);
    calc(f); simulateWizard2026Transfer(cor04Draft(2200), f);
    expect(() => applyWizard2026Transfer(cor04Draft(2200), f)).toThrow(/SNAPSHOT_CLOSED/);
    expect(JSON.stringify(f)).toBe(before);
  });
  it('a documented 2025 recovery remains separate from a 2200 current allocation and cannot license 3000', async () => {
    const { recovery022, resolvedZeroState } = await import('../../../test/fixtures/ccnlRecovery');
    const f = cor04Fund(); f.annualData.ccnlRecovery = resolvedZeroState();
    f.annualData.ccnlRecovery.instructions![2] = recovery022();
    const before = JSON.stringify(f); const r = calc(f);
    expect(check(f).isCompliant).toBe(true);
    expect(r.canonicalFund.entries.find(e => e.id === 'CCNL_022_CURRENT')?.amount).toBe(1760);
    expect(r.canonicalFund.entries.find(e => e.id === 'CCNL_022_RECOVERY_2025')?.amount).toBe(800);
    expect(r.fondi.dipendente.summary.totaleFondo).toBe(3560); // 1000 + 1760 current + 800 recovery
    expect(r.fondi.eq.summary.totaleFondo).toBe(1140); // 500 + 440 current + 200 recovery
    f.fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021 = 2560;
    expect(check(f).isCompliant).toBe(false); // 2560 + 440 = 3000 current, regardless of recovery
    f.fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021 = 1760;
    expect(JSON.stringify(f)).toBe(before);
  });
  it('2027 missing consolidated input is indeterminate; no current raw parameter silently substitutes it', () => {
    const d = cor04Draft(2200, 2027); delete d.ccnl2026.monteSalari2021Consolidato2026;
    expect(validateWizard2026Ccnl2026Step(d).some(c => c.severity === 'error')).toBe(true);
    expect(() => applyWizard2026Transfer(d, cor04Fund(0, 0, 2027))).toThrow();
  });
  it('cent rounding preserves the chosen total across both destinations', () => {
    const r = calculateCcnl2026Increments({ annoRiferimento: 2026, monteSalari2021: 100,
      incremento022Anno: 0.03, fondoRisorseDecentrate2024: 1, risorseEQ2024: 1 });
    expect(r.incremento022Fondo).toBe(0.02); expect(r.incremento022EQ).toBe(0.01);
  });
});

it('an explicit positive choice with missing split bases cannot be presented READY or applied from stale cached quotas', () => {
  const d = cor04Draft(2200); delete d.ccnl2026.fondoRisorseDecentrate2024; delete d.ccnl2026.risorseEQ2024;
  expect(validateWizard2026Ccnl2026Step(d).some(c => c.id === 'CCNL2026-022-RIPARTO-MANCANTE')).toBe(true);
  expect(buildWizard2026TransferPreview(d, missing022Target()).items.find(i => i.id === 'CCNL_022_CURRENT')?.status).toBe('BLOCKED');
  expect(() => applyWizard2026Transfer(d, missing022Target())).toThrow(/CCNL2026-022-RIPARTO-MANCANTE/);
});
