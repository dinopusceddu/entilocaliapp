// logic/fundEngine.ts
import {
  SimulatoreIncrementoInput,
  SimulatoreIncrementoRisultati,
  TipologiaEnte,
  FondoAccessorioDipendenteData,
  FundData,
  CalculatedFund,
  FundComponent,
  EmployeeCategory,

  FondoElevateQualificazioniData,
  FondoSegretarioComunaleData,
  FondoDirigenzaData,

  NormativeData,
  FundStructureConfig
} from '../types.ts';

import { getFadFieldDefinitions } from '../pages/FondoAccessorioDipendentePageHelpers.ts';

// --- FROM hooks/useSimulatoreCalculations.ts ---

export const getSogliaSpesaPersonale = (numeroAbitanti?: number, tipologiaEnte?: TipologiaEnte): number => {
  if (numeroAbitanti === undefined || tipologiaEnte === undefined) return 0;

  // FIX: Corrected enum access to use uppercase keys.
  if (tipologiaEnte === TipologiaEnte.COMUNE) {
    if (numeroAbitanti <= 999) return 29.50;
    if (numeroAbitanti <= 1999) return 28.60;
    if (numeroAbitanti <= 2999) return 27.60;
    if (numeroAbitanti <= 4999) return 27.20;
    if (numeroAbitanti <= 9999) return 26.90;
    if (numeroAbitanti <= 59999) return 27.00;
    if (numeroAbitanti <= 249999) return 27.60;
    if (numeroAbitanti <= 1499999) return 28.80;
    return 25.30; // Oltre 1.500.000
    // FIX: Corrected enum access to use uppercase keys.
  } else if (tipologiaEnte === TipologiaEnte.PROVINCIA) {
    if (numeroAbitanti <= 250000) return 20.80;
    if (numeroAbitanti <= 349999) return 19.10;
    if (numeroAbitanti <= 449999) return 19.10;
    if (numeroAbitanti <= 699999) return 19.70;
    return 13.90; // Da 700.000 abitanti in su
  }
  return 0;
};

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

  // Fase 1: Incremento Potenziale Massimo (Regola del 48%)
  const fase1_obiettivo48 = stipendiTabellari2023 * 0.48;
  const fase1_fondoAttualeComplessivo = fondoStabileAnnoApplicazione + risorsePOEQAnnoApplicazione;
  const fase1_incrementoPotenzialeLordo = Math.max(0, fase1_obiettivo48 - fase1_fondoAttualeComplessivo);

  // Fase 2: Verifica Limite di Spesa del Personale (DM 17/3/2020)
  const fase2_spesaPersonaleAttualePrevista = spesaPersonaleConsuntivo2023 + costoNuoveAssunzioni;
  const fase2_sogliaPercentualeDM17_03_2020 = getSogliaSpesaPersonale(numAbitanti, tipoEnte);
  const fase2_limiteSostenibileDL34 = mediaEntrateCorrenti * (fase2_sogliaPercentualeDM17_03_2020 / 100);
  const fase2_spazioDisponibileDL34 = Math.max(0, fase2_limiteSostenibileDL34 - fase2_spesaPersonaleAttualePrevista);

  // Fase 3: Verifica Limite del Tetto Storico (L. 296/06)
  const fase3_margineDisponibileL296_06 = Math.max(0, tettoSpesaL296_06 - fase2_spesaPersonaleAttualePrevista);

  // Fase 4: Determinazione dello Spazio Utilizzabile Lordo
  const fase4_spazioUtilizzabileLordo = Math.min(
    fase1_incrementoPotenzialeLordo,
    fase2_spazioDisponibileDL34,
    fase3_margineDisponibileL296_06
  );

  // Fase 5: Calcolo dell'Incremento Netto Effettivo del Fondo
  let fase5_incrementoNettoEffettivoFondo = 0;
  if (percOneri >= 0 && percOneri < 100) {
    fase5_incrementoNettoEffettivoFondo = fase4_spazioUtilizzabileLordo / (1 + (percOneri / 100));
  } else if (percOneri >= 100) {
    fase5_incrementoNettoEffettivoFondo = 0;
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

// --- FROM pages/FondoAccessorioDipendentePageHelpers.ts ---

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

import FinancialMath from '../utils/financialMath';
import strutturaFondoRaw from '../data/strutturaFondo.json';

const strutturaFondo: FundStructureConfig = strutturaFondoRaw as any;

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

// --- Main Calculation Engine ---
export const calculateFundCompletely = (fundData: FundData, normativeData: NormativeData): CalculatedFund => {
  const {
    historicalData,
    annualData,
    fondoAccessorioDipendenteData,
    fondoElevateQualificazioniData,
    fondoSegretarioComunaleData,
    fondoDirigenzaData
  } = fundData;

  const { valori_pro_capite, limiti, riferimenti_normativi } = normativeData;

  const fondoBase2016_originale =
    (historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) +
    (historicalData.fondoElevateQualificazioni2016 || 0) +
    (historicalData.fondoDirigenza2016 || 0) +
    (historicalData.risorseSegretarioComunale2016 || 0);

  const fondoPersonaleNonDirEQ2018_Art23 = historicalData.fondoPersonaleNonDirEQ2018_Art23 || 0;
  const fondoEQ2018_Art23 = historicalData.fondoEQ2018_Art23 || 0;
  const fondoBase2018_perArt23 = fondoPersonaleNonDirEQ2018_Art23 + fondoEQ2018_Art23;

  let dipendentiEquivalenti2018_Art23 = 0;
  if (annualData.personale2018PerArt23) {
    dipendentiEquivalenti2018_Art23 = annualData.personale2018PerArt23.reduce((sum, emp) => {
      const ptPerc = (typeof emp.partTimePercentage === 'number' && emp.partTimePercentage >= 0 && emp.partTimePercentage <= 100) ? emp.partTimePercentage / 100 : 1;
      return sum + ptPerc;
    }, 0);
  }

  let dipendentiEquivalentiAnnoRif_Art23 = 0;
  if (annualData.personaleAnnoRifPerArt23) {
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

  const personale2018_perArt33 = historicalData.personaleServizio2018 || 0;
  // const spesaStipendiTabellari2023_perArt14 = historicalData.spesaStipendiTabellari2023 || 0;
  const personaleNonDirigenteEQAttuale_perArt33 = annualData.personaleServizioAttuale.filter(p => p.category === EmployeeCategory.DIPENDENTE || p.category === EmployeeCategory.EQ).reduce((sum, p) => sum + (p.count || 0), 0);
  // const personaleTotaleAttuale_perArt33 = annualData.personaleServizioAttuale.reduce((sum, p) => sum + (p.count || 0), 0);
  const incrementiStabiliCCNL: FundComponent[] = [];
  if (personale2018_perArt33 > 0) { const importoArt67 = personale2018_perArt33 * valori_pro_capite.art67_ccnl_2018; incrementiStabiliCCNL.push({ descrizione: `Incremento stabile CCNL (${valori_pro_capite.art67_ccnl_2018}€ pro-capite su personale 2018 per Art.33)`, importo: importoArt67, riferimento: riferimenti_normativi.art67_ccnl2018 as string, tipo: 'stabile', esclusoDalLimite2016: false, }); }
  if (personaleNonDirigenteEQAttuale_perArt33 > 0) { const importoArt79b = personaleNonDirigenteEQAttuale_perArt33 * valori_pro_capite.art79_ccnl_2022_b; incrementiStabiliCCNL.push({ descrizione: `Incremento stabile CCNL (${valori_pro_capite.art79_ccnl_2022_b}€ pro-capite personale non Dir/EQ per Art.33)`, importo: importoArt79b, riferimento: `${riferimenti_normativi.art79_ccnl2022} lett. b)`, tipo: 'stabile', esclusoDalLimite2016: false, }); }
  // let importoAdeguamentoProCapiteArt33 = 0;
  // const valoreMedioProCapite2018_Art33 = (personale2018_perArt33 > 0 && fondoBase2016_originale > 0) ? fondoBase2016_originale / personale2018_perArt33 : 0;
  // if (valoreMedioProCapite2018_Art33 > 0) { importoAdeguamentoProCapiteArt33 = (personaleTotaleAttuale_perArt33 - personale2018_perArt33) * valoreMedioProCapite2018_Art33; }
  // const adeguamentoProCapite: FundComponent = { descrizione: "Adeguamento invarianza valore medio pro-capite 2018 (Art. 33 DL 34/2019)", importo: importoAdeguamentoProCapiteArt33, riferimento: riferimenti_normativi.art33_dl34_2019 as string, tipo: 'stabile', esclusoDalLimite2016: false, };
  // let incrementoOpzionaleVirtuosi: FundComponent | undefined = undefined;
  // if (annualData.condizioniVirtuositaFinanziariaSoddisfatte && spesaStipendiTabellari2023_perArt14 > 0) { const importoMaxIncremento48 = spesaStipendiTabellari2023_perArt14 * limiti.incremento_virtuosi_dl25_2025; incrementoOpzionaleVirtuosi = { descrizione: "Incremento facoltativo enti virtuosi (max 48% stip. tab. non dir. 2023)", importo: importoMaxIncremento48, riferimento: riferimenti_normativi.art14_dl25_2025 as string, tipo: 'stabile', esclusoDalLimite2016: false, }; }
  const risorseVariabili: FundComponent[] = [];
  const proventiArt45 = annualData.proventiSpecifici.find(p => p.riferimentoNormativo === riferimenti_normativi.art45_dlgs36_2023); if (proventiArt45 && proventiArt45.importo && proventiArt45.importo > 0) { risorseVariabili.push({ descrizione: "Incentivi funzioni tecniche", importo: proventiArt45.importo, riferimento: riferimenti_normativi.art45_dlgs36_2023 as string, tipo: 'variabile', esclusoDalLimite2016: true, }); }
  const proventiArt208 = annualData.proventiSpecifici.find(p => p.riferimentoNormativo === riferimenti_normativi.art208_cds); if (proventiArt208 && proventiArt208.importo && proventiArt208.importo > 0) { risorseVariabili.push({ descrizione: "Proventi Codice della Strada (quota destinata)", importo: proventiArt208.importo, riferimento: riferimenti_normativi.art208_cds as string, tipo: 'variabile', esclusoDalLimite2016: false, }); }
  annualData.proventiSpecifici.filter(p => p.riferimentoNormativo !== riferimenti_normativi.art45_dlgs36_2023 && p.riferimentoNormativo !== riferimenti_normativi.art208_cds).forEach(p => { if (p.importo && p.importo > 0) { risorseVariabili.push({ descrizione: p.descrizione, importo: p.importo, riferimento: p.riferimentoNormativo, tipo: 'variabile', esclusoDalLimite2016: false }); } });
  if (annualData.condizioniVirtuositaFinanziariaSoddisfatte && annualData.incentiviPNRROpMisureStraordinarie && annualData.incentiviPNRROpMisureStraordinarie > 0) { const limitePNRR = fondoBase2016_originale * limiti.incremento_pnrr_dl13_2023; const importoEffettivoPNRR = Math.min(annualData.incentiviPNRROpMisureStraordinarie, limitePNRR); risorseVariabili.push({ descrizione: "Incremento variabile PNRR/Misure Straordinarie (fino a 5% del fondo stabile 2016 originale)", importo: importoEffettivoPNRR, riferimento: riferimenti_normativi.art8_dl13_2023 as string, tipo: 'variabile', esclusoDalLimite2016: true, }); }

  const limiteArt23C2Modificato = fondoBase2016_originale + (incrementoDeterminatoArt23C2?.importo || 0);

  const dipendenti_soggette = fondoAccessorioDipendenteData?.cl_totaleParzialeRisorsePerConfrontoTetto2016 || 0;

  let eq_soggette = 0;
  if (fondoElevateQualificazioniData) {
    eq_soggette = (fondoElevateQualificazioniData.ris_fondoPO2017 || 0) +
      (fondoElevateQualificazioniData.ris_incrementoConRiduzioneFondoDipendenti || 0) +
      (fondoElevateQualificazioniData.ris_incrementoLimiteArt23c2_DL34 || 0);
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
  const fad_stabile = fadTotals.sommaStabili_Dipendenti;
  const fad_variabile = fadTotals.sommaVariabiliSoggette_Dipendenti
    + fadTotals.sommaVariabiliNonSoggette_Dipendenti
    - fadTotals.altreRisorseDecurtazioniFinali_Dipendenti
    - fadTotals.decurtazioniLimiteSalarioAccessorio_Dipendenti;
  const fad_totale = fad_stabile + fad_variabile;

  const eqData = fondoElevateQualificazioniData || {} as FondoElevateQualificazioniData;
  const eq_stabile = (eqData.ris_fondoPO2017 || 0) +
    (eqData.ris_incrementoConRiduzioneFondoDipendenti || 0) +
    (eqData.ris_incrementoLimiteArt23c2_DL34 || 0) -
    (eqData.fin_art23c2_adeguamentoTetto2016 || 0);
  const eq_variabile = (eqData.ris_incremento022MonteSalari2018 || 0);
  const eq_totale = FinancialMath.sumAll(eq_stabile, eq_variabile);

  const segData = fondoSegretarioComunaleData || {} as FondoSegretarioComunaleData;
  const percentualeCoperturaSeg = (segData.fin_percentualeCoperturaPostoSegretario === undefined ? 100 : segData.fin_percentualeCoperturaPostoSegretario) / 100;

  const sommaRisorseStabiliSeg =
    (segData.st_art3c6_CCNL2011_retribuzionePosizione || 0) + (segData.st_art58c1_CCNL2024_differenzialeAumento || 0) + (segData.st_art60c1_CCNL2024_retribuzionePosizioneClassi || 0) + (segData.st_art60c3_CCNL2024_maggiorazioneComplessita || 0) + (segData.st_art60c5_CCNL2024_allineamentoDirigEQ || 0) + (segData.st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni || 0) + (segData.st_art56c1h_CCNL2024_indennitaReggenzaSupplenza || 0);
  const sommaRisorseVariabiliSeg =
    (segData.va_art56c1f_CCNL2024_dirittiSegreteria || 0) + (segData.va_art56c1i_CCNL2024_altriCompensiLegge || 0) + (segData.va_art8c3_DL13_2023_incrementoPNRR || 0) + (segData.va_art61c2_CCNL2024_retribuzioneRisultato10 || 0) + (segData.va_art61c2bis_CCNL2024_retribuzioneRisultato15 || 0) + (segData.va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane || 0) + (segData.va_art61c3_CCNL2024_incremento022MonteSalari2018 || 0);

  const seg_stabile = FinancialMath.multiplyExact(sommaRisorseStabiliSeg, percentualeCoperturaSeg);
  const seg_variabile = FinancialMath.multiplyExact(sommaRisorseVariabiliSeg, percentualeCoperturaSeg);
  const seg_totale = FinancialMath.sumAll(seg_stabile, seg_variabile);

  let dir_stabile = 0;
  let dir_variabile = 0;
  let dir_totale = 0;
  if (annualData.hasDirigenza) {
    const dirData = fondoDirigenzaData || {} as FondoDirigenzaData;
    const sommaRisorseStabiliDir =
      (dirData.st_art57c2a_CCNL2020_unicoImporto2020 || 0) + (dirData.st_art57c2a_CCNL2020_riaPersonaleCessato2020 || 0) + (dirData.st_art56c1_CCNL2020_incremento1_53MonteSalari2015 || 0) + (dirData.st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo || 0) + (dirData.st_art57c2e_CCNL2020_risorseAutonomeStabili || 0) + (dirData.st_art39c1_CCNL2024_incremento2_01MonteSalari2018 || 0);
    const sommaRisorseVariabiliDir =
      (dirData.va_art57c2b_CCNL2020_risorseLeggeSponsor || 0) + (dirData.va_art57c2d_CCNL2020_sommeOnnicomprensivita || 0) + (dirData.va_art57c2e_CCNL2020_risorseAutonomeVariabili || 0) + (dirData.va_art57c3_CCNL2020_residuiAnnoPrecedente || 0) + (dirData.va_dl13_2023_art8c3_incrementoPNRR || 0) + (dirData.va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020 || 0) + (dirData.va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023 || 0) + (dirData.va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione || 0) + (dirData.va_art33c2_DL34_2019_incrementoDeroga || 0);
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
    incrementiStabiliCCNL,
    adeguamentoProCapite: { descrizione: '', importo: 0, riferimento: '', tipo: 'stabile' },
    incrementoDeterminatoArt23C2,
    totaleFondoRisorseDecentrate,
    limiteArt23C2Modificato,
    ammontareSoggettoLimite2016: totaleRisorseSoggetteAlLimiteDaFondiSpecifici,
    superamentoLimite2016: superamentoDelLimite2016 > 0 ? superamentoDelLimite2016 : undefined,
    totaleRisorseSoggetteAlLimiteDaFondiSpecifici,
    risorseVariabili: [],

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