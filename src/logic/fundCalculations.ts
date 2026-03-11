// src/logic/fundCalculations.ts
import {
  SimulatoreIncrementoRisultati,
  FondoAccessorioDipendenteData,
  FundData,
  CalculatedFund,
  FundComponent,
  FondoElevateQualificazioniData,
  FondoSegretarioComunaleData,
  FondoDirigenzaData,
  NormativeData,
  FundStructureConfig
} from '../types';
import { getFadFieldDefinitions } from '../pages/FondoAccessorioDipendentePageHelpers';
import { calculateCcnl2024Increases } from './ccnl2024Calculations';
import FinancialMath from '../utils/financialMath';
import strutturaFondoRaw from '../../public/strutturaFondo.json';

const strutturaFondo: FundStructureConfig = strutturaFondoRaw as any;

/**
 * Calcola il valore effettivo di una voce del fondo, tenendo conto di condizioni speciali dell'ente e dei risultati del simulatore.
 * @param {keyof FondoAccessorioDipendenteData} key - La chiave della voce di fondo.
 * @param {number | undefined} originalValue - Il valore inserito dall'utente.
 * @param {boolean | undefined} isDisabledBySourceDefinition - Se la voce è disabilitata da definizione.
 * @param {boolean | undefined} isEnteInCondizioniSpecialiGlobal - Se l'ente è in condizioni finanziarie speciali.
 * @param {SimulatoreIncrementoRisultati} simulatoreRisultati - I risultati del simulatore di incremento.
 * @param {number | undefined} incrementoEQconRiduzioneDipendenti - L'importo di incremento EQ che riduce il fondo dipendenti.
 * @returns {number} Il valore effettivo della voce.
 */
export const getFadEffectiveValueHelper = (
  key: keyof FondoAccessorioDipendenteData,
  originalValue: number | undefined,
  isDisabledBySourceDefinition: boolean | undefined,
  isEnteInCondizioniSpecialiGlobal: boolean | undefined,
  simulatoreRisultati?: SimulatoreIncrementoRisultati,
  incrementoEQconRiduzioneDipendenti?: number
): number => {
  if (isDisabledBySourceDefinition && isEnteInCondizioniSpecialiGlobal) {
    return 0;
  }
  if (key === 'st_incrementoDecretoPA') {
    const maxIncremento = simulatoreRisultati?.fase5_incrementoNettoEffettivoFondo ?? 0;
    return maxIncremento > 0 ? (originalValue || 0) : 0;
  }
  if (key === 'st_riduzionePerIncrementoEQ') {
    return incrementoEQconRiduzioneDipendenti || 0;
  }
  return originalValue || 0;
};



/**
 * Calcola i totali per il Fondo Accessorio Dipendente (FAD).
 * @param {Partial<FondoAccessorioDipendenteData>} fadData - I dati di input per il FAD.
 * @param {SimulatoreIncrementoRisultati | undefined} simulatoreRisultati - Risultati del simulatore.
 * @param {boolean} isEnteInCondizioniSpeciali - Se l'ente è in condizioni speciali.
 * @param {number | undefined} incrementoEQconRiduzioneDipendenti - Incremento EQ con riduzione FAD.
 * @param {NormativeData} normativeData - Dati normativi.
 * @returns {object} Un oggetto contenente i totali calcolati per il FAD.
 */
export const calculateFadTotals = (
  fadData: Partial<FondoAccessorioDipendenteData>,
  simulatoreRisultati: SimulatoreIncrementoRisultati | undefined,
  isEnteInCondizioniSpeciali: boolean,
  incrementoEQconRiduzioneDipendenti: number | undefined,
  normativeData: NormativeData
) => {
  const fadFieldDefinitions = getFadFieldDefinitions(normativeData);

  const getValue = (key: keyof FondoAccessorioDipendenteData) => {
    const definition = fadFieldDefinitions.find(def => def.key === key);
    return getFadEffectiveValueHelper(
      key,
      fadData[key],
      definition?.isDisabledByCondizioniSpeciali,
      isEnteInCondizioniSpeciali,
      simulatoreRisultati,
      incrementoEQconRiduzioneDipendenti
    );
  };

  let parzialeStabiliPositivi = 0;
  let parzialeStabiliNegativi = 0;
  let sommaVariabiliSoggette_Dipendenti = 0;
  let sommaVariabiliNonSoggette_Dipendenti = 0;
  let altreRisorseDecurtazioniFinali_Dipendenti = 0;
  let decurtazioniLimiteSalarioAccessorio_Dipendenti = 0;
  let sommaStabiliSoggetteLimite = 0;

  for (const [key, config] of Object.entries(strutturaFondo)) {
    const value = getValue(key as keyof FondoAccessorioDipendenteData) || 0;
    
    // Total amounts iteration calculation
    if (config.section === 'stabili') {
      if (config.operator === '+') parzialeStabiliPositivi = FinancialMath.addExact(parzialeStabiliPositivi, value);
      else parzialeStabiliNegativi = FinancialMath.addExact(parzialeStabiliNegativi, value);
    } else if (config.section === 'vs_soggette') {
      if (config.operator === '+') sommaVariabiliSoggette_Dipendenti = FinancialMath.addExact(sommaVariabiliSoggette_Dipendenti, value);
      else sommaVariabiliSoggette_Dipendenti = FinancialMath.subtractExact(sommaVariabiliSoggette_Dipendenti, value);
    } else if (config.section === 'vn_non_soggette') {
      if (config.operator === '+') sommaVariabiliNonSoggette_Dipendenti = FinancialMath.addExact(sommaVariabiliNonSoggette_Dipendenti, value);
      else sommaVariabiliNonSoggette_Dipendenti = FinancialMath.subtractExact(sommaVariabiliNonSoggette_Dipendenti, value);
    } else if (config.section === 'fin_decurtazioni') {
      if (config.operator === '+') altreRisorseDecurtazioniFinali_Dipendenti = FinancialMath.addExact(altreRisorseDecurtazioniFinali_Dipendenti, value);
      else altreRisorseDecurtazioniFinali_Dipendenti = FinancialMath.addExact(altreRisorseDecurtazioniFinali_Dipendenti, value);
    } else if (config.section === 'cl_limiti') {
      if (config.operator === '+') decurtazioniLimiteSalarioAccessorio_Dipendenti = FinancialMath.addExact(decurtazioniLimiteSalarioAccessorio_Dipendenti, value);
      else decurtazioniLimiteSalarioAccessorio_Dipendenti = FinancialMath.addExact(decurtazioniLimiteSalarioAccessorio_Dipendenti, value);
    }

    // Special limits condition block isolated
    if (config.section === 'stabili' && config.isRelevantToArt23Limit) {
      if (key !== 'st_art60c2_CCNL2026_decurtazioneIndennitaComparto') {
        if (config.operator === '+') sommaStabiliSoggetteLimite = FinancialMath.addExact(sommaStabiliSoggetteLimite, value);
        else sommaStabiliSoggetteLimite = FinancialMath.subtractExact(sommaStabiliSoggetteLimite, value);
      }
    }
  }

  const sommaStabili_Dipendenti = FinancialMath.roundTo2DP(FinancialMath.subtractExact(parzialeStabiliPositivi, parzialeStabiliNegativi));
  sommaVariabiliSoggette_Dipendenti = FinancialMath.roundTo2DP(sommaVariabiliSoggette_Dipendenti);
  sommaVariabiliNonSoggette_Dipendenti = FinancialMath.roundTo2DP(sommaVariabiliNonSoggette_Dipendenti);
  altreRisorseDecurtazioniFinali_Dipendenti = FinancialMath.roundTo2DP(altreRisorseDecurtazioniFinali_Dipendenti);
  decurtazioniLimiteSalarioAccessorio_Dipendenti = FinancialMath.roundTo2DP(decurtazioniLimiteSalarioAccessorio_Dipendenti);
  sommaStabiliSoggetteLimite = FinancialMath.roundTo2DP(sommaStabiliSoggetteLimite);

  const disponibilitaParziale1 = FinancialMath.sumAll(sommaStabili_Dipendenti, sommaVariabiliSoggette_Dipendenti, sommaVariabiliNonSoggette_Dipendenti);
  const totaleRisorseDisponibiliContrattazione_Dipendenti = FinancialMath.subtractAll(disponibilitaParziale1, altreRisorseDecurtazioniFinali_Dipendenti, decurtazioniLimiteSalarioAccessorio_Dipendenti);

  return {
    sommaStabili_Dipendenti,
    sommaVariabiliSoggette_Dipendenti,
    sommaVariabiliNonSoggette_Dipendenti,
    altreRisorseDecurtazioniFinali_Dipendenti,
    decurtazioniLimiteSalarioAccessorio_Dipendenti,
    totaleRisorseDisponibiliContrattazione_Dipendenti,
    sommaStabiliSoggetteLimite
  };
};

/**
 * Funzione orchestratrice che calcola completamente il fondo aggregando i risultati di tutti i sotto-fondi.
 * @param {FundData} fundData - L'intero set di dati dell'applicazione.
 * @param {NormativeData} normativeData - I dati normativi e le costanti.
 * @returns {CalculatedFund} L'oggetto che rappresenta il fondo calcolato con tutti i dettagli.
 */


// ... existing helper functions ...

/**
 * Funzione orchestratrice che calcola completamente il fondo aggregando i risultati di tutti i sotto-fondi.
 * @param {FundData} fundData - L'intero set di dati dell'applicazione.
 * @param {NormativeData} normativeData - I dati normativi e le costanti.
 * @returns {CalculatedFund} L'oggetto che rappresenta il fondo calcolato con tutti i dettagli.
 */
export const calculateFundCompletely = (fundData: FundData, normativeData: NormativeData): CalculatedFund => {
  const {
    historicalData,
    annualData,
    fondoAccessorioDipendenteData,
    fondoElevateQualificazioniData,
    fondoSegretarioComunaleData,
    fondoDirigenzaData
  } = fundData;

  const { riferimenti_normativi } = normativeData;

  // ... (existing code for fondoBase2016, art23, etc.) ...
  const fondoBase2016_originale =
    (historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) +
    (historicalData.fondoElevateQualificazioni2016 || 0) +
    (historicalData.fondoDirigenza2016 || 0) +
    (historicalData.risorseSegretarioComunale2016 || 0) +
    (annualData.fondoLavoroStraordinario || 0);

  const fondoBase2016 = historicalData.manualPersonalFundLimit2016 !== undefined
    ? historicalData.manualPersonalFundLimit2016
    : fondoBase2016_originale;

  const fondoPersonaleNonDirEQ2018_Art23 = historicalData.fondoPersonaleNonDirEQ2018_Art23 || 0;
  const fondoEQ2018_Art23 = historicalData.fondoEQ2018_Art23 || 0;
  const fondoBase2018_perArt23 = fondoPersonaleNonDirEQ2018_Art23 + fondoEQ2018_Art23;

  let dipendentiEquivalenti2018_Art23 = 0;
  if (annualData.manualDipendentiEquivalenti2018 !== undefined) {
    dipendentiEquivalenti2018_Art23 = annualData.manualDipendentiEquivalenti2018;
  } else if (annualData.personale2018PerArt23) {
    dipendentiEquivalenti2018_Art23 = annualData.personale2018PerArt23.reduce((sum, emp) => {
      const ptPerc = (typeof emp.partTimePercentage === 'number' && emp.partTimePercentage >= 0 && emp.partTimePercentage <= 100) ? emp.partTimePercentage / 100 : 1;
      return sum + ptPerc;
    }, 0);
  }

  let dipendentiEquivalentiAnnoRif_Art23 = 0;
  if (annualData.manualDipendentiEquivalentiAnnoRif !== undefined) {
    dipendentiEquivalentiAnnoRif_Art23 = annualData.manualDipendentiEquivalentiAnnoRif;
  } else if (annualData.personaleAnnoRifPerArt23) {
    dipendentiEquivalentiAnnoRif_Art23 = annualData.personaleAnnoRifPerArt23.reduce((sum, emp) => {
      const ptPerc = (typeof emp.partTimePercentage === 'number' && emp.partTimePercentage >= 0 && emp.partTimePercentage <= 100) ? emp.partTimePercentage / 100 : 1;
      const cedolini = (typeof emp.cedoliniEmessi === 'number' && emp.cedoliniEmessi >= 0 && emp.cedoliniEmessi <= 12) ? emp.cedoliniEmessi : 12;
      const cedoliniRatio = cedolini > 0 ? cedolini / 12 : 1;
      return sum + (ptPerc * cedoliniRatio);
    }, 0);
  }

  let valoreIncrementoLordoArt23C2 = 0;
  if (fondoBase2018_perArt23 > 0 && dipendentiEquivalenti2018_Art23 > 0) {
    const valoreMedioProCapite2018_Art23 = fondoBase2018_perArt23 / dipendentiEquivalenti2018_Art23;
    const differenzaDipendenti_Art23 = dipendentiEquivalentiAnnoRif_Art23 - dipendentiEquivalenti2018_Art23;
    valoreIncrementoLordoArt23C2 = valoreMedioProCapite2018_Art23 * differenzaDipendenti_Art23;
  }
  const importoEffettivoAdeguamentoArt23C2 = Math.max(0, valoreIncrementoLordoArt23C2);

  const incrementoDeterminatoArt23C2: FundComponent | undefined = importoEffettivoAdeguamentoArt23C2 > 0 ? {
    descrizione: `Adeguamento fondo per variazione personale (Art. 23 c.2 D.Lgs. 75/2017, base 2018)`,
    importo: importoEffettivoAdeguamentoArt23C2,
    riferimento: riferimenti_normativi.art23_dlgs75_2017 as string,
    tipo: 'stabile',
    esclusoDalLimite2016: false,
  } : undefined;

  const limiteArt23C2Modificato = fondoBase2016 + (incrementoDeterminatoArt23C2?.importo || 0);

  // CCNL Funzioni Locali 23.02.2026 Calculations
  const ccnl2024Increases: FundComponent[] = [];
  const ccnl2024VariableIncreases: FundComponent[] = [];
  let ccnl2024_fad_stabile = 0;
  let ccnl2024_fad_variabile = 0;
  let ccnl2024_eq_stabile = 0;
  let ccnl2024_eq_variabile = 0;

  if (annualData.ccnl2024) {
    const ccnlResults = calculateCcnl2024Increases(annualData.ccnl2024);

    if (ccnlResults.incrementoStabile2026 > 0) {
      ccnl2024Increases.push({
        descrizione: 'Incremento 0,14% MS 2021',
        importo: ccnlResults.incrementoStabile2026,
        riferimento: 'Art. 58 c. 1',
        tipo: 'stabile',
        esclusoDalLimite2016: true
      });
    }

    if (ccnlResults.riduzioneConglobamento > 0) {
      ccnl2024Increases.push({
        descrizione: 'Riduzione per conglobamento indennità di comparto (Tab. C CCNL Funzioni Locali 23.02.2026)',
        importo: -ccnlResults.riduzioneConglobamento,
        riferimento: 'CCNL Funzioni Locali 23.02.2026',
        tipo: 'stabile',
        esclusoDalLimite2016: false
      });
    }

    if (ccnlResults.incrementoVariabile2026 > 0) {
      ccnl2024VariableIncreases.push({
        descrizione: 'Incremento 0,14% MS 2021 di parte variabile dal 2024',
        importo: ccnlResults.incrementoVariabile2026,
        riferimento: 'Art. 58 c. 1',
        tipo: 'variabile',
        esclusoDalLimite2016: true
      });
    }

    if (ccnlResults.incrementoVariabileOpzionaleDal2026 > 0) {
      ccnl2024VariableIncreases.push({
        descrizione: 'Incremento variabile opzionale (0,22% dal 2026)',
        importo: ccnlResults.incrementoVariabileOpzionaleDal2026,
        riferimento: 'CCNL Funzioni Locali 23.02.2026',
        tipo: 'variabile',
        esclusoDalLimite2016: true
      });
    }

    if (ccnlResults.incrementoVariabileOpzionaleSolo2026 > 0) {
      ccnl2024VariableIncreases.push({
        descrizione: 'Incremento variabile opzionale (0,22% solo 2026)',
        importo: ccnlResults.incrementoVariabileOpzionaleSolo2026,
        riferimento: 'CCNL Funzioni Locali 23.02.2026',
        tipo: 'variabile',
        esclusoDalLimite2016: true
      });
    }

    // Assign split values for sub-funds
    ccnl2024_fad_stabile = ccnlResults.split.personale.incrementoStabile2026 - (ccnlResults.riduzioneConglobamento * (ccnlResults.split.personale.incrementoStabile2026 / (ccnlResults.split.personale.incrementoStabile2026 + ccnlResults.split.eq.incrementoStabile2026 || 1))); // Approssimazione riparto riduzione su peso relativo
    // Correction: Reduction is usually strictly personal, let's keep it on FAD for now or split if needed. The prompt says "Riduzione delle stabili... personale in servizio". This is staff-specific.
    // Let's assume reduction is FAD only for now as it relates to non-dir, non-eq staff usually unless specfied.
    ccnl2024_fad_stabile = ccnlResults.split.personale.incrementoStabile2026 - ccnlResults.riduzioneConglobamento;

    ccnl2024_fad_variabile = ccnlResults.split.personale.incrementoVariabile2026 + ccnlResults.split.personale.incrementoVariabileOpzionaleDal2026 + ccnlResults.split.personale.incrementoVariabileOpzionaleSolo2026;

    ccnl2024_eq_stabile = ccnlResults.split.eq.incrementoStabile2026;
    ccnl2024_eq_variabile = ccnlResults.split.eq.incrementoVariabile2026 + ccnlResults.split.eq.incrementoVariabileOpzionaleDal2026 + ccnlResults.split.eq.incrementoVariabileOpzionaleSolo2026;
  }

  // ... (existing helper calls) ...

  const dipendenti_soggette = fondoAccessorioDipendenteData?.cl_totaleParzialeRisorsePerConfrontoTetto2016 || 0;

  let eq_soggette = 0;
  if (fondoElevateQualificazioniData) {
    const eqData = fondoElevateQualificazioniData;
    eq_soggette = (eqData.ris_fondoPO2017 || 0) +
      (eqData.ris_incrementoConRiduzioneFondoDipendenti || 0) +
      (eqData.ris_incrementoLimiteArt23c2_DL34 || 0) +
      (eqData.va_dl25_2025_armonizzazione || 0);
  }

  const segretario_soggette = fondoSegretarioComunaleData?.fin_totaleRisorseRilevantiLimite || 0;
  const dirigenti_soggette = fondoDirigenzaData?.lim_totaleParzialeRisorseConfrontoTetto2016 || 0;

  const totaleRisorseSoggetteAlLimiteDaFondiSpecifici =
    dipendenti_soggette +
    eq_soggette +
    segretario_soggette +
    (annualData.hasDirigenza ? dirigenti_soggette : 0);

  const superamentoDelLimite2016 = Math.max(0, totaleRisorseSoggetteAlLimiteDaFondiSpecifici - limiteArt23C2Modificato);

  const isEnteInCondizioniSpeciali = !!annualData.isEnteDissestato || !!annualData.isEnteStrutturalmenteDeficitario || !!annualData.isEnteRiequilibrioFinanziario;
  const fadTotals = calculateFadTotals(
    fondoAccessorioDipendenteData || {},
    annualData.simulatoreRisultati,
    isEnteInCondizioniSpeciali,
    fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti,
    normativeData
  );

  // Add CCNL 2024 components to totals
  const fad_stabile = fadTotals.sommaStabili_Dipendenti + ccnl2024_fad_stabile;
  const fad_variabile = fadTotals.sommaVariabiliSoggette_Dipendenti
    + fadTotals.sommaVariabiliNonSoggette_Dipendenti
    - fadTotals.altreRisorseDecurtazioniFinali_Dipendenti
    - fadTotals.decurtazioniLimiteSalarioAccessorio_Dipendenti
    + ccnl2024_fad_variabile;
  const fad_totale = FinancialMath.sumAll(fad_stabile, fad_variabile);

  const eqData = fondoElevateQualificazioniData || {} as FondoElevateQualificazioniData;
  const eq_stabile = (eqData.ris_fondoPO2017 || 0) +
    (eqData.ris_incrementoConRiduzioneFondoDipendenti || 0) +
    (eqData.ris_incrementoLimiteArt23c2_DL34 || 0) -
    (eqData.fin_art23c2_adeguamentoTetto2016 || 0) +
    ccnl2024_eq_stabile;

  // La variabile EQ ora include solo il nuovo 0.22% MS 2021 (tutte risorse) e lo 0.22% MS 2018
  const eq_variabile = (eqData.ris_incremento022MonteSalari2018 || 0) +
    (eqData.va_incremento022_ms2021_eq || 0) +
    ccnl2024_eq_variabile;
  const eq_totale = FinancialMath.sumAll(eq_stabile, eq_variabile);

  // ... (seg and dir calculations remain same) ...
  const segData = fondoSegretarioComunaleData || {} as FondoSegretarioComunaleData;
  const percentualeCoperturaSeg = (segData.fin_percentualeCoperturaPostoSegretario === undefined ? 100 : segData.fin_percentualeCoperturaPostoSegretario) / 100;

  const sommaRisorseStabiliSeg =
    (segData.st_art3c6_CCNL2011_retribuzionePosizione || 0) + (segData.st_art58c1_CCNL2024_differenzialeAumento || 0) + (segData.st_art60c1_CCNL2024_retribuzionePosizioneClassi || 0) + (segData.st_art60c3_CCNL2024_maggiorazioneComplessita || 0) + (segData.st_art60c5_CCNL2024_allineamentoDirigEQ || 0) + (segData.st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni || 0) + (segData.st_art56c1h_CCNL2024_indennitaReggenzaSupplenza || 0) + (segData.st_art36_CCNL2022_2024_incrementoRetribuzionePosizione || 0);
  const sommaRisorseVariabiliSeg =
    (segData.va_art56c1f_CCNL2024_dirittiSegreteria || 0) + (segData.va_art56c1i_CCNL2024_altriCompensiLegge || 0) + (segData.va_art8c3_DL13_2023_incrementoPNRR || 0) + (segData.va_art61c2_CCNL2024_retribuzioneRisultato10 || 0) + (segData.va_art61c2bis_CCNL2024_retribuzioneRisultato15 || 0) + (segData.va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane || 0) + (segData.va_art61c3_CCNL2024_incremento022MonteSalari2018 || 0) + (segData.va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021 || 0) + (segData.va_art40c2_CCNL2022_2024_incremento0_22MonteSalari2021 || 0);

  const seg_stabile = FinancialMath.multiplyExact(sommaRisorseStabiliSeg, percentualeCoperturaSeg);
  const seg_variabile = FinancialMath.multiplyExact(sommaRisorseVariabiliSeg, percentualeCoperturaSeg);
  const seg_totale = FinancialMath.sumAll(seg_stabile, seg_variabile);

  let dir_stabile = 0;
  let dir_variabile = 0;
  let dir_totale = 0;
  if (annualData.hasDirigenza) {
    const dirData = fondoDirigenzaData || {} as FondoDirigenzaData;
    const sommaRisorseStabiliDir =
      (dirData.st_art57c2a_CCNL2020_unicoImporto2020 || 0) + (dirData.st_art57c2a_CCNL2020_riaPersonaleCessato2020 || 0) + (dirData.st_art56c1_CCNL2020_incremento1_53MonteSalari2015 || 0) + (dirData.st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo || 0) + (dirData.st_art57c2e_CCNL2020_risorseAutonomeStabili || 0) + (dirData.st_art39c1_CCNL2024_incremento2_01MonteSalari2018 || 0) + (dirData.st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021 || 0);
    const sommaRisorseVariabiliDir =
      (dirData.va_art57c2b_CCNL2020_risorseLeggeSponsor || 0) + (dirData.va_art57c2d_CCNL2020_sommeOnnicomprensivita || 0) + (dirData.va_art57c2e_CCNL2020_risorseAutonomeVariabili || 0) + (dirData.va_art57c3_CCNL2020_residuiAnnoPrecedente || 0) + (dirData.va_dl13_2023_art8c3_incrementoPNRR || 0) + (dirData.va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020 || 0) + (dirData.va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023 || 0) + (dirData.va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione || 0) + (dirData.va_art33c2_DL34_2019_incrementoDeroga || 0) + (dirData.va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021 || 0) + (dirData.va_compensiExLege_rilevanti || 0) + (dirData.va_compensiExLege_nonRilevanti || 0);
    const lim_adjustments = (dirData.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016 || 0) - (dirData.lim_art4_DL16_2014_misureMancatoRispettoVincoli || 0);
    dir_stabile = sommaRisorseStabiliDir + lim_adjustments;
    dir_variabile = sommaRisorseVariabiliDir;
    dir_totale = dir_stabile + dir_variabile;
  }

  const totaleComponenteStabile = FinancialMath.sumAll(fad_stabile, eq_stabile, seg_stabile, dir_stabile);
  const totaleComponenteVariabile = FinancialMath.sumAll(fad_variabile, eq_variabile, seg_variabile, dir_variabile);
  const totaleFondoRisorseDecentrate = FinancialMath.sumAll(totaleComponenteStabile, totaleComponenteVariabile);

  return {
    fondoBase2016: fondoBase2016_originale,
    incrementiStabiliCCNL: ccnl2024Increases,
    adeguamentoProCapite: { descrizione: '', importo: 0, riferimento: '', tipo: 'stabile' },
    incrementoDeterminatoArt23C2,
    totaleFondoRisorseDecentrate,
    limiteArt23C2Modificato,
    ammontareSoggettoLimite2016: totaleRisorseSoggetteAlLimiteDaFondiSpecifici,
    superamentoLimite2016: superamentoDelLimite2016 > 0 ? superamentoDelLimite2016 : undefined,
    totaleRisorseSoggetteAlLimiteDaFondiSpecifici,
    risorseVariabili: ccnl2024VariableIncreases,

    totaleFondo: totaleFondoRisorseDecentrate,
    totaleParteStabile: totaleComponenteStabile,
    totaleParteVariabile: totaleComponenteVariabile,
    totaleComponenteStabile: totaleComponenteStabile,
    totaleComponenteVariabile: totaleComponenteVariabile,

    dettaglioFondi: {
      dipendente: { stabile: fad_stabile, variabile: fad_variabile, totale: fad_totale },
      eq: { stabile: eq_stabile, variabile: eq_variabile, totale: eq_totale },
      segretario: { stabile: seg_stabile, variabile: seg_variabile, totale: seg_totale },
      dirigenza: { stabile: dir_stabile, variabile: dir_variabile, totale: dir_totale },
    }
  };
};
