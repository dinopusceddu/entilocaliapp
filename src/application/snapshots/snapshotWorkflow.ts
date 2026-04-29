import { WorkflowDependencies } from '../ports';
import {
  AnnualSnapshot,
  AnnualSnapshotSaveResult,
  AnnualSnapshotLoadResult,
  YearSwitchResult,
  UserRole
} from '../../domain';
import { shouldFilterByOwner } from '../policies/authorizationPolicy';

export const saveAnnualSnapshot = async (
  deps: Pick<WorkflowDependencies, 'stateRepository' | 'entityRepository'>,
  user: any,
  entity: any,
  year: number,
  role: UserRole,
  fundData: any
): Promise<AnnualSnapshotSaveResult> => {
  if (!user || !entity) {
    return { success: false, error: 'User or Entity missing' };
  }

  // Hardening AG-123: Impedisce il salvataggio se lo snapshot è CHIUSO
  if (fundData?.metadata?.snapshotStatus === 'CLOSED') {
    // Nota: in fase di chiusura stessa, vogliamo salvare lo stato CLOSED.
    // Dobbiamo permettere il salvataggio se lo stato è appena stato impostato a CLOSED 
    // MA l'istruzione dice "il workflow ordinario di salvataggio non deve persistere modifiche".
    // Tuttavia, dobbiamo poter persistere la chiusura stessa.
    // Un modo è caricare lo stato attuale dal DB e vedere se è GIÀ chiuso.
  }

  try {
    // Per massimizzare la sicurezza, verifichiamo lo stato attuale sul DB prima di sovrascrivere
    // AG-125: Usiamo la policy di visibilità per caricare lo stato (un Admin deve vedere se è CLOSED anche se non è proprietario)
    const filterUserId = shouldFilterByOwner(user) ? user.id : undefined;
    const stateRes = await deps.stateRepository.getState(filterUserId, entity.id, year);
    const currentState = stateRes?.data;

    if (currentState?.fund_data?.metadata?.snapshotStatus === 'CLOSED') {
      return { success: false, error: `L'esercizio ${year} è CHIUSO e non può essere modificato.` };
    }

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
      console.error("Could not save snapshot to DB:", error);
      return { success: false, error: error.message };
    }

    if (entity.name === fundData.annualData?.denominazioneEnte) {
      await deps.entityRepository.update(entity.id, entity.name);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error saving snapshot:", err);
    return { success: false, error: err.message || 'Unexpected save error' };
  }
};

export const loadAnnualSnapshot = async (
  deps: Pick<WorkflowDependencies, 'stateRepository'>,
  user: any,
  entityId: string,
  year: number
): Promise<AnnualSnapshotLoadResult> => {
  try {
    const filterUserId = shouldFilterByOwner(user) ? user.id : undefined;
    const { data, error } = await deps.stateRepository.getState(filterUserId, entityId, year);

    if (error && error.code !== 'PGRST116') {
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

      const snapshot: AnnualSnapshot = {
        entityId: data.entity_id,
        year: data.current_year,
        userId: data.user_id,
        role: data.role as UserRole,
        fundData: fundData,
        updatedAt: data.updated_at
      };
      return { success: true, snapshot, isNewInitialization: false };
    } else {
      return { success: true, isNewInitialization: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const initializeAnnualSnapshot = async (
  deps: Pick<WorkflowDependencies, 'stateRepository' | 'userRepository'>,
  userId: string,
  entityId: string,
  year: number,
  currentUser: any,
  defaultFundData: any
): Promise<AnnualSnapshotLoadResult> => {
  try {
    // 1. Get role
    const { data: role } = await deps.userRepository.getUserRole(userId);
    const currentRole = (role as UserRole) || currentUser?.role || UserRole.GUEST;

    // 2. Prepare state
    const initialStateToSave = {
      user_id: userId,
      entity_id: entityId,
      current_year: year,
      email: currentUser?.email,
      role: currentRole,
      fund_data: defaultFundData,
      updated_at: new Date().toISOString(),
    };

    // 3. Save it physically
    const { error: insertError } = await deps.stateRepository.createState(initialStateToSave);

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return {
      success: true,
      isNewInitialization: true,
      snapshot: {
        entityId,
        year,
        userId,
        role: currentRole,
        fundData: defaultFundData,
        updatedAt: initialStateToSave.updated_at
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
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
  canSaveCurrent: boolean = true
): Promise<YearSwitchResult> => {
  // 1. Atomically Save the CURRENT year first. If it fails, abort switch.
  // AG-122B/AG-125: Salviamo solo se canSaveCurrent è true E l'esercizio non è chiuso.
  if (currentYear !== targetYear && entity && currentYear && canSaveCurrent) {
    const isCurrentClosed = currentDraftFundData?.metadata?.snapshotStatus === 'CLOSED';

    if (isCurrentClosed) {
      // Procediamo direttamente al caricamento dell'anno target senza tentare il salvataggio preventivo
    } else {
      const saveRes = await saveAnnualSnapshot(deps, user, entity, currentYear, currentRole, currentDraftFundData);
      if (!saveRes.success) {
        return {
          success: false,
          targetYear: currentYear,
          error: `Errore nel salvataggio dell'anno corrente (${currentYear}): ${saveRes.error}. Nessuno switch effettuato.`,
          savedPreviousYear: false
        };
      }
    }
  }

  const savedPreviousYear = !!(currentYear !== targetYear && entity && currentYear && canSaveCurrent);

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
    console.log(`[SnapshotDebug] Anno ${targetYear} non trovato, inizializzazione...`);
    const initRes = await initializeAnnualSnapshot(deps, user.id, entity.id, targetYear, user, defaultFundData);
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
