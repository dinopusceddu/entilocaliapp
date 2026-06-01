import {
  SimulatoreIncrementoInput,
  SimulatoreIncrementoRisultati,
  TipologiaEnte,
  CalculationResult,
  FundResult,
  CalculationAlert,
  NormativeData,
  NormalizedInput
} from '../../domain';

import FinancialMath from '../../utils/financialMath';
import { formatCurrency } from '../../utils/formatters';

import {
  calculateFadTotals,
  calculateArt23c2Adjustment,
  calculateCcnl2024Components,
  calculateEqSubFund,
  calculateSegretarioSubFund,
  calculateDirigenzaSubFund,
  calculateUtilizationSections,
  resolveDL25IncrementValue
} from './fundCalculations';

import { calculateAllReductions } from './reductionCalculations';

import {
  calculateAbsorbedProgression,
  calculateAbsorbedIndennitaComparto
} from '../personaleCalculations';

import { runAllComplianceChecks } from '../verification/complianceChecks';
import { buildCalculationResult } from './calculationResultFactory';
import { calculateCcnl2024Increases } from '../ccnl2024Calculations';

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
export const calculateFundCompletely = (input: NormalizedInput, normativeData: NormativeData): CalculationResult => {
  const {
    historicalData,
    annualData,
    fondi,
    distribuzione,
    personaleDettaglio,
    calculatedInputs
  } = input;

  const { riferimenti_normativi } = normativeData;

  // 1. Calcoli Infrastrutturali
  const progAssorbite = calculatedInputs.isManualMode && calculatedInputs.manualProgressioni !== undefined
    ? calculatedInputs.manualProgressioni
    : calculateAbsorbedProgression(personaleDettaglio || [], annualData.annoRiferimento, normativeData);

  const indCompartoAssorbita = calculatedInputs.isManualMode && calculatedInputs.manualIndennita !== undefined
    ? calculatedInputs.manualIndennita
    : calculateAbsorbedIndennitaComparto(personaleDettaglio || [], annualData.annoRiferimento, normativeData);
  const totaleRisorseAssorbitePersonale = FinancialMath.addExact(progAssorbite, indCompartoAssorbita);
  const calculatedFteAnnoRif = calculatedInputs.dipendentiEquivalentiAnnoRif;
  const isEnteInCondizioniSpeciali = !!annualData.isEnteDissestato || !!annualData.isEnteStrutturalmenteDeficitario || !!annualData.isEnteRiequilibrioFinanziario;

  // 1.1 Calcolo Decurtazioni (Sprint 3)
  const reductions = calculateAllReductions(input);

  // 2. Limiti e Art. 23 c. 2
  let usatoFallbackStraordinario2016 = false;
  const str2016 = historicalData.fondoStraordinario2016 !== undefined && historicalData.fondoStraordinario2016 !== null
    ? historicalData.fondoStraordinario2016
    : (annualData.fondoLavoroStraordinario || 0);

  if (historicalData.fondoStraordinario2016 === undefined || historicalData.fondoStraordinario2016 === null) {
    usatoFallbackStraordinario2016 = true;
  }

  const fondoBase2016_originale =
    (historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) +
    (historicalData.fondoElevateQualificazioni2016 || 0) +
    (historicalData.fondoDirigenza2016 || 0) +
    (historicalData.risorseSegretarioComunale2016 || 0) +
    str2016;

  const fondoBase2016 = historicalData.manualPersonalFundLimit2016 !== undefined
    ? historicalData.manualPersonalFundLimit2016
    : fondoBase2016_originale;

  const art23Adjustment = calculateArt23c2Adjustment(historicalData, annualData, calculatedFteAnnoRif, !!calculatedInputs.isManualMode, riferimenti_normativi);

  // 3. CCNL 2024
  const ccnl = calculateCcnl2024Components(annualData.ccnl2024);

  // 4. Totali per Fondo (FAD, EQ, Seg, Dir)
  const fadRes = calculateFadTotals(
    fondi.dipendente || {},
    annualData.simulatoreRisultati,
    isEnteInCondizioniSpeciali,
    fondi.eq?.ris_incrementoConRiduzioneFondoDipendenti,
    normativeData,
    reductions,
    annualData.ccnl2024,
    !!annualData.hasDirigenza,
    annualData.tipologiaEnte
  );
  
  // MOD-027: Calcolo decurtazione Art. 60 (Indennità Comparto) con priorità e warning
  const valoreArt60VoceFondo = Math.abs(fondi.dipendente?.st_art60c2_CCNL2026_decurtazioneIndennitaComparto || 0);
  let valoreArt60Contrattuale = 0;
  if (annualData.ccnl2024) {
    const ccnlResults = calculateCcnl2024Increases(annualData.ccnl2024);
    valoreArt60Contrattuale = Math.abs(ccnlResults.riduzioneConglobamento || 0);
  }

  let valoreArt60Effettivo = 0;
  let showWarningDisallineamento = false;

  if (valoreArt60VoceFondo > 0 && valoreArt60Contrattuale === 0) {
    valoreArt60Effettivo = valoreArt60VoceFondo;
  } else if (valoreArt60VoceFondo === 0 && valoreArt60Contrattuale > 0) {
    valoreArt60Effettivo = valoreArt60Contrattuale;
  } else if (valoreArt60VoceFondo > 0 && valoreArt60Contrattuale > 0) {
    valoreArt60Effettivo = valoreArt60VoceFondo;
    if (Math.abs(valoreArt60VoceFondo - valoreArt60Contrattuale) > 0.01) {
      showWarningDisallineamento = true;
    }
  }

  const totaleStabileDip = FinancialMath.subtractExact(
    FinancialMath.addExact(fadRes.totaleStabile_Dipendenti, ccnl.ccnl2024_fad_stabile),
    valoreArt60Effettivo
  );
  const totaleVariabileDip = FinancialMath.roundTo2DP(FinancialMath.sumAll(fadRes.sommaVariabiliSoggette_Dipendenti, fadRes.sommaVariabiliNonSoggette_Dipendenti, -fadRes.altreRisorseDecurtazioniFinali_Dipendenti, -fadRes.decurtazioniLimiteSalarioAccessorio_Dipendenti, ccnl.ccnl2024_fad_variabile));

  const dipendente: FundResult = {
    label: "Fondo Personale Dipendente",
    constitution: { sections: fadRes.sections },
    utilization: { sections: calculateUtilizationSections(distribuzione, normativeData) },
    summary: {
      totaleStabile: totaleStabileDip,
      totaleVariabile: totaleVariabileDip,
      totaleFondo: FinancialMath.sumAll(totaleStabileDip, totaleVariabileDip)
    }
  };

  const eqRaw = calculateEqSubFund(fondi.eq || {}, ccnl.ccnl2024_eq_stabile, ccnl.ccnl2024_eq_variabile);
  const eq: FundResult = {
    label: "Risorse Elevate Qualificazioni",
    summary: {
      totaleStabile: eqRaw.stabile,
      totaleVariabile: eqRaw.variabile,
      totaleFondo: eqRaw.totale
    }
  };

  const segRaw = calculateSegretarioSubFund(fondi.segretario || {});
  const segretario: FundResult = {
    label: "Risorse Segretario Comunale",
    summary: {
      totaleStabile: segRaw.stabile,
      totaleVariabile: segRaw.variabile,
      totaleFondo: segRaw.totale
    }
  };

  const dirRaw = calculateDirigenzaSubFund(fondi.dirigenza || {}, !!annualData.hasDirigenza);
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

  const eq_soggette = FinancialMath.sumAll(
    Number(fondi.eq?.ris_fondoPO2017 || 0),
    Number(fondi.eq?.ris_incrementoConRiduzioneFondoDipendenti || 0),
    Number(fondi.eq?.ris_incrementoLimiteArt23c2_DL34 || 0)
  );

  let straordinarioCorrenteSoggettoArt23 = Number(annualData.fondoLavoroStraordinario || 0);
  const incrementoStr = Number(annualData.incrementoFondoStraordinario || 0);

  let straordinarioRappresentaGiaTotale = false;
  if (incrementoStr > 0 && historicalData.fondoStraordinario2016 !== undefined && historicalData.fondoStraordinario2016 !== null) {
    const baseStorico = historicalData.fondoStraordinario2016;
    if (straordinarioCorrenteSoggettoArt23 >= baseStorico + incrementoStr - 0.01) {
      straordinarioRappresentaGiaTotale = true;
    }
  }

  if (!straordinarioRappresentaGiaTotale && incrementoStr > 0) {
    straordinarioCorrenteSoggettoArt23 = FinancialMath.addExact(straordinarioCorrenteSoggettoArt23, incrementoStr);
  }

  const fad_soggette_lordo = fondi.dipendente?.cl_totaleParzialeRisorsePerConfrontoTetto2016 !== undefined 
    ? fondi.dipendente.cl_totaleParzialeRisorsePerConfrontoTetto2016
    : FinancialMath.sumAll(
        fadRes.sommaStabiliSoggetteLimite, 
        fadRes.sommaVariabiliSoggette_Dipendenti,
        straordinarioCorrenteSoggettoArt23
      );

  // Dirigenza corrente rilevante
  const dirigenzaCorrenteRilevante = annualData.hasDirigenza ? (fondi.dirigenza?.lim_totaleParzialeRisorseConfrontoTetto2016 || 0) : 0;

  // Segretario corrente rilevante ordinario e deroga D.L. 19/2026
  const itemsRilevantiPerLimiteSeg = [
    'st_art3c6_CCNL2011_retribuzionePosizione',
    'st_art60c1_CCNL2024_retribuzionePosizioneClassi',
    'st_art60c3_CCNL2024_maggiorazioneComplessita',
    'st_art60c5_CCNL2024_allineamentoDirigEQ',
    'va_art61c2_CCNL2024_retribuzioneRisultato10',
    'va_art61c2bis_CCNL2024_retribuzioneRisultato15',
    'va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane'
  ];
  const percentCoperturaSeg = (fondi.segretario?.fin_percentualeCoperturaPostoSegretario === undefined ? 100 : fondi.segretario.fin_percentualeCoperturaPostoSegretario) / 100;
  const baseSegRilevanteOrdinario = itemsRilevantiPerLimiteSeg.reduce((sum, key) => {
    return sum + (Number((fondi.segretario as any)?.[key]) || 0);
  }, 0);
  const segretarioCorrenteRilevanteOrdinario = FinancialMath.multiplyExact(baseSegRilevanteOrdinario, percentCoperturaSeg);

  const baseSegEsclusoDL19 = 
    (Number(fondi.segretario?.st_art3c6_CCNL2011_retribuzionePosizione || 0) +
     Number(fondi.segretario?.st_art60c1_CCNL2024_retribuzionePosizioneClassi || 0) +
     Number(fondi.segretario?.va_art61c2_CCNL2024_retribuzioneRisultato10 || 0));
  const segretarioCorrenteEsclusoDL19_2026 = FinancialMath.multiplyExact(baseSegEsclusoDL19, percentCoperturaSeg);

  const isPiccoloComune = annualData.tipologiaEnte === TipologiaEnte.COMUNE && annualData.numeroAbitanti !== undefined && annualData.numeroAbitanti <= 3000;
  let segretarioDerogaMode = fondi.segretario?.segretarioDerogaMode || 'ordinario';

  // Doppia neutralizzazione e warning
  let limiteStorico2016 = fondoBase2016;
  let limiteStorico2016Neutralizzato = fondoBase2016;
  let hasDoubleNeutralizationWarning = false;

  if (isPiccoloComune && segretarioDerogaMode === 'dl19_2026_doppia_neutralizzazione') {
    const quotaNeutralizzabile = fondi.segretario?.quotaSegretario2016Neutralizzabile;
    if (quotaNeutralizzabile !== undefined && quotaNeutralizzabile !== null && quotaNeutralizzabile > 0) {
      limiteStorico2016Neutralizzato = FinancialMath.subtractExact(fondoBase2016, quotaNeutralizzabile);
    } else {
      hasDoubleNeutralizationWarning = true;
      segretarioDerogaMode = 'dl19_2026_solo_corrente';
    }
  }

  let limiteAttualizzato = limiteStorico2016Neutralizzato + art23Adjustment.importo;

  let segretarioCorrenteRilevanteEffettivo = segretarioCorrenteRilevanteOrdinario;
  let segretarioQuotaEsclusaDL19 = 0;

  if (isPiccoloComune && (segretarioDerogaMode === 'dl19_2026_solo_corrente' || segretarioDerogaMode === 'dl19_2026_doppia_neutralizzazione')) {
    segretarioQuotaEsclusaDL19 = segretarioCorrenteEsclusoDL19_2026;
    segretarioCorrenteRilevanteEffettivo = Math.max(0, FinancialMath.subtractExact(segretarioCorrenteRilevanteOrdinario, segretarioQuotaEsclusaDL19));
  }

  const checkWarnings: string[] = [];
  if (usatoFallbackStraordinario2016) {
    checkWarnings.push("Fondo straordinario 2016 storico non inserito. Utilizzato come fallback transitorio il fondo straordinario dell'anno corrente.");
  }
  if (hasDoubleNeutralizationWarning) {
    checkWarnings.push("Impossibile applicare la doppia neutralizzazione D.L. 19/2026 perché manca la quota Segretario 2016 disaggregata per le voci escluse.");
  }

  // Componenti disaggregate
  const comp_comparto = FinancialMath.roundTo2DP(
    FinancialMath.subtractExact(
      FinancialMath.addExact(fad_soggette_lordo, totaleRisorseAssorbitePersonale),
      straordinarioCorrenteSoggettoArt23
    )
  );
  const comp_eq = eq_soggette;
  const comp_segretario = segretarioCorrenteRilevanteEffettivo;
  const comp_dirigenza = dirigenzaCorrenteRilevante;
  const comp_straordinario = straordinarioCorrenteSoggettoArt23;

  const ammontareCorrenteArt23Val = FinancialMath.roundTo2DP(
    FinancialMath.sumAll(
      comp_comparto,
      comp_eq,
      comp_segretario,
      comp_dirigenza,
      comp_straordinario
    )
  );

  const ammontareSoggettoLimite2016 = FinancialMath.roundTo2DP(
    FinancialMath.subtractExact(
      ammontareCorrenteArt23Val,
      valoreArt60Effettivo
    )
  );

  const computoFigurativoArt60 = valoreArt60Effettivo;
  const risorseRilevantiArt23Effettive = FinancialMath.roundTo2DP(
    FinancialMath.addExact(ammontareSoggettoLimite2016, computoFigurativoArt60)
  );
  
  const deltaArt23 = risorseRilevantiArt23Effettive - limiteAttualizzato;

  // Calcolo Risorse Escluse Art. 23 (FAD stabili in deroga + variabili non soggette)
  const stableEscluseKeys = new Set([
    'st_art79c1_art67c2a_incr8320',
    'st_art79c1_art67c2b_incrStipendialiDiff',
    'st_art79c1b_euro8450',
    'st_art79c1d_differenzialiStipendiali2022',
    'st_art79c1bis_diffStipendialiB3D3',
    'st_art58c1_CCNL2026_incremento014_MS2021',
    'st_incrementoDL25_2025',
    'st_incrementoDecretoPA'
  ]);
  let sumStabiliEscluse = 0;
  if (fadRes.sections.stabili?.items) {
    for (const item of fadRes.sections.stabili.items) {
      if (stableEscluseKeys.has(item.key)) {
        sumStabiliEscluse = FinancialMath.addExact(sumStabiliEscluse, item.amount || 0);
      }
    }
  }

  const eq022Quota = Number(fondi.eq?.va_incremento022_ms2021_eq || 0);
  const eq2018Quota = Number(fondi.eq?.ris_incremento022MonteSalari2018 || 0);

  const risorseEscluseArt23 = FinancialMath.roundTo2DP(
    FinancialMath.sumAll(
      sumStabiliEscluse, 
      fadRes.sommaVariabiliNonSoggette_Dipendenti, 
      ccnl.ccnl2024_fad_variabile,
      eq022Quota,
      eq2018Quota
    )
  );

  const checkErrors: string[] = [];

  if (deltaArt23 > 0.01) {
    checkErrors.push(`Superamento limite Art. 23 c. 2 rilevato per ${formatCurrency(deltaArt23)}`);
  }

  // Controlli bloccanti o warning su DL 25 e PNRR
  const maxIncrementoDL25 = annualData.simulatoreRisultati?.fase5_incrementoNettoEffettivoFondo ?? 0;
  const dl25Val = resolveDL25IncrementValue(fondi.dipendente || {});
  if (maxIncrementoDL25 > 0 && dl25Val > maxIncrementoDL25 + 0.01) {
    checkErrors.push(`L'incremento D.L. 25/2025 effettivo (${formatCurrency(dl25Val)}) supera il limite massimo consentito di ${formatCurrency(maxIncrementoDL25)}`);
  }

  const maxPnrr = annualData.calcolatoIncrementoPNRR3 ?? 0;
  const pnrrVal = fondi.dipendente?.vn_dl13_art8c3_incrementoPNRR_max5stabile2016 ?? 0;
  if (maxPnrr > 0 && pnrrVal > maxPnrr + 0.01) {
    checkErrors.push(`L'incremento PNRR effettivo (${formatCurrency(pnrrVal)}) supera il limite massimo consentito di ${formatCurrency(maxPnrr)}`);
  }

  // Quota 0.22%
  const optionalIncreaseVariableFrom2026Percentage = annualData.ccnl2024?.optionalIncreaseVariableFrom2026Percentage || 0;
  const isYear2026 = Number(annualData.annoRiferimento) === 2026;
  const maxOptionalPercentageLimit = isYear2026 ? 0.4401 : 0.2201;
  const limitLabel = isYear2026 ? "0.44% (x2)" : "0.22%";
  if (optionalIncreaseVariableFrom2026Percentage > maxOptionalPercentageLimit) {
    checkErrors.push(`L'incremento variabile opzionale dello 0.22% (${optionalIncreaseVariableFrom2026Percentage.toFixed(2)}%) supera la soglia contrattuale massima dello ${limitLabel}`);
  }
  
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
        limite: limiteAttualizzato,
        valoreSoggetto: risorseRilevantiArt23Effettive,
        delta: -deltaArt23,
        isCompliant: deltaArt23 <= 0.01
      },
      art23Compliance: {
        fondoCostituitoTotale: dipendente.summary.totaleFondo,
        risorseEscluseArt23,
        risorseRilevantiArt23: risorseRilevantiArt23Effettive,
        computoFigurativoArt60,
        limiteArt23Attualizzato: limiteAttualizzato,
        margineResiduo: -deltaArt23,
        isSforamento: deltaArt23 > 0.01,
        warnings: checkWarnings,
        errors: checkErrors,
        valoreArt60VoceFondo,
        valoreArt60Contrattuale,
        valoreArt60Effettivo,
        showWarningDisallineamento,
        showWarningStraordinario2016: usatoFallbackStraordinario2016,
        art23ComplessivoEnte: true,
        art23Componenti: {
          comparto: comp_comparto,
          eq: comp_eq,
          segretario: comp_segretario,
          segretarioQuotaOrdinaria: segretarioCorrenteRilevanteOrdinario,
          segretarioQuotaEsclusaDL19_2026: segretarioQuotaEsclusaDL19,
          segretarioDerogaMode,
          dirigenza: comp_dirigenza,
          straordinario: comp_straordinario,
          altreVoci: 0
        },
        limiteStorico2016,
        limiteStorico2016Neutralizzato
      }
    },
    reductions,
    totals: {
      stabile: totaleParteStabile,
      variabile: totaleParteVariabile,
      totaleFondo
    },
    simulatore: annualData.simulatoreRisultati,
    alerts
  });

  // Integrazione controlli di conformità
  const checks = runAllComplianceChecks(preliminaryResult, input, normativeData);
  
  // Utilizziamo buildCalculationResult per produrre l'output finale con i checks
  return buildCalculationResult({
    ...preliminaryResult,
    compliance: {
      ...preliminaryResult.compliance,
      checks
    }
  });
};