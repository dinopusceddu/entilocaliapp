import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../src/services/supabase', () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }));
import { supabase } from '../../src/services/supabase';
import { SupabaseStateRepository } from '../../src/infrastructure/persistence/SupabaseStateRepository';
import { DraftConcurrencyController } from '../../src/application/snapshots/DraftConcurrencyController';
import { ABSENT_VERSION, absentBaseline } from '../../src/application/snapshots/versionedSnapshotContract';
import { createEmptyFundData } from '../../src/domain/emptyFund';

const entity='11111111-1111-4111-8111-111111111111', owner='22222222-2222-4222-8222-222222222222';
const year=2026, version='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const key={entity_id:entity,current_year:year};
const fund=()=>({...createEmptyFundData(year,'Ente artificiale'),metadata:{snapshotStatus:'OPEN'}});
const payload=()=>({...key,user_id:owner,email:null,role:'USER',fund_data:fund(),b1i4_expected:ABSENT_VERSION});
const collision=(details:any=null)=>({code:'23505',message:'duplicate key value violates unique constraint "user_app_state_pkey"',details,hint:null});
let q:any;
beforeEach(()=>{
 vi.clearAllMocks();
 q={insert:vi.fn(),update:vi.fn(),select:vi.fn(),eq:vi.fn(),maybeSingle:vi.fn()};
 for(const k of ['insert','update','select','eq'])q[k].mockReturnValue(q);
 vi.mocked(supabase.from).mockReturnValue(q);
});
function response(cause:any,row:any=key,error:any=null){
 q.maybeSingle.mockResolvedValueOnce({data:null,error:cause}).mockResolvedValueOnce({data:row,error});
}
describe('RUNTIME-23505 conservative source regression',()=>{
 it('confirms details:null against a visible exact key after the failed INSERT',async()=>{
  const cause=collision();response(cause);
  const r=await new SupabaseStateRepository().createState(payload());
  expect(r.error.code).toBe('STATE_CONCURRENT_CREATION');expect(r.error.cause).toBe(cause);
  expect(r.data).toBeUndefined();expect(q.insert).toHaveBeenCalledTimes(1);expect(q.update).not.toHaveBeenCalled();
  expect(q.select.mock.calls).toEqual([['entity_id,current_year,user_id,email,role,fund_data,updated_at,b1i4_version,b1i4_expected'],['entity_id,current_year']]);
  expect(q.eq.mock.calls).toEqual([['entity_id',entity],['current_year',year]]);
  expect(q.maybeSingle).toHaveBeenCalledTimes(2);
 });
 it('accepts an omitted detail only after exact-key confirmation',async()=>{
  const cause=collision(undefined);cause.details=undefined;response(cause);
  expect((await new SupabaseStateRepository().createState(payload())).error.code).toBe('STATE_CONCURRENT_CREATION');
 });
 it('preserves detailed same-key classification without a follow-up read',async()=>{
  const cause=collision('Key (entity_id, current_year)=('+entity+', 2026) already exists.');response(cause);
  const r=await new SupabaseStateRepository().createState(payload());
  expect(r.error.code).toBe('STATE_CONCURRENT_CREATION');expect(r.error.cause).toBe(cause);
  expect(q.maybeSingle).toHaveBeenCalledTimes(1);
 });
 it.each([
  {message:'duplicate key value violates unique constraint "another_key"'},
  {message:'unrecognized envelope'},
  {details:'Key (entity_id, current_year)=(foreign, 2026) already exists.'},
  {details:'Key (entity_id, current_year)=('+entity+', 2027) already exists.'},
  {details:'Key (user_id)=('+owner+') already exists.'},
  {details:''}
 ])('does not reclassify another constraint/key/unrecognized envelope %j',async change=>{
  const cause={...collision(),...change};response(cause);
  expect((await new SupabaseStateRepository().createState(payload())).error).toBe(cause);
  expect(q.maybeSingle).toHaveBeenCalledTimes(1);
 });
 it.each([null,[],{...key,current_year:2027},{...key,entity_id:owner}])('rejects unconfirmed identity %j',async row=>{
  const cause=collision();response(cause,row);
  expect((await new SupabaseStateRepository().createState(payload())).error).toBe(cause);
  expect(q.insert).toHaveBeenCalledTimes(1);expect(q.update).not.toHaveBeenCalled();
 });
 it('keeps original 23505 when RLS/read permission prevents confirmation',async()=>{
  const cause=collision();response(cause,null,{code:'42501',message:'synthetic denial'});
  expect((await new SupabaseStateRepository().createState(payload())).error).toBe(cause);
 });
 it('keeps original 23505 if confirmation transport fails',async()=>{
  const cause=collision();q.maybeSingle.mockResolvedValueOnce({data:null,error:cause}).mockRejectedValueOnce(new Error('synthetic transport'));
  expect((await new SupabaseStateRepository().createState(payload())).error).toBe(cause);
 });
 it.each([{entity_id:'invalid'},{current_year:'2026'},{current_year:NaN}])('requires a valid resource identity %j',async change=>{
  const cause=collision();response(cause);
  expect((await new SupabaseStateRepository().createState({...payload(),...change})).error).toBe(cause);
  expect(q.maybeSingle).toHaveBeenCalledTimes(1);
 });
 it('never applies the INSERT classifier to UPDATE',async()=>{
  response(collision());
  const r=await new SupabaseStateRepository().upsertState({...payload(),b1i4_expected:version});
  expect(r.error.code).toBe('STATE_PERSISTENCE_ERROR');expect(q.update).toHaveBeenCalledTimes(1);
  expect(q.insert).not.toHaveBeenCalled();expect(q.maybeSingle).toHaveBeenCalledTimes(1);
 });
 it.each(['42501','XX000'])('preserves non-23505 behavior without a confirmation SELECT %s',async code=>{
  response({code,message:'synthetic'});
  const r=await new SupabaseStateRepository().createState(payload());
  expect(r.error.code).toBe(code==='42501'?'STATE_PERMISSION_DENIED':'STATE_PERSISTENCE_ERROR');
  expect(q.maybeSingle).toHaveBeenCalledTimes(1);
 });
 it('accepts a canonical all-zero resource UUID without treating it as a version token',async()=>{
  const zero='00000000-0000-0000-0000-000000000000',cause=collision();
  response(cause,{entity_id:zero,current_year:year});
  const r=await new SupabaseStateRepository().createState({...payload(),entity_id:zero});
  expect(r.error.code).toBe('STATE_CONCURRENT_CREATION');expect(r.error.cause).toBe(cause);
  expect(q.insert).toHaveBeenCalledTimes(1);expect(q.update).not.toHaveBeenCalled();
 });
 it('keeps draft, dirty state, original absence baseline and a retry latch',async()=>{
  const values=fund(),controller=new DraftConcurrencyController();
  controller.hydrate(absentBaseline(owner,entity,year),values);controller.touch();
  const attempt=controller.begin(owner,entity,year,values),cause=collision();response(cause);
  const result=await new SupabaseStateRepository().createState(payload());
  controller.fail(attempt,result.error);
  expect(controller.current?.values).toEqual(values);expect(controller.current?.dirty).toBe(true);
  expect(controller.current?.baseline).toEqual(absentBaseline(owner,entity,year));
  expect(controller.current?.status).toBe('conflicted');expect(controller.current?.error?.cause).toBe(cause);
  expect(()=>controller.begin(owner,entity,year,values)).toThrow(/creata da un’altra sessione/);
  expect(q.insert).toHaveBeenCalledTimes(1);expect(q.update).not.toHaveBeenCalled();
 });
});
