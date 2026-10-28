import type { AnnualData } from '../../domain';
import FinancialMath from '../../utils/financialMath';

export type PnrrExerciseDecision = 'NOT_EXERCISED' | 'EXERCISED' | 'UNSET';
export type PnrrEligibility = 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'UNDETERMINED';
export interface PnrrFacultyInput {
  referenceYear?: number;
  exerciseDecision?: PnrrExerciseDecision;
  subject?: boolean | null;
  stableCertifiedFund2016?: number | null;
  amountApplied?: number | null;
  requirementA?: boolean | null;
  requirementB?: boolean | null;
  incidenceLatestApprovedStatement?: number | null;
  requirementD?: boolean | null;
}
export interface PnrrFacultyResult {
  exerciseDecision: PnrrExerciseDecision;
  period: 'APPLICABLE_PERIOD' | 'NOT_APPLICABLE' | 'UNDETERMINED';
  previousYear?: number;
  eligibility: PnrrEligibility;
  requirements: { A?: boolean; B?: boolean; C?: boolean; D?: boolean };
  maximumAvailable?: number;
  amountApplied?: number;
  contribution: number;
  status: 'VALID' | 'INVALID' | 'UNDETERMINED';
  reasons: string[];
}
const knownBoolean = (value: unknown): boolean | undefined => typeof value === 'boolean' ? value : undefined;
const present = (value: unknown): boolean => value !== undefined && value !== null;
const validMoney = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;

/** A/B/D concern Y-1; C always concerns the latest approved statement. Pure, no migration. */
export function resolvePnrrFaculty(input: PnrrFacultyInput): PnrrFacultyResult {
  const yearKnown = typeof input.referenceYear === 'number' && Number.isInteger(input.referenceYear);
  const period = !yearKnown ? 'UNDETERMINED' : input.referenceYear! >= 2023 && input.referenceYear! <= 2026
    ? 'APPLICABLE_PERIOD' : 'NOT_APPLICABLE';
  const exerciseDecision = input.exerciseDecision ?? 'UNSET';
  const incidence = input.incidenceLatestApprovedStatement;
  const requirements = {
    A: knownBoolean(input.requirementA), B: knownBoolean(input.requirementB),
    C: validMoney(incidence) ? incidence <= 8 : undefined, D: knownBoolean(input.requirementD),
  };
  const values = Object.values(requirements);
  const eligibility = values.includes(false) ? 'NOT_ELIGIBLE' : values.includes(undefined) ? 'UNDETERMINED' : 'ELIGIBLE';
  const maximumAvailable = validMoney(input.stableCertifiedFund2016)
    ? FinancialMath.roundTo2DP(FinancialMath.multiplyExact(input.stableCertifiedFund2016, 0.05)) : undefined;
  const amountApplied = validMoney(input.amountApplied) ? FinancialMath.roundTo2DP(input.amountApplied) : undefined;
  const result: PnrrFacultyResult = {
    exerciseDecision, period, previousYear: yearKnown ? input.referenceYear! - 1 : undefined,
    eligibility, requirements, maximumAvailable, amountApplied, contribution: 0, status: 'VALID', reasons: [],
  };
  if (exerciseDecision === 'NOT_EXERCISED') return { ...result, amountApplied: 0 };
  // Outside the statutory period no current resource may be claimed, including a copied prior-year amount.
  if (period === 'NOT_APPLICABLE') {
    return present(input.amountApplied) && input.amountApplied !== 0
      ? { ...result, status: 'INVALID', reasons: ['PNRR_NOT_APPLICABLE_PERIOD'] } : { ...result, amountApplied: 0 };
  }
  const invalid: string[] = [];
  const missing: string[] = [];
  if (present(input.amountApplied) && !validMoney(input.amountApplied)) invalid.push('PNRR_AMOUNT_INVALID');
  if (maximumAvailable !== undefined && amountApplied !== undefined && amountApplied > maximumAvailable) invalid.push('PNRR_MAXIMUM_EXCEEDED');
  if (exerciseDecision !== 'EXERCISED') {
    // No economic claim is not an inferred administrative waiver: UNSET remains UNSET.
    if (invalid.length) return { ...result, status: 'INVALID', reasons: invalid };
    return amountApplied === undefined || amountApplied === 0 ? result
      : { ...result, status: 'UNDETERMINED', reasons: ['PNRR_EXERCISE_DECISION_UNSET'] };
  }
  if (input.subject === false) invalid.push('PNRR_NOT_SUBJECT');
  if (eligibility === 'NOT_ELIGIBLE') {
    for (const [key, value] of Object.entries(requirements)) if (value === false) invalid.push(`PNRR_REQUIREMENT_${key}_NOT_SATISFIED`);
  } else if (eligibility === 'UNDETERMINED') missing.push('PNRR_ELIGIBILITY_UNDETERMINED');
  if (present(input.stableCertifiedFund2016) && !validMoney(input.stableCertifiedFund2016)) invalid.push('PNRR_STABLE_2016_INVALID');
  else if (maximumAvailable === undefined) missing.push('PNRR_STABLE_2016_MISSING');
  if (present(incidence) && !validMoney(incidence)) invalid.push('PNRR_INCIDENCE_INVALID');
  if (amountApplied === undefined && !invalid.includes('PNRR_AMOUNT_INVALID')) missing.push('PNRR_APPLIED_AMOUNT_MISSING');
  if (period === 'UNDETERMINED') missing.push('PNRR_REFERENCE_YEAR_MISSING');
  if (invalid.length) return { ...result, status: 'INVALID', reasons: invalid };
  if (missing.length) return { ...result, status: 'UNDETERMINED', reasons: missing };
  return { ...result, contribution: amountApplied! };
}

export function resolveAnnualPnrrFaculty(annual: AnnualData, amountApplied?: number): PnrrFacultyResult {
  return resolvePnrrFaculty({
    referenceYear: annual.annoRiferimento, exerciseDecision: annual.pnrrExerciseDecision,
    subject: annual.pnrrSubject,
    stableCertifiedFund2016: annual.fondoStabile2016PNRR, amountApplied,
    requirementA: annual.rispettoEquilibrioBilancioPrecedente,
    requirementB: annual.rispettoDebitoCommercialePrecedente,
    incidenceLatestApprovedStatement: annual.incidenzaSalarioAccessorioUltimoRendiconto,
    requirementD: annual.approvazioneRendicontoPrecedente,
  });
}
