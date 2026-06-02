import { Wizard2026DraftState } from '../types';

export interface Wizard2026LastTransferPayload {
  transferredAt: string;
  userId: string;
  entityId: string;
  year: number;
  wizardState: Wizard2026DraftState;
  input: any;
  computed: any;
  transferPlan: any[];
}

export interface Wizard2026RemoteDraftRecord {
  id: string;
  user_id: string;
  entity_id: string;
  year: number;
  draft_state: Wizard2026DraftState | null;
  last_transfer: Wizard2026LastTransferPayload | null;
  local_sources?: Record<string, string> | null;
  checksum?: string | null;
  schema_version: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type Wizard2026SyncStatus =
  | 'disabled'
  | 'local_only'
  | 'remote_available'
  | 'synced'
  | 'local_newer'
  | 'remote_newer'
  | 'conflict'
  | 'error';

export interface Wizard2026DraftSyncResult {
  status: Wizard2026SyncStatus;
  localDraft: Wizard2026DraftState | null;
  remoteDraft: Wizard2026RemoteDraftRecord | null;
  error?: string;
}
