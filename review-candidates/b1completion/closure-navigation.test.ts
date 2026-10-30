import { beforeEach, describe, expect, it, vi } from 'vitest';
// These are source orchestration units. The SQL economic implementation is exercised separately.
vi.mock('../../src/logic/calculation/fundEngine', () => ({ calculateFundCompletely: vi.fn(() => ({})) }));
vi.mock('../../src/logic/calculation/closureCalculations', () => ({
  calculateYearClosureCarryForward: vi.fn(() => ({leftoverFad:0,actualLeftoversInfo:{eq:0,dir:0,seg:0}}))
}));
import { closeYearAndPrepareNext } from '../../src/application/yearClosureWorkflow';
import { yearManagementWorkflow, entityManagementWorkflow } from '../../src/application/stateWorkflow';
import { baselineFromRow } from '../../src/application/snapshots/versionedSnapshotContract';
import { createEmptyFundData } from '../../src/domain/emptyFund';
import { UserRole } from '../../src/domain';
const v1='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', v2='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const actor={id:'artificial-user',email:'user@b1.invalid',role:UserRole.GUEST};
const entity={id:'artificial-entity',user_id:actor.id,name:'Ente artificiale'};
const row=(year:number,status='OPEN',version=v1)=>({entity_id:entity.id,current_year:year,
 user_id:actor.id,email:null,role:'GUEST',b1i4_version:version,b1i4_expected:null,
 fund_data:{...createEmptyFundData(year,entity.name),metadata:{snapshotStatus:status}}});
let deps:any;
beforeEach(()=>{
 deps={stateRepository:{getState:vi.fn().mockResolvedValue({data:row(2027),error:null}),
 closeYearAtomic:vi.fn().mockResolvedValue({data:{success:true,currentVersion:v2,nextVersion:v2,
 currentSnapshot:row(2026,'CLOSED',v2),nextSnapshot:row(2027,'OPEN',v2)},error:null}),
 deleteState:vi.fn().mockResolvedValue({data:{success:true,deleted:1},error:null}),
 getStateVersions:vi.fn().mockResolvedValue({data:{2026:v1},error:null})},
 entityRepository:{delete:vi.fn().mockResolvedValue({data:{success:true,deleted:1},error:null})},
 userRepository:{},interactionService:{confirm:vi.fn().mockResolvedValue(true),alert:vi.fn(),reload:vi.fn()}};
});
// This suite stubs economics: provide the explicit administrative decision that
// the real closure gate requires, rather than bypassing it through the engine mock.
const closureDraft=()=>{const data=createEmptyFundData(2026,entity.name);data.annualData.art33ManualDecision='DO_NOT_APPLY';return data;};
const close=()=>closeYearAndPrepareNext(deps,actor,entity,2026,UserRole.GUEST,
 closureDraft(),{} as any,createEmptyFundData(2027,entity.name),
 entity.id+':2026',baselineFromRow(actor.id,row(2026)));
describe('versioned closure source orchestration; transport simulated',()=>{
 it('uses the current hydrated version and captures next version before explicit confirmation',async()=>{
  const r=await close();expect(r.success).toBe(true);
  expect(deps.stateRepository.getState).toHaveBeenCalledTimes(1);
  expect(deps.stateRepository.getState.mock.calls[0][2]).toBe(2027);
  expect(deps.interactionService.confirm).toHaveBeenCalledTimes(1);
  expect(deps.stateRepository.closeYearAtomic.mock.calls[0][0]).toMatchObject({currentVersion:v1,nextVersion:v1});
  expect(r.currentVersion).toBe(v2);expect(r.currentSnapshot.b1i4_version).toBe(v2);
 });
 it('permits the SQL to validate next CLOSED without modifying that persisted snapshot',async()=>{
  const next=row(2027,'CLOSED');
  deps.stateRepository.getState.mockResolvedValue({data:next,error:null});
  const before=structuredClone(next);
  expect((await close()).success).toBe(true);expect(next).toEqual(before);
  expect(deps.stateRepository.closeYearAtomic).toHaveBeenCalledTimes(1);
 });
 it('preserves an incompatible CLOSED carry failure and does not compensate/reopen',async()=>{
  deps.stateRepository.getState.mockResolvedValue({data:row(2027,'CLOSED'),error:null});
  const cause={code:'P0003',message:'closed next carry mismatch'};
  deps.stateRepository.closeYearAtomic.mockResolvedValue({data:null,error:cause});
  const r=await close();expect(r.success).toBe(false);expect(r.technicalCause).toBe(cause);
  expect(deps.stateRepository.closeYearAtomic).toHaveBeenCalledTimes(1);
 });
 it('does not treat an error reading next as an absent next year',async()=>{
  deps.stateRepository.getState.mockResolvedValue({data:null,error:{code:'42501',message:'denied'}});
  expect((await close()).success).toBe(false);
  expect(deps.stateRepository.closeYearAtomic).not.toHaveBeenCalled();
 });
 it('passes explicit null only for a verified absent next year',async()=>{
  deps.stateRepository.getState.mockResolvedValue({data:null,error:null});
  expect((await close()).success).toBe(true);
  expect(deps.stateRepository.closeYearAtomic.mock.calls[0][0].nextVersion).toBeNull();
 });
 it('never calls the RPC after the decision is cancelled',async()=>{
  deps.interactionService.confirm.mockResolvedValue(false);
  const r=await close(); expect(r.success).toBe(false);expect(r.cancelled).toBe(true);
  expect(deps.stateRepository.closeYearAtomic).not.toHaveBeenCalled();
 });
 it('rejects an incomplete RPC success representation',async()=>{
  deps.stateRepository.closeYearAtomic.mockResolvedValue({data:{success:true},error:null});
  expect((await close()).success).toBe(false);
 });
 it('rejects an unversioned or already CLOSED current baseline',async()=>{
  const current=row(2026,'CLOSED');
  const r=await closeYearAndPrepareNext(deps,actor,entity,2026,UserRole.GUEST,
    createEmptyFundData(2026),{} as any,createEmptyFundData(2027),entity.id+':2026',
    baselineFromRow(actor.id,current));
  expect(r.success).toBe(false);expect(deps.stateRepository.closeYearAtomic).not.toHaveBeenCalled();
 });
});
describe('versioned deletion source orchestration; no HTTP proof',()=>{
 it('uses the active loaded UUID for a direct deletion and only refreshes after acknowledgement',async()=>{
  const refresh=vi.fn();
  const r=await yearManagementWorkflow.delete(deps,actor,entity.id,2026,2026,[2026],refresh,vi.fn(),
    baselineFromRow(actor.id,row(2026)));
  expect(r).toBe(true);expect(deps.stateRepository.getState).not.toHaveBeenCalled();
  expect(deps.stateRepository.deleteState).toHaveBeenCalledWith(entity.id,2026,v1);
  expect(refresh).toHaveBeenCalledTimes(1);
 });
 it('does not refresh/remove the view on stale deletion or RLS failure',async()=>{
  const refresh=vi.fn();deps.stateRepository.deleteState.mockResolvedValue({error:{code:'P0001',message:'STATE_VERSION_CONFLICT'}});
  expect(await yearManagementWorkflow.delete(deps,actor,entity.id,2026,2026,[2026],refresh,vi.fn(),
    baselineFromRow(actor.id,row(2026)))).toBe(false);expect(refresh).not.toHaveBeenCalled();
 });
 it('captures the exact complete entity version map before the approval decision',async()=>{
  const refresh=vi.fn();
  const r=await entityManagementWorkflow.delete(deps,actor,entity.id,entity,[entity],refresh,vi.fn(),{skipConfirm:true});
  expect(r).toBe(true);expect(deps.interactionService.confirm).toHaveBeenCalledTimes(1);
  expect(deps.entityRepository.delete).toHaveBeenCalledWith(entity.id,{'2026':v1});
 });
});
