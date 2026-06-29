import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step8RiepilogoPreview } from '../features/wizard2026/steps/Step8RiepilogoPreview';
import { applyWizard2026Transfer } from '../features/wizard2026/transfer/applyWizard2026Transfer';
import { NavigationScope } from '../domain/enums';

// Mock Lucide Icons explicitly to avoid Proxy type issues in React renders
vi.mock('lucide-react', () => ({
  AlertCircle: (props: any) => <span data-testid="icon-AlertCircle" {...props} />,
  CheckCircle2: (props: any) => <span data-testid="icon-CheckCircle2" {...props} />,
  Info: (props: any) => <span data-testid="icon-Info" {...props} />,
  FileText: (props: any) => <span data-testid="icon-FileText" {...props} />,
  LayoutGrid: (props: any) => <span data-testid="icon-LayoutGrid" {...props} />,
  Scale: (props: any) => <span data-testid="icon-Scale" {...props} />,
  ShieldAlert: (props: any) => <span data-testid="icon-ShieldAlert" {...props} />,
  Award: (props: any) => <span data-testid="icon-Award" {...props} />,
  FileSpreadsheet: (props: any) => <span data-testid="icon-FileSpreadsheet" {...props} />,
  Activity: (props: any) => <span data-testid="icon-Activity" {...props} />,
  Flame: (props: any) => <span data-testid="icon-Flame" {...props} />,
  HelpCircle: (props: any) => <span data-testid="icon-HelpCircle" {...props} />,
  ChevronDown: (props: any) => <span data-testid="icon-ChevronDown" {...props} />,
  ChevronUp: (props: any) => <span data-testid="icon-ChevronUp" {...props} />,
  AlertTriangle: (props: any) => <span data-testid="icon-AlertTriangle" {...props} />,
  RefreshCw: (props: any) => <span data-testid="icon-RefreshCw" {...props} />,
  X: (props: any) => <span data-testid="icon-X" {...props} />,
  ArrowRight: (props: any) => <span data-testid="icon-ArrowRight" {...props} />
}));

// Mock useAppContext
const mockDispatch = vi.fn();
const mockSaveState = vi.fn().mockResolvedValue(undefined);
const mockSetScopeAndTab = vi.fn();

const defaultGlobalState = {
  currentUser: { id: 'user_test', email: 'test@example.com' },
  currentEntity: { id: 'entity_test', name: 'Ente Test' },
  currentYear: 2026,
  localSources: {},
  fundData: {
    metadata: { snapshotStatus: 'DRAFT' },
    historicalData: { manualPersonalFundLimit2016: 1000 },
    annualData: { otherPreservedField: 42 },
    fondoAccessorioDipendenteData: {},
    fondoElevateQualificazioniData: {},
    fondoSegretarioComunaleData: {},
    fondoDirigenzaData: {}
  } as any
};

let currentGlobalState = { ...defaultGlobalState };

vi.mock('../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: currentGlobalState,
    dispatch: mockDispatch,
    saveState: mockSaveState,
    setScopeAndTab: mockSetScopeAndTab
  }),
  NavigationScope: {
    FONDO: 'FONDO',
    WIZARD: 'WIZARD'
  }
}));

const mockWizardState: any = {
  meta: {
    currentStep: 8,
    isPreviewMode: true,
    canTransferToLegacy: true
  },
  ente: {
    hasDirigenza: false,
    annoRiferimento: 2026
  },
  art23: {
    limite2016CertificatoEnte: 5000,
    result: {
      limiteArt23Attualizzato: 5500
    },
    checks: []
  },
  ccnl2026: {
    result: {
      isCalcolabile: true,
      incrementoStabile014: 100,
      arretrati014: 50,
      incremento022Fondo: 200,
      incremento022EQ: 300
    },
    checks: []
  },
  conglobamentoArt60: {
    result: {
      riduzioneTotale: 150
    },
    checks: []
  },
  straordinario: {
    result: {
      riduzioneFondoDecentratoPerStraordinario: 80
    },
    checks: []
  },
  dl25: {
    incrementoApplicato: 0,
    checks: []
  },
  pnrr: {
    result: {
      isApplicabile: false
    },
    checks: []
  }
};

describe('Wizard 2026 -> Fondo Transfer Atomicity & Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentGlobalState = JSON.parse(JSON.stringify(defaultGlobalState));
    sessionStorage.clear();
    localStorage.clear();
    // Mock window.history.pushState
    vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. closed snapshot blocks transfer immediately before any remote saves', async () => {
    currentGlobalState.fundData.metadata.snapshotStatus = 'CLOSED';

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Step8RiepilogoPreview state={mockWizardState} />);

    // Apri modale - Cliccando il pulsante
    fireEvent.click(screen.getByRole('button', { name: /^Trasferisci i dati alla costituzione del fondo/i }));
    
    // Verifica checkbox
    const checkbox = screen.getByLabelText(/Confermo di aver verificato i dati istruttori/i);
    fireEvent.click(checkbox);

    // Clicca conferma
    const confirmBtn = screen.getByText(/Conferma e compila Costituzione Fondo/i);
    fireEvent.click(confirmBtn);

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('chiusa (CLOSED)'));
    expect(mockSaveState).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockSetScopeAndTab).not.toHaveBeenCalled();
  });

  it('2. pre-prepares rollback snapshot in sessionStorage before saveState execution', async () => {
    let snapshotInSessionDuringSave = null;
    mockSaveState.mockImplementation(async () => {
      snapshotInSessionDuringSave = sessionStorage.getItem('wizard2026_transfer_snapshot_user_test_entity_test_2026');
      return undefined;
    });

    render(<Step8RiepilogoPreview state={mockWizardState} />);
    fireEvent.click(screen.getByRole('button', { name: /^Trasferisci i dati alla costituzione del fondo/i }));
    
    const checkbox = screen.getByLabelText(/Confermo di aver verificato i dati istruttori/i);
    fireEvent.click(checkbox);

    const confirmBtn = screen.getByText(/Conferma e compila Costituzione Fondo/i);
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockSaveState).toHaveBeenCalled());

    // Verifica che lo snapshot sia stato registrato in sessionStorage *durante* l'esecuzione di saveState
    expect(snapshotInSessionDuringSave).not.toBeNull();
    const snapObj = JSON.parse(snapshotInSessionDuringSave!);
    expect(snapObj.historicalData.manualPersonalFundLimit2016).toBe(1000);
  });

  it('3. saveState failure does not touch React memory state, does not navigate and displays error', async () => {
    mockSaveState.mockRejectedValueOnce(new Error("Supabase network error"));

    render(<Step8RiepilogoPreview state={mockWizardState} />);
    fireEvent.click(screen.getByRole('button', { name: /^Trasferisci i dati alla costituzione del fondo/i }));
    
    const checkbox = screen.getByLabelText(/Confermo di aver verificato i dati istruttori/i);
    fireEvent.click(checkbox);

    const confirmBtn = screen.getByText(/Conferma e compila Costituzione Fondo/i);
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockSaveState).toHaveBeenCalled());

    // Lo stato React locale/globale non deve essere aggiornato
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockSetScopeAndTab).not.toHaveBeenCalled();

    // La modale deve mostrare l'errore
    expect(await screen.findByText(/Errore di rete \/ salvataggio remoto/i)).toBeInTheDocument();
    expect(screen.getByText(/Supabase network error/i)).toBeInTheDocument();
  });

  it('4. saveState succeeds + last_transfer fails yields transfer success, React state update, and navigation', async () => {
    mockSaveState.mockResolvedValueOnce(undefined);
    const mockSaveLastTransfer = vi.fn().mockRejectedValueOnce(new Error("Last transfer sync failed"));

    render(<Step8RiepilogoPreview state={mockWizardState} onSaveLastTransfer={mockSaveLastTransfer} />);
    fireEvent.click(screen.getByRole('button', { name: /^Trasferisci i dati alla costituzione del fondo/i }));
    
    const checkbox = screen.getByLabelText(/Confermo di aver verificato i dati istruttori/i);
    fireEvent.click(checkbox);

    const confirmBtn = screen.getByText(/Conferma e compila Costituzione Fondo/i);
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockSaveState).toHaveBeenCalled());
    await waitFor(() => expect(mockSaveLastTransfer).toHaveBeenCalled());

    // Se saveState riesce ma last_transfer fallisce, il trasferimento è comunque andato a buon fine
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'IMPORT_FUND_DATA' }));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_LOCAL_SOURCES' }));
    expect(mockSetScopeAndTab).toHaveBeenCalledWith(NavigationScope.FONDO, 'fondoDipendenti');
    expect(window.history.pushState).toHaveBeenCalledWith(null, '', '/');
    expect(sessionStorage.getItem('wizard2026_transfer_success_user_test_entity_test_2026')).toBe('true');
  });

  it('5. double-clicking confirm button blocks concurrent transfers', async () => {
    let resolveSave: any;
    const savePromise = new Promise((resolve) => {
      resolveSave = resolve;
    });
    mockSaveState.mockReturnValueOnce(savePromise);

    render(<Step8RiepilogoPreview state={mockWizardState} />);
    fireEvent.click(screen.getByRole('button', { name: /^Trasferisci i dati alla costituzione del fondo/i }));
    
    const checkbox = screen.getByLabelText(/Confermo di aver verificato i dati istruttori/i);
    fireEvent.click(checkbox);

    const confirmBtn = screen.getByText(/Conferma e compila Costituzione Fondo/i);
    
    // Clicca due volte consecutive
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);

    expect(mockSaveState).toHaveBeenCalledTimes(1); // Chiamato una sola volta!

    resolveSave();
  });

  it('6. applyWizard2026Transfer retains all other unrelated data in fundData', () => {
    const customFundData = {
      metadata: { snapshotStatus: 'DRAFT' },
      historicalData: { manualPersonalFundLimit2016: 1000, otherHistoricPreserved: 'preserved_value' },
      annualData: { otherPreservedField: 42, hasDirigenza: true },
      fondoAccessorioDipendenteData: { existingFondoVal: 999 },
      fondoElevateQualificazioniData: {},
      fondoSegretarioComunaleData: { segretarioVal: 50 },
      fondoDirigenzaData: {}
    } as any;

    const result = applyWizard2026Transfer(mockWizardState, customFundData, {}) as any;

    // Verifica che i dati calcolati o scritti dal wizard ci siano
    expect(result.fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021).toBe(100);

    // Verifica che i dati non coinvolti dal wizard siano interamente preservati
    expect(result.historicalData.otherHistoricPreserved).toBe('preserved_value');
    expect(result.annualData.otherPreservedField).toBe(42);
    expect(result.fondoAccessorioDipendenteData.existingFondoVal).toBe(999);
    expect(result.fondoSegretarioComunaleData.segretarioVal).toBe(50);
  });

  it('7. saveState is executed with correct year and entity context parameters', async () => {
    mockSaveState.mockResolvedValueOnce(undefined);

    render(<Step8RiepilogoPreview state={mockWizardState} />);
    fireEvent.click(screen.getByRole('button', { name: /^Trasferisci i dati alla costituzione del fondo/i }));
    
    const checkbox = screen.getByLabelText(/Confermo di aver verificato i dati istruttori/i);
    fireEvent.click(checkbox);

    const confirmBtn = screen.getByText(/Conferma e compila Costituzione Fondo/i);
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockSaveState).toHaveBeenCalled());

    // La firma corretta è saveState(updatedFundData, undefined, targetYear, targetEntity)
    expect(mockSaveState).toHaveBeenCalledWith(
      expect.any(Object), // updatedFundData
      undefined,
      2026, // currentYear
      currentGlobalState.currentEntity // currentEntity
    );
  });
});
