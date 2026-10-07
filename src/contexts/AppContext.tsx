// contexts/AppContext.tsx
import React, { createContext, useReducer, Dispatch, useContext, useCallback, useEffect, useMemo } from 'react';
import { AppState, AppAction, CalculationRequestContext, CalculationRuntimeState, FundData, SimulatoreIncrementoInput, FondoAccessorioDipendenteData, FondoElevateQualificazioniData, FondoSegretarioComunaleData, FondoDirigenzaData, TipoMaggiorazione, DistribuzioneRisorseData, UserRole, NavigationScope, YearClosureResult, AnnualSnapshotSaveResult, AnnualSnapshotStatus } from '../domain';

import {
  DEFAULT_CURRENT_YEAR,
  DEFAULT_USER,
} from '../constants.ts';
import { createEmptyFundData } from '../domain/emptyFund';
import { hydrateFundData } from '../application/input/hydrateFundData';
import { validateMonetaryData, monetaryPolicyForControl, normalizeMonetaryData, monetaryIssueMessages, type MonetaryIssue } from '../domain/monetaryBoundary';
import { MonetaryDraftContext, MonetaryDraftIssuesContext } from '../components/shared/MonetaryInput';
import {
  performFundCalculationWorkflow,
  loadEntitiesWorkflow,
  loadAvailableYearsWorkflow,
  isAutoSelectableContextYear,
  pickMostRecentAutoSelectableYear,
  saveAppStateWorkflow,
  fetchUserRoleWorkflow,
  entityManagementWorkflow,
  yearManagementWorkflow,
  WorkflowDependencies,
  resolveRoleOnStateLoad
} from '../application/index.ts';
import {
  switchActiveYear,
  closeYearAndPrepareNext
} from '../application/index.ts';
import { saveLocalDraft, loadLocalDraft, clearLocalDraft, hasLocalDraft } from '../application/localDraftStorage.ts';
import { useFundDataAutosave } from '../hooks/useFundDataAutosave';



import { SupabaseEntityRepository } from '../infrastructure/persistence/SupabaseEntityRepository';
import { SupabaseStateRepository } from '../infrastructure/persistence/SupabaseStateRepository';
import { SupabaseUserRepository } from '../infrastructure/persistence/SupabaseUserRepository';
import { BrowserInteractionService } from '../infrastructure/browser/BrowserInteractionService';
import { useNormativeData } from '../hooks/useNormativeData.ts';
import { useAuth } from './AuthContext.tsx';
import { resolveChecklist } from '../logic/cabina/resolveChecklist';
import { resolveClosureInstructionReadiness, type ClosureInstructionReadiness } from '../logic/closure/resolveClosureInstructionReadiness';
import { calculateFundCompletely } from '../logic/calculation/fundEngine';
import { normalizeInput } from '../application/input/inputNormalizer';

export const createEmptyAppState = (): AppState => ({
  currentUser: { ...DEFAULT_USER },
  currentYear: DEFAULT_CURRENT_YEAR,
  entities: [],
  currentEntity: undefined,
  fundData: createEmptyFundData(DEFAULT_CURRENT_YEAR),
  calculationResult: undefined,
  complianceChecks: [],
  isLoading: false,
  isNormativeDataLoading: false,
  error: undefined,
  validationErrors: {},
  activeTab: 'dashboard',
  navigationScope: NavigationScope.DASHBOARD,
  isYearSwitching: false,
  calculationRuntime: { contextEpoch: 0 },
});

const defaultInitialState = createEmptyAppState();


const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
  performFundCalculation: () => Promise<void>;
  performLocalCalculation: () => Promise<void>;
  saveState: (
    fundDataOverride?: FundData,
    overriddenDeps?: any,
    yearOverride?: number,
    entityOverride?: any
  ) => Promise<AnnualSnapshotSaveResult>;
  availableYears: number[];
  loadEntities: () => Promise<void>;
  createEntity: (name: string) => Promise<any | undefined>;
  renameEntity: (id: string, name: string) => Promise<void>;
  deleteEntity: (id: string, options?: { skipConfirm?: boolean }) => Promise<void>;
  deleteYear: (entityId: string, year: number) => Promise<void>;
  switchEntity: (entityId: string) => Promise<void>;
  switchYearAtomic: (targetYear: number, explicitEntity?: any) => Promise<boolean>;
  switchYearAfterClosure: () => Promise<boolean>;
  setScopeAndTab: (scope: NavigationScope, tabId: string) => Promise<void>;
  isYearSwitching: boolean;
  lastYearSwitchError?: string;
  closeCurrentYear: () => Promise<YearClosureResult>;
  closureReadiness: ClosureInstructionReadiness;
  restorePendingDraft: () => void;
  discardPendingDraft: () => void;
  savePendingDraftRemotely: () => Promise<void>;
}>({

  state: defaultInitialState,
  dispatch: () => null,
  performFundCalculation: async () => { },
  performLocalCalculation: async () => { },
  saveState: async () => ({ success: false, reason: 'UNKNOWN' }),
  availableYears: [],
  loadEntities: async () => { },
  createEntity: async () => undefined,
  renameEntity: async () => { },
  deleteEntity: async () => { },
  deleteYear: async () => { },
  switchEntity: async () => { },
  switchYearAtomic: async () => false,
  switchYearAfterClosure: async () => false,
  setScopeAndTab: async () => { },
  isYearSwitching: false,
  closeCurrentYear: async () => ({ success: false, closedYear: 0, nextYear: 0, carryForward: 0, warnings: [], nonTransferredResiduals: [], error: 'Default' }),
  closureReadiness: resolveClosureInstructionReadiness({}),
  restorePendingDraft: () => { },
  discardPendingDraft: () => { },
  savePendingDraftRemotely: async () => { },
});


const getCalculationRuntime = (state: AppState): CalculationRuntimeState =>
  state.calculationRuntime ?? { contextEpoch: 0 };

type PendingDraftCommandState = Pick<
  AppState,
  'currentUser' | 'currentEntity' | 'currentYear' | 'fundData' | 'pendingDraftData' | 'pendingDraftSources' | 'pendingDraftMetadata'
>;

const getPendingDraftContext = (state: PendingDraftCommandState) => ({
  userId: typeof state.pendingDraftMetadata?.userId === 'string'
    ? state.pendingDraftMetadata.userId
    : undefined,
  entityId: typeof state.pendingDraftMetadata?.entityId === 'string'
    ? state.pendingDraftMetadata.entityId
    : undefined,
  year: typeof state.pendingDraftMetadata?.year === 'number'
    ? state.pendingDraftMetadata.year
    : undefined,
});

const pendingDraftMatchesActiveContext = (state: PendingDraftCommandState): boolean => {
  const pendingContext = getPendingDraftContext(state);
  return !!state.pendingDraftData
    && !!state.currentEntity
    && pendingContext.userId === state.currentUser.id
    && pendingContext.entityId === state.currentEntity.id
    && pendingContext.year === state.currentYear;
};

const restorePendingDraftState = (
  state: PendingDraftCommandState,
  dispatch: Dispatch<AppAction>
): boolean => {
  if (!state.pendingDraftData) return false;
  if (!pendingDraftMatchesActiveContext(state)) {
    console.warn('[DraftStorage] Ripristino bozza bloccato: il contesto della bozza non coincide con quello attivo.');
    return false;
  }
  if (state.fundData.metadata?.snapshotStatus === AnnualSnapshotStatus.CLOSED) {
    console.warn('[DraftStorage] Ripristino bozza bloccato: l\'annualità corrente è CLOSED.');
    return false;
  }

  dispatch({ type: 'IMPORT_FUND_DATA', payload: state.pendingDraftData });
  if (state.pendingDraftSources) {
    dispatch({ type: 'UPDATE_LOCAL_SOURCES', payload: state.pendingDraftSources });
  }
  dispatch({ type: 'CLEAR_PENDING_DRAFT' });
  return true;
};

type CalculationFreshnessAuthority = Readonly<{
  userId: string;
  entityId?: string;
  year: number;
  runtime: CalculationRuntimeState;
}>;

const getCalculationFreshnessAuthority = (state: AppState): CalculationFreshnessAuthority => ({
  userId: state.currentUser.id,
  entityId: state.currentEntity?.id,
  year: state.currentYear,
  runtime: getCalculationRuntime(state),
});

const isActiveCalculationAuthorityContext = (
  authority: CalculationFreshnessAuthority,
  requestContext: CalculationRequestContext
): boolean => authority.entityId === requestContext.entityId
  && authority.year === requestContext.year
  && authority.runtime.contextEpoch === requestContext.contextEpoch;

const isCalculationAuthorityCurrent = (
  authority: CalculationFreshnessAuthority,
  requestContext: CalculationRequestContext
): boolean => {
  const latestRequest = authority.runtime.latestRequest;
  return isActiveCalculationAuthorityContext(authority, requestContext)
    && latestRequest?.entityId === requestContext.entityId
    && latestRequest.year === requestContext.year
    && latestRequest.contextEpoch === requestContext.contextEpoch
    && latestRequest.requestId === requestContext.requestId;
};

const transitionCalculationFreshnessAuthority = (
  authority: CalculationFreshnessAuthority,
  action: AppAction
): CalculationFreshnessAuthority => {
  const invalidate = (
    nextContext: Pick<CalculationFreshnessAuthority, 'userId' | 'entityId' | 'year'>,
    postHydrationCalculationPending = false
  ): CalculationFreshnessAuthority => ({
    ...nextContext,
    runtime: {
      contextEpoch: authority.runtime.contextEpoch + 1,
      latestRequest: undefined,
      postHydrationCalculationPending,
    },
  });

  switch (action.type) {
    case 'SET_USER':
      return authority.userId === action.payload.id
        ? authority
        : invalidate({
          userId: action.payload.id,
          entityId: authority.entityId,
          year: authority.year,
        });
    case 'SET_CURRENT_ENTITY':
      return authority.entityId === action.payload.id
        ? authority
        : invalidate({
          userId: authority.userId,
          entityId: action.payload.id,
          year: authority.year,
        });
    case 'SET_CURRENT_YEAR':
      return authority.year === action.payload
        ? authority
        : invalidate({
          userId: authority.userId,
          entityId: authority.entityId,
          year: action.payload,
        });
    case 'LOAD_STATE_FROM_DB':
      return invalidate({
        userId: action.payload.currentUser?.id ?? authority.userId,
        entityId: action.payload.currentEntity?.id ?? authority.entityId,
        year: action.payload.currentYear ?? authority.year,
      }, action.meta?.scheduleFundCalculation === true);
    case 'CALCULATE_FUND_START': {
      const requestContext = action.payload.requestContext;
      if (!isActiveCalculationAuthorityContext(authority, requestContext)) {
        return authority;
      }
      if (
        authority.runtime.latestRequest?.contextEpoch === requestContext.contextEpoch
        && requestContext.requestId <= authority.runtime.latestRequest.requestId
      ) {
        return authority;
      }
      return {
        ...authority,
        runtime: {
          ...authority.runtime,
          latestRequest: requestContext,
          postHydrationCalculationPending: false,
        },
      };
    }
    default:
      return authority;
  }
};

const isLatestCalculationRequest = (
  state: AppState,
  requestContext: CalculationRequestContext
): boolean => isCalculationAuthorityCurrent(
  getCalculationFreshnessAuthority(state),
  requestContext
);

const appReducerCore = (state: AppState, action: AppAction): AppState => {
  // Hardening FUNC-01 / SEC-01: Se l'annualità corrente è CLOSED, rifiutiamo mutazioni sui dati del Fondo
  const isSnapshotClosed = state.fundData?.metadata?.snapshotStatus === AnnualSnapshotStatus.CLOSED;
  if (isSnapshotClosed) {
    const MUTATING_ACTIONS = new Set([
      'UPDATE_HISTORICAL_DATA',
      'UPDATE_ANNUAL_DATA',
      'UPDATE_EMPLOYEE_COUNT',
      'UPDATE_SIMULATORE_INPUT',
      'UPDATE_SIMULATORE_RISULTATI',
      'UPDATE_CALCOLATO_INCREMENTO_PNRR3',
      'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA',
      'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA',
      'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA',
      'UPDATE_FONDO_DIRIGENZA_DATA',
      'UPDATE_DISTRIBUZIONE_RISORSE_DATA',
      'ADD_PROVENTO_SPECIFICO',
      'UPDATE_PROVENTO_SPECIFICO',
      'REMOVE_PROVENTO_SPECIFICO',
      'ADD_ART23_EMPLOYEE_DETAIL',
      'UPDATE_ART23_EMPLOYEE_DETAIL',
      'REMOVE_ART23_EMPLOYEE_DETAIL',
      'ADD_PERSONALE_SERVIZIO_DETTAGLIO',
      'UPDATE_PERSONALE_SERVIZIO_DETTAGLIO',
      'REMOVE_PERSONALE_SERVIZIO_DETTAGLIO',
      'SET_PERSONALE_SERVIZIO_DETTAGLI',
      'UPDATE_PERSONALE_SERVIZIO_MANUAL_MODE',
      'UPDATE_ENTITY_NAME',
      'IMPORT_FUND_DATA',
      'IMPORT_DATI_GENERALI_CSV'
    ]);
    if (MUTATING_ACTIONS.has(action.type)) {
      console.warn(`[appReducer] Modifica ${action.type} bloccata: l'annualità corrente è CHIUSA (immutabile).`);
      return state;
    }
  }

  switch (action.type) {
    case 'SET_USER': {
      const userChanged = state.currentUser.id !== action.payload.id;
      const nextAuthority = transitionCalculationFreshnessAuthority(
        getCalculationFreshnessAuthority(state),
        action
      );
      return {
        ...state,
        currentUser: action.payload,
        hydratedSnapshotKey: null,
        isLoading: userChanged ? false : state.isLoading,
        ...(userChanged ? {
          hasPendingDraft: false,
          pendingDraftData: null,
          pendingDraftSources: undefined,
          pendingDraftMetadata: null,
          isYearSwitching: false,
          lastYearSwitchError: undefined,
        } : {}),
        calculationRuntime: nextAuthority.runtime,
      };
    }
    case 'SET_NORMATIVE_DATA':
      return { ...state, normativeData: action.payload };
    case 'SET_ENTITIES':
      return { ...state, entities: action.payload };
    case 'SET_CURRENT_ENTITY':
      // Re-loading the entity list can legitimately resolve the already-active entity
      // while its snapshot is hydrated. Treat that as an idempotent refresh: resetting
      // fundData here creates a short-lived (and sometimes persistent) zero ledger when
      // a second bootstrap request loses the year-switch race.
      if (state.currentEntity?.id === action.payload.id) {
        return { ...state, currentEntity: action.payload };
      }
      const entityAuthority = transitionCalculationFreshnessAuthority(
        getCalculationFreshnessAuthority(state),
        action
      );
      // AG-122 FIX: Non resettare fundData ai default con placeholder.
      // Conserviamo solo la struttura dello stato, azzerando il risultato del calcolo.
      // Il nome reale dell'ente viene impostato immediatamente dalla proprietà entity.name.
      return {
        ...state,
        currentEntity: action.payload,
        localSources: {}, // Clear sources on entity change
        hasPendingDraft: false,
        pendingDraftData: null,
        pendingDraftSources: undefined,
        pendingDraftMetadata: null,
        fundData: createEmptyFundData(state.currentYear, action.payload.name || ''),
        calculationResult: undefined,
        complianceChecks: [],
        isLoading: false,
        calculationRuntime: entityAuthority.runtime,
        hydratedSnapshotKey: null, // Reset guard keyed al cambio ente
      };
    case 'SET_CURRENT_YEAR':
      // Same semantics as SET_CURRENT_ENTITY: the bootstrap workflow may confirm the
      // current year more than once. A confirmation must not discard the hydrated ledger.
      if (state.currentYear === action.payload) {
        return state;
      }
      const yearAuthority = transitionCalculationFreshnessAuthority(
        getCalculationFreshnessAuthority(state),
        action
      );
      return {
        ...state,
        currentYear: action.payload,
        localSources: {}, // Clear sources on year change
        hasPendingDraft: false,
        pendingDraftData: null,
        pendingDraftSources: undefined,
        pendingDraftMetadata: null,
        // Provisional navigation state is not an annual carry-forward source.
        // Persisted target data and explicit builders arrive through hydration.
        fundData: createEmptyFundData(action.payload, state.currentEntity?.name || ''),
        calculationResult: undefined,
        complianceChecks: [],
        isLoading: false,
        calculationRuntime: yearAuthority.runtime,
        hydratedSnapshotKey: null, // Reset guard keyed al cambio anno
      };
    case 'UPDATE_HISTORICAL_DATA':
      return { ...state, fundData: { ...state.fundData, historicalData: { ...state.fundData.historicalData, ...action.payload } } };
    case 'UPDATE_ANNUAL_DATA':
      return { ...state, fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, ...action.payload } } };
    case 'UPDATE_EMPLOYEE_COUNT':
      {
        const newCounts = state.fundData.annualData.personaleServizioAttuale.map(emp =>
          emp.category === action.payload.category ? { ...emp, count: action.payload.count } : emp
        );
        return { ...state, fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, personaleServizioAttuale: newCounts } } };
      }
    case 'UPDATE_SIMULATORE_INPUT':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          annualData: {
            ...state.fundData.annualData,
            simulatoreInput: {
              ...state.fundData.annualData.simulatoreInput,
              ...action.payload,
            } as SimulatoreIncrementoInput
          }
        }
      };
    case 'UPDATE_SIMULATORE_RISULTATI':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          annualData: {
            ...state.fundData.annualData,
            simulatoreRisultati: action.payload,
          }
        }
      };
    case 'UPDATE_CALCOLATO_INCREMENTO_PNRR3':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          annualData: {
            ...state.fundData.annualData,
            calcolatoIncrementoPNRR3: action.payload,
          }
        }
      };
    case 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA': {
      const newSources = { ...(state.localSources || {}) };
      const AUTOMATIC_FAD_KEYS = new Set([
        'st_art58c1_CCNL2026_incremento014_MS2021',
        'vn_art58_CCNL2026_arretrati2024_2025',
        'vn_art58c2_incremento_max022_ms2021',
        'vn_art58c2_CCNL2026_incremento022_MS2021',
        'vn_art58c2_incremento_max022_ms2021_anno2025',
        'st_art60c2_CCNL2026_decurtazioneIndennitaComparto',
        'st_riduzioneFondoStraordinario',
        'st_riduzionePerIncrementoEQ',
        'st_art67c1_decurtazionePO_AP_EntiDirigenza',
        'st_art79c1_art14c3_art67c2g_riduzioneStraordinario',
        'vn_art15c1m_art67c3e_risparmiStraordinario',
        'cl_art23c2_decurtazioneIncrementoAnnualeTetto2016',
        'cl_totaleParzialeRisorsePerConfrontoTetto2016'
      ]);
      Object.keys(action.payload).forEach(key => {
        newSources[`fondoAccessorioDipendenteData.${key}`] = AUTOMATIC_FAD_KEYS.has(key) ? 'system' : 'manual';
      });
      return {
        ...state,
        localSources: newSources,
        fundData: {
          ...state.fundData,
          fondoAccessorioDipendenteData: {
            ...state.fundData.fondoAccessorioDipendenteData,
            ...action.payload,
          } as FondoAccessorioDipendenteData
        }
      };
    }
    case 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA': {
      const newSources = { ...(state.localSources || {}) };
      Object.keys(action.payload).forEach(key => {
        newSources[`fondoElevateQualificazioniData.${key}`] = key === 'va_incremento022_ms2021_eq' ? 'system' : 'manual';
      });
      return {
        ...state,
        localSources: newSources,
        fundData: {
          ...state.fundData,
          fondoElevateQualificazioniData: {
            ...state.fundData.fondoElevateQualificazioniData,
            ...action.payload,
          } as FondoElevateQualificazioniData
        }
      };
    }
    case 'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA': {
      const newSources = { ...(state.localSources || {}) };
      Object.keys(action.payload).forEach(key => {
        newSources[`fondoSegretarioComunaleData.${key}`] = 'manual';
      });
      return {
        ...state,
        localSources: newSources,
        fundData: {
          ...state.fundData,
          fondoSegretarioComunaleData: {
            ...state.fundData.fondoSegretarioComunaleData,
            ...action.payload,
          } as FondoSegretarioComunaleData
        }
      };
    }
    case 'UPDATE_FONDO_DIRIGENZA_DATA': {
      const newSources = { ...(state.localSources || {}) };
      Object.keys(action.payload).forEach(key => {
        newSources[`fondoDirigenzaData.${key}`] = 'manual';
      });
      return {
        ...state,
        localSources: newSources,
        fundData: {
          ...state.fundData,
          fondoDirigenzaData: {
            ...state.fundData.fondoDirigenzaData,
            ...action.payload,
          } as FondoDirigenzaData
        }
      };
    }
    case 'UPDATE_DISTRIBUZIONE_RISORSE_DATA':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          distribuzioneRisorseData: {
            ...state.fundData.distribuzioneRisorseData,
            ...action.payload,
          } as DistribuzioneRisorseData
        }
      };
    case 'ADD_PROVENTO_SPECIFICO':
      return { ...state, fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, proventiSpecifici: [...state.fundData.annualData.proventiSpecifici, action.payload] } } };
    case 'UPDATE_PROVENTO_SPECIFICO':
      {
        const updatedProventi = [...state.fundData.annualData.proventiSpecifici];
        updatedProventi[action.payload.index] = action.payload.provento;
        return { ...state, fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, proventiSpecifici: updatedProventi } } };
      }
    case 'REMOVE_PROVENTO_SPECIFICO':
      {
        const filteredProventi = state.fundData.annualData.proventiSpecifici.filter((_, index) => index !== action.payload);
        return { ...state, fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, proventiSpecifici: filteredProventi } } };
      }
    case 'ADD_ART23_EMPLOYEE_DETAIL':
      {
        const { yearType, detail } = action.payload;
        const key = yearType === '2018' ? 'personale2018PerArt23' : 'personaleAnnoRifPerArt23';
        const currentList = state.fundData.annualData[key] || [];
        return {
          ...state,
          fundData: {
            ...state.fundData,
            annualData: {
              ...state.fundData.annualData,
              [key]: [...currentList, detail]
            }
          }
        };
      }
    case 'UPDATE_ART23_EMPLOYEE_DETAIL':
      {
        const { yearType, detail } = action.payload;
        const key = yearType === '2018' ? 'personale2018PerArt23' : 'personaleAnnoRifPerArt23';
        const currentList = [...(state.fundData.annualData[key] || [])];
        const index = currentList.findIndex(emp => emp.id === detail.id);
        if (index !== -1) {
          currentList[index] = detail;
        }
        return {
          ...state,
          fundData: {
            ...state.fundData,
            annualData: {
              ...state.fundData.annualData,
              [key]: currentList
            }
          }
        };
      }
    case 'REMOVE_ART23_EMPLOYEE_DETAIL':
      {
        const { yearType, id } = action.payload;
        const key = yearType === '2018' ? 'personale2018PerArt23' : 'personaleAnnoRifPerArt23';
        const currentList = state.fundData.annualData[key] || [];
        const filteredList = currentList.filter((emp) => emp.id !== id);
        return {
          ...state,
          fundData: {
            ...state.fundData,
            annualData: {
              ...state.fundData.annualData,
              [key]: filteredList
            }
          }
        };
      }
    case 'ADD_PERSONALE_SERVIZIO_DETTAGLIO': {
      const newList = [...(state.fundData.personaleServizio.dettagli || []), action.payload];
      return {
        ...state,
        fundData: {
          ...state.fundData,
          personaleServizio: {
            ...state.fundData.personaleServizio,
            dettagli: newList,
          },
        },
      };
    }
    case 'UPDATE_PERSONALE_SERVIZIO_DETTAGLIO': {
      const { id, changes } = action.payload;
      const currentList = state.fundData.personaleServizio.dettagli || [];

      const updatedList = currentList.map(emp => {
        if (emp.id !== id) {
          return emp;
        }

        const updatedEmployee = { ...emp, ...changes };
        const [field] = Object.keys(changes) as (keyof typeof changes)[];

        if (field === 'partTimePercentage' || field === 'numeroDifferenziali') {
          const rawValue = changes[field];
          updatedEmployee[field] = (rawValue === '' || rawValue === undefined || rawValue === null) ? undefined : Number(rawValue);
        } else if (field === 'livelloPeoStoriche' && changes[field] === "") {
          updatedEmployee.livelloPeoStoriche = undefined;
        }

        if (field === 'fullYearService' && updatedEmployee.fullYearService) {
          updatedEmployee.assunzioneDate = undefined;
          updatedEmployee.cessazioneDate = undefined;
        }
        if (field === 'areaQualifica') {
          updatedEmployee.livelloPeoStoriche = undefined;
          updatedEmployee.numeroDifferenziali = 0;
          updatedEmployee.tipoMaggiorazione = TipoMaggiorazione.NESSUNA;
        }

        return updatedEmployee;
      });

      return {
        ...state,
        fundData: {
          ...state.fundData,
          personaleServizio: {
            ...state.fundData.personaleServizio,
            dettagli: updatedList,
          },
        },
      };
    }
    case 'REMOVE_PERSONALE_SERVIZIO_DETTAGLIO': {
      const currentList = state.fundData.personaleServizio.dettagli || [];
      const filteredList = currentList.filter(emp => emp.id !== action.payload.id);
      return {
        ...state,
        fundData: {
          ...state.fundData,
          personaleServizio: {
            ...state.fundData.personaleServizio,
            dettagli: filteredList,
          },
        },
      };
    }
    case 'SET_PERSONALE_SERVIZIO_DETTAGLI':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          personaleServizio: {
            ...state.fundData.personaleServizio,
            dettagli: action.payload,
          },
        },
      };
    case 'UPDATE_PERSONALE_SERVIZIO_MANUAL_MODE':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          personaleServizio: {
            ...state.fundData.personaleServizio,
            ...action.payload,
          },
        },
      };
    case 'CALCULATE_FUND_START': {
      const authority = getCalculationFreshnessAuthority(state);
      const nextAuthority = transitionCalculationFreshnessAuthority(authority, action);
      if (nextAuthority === authority) {
        return state;
      }
      return {
        ...state,
        isLoading: true,
        error: undefined,
        validationErrors: {},
        calculationRuntime: nextAuthority.runtime,
      };
    }
    case 'CALCULATE_FUND_SUCCESS':
      if (!isLatestCalculationRequest(state, action.payload.requestContext)) {
        return state;
      }
      return {
        ...state,
        isLoading: false,
        calculationResult: action.payload.result,
        complianceChecks: action.payload.checks,
        validationErrors: {}
      };
    case 'CALCULATE_FUND_ERROR':
      if (!isLatestCalculationRequest(state, action.payload.requestContext)) {
        return state;
      }
      return { ...state, isLoading: false, error: action.payload.error, calculationResult: undefined, complianceChecks: [] };
    case 'CALCULATE_FUND_VALIDATION_FAILED':
      if (!isLatestCalculationRequest(state, action.payload.requestContext)) {
        return state;
      }
      return {
        ...state,
        isLoading: false,
        error: undefined,
        validationErrors: action.payload.errors,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_NAVIGATION_SCOPE':
      return { ...state, navigationScope: action.payload };
    case 'LOAD_STATE_FROM_DB': {
      // Protezione ruolo globale: usiamo la policy centralizzata
      const newState = { ...state, ...action.payload };
      const resolvedRole = resolveRoleOnStateLoad(
        state.currentUser.role,
        action.payload.currentUser?.role || UserRole.GUEST
      );

      newState.currentUser = {
        ...newState.currentUser,
        role: resolvedRole
      };

      const entityId = action.payload.currentEntity?.id || state.currentEntity?.id;
      const year = action.payload.currentYear || state.currentYear;
      const nextAuthority = transitionCalculationFreshnessAuthority(
        getCalculationFreshnessAuthority(state),
        action
      );

      return {
        ...newState,
        localSources: {}, // Clear sources on load from DB
        hasPendingDraft: false,
        pendingDraftData: null,
        pendingDraftSources: undefined,
        pendingDraftMetadata: null,
        calculationResult: undefined,
        complianceChecks: [],
        isLoading: false,
        isYearSwitching: false,
        calculationRuntime: nextAuthority.runtime,
        hydratedSnapshotKey: entityId && year ? `${entityId}:${year}` : null // Abilita il salvataggio solo per questa coppia keyed
      };
    }
    case 'SET_YEAR_SWITCHING':
      return { ...state, isYearSwitching: action.payload, lastYearSwitchError: undefined };
    case 'SET_YEAR_SWITCH_ERROR':
      return { ...state, isYearSwitching: false, lastYearSwitchError: action.payload };

    case 'UPDATE_ENTITY_NAME':
      if (!state.currentEntity) return state;
      return {
        ...state,
        currentEntity: { ...state.currentEntity, name: action.payload },
        entities: state.entities.map(e => e.id === state.currentEntity?.id ? { ...e, name: action.payload } : e),
        fundData: {
          ...state.fundData,
          annualData: { ...state.fundData.annualData, denominazioneEnte: action.payload }
        }
      };
    case 'SET_SELECTED_ARTICLE':
      return { ...state, selectedArticleId: action.payload };
    case 'SET_SELECTED_SCHEDA':
      return { ...state, selectedSchedaId: action.payload };
    case 'SET_SELECTED_PARERE_ARAN':
      return { ...state, selectedParereId: action.payload };
    case 'IMPORT_DATI_GENERALI_CSV':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          historicalData: {
            ...state.fundData.historicalData,
            ...(action.payload.historicalData || {})
          },
          annualData: {
            ...state.fundData.annualData,
            ...(action.payload.annualData || {}),
            simulatoreInput: {
              ...state.fundData.annualData.simulatoreInput,
              ...(action.payload.annualData?.simulatoreInput || {})
            },
            ccnl2024: {
              ...(state.fundData.annualData.ccnl2024 || {}),
              ...(action.payload.annualData?.ccnl2024 || {})
            }
          }
        }
      };
    case 'IMPORT_FUND_DATA':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          ...action.payload,
          annualData: {
            ...(state.fundData?.annualData || {}),
            ...(action.payload.annualData || {}),
            simulatoreInput: {
              ...(state.fundData?.annualData?.simulatoreInput || {}),
              ...(action.payload.annualData?.simulatoreInput || {})
            },
            ccnl2024: {
              ...(state.fundData?.annualData?.ccnl2024 || {}),
              ...(action.payload.annualData?.ccnl2024 || {})
            }
          }
        }
      };
    case 'SET_PENDING_DRAFT':
      return {
        ...state,
        hasPendingDraft: true,
        pendingDraftData: action.payload.fundData,
        pendingDraftSources: action.payload.sources,
        pendingDraftMetadata: action.payload.metadata
      };
    case 'CLEAR_PENDING_DRAFT':
      return {
        ...state,
        hasPendingDraft: false,
        pendingDraftData: null,
        pendingDraftSources: undefined,
        pendingDraftMetadata: null
      };
    case 'UPDATE_LOCAL_SOURCES':
      return {
        ...state,
        localSources: {
          ...(state.localSources || {}),
          ...action.payload
        }
      };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const deps = useMemo<WorkflowDependencies>(() => ({
    entityRepository: new SupabaseEntityRepository(),
    stateRepository: new SupabaseStateRepository(),
    userRepository: new SupabaseUserRepository(),
    interactionService: new BrowserInteractionService()
  }), []);

  const [initialStateWithUser] = React.useState<AppState>(() => ({
    ...createEmptyAppState(),
    currentUser: user ? {
      id: user.id,
      name: user.email || 'Utente',
      email: user.email || '',
      role: UserRole.GUEST
    } : { ...DEFAULT_USER }
  }));

  const [state, reducerDispatch] = useReducer(appReducer, initialStateWithUser);
  const monetaryDraftIssues = React.useRef(new Map<string, MonetaryIssue>());
  const [visibleMonetaryDraftIssues, setVisibleMonetaryDraftIssues] = React.useState<readonly MonetaryIssue[]>([]);
  const registerMonetaryDraft = useCallback((key: string, issue?: MonetaryIssue) => {
    if (monetaryDraftIssues.current.get(key) === issue) return;
    if (issue) monetaryDraftIssues.current.set(key, issue); else monetaryDraftIssues.current.delete(key);
    setVisibleMonetaryDraftIssues([...monetaryDraftIssues.current.values()]);
  }, []);
  const contextSwitchRequestIdRef = React.useRef(0);
  // Registered only after the closure workflow confirms success, before React re-renders.
  const closedSnapshotKeysRef = React.useRef(new Set<string>());
  const completedClosureRef = React.useRef<{
    userId: string; entity: NonNullable<AppState['currentEntity']>; closedYear: number; nextYear: number;
  } | null>(null);
  const calculationFreshnessAuthorityRef = React.useRef<CalculationFreshnessAuthority>(
    getCalculationFreshnessAuthority(initialStateWithUser)
  );
  const dispatch = useCallback<Dispatch<AppAction>>((action) => {
    if (
      action.type === 'SET_USER'
      && calculationFreshnessAuthorityRef.current.userId !== action.payload.id
    ) {
      contextSwitchRequestIdRef.current += 1;
    }
    calculationFreshnessAuthorityRef.current = transitionCalculationFreshnessAuthority(
      calculationFreshnessAuthorityRef.current,
      action
    );
    reducerDispatch(action);
  }, []);
  const calculationRequestIdRef = React.useRef(0);
  const { data: normativeData } = useNormativeData();

  const isContextSwitchRequestCurrent = useCallback((requestId: number, userId: string): boolean =>
    requestId === contextSwitchRequestIdRef.current
    && calculationFreshnessAuthorityRef.current.userId === userId, []);

  useEffect(() => () => {
    contextSwitchRequestIdRef.current += 1;
  }, []);

  const isCalculationRequestCurrent = useCallback((requestContext: CalculationRequestContext): boolean =>
    isCalculationAuthorityCurrent(calculationFreshnessAuthorityRef.current, requestContext), []);

  const createCalculationRequestContext = useCallback((calculationState: AppState): CalculationRequestContext | undefined => {
    const entityId = calculationState.currentEntity?.id;
    if (!entityId) return undefined;

    calculationRequestIdRef.current += 1;
    return {
      entityId,
      year: calculationState.currentYear,
      contextEpoch: getCalculationRuntime(calculationState).contextEpoch,
      requestId: calculationRequestIdRef.current,
    };
  }, []);

  useEffect(() => {
    if (user) {
      if (state.currentUser.id !== user.id) {
        dispatch({
          type: 'SET_USER',
          payload: {
            id: user.id,
            name: user.email || 'Utente',
            email: user.email || '',
            role: UserRole.GUEST
          }
        });
      }
    }
  }, [user, state.currentUser.id]);

  useEffect(() => {
    if (normativeData) {
      dispatch({ type: 'SET_NORMATIVE_DATA', payload: normativeData });
    }
  }, [normativeData]);

  const [availableYears, setAvailableYears] = React.useState<number[]>([]);
  const availableYearsRequestIdRef = React.useRef(0);

  useEffect(() => () => {
    availableYearsRequestIdRef.current += 1;
  }, []);

  const loadAvailableYearsForEntity = useCallback(async (
    entityId?: string,
    shouldApply: () => boolean = () => true
  ) => {
    const targetEntityId = entityId || state.currentEntity?.id || '';
    const requestId = ++availableYearsRequestIdRef.current;
    const requestUserId = user?.id;
    const requestYear = state.currentYear;
    await loadAvailableYearsWorkflow(
      deps,
      user,
      targetEntityId,
      years => {
        const authority = calculationFreshnessAuthorityRef.current;
        if (
          requestId === availableYearsRequestIdRef.current
          && requestUserId === authority.userId
          && requestYear === authority.year
          && (entityId || targetEntityId === authority.entityId)
          && shouldApply()
        ) {
          setAvailableYears(years);
        }
      }
    );
  }, [deps, user, state.currentEntity?.id, state.currentYear]);

  const loadAvailableYears = useCallback(async () => {
    await loadAvailableYearsForEntity();
  }, [loadAvailableYearsForEntity]);

  // Load user role on user change
  useEffect(() => {
    if (user) {
      const authUser = {
        id: user.id,
        name: user.email || 'Utente',
        email: user.email || '',
        role: state.currentUser.role
      };
      fetchUserRoleWorkflow(deps, authUser, dispatch);
    }
  }, [deps, user, dispatch]);


  useEffect(() => {
    // Quando cambia l'ente, carichiamo i dati di default (es. anno corrente logico)
    // Non usiamo più fetchAppStateWorkflow automaticamente al variare di currentYear
    let active = true;
    if (user && state.currentEntity) {
      loadAvailableYearsForEntity(undefined, () => active);
    }
    return () => {
      active = false;
    };
  }, [deps, user, state.currentEntity, state.currentYear, loadAvailableYearsForEntity]);

  // Modificato per agganciarsi al workflow locale, ma con opzione di chiamare il save puro
  // AG-124: Aggiunto fundDataOverride, yearOverride e entityOverride per gestire correttamente le race condition.
  const saveState = useCallback(async (
    fundDataOverride?: FundData,
    overriddenDeps?: Pick<WorkflowDependencies, 'stateRepository' | 'entityRepository'>,
    yearOverride?: number,
    entityOverride?: any
  ): Promise<AnnualSnapshotSaveResult> => {
    const draftIssues = [...monetaryDraftIssues.current.values()];
    if (draftIssues.length) return { success: false, reason: 'VALIDATION_ERROR', issues: draftIssues, error: 'Correggere gli importi evidenziati prima del salvataggio.' };
    const targetEntity = entityOverride || state.currentEntity;
    const targetYear = yearOverride || state.currentYear;

    // Se non abbiamo un'entità o un utente, non possiamo salvare nulla
    if (!user || !targetEntity) {
      return { success: false, reason: 'VALIDATION_ERROR', error: 'Utente o ente non selezionato.' };
    }

    // Se l'anno di riferimento remoto è CLOSED, blocchiamo la scrittura su database
    const currentFundData = fundDataOverride || state.fundData;
    if (currentFundData?.metadata?.snapshotStatus === 'CLOSED'
      || closedSnapshotKeysRef.current.has(`${user.id}:${targetEntity.id}:${targetYear}`)) {
      console.warn('[AppContext] Scrittura su Supabase bloccata perché lo snapshot è CLOSED.');
      return {
        success: false,
        reason: 'SNAPSHOT_CLOSED',
        error: `L'esercizio ${targetYear} è CHIUSO e non può essere modificato.`
      };
    }

    // AG-122C: Protezione salvataggio "premuroso"
    // Durante un cambio contesto (switchYearAtomic), permettiamo il salvataggio se viene passato un override esplicito.
    if (!yearOverride && !entityOverride) {
      const currentKey = `${targetEntity.id}:${targetYear}`;
      if (state.hydratedSnapshotKey !== currentKey) {
        return {
          success: false,
          reason: 'VALIDATION_ERROR',
          error: 'Contesto di sincronizzazione non pronto.'
        };
      }
    }

    const saveResult = await saveAppStateWorkflow(
      overriddenDeps || deps,
      user,
      targetEntity,
      targetYear,
      state.currentUser.role,
      fundDataOverride || state.fundData,
      async () => {
        if (user && targetEntity) {
          clearLocalDraft(user.id, targetEntity.id, targetYear);
        }
        await loadAvailableYears();
      }
    );

    return saveResult;
  }, [state.currentYear, state.currentUser.role, state.fundData, user, state.currentEntity, loadAvailableYears, deps, state.hydratedSnapshotKey]);

  useEffect(() => {
    if (!state.calculationRuntime?.postHydrationCalculationPending || !normativeData) {
      return;
    }

    const hydrationState = state;
    const hydrationEntity = hydrationState.currentEntity;
    const requestContext = createCalculationRequestContext(hydrationState);
    if (!hydrationEntity || !requestContext) {
      return;
    }

    // The request context is allocated from the committed LOAD_STATE_FROM_DB generation
    // before the callback is scheduled. The callback never replaces its captured epoch
    // with a later live value, so an A -> B -> A transition makes this START stale.
    const timerId = setTimeout(() => {
      void performFundCalculationWorkflow(
        deps,
        hydrationState,
        requestContext,
        dispatch,
        normativeData,
        (overriddenDeps) => saveState(
          hydrationState.fundData,
          overriddenDeps,
          hydrationState.currentYear,
          hydrationEntity
        ),
        isCalculationRequestCurrent
      );
    }, 0);

    return () => clearTimeout(timerId);
  }, [createCalculationRequestContext, deps, isCalculationRequestCurrent, normativeData, saveState, state]);

  const { flush } = useFundDataAutosave({
    user,
    currentEntity: state.currentEntity,
    currentYear: state.currentYear,
    fundData: state.fundData,
    hydratedSnapshotKey: state.hydratedSnapshotKey,
    localSources: state.localSources,
    hasPendingDraft: state.hasPendingDraft,
    saveState
  });

  // Effetto di persistenza locale automatica controllata per mantenere la purezza del reducer
  useEffect(() => {
    if (!user || !state.currentEntity || !state.currentYear || !state.hydratedSnapshotKey) return;
    if (state.fundData.metadata?.snapshotStatus === 'CLOSED'
      || closedSnapshotKeysRef.current.has(`${user.id}:${state.currentEntity.id}:${state.currentYear}`)) return;

    // Verifichiamo se ci sono effettive modifiche manuali scatenate dall'utente in questa sessione
    const manualKeys = Object.keys(state.localSources || {}).filter(k => state.localSources?.[k] === 'manual');
    if (manualKeys.length === 0) return;

    // Evitiamo di sovrascrivere se stiamo risolvendo un conflitto di bozza non ripristinata/scartata
    if (state.hasPendingDraft) return;

    saveLocalDraft(
      user.id,
      state.currentEntity.id,
      state.currentYear,
      state.fundData,
      state.localSources || {},
      state.currentEntity.name
    );
  }, [state.fundData, state.localSources, state.currentEntity, state.currentYear, state.hydratedSnapshotKey, state.hasPendingDraft, user]);

  const switchYear = useCallback(async (
    targetYear: number,
    explicitEntity?: any,
    existingRequestId?: number,
    completedClosure?: NonNullable<typeof completedClosureRef.current>
  ) => {
    const entityToUse = explicitEntity || state.currentEntity;
    if (!user || !entityToUse) {
      return false;
    }
    if (state.isYearSwitching) {
      return false;
    }
    if (completedClosure) {
      const current = calculationFreshnessAuthorityRef.current;
      if (completedClosure !== completedClosureRef.current
        || completedClosure.userId !== user.id
        || current.entityId !== completedClosure.entity.id
        || current.year !== completedClosure.closedYear
        || targetYear !== completedClosure.nextYear) return false;
    }

    const requestUserId = user.id;
    const requestId = existingRequestId ?? ++contextSwitchRequestIdRef.current;
    if (!isContextSwitchRequestCurrent(requestId, requestUserId)) {
      return false;
    }

    const previousEntity = completedClosure?.entity || state.currentEntity;
    const previousYear = completedClosure?.closedYear ?? state.currentYear;
    const wasClosed = !!previousEntity
      && closedSnapshotKeysRef.current.has(`${user.id}:${previousEntity.id}:${previousYear}`);
    // No flush of a draft already frozen by the successful transaction.
    if (!wasClosed) await flush();
    if (!isContextSwitchRequestCurrent(requestId, requestUserId)) {
      return false;
    }

    const isCrossEntitySwitch = !!explicitEntity && explicitEntity.id !== previousEntity?.id;
    const hydratedPreviousKey = previousEntity ? `${previousEntity.id}:${previousYear}` : null;
    const canSaveCurrent = !wasClosed && !isCrossEntitySwitch && state.hydratedSnapshotKey === hydratedPreviousKey;

    dispatch({ type: 'SET_YEAR_SWITCHING', payload: true });

    let navigationFailed = false;
    try {
      const result = await switchActiveYear(
        deps,
        state.currentUser,
        entityToUse,
        previousYear,
        targetYear,
        state.currentUser.role,
        state.fundData,
        createEmptyFundData(targetYear, entityToUse.name || ''),
        canSaveCurrent,
        previousEntity
      );

      if (!isContextSwitchRequestCurrent(requestId, requestUserId)) {
        return false;
      }

      if (!result.success) {
        navigationFailed = true;
        dispatch({ type: 'SET_YEAR_SWITCH_ERROR', payload: result.error });
        return false;
      }

      try {
        const contextKey = `fl_last_context_${user.id}`;
        localStorage.setItem(contextKey, JSON.stringify({
          entityId: entityToUse.id,
          year: result.targetYear,
          updatedAt: new Date().toISOString()
        }));
        localStorage.setItem('fl_last_entity_id', entityToUse.id);
        localStorage.setItem('fl_last_year', result.targetYear.toString());
      } catch (e) {
        // ignore
      }

      await loadAvailableYearsForEntity(
        entityToUse.id,
        () => isContextSwitchRequestCurrent(requestId, requestUserId)
      );

      if (!isContextSwitchRequestCurrent(requestId, requestUserId)) {
        return false;
      }

      // Idrata il reducer con i dati del nuovo anno (AG-122: mappa tutti i sub-fondi)
      if (result.newSnapshot) {
        const snap = result.newSnapshot.fundData || {};
        const loadedState: Partial<AppState> = {
          currentYear: result.targetYear,
          currentUser: state.currentUser,
          currentEntity: entityToUse,
          fundData: hydrateFundData(snap, result.targetYear, entityToUse.name || ''),
        };
        dispatch({
          type: 'LOAD_STATE_FROM_DB',
          payload: loadedState,
          meta: { scheduleFundCalculation: !!normativeData },
        });

        // Verifica presenza bozza locale per notifica di risoluzione del conflitto
        const hasDraft = hasLocalDraft(user.id, entityToUse.id, result.targetYear);
        if (hasDraft) {
          const draft = loadLocalDraft(user.id, entityToUse.id, result.targetYear);
          if (draft) {
            dispatch({
              type: 'SET_PENDING_DRAFT',
              payload: {
                fundData: draft.fundData,
                sources: draft.sources,
                metadata: {
                  ...draft.metadata,
                  userId: requestUserId,
                  entityId: entityToUse.id,
                  year: result.targetYear,
                }
              }
            });
          }
        }

      }

      return true;
    } catch (err: any) {
      if (!isContextSwitchRequestCurrent(requestId, requestUserId)) {
        return false;
      }
      console.error("Transazione cambio anno fallita", err);
      const errorMsg = err.message || 'Errore generico di transazione durante il cambio ente/anno.';
      navigationFailed = true;
      dispatch({ type: 'SET_YEAR_SWITCH_ERROR', payload: errorMsg });
      alert(`Impossibile attivare l'annualità: ${errorMsg}`);
      return false;
    } finally {
      if (isContextSwitchRequestCurrent(requestId, requestUserId) && !(completedClosure && navigationFailed)) {
        dispatch({ type: 'SET_YEAR_SWITCHING', payload: false });
      }
    }
  }, [user, state.currentEntity, state.currentYear, state.currentUser, state.fundData, deps, loadAvailableYearsForEntity, state.isYearSwitching, state.hydratedSnapshotKey, normativeData, dispatch, saveState, flush, isContextSwitchRequestCurrent]);

  // The public ordinary switch offers no persistence bypass.
  const switchYearAtomic = useCallback((targetYear: number, explicitEntity?: any, existingRequestId?: number) =>
    switchYear(targetYear, explicitEntity, existingRequestId), [switchYear]);

  const switchYearAfterClosure = useCallback(async () => {
    const completed = completedClosureRef.current;
    if (!completed) return false;
    return switchYear(completed.nextYear, completed.entity, undefined, completed);
  }, [switchYear]);

  const loadEntities = useCallback(async () => {
    if (state.isYearSwitching) {
      return;
    }

    const requestUserId = state.currentUser.id;
    const requestId = ++contextSwitchRequestIdRef.current;
    const guardedDispatch: Dispatch<AppAction> = action => {
      if (isContextSwitchRequestCurrent(requestId, requestUserId)) {
        dispatch(action);
      }
    };
    const ctx = await loadEntitiesWorkflow(
      deps,
      state.currentUser,
      guardedDispatch,
      () => isContextSwitchRequestCurrent(requestId, requestUserId)
    );
    if (!isContextSwitchRequestCurrent(requestId, requestUserId)) return;
    if (ctx && ctx.entity && ctx.year) {
      await switchYearAtomic(ctx.year, ctx.entity, requestId);
    }
  }, [deps, state.currentUser, state.isYearSwitching, dispatch, switchYearAtomic, isContextSwitchRequestCurrent]);

  useEffect(() => {
    if (user) {
      loadEntities();
    }
  }, [user?.id, state.currentUser?.id, state.currentUser?.role]);

  // AG-122 FIX: Usare contextKey (ente) come chiave del flag invece di un booleano globale.
  // Così il load iniziale viene eseguito ogni volta che cambia l'ente attivo.
  const lastLoadedEntityRefId = React.useRef<string | null>(null);

  const createEntity = async (name: string) => {
    return await entityManagementWorkflow.create(deps, user, name, loadEntities, dispatch);
  };

  const renameEntity = async (id: string, name: string) => {
    await entityManagementWorkflow.rename(deps, user, id, name, state.currentEntity, loadEntities, dispatch);
  };

  const deleteEntity = async (id: string, options?: { skipConfirm?: boolean }) => {
    await entityManagementWorkflow.delete(deps, user, id, state.currentEntity, state.entities, loadEntities, dispatch, options);
  };

  const deleteYear = async (entityId: string, year: number) => {
    await yearManagementWorkflow.delete(deps, user, entityId, year, state.currentYear, availableYears, loadAvailableYears, dispatch);
  };

  const switchEntity = async (entityId: string) => {
    const entity = state.entities.find(e => e.id === entityId);
    if (!entity || !user) return;
    if (state.isYearSwitching) return;
    const requestUserId = user.id;
    const requestId = ++contextSwitchRequestIdRef.current;

    await flush();
    if (!isContextSwitchRequestCurrent(requestId, requestUserId)) return;

    try {
      localStorage.setItem('fl_last_entity_id', entity.id);
    } catch (e) {
      // ignore
    }

    // AG-122: Aggiorna il flag PRIMA del dispatch per evitare la doppia invocazione
    // dal useEffect [state.currentEntity?.id] che si attiverebbe subito dopo.
    lastLoadedEntityRefId.current = entity.id;

    dispatch({ type: 'SET_CURRENT_ENTITY', payload: entity });

    // Identifica l'anno di pertinenza (l'ultimo anno disponibile, o DEFAULT_CURRENT_YEAR se è un nuovo ente)
    const { data } = await deps.stateRepository.getAvailableYears(user.id, entity.id);
    if (!isContextSwitchRequestCurrent(requestId, requestUserId)) return;
    let targetYear = DEFAULT_CURRENT_YEAR;
    if (data && data.length > 0) {
      const prevYears = data.map(d => d.current_year);
      targetYear = pickMostRecentAutoSelectableYear(prevYears);

      try {
        const lastYearStr = localStorage.getItem('fl_last_year');
        if (lastYearStr) {
          const lastYearNum = parseInt(lastYearStr, 10);
          if (prevYears.includes(lastYearNum) && isAutoSelectableContextYear(lastYearNum)) {
            targetYear = lastYearNum;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    await switchYearAtomic(targetYear, entity, requestId);
  };


  const performFundCalculation = useCallback(async () => {
    const requestContext = createCalculationRequestContext(state);
    if (!requestContext) return;
    await performFundCalculationWorkflow(
      deps,
      state,
      requestContext,
      dispatch,
      normativeData,
      (overriddenDeps) => saveState(undefined, overriddenDeps),
      isCalculationRequestCurrent
    );
  }, [createCalculationRequestContext, deps, state, saveState, normativeData, isCalculationRequestCurrent]);

  /**
   * Calcolo locale: esegue validazione + calcolo motore e aggiorna lo stato React,
   * ma NON chiama saveState e NON scrive su Supabase.
   * Usare questa funzione quando si vuole ricalcolare i totali senza effetti collaterali remoti.
   */
  const performLocalCalculation = useCallback(async () => {
    const requestContext = createCalculationRequestContext(state);
    if (!requestContext) return;
    await performFundCalculationWorkflow(
      deps,
      state,
      requestContext,
      dispatch,
      normativeData,
      () => Promise.resolve(), // saveState no-op: non verrà mai chiamata
      isCalculationRequestCurrent,
      true // skipPersistence = true
    );
  }, [createCalculationRequestContext, deps, state, dispatch, normativeData, isCalculationRequestCurrent]);

  const setScopeAndTab = useCallback(async (scope: NavigationScope, tabId: string) => {
    await flush();
    dispatch({ type: 'SET_NAVIGATION_SCOPE', payload: scope });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
  }, [flush]);

  const restorePendingDraft = useCallback(() => {
    restorePendingDraftState(state, dispatch);
  }, [state.currentUser, state.currentEntity, state.currentYear, state.fundData?.metadata?.snapshotStatus, state.pendingDraftData, state.pendingDraftMetadata, state.pendingDraftSources]);

  const discardPendingDraft = useCallback(() => {
    if (!state.pendingDraftData) return;
    if (!user || !pendingDraftMatchesActiveContext(state)) {
      dispatch({ type: 'CLEAR_PENDING_DRAFT' });
      return;
    }
    const pendingContext = getPendingDraftContext(state);
    if (!pendingContext.userId || !pendingContext.entityId || !pendingContext.year) return;
    clearLocalDraft(pendingContext.userId, pendingContext.entityId, pendingContext.year);
    dispatch({ type: 'CLEAR_PENDING_DRAFT' });
  }, [dispatch, state, user]);

  const savePendingDraftRemotely = useCallback(async () => {
    console.warn('[DraftStorage] Il salvataggio remoto non è disponibile.');
  }, []);

  const closureReadiness = useMemo(() => {
    const snapshotStatus = state.fundData.metadata?.snapshotStatus;
    if (visibleMonetaryDraftIssues.length || Object.keys(state.validationErrors ?? {}).some(key => monetaryPolicyForControl(key.replace(/^fundData\./, '')))) {
      return resolveClosureInstructionReadiness({ snapshotStatus, canonicalFund: { status: 'INVALID', total: null } });
    }
    const stored = resolveClosureInstructionReadiness({
      snapshotStatus,
      canonicalFund: state.calculationResult?.canonicalFund,
      issues: resolveChecklist({
        complianceChecks: state.complianceChecks,
        canonicalFund: state.calculationResult?.canonicalFund,
      }),
    });
    // Non promuovere un risultato non pronto e non alterare retry/recovery CLOSED.
    if (stored.status !== 'READY') return stored;
    const currentNormative = state.normativeData || normativeData;
    if (!currentNormative) return resolveClosureInstructionReadiness({ snapshotStatus });
    try {
      // Stesso motore del workflow, senza dispatch/save: un risultato in memoria
      // precedente all'ultima modifica non può autorizzare il congelamento del draft.
      const current = calculateFundCompletely(normalizeInput(state.fundData), currentNormative);
      return resolveClosureInstructionReadiness({
        snapshotStatus, canonicalFund: current.canonicalFund,
        issues: resolveChecklist({ complianceChecks: current.compliance.checks, canonicalFund: current.canonicalFund }),
      });
    } catch {
      return resolveClosureInstructionReadiness({ snapshotStatus, canonicalFund: { status: 'INVALID', total: null } });
    }
  }, [state.fundData, state.validationErrors, state.calculationResult, state.complianceChecks, state.normativeData, normativeData, visibleMonetaryDraftIssues]);

  const contextValue = {
    state,
    dispatch,
    performFundCalculation,
    performLocalCalculation,
    saveState: (
      fundDataOverride?: FundData,
      overriddenDeps?: any,
      yearOverride?: number,
      entityOverride?: any
    ) => saveState(fundDataOverride, overriddenDeps, yearOverride, entityOverride),
    availableYears,
    loadEntities,
    createEntity,
    renameEntity,
    deleteEntity,
    deleteYear,
    switchEntity,
    switchYearAtomic,
    switchYearAfterClosure,
    closureReadiness,
    closeCurrentYear: async () => {
      // Gate client prima di qualsiasi dispatch o esecuzione del workflow atomico.
      // ALREADY_CLOSED conserva il percorso preesistente di retry/recovery programmatico.
      if (closureReadiness.status === 'NOT_READY') {
        return { success: false, closedYear: state.currentYear, nextYear: state.currentYear + 1,
          carryForward: 0, warnings: [], nonTransferredResiduals: [],
          error: closureReadiness.primaryReason!.message };
      }
      // Hardening AG-123: Se mancano i dati di contesto ma abbiamo ente e anno, proviamo a reidratare
      if (user && state.currentEntity && state.currentYear && !state.normativeData && normativeData) {
        dispatch({ type: 'SET_NORMATIVE_DATA', payload: normativeData });
      }

      const currentNormative = state.normativeData || normativeData;

      if (!user) return { success: false, error: 'Utente non autenticato.', closedYear: state.currentYear, nextYear: state.currentYear + 1, carryForward: 0, warnings: [], nonTransferredResiduals: [] };
      if (!state.currentEntity) return { success: false, error: 'Nessun ente selezionato.', closedYear: state.currentYear, nextYear: state.currentYear + 1, carryForward: 0, warnings: [], nonTransferredResiduals: [] };
      if (!state.currentYear) return { success: false, error: 'Nessun anno attivo identificato.', closedYear: state.currentYear, nextYear: state.currentYear + 1, carryForward: 0, warnings: [], nonTransferredResiduals: [] };
      if (!currentNormative) return { success: false, error: 'Dati normativi (CCNL) non ancora caricati. Attendi un istante e riprova.', closedYear: state.currentYear, nextYear: state.currentYear + 1, carryForward: 0, warnings: [], nonTransferredResiduals: [] };

      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const snapshotKey = state.hydratedSnapshotKey || `${state.currentEntity.id}:${state.currentYear}`;

        const result = await closeYearAndPrepareNext(
          deps,
          user,
          state.currentEntity,
          state.currentYear,
          state.currentUser.role,
          state.fundData,
          currentNormative,
          createEmptyFundData(state.currentYear + 1, state.currentEntity.name || ''),
          snapshotKey
        );

        if (result.success) {
          closedSnapshotKeysRef.current.add(`${user.id}:${state.currentEntity.id}:${result.closedYear}`);
          completedClosureRef.current = {
            userId: user.id, entity: state.currentEntity,
            closedYear: result.closedYear, nextYear: result.nextYear,
          };
          dispatch({
            type: 'LOAD_STATE_FROM_DB',
            payload: {
              ...state,
              fundData: {
                ...state.fundData,
                metadata: {
                  ...state.fundData?.metadata,
                  snapshotStatus: AnnualSnapshotStatus.CLOSED,
                  closedAt: new Date().toISOString(),
                  closedBy: user.email,
                  closureVersion: 1,
                  sourceYear: state.currentYear
                }
              }
            }
          });
          await loadAvailableYears();
        }

        return result;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    setScopeAndTab,
    isYearSwitching: state.isYearSwitching || false,
    lastYearSwitchError: state.lastYearSwitchError,
    restorePendingDraft,
    discardPendingDraft,
    savePendingDraftRemotely
  };


  return (
    <AppContext.Provider value={contextValue}>
      <MonetaryDraftIssuesContext.Provider value={visibleMonetaryDraftIssues}>
        <MonetaryDraftContext.Provider key={`${state.currentEntity?.id}:${state.currentYear}`} value={registerMonetaryDraft}>{children}</MonetaryDraftContext.Provider>
      </MonetaryDraftIssuesContext.Provider>
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

/** Central mutation gate; persisted hydration remains lossless and diagnosable. */
export const appReducer = (state: AppState, action: AppAction): AppState => {
  const next = appReducerCore(state, action);
  if (next.fundData === state.fundData) return next;
  const issues = validateMonetaryData(next.fundData);
  if (action.type === 'LOAD_STATE_FROM_DB') return { ...next, validationErrors: { ...next.validationErrors, ...monetaryIssueMessages(issues) },
    ...(issues.length ? { calculationResult: undefined, error: 'Snapshot con importi non validi: correggere i campi prima di salvare.' } : {}) };
  const read = (data: unknown, path: string): unknown => path.split('.').reduce<unknown>((obj, key) => obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined, data);
  const previous = validateMonetaryData(state.fundData);
  const introduced = issues.filter(i => !previous.some(p => p.path === i.path && p.code === i.code && Object.is(read(next.fundData, i.path), read(state.fundData, i.path))));
  if ((action.type.startsWith('IMPORT_') && issues.length) || introduced.length) return { ...state,
    validationErrors: { ...state.validationErrors, ...monetaryIssueMessages(issues) }, error: 'Modifica rifiutata: importi non validi.' };
  const validationErrors = { ...next.validationErrors };
  for (const key of Object.keys(validationErrors)) if (monetaryPolicyForControl(key) || previous.some(i => i.path === key)) delete validationErrors[key];
  return { ...next, fundData: issues.length ? next.fundData : normalizeMonetaryData(next.fundData),
    validationErrors: { ...validationErrors, ...monetaryIssueMessages(issues) }, ...(issues.length === 0 && state.error?.startsWith('Snapshot con importi') ? { error: undefined } : {}) };
};
