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
    // 2. Caricamento Snapshot Corrente per verifica stato
    const loadRes = await loadAnnualSnapshot(deps, user, entity.id, year);
    if (!loadRes.success) {
      console.error("[YearClosure] Step 2 failed: Load snapshot", loadRes.error);
      throw new Error(`Impossibile caricare lo snapshot corrente: ${loadRes.error}`);
    }

    const currentStatus = loadRes.snapshot?.fundData?.metadata?.snapshotStatus;
    if (currentStatus === AnnualSnapshotStatus.CLOSED) {
      return {
        success: false,
        closedYear: year,
        nextYear: year + 1,
        carryForward: 0,
        warnings: [`L'anno ${year} risulta già chiuso.`],
        nonTransferredResiduals: [],
        error: `L'esercizio ${year} è già in stato CHIUSO.`
      };
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

    // 5. Salvataggio Anno Chiuso (Freeze)
    const saveClosedRes = await saveAnnualSnapshot(deps, user, entity, year, currentRole, closedFundData);
    if (!saveClosedRes.success) {
      console.error("[YearClosure] Step 5 failed: Save closed snapshot", saveClosedRes.error);
      throw new Error(`Errore durante il congelamento dell'anno ${year}: ${saveClosedRes.error}`);
    }

    // 6. Preparazione Anno Successivo
    const nextYear = year + 1;
    const loadNextRes = await loadAnnualSnapshot(deps, user, entity.id, nextYear);
    
    let nextSnapshot: any;
    if (loadNextRes.isNewInitialization) {
      const initNextRes = await initializeAnnualSnapshot(deps, user.id, entity.id, nextYear, user, defaultFundData);
      if (!initNextRes.success) {
        console.error("[YearClosure] Step 6 failed: Initialize next year", initNextRes.error);
        throw new Error(`Errore inizializzazione anno successivo: ${initNextRes.error}`);
      }
      nextSnapshot = initNextRes.snapshot;
    } else {
      nextSnapshot = loadNextRes.snapshot;
    }

    // 7. Iniezione Riporto (Carry-over) nell'anno successivo
    // Destinazione vincolante: vn_art80c1_sommeNonUtilizzateStabiliPrec
    const updatedNextFundData = {
      ...nextSnapshot.fundData,
      fondoAccessorioDipendenteData: {
        ...nextSnapshot.fundData.fondoAccessorioDipendenteData,
        vn_art80c1_sommeNonUtilizzateStabiliPrec: carryForwardValue
      }
    };

    const saveNextRes = await saveAnnualSnapshot(deps, user, entity, nextYear, currentRole, updatedNextFundData);
    if (!saveNextRes.success) {
      console.error("[YearClosure] Step 7 failed: Save carry-forward", saveNextRes.error);
      throw new Error(`Errore nel salvataggio del riporto nell'anno ${nextYear}: ${saveNextRes.error}`);
    }

    // 8. Preparazione Risultato Finale
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
