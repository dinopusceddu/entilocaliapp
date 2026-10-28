import type { AnnualData, FundData } from '../../domain/types';
import { createEmptyFundData } from '../../domain/emptyFund';

/** Structural projection only. Persisted amounts/zero/null and sparse detail survive. */
export const hydrateFundData = (
  snapshot: Partial<Omit<FundData, 'annualData'>> & { annualData?: Partial<AnnualData> },
  year: number,
  entityName: string,
): FundData => {
  const saved = structuredClone(snapshot);
  // CLOSED is a frozen administrative record, including absent and legacy fields.
  if (saved.metadata?.snapshotStatus === 'CLOSED') return saved as FundData;
  const empty = createEmptyFundData(year, entityName);
  return {
    ...empty,
    ...saved,
    annualData: {
      ...empty.annualData,
      ...saved.annualData,
      annoRiferimento: year,
      denominazioneEnte: entityName || saved.annualData?.denominazioneEnte || '',
    },
    // No resource-detail merge: cache-only stays cache-only (CALC-04).
    // No historical fallback: optional/missing/zero remain the supplied values.
  };
};
