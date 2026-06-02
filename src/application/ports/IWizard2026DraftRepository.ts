import { Wizard2026RemoteDraftRecord } from '../../features/wizard2026/remoteDraft/types';

export interface IWizard2026DraftRepository {
  loadWizard2026RemoteDraft(
    userId: string,
    entityId: string,
    year: number
  ): Promise<{
    data: Wizard2026RemoteDraftRecord | null;
    status: 'success' | 'notFound' | 'disabled' | 'error';
    error?: any;
  }>;

  upsertWizard2026RemoteDraft(
    userId: string,
    entityId: string,
    year: number,
    payload: {
      draft_state?: any;
      last_transfer?: any;
      local_sources?: Record<string, string> | null;
      checksum?: string | null;
      schema_version?: number;
      deleted_at?: string | null;
    }
  ): Promise<{
    status: 'success' | 'disabled' | 'error';
    error?: any;
  }>;

  deleteWizard2026RemoteDraft(
    userId: string,
    entityId: string,
    year: number
  ): Promise<{
    status: 'success' | 'disabled' | 'error';
    error?: any;
  }>;

  markWizard2026RemoteDraftDeleted(
    userId: string,
    entityId: string,
    year: number
  ): Promise<{
    status: 'success' | 'disabled' | 'error';
    error?: any;
  }>;
}
