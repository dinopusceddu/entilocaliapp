import { Wizard2026DraftState } from '../types';
import { FundData } from '../../../domain/types';
import { simulateWizard2026Transfer } from './transferPreviewEngine';

export interface Wizard2026TransferPayload {
  annualData: Partial<FundData['annualData']>;
  fondoAccessorioDipendenteData: Partial<FundData['fondoAccessorioDipendenteData']>;
  fondoElevateQualificazioniData: Partial<FundData['fondoElevateQualificazioniData']>;
  fondoDirigenzaData: Partial<FundData['fondoDirigenzaData']>;
}

/**
 * Costruisce il payload di trasferimento a partire dallo stato del wizard e dal fundData corrente.
 */
export function buildWizard2026TransferPayload(
  draftState: Wizard2026DraftState,
  currentFundData: FundData
): Wizard2026TransferPayload {
  const simulated = simulateWizard2026Transfer(draftState, currentFundData);
  
  return {
    annualData: simulated.annualData || {},
    fondoAccessorioDipendenteData: simulated.fondoAccessorioDipendenteData || {},
    fondoElevateQualificazioniData: simulated.fondoElevateQualificazioniData || {},
    fondoDirigenzaData: simulated.fondoDirigenzaData || {},
  };
}

/**
 * Applica il trasferimento del wizard ai dati del fondo corrente, restituendo un nuovo oggetto FundData clonato.
 * Non muta l'oggetto originale.
 */
export function applyWizard2026Transfer(
  draftState: Wizard2026DraftState,
  currentFundData: FundData,
  localSources?: Record<string, string>
): FundData {
  const result = simulateWizard2026Transfer(draftState, currentFundData, localSources);
  
  // Costruzione del snapshot wizard2026TransferSnapshot coerente e verificabile
  const ms2021 =
    draftState.ccnl2026.result?.monteSalari2021 ??
    draftState.ccnl2026.monteSalari2021Consolidato2026 ??
    draftState.ccnl2026.monteSalari2021 ??
    0;

  const ccnlRes = draftState.ccnl2026.result;
  const art23Res = draftState.art23.result;
  const dl25Res = draftState.dl25.result;
  const pnrrRes = draftState.pnrr.result;
  const dl25ImportoApplicato = draftState.dl25.incrementoApplicato ?? 0;
  const isDl25ImportoApplicabile =
    dl25ImportoApplicato > 0 &&
    dl25Res?.limiteMassimoDL25 !== undefined &&
    dl25ImportoApplicato <= dl25Res.limiteMassimoDL25;

  // Costruisce la lista del piano di trasferimento effettivamente applicata
  // Possiamo simularla per il snapshot
  const transferPlanList: any[] = [];
  
  // Aggiunge elementi al transferPlan nel snapshot
  if (draftState.art23.limite2016CertificatoEnte !== undefined) {
    transferPlanList.push({
      source: 'art23.limite2016CertificatoEnte',
      destinationPath: 'historicalData.manualPersonalFundLimit2016',
      proposedValue: draftState.art23.limite2016CertificatoEnte,
      currentValue: currentFundData.historicalData?.manualPersonalFundLimit2016 ?? null,
      status: localSources?.['historicalData.manualPersonalFundLimit2016'] === 'manual' ? 'CONFLICT' : 'READY',
      art23Treatment: 'FUORI_LIMITE'
    });
  }
  if (ccnlRes) {
    transferPlanList.push({
      source: 'ccnl2026.result.incremento014Fondo',
      destinationPath: 'fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021',
      proposedValue: ccnlRes.incremento014Fondo,
      currentValue: currentFundData.fondoAccessorioDipendenteData?.st_art58c1_CCNL2026_incremento014_MS2021 ?? null,
      status: 'READY',
      art23Treatment: 'FUORI_LIMITE'
    });
    transferPlanList.push({
      source: 'ccnl2026.result.incremento014EQ',
      destinationPath: 'fondoElevateQualificazioniData.st_incremento014_ms2021_eq',
      proposedValue: ccnlRes.incremento014EQ,
      currentValue: currentFundData.fondoElevateQualificazioniData?.st_incremento014_ms2021_eq ?? null,
      status: 'READY',
      art23Treatment: 'FUORI_LIMITE'
    });
    transferPlanList.push({
      source: 'ccnl2026.result.incremento022Fondo',
      destinationPath: 'fondoAccessorioDipendenteData.vn_art58c2_incremento_max022_ms2021',
      proposedValue: ccnlRes.incremento022Fondo,
      currentValue: currentFundData.fondoAccessorioDipendenteData?.vn_art58c2_incremento_max022_ms2021 ?? null,
      status: 'READY',
      art23Treatment: 'FUORI_LIMITE'
    });
    transferPlanList.push({
      source: 'ccnl2026.result.incremento022EQ',
      destinationPath: 'fondoElevateQualificazioniData.va_incremento022_ms2021_eq',
      proposedValue: ccnlRes.incremento022EQ,
      currentValue: currentFundData.fondoElevateQualificazioniData?.va_incremento022_ms2021_eq ?? null,
      status: 'READY',
      art23Treatment: 'FUORI_LIMITE'
    });
    transferPlanList.push({
      source: 'ccnl2026.result.arretrati014Fondo',
      destinationPath: 'fondoAccessorioDipendenteData.vn_art58_CCNL2026_arretrati2024_2025',
      proposedValue: ccnlRes.arretrati014Fondo,
      currentValue: currentFundData.fondoAccessorioDipendenteData?.vn_art58_CCNL2026_arretrati2024_2025 ?? null,
      status: 'READY',
      art23Treatment: 'FUORI_LIMITE'
    });
    transferPlanList.push({
      source: 'ccnl2026.result.arretrati014EQ',
      destinationPath: 'fondoElevateQualificazioniData.va_arretrati014_eq',
      proposedValue: ccnlRes.arretrati014EQ,
      currentValue: currentFundData.fondoElevateQualificazioniData?.va_arretrati014_eq ?? null,
      status: 'READY',
      art23Treatment: 'FUORI_LIMITE'
    });
  }
  
  const art60Res = draftState.conglobamentoArt60.result;
  if (art60Res?.riduzioneTotale !== undefined) {
    transferPlanList.push({
      source: 'conglobamentoArt60.result.riduzioneTotale',
      destinationPath: 'fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto',
      proposedValue: art60Res.riduzioneTotale,
      currentValue: currentFundData.fondoAccessorioDipendenteData?.st_art60c2_CCNL2026_decurtazioneIndennitaComparto ?? null,
      status: 'READY',
      art23Treatment: 'COMPUTO_FIGURATIVO'
    });
  }

  if (draftState.art23.fondoCertificatoParteStabile2018 !== undefined) {
    transferPlanList.push({
      source: 'art23.fondoCertificatoParteStabile2018',
      destinationPath: 'annualData.fondoCertificatoParteStabile2018',
      proposedValue: draftState.art23.fondoCertificatoParteStabile2018,
      currentValue: currentFundData.annualData?.fondoCertificatoParteStabile2018 ?? null,
      status: localSources?.['annualData.fondoCertificatoParteStabile2018'] === 'manual' ? 'CONFLICT' : 'READY',
      art23Treatment: 'NON_RILEVANTE'
    });
  }
  if (draftState.art23.result?.incrementoStabileAumentoPersonale !== undefined) {
    transferPlanList.push({
      source: 'art23.result.incrementoStabileAumentoPersonale',
      destinationPath: 'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers',
      proposedValue: draftState.art23.result.incrementoStabileAumentoPersonale,
      currentValue: currentFundData.fondoAccessorioDipendenteData?.st_art79c1c_incrementoStabileConsistenzaPers ?? null,
      status: localSources?.['fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers'] === 'manual' ? 'CONFLICT' : 'READY',
      art23Treatment: 'DENTRO_LIMITE'
    });
  }

  if (dl25Res?.limiteMassimoDL25 !== undefined) {
    if (isDl25ImportoApplicabile) {
      transferPlanList.push({
        source: 'dl25.incrementoApplicato',
        destinationPath: 'fondoAccessorioDipendenteData.st_incrementoDL25_2025',
        proposedValue: dl25ImportoApplicato,
        currentValue: currentFundData.fondoAccessorioDipendenteData?.st_incrementoDL25_2025 ?? null,
        status: 'READY',
        art23Treatment: 'FUORI_LIMITE'
      });
    } else {
      transferPlanList.push({
        source: 'dl25.result.limiteMassimoDL25',
        destinationPath: 'simulato.dl25.limiteMassimoDL25',
        proposedValue: dl25Res.limiteMassimoDL25,
        currentValue: null,
        status: 'CONTROL_ONLY',
        art23Treatment: 'FUORI_LIMITE'
      });
    }
  }

  if (pnrrRes?.totaleLimiteMassimoPnrr !== undefined) {
    transferPlanList.push({
      source: 'pnrr.result.totaleLimiteMassimoPnrr',
      destinationPath: 'simulato.pnrr.totaleLimiteMassimoPnrr',
      proposedValue: pnrrRes.totaleLimiteMassimoPnrr,
      currentValue: null,
      status: 'CONTROL_ONLY',
      art23Treatment: 'FUORI_LIMITE'
    });
  }

  if (art23Res?.limiteArt23Attualizzato !== undefined) {
    transferPlanList.push({
      source: 'art23.result.limiteArt23Attualizzato',
      destinationPath: 'simulato.limiteArt23Attualizzato',
      proposedValue: art23Res.limiteArt23Attualizzato,
      currentValue: null,
      status: 'CONTROL_ONLY',
      art23Treatment: 'SOLO_CONTROLLO'
    });
  }

  const strRes = draftState.straordinario.result;
  if (strRes?.riduzioneFondoDecentratoPerStraordinario !== undefined) {
    transferPlanList.push({
      source: 'straordinario.result.riduzioneFondoDecentratoPerStraordinario',
      destinationPath: 'fondoAccessorioDipendenteData.st_riduzioneFondoStraordinario',
      proposedValue: strRes.riduzioneFondoDecentratoPerStraordinario,
      currentValue: currentFundData.fondoAccessorioDipendenteData?.st_riduzioneFondoStraordinario ?? null,
      status: 'READY',
      art23Treatment: 'DENTRO_LIMITE'
    });
  }

  // Costruisce lo snapshot wizard2026TransferSnapshot
  result.wizard2026TransferSnapshot = {
    transferredAt: new Date().toISOString(),
    year: 2026,
    userId: '',
    entityId: '',

    input: {
      monteSalari2021: ms2021,
      limiteArt23Storico2016: draftState.art23.limite2016CertificatoEnte,
      limiteArt23Comma2Attualizzato: art23Res?.limiteArt23Attualizzato ?? draftState.art23.limite2016CertificatoEnte,
      fondoRisorseDecentrate2024: draftState.ccnl2026.fondoRisorseDecentrate2024,
      risorseEQ2024: draftState.ccnl2026.risorseEQ2024,
      incrementoEffettivo022: draftState.ccnl2026.incremento022Anno,
      datiArt60: draftState.conglobamentoArt60,
      datiStraordinario: draftState.straordinario,
      datiDL25: draftState.dl25,
      datiPNRR: draftState.pnrr,
      fondoCertificatoParteStabile2018: draftState.art23.fondoCertificatoParteStabile2018,
    },

    computed: {
      incremento014Stabile: ccnlRes?.incrementoStabile014,
      arretrati014: ccnlRes?.arretrati014,
      quota014Fondo: ccnlRes?.incremento014Fondo,
      quota014EQ: ccnlRes?.incremento014EQ,
      arretrati014Fondo: ccnlRes?.arretrati014Fondo,
      arretrati014EQ: ccnlRes?.arretrati014EQ,
      limiteMassimo022: ms2021 * 0.0022 * 2, // x2 per il 2026
      annualita022Considerate: 2,
      quota022Fondo: ccnlRes?.incremento022Fondo,
      quota022EQ: ccnlRes?.incremento022EQ,
      art60Decurtazione: draftState.conglobamentoArt60.result?.riduzioneTotale,
      fondoStraordinarioCorrente: draftState.straordinario.result?.straordinarioOrdinarioSoggettoArt23,
      incrementoStabileAumentoPersonale: draftState.art23.result?.incrementoStabileAumentoPersonale,
      dipendentiEquivalenti2018: draftState.art23.result?.dipendentiEquivalenti2018,
      dipendentiEquivalenti2026: draftState.art23.result?.dipendentiEquivalenti2026,
      limiteArt23Attualizzato: art23Res?.limiteArt23Attualizzato,
      limiteArt23Storico2016: draftState.art23.limite2016CertificatoEnte,
      dl25MassimoTeorico: dl25Res?.limiteMassimoDL25,
      dl25ImportoApplicato: isDl25ImportoApplicabile ? dl25ImportoApplicato : 0,
      pnrrMassimoFondoDipendenti: pnrrRes?.limiteMassimoPnrrFondoDipendenti,
      pnrrMassimoFondoDirigenza: pnrrRes?.limiteMassimoPnrrFondoDirigenza,
      pnrrMassimoTeorico: pnrrRes?.totaleLimiteMassimoPnrr,
      pnrrImportoApplicato: 0,
    },

    destination: {
      fondoAccessorioDipendenteData: result.fondoAccessorioDipendenteData,
      fondoElevateQualificazioniData: result.fondoElevateQualificazioniData,
      fondoSegretarioComunaleData: result.fondoSegretarioComunaleData,
      fondoDirigenzaData: result.fondoDirigenzaData,
      annualData: result.annualData,
      historicalData: result.historicalData,
    },

    transferPlan: transferPlanList
  };

  return result;
}

/**
 * Crea uno snapshot profondo dello stato corrente dei dati del fondo per scopi di rollback.
 */
export function createWizard2026TransferSnapshot(currentFundData: FundData): FundData {
  return structuredClone(currentFundData);
}

/**
 * Ripristina lo stato del fondo a partire da uno snapshot.
 */
export function restoreWizard2026TransferSnapshot(snapshot: FundData): FundData {
  return structuredClone(snapshot);
}
