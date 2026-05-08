import {
  SimulatoreIncrementoInput,
  SimulatoreIncrementoRisultati,
  TipologiaEnte,
  FundData,
  CalculationResult,
  FundResult,
  CalculationAlert,
  NormativeData
} from '../domain';

import FinancialMath from '../utils/financialMath';
import { formatCurrency } from '../utils/formatters';

import {
  calculateFadTotals,
  calculateArt23c2Adjustment,
  calculateCcnl2024Components,
  calculateEqSubFund,
  calculateSegretarioSubFund,
  calculateDirigenzaSubFund
} from './fundCalculations';

import {
  calculateAbsorbedProgression,
  calculateAbsorbedIndennitaComparto,
  calculateTotalDipendentiEquivalenti
} from './personaleCalculations';

import { runAllComplianceChecks } from './complianceChecks';
import { buildCalculationResult } from './calculationResultFactory';

/**
 * Recupera la soglia di spesa del personale in base ad abitanti e tipologia ente.
 */
export const getSogliaSpesaPersonale = (numeroAbitanti?: number, tipologiaEnte?: TipologiaEnte): number => {
  if (numeroAbitanti === undefined || tipologiaEnte === undefined) return 0;

  if (tipologiaEnte === TipologiaEnte.COMUNE) {
    if (numeroAbitanti <= 999) return 29.50;
    if (numeroAbitanti <= 1999) return 28.60;
    if (numeroAbitanti <= 2999) return 27.60;
    if (numeroAbitanti <= 4999) return 27.20;
    if (numeroAbitanti <= 9999) return 26.90;
    if (numeroAbitanti <= 59999) return 27.00;
    if (numeroAbitanti <= 249999) return 27.60;
    if (numeroAbitanti <= 1499999) return 28.80;
    return 25.30;
  } else if (tipologiaEnte === TipologiaEnte.PROVINCIA) {
    if (numeroAbitanti <= 250000) return 20.80;
    if (numeroAbitanti <= 349999) return 19.10;
    if (numeroAbitanti <= 449999) return 19.10;
    if (numeroAbitanti <= 699999) return 19.70;
    return 13.90;
  }
  return 0;
};

/**
 * Calcola i risultati della simulazione di incremento.
 */
export const calculateSimulazione = (
  currentInputs?: SimulatoreIncrementoInput,
  numAbitanti?: number,
  tipoEnte?: TipologiaEnte
): SimulatoreIncrementoRisultati | undefined => {
  if (!currentInputs) return undefined;

  const stipendiTabellari2023 = currentInputs.simStipendiTabellari2023 || 0;
  const fondoStabileAnnoApplicazione = currentInputs.simFondoStabileAnnoApplicazione || 0;
  const risorsePOEQAnnoApplicazione = currentInputs.simRisorsePOEQAnnoApplicazione || 0;
  const spesaPersonaleConsuntivo2023 = currentInputs.simSpesaPersonaleConsuntivo2023 || 0;
  const mediaEntrateCorrenti = currentInputs.simMediaEntrateCorrenti2021_2023 || 0;
  const tettoSpesaL296_06 = currentInputs.simTettoSpesaPersonaleL296_06 || 0;
  const costoNuoveAssunzioni = currentInputs.simCostoAnnuoNuoveAssunzioniPIAO || 0;
  const percOneri = currentInputs.simPercentualeOneriIncremento || 0;

  const fase1_obiettivo48 = stipendiTabellari2023 * 0.48;
  const fase1_fondoAttualeComplessivo = fondoStabileAnnoApplicazione + risorsePOEQAnnoApplicazione;
  const fase1_incrementoPotenzialeLordo = Math.max(0, fase1_obiettivo48 - fase1_fondoAttualeComplessivo);

  const fase2_spesaPersonaleAttualePrevista = spesaPersonaleConsuntivo2023 + costoNuoveAssunzioni;
  const fase2_sogliaPercentualeDM17_03_2020 = getSogliaSpesaPersonale(numAbitanti, tipoEnte);
  const fase2_limiteSostenibileDL34 = mediaEntrateCorrenti * (fase2_sogliaPercentualeDM17_03_2020 / 100);
  const fase2_spazioDisponibileDL34 = Math.max(0, fase2_limiteSostenibileDL34 - fase2_spesaPersonaleAttualePrevista);

  const fase3_margineDisponibileL296_06 = Math.max(0, tettoSpesaL296_06 - fase2_spesaPersonaleAttualePrevista);

  const fase4_spazioUtilizzabileLordo = Math.min(
    fase1_incrementoPotenzialeLordo,
    fase2_spazioDisponibileDL34,
    fase3_margineDisponibileL296_06
  );

  let fase5_incrementoNettoEffettivoFondo = 0;
  if (percOneri >= 0 && percOneri < 100) {
    fase5_incrementoNettoEffettivoFondo = fase4_spazioUtilizzabileLordo / (1 + (percOneri / 100));
  }

  return {
    fase1_obiettivo48,
    fase1_fondoAttualeComplessivo,
    fase1_incrementoPotenzialeLordo,
    fase2_spesaPersonaleAttualePrevista,
    fase2_sogliaPercentualeDM17_03_2020,
    fase2_limiteSostenibileDL34,
    fase2_spazioDisponibileDL34,
    fase3_margineDisponibileL296_06,
    fase4_spazioUtilizzabileLordo,
    fase5_incrementoNettoEffettivoFondo,
  };
};

/**
 * Entrypoint pubblico per il calcolo completo del fondo.
 * Produce un CalculationResult canonico e strutturato.
 */
export const calculateFundCompletely = (fundData: FundData, normativeData: NormativeData): CalculationResult => {
  const {
    historicalData,
    annualData,
    fondoAccessorioDipendenteData,
    fondoElevateQualificazioniData,
    fondoSegretarioComunaleData,
    fondoDirigenzaData,
    personaleServizio
  } = fundData;

  const { isManualMode, manualProgressioni, manualIndennita, manualDipendentiEquivalenti, dettagli } = personaleServizio;
  const { riferimenti_normativi } = normativeData;

  // 1. Calcoli Infrastrutturali
  const progAssorbite = isManualMode ? (manualProgressioni || 0) : calculateAbsorbedProgression(dettagli || [], annualData.annoRiferimento, normativeData);
  const indCompartoAssorbita = isManualMode ? (manualIndennita || 0) : calculateAbsorbedIndennitaComparto(dettagli || [], annualData.annoRiferimento, normativeData);
  const totaleRisorseAssorbitePersonale = FinancialMath.addExact(progAssorbite, indCompartoAssorbita);
  const calculatedFteAnnoRif = isManualMode ? (manualDipendentiEquivalenti || 0) : calculateTotalDipendentiEquivalenti(dettagli || [], annualData.annoRiferimento);

  // 2. Limiti e Art. 23 c. 2
  const fondoBase2016_originale =
    (historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) +
    (historicalData.fondoElevateQualificazioni2016 || 0) +
    (historicalData.fondoDirigenza2016 || 0) +
    (historicalData.risorseSegretarioComunale2016 || 0) +
    (annualData.fondoLavoroStraordinario || 0);

  const fondoBase2016 = historicalData.manualPersonalFundLimit2016 !== undefined
    ? historicalData.manualPersonalFundLimit2016
    : fondoBase2016_originale;

  const art23Adjustment = calculateArt23c2Adjustment(historicalData, annualData, calculatedFteAnnoRif, !!isManualMode, riferimenti_normativi);
  const limiteArt23C2Modificato = fondoBase2016 + art23Adjustment.importo;

  // 3. CCNL 2024
  const ccnl = calculateCcnl2024Components(annualData.ccnl2024);

  // 4. Totali per Fondo (FAD, EQ, Seg, Dir)
  const isEnteInCondizioniSpeciali = !!annualData.isEnteDissestato || !!annualData.isEnteStrutturalmenteDeficitario || !!annualData.isEnteRiequilibrioFinanziario;
  const fadRes = calculateFadTotals(fondoAccessorioDipendenteData || {}, annualData.simulatoreRisultati, isEnteInCondizioniSpeciali, fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti, normativeData);
  
  const totaleStabileDip = FinancialMath.addExact(fadRes.totaleStabile_Dipendenti, ccnl.ccnl2024_fad_stabile);
  const totaleVariabileDip = FinancialMath.roundTo2DP(FinancialMath.sumAll(fadRes.sommaVariabiliSoggette_Dipendenti, fadRes.sommaVariabiliNonSoggette_Dipendenti, -fadRes.altreRisorseDecurtazioniFinali_Dipendenti, -fadRes.decurtazioniLimiteSalarioAccessorio_Dipendenti, ccnl.ccnl2024_fad_variabile));

  const dipendente: FundResult = {
    label: "Fondo Personale Dipendente",
    constitution: { sections: fadRes.sections },
    summary: {
      totaleStabile: totaleStabileDip,
      totaleVariabile: totaleVariabileDip,
      totaleFondo: FinancialMath.sumAll(totaleStabileDip, totaleVariabileDip)
    }
  };

  const eqRaw = calculateEqSubFund(fondoElevateQualificazioniData || {}, ccnl.ccnl2024_eq_stabile, ccnl.ccnl2024_eq_variabile);
  const eq: FundResult = {
    label: "Risorse Elevate Qualificazioni",
    summary: {
      totaleStabile: eqRaw.stabile,
      totaleVariabile: eqRaw.variabile,
      totaleFondo: eqRaw.totale
    }
  };

  const segRaw = calculateSegretarioSubFund(fondoSegretarioComunaleData || {});
  const segretario: FundResult = {
    label: "Risorse Segretario Comunale",
    summary: {
      totaleStabile: segRaw.stabile,
      totaleVariabile: segRaw.variabile,
      totaleFondo: segRaw.totale
    }
  };

  const dirRaw = calculateDirigenzaSubFund(fondoDirigenzaData || {}, !!annualData.hasDirigenza);
  const dirigenza: FundResult = {
    label: "Fondo Dirigenza",
    summary: {
      totaleStabile: dirRaw.stabile,
      totaleVariabile: dirRaw.variabile,
      totaleFondo: dirRaw.totale
    }
  };

  // 5. Totali Globali e Compliance
  const totaleParteStabile = FinancialMath.sumAll(dipendente.summary.totaleStabile, eq.summary.totaleStabile, segretario.summary.totaleStabile, dirigenza.summary.totaleStabile);
  const totaleParteVariabile = FinancialMath.sumAll(dipendente.summary.totaleVariabile, eq.summary.totaleVariabile, segretario.summary.totaleVariabile, dirigenza.summary.totaleVariabile);
  const totaleFondo = FinancialMath.sumAll(totaleParteStabile, totaleParteVariabile);

  const eq_soggette = (fondoElevateQualificazioniData?.ris_fondoPO2017 || 0) + (fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti || 0) + (fondoElevateQualificazioniData?.ris_incrementoLimiteArt23c2_DL34 || 0) + (fondoElevateQualificazioniData?.va_dl25_2025_armonizzazione || 0);
  const ammontareSoggettoLimite2016 = FinancialMath.roundTo2DP(FinancialMath.sumAll(
    fadRes.sommaStabiliSoggetteLimite,
    fadRes.sommaVariabiliSoggette_Dipendenti,
    eq_soggette,
    segretario.summary.totaleStabile,
    (annualData.hasDirigenza ? dirigenza.summary.totaleStabile : 0),
    totaleRisorseAssorbitePersonale
  ));

  const deltaArt23 = ammontareSoggettoLimite2016 - limiteArt23C2Modificato;
  
  const alerts: CalculationAlert[] = [];
  if (deltaArt23 > 0.01) {
    alerts.push({
      id: 'alert_art23c2',
      message: `Superamento limite Art. 23 c. 2 rilevato per ${formatCurrency(deltaArt23)}`,
      severity: 'error'
    });
  }

  // 6. Costruzione DTO finale tramite factory
  const preliminaryResult = buildCalculationResult({
    metadata: {
      annoRiferimento: annualData.annoRiferimento,
      timestamp: new Date().toISOString()
    },
    inputs: {
      hasDirigenza: !!annualData.hasDirigenza,
      isEnteInCondizioniSpeciali,
      fteAnnoRiferimento: calculatedFteAnnoRif,
      tipologiaEnte: annualData.tipologiaEnte,
      numeroAbitanti: annualData.numeroAbitanti
    },
    fondi: { dipendente, eq, segretario, dirigenza },
    compliance: {
      checks: [], 
      art23c2: {
        limite: limiteArt23C2Modificato,
        valoreSoggetto: ammontareSoggettoLimite2016,
        delta: -deltaArt23,
        isCompliant: deltaArt23 <= 0.01
      }
    },
    totals: {
      stabile: totaleParteStabile,
      variabile: totaleParteVariabile,
      totaleFondo
    },
    alerts
  });

  // Integrazione controlli di conformità
  const checks = runAllComplianceChecks(preliminaryResult, fundData, normativeData);
  
  // Utilizziamo buildCalculationResult per produrre l'output finale con i checks
  return buildCalculationResult({
    ...preliminaryResult,
    compliance: {
      ...preliminaryResult.compliance,
      checks
    }
  });
};