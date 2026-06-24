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

  it('normalizza PGRST116 come stato assente, non come errore bloccante se il messaggio indica No rows', async () => {
    buildQuery({ data: null, error: { code: 'PGRST116', message: 'No rows found', details: 'The query returned 0 rows' } });
    const repository = new SupabaseStateRepository();

    const result = await repository.getState('u1', 'e1', 2026);

    expect(result).toEqual({ data: null, error: null });
  });

  it('preserva l errore PGRST116 se indica un problema di righe multiple/duplicati', async () => {
    const errorObj = { code: 'PGRST116', message: 'JSON object requested, multiple rows returned', details: 'More than one row matches the query' };
    buildQuery({ data: null, error: errorObj });
    const repository = new SupabaseStateRepository();

    const result = await repository.getState('u1', 'e1', 2026);

    expect(result.error).toEqual(errorObj);
  });
});
