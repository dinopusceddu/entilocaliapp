import { AnnualData, HistoricalData, UserRole } from './index';


export enum AnnualSnapshotStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface AnnualSnapshotMetadata {
  snapshotStatus: AnnualSnapshotStatus;
  closedAt: string | null;
  closedBy: string | null;
  closureVersion: number;
  sourceYear?: number;
}

export interface AnnualSnapshot {
  entityId: string;
  year: number;
  userId: string;
  /** Historical compatibility value; never a permission source. */
  role: UserRole;
  fundData: {
    annualData: Partial<AnnualData>;
    historicalData: Partial<HistoricalData>;
    metadata?: AnnualSnapshotMetadata;
    [key: string]: any;
  };
  updatedAt: string;
  baseline?: SnapshotBaseline;
}

export interface AnnualSnapshotSaveResult {
  issues?: readonly import('./monetaryBoundary').MonetaryIssue[];
  success: boolean;
  reason?: 'SNAPSHOT_CLOSED' | 'OWNERSHIP_VIOLATION' | 'VALIDATION_ERROR' | 'DB_ERROR' | 'UNKNOWN' | import('../application/snapshots/versionedSnapshotContract').StateFailureCode;
  error?: string;
  technicalCause?: unknown;
  baseline?: SnapshotBaseline;
  version?: string;
  persistedRow?: any;
  noWrite?: boolean;
}

export interface AnnualSnapshotLoadResult {
  success: boolean;
  snapshot?: AnnualSnapshot;
  error?: string;
  technicalCause?: unknown;
  baseline?: SnapshotBaseline;
  version?: string;
  persistedRow?: any;
  noWrite?: boolean;
  isNewInitialization?: boolean;
}

export interface YearSwitchResult {
  success: boolean;
  targetYear: number;
  newSnapshot?: AnnualSnapshot;
  error?: string;
  technicalCause?: unknown;
  baseline?: SnapshotBaseline;
  version?: string;
  persistedRow?: any;
  noWrite?: boolean;
  savedPreviousYear: boolean;
}

export interface YearClosureCarryForward {
  year: number;
  leftoverFad: number;
  actualLeftoversInfo: {
    fad: number;
    eq: number;
    dir: number;
    seg: number;
  };
}

export interface YearClosureResult {
  success: boolean;
  cancelled?: boolean;
  closedYear: number;
  nextYear: number;
  carryForward: number;
  currentSnapshot?: any;
  nextSnapshot?: any;
  currentVersion?: string;
  nextVersion?: string;
  warnings: string[];
  nonTransferredResiduals: { fund: string; amount: number }[];
  error?: string;
  technicalCause?: unknown;
  baseline?: SnapshotBaseline;
  version?: string;
  persistedRow?: any;
  noWrite?: boolean;
}

/** Technical persistence baseline; never embedded in fund_data or normative metadata. */
export interface SnapshotBaseline {
  principalId: string;
  entityId: string;
  year: number;
  exists: boolean;
  version: string | null;
  fundData: any;
  rawStatus: string | null;
  identity?: { user_id: string; email: string | null; role: string | null };
}