import { AnnualSnapshotStatus } from '../../domain/snapshot';
import { getFadFieldDefinitions } from '../fundFieldDefinitions';
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
import { checkedMonetaryCalculation } from '../../utils/financialMath';
import { validateMonetaryData, validateMonetaryOutputTree } from '../../domain/monetaryBoundary';
import { monetaryInvalidResult } from './monetaryInvalidResult';
import { formatCurrency } from '../../utils/formatters';

import {
  buildFadLedgerInputSections,
  calculateArt23c2Adjustment,
  calculateEqSubFund,
  calculateSegretarioSubFund,
  calculateDirigenzaSubFund,
  calculateUtilizationSections,
  resolveDL25IncrementValue
} from './fundCalculations';

import { calculateAllReductions } from './reductionCalculations';


import { runAllComplianceChecks } from '../verification/complianceChecks';
import { buildCalculationResult } from './calculationResultFactory';
import { calculateCcnl2024Increases } from '../ccnl2024Calculations';
import { calculateHistoricalLimit2016Core } from '../shared/historicalLimit2016Core';
import { resolveArt33AnnualDataPolicy } from '../shared/art33ApplicationPolicy';
import { calculateArt23Fte } from '../shared/art23Fte';
import { buildCanonicalFundLedger } from './canonicalFundLedger';
import { projectCanonicalFadSections } from '../../domain/canonicalFadProjection';
import { resolveAnnualPnrrFaculty } from '../shared/pnrrFaculty';
import { resolveDl25Regime, resolveDl25AvailableIncrement } from '../shared/dl25Regime';
import { resolveDl25TotalCeiling, resolveAnnualDl25 } from '../shared/dl25CarryForward';
import type { AnnualData } from '../../domain/types';
import { resolveDirigenzaArt23Subject, reconcileDirigenzaArt23Cache } from './dirigenzaArt23';

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
const calculateSimulazioneCore = (
  currentInputs?: SimulatoreIncrementoInput,
  numAbitanti?: number,
  tipoEnte?: TipologiaEnte,
  annualData?: Partial<AnnualData>
): SimulatoreIncrementoRisultati | undefined => {
  if (!currentInputs) return undefined;

  const base = annualData?.dl25 ?? {
    stipendiTabellari2023NonDirigenti: currentInputs.simStipendiTabellari2023,
    fondoStabile2025Certificato: currentInputs.simFondoStabileAnnoApplicazione,
    budgetEq2025: currentInputs.simRisorsePOEQAnnoApplicazione,
  };
  const ceiling = resolveDl25TotalCeiling(base);
  const spesa = currentInputs.simSpesaPersonaleConsuntivo2023;
  const media = currentInputs.simMediaEntrateCorrenti2021_2023;
  const percOneri = currentInputs.simPercentualeOneriIncremento;
  if (ceiling === undefined || spesa === undefined || media === undefined || percOneri === undefined || numAbitanti === undefined || tipoEnte === undefined) return { state: 'UNDETERMINED' };
  if (![spesa, media, numAbitanti, currentInputs.simCostoAnnuoNuoveAssunzioniPIAO ?? 0, currentInputs.simTettoSpesaPersonaleL296_06 ?? 0].every(n => Number.isFinite(n) && n >= 0)) return { state: 'INVALID' };
  const carry = annualData?.dl25 ? resolveAnnualDl25({ annualData: annualData as AnnualData }) : undefined;
  const margin48 = carry ? carry.remainingCapacity : ceiling;
  const fase1_obiettivo48 = FinancialMath.multiplyExact(base.stipendiTabellari2023NonDirigenti!, 0.48);
  const fase1_fondoAttualeComplessivo = FinancialMath.sumAll(base.fondoStabile2025Certificato, base.budgetEq2025, base.altreRisorse2025DaSottrarre);
  const fase1_incrementoPotenzialeLordo = margin48;
  const fase2_spesaPersonaleAttualePrevista = FinancialMath.addExact(spesa, currentInputs.simCostoAnnuoNuoveAssunzioniPIAO ?? 0);
  const fase2_sogliaPercentualeDM17_03_2020 = getSogliaSpesaPersonale(numAbitanti, tipoEnte);
  if (fase2_sogliaPercentualeDM17_03_2020 === 0) return { state: 'UNDETERMINED' }; // No invented Art33 financial room for unsupported tables.
  const fase2_limiteSostenibileDL34 = FinancialMath.multiplyExact(media, fase2_sogliaPercentualeDM17_03_2020 / 100);
  const fase2_spazioDisponibileDL34 = Math.max(0, FinancialMath.subtractExact(fase2_limiteSostenibileDL34, fase2_spesaPersonaleAttualePrevista));
  const fase3_margineDisponibileL296_06 = currentInputs.simTettoSpesaPersonaleL296_06 === undefined ? undefined
    : Math.max(0, FinancialMath.subtractExact(currentInputs.simTettoSpesaPersonaleL296_06, fase2_spesaPersonaleAttualePrevista));
  const scope = resolveArt33AnnualDataPolicy({ ...annualData, tipologiaEnte: annualData?.tipologiaEnte ?? tipoEnte }).action;
  const referenceYear = annualData?.annoRiferimento ?? currentInputs.referenceYear;
  const businessDate = annualData?.dl25?.regimeDate ?? currentInputs.regimeDate;
  const regime = resolveDl25Regime(referenceYear, businessDate, scope);
  const available = margin48 === undefined ? undefined : resolveDl25AvailableIncrement({ margin48Net: margin48,
    art33Gross: fase2_spazioDisponibileDL34, l296Gross: fase3_margineDisponibileL296_06, employerChargesPercent: percOneri, regime, allowDateIndifference: businessDate === undefined });
  const missingCarry = (referenceYear === undefined || referenceYear > 2025) && !annualData?.dl25;
  const pendingDecisionOnly = carry?.issues.every(issue => issue === 'DL25_CURRENT_YEAR_DECISION_MISSING');
  const state = missingCarry ? 'UNDETERMINED' : carry && carry.state !== 'VALID' && !pendingDecisionOnly ? carry.state : available?.state ?? 'UNDETERMINED';
  const fase5_incrementoNettoEffettivoFondo = state === 'VALID' ? available?.availableNet : undefined;
  const fase4_spazioUtilizzabileLordo = fase5_incrementoNettoEffettivoFondo === undefined ? undefined
    : FinancialMath.multiplyExact(fase5_incrementoNettoEffettivoFondo, FinancialMath.addExact(1, percOneri / 100));

  return {
    state, regime, dateIndifferent: available?.dateIndifferent,
    fase1_incrementoPotenzialeNetto: margin48,
    fase2_spazioDisponibileNetto: available?.art33Net,
    fase3_margineDisponibileNetto: regime === 'L296_DISAPPLIED' ? undefined : available?.l296Net,
    fase4_spazioUtilizzabileNetto: fase5_incrementoNettoEffettivoFondo,
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
const calculateFundCompletelyCore = (input: NormalizedInput, normativeData: NormativeData): CalculationResult => {
  const {
    historicalData,
    annualData,
    fondi,
    distribuzione,
    calculatedInputs
  } = input;

  const { riferimenti_normativi } = normativeData;

  // 1. Calcoli Infrastrutturali
  const calculatedFteAnnoRif = calculatedInputs.dipendentiEquivalentiAnnoRif;
  const isEnteInCondizioniSpeciali = !!annualData.isEnteDissestato || !!annualData.isEnteStrutturalmenteDeficitario || !!annualData.isEnteRiequilibrioFinanziario;

  // Only a known OPEN snapshot uses the former page-entry derivations.
  // CLOSED and unqualified historical contexts keep their adopted raw inputs.
  const effectiveFad = { ...fondi.dipendente };
  if (input.snapshotStatus === AnnualSnapshotStatus.OPEN) {
    const eqReduction = fondi.eq?.ris_incrementoConRiduzioneFondoDipendenti ?? 0;
    const projectedReductions = {
      st_riduzionePerIncrementoEQ: annualData.hasDirigenza === true ? 0 : eqReduction,
      st_art67c1_decurtazionePO_AP_EntiDirigenza: annualData.hasDirigenza === true ? eqReduction : 0,
      st_riduzioneFondoStraordinario: annualData.riduzioneFondoParteStabile
        ? (annualData.incrementoFondoStraordinario ?? 0) : 0,
    };
    const definitions = getFadFieldDefinitions(normativeData);
    for (const key of Object.keys(projectedReductions) as (keyof typeof projectedReductions)[]) {
      // Match the existing per-voice applicability rule, never a blanket exemption.
      // B1 does not flag these three reductions as disabled under special conditions.
      const disabled = isEnteInCondizioniSpeciali && definitions.some(
        field => field.key === key && field.isDisabledByCondizioniSpeciali);
      effectiveFad[key] = disabled ? 0 : projectedReductions[key];
    }
  }
  const reductions = calculateAllReductions({ ...input, fondi: { ...fondi, dipendente: effectiveFad } });

  // 2. Limiti e Art. 23 c. 2
  // Missing historical overtime never borrows an amount from the current year.
  const mancaStraordinario2016 = historicalData.fondoStraordinario2016 == null;
  const historicalCoreResult = calculateHistoricalLimit2016Core({
    certificato: historicalData.manualPersonalFundLimit2016,
    fondoDipendenti: historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016,
    fondoEqPo: historicalData.fondoElevateQualificazioni2016,
    fondoDirigenza: historicalData.fondoDirigenza2016,
    risorseSegretario: historicalData.risorseSegretarioComunale2016,
    fondoStraordinario: historicalData.fondoStraordinario2016
  });

  const fondoBase2016 = historicalCoreResult.limite2016Base;

  const art33Policy = resolveArt33AnnualDataPolicy(annualData);


  // FTE Safety Gate: verifica l'integrità dei dati analitici se sono la sorgente effettiva
  const isArt23FteManualMode =
    calculatedInputs.isArt23FteManualMode ??
    !!calculatedInputs.isManualMode;

  if (
    (!isArt23FteManualMode || annualData.manualDipendentiEquivalenti2018 === undefined) &&
    annualData.personale2018PerArt23 &&
    annualData.personale2018PerArt23.length > 0
  ) {
    const fte2018Result = calculateArt23Fte(annualData.personale2018PerArt23, 'REFERENCE_2018');
    if (fte2018Result.issues.length > 0) {
      throw new Error("Calcolo bloccato: i dati FTE Art. 23 contengono valori non validi di part-time o cedolini.");
    }
  }

  if (
    (!isArt23FteManualMode || calculatedInputs.manualDipendentiEquivalentiAnnoRif === undefined) &&
    annualData.personaleAnnoRifPerArt23 &&
    annualData.personaleAnnoRifPerArt23.length > 0
  ) {
    const fteCurrResult = calculateArt23Fte(annualData.personaleAnnoRifPerArt23, 'CURRENT_YEAR');
    if (fteCurrResult.issues.length > 0) {
      throw new Error("Calcolo bloccato: i dati FTE Art. 23 contengono valori non validi di part-time o cedolini.");
    }
  }

  let art23Adjustment: {
    component?: any;
    importo: number;
    status: 'VALID' | 'UNDETERMINED';
    missingPrerequisites: string[];
  };

  if (art33Policy.action === 'BLOCK') {
    art23Adjustment = { importo: 0, status: 'UNDETERMINED', missingPrerequisites: ['ART33_APPLICABILITY_UNDETERMINED'] };
  } else if (art33Policy.action === 'SKIP') {
    art23Adjustment = {
      component: undefined,
      importo: 0,
      status: 'VALID',
      missingPrerequisites: [],
    };
  } else {
    // APPLY
    const annualDataForArt23 =
      !isArt23FteManualMode
        ? {
            ...annualData,
            manualDipendentiEquivalenti2018: undefined,
            manualDipendentiEquivalentiAnnoRif: undefined,
          }
        : { ...annualData,
            // Legacy global manual count is an explicit source selected by the normalizer.
            manualDipendentiEquivalentiAnnoRif: annualData.manualDipendentiEquivalentiAnnoRif ?? calculatedInputs.manualDipendentiEquivalentiAnnoRif };

    art23Adjustment = calculateArt23c2Adjustment(
      historicalData,
      annualDataForArt23,
      calculatedFteAnnoRif,
      isArt23FteManualMode,
      riferimenti_normativi
    );
  }

  // 3. Atomic normalization only: no parallel FAD aggregate calculation.
  const pnrrFaculty = resolveAnnualPnrrFaculty(annualData, fondi.dipendente?.vn_dl13_art8c3_incrementoPNRR_max5stabile2016);
  const fadLedgerInputSections = buildFadLedgerInputSections(
    { ...effectiveFad, vn_dl13_art8c3_incrementoPNRR_max5stabile2016: pnrrFaculty.contribution },
    annualData.simulatoreRisultati,
    isEnteInCondizioniSpeciali,
    fondi.eq?.ris_incrementoConRiduzioneFondoDipendenti,
    normativeData,
    reductions,
    annualData.ccnl2024,
    !!annualData.hasDirigenza,
    annualData.tipologiaEnte
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

  // Unknown annual applicability must not silently become 'no Dirigenza'.
  const dirigenzaArt23 = resolveDirigenzaArt23Subject(fondi.dirigenza, annualData.hasDirigenza);
  const dirigenzaReconciliation = reconcileDirigenzaArt23Cache(dirigenzaArt23, fondi.dirigenza?.lim_totaleParzialeRisorseConfrontoTetto2016);
  const fadCanonicalFund = buildCanonicalFundLedger({
    eqCurrent022Amount: fondi.eq?.va_incremento022_ms2021_eq,
    year: Number(annualData.annoRiferimento),
    annualData,
    fadData: fondi.dipendente || {},
    sections: fadLedgerInputSections,
    wizardTransferSnapshot: input.wizardTransferSnapshot,
    overtimeArt23Amount: straordinarioCorrenteSoggettoArt23,
    externalMissingPrerequisites: art23Adjustment.missingPrerequisites,
  });
  // Preserve every FAD entry and economic total. Its existing prerequisite envelope also
  // gates whole-entity Art23 readiness; no Dirigenza resource is inserted into the FAD ledger.
  const canonicalFund = dirigenzaArt23.status === 'VALID' ? fadCanonicalFund : {
    ...fadCanonicalFund,
    status: fadCanonicalFund.status === 'INVALID' || dirigenzaArt23.status === 'INVALID' ? 'INVALID' as const : 'UNDETERMINED' as const,
    missingPrerequisites: [...fadCanonicalFund.missingPrerequisites, ...dirigenzaArt23.issues],
  };

  // Art. 60: una sola entry economica; l'eventuale computo figurativo è una entry di limite senza effetto economico.
  const valoreArt60VoceFondo = Math.abs(fondi.dipendente?.st_art60c2_CCNL2026_decurtazioneIndennitaComparto || 0);
  let valoreArt60Contrattuale = 0;
  if (annualData.ccnl2024) {
    const ccnlResults = calculateCcnl2024Increases(annualData.ccnl2024);
    valoreArt60Contrattuale = Math.abs(ccnlResults.riduzioneConglobamento || 0);
  }

  let valoreArt60Effettivo = Math.abs(canonicalFund.entries.find(entry => entry.id === 'ART60_CONSOLIDATION')?.amount ?? 0);
  let showWarningDisallineamento = false;

  if (valoreArt60VoceFondo > 0 && valoreArt60Contrattuale > 0 && Math.abs(valoreArt60VoceFondo - valoreArt60Contrattuale) > 0.01) {
    showWarningDisallineamento = true;
  }

  const totaleStabileDip = canonicalFund.verifiedStableTotal;
  const totaleVariabileDip = canonicalFund.verifiedVariableTotal;

  const dipendente: FundResult = {
    label: "Fondo Personale Dipendente",
    constitution: { sections: projectCanonicalFadSections(canonicalFund).sections },
    utilization: { sections: calculateUtilizationSections(distribuzione, normativeData) },
    summary: {
      totaleStabile: totaleStabileDip,
      totaleVariabile: totaleVariabileDip,
      totaleFondo: canonicalFund.verifiedTotal
    }
  };

  // Gli importi CCNL trasferiti sono già campi economici: nessun secondo ricalcolo helper.
  const eqRaw = calculateEqSubFund(fondi.eq || {}, 0, 0);
  // EQ is distinct from FAD. Only the qualified recovery projection is added once.
  const recoveryEq = FinancialMath.sumAll(...canonicalFund.entries.filter(e => e.source === 'RECOVERY')
    .map(e => e.provenance as import('../../domain/ccnlRecovery').ResolvedCcnlRecovery)
    .filter(r => r.status === 'VALID' && r.route !== 'BOUND_RESIDUAL_CARRY' && !r.instruction.eqPerformanceClauseSource?.trim())
    .map(r => r.recoveryEqAmount ?? 0));
  const eq: FundResult = {
    label: "Risorse Elevate Qualificazioni",
    summary: {
      totaleStabile: eqRaw.stabile,
      totaleVariabile: FinancialMath.sumAll(eqRaw.variabile, recoveryEq),
      totaleFondo: FinancialMath.sumAll(eqRaw.totale, recoveryEq)
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

  // Never feed malformed Dirigenza resource values into legacy arithmetic. An invalid
  // result remains explicitly blocking; these summary zeros are not verified economics.
  const dirRaw = calculateDirigenzaSubFund(dirigenzaArt23.status === 'INVALID' ? {} : fondi.dirigenza || {}, !!annualData.hasDirigenza);
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

  // La cache cl_totaleParziale... è solo riconciliazione: il consumo deriva dalle entries.
  const fad_soggette_lordo = canonicalFund.verifiedArt23Subject;

  // Dirigenza corrente rilevante
  const dirigenzaCorrenteRilevante = dirigenzaArt23.subjectAmount ?? 0;

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
  const limiteStorico2016 = fondoBase2016;
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

  const limiteAttualizzato = limiteStorico2016Neutralizzato + art23Adjustment.importo;

  let segretarioCorrenteRilevanteEffettivo = segretarioCorrenteRilevanteOrdinario;
  let segretarioQuotaEsclusaDL19 = 0;

  if (isPiccoloComune && (segretarioDerogaMode === 'dl19_2026_solo_corrente' || segretarioDerogaMode === 'dl19_2026_doppia_neutralizzazione')) {
    segretarioQuotaEsclusaDL19 = segretarioCorrenteEsclusoDL19_2026;
    segretarioCorrenteRilevanteEffettivo = Math.max(0, FinancialMath.subtractExact(segretarioCorrenteRilevanteOrdinario, segretarioQuotaEsclusaDL19));
  }

  const checkWarnings: string[] = [];
  if (art33Policy.action === 'SKIP') {
    if (art33Policy.applicability.status === 'NOT_DIRECTLY_APPLICABLE') {
      checkWarnings.push("Adeguamento Art. 33 non applicato perché l'ente non rientra nell'ambito di applicazione diretta individuato.");
    } else if (annualData.art33ManualDecision === 'DO_NOT_APPLY') {
      checkWarnings.push("Adeguamento Art. 33 non applicato in base all'esito della verifica manuale registrata.");
    } else {
      checkWarnings.push("Adeguamento Art. 33 non applicato in base alla policy di applicabilità risolta.");
    }
  }
  if (mancaStraordinario2016) {
    checkWarnings.push("Fondo straordinario 2016 storico non inserito. Nessun importo dell'anno corrente viene usato per ricostruire il limite storico.");
  }
  if (hasDoubleNeutralizationWarning) {
    checkWarnings.push("Impossibile applicare la doppia neutralizzazione D.L. 19/2026 perché manca la quota Segretario 2016 disaggregata per le voci escluse.");
  }

  // Componenti disaggregate
  const comp_comparto = FinancialMath.roundTo2DP(
    FinancialMath.subtractExact(
      fad_soggette_lordo,
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
  const art23Missing = [...new Set([...historicalCoreResult.missingPrerequisites,
    ...art23Adjustment.missingPrerequisites, ...canonicalFund.missingPrerequisites, ...dirigenzaArt23.issues])];
  const comparisonReady = historicalCoreResult.status === 'VALID' && art23Adjustment.status === 'VALID' &&
    canonicalFund.status === 'VALID' && dirigenzaArt23.status === 'VALID';
  const art23Status = historicalCoreResult.status === 'INVALID' || canonicalFund.status === 'INVALID' || dirigenzaArt23.status === 'INVALID'
    ? 'INVALID' as const : !comparisonReady ? 'UNDETERMINED' as const : deltaArt23 > 0.01 ? 'INVALID' as const : 'VALID' as const;
  const isArt23OverLimit = comparisonReady && deltaArt23 > 0.01;
  if (!comparisonReady) checkWarnings.push('Verifica Art. 23 non determinabile: completare o qualificare i prerequisiti.');

  const eq022Quota = Number(fondi.eq?.va_incremento022_ms2021_eq || 0);
  const eq2018Quota = Number(fondi.eq?.ris_incremento022MonteSalari2018 || 0);

  const risorseEscluseArt23 = FinancialMath.roundTo2DP(
    FinancialMath.sumAll(
      canonicalFund.verifiedArt23Excluded,
      eq022Quota,
      eq2018Quota,
      dirigenzaArt23.excludedAmount ?? 0
    )
  );

  const checkErrors: string[] = [];
  if (dirigenzaArt23.status === 'INVALID') checkErrors.push(...dirigenzaArt23.issues);

  if (isArt23OverLimit) {
    checkErrors.push(`Superamento limite Art. 23 c. 2 rilevato per ${formatCurrency(deltaArt23)}`);
  }

  // Controlli bloccanti o warning su DL 25 e PNRR
  const maxIncrementoDL25 = annualData.simulatoreRisultati?.fase5_incrementoNettoEffettivoFondo ?? 0;
  const dl25Val = annualData.dl25?.currentYearDelta ?? resolveDL25IncrementValue(fondi.dipendente || {});
  if (maxIncrementoDL25 > 0 && dl25Val > maxIncrementoDL25 + 0.01) {
    checkErrors.push(`L'incremento D.L. 25/2025 effettivo (${formatCurrency(dl25Val)}) supera il limite massimo consentito di ${formatCurrency(maxIncrementoDL25)}`);
  }

  const pnrr = resolveAnnualPnrrFaculty(annualData, fondi.dipendente?.vn_dl13_art8c3_incrementoPNRR_max5stabile2016);
  if (pnrr.status === 'INVALID') checkErrors.push(pnrr.reasons.includes('PNRR_MAXIMUM_EXCEEDED')
    ? `L'incremento PNRR supera il massimo teorico utilizzabile: ${pnrr.reasons.join(', ')}`
    : `Incremento PNRR non utilizzabile: ${pnrr.reasons.join(', ')}`);

  // Quota 0.22%
  const optionalIncreaseVariableFrom2026Percentage = annualData.ccnl2024?.optionalIncreaseVariableFrom2026Percentage || 0;
  const maxOptionalPercentageLimit = Number(annualData.annoRiferimento) < 2025 ? 0 : 0.2201;
  const limitLabel = Number(annualData.annoRiferimento) < 2025 ? "0% (non applicabile)" : "0.22%";
  if (optionalIncreaseVariableFrom2026Percentage > maxOptionalPercentageLimit) {
    checkErrors.push(`L'incremento variabile opzionale dello 0.22% (${optionalIncreaseVariableFrom2026Percentage.toFixed(2)}%) supera la soglia contrattuale massima dello ${limitLabel}`);
  }
  
  const alerts: CalculationAlert[] = [];
  if (isArt23OverLimit) {
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
      denominazioneEnte: annualData.denominazioneEnte,
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
    canonicalFund,
    compliance: {
      checks: [], 
      dirigenzaArt23: { ...dirigenzaArt23, reconciliation: dirigenzaReconciliation },
      art23c2: {
        status: art23Status, comparisonReady, missingPrerequisites: art23Missing,
        limite: limiteAttualizzato,
        valoreSoggetto: risorseRilevantiArt23Effettive,
        delta: -deltaArt23,
        isCompliant: art23Status === 'VALID'
      },
      art23Compliance: {
        status: art23Status, missingPrerequisites: art23Missing,
        fondoCostituitoTotale: dipendente.summary.totaleFondo,
        risorseEscluseArt23,
        risorseRilevantiArt23: risorseRilevantiArt23Effettive,
        computoFigurativoArt60,
        limiteArt23Attualizzato: limiteAttualizzato,
        margineResiduo: comparisonReady ? -deltaArt23 : undefined,
        isSforamento: isArt23OverLimit,
        warnings: checkWarnings,
        errors: checkErrors,
        valoreArt60VoceFondo,
        valoreArt60Contrattuale,
        valoreArt60Effettivo,
        showWarningDisallineamento,
        showWarningStraordinario2016: mancaStraordinario2016,
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

/** Numeric eligibility only; the canonical ledger remains the economic authority. */
export const calculateFundCompletely = (input: NormalizedInput, normativeData: NormativeData): CalculationResult => {
  const issues = [...(input.monetaryIssues ?? []), ...validateMonetaryData({ annualData: input.annualData, historicalData: input.historicalData,
    fondoAccessorioDipendenteData: input.fondi.dipendente, fondoElevateQualificazioniData: input.fondi.eq,
    fondoSegretarioComunaleData: input.fondi.segretario, fondoDirigenzaData: input.annualData.hasDirigenza === false ? undefined : input.fondi.dirigenza,
    distribuzioneRisorseData: input.distribuzione, personaleServizio: { manualProgressioni: input.calculatedInputs.manualProgressioni,
      manualIndennita: input.calculatedInputs.manualIndennita }, wizard2026TransferSnapshot: input.wizardTransferSnapshot })];
  if (issues.length) {
    const invalid = monetaryInvalidResult(input, issues);
    if (input.monetaryIssues?.length) {
      try {
      const known = checkedMonetaryCalculation(() => calculateFundCompletelyCore(input, normativeData));
      if (known.status === 'VALID') return { ...invalid, canonicalFund: { ...known.value.canonicalFund, status: 'INVALID',
        stableTotal: null, variableTotal: null, total: null, art23Subject: null, art23Excluded: null,
        warnings: [...known.value.canonicalFund.warnings, ...invalid.canonicalFund.warnings] } };
      } catch { /* Invalid input cannot require a successful administrative calculation. */ }
    }
    return invalid;
  }
  const checked = checkedMonetaryCalculation(() => calculateFundCompletelyCore(input, normativeData));
  if (checked.status === 'INVALID') return monetaryInvalidResult(input, checked.issues);
  const outputIssues = validateMonetaryOutputTree({ fondi: checked.value.fondi, totals: checked.value.totals, art23: checked.value.compliance.art23c2 });
  return outputIssues.length ? monetaryInvalidResult(input, outputIssues) : checked.value;
};

export const calculateSimulazione = (...args: Parameters<typeof calculateSimulazioneCore>): SimulatoreIncrementoRisultati | undefined => {
  if (validateMonetaryData({ annualData: { ...args[3], simulatoreInput: args[0] } }).length) return { state: 'INVALID' };
  const checked = checkedMonetaryCalculation(() => calculateSimulazioneCore(...args));
  return checked.status === 'INVALID' ? { state: 'INVALID' } : checked.value;
};
