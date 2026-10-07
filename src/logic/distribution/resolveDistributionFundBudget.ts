import type { CanonicalFundResult, CanonicalFundStatus } from '../../domain';
import FinancialMath from '../../utils/financialMath';

export type DistributionBudgetBasis =
  | { mode: 'AUTHORITATIVE' | 'VERIFIED_DRAFT'; amount: number }
  | { mode: 'UNAVAILABLE'; amount: null };

export interface DistributionFundBudget {
  canonicalStatus: CanonicalFundStatus | 'MISSING';
  authoritativeFundTotal: number | null;
  verifiedFundSubtotal: number | null;
  basis: DistributionBudgetBasis;
}

/** Projects the canonical result; a simulation basis never replaces the final total. */
export function resolveDistributionFundBudget(
  canonical?: CanonicalFundResult | null
): DistributionFundBudget {
  const authoritativeFundTotal = canonical?.status === 'VALID' ? canonical.total : null;
  const verifiedFundSubtotal = canonical?.verifiedTotal ?? null;
  return {
    canonicalStatus: canonical?.status ?? 'MISSING',
    authoritativeFundTotal,
    verifiedFundSubtotal,
    basis: authoritativeFundTotal !== null
      ? { mode: 'AUTHORITATIVE', amount: authoritativeFundTotal }
      : verifiedFundSubtotal !== null
        ? { mode: 'VERIFIED_DRAFT', amount: verifiedFundSubtotal }
        : { mode: 'UNAVAILABLE', amount: null },
  };
}

/** Existing allocation differences, retaining the economic qualification of their base. */
export function resolveDistributionBalances(
  basis: DistributionBudgetBasis,
  stableAllocated: number,
  totalAllocated: number
) {
  return {
    mode: basis.mode,
    availableForNegotiation: basis.amount === null ? null : FinancialMath.subtractExact(basis.amount, stableAllocated),
    residual: basis.amount === null ? null : FinancialMath.subtractExact(basis.amount, totalAllocated),
  };
}
