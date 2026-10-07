import { describe, expect, it, vi } from 'vitest';
import type { AnnualData, FundData, NormativeData } from '../../../domain';
import { AnnualSnapshotStatus, TipologiaEnte } from '../../../domain';
import { normalizeInput } from '../../../application/input/inputNormalizer';
import { calculateFundCompletely } from '../fundEngine';
import { buildCanonicalFundLedger } from '../canonicalFundLedger';
import { resolveChecklist } from '../../cabina/resolveChecklist';
import { resolveOperationalStatus } from '../../cabina/resolveOperationalStatus';
import { resolveDistributionFundBudget } from '../../distribution/resolveDistributionFundBudget';
import { DOCUMENT_KINDS, resolveDocumentKindReadiness } from '../../../domain/documentKindReadiness';
import { resolveClosureInstructionReadiness } from '../../closure/resolveClosureInstructionReadiness';
import { calculatePnrrIncrement, resolveWizardPnrrFaculty } from '../../wizard2026/pnrrIncrement';
import { initialWizard2026DraftState } from '../../../features/wizard2026/initialState';
import { wizard2026Reducer } from '../../../features/wizard2026/reducer';
import { applyWizard2026Transfer } from '../../../features/wizard2026/transfer/applyWizard2026Transfer';
import { simulateWizard2026Transfer } from '../../../features/wizard2026/transfer/transferPreviewEngine';
import { AnnualDataSchema } from '../../../schemas/fundDataSchemas';
import { saveAnnualSnapshot, loadAnnualSnapshot } from '../../../application/snapshots/snapshotWorkflow';

const annual = (extra: Partial<AnnualData> = {}) => ({
  annoRiferimento: 2026, tipologiaEnte: TipologiaEnte.COMUNE, hasDirigenza: false,
  pnrrExerciseDecision: 'EXERCISED', fondoStabile2016PNRR: 100000,
  rispettoEquilibrioBilancioPrecedente: true, rispettoDebitoCommercialePrecedente: true,
  incidenzaSalarioAccessorioUltimoRendiconto: 8, approvazioneRendicontoPrecedente: true,
  personale2018PerArt23: [], personaleAnnoRifPerArt23: [], ccnl2024: { monteSalari2021: 0 }, ...extra,
  manualDipendentiEquivalenti2018: 1,
  isArt23FteManualMode: true,
} as AnnualData);
const fund = (extra: Partial<AnnualData> = {}, applied?: number): FundData => ({
  annualData: annual(extra), historicalData: { manualPersonalFundLimit2016: 50000, fondoStraordinario2016: 0, fondoPersonaleNonDirEQ2018_Art23: 10000 },
  fondoAccessorioDipendenteData: { st_art79c1_art67c1_unicoImporto2017: 10000,
    st_art58c1_CCNL2026_incremento014_MS2021: 0, st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0,
    vn_dl13_art8c3_incrementoPNRR_max5stabile2016: applied },
  fondoElevateQualificazioniData: {}, fondoDirigenzaData: {}, fondoSegretarioComunaleData: {}, distribuzioneRisorseData: {},
} as FundData);
const normative = { riferimenti_normativi: {} } as NormativeData;
const calc = (extra: Partial<AnnualData> = {}, amount?: number) => calculateFundCompletely(normalizeInput(fund(extra, amount)), normative);
const draft = (decision: 'EXERCISED' | 'NOT_EXERCISED' | 'UNSET', applied?: number, base?: number) => {
  const state = structuredClone(initialWizard2026DraftState);
  state.ente.annoRiferimento = 2026;
  state.ente.hasDirigenza = false;
  state.pnrr = { checks: [], exerciseDecision: decision, incrementoApplicato: applied,
    soggettoAttuatorePnrr: true, componenteStabileFondoDipendenti2016: base,
    equilibrioEsercizioPrecedente: true, parametriDebitoCommercialeEsercizioPrecedente: true,
    rendicontoApprovatoTermini: true, incidenzaSalarioAccessorioScelta: 'diretto', incidenzaSalarioAccessorioPercentuale: 8 };
  state.pnrr.result = calculatePnrrIncrement({ ...state.pnrr, annoRiferimento: 2026, hasDirigenza: false });
  return state;
};
describe('CALC-05 canonical, downstream and persistence', () => {
  it.each([
    [{ pnrrExerciseDecision: 'NOT_EXERCISED', fondoStabile2016PNRR: undefined, rispettoEquilibrioBilancioPrecedente: undefined }, undefined, 'VALID', 0],
    [{}, 3000, 'VALID', 3000], [{}, 5000, 'VALID', 5000], [{}, 5000.01, 'INVALID', 0],
    [{ fondoStabile2016PNRR: undefined }, 100, 'UNDETERMINED', 0],
    [{ fondoStabile2016PNRR: 0 }, 100, 'INVALID', 0],
    [{ rispettoEquilibrioBilancioPrecedente: false }, 100, 'INVALID', 0],
    [{ incidenzaSalarioAccessorioUltimoRendiconto: undefined }, 100, 'UNDETERMINED', 0],
    [{ pnrrExerciseDecision: undefined, calcolatoIncrementoPNRR3: 0 }, 100, 'UNDETERMINED', 0],
    [{ annoRiferimento: 2027 }, 3000, 'INVALID', 0],
    [{ fondoStabile2016PNRR: 400000 }, 7500, 'VALID', 7500],
    [{ fondoStabile2016PNRR: 400000 }, 0, 'VALID', 0],
  ] as const)('canonical normative scenario %j/%s', (extra, amount, status, contribution) => {
    const result = calc(extra as Partial<AnnualData>, amount);
    const canonical = result.canonicalFund;
    expect(canonical.status).toBe(status);
    expect(canonical.verifiedTotal).toBe(10000 + contribution);
    expect(canonical.entries.find(e => e.id === 'PNRR_APPLIED')).toMatchObject({ status, amount: status === 'VALID' ? contribution : null, component: 'VARIABLE', art23Treatment: 'EXCLUDED' });
    expect(canonical.total).toBe(status === 'VALID' ? 10000 + contribution : null);
    const issues = resolveChecklist({ canonicalFund: canonical, complianceChecks: result.compliance.checks });
    const pnrrIssues = issues.filter(issue => issue.code?.startsWith('PNRR'));
    if (status === 'VALID') expect(pnrrIssues).toHaveLength(0);
    else expect(pnrrIssues.some(i => i.severity === (status === 'INVALID' ? 'BLOCKING' : 'MISSING_PREREQUISITE'))).toBe(true);
    expect(resolveOperationalStatus({ calculationResult: result, distributionStatus: 'NOT_STARTED', hasBlockingIssues: issues.some(i => i.severity === 'BLOCKING') }))
      .toBe(status === 'VALID' ? 'CONSTITUTION_VERIFIED' : status === 'INVALID' ? 'BLOCKED' : 'TO_COMPLETE');
    expect(resolveDistributionFundBudget(canonical).authoritativeFundTotal).toBe(status === 'VALID' ? 10000 + contribution : null);
    for (const documentKind of DOCUMENT_KINDS) expect(resolveDocumentKindReadiness({ documentKind, canonicalFund: canonical, issues }).status)
      .toBe(status === 'VALID' ? 'FINAL_READY' : 'DRAFT_ONLY');
    expect(resolveClosureInstructionReadiness({ canonicalFund: canonical, issues }).status).toBe(status === 'VALID' ? 'READY' : 'NOT_READY');
  });
  it.each([NaN, Infinity, -100])('engine and direct ledger reject bad PNRR %s without an exception', amount => {
    const result = calc({}, amount);
    expect(result.canonicalFund.status).toBe('INVALID');
    expect(result.canonicalFund.verifiedTotal).toBe(10000);
    expect(buildCanonicalFundLedger({ year: 2026, annualData: annual(), fadData: fund({}, amount).fondoAccessorioDipendenteData, sections: {} }).status).toBe('INVALID');
  });
  it('Wizard transfers 7500, never a cached maximum of 20000; zero and waiver roundtrip', () => {
    for (const [decision, amount, base] of [['EXERCISED', 7500, 400000], ['EXERCISED', 0, 400000], ['NOT_EXERCISED', 0, undefined]] as const) {
      const saved = JSON.parse(JSON.stringify(draft(decision, amount, base)));
      const restored = wizard2026Reducer(initialWizard2026DraftState, { type: 'RESTORE_WIZARD_2026', payload: saved });
      const transferred = simulateWizard2026Transfer(restored, fund());
      expect(transferred.annualData.pnrrExerciseDecision).toBe(decision);
      expect(transferred.annualData.fondoStabile2016PNRR).toBe(base);
      expect(transferred.fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016).toBe(amount);
      expect(normalizeInput(transferred).annualData.pnrrExerciseDecision).toBe(decision);
    }
  });
  it('forced transfer rejects unresolved faculty even with a stale VALID result cache', () => {
    const state = draft('EXERCISED', 100, undefined);
    state.pnrr.result = draft('EXERCISED', 100, 100000).pnrr.result;
    expect(() => applyWizard2026Transfer(state, fund())).toThrow(/PNRR/);
  });
  it('maximum zero and missing, unknown eligibility and UNSET survive import/hydration', () => {
    for (const base of [undefined, 0]) {
      const original = fund({ fondoStabile2016PNRR: base, rispettoEquilibrioBilancioPrecedente: undefined }, 100);
      const loaded = JSON.parse(JSON.stringify(original));
      const normalized = normalizeInput(loaded);
      expect(normalized.annualData.fondoStabile2016PNRR).toBe(base);
      expect(normalized.annualData.rispettoEquilibrioBilancioPrecedente).toBeUndefined();
      expect(calc({ fondoStabile2016PNRR: base, rispettoEquilibrioBilancioPrecedente: undefined }, 100).canonicalFund.status).not.toBe('VALID');
      const state = draft('UNSET', 100, base);
      const imported = wizard2026Reducer(initialWizard2026DraftState, { type: 'IMPORT_EXCEL_DATA', payload: JSON.parse(JSON.stringify({ pnrr: state.pnrr })) });
      expect(resolveWizardPnrrFaculty({ ...imported.pnrr, annoRiferimento: 2026 }).exerciseDecision).toBe('UNSET');
    }
    expect(AnnualDataSchema.shape.pnrrExerciseDecision.parse('NOT_EXERCISED')).toBe('NOT_EXERCISED');
    expect(AnnualDataSchema.shape.fondoStabile2016PNRR.parse(0)).toBe(0);
    expect(AnnualDataSchema.shape.fondoStabile2016PNRR.parse(undefined)).toBeUndefined();
  });
  it('snapshot save/reload preserves decision and zero/missing without mutating CLOSED', async () => {
    for (const [decision, base, amount] of [['NOT_EXERCISED', undefined, 0], ['EXERCISED', 400000, 7500], ['EXERCISED', 0, 0], ['EXERCISED', undefined, 100]] as const) {
      let stored: any = null;
      const deps: any = { stateRepository: { getState: vi.fn(async () => ({ data: stored })), upsertState: vi.fn(async (s: any) => { stored = JSON.parse(JSON.stringify(s)); return {}; }) }, entityRepository: { update: vi.fn() } };
      const original = fund({ pnrrExerciseDecision: decision, fondoStabile2016PNRR: base }, amount);
      const user = { id: 'local-owner', email: 'local@example.invalid' };
      const entity = { id: 'local-entity', user_id: user.id };
      expect((await saveAnnualSnapshot(deps, user, entity, 2026, 'USER' as any, original)).success).toBe(true);
      const loaded = await loadAnnualSnapshot(deps, user, entity.id, 2026);
      expect(loaded.snapshot?.fundData.annualData.pnrrExerciseDecision).toBe(decision);
      expect(loaded.snapshot?.fundData.annualData.fondoStabile2016PNRR).toBe(base);
      expect(loaded.snapshot?.fundData.fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016).toBe(amount);
      stored.fund_data.metadata = { snapshotStatus: AnnualSnapshotStatus.CLOSED };
      deps.stateRepository.upsertState.mockClear();
      expect((await saveAnnualSnapshot(deps, user, entity, 2026, 'USER' as any, original)).success).toBe(false);
      expect(deps.stateRepository.upsertState).not.toHaveBeenCalled();
      expect(original).toEqual(fund({ pnrrExerciseDecision: decision, fondoStabile2016PNRR: base }, amount));
    }
  });
});
