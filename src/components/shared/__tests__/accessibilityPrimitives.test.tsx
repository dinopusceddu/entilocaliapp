import { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Modal, ModalSurface } from '../Modal';
import { Input } from '../Input';
import { MonetaryInput } from '../MonetaryInput';
import { Card } from '../Card';
import { FundingItem } from '../FundingItem';

afterEach(cleanup);
function DialogFixture({ locked = false }: { locked?: boolean }) {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)}>Nuovo ente</button><button onClick={() => { throw new Error('Background action'); }}>Background</button>
    {open && <ModalSurface name="Nuovo ente" onClose={() => setOpen(false)} closeDisabled={locked}><form onSubmit={e => {e.preventDefault(); setOpen(false);}}>
      <label>Denominazione<input data-autofocus /></label><input aria-label="Disabled" disabled /><input aria-label="Hidden" hidden />
      <a href="#source">Fonte</a><button type="button" onClick={() => setOpen(false)}>Annulla</button><button>Crea</button>
    </form></ModalSurface>}</>;
}
function openDialog(locked = false) { render(<DialogFixture locked={locked}/>); const trigger = screen.getByRole('button', {name:'Nuovo ente'}); trigger.focus(); fireEvent.click(trigger); return trigger; }
describe('Shared dialog keyboard and background contract', () => {
  it('has a name, focuses useful input, wraps Tab and ShiftTab dynamically', () => {
    openDialog(); const dialog=screen.getByRole('dialog',{name:'Nuovo ente'}), first=within(dialog).getByLabelText('Denominazione'), last=within(dialog).getByRole('button',{name:'Crea'});
    expect(dialog).toHaveAttribute('aria-modal','true'); expect(first).toHaveFocus();
    last.focus(); fireEvent.keyDown(last,{key:'Tab'}); expect(first).toHaveFocus();
    fireEvent.keyDown(first,{key:'Tab',shiftKey:true}); expect(last).toHaveFocus();
  });
  it.each(['Escape','cancel','submit'])('returns focus on %s and restores inert/aria state', how => {
    const trigger=openDialog(); const background=trigger.closest('div')!; expect(background).toHaveAttribute('inert');
    if(how==='Escape')fireEvent.keyDown(document.activeElement!,{key:'Escape'});
    else if(how==='cancel')fireEvent.click(screen.getByRole('button',{name:'Annulla'}));
    else fireEvent.submit(screen.getByRole('button',{name:'Crea'}).closest('form')!);
    expect(screen.queryByRole('dialog')).toBeNull(); expect(trigger).toHaveFocus(); expect(background).not.toHaveAttribute('inert'); expect(background).not.toHaveAttribute('aria-hidden');
  });
  it('redirects external focus and prevents background clicks', () => {
    const trigger=openDialog(); trigger.focus(); expect(screen.getByLabelText('Denominazione')).toHaveFocus();
    fireEvent.click(screen.getByRole('button',{name:'Background',hidden:true})); expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  it('Escape is explicitly disabled for in-flight workflows', () => {openDialog(true);fireEvent.keyDown(document.activeElement!,{key:'Escape'});expect(screen.getByRole('dialog')).toBeInTheDocument();});
  it('handles empty and changing single-control dialogs, ignoring disabled and hidden fields', () => {
    const ui=render(<ModalSurface name="Informazioni" onClose={vi.fn()}><input aria-label="Hidden" hidden/><button disabled>Attendi</button></ModalSurface>);
    const dialog=screen.getByRole('dialog');expect(dialog).toHaveFocus();fireEvent.keyDown(dialog,{key:'Tab'});expect(dialog).toHaveFocus();
    ui.rerender(<ModalSurface name="Informazioni" onClose={vi.fn()}><input aria-label="Hidden" hidden/><button>Unica azione</button></ModalSurface>);
    fireEvent.keyDown(dialog,{key:'Tab'});const button=screen.getByRole('button',{name:'Unica azione'});expect(button).toHaveFocus();
    fireEvent.keyDown(button,{key:'Tab',shiftKey:true});expect(button).toHaveFocus();fireEvent.keyDown(button,{key:'Tab'});expect(button).toHaveFocus();
  });
  it('nested dialogs restore the parent, with unique shared title IDs', () => {
    function Nested(){const [child,setChild]=useState(false);return <Modal isOpen onClose={vi.fn()} title="Parent"><button onClick={()=>setChild(true)}>Secondo</button>{child&&<Modal isOpen title="Child" onClose={()=>setChild(false)}>Contenuto</Modal>}</Modal>;}
    render(<Nested/>);const trigger=screen.getByRole('button',{name:'Secondo'});trigger.focus();fireEvent.click(trigger);
    const child=screen.getByRole('dialog',{name:'Child'});expect(child).toBeInTheDocument();
    const ids=Array.from(document.querySelectorAll('[id]')).map(el=>el.id);expect(new Set(ids).size).toBe(ids.length);
    fireEvent.keyDown(child,{key:'Escape'});expect(screen.getByRole('dialog',{name:'Parent'})).toBeInTheDocument();expect(trigger).toHaveFocus();
  });
  it('unmounting parent and child together restores background instead of leaving it inert', () => {
    function Nested(){return <Modal isOpen onClose={vi.fn()} title="Parent"><Modal isOpen title="Child" onClose={vi.fn()}>Contenuto</Modal></Modal>;}
    const ui=render(<Nested/>);const background=ui.container;expect(background).toHaveAttribute('inert');ui.unmount();
    expect(background).not.toHaveAttribute('inert');expect(background).not.toHaveAttribute('aria-hidden');expect(document.body.style.overflow).not.toBe('hidden');
  });
});
describe('Fields and accordion semantics', () => {
  it('FundingItem names JSX descriptions and associates money, percentage and source without interactive labels', () => {
    const {container}=render(<><FundingItem id="manualIndennita" description={<span>Risorsa contrattuale</span>} value={100} onChange={vi.fn()} inputInfo="Atto disponibile" titoloGuida="Risorsa"/><FundingItem id="percentuale" description="Quota percentuale" isPercentage value={10} onChange={vi.fn()}/><FundingItem id="manualIndennita" description="Seconda risorsa" value={0} onChange={vi.fn()}/></>);
    expect(screen.getByRole('textbox',{name:'Risorsa contrattuale'})).toHaveAccessibleDescription(/Atto disponibile.*euro/);
    expect(screen.getByRole('spinbutton',{name:'Quota percentuale'})).toHaveAccessibleDescription(/percentuale/);
    const ids=Array.from(container.querySelectorAll('[id]')).map(el=>el.id);expect(new Set(ids).size).toBe(ids.length);expect(container.querySelector('label button')).toBeNull();
    const trigger=screen.getByRole('button',{name:'Dettagli normativi'});expect(trigger).toHaveAccessibleDescription('Risorsa contrattuale');fireEvent.click(trigger);expect(trigger).toHaveAttribute('aria-expanded','true');fireEvent.keyDown(trigger,{key:'Escape'});expect(trigger).toHaveFocus();
  });
  it('merges caller descriptions with unit and invalid errors, without committing malformed money', () => {
    const change=vi.fn();render(<><p id="hint">Fonte amministrativa</p><Input label="Risorse" type="number" monetaryPath="manualIndennita" value={100} onChange={change} inputInfo="Già riconosciuto" aria-describedby="hint"/><MonetaryInput aria-label="Secondo importo" value={0}/></>);
    const money=screen.getByLabelText('Risorse');expect(money).toHaveAccessibleDescription(/Fonte amministrativa.*Già riconosciuto.*euro/i);
    fireEvent.change(money,{target:{value:'1e308'}});expect(change).not.toHaveBeenCalled();expect(money).toHaveAttribute('aria-invalid','true');
    const alert=screen.getByRole('alert');expect(money.getAttribute('aria-describedby')?.split(' ')).toContain(alert.id);
    fireEvent.change(money,{target:{value:'0'}});expect(change.mock.calls[0][0].target.value).toBe('0');expect(money).toHaveAttribute('aria-invalid','false');expect(screen.queryByRole('alert')).toBeNull();
    const ids=Array.from(document.querySelectorAll('[id]')).map(el=>el.id);expect(new Set(ids).size).toBe(ids.length);
  });
  it('keeps two Input names/IDs distinct and announces external errors', () => {
    render(<><Input label="Primo" error="Dato necessario"/><Input label="Secondo"/></>);
    expect(screen.getByLabelText('Primo').id).not.toBe(screen.getByLabelText('Secondo').id);expect(screen.getByLabelText('Primo')).toHaveAccessibleDescription('Dato necessario');expect(screen.getByRole('alert')).toHaveTextContent('Dato necessario');
  });
  it('same-titled cards have unique targets and exactly one native trigger each', () => {
    const {container}=render(<><Card title="Risorse" isCollapsible defaultCollapsed><button>Salva</button></Card><Card title="Risorse" isCollapsible><a href="#source">Fonte</a></Card></>);
    const triggers=screen.getAllByRole('button',{name:'Risorse'});expect(triggers).toHaveLength(2);expect(triggers[0].getAttribute('aria-controls')).not.toBe(triggers[1].getAttribute('aria-controls'));
    expect(screen.queryByRole('button',{name:'Salva'})).toBeNull();fireEvent.click(triggers[0]);expect(triggers[0]).toHaveAttribute('aria-expanded','true');expect(screen.getByRole('button',{name:'Salva'})).toBeVisible();
    expect(container.querySelector('button button, button a, a button, summary button, [role="button"] button')).toBeNull();
  });
});
