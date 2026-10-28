import Big from 'big.js';
import FinancialMath from '../../utils/financialMath';
import type { Dl25AnnualState, Dl25CarryForwardState } from '../../domain/dl25';
import type { FundData } from '../../domain/types';

export const DL25_BASE_YEAR = 2025;
export const DL25_DENOMINATOR_YEAR = 2023;
export const DL25_THRESHOLD = 0.48;
export type Dl25State = 'VALID' | 'INVALID' | 'UNDETERMINED';
export interface Dl25CarryForwardResult {
  state: Dl25State;
  issues: string[];
  totalCeiling?: number;
  priorCumulativeApplied?: number;
  remainingCapacity?: number; // before this year's decision
  currentYearDelta?: number;
  currentCumulativeApplied?: number;
  remainingAfterApplication?: number;
}
const amount = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0;
const money = (n: Big) => FinancialMath.roundTo2DP(Number(n.toString()));

/** Fixed pre-increment 2025 baseline; current fund totals are never inputs. */
export function resolveDl25TotalCeiling(base: Dl25AnnualState): number | undefined {
  const { stipendiTabellari2023NonDirigenti: tab, fondoStabile2025Certificato: stable, budgetEq2025: eq } = base;
  const adjustments = base.altreRisorse2025DaSottrarre ?? 0;
  if (![tab, stable, eq, adjustments].every(amount)) return undefined;
  const ceiling = new Big(tab!).times(DL25_THRESHOLD).minus(stable!).minus(eq!).minus(adjustments);
  return money(ceiling.gt(0) ? ceiling : new Big(0));
}

/** Big.js comparisons precede final cent rounding: no tolerance permits overspending. */
export function resolveDl25CarryForward(input: Dl25CarryForwardState & {
  referenceYear?: number; totalCeiling?: number;
}): Dl25CarryForwardResult {
  const out: Dl25CarryForwardResult = { state: 'UNDETERMINED', issues: [], totalCeiling: input.totalCeiling };
  const fail = (state: Dl25State, issue: string) => ({ ...out, state, issues: [issue] });
  if (input.referenceYear === undefined) return fail('UNDETERMINED', 'DL25_REFERENCE_YEAR_MISSING');
  if (!Number.isInteger(input.referenceYear) || input.referenceYear < 2025) return fail('INVALID', 'DL25_YEAR_NOT_APPLICABLE');
  if (input.totalCeiling === undefined) return fail('UNDETERMINED', 'DL25_BASELINE_MISSING');
  if (!amount(input.totalCeiling)) return fail('INVALID', 'DL25_CEILING_INVALID');
  let prior = input.priorCumulativeApplied;
  if (input.referenceYear === 2025 && prior === undefined) prior = 0; // statutory first year, not a legacy guess
  if (prior === undefined) return fail('UNDETERMINED', 'PRIOR_DL25_STOCK_MISSING');
  if (!amount(prior) || (input.referenceYear === 2025 && prior !== 0)) return fail('INVALID', 'PRIOR_DL25_STOCK_INVALID');
  if (new Big(prior).gt(input.totalCeiling)) return fail('INVALID', 'PRIOR_DL25_STOCK_EXCEEDS_CEILING');
  if (input.referenceYear > 2025 && !input.priorStockProvenance?.trim()) return fail('UNDETERMINED', 'PRIOR_DL25_STOCK_PROVENANCE_MISSING');
  out.priorCumulativeApplied = prior;
  out.remainingCapacity = money(new Big(input.totalCeiling).minus(prior));
  let delta = input.currentYearDelta;
  if (input.legacyStoredAmount !== undefined) {
    if (!amount(input.legacyStoredAmount)) return fail('INVALID', 'DL25_LEGACY_AMOUNT_INVALID');
    if (input.legacyQualification === 'CUMULATIVE_STOCK' && input.legacyStoredAmount < prior) return fail('INVALID', 'DL25_CUMULATIVE_BELOW_PRIOR');
    if (input.legacyQualification === 'CUMULATIVE_STOCK' && input.legacyStoredAmount > input.totalCeiling) return fail('INVALID', 'DL25_LEGACY_STOCK_EXCEEDS_CEILING');
    if (input.referenceYear === 2025 && delta === undefined && !input.legacyAppliedProvenance?.trim()) return fail('UNDETERMINED', 'LEGACY_CARRY_FORWARD_UNQUALIFIED');
  }
  if (input.referenceYear > 2025 && input.legacyStoredAmount !== undefined &&
      (!input.legacyQualification || input.legacyQualification === 'UNKNOWN')) {
    return fail('UNDETERMINED', 'LEGACY_CARRY_FORWARD_UNQUALIFIED');
  }
  // A canonical decision supersedes the legacy amount only after explicit user entry.
  if (delta === undefined && input.legacyStoredAmount !== undefined) {
    if (!amount(input.legacyStoredAmount)) return fail('INVALID', 'DL25_LEGACY_AMOUNT_INVALID');
    if (input.referenceYear === 2025 && input.legacyAppliedProvenance?.trim()) {
      delta = input.legacyStoredAmount;
    } else if (input.legacyQualification === 'CUMULATIVE_STOCK') {
      if (input.legacyStoredAmount < prior) return fail('INVALID', 'DL25_CUMULATIVE_BELOW_PRIOR');
      delta = Number(new Big(input.legacyStoredAmount).minus(prior).toString());
    } else if (input.legacyQualification === 'CURRENT_YEAR_DELTA') {
      delta = input.legacyStoredAmount;
    } else return fail('UNDETERMINED', 'LEGACY_CARRY_FORWARD_UNQUALIFIED');
  }
  if (delta === undefined) return fail('UNDETERMINED', 'DL25_CURRENT_YEAR_DECISION_MISSING');
  if (!amount(delta)) return fail('INVALID', 'DL25_DELTA_INVALID');
  const cumulative = new Big(prior).plus(delta);
  if (cumulative.gt(input.totalCeiling)) return fail('INVALID', 'DL25_DELTA_EXCEEDS_RESIDUAL');
  return { ...out, state: 'VALID', issues: [], currentYearDelta: delta,
    currentCumulativeApplied: money(cumulative), remainingAfterApplication: money(new Big(input.totalCeiling).minus(cumulative)) };
}

export function resolveAnnualDl25(data: Partial<FundData>): Dl25CarryForwardResult {
  const facts = data.annualData?.dl25;
  return resolveDl25CarryForward({ ...facts, referenceYear: data.annualData?.annoRiferimento,
    totalCeiling: facts ? resolveDl25TotalCeiling(facts) : undefined,
    legacyStoredAmount: facts?.legacyStoredAmount ?? (facts?.version === 1 ? undefined : data.fondoAccessorioDipendenteData?.st_incrementoDL25_2025),
  });
}

/** New annuality only; never mutates or rewrites the source (including CLOSED). */
export function carryDl25ToNextYear(previous: FundData, target: FundData, nextYear: number): FundData {
  if (target.metadata?.snapshotStatus === 'CLOSED') return target;
  const year = previous.annualData?.annoRiferimento;
  if (year === undefined) return target;
  if (nextYear !== year + 1 || year < 2025) return target;
  const resolved = resolveAnnualDl25(previous);
  const old = previous.annualData.dl25;
  // No unqualified legacy amount, demo or default becomes an attested stock.
  if (resolved.state !== 'VALID' || !old || previous.fondoAccessorioDipendenteData?.st_incrementoDL25_2025 !== resolved.currentCumulativeApplied) return target;
  const result = structuredClone(target);
  result.annualData.annoRiferimento = nextYear;
  result.annualData.dl25 = { ...old, version: 1,
    priorCumulativeApplied: resolved.currentCumulativeApplied,
    priorStockProvenance: `Costituzione Fondo ${year}: stock DL25 qualificato; ${old.priorStockProvenance ?? old.legacyAppliedProvenance ?? 'decisione DL25 salvata'}`,
    currentYearDelta: 0, legacyStoredAmount: undefined, legacyQualification: undefined,
    legacyAppliedProvenance: undefined, regimeDate: undefined };
  // Replace the single semantic component; never append another delta or consolidate into a base.
  result.fondoAccessorioDipendenteData.st_incrementoDL25_2025 = resolved.currentCumulativeApplied;
  result.fondoAccessorioDipendenteData.st_incrementoDecretoPA = undefined;
  return result;
}
