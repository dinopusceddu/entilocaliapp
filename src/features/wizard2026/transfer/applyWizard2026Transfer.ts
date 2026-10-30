import { calculateCcnl2026Increments, qualifyCcnl022AnnualAllocation } from '../../../logic/wizard2026/ccnl2026Increments';
import { resolve022LegacyValue } from '../../../logic/calculation/canonicalFundLedger';
import FinancialMath from '../../../utils/financialMath';
import { presentWizardArt23 } from '../art23Presentation';
import { validateMonetaryData, MonetaryBoundaryError, normalizeMonetaryData } from '../../../domain/monetaryBoundary';
import { validateMonetaryProcessing } from '../../../application/input/monetaryProcessingSafety';
import { checkedMonetaryCalculation } from '../../../utils/financialMath';
import { Wizard2026DraftState } from '../types';
import { FundData } from '../../../domain/types';
import { simulateWizard2026Transfer } from './transferPreviewEngine';
import { assertWizard2026Transferable, ccnl2026InputFromDraft } from '../validation';
import { resolveWizardPnrrFaculty } from '../../../logic/wizard2026/pnrrIncrement';
import { resolveWizardDl25Carry, resolveWizardDl25Regime, withDl25FundContext, isDl25YearConsistent } from '../dl25Contract';
import { resolveDl25TotalCeiling, resolveAnnualDl25 } from '../../../logic/shared/dl25CarryForward';
import { considered022Years, resolveCcnlRecoveries } from '../../../logic/shared/ccnlRecovery';

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
  const checked = checkedMonetaryCalculation(() => applyWizard2026TransferCore(draftState, currentFundData, localSources));
  if (checked.status === 'INVALID') throw new MonetaryBoundaryError(checked.issues);
  return checked.value;
}

function applyWizard2026TransferCore(
  draftState: Wizard2026DraftState,
  currentFundData: FundData,
  localSources?: Record<string, string>
): FundData {
  if (currentFundData.metadata?.snapshotStatus === 'CLOSED') throw new Error('SNAPSHOT_CLOSED: trasferimento PNRR non consentito.');
  const issues = [...validateMonetaryData(draftState, 'wizard'), ...validateMonetaryData(currentFundData)];
  if (issues.length) throw new MonetaryBoundaryError(issues);
  draftState = normalizeMonetaryData(draftState, 'wizard');
  currentFundData = normalizeMonetaryData(currentFundData);
  draftState = withDl25FundContext(draftState, currentFundData);
  if ((draftState.dl25.currentYearDelta !== undefined || (draftState.dl25.incrementoApplicato ?? 0) > 0) && !isDl25YearConsistent(draftState, currentFundData)) throw new Error('DL25_REFERENCE_YEAR_MISMATCH');
  // Difesa in profondità: rifiuta l'operazione se esistono errori bloccanti di dominio
  assertWizard2026Transferable(draftState);

  const result = simulateWizard2026Transfer(draftState, currentFundData, localSources);
  
  const allocated022 = FinancialMath.addExact(resolve022LegacyValue(result.fondoAccessorioDipendenteData).amount,
    result.fondoElevateQualificazioniData?.va_incremento022_ms2021_eq ?? 0);
  const cap022 = qualifyCcnl022AnnualAllocation({ annoRiferimento: result.annualData.annoRiferimento,
    monteSalari2021: result.annualData.ccnl2024?.monteSalari2021, amount: allocated022 });
  if (allocated022 > 0 && cap022.status !== 'VALID') throw new Error(cap022.reason);

  // Costruzione del snapshot wizard2026TransferSnapshot coerente e verificabile
  const ms2021 = result.annualData.ccnl2024?.monteSalari2021;

  const ccnlRes = draftState.ccnl2026.result;
  const current022 = calculateCcnl2026Increments(ccnl2026InputFromDraft(draftState));
  // Qualify new technical projections without changing canonical calculation or old snapshots.
  const art23Presentation = presentWizardArt23(draftState.art23, draftState.ente.hasDirigenza);
  const dl25Res = draftState.dl25.result;
  const pnrrRes = draftState.pnrr.result;
  const pnrrFaculty = resolveWizardPnrrFaculty({ ...draftState.pnrr, annoRiferimento: draftState.ente.annoRiferimento });
  if (draftState.pnrr.exerciseDecision === 'EXERCISED' && pnrrFaculty.status !== 'VALID') {
    throw new Error(`PNRR transfer non utilizzabile: ${pnrrFaculty.reasons.join(', ')}`);
  }
  const dl25Carry = resolveWizardDl25Carry(draftState);
  const dl25ImportoApplicato = dl25Carry.currentCumulativeApplied;
  const isDl25ImportoApplicabile = dl25Carry.state === 'VALID';
  const dl25Applied = isDl25ImportoApplicabile && result.fondoAccessorioDipendenteData.st_incrementoDL25_2025 === dl25ImportoApplicato;
  const dl25ActualCarry = dl25Applied ? dl25Carry : resolveAnnualDl25(result);

  // Costruisce la lista del piano di trasferimento effettivamente applicata
  // Possiamo simularla per il snapshot
  const transferPlanList: any[] = [];
  if (draftState.pnrr.exerciseDecision !== undefined) {
    transferPlanList.push({ source: 'pnrr.exerciseDecision', destinationPath: 'annualData.pnrrExerciseDecision',
      proposedValue: draftState.pnrr.exerciseDecision, currentValue: currentFundData.annualData.pnrrExerciseDecision ?? null,
      status: 'READY', art23Treatment: 'SOLO_CONTROLLO' });
    transferPlanList.push({ source: 'pnrr.incrementoApplicato',
      destinationPath: 'fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016',
      proposedValue: result.fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016,
      currentValue: currentFundData.fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016 ?? null,
      status: 'READY', art23Treatment: 'FUORI_LIMITE' });
  }
  
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
    if (ccnlRes.incremento014Fondo !== undefined) {
      transferPlanList.push({
        source: 'ccnl2026.result.incremento014Fondo',
        destinationPath: 'fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021',
        proposedValue: ccnlRes.incremento014Fondo,
        currentValue: currentFundData.fondoAccessorioDipendenteData?.st_art58c1_CCNL2026_incremento014_MS2021 ?? null,
        status: 'READY',
        art23Treatment: 'FUORI_LIMITE'
      });
    }
    if (ccnlRes.incremento014EQ !== undefined) {
      transferPlanList.push({
        source: 'ccnl2026.result.incremento014EQ',
        destinationPath: 'fondoElevateQualificazioniData.st_incremento014_ms2021_eq',
        proposedValue: ccnlRes.incremento014EQ,
        currentValue: currentFundData.fondoElevateQualificazioniData?.st_incremento014_ms2021_eq ?? null,
        status: 'READY',
        art23Treatment: 'FUORI_LIMITE'
      });
    }
    if (current022.incremento022Fondo !== undefined) {
      transferPlanList.push({
        source: 'ccnl2026.result.incremento022Fondo',
        destinationPath: 'fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021',
        proposedValue: current022.incremento022Fondo,
        currentValue: currentFundData.fondoAccessorioDipendenteData?.vn_art58c2_CCNL2026_incremento022_MS2021 ?? null,
        status: 'READY',
        art23Treatment: 'FUORI_LIMITE'
      });
    }
    if (current022.incremento022EQ !== undefined) {
      transferPlanList.push({
        source: 'ccnl2026.result.incremento022EQ',
        destinationPath: 'fondoElevateQualificazioniData.va_incremento022_ms2021_eq',
        proposedValue: current022.incremento022EQ,
        currentValue: currentFundData.fondoElevateQualificazioniData?.va_incremento022_ms2021_eq ?? null,
        status: 'READY',
        art23Treatment: 'FUORI_LIMITE'
      });
    }
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
  if (draftState.art23.legacyArt79c1cEstimate !== undefined && draftState.art23.legacyArt79c1cEstimate > 0) {
    transferPlanList.push({
      source: 'art23.legacyArt79c1cEstimate',
      destinationPath: 'simulato.art79c1c.stimaLegacy',
      proposedValue: draftState.art23.legacyArt79c1cEstimate,
      currentValue: currentFundData.fondoAccessorioDipendenteData?.st_art79c1c_incrementoStabileConsistenzaPers ?? null,
      status: 'CONTROL_ONLY',
      art23Treatment: 'SOLO_CONTROLLO'
    });
  }

  if (dl25Carry.totalCeiling !== undefined || dl25Res?.limiteMassimoDL25 !== undefined) {
    if (isDl25ImportoApplicabile) {
      transferPlanList.push({
        source: 'dl25.currentCumulativeApplied',
        destinationPath: 'fondoAccessorioDipendenteData.st_incrementoDL25_2025',
        proposedValue: dl25ImportoApplicato,
        currentValue: currentFundData.fondoAccessorioDipendenteData?.st_incrementoDL25_2025 ?? null,
        status: dl25Applied ? 'READY' : 'CONFLICT',
        art23Treatment: 'FUORI_LIMITE'
      });
    } else {
      transferPlanList.push({
        source: 'dl25.result.limiteMassimoDL25',
        destinationPath: 'simulato.dl25.limiteMassimoDL25',
        proposedValue: dl25Carry.totalCeiling ?? dl25Res?.limiteMassimoDL25,
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

  if (art23Presentation.adjustedLimit !== undefined) {
    transferPlanList.push({
      source: 'art23.result.limiteArt23Attualizzato',
      destinationPath: 'simulato.limiteArt23Attualizzato',
      proposedValue: art23Presentation.adjustedLimit,
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
    year: draftState.ente.annoRiferimento ?? 2026,
    userId: '',
    entityId: '',

    input: {
      monteSalari2021: ms2021,
      limiteArt23Storico2016: draftState.art23.limite2016CertificatoEnte,
      limiteArt23Comma2Attualizzato: art23Presentation.adjustedLimit,
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
      limiteMassimo022: current022.limiteMassimo022,
      annualita022Considerate: considered022Years(draftState.ente.annoRiferimento ?? 2026,
        resolveCcnlRecoveries(result.annualData.ccnlRecovery, draftState.ente.annoRiferimento ?? 2026, ms2021)),
      quota022Fondo: current022.incremento022Fondo,
      quota022EQ: current022.incremento022EQ,
      art60Decurtazione: draftState.conglobamentoArt60.result?.riduzioneTotale,
      fondoStraordinarioCorrente: draftState.straordinario.result?.straordinarioOrdinarioSoggettoArt23,
      incrementoStabileAumentoPersonale: draftState.art23.result?.incrementoStabileAumentoPersonale,
      legacyArt79c1cEstimate: draftState.art23.legacyArt79c1cEstimate,
      dipendentiEquivalenti2018: draftState.art23.result?.dipendentiEquivalenti2018,
      dipendentiEquivalenti2026: draftState.art23.result?.dipendentiEquivalenti2026,
      limiteArt23Attualizzato: art23Presentation.adjustedLimit,
      limiteArt23Storico2016: draftState.art23.limite2016CertificatoEnte,
      dl25MassimoTeorico: resolveDl25TotalCeiling(draftState.dl25),
      dl25ImportoApplicato: dl25ActualCarry.state === 'VALID' ? dl25ActualCarry.currentCumulativeApplied : undefined,
      dl25PriorCumulativeApplied: dl25ActualCarry.priorCumulativeApplied,
      dl25CurrentYearDelta: dl25ActualCarry.currentYearDelta,
      dl25RequestedCurrentYearDelta: dl25Carry.currentYearDelta,
      dl25RemainingCapacity: dl25ActualCarry.remainingCapacity,
      dl25RemainingAfterApplication: dl25ActualCarry.remainingAfterApplication,
      dl25Regime: resolveWizardDl25Regime(draftState),
      pnrrMassimoFondoDipendenti: pnrrRes?.limiteMassimoPnrrFondoDipendenti,
      pnrrMassimoFondoDirigenza: pnrrRes?.limiteMassimoPnrrFondoDirigenza,
      pnrrMassimoTeorico: pnrrRes?.totaleLimiteMassimoPnrr,
      pnrrImportoApplicato: result.fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016,
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

  const outputIssues = validateMonetaryProcessing(result);
  if (outputIssues.length) throw new MonetaryBoundaryError(outputIssues);
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
  const issues = validateMonetaryProcessing(snapshot);
  if (issues.length) throw new MonetaryBoundaryError(issues);
  return normalizeMonetaryData(snapshot);
}
