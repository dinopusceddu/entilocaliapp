import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FondoElevateQualificazioniPage } from '../FondoElevateQualificazioniPage';
import mockNormativeData from '../../../public/normativa.json';

// Mock icons
vi.mock('lucide-react', () => ({
  Undo2: (props: any) => <span data-testid="icon-Undo2" {...props} />,
  AlertCircle: (props: any) => <span data-testid="icon-AlertCircle" {...props} />,
  CheckCircle2: (props: any) => <span data-testid="icon-CheckCircle2" {...props} />,
  AlertTriangle: (props: any) => <span data-testid="icon-AlertTriangle" {...props} />,
  Info: (props: any) => <span data-testid="icon-Info" {...props} />,
}));

vi.mock('../../hooks/useNormativeData', () => ({
  useNormativeData: () => ({
    data: mockNormativeData,
    isLoading: false,
  }),
}));

const mockDispatch = vi.fn();
const mockSaveState = vi.fn().mockResolvedValue(undefined);
const mockPerformLocalCalculation = vi.fn();

const currentMockState: any = {
  currentUser: { id: 'u1', email: 'test@example.com' },
  currentEntity: { id: 'e1', name: 'Ente Test' },
  currentYear: 2025,
  localSources: {},
  fundData: {
    annualData: {
      annoRiferimento: 2025,
      denominazioneEnte: 'Ente Test',
      hasDirigenza: false,
    },
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
    },
    fondoAccessorioDipendenteData: {},
    fondoElevateQualificazioniData: {
      ris_fondoPO2017: 100000,
      ris_incrementoConRiduzioneFondoDipendenti: 0,
      ris_incrementoLimiteArt23c2_DL34: 0,
      va_dl25_2025_armonizzazione: 25000,
      fin_art23c2_adeguamentoTetto2016: 0,
    },
    fondoSegretarioComunaleData: {},
    fondoDirigenzaData: {},
    distribuzioneRisorseData: {},
    personaleServizio: { dettagli: [] },
  },
};

vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: currentMockState,
    dispatch: mockDispatch,
    saveState: mockSaveState,
    performLocalCalculation: mockPerformLocalCalculation,
  }),
}));

describe('NORM-001 — FondoElevateQualificazioniPage DL25 limit exclusion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifica che la quota D.L. 25/2025 sia inclusa nel totale disponibile ma esclusa dal tetto Art. 23', () => {
    render(<FondoElevateQualificazioniPage />);

    // Totale Risorse (Finanziamento EQ) = 100.000 + 25.000 = 125.000,00
    const cardTotale = screen.getByText(/Totale Risorse \(Finanziamento EQ\)/i).closest('div');
    expect(cardTotale).toHaveTextContent('125.000,00');

    // Quota Soggetta a Tetto = solo ris_fondoPO2017 (100.000,00), NON include va_dl25_2025_armonizzazione
    const cardTetto = screen.getByText(/Quota Soggetta a Tetto/i).closest('div');
    expect(cardTetto).toHaveTextContent('100.000,00');

    // Quota Esclusa dal Tetto = 25.000,00
    const cardEscluso = screen.getByText(/Quota Esclusa dal Tetto/i).closest('div');
    expect(cardEscluso).toHaveTextContent('25.000,00');

    // Verifica label normativa aggiornata (in deroga)
    expect(screen.getByText(/Armonizzazione del trattamento accessorio del personale dipendente \(in deroga al limite dell'art\. 23, c\. 2\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/Armonizzazione del trattamento accessorio del personale dipendente \(rileva ai fini del limite\)/i)).toBeNull();
  });
});
