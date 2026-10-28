import { render, screen, fireEvent, within, waitFor, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { initialWizard2026DraftState } from '../../initialState';
import { Wizard2026PreviewPage } from '../../components/Wizard2026PreviewPage';
import { projectTransferAction } from '../transferAction';

const save = vi.fn();
const dispatch = vi.fn();
const navigate = vi.fn();
let draft = structuredClone(initialWizard2026DraftState);
let app: any;
vi.mock('../../../../contexts/AppContext', () => ({ useAppContext: () => ({ state: app, saveState: save, dispatch, setScopeAndTab: navigate }) }));
vi.mock('../../hooks/useWizard2026Draft', () => ({ useWizard2026Draft: () => ({ state: draft, currentStep: 8, allChecks: [], blockingErrors: [], syncStatus: 'disabled', goNext: vi.fn(), goPrevious: vi.fn(), goToStep: vi.fn(), resetWizard: vi.fn() }) }));

function entry(which: string) { return screen.getByTestId(`transfer-action-${which}`); }
function assertSame(status: string) {
  expect(entry('summary')).toHaveAttribute('data-transfer-status', status);
  expect(entry('step8')).toHaveAttribute('data-transfer-status', status);
  expect(within(entry('summary')).getByRole<HTMLButtonElement>('button', { hidden: true }).disabled).toBe(within(entry('step8')).getByRole<HTMLButtonElement>('button', { hidden: true }).disabled);
  expect(entry('summary').textContent).toBe(entry('step8').textContent);
}
function open(which = 'step8') {
  fireEvent.click(within(entry(which)).getByRole('button'));
  fireEvent.click(screen.getByLabelText(/Confermo di aver verificato/i));
  return screen.getByRole('button', { name: /Conferma e compila/i });
}
beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear();
  save.mockResolvedValue({ success: true });
  draft = structuredClone(initialWizard2026DraftState); draft.meta.currentStep = 8;
  app = { currentUser: { id: 'user', role: 'USER' }, currentEntity: { id: 'entity', user_id: 'user', name: 'Comune di Test' }, currentYear: 2026,
    localSources: {}, calculationRuntime: { contextEpoch: 1 }, fundData: { metadata: { snapshotStatus: 'OPEN' }, historicalData: {}, annualData: { annoRiferimento: 2026, ccnl2024: {}, personaleServizioAttuale: [], proventiSpecifici: [] },
      fondoAccessorioDipendenteData: {}, fondoElevateQualificazioniData: {}, fondoSegretarioComunaleData: {}, fondoDirigenzaData: {} } };
});
afterEach(cleanup);

describe('Single operational state on the real Wizard page', () => {
  it.each(['summary', 'step8'])('entry %s opens the same contextual confirmation and saves once', async which => {
    render(<Wizard2026PreviewPage />); assertSame('AVAILABLE');
    fireEvent.click(open(which));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('FONDO', 'fondoDipendenti'));
    expect(save).toHaveBeenCalledTimes(1); assertSame('ALREADY_TRANSFERRED');
    expect(save.mock.calls[0][2]).toBe(2026);
    expect(save.mock.calls[0][3].user_id).toBe('user');
  });
  it('CLOSED keeps both entry points read only', () => {
    app.fundData.metadata.snapshotStatus = 'CLOSED'; render(<Wizard2026PreviewPage />); assertSame('CLOSED');
    fireEvent.click(within(entry('summary')).getByRole('button')); expect(screen.queryByRole('dialog')).toBeNull(); expect(save).not.toHaveBeenCalled();
  });
  it('invalid monetary input has one business reason and cannot commit', () => {
    draft.ccnl2026.monteSalari2021 = -100; render(<Wizard2026PreviewPage />); assertSame('BLOCKED');
    expect(within(entry('step8')).getByRole('button')).toBeDisabled(); expect(save).not.toHaveBeenCalled();
  });
  it('missing current context is undetermined, never enabled by stale metadata', () => {
    app.currentEntity = null; render(<Wizard2026PreviewPage />); assertSame('UNDETERMINED'); expect(save).not.toHaveBeenCalled();
  });
  it('wrong compilation year blocks both points', () => {
    draft.ente.annoRiferimento = 2025; render(<Wizard2026PreviewPage />); assertSame('BLOCKED');
    expect(entry('step8')).toHaveTextContent('non corrisponde');
  });
  it('structured save rejection leaves memory unchanged and permits a retry', async () => {
    save.mockResolvedValueOnce({ success: false, reason: 'VALIDATION_ERROR', error: 'Importi da correggere' });
    render(<Wizard2026PreviewPage />); fireEvent.click(open('summary'));
    await screen.findByText('Importi da correggere');
    expect(dispatch).not.toHaveBeenCalled(); expect(navigate).not.toHaveBeenCalled(); assertSame('AVAILABLE');
    fireEvent.click(screen.getByRole('button', { name: /Conferma e compila/i }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(navigate).toHaveBeenCalled()); assertSame('ALREADY_TRANSFERRED');
  });
  it('double confirm is guarded synchronously, then identical second transfer is disabled', async () => {
    let finish!: (value: any) => void; save.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    render(<Wizard2026PreviewPage />); const confirm = open(); fireEvent.click(confirm); fireEvent.click(confirm);
    expect(save).toHaveBeenCalledTimes(1); assertSame('IN_PROGRESS'); finish({ success: true });
    await waitFor(() => expect(navigate).toHaveBeenCalled()); assertSame('ALREADY_TRANSFERRED');
  });
  it('late response after entity switch cannot dispatch into a different Fund', async () => {
    let finish!: (value: any) => void; save.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const ui = render(<Wizard2026PreviewPage />); fireEvent.click(open());
    app = { ...app, currentEntity: { ...app.currentEntity, id: 'other', name: 'Altro Comune' }, calculationRuntime: { contextEpoch: 2 } };
    ui.rerender(<Wizard2026PreviewPage />); finish({ success: true });
    await screen.findByText(/Il contesto è cambiato/); expect(dispatch).not.toHaveBeenCalled(); expect(navigate).not.toHaveBeenCalled();
  });
  it('context switch while confirmation is open requires a new confirmation', () => {
    const ui = render(<Wizard2026PreviewPage />); const confirm = open();
    app = { ...app, currentEntity: { ...app.currentEntity, id: 'other', name: 'Altro Comune' } };
    ui.rerender(<Wizard2026PreviewPage />); fireEvent.click(confirm);
    expect(screen.getByText(/Chiudi la conferma/)).toBeInTheDocument(); expect(save).not.toHaveBeenCalled();
  });
  it('reload recognizes the existing receipt and updated snapshot without a new economic calculation', async () => {
    const ui = render(<Wizard2026PreviewPage />); fireEvent.click(open()); await waitFor(() => expect(save).toHaveBeenCalled());
    await waitFor(() => expect(navigate).toHaveBeenCalled()); app.fundData = save.mock.calls[0][0];
    ui.unmount(); render(<Wizard2026PreviewPage />); assertSame('ALREADY_TRANSFERRED'); expect(save).toHaveBeenCalledTimes(1);
  });
  it('modal names the selected entity/year and contains no technical field paths', () => {
    render(<Wizard2026PreviewPage />); open('summary'); const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Comune di Test · Fondo 2026');
    expect(dialog).toHaveAccessibleName('Conferma trasferimento alla Costituzione Fondo');
    expect(dialog.textContent).not.toMatch(/refactoring|payload|mapping|legacy|DocumentFactory|\bREADY\b|canonical|fondoAccessorioDipendenteData\./i);
  });
  it('primary action precedes the long summary; development vocabulary never reaches the rendered surface', () => {
    const { container } = render(<Wizard2026PreviewPage />);
    expect(entry('step8').compareDocumentPosition(screen.getByText(/1\. Quadro generale/)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const remaining = container.textContent?.match(/.{0,65}(?:refactoring|payload|mapping|legacy|DocumentFactory|\bREADY\b|canonical|opinionOutcome).{0,65}/gi) ?? [];
    expect(remaining, JSON.stringify(remaining)).toEqual([]);
    expect(container.querySelector('button button')).toBeNull();
  });
});

describe('Presentation state contract', () => {
  it('explicit invalid input is independent of optional warning count', () => {
    const result = projectTransferAction({ validation: { isTransferable: true, blockingErrors: [], warnings: [] }, hasUser: true, entityName: 'Ente', year: 2026, draftYear: 2026, closed: false, monetaryDraftInvalid: true });
    expect(result.status).toBe('INVALID'); expect(result.enabled).toBe(false); expect(result.reason).toContain('importi');
  });
});
