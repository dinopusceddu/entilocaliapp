import type { CcnlRecoveryInstruction, CcnlRecoveryState } from '../../domain/ccnlRecovery';

export const recovery014 = (patch: Partial<CcnlRecoveryInstruction> = {}): CcnlRecoveryInstruction => ({
  kind: 'CCNL_014', competenceYear: 2024, recognitionYear: 2026, instructionStatus: 'RECOVER_FULL',
  originAdministrativeStatus: 'CLOSED_AND_DEFINED', automaticResidualPerformanceClause: 'ABSENT',
  source: 'Verifica CCDI originario, risorse e utilizzi: nessuna riapertura', alreadyRecognizedAmount: 0,
  requestedRecoveryAmount: 1400, ...patch,
});
export const recovery022 = (patch: Partial<CcnlRecoveryInstruction> = {}): CcnlRecoveryInstruction => recovery014({
  kind: 'CCNL_022', competenceYear: 2025, activatedAmount2025: 1000, activationDecisionAttested: true,
  requestedRecoveryAmount: 800, alreadyRecognizedEqAmount: 0, requestedEqRecoveryAmount: 200, ...patch,
});
export const resolvedZeroState = (): CcnlRecoveryState => ({ fondoRisorseDecentrate2024: 80000, risorseEQ2024: 20000,
  instructions: [recovery014({ instructionStatus: 'NOT_TO_RECOVER', requestedRecoveryAmount: 0 }),
    recovery014({ competenceYear: 2025, instructionStatus: 'NOT_TO_RECOVER', requestedRecoveryAmount: 0 }),
    recovery022({ instructionStatus: 'NOT_TO_RECOVER', activatedAmount2025: 0, requestedRecoveryAmount: 0, requestedEqRecoveryAmount: 0 })] });
