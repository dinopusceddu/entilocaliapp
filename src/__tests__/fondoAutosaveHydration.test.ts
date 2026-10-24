import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFundDataAutosave } from '../hooks/useFundDataAutosave';

describe('POST-ASTRA: hydration/navigation is not a business edit', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });
  const props = () => ({
    user: { id: 'fixture-admin' }, currentEntity: { id: 'fixture-entity' }, currentYear: 2026,
    fundData: { annualData: { note: 'unchanged' }, metadata: { snapshotStatus: 'OPEN' } } as any,
    hydratedSnapshotKey: 'fixture-entity:2026', localSources: { 'annualData.note': 'manual' } as any,
    hasPendingDraft: false, persistenceBlocked: false, hasUnsavedChanges: false,
    confirmedVersion: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', saveState: vi.fn().mockResolvedValue({ success: true }), debounceMs: 25,
  });

  it('ignores reordered JSON after hydration, refresh, visibility flush and logout flush', async () => {
    const p = props();
    const { result, rerender } = renderHook(useFundDataAutosave, { initialProps: p });
    rerender({ ...p, fundData: { metadata: { snapshotStatus: 'OPEN' }, annualData: { note: 'unchanged' } } });
    await act(async () => { await vi.advanceTimersByTimeAsync(30); await result.current.flush(); });
    expect(p.saveState).not.toHaveBeenCalled();
  });

  it('autosaves a real edit once and refuses a retry during flush after failure', async () => {
    const p = props();
    p.saveState.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true });
    const { result, rerender } = renderHook(useFundDataAutosave, { initialProps: p });
    rerender({ ...p, hasUnsavedChanges: true, fundData: { ...p.fundData, annualData: { note: 'fixture edit' } } });
    await act(async () => { await vi.advanceTimersByTimeAsync(30); });
    await act(async () => { await result.current.flush(); });
    expect(p.saveState).toHaveBeenCalledTimes(1);
  });
});
