import { StrictMode } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AnnualSnapshotStatus,
  NavigationScope,
  UserRole,
  type AppState,
  type CalculationResult,
  type CanonicalFundStatus,
  type ComplianceCheck,
  type Entity,
  type FundData,
} from '../../domain';
import {
  INITIAL_ANNUAL_DATA,
  INITIAL_DISTRIBUZIONE_RISORSE_DATA,
  INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA,
  INITIAL_FONDO_DIRIGENZA_DATA,
  INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA,
  INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA,
  INITIAL_HISTORICAL_DATA,
} from '../../test/fixtures/legacyDemoFund';
import { getModuleById } from '../../application/registry/moduleRegistry';
import { CabinaDiRegiaPage } from '../CabinaDiRegiaPage';

const mockSetScopeAndTab = vi.fn();
let mockPerformLocalCalculation = vi.fn();
let mockState: AppState;
let mockIsYearSwitching = false;

// Fixture stateful aderente alle semantiche del reducer reale:
// validation/loading sostituiscono AppState ma preservano fundData; modifiche e
// idratazioni forniscono invece una nuova reference fundData.
vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: mockState,
    setScopeAndTab: mockSetScopeAndTab,
    performLocalCalculation: mockPerformLocalCalculation,
    isYearSwitching: mockIsYearSwitching,
  }),
}));

const ENTITY_A: Entity = { id: 'ente-a', name: 'Comune Alfa', user_id: 'user-1' };
const ENTITY_B: Entity = { id: 'ente-b', name: 'Comune Beta', user_id: 'user-1' };

function createComplianceCheck(overrides: Partial<ComplianceCheck> = {}): ComplianceCheck {
  return {
    id: 'CHECK-1',
    descrizione: 'Verifica strutturata',
    isCompliant: false,
    messaggio: 'Intervento richiesto',
    riferimentoNormativo: 'Norma di test',
    gravita: 'error',
    ...overrides,
  };
}

type CanonicalOptions = {
  total?: number | null;
  verifiedTotal?: number;
  warnings?: string[];
  missingPrerequisites?: string[];
};

function createCalculationResult(
  status: CanonicalFundStatus,
  year = 2026,
  options: CanonicalOptions = {}
): CalculationResult {
  const total = options.total === undefined ? (status === 'VALID' ? 1200 : null) : options.total;
  const verifiedTotal = options.verifiedTotal ?? 700;
  const fundResult = (fundTotal: number) => ({
    label: 'Fondo',
    summary: {
      totaleStabile: fundTotal,
      totaleVariabile: 0,
      totaleFondo: fundTotal,
    },
  });

  return {
    metadata: {
      annoRiferimento: year,
      denominazioneEnte: 'Ente fixture',
      timestamp: '2026-01-01T00:00:00.000Z',
    },
    inputs: {
      hasDirigenza: false,
      isEnteInCondizioniSpeciali: false,
      fteAnnoRiferimento: 10,
      tipologiaEnte: 'Comune',
    },
    fondi: {
      dipendente: fundResult(total ?? verifiedTotal),
      eq: fundResult(100),
      segretario: fundResult(50),
      dirigenza: fundResult(0),
    },
    canonicalFund: {
      stableTotal: status === 'VALID' ? total : null,
      variableTotal: status === 'VALID' ? 0 : null,
      total,
      verifiedStableTotal: verifiedTotal,
      verifiedVariableTotal: 0,
      verifiedTotal,
      art23Subject: status === 'VALID' ? verifiedTotal : null,
      art23Excluded: status === 'VALID' ? 0 : null,
      verifiedArt23Subject: verifiedTotal,
      verifiedArt23Excluded: 0,
      entries: [],
      status,
      warnings: options.warnings ?? [],
      missingPrerequisites: options.missingPrerequisites ?? [],
    },
    compliance: {
      checks: [],
      art23c2: {
        limite: 2000,
        valoreSoggetto: verifiedTotal,
        delta: 2000 - verifiedTotal,
        isCompliant: true,
      },
    },
    totals: {
      stabile: verifiedTotal,
      variabile: 0,
      totaleFondo: total ?? verifiedTotal,
    },
    alerts: [],
  };
}

type FundDataOptions = {
  year?: number;
  snapshotStatus?: AnnualSnapshotStatus;
  distribution?: FundData['distribuzioneRisorseData'];
  documentMetadata?: FundData['annualData']['documentMetadata'];
};

function createFundData(options: FundDataOptions = {}): FundData {
  return {
    historicalData: { ...INITIAL_HISTORICAL_DATA },
    annualData: {
      ...INITIAL_ANNUAL_DATA,
      annoRiferimento: options.year ?? 2026,
      hasDirigenza: false,
      documentMetadata: options.documentMetadata,
    },
    fondoAccessorioDipendenteData: { ...INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA },
    fondoElevateQualificazioniData: { ...INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA },
    fondoSegretarioComunaleData: { ...INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA },
    fondoDirigenzaData: { ...INITIAL_FONDO_DIRIGENZA_DATA },
    distribuzioneRisorseData: options.distribution ?? {
      ...INITIAL_DISTRIBUZIONE_RISORSE_DATA,
    },
    personaleServizio: {
      dettagli: [],
      isManualMode: false,
      manualProgressioni: 0,
      manualIndennita: 0,
      manualDipendentiEquivalenti: 0,
    },
    metadata: {
      snapshotStatus: options.snapshotStatus ?? AnnualSnapshotStatus.OPEN,
    },
  };
}

type StateOptions = {
  entity?: Entity;
  entities?: Entity[];
  userRole?: UserRole;
  year?: number;
  calculationResult?: CalculationResult;
  complianceChecks?: ComplianceCheck[];
  fundData?: FundData;
};

function createState(options: StateOptions = {}): AppState {
  const entity = options.entity ?? ENTITY_A;
  const year = options.year ?? 2026;
  return {
    currentUser: {
      id: 'user-1',
      name: 'Tester',
      role: options.userRole ?? UserRole.ADMIN,
    },
    currentYear: year,
    entities: options.entities ?? [entity],
    currentEntity: entity,
    fundData: options.fundData ?? createFundData({ year }),
    calculationResult: options.calculationResult,
    complianceChecks: options.complianceChecks ?? [],
    isLoading: false,
    isNormativeDataLoading: false,
    validationErrors: {},
    activeTab: 'cabinaDiRegia',
    navigationScope: NavigationScope.FONDO,
    isYearSwitching: false,
  };
}

function expectStatus(label: string) {
  expect(screen.getByTestId('cabina-operational-status')).toHaveTextContent(label);
}

describe('CabinaDiRegiaPage Wave 4.1 integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockPerformLocalCalculation = vi.fn();
    mockIsYearSwitching = false;
    mockState = createState();
    window.history.replaceState(null, '', '/');
  });

  it('T1 — renders NOT_STARTED with the Wizard primary action', () => {
    render(<CabinaDiRegiaPage />);

    expectStatus('Da iniziare');
    expect(screen.getByTestId('cabina-primary-cta')).toHaveTextContent('Inizia raccolta dati');
  });

  it('T2 — renders TO_COMPLETE with the constitution primary action', () => {
    mockState = createState({ calculationResult: createCalculationResult('UNDETERMINED') });
    render(<CabinaDiRegiaPage />);

    expectStatus('Da completare');
    expect(screen.getByTestId('cabina-primary-cta')).toHaveTextContent('Vai alla Costituzione');
  });

  it('T3 — renders BLOCKED for an INVALID canonical fund with no compliance checks', () => {
    mockState = createState({
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [],
    });
    render(<CabinaDiRegiaPage />);

    expectStatus('Bloccato');
    expect(screen.getByTestId('cabina-primary-cta')).toHaveTextContent('Apri le verifiche');
  });

  it('T4 — renders CONSTITUTION_VERIFIED and its canonical definitive total', () => {
    mockState = createState({
      calculationResult: createCalculationResult('VALID', 2026, { total: 1234 }),
    });
    render(<CabinaDiRegiaPage />);

    expectStatus('Costituzione verificata');
    expect(screen.getByTestId('constitution-definitive-total')).toHaveTextContent('€ 1234,00');
    expect(mockPerformLocalCalculation).not.toHaveBeenCalled();
  });

  it('T5 — renders DISTRIBUTION_IN_PROGRESS from a positive structured detail', () => {
    mockState = createState({
      calculationResult: createCalculationResult('VALID'),
      fundData: createFundData({
        distribution: {
          ...INITIAL_DISTRIBUZIONE_RISORSE_DATA,
          p_performanceIndividuale: { stanziate: 1 },
        },
      }),
    });
    render(<CabinaDiRegiaPage />);

    expectStatus('Distribuzione in corso');
    expect(screen.getByTestId('pipeline-distribuzioneRisorse')).toHaveTextContent('In lavorazione');
    expect(screen.getByTestId('cabina-primary-cta')).toHaveTextContent('Riprendi la Distribuzione');
  });

  it('T6 — gives CLOSED precedence without a calculation and exposes no primary mutation', () => {
    mockState = createState({
      fundData: createFundData({ snapshotStatus: AnnualSnapshotStatus.CLOSED }),
    });
    render(<CabinaDiRegiaPage />);

    expectStatus('Chiuso');
    expect(screen.queryByTestId('cabina-primary-cta')).not.toBeInTheDocument();
    expect(screen.queryByText('Inizia raccolta dati')).not.toBeInTheDocument();
    expect(mockPerformLocalCalculation).not.toHaveBeenCalled();
  });

  it('T7 — hides an accidental definitive total when the canonical fund is INVALID', () => {
    mockState = createState({
      calculationResult: createCalculationResult('INVALID', 2026, {
        total: 9999,
        verifiedTotal: 700,
      }),
    });
    render(<CabinaDiRegiaPage />);

    expect(screen.queryByTestId('constitution-definitive-total')).not.toBeInTheDocument();
    expect(screen.getByTestId('constitution-total-summary')).toHaveTextContent('Non disponibile');
    expect(screen.getByTestId('constitution-verified-subtotal')).toHaveTextContent('€ 700,00');
  });

  it('T8 — hides an accidental definitive total when the canonical fund is UNDETERMINED', () => {
    mockState = createState({
      calculationResult: createCalculationResult('UNDETERMINED', 2026, {
        total: 8888,
        verifiedTotal: 600,
      }),
    });
    render(<CabinaDiRegiaPage />);

    expect(screen.queryByTestId('constitution-definitive-total')).not.toBeInTheDocument();
    expect(screen.getByTestId('constitution-total-summary')).toHaveTextContent('Non disponibile');
    expect(screen.getByTestId('constitution-verified-subtotal')).toHaveTextContent('€ 600,00');
  });

  it('T9 — keeps TO_COMPLETE when Wizard progress is 100 percent', () => {
    localStorage.setItem(
      'fl_wizard2026_draft_user-1_ente-a_2026',
      JSON.stringify({ meta: { completedSteps: [1, 2, 3, 4, 5, 6, 7, 8] } })
    );
    mockState = createState({ calculationResult: createCalculationResult('UNDETERMINED') });
    render(<CabinaDiRegiaPage />);

    expectStatus('Da completare');
    expect(screen.getByTestId('cabina-primary-cta')).toHaveTextContent('Vai alla Costituzione');
  });

  it('T10 — multiple warnings do not degrade a VALID canonical fund', () => {
    mockState = createState({
      calculationResult: createCalculationResult('VALID', 2026, {
        warnings: ['Avviso canonico 1', 'Avviso canonico 2'],
      }),
    });
    render(<CabinaDiRegiaPage />);

    expectStatus('Costituzione verificata');
    expect(screen.getByTestId('warning-issues-count')).toHaveTextContent('2');
  });

  it('T11 — keeps document readiness and attestations distinct from operational status', () => {
    mockState = createState({
      calculationResult: createCalculationResult('UNDETERMINED'),
      fundData: createFundData({
        documentMetadata: {
          numVerbaleRevisori: '12',
          dataVerbaleRevisori: '15/03/2026',
          opinionOutcome: 'FAVORABLE',
          numDeliberaGc: '7',
          dataDeliberaGc: '20/03/2026',
          adoptionStatus: 'DOCUMENTED_ADOPTED',
        },
      }),
    });
    render(<CabinaDiRegiaPage />);

    expectStatus('Da completare');
    expect(screen.getByTestId('documents-readiness')).toHaveTextContent('Bozza');
    expect(screen.getByTestId('documents-revisori')).toHaveTextContent('Documentato');
    expect(screen.getByTestId('documents-delibera')).toHaveTextContent('Documentata');
  });

  it('T12 — navigates through the exact primaryAction target', () => {
    mockState = createState({ calculationResult: createCalculationResult('UNDETERMINED') });
    render(<CabinaDiRegiaPage />);

    fireEvent.click(screen.getByTestId('cabina-primary-cta'));
    expect(mockSetScopeAndTab).toHaveBeenCalledWith(
      NavigationScope.FONDO,
      'fondoDipendenti'
    );
  });

  it('T13 — isolates the hydrated entity before and after its recalculation', () => {
    const entityAFundData = createFundData({
      documentMetadata: {
        numVerbaleRevisori: '12',
        dataVerbaleRevisori: '15/03/2026',
        opinionOutcome: 'FAVORABLE',
      },
    });
    mockState = createState({
      fundData: entityAFundData,
      calculationResult: createCalculationResult('VALID', 2026, { total: 100 }),
    });
    const view = render(<CabinaDiRegiaPage />);
    expect(screen.getByText('Comune Alfa')).toBeInTheDocument();
    expect(screen.getByTestId('constitution-definitive-total')).toHaveTextContent('€ 100,00');
    expect(screen.getByTestId('documents-revisori')).toHaveTextContent('Documentato');

    mockIsYearSwitching = true;
    view.rerender(<CabinaDiRegiaPage />);
    expect(screen.getByTestId('cabina-year-switching')).toBeInTheDocument();

    const entityBFundData = createFundData({ year: 2026 });
    mockState = createState({
      entity: ENTITY_B,
      entities: [ENTITY_B],
      fundData: entityBFundData,
    });
    view.rerender(<CabinaDiRegiaPage />);
    expect(screen.getByTestId('cabina-year-switching')).toBeInTheDocument();

    mockIsYearSwitching = false;
    view.rerender(<CabinaDiRegiaPage />);
    expect(screen.getByText('Comune Beta')).toBeInTheDocument();
    expect(screen.queryByTestId('constitution-definitive-total')).not.toBeInTheDocument();
    expect(screen.queryByTestId('document-status-card')).not.toBeInTheDocument();
    expect(mockPerformLocalCalculation).toHaveBeenCalledTimes(1);

    mockState = createState({
      entity: ENTITY_B,
      entities: [ENTITY_B],
      fundData: entityBFundData,
      calculationResult: createCalculationResult('VALID', 2026, { total: 200 }),
    });
    view.rerender(<CabinaDiRegiaPage />);
    expect(screen.getByText('Comune Beta')).toBeInTheDocument();
    expect(screen.getByTestId('constitution-definitive-total')).toHaveTextContent('€ 200,00');
    expect(screen.getByTestId('documents-revisori')).toHaveTextContent('Non documentato');
  });

  it('T14 — isolates the hydrated annuality before and after its recalculation', () => {
    const fundData2025 = createFundData({
      year: 2025,
      documentMetadata: {
        numVerbaleRevisori: '25',
        dataVerbaleRevisori: '15/03/2025',
        opinionOutcome: 'FAVORABLE',
      },
    });
    mockState = createState({
      year: 2025,
      fundData: fundData2025,
      calculationResult: createCalculationResult('VALID', 2025, { total: 500 }),
    });
    const view = render(<CabinaDiRegiaPage />);
    expect(screen.getAllByText(/2025/).length).toBeGreaterThan(0);
    expect(screen.getByTestId('constitution-definitive-total')).toHaveTextContent('€ 500,00');
    expect(screen.getByTestId('documents-revisori')).toHaveTextContent('Documentato');

    mockIsYearSwitching = true;
    view.rerender(<CabinaDiRegiaPage />);
    expect(screen.getByTestId('cabina-year-switching')).toBeInTheDocument();
    expect(screen.queryByTestId('constitution-definitive-total')).not.toBeInTheDocument();

    const fundData2026 = createFundData({ year: 2026 });
    mockState = createState({
      year: 2026,
      fundData: fundData2026,
    });
    view.rerender(<CabinaDiRegiaPage />);
    expect(screen.getByTestId('cabina-year-switching')).toBeInTheDocument();

    mockIsYearSwitching = false;
    view.rerender(<CabinaDiRegiaPage />);
    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0);
    expect(screen.queryByTestId('constitution-definitive-total')).not.toBeInTheDocument();
    expect(screen.queryByTestId('document-status-card')).not.toBeInTheDocument();
    expect(mockPerformLocalCalculation).toHaveBeenCalledTimes(1);

    mockState = createState({
      year: 2026,
      fundData: fundData2026,
      calculationResult: createCalculationResult('VALID', 2026, { total: 600 }),
    });
    view.rerender(<CabinaDiRegiaPage />);
    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0);
    expect(screen.getByTestId('constitution-definitive-total')).toHaveTextContent('€ 600,00');
    expect(screen.getByTestId('documents-revisori')).toHaveTextContent('Non documentato');
  });

  it('T15 — does not reuse a previous ViewModel after calculation data is cleared', () => {
    mockState = createState({ calculationResult: createCalculationResult('VALID') });
    const view = render(<CabinaDiRegiaPage />);
    expectStatus('Costituzione verificata');

    mockState = createState();
    view.rerender(<CabinaDiRegiaPage />);

    expectStatus('Da iniziare');
    expect(screen.queryByTestId('constitution-definitive-total')).not.toBeInTheDocument();
    expect(screen.getByTestId('cabina-primary-cta')).toHaveTextContent('Inizia raccolta dati');
  });

  it('T16 — keeps hook order stable from the empty screen to a populated Cabina', () => {
    mockState = createState({ entities: [] });
    mockState = { ...mockState, currentEntity: undefined };
    const view = render(<CabinaDiRegiaPage />);
    expect(screen.getByTestId('first-access-select-entity-btn')).toBeInTheDocument();

    mockState = createState({ calculationResult: createCalculationResult('VALID') });
    expect(() => view.rerender(<CabinaDiRegiaPage />)).not.toThrow();

    expect(screen.getByTestId('cabina-di-regia-page')).toBeInTheDocument();
    expectStatus('Costituzione verificata');
    expect(within(screen.getByTestId('document-status-card')).getByText('Stato documenti')).toBeInTheDocument();
  });

  it('S3-001 — renders the operational empty state when the ViewModel has no issues', () => {
    mockState = createState({ calculationResult: createCalculationResult('VALID') });
    render(<CabinaDiRegiaPage />);

    expect(screen.getByText('Nessuna criticità o prerequisito segnalato.')).toBeInTheDocument();
    expect(screen.queryByTestId('cabina-issues-list')).not.toBeInTheDocument();
  });

  it('S3-002 — renders blocking title, detail, textual severity and exact target', () => {
    mockState = createState({
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [createComplianceCheck({
        id: 'BLOCK-1',
        descrizione: 'Superamento del limite',
        messaggio: 'Ridurre l’importo prima di procedere.',
        relatedPage: 'fundDetails',
      })],
    });
    render(<CabinaDiRegiaPage />);

    const issue = screen.getByTestId('cabina-issue');
    expect(issue).toHaveAttribute('data-severity', 'BLOCKING');
    expect(within(issue).getByText('Bloccante')).toBeInTheDocument();
    expect(within(issue).getByText('Superamento del limite')).toBeInTheDocument();
    expect(within(issue).getByText('Ridurre l’importo prima di procedere.')).toBeInTheDocument();
    expect(within(issue).getByText('Sezione: Dettagli')).toBeInTheDocument();
  });

  it('S3-003 — renders a missing prerequisite with the fondoDipendenti fallback', () => {
    mockState = createState({
      calculationResult: createCalculationResult('UNDETERMINED', 2026, {
        missingPrerequisites: ['Acquisire il dato certificato'],
      }),
    });
    render(<CabinaDiRegiaPage />);

    const issue = screen.getByTestId('cabina-issue');
    expect(issue).toHaveAttribute('data-severity', 'MISSING_PREREQUISITE');
    expect(within(issue).getByText('Prerequisito mancante')).toBeInTheDocument();
    expect(within(issue).getByRole('button', { name: 'Apri Fondo Personale' })).toBeInTheDocument();
  });

  it('S3-004 — renders a targetless canonical warning without inventing navigation', () => {
    mockState = createState({
      calculationResult: createCalculationResult('VALID', 2026, {
        warnings: ['Avvertenza canonica senza destinazione'],
      }),
    });
    render(<CabinaDiRegiaPage />);

    const issue = screen.getByTestId('cabina-issue');
    expect(issue).toHaveAttribute('data-severity', 'WARNING');
    expect(within(issue).getByText('Avvertenza')).toBeInTheDocument();
    expect(within(issue).getByText('Nessuna sezione specifica')).toBeInTheDocument();
    expect(within(issue).getByText('Nessuna sezione specifica indicata.')).toBeInTheDocument();
    expect(within(issue).queryByRole('button')).not.toBeInTheDocument();
  });

  it('S3-005 — orders severities while preserving source order inside each category', () => {
    mockState = createState({
      calculationResult: createCalculationResult('UNDETERMINED', 2026, {
        missingPrerequisites: ['Prerequisito 1'],
        warnings: ['Warning canonico'],
      }),
      complianceChecks: [
        createComplianceCheck({ id: 'WARN-1', descrizione: 'Warning compliance', gravita: 'warning' }),
        createComplianceCheck({ id: 'BLOCK-1', descrizione: 'Bloccante 1', gravita: 'error' }),
        createComplianceCheck({ id: 'BLOCK-2', descrizione: 'Bloccante 2', gravita: 'error' }),
      ],
    });
    render(<CabinaDiRegiaPage />);

    const issues = screen.getAllByTestId('cabina-issue');
    expect(issues.map(issue => issue.getAttribute('data-severity'))).toEqual([
      'BLOCKING',
      'BLOCKING',
      'MISSING_PREREQUISITE',
      'WARNING',
      'WARNING',
    ]);
    expect(within(issues[0]).getByText('Bloccante 1')).toBeInTheDocument();
    expect(within(issues[1]).getByText('Bloccante 2')).toBeInTheDocument();
    expect(within(issues[3]).getByText('Warning compliance')).toBeInTheDocument();
    expect(within(issues[4]).getByText('Warning canonico')).toBeInTheDocument();
  });

  it('S3-006 — navigates an issue through the registry scope', () => {
    mockState = createState({
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [createComplianceCheck({ relatedPage: 'distribuzioneRisorse' })],
    });
    render(<CabinaDiRegiaPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Apri Distribuzione' }));
    expect(mockSetScopeAndTab).toHaveBeenCalledWith(
      NavigationScope.FONDO,
      'distribuzioneRisorse'
    );
  });

  it('S3-007 — uses the DASHBOARD registry scope and preserves the Wizard URL', () => {
    mockState = createState({
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [createComplianceCheck({ relatedPage: 'wizard2026Preview' })],
    });
    render(<CabinaDiRegiaPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Apri Configurazione fondo' }));
    expect(mockSetScopeAndTab).toHaveBeenCalledWith(
      NavigationScope.DASHBOARD,
      'wizard2026Preview'
    );
    expect(window.location.pathname).toBe('/configurazione-fondo-preview/raccolta-dati');
  });

  it('S3-008 — keeps an unknown target visible without an active navigation control', () => {
    mockState = createState({
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [createComplianceCheck({ relatedPage: 'missingModule' })],
    });
    render(<CabinaDiRegiaPage />);

    const issue = screen.getByTestId('cabina-issue');
    expect(within(issue).getByText('Sezione indicata: missingModule')).toBeInTheDocument();
    expect(within(issue).getByText('La sezione indicata non è disponibile.')).toBeInTheDocument();
    expect(within(issue).queryByRole('button')).not.toBeInTheDocument();
    expect(mockSetScopeAndTab).not.toHaveBeenCalled();
  });

  it('S3-009 — respects a module disabled through the real registry contract', () => {
    const targetModule = getModuleById('fundDetails');
    if (!targetModule) throw new Error('Expected fundDetails in moduleRegistry');
    const previousDisabled = targetModule.isDisabled;
    const previousReason = targetModule.disabledReason;
    targetModule.isDisabled = true;
    targetModule.disabledReason = 'Modulo sospeso per manutenzione.';

    try {
      mockState = createState({
        calculationResult: createCalculationResult('INVALID'),
        complianceChecks: [createComplianceCheck({ relatedPage: 'fundDetails' })],
      });
      render(<CabinaDiRegiaPage />);

      const issue = screen.getByTestId('cabina-issue');
      expect(within(issue).getByText('Modulo sospeso per manutenzione.')).toBeInTheDocument();
      expect(within(issue).queryByRole('button')).not.toBeInTheDocument();
    } finally {
      targetModule.isDisabled = previousDisabled;
      targetModule.disabledReason = previousReason;
    }
  });

  it('S3-010 — respects module authorization for the active user', () => {
    mockState = createState({
      userRole: UserRole.GUEST,
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [createComplianceCheck({ relatedPage: 'userManagement' })],
    });
    render(<CabinaDiRegiaPage />);

    const issue = screen.getByTestId('cabina-issue');
    expect(within(issue).getByText('Sezione: Utenti')).toBeInTheDocument();
    expect(within(issue).getByText('La sezione non è accessibile nel contesto corrente.')).toBeInTheDocument();
    expect(within(issue).queryByRole('button')).not.toBeInTheDocument();
  });

  it('S3-010B — respects dirigenzaOnly requirements from the registry', () => {
    mockState = createState({
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [createComplianceCheck({ relatedPage: 'fondoDirigenza' })],
    });
    render(<CabinaDiRegiaPage />);

    const issue = screen.getByTestId('cabina-issue');
    expect(within(issue).getByText('Sezione: Fondo Dirigenza')).toBeInTheDocument();
    expect(within(issue).getByText('La sezione non è accessibile nel contesto corrente.')).toBeInTheDocument();
    expect(within(issue).queryByRole('button')).not.toBeInTheDocument();
  });

  it('S3-011 — G9 renders primary and secondary actions together and navigates the secondary', () => {
    mockState = createState({
      calculationResult: createCalculationResult('UNDETERMINED'),
      fundData: createFundData({
        distribution: {
          ...INITIAL_DISTRIBUZIONE_RISORSE_DATA,
          p_performanceIndividuale: { stanziate: 1 },
        },
      }),
    });
    render(<CabinaDiRegiaPage />);

    expectStatus('Da completare');
    expect(screen.getByTestId('cabina-primary-cta')).toHaveTextContent('Vai alla Costituzione');
    const secondary = screen.getByTestId('cabina-secondary-cta');
    expect(secondary).toHaveTextContent('Riprendi la Distribuzione');

    fireEvent.click(secondary);
    expect(mockSetScopeAndTab).toHaveBeenCalledWith(
      NavigationScope.FONDO,
      'distribuzioneRisorse'
    );
  });

  it('S3-012 — CLOSED keeps issues visible and only enables verified consultative targets', () => {
    mockState = createState({
      calculationResult: createCalculationResult('UNDETERMINED', 2026, {
        missingPrerequisites: ['Prerequisito da consultare'],
      }),
      complianceChecks: [
        createComplianceCheck({ id: 'WIZARD', descrizione: 'Dato Wizard', relatedPage: 'wizard2026Preview' }),
        createComplianceCheck({ id: 'DETAILS', descrizione: 'Dettaglio calcolo', relatedPage: 'fundDetails' }),
        createComplianceCheck({ id: 'DISTR', descrizione: 'Dettaglio distribuzione', relatedPage: 'distribuzioneRisorse' }),
      ],
      fundData: createFundData({
        snapshotStatus: AnnualSnapshotStatus.CLOSED,
        distribution: {
          ...INITIAL_DISTRIBUZIONE_RISORSE_DATA,
          p_performanceIndividuale: { stanziate: 1 },
        },
      }),
    });
    render(<CabinaDiRegiaPage />);

    expectStatus('Chiuso');
    expect(screen.getAllByTestId('cabina-issue')).toHaveLength(4);
    expect(screen.queryByTestId('cabina-primary-cta')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cabina-secondary-cta')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Configurazione fondo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Fondo Personale/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Consulta Dettagli' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Consulta Distribuzione' })).toBeInTheDocument();
  });

  it('S3-013 — replaces entity issues without retaining the previous checklist', () => {
    mockState = createState({
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [createComplianceCheck({ descrizione: 'Issue ente Alfa' })],
    });
    const view = render(<CabinaDiRegiaPage />);
    expect(screen.getByText('Issue ente Alfa')).toBeInTheDocument();

    mockIsYearSwitching = true;
    view.rerender(<CabinaDiRegiaPage />);
    mockState = createState({
      entity: ENTITY_B,
      entities: [ENTITY_B],
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [createComplianceCheck({ id: 'B', descrizione: 'Issue ente Beta' })],
    });
    view.rerender(<CabinaDiRegiaPage />);
    mockIsYearSwitching = false;
    view.rerender(<CabinaDiRegiaPage />);

    expect(screen.queryByText('Issue ente Alfa')).not.toBeInTheDocument();
    expect(screen.getByText('Issue ente Beta')).toBeInTheDocument();
  });

  it('S3-014 — replaces annuality issues without retaining the previous checklist', () => {
    mockState = createState({
      year: 2025,
      fundData: createFundData({ year: 2025 }),
      calculationResult: createCalculationResult('INVALID', 2025),
      complianceChecks: [createComplianceCheck({ descrizione: 'Issue annualità 2025' })],
    });
    const view = render(<CabinaDiRegiaPage />);
    expect(screen.getByText('Issue annualità 2025')).toBeInTheDocument();

    mockIsYearSwitching = true;
    view.rerender(<CabinaDiRegiaPage />);
    mockState = createState({
      year: 2026,
      fundData: createFundData({ year: 2026 }),
      calculationResult: createCalculationResult('INVALID', 2026),
      complianceChecks: [createComplianceCheck({ id: 'Y2026', descrizione: 'Issue annualità 2026' })],
    });
    view.rerender(<CabinaDiRegiaPage />);
    mockIsYearSwitching = false;
    view.rerender(<CabinaDiRegiaPage />);

    expect(screen.queryByText('Issue annualità 2025')).not.toBeInTheDocument();
    expect(screen.getByText('Issue annualità 2026')).toBeInTheDocument();
  });

  it('S3-015 — removes stale issues after validation clears the calculation result', () => {
    mockState = createState({
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [createComplianceCheck({ descrizione: 'Issue prima della validazione' })],
    });
    const view = render(<CabinaDiRegiaPage />);
    expect(screen.getByText('Issue prima della validazione')).toBeInTheDocument();

    mockState = {
      ...mockState,
      calculationResult: undefined,
      complianceChecks: [],
      validationErrors: { 'fundData.annualData.denominazioneEnte': 'Dato obbligatorio' },
    };
    view.rerender(<CabinaDiRegiaPage />);

    expect(screen.queryByText('Issue prima della validazione')).not.toBeInTheDocument();
    expect(screen.getByTestId('cabina-not-started')).toBeInTheDocument();
  });

  it('S3-016 — updates the checklist after corrected canonical data', () => {
    mockState = createState({
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [createComplianceCheck({ descrizione: 'Issue da correggere' })],
    });
    const view = render(<CabinaDiRegiaPage />);
    expect(screen.getByText('Issue da correggere')).toBeInTheDocument();

    mockState = createState({ calculationResult: createCalculationResult('VALID') });
    view.rerender(<CabinaDiRegiaPage />);

    expect(screen.queryByText('Issue da correggere')).not.toBeInTheDocument();
    expect(screen.getByText('Nessuna criticità o prerequisito segnalato.')).toBeInTheDocument();
  });

  it('S3-017 — preserves duplicate warnings as independent stateless rows', () => {
    mockState = createState({
      calculationResult: createCalculationResult('VALID', 2026, {
        warnings: ['Warning duplicato', 'Warning duplicato'],
      }),
    });
    render(<CabinaDiRegiaPage />);

    expect(screen.getAllByTestId('cabina-issue')).toHaveLength(2);
    expect(screen.getAllByText('Warning duplicato')).toHaveLength(2);
  });

  it('S3-017B — preserves colliding codes and shared targets as separate rows', () => {
    mockState = createState({
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [
        createComplianceCheck({ id: 'SAME-CODE', descrizione: 'Prima issue', relatedPage: 'fundDetails' }),
        createComplianceCheck({ id: 'SAME-CODE', descrizione: 'Seconda issue', relatedPage: 'fundDetails' }),
      ],
    });
    render(<CabinaDiRegiaPage />);

    const issues = screen.getAllByTestId('cabina-issue');
    expect(issues).toHaveLength(2);
    expect(within(issues[0]).getByText('Prima issue')).toBeInTheDocument();
    expect(within(issues[1]).getByText('Seconda issue')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Apri Dettagli' })).toHaveLength(2);
  });

  it('S3-018 — keeps long messages readable and exposes native keyboard-focusable actions', () => {
    const longDetail = 'Verificare il dato con l’ufficio finanziario '.repeat(12).trim();
    mockState = createState({
      calculationResult: createCalculationResult('INVALID'),
      complianceChecks: [createComplianceCheck({
        descrizione: 'Messaggio operativo esteso',
        messaggio: longDetail,
        relatedPage: 'fundDetails',
      })],
    });
    render(<CabinaDiRegiaPage />);

    const list = screen.getByRole('list', { name: 'Checklist operativa' });
    const action = within(list).getByRole('button', { name: 'Apri Dettagli' });
    expect(within(list).getByRole('listitem')).toHaveTextContent(longDetail);
    expect(action.tagName).toBe('BUTTON');
    action.focus();
    expect(action).toHaveFocus();
    fireEvent.click(action);
    expect(mockSetScopeAndTab).toHaveBeenCalledWith(NavigationScope.FONDO, 'fundDetails');
  });

  it('C3/C9 — VALID plus BLOCKING renders Bloccato and routes the primary CTA to relatedPage', () => {
    mockState = createState({
      calculationResult: createCalculationResult('VALID'),
      complianceChecks: [createComplianceCheck({ relatedPage: 'fundDetails' })],
    });
    const before = structuredClone(mockState.fundData);
    render(<CabinaDiRegiaPage />);

    expectStatus('Bloccato');
    expect(screen.getAllByText('Esamina le criticità bloccanti prima di procedere.')).toHaveLength(2);
    expect(screen.getByTestId('blocking-issues-count')).toHaveTextContent('1');
    const primary = screen.getByTestId('cabina-primary-cta');
    expect(primary).toHaveTextContent('Apri le verifiche');
    expect(screen.queryByText('Inizia la Distribuzione')).not.toBeInTheDocument();
    fireEvent.click(primary);
    expect(mockSetScopeAndTab).toHaveBeenCalledWith(NavigationScope.FONDO, 'fundDetails');
    expect(mockPerformLocalCalculation).not.toHaveBeenCalled();
    expect(mockState.fundData).toEqual(before);
  });

  it('C2 — compliance WARNING preserves the distribution CTA', () => {
    mockState = createState({
      calculationResult: createCalculationResult('VALID'),
      complianceChecks: [createComplianceCheck({ gravita: 'warning' })],
    });
    render(<CabinaDiRegiaPage />);
    expectStatus('Costituzione verificata');
    expect(screen.getByTestId('cabina-primary-cta')).toHaveTextContent('Inizia la Distribuzione');
  });

  it('C4/C10 — targetless first blocker falls back to checks despite a later relatedPage', () => {
    mockState = createState({
      calculationResult: createCalculationResult('VALID'),
      complianceChecks: [
        createComplianceCheck({ id: 'Z', messaggio: 'Apri reports' }),
        createComplianceCheck({ id: 'A', relatedPage: 'fundDetails' }),
      ],
    });
    render(<CabinaDiRegiaPage />);
    expectStatus('Bloccato');
    fireEvent.click(screen.getByTestId('cabina-primary-cta'));
    expect(mockSetScopeAndTab).toHaveBeenCalledWith(NavigationScope.FONDO, 'compliance');
  });

  it('C7 — a new blocker suspends the primary resume action without altering existing work', () => {
    mockState = createState({
      calculationResult: createCalculationResult('VALID'),
      fundData: createFundData({
        distribution: {
          ...INITIAL_DISTRIBUZIONE_RISORSE_DATA,
          p_performanceIndividuale: { stanziate: 100 },
        },
      }),
    });
    const before = structuredClone(mockState.fundData);
    const view = render(<CabinaDiRegiaPage />);
    expectStatus('Distribuzione in corso');
    mockState = { ...mockState, complianceChecks: [createComplianceCheck()] };
    view.rerender(<CabinaDiRegiaPage />);

    expectStatus('Bloccato');
    expect(screen.getByTestId('pipeline-distribuzioneRisorse')).toHaveTextContent('In lavorazione');
    expect(screen.getByTestId('cabina-primary-cta')).toHaveTextContent('Apri le verifiche');
    expect(screen.queryByText('Riprendi la Distribuzione')).not.toBeInTheDocument();
    expect(mockState.fundData).toEqual(before);
    expect(mockPerformLocalCalculation).not.toHaveBeenCalled();
    expect(mockSetScopeAndTab).not.toHaveBeenCalled();
  });

  it('C8 — CLOSED plus BLOCKING stays read-only without primary or secondary CTA', () => {
    mockState = createState({
      calculationResult: createCalculationResult('VALID'),
      fundData: createFundData({ snapshotStatus: AnnualSnapshotStatus.CLOSED }),
      complianceChecks: [createComplianceCheck()],
    });
    const before = structuredClone(mockState.fundData);
    render(<CabinaDiRegiaPage />);
    expectStatus('Chiuso');
    expect(screen.getByTestId('blocking-issues-count')).toHaveTextContent('1');
    expect(screen.queryByTestId('cabina-primary-cta')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cabina-secondary-cta')).not.toBeInTheDocument();
    expect(screen.getByTestId('pipeline-distribuzioneRisorse')).toBeDisabled();
    expect(mockState.fundData).toEqual(before);
    expect(mockPerformLocalCalculation).not.toHaveBeenCalled();
  });

  it('C5 — UNDETERMINED with blocker keeps constitution primary and hides secondary resume', () => {
    mockState = createState({
      calculationResult: createCalculationResult('UNDETERMINED', 2026, {
        missingPrerequisites: ['Dato da acquisire'],
      }),
      complianceChecks: [createComplianceCheck()],
      fundData: createFundData({
        distribution: {
          ...INITIAL_DISTRIBUZIONE_RISORSE_DATA,
          p_performanceIndividuale: { stanziate: 100 },
        },
      }),
    });
    render(<CabinaDiRegiaPage />);
    expectStatus('Da completare');
    expect(screen.getByTestId('cabina-primary-cta')).toHaveTextContent('Vai alla Costituzione');
    expect(screen.queryByTestId('cabina-secondary-cta')).not.toBeInTheDocument();
    expect(screen.getByTestId('blocking-issues-count')).toHaveTextContent('1');
    expect(screen.getByTestId('missing-prerequisites-count')).toHaveTextContent('1');
  });

  it('S2-001 A — does not retry unchanged data after validation failure and callback replacement', () => {
    const initialFundData = mockState.fundData;
    const failedAttempt = vi.fn(async () => {
      mockState = {
        ...mockState,
        calculationResult: undefined,
        isLoading: false,
        validationErrors: {
          'fundData.annualData.denominazioneEnte': 'Dato obbligatorio',
        },
      };
    });
    mockPerformLocalCalculation = failedAttempt;
    const view = render(<CabinaDiRegiaPage />);

    expect(failedAttempt).toHaveBeenCalledTimes(1);
    expect(mockState.fundData).toBe(initialFundData);
    expect(mockState.calculationResult).toBeUndefined();
    expect(mockState.validationErrors).not.toEqual({});

    const replacementAfterValidation = vi.fn();
    mockPerformLocalCalculation = replacementAfterValidation;
    view.rerender(<CabinaDiRegiaPage />);

    expect(replacementAfterValidation).not.toHaveBeenCalled();

    const secondReplacement = vi.fn();
    mockPerformLocalCalculation = secondReplacement;
    mockState = { ...mockState, error: undefined, isLoading: false };
    view.rerender(<CabinaDiRegiaPage />);

    expect(secondReplacement).not.toHaveBeenCalled();
  });

  it('S2-001 B — permits one new attempt after a real fundData correction', () => {
    const initialFundData = mockState.fundData;
    const failedAttempt = vi.fn(async () => {
      mockState = {
        ...mockState,
        calculationResult: undefined,
        isLoading: false,
        validationErrors: { 'fundData.annualData.numeroAbitanti': 'Dato non valido' },
      };
    });
    mockPerformLocalCalculation = failedAttempt;
    const view = render(<CabinaDiRegiaPage />);
    expect(failedAttempt).toHaveBeenCalledTimes(1);
    expect(mockState.fundData).toBe(initialFundData);

    const afterValidation = vi.fn(async () => {
      mockState = {
        ...mockState,
        calculationResult: undefined,
        isLoading: false,
        validationErrors: { 'fundData.annualData.numeroAbitanti': 'Ancora non valido' },
      };
    });
    mockPerformLocalCalculation = afterValidation;
    view.rerender(<CabinaDiRegiaPage />);
    expect(afterValidation).not.toHaveBeenCalled();

    const correctedFundData: FundData = {
      ...mockState.fundData,
      annualData: {
        ...mockState.fundData.annualData,
        numeroAbitanti: (mockState.fundData.annualData.numeroAbitanti ?? 0) + 1,
      },
    };
    mockState = {
      ...mockState,
      fundData: correctedFundData,
      validationErrors: {},
    };
    view.rerender(<CabinaDiRegiaPage />);
    expect(afterValidation).toHaveBeenCalledTimes(1);
    expect(mockState.fundData).toBe(correctedFundData);

    const afterRepeatedValidation = vi.fn();
    mockPerformLocalCalculation = afterRepeatedValidation;
    view.rerender(<CabinaDiRegiaPage />);
    expect(afterRepeatedValidation).not.toHaveBeenCalled();
  });

  it('S2-001 G — performs one attempt per data version under StrictMode', () => {
    mockState = createState();

    render(
      <StrictMode>
        <CabinaDiRegiaPage />
      </StrictMode>
    );

    expect(mockPerformLocalCalculation).toHaveBeenCalledTimes(1);
  });
});
