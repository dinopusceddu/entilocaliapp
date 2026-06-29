import React, { useReducer, useCallback, useEffect } from 'react';
import {
  Wizard2026EnteStepState,
  Wizard2026Art23StepState,
  Wizard2026Dl25StepState,
  Wizard2026Ccnl2026StepState,
  Wizard2026ConglobamentoArt60StepState,
  Wizard2026StraordinarioStepState,
  Wizard2026PnrrStepState,
  Wizard2026DraftState,
} from '../types';
import { initialWizard2026DraftState } from '../initialState';
import { wizard2026Reducer } from '../reducer';
import { selectWizard2026CurrentStep, selectWizard2026BlockingErrors, selectWizard2026Warnings, selectWizard2026Summary } from '../selectors';
import { validateWizard2026All } from '../validation';
import { buildWizard2026LegacyMappingPreview } from '../mappingPreview';
import {
  calculateArt23Limit,
  validateArt23Limit,
  calculateDl25Increment,
  validateDl25Increment,
  calculateCcnl2026Increments,
  validateCcnl2026Increments,
  calculateConglobamentoArt60,
  validateConglobamentoArt60,
  calculateStraordinarioIncrement,
  validateStraordinarioIncrement,
  calculatePnrrIncrement,
  validatePnrrIncrement,
} from '../../../logic/wizard2026';

import { useAppContext } from '../../../contexts/AppContext';
import { useWizard2026RemoteDraftSync } from './useWizard2026RemoteDraftSync';
import { isValidDraftPayload } from '../remoteDraft/validation';

/**
 * Construisce la chiave sessionStorage per la bozza wizard 2026.
 * Restituisce null se uno dei parametri è un valore di fallback generico ("guest01", undefined, ecc.)
 * per evitare di salvare con chiavi spurie al primo render prima che il context sia idratato.
 *
 * NOTA: "guest01" è un ID utente legittimo (DEFAULT_USER), quindi è accettato.
 * Solo userId/entityId di tipo undefined o stringa vuota vengono filtrati.
 */
function buildDraftKey(
  userId: string | undefined,
  entityId: string | undefined,
  year: number | undefined
): string | null {
  if (!userId || !entityId || !year) return null;
  return `fl_wizard2026_draft_${userId}_${entityId}_${year}`;
}

function buildLastTransferKey(
  userId: string | undefined,
  entityId: string | undefined,
  year: number | undefined
): string | null {
  if (!userId || !entityId || !year) return null;
  return `fl_wizard2026_last_transfer_${userId}_${entityId}_${year}`;
}

/**
 * Esegue la migrazione automatica di una singola chiave da sessionStorage a localStorage.
 */
function migrateKeyToLocalStorage(key: string): void {
  try {
    const sessionVal = sessionStorage.getItem(key);
    if (sessionVal !== null) {
      const localVal = localStorage.getItem(key);
      if (localVal === null) {
        localStorage.setItem(key, sessionVal);
      }
    }
  } catch (e) {
    console.error(`[Wizard2026] Errore di migrazione per la chiave ${key}:`, e);
  }
}

/**
 * Legge la bozza dal localStorage in modo sicuro.
 */
function readDraftFromStorage(key: string): Wizard2026DraftState | null {
  try {
    migrateKeyToLocalStorage(key);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as Wizard2026DraftState;
    }
  } catch (e) {
    console.error('[Wizard2026] Errore lettura bozza da localStorage:', e);
  }
  return null;
}

/**
 * Salva la bozza nel localStorage in modo sicuro.
 */
function saveDraftToStorage(key: string, state: Wizard2026DraftState): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('[Wizard2026] Errore salvataggio bozza in localStorage:', e);
  }
}

/**
 * Rimuove la bozza dal localStorage in modo sicuro.
 */
function removeDraftFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('[Wizard2026] Errore rimozione bozza da localStorage:', e);
  }
}

export function useWizard2026Draft() {
  const { state: globalState } = useAppContext();
  const userId = globalState?.currentUser?.id;
  const entityId = globalState?.currentEntity?.id;
  const year = globalState?.currentYear || 2026;

  // --- Chiavi localStorage calcolate ---
  const draftKey = buildDraftKey(userId, entityId, year);
  const lastTransferKey = buildLastTransferKey(userId, entityId, year);

  // --- Stati di gestione ripristino ---
  const [isRestorePending, setIsRestorePending] = React.useState(true);
  const [showRecoveryBanner, setShowRecoveryBanner] = React.useState(false);
  const [showLastTransferBanner, setShowLastTransferBanner] = React.useState(false);
  const [restoreError, setRestoreError] = React.useState<string | null>(null);
  const [checkedKeys, setCheckedKeys] = React.useState<string[]>([]);

  // --- Inizializzazione del reducer ---
  const [state, dispatch] = useReducer(wizard2026Reducer, initialWizard2026DraftState);

  // --- Callbacks per la sincronizzazione remota ---
  // onHydrate: chiamato quando il cloud diventa fonte primaria.
  // Sopprime il banner locale (showRecoveryBanner) per evitare la doppia notifica.
  const onHydrate = useCallback((remoteDraft: Wizard2026DraftState) => {
    dispatch({ type: 'RESTORE_WIZARD_2026', payload: remoteDraft });
    setIsRestorePending(false);
    // Il cloud ha preso il sopravvento: nascondi il banner locale se era apparso
    setShowRecoveryBanner(false);
  }, []);

  const onHydrateLastTransfer = useCallback((remoteLastTransfer: any) => {
    dispatch({ type: 'RESTORE_WIZARD_2026', payload: remoteLastTransfer.wizardState });
    setIsRestorePending(true);
    setShowRecoveryBanner(false);
    setShowLastTransferBanner(true);
  }, []);

  const remoteSync = useWizard2026RemoteDraftSync({
    userId,
    entityId,
    year,
    localDraft: isRestorePending ? null : state,
    onHydrate,
    onHydrateLastTransfer,
    userEmail: globalState?.currentUser?.email
  });

  // --- Rilevamento della bozza all'attivazione/cambio della chiave ---
  useEffect(() => {
    if (!draftKey) {
      setIsRestorePending(true);
      return;
    }

    if (checkedKeys.includes(draftKey)) return;

    const draftStored = readDraftFromStorage(draftKey);
    const draftExists = draftStored && isValidDraftPayload(draftStored);



    if (draftExists) {
      // 1. Se esiste bozza aperta valida, caricala automaticamente
      dispatch({ type: 'RESTORE_WIZARD_2026', payload: draftStored });
      setIsRestorePending(false);
      setShowRecoveryBanner(true);
      setShowLastTransferBanner(false);
    } else {
      // 2. Se non esiste nulla, inizializza vuoto
      // lastTransfer è solo un metadato e non deve ripristinare campi automaticamente
      setIsRestorePending(false);
      setShowRecoveryBanner(false);
      setShowLastTransferBanner(false);
    }
    setRestoreError(null);
    setCheckedKeys(prev => [...prev, draftKey]);
  }, [draftKey, lastTransferKey, checkedKeys]);

  // --- Effetto di salvataggio automatico ---
  useEffect(() => {
    if (!draftKey) return;
    if (isRestorePending) return;
    saveDraftToStorage(draftKey, state);
  }, [state, draftKey, isRestorePending]);

  const restoreDraft = React.useCallback(() => {
    // Ora l'idratazione è automatica, questo bottone non è più bloccante.
    // Lo manteniamo come no-op o sicurezza per nascondere il banner
    setShowRecoveryBanner(false);
  }, []);

  const discardDraft = React.useCallback(() => {
    if (draftKey) {
      removeDraftFromStorage(draftKey);
    }
    if (userId && entityId) {
      localStorage.removeItem(`fl_wizard2026_draft_updated_at_${userId}_${entityId}_${year}`);
    }
    setRestoreError(null);
    setShowRecoveryBanner(false);

    // Rimuove la bozza remota
    remoteSync.deleteRemoteDraft();
    
    // Azzeriamo completamente la bozza (non ripristiniamo da last_transfer)
    setIsRestorePending(false);
    dispatch({ type: 'RESET_WIZARD_2026' });
  }, [draftKey, userId, entityId, year, remoteSync]);

  const restoreLastTransfer = React.useCallback(() => {
    // Idratazione automatica, questo bottone non è più bloccante.
    setShowLastTransferBanner(false);
  }, []);

  const startNewCompilation = React.useCallback(() => {
    setIsRestorePending(false);
    setShowLastTransferBanner(false);
    dispatch({ type: 'RESET_WIZARD_2026' });
    // Se l'utente clicca Nuova compilazione, forziamo la creazione di una bozza vuota
    if (draftKey) {
      saveDraftToStorage(draftKey, initialWizard2026DraftState);
    }
    if (userId && entityId) {
      localStorage.setItem(`fl_wizard2026_draft_updated_at_${userId}_${entityId}_${year}`, new Date().toISOString());
    }
  }, [draftKey, userId, entityId, year]);

  // --- Funzione pubblica per salvare last_transfer ---
  const saveLastTransfer = React.useCallback(async (wizardState: Wizard2026DraftState, input: any, computed: any, transferPlan: any[]) => {
    if (!lastTransferKey) return;
    const lastTransferObj = {
      transferredAt: new Date().toISOString(),
      userId: userId || '',
      entityId: entityId || '',
      year: year,
      wizardState,
      input,
      computed,
      transferPlan
    };
    localStorage.setItem(lastTransferKey, JSON.stringify(lastTransferObj));
    await remoteSync.uploadLastTransfer(lastTransferObj);
  }, [lastTransferKey, userId, entityId, year, remoteSync]);

  // --- Funzione pubblica per pulire la bozza dopo trasferimento riuscito ---
  const clearDraftAfterTransfer = React.useCallback(() => {
    // Non rimuoviamo più la bozza, la manteniamo viva come fonte primaria
    // if (draftKey) removeDraftFromStorage(draftKey);
    // if (userId && entityId) localStorage.removeItem(...);
    // remoteSync.deleteRemoteDraft();
    setIsRestorePending(false);
  }, [draftKey, userId, entityId, year, remoteSync]);

  const currentStep = selectWizard2026CurrentStep(state);
  const allChecks = validateWizard2026All(state);
  const blockingErrors = selectWizard2026BlockingErrors(state);
  const warnings = selectWizard2026Warnings(state);
  const summary = selectWizard2026Summary(state);
  const mappingPreview = buildWizard2026LegacyMappingPreview(state);

  const lastStepRef = React.useRef(currentStep);
  // Flush al cambio step: fire-and-forget, non blocca mai la navigazione.
  // uploadLocal è stabile via useCallback in useWizard2026RemoteDraftSync.
  const uploadLocalRef = React.useRef(remoteSync.uploadLocal);
  const syncStatusRef = React.useRef(remoteSync.syncStatus);
  uploadLocalRef.current = remoteSync.uploadLocal;
  syncStatusRef.current = remoteSync.syncStatus;

  useEffect(() => {
    if (currentStep !== lastStepRef.current) {
      lastStepRef.current = currentStep;
      // Utilizza i ref per evitare di avere uploadLocal nelle dipendenze
      // e per garantire che il flush non venga eseguito durante la reidratazione cloud.
      if (syncStatusRef.current === 'local_newer') {
        // fire-and-forget: non attendiamo la promise, la navigazione non è bloccata
        uploadLocalRef.current();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const goNext = useCallback(() => {
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: currentStep });
    if (currentStep < 8) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep + 1 });
    }
  }, [currentStep]);

  const goPrevious = useCallback(() => {
    if (currentStep > 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep - 1 });
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 8) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    }
  }, []);

  const resetWizard = useCallback(() => {
    dispatch({ type: 'RESET_WIZARD_2026' });
  }, []);

  // Update methods that automatically calculate results & checks
  const updateEnte = useCallback((payload: Partial<Wizard2026EnteStepState>) => {
    setIsRestorePending(false);
    dispatch({ type: 'UPDATE_ENTE_STEP', payload });
  }, []);

  const updateArt23 = useCallback((payload: Partial<Wizard2026Art23StepState>) => {
    setIsRestorePending(false);
    dispatch({ type: 'UPDATE_ART23_STEP', payload });
  }, []);

  const updateDl25 = useCallback((payload: Partial<Wizard2026Dl25StepState>) => {
    setIsRestorePending(false);
    dispatch({ type: 'UPDATE_DL25_STEP', payload });
  }, []);

  const updateCcnl2026 = useCallback((payload: Partial<Wizard2026Ccnl2026StepState>) => {
    setIsRestorePending(false);
    dispatch({ type: 'UPDATE_CCNL2026_STEP', payload });
  }, []);

  const updateConglobamento = useCallback((payload: Partial<Wizard2026ConglobamentoArt60StepState>) => {
    setIsRestorePending(false);
    dispatch({ type: 'UPDATE_CONGLOBAMENTO_ART60_STEP', payload });
  }, []);

  const updateStraordinario = useCallback((payload: Partial<Wizard2026StraordinarioStepState>) => {
    setIsRestorePending(false);
    dispatch({ type: 'UPDATE_STRAORDINARIO_STEP', payload });
  }, []);

  const updatePnrr = useCallback((payload: Partial<Wizard2026PnrrStepState>) => {
    setIsRestorePending(false);
    dispatch({ type: 'UPDATE_PNRR_STEP', payload });
  }, []);

  const importExcelData = useCallback((payload: Partial<Wizard2026DraftState>) => {
    setIsRestorePending(false);
    dispatch({ type: 'IMPORT_EXCEL_DATA', payload });
  }, []);

  useEffect(() => {
    const payload: Partial<Wizard2026PnrrStepState> = {};
    if (
      state.pnrr.componenteStabileFondoDipendenti2016 === undefined &&
      state.art23.fondoPersonaleDipendente2016 !== undefined
    ) {
      payload.componenteStabileFondoDipendenti2016 = state.art23.fondoPersonaleDipendente2016;
    }
    if (
      state.ente.hasDirigenza === true &&
      state.pnrr.componenteStabileFondoDirigenza2016 === undefined &&
      state.art23.fondoDirigenza2016 !== undefined
    ) {
      payload.componenteStabileFondoDirigenza2016 = state.art23.fondoDirigenza2016;
    }
    if (Object.keys(payload).length > 0) {
      dispatch({ type: 'UPDATE_PNRR_STEP', payload });
    }
  }, [
    state.pnrr.componenteStabileFondoDipendenti2016,
    state.pnrr.componenteStabileFondoDirigenza2016,
    state.art23.fondoPersonaleDipendente2016,
    state.art23.fondoDirigenza2016,
    state.ente.hasDirigenza,
  ]);

  // Effect to recalculate step results when dependent state changes (Primitive dependencies only)
  useEffect(() => {
    // Art. 23
    const art23Input = {
      limite2016CertificatoEnte: state.art23.limite2016CertificatoEnte,
      fondoPersonaleDipendente2016: state.art23.fondoPersonaleDipendente2016,
      fondoEqPo2016: state.art23.fondoEqPo2016,
      fondoDirigenza2016: state.art23.fondoDirigenza2016,
      risorseSegretario2016: state.art23.risorseSegretario2016,
      fondoStraordinario2016: state.art23.fondoStraordinario2016,
      altreVoci2016Soggette: state.art23.altreVoci2016Soggette,
      fondoDipendenti2018Soggetto: state.art23.fondoDipendenti2018Soggetto,
      risorsePoEq2018Soggette: state.art23.risorsePoEq2018Soggette,
      personaleServizio31122018: state.art23.personaleServizio31122018,
      personalePrevisto2026Piao: state.art23.personalePrevisto2026Piao,
      hasDirigenza: state.ente.hasDirigenza,
      personale2018Art23: state.art23.personale2018Art23,
      personale2026Art23: state.art23.personale2026Art23,
      usaCalcoloManualePersonaleArt23: state.art23.usaCalcoloManualePersonaleArt23,
      manualDipendentiEquivalenti2018: state.art23.manualDipendentiEquivalenti2018,
      manualDipendentiEquivalenti2026: state.art23.manualDipendentiEquivalenti2026,
      fondoCertificatoParteStabile2018: state.art23.fondoCertificatoParteStabile2018,
    };
    const art23Res = calculateArt23Limit(art23Input);
    const art23Checks = validateArt23Limit(art23Input);
    dispatch({ type: 'SET_STEP_RESULT', payload: { step: 'art23', result: art23Res } });
    dispatch({ type: 'SET_STEP_CHECKS', payload: { step: 'art23', checks: art23Checks } });
  }, [
    state.art23.limite2016CertificatoEnte,
    state.art23.fondoPersonaleDipendente2016,
    state.art23.fondoEqPo2016,
    state.art23.fondoDirigenza2016,
    state.art23.risorseSegretario2016,
    state.art23.fondoStraordinario2016,
    state.art23.altreVoci2016Soggette,
    state.art23.fondoDipendenti2018Soggetto,
    state.art23.risorsePoEq2018Soggette,
    state.art23.personaleServizio31122018,
    state.art23.personalePrevisto2026Piao,
    state.ente.hasDirigenza,
    state.art23.personale2018Art23,
    state.art23.personale2026Art23,
    state.art23.usaCalcoloManualePersonaleArt23,
    state.art23.manualDipendentiEquivalenti2018,
    state.art23.manualDipendentiEquivalenti2026,
    state.art23.fondoCertificatoParteStabile2018,
  ]);

  useEffect(() => {
    // DL 25
    if (state.ente.entityType) {
      const dl25Input = {
        entityType: state.ente.entityType,
        stipendiTabellari2023NonDirigenti: state.dl25.stipendiTabellari2023NonDirigenti,
        fondoStabile2025Certificato: state.dl25.fondoStabile2025Certificato,
        budgetEq2025: state.dl25.budgetEq2025,
        incrementoApplicato: state.dl25.incrementoApplicato,
        isPrimaFasciaDl34: state.ente.isPrimaFasciaDl34,
        isEquilibrioPluriennaleAsseverato: state.ente.isEquilibrioPluriennaleAsseverato,
        isDissesto: state.ente.isDissesto,
        isStrutturalmenteDeficitario: state.ente.isStrutturalmenteDeficitario,
        isPianoRiequilibrio: state.ente.isPianoRiequilibrio,
        quotaTrasferitaAderentiDL25_2025: state.dl25.quotaTrasferitaAderentiDL25_2025,
        attiComuniAderentiPresenti: state.dl25.attiComuniAderentiPresenti,
        riduzionePermanenteFondiComuniCertificata: state.dl25.riduzionePermanenteFondiComuniCertificata,
        certificazioneRevisoriComuni: state.dl25.certificazioneRevisoriComuni,
        hasApprovazioneCosfel: state.ente.hasApprovazioneCosfel,
        quoteAderenti: state.dl25.quoteAderenti,
        fonteDatoStipendi2023: state.dl25.fonteDatoStipendi2023,
        attiAutorizzazioneDl25: state.dl25.attiAutorizzazioneDl25,
        parereRevisoriDl25: state.dl25.parereRevisoriDl25,
        documentazioneCosfelDl25: state.dl25.documentazioneCosfelDl25,

        // Nuovi campi MOD-011-bis
        popolazioneEnte: state.dl25.popolazioneEnte,
        entrateCorrentiN1: state.dl25.entrateCorrentiN1,
        entrateCorrentiN2: state.dl25.entrateCorrentiN2,
        entrateCorrentiN3: state.dl25.entrateCorrentiN3,
        fcdeStanziato: state.dl25.fcdeStanziato,
        spesaPersonaleUltimoRendiconto: state.dl25.spesaPersonaleUltimoRendiconto,
        spesaPersonalePrevistaPostDl25: state.dl25.spesaPersonalePrevistaPostDl25,
        aliquotaOneriRiflessi: state.dl25.aliquotaOneriRiflessi,
        aliquotaIRAP: state.dl25.aliquotaIRAP,
        accettaRiduzioneSostenibilita: state.dl25.accettaRiduzioneSostenibilita,
        limiteStoricoSpesaPersonale: state.dl25.limiteStoricoSpesaPersonale,
        baseCalcoloLimiteStorico: state.dl25.baseCalcoloLimiteStorico,
        spesaPersonalePrevista2026AnteIncremento: state.dl25.spesaPersonalePrevista2026AnteIncremento,
        accettaRiduzioneLimiteStorico: state.dl25.accettaRiduzioneLimiteStorico,
      };
      const dl25Res = calculateDl25Increment(dl25Input);
      const dl25Checks = validateDl25Increment(dl25Input);
      dispatch({ type: 'SET_STEP_RESULT', payload: { step: 'dl25', result: dl25Res } });
      dispatch({ type: 'SET_STEP_CHECKS', payload: { step: 'dl25', checks: dl25Checks } });
    }
  }, [
    state.ente.entityType,
    state.dl25.stipendiTabellari2023NonDirigenti,
    state.dl25.fondoStabile2025Certificato,
    state.dl25.budgetEq2025,
    state.dl25.incrementoApplicato,
    state.ente.isPrimaFasciaDl34,
    state.ente.isEquilibrioPluriennaleAsseverato,
    state.ente.isDissesto,
    state.ente.isStrutturalmenteDeficitario,
    state.ente.isPianoRiequilibrio,
    state.dl25.quotaTrasferitaAderentiDL25_2025,
    state.dl25.attiComuniAderentiPresenti,
    state.dl25.riduzionePermanenteFondiComuniCertificata,
    state.dl25.certificazioneRevisoriComuni,
    state.ente.hasApprovazioneCosfel,
    state.dl25.quoteAderenti,
    state.dl25.fonteDatoStipendi2023,
    state.dl25.attiAutorizzazioneDl25,
    state.dl25.parereRevisoriDl25,
    state.dl25.documentazioneCosfelDl25,

    // Dipendenze dei nuovi campi MOD-011-bis
    state.dl25.popolazioneEnte,
    state.dl25.entrateCorrentiN1,
    state.dl25.entrateCorrentiN2,
    state.dl25.entrateCorrentiN3,
    state.dl25.fcdeStanziato,
    state.dl25.spesaPersonaleUltimoRendiconto,
    state.dl25.spesaPersonalePrevistaPostDl25,
    state.dl25.aliquotaOneriRiflessi,
    state.dl25.aliquotaIRAP,
    state.dl25.accettaRiduzioneSostenibilita,
    state.dl25.limiteStoricoSpesaPersonale,
    state.dl25.baseCalcoloLimiteStorico,
    state.dl25.spesaPersonalePrevista2026AnteIncremento,
    state.dl25.accettaRiduzioneLimiteStorico,
  ]);

  useEffect(() => {
    // CCNL 2026
    const ccnlInput = {
      monteSalari2021: state.ccnl2026.monteSalari2021,
      monteSalari2021Consolidato2026: state.ccnl2026.monteSalari2021Consolidato2026,
      annoRiferimento: state.ente.annoRiferimento,
      applicaIncremento022: state.ccnl2026.applicaIncremento022,
      percentualeApplicata022: state.ccnl2026.percentualeApplicata022,
      isStrutturalmenteDeficitario: state.ente.isStrutturalmenteDeficitario,
      hasApprovazioneCosfel: state.ente.hasApprovazioneCosfel,
      incremento022Anno: state.ccnl2026.incremento022Anno,
      fondoRisorseDecentrate2024: state.ccnl2026.fondoRisorseDecentrate2024,
      risorseEQ2024: state.ccnl2026.risorseEQ2024,
    };
    const ccnlRes = calculateCcnl2026Increments(ccnlInput);
    const ccnlChecks = validateCcnl2026Increments(ccnlInput);
    dispatch({ type: 'SET_STEP_RESULT', payload: { step: 'ccnl2026', result: ccnlRes } });
    dispatch({ type: 'SET_STEP_CHECKS', payload: { step: 'ccnl2026', checks: ccnlChecks } });
  }, [
    state.ccnl2026.monteSalari2021,
    state.ccnl2026.monteSalari2021Consolidato2026,
    state.ente.annoRiferimento,
    state.ccnl2026.applicaIncremento022,
    state.ccnl2026.percentualeApplicata022,
    state.ente.isStrutturalmenteDeficitario,
    state.ente.hasApprovazioneCosfel,
    state.ccnl2026.incremento022Anno,
    state.ccnl2026.fondoRisorseDecentrate2024,
    state.ccnl2026.risorseEQ2024,
  ]);


  useEffect(() => {
    // Conglobamento
    const congInput = {
      mode: state.conglobamentoArt60.mode,
      personaleInteroArea: state.conglobamentoArt60.personaleInteroArea,
      partTimeNativi: state.conglobamentoArt60.partTimeNativi,
      valoreManuale: state.conglobamentoArt60.valoreManuale,
      notaManuale: state.conglobamentoArt60.notaManuale,
      valoreConsolidato2026: state.conglobamentoArt60.valoreConsolidato2026,
      annoRiferimento: state.ente.annoRiferimento,
    };
    const congRes = calculateConglobamentoArt60(congInput);
    const congChecks = validateConglobamentoArt60(congInput);
    dispatch({ type: 'SET_STEP_RESULT', payload: { step: 'conglobamentoArt60', result: congRes } });
    dispatch({ type: 'SET_STEP_CHECKS', payload: { step: 'conglobamentoArt60', checks: congChecks } });
  }, [
    state.conglobamentoArt60.mode,
    state.conglobamentoArt60.personaleInteroArea,
    state.conglobamentoArt60.partTimeNativi,
    state.conglobamentoArt60.valoreManuale,
    state.conglobamentoArt60.notaManuale,
    state.conglobamentoArt60.valoreConsolidato2026,
    state.ente.annoRiferimento,
  ]);

  useEffect(() => {
    // Straordinario
    const strInput = {
      hasDirigenza: state.ente.hasDirigenza,
      margineArt23: state.art23.result?.margineArt23,
      isStrutturalmenteDeficitario: state.ente.isStrutturalmenteDeficitario,
      hasApprovazioneCosfel: state.ente.hasApprovazioneCosfel,

      fondoStraordinarioOrdinario2016: state.straordinario.fondoStraordinarioOrdinario2016,
      fondoStraordinarioOrdinarioAnnoCorrente: state.straordinario.fondoStraordinarioOrdinarioAnnoCorrente,
      incrementoStraordinarioOrdinarioProposto: state.straordinario.incrementoStraordinarioOrdinarioProposto,
      fonteDatoStraordinarioOrdinario: state.straordinario.fonteDatoStraordinarioOrdinario,

      riduzioneStabileStraordinarioArt67: state.straordinario.riduzioneStabileStraordinarioArt67,

      incrementoStraordinarioOrdinario: state.straordinario.incrementoStraordinarioOrdinario,
      quotaFinanziataConCapienzaArt23: state.straordinario.quotaFinanziataConCapienzaArt23,
      quotaFinanziataConRiduzioneFondo: state.straordinario.quotaFinanziataConRiduzioneFondo,
      contrattazioneIntegrativaRiduzioneFondo: state.straordinario.contrattazioneIntegrativaRiduzioneFondo,

      risorseEscluse: state.straordinario.risorseEscluse,

      stanziamentoStraordinarioOrdinarioAnnoPrecedente: state.straordinario.stanziamentoStraordinarioOrdinarioAnnoPrecedente,
      spesaStraordinarioOrdinarioAnnoPrecedente: state.straordinario.spesaStraordinarioOrdinarioAnnoPrecedente,
      economieStraordinarioCertificate: state.straordinario.economieStraordinarioCertificate,

      // Retrocompatibilità (mantenuti per compatibilità)
      fondoStraordinario2016: state.straordinario.fondoStraordinario2016,
      fondoStraordinarioAnnoCorrente: state.straordinario.fondoStraordinarioAnnoCorrente,
      incrementoRichiesto: state.straordinario.incrementoRichiesto,
      riduzioneFondoDecentrato: state.straordinario.riduzioneFondoDecentrato,
      economieStraordinarioAnnoPrecedente: state.straordinario.economieStraordinarioAnnoPrecedente,
      straordinarioElettoraleEscluso: state.straordinario.straordinarioElettoraleEscluso,
      straordinarioCalamitaEscluso: state.straordinario.straordinarioCalamitaEscluso,
      altreRisorseStraordinarioEscluse: state.straordinario.altreRisorseStraordinarioEscluse,
    };
    const strRes = calculateStraordinarioIncrement(strInput);
    const strChecks = validateStraordinarioIncrement(strInput);
    dispatch({ type: 'SET_STEP_RESULT', payload: { step: 'straordinario', result: strRes } });
    dispatch({ type: 'SET_STEP_CHECKS', payload: { step: 'straordinario', checks: strChecks } });
  }, [
    state.ente.hasDirigenza,
    state.art23.result?.margineArt23,
    state.ente.isStrutturalmenteDeficitario,
    state.ente.hasApprovazioneCosfel,

    state.straordinario.fondoStraordinarioOrdinario2016,
    state.straordinario.fondoStraordinarioOrdinarioAnnoCorrente,
    state.straordinario.incrementoStraordinarioOrdinarioProposto,
    state.straordinario.fonteDatoStraordinarioOrdinario,

    state.straordinario.riduzioneStabileStraordinarioArt67,

    state.straordinario.incrementoStraordinarioOrdinario,
    state.straordinario.quotaFinanziataConCapienzaArt23,
    state.straordinario.quotaFinanziataConRiduzioneFondo,
    state.straordinario.contrattazioneIntegrativaRiduzioneFondo,

    state.straordinario.risorseEscluse,

    state.straordinario.stanziamentoStraordinarioOrdinarioAnnoPrecedente,
    state.straordinario.spesaStraordinarioOrdinarioAnnoPrecedente,
    state.straordinario.economieStraordinarioCertificate,

    // Retrocompatibilità
    state.straordinario.fondoStraordinario2016,
    state.straordinario.fondoStraordinarioAnnoCorrente,
    state.straordinario.incrementoRichiesto,
    state.straordinario.riduzioneFondoDecentrato,
    state.straordinario.economieStraordinarioAnnoPrecedente,
    state.straordinario.straordinarioElettoraleEscluso,
    state.straordinario.straordinarioCalamitaEscluso,
    state.straordinario.altreRisorseStraordinarioEscluse,
  ]);

  useEffect(() => {
    // PNRR
    const pnrrInput = {
      annoRiferimento: state.ente.annoRiferimento,
      soggettoAttuatorePnrr: state.pnrr.soggettoAttuatorePnrr,
      componenteStabileFondoDipendenti2016: state.pnrr.componenteStabileFondoDipendenti2016,
      componenteStabileFondoDirigenza2016: state.pnrr.componenteStabileFondoDirigenza2016,
      hasDirigenza: state.ente.hasDirigenza,
      equilibrioEsercizioPrecedente: state.pnrr.equilibrioEsercizioPrecedente,
      parametriDebitoCommercialeEsercizioPrecedente: state.pnrr.parametriDebitoCommercialeEsercizioPrecedente,
      incidenzaSalarioAccessorioScelta: state.pnrr.incidenzaSalarioAccessorioScelta,
      incidenzaSalarioAccessorioPercentuale: state.pnrr.incidenzaSalarioAccessorioPercentuale,
      salarioAccessorioIndicatori: state.pnrr.salarioAccessorioIndicatori,
      spesaPersonaleIndicatori: state.pnrr.spesaPersonaleIndicatori,
      rendicontoApprovatoTermini: state.pnrr.rendicontoApprovatoTermini,
      isDissesto: state.ente.isDissesto,
      isStrutturalmenteDeficitario: state.ente.isStrutturalmenteDeficitario,
      isPianoRiequilibrio: state.ente.isPianoRiequilibrio,
      hasApprovazioneCosfel: state.ente.hasApprovazioneCosfel,
      
      // Retrocompatibilità
      componenteStabile2016: state.pnrr.componenteStabile2016,
      incrementoApplicato: state.pnrr.incrementoApplicato,
      enteInEquilibrio: state.pnrr.enteInEquilibrio,
      requisitiVerificati: state.pnrr.requisitiVerificati,
    };
    const pnrrRes = calculatePnrrIncrement(pnrrInput);
    const pnrrChecks = validatePnrrIncrement(pnrrInput);
    dispatch({ type: 'SET_STEP_RESULT', payload: { step: 'pnrr', result: pnrrRes } });
    dispatch({ type: 'SET_STEP_CHECKS', payload: { step: 'pnrr', checks: pnrrChecks } });
  }, [
    state.ente.annoRiferimento,
    state.pnrr.soggettoAttuatorePnrr,
    state.pnrr.componenteStabileFondoDipendenti2016,
    state.pnrr.componenteStabileFondoDirigenza2016,
    state.ente.hasDirigenza,
    state.pnrr.equilibrioEsercizioPrecedente,
    state.pnrr.parametriDebitoCommercialeEsercizioPrecedente,
    state.pnrr.incidenzaSalarioAccessorioScelta,
    state.pnrr.incidenzaSalarioAccessorioPercentuale,
    state.pnrr.salarioAccessorioIndicatori,
    state.pnrr.spesaPersonaleIndicatori,
    state.pnrr.rendicontoApprovatoTermini,
    state.ente.isDissesto,
    state.ente.isStrutturalmenteDeficitario,
    state.ente.isPianoRiequilibrio,
    state.ente.hasApprovazioneCosfel,
    
    // Retrocompatibilità
    state.pnrr.componenteStabile2016,
    state.pnrr.incrementoApplicato,
    state.pnrr.enteInEquilibrio,
    state.pnrr.requisitiVerificati,
  ]);

  return {
    state,
    dispatch,
    currentStep,
    allChecks,
    blockingErrors,
    warnings,
    summary,
    mappingPreview,
    goNext,
    goPrevious,
    goToStep,
    resetWizard,
    updateEnte,
    updateArt23,
    updateDl25,
    updateCcnl2026,
    updateConglobamento,
    updateStraordinario,
    updatePnrr,
    importExcelData,
    showRecoveryBanner,
    showLastTransferBanner,
    restoreDraft,
    discardDraft,
    restoreLastTransfer,
    startNewCompilation,
    saveLastTransfer,
    clearDraftAfterTransfer,
    restoreError,
    syncStatus: remoteSync.syncStatus,
    lastRemoteSave: remoteSync.lastRemoteSave,
    isSavingRemote: remoteSync.isSavingRemote,
    isOffline: remoteSync.isOffline,
    uploadLocalDraft: remoteSync.uploadLocal,
    downloadRemoteDraft: remoteSync.downloadRemote,
    resolveSyncConflict: remoteSync.resolveConflict,
    userEmail: globalState?.currentUser?.email,
    lastHydrationSource: remoteSync.lastHydrationSource,
  };
}
