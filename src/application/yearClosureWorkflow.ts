import { resolveArt33AnnualDataPolicy } from '../logic/shared/art33ApplicationPolicy';
import { requireBaseline, isVersion, persistenceError, StatePersistenceError } from './snapshots/versionedSnapshotContract';
import { WorkflowDependencies } from './ports';
import { loadAnnualSnapshot } from './snapshots/snapshotWorkflow';
import { 
  AnnualSnapshotStatus, 
  YearClosureResult, 
  UserRole,
  NormativeData,
  FundData,
  SnapshotBaseline
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
  _currentRole: UserRole,
  currentDraftFundData: FundData,
  normativeData: NormativeData,
  defaultFundData: FundData,
  hydratedSnapshotKey: string | null,
  currentBaseline?: SnapshotBaseline
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

    // The current version belongs to the draft already saved/acknowledged by the caller.
    const current = requireBaseline(currentBaseline, user.id, entity.id, year);
    if (!current.exists || current.rawStatus !== 'OPEN' || !isVersion(current.version))
      throw new StatePersistenceError('STATE_NOT_OPEN', 'Chiusura consentita soltanto su una annualità OPEN caricata e confermata.');

    // Preserve the existing closure gate: a read-only indeterminate result must
    // not turn an unresolved Art33 decision into permission to close an annuality.
    if (resolveArt33AnnualDataPolicy(currentDraftFundData.annualData).action === 'BLOCK') {
      throw new Error("Calcolo bloccato: l'applicabilità dell'adeguamento Art. 33 richiede una decisione manuale esplicita.");
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
    if (!loadNextRes.success || !loadNextRes.baseline) throw new StatePersistenceError(
      'STATE_PERSISTENCE_ERROR', 'Impossibile verificare l’annualità successiva.', loadNextRes.technicalCause);
    const nextBaseline = loadNextRes.baseline;
    if (nextBaseline.exists && (!['OPEN', 'CLOSED'].includes(nextBaseline.rawStatus ?? '') || !isVersion(nextBaseline.version)))
      throw new StatePersistenceError('STATE_NOT_OPEN', 'L’annualità successiva non ha uno stato o una versione verificabile.');
    // This explicit review precedes mutation. A later change is rejected atomically by SQL.
    if (!await deps.interactionService.confirm(nextBaseline.exists
      ? 'Confermi la chiusura e il riporto sull’annualità successiva già esistente (' + nextYear + ')? Eventuali modifiche concorrenti interromperanno l’operazione.'
      : 'Confermi la chiusura e la creazione dell’annualità ' + nextYear + '?'))
      return { success: false, closedYear: year, nextYear, carryForward: 0, warnings: [], nonTransferredResiduals: [], cancelled: true, error: 'Chiusura annullata.' };
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
    let confirmed: any;
    if (deps.stateRepository.closeYearAtomic) {
      const atomicRes = await deps.stateRepository.closeYearAtomic({
        entityId: entity.id,
        currentYear: year,
        closedFundData,
        nextFundData: updatedNextFundData,
        currentVersion: current.version,
        nextVersion: nextBaseline.exists ? nextBaseline.version : null
      });

      if (atomicRes.error) {
        console.error("[YearClosure] Atomic RPC failed:", atomicRes.error);
        throw atomicRes.error;
      }
      confirmed = atomicRes.data;
      if (atomicRes.data?.success !== true || !isVersion(confirmed?.currentVersion) || !isVersion(confirmed?.nextVersion)
        || confirmed.currentSnapshot?.entity_id !== entity.id || confirmed.currentSnapshot.current_year !== year
        || confirmed.currentSnapshot.b1i4_version !== confirmed.currentVersion
        || confirmed.currentSnapshot.fund_data?.metadata?.snapshotStatus !== 'CLOSED'
        || confirmed.nextSnapshot?.entity_id !== entity.id || confirmed.nextSnapshot.current_year !== nextYear
        || confirmed.nextSnapshot.b1i4_version !== confirmed.nextVersion) {
        throw new Error('Chiusura atomica non confermata dal server.');
      }
    } else {
      throw new Error('Chiusura atomica non disponibile: nessuna riapertura compensativa consentita.');
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
      currentSnapshot: confirmed.currentSnapshot, nextSnapshot: confirmed.nextSnapshot,
      currentVersion: confirmed.currentVersion, nextVersion: confirmed.nextVersion,
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
      error: persistenceError(err).message, technicalCause: err
    };
  }
};
