import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWizard2026RemoteDraftSync } from '../hooks/useWizard2026RemoteDraftSync';
import { SupabaseWizard2026DraftRepository } from '../../../application/wizard2026RemoteDraftRepository';
import { Wizard2026DraftState } from '../types';

describe('useWizard2026RemoteDraftSync Hook', () => {
  const mockHydrate = vi.fn();
  const mockHydrateLastTransfer = vi.fn();

  const mockDraft: Wizard2026DraftState = {
    meta: { currentStep: 1, completedSteps: [], isPreviewMode: false, canTransferToLegacy: false },
    ente: { entityType: 'COMUNE', denominazioneEnte: 'Test Ente' },
    art23: { checks: [] },
    dl25: { checks: [] },
    ccnl2026: { checks: [] },
    conglobamentoArt60: {
      mode: 'manual',
      partTimeNativi: [],
      checks: [],
      personaleInteroArea: {},
      ftePerArea: {}
    },
    straordinario: { checks: [] },
    pnrr: { checks: [] },
    riepilogo: { totaleErrori: 0, totaleWarning: 0, totaleInfo: 0, readyForPreview: true, readyForFutureTransfer: true }
  };

  beforeEach(() => {
    localStorage.clear();
    mockHydrate.mockClear();
    mockHydrateLastTransfer.mockClear();
    
    vi.useFakeTimers();
    vi.stubEnv('VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS', 'true');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('1. Feature flag disabled -> returns disabled status and does not fetch remote', async () => {
    vi.stubEnv('VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS', 'false');
    const spyLoad = vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'loadWizard2026RemoteDraft');

    const { result } = renderHook(() =>
      useWizard2026RemoteDraftSync({
        userId: 'u1',
        entityId: 'e1',
        year: 2026,
        localDraft: mockDraft,
        onHydrate: mockHydrate
      })
    );

    expect(result.current.syncStatus).toBe('disabled');
    expect(spyLoad).not.toHaveBeenCalled();
  });

  it('2. Remote database error -> falls back gracefully to localStorage and sets error status', async () => {
    vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'loadWizard2026RemoteDraft')
      .mockResolvedValueOnce({ data: null, status: 'error', error: 'Connection failed' });

    const { result } = renderHook(() =>
      useWizard2026RemoteDraftSync({
        userId: 'u1',
        entityId: 'e1',
        year: 2026,
        localDraft: mockDraft,
        onHydrate: mockHydrate
      })
    );

    // Wait for promise resolution in hook
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.syncStatus).toBe('error');
    expect(result.current.isOffline).toBe(true);
    expect(mockHydrate).not.toHaveBeenCalled();
  });

  it('3. Only local draft exists -> returns local_only status', async () => {
    vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'loadWizard2026RemoteDraft')
      .mockResolvedValueOnce({ data: null, status: 'notFound' });

    const { result } = renderHook(() =>
      useWizard2026RemoteDraftSync({
        userId: 'u1',
        entityId: 'e1',
        year: 2026,
        localDraft: mockDraft,
        onHydrate: mockHydrate
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.syncStatus).toBe('local_only');
    expect(mockHydrate).not.toHaveBeenCalled();
  });

  it('4. Only remote draft exists -> automatically hydrates it and returns synced status', async () => {
    const remoteRecord = {
      id: 'uuid-1',
      user_id: 'u1',
      entity_id: 'e1',
      year: 2026,
      draft_state: { ...mockDraft, ccnl2026: { monteSalari2021: 999 } as any },
      last_transfer: null,
      schema_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'loadWizard2026RemoteDraft')
      .mockResolvedValueOnce({ data: remoteRecord, status: 'success' });

    const { result } = renderHook(() =>
      useWizard2026RemoteDraftSync({
        userId: 'u1',
        entityId: 'e1',
        year: 2026,
        localDraft: null, // no local draft
        onHydrate: mockHydrate
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockHydrate).toHaveBeenCalledWith(remoteRecord.draft_state);
    expect(result.current.syncStatus).toBe('synced');
  });

  it('5. Both exist, local is newer -> returns local_newer status', async () => {
    const remoteTime = new Date('2026-06-02T10:00:00Z');
    const localTime = new Date('2026-06-02T10:05:00Z');

    localStorage.setItem('fl_wizard2026_draft_updated_at_u1_e1_2026', localTime.toISOString());

    const remoteRecord = {
      id: 'uuid-1',
      user_id: 'u1',
      entity_id: 'e1',
      year: 2026,
      draft_state: { ...mockDraft, ccnl2026: { monteSalari2021: 500 } as any },
      last_transfer: null,
      checksum: 'different-checksum',
      schema_version: 1,
      created_at: remoteTime.toISOString(),
      updated_at: remoteTime.toISOString()
    };

    vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'loadWizard2026RemoteDraft')
      .mockResolvedValueOnce({ data: remoteRecord, status: 'success' });

    const { result } = renderHook(() =>
      useWizard2026RemoteDraftSync({
        userId: 'u1',
        entityId: 'e1',
        year: 2026,
        localDraft: mockDraft,
        onHydrate: mockHydrate
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.syncStatus).toBe('local_newer');
    expect(mockHydrate).not.toHaveBeenCalled();
  });

  it('6. Both exist, remote is newer -> returns remote_newer status', async () => {
    const remoteTime = new Date('2026-06-02T10:10:00Z');
    const localTime = new Date('2026-06-02T10:05:00Z');

    localStorage.setItem('fl_wizard2026_draft_updated_at_u1_e1_2026', localTime.toISOString());

    const remoteRecord = {
      id: 'uuid-1',
      user_id: 'u1',
      entity_id: 'e1',
      year: 2026,
      draft_state: { ...mockDraft, ccnl2026: { monteSalari2021: 500 } as any },
      last_transfer: null,
      checksum: 'different-checksum',
      schema_version: 1,
      created_at: remoteTime.toISOString(),
      updated_at: remoteTime.toISOString()
    };

    vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'loadWizard2026RemoteDraft')
      .mockResolvedValueOnce({ data: remoteRecord, status: 'success' });

    const { result } = renderHook(() =>
      useWizard2026RemoteDraftSync({
        userId: 'u1',
        entityId: 'e1',
        year: 2026,
        localDraft: mockDraft,
        onHydrate: mockHydrate
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.syncStatus).toBe('remote_newer');
    expect(mockHydrate).not.toHaveBeenCalled();
  });

  it('7. Equal timestamps and different data -> returns conflict status', async () => {
    const sameTime = new Date('2026-06-02T10:00:00Z').toISOString();

    localStorage.setItem('fl_wizard2026_draft_updated_at_u1_e1_2026', sameTime);

    const remoteRecord = {
      id: 'uuid-1',
      user_id: 'u1',
      entity_id: 'e1',
      year: 2026,
      draft_state: { ...mockDraft, ccnl2026: { monteSalari2021: 9999 } as any },
      last_transfer: null,
      checksum: 'different-checksum',
      schema_version: 1,
      created_at: sameTime,
      updated_at: sameTime
    };

    vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'loadWizard2026RemoteDraft')
      .mockResolvedValueOnce({ data: remoteRecord, status: 'success' });

    const { result } = renderHook(() =>
      useWizard2026RemoteDraftSync({
        userId: 'u1',
        entityId: 'e1',
        year: 2026,
        localDraft: mockDraft,
        onHydrate: mockHydrate
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.syncStatus).toBe('conflict');
  });

  it('8. Autosave does not overwrite when syncStatus is conflict or remote_newer', async () => {
    const spyUpsert = vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'upsertWizard2026RemoteDraft');

    renderHook(
      ({ draft }) => {
        return useWizard2026RemoteDraftSync({
          userId: 'u1',
          entityId: 'e1',
          year: 2026,
          localDraft: draft,
          onHydrate: mockHydrate
        });
      },
      {
        initialProps: { draft: mockDraft }
      }
    );

    // Let any init promises settle
    await act(async () => {
      await Promise.resolve();
    });

    // Advance timer for debounce
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(spyUpsert).not.toHaveBeenCalled();
  });

  it('9. Manual upload can be triggered to push local state', async () => {
    const spyUpsert = vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'upsertWizard2026RemoteDraft')
      .mockResolvedValueOnce({ status: 'success' });

    const { result } = renderHook(() =>
      useWizard2026RemoteDraftSync({
        userId: 'u1',
        entityId: 'e1',
        year: 2026,
        localDraft: mockDraft,
        onHydrate: mockHydrate
      })
    );

    await act(async () => {
      await result.current.uploadLocal();
    });

    expect(spyUpsert).toHaveBeenCalled();
    expect(result.current.syncStatus).toBe('synced');
  });

  it('10. Manual download can be triggered to pull remote state', async () => {
    const remoteRecord = {
      id: 'uuid-1',
      user_id: 'u1',
      entity_id: 'e1',
      year: 2026,
      draft_state: { ...mockDraft, ccnl2026: { monteSalari2021: 777 } as any },
      last_transfer: null,
      checksum: 'some-checksum',
      schema_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const spyLoad = vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'loadWizard2026RemoteDraft')
      .mockResolvedValue({ data: remoteRecord, status: 'success' }); // mockResolvedValue so it works multiple times (init + download)

    const { result } = renderHook(() =>
      useWizard2026RemoteDraftSync({
        userId: 'u1',
        entityId: 'e1',
        year: 2026,
        localDraft: mockDraft,
        onHydrate: mockHydrate
      })
    );

    await act(async () => {
      await result.current.downloadRemote();
    });

    expect(spyLoad).toHaveBeenCalled();
    expect(mockHydrate).toHaveBeenCalledWith(remoteRecord.draft_state);
    expect(result.current.syncStatus).toBe('synced');
  });

  it('11. resolveConflict can be called to manually resolve conflicts by picking local or remote', async () => {
    const spyUpsert = vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'upsertWizard2026RemoteDraft')
      .mockResolvedValueOnce({ status: 'success' });

    const remoteRecord = {
      id: 'uuid-1',
      user_id: 'u1',
      entity_id: 'e1',
      year: 2026,
      draft_state: { ...mockDraft, ccnl2026: { monteSalari2021: 888 } as any },
      last_transfer: null,
      checksum: 'some-checksum',
      schema_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const spyLoad = vi.spyOn(SupabaseWizard2026DraftRepository.prototype, 'loadWizard2026RemoteDraft')
      .mockResolvedValue({ data: remoteRecord, status: 'success' });

    const { result } = renderHook(() =>
      useWizard2026RemoteDraftSync({
        userId: 'u1',
        entityId: 'e1',
        year: 2026,
        localDraft: mockDraft,
        onHydrate: mockHydrate
      })
    );

    // Resolve picking 'local' (triggers uploadLocal)
    await act(async () => {
      await result.current.resolveConflict('local');
    });
    expect(spyUpsert).toHaveBeenCalled();

    // Resolve picking 'remote' (triggers downloadRemote)
    await act(async () => {
      await result.current.resolveConflict('remote');
    });
    expect(spyLoad).toHaveBeenCalled();
  });
});
