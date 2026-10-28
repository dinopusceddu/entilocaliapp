export type FundLedgerComponent = 'STABLE' | 'VARIABLE';
export type FundLedgerOperation = 'ADDITION' | 'DEDUCTION';
export type FundLedgerSource =
  | 'MANUAL'
  | 'CALCULATED'
  | 'TRANSFERRED'
  | 'RECOVERY'
  | 'LEGACY_MIGRATED';
export type Art23Treatment = 'SUBJECT' | 'EXCLUDED' | 'UNDETERMINED';
export type FundLedgerEntryStatus = 'VALID' | 'MISSING' | 'INVALID' | 'UNDETERMINED';
export type CanonicalFundStatus = 'VALID' | 'INVALID' | 'UNDETERMINED';

/**
 * Identità economica canonica di una singola risorsa del Fondo dipendenti.
 * `economicEffect=false` descrive un movimento esclusivamente figurativo/di limite.
 */
export interface FundLedgerEntry {
  readonly id: string;
  readonly amount: number | null;
  readonly component: FundLedgerComponent;
  readonly operation: FundLedgerOperation;
  readonly competenceYear: number | null;
  readonly originYear?: number | null;
  readonly source: FundLedgerSource;
  readonly art23Treatment: Art23Treatment;
  readonly status: FundLedgerEntryStatus;
  readonly normativeRef?: string;
  readonly economicEffect?: boolean;
  readonly provenance?: unknown;
}

export interface CanonicalFundResult {
  readonly stableTotal: number | null;
  readonly variableTotal: number | null;
  readonly total: number | null;
  /** Somme delle sole entries determinate, utili per mostrare il subtotale verificato. */
  readonly verifiedStableTotal: number;
  readonly verifiedVariableTotal: number;
  readonly verifiedTotal: number;
  readonly art23Subject: number | null;
  readonly art23Excluded: number | null;
  /** Subtotali delle entries Art. 23 determinate, senza trasformare i missing in zero. */
  readonly verifiedArt23Subject: number;
  readonly verifiedArt23Excluded: number;
  readonly entries: FundLedgerEntry[];
  readonly status: CanonicalFundStatus;
  readonly warnings: string[];
  readonly missingPrerequisites: string[];
}
