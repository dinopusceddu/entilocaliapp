import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DistribuzioneRisorsePage } from '../DistribuzioneRisorsePage';
import mockNormativeData from '../../../public/normativa.json';

const { mockDispatch, mockSaveState } = vi.hoisted(() => ({
  mockDispatch: vi.fn(),
  mockSaveState: vi.fn(),
}));

vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: {
      calculationResult: {
        fondi: {
          dipendente: { summary: { totaleFondo: 100000 } },
        },
      },
      fundData: {
        metadata: { snapshotStatus: 'CLOSED' },
        annualData: {
          personaleServizioAttuale: [],
          ccnl2024: { personaleInServizio01012026: 10 },
        },
        distribuzioneRisorseData: {
          u_assegnoAdPersonamRiassorbibile: 2500,
          criteri_percPerfIndividuale: 50,
        },
        fondoElevateQualificazioniData: {
          st_art16c2_retribuzionePosizione: 10000,
          va_art16c3_retribuzioneRisultato: 2000,
        },
        personaleServizio: { dettagli: [] },
      },
    },
    dispatch: mockDispatch,
    saveState: mockSaveState,
  }),
}));

vi.mock('../../hooks/useNormativeData', () => ({
  useNormativeData: () => ({ data: mockNormativeData, isLoading: false }),
}));

describe('DistribuzioneRisorsePage in annualità CLOSED', () => {
  it('mantiene KPI e valori consultabili senza consentire allocazioni o salvataggio', () => {
    const { container } = render(<DistribuzioneRisorsePage />);

    expect(screen.getByText('Totale da Distribuire')).toBeInTheDocument();
    expect(screen.getAllByText(/100\.000,00/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Annualità Chiusa \(Sola Lettura\)/i)).toBeInTheDocument();

    const allocationInput = container.querySelector('#u_assegnoAdPersonamRiassorbibile');
    expect(allocationInput).toBeInstanceOf(HTMLInputElement);
    expect(allocationInput).toBeDisabled();
    expect(allocationInput).toHaveValue(2500);
    fireEvent.change(allocationInput!, { target: { value: '3000' } });

    const saveButton = screen.getByRole('button', { name: /Annualità Chiusa/i });
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockSaveState).not.toHaveBeenCalled();
  });
});
