// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { DraftConcurrencyController } from '../../src/application/snapshots/DraftConcurrencyController';
import { baselineFromRow, StatePersistenceError } from '../../src/application/snapshots/versionedSnapshotContract';
import { useFundDataAutosave } from '../../src/hooks/useFundDataAutosave';
import { createEmptyFundData } from '../../src/domain/emptyFund';
const v1 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const v2 = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const actor = 'synthetic-principal';
const entity = 'synthetic-entity';
const fund = () => { const value = createEmptyFundData(2026, 'Ente artificiale'); value.metadata = { snapshotStatus: 'OPEN' }; return value; };
const row = (version = v1, values = fund()) => ({ entity_id:entity,current_year:2026,user_id:'historical-owner',
  role:'GUEST',email:null,b1i4_version:version,b1i4_expected:null,fund_data:values });
function loaded() {
  const c = new DraftConcurrencyController();
  const values = fund(); c.hydrate(baselineFromRow(actor,row(v1,values)),values); return c;
}
const change = () => { const value = fund(); value.annualData.denominazioneEnte = 'Modifica locale'; return value; };
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe('draft controller actual source units; not HTTP/end-to-end proof', () => {
  it('captures the hydration version, principal and key with the draft', () => {
    const c = loaded(); const a = c.begin(actor,entity,2026,change());
    expect(a.baseline.version).toBe(v1); expect(a.baseline.principalId).toBe(actor);
    expect(a.baseline.entityId).toBe(entity); expect(a.baseline.year).toBe(2026);
  });
  it('does not attach a version from another principal or year', () => {
    const c = loaded();
    expect(() => c.begin('other',entity,2026,change())).toThrow();
    expect(() => c.begin(actor,entity,2027,change())).toThrow();
    expect(c.baselineFor(actor,'other',2026)).toBeUndefined();
  });
  it('preserves dirty values, original version, technical cause and blocks retry', () => {
    const c = loaded(); const values = change(); const a = c.begin(actor,entity,2026,values);
    const cause = { code:'P0001',message:'STATE_VERSION_CONFLICT' }; c.fail(a,cause);
    expect(c.current?.values).toEqual(values); expect(c.current?.dirty).toBe(true);
    expect(c.current?.baseline.version).toBe(v1); expect(c.current?.error?.cause).toBe(cause);
    expect(() => c.begin(actor,entity,2026,values)).toThrow(); expect(c.retained[0].values).toEqual(values);
  });
  it('does not erase the sent override if an old UI render arrives after failure', () => {
    const c = loaded(); const values = change(); const a = c.begin(actor,entity,2026,values);
    c.fail(a,new StatePersistenceError('STATE_CONCURRENT_CREATION','conflitto'));
    c.observe(actor,entity,2026,fund());
    expect(c.current?.dirty).toBe(true); expect(c.retained.some(s => s.values.annualData.denominazioneEnte === 'Modifica locale')).toBe(true);
    expect(c.current?.baseline.version).toBe(v1);
  });
  it('refuses a destructive reload during a conflict', () => {
    const c = loaded(); const a = c.begin(actor,entity,2026,change());
    c.fail(a,new StatePersistenceError('STATE_VERSION_CONFLICT','conflitto'));
    expect(c.hydrate(baselineFromRow(actor,row(v2)),fund())).toBe(false);
    expect(c.current?.baseline.version).toBe(v1); expect(c.current?.dirty).toBe(true);
  });
  it('keeps edits made while the first request is in flight', () => {
    const c = loaded(); const first = change(); const a = c.begin(actor,entity,2026,first);
    const later = structuredClone(first); later.annualData.denominazioneEnte = 'Edit successivo';
    c.observe(actor,entity,2026,later);
    c.succeed(a,{success:true,baseline:baselineFromRow(actor,row(v2,first)),persistedRow:row(v2,first)});
    expect(c.current?.baseline.version).toBe(v2); expect(c.current?.dirty).toBe(true);
    expect(c.current?.values).toEqual(later);
    expect(c.begin(actor,entity,2026,later).baseline.version).toBe(v2);
  });
  it('clears dirty only for the exact acknowledged values and permits the next save', () => {
    const c = loaded(); const values = change(); const a = c.begin(actor,entity,2026,values);
    c.succeed(a,{success:true,baseline:baselineFromRow(actor,row(v2,values)),persistedRow:row(v2,values)});
    expect(c.current?.dirty).toBe(false);
    expect(c.begin(actor,entity,2026,values).baseline.version).toBe(v2);
  });
  it('rejects a second in-flight save without replacing the first request state', () => {
    const c = loaded(); c.begin(actor,entity,2026,change());
    expect(() => c.begin(actor,entity,2026,change())).toThrow();
    c.fail(undefined,new StatePersistenceError('STATE_SAVE_IN_PROGRESS','in corso'));
    expect(c.current?.status).toBe('saving'); expect(c.current?.error).toBeUndefined();
  });
  it('consults a new server version separately and only accepts it explicitly', () => {
    const c = loaded(); const original = change(); const a = c.begin(actor,entity,2026,original);
    c.fail(a,new StatePersistenceError('STATE_VERSION_CONFLICT','conflitto'));
    c.setReview(baselineFromRow(actor,row(v2)),fund());
    expect(c.current?.baseline.version).toBe(v1); expect(c.current?.values).toEqual(original);
    c.acceptReview();
    expect(c.current?.baseline.version).toBe(v2); expect(c.current?.dirty).toBe(false);
    expect(c.retained.some(s => s.values.annualData.denominazioneEnte === 'Modifica locale')).toBe(true);
  });
  it('cancels closure without conflict or losing intervening edits', () => {
    const c = loaded(); const session = c.current!; session.status = 'closing';
    c.cancelClosing(session); expect(session.status).toBe('saved'); expect(session.dirty).toBe(false);
    session.status = 'closing'; c.observe(actor,entity,2026,change());
    c.cancelClosing(session); expect(session.status).toBe('idle'); expect(session.dirty).toBe(true);
    expect(c.isBlocked()).toBe(false); expect(session.baseline.version).toBe(v1);
  });
  it('keeps legacy drafts consultable without assigning a fresh server token', () => {
    const c = loaded(); const legacy = {...c.current!.baseline,version:null};
    c.retainExternal(legacy,change()); expect(c.retained[0].baseline.version).toBeNull();
    expect(c.current?.baseline.version).toBe(v1);
  });
  it('archives pending work on principal invalidation and filters copies by principal', () => {
    const c = loaded(); c.observe(actor,entity,2026,change()); c.invalidate();
    expect(c.current).toBeUndefined(); expect(c.visibleRetained(actor)).toHaveLength(1);
    expect(c.visibleRetained('other')).toHaveLength(0);
  });
  it.each(['STATE_CLOSED','STATE_NOT_FOUND','STATE_PERMISSION_DENIED','STATE_OUTCOME_UNKNOWN'] as const)(
    'retains the draft after %s without optimistic success', code => {
      const c = loaded(); const a = c.begin(actor,entity,2026,change());
      c.fail(a,new StatePersistenceError(code,'Non salvato'));
      expect(c.current?.dirty).toBe(true); expect(c.current?.baseline.version).toBe(v1);
      expect(c.isBlocked()).toBe(true);
    });
});
describe('autosave source hook units; simulated transport only', () => {
  const props = (saveState:any) => ({
    user:{id:actor},currentEntity:{id:entity},currentYear:2026,fundData:fund(),
    hydratedSnapshotKey:entity+':2026',localSources:{field:'manual' as const},
    hasPendingDraft:false,persistenceBlocked:false,hasUnsavedChanges:true,confirmedVersion:v1,saveState,debounceMs:200
  });
  it('returns failure to the navigation caller instead of swallowing it', async () => {
    const save = vi.fn().mockResolvedValue({success:false,reason:'STATE_VERSION_CONFLICT',error:'conflitto'});
    const h = renderHook(() => useFundDataAutosave(props(save)));
    let result:any; await act(async () => {result = await h.result.current.flush();});
    expect(result.success).toBe(false); expect(save).toHaveBeenCalledTimes(1);
  });
  it('does not retry a latched conflict after another timer or flush', async () => {
    vi.useFakeTimers(); const save = vi.fn().mockResolvedValue({success:false});
    const h = renderHook(p => useFundDataAutosave(p),{initialProps:props(save)});
    await act(async () => {await h.result.current.flush();});
    h.rerender({...props(save),persistenceBlocked:true});
    await act(async () => {await vi.advanceTimersByTimeAsync(1000);await h.result.current.flush();});
    expect(save).toHaveBeenCalledTimes(1);
  });
  it('permits a save only after explicit reconciliation even with the same server version', async () => {
    const save = vi.fn().mockResolvedValueOnce({success:false}).mockResolvedValue({success:true});
    const h = renderHook(p => useFundDataAutosave(p),{initialProps:{...props(save),reconciliationKey:0}});
    await act(async () => {await h.result.current.flush();await h.result.current.flush();});
    expect(save).toHaveBeenCalledTimes(1);
    h.rerender({...props(save),reconciliationKey:1});
    await act(async () => {await h.result.current.flush();});
    expect(save).toHaveBeenCalledTimes(2);
  });
  it('does not relatch a new principal after a late failure from the old generation', async () => {
    let resolveOld!: (value: any) => void;
    const save = vi.fn().mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }))
      .mockResolvedValue({success:true});
    const h = renderHook(p => useFundDataAutosave(p),{initialProps:props(save)});
    let old!: Promise<any>; act(() => { old = h.result.current.flush(); });
    // Same entity/year/version but a different principal must be a distinct authority scope.
    h.rerender({...props(save),user:{id:'second-principal'}});
    await act(async () => { resolveOld({success:false,reason:'STATE_VERSION_CONFLICT'}); await old; });
    let result:any; await act(async () => { result = await h.result.current.flush(); });
    expect(result.success).toBe(true); expect(save).toHaveBeenCalledTimes(2);
  });
  it('does not mutate on beforeunload or visibilitychange', async () => {
    const save = vi.fn().mockResolvedValue({success:true}); renderHook(() => useFundDataAutosave(props(save)));
    window.dispatchEvent(new Event('beforeunload')); document.dispatchEvent(new Event('visibilitychange'));
    expect(save).not.toHaveBeenCalled();
  });
  it('never calls persistence for a CLOSED snapshot', async () => {
    const save = vi.fn(); const p = props(save); p.fundData.metadata!.snapshotStatus = 'CLOSED' as any;
    const h = renderHook(() => useFundDataAutosave(p));
    let result:any; await act(async()=>{result=await h.result.current.flush();});
    expect(result.success).toBe(false);expect(save).not.toHaveBeenCalled();
  });
  it('rejects a mismatched hydration key', async () => {
    const save = vi.fn(); const h = renderHook(() => useFundDataAutosave({...props(save),hydratedSnapshotKey:'foreign:2026'}));
    let result:any; await act(async()=>{result=await h.result.current.flush();});
    expect(result.success).toBe(false); expect(save).not.toHaveBeenCalled();
  });
});
