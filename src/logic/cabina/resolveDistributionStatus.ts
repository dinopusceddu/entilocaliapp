import type { DistribuzioneRisorseData, RisorsaVariabileDetail } from '../../domain';

export type DistributionStatus = 'NOT_STARTED' | 'IN_PROGRESS';

function isPositiveFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/**
 * Deriva esclusivamente la presenza di lavoro economico strutturato.
 * Valori scalari e criteri di configurazione non costituiscono avanzamento.
 */
export function resolveDistributionStatus(
  data?: DistribuzioneRisorseData | null
): DistributionStatus {
  const hasExistingWork = Object.values(data ?? {}).some(value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }

    const detail = value as RisorsaVariabileDetail;
    return isPositiveFinite(detail.stanziate)
      || isPositiveFinite(detail.risparmi)
      || isPositiveFinite(detail.aBilancio);
  });

  return hasExistingWork ? 'IN_PROGRESS' : 'NOT_STARTED';
}
