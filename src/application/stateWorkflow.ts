import { AppAction, UserRole } from '../types.ts';

import { DEFAULT_CURRENT_YEAR } from '../constants.ts';
import { WorkflowDependencies } from './ports';
import { shouldFilterByOwner } from './policies/authorizationPolicy';

const MAX_AUTO_CONTEXT_FUTURE_YEARS = 1;
const MIN_CONTEXT_YEAR = 2000;

export const isAutoSelectableContextYear = (
  year: unknown,
  baseYear: number = DEFAULT_CURRENT_YEAR
): year is number => {
  return Number.isInteger(year) &&
    (year as number) >= MIN_CONTEXT_YEAR &&
    (year as number) <= baseYear + MAX_AUTO_CONTEXT_FUTURE_YEARS;
};

export const parseAutoSelectableContextYear = (
  value: unknown,
  fallback: number = DEFAULT_CURRENT_YEAR
): number => {
  const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
  return isAutoSelectableContextYear(parsed) ? parsed : fallback;
};

export const pickMostRecentAutoSelectableYear = (
  years: number[],
  fallback: number = DEFAULT_CURRENT_YEAR
): number => {
  const selectableYears = years.filter(year => isAutoSelectableContextYear(year));
  if (selectableYears.length === 0) return fallback;
  return selectableYears.sort((a, b) => b - a)[0];
};

/**
 * Workflow for loading the list of entities for the current user.
 */
export const loadEntitiesWorkflow = async (
  deps: Pick<WorkflowDependencies, 'entityRepository' | 'stateRepository'>,
  user: any,
  dispatch: React.Dispatch<AppAction>
): Promise<{ entity: any; year: number } | null> => {
  if (!user) return null;
  try {
    const filterUserId = shouldFilterByOwner(user) ? user.id : undefined;
    const { data, error } = await deps.entityRepository.getAll(filterUserId);

    if (error) throw error;

    if (data && data.length > 0) {
      dispatch({ type: 'SET_ENTITIES', payload: data });

      let targetEntity = null;
      let targetYear = DEFAULT_CURRENT_YEAR;

      const contextKey = `fl_last_context_${user.id}`;
      const lastContextStr = localStorage.getItem(contextKey);

      if (lastContextStr) {
        try {
          const ctx = JSON.parse(lastContextStr);
          if (ctx && ctx.entityId) {
            const found = data.find((e: any) => e.id === ctx.entityId);
            if (found) {
              targetEntity = found;
              targetYear = parseAutoSelectableContextYear(ctx.year);
            }
          }
        } catch (e) {
          console.warn('Errore parsing last context', e);
        }
      }

      if (!targetEntity) {
        const legacyEntityId = localStorage.getItem('fl_last_entity_id');
        const legacyYear = localStorage.getItem('fl_last_year');
        if (legacyEntityId) {
          const found = data.find((e: any) => e.id === legacyEntityId);
          if (found) {
            targetEntity = found;
            if (legacyYear) targetYear = parseAutoSelectableContextYear(legacyYear);
          }
        }
      }

      if (!targetEntity) {
        targetEntity = data[0];
        try {
          const yearsRes = await deps.stateRepository.getAvailableYears(filterUserId, targetEntity.id);
          if (yearsRes.data && yearsRes.data.length > 0) {
            const prevYears = yearsRes.data.map((d: any) => d.current_year);
            targetYear = pickMostRecentAutoSelectableYear(prevYears);
          }
        } catch (e) {
          // ignore
        }
      }

      try {
        localStorage.setItem(contextKey, JSON.stringify({
          entityId: targetEntity.id,
          year: targetYear,
          updatedAt: new Date().toISOString()
        }));
      } catch (e) {
        // ignore
      }

      dispatch({ type: 'SET_CURRENT_ENTITY', payload: targetEntity });
      dispatch({ type: 'SET_CURRENT_YEAR', payload: targetYear });

      return { entity: targetEntity, year: targetYear };
    }
  } catch (err) {
    console.error('Error in loadEntitiesWorkflow:', err);
  }
  return null;
};

/**
 * Workflow for loading the available years for a specific entity.
 */
export const loadAvailableYearsWorkflow = async (
  deps: Pick<WorkflowDependencies, 'stateRepository'>,
  user: any,
  entityId: string,
  setAvailableYears: (years: number[]) => void
) => {
  if (!user || !entityId) return;
  try {
    const filterUserId = shouldFilterByOwner(user) ? user.id : undefined;
    const { data, error } = await deps.stateRepository.getAvailableYears(filterUserId, entityId);

    if (error) throw error;
    if (data) {
      setAvailableYears(data.map(d => d.current_year).sort((a, b) => b - a));
    }
  } catch (err) {
    console.error('Error fetching years:', err);
  }
};



/**
 * Workflow for saving the current app state.
 */
export const saveAppStateWorkflow = async (
  deps: Pick<WorkflowDependencies, 'stateRepository' | 'entityRepository'>,
  user: any,
  entity: any,
  year: number,
  role: UserRole,
  fundData: any,
  loadAvailableYears: () => Promise<void>
) => {
  if (!user || !entity) return;

  try {
    const stateToSave = {
      user_id: user.id,
      entity_id: entity.id,
      current_year: year,
      email: user.email,
      role: role,
      fund_data: fundData,
      updated_at: new Date().toISOString(),
    };

    const { error } = await deps.stateRepository.upsertState(stateToSave);

    if (error) {
      console.error("Could not save state to Supabase.", error);
    } else {
      if (entity.name === fundData.annualData.denominazioneEnte) {
        await deps.entityRepository.update(entity.id, entity.name);
      }
      await loadAvailableYears();
    }
  } catch (error) {
    console.error("Could not save state to Supabase.", error);
  }
};

/**
 * Workflow for entity management operations.
 */
export const entityManagementWorkflow = {
  create: async (
    deps: Pick<WorkflowDependencies, 'entityRepository' | 'interactionService'>,
    user: any,
    name: string,
    loadEntities: () => Promise<void>,
    dispatch: React.Dispatch<AppAction>
  ) => {
    if (!user) return;
    try {
      const { data, error } = await deps.entityRepository.create(name, user.id);
      if (error) throw error;
      if (data) {
        await loadEntities();
        dispatch({ type: 'SET_CURRENT_ENTITY', payload: data });
        dispatch({ type: 'SET_CURRENT_YEAR', payload: DEFAULT_CURRENT_YEAR });
      }
    } catch (err) {
      console.error("Error creating entity:", err);
      deps.interactionService.alert("Impossibile creare l'ente.");
    }
  },

  rename: async (
    deps: Pick<WorkflowDependencies, 'entityRepository' | 'interactionService'>,
    user: any,
    id: string,
    name: string,
    currentEntity: any,
    loadEntities: () => Promise<void>,
    dispatch: React.Dispatch<AppAction>
  ) => {
    if (!user) return;
    try {
      const { error } = await deps.entityRepository.update(id, name);
      if (error) throw error;
      await loadEntities();

      if (currentEntity?.id === id) {
        dispatch({ type: 'SET_CURRENT_ENTITY', payload: { ...currentEntity, name } });
        dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { denominazioneEnte: name } });
      }
    } catch (err) {
      console.error("Error renaming entity:", err);
      deps.interactionService.alert("Impossibile rinominare l'ente.");
    }
  },

  delete: async (
    deps: Pick<WorkflowDependencies, 'entityRepository' | 'stateRepository' | 'interactionService'>,
    user: any,
    id: string,
    currentEntity: any,
    entities: any[],
    loadEntities: () => Promise<void>,
    dispatch: React.Dispatch<AppAction>
  ) => {
    if (!user) return;
    if (!await deps.interactionService.confirm("Sei sicuro di voler eliminare questo ente? Tutti i dati e gli anni associati andranno persi.")) return;

    try {
      await deps.stateRepository.deleteStatesByEntity(id);
      const { error } = await deps.entityRepository.delete(id);
      if (error) throw error;

      await loadEntities();

      if (currentEntity?.id === id) {
        const remainingEntities = entities.filter(e => e.id !== id);
        if (remainingEntities.length > 0) {
          dispatch({ type: 'SET_CURRENT_ENTITY', payload: remainingEntities[0] });
          dispatch({ type: 'SET_CURRENT_YEAR', payload: DEFAULT_CURRENT_YEAR });
        } else {
          deps.interactionService.reload();
        }
      }
    } catch (err) {
      console.error("Error deleting entity:", err);
      deps.interactionService.alert("Impossibile eliminare l'ente.");
    }
  }
};

/**
 * Workflow for year management operations.
 */
export const yearManagementWorkflow = {
  delete: async (
    deps: Pick<WorkflowDependencies, 'stateRepository' | 'interactionService'>,
    user: any,
    entityId: string,
    year: number,
    currentYear: number,
    availableYears: number[],
    loadAvailableYears: () => Promise<void>,
    dispatch: React.Dispatch<AppAction>
  ) => {
    if (!user) return;
    if (!await deps.interactionService.confirm(`Sei sicuro di voler eliminare l'annualità ${year}? Tutti i dati inseriti per questo anno andranno persi.`)) return;

    try {
      const { error } = await deps.stateRepository.deleteState(entityId, year);

      if (error) throw error;

      await loadAvailableYears();

      if (currentYear === year) {
        const remainingYears = availableYears.filter(y => y !== year);
        const targetYear = remainingYears.length > 0 ? remainingYears[0] : DEFAULT_CURRENT_YEAR;
        dispatch({ type: 'SET_CURRENT_YEAR', payload: targetYear });
      }
    } catch (err) {
      console.error("Error deleting year:", err);
      deps.interactionService.alert("Impossibile eliminare l'annualità.");
    }
  }
};
