import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FondoAccessorioDipendentePage } from '../FondoAccessorioDipendentePage';
import mockNormativeData from '../../../public/normativa.json';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Undo2: (props: any) => <span data-testid="icon-Undo2" {...props} />,
  AlertCircle: (props: any) => <span data-testid="icon-AlertCircle" {...props} />,
  CheckCircle2: (props: any) => <span data-testid="icon-CheckCircle2" {...props} />,
  AlertTriangle: (props: any) => <span data-testid="icon-AlertTriangle" {...props} />,
  Info: (props: any) => <span data-testid="icon-Info" {...props} />,
}));

// Mock useNormativeData with full normative data
vi.mock('../../hooks/useNormativeData', () => ({
  useNormativeData: () => ({
    data: mockNormativeData,
    isLoading: false,
  }),
}));

const mockDispatch = vi.fn();
const mockSaveState = vi.fn().mockResolvedValue(undefined);
const mockPerformLocalCalculation = vi.fn();

let currentMockState: any = {};

vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: currentMockState,
    dispatch: mockDispatch,
    saveState: mockSaveState,
    performLocalCalculation: mockPerformLocalCalculation,
  }),
}));

function setupState(stArt79Value?: number, source?: string, snapshot?: any) {
  currentMockState = {
    currentUser: { id: 'u1', email: 'test@example.com' },
    currentEntity: { id: 'e1', name: 'Ente Test' },
    currentYear: 2026,
    localSources: source
      ? { 'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers': source }
      : {},
    fundData: {
      annualData: {
        annoRiferimento: 2026,
        denominazioneEnte: 'Ente Test',
        hasDirigenza: false,
        personale2018PerArt23: [{ id: '1', partTimePercentage: 100 }],
        personaleAnnoRifPerArt23: [
          { id: '1', partTimePercentage: 100 },
          { id: '2', partTimePercentage: 100 },
        ],
        fondoCertificatoParteStabile2018: 100000,
      },
      historicalData: {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      },
      fondoAccessorioDipendenteData: {
        st_art79c1c_incrementoStabileConsistenzaPers: stArt79Value,
      },
      fondoElevateQualificazioniData: {},
      fondoSegretarioComunaleData: {},
      fondoDirigenzaData: {},
      distribuzioneRisorseData: {},
      personaleServizio: { dettagli: [] },
      wizard2026TransferSnapshot: snapshot,
    },
  };
}

describe('FondoAccessorioDipendentePage — Art. 79 c. 1 lett. c Safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('A. mount con valore undefined: nessun dispatch automatico che aggiorni o popoli il campo Art. 79 c. 1 lett. c', () => {
    setupState(undefined);
    render(<FondoAccessorioDipendentePage />);

    // Verifica che nessun dispatch UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA imposti st_art79c1c
    const art79Dispatches = mockDispatch.mock.calls.filter(
      ([action]) =>
        action.type === 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA' &&
        action.payload?.st_art79c1c_incrementoStabileConsistenzaPers !== undefined
    );
    expect(art79Dispatches).toHaveLength(0);
  });

  it('B. mount con valore = 12345: nessun dispatch automatico lo sovrascrive o modifica', () => {
    setupState(12345);
    render(<FondoAccessorioDipendentePage />);

    const art79Dispatches = mockDispatch.mock.calls.filter(
      ([action]) =>
        action.type === 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA' &&
        action.payload?.st_art79c1c_incrementoStabileConsistenzaPers !== undefined
    );
    expect(art79Dispatches).toHaveLength(0);
  });

  it('C. input manuale: 12345 -> 15000: dispatch manuale corretto e valore aggiornato', () => {
    setupState(12345);
    const { container } = render(<FondoAccessorioDipendentePage />);

    // Espandi la sezione Parte Stabile (defaultCollapsed = true)
    const stabiliCardHeader = screen.getByText(/FONTI DI FINANZIAMENTO STABILI/i);
    fireEvent.click(stabiliCardHeader);

    const input = container.querySelector('#st_art79c1c_incrementoStabileConsistenzaPers') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('12345');

    fireEvent.change(input, { target: { value: '15000' } });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA',
      payload: { st_art79c1c_incrementoStabileConsistenzaPers: 15000 },
    });
  });

  it('D. source wizard2026 legacy: valore presente preservato e warning informativo visibile a video', () => {
    setupState(12345, 'wizard2026');
    const { container } = render(<FondoAccessorioDipendentePage />);

    // Espandi la sezione Parte Stabile
    const stabiliCardHeader = screen.getByText(/FONTI DI FINANZIAMENTO STABILI/i);
    fireEvent.click(stabiliCardHeader);

    const input = container.querySelector('#st_art79c1c_incrementoStabileConsistenzaPers') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('12345');

    // Verifica la presenza del messaggio di warning legacy
    expect(
      screen.getByText(/Questo valore risulta trasferito da una precedente versione del Wizard 2026/i)
    ).toBeInTheDocument();

    // Nessun dispatch automatico di modifica
    const art79Dispatches = mockDispatch.mock.calls.filter(
      ([action]) =>
        action.type === 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA' &&
        action.payload?.st_art79c1c_incrementoStabileConsistenzaPers !== undefined
    );
    expect(art79Dispatches).toHaveLength(0);
  });

  it('E. card snapshot Art. 79 c. 1 lett. c: etichettata come stima legacy non trasferita con trattamento SOLO CONTROLLO', () => {
    const mockSnapshot = {
      transferredAt: new Date().toISOString(),
      entityId: 'e1',
      input: {
        monteSalari2021: 1000000,
        fondoCertificatoParteStabile2018: 100000,
      },
      computed: {
        incrementoStabileAumentoPersonale: 20000,
        dipendentiEquivalenti2018: 10,
        dipendentiEquivalenti2026: 12,
      },
      transferPlan: [
        {
          source: 'art23.result.incrementoStabileAumentoPersonale',
          destinationPath: 'simulato.art79c1c.stimaLegacy',
          status: 'CONTROL_ONLY',
          proposedValue: 20000,
          currentValue: null,
          art23Treatment: 'SOLO_CONTROLLO',
        },
      ],
    };

    setupState(0, undefined, mockSnapshot);
    render(<FondoAccessorioDipendentePage />);

    // Verifica etichette corrette
    expect(screen.getByText(/Stima istruttoria legacy — non trasferita:/i)).toBeInTheDocument();
    expect(screen.getByText('SOLO CONTROLLO')).toBeInTheDocument();
    expect(
      screen.getByText(/non modifica la voce effettiva del Fondo/i)
    ).toBeInTheDocument();

    // Verifica assenza delle vecchie diciture fuorvianti nella card
    expect(screen.queryByText(/Valore calcolato stabile:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DENTRO LIMITE \(Soggetto\)/i)).not.toBeInTheDocument();
  });
});
