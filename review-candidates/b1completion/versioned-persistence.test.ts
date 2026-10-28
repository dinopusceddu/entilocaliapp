import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../src/services/supabase', () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }));
import { supabase } from '../../src/services/supabase';
import { SupabaseStateRepository } from '../../src/infrastructure/persistence/SupabaseStateRepository';
import { SupabaseEntityRepository } from '../../src/infrastructure/persistence/SupabaseEntityRepository';
import { initializeAnnualSnapshot } from '../../src/application/snapshots/snapshotWorkflow';
import { saveAppStateWorkflow } from '../../src/application/stateWorkflow';
import { baselineFromRow, ABSENT_VERSION } from '../../src/application/snapshots/versionedSnapshotContract';
import { createEmptyFundData } from '../../src/domain/emptyFund';
import { UserRole } from '../../src/domain';

const entity = '11111111-1111-4111-8111-111111111111';
const owner = '22222222-2222-4222-8222-222222222222';
const actor = '33333333-3333-4333-8333-333333333333';
const v1 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const v2 = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const fund = () => { const value = createEmptyFundData(2026, 'Ente artificiale'); value.metadata = { snapshotStatus: 'OPEN' }; return value; };
const row = (version = v2) => ({ entity_id: entity, current_year: 2026, user_id: owner,
  email: null, role: 'GUEST', fund_data: fund(), b1i4_version: version, b1i4_expected: null, updated_at: '2026-10-23T00:00:00Z' });
let q: any;
beforeEach(() => {
  vi.clearAllMocks();
  q = { select: vi.fn(), eq: vi.fn(), insert: vi.fn(), update: vi.fn(), order: vi.fn(), range: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: row(), error: null }) };
  for (const key of ['select','eq','insert','update','order','range']) q[key].mockReturnValue(q);
  vi.mocked(supabase.from).mockReturnValue(q);
});
const write = (expected = v1) => ({ ...row(), b1i4_expected: expected });
describe('versioned persistence source units: NOT HTTP qualification', () => {
  it('sends loaded expected UUID in the UPDATE without a preceding SELECT', async () => {
    const result = await new SupabaseStateRepository().upsertState(write());
    expect(result.error).toBeNull(); expect(result.version).toBe(v2);
    expect(q.update).toHaveBeenCalledWith(write());
    expect(q.select).toHaveBeenCalledTimes(1);
    expect(q.eq.mock.calls).toEqual([['entity_id',entity],['current_year',2026]]);
  });
  it('chooses INSERT only for explicit known absence', async () => {
    const result = await new SupabaseStateRepository().upsertState(write(ABSENT_VERSION));
    expect(result.error).toBeNull(); expect(q.insert).toHaveBeenCalledTimes(1);
    expect(q.update).not.toHaveBeenCalled();
  });
  it('rejects missing version before contacting the adapter', async () => {
    const result = await new SupabaseStateRepository().upsertState({ ...write(), b1i4_expected: undefined });
    expect(result.error.code).toBe('STATE_VERSION_REQUIRED'); expect(supabase.from).not.toHaveBeenCalled();
  });
  it('does not confirm a zero-row mutation', async () => {
    q.maybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await new SupabaseStateRepository().upsertState(write());
    expect(result.error.code).toBe('STATE_WRITE_NOT_CONFIRMED');
  });
  it('does not confirm an unrotated token', async () => {
    q.maybeSingle.mockResolvedValue({ data: row(v1), error: null });
    expect((await new SupabaseStateRepository().upsertState(write())).error.code).toBe('STATE_WRITE_NOT_CONFIRMED');
  });
  it('keeps server-side version conflict distinct', async () => {
    const cause = { code: 'P0001', message: 'STATE_VERSION_CONFLICT' };
    q.maybeSingle.mockResolvedValue({ data: null, error: cause });
    const r = await new SupabaseStateRepository().upsertState(write());
    expect(r.error.code).toBe('STATE_VERSION_CONFLICT'); expect(r.error.cause).toBe(cause);
  });
  const relevant = { code: '23505', message: 'duplicate key value violates unique constraint "user_app_state_pkey"',
    details: 'Key (entity_id, current_year)=(' + entity + ', 2026) already exists.' };
  it('classifies only the documented same-annuality collision and preserves cause', async () => {
    q.maybeSingle.mockResolvedValue({ data: null, error: relevant });
    const r = await new SupabaseStateRepository().upsertState(write(ABSENT_VERSION));
    expect(r.error.code).toBe('STATE_CONCURRENT_CREATION'); expect(r.error.cause).toBe(relevant);
    expect(q.insert).toHaveBeenCalledTimes(1); expect(q.update).not.toHaveBeenCalled();
  });
  it.each([
    { ...relevant, message: 'duplicate key value violates unique constraint "another_key"' },
    { ...relevant, details: 'Key (entity_id, current_year)=(foreign, 2026) already exists.' },
    { ...relevant, details: 'Key (entity_id, current_year)=(' + entity + ', 2027) already exists.' },
    { ...relevant, details: undefined }, { ...relevant, message: 'unrecognized envelope' }
  ])('does not reinterpret an unrelated/unrecognized 23505: %j', async cause => {
    q.maybeSingle.mockResolvedValue({ data: null, error: cause });
    expect((await new SupabaseStateRepository().upsertState(write(ABSENT_VERSION))).error).toBe(cause);
  });
  it.each([
    ['42501', 'STATE_PERMISSION_DENIED'], ['23514','STATE_PERMISSION_DENIED'], ['XX000','STATE_PERSISTENCE_ERROR']
  ])('preserves denial/error without retry %s', async (code, expected) => {
    q.maybeSingle.mockResolvedValue({ data: null, error: { code, message: 'synthetic' } });
    expect((await new SupabaseStateRepository().upsertState(write())).error.code).toBe(expected);
    expect(q.update).toHaveBeenCalledTimes(1);
  });
  it('distinguishes empty GET from cardinality error', async () => {
    const repo = new SupabaseStateRepository();
    q.maybeSingle.mockResolvedValue({ data: null, error: { code:'PGRST116', details:'The result contains 0 rows' } });
    expect((await repo.getState(owner, entity, 2026)).error).toBeNull();
    for (const count of [1, 2, 10, 20]) {
      q.maybeSingle.mockResolvedValue({ data: null, error: { code:'PGRST116', details:'The result contains ' + count + ' rows' } });
      expect((await repo.getState(owner, entity, 2026)).error.code).toBe('PGRST116');
    }
  });
  it('uses versioned DELETE and confirms exactly one row', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data:{success:true,deleted:1},error:null } as any);
    const r = await new SupabaseStateRepository().deleteState(entity,2026,v1);
    expect(r.error).toBeNull();
    expect(supabase.rpc).toHaveBeenCalledWith('delete_annual_snapshot_versioned',{p_entity_id:entity,p_year:2026,p_version:v1});
    vi.mocked(supabase.rpc).mockResolvedValue({ data:{success:true,deleted:0},error:null } as any);
    expect((await new SupabaseStateRepository().deleteState(entity,2026,v1)).error.code).toBe('STATE_WRITE_NOT_CONFIRMED');
  });
  it('requires a complete entity version map including explicit empty map', async () => {
    const repo = new SupabaseEntityRepository();
    expect((await repo.delete(entity)).error.code).toBe('STATE_VERSION_REQUIRED');
    vi.mocked(supabase.rpc).mockResolvedValue({data:{success:true,deleted:1},error:null} as any);
    expect((await repo.delete(entity,{})).error).toBeNull();
    expect(supabase.rpc).toHaveBeenCalledWith('delete_entity_versioned',{p_entity_id:entity,p_versions:{}});
  });
  it('disables the old bulk delete path', async () => {
    expect((await new SupabaseStateRepository().deleteStatesByEntity(entity)).error.code).toBe('STATE_VERSION_REQUIRED');
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
  it('requires authoritative closure rows and both versions', async () => {
    const repo = new SupabaseStateRepository();
    const args = { entityId:entity,currentYear:2026,closedFundData:fund(),nextFundData:fund() };
    expect((await repo.closeYearAtomic(args)).error.code).toBe('STATE_VERSION_REQUIRED');
    vi.mocked(supabase.rpc).mockResolvedValue({data:{success:true,currentVersion:v2,nextVersion:v2},error:null} as any);
    expect((await repo.closeYearAtomic({...args,currentVersion:v1,nextVersion:null})).error.code).toBe('STATE_WRITE_NOT_CONFIRMED');
  });
  it('ADMIN uses the draft token and historical identity without fetching a fresh token', async () => {
    const before = row(v1); const next = fund(); next.annualData.denominazioneEnte = 'Modifica';
    const saved = {...row(),fund_data:next};
    const repo = { upsertState:vi.fn().mockResolvedValue({data:saved,error:null}),getState:vi.fn() };
    const r = await saveAppStateWorkflow({stateRepository:repo as any,entityRepository:{} as any},
      {id:actor,email:'admin@b1.invalid'},{id:entity,user_id:owner},2026,UserRole.ADMIN,next,async()=>{},baselineFromRow(actor,before));
    expect(r.success).toBe(true); expect(repo.getState).not.toHaveBeenCalled();
    expect(repo.upsertState.mock.calls[0][0]).toMatchObject({user_id:owner,role:'GUEST',email:null,b1i4_expected:v1});
  });
  it('cannot reuse a baseline under a different principal or key', async () => {
    const repo = {upsertState:vi.fn()};
    const r = await saveAppStateWorkflow({stateRepository:repo as any,entityRepository:{} as any},
      {id:actor},{id:entity,user_id:owner},2026,UserRole.ADMIN,fund(),async()=>{},baselineFromRow(owner,row(v1)));
    expect(r.success).toBe(false); expect(repo.upsertState).not.toHaveBeenCalled();
  });
  it('rejects CLOSED before persistence', async () => {
    const before = row(v1); before.fund_data.metadata!.snapshotStatus = 'CLOSED' as any;
    const repo = {upsertState:vi.fn()};
    const r = await saveAppStateWorkflow({stateRepository:repo as any,entityRepository:{} as any},
      {id:owner},{id:entity,user_id:owner},2026,UserRole.GUEST,fund(),async()=>{},baselineFromRow(owner,before));
    expect(r.reason).toBe('STATE_CLOSED'); expect(repo.upsertState).not.toHaveBeenCalled();
  });
});

describe('initialization fails closed on an unverified owner role', () => {
  it.each([null, '', 'unknown'])('does not create for role %s', async role => {
    const repo = { createState:vi.fn() };
    const result = await initializeAnnualSnapshot(
      {stateRepository:repo as any,userRepository:{getUserRole:vi.fn().mockResolvedValue({data:role,error:null})}},
      owner,entity,2026,{id:actor,email:'actor@b1.invalid'},fund());
    expect(result.success).toBe(false);
    expect(repo.createState).not.toHaveBeenCalled();
  });
});

describe('new annuality actual initializer with server-shaped OPEN admission', () => {
 it('creates OPEN from the real empty constructor, without rewriting the input', async () => {
  const defaults=createEmptyFundData(2026,'Ente artificiale');
  const original=structuredClone(defaults);
  const repo={createState:vi.fn(async (data:any)=>data.fund_data?.metadata?.snapshotStatus!=='OPEN'
   ? {error:{code:'P0001',message:'STATE_NOT_OPEN'}}
   : {data:{...data,b1i4_expected:null,b1i4_version:v1},error:null})};
  const result=await initializeAnnualSnapshot(
   {stateRepository:repo as any,userRepository:{getUserRole:vi.fn().mockResolvedValue({data:'GUEST',error:null})}},
   owner,entity,2026,{id:actor,email:'actor@b1.invalid'},defaults);
  expect(result.success).toBe(true);
  expect(repo.createState.mock.calls[0][0].fund_data.metadata.snapshotStatus).toBe('OPEN');
  expect(defaults).toEqual(original);
 });
});

describe('conservative construction and uncertain transport',()=>{
 it.each(['CLOSED','OTHER',null])('does not normalize an explicit historical initial state %s',async status=>{
  const defaults={...createEmptyFundData(2026,'Ente artificiale'),metadata:{snapshotStatus:status}} as any;
  const repo={createState:vi.fn()};const original=structuredClone(defaults);
  const result=await initializeAnnualSnapshot({stateRepository:repo as any,userRepository:{getUserRole:vi.fn().mockResolvedValue({data:'GUEST',error:null})}},
   owner,entity,2026,{id:actor},defaults);
  expect(result.success).toBe(false);expect(repo.createState).not.toHaveBeenCalled();expect(defaults).toEqual(original);
 });
 it('retains a rejected transport as an uncertain outcome with no implicit retry',async()=>{
  const cause=new Error('Synthetic response lost after a possible commit');
  q.maybeSingle.mockRejectedValueOnce(cause);
  const result=await new SupabaseStateRepository().upsertState(write());
  expect(result.error.code).toBe('STATE_OUTCOME_UNKNOWN');expect(result.error.cause).toBe(cause);
  expect(q.update).toHaveBeenCalledTimes(1);expect(q.maybeSingle).toHaveBeenCalledTimes(1);
 });
});
