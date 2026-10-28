import { WorkflowDependencies } from '../ports';
import {
  AnnualSnapshot,
  SnapshotBaseline,
  AnnualSnapshotSaveResult,
  AnnualSnapshotLoadResult,
  YearSwitchResult,
  UserRole
} from '../../domain';
import { shouldFilterByOwner } from '../policies/authorizationPolicy';
import { carryDl25ToNextYear } from '../../logic/shared/dl25CarryForward';
import { validateMonetaryProcessing } from '../input/monetaryProcessingSafety';

import { saveAppStateWorkflow } from '../stateWorkflow';
import { ABSENT_VERSION, absentBaseline, baselineFromRow, isVersion } from './versionedSnapshotContract';

export const saveAnnualSnapshot = async (
  deps: Pick<WorkflowDependencies, 'stateRepository' | 'entityRepository'> & Partial<Pick<WorkflowDependencies, 'userRepository'>>,
  user: any, entity: any, year: number, role: UserRole, fundData: any, baseline?: SnapshotBaseline
): Promise<AnnualSnapshotSaveResult> =>
  saveAppStateWorkflow(deps, user, entity, year, role, fundData, async () => {}, baseline);

export const loadAnnualSnapshot = async (
  deps: Pick<WorkflowDependencies, 'stateRepository'>,
  user: any,
  entityId: string,
  year: number
): Promise<AnnualSnapshotLoadResult> => {
  try {
    const filterUserId = shouldFilterByOwner(user) ? user.id : undefined;
    const { data, error } = await deps.stateRepository.getState(filterUserId, entityId, year);

    if (error) {
      return { success: false, error: error.message };
    }

    if (data) {
      let fundData = data.fund_data;

      // Protezione: se fund_data è salvato come stringa (raro ma possibile), proviamo il parsing
      if (typeof fundData === 'string') {
        try {
          fundData = JSON.parse(fundData);
        } catch (e) {
          console.error("[SnapshotDebug] Errore parsing fund_data stringa:", e);
          return { success: false, error: 'Dati del fondo corrotti (formato stringa non valido)' };
        }
      }

      // Protezione: assicuriamoci che sia un oggetto e non null
      if (!fundData || typeof fundData !== 'object') {
        console.error("[SnapshotDebug] fund_data invalido:", fundData);
        return { success: false, error: 'Dati del fondo mancanti o invalidi nel database' };
      }

      const baseline = baselineFromRow(user.id, data);
      const snapshot: AnnualSnapshot = {
        entityId: data.entity_id,
        year: data.current_year,
        userId: data.user_id,
        role: data.role as UserRole,
        fundData: fundData,
        updatedAt: data.updated_at,
        baseline
      };
      return { success: true, snapshot, baseline, isNewInitialization: false };
    } else {
      return { success: true, baseline: absentBaseline(user.id, entityId, year), isNewInitialization: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const initializeAnnualSnapshot = async (
  deps: Pick<WorkflowDependencies, 'stateRepository' | 'userRepository'>,
  userId: string, entityId: string, year: number, currentUser: any, defaultFundData: any
): Promise<AnnualSnapshotLoadResult> => {
  if (!userId || !currentUser?.id) return { success: false, error: 'Proprietario o attore non disponibile.' };
  const issues = validateMonetaryProcessing(defaultFundData);
  if (issues.length) return { success: false, error: 'MONETARY_VALIDATION_ERROR' };
  try {
    const owner = await deps.userRepository.getUserRole(userId);
    if (owner.error || typeof owner.data !== 'string' || ![...Object.values(UserRole), 'USER'].includes(owner.data)) return { success: false, error: 'Ruolo del proprietario non verificabile.' };
    // Only the construction of a new, confirmed-absent annuality supplies OPEN.
    // Existing historical rows and explicit CLOSED/OTHER/NULL inputs are never normalized.
    if (defaultFundData?.metadata?.snapshotStatus !== undefined && defaultFundData.metadata.snapshotStatus !== 'OPEN')
      return { success: false, error: 'STATE_NOT_OPEN: stato iniziale non consentito.' };
    const initialFundData = structuredClone(defaultFundData);
    initialFundData.metadata = { ...initialFundData.metadata, snapshotStatus: 'OPEN' };
    const result = await deps.stateRepository.createState({
      user_id: userId, entity_id: entityId, current_year: year,
      email: currentUser.id === userId ? currentUser.email ?? null : null,
      role: owner.data, fund_data: initialFundData, updated_at: new Date().toISOString(),
      b1i4_expected: ABSENT_VERSION
    });
    if (result.error) return { success: false, error: result.error.message, technicalCause: result.error };
    if (!result.data || !isVersion(result.data.b1i4_version)) return { success: false, error: 'Creazione non confermata dal server.' };
    const baseline = baselineFromRow(currentUser.id, result.data);
    return { success: true, isNewInitialization: true, baseline,
      snapshot: { entityId, year, userId: result.data.user_id, role: result.data.role as UserRole,
        fundData: baseline.fundData, updatedAt: result.data.updated_at, baseline } };
  } catch (error: any) { return { success: false, error: error.message, technicalCause: error }; }
};

export const switchActiveYear = async (
  deps: Pick<WorkflowDependencies, 'stateRepository' | 'entityRepository' | 'userRepository'>,
  user: any,
  entity: any,
  currentYear: number,
  targetYear: number,
  currentRole: UserRole,
  currentDraftFundData: any,
  defaultFundData: any,
  canSaveCurrent: boolean = false,
  currentEntityForSave?: any,
  currentBaseline?: SnapshotBaseline
): Promise<YearSwitchResult> => {
  const entityForCurrentSave = currentEntityForSave || entity;
  // Save only an explicitly dirty, hydrated context; requests below are not atomic.
  let savedPreviousYear = false;
  // AG-122B/AG-125: Salviamo solo se canSaveCurrent è true E l'esercizio non è chiuso.
  if (currentYear !== targetYear && entityForCurrentSave && currentYear && canSaveCurrent) {
    const isCurrentClosed = currentDraftFundData?.metadata?.snapshotStatus === 'CLOSED';

    if (isCurrentClosed) {
      // Procediamo direttamente al caricamento dell'anno target senza tentare il salvataggio preventivo
    } else {
      const saveRes = await saveAnnualSnapshot(deps, user, entityForCurrentSave, currentYear, currentRole, currentDraftFundData, currentBaseline);
      if (!saveRes.success) {
        return {
          success: false,
          targetYear: currentYear,
          error: `Errore nel salvataggio dell'anno corrente (${currentYear}): ${saveRes.error}. Nessuno switch effettuato.`,
          savedPreviousYear: false
        };
      }
      savedPreviousYear = true;
    }
  }

  // 2. Load TARGET year snapshot
  if (!user || !entity || !targetYear) {
    return { success: false, targetYear: currentYear, error: 'Dati di contesto invalidi', savedPreviousYear };
  }

  const loadRes = await loadAnnualSnapshot(deps, user, entity.id, targetYear);

  if (!loadRes.success) {
    return { success: false, targetYear: currentYear, error: `Errore caricamento anno ${targetYear}: ${loadRes.error}`, savedPreviousYear };
  }

  // 3. If missing, initialize it
  if (loadRes.isNewInitialization) {
    if (!entity.user_id) {
      console.error("Canonical ownership violation: entity.user_id missing in switchActiveYear");
      return { success: false, targetYear: currentYear, error: "Impossibile inizializzare l'annualità: proprietario dell'ente non definito.", savedPreviousYear };
    }
    console.log(`[SnapshotDebug] Anno ${targetYear} non trovato, inizializzazione per owner ${entity.user_id}...`);
    const sameEntity = !currentEntityForSave || currentEntityForSave.id === entity.id;
    const nextDefaults = sameEntity && targetYear === currentYear + 1
      ? carryDl25ToNextYear(currentDraftFundData, defaultFundData, targetYear) : defaultFundData;
    const initRes = await initializeAnnualSnapshot(deps, entity.user_id, entity.id, targetYear, user, nextDefaults);
    if (!initRes.success) {
      console.error(`[SnapshotDebug] Fallimento inizializzazione per ${targetYear}:`, initRes.error);
      return { success: false, targetYear: currentYear, error: `Errore inizializzazione anno ${targetYear}`, savedPreviousYear };
    }
    console.log(`[SnapshotDebug] Inizializzazione riuscita per ${targetYear}`);
    return { success: true, targetYear, newSnapshot: initRes.snapshot, savedPreviousYear };
  }

  console.log(`[SnapshotDebug] Caricamento riuscito per ${targetYear}. Snapshot trovato.`);
  return { success: true, targetYear, newSnapshot: loadRes.snapshot, savedPreviousYear };
};
