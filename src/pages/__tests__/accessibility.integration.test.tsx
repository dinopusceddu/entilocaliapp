import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
// Installed library exposes JS through exports but omits its declaration export.
// @ts-expect-error Package declaration export mismatch; no production dependency change.
import { computeAccessibleName, isInaccessible } from 'dom-accessibility-api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FondiEntiPage } from '../FondiEntiPage';
import { ReportsPage } from '../ReportsPage';
import { documentResult, documentUser } from '../../services/__tests__/documentReadinessFixture';
import { initialWizard2026DraftState } from '../../features/wizard2026/initialState';
import { Step1EnteCondizioni } from '../../features/wizard2026/steps/Step1EnteCondizioni';
import { Step2Art23Limite } from '../../features/wizard2026/steps/Step2Art23Limite';
import { Step3Dl25 } from '../../features/wizard2026/steps/Step3Dl25';
import { Step4Ccnl2026 } from '../../features/wizard2026/steps/Step4Ccnl2026';
import { Step5ConglobamentoArt60 } from '../../features/wizard2026/steps/Step5ConglobamentoArt60';
import { Step6Straordinario } from '../../features/wizard2026/steps/Step6Straordinario';
import { Step7Pnrr } from '../../features/wizard2026/steps/Step7Pnrr';
import { CcnlRecoveryEditor } from '../../features/wizard2026/steps/CcnlRecoveryEditor';
import { Wizard2026DataRequestModal } from '../../features/wizard2026/letters/components/Wizard2026DataRequestModal';

let app: any;
const create=vi.fn(), switchYear=vi.fn(), dispatch=vi.fn();
vi.mock('../../contexts/AppContext',()=>({useAppContext:()=>({state:app,dispatch,createEntity:create,switchYearAtomic:switchYear,setScopeAndTab:vi.fn(),renameEntity:vi.fn(),deleteEntity:vi.fn()})}));
vi.mock('../../hooks/useNormativeData',()=>({useNormativeData:()=>({data:null})}));
vi.mock('../../services/userProfilesHelper',()=>({fetchUserProfilesMap:async()=>({})}));
vi.mock('../../services/supabase',()=>({supabase:{from:()=>({select:async()=>({data:[],error:null})})}}));
beforeEach(()=>{vi.clearAllMocks();vi.spyOn(window,'alert').mockImplementation(()=>{});app={currentUser:documentUser,currentEntity:{id:'entity',user_id:documentUser.id,name:'Comune Test'},currentYear:2026,entities:[],calculationResult:documentResult('VALID'),complianceChecks:[],isLoading:false,fundData:{metadata:{snapshotStatus:'OPEN'},annualData:{denominazioneEnte:'Comune Test',documentMetadata:{}},distribuzioneRisorseData:{}}};create.mockResolvedValue({id:'new',user_id:documentUser.id,name:'Comune Nuovo'});switchYear.mockResolvedValue(undefined);});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
function census(root: HTMLElement){
  const fields=Array.from(root.querySelectorAll<HTMLInputElement>('input,textarea,select')).filter(el=>!isInaccessible(el)&&el.type!=='hidden');
  const unnamed=fields.filter(el=>!computeAccessibleName(el).trim()).map(el=>el.outerHTML);
  if(unnamed.length)throw new Error('Unnamed active fields: '+unnamed.join('\n'));
  const ids=Array.from(root.querySelectorAll('[id]')).map(el=>el.id);expect(new Set(ids).size).toBe(ids.length);
  expect(root.querySelector('button button,button a,a button,summary button,[role="button"] input,[role="button"] button')).toBeNull();
  return fields;
}
describe('Real catalogue and report accessibility',()=>{
  it.each(['close','cancel','escape','submit'])('new entity %s restores the initiating focus and blocks background',async how=>{
    render(<FondiEntiPage/>);const trigger=screen.getByTestId('btn-nuovo-ente');trigger.focus();fireEvent.click(trigger);
    const dialog=screen.getByRole('dialog',{name:'Nuovo Ente'});expect(dialog).toHaveAttribute('aria-modal','true');
    const field=within(dialog).getByLabelText(/Denominazione dell.Ente/i);expect(field).toHaveFocus();census(dialog);
    const last=within(dialog).getByRole('button',{name:/Crea e apri/i});last.focus();fireEvent.keyDown(last,{key:'Tab'});expect(dialog.contains(document.activeElement)).toBe(true);
    const first=dialog.querySelector('button')!;first.focus();fireEvent.keyDown(first,{key:'Tab',shiftKey:true});expect(last).toHaveFocus();
    if(how==='close')fireEvent.click(within(dialog).getByTestId('close-modal-nuovo-ente'));
    if(how==='cancel')fireEvent.click(within(dialog).getByRole('button',{name:'Annulla'}));
    if(how==='escape')fireEvent.keyDown(dialog,{key:'Escape'});
    if(how==='submit'){fireEvent.change(field,{target:{value:'Comune Nuovo'}});fireEvent.submit(field.closest('form')!);await screen.findByRole('button',{name:'Nuovo ente'});}
    expect(screen.queryByRole('dialog')).toBeNull();expect(trigger).toHaveFocus();
  });
  it.each([false,true])('all ten report metadata fields have names and CLOSED=%s prevents writes',closed=>{
    app.fundData.metadata.snapshotStatus=closed?'CLOSED':'OPEN';const {container}=render(<ReportsPage/>);const fields=census(container);expect(fields).toHaveLength(10);
    expect(fields.filter(el=>el.tagName==='INPUT')).toHaveLength(7);expect(new Set(fields.map(computeAccessibleName)).size).toBe(10);
    if(closed){fields.forEach(el=>expect(el).toBeDisabled());fireEvent.click(screen.getByRole('button',{name:'Annualità Chiusa'}));expect(dispatch).not.toHaveBeenCalled();}
    else{fireEvent.change(screen.getByLabelText('Numero Determina'),{target:{value:'42'}});fireEvent.click(screen.getByRole('button',{name:'Salva Metadati Determina'}));expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({payload:expect.objectContaining({documentMetadata:expect.objectContaining({numeroDetermina:'42'})})}));}
  });
});
describe('Wizard active field census, actual components and branch data',()=>{
  it('multiple recovery editors and duplicate administrative rows never duplicate control IDs',()=>{
    const d=structuredClone(initialWizard2026DraftState);d.ccnl2026.recoveryInstructions=[{kind:'CCNL_014',competenceYear:2024,recognitionYear:2026,instructionStatus:'UNINSTRUCTED'},{kind:'CCNL_014',competenceYear:2024,recognitionYear:2026,instructionStatus:'UNINSTRUCTED'}];
    const {container}=render(<><CcnlRecoveryEditor state={d.ccnl2026} year={2026} onChange={vi.fn()}/><CcnlRecoveryEditor state={d.ccnl2026} year={2026} onChange={vi.fn()}/></>);census(container);
  });
  it('letter dialog shares focus confinement, with six named local fields',()=>{
    render(<Wizard2026DataRequestModal isOpen onClose={vi.fn()} state={structuredClone(initialWizard2026DraftState)}/>);
    const dialog=screen.getByRole('dialog',{name:'Lettera di richiesta dati'});expect(census(dialog)).toHaveLength(6);
    expect(within(dialog).getByLabelText('Destinatario')).toHaveFocus();
  });
  it.each(['ordinary','rows','manual','post2026'])('%s field names and monetary units are programmatic',scenario=>{
    const d=structuredClone(initialWizard2026DraftState);d.ente.entityType='UNIONE_COMUNI';d.ente.hasDirigenza=true;d.ente.annoRiferimento=scenario==='post2026'?2027:2026;
    d.art23.personale2018Art23=[{id:'p1',partTimePercentage:100}];d.art23.personale2026Art23=[{id:'p2',partTimePercentage:50,cedoliniEmessi:12}];
    d.art23.usaCalcoloManualePersonaleArt23=scenario==='manual';d.conglobamentoArt60.mode=scenario==='manual'?'manual':'guided';
    d.dl25.quoteAderenti=[{id:'q1',enteAderente:'Comune A',estremiAttoEnteAderente:'Atto 1'}];
    d.conglobamentoArt60.partTimeNativi=[{id:'pt1',area:'ISTRUTTORE',numeroDipendenti:1,percentualePartTime:50,nota:''}];
    d.straordinario.risorseEscluse=[{id:'s1',tipologia:'altraFattispecieEsclusa',esclusaDaArt23:true}];
    d.pnrr.incidenzaSalarioAccessorioScelta='assistito';d.pnrr.exerciseDecision='EXERCISED';
    const views=[<Step1EnteCondizioni state={d.ente} onChange={vi.fn()}/>,<Step2Art23Limite state={d.art23} hasDirigenza onChange={vi.fn()}/>,<Step3Dl25 state={d.dl25} entityType={d.ente.entityType} enteState={d.ente} onChange={vi.fn()}/>,<Step4Ccnl2026 state={d.ccnl2026} enteState={d.ente} onChange={vi.fn()}/>,<Step5ConglobamentoArt60 state={d.conglobamentoArt60} annoRiferimento={d.ente.annoRiferimento} onChange={vi.fn()}/>,<Step6Straordinario state={d.straordinario} hasDirigenza margineArt23={1000} onChange={vi.fn()}/>,<Step7Pnrr state={d.pnrr} hasDirigenza annoRiferimento={d.ente.annoRiferimento} onEnteChange={vi.fn()} onChange={vi.fn()}/>];
    for(const view of views){const {container,unmount}=render(view);const fields=census(container);for(const money of fields.filter(el=>el.inputMode==='decimal'))expect(money).toHaveAccessibleDescription(/euro/i);unmount();}
  });
});
