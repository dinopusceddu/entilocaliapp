import { supabase } from '../../services/supabase';
import { Entity } from '../../types';
import { IEntityRepository } from '../../application/ports/IEntityRepository';

export class SupabaseEntityRepository implements IEntityRepository {
  async getAll(userId?: string): Promise<{ data: Entity[] | null; error: any }> {
    let query = supabase.from('entities').select('*').order('name');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    return await query;
  }

  async create(name: string, userId: string): Promise<{ data: Entity | null; error: any }> {
    return await supabase
      .from('entities')
      .insert({ name, user_id: userId })
      .select()
      .single();
  }

  async update(id: string, name: string): Promise<{ error: any }> {
    return await supabase
      .from('entities')
      .update({ name })
      .eq('id', id);
  }

  async delete(id: string): Promise<{ error: any }> {
    return await supabase
      .from('entities')
      .delete()
      .eq('id', id);
  }
}
