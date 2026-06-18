import { describe, expect, it, vi, beforeEach } from 'vitest';
import { supabase } from '../../../services/supabase';
import { SupabaseStateRepository } from '../SupabaseStateRepository';

vi.mock('../../../services/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('SupabaseStateRepository.getState', () => {
  const buildQuery = (response: any) => {
    const query: any = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      maybeSingle: vi.fn().mockResolvedValue(response)
    };
    vi.mocked(supabase.from).mockReturnValue(query);
    return query;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('restituisce data null senza errore quando la riga annuale non esiste', async () => {
    const query = buildQuery({ data: null, error: null });
    const repository = new SupabaseStateRepository();

    const result = await repository.getState('u1', 'e1', 2026);

    expect(supabase.from).toHaveBeenCalledWith('user_app_state');
    expect(query.maybeSingle).toHaveBeenCalled();
    expect(result).toEqual({ data: null, error: null });
  });

  it('normalizza PGRST116 come stato assente, non come errore bloccante', async () => {
    buildQuery({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
    const repository = new SupabaseStateRepository();

    const result = await repository.getState('u1', 'e1', 2026);

    expect(result).toEqual({ data: null, error: null });
  });
});
