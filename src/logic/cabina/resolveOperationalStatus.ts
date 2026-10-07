import type { CalculationResult } from '../../domain';
import { AnnualSnapshotStatus } from '../../domain';
import type { DistributionStatus } from './resolveDistributionStatus';

export type OperationalStatus =
  | 'NOT_STARTED'
  | 'TO_COMPLETE'
  | 'BLOCKED'
  | 'CONSTITUTION_VERIFIED'
  | 'DISTRIBUTION_IN_PROGRESS'
  | 'CLOSED';

export interface ResolveOperationalStatusInput {
  snapshotStatus?: AnnualSnapshotStatus;
  calculationResult?: Pick<CalculationResult, 'canonicalFund'>;
  distributionStatus: DistributionStatus;
  /** Esito della checklist già risolta, senza rieseguire i controlli di compliance. */
  hasBlockingIssues: boolean;
}

/** Deriva lo stato operativo senza usare totali numerici o progresso Wizard come proxy. */
export function resolveOperationalStatus({
  snapshotStatus,
  calculationResult,
  distributionStatus,
  hasBlockingIssues,
}: ResolveOperationalStatusInput): OperationalStatus {
  if (snapshotStatus === AnnualSnapshotStatus.CLOSED) {
    return 'CLOSED';
  }

  if (!calculationResult) {
    return 'NOT_STARTED';
  }

  switch (calculationResult.canonicalFund.status) {
    case 'INVALID':
      return 'BLOCKED';
    case 'UNDETERMINED':
      return 'TO_COMPLETE';
    case 'VALID':
      if (hasBlockingIssues) {
        return 'BLOCKED';
      }
      return distributionStatus === 'IN_PROGRESS'
        ? 'DISTRIBUTION_IN_PROGRESS'
        : 'CONSTITUTION_VERIFIED';
  }
}
