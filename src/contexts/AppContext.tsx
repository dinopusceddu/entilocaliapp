// contexts/AppContext.tsx
import React, { createContext, useReducer, Dispatch, useContext, useCallback, useEffect } from 'react';
import { AppState, AppAction, SimulatoreIncrementoInput, FondoAccessorioDipendenteData, FondoElevateQualificazioniData, FondoSegretarioComunaleData, FondoDirigenzaData, PersonaleServizioDettaglio, TipoMaggiorazione, DistribuzioneRisorseData, UserRole } from '../types.ts';
import { DEFAULT_CURRENT_YEAR, INITIAL_HISTORICAL_DATA, INITIAL_ANNUAL_DATA, DEFAULT_USER, INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA, INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA, INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA, INITIAL_FONDO_DIRIGENZA_DATA, INITIAL_DISTRIBUZIONE_RISORSE_DATA } from '../constants.ts';
import { calculateFundCompletely } from '../logic/fundCalculations.ts';
import { runAllComplianceChecks } from '../logic/complianceChecks.ts';
import { validateFundData } from '../logic/validation.ts';
import { useNormativeData } from '../hooks/useNormativeData.ts';
import { supabase } from '../services/supabase.ts';
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
  calculatedFund: undefined,
  complianceChecks: [],
  isLoading: false,
  isNormativeDataLoading: false,
  error: undefined,
  validationErrors: {},
  activeTab: 'benvenuto',
};

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
  performFundCalculation: () => Promise<void>;
  saveState: () => Promise<void>;
  availableYears: number[];
  loadEntities: () => Promise<void>;
  createEntity: (name: string) => Promise<void>;
  renameEntity: (id: string, name: string) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
  switchEntity: (entityId: string) => Promise<void>;
  createNewYear: (year: number) => Promise<void>;
}>({
  state: defaultInitialState,
  dispatch: () => null,
  performFundCalculation: async () => { },
  saveState: async () => { },
  availableYears: [],
  loadEntities: async () => { },
  createEntity: async () => { },
  renameEntity: async () => { },
  deleteEntity: async () => { },
  switchEntity: async () => { },
  createNewYear: async () => { },
});

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_ENTITIES':
      return { ...state, entities: action.payload };
    case 'SET_CURRENT_ENTITY':
      return {
        ...state, currentEntity: action.payload,
        // Reset fund data when switching entity if needed, or leave it to loadState
        fundData: { ...defaultInitialState.fundData, annualData: { ...defaultInitialState.fundData.annualData, annoRiferimento: state.currentYear } },
        calculatedFund: undefined,
        complianceChecks: [],
      };
    case 'SET_CURRENT_YEAR':
      return {
        ...state,
        currentYear: action.payload,
        fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, annoRiferimento: action.payload } },
        calculatedFund: undefined,
        complianceChecks: [],
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
    case 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          fondoAccessorioDipendenteData: {
            ...state.fundData.fondoAccessorioDipendenteData,
            ...action.payload,
          } as FondoAccessorioDipendenteData
        }
      };
    case 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          fondoElevateQualificazioniData: {
            ...state.fundData.fondoElevateQualificazioniData,
            ...action.payload,
          } as FondoElevateQualificazioniData
        }
      };
    case 'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          fondoSegretarioComunaleData: {
            ...state.fundData.fondoSegretarioComunaleData,
            ...action.payload,
          } as FondoSegretarioComunaleData
        }
      };
    case 'UPDATE_FONDO_DIRIGENZA_DATA':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          fondoDirigenzaData: {
            ...state.fundData.fondoDirigenzaData,
            ...action.payload,
          } as FondoDirigenzaData
        }
      };
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
        const field = Object.keys(changes)[0] as keyof PersonaleServizioDettaglio;

        if (field === 'partTimePercentage' || field === 'numeroDifferenziali') {
          const rawValue = (changes as any)[field];
          (updatedEmployee as any)[field] = rawValue === '' || rawValue === undefined || rawValue === null ? undefined : Number(rawValue);
        } else if (field === 'livelloPeoStoriche' && (changes as any)[field] === "") {
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
      return { ...state, isLoading: false, calculatedFund: action.payload.fund, complianceChecks: action.payload.checks, validationErrors: {} };
    case 'CALCULATE_FUND_ERROR':
      return { ...state, isLoading: false, error: action.payload, calculatedFund: undefined, complianceChecks: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    // NEW ACTION to bulk update state from DB
    case 'LOAD_STATE_FROM_DB':
      return { ...state, ...action.payload, calculatedFund: undefined, complianceChecks: [], isLoading: false };
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
    case 'IMPORT_FUND_DATA':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          ...action.payload,
          annualData: {
            ...state.fundData.annualData,
            ...(action.payload.annualData || {}),
            simulatoreInput: {
              ...state.fundData.annualData.simulatoreInput,
              ...(action.payload.annualData?.simulatoreInput || {})
            },
            ccnl2024: {
              ...state.fundData.annualData.ccnl2024,
              ...(action.payload.annualData?.ccnl2024 || {})
            }
          },
          historicalData: {
            ...state.fundData.historicalData,
            ...(action.payload.historicalData || {})
          },
          fondoAccessorioDipendenteData: {
            ...state.fundData.fondoAccessorioDipendenteData,
            ...(action.payload.fondoAccessorioDipendenteData || {})
          },
          fondoElevateQualificazioniData: {
            ...state.fundData.fondoElevateQualificazioniData,
            ...(action.payload.fondoElevateQualificazioniData || {})
          },
          fondoSegretarioComunaleData: {
            ...state.fundData.fondoSegretarioComunaleData,
            ...(action.payload.fondoSegretarioComunaleData || {})
          },
          fondoDirigenzaData: {
            ...state.fundData.fondoDirigenzaData,
            ...(action.payload.fondoDirigenzaData || {})
          }
        }
      };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Get user first

  // Initialize state WITH user info if available, to avoid "Guest" flash
  const initialStateWithUser = {
    ...defaultInitialState,
    currentUser: user ? {
      id: user.id,
      name: user.email || 'Utente',
      email: user.email || '',
      role: UserRole.GUEST // Default to GUEST, DB load will update it
    } : defaultInitialState.currentUser
  };

  const [state, dispatch] = useReducer(appReducer, initialStateWithUser);
  const { data: normativeData } = useNormativeData();

  // Effect to keep user in sync if auth changes
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
  }, [user]);

  const [availableYears, setAvailableYears] = React.useState<number[]>([]);

  // Load Entities
  // Load Entities
  const loadEntities = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('user_id', user.id) // Only load own entities
        .order('name');

      if (error) throw error;
      dispatch({ type: 'SET_ENTITIES', payload: data || [] });

      // If there's only one entity or none selected, select the first one automatically
      if (data && data.length > 0 && !state.currentEntity) {
        dispatch({ type: 'SET_CURRENT_ENTITY', payload: data[0] });
      }
    } catch (err) {
      console.error('Error loading entities:', err);
    }
  }, [user, state.currentEntity]);

  // Load available years
  const loadAvailableYears = useCallback(async () => {
    if (!user || !state.currentEntity) return;
    try {
      const { data, error } = await supabase
        .from('user_app_state')
        .select('current_year')
        .eq('entity_id', state.currentEntity.id)
        .order('current_year', { ascending: false });

      if (error) throw error;
      if (data) {
        setAvailableYears(data.map(d => d.current_year));
      }
    } catch (err) {
      console.error('Error fetching years:', err);
    }
  }, [user, state.currentEntity]);

  // Initial Load (Entities then Years/State)
  useEffect(() => {
    if (user) {
      loadEntities();
    }
  }, [user]);

  // Load state from Supabase when user is authenticated, entity is selected, or current year changes
  useEffect(() => {
    if (!user || !state.currentEntity) return;

    loadAvailableYears();

    const fetchState = async () => {
      console.log('AppProvider: fetchState started', state.currentEntity?.name, state.currentYear);
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { data, error } = await supabase
          .from('user_app_state')
          .select('*')
          .eq('entity_id', state.currentEntity!.id)
          .eq('current_year', state.currentYear)
          .single();

        console.log('AppProvider: fetchState result', { data, error });

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching state:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Errore nel caricamento dei dati.' });
          dispatch({ type: 'SET_LOADING', payload: false });
        } else if (data) {
          const loadedState: Partial<AppState> = {
            currentYear: data.current_year,
            currentUser: { ...state.currentUser, id: user.id, email: user.email || '', name: user.email || 'Utente', role: (data.role as UserRole) || UserRole.GUEST },
            fundData: {
              ...(data.fund_data || defaultInitialState.fundData),
              annualData: {
                ...(data.fund_data?.annualData || defaultInitialState.fundData.annualData),
                denominazioneEnte: state.currentEntity?.name || ''
              },
              personaleServizio: data.fund_data?.personaleServizio || data.personale_servizio || defaultInitialState.fundData.personaleServizio,
            },
          };
          // @ts-ignore
          dispatch({ type: 'LOAD_STATE_FROM_DB', payload: loadedState });
        } else {
          console.log('AppProvider: No data found for year, checking for existing user profile...');

          // Set initial entity name in annual data since we are starting fresh
          if (state.currentEntity) {
            dispatch({
              type: 'UPDATE_ANNUAL_DATA',
              payload: { denominazioneEnte: state.currentEntity.name }
            });
          }

          // Fallback: Check if user exists in other years/entities to get their role
          const { data: profileData } = await supabase
            .from('user_app_state')
            .select('role, email')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          if (profileData) {
            console.log('AppProvider: Found existing profile, applying role:', profileData.role);
            dispatch({
              type: 'SET_USER',
              payload: {
                ...state.currentUser,
                id: user.id,
                email: user.email || '',
                name: user.email || 'Utente',
                role: (profileData.role as UserRole) || UserRole.GUEST
              }
            });
          }

          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (err) {
        console.error('Unexpected error fetching state:', err);
        dispatch({ type: 'SET_ERROR', payload: 'Errore imprevisto nel caricamento.' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchState();
  }, [user, state.currentEntity, state.currentYear, loadAvailableYears]);

  const saveState = useCallback(async () => {
    if (!user || !state.currentEntity) return;

    try {
      const stateToSave = {
        user_id: user.id,
        entity_id: state.currentEntity.id,
        current_year: state.currentYear,
        email: user.email,
        role: state.currentUser.role,
        fund_data: state.fundData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_app_state')
        .upsert(stateToSave, { onConflict: 'entity_id, current_year' });

      if (error) {
        console.error("Could not save state to Supabase.", error);
      } else {
        // Also ensure the entity name is updated in the entities table if it changed
        if (state.currentEntity.name === state.fundData.annualData.denominazioneEnte) {
          await supabase
            .from('entities')
            .update({ name: state.currentEntity.name })
            .eq('id', state.currentEntity.id);
        }
        loadAvailableYears();
      }
    } catch (error) {
      console.error("Could not save state to Supabase.", error);
    }
  }, [state.currentYear, state.currentUser.role, state.fundData, user, state.currentEntity, loadAvailableYears]);

  const createEntity = async (name: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('entities').insert({ name, user_id: user.id }).select().single();
      if (error) throw error;
      if (data) {
        await loadEntities(); // Reload list
        dispatch({ type: 'SET_CURRENT_ENTITY', payload: data });
        dispatch({ type: 'SET_CURRENT_YEAR', payload: DEFAULT_CURRENT_YEAR }); // Reset year to default
      }
    } catch (err) {
      console.error("Error creating entity:", err);
      alert("Impossibile creare l'ente.");
    }
  };

  const renameEntity = async (id: string, name: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('entities').update({ name }).eq('id', id);
      if (error) throw error;
      await loadEntities();

      if (state.currentEntity?.id === id) {
        dispatch({ type: 'SET_CURRENT_ENTITY', payload: { ...state.currentEntity, name } });
        dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { denominazioneEnte: name } });
      }
    } catch (err) {
      console.error("Error renaming entity:", err);
      alert("Impossibile rinominare l'ente.");
    }
  };

  const deleteEntity = async (id: string) => {
    if (!user) return;
    if (!confirm("Sei sicuro di voler eliminare questo ente? Tutti i dati e gli anni associati andranno persi.")) return;

    try {
      const { error: dataError } = await supabase.from('user_app_state').delete().eq('entity_id', id);
      if (dataError) throw dataError;

      const { error } = await supabase.from('entities').delete().eq('id', id);
      if (error) throw error;

      await loadEntities();

      if (state.currentEntity?.id === id) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error deleting entity:", err);
      alert("Impossibile eliminare l'ente.");
    }
  };

  const switchEntity = async (entityId: string) => {
    const entity = state.entities.find(e => e.id === entityId);
    if (entity) {
      dispatch({ type: 'SET_CURRENT_ENTITY', payload: entity });
      // Resetting year is handled in reducer or verify if we want to keep same year?
      // Usually better to reset to default or keep same if available. 
      // Current logic in reducer resets data but Year needs to be ensured.
    }
  };

  const createNewYear = async (year: number) => {
    dispatch({ type: 'SET_CURRENT_YEAR', payload: year });
    // Logic to trigger save or just switch?
    // Switching year triggers fetch, if not found uses defaults.
    // User can then save.
  };

  const performFundCalculation = useCallback(async () => {
    if (!normativeData) {
      // Normative data not yet loaded — return silently so no error
      // blocks the auto-calc useEffect in HomePage from retrying.
      return;
    }

    const validationErrors = validateFundData(state.fundData);
    if (Object.keys(validationErrors).length > 0) {
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: validationErrors });
      // Do not set a generic error message, so the detailed list in DataEntryPage is shown.
      dispatch({ type: 'SET_ERROR', payload: undefined });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    dispatch({ type: 'CALCULATE_FUND_START' });
    try {
      const calculatedFund = calculateFundCompletely(state.fundData, normativeData);
      const complianceChecks = runAllComplianceChecks(calculatedFund, state.fundData, normativeData);
      dispatch({ type: 'CALCULATE_FUND_SUCCESS', payload: { fund: calculatedFund, checks: complianceChecks } });
      await saveState(); // Save after successful calculation
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      dispatch({ type: 'CALCULATE_FUND_ERROR', payload: `Errore nel calcolo: ${error}` });
      console.error("Calculation error:", e);
    }
  }, [state.fundData, saveState, normativeData]);

  const contextValue = {
    state,
    dispatch,
    performFundCalculation,
    saveState,
    availableYears,
    loadEntities,
    createEntity,
    renameEntity,
    deleteEntity,
    switchEntity,
    createNewYear
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);