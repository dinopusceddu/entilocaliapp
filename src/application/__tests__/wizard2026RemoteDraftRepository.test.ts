import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SupabaseWizard2026DraftRepository } from '../wizard2026RemoteDraftRepository';
import { supabase } from '../../services/supabase';

// Mock Supabase client
vi.mock('../../services/supabase', () => {
  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    then: vi.fn()
  };

  return {
    supabase: {
      from: vi.fn().mockReturnValue(mockQueryBuilder)
    }
  };
});

describe('SupabaseWizard2026DraftRepository', () => {
  let repository: SupabaseWizard2026DraftRepository;
  const mockQueryBuilder = supabase.from('wizard2026_drafts') as any;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabaseWizard2026DraftRepository();
    // Default flag to disabled for standard safety, test will stub it
    vi.stubEnv('VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // --- Feature Flag Tests ---
  it('1. When feature flag is disabled, load returns disabled and does not call Supabase', async () => {
    const res = await repository.loadWizard2026RemoteDraft('u1', 'e1', 2026);
    expect(res.status).toBe('disabled');
    expect(res.data).toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('2. When feature flag is disabled, upsert returns disabled and does not call Supabase', async () => {
    const res = await repository.upsertWizard2026RemoteDraft('u1', 'e1', 2026, {});
    expect(res.status).toBe('disabled');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('3. When feature flag is disabled, delete returns disabled and does not call Supabase', async () => {
    const res = await repository.deleteWizard2026RemoteDraft('u1', 'e1', 2026);
    expect(res.status).toBe('disabled');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('4. When feature flag is disabled, mark deleted returns disabled and does not call Supabase', async () => {
    const res = await repository.markWizard2026RemoteDraftDeleted('u1', 'e1', 2026);
    expect(res.status).toBe('disabled');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  // --- Remote Queries (Enabled Flag) ---
  describe('When feature flag is enabled', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS', 'true');
    });

    it('5. load returns success and data if record is found', async () => {
      const mockRecord = {
        id: 'uuid-1',
        user_id: 'u1',
        entity_id: 'e1',
        year: 2026,
        draft_state: { meta: { currentStep: 1 } },
        checksum: 'abc'
      };

      mockQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: mockRecord, error: null });

      const res = await repository.loadWizard2026RemoteDraft('u1', 'e1', 2026);
      expect(res.status).toBe('success');
      expect(res.data).toEqual(mockRecord);
      expect(supabase.from).toHaveBeenCalledWith('wizard2026_drafts');
    });

    it('6. load returns notFound if query returns null data', async () => {
      mockQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const res = await repository.loadWizard2026RemoteDraft('u1', 'e1', 2026);
      expect(res.status).toBe('notFound');
      expect(res.data).toBeNull();
    });

    it('7. load returns error if Supabase query fails', async () => {
      const mockError = { message: 'Database failure', code: '42P01' };
      mockQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: null, error: mockError });

      const res = await repository.loadWizard2026RemoteDraft('u1', 'e1', 2026);
      expect(res.status).toBe('error');
      expect(res.error).toEqual(mockError);
    });

    it('8. load returns error if database call throws an exception', async () => {
      mockQueryBuilder.maybeSingle.mockRejectedValueOnce(new Error('Network offline'));

      const res = await repository.loadWizard2026RemoteDraft('u1', 'e1', 2026);
      expect(res.status).toBe('error');
      expect(res.error).toBeDefined();
    });

    it('9. upsert builds correct query payload and parameters', async () => {
      mockQueryBuilder.upsert.mockResolvedValueOnce({ error: null });

      const payload = {
        draft_state: { meta: { currentStep: 2 } },
        checksum: 'xyz',
        schema_version: 1
      };

      const res = await repository.upsertWizard2026RemoteDraft('u1', 'e1', 2026, payload);
      expect(res.status).toBe('success');
      expect(mockQueryBuilder.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'u1',
          entity_id: 'e1',
          year: 2026,
          draft_state: payload.draft_state,
          checksum: 'xyz',
          schema_version: 1,
          updated_at: expect.any(String)
        }),
        { onConflict: 'user_id,entity_id,year' }
      );
    });

    it('10. upsert returns error if database upsert fails', async () => {
      const mockError = { message: 'Unique constraint violation' };
      mockQueryBuilder.upsert.mockResolvedValueOnce({ error: mockError });

      const res = await repository.upsertWizard2026RemoteDraft('u1', 'e1', 2026, {});
      expect(res.status).toBe('error');
      expect(res.error).toEqual(mockError);
    });

    it('11. delete builds correct filters and query', async () => {
      mockQueryBuilder.then.mockImplementationOnce((onFulfilled: any) => {
        onFulfilled({ error: null });
      });

      const res = await repository.deleteWizard2026RemoteDraft('u1', 'e1', 2026);
      expect(res.status).toBe('success');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'u1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('entity_id', 'e1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('year', 2026);
    });

    it('12. markDeleted sets deleted_at and nulls draft_state', async () => {
      mockQueryBuilder.then.mockImplementationOnce((onFulfilled: any) => {
        onFulfilled({ error: null });
      });

      const res = await repository.markWizard2026RemoteDraftDeleted('u1', 'e1', 2026);
      expect(res.status).toBe('success');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_at: expect.any(String),
          draft_state: null
        })
      );
    });
  });
});
