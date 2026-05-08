import {
  SimulatoreIncrementoRisultati,
  FondoAccessorioDipendenteData,
  FondoElevateQualificazioniData,
  FondoSegretarioComunaleData,
  FondoDirigenzaData,
  Ccnl2024Settings,
  Art23EmployeeDetail,
  HistoricalData,
  AnnualData,
  FundComponent,
  NormativeData,
  FundStructureConfig,
  CalculationSection,
  CalculationSectionItem,
  DistribuzioneRisorseData,
  ReductionResult
} from '../../domain';
import { getFadFieldDefinitions, getDistribuzioneFieldDefinitions } from '../fundFieldDefinitions';
import { calculateCcnl2024Increases } from '../ccnl2024Calculations';
import FinancialMath from '../../utils/financialMath';
import strutturaFondoRaw from '../../data/strutturaFondo.json';

const strutturaFondo = (strutturaFondoRaw as unknown) as FundStructureConfig;

/**
 * Risolve il valore dell'incremento D.L. 25/2025 gestendo l'alias legacy.
 * Regola: Priorità alla chiave canonica se valorizzata (> 0), altrimenti usa la legacy.
 * @param data Dati della costituzione del fondo
 */
export const resolveDL25IncrementValue = (data: Partial<FondoAccessorioDipendenteData>): number => {
  const canonical = data.st_incrementoDL25_2025 || 0;
  const legacy = data.st_incrementoDecretoPA || 0;
  return canonical > 0 ? canonical : legacy;
};

/**
 * Calcola il valore effettivo di una voce del fondo.
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
  if (key === 'st_incrementoDL25_2025' || key === 'st_incrementoDecretoPA') {
    const maxIncremento = simulatoreRisultati?.fase5_incrementoNettoEffettivoFondo ?? 0;
    return maxIncremento > 0 ? (originalValue || 0) : 0;
  }
  if (key === 'st_riduzionePerIncrementoEQ') {
    return incrementoEQconRiduzioneDipendenti || 0;
  }
  return originalValue || 0;
};

export const calculateFadTotals = (
  fadData: Partial<FondoAccessorioDipendenteData>,
  simulatoreRisultati: SimulatoreIncrementoRisultati | undefined,
  isEnteInCondizioniSpeciali: boolean,
  incrementoEQconRiduzioneDipendenti: number | undefined,
  normativeData: NormativeData,
  reductionResult?: ReductionResult
) => {
  const fadFieldDefinitions = getFadFieldDefinitions(normativeData);

  // Risoluzione Alias Incremento D.L. 25/2025 (Evita doppio conteggio se presenti entrambe)
  const resolvedDL25Value = resolveDL25IncrementValue(fadData);

  const sectionsMap: Record<string, { title: string, items: CalculationSectionItem[], total: number }> = {
    stabili: { title: "Risorse Stabili", items: [], total: 0 },
    vs_soggette: { title: "Risorse Variabili Soggette", items: [], total: 0 },
    vn_non_soggette: { title: "Risorse Variabili Non Soggette", items: [], total: 0 },
    fin_decurtazioni: { title: "Altre Risorse e Decurtazioni Finali", items: [], total: 0 },
    cl_limiti: { title: "Verifica Rispetto Limiti", items: [], total: 0 }
  };

  let sommaStabiliSoggetteLimite = 0;

  for (const [key, config] of Object.entries(strutturaFondo)) {
    const fieldDef = fadFieldDefinitions.find(def => def.key === key);
    if (!fieldDef) continue;

    let value = 0;
    // Se abbiamo un reductionResult canonico e la chiave è una decurtazione FAD, usiamo il valore canonico
    if (reductionResult && reductionResult.details.fad[key as keyof typeof reductionResult.details.fad] !== undefined) {
      value = reductionResult.details.fad[key as keyof typeof reductionResult.details.fad];
    } else {
      const originalValue = fadData[key as keyof FondoAccessorioDipendenteData];
      
      // Logica Alias: se è la chiave legacy, il suo valore è già stato assorbito nel resolvedDL25Value assegnato alla chiave canonica
      let effectiveInputVal = originalValue;
      if (key === 'st_incrementoDL25_2025') effectiveInputVal = resolvedDL25Value;
      if (key === 'st_incrementoDecretoPA') effectiveInputVal = 0;

      value = getFadEffectiveValueHelper(
        key as keyof FondoAccessorioDipendenteData,
        effectiveInputVal,
        fieldDef.isDisabledByCondizioniSpeciali,
        isEnteInCondizioniSpeciali,
        simulatoreRisultati,
        incrementoEQconRiduzioneDipendenti
      ) || 0;
    }

    const section = sectionsMap[config.section];
    if (section) {
      const amount = fieldDef.isSubtractor ? -Math.abs(value) : value;
      
      // Evita di aggiungere la riga legacy se il suo valore è già stato assorbito (alias)
      if (key !== 'st_incrementoDecretoPA' || value !== 0) {
        section.items.push({
          key,
          description: fieldDef.description,
          amount: value, // Valore assoluto
          riferimentoNormativo: fieldDef.riferimento,
          isRelevantToArt23Limit: !!config.isRelevantToArt23Limit,
          operator: config.operator,
          isSubtractor: !!fieldDef.isSubtractor
        });
        section.total = FinancialMath.addExact(section.total, amount);
      }
    }

    if (config.section === 'stabili' && config.isRelevantToArt23Limit) {
      if (key !== 'st_art60c2_CCNL2026_decurtazioneIndennitaComparto') {
        const amount = config.operator === '+' ? value : -value;
        sommaStabiliSoggetteLimite = FinancialMath.addExact(sommaStabiliSoggetteLimite, amount);
      }
    }
  }

  const resultSections: Record<string, CalculationSection> = {};
  for (const [id, sec] of Object.entries(sectionsMap)) {
    resultSections[id] = {
      id,
      title: sec.title,
      items: sec.items,
      total: FinancialMath.roundTo2DP(sec.total)
    };
  }

  const totaleStabile_Dipendenti = FinancialMath.safe(resultSections.stabili.total);
  const sommaVariabiliSoggette_Dipendenti = FinancialMath.safe(resultSections.vs_soggette.total);
  const sommaVariabiliNonSoggette_Dipendenti = FinancialMath.safe(resultSections.vn_non_soggette.total);
  const altreRisorseDecurtazioniFinali_Dipendenti = Math.abs(FinancialMath.safe(resultSections.fin_decurtazioni.total));
  const decurtazioniLimiteSalarioAccessorio_Dipendenti = Math.abs(FinancialMath.safe(resultSections.cl_limiti.total));

  const disponibilitaParziale1 = FinancialMath.sumAll(totaleStabile_Dipendenti, sommaVariabiliSoggette_Dipendenti, sommaVariabiliNonSoggette_Dipendenti);
  const totaleRisorseDisponibiliContrattazione_Dipendenti = FinancialMath.subtractAll(disponibilitaParziale1, altreRisorseDecurtazioniFinali_Dipendenti, decurtazioniLimiteSalarioAccessorio_Dipendenti);

  return {
    sections: resultSections,
    totaleStabile_Dipendenti,
    sommaVariabiliSoggette_Dipendenti,
    sommaVariabiliNonSoggette_Dipendenti,
    altreRisorseDecurtazioniFinali_Dipendenti,
    decurtazioniLimiteSalarioAccessorio_Dipendenti,
    totaleRisorseDisponibiliContrattazione_Dipendenti,
    sommaStabiliSoggetteLimite: FinancialMath.roundTo2DP(sommaStabiliSoggetteLimite)
  };
};

/**
 * Calcola le sezioni di utilizzo (distribuzione) del fondo per il DTO canonico.
 */
export const calculateUtilizationSections = (
  distribuzioneData: DistribuzioneRisorseData,
  normativeData: NormativeData
): Record<string, CalculationSection> => {
  const distFieldDefinitions = getDistribuzioneFieldDefinitions(normativeData);

  const sectionsMap: Record<string, { title: string, items: CalculationSectionItem[], total: number }> = {
    stabili: { title: "Utilizzi Parte Stabile", items: [], total: 0 },
    variabili: { title: "Utilizzi Parte Variabile", items: [], total: 0 }
  };

  distFieldDefinitions.forEach(f => {
    const rawVal = (distribuzioneData as any)[f.key];
    const val = typeof rawVal === 'number' ? rawVal : (rawVal?.stanziate || 0);

    if (val !== 0) {
      const section = sectionsMap[f.section];
      if (section) {
        section.items.push({
          key: f.key,
          description: f.description,
          amount: val,
          riferimentoNormativo: f.riferimento,
          isRelevantToArt23Limit: false,
          operator: '+',
          isSubtractor: false
        });
        section.total = FinancialMath.addExact(section.total, val);
      }
    }
  });

  const resultSections: Record<string, CalculationSection> = {};
  for (const [id, sec] of Object.entries(sectionsMap)) {
    resultSections[id] = {
      id,
      title: sec.title,
      items: sec.items,
      total: FinancialMath.roundTo2DP(sec.total)
    };
  }

  return resultSections;
};

/**
 * Calcola i dipendenti equivalenti per il limite Art. 23 c. 2.
 */
const calculateArt23Fte = (personale: Art23EmployeeDetail[] | undefined): number => {
  if (!personale) return 0;
  return personale.reduce((sum, emp) => {
    const ptPerc = (typeof emp.partTimePercentage === 'number' && emp.partTimePercentage >= 0 && emp.partTimePercentage <= 100) ? emp.partTimePercentage / 100 : 1;
    const cedolini = (typeof emp.cedoliniEmessi === 'number' && emp.cedoliniEmessi >= 0 && emp.cedoliniEmessi <= 12) ? emp.cedoliniEmessi : 12;
    const cedoliniRatio = cedolini > 0 ? cedolini / 12 : 1;
    return sum + (ptPerc * cedoliniRatio);
  }, 0);
};

/**
 * Calcola l'adeguamento Art. 23 c. 2 (variazione personale base 2018).
 */
export const calculateArt23c2Adjustment = (
  historicalData: HistoricalData,
  annualData: AnnualData,
  calculatedFteAnnoRif: number,
  isManualMode: boolean,
  riferimenti_normativi: { [key: string]: string }
): { component?: FundComponent; importo: number } => {
  const fondoBase2018_perArt23 = (historicalData.fondoPersonaleNonDirEQ2018_Art23 || 0) + (historicalData.fondoEQ2018_Art23 || 0);

  let dipendentiEquivalenti2018_Art23 = 0;
  if (annualData.manualDipendentiEquivalenti2018 !== undefined) {
    dipendentiEquivalenti2018_Art23 = annualData.manualDipendentiEquivalenti2018;
  } else if (annualData.personale2018PerArt23) {
    dipendentiEquivalenti2018_Art23 = annualData.personale2018PerArt23.reduce((sum: number, emp: any) => {
      const ptPerc = (typeof emp.partTimePercentage === 'number' && emp.partTimePercentage >= 0 && emp.partTimePercentage <= 100) ? emp.partTimePercentage / 100 : 1;
      return sum + ptPerc;
    }, 0);
  }

  let dipendentiEquivalentiAnnoRif_Art23 = 0;
  if (isManualMode) {
    dipendentiEquivalentiAnnoRif_Art23 = annualData.manualDipendentiEquivalentiAnnoRif || 0;
  } else if (annualData.manualDipendentiEquivalentiAnnoRif !== undefined) {
    dipendentiEquivalentiAnnoRif_Art23 = annualData.manualDipendentiEquivalentiAnnoRif;
  } else if (calculatedFteAnnoRif > 0) {
    dipendentiEquivalentiAnnoRif_Art23 = calculatedFteAnnoRif;
  } else {
    dipendentiEquivalentiAnnoRif_Art23 = calculateArt23Fte(annualData.personaleAnnoRifPerArt23);
  }

  let importo = 0;
  if (fondoBase2018_perArt23 > 0 && dipendentiEquivalenti2018_Art23 > 0) {
    const valoreMedioProCapite2018_Art23 = fondoBase2018_perArt23 / dipendentiEquivalenti2018_Art23;
    const differenzaDipendenti_Art23 = dipendentiEquivalentiAnnoRif_Art23 - dipendentiEquivalenti2018_Art23;
    importo = Math.max(0, valoreMedioProCapite2018_Art23 * differenzaDipendenti_Art23);
  }

  const component: FundComponent | undefined = importo > 0 ? {
    descrizione: `Adeguamento fondo per variazione personale (Art. 23 c.2 D.Lgs. 75/2017, base 2018)`,
    importo,
    riferimento: riferimenti_normativi.art23_dlgs75_2017 as string,
    tipo: 'stabile',
    esclusoDalLimite2016: false,
  } : undefined;

  return { component, importo };
};

/**
 * Calcola i moduli del fondo Elevate Qualificazioni (EQ).
 */
export const calculateEqSubFund = (eqData: FondoElevateQualificazioniData, ccnl2024_eq_stabile: number, ccnl2024_eq_variabile: number) => {
  const eq_stabile = (eqData.ris_fondoPO2017 || 0) +
    (eqData.ris_incrementoConRiduzioneFondoDipendenti || 0) +
    (eqData.ris_incrementoLimiteArt23c2_DL34 || 0) -
    (eqData.fin_art23c2_adeguamentoTetto2016 || 0) +
    ccnl2024_eq_stabile;

  const eq_variabile = (eqData.ris_incremento022MonteSalari2018 || 0) +
    (eqData.va_incremento022_ms2021_eq || 0) +
    ccnl2024_eq_variabile;

  return {
    stabile: FinancialMath.safe(eq_stabile),
    variabile: FinancialMath.safe(eq_variabile),
    totale: FinancialMath.sumAll(eq_stabile, eq_variabile)
  };
};

/**
 * Calcola i moduli del fondo Segretario Comunale.
 */
export const calculateSegretarioSubFund = (segData: FondoSegretarioComunaleData) => {
  const percentualeCoperturaSeg = (segData.fin_percentualeCoperturaPostoSegretario === undefined ? 100 : segData.fin_percentualeCoperturaPostoSegretario) / 100;
  const sommaRisorseStabiliSeg =
    (segData.st_art3c6_CCNL2011_retribuzionePosizione || 0) + (segData.st_art58c1_CCNL2024_differenzialeAumento || 0) + (segData.st_art60c1_CCNL2024_retribuzionePosizioneClassi || 0) + (segData.st_art60c3_CCNL2024_maggiorazioneComplessita || 0) + (segData.st_art60c5_CCNL2024_allineamentoDirigEQ || 0) + (segData.st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni || 0) + (segData.st_art56c1h_CCNL2024_indennitaReggenzaSupplenza || 0) + (segData.st_art36_CCNL2022_2024_incrementoRetribuzionePosizione || 0);
  const sommaRisorseVariabiliSeg =
    (segData.va_art56c1f_CCNL2024_dirittiSegreteria || 0) + (segData.va_art56c1i_CCNL2024_altriCompensiLegge || 0) + (segData.va_art8c3_DL13_2023_incrementoPNRR || 0) + (segData.va_art61c2_CCNL2024_retribuzioneRisultato10 || 0) + (segData.va_art61c2bis_CCNL2024_retribuzioneRisultato15 || 0) + (segData.va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane || 0) + (segData.va_art61c3_CCNL2024_incremento022MonteSalari2018 || 0) + (segData.va_art40c2_CCNL2022_2024_incremento0_22MonteSalari2021 || 0);

  const seg_stabile = FinancialMath.multiplyExact(sommaRisorseStabiliSeg, percentualeCoperturaSeg);
  const seg_variabile = FinancialMath.multiplyExact(sommaRisorseVariabiliSeg, percentualeCoperturaSeg);
  return { stabile: seg_stabile, variabile: seg_variabile, totale: FinancialMath.sumAll(seg_stabile, seg_variabile) };
};

/**
 * Calcola i moduli del fondo Dirigenza.
 */
export const calculateDirigenzaSubFund = (dirData: FondoDirigenzaData, hasDirigenza: boolean) => {
  if (!hasDirigenza) return { stabile: 0, variabile: 0, totale: 0 };
  const sommaRisorseStabiliDir =
    (dirData.st_art57c2a_CCNL2020_unicoImporto2020 || 0) + (dirData.st_art57c2a_CCNL2020_riaPersonaleCessato2020 || 0) + (dirData.st_art56c1_CCNL2020_incremento1_53MonteSalari2015 || 0) + (dirData.st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo || 0) + (dirData.st_art57c2e_CCNL2020_risorseAutonomeStabili || 0) + (dirData.st_art39c1_CCNL2024_incremento2_01MonteSalari2018 || 0) + (dirData.st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021 || 0);
  const sommaRisorseVariabiliDir =
    (dirData.va_art57c2b_CCNL2020_risorseLeggeSponsor || 0) + (dirData.va_art57c2d_CCNL2020_sommeOnnicomprensivita || 0) + (dirData.va_art57c2e_CCNL2020_risorseAutonomeVariabili || 0) + (dirData.va_art57c3_CCNL2020_residuiAnnoPrecedente || 0) + (dirData.va_dl13_2023_art8c3_incrementoPNRR || 0) + (dirData.va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020 || 0) + (dirData.va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023 || 0) + (dirData.va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione || 0) + (dirData.va_art33c2_DL34_2019_incrementoDeroga || 0) + (dirData.va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021 || 0) + (dirData.va_compensiExLege_rilevanti || 0) + (dirData.va_compensiExLege_nonRilevanti || 0);
  const lim_adjustments = (dirData.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016 || 0) - (dirData.lim_art4_DL16_2014_misureMancatoRispettoVincoli || 0);
  const stabile = FinancialMath.safe(sommaRisorseStabiliDir + lim_adjustments);
  const variabile = FinancialMath.safe(sommaRisorseVariabiliDir);
  return { stabile, variabile, totale: FinancialMath.sumAll(stabile, variabile) };
};

/**
 * Calcola i componenti derivanti dal CCNL 2024.
 */
export const calculateCcnl2024Components = (ccnl2024: Ccnl2024Settings | undefined) => {
  const ccnl2024Increases: FundComponent[] = [];
  const ccnl2024VariableIncreases: FundComponent[] = [];
  let ccnl2024_fad_stabile = 0;
  let ccnl2024_fad_variabile = 0;
  let ccnl2024_eq_stabile = 0;
  let ccnl2024_eq_variabile = 0;

  if (ccnl2024) {
    const ccnlResults = calculateCcnl2024Increases(ccnl2024);

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

    ccnl2024_fad_stabile = ccnlResults.split.personale.incrementoStabile2026 - ccnlResults.riduzioneConglobamento;
    ccnl2024_fad_variabile = ccnlResults.split.personale.incrementoVariabile2026 + ccnlResults.split.personale.incrementoVariabileOpzionaleDal2026 + ccnlResults.split.personale.incrementoVariabileOpzionaleSolo2026;
    ccnl2024_eq_stabile = ccnlResults.split.eq.incrementoStabile2026;
    ccnl2024_eq_variabile = ccnlResults.split.eq.incrementoVariabile2026 + ccnlResults.split.eq.incrementoVariabileOpzionaleDal2026 + ccnlResults.split.eq.incrementoVariabileOpzionaleSolo2026;
  }

  return {
    ccnl2024Increases,
    ccnl2024VariableIncreases,
    ccnl2024_fad_stabile,
    ccnl2024_fad_variabile,
    ccnl2024_eq_stabile,
    ccnl2024_eq_variabile
  };
};
