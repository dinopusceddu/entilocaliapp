import { supabase } from '../../services/supabase';
import { IUserRepository } from '../../application/ports/IUserRepository';

export class SupabaseUserRepository implements IUserRepository {
  async getUserRole(userId: string): Promise<{ data: string | null; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    return { data: data?.role || null, error };
  }
}
