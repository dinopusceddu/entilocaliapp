import { supabase } from '../../services/supabase';
import { IStateRepository } from '../../application/ports/IStateRepository';

export class SupabaseStateRepository implements IStateRepository {
  async getState(userId: string | undefined, entityId: string, year: number): Promise<{ data: any | null; error: any }> {
    console.log(`[DIAGNOSI-REPO] getState: User=${userId}, Entity=${entityId}, Year=${year}`);
    let query = supabase
      .from('user_app_state')
      .select('*')
      .eq('entity_id', entityId)
      .eq('current_year', year);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const res = await query.maybeSingle();
    if (res.error?.code === 'PGRST116') {
      const details = String(res.error.details ?? '').toLowerCase();
      const message = String(res.error.message ?? '').toLowerCase();

      if (
        details.includes('0 rows') ||
        details.includes('no rows') ||
        message.includes('0 rows') ||
        message.includes('no rows')
      ) {
        return { data: null, error: null };
      }

      console.error(`[DIAGNOSI-REPO] Errore DB PGRST116 (non 0 righe):`, res.error);
      return res;
    }
    console.log(`[DIAGNOSI-REPO] Risposta DB: Error=${!!res.error}, Data=${!!res.data}`);
    if (res.error) {
        console.error(`[DIAGNOSI-REPO] Errore DB Critico:`, res.error);
    }
    return res;
  }

  async getAvailableYears(userId: string | undefined, entityId: string): Promise<{ data: { current_year: number }[] | null; error: any }> {
    let query = supabase
      .from('user_app_state')
      .select('current_year')
      .eq('entity_id', entityId);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    return await query;
  }

  async createState(data: any): Promise<{ error: any }> {
    console.log(`[SupabaseDebug] Tentativo creazione record: user=${data.user_id}, entity=${data.entity_id}, year=${data.current_year}`);
    const res = await supabase.from('user_app_state').insert(data);
    if (res.error) {
      console.error(`[SupabaseDebug] ERRORE CRITICO in createState:`, res.error);
    }
    return res;
  }

  async upsertState(data: any): Promise<{ error: any }> {
    return await supabase.from('user_app_state').upsert(data);
  }

  async deleteState(entityId: string, year: number): Promise<{ error: any }> {
    return await supabase
      .from('user_app_state')
      .delete()
      .eq('entity_id', entityId)
      .eq('current_year', year);
  }

  async deleteStatesByEntity(entityId: string): Promise<{ error: any }> {
    return await supabase
      .from('user_app_state')
      .delete()
      .eq('entity_id', entityId);
  }
}
