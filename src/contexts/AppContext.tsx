// contexts/AppContext.tsx
import React, { createContext, useReducer, Dispatch, useContext, useCallback, useEffect, useMemo } from 'react';
import { AppState, AppAction, FundData, SimulatoreIncrementoInput, FondoAccessorioDipendenteData, FondoElevateQualificazioniData, FondoSegretarioComunaleData, FondoDirigenzaData, TipoMaggiorazione, DistribuzioneRisorseData, UserRole, NavigationScope, YearClosureResult } from '../domain';

import {
  DEFAULT_CURRENT_YEAR,
  INITIAL_HISTORICAL_DATA,
  INITIAL_ANNUAL_DATA,
  DEFAULT_USER,
  INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA,
  INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA,
  INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA,
  INITIAL_FONDO_DIRIGENZA_DATA,
  INITIAL_DISTRIBUZIONE_RISORSE_DATA
} from '../constants.ts';
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



import { SupabaseEntityRepository } from '../infrastructure/persistence/SupabaseEntityRepository';
import { SupabaseStateRepository } from '../infrastructure/persistence/SupabaseStateRepository';
import { SupabaseUserRepository } from '../infrastructure/persistence/SupabaseUserRepository';
import { BrowserInteractionService } from '../infrastructure/browser/BrowserInteractionService';
import { useNormativeData } from '../hooks/useNormativeData.ts';
import { useAuth } from './AuthContext.tsx';

const defaultInitialState: AppState = {
  currentUser: DEFAULT_USER,
  currentYear: DEFAULT_CURRENT_YEAR,
  entities: [],
  currentEntity: undefined,
  fundData: {
    historicalData: INITIAL_HISTORICAL_DATA,
    annualData: INITIAL_ANNUAL_DATA,
    fondoAccessorioDipendenteData: INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA,
    fondoElevateQualificazioniData: INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA,
    fondoSegretarioComunaleData: INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA,
    fondoDirigenzaData: INITIAL_FONDO_DIRIGENZA_DATA,
    distribuzioneRisorseData: INITIAL_DISTRIBUZIONE_RISORSE_DATA,
    personaleServizio: {
      dettagli: [],
      isManualMode: false,
      manualProgressioni: 0,
      manualIndennita: 0,
      manualDipendentiEquivalenti: 0,
    },
  },
  calculationResult: undefined,
  complianceChecks: [],
  isLoading: false,
  isNormativeDataLoading: false,
  error: undefined,
  validationErrors: {},
  activeTab: 'dashboard',
  navigationScope: NavigationScope.DASHBOARD,
  isYearSwitching: false,
};


const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
  performFundCalculation: () => Promise<void>;
  performLocalCalculation: () => Promise<void>;
  saveState: (fundDataOverride?: FundData) => Promise<void>;
  availableYears: number[];
  loadEntities: () => Promise<void>;
  createEntity: (name: string) => Promise<void>;
  renameEntity: (id: string, name: string) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
  deleteYear: (entityId: string, year: number) => Promise<void>;
  switchEntity: (entityId: string) => Promise<void>;
  switchYearAtomic: (targetYear: number, explicitEntity?: any) => Promise<boolean>;
  setScopeAndTab: (scope: NavigationScope, tabId: string) => void;
  isYearSwitching: boolean;
  lastYearSwitchError?: string;
  closeCurrentYear: () => Promise<YearClosureResult>;
  restorePendingDraft: () => void;
  discardPendingDraft: () => void;
  savePendingDraftRemotely: () => Promise<void>;
}>({

  state: defaultInitialState,
  dispatch: () => null,
  performFundCalculation: async () => { },
  performLocalCalculation: async () => { },
  saveState: async (_fundDataOverride?: FundData) => { },
  availableYears: [],
  loadEntities: async () => { },
  createEntity: async () => { },
  renameEntity: async () => { },
  deleteEntity: async () => { },
  deleteYear: async () => { },
  switchEntity: async () => { },
  switchYearAtomic: async (_targetYear: number, _explicitEntity?: any) => false,
  setScopeAndTab: () => { },
  isYearSwitching: false,
  closeCurrentYear: async () => ({ success: false, closedYear: 0, nextYear: 0, carryForward: 0, warnings: [], nonTransferredResiduals: [], error: 'Default' }),
  restorePendingDraft: () => { },
  discardPendingDraft: () => { },
  savePendingDraftRemotely: async () => { },
});


export const appReducer = (state: AppState, action: AppAction): AppState => {

  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload, hydratedSnapshotKey: null }; // Invalida guardia al cambio utente / logout
    case 'SET_NORMATIVE_DATA':
      return { ...state, normativeData: action.payload };
    case 'SET_ENTITIES':
      return { ...state, entities: action.payload };
    case 'SET_CURRENT_ENTITY':
      // AG-122 FIX: Non resettare fundData ai default con placeholder.
      // Conserviamo solo la struttura dello stato, azzerando il risultato del calcolo.
      // Il nome reale dell'ente viene impostato immediatamente dalla proprietà entity.name.
      return {
        ...state,
        currentEntity: action.payload,
        fundData: {
          ...defaultInitialState.fundData,
          annualData: {
            ...defaultInitialState.fundData.annualData,
            annoRiferimento: state.currentYear,
            denominazioneEnte: action.payload.name || '',
          }
        },
        calculationResult: undefined,
        complianceChecks: [],
        hydratedSnapshotKey: null, // Reset guard keyed al cambio ente
      };
    case 'SET_CURRENT_YEAR':
      return {
        ...state,
        currentYear: action.payload,
        fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, annoRiferimento: action.payload } },
        calculationResult: undefined,
        complianceChecks: [],
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
    case 'CALCULATE_FUND_START':
      return { ...state, isLoading: true, error: undefined, validationErrors: {} };
    case 'CALCULATE_FUND_SUCCESS':
      return {
        ...state,
        isLoading: false,
        calculationResult: action.payload.result,
        complianceChecks: action.payload.checks,
        validationErrors: {}
      };
    case 'CALCULATE_FUND_ERROR':
      return { ...state, isLoading: false, error: action.payload, calculationResult: undefined, complianceChecks: [] };
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

      return {
        ...newState,
        calculationResult: undefined,
        complianceChecks: [],
        isLoading: false,
        isYearSwitching: false,
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

  const initialStateWithUser = {
    ...defaultInitialState,
    currentUser: user ? {
      id: user.id,
      name: user.email || 'Utente',
      email: user.email || '',
      role: UserRole.GUEST
    } : defaultInitialState.currentUser
  };

  const [state, dispatch] = useReducer(appReducer, initialStateWithUser);
  const { data: normativeData } = useNormativeData();

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

  const loadAvailableYearsForEntity = useCallback(async (entityId?: string) => {
    await loadAvailableYearsWorkflow(deps, user, entityId || state.currentEntity?.id || '', setAvailableYears);
  }, [deps, user, state.currentEntity?.id]);

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
    if (user && state.currentEntity) {
      loadAvailableYears();
    }
  }, [deps, user, state.currentEntity, loadAvailableYears]);

  // Modificato per agganciarsi al workflow locale, ma con opzione di chiamare il save puro
  // AG-124: Aggiunto fundDataOverride, yearOverride e entityOverride per gestire correttamente le race condition.
  const saveState = useCallback(async (
    fundDataOverride?: FundData,
    overriddenDeps?: Pick<WorkflowDependencies, 'stateRepository' | 'entityRepository'>,
    yearOverride?: number,
    entityOverride?: any
  ) => {
    const targetEntity = entityOverride || state.currentEntity;
    const targetYear = yearOverride || state.currentYear;

    // Se non abbiamo un'entità o un utente, non possiamo salvare nulla
    if (!user || !targetEntity) return;

    // Se l'anno di riferimento remoto è CLOSED, blocchiamo la scrittura su database di produzione
    const currentFundData = fundDataOverride || state.fundData;
    if (currentFundData?.metadata?.snapshotStatus === 'CLOSED') {
      console.warn('[AppContext] Scrittura su Supabase bloccata perché lo snapshot è CLOSED.');
      return;
    }

    // AG-122C: Protezione salvataggio "premuroso"
    // Durante un cambio contesto (switchYearAtomic), permettiamo il salvataggio se viene passato un override esplicito.
    if (!yearOverride && !entityOverride) {
      const currentKey = `${targetEntity.id}:${targetYear}`;
      if (state.hydratedSnapshotKey !== currentKey) {
        return;
      }
    }

    await saveAppStateWorkflow(
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
  }, [state.currentYear, state.currentUser.role, state.fundData, user, state.currentEntity, loadAvailableYears, deps, state.hydratedSnapshotKey]);

  // Effetto di persistenza locale automatica controllata per mantenere la purezza del reducer
  useEffect(() => {
    if (!user || !state.currentEntity || !state.currentYear || !state.hydratedSnapshotKey) return;

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

  const switchYearAtomic = useCallback(async (targetYear: number, explicitEntity?: any) => {
    const entityToUse = explicitEntity || state.currentEntity;
    if (!user || !entityToUse) {
      return false;
    }
    if (state.isYearSwitching) {
      return false;
    }

    const previousEntity = state.currentEntity;
    const previousYear = state.currentYear;
    const isCrossEntitySwitch = !!explicitEntity && explicitEntity.id !== previousEntity?.id;
    const hydratedPreviousKey = previousEntity ? `${previousEntity.id}:${previousYear}` : null;
    const canSaveCurrent = !isCrossEntitySwitch && state.hydratedSnapshotKey === hydratedPreviousKey;

    dispatch({ type: 'SET_YEAR_SWITCHING', payload: true });

    try {
      const result = await switchActiveYear(
        deps,
        state.currentUser,
        entityToUse,
        previousYear,
        targetYear,
        state.currentUser.role,
        state.fundData,
        defaultInitialState.fundData,
        canSaveCurrent,
        previousEntity
      );

      if (!result.success) {
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

      await loadAvailableYearsForEntity(entityToUse.id);

      // Idrata il reducer con i dati del nuovo anno (AG-122: mappa tutti i sub-fondi)
      if (result.newSnapshot) {
        const snap = result.newSnapshot.fundData || {};
        const loadedState: Partial<AppState> = {
          currentYear: result.targetYear,
          currentUser: state.currentUser,
          currentEntity: entityToUse,
          fundData: {
            ...defaultInitialState.fundData,
            ...snap,
            annualData: {
              ...defaultInitialState.fundData.annualData,
              ...(snap.annualData || {}),
              personaleServizioAttuale: snap.annualData?.personaleServizioAttuale || defaultInitialState.fundData.annualData.personaleServizioAttuale,
              annoRiferimento: result.targetYear,
              // AG-122: Il nome ente è sempre preso dall'entità reale (fonte autoritativa = tabella entities).
              // Non ci fidiamo del valore nello snapshot che può contenere placeholder obsoleti.
              denominazioneEnte: entityToUse.name || snap.annualData?.denominazioneEnte || '',
            },
            historicalData: {
              ...defaultInitialState.fundData.historicalData,
              ...(snap.historicalData || {}),
            },
            fondoAccessorioDipendenteData: {
              ...defaultInitialState.fundData.fondoAccessorioDipendenteData,
              ...(snap.fondoAccessorioDipendenteData || {}),
            },
            fondoElevateQualificazioniData: {
              ...defaultInitialState.fundData.fondoElevateQualificazioniData,
              ...(snap.fondoElevateQualificazioniData || {}),
            },
            fondoSegretarioComunaleData: {
              ...defaultInitialState.fundData.fondoSegretarioComunaleData,
              ...(snap.fondoSegretarioComunaleData || {}),
            },
            fondoDirigenzaData: {
              ...defaultInitialState.fundData.fondoDirigenzaData,
              ...(snap.fondoDirigenzaData || {}),
            },
            distribuzioneRisorseData: {
              ...defaultInitialState.fundData.distribuzioneRisorseData,
              ...(snap.distribuzioneRisorseData || {}),
            },
            personaleServizio: {
              ...defaultInitialState.fundData.personaleServizio,
              ...(snap.personaleServizio || {}),
            },
          } as FundData,
        };
        // @ts-ignore
        dispatch({ type: 'LOAD_STATE_FROM_DB', payload: { ...loadedState, snapshotKey: `${entityToUse.id}:${result.targetYear}` } });

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
                metadata: draft.metadata
              }
            });
          }
        }

        // AG-123: Trigger ricalcolo automatico dopo l'idratazione dello stato
        if (normativeData) {
          // Usiamo un piccolo timeout per assicurarci che il dispatch precedente sia stato processato
          // anche se performFundCalculation Workflow legge lo stato e il dispatcher.
          setTimeout(() => {
            const finalLoadedState = { ...state, ...loadedState } as AppState;
            performFundCalculationWorkflow(
              deps,
              finalLoadedState,
              dispatch,
              normativeData,
              (overriddenDeps) => saveState(finalLoadedState.fundData, overriddenDeps, result.targetYear, entityToUse)
            );
          }, 0);
        }
      }

      return true;
    } catch (err: any) {
      console.error("Transazione cambio anno fallita", err);
      const errorMsg = err.message || 'Errore generico di transazione durante il cambio ente/anno.';
      dispatch({ type: 'SET_YEAR_SWITCH_ERROR', payload: errorMsg });
      alert(`Impossibile attivare l'annualità: ${errorMsg}`);
      return false;
    } finally {
      dispatch({ type: 'SET_YEAR_SWITCHING', payload: false });
    }
  }, [user, state.currentEntity, state.currentYear, state.currentUser, state.fundData, deps, loadAvailableYearsForEntity, state.isYearSwitching, state.hydratedSnapshotKey, normativeData, dispatch, saveState]);

  const loadEntities = useCallback(async () => {
    const ctx = await loadEntitiesWorkflow(deps, state.currentUser, dispatch);
    if (ctx && ctx.entity && ctx.year) {
      await switchYearAtomic(ctx.year, ctx.entity);
    }
  }, [deps, state.currentUser, dispatch, switchYearAtomic]);

  useEffect(() => {
    if (user) {
      loadEntities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, state.currentUser?.id, state.currentUser?.role]);

  // AG-122 FIX: Usare contextKey (ente) come chiave del flag invece di un booleano globale.
  // Così il load iniziale viene eseguito ogni volta che cambia l'ente attivo.
  const lastLoadedEntityRefId = React.useRef<string | null>(null);

  const createEntity = async (name: string) => {
    await entityManagementWorkflow.create(deps, user, name, loadEntities, dispatch);
  };

  const renameEntity = async (id: string, name: string) => {
    await entityManagementWorkflow.rename(deps, user, id, name, state.currentEntity, loadEntities, dispatch);
  };

  const deleteEntity = async (id: string) => {
    await entityManagementWorkflow.delete(deps, user, id, state.currentEntity, state.entities, loadEntities, dispatch);
  };

  const deleteYear = async (entityId: string, year: number) => {
    await yearManagementWorkflow.delete(deps, user, entityId, year, state.currentYear, availableYears, loadAvailableYears, dispatch);
  };

  const switchEntity = async (entityId: string) => {
    const entity = state.entities.find(e => e.id === entityId);
    if (!entity || !user) return;

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

    await switchYearAtomic(targetYear, entity);
  };


  const performFundCalculation = useCallback(async () => {
    await performFundCalculationWorkflow(deps, state, dispatch, normativeData, (overriddenDeps) => saveState(undefined, overriddenDeps));
  }, [deps, state, saveState, normativeData]);

  /**
   * Calcolo locale: esegue validazione + calcolo motore e aggiorna lo stato React,
   * ma NON chiama saveState e NON scrive su Supabase.
   * Usare questa funzione quando si vuole ricalcolare i totali senza effetti collaterali remoti.
   */
  const performLocalCalculation = useCallback(async () => {
    await performFundCalculationWorkflow(
      deps,
      state,
      dispatch,
      normativeData,
      () => Promise.resolve(), // saveState no-op: non verrà mai chiamata
      true // skipPersistence = true
    );
  }, [deps, state, dispatch, normativeData]);

  const setScopeAndTab = useCallback((scope: NavigationScope, tabId: string) => {
    dispatch({ type: 'SET_NAVIGATION_SCOPE', payload: scope });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
  }, []);

  const restorePendingDraft = useCallback(() => {
    if (!state.pendingDraftData) return;
    dispatch({ type: 'IMPORT_FUND_DATA', payload: state.pendingDraftData });
    if (state.pendingDraftSources) {
      dispatch({ type: 'UPDATE_LOCAL_SOURCES', payload: state.pendingDraftSources });
    }
    dispatch({ type: 'CLEAR_PENDING_DRAFT' });
  }, [state.pendingDraftData, state.pendingDraftSources]);

  const discardPendingDraft = useCallback(() => {
    if (!user || !state.currentEntity || !state.currentYear) return;
    clearLocalDraft(user.id, state.currentEntity.id, state.currentYear);
    dispatch({ type: 'CLEAR_PENDING_DRAFT' });
  }, [user, state.currentEntity, state.currentYear]);

  const savePendingDraftRemotely = useCallback(async () => {
    if (!user || !state.currentEntity || !state.currentYear || !state.pendingDraftData) return;
    // Condizione 1: Mock/stub esplicito del salvataggio definitivo su Supabase
    console.log('[DraftStorage] MOCK SAVE: Salvo definitivamente su DB i dati della bozza.');
    // Pulisce la bozza locale ora che è stata mockata
    clearLocalDraft(user.id, state.currentEntity.id, state.currentYear);
    dispatch({ type: 'CLEAR_PENDING_DRAFT' });
  }, [user, state.currentEntity, state.currentYear, state.pendingDraftData]);

  const contextValue = {
    state,
    dispatch,
    performFundCalculation,
    performLocalCalculation,
    saveState: () => saveState(),
    availableYears,
    loadEntities,
    createEntity,
    renameEntity,
    deleteEntity,
    deleteYear,
    switchEntity,
    switchYearAtomic,
    closeCurrentYear: async () => {
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
          defaultInitialState.fundData,
          snapshotKey
        );

        if (result.success) {
          // AG-123: Invece di ricaricare tutto lo stato che può causare loop,
          // ci limitiamo a ricaricare la lista degli anni disponibili per aggiornare i badge.
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
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
