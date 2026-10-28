import type { DistributionBudgetBasis } from './resolveDistributionFundBudget';
import FinancialMath from '../../utils/financialMath';

export interface DistributionPersonnel {
  status: 'MISSING' | 'KNOWN_ZERO' | 'KNOWN_POSITIVE';
  count: number | null;
  source: 'CCNL_SETTINGS' | 'EMPLOYEE_DETAILS' | null;
  art48Applicable: boolean | null;
}

/** Un elenco vuoto di default non certifica un organico pari a zero. */
export function resolveDistributionPersonnel(
  explicitCount?: number | null,
  employees?: readonly unknown[] | null
): DistributionPersonnel {
  const hasExplicitCount = explicitCount !== undefined && explicitCount !== null;
  const count = hasExplicitCount ? explicitCount : employees?.length ? employees.length : null;
  if (count === null || !Number.isFinite(count) || count < 0) {
    return { status: 'MISSING', count: null, source: null, art48Applicable: null };
  }
  return {
    status: count === 0 ? 'KNOWN_ZERO' : 'KNOWN_POSITIVE',
    count,
    source: hasExplicitCount ? 'CCNL_SETTINGS' : 'EMPLOYEE_DETAILS',
    art48Applicable: count > 5,
  };
}

export type DistributionDraftProposal =
  | { status: 'UNAVAILABLE'; mode: DistributionBudgetBasis['mode']; reason: 'MISSING_BUDGET' | 'INVALID_INPUT' }
  | {
    status: 'AVAILABLE';
    mode: 'AUTHORITATIVE' | 'VERIFIED_DRAFT';
    availableForPerformance: number;
    individuale: number;
    organizzativa: number;
    maggiorazione: number | null;
  };

/** Formule di riparto preesistenti, come proposta senza scritture nel draft. */
export function resolveDistributionDraftProposal({
  basis, stableAllocated, otherVariableAllocated, individualPercentage,
  allocatedMaggiorazione = 0, maggiorazioneProCapite = null, numDipendentiBonus = null,
}: {
  basis: DistributionBudgetBasis;
  stableAllocated: number;
  otherVariableAllocated: number;
  individualPercentage: number;
  allocatedMaggiorazione?: number;
  maggiorazioneProCapite?: number | null;
  numDipendentiBonus?: number | null;
}): DistributionDraftProposal {
  if (basis.mode === 'UNAVAILABLE') {
    return { status: 'UNAVAILABLE', mode: basis.mode, reason: 'MISSING_BUDGET' };
  }
  const values = [basis.amount, stableAllocated, otherVariableAllocated, individualPercentage,
    allocatedMaggiorazione, maggiorazioneProCapite ?? 0, numDipendentiBonus ?? 0];
  if (!values.every(Number.isFinite)) {
    return { status: 'UNAVAILABLE', mode: basis.mode, reason: 'INVALID_INPUT' };
  }
  const available = FinancialMath.subtractExact(basis.amount, stableAllocated);
  const availableForPerformance = Math.max(0, available - otherVariableAllocated);
  const maggiorazione = maggiorazioneProCapite === null || numDipendentiBonus === null
    ? null
    : Math.round((maggiorazioneProCapite * numDipendentiBonus + Number.EPSILON) * 100) / 100;
  // Il vecchio effect raggiungeva questi stessi importi dopo l'aggiornamento della maggiorazione.
  // La proposta li espone insieme; se non determinabile, conserva la quota già scelta.
  const effectivePerformance = Math.max(0, FinancialMath.subtractExact(
    availableForPerformance, maggiorazione ?? allocatedMaggiorazione
  ));
  const individuale = FinancialMath.roundTo2DP(effectivePerformance * (individualPercentage / 100));
  const organizzativa = FinancialMath.subtractExact(effectivePerformance, individuale);
  return { status: 'AVAILABLE', mode: basis.mode, availableForPerformance,
    individuale, organizzativa, maggiorazione };
}
