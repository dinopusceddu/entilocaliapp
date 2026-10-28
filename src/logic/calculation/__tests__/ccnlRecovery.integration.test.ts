import { confirmedFixtureWrite } from '../../../test/fixtures/b1Persistence';
import { absentBaseline } from '../../../application/snapshots/versionedSnapshotContract';
import { describe, expect, it, vi } from 'vitest';
import type { AnnualData, CalculationResult } from '../../../domain';
import type { CcnlRecoveryState } from '../../../domain/ccnlRecovery';
import { buildCanonicalFundLedger } from '../canonicalFundLedger';
import { recovery014, recovery022, resolvedZeroState } from '../../../test/fixtures/ccnlRecovery';
import { resolveCabinaViewModel } from '../../cabina/resolveCabinaViewModel';
import { resolveDocumentKindReadiness } from '../../../domain/documentKindReadiness';
import { resolveClosureInstructionReadiness } from '../../closure/resolveClosureInstructionReadiness';
import { projectFadReport, projectFundDocument } from '../../../domain/documentProjection';
import { createEmptyFundData } from '../../../domain/emptyFund';
import { calculateFundCompletely } from '../fundEngine';
import { normalizeInput } from '../../../application/input/inputNormalizer';
import { saveAnnualSnapshot, loadAnnualSnapshot } from '../../../application/snapshots/snapshotWorkflow';
import { UserRole, TipologiaEnte } from '../../../domain/enums';
import { FundDataSchema } from '../../../schemas/fundDataSchemas';
import { applyWizard2026Transfer } from '../../../features/wizard2026/transfer/applyWizard2026Transfer';
import { buildWizard2026TransferPreview } from '../../../features/wizard2026/transfer/transferPreviewEngine';
import { createEmptyWizard2026DraftState } from '../../../features/wizard2026/initialState';
import { calculateCcnl2026Increments } from '../../wizard2026/ccnl2026Increments';
import { carryDl25ToNextYear } from '../../shared/dl25CarryForward';
import { buildFondoDipendenteWorkbook } from '../../../services/documents/xlsReportService';
import normativa from '../../../../public/normativa.json';

const ledger = (state: CcnlRecoveryState | undefined, current022 = 0, year = 2026) => buildCanonicalFundLedger({
  year, annualData: { annoRiferimento: year, pnrrExerciseDecision: 'NOT_EXERCISED', ccnl2024: { monteSalari2021: 1000000 }, ccnlRecovery: state } as AnnualData,
  fadData: { st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0, vn_art58c2_CCNL2026_incremento022_MS2021: current022 }, sections: {},
});
const fund = () => {
  const data = createEmptyFundData(2026);
  Object.assign(data.annualData, { ccnl2024: { monteSalari2021: 1000000 }, ccnlRecovery: resolvedZeroState(),
    pnrrExerciseDecision: 'NOT_EXERCISED', tipologiaEnte: TipologiaEnte.UNIONE_COMUNI, hasDirigenza: false });
  data.historicalData.manualPersonalFundLimit2016 = 100000;
  data.fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto = 0;
  return data;
};
const calculation = (state: CcnlRecoveryState | undefined): CalculationResult => ({ metadata: { annoRiferimento: 2026 }, canonicalFund: ledger(state) } as CalculationResult);

describe('CCNL recovery canonical/workflow integration', () => {
  it('current remains 1400; two explicit 1400 recoveries are projected as 2800 once', () => {
    const state = resolvedZeroState(); state.instructions![0] = recovery014(); state.instructions![1] = recovery014({ competenceYear: 2025 });
    const result = ledger(state);
    expect(result).toMatchObject({ status: 'VALID', stableTotal: 1400, variableTotal: 2800, total: 4200 });
    expect(new Set(result.entries.map(e => e.id)).size).toBe(result.entries.length);
    for (const e of result.entries.filter(e => e.source === 'RECOVERY')) {
      expect(e.originYear).not.toBeNull(); expect(e.provenance).toMatchObject({ instruction: { source: expect.any(String), recognitionYear: 2026 } });
    }
  });
  it('current 2026 plus recovery 2025 never doubles inside CURRENT; EQ stays distinct', () => {
    const state = resolvedZeroState(); state.instructions![2] = recovery022({ activatedAmount2025: 2200, requestedRecoveryAmount: 1760, requestedEqRecoveryAmount: 440 });
    const result = ledger(state, 1760);
    expect(result.entries.find(e => e.id === 'CCNL_022_CURRENT')?.amount).toBe(1760);
    expect(result.entries.find(e => e.id === 'CCNL_022_RECOVERY_2025')?.amount).toBe(1760);
    expect(result.total).toBe(4920);
    const data = fund(); data.annualData.ccnlRecovery = state; data.fondoElevateQualificazioniData.va_incremento022_ms2021_eq = 440;
    const engine = calculateFundCompletely(normalizeInput(data), normativa);
    expect(engine.fondi.eq.summary.totaleVariabile).toBe(880);
    expect(engine.canonicalFund.entries.find(e => e.id === 'CCNL_022_RECOVERY_2025')?.amount).toBe(1760);
  });
  it('performance destination is lineage, never additional Fund money; generic clause does not move EQ', () => {
    const state = resolvedZeroState(); state.instructions![0] = recovery014({ automaticResidualPerformanceClause: 'PRESENT' });
    state.instructions![2] = recovery022({ automaticResidualPerformanceClause: 'PRESENT' });
    const result = ledger(state);
    expect(result.total).toBe(1400);
    expect(result.entries.find(e => e.id === 'CCNL_014_RECOVERY_2024')?.provenance).toMatchObject({ recoveryAmount: 1400, route: 'PERFORMANCE_ARREARS' });
    const data = fund(); data.annualData.ccnlRecovery = state;
    expect(calculateFundCompletely(normalizeInput(data), normativa).fondi.eq.summary.totaleVariabile).toBe(200);
    state.instructions![2].eqPerformanceClauseSource = 'Clausola CCDI originario espressamente estesa a EQ';
    expect(calculateFundCompletely(normalizeInput(data), normativa).fondi.eq.summary.totaleVariabile).toBe(0);
  });
  it.each(['UNDETERMINED', 'INVALID', 'VALID'] as const)('%s upstream recovery propagates to all readiness consumers', status => {
    const state = status === 'UNDETERMINED' ? undefined : resolvedZeroState();
    if (status === 'INVALID') state!.instructions![0] = recovery014({ requestedRecoveryAmount: 1500 });
    const result = calculation(state);
    expect(result.canonicalFund.status).toBe(status);
    const cabina = resolveCabinaViewModel({ calculationResult: result });
    expect(cabina.status).toBe(status === 'VALID' ? 'CONSTITUTION_VERIFIED' : status === 'INVALID' ? 'BLOCKED' : 'TO_COMPLETE');
    expect(resolveDocumentKindReadiness({ documentKind: 'FAD_XLS', canonicalFund: result.canonicalFund, issues: cabina.issues }).status)
      .toBe(status === 'VALID' ? 'FINAL_READY' : 'DRAFT_ONLY');
    expect(resolveClosureInstructionReadiness({ canonicalFund: result.canonicalFund, issues: cabina.issues }).status)
      .toBe(status === 'VALID' ? 'READY' : 'NOT_READY');
    expect(projectFadReport(result.canonicalFund).authoritativeTotal).toBe(status === 'VALID' ? 1400 : null);
  });
  it('partial projection shows actual recovery and both years, not max; XLS consumes that projection', () => {
    const state = resolvedZeroState(); state.instructions![1] = recovery014({ competenceYear: 2025, instructionStatus: 'RECOVER_PARTIAL', alreadyRecognizedAmount: 200, requestedRecoveryAmount: 1000 });
    const result = calculation(state);
    const doc = projectFundDocument(result);
    const row = doc.variableEntries.find(e => e.id === 'CCNL_014_RECOVERY_2025')!;
    expect(row.signedAmount).toBe(1000); expect(row.description).toContain('competenza 2025, riconoscimento 2026');
    expect(row.description).toContain('RECOVER_PARTIAL');
    const { workbook } = buildFondoDipendenteWorkbook({ fadCanonical: projectFadReport(result.canonicalFund), annoRiferimento: 2026, denominazioneEnte: 'Ente Recovery' });
    const values: unknown[] = []; workbook.worksheets[0].eachRow(row => row.eachCell(cell => values.push(cell.value)));
    expect(values).toContain(1000); expect(values).toContain(row.description);
  });
  it('uninstructed document rows expose no definitive amount or legacy fallback', () => {
    const result = calculation(undefined);
    expect(projectFundDocument(result).variableEntries.some(e => e.id.includes('RECOVERY'))).toBe(false);
    expect(projectFadReport(result.canonicalFund).rows.filter(e => e.source === 'RECOVERY').every(e => e.signedAmount === null)).toBe(true);
    const legacy = buildCanonicalFundLedger({ year: 2026, annualData: { ccnl2024: { monteSalari2021: 1000000 } } as AnnualData,
      fadData: { vn_art58_CCNL2026_arretrati2024_2025: 2800 }, sections: {} });
    expect(legacy.total).toBeNull(); expect(legacy.verifiedVariableTotal).toBe(0);
  });
  it('transfer/retransfer preserve instructions instead of appending or serializing residual authorities', () => {
    const draft = createEmptyWizard2026DraftState(); draft.ente.annoRiferimento = 2026;
    Object.assign(draft.ccnl2026, { monteSalari2021: 1000000, fondoRisorseDecentrate2024: 80000, risorseEQ2024: 20000,
      recoveryInstructions: resolvedZeroState().instructions });
    draft.ccnl2026.recoveryInstructions![0] = recovery014({ alreadyRecognizedAmount: 400, requestedRecoveryAmount: 1000 });
    draft.ccnl2026.result = calculateCcnl2026Increments(draft.ccnl2026);
    const data = fund(), before = structuredClone(data);
    const preview = buildWizard2026TransferPreview(draft, data);
    expect(preview.items.filter(item => item.id.startsWith('RECOVERY_INSTRUCTION:'))).toHaveLength(3);
    expect(preview.items.find(item => item.id === 'RECOVERY_INSTRUCTION:CCNL_014:2024')?.valoreProposto).toContain('1000');
    const first = applyWizard2026Transfer(draft, data); const again = applyWizard2026Transfer(draft, first);
    expect(first.annualData.ccnlRecovery).toEqual(again.annualData.ccnlRecovery);
    expect(first.annualData.ccnlRecovery?.instructions).toHaveLength(3);
    expect(ledger(first.annualData.ccnlRecovery).variableTotal).toBe(1000);
    expect(first.wizard2026TransferSnapshot.computed.annualita022Considerate).toBe(2);
    expect(data).toEqual(before);
    draft.ccnl2026.recoveryInstructions![0].requestedRecoveryAmount = 1001;
    expect(() => applyWizard2026Transfer(draft, first)).toThrow(/CCNL_RECOVERY_REQUEST_EXCEEDS_RESIDUAL/);
  });
  it('save/load is lossless and idempotent, missing and explicit zero survive; CLOSED is never edited', async () => {
    const data = fund(); data.annualData.ccnlRecovery!.instructions![0] = recovery014({ instructionStatus: 'RECOVER_PARTIAL', requestedRecoveryAmount: 1000 });
    let persisted = data; let row: any = null;
    const repo = { getState: vi.fn(async () => ({ data: row, error: null })),
      upsertState: vi.fn(async (record: any) => { const result = confirmedFixtureWrite(record); row = result.data; persisted = row.fund_data; return result; }) };
    const deps = { stateRepository: repo, entityRepository: { update: vi.fn() } };
    const user = { id: 'u', role: UserRole.ADMIN }, entity = { id: 'e', user_id: 'u', name: 'Ente' };
    expect((await saveAnnualSnapshot(deps as never, user, entity, 2026, UserRole.ADMIN, data, absentBaseline(user.id, entity.id, 2026))).success).toBe(true);
    const loaded = await loadAnnualSnapshot(deps as never, user, 'e', 2026);
    expect(loaded.snapshot?.fundData.annualData.ccnlRecovery).toEqual(data.annualData.ccnlRecovery);
    expect(FundDataSchema.parse(persisted).annualData.ccnlRecovery).toEqual(data.annualData.ccnlRecovery);
    expect((await saveAnnualSnapshot(deps as never, user, entity, 2026, UserRole.ADMIN, persisted, loaded.baseline)).success).toBe(true);
    expect(ledger(persisted.annualData.ccnlRecovery).variableTotal).toBe(1000);
    const draft = createEmptyWizard2026DraftState(); const closed = { ...persisted, metadata: { snapshotStatus: 'CLOSED' } };
    expect(() => applyWizard2026Transfer(draft, closed)).toThrow(/SNAPSHOT_CLOSED/);
    expect(closed.annualData.ccnlRecovery).toEqual(persisted.annualData.ccnlRecovery);
  });
  it('unsafe new money cannot reach repository, and legacy hydration calculates safely', async () => {
    const data = fund(); Object.assign(data.annualData.ccnlRecovery!.instructions![0], { requestedRecoveryAmount: 1e308 });
    const repo = { upsertState: vi.fn(), getState: vi.fn() };
    expect((await saveAnnualSnapshot({ stateRepository: repo } as never, { id: 'u' }, { id: 'e', user_id: 'u' }, 2026, UserRole.ADMIN, data)).reason).toBe('VALIDATION_ERROR');
    expect(repo.upsertState).not.toHaveBeenCalled();
    expect(() => calculateFundCompletely(normalizeInput(data), normativa)).not.toThrow();
    expect(calculateFundCompletely(normalizeInput(data), normativa).canonicalFund.status).toBe('INVALID');
  });
  it('new N+1 and bound carry do not copy/recreate recovery 2026; origin source untouched', () => {
    const data = fund(), before = structuredClone(data);
    const next = carryDl25ToNextYear(data, createEmptyFundData(2027), 2027);
    expect(next.annualData.ccnlRecovery).toBeUndefined(); expect(data).toEqual(before);
    const carry = resolvedZeroState(); carry.instructions = [recovery014({ recognitionYear: 2027, mode: 'BOUND_RESIDUAL_CARRY',
      constitutedAndCertified2026: true, qualifiedResidualReference: 'Fondo costituito e certificato 2026', requestedRecoveryAmount: 0 })];
    expect(ledger(carry, 0, 2027).entries.find(e => e.id === 'CCNL_014_RECOVERY_2024')).toMatchObject({ amount: 0, status: 'VALID' });
  });
});
