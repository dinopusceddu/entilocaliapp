import { describe, expect, it } from 'vitest';
import type { CalculationResult, CanonicalFundResult } from '../../../domain';
import { AnnualSnapshotStatus } from '../../../domain';
import type { DistributionStatus } from '../resolveDistributionStatus';
import {
  resolveOperationalStatus,
  type OperationalStatus,
} from '../resolveOperationalStatus';

function calculation(
  status: CanonicalFundResult['status'],
  total: number | null = status === 'VALID' ? 100 : null
): Pick<CalculationResult, 'canonicalFund'> {
  return {
    canonicalFund: {
      status,
      stableTotal: total,
      variableTotal: 0,
      total,
      verifiedStableTotal: total ?? 0,
      verifiedVariableTotal: 0,
      verifiedTotal: total ?? 0,
      art23Subject: total,
      art23Excluded: 0,
      verifiedArt23Subject: total ?? 0,
      verifiedArt23Excluded: 0,
      entries: [],
      warnings: [],
      missingPrerequisites: [],
    },
  };
}

describe('resolveOperationalStatus', () => {
  const statusCases: Array<[
    OperationalStatus,
    Pick<CalculationResult, 'canonicalFund'> | undefined,
    DistributionStatus,
  ]> = [
    ['NOT_STARTED', undefined, 'NOT_STARTED'],
    ['BLOCKED', calculation('INVALID'), 'NOT_STARTED'],
    ['TO_COMPLETE', calculation('UNDETERMINED'), 'NOT_STARTED'],
    ['CONSTITUTION_VERIFIED', calculation('VALID'), 'NOT_STARTED'],
    ['DISTRIBUTION_IN_PROGRESS', calculation('VALID'), 'IN_PROGRESS'],
  ];

  it.each(statusCases)('resolves %s', (expected, calculationResult, distributionStatus) => {
    expect(resolveOperationalStatus({ calculationResult, distributionStatus })).toBe(expected);
  });

  it('gives CLOSED precedence over invalid constitution and distribution work', () => {
    expect(resolveOperationalStatus({
      snapshotStatus: AnnualSnapshotStatus.CLOSED,
      calculationResult: calculation('INVALID'),
      distributionStatus: 'IN_PROGRESS',
    })).toBe('CLOSED');
  });

  it('S1-003: canonicalFund.status = INVALID prevails over distributionStatus = IN_PROGRESS', () => {
    expect(resolveOperationalStatus({
      calculationResult: calculation('INVALID'),
      distributionStatus: 'IN_PROGRESS',
    })).toBe('BLOCKED');
  });

  it('S1-003: canonicalFund.status = UNDETERMINED prevails over distributionStatus = IN_PROGRESS', () => {
    expect(resolveOperationalStatus({
      calculationResult: calculation('UNDETERMINED'),
      distributionStatus: 'IN_PROGRESS',
    })).toBe('TO_COMPLETE');
  });

  it('uses canonical status rather than a positive non-canonical total proxy', () => {
    expect(resolveOperationalStatus({
      calculationResult: calculation('UNDETERMINED', 99_999),
      distributionStatus: 'NOT_STARTED',
    })).toBe('TO_COMPLETE');

    expect(resolveOperationalStatus({
      calculationResult: calculation('INVALID', 99_999),
      distributionStatus: 'NOT_STARTED',
    })).toBe('BLOCKED');
  });
});
