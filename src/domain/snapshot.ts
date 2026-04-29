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
  role: UserRole;
  fundData: {
    annualData: Partial<AnnualData>;
    historicalData: Partial<HistoricalData>;
    metadata?: AnnualSnapshotMetadata;
    [key: string]: any;
  };
  updatedAt: string;
}

export interface AnnualSnapshotSaveResult {
  success: boolean;
  error?: string;
}

export interface AnnualSnapshotLoadResult {
  success: boolean;
  snapshot?: AnnualSnapshot;
  error?: string;
  isNewInitialization?: boolean;
}

export interface YearSwitchResult {
  success: boolean;
  targetYear: number;
  newSnapshot?: AnnualSnapshot;
  error?: string;
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
  closedYear: number;
  nextYear: number;
  carryForward: number;
  warnings: string[];
  nonTransferredResiduals: { fund: string; amount: number }[];
  error?: string;
}
