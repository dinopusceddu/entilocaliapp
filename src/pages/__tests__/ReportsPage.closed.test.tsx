import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReportsPage } from '../ReportsPage';
import mockNormativeData from '../../../public/normativa.json';

const mockDispatch = vi.fn();
const createReportsState = (snapshotStatus: 'OPEN' | 'CLOSED') => ({
  currentUser: { id: 'user-1', email: 'responsabile@example.com' },
  isLoading: false,
  complianceChecks: [],
  calculationResult: {
    totaleRisorseDisponibili: 50000,
    fondoAccessorioDipendente: {
      totaleRisorseDisponibili: 30000,
      sommaRisorseStabili: 20000,
      sommaRisorseVariabili: 10000,
      lim_totaleParzialeRisorseConfrontoTetto2016_calculated: 25000,
      totaleRisorseEscluseDalLimite: 5000,
    },
    fondoElevateQualificazioni: { totaleRisorseEQ: 10000 },
    fondoSegretarioComunale: { totaleRisorseDisponibili: 5000 },
    fondoDirigenza: { totaleRisorseDisponibili: 5000 },
  },
  fundData: {
    metadata: { snapshotStatus },
    annualData: {
      denominazioneEnte: 'Comune Consultabile',
      documentMetadata: {
        numeroDetermina: '42',
        dataDetermina: '2026-09-01',
        numDeliberaGc: '17',
        dataDeliberaGc: '2026-08-20',
        numVerbaleRevisori: '9',
        dataVerbaleRevisori: '2026-08-28',
        firmaDigitale: 'Responsabile Test',
        opinionOutcome: 'FAVORABLE',
        transmissionStatus: 'DOCUMENTED_SENT',
        adoptionStatus: 'DOCUMENTED_ADOPTED',
      },
    },
    distribuzioneRisorseData: {},
  },
});
let reportsState = createReportsState('CLOSED');

vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: reportsState,
    dispatch: mockDispatch,
  }),
}));

vi.mock('../../hooks/useNormativeData', () => ({
  useNormativeData: () => ({ data: mockNormativeData, isLoading: false }),
}));

describe('ReportsPage in annualità CLOSED', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reportsState = createReportsState('CLOSED');
  });

  it('rende i metadati consultabili e non modificabili, senza bloccare gli export', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const { container } = render(<ReportsPage />);

    const textInputs = Array.from(container.querySelectorAll('input'));
    const selects = Array.from(container.querySelectorAll('select'));
    expect(textInputs).toHaveLength(7);
    expect(selects).toHaveLength(3);
    textInputs.forEach(input => expect(input).toBeDisabled());
    selects.forEach(select => expect(select).toBeDisabled());

    expect(screen.getByDisplayValue('42')).toBeVisible();
    expect(screen.getByDisplayValue('Responsabile Test')).toBeVisible();
    expect(screen.getByText(/consultabili ma non modificabili/i)).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /Annualità Chiusa/i });
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_ANNUAL_DATA' }));
    expect(alertSpy).not.toHaveBeenCalledWith(expect.stringMatching(/Metadati della determina salvati/i));

    expect(screen.getByRole('button', { name: /Genera Riepilogo Generale \(PDF\)/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Scarica Bozza Determina \(PDF\)/i })).toBeEnabled();
  });

  it('la transizione OPEN -> CLOSED rende il salvataggio irraggiungibile prima del click', () => {
    reportsState = createReportsState('OPEN');
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const view = render(<ReportsPage />);
    expect(screen.getByRole('button', { name: /Salva Metadati Determina/i })).toBeEnabled();

    reportsState = createReportsState('CLOSED');
    view.rerender(<ReportsPage />);
    const saveButton = screen.getByRole('button', { name: /Annualità Chiusa/i });
    expect(saveButton).toBeDisabled();

    fireEvent.click(saveButton);

    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_ANNUAL_DATA' }));
    expect(alertSpy).not.toHaveBeenCalledWith(expect.stringMatching(/Metadati della determina salvati/i));
  });
});
