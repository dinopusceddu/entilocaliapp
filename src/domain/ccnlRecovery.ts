/** Administrative inputs, never persisted calculated residuals or Fund totals. */
export type CcnlRecoveryKind = 'CCNL_014' | 'CCNL_022';
export interface CcnlRecoveryInstruction {
  kind: CcnlRecoveryKind;
  competenceYear: number;
  recognitionYear: number;
  instructionStatus?: 'UNINSTRUCTED' | 'NOT_TO_RECOVER' | 'RECOVER_PARTIAL' | 'RECOVER_FULL';
  originAdministrativeStatus?: 'CLOSED_AND_DEFINED' | 'NOT_CLOSED_AND_DEFINED' | 'UNKNOWN';
  automaticResidualPerformanceClause?: 'PRESENT' | 'ABSENT' | 'UNKNOWN';
  source?: string;
  activatedAmount2025?: number;
  activationDecisionAttested?: boolean;
  alreadyRecognizedAmount?: number;
  requestedRecoveryAmount?: number;
  alreadyRecognizedEqAmount?: number;
  requestedEqRecoveryAmount?: number;
  /** Only an express EQ clause may extend the original performance destination. */
  eqPerformanceClauseSource?: string;
  mode?: 'FIRST_QUALIFICATION' | 'BOUND_RESIDUAL_CARRY';
  qualifiedResidualReference?: string;
  constitutedAndCertified2026?: boolean;
}
export interface CcnlRecoveryState {
  instructions?: CcnlRecoveryInstruction[];
  fondoRisorseDecentrate2024?: number;
  risorseEQ2024?: number;
}
export type CcnlRecoveryRoute = 'FUND_VARIABLE_RESIDUAL' | 'PERFORMANCE_ARREARS' | 'NOT_APPLICABLE' | 'BOUND_RESIDUAL_CARRY';
export interface ResolvedCcnlRecovery {
  readonly instruction: CcnlRecoveryInstruction;
  readonly status: 'VALID' | 'UNDETERMINED' | 'INVALID';
  readonly decision: 'UNINSTRUCTED' | 'RESOLVED_ZERO' | 'RECOVER_PARTIAL' | 'RECOVER_FULL' | 'NOT_APPLICABLE' | 'BOUND_RESIDUAL_CARRY' | 'INVALID';
  readonly route?: CcnlRecoveryRoute;
  readonly theoreticalMaximum: number | null;
  readonly authorizedFundAmount: number | null;
  readonly authorizedEqAmount: number | null;
  /** Before this recognition, less already recognized. */
  readonly recoverableResidual: number | null;
  readonly recoverableEqResidual: number | null;
  readonly recoveryAmount: number | null;
  readonly recoveryEqAmount: number | null;
  /** After this recognition. */
  readonly remainingResidual: number | null;
  readonly remainingEqResidual: number | null;
  readonly issues: readonly string[];
}
