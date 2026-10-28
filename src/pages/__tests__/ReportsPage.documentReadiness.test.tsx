import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReportsPage } from '../ReportsPage';
import * as reports from '../../services/reportService';
import { documentCheck, documentResult, documentUser } from '../../services/__tests__/documentReadinessFixture';
import { DocumentFactory } from '../../services/documents/documentFactory';

const boundary = vi.hoisted(() => ({ state: {} as any, dispatch: vi.fn(), downloads: vi.fn(), buttons: new Map<string, Function>() }));
vi.mock('../../contexts/AppContext.tsx', () => ({ useAppContext: () => ({ state: boundary.state, dispatch: boundary.dispatch }) }));
vi.mock('../../hooks/useNormativeData.ts', () => ({ useNormativeData: () => ({ data: { riferimenti_normativi: {} }, isLoading: false }) }));
vi.mock('file-saver', () => ({ saveAs: (...args: any[]) => boundary.downloads(...args) }));
vi.mock('jspdf', async original => {
  const actual = await original<typeof import('jspdf')>();
  class Pdf extends actual.jsPDF { constructor() { super(); this.save = ((filename: string) => { boundary.downloads(filename); return this; }) as unknown as typeof this.save; } }
  return { ...actual, default: Pdf, jsPDF: Pdf };
});
// Retain the real button and DOM state; capture the actual handlers for forced invocation.
vi.mock('../../components/shared/Button.tsx', async original => {
  const actual = await original<typeof import('../../components/shared/Button')>();
  return { ...actual, Button: (props: any) => {
    if (typeof props.children === 'string') boundary.buttons.set(props.children, props.onClick);
    return <actual.Button {...props} />;
  } };
});

function setup(status: Parameters<typeof documentResult>[0] = 'VALID', checks = [] as ReturnType<typeof documentCheck>[], closed = false) {
  boundary.state = { currentUser: documentUser, isLoading: false, calculationResult: documentResult(status), complianceChecks: checks,
    fundData: { metadata: { snapshotStatus: closed ? 'CLOSED' : 'OPEN' }, annualData: { denominazioneEnte: 'Comune Policy', documentMetadata: {} }, distribuzioneRisorseData: {} } };
  return render(<ReportsPage />);
}
beforeEach(() => {
  cleanup(); vi.restoreAllMocks(); boundary.buttons.clear(); boundary.dispatch.mockClear(); boundary.downloads.mockClear();
  vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('ReportsPage real integration with document-kind readiness', () => {
  it('VALID without optional act metadata permits final, each preview remains available', async () => {
    const pdf = vi.spyOn(reports, 'generateFullSummaryPDF').mockResolvedValue(undefined);
    const xls = vi.spyOn(reports, 'generateFADXLS').mockResolvedValue(undefined);
    setup();
    expect(screen.getByRole('button', { name: 'Genera Determina Definitiva (PDF)' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Determina Definitiva (TXT)' }));
    expect(boundary.downloads).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Bozza Relazione Tecnica' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Bozza Prospetto' })).toBeEnabled();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Riepilogo Definitivo (PDF)' })); fireEvent.click(screen.getByRole('button', { name: 'XLS Fondo Definitivo' })); });
    expect(pdf).toHaveBeenCalledWith(expect.anything(), 'Comune Policy', documentUser, expect.objectContaining({ mode: 'DEFINITIVE_EXPORT', complianceChecks: [] }));
    expect(xls).toHaveBeenCalledTimes(1);
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it.each(['UNDETERMINED', 'INVALID', 'MISSING'] as const)('%s explains final refusal, allows preview, forced handlers perform zero final exports', async status => {
    const pdf = vi.spyOn(reports, 'generateFullSummaryPDF').mockResolvedValue(undefined);
    const xls = vi.spyOn(reports, 'generateFADXLS').mockResolvedValue(undefined);
    setup(status);
    expect(screen.getAllByText(/definitivo non disponibile/i).length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole('button', { name: 'Riepilogo Definitivo (PDF)' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'XLS Fondo Definitivo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Scarica Bozza Determina (PDF)' })).toBeEnabled();
    await act(async () => {
      await boundary.buttons.get('Riepilogo Definitivo (PDF)')!();
      await boundary.buttons.get('XLS Fondo Definitivo')!();
      boundary.buttons.get('Determina Definitiva (Bloccata)')!();
    });
    expect(pdf).not.toHaveBeenCalled(); expect(xls).not.toHaveBeenCalled(); expect(boundary.downloads).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Bozza Determina (TXT)' }));
    expect(boundary.downloads).toHaveBeenCalledTimes(1); expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it('VALID + BLOCKING disables finals and guards programmatic invocation; preview retained', async () => {
    const pdf = vi.spyOn(reports, 'generateFullSummaryPDF').mockResolvedValue(undefined);
    const xls = vi.spyOn(reports, 'generateFADXLS').mockResolvedValue(undefined);
    setup('VALID', [documentCheck()]);
    expect(screen.getAllByText(/Risolvere la verifica della costituzione/).length).toBeGreaterThan(0);
    await act(async () => {
      await boundary.buttons.get('Riepilogo Definitivo (PDF)')!(); await boundary.buttons.get('XLS Fondo Definitivo')!();
      boundary.buttons.get('Determina Definitiva (Bloccata)')!();
    });
    expect(pdf).not.toHaveBeenCalled(); expect(xls).not.toHaveBeenCalled(); expect(boundary.downloads).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Bozza Relazione Tecnica' }));
    expect(boundary.downloads).toHaveBeenCalledTimes(1);
    expect(boundary.state.calculationResult.canonicalFund.status).toBe('VALID'); expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it('WARNING alone preserves finals', () => { setup('VALID', [documentCheck('warning')]); expect(screen.getByRole('button', { name: 'XLS Fondo Definitivo' })).toBeEnabled(); });
  it('CLOSED retains read-only metadata and final/preview generation with no dispatch', () => {
    setup('VALID', [], true); expect(screen.getByRole('button', { name: 'Annualità Chiusa' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Genera Determina Definitiva (PDF)' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Scarica Bozza (PDF)' })); expect(boundary.downloads).toHaveBeenCalledTimes(1);
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it('per-kind factory contract remains guarded even when invoked outside UI', () => {
    setup('VALID', [documentCheck()]);
    const factory = new DocumentFactory(boundary.state.calculationResult, 'Comune Policy', documentUser, undefined, boundary.state.complianceChecks);
    expect(() => factory.exportDefinitiveRelazioneTecnica()).toThrow(); expect(() => factory.exportDefinitiveProspetto()).toThrow();
    expect(boundary.downloads).not.toHaveBeenCalled();
  });
});
