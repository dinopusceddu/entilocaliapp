import { resolvedZeroState } from '../../test/fixtures/ccnlRecovery';
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { AnnualData, CanonicalFundResult, FundLedgerEntry, NormalizedInput, NormativeData } from '../../domain';
import { projectFadReport, type FadReportReadModel } from '../documentProjection';
import { buildCanonicalFundLedger, deriveCanonicalFundResult } from '../../logic/calculation/canonicalFundLedger';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { resolveCabinaViewModel } from '../../logic/cabina/resolveCabinaViewModel';
import { createReportViewModel } from '../../presenters/reportPresenter';
import FinancialMath from '../../utils/financialMath';

const entry = (overrides: Partial<FundLedgerEntry>): FundLedgerEntry => ({
  id: 'ENTRY', amount: 0, component: 'STABLE', operation: 'ADDITION',
  competenceYear: 2026, source: 'MANUAL', art23Treatment: 'EXCLUDED', status: 'VALID',
  ...overrides,
});

function expectReconciled(model: FadReportReadModel, canonical: CanonicalFundResult) {
  const sum = (component?: FundLedgerEntry['component']) => FinancialMath.sumAll(
    ...model.rows.filter(row => !component || row.component === component).map(row => row.signedAmount),
  );
  expect(sum('STABLE')).toBe(canonical.verifiedStableTotal);
  expect(sum('VARIABLE')).toBe(canonical.verifiedVariableTotal);
  expect(sum()).toBe(canonical.verifiedTotal);
  expect(model.verifiedStableTotal).toBe(canonical.verifiedStableTotal);
  expect(model.verifiedVariableTotal).toBe(canonical.verifiedVariableTotal);
  expect(model.verifiedTotal).toBe(canonical.verifiedTotal);
  expect(model.authoritativeTotal).toBe(canonical.status === 'VALID' ? canonical.total : null);
  expect(model.status).toBe(canonical.status);
}

const annual = (year: number, monteSalari2021: number = 1_000_000): AnnualData => ({
  annoRiferimento: year, ccnl2024: { monteSalari2021 }, ...(year === 2026 ? { ccnlRecovery: resolvedZeroState() } : {}),
} as AnnualData);

// Same economic fixture as the current Wave 3 A/2025 characterization.
function astraA2025Input(): NormalizedInput {
  return {
    historicalData: { manualPersonalFundLimit2016: 120000 },
    annualData: {
      annoRiferimento: 2025, denominazioneEnte: 'Comune Astra', tipologiaEnte: 'Comune',
      ccnl2024: { monteSalari2021: 1_000_000 }, art33ManualDecision: 'DO_NOT_APPLY',
    },
    fondi: {
      dipendente: {
        st_art58c1_CCNL2026_incremento014_MS2021: 1400,
        st_art79c1_art14c3_art67c2g_riduzioneStraordinario: 2000,
        vn_art58_CCNL2026_arretrati2024_2025: 2800,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44,
      },
      eq: {}, segretario: {}, dirigenza: {},
    },
    distribuzione: {}, personaleDettaglio: [],
    calculatedInputs: {
      dipendentiEquivalenti2018: 10, dipendentiEquivalentiAnnoRif: 10,
      variazioneDipendenti: 0, isArt48Applicabile: false, numDipendentiContrattazione: 10,
    },
  } as unknown as NormalizedInput;
}

const normative = { riferimenti_normativi: {} } as NormativeData;

describe('FAD_REPORT_READ_MODEL — canonical economic projection', () => {
  it('T1 reconciles positive, deduction and explicit zero rows with canonical section subtotals and VALID total', () => {
    const canonical = deriveCanonicalFundResult([
      entry({ id: 'STABLE_ADD', amount: 50.11 }),
      entry({ id: 'STABLE_DEDUCT', amount: 10.02, operation: 'DEDUCTION' }),
      entry({ id: 'VARIABLE_ADD', amount: 9.99, component: 'VARIABLE' }),
      entry({ id: 'ZERO', amount: 0 }),
      entry({ id: 'FIGURATIVE', amount: 777, economicEffect: false }),
    ]);
    const model = projectFadReport(canonical);
    expect(model.canonicalAvailable).toBe(true);
    expect(model.rows.map(row => row.id)).toEqual(['STABLE_ADD', 'STABLE_DEDUCT', 'VARIABLE_ADD', 'ZERO']);
    expect(model.authoritativeTotal).toBe(50.08);
    expect(model.rows.find(row => row.id === 'ZERO')?.signedAmount).toBe(0);
    expect(model.unresolvedItems).toEqual([]);
    expectReconciled(model, canonical);
  });

  it('T2 canonical zero beats a nonzero legacy 0.22% alias resolved upstream by the ledger', () => {
    const canonical = buildCanonicalFundLedger({
      year: 2025, annualData: annual(2025, 0), sections: {},
      fadData: {
        vn_art58c2_CCNL2026_incremento022_MS2021: 0,
        vn_art58c2_incremento_max022_ms2021: 900,
      },
    });
    const model = projectFadReport(canonical);
    expect(model.rows.find(row => row.id === 'CCNL_022_CURRENT')).toEqual(expect.objectContaining({ amount: 0, signedAmount: 0 }));
    expect(model.authoritativeTotal).toBe(0);
    expectReconciled(model, canonical);
  });

  it('T3 / A2025 projects canonical Art.60 zero and unresolved recovery into compatibility sections', () => {
    const result = calculateFundCompletely(astraA2025Input(), normative);
    const model = createReportViewModel(result, 'Comune Astra').fadCanonical;
    const legacy = Object.values(result.fondi.dipendente.constitution!.sections);
    const stable = legacy.find(section => section.id === 'stabili')!;
    expect(stable.items).toContainEqual(expect.objectContaining({
      key: 'ART60_CONSOLIDATION', amount: 0,
    }));
    expect(stable.total).toBe(result.canonicalFund.verifiedStableTotal);
    expect(model.rows.find(row => row.id === 'ART60_CONSOLIDATION')).toEqual(expect.objectContaining({
      amount: 0, signedAmount: 0, status: 'VALID', operation: 'DEDUCTION', competenceYear: 2025,
    }));
    expect(model.rows.some(row => row.signedAmount === -127.44)).toBe(false);
    expect(model.verifiedStableTotal).toBe(3400);
    expect(model.verifiedVariableTotal).toBe(0);
    expect(model.verifiedTotal).toBe(3400);
    expect(model.authoritativeTotal).toBeNull();
    expect(model.status).toBe('UNDETERMINED');
    expect(model.unresolvedItems).toContainEqual(expect.objectContaining({
      id: 'CCNL_014_RECOVERY_LEGACY_2024_2025', amount: 2800,
      signedAmount: null, status: 'UNDETERMINED',
      reason: 'Aggregato legacy privo di istruttoria distinta per annualità di origine.',
    }));
    expectReconciled(model, result.canonicalFund);
  });

  it('T4 projects a determined 2026 Art.60 entry once, excluding the figurative Art.23 row', () => {
    const canonical = buildCanonicalFundLedger({
      year: 2026, annualData: annual(2026), sections: {},
      fadData: { st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44 },
    });
    const model = projectFadReport(canonical);
    expect(canonical.status).toBe('VALID');
    expect(model.rows.find(row => row.id === 'ART60_CONSOLIDATION')).toEqual(expect.objectContaining({ amount: 127.44, signedAmount: -127.44 }));
    expect(model.rows.some(row => row.id === 'ART60_ART23_FIGURATIVE')).toBe(false);
    expect(model.authoritativeTotal).toBe(canonical.total);
    expectReconciled(model, canonical);
  });

  it('T5 retains provisional recovery amount and its existing reason, never adding it to signed/authoritative totals', () => {
    const canonical = deriveCanonicalFundResult([
      entry({ id: 'VERIFIED', amount: 120 }),
      entry({ id: 'RECOVERY', amount: 2800, component: 'VARIABLE', status: 'UNDETERMINED',
        source: 'RECOVERY', originYear: null, provenance: { reason: 'Eligibility not documented' } }),
    ], ['Canonical warning'], ['RECOVERY_ELIGIBILITY']);
    const model = projectFadReport(canonical);
    expect(model.rows.find(row => row.id === 'RECOVERY')).toEqual(expect.objectContaining({
      amount: 2800, signedAmount: null, status: 'UNDETERMINED', reason: 'Eligibility not documented',
    }));
    expect(model.authoritativeTotal).toBeNull();
    expect(model.verifiedTotal).toBe(120);
    expect(model.warnings).toEqual(canonical.warnings);
    expect(model.missingPrerequisites).toEqual(canonical.missingPrerequisites);
    expectReconciled(model, canonical);
  });

  it('T6 subtracts both stable and variable deductions once through signed rows', () => {
    const canonical = deriveCanonicalFundResult([
      entry({ id: 'BASE', amount: 100 }),
      entry({ id: 'DEDUCTION', amount: 15, operation: 'DEDUCTION' }),
      entry({ id: 'VARIABLE', amount: 20, component: 'VARIABLE' }),
      entry({ id: 'VARIABLE_DEDUCTION', amount: 5, component: 'VARIABLE', operation: 'DEDUCTION' }),
    ]);
    expect(projectFadReport(canonical).authoritativeTotal).toBe(100);
    expectReconciled(projectFadReport(canonical), canonical);
  });

  it('T7 reconciles fractions and half-cent multi-entry amounts using existing exact monetary helpers', () => {
    const canonical = deriveCanonicalFundResult([
      entry({ id: 'A', amount: 0.335 }), entry({ id: 'B', amount: 0.335 }),
      entry({ id: 'C', amount: 0.335, component: 'VARIABLE' }),
      entry({ id: 'D', amount: 0.005, operation: 'DEDUCTION' }),
      entry({ id: 'E', amount: 0.005, operation: 'DEDUCTION', component: 'VARIABLE' }),
    ]);
    const model = projectFadReport(canonical);
    expect(model.rows.map(row => row.signedAmount)).toEqual([0.34, 0.34, 0.34, -0.01, -0.01]);
    expect(model.authoritativeTotal).toBe(1);
    expectReconciled(model, canonical);
  });

  it('T8 missing entry amount stays null, with a verified zero subtotal distinct from an undetermined total', () => {
    const canonical = deriveCanonicalFundResult([entry({ id: 'MISSING', amount: null, status: 'MISSING' })]);
    const model = projectFadReport(canonical);
    expect(model.status).toBe('UNDETERMINED');
    expect(model.rows[0].amount).toBeNull();
    expect(model.rows[0].signedAmount).toBeNull();
    expect(model.unresolvedItems[0].id).toBe('MISSING');
    expect(model.verifiedTotal).toBe(0);
    expect(model.authoritativeTotal).toBeNull();
    expectReconciled(model, canonical);
  });

  it.each([undefined, null])('T8 absent canonical result (%s) has no invented zero subtotals or legacy fallback', canonical => {
    expect(projectFadReport(canonical)).toEqual({
      canonicalAvailable: false, status: 'UNDETERMINED', rows: [], unresolvedItems: [],
      verifiedStableTotal: null, verifiedVariableTotal: null, verifiedTotal: null,
      authoritativeTotal: null, warnings: [], missingPrerequisites: [],
    });
  });

  it('T9 preserves INVALID status and never publishes a numerical canonical subtotal as authoritative total', () => {
    const canonical = deriveCanonicalFundResult([
      entry({ id: 'VALID_BASE', amount: 100 }),
      entry({ id: 'INVALID_LIMIT', amount: -1, status: 'INVALID', economicEffect: false }),
    ]);
    expect(canonical.total).toBe(100);
    const model = projectFadReport(canonical);
    expect(model.status).toBe('INVALID');
    expect(model.authoritativeTotal).toBeNull();
    expect(model.verifiedTotal).toBe(100);
    expect(model.unresolvedItems[0].id).toBe('INVALID_LIMIT');
    expectReconciled(model, canonical);
  });

  it.each([0, 55.55])('T10 divergent legacy sections/summary cannot change canonical total %s; old presenter fields remain compatible', amount => {
    const result = {
      ...calculateFundCompletely(astraA2025Input(), normative),
      canonicalFund: deriveCanonicalFundResult([entry({ id: 'CANONICAL_BASE', amount })]),
    };
    const sections = result.fondi.dipendente.constitution!.sections;
    const divergent = {
      ...result,
      fondi: { ...result.fondi, dipendente: {
        ...result.fondi.dipendente,
        summary: { ...result.fondi.dipendente.summary, totaleFondo: 999999 },
        constitution: { sections: Object.fromEntries(Object.entries(sections).map(([id, section]) => [id, { ...section, total: 777777 }])) },
      } },
    };
    const original = createReportViewModel(result, 'Comune Astra');
    const changed = createReportViewModel(divergent, 'Comune Astra');
    expect(changed.fadCanonical).toEqual(original.fadCanonical);
    expect(changed.fadCanonical).toEqual(projectFadReport(result.canonicalFund));
    expect(changed.fadCanonical.authoritativeTotal).toBe(amount);
    expectReconciled(changed.fadCanonical, result.canonicalFund);
    expect(changed.fondoDipendenti.costituzione.every(section => section.total === 777777)).toBe(true);
    expect(changed.fondoDipendenti.totaleDisponibile).not.toBe(original.fondoDipendenti.totaleDisponibile);
    expect(original.fondoDipendenti.costituzione).toEqual(Object.values(sections));
    expect(original.altriFondi).toEqual(changed.altriFondi);
    expect(original.fondoDipendenti.utilizzi).toEqual(changed.fondoDipendenti.utilizzi);
  });

  it('preserves UNDETERMINED with numerical canonical total from missing external prerequisites', () => {
    const canonical = deriveCanonicalFundResult([entry({ id: 'BASE', amount: 42 })], [], ['EXTERNAL_MISSING']);
    expect(canonical.total).toBe(42);
    const model = projectFadReport(canonical);
    expect(model.authoritativeTotal).toBeNull();
    expect(model.verifiedTotal).toBe(42);
    expect(model.missingPrerequisites).toEqual(['EXTERNAL_MISSING']);
    expectReconciled(model, canonical);
  });

  it('keeps unresolved figurative metadata without giving it economic effect', () => {
    const canonical = deriveCanonicalFundResult([
      entry({ id: 'BASE', amount: 8 }),
      entry({ id: 'LIMIT_ONLY', amount: null, status: 'MISSING', economicEffect: false,
        provenance: { reason: 'Canonical limit input missing' } }),
    ]);
    const model = projectFadReport(canonical);
    expect(model.rows.map(row => row.id)).toEqual(['BASE']);
    expect(model.unresolvedItems[0]).toEqual(expect.objectContaining({ id: 'LIMIT_ONLY', economicEffect: false, signedAmount: null }));
    expectReconciled(model, canonical);
  });

  it('copies existing canonical identity, classification, provenance, labels and state without mutating input', () => {
    const canonical = deriveCanonicalFundResult([entry({
      id: 'OVERTIME_STABLE_TRANSFER', amount: 5, normativeRef: 'Existing reference', source: 'TRANSFERRED',
      provenance: { legacyField: 'originalField', transferId: 'existing-transfer' }, originYear: 2025,
    })]);
    const before = structuredClone(canonical);
    Object.freeze(canonical.entries[0]);
    Object.freeze(canonical.entries);
    Object.freeze(canonical);
    const model = projectFadReport(canonical);
    expect(model.rows[0]).toEqual(expect.objectContaining({
      ...canonical.entries[0], signedAmount: 5,
      description: 'Riduzione stabile straordinario trasferita a fondo (Art. 79 c. 1 lett. b/ex 67 c. 2g)',
    }));
    expect(canonical).toEqual(before);
  });

  it('matches the Cabina canonical status/subtotal/nullable total and preserves a VALID nullable total', () => {
    for (const canonical of [
      deriveCanonicalFundResult([entry({ id: 'BASE', amount: 40 })]),
      deriveCanonicalFundResult([entry({ id: 'BASE', amount: null, status: 'MISSING' })]),
      { ...deriveCanonicalFundResult([entry({ id: 'BASE', amount: 40 })]), total: null },
    ]) {
      const model = projectFadReport(canonical);
      const cabina = resolveCabinaViewModel({ calculationResult: { canonicalFund: canonical } });
      expect(model.status).toBe(cabina.constitution.canonicalStatus);
      expect(model.verifiedTotal).toBe(cabina.constitution.verifiedSubtotal);
      expect(model.authoritativeTotal).toBe(cabina.constitution.total);
      expectReconciled(model, canonical);
    }
  });
});
