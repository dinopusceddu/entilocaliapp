export interface DirigenzaArt23Resolution {
  readonly status: 'VALID' | 'INVALID' | 'UNDETERMINED';
  readonly subjectAmount: number | null;
  readonly excludedAmount: number | null;
  readonly issues: readonly string[];
}

export interface DirigenzaCacheReconciliation {
  readonly status: 'ABSENT' | 'RECONCILED' | 'MISMATCH' | 'INVALID_CACHE' | 'UNAVAILABLE';
  readonly cachedAmount?: number;
  readonly derivedAmount: number | null;
}
