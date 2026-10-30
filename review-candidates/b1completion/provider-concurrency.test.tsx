// @vitest-environment jsdom
import React, { useContext, useEffect } from 'react';
import { act, cleanup, renderHook, waitFor, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const f = vi.hoisted(() => ({
  actor:{id:'synthetic-user',email:'user@b1.invalid'},
  entity:{id:'synthetic-entity',user_id:'synthetic-user',name:'Ente artificiale'},
  stateRepo:{getState:vi.fn(),getAvailableYears:vi.fn(),upsertState:vi.fn(),createState:vi.fn(),closeYearAtomic:vi.fn(),deleteState:vi.fn(),getStateVersions:vi.fn()},
  entityRepo:{getAll:vi.fn(),create:vi.fn(),update:vi.fn(),delete:vi.fn()},
  userRepo:{getUserRole:vi.fn()},
  interaction:{confirm:vi.fn(),alert:vi.fn(),reload:vi.fn()},
  register:undefined as any,
  deferYears:false, waiting:false, resolveYears:undefined as any,
}));
vi.mock('../../src/contexts/AuthContext',()=>({useAuth:()=>({user:f.actor})}));
vi.mock('../../src/hooks/useNormativeData',()=>({useNormativeData:()=>({data:undefined})}));
vi.mock('../../src/infrastructure/persistence/SupabaseStateRepository',()=>({SupabaseStateRepository:vi.fn(function(){return f.stateRepo;})}));
vi.mock('../../src/infrastructure/persistence/SupabaseEntityRepository',()=>({SupabaseEntityRepository:vi.fn(function(){return f.entityRepo;})}));
vi.mock('../../src/infrastructure/persistence/SupabaseUserRepository',()=>({SupabaseUserRepository:vi.fn(function(){return f.userRepo;})}));
vi.mock('../../src/infrastructure/browser/BrowserInteractionService',()=>({BrowserInteractionService:vi.fn(function(){return f.interaction;})}));
vi.mock('../../src/services/supabase',()=>({supabase:{
 from:()=>{throw new Error('Unplanned transport prohibited in source unit');},
 rpc:()=>{throw new Error('Unplanned RPC prohibited in source unit');},
 auth:{}
}}));
vi.mock('../../src/logic/calculation/fundEngine',()=>({calculateFundCompletely:vi.fn(()=>({canonicalFund:{status:'VALID',total:100,missingPrerequisites:[],warnings:[]},compliance:{checks:[]}}))}));
vi.mock('../../src/logic/calculation/closureCalculations',()=>({calculateYearClosureCarryForward:vi.fn(()=>({leftoverFad:0,actualLeftoversInfo:{eq:0,dir:0,seg:0}}))}));
import { AppProvider, useAppContext } from '../../src/contexts/AppContext';
import { MonetaryDraftContext } from '../../src/components/shared/MonetaryInput';
import { createEmptyFundData } from '../../src/domain/emptyFund';
const version='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
function Probe({children}:{children:React.ReactNode}) {
 const register=useContext(MonetaryDraftContext);
 useEffect(()=>{f.register=register;},[register]);
 return <>{children}</>;
}
function Wrapper({children}:{children:React.ReactNode}) {
 return <AppProvider><Probe>{children}</Probe></AppProvider>;
}
beforeEach(()=>{
 vi.clearAllMocks();localStorage.clear();f.actor={id:'synthetic-user',email:'user@b1.invalid'};f.entity.user_id='synthetic-user';f.deferYears=false;f.waiting=false;f.register=undefined;
 f.entityRepo.getAll.mockResolvedValue({data:[f.entity],error:null});
 f.userRepo.getUserRole.mockResolvedValue({data:'GUEST',error:null});
 f.stateRepo.getState.mockImplementation(async (_user:any,entityId:string,year:number)=>({
  data:{entity_id:entityId,current_year:year,user_id:f.actor.id,email:null,role:'GUEST',
   fund_data:{...closureFixtureFund(year,f.entity.name),metadata:{snapshotStatus:'OPEN'}},b1i4_version:version,b1i4_expected:null,updated_at:'2026-10-23T00:00:00Z'},error:null}));
 f.stateRepo.getAvailableYears.mockImplementation(async ()=>{
  if(f.deferYears){f.waiting=true;return await new Promise(resolve=>{f.resolveYears=resolve;});}
  return {data:[{current_year:2026}],error:null};
 });
 f.interaction.confirm.mockResolvedValue(true);
 f.stateRepo.upsertState.mockImplementation(()=>{throw new Error('Unexpected save during guarded navigation');});
});
afterEach(()=>{cleanup();localStorage.clear();vi.useRealTimers();});
async function boot(){
 const h=renderHook(()=>useAppContext(),{wrapper:Wrapper});
 await waitFor(()=>expect(h.result.current.state.hydratedSnapshotKey).toBe(f.entity.id+':2026'));
 return h;
}
describe('provider real source orchestration with artificial repositories; NOT HTTP',()=>{
 it('IR03 retains an override even when a monetary issue rejects it before begin',async()=>{
  const h=await boot();await waitFor(()=>expect(f.register).toBeTypeOf('function'));
  act(()=>f.register('fixture.invalid',{path:'annualData.synthetic',code:'INVALID_NUMBER',message:'synthetic'}));
  const override=structuredClone(h.result.current.state.fundData);
  override.annualData.denominazioneEnte='Override da conservare';
  let result:any;await act(async()=>{result=await h.result.current.saveState(override);});
  expect(result.success).toBe(false);expect(result.reason).toBe('VALIDATION_ERROR');
  expect(h.result.current.persistence.retained.some(d=>d.values.annualData.denominazioneEnte==='Override da conservare')).toBe(true);
  expect(f.stateRepo.upsertState).not.toHaveBeenCalled();
 });
 it('IR04 rejects navigation if editing occurs while target years are in flight',async()=>{
  const h=await boot();f.deferYears=true;
  let navigation!:Promise<boolean>;
  act(()=>{navigation=h.result.current.switchYearAtomic(2027);});
  await waitFor(()=>expect(f.waiting).toBe(true));
  act(()=>h.result.current.dispatch({type:'UPDATE_ANNUAL_DATA',payload:{denominazioneEnte:'Edit durante il caricamento'}}));
  let switched:any;await act(async()=>{
   f.resolveYears({data:[{current_year:2027},{current_year:2026}],error:null});
   switched=await navigation;
  });
  expect(switched).toBe(false);expect(h.result.current.state.currentYear).toBe(2026);
  expect(h.result.current.state.hydratedSnapshotKey).toBe(f.entity.id+':2026');
  expect(h.result.current.state.fundData.annualData.denominazioneEnte).toBe('Edit durante il caricamento');
  expect(h.result.current.persistence.dirty).toBe(true);
  expect(JSON.parse(localStorage.getItem('fl_last_context_'+f.actor.id)!).year).toBe(2026);
  expect(f.stateRepo.upsertState).not.toHaveBeenCalled();
 });
});

const version2='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const version3='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
// Artificial economic boundary; retain an explicit administrative closure decision.
function closureFixtureFund(year:number,name:string){const data=createEmptyFundData(year,name);data.annualData.art33ManualDecision='DO_NOT_APPLY';return data;}
const openFund=(year=2026)=>({...closureFixtureFund(year,f.entity.name),metadata:{snapshotStatus:'OPEN'}});
const savedRow=(data:any,token=version2)=>({...structuredClone(data),b1i4_version:token,b1i4_expected:null,updated_at:'2026-10-23T01:00:00Z'});
function edit(h:any,name:string){act(()=>h.result.current.dispatch({type:'UPDATE_ANNUAL_DATA',payload:{denominazioneEnte:name}}));}
function allowWrites(){f.stateRepo.upsertState.mockImplementation(async (data:any)=>({data:savedRow(data),error:null}));}
function AmountControl(){
 const app=useAppContext();
 return <><input aria-label="Importo" value={app.state.fundData.fondoAccessorioDipendenteData.st_incrementoDL25_2025??''}
 onChange={e=>app.dispatch({type:'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA',payload:{st_incrementoDL25_2025:Number(e.target.value)}})}/>
 <output aria-label="Esito">{app.persistence.message||(app.persistence.dirty?'Modifiche da salvare':'Salvato')}</output>
 <output aria-label="Contesto">{app.state.hydratedSnapshotKey}</output></>;
}
describe('B1 executable React integration; real provider/reducer/hook/workflows, artificial repository/economic boundaries',()=>{
 it('S1 an OPEN amount edit debounces once and acknowledges the new version',async()=>{
  allowWrites();render(<Wrapper><AmountControl/></Wrapper>);
  await waitFor(()=>expect(screen.getByLabelText('Contesto').textContent).toBe(f.entity.id+':2026'));
  vi.useFakeTimers();
  fireEvent.change(screen.getByLabelText('Importo'),{target:{value:'100'}});
  expect(screen.getByLabelText('Esito').textContent).toBe('Modifiche da salvare');
  await act(async()=>{await vi.advanceTimersByTimeAsync(2100);});
  expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(1);
  expect(f.stateRepo.upsertState.mock.calls[0][0]).toMatchObject({b1i4_expected:version,fund_data:{fondoAccessorioDipendenteData:{st_incrementoDL25_2025:100}}});
  expect(screen.getByLabelText('Esito').textContent).toBe('Salvato');
  await act(async()=>{await vi.advanceTimersByTimeAsync(4000);});
  expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(1);
 });
 it('S2 two provider sessions preserve the rejected draft and reconcile only explicitly',async()=>{
  let persisted:any;
  f.stateRepo.upsertState.mockImplementation(async(data:any)=>{
   if(persisted && data.b1i4_expected!==persisted.b1i4_version)return {data:null,error:{code:'P0001',message:'STATE_VERSION_CONFLICT'}};
   persisted=savedRow(data,persisted?version3:version2);return {data:persisted,error:null};
  });
  const a=await boot(),b=await boot();edit(a,'Prima sessione');edit(b,'Seconda bozza');
  let ra:any,rb:any;
  await act(async()=>{ra=await a.result.current.saveState();rb=await b.result.current.saveState();});
  expect(ra.success).toBe(true);expect(rb.success).toBe(false);
  expect(persisted.fund_data.annualData.denominazioneEnte).toBe('Prima sessione');
  expect(b.result.current.state.fundData.annualData.denominazioneEnte).toBe('Seconda bozza');
  expect(b.result.current.persistence).toMatchObject({dirty:true,blocked:true});
  expect(b.result.current.persistence.message).toContain('conservate');
  const calls=f.stateRepo.upsertState.mock.calls.length;
  await act(async()=>{await b.result.current.saveState();});
  expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(calls);
  f.stateRepo.getState.mockResolvedValue({data:persisted,error:null});
  await act(async()=>{await b.result.current.reviewCurrentSnapshot();});
  expect(b.result.current.state.fundData.annualData.denominazioneEnte).toBe('Seconda bozza');
  expect(b.result.current.persistence.review.baseline.version).toBe(version2);
  await act(async()=>{await b.result.current.acceptReviewedSnapshot();});
  expect(b.result.current.state.snapshotBaseline?.version).toBe(version2);
  expect(b.result.current.persistence.retained.some(d=>d.values.annualData.denominazioneEnte==='Seconda bozza')).toBe(true);
  edit(b,'Riconciliazione esplicita');
  await act(async()=>{rb=await b.result.current.saveState();});
  expect(rb.success).toBe(true);expect(persisted.b1i4_version).toBe(version3);
 });
 it('S3 navigation waits for a successful flush, using the hydrated token',async()=>{
  const h=await boot();let resolve:any;
  f.stateRepo.upsertState.mockImplementation((data:any)=>new Promise(r=>{resolve=()=>r({data:savedRow(data),error:null});}));
  edit(h,'Prima di navigare');let pending!:Promise<boolean>;
  act(()=>{pending=h.result.current.switchYearAtomic(2027);});
  await waitFor(()=>expect(resolve).toBeTypeOf('function'));
  expect(h.result.current.state.currentYear).toBe(2026);
  expect(f.stateRepo.upsertState.mock.calls[0][0].b1i4_expected).toBe(version);
  let switched:any;await act(async()=>{resolve();switched=await pending;});
  expect(switched).toBe(true);expect(h.result.current.state.currentYear).toBe(2027);
 });
 it('D3 an acknowledgement cannot erase edits made while the request is in flight',async()=>{
  const h=await boot();let resolve:any;
  f.stateRepo.upsertState.mockImplementation((data:any)=>new Promise(r=>{resolve=()=>r({data:savedRow(data),error:null});}));
  edit(h,'Valore inviato');let pending!:Promise<any>;act(()=>{pending=h.result.current.saveState();});
  edit(h,'Modifica successiva');
  await act(async()=>{resolve();await pending;});
  expect(h.result.current.state.fundData.annualData.denominazioneEnte).toBe('Modifica successiva');
  expect(h.result.current.persistence.dirty).toBe(true);
  expect(h.result.current.state.snapshotBaseline?.version).toBe(version2);
  allowWrites();await act(async()=>{await h.result.current.saveState();});
  expect(f.stateRepo.upsertState.mock.calls[1][0].b1i4_expected).toBe(version2);
 });
 it('S5 an uncertain network outcome preserves dirty data and latches autosave/navigation',async()=>{
  const h=await boot();let committed:any;
  f.stateRepo.upsertState.mockImplementation(async(data:any)=>{committed=savedRow(data);throw new Error('Synthetic response lost after commit');});
  edit(h,'Bozza con esito incerto');let result:any;
  await act(async()=>{result=await h.result.current.saveState();});
  expect(result.success).toBe(false);expect(committed.fund_data.annualData.denominazioneEnte).toBe('Bozza con esito incerto');
  expect(h.result.current.persistence).toMatchObject({dirty:true,blocked:true});
  vi.useFakeTimers();await act(async()=>{await vi.advanceTimersByTimeAsync(5000);});
  let switched:any;await act(async()=>{switched=await h.result.current.switchYearAtomic(2027);});
  expect(switched).toBe(false);expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(1);
  expect(h.result.current.state.currentYear).toBe(2026);
 });
 it('S6 account change hides retained drafts and late write acknowledgement from the old account',async()=>{
  const h=await boot();let resolve:any;
  f.stateRepo.upsertState.mockImplementation((data:any)=>new Promise(r=>{resolve=()=>r({data:savedRow(data),error:null});}));
  edit(h,'Privato account precedente');let pending!:Promise<any>;act(()=>{pending=h.result.current.saveState();});
  f.actor={id:'second-account',email:'second@b1.invalid'};h.rerender();
  await waitFor(()=>expect(h.result.current.state.currentUser.id).toBe('second-account'));
  await act(async()=>{resolve();await pending;});
  expect(h.result.current.persistence.retained).toHaveLength(0);
  expect(h.result.current.state.fundData.annualData.denominazioneEnte).not.toBe('Privato account precedente');
  expect(h.result.current.state.snapshotBaseline?.principalId).not.toBe('synthetic-user');
  expect(JSON.stringify(localStorage)).not.toContain('Privato account precedente');
 });
 it('S7 beforeunload warns about memory-only work without initiating a save',async()=>{
  const h=await boot();edit(h,'Soltanto in memoria');
  const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);expect(f.stateRepo.upsertState).not.toHaveBeenCalled();
  expect(JSON.stringify(localStorage)).not.toContain('Soltanto in memoria');
 });
 it('D2 a late hydration from the previous principal cannot replace the new account draft',async()=>{
  const h=await boot();const originalGet=f.stateRepo.getState.getMockImplementation()!;
  let resolve:any;
  f.stateRepo.getState.mockImplementation((...args:any[])=>args[2]===2027
   ? new Promise(r=>{resolve=r;}) : originalGet(...args));
  let pending!:Promise<boolean>;act(()=>{pending=h.result.current.switchYearAtomic(2027);});
  await waitFor(()=>expect(resolve).toBeTypeOf('function'));
  f.actor={id:'new-principal',email:'new@b1.invalid'};h.rerender();
  await waitFor(()=>expect(h.result.current.state.currentUser.id).toBe('new-principal'));
  const late={entity_id:f.entity.id,current_year:2027,user_id:'synthetic-user',role:'GUEST',email:null,
   b1i4_version:version,b1i4_expected:null,fund_data:openFund(2027)};
  late.fund_data.annualData.denominazioneEnte='Risposta privata vecchia';
  await act(async()=>{resolve({data:late,error:null});await pending;});
  expect(h.result.current.state.fundData.annualData.denominazioneEnte).not.toBe('Risposta privata vecchia');
  expect(h.result.current.state.snapshotBaseline?.principalId).not.toBe('synthetic-user');
 });
 it('D2 a missing token is readable but cannot be promoted to a writable baseline',async()=>{
  const originalGet=f.stateRepo.getState.getMockImplementation()!;
  f.stateRepo.getState.mockImplementation(async(...args:any[])=>{
   const result=await originalGet(...args);return {...result,data:{...result.data,b1i4_version:null}};
  });
  const h=await boot();edit(h,'Bozza senza versione');let result:any;
  await act(async()=>{result=await h.result.current.saveState();});
  expect(result.success).toBe(false);expect(f.stateRepo.upsertState).not.toHaveBeenCalled();
  expect(h.result.current.persistence.dirty).toBe(true);
 });
});

function readyForClosure(h:any) {
 const requestContext={entityId:f.entity.id,year:2026,contextEpoch:h.result.current.state.calculationRuntime.contextEpoch,requestId:100};
 act(()=>{
  h.result.current.dispatch({type:'SET_NORMATIVE_DATA',payload:{} as any});
  h.result.current.dispatch({type:'CALCULATE_FUND_START',payload:{requestContext}});
  h.result.current.dispatch({type:'CALCULATE_FUND_SUCCESS',payload:{requestContext,
   result:{canonicalFund:{status:'VALID',total:100,missingPrerequisites:[],warnings:[]},compliance:{checks:[]}} as any,checks:[]}});
 });
 expect(h.result.current.closureReadiness.status).toBe('READY');
}
function closureSuccess(params:any) {
 return {data:{success:true,currentVersion:version3,nextVersion:version2,
  currentSnapshot:savedRow({entity_id:f.entity.id,current_year:2026,user_id:f.entity.user_id,email:null,role:'GUEST',fund_data:params.closedFundData},version3),
  nextSnapshot:savedRow({entity_id:f.entity.id,current_year:2027,user_id:f.entity.user_id,email:null,role:'GUEST',fund_data:params.nextFundData},version2)},error:null};
}
describe('React closure and DELETE integration; economic functions and persistence are explicitly artificial boundaries',()=>{
 it('S4 saves dirty work before the real closure workflow and never writes CLOSED afterward',async()=>{
  const h=await boot();allowWrites();edit(h,'Da chiudere');readyForClosure(h);
  f.stateRepo.closeYearAtomic.mockImplementation(async(params:any)=>{
   expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(1);
   expect(params.currentVersion).toBe(version2);expect(params.nextVersion).toBe(version);
   expect(params.closedFundData.annualData.denominazioneEnte).toBe('Da chiudere');
   return closureSuccess(params);
  });
  let result:any;await act(async()=>{result=await h.result.current.closeCurrentYear();});
  expect(result.success).toBe(true);expect(f.stateRepo.closeYearAtomic).toHaveBeenCalledTimes(1);
  expect(h.result.current.state.fundData.metadata?.snapshotStatus).toBe('CLOSED');
  const before=structuredClone(h.result.current.state.fundData);edit(h,'Modifica vietata');
  expect(h.result.current.state.fundData).toEqual(before);
  vi.useFakeTimers();await act(async()=>{await vi.advanceTimersByTimeAsync(5000);});
  expect(f.stateRepo.upsertState).toHaveBeenCalledTimes(1);
 });
 it('closure failure keeps the OPEN draft and does not fabricate an acknowledgement',async()=>{
  const h=await boot();allowWrites();edit(h,'Prima del conflitto chiusura');readyForClosure(h);
  f.stateRepo.closeYearAtomic.mockResolvedValue({data:null,error:{code:'P0001',message:'STATE_VERSION_CONFLICT'}});
  let result:any;await act(async()=>{result=await h.result.current.closeCurrentYear();});
  expect(result.success).toBe(false);expect(h.result.current.state.fundData.metadata?.snapshotStatus).toBe('OPEN');
  expect(h.result.current.persistence).toMatchObject({blocked:true,dirty:true});
  expect(h.result.current.state.snapshotBaseline?.version).toBe(version2);
 });
 it('closure cancellation does not latch a failure or issue a mutation',async()=>{
  const h=await boot();readyForClosure(h);f.interaction.confirm.mockResolvedValue(false);
  let result:any;await act(async()=>{result=await h.result.current.closeCurrentYear();});
  expect(result.cancelled).toBe(true);expect(f.stateRepo.closeYearAtomic).not.toHaveBeenCalled();
  expect(h.result.current.persistence.blocked).toBe(false);
  expect(h.result.current.state.fundData.metadata?.snapshotStatus).toBe('OPEN');
 });
 it('DELETE annuality sends the captured token and changes the view only after confirmation',async()=>{
  const h=await boot();f.stateRepo.deleteState.mockResolvedValue({data:{success:true,deleted:1},error:null});
  f.stateRepo.getAvailableYears.mockResolvedValue({data:[],error:null});
  let result:any;await act(async()=>{result=await h.result.current.deleteYear(f.entity.id,2026);});
  expect(result).toBe(true);expect(f.stateRepo.deleteState).toHaveBeenCalledWith(f.entity.id,2026,version);
  expect(h.result.current.state.hydratedSnapshotKey).toBeNull();
  expect(f.stateRepo.createState).not.toHaveBeenCalled();
 });
 it('DELETE failure and cancellation never remove the displayed annuality',async()=>{
  const h=await boot();f.stateRepo.deleteState.mockResolvedValue({error:{code:'P0001',message:'STATE_VERSION_CONFLICT'}});
  let result:any;await act(async()=>{result=await h.result.current.deleteYear(f.entity.id,2026);});
  expect(result).toBe(false);expect(h.result.current.state.hydratedSnapshotKey).toBe(f.entity.id+':2026');
  f.stateRepo.deleteState.mockClear();f.interaction.confirm.mockResolvedValue(false);
  await act(async()=>{result=await h.result.current.deleteYear(f.entity.id,2026);});
  expect(result).toBe(false);expect(f.stateRepo.deleteState).not.toHaveBeenCalled();
 });
 it('DELETE entity passes the exact captured map with no unversioned mass deletion',async()=>{
  const h=await boot();f.stateRepo.getStateVersions.mockResolvedValue({data:{2026:version},error:null});
  f.entityRepo.delete.mockResolvedValue({data:{success:true,deleted:1},error:null});
  f.entityRepo.getAll.mockResolvedValue({data:[],error:null});
  let result:any;await act(async()=>{result=await h.result.current.deleteEntity(f.entity.id);});
  expect(result).toBe(true);expect(f.entityRepo.delete).toHaveBeenCalledWith(f.entity.id,{2026:version});
  expect(f.stateRepo.deleteState).not.toHaveBeenCalled();expect(f.stateRepo.createState).not.toHaveBeenCalled();
 });
 it('ADMIN saving for another owner preserves historical user_id/email/role',async()=>{
  f.userRepo.getUserRole.mockResolvedValue({data:'ADMIN',error:null});
  f.entity.user_id='historical-owner';
  f.stateRepo.getState.mockImplementation(async(_user:any,entityId:string,year:number)=>({data:{
   entity_id:entityId,current_year:year,user_id:'historical-owner',email:'owner@b1.invalid',role:'USER',
   fund_data:openFund(year),b1i4_version:version,b1i4_expected:null},error:null}));
  const h=await boot();allowWrites();edit(h,'Operazione ADMIN');
  let result:any;await act(async()=>{result=await h.result.current.saveState();});
  expect(result.success).toBe(true);
  expect(f.stateRepo.upsertState.mock.calls[0][0]).toMatchObject({user_id:'historical-owner',email:'owner@b1.invalid',role:'USER',b1i4_expected:version});
 });
});
