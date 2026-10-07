import { WorkflowDependencies } from './ports';
import { 
  saveAnnualSnapshot, 
  loadAnnualSnapshot, 
  initializeAnnualSnapshot 
} from './snapshots/snapshotWorkflow';
import { 
  AnnualSnapshotStatus, 
  YearClosureResult, 
  UserRole,
  NormativeData,
  FundData
} from '../domain';
import { calculateFundCompletely } from '../logic/calculation/fundEngine';
import { calculateYearClosureCarryForward } from '../logic/calculation/closureCalculations';
import { normalizeInput } from './input/inputNormalizer';
import { prepareDl25NextAnnuality } from './snapshots/dl25NextAnnuality';
import { validateMonetaryProcessing } from './input/monetaryProcessingSafety';

/**
 * Workflow transazionale per la chiusura di un esercizio e la preparazione del successivo.
 * AG-123: Chiusura esplicita, deterministica e protetta.
 */
export const closeYearAndPrepareNext = async (
  deps: WorkflowDependencies,
  user: any,
  entity: any,
  year: number,
  currentRole: UserRole,
  currentDraftFundData: FundData,
  normativeData: NormativeData,
  defaultFundData: FundData,
  hydratedSnapshotKey: string | null
): Promise<YearClosureResult> => {
  // 1. Hardening Contestuale (AG-122C)
  const expectedKey = `${entity?.id}:${year}`;
  if (hydratedSnapshotKey !== expectedKey) {
    console.warn(`[YearClosure] Security check failed. Key: ${hydratedSnapshotKey}, Expected: ${expectedKey}`);
    return {
      success: false,
      closedYear: year,
      nextYear: year + 1,
      carryForward: 0,
      warnings: [],
      nonTransferredResiduals: [],
      error: `Errore di sincronizzazione contesto: rilevato ${hydratedSnapshotKey}, atteso ${expectedKey}. Ricarica la pagina.`
    };
  }

  try {
    const nextYear = year + 1;
    const monetaryIssues = validateMonetaryProcessing(currentDraftFundData);
    if (monetaryIssues.length) return { success: false, closedYear: year, nextYear, carryForward: 0,
      warnings: [], nonTransferredResiduals: [], error: 'MONETARY_VALIDATION_ERROR: ' + monetaryIssues.map(i => `${i.path}: ${i.message}`).join('\n') };

    // 2. Caricamento Snapshot Corrente per verifica stato
    const loadRes = await loadAnnualSnapshot(deps, user, entity.id, year);
    if (!loadRes.success) {
      console.error("[YearClosure] Step 2 failed: Load snapshot", loadRes.error);
      throw new Error(`Impossibile caricare lo snapshot corrente: ${loadRes.error}`);
    }

    const currentStatus = loadRes.snapshot?.fundData?.metadata?.snapshotStatus;
    if (currentStatus === AnnualSnapshotStatus.CLOSED) {
      // Idempotenza: verifichiamo se l'anno successivo esiste già con successo
      const nextCheck = await loadAnnualSnapshot(deps, user, entity.id, nextYear);
      if (nextCheck.success && !nextCheck.isNewInitialization) {
        const carry = nextCheck.snapshot?.fundData?.fondoAccessorioDipendenteData?.vn_art80c1_sommeNonUtilizzateStabiliPrec || 0;
        return {
          success: true,
          closedYear: year,
          nextYear: nextYear,
          carryForward: carry,
          warnings: [`L'anno ${year} risulta già chiuso. Operazione già completata.`],
          nonTransferredResiduals: []
        };
      }
      if (!deps.stateRepository.closeYearAtomic) {
        return {
          success: false,
          closedYear: year,
          nextYear: nextYear,
          carryForward: 0,
          warnings: [],
          nonTransferredResiduals: [],
          error: `L'esercizio ${year} è già in stato CHIUSO.`
        };
      }
      // Se l'anno successivo non esiste (stato inconsistente precedente), proseguiamo per il recovery tramite RPC atomico
    }

    // 3. Calcolo Risultati per determinazione riporto
    const normalizedInput = normalizeInput(currentDraftFundData);
    const calcResult = calculateFundCompletely(normalizedInput, normativeData);
    const carryForwardInfo = calculateYearClosureCarryForward(calcResult, currentDraftFundData.distribuzioneRisorseData);
    const carryForwardValue = carryForwardInfo.leftoverFad;

    // 4. Preparazione Metadati di Chiusura
    const closureMetadata = {
      snapshotStatus: AnnualSnapshotStatus.CLOSED,
      closedAt: new Date().toISOString(),
      closedBy: user.email,
      closureVersion: 1,
      sourceYear: year
    };

    const closedFundData = {
      ...currentDraftFundData,
      metadata: closureMetadata
    };

    // 5. Preparazione Anno Successivo con Riporto
    const loadNextRes = await loadAnnualSnapshot(deps, user, entity.id, nextYear);
    let baseNextFundData: any;
    if (loadNextRes.isNewInitialization || !loadNextRes.snapshot) {
      baseNextFundData = {
        ...defaultFundData,
        annualData: {
          ...defaultFundData.annualData,
          annoRiferimento: nextYear,
          denominazioneEnte: entity.name || currentDraftFundData.annualData?.denominazioneEnte || ''
        }
      };
      baseNextFundData = prepareDl25NextAnnuality(currentDraftFundData, baseNextFundData, nextYear);
    } else {
      baseNextFundData = loadNextRes.snapshot.fundData;
    }

    const updatedNextFundData = {
      ...baseNextFundData,
      fondoAccessorioDipendenteData: {
        ...baseNextFundData.fondoAccessorioDipendenteData,
        vn_art80c1_sommeNonUtilizzateStabiliPrec: carryForwardValue
      }
    };

    // 6. Esecuzione Transazionale Atomica
    if (deps.stateRepository.closeYearAtomic) {
      const atomicRes = await deps.stateRepository.closeYearAtomic({
        entityId: entity.id,
        currentYear: year,
        closedFundData,
        nextFundData: updatedNextFundData
      });

      if (atomicRes.error) {
        console.error("[YearClosure] Atomic RPC failed:", atomicRes.error);
        throw new Error(`Errore chiusura atomica: ${atomicRes.error.message || atomicRes.error}`);
      }
    } else {
      // Fallback per repository mock / in-memory con rollback transazionale compensativo
      // A: Salva anno chiuso
      const saveClosedRes = await saveAnnualSnapshot(deps, user, entity, year, currentRole, closedFundData);
      if (!saveClosedRes.success) {
        console.error("[YearClosure] Step 5 failed: Save closed snapshot", saveClosedRes.error);
        throw new Error(`Errore durante il congelamento dell'anno ${year}: ${saveClosedRes.error}`);
      }

      // B: Inizializza / salva anno successivo protetto da rollback
      try {
        if (loadNextRes.isNewInitialization) {
          const initNextRes = await initializeAnnualSnapshot(deps, entity.user_id, entity.id, nextYear, user, defaultFundData);
          if (!initNextRes.success) {
            throw new Error(`Errore inizializzazione anno successivo: ${initNextRes.error}`);
          }
        }
        const saveNextRes = await saveAnnualSnapshot(deps, user, entity, nextYear, currentRole, updatedNextFundData);
        if (!saveNextRes.success) {
          throw new Error(`Errore nel salvataggio del riporto nell'anno ${nextYear}: ${saveNextRes.error}`);
        }
      } catch (nextYearError: any) {
        // ROLLBACK: se il salvataggio del successivo fallisce, ripristina l'anno corrente a OPEN!
        console.warn("[YearClosure] Failure creating next year. Rolling back current year closure to preserve consistency...");
        const rollbackFundData = {
          ...currentDraftFundData,
          metadata: {
            ...currentDraftFundData.metadata,
            snapshotStatus: AnnualSnapshotStatus.OPEN,
            closedAt: null,
            closedBy: null
          }
        };
        await deps.stateRepository.upsertState({
          user_id: entity.user_id,
          entity_id: entity.id,
          current_year: year,
          email: user.email,
          role: currentRole,
          fund_data: rollbackFundData,
          updated_at: new Date().toISOString()
        });
        throw nextYearError;
      }
    }

    // 7. Preparazione Risultato Finale
    const nonTransferredResiduals = [
      { fund: 'Elevate Qualificazioni', amount: carryForwardInfo.actualLeftoversInfo.eq },
      { fund: 'Dirigenza', amount: carryForwardInfo.actualLeftoversInfo.dir },
      { fund: 'Segretario', amount: carryForwardInfo.actualLeftoversInfo.seg }
    ].filter(r => r.amount > 0);

    const warnings = nonTransferredResiduals.length > 0 
      ? [`L'operazione ha rilevato residui per altri fondi che non sono stati trasferiti automaticamente.`]
      : [];

    return {
      success: true,
      closedYear: year,
      nextYear: nextYear,
      carryForward: carryForwardValue,
      warnings,
      nonTransferredResiduals
    };

  } catch (err: any) {
    console.error("Year Closure Workflow Error:", err);
    return {
      success: false,
      closedYear: year,
      nextYear: year + 1,
      carryForward: 0,
      warnings: [],
      nonTransferredResiduals: [],
      error: err.message || 'Errore imprevisto durante la chiusura.'
    };
  }
};
