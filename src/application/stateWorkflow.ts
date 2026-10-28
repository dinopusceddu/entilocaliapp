import { ABSENT_VERSION, baselineFromRow, isVersion, persistenceError, requireBaseline, saveFailure, StatePersistenceError, unchangedDraft } from './snapshots/versionedSnapshotContract';
import { AppAction, UserRole } from '../types.ts';
import { AnnualSnapshotSaveResult, SnapshotBaseline } from '../domain/snapshot';
import { validateMonetaryProcessing } from './input/monetaryProcessingSafety';
import { normalizeMonetaryData } from '../domain/monetaryBoundary';

import { DEFAULT_CURRENT_YEAR } from '../constants.ts';
import { WorkflowDependencies } from './ports';
import { shouldFilterByOwner } from './policies/authorizationPolicy';
import { snapshotOwnerMetadata } from './snapshots/snapshotPersistenceContract';

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
  dispatch: React.Dispatch<AppAction>,
  shouldCommit: () => boolean = () => true
): Promise<{ entity: any; year: number } | null> => {
  if (!user) return null;
  try {
    const filterUserId = shouldFilterByOwner(user) ? user.id : undefined;
    const { data, error } = await deps.entityRepository.getAll(filterUserId);

    if (!shouldCommit()) return null;
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
          if (!shouldCommit()) return null;
          if (yearsRes.data && yearsRes.data.length > 0) {
            const prevYears = yearsRes.data.map((d: any) => d.current_year);
            targetYear = pickMostRecentAutoSelectableYear(prevYears);
          }
        } catch (e) {
          // ignore
        }
      }

      if (!shouldCommit()) return null;
      // Context preference is committed by the provider only after keyed hydration.
      return { entity: targetEntity, year: targetYear };
    }
  } catch (err) {
    if (shouldCommit()) console.error('Error in loadEntitiesWorkflow:', err);
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
  deps: Pick<WorkflowDependencies, 'stateRepository' | 'entityRepository'> & Partial<Pick<WorkflowDependencies, 'userRepository'>>,
  user: any, entity: any, year: number, role: UserRole, fundData: any,
  loadAvailableYears: () => Promise<void>, baseline?: SnapshotBaseline
): Promise<AnnualSnapshotSaveResult> => {
  if (!user || !entity?.user_id) return { success: false, reason: 'VALIDATION_ERROR', error: 'Utente o proprietario dell’ente non disponibile.' };
  const issues = validateMonetaryProcessing(fundData);
  if (issues.length) return { success: false, reason: 'VALIDATION_ERROR', issues, error: 'Correggere gli importi prima di salvare.' };
  try {
    const loaded = requireBaseline(baseline, user.id, entity.id, year);
    fundData = normalizeMonetaryData(fundData);
    if (unchangedDraft(loaded, fundData)) return { success: true, noWrite: true, baseline: loaded, version: loaded.version ?? undefined };
    const current = loaded.exists ? { ...loaded.identity, fund_data: loaded.fundData } : null;
    let ownerRole: string | undefined;
    if (!loaded.exists && user.id !== entity.user_id) {
      const owner = await deps.userRepository?.getUserRole(entity.user_id);
      if (owner?.error || !owner?.data || ![...Object.values(UserRole), 'USER'].includes(owner.data)) return { success: false, reason: 'OWNERSHIP_VIOLATION', error: 'Ruolo del proprietario non verificabile.' };
      ownerRole = owner.data;
    }
    const metadata = snapshotOwnerMetadata(current, entity.user_id, user, role, ownerRole);
    const result = await deps.stateRepository.upsertState({
      entity_id: entity.id, current_year: year, ...metadata, fund_data: fundData,
      updated_at: new Date().toISOString(), b1i4_expected: loaded.exists ? loaded.version : ABSENT_VERSION
    });
    if (result.error) return saveFailure(result.error);
    if (!result.data || !isVersion(result.data.b1i4_version)) return saveFailure(new StatePersistenceError('STATE_WRITE_NOT_CONFIRMED', 'Versione salvata non confermata.'));
    const confirmed = baselineFromRow(user.id, result.data);
    try { await loadAvailableYears(); } catch { /* A list refresh cannot turn a confirmed mutation into an unknown write. */ }
    return { success: true, baseline: confirmed, version: confirmed.version!, persistedRow: result.data };
  } catch (error) { return saveFailure(error); }
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
  ): Promise<any | undefined> => {
    if (!user) return undefined;
    try {
      const { data, error } = await deps.entityRepository.create(name, user.id);
      if (error) throw error;
      if (data) {
        await loadEntities();
        dispatch({ type: 'SET_CURRENT_ENTITY', payload: data });
        dispatch({ type: 'SET_CURRENT_YEAR', payload: DEFAULT_CURRENT_YEAR });
        return data;
      }
      return undefined;
    } catch (err) {
      console.error("Error creating entity:", err);
      deps.interactionService.alert("Impossibile creare l'ente.");
      return undefined;
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
    user: any, id: string, _currentEntity: any, _entities: any[],
    loadEntities: () => Promise<void>, _dispatch: React.Dispatch<AppAction>,
    _options?: { skipConfirm?: boolean }
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      if (!deps.stateRepository.getStateVersions) throw new StatePersistenceError('STATE_VERSION_REQUIRED', 'Elenco completo delle versioni non disponibile.');
      const map = await deps.stateRepository.getStateVersions(id);
      if (map.error || !map.data) throw map.error || new StatePersistenceError('STATE_VERSION_REQUIRED', 'Versioni non disponibili.');
      const years = Object.keys(map.data).sort().join(', ') || 'nessuna annualità';
      // This explicit confirmation belongs to the captured version map, even when an older caller already asked a generic confirmation.
      if (!await deps.interactionService.confirm('Eliminare questo ente e le annualità consultate (' + years + ')? Modifiche concorrenti impediranno la cancellazione.')) return false;
      const result = await deps.entityRepository.delete(id, map.data);
      if (result.error) throw result.error;
      await loadEntities();
      return true;
    } catch (error: any) {
      deps.interactionService.alert(persistenceError(error).message);
      return false;
    }
  }

};

/**
 * Workflow for year management operations.
 */
export const yearManagementWorkflow = {
  delete: async (
    deps: Pick<WorkflowDependencies, 'stateRepository' | 'interactionService'>,
    user: any, entityId: string, year: number, _currentYear: number,
    _availableYears: number[], loadAvailableYears: () => Promise<void>,
    _dispatch: React.Dispatch<AppAction>, loadedBaseline?: SnapshotBaseline
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      let baseline = loadedBaseline;
      if (!baseline) {
        const read = await deps.stateRepository.getState(user.id, entityId, year);
        if (read.error) throw read.error;
        if (!read.data) throw new StatePersistenceError('STATE_NOT_FOUND', 'Annualità non disponibile.');
        baseline = baselineFromRow(user.id, read.data);
      }
      const captured = requireBaseline(baseline, user.id, entityId, year);
      if (!captured.exists || captured.rawStatus !== 'OPEN') throw new StatePersistenceError('STATE_NOT_OPEN', 'Questa annualità non è eliminabile.');
      // The row/version has been read for this decision, never refreshed behind this prompt.
      if (!await deps.interactionService.confirm('Eliminare l’annualità ' + year + ' appena consultata? Le modifiche concorrenti impediranno la cancellazione.')) return false;
      const result = await deps.stateRepository.deleteState(entityId, year, captured.version!);
      if (result.error) throw result.error;
      await loadAvailableYears();
      return true;
    } catch (error: any) {
      deps.interactionService.alert(persistenceError(error).message);
      return false;
    }
  }
};