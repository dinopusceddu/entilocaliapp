import { supabase } from '../../services/supabase';
import { Entity } from '../../types';
import { IEntityRepository } from '../../application/ports/IEntityRepository';
import { isVersion, persistenceError, StatePersistenceError } from '../../application/snapshots/versionedSnapshotContract';

export class SupabaseEntityRepository implements IEntityRepository {
  async getAll(userId?: string): Promise<{ data: Entity[] | null; error: any }> {
    let query = supabase.from('entities').select('*').order('name');
    if (userId) query = query.eq('user_id', userId);
    return await query;
  }
  async create(name: string, userId: string): Promise<{ data: Entity | null; error: any }> {
    return await supabase.from('entities').insert({ name, user_id: userId }).select().single();
  }
  async update(id: string, name: string): Promise<{ error: any }> {
    const { data, error } = await supabase.from('entities').update({ name }).eq('id', id).select('id,name').maybeSingle();
    if (error) return { error };
    return { error: data?.id === id && data.name === name ? null : new Error('Nessun ente aggiornato.') };
  }
  async delete(id: string, expectedVersions?: Record<string, string>): Promise<{ data?: any; error: any }> {
    if (!expectedVersions || Object.entries(expectedVersions).some(([year, version]) => !/^-?\d+$/.test(year) || !isVersion(version))) {
      return { error: new StatePersistenceError('STATE_VERSION_REQUIRED', 'Mappa delle versioni da eliminare non disponibile.') };
    }
    try {
      const result = await supabase.rpc('delete_entity_versioned', { p_entity_id: id, p_versions: expectedVersions });
      if (result.error) return { error: persistenceError(result.error) };
      if (result.data?.success !== true || result.data.deleted !== 1) return { error: new StatePersistenceError('STATE_WRITE_NOT_CONFIRMED', 'Cancellazione dell’ente non confermata.') };
      return { data: result.data, error: null };
    } catch (cause) { return { error: new StatePersistenceError('STATE_OUTCOME_UNKNOWN', 'Esito cancellazione non disponibile. Verifica prima di riprovare.', cause) }; }
  }
}
