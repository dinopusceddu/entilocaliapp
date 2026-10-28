/** JSON-compatible business facts. No defaults or interpretation on hydration. */
export interface Dl25CarryForwardState {
  version?: 1;
  priorCumulativeApplied?: number;
  priorStockProvenance?: string;
  currentYearDelta?: number;
  legacyStoredAmount?: number;
  legacyQualification?: 'CUMULATIVE_STOCK' | 'CURRENT_YEAR_DELTA' | 'UNKNOWN';
  legacyAppliedProvenance?: string;
  regimeDate?: string;
}

export interface Dl25AnnualState extends Dl25CarryForwardState {
  stipendiTabellari2023NonDirigenti?: number;
  fondoStabile2025Certificato?: number;
  budgetEq2025?: number;
  altreRisorse2025DaSottrarre?: number;
}
