import { supabase } from '../services/supabase';
import { IWizard2026DraftRepository } from './ports/IWizard2026DraftRepository';
import { Wizard2026RemoteDraftRecord } from '../features/wizard2026/remoteDraft/types';

export class SupabaseWizard2026DraftRepository implements IWizard2026DraftRepository {
  private isEnabled(): boolean {
    return import.meta.env.VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS === 'true';
  }

  async loadWizard2026RemoteDraft(
    userId: string,
    entityId: string,
    year: number
  ): Promise<{
    data: Wizard2026RemoteDraftRecord | null;
    status: 'success' | 'notFound' | 'disabled' | 'error';
    error?: any;
  }> {
    if (!this.isEnabled()) {
      return { data: null, status: 'disabled' };
    }

    try {
      const { data, error } = await supabase
        .from('wizard2026_drafts')
        .select('*')
        .eq('user_id', userId)
        .eq('entity_id', entityId)
        .eq('year', year)
        .maybeSingle();

      if (error) {
        console.error('[SupabaseWizard2026DraftRepository] load error:', error);
        return { data: null, status: 'error', error };
      }

      if (!data) {
        return { data: null, status: 'notFound' };
      }

      return { data: data as Wizard2026RemoteDraftRecord, status: 'success' };
    } catch (err) {
      console.error('[SupabaseWizard2026DraftRepository] load exception:', err);
      return { data: null, status: 'error', error: err };
    }
  }

  async upsertWizard2026RemoteDraft(
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
  }> {
    if (!this.isEnabled()) {
      return { status: 'disabled' };
    }

    try {
      const dataToUpsert = {
        user_id: userId,
        entity_id: entityId,
        year,
        ...payload,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('wizard2026_drafts')
        .upsert(dataToUpsert, { onConflict: 'user_id,entity_id,year' });

      if (error) {
        console.error('[SupabaseWizard2026DraftRepository] upsert error:', error);
        return { status: 'error', error };
      }

      return { status: 'success' };
    } catch (err) {
      console.error('[SupabaseWizard2026DraftRepository] upsert exception:', err);
      return { status: 'error', error: err };
    }
  }

  async deleteWizard2026RemoteDraft(
    userId: string,
    entityId: string,
    year: number
  ): Promise<{
    status: 'success' | 'disabled' | 'error';
    error?: any;
  }> {
    if (!this.isEnabled()) {
      return { status: 'disabled' };
    }

    try {
      const { error } = await supabase
        .from('wizard2026_drafts')
        .delete()
        .eq('user_id', userId)
        .eq('entity_id', entityId)
        .eq('year', year);

      if (error) {
        console.error('[SupabaseWizard2026DraftRepository] delete error:', error);
        return { status: 'error', error };
      }

      return { status: 'success' };
    } catch (err) {
      console.error('[SupabaseWizard2026DraftRepository] delete exception:', err);
      return { status: 'error', error: err };
    }
  }

  async markWizard2026RemoteDraftDeleted(
    userId: string,
    entityId: string,
    year: number
  ): Promise<{
    status: 'success' | 'disabled' | 'error';
    error?: any;
  }> {
    if (!this.isEnabled()) {
      return { status: 'disabled' };
    }

    try {
      const { error } = await supabase
        .from('wizard2026_drafts')
        .update({
          deleted_at: new Date().toISOString(),
          draft_state: null
        })
        .eq('user_id', userId)
        .eq('entity_id', entityId)
        .eq('year', year);

      if (error) {
        console.error('[SupabaseWizard2026DraftRepository] mark deleted error:', error);
        return { status: 'error', error };
      }

      return { status: 'success' };
    } catch (err) {
      console.error('[SupabaseWizard2026DraftRepository] mark deleted exception:', err);
      return { status: 'error', error: err };
    }
  }
}
