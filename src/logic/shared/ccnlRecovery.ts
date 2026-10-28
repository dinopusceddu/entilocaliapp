import Big from 'big.js';
import type { CcnlRecoveryInstruction, CcnlRecoveryState, ResolvedCcnlRecovery } from '../../domain/ccnlRecovery';
import { checkedMonetaryOutput, defaultMonetaryPolicy, parseMonetaryValue } from '../../domain/monetaryBoundary';

/** Contract authorized in CCNL_RECOVERY_POLICY_RESOLUTION: ARAN 37357/39114/35083.
 * No CURRENT calculation; no reopening of origin years; no generic residual carry.
 */
export function resolveCcnlRecoveryInstruction(i: CcnlRecoveryInstruction, year: number, ms2021?: number, state: CcnlRecoveryState = {}): ResolvedCcnlRecovery {
  let result: ResolvedCcnlRecovery = { instruction: i, status: 'UNDETERMINED', decision: 'UNINSTRUCTED', theoreticalMaximum: null,
    authorizedFundAmount: null, authorizedEqAmount: null, recoverableResidual: null, recoverableEqResidual: null,
    recoveryAmount: null, recoveryEqAmount: null, remainingResidual: null, remainingEqResidual: null, issues: [] };
  const fail = (code: string, invalid = false): ResolvedCcnlRecovery => ({ ...result, status: invalid ? 'INVALID' : 'UNDETERMINED',
    decision: invalid ? 'INVALID' : 'UNINSTRUCTED', recoveryAmount: null, recoveryEqAmount: null, issues: [code] });
  if (!i || !['CCNL_014', 'CCNL_022'].includes(i.kind) || !Number.isInteger(i.competenceYear) || i.recognitionYear !== year
    || (i.kind === 'CCNL_014' ? ![2024, 2025].includes(i.competenceYear) : i.competenceYear !== 2025)) {
    // Invalid identity must not put null/NaN/untrusted types into an output DTO.
    result = { ...result, instruction: { kind: 'CCNL_014', competenceYear: 2024, recognitionYear: year } };
    return fail('CCNL_RECOVERY_IDENTITY_INVALID', true);
  }
  i = { ...i };
  for (const key of ['source', 'eqPerformanceClauseSource', 'qualifiedResidualReference'] as const) {
    if (i[key] !== undefined && typeof i[key] !== 'string') return fail('CCNL_RECOVERY_PROVENANCE_INVALID', true);
  }
  if (i.mode !== undefined && !['FIRST_QUALIFICATION', 'BOUND_RESIDUAL_CARRY'].includes(i.mode)) return fail('CCNL_RECOVERY_MODE_INVALID', true);
  // Money is validated even when a preceding administrative fact is unknown.
  for (const key of ['activatedAmount2025', 'alreadyRecognizedAmount', 'requestedRecoveryAmount', 'alreadyRecognizedEqAmount', 'requestedEqRecoveryAmount'] as const) {
    const value = parseMonetaryValue(i[key], defaultMonetaryPolicy, key);
    if (value.status === 'INVALID') return fail(value.issue.code, true);
    if (value.status === 'MISSING') delete i[key];
    else i[key] = value.value;
  }
  result = { ...result, instruction: i };
  if (i.mode === 'BOUND_RESIDUAL_CARRY') {
    if (year <= 2026 || i.constitutedAndCertified2026 !== true || !i.qualifiedResidualReference?.trim() || !i.source?.trim()) return fail('CCNL_BOUND_RESIDUAL_EVIDENCE_MISSING');
    if ((i.requestedRecoveryAmount ?? 0) !== 0 || (i.requestedEqRecoveryAmount ?? 0) !== 0) return fail('CCNL_BOUND_RESIDUAL_NOT_NEW_RECOVERY', true);
    // The existing residual accounting workflow owns the use; never create a new sum.
    return { ...result, status: 'VALID', decision: 'BOUND_RESIDUAL_CARRY', route: 'BOUND_RESIDUAL_CARRY', recoveryAmount: 0, recoveryEqAmount: 0 };
  }
  if (year !== 2026) return fail(year > 2026 ? 'CCNL_FIRST_QUALIFICATION_AFTER_2026_REQUIRES_APPLICABLE_RULE' : 'CCNL_RECOVERY_RECOGNITION_YEAR_INVALID', year < 2026);
  const ms = parseMonetaryValue(ms2021, defaultMonetaryPolicy, 'monteSalari2021');
  if (ms.status !== 'VALID') return fail('CCNL_RECOVERY_MS2021_' + ms.status, ms.status === 'INVALID');
  const numeric = (value: Big): number | null => {
    const checked = checkedMonetaryOutput(value);
    return checked.status === 'VALID' ? checked.value : null;
  };
  const maximum = numeric(new Big(ms.value).times(i.kind === 'CCNL_014' ? '0.0014' : '0.0022').round(2));
  if (maximum === null) return fail('MONEY_AGGREGATE_OUT_OF_SAFE_RANGE', true);
  result = { ...result, theoreticalMaximum: maximum };
  if (i.kind === 'CCNL_014' && (i.alreadyRecognizedAmount ?? 0) > maximum) return fail('CCNL_RECOVERY_ALREADY_RECOGNIZED_EXCEEDS_AUTHORIZED', true);
  if (i.kind === 'CCNL_022' && i.activatedAmount2025 !== undefined && i.activatedAmount2025 > maximum) return fail('CCNL_022_ACTIVATION_EXCEEDS_MAXIMUM', true);
  if (!i.source?.trim() || !i.instructionStatus || i.instructionStatus === 'UNINSTRUCTED') return fail('CCNL_RECOVERY_INSTRUCTION_MISSING');
  if (!['NOT_TO_RECOVER', 'RECOVER_PARTIAL', 'RECOVER_FULL'].includes(i.instructionStatus)) return fail('CCNL_RECOVERY_DECISION_INVALID', true);
  if (!i.originAdministrativeStatus || i.originAdministrativeStatus === 'UNKNOWN') return fail('CCNL_RECOVERY_ORIGIN_ADMINISTRATIVE_STATUS_MISSING');
  if (!['CLOSED_AND_DEFINED', 'NOT_CLOSED_AND_DEFINED'].includes(i.originAdministrativeStatus)) return fail('CCNL_RECOVERY_ORIGIN_ADMINISTRATIVE_STATUS_INVALID', true);
  if (i.originAdministrativeStatus === 'NOT_CLOSED_AND_DEFINED') {
    if (i.instructionStatus !== 'NOT_TO_RECOVER' || i.requestedRecoveryAmount !== 0 || (i.requestedEqRecoveryAmount ?? 0) !== 0) return fail('CCNL_RECOVERY_ORIGIN_NOT_CLOSED_AND_DEFINED', true);
    return { ...result, status: 'VALID', decision: 'NOT_APPLICABLE', route: 'NOT_APPLICABLE', recoveryAmount: 0, recoveryEqAmount: 0 };
  }
  if (!i.automaticResidualPerformanceClause || i.automaticResidualPerformanceClause === 'UNKNOWN') return fail('CCNL_RECOVERY_PERFORMANCE_CLAUSE_MISSING');
  if (!['PRESENT', 'ABSENT'].includes(i.automaticResidualPerformanceClause)) return fail('CCNL_RECOVERY_PERFORMANCE_CLAUSE_INVALID', true);
  let allowedFund = maximum;
  let allowedEq = 0;
  if (i.kind === 'CCNL_022') {
    if (i.activatedAmount2025 === undefined || i.activationDecisionAttested !== true) return fail('CCNL_022_ACTIVATION_2025_MISSING');
    if (i.activatedAmount2025 > maximum) return fail('CCNL_022_ACTIVATION_EXCEEDS_MAXIMUM', true);
    if (i.activatedAmount2025 === 0) { allowedFund = 0; }
    else {
      const f = parseMonetaryValue(state.fondoRisorseDecentrate2024, defaultMonetaryPolicy);
      const eq = parseMonetaryValue(state.risorseEQ2024, defaultMonetaryPolicy);
      if (f.status !== 'VALID' || eq.status !== 'VALID') return fail('CCNL_022_RECOVERY_2024_BASES_MISSING', f.status === 'INVALID' || eq.status === 'INVALID');
      const base = new Big(f.value).plus(eq.value);
      if (base.lte(0)) return fail('CCNL_022_RECOVERY_2024_BASES_INVALID', true);
      const fundShare = numeric(new Big(i.activatedAmount2025).times(f.value).div(base).round(2));
      if (fundShare === null) return fail('MONEY_AGGREGATE_OUT_OF_SAFE_RANGE', true);
      allowedFund = fundShare;
      allowedEq = numeric(new Big(i.activatedAmount2025).minus(fundShare))!;
    }
  }
  result = { ...result, authorizedFundAmount: allowedFund, authorizedEqAmount: allowedEq,
    route: i.automaticResidualPerformanceClause === 'PRESENT' ? 'PERFORMANCE_ARREARS' : 'FUND_VARIABLE_RESIDUAL' };
  if (i.alreadyRecognizedAmount === undefined || i.requestedRecoveryAmount === undefined
    || (i.kind === 'CCNL_022' && (i.alreadyRecognizedEqAmount === undefined || i.requestedEqRecoveryAmount === undefined))) return fail('CCNL_RECOVERY_AMOUNTS_MISSING');
  const alreadyEq = i.alreadyRecognizedEqAmount ?? 0;
  const requestedEq = i.requestedEqRecoveryAmount ?? 0;
  if (i.alreadyRecognizedAmount > allowedFund || alreadyEq > allowedEq) return fail('CCNL_RECOVERY_ALREADY_RECOGNIZED_EXCEEDS_AUTHORIZED', true);
  const residual = numeric(new Big(allowedFund).minus(i.alreadyRecognizedAmount))!;
  const residualEq = numeric(new Big(allowedEq).minus(alreadyEq))!;
  result = { ...result, recoverableResidual: residual, recoverableEqResidual: residualEq };
  if (i.requestedRecoveryAmount > residual || requestedEq > residualEq) return fail('CCNL_RECOVERY_REQUEST_EXCEEDS_RESIDUAL', true);
  if (i.instructionStatus === 'NOT_TO_RECOVER' && (i.requestedRecoveryAmount !== 0 || requestedEq !== 0)) return fail('CCNL_RECOVERY_ZERO_DECISION_CONFLICT', true);
  if (i.instructionStatus === 'RECOVER_FULL' && (i.requestedRecoveryAmount !== residual || requestedEq !== residualEq)) return fail('CCNL_RECOVERY_FULL_DECISION_CONFLICT', true);
  const zero = i.requestedRecoveryAmount === 0 && requestedEq === 0;
  return { ...result, status: 'VALID', decision: zero ? 'RESOLVED_ZERO' : i.instructionStatus === 'RECOVER_FULL' ? 'RECOVER_FULL' : 'RECOVER_PARTIAL',
    recoveryAmount: i.requestedRecoveryAmount, recoveryEqAmount: requestedEq,
    remainingResidual: numeric(new Big(residual).minus(i.requestedRecoveryAmount)), remainingEqResidual: numeric(new Big(residualEq).minus(requestedEq)) };
}

export function resolveCcnlRecoveries(state: CcnlRecoveryState | undefined, year: number, ms2021?: number): ResolvedCcnlRecovery[] {
  if (state?.instructions != null && !Array.isArray(state.instructions)) {
    const invalid = resolveCcnlRecoveryInstruction({ kind: 'CCNL_014', competenceYear: 2024, recognitionYear: year }, year, ms2021);
    return [{ ...invalid, status: 'INVALID', decision: 'INVALID', issues: ['CCNL_RECOVERY_INSTRUCTIONS_CONTAINER_INVALID'] }];
  }
  const supplied = state?.instructions ?? [];
  // Only the 2026 first qualification window has automatic candidates, never automatic money.
  const candidates = year === 2026 && ms2021 !== 0 ? [
    { kind: 'CCNL_014' as const, competenceYear: 2024, recognitionYear: year },
    { kind: 'CCNL_014' as const, competenceYear: 2025, recognitionYear: year },
    { kind: 'CCNL_022' as const, competenceYear: 2025, recognitionYear: year },
  ] : [];
  const inputs = [...supplied, ...candidates.filter(c => !supplied.some(i => i?.kind === c.kind && i?.competenceYear === c.competenceYear))];
  const seen = new Set<string>();
  return inputs.flatMap(i => {
    const key = `${i?.kind}:${i?.competenceYear}`;
    if (seen.has(key)) return [];
    seen.add(key);
    const resolved = resolveCcnlRecoveryInstruction(i, year, ms2021, state);
    return [inputs.filter(other => other?.kind === i?.kind && other?.competenceYear === i?.competenceYear).length > 1
      ? { ...resolved, status: 'INVALID' as const, decision: 'INVALID' as const, recoveryAmount: null, recoveryEqAmount: null, issues: ['CCNL_RECOVERY_DUPLICATE_COMPETENCE_YEAR'] } : resolved];
  });
}

export function considered022Years(year: number, recoveries: readonly ResolvedCcnlRecovery[]): number {
  const years = new Set(year >= 2025 ? [year] : []);
  for (const r of recoveries) if (r.status === 'VALID' && r.instruction.kind === 'CCNL_022' && r.route !== 'BOUND_RESIDUAL_CARRY') years.add(r.instruction.competenceYear);
  return years.size;
}
