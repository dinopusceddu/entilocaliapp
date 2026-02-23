// src/logic/complianceChecks.ts
import {
  FundData,
  CalculatedFund,
  ComplianceCheck,
  DistribuzioneRisorseData,
  RisorsaVariabileDetail,
  FondoElevateQualificazioniData,
  NormativeData
} from '../types';

import { formatCurrency } from '../utils/formatters.ts';

/**
 * Verifica la corrispondenza tra le fonti di finanziamento vincolate e il loro utilizzo nella distribuzione delle risorse.
 * @param {FundData} fundData - I dati completi del fondo.
 * @returns {ComplianceCheck[]} Un array di controlli di conformità relativi alle risorse vincolate.
 */
const verificaCorrispondenzaRisorseVincolate = (fundData: FundData): ComplianceCheck[] => {
  const { fondoAccessorioDipendenteData, distribuzioneRisorseData } = fundData;
  const results: ComplianceCheck[] = [];

  const MAPPINGS_FONTI_USI_VINCOLATI = [
    {
      fonteKey: 'vn_art54_art67c3f_rimborsoSpeseNotifica',
      usoKey: 'p_compensiMessiNotificatori',
      descrizione: 'Corrispondenza Risorse Messi Notificatori',
      riferimento: 'Art. 54 CCNL 01.04.1999',
    },
    {
      fonteKey: 'vs_art67c3g_personaleCaseGioco',
      usoKey: 'p_compensiCaseGioco',
      descrizione: 'Corrispondenza Risorse Personale Case da Gioco',
      riferimento: 'Art. 67 c.3g CCNL 2018',
    },
    {
      fonteKey: 'vn_l145_art1c1091_incentiviRiscossioneIMUTARI',
      usoKey: 'p_incentiviIMUTARI',
      descrizione: 'Corrispondenza Risorse Incentivi IMU/TARI',
      riferimento: 'L. 145/2018 Art.1 c.1091',
    },
    {
      fonteKey: 'vn_art15c1k_art67c3c_incentiviTecniciCondoni',
      usoKeys: ['p_incentiviFunzioniTecnichePost2018', 'p_incentiviCondonoFunzioniTecnichePre2018'],
      descrizione: 'Corrispondenza Risorse Incentivi Funzioni Tecniche',
      riferimento: 'Art. 45 D.Lgs 36/2023',
    }
  ];

  for (const mapping of MAPPINGS_FONTI_USI_VINCOLATI) {
    const fonteImporto = (fondoAccessorioDipendenteData as any)[mapping.fonteKey] as number || 0;

    let usoImporto = 0;
    // @ts-ignore
    if (mapping.usoKey) {
      // @ts-ignore
      usoImporto = ((distribuzioneRisorseData as any)[mapping.usoKey] as RisorsaVariabileDetail)?.stanziate || 0;
      // @ts-ignore
    } else if (mapping.usoKeys) {
      // @ts-ignore
      usoImporto = mapping.usoKeys.reduce((sum: number, key: string) => {
        const importo = ((distribuzioneRisorseData as any)[key] as RisorsaVariabileDetail)?.stanziate || 0;
        return sum + importo;
      }, 0);
    }

    const id = `corrispondenza_${mapping.fonteKey}`;
    const valoreAttuale = `Fonte: ${formatCurrency(fonteImporto)}, Uso: ${formatCurrency(usoImporto)}`;

    if (usoImporto > fonteImporto) {
      results.push({
        id,
        descrizione: mapping.descrizione,
        isCompliant: false,
        valoreAttuale,
        limite: `Uso <= Fonte`,
        messaggio: `L'importo distribuito per questa finalità (${formatCurrency(usoImporto)}) supera la fonte dedicata (${formatCurrency(fonteImporto)}). Questo costituisce un'errata imputazione delle risorse.`,
        riferimentoNormativo: mapping.riferimento,
        gravita: 'error',
        relatedPage: 'distribuzioneRisorse',
      });
    } else if (fonteImporto > 0 && usoImporto < fonteImporto) {
      results.push({
        id,
        descrizione: mapping.descrizione,
        isCompliant: true,
        valoreAttuale,
        limite: `Uso <= Fonte`,
        messaggio: `Non tutte le risorse della fonte dedicata (${formatCurrency(fonteImporto)}) sono state allocate per questa finalità. Si suggerisce di verificare la corretta allocazione di ${formatCurrency(fonteImporto - usoImporto)}.`,
        riferimentoNormativo: mapping.riferimento,
        gravita: 'warning',
        relatedPage: 'distribuzioneRisorse',
      });
    } else {
      results.push({
        id,
        descrizione: mapping.descrizione,
        isCompliant: true,
        valoreAttuale,
        limite: `Uso <= Fonte`,
        messaggio: "Le risorse stanziate corrispondono a quelle allocate.",
        riferimentoNormativo: mapping.riferimento,
        gravita: 'info',
      });
    }
  }

  return results;
};

/**
 * Esegue tutti i controlli di conformità normativa sul fondo calcolato e sui dati di input.
 * @param {CalculatedFund} calculatedFund - L'oggetto del fondo calcolato.
 * @param {FundData} fundData - I dati completi inseriti dall'utente.
 * @param {NormativeData} normativeData - I dati normativi.
 * @returns {ComplianceCheck[]} Un array di oggetti che rappresentano i risultati di ogni controllo.
 */
export const runAllComplianceChecks = (calculatedFund: CalculatedFund, fundData: FundData, normativeData: NormativeData): ComplianceCheck[] => {
  let checks: ComplianceCheck[] = [];
  const { annualData, fondoAccessorioDipendenteData, fondoElevateQualificazioniData, distribuzioneRisorseData } = fundData;
  const { riferimenti_normativi } = normativeData;

  // 1. Verifica Limite Art. 23, comma 2, D.Lgs. 75/2017
  const limite2016 = calculatedFund.limiteArt23C2Modificato ?? calculatedFund.fondoBase2016;
  const ammontareSoggettoAlLimite = calculatedFund.totaleRisorseSoggetteAlLimiteDaFondiSpecifici;
  const superamento = calculatedFund.superamentoLimite2016;

  if (superamento && superamento > 0) {
    checks.push({
      id: 'limite_art23_c2',
      descrizione: "Superamento limite Art. 23 c.2 D.Lgs. 75/2017 (Fondo 2016)",
      isCompliant: false,
      valoreAttuale: formatCurrency(ammontareSoggettoAlLimite),
      limite: formatCurrency(limite2016),
      messaggio: `Rilevato superamento del limite di ${formatCurrency(superamento)}. È necessario applicare una riduzione di pari importo su uno o più fondi per rispettare il vincolo.`,
      // FIX: Casted to string to fix type error
      riferimentoNormativo: riferimenti_normativi.art23_dlgs75_2017 as string,
      gravita: 'error',
      relatedPage: 'fundDetails',
    });
  } else {
    checks.push({
      id: 'limite_art23_c2',
      descrizione: "Rispetto limite Art. 23 c.2 D.Lgs. 75/2017 (Fondo 2016)",
      isCompliant: true,
      valoreAttuale: formatCurrency(ammontareSoggettoAlLimite),
      limite: formatCurrency(limite2016),
      messaggio: "Il totale delle risorse soggette al limite dei fondi specifici rispetta il tetto storico del 2016 (come modificato).",
      // FIX: Casted to string to fix type error
      riferimentoNormativo: riferimenti_normativi.art23_dlgs75_2017 as string,
      gravita: 'info',
    });
  }

  // 2. Verifica dell'incremento per consistenza organica
  const { fondoPersonaleNonDirEQ2018_Art23 } = fundData.historicalData;
  const { personale2018PerArt23, personaleAnnoRifPerArt23 } = fundData.annualData;

  const dipendentiEquivalenti2018_art79c1c = (personale2018PerArt23 || []).reduce((sum, emp) => sum + ((emp.partTimePercentage || 100) / 100), 0);
  const dipendentiEquivalentiAnnoRif_art79c1c = (personaleAnnoRifPerArt23 || []).reduce((sum, emp) => {
    const ptPerc = (emp.partTimePercentage || 100) / 100;
    const cedoliniRatio = emp.cedoliniEmessi !== undefined && emp.cedoliniEmessi > 0 && emp.cedoliniEmessi <= 12 ? emp.cedoliniEmessi / 12 : 1;
    return sum + (ptPerc * cedoliniRatio);
  }, 0);
  const variazioneDipendenti_art79c1c = dipendentiEquivalentiAnnoRif_art79c1c - dipendentiEquivalenti2018_art79c1c;
  let valoreMedioProCapite_art79c1c = 0;
  if ((fondoPersonaleNonDirEQ2018_Art23 || 0) > 0 && dipendentiEquivalenti2018_art79c1c > 0) {
    valoreMedioProCapite_art79c1c = (fondoPersonaleNonDirEQ2018_Art23 || 0) / dipendentiEquivalenti2018_art79c1c;
  }
  const incrementoCalcolatoPerArt79c1c = Math.max(0, valoreMedioProCapite_art79c1c * variazioneDipendenti_art79c1c);
  const roundedIncremento = Math.round((incrementoCalcolatoPerArt79c1c + Number.EPSILON) * 100) / 100;

  const valoreInserito = fundData.fondoAccessorioDipendenteData?.st_art79c1c_incrementoStabileConsistenzaPers;
  const differenza = valoreInserito !== undefined ? roundedIncremento - valoreInserito : 0;

  if (roundedIncremento > 0) {
    if (valoreInserito === undefined || differenza > 0.005) {
      checks.push({
        id: 'verifica_incremento_consistenza',
        descrizione: "Verifica dell'incremento per aumento della consistenza organica",
        isCompliant: false,
        valoreAttuale: formatCurrency(valoreInserito),
        limite: `Calcolato: ${formatCurrency(roundedIncremento)}`,
        messaggio: `L'importo inserito è inferiore di ${formatCurrency(differenza)} rispetto a quanto calcolato. Si potrebbe non utilizzare a pieno le risorse disponibili per l'incremento.`,
        riferimentoNormativo: "Art. 79 c.1c CCNL 16.11.2022",
        gravita: 'warning',
        relatedPage: 'fondoAccessorioDipendente',
      });
    } else {
      checks.push({
        id: 'verifica_incremento_consistenza',
        descrizione: "Verifica dell'incremento per aumento della consistenza organica",
        isCompliant: true,
        valoreAttuale: formatCurrency(valoreInserito),
        limite: `Calcolato: ${formatCurrency(roundedIncremento)}`,
        messaggio: "L'importo inserito è conforme a quanto calcolato per l'incremento.",
        riferimentoNormativo: "Art. 79 c.1c CCNL 16.11.2022",
        gravita: 'info',
      });
    }
  }

  // Controlli che si attivano solo in modalità distribuzione
  if (annualData.isDistributionMode) {
    const risorseDaDistribuire = calculatedFund.dettaglioFondi.dipendente.totale;
    if (risorseDaDistribuire > 0) {
      const data = distribuzioneRisorseData || ({} as DistribuzioneRisorseData);
      const utilizziParteStabile =
        (data.u_diffProgressioniStoriche || 0) +
        (data.u_indennitaComparto || 0) +
        (data.u_incrIndennitaEducatori?.stanziate || 0) +
        (data.u_incrIndennitaScolastico?.stanziate || 0) +
        (data.u_indennitaEx8QF?.stanziate || 0);

      const utilizziParteVariabile = Object.keys(data)
        .filter(key => key.startsWith('p_'))
        .reduce((sum, key) => {
          const value = (data as any)[key] as RisorsaVariabileDetail | undefined;
          return sum + (value?.stanziate || 0);
        }, 0);

      const totaleAllocato = utilizziParteStabile + utilizziParteVariabile;
      const importoRimanente = risorseDaDistribuire - totaleAllocato;
      const importoDisponibileContrattazione = risorseDaDistribuire - utilizziParteStabile;

      if (utilizziParteStabile > risorseDaDistribuire) {
        checks.push({
          id: 'distribuzione_stabile_supera_totale',
          descrizione: "Costi Parte Stabile superano le Risorse Disponibili",
          isCompliant: false,
          valoreAttuale: formatCurrency(utilizziParteStabile),
          limite: formatCurrency(risorseDaDistribuire),
          messaggio: `I costi fissi della Parte Stabile superano il totale da distribuire. Impossibile procedere con l'allocazione della parte variabile.`,
          riferimentoNormativo: "Principi di corretta gestione finanziaria",
          gravita: 'error',
          relatedPage: 'distribuzioneRisorse',
        });
      }

      if (importoRimanente < -0.005) { // Tolleranza per errori di arrotondamento
        checks.push({
          id: 'distribuzione_superamento_budget',
          descrizione: "Superamento del budget nella Distribuzione Risorse Dipendenti",
          isCompliant: false,
          valoreAttuale: formatCurrency(totaleAllocato),
          limite: formatCurrency(risorseDaDistribuire),
          messaggio: `L'importo totale allocato per il personale dipendente supera le risorse disponibili di ${formatCurrency(Math.abs(importoRimanente))}.`,
          riferimentoNormativo: "Art. 80 CCNL 16.11.2022",
          gravita: 'error',
          relatedPage: 'distribuzioneRisorse',
        });
      } else {
        checks.push({
          id: 'distribuzione_rispetto_budget',
          descrizione: "Rispetto del budget nella Distribuzione Risorse Dipendenti",
          isCompliant: true,
          valoreAttuale: formatCurrency(totaleAllocato),
          limite: formatCurrency(risorseDaDistribuire),
          messaggio: `L'allocazione delle risorse per il personale dipendente rispetta il budget. Rimanenza: ${formatCurrency(importoRimanente)}.`,
          riferimentoNormativo: "Art. 80 CCNL 16.11.2022",
          gravita: 'info',
        });
      }

      if (importoDisponibileContrattazione > 0) {
        const totalePerformanceIndividuale =
          (data.p_performanceIndividuale?.stanziate || 0) +
          (data.p_maggiorazionePerformanceIndividuale?.stanziate || 0);

        const limiteMinimo30 = importoDisponibileContrattazione * 0.30;
        const isCompliant = totalePerformanceIndividuale >= limiteMinimo30;

        checks.push({
          id: 'verifica_quota_minima_performance_individuale',
          descrizione: "Verifica Quota Minima Performance Individuale (Art. 80 CCNL 2022)",
          isCompliant,
          valoreAttuale: formatCurrency(totalePerformanceIndividuale),
          limite: `≥ ${formatCurrency(limiteMinimo30)}`,
          messaggio: isCompliant
            ? "La quota destinata alla performance individuale (inclusa maggiorazione) rispetta il minimo del 30% delle risorse disponibili alla contrattazione."
            : "La quota destinata alla performance individuale (inclusa maggiorazione) è inferiore al minimo obbligatorio del 30% delle risorse disponibili alla contrattazione.",
          riferimentoNormativo: "Art. 80, c. penultimo, CCNL 16.11.2022",
          gravita: isCompliant ? 'info' : 'error',
          relatedPage: 'distribuzioneRisorse',
        });
      }
    }

    const totaleFondoEQ = calculatedFund.dettaglioFondi.eq.totale;
    if (totaleFondoEQ > 0) {
      // FIX: Casted to FondoElevateQualificazioniData to resolve type error.
      const eqData = fondoElevateQualificazioniData || ({} as FondoElevateQualificazioniData);

      const posizioneOrdinaria = (eqData.st_art17c2_retribuzionePosizione || 0) + (eqData.u_art17_posizioneOrdinaria_finanziata022MS || 0);
      const posizioneSpecifica = (eqData.st_art17c3_retribuzionePosizioneArt16c4 || 0);
      const risultatoStanziatoEQ = (eqData.va_art17c4_retribuzioneRisultato || 0) + (eqData.u_art17_risultatoOrdinario_finanziato022MS || 0);
      const interimTotale = (eqData.st_art17c5_interimEQ || 0) + (eqData.u_art17_interim_finanziato022MS || 0);

      const sommaDistribuzioneFondoEQ =
        posizioneOrdinaria +
        posizioneSpecifica +
        interimTotale +
        (eqData.st_art23c5_maggiorazioneSedi || 0) +
        risultatoStanziatoEQ;

      if (sommaDistribuzioneFondoEQ > totaleFondoEQ) {
        checks.push({
          id: 'distribuzione_eq_superamento_budget',
          descrizione: "Superamento budget nella Distribuzione Risorse EQ",
          isCompliant: false,
          valoreAttuale: formatCurrency(sommaDistribuzioneFondoEQ),
          limite: formatCurrency(totaleFondoEQ),
          messaggio: `La somma delle retribuzioni di posizione e risultato per le EQ supera il fondo disponibile di ${formatCurrency(sommaDistribuzioneFondoEQ - totaleFondoEQ)}.`,
          riferimentoNormativo: "Principi di corretta gestione finanziaria",
          gravita: 'error',
          relatedPage: 'distribuzioneRisorse',
        });
      }

      // Check range posizione ordinaria (5k - 22k)
      if (posizioneOrdinaria > 0 && (posizioneOrdinaria < 5000 || posizioneOrdinaria > 22000)) {
        checks.push({
          id: 'verifica_range_posizione_eq',
          descrizione: "Range Retribuzione Posizione Ordinaria EQ",
          isCompliant: false,
          valoreAttuale: formatCurrency(posizioneOrdinaria),
          limite: "5.000€ - 22.000€",
          messaggio: "La retribuzione di posizione ordinaria deve essere compresa tra 5.000€ e 22.000€.",
          riferimentoNormativo: "CCNL 2022-2024",
          gravita: 'warning',
          relatedPage: 'distribuzioneRisorse',
        });
      }

      // Check range posizione specifica (3k - 9.5k)
      if (posizioneSpecifica > 0 && (posizioneSpecifica < 3000 || posizioneSpecifica > 9500)) {
        checks.push({
          id: 'verifica_range_posizione_specifica_eq',
          descrizione: "Range Retribuzione Posizione Incarichi Specifici EQ",
          isCompliant: false,
          valoreAttuale: formatCurrency(posizioneSpecifica),
          limite: "3.000€ - 9.500€",
          messaggio: "La retribuzione per incarichi specifici deve essere compresa tra 3.000€ e 9.500€.",
          riferimentoNormativo: "CCNL 2022-2024",
          gravita: 'warning',
          relatedPage: 'distribuzioneRisorse',
        });
      }

      // Check Interim
      if (interimTotale > 0) {
        checks.push({
          id: 'verifica_interim_eq',
          descrizione: "Vincoli su Interim EQ",
          isCompliant: true,
          valoreAttuale: formatCurrency(interimTotale),
          limite: "15% - 25%",
          messaggio: "Verificare che la maggiorazione per interim sia compresa tra il 15% e il 25% della retribuzione di posizione dell'incarico ad interim.",
          riferimentoNormativo: "CCNL 2022-2024",
          gravita: 'info',
        });
      }

      const budgetDisponibilePosRes = totaleFondoEQ;
      const minimoRisultatoEQ = budgetDisponibilePosRes * 0.15;

      if (risultatoStanziatoEQ < minimoRisultatoEQ && budgetDisponibilePosRes > 0) {
        checks.push({
          id: 'verifica_quota_minima_risultato_eq',
          descrizione: "Verifica quota minima Retribuzione di Risultato EQ",
          isCompliant: false,
          valoreAttuale: formatCurrency(risultatoStanziatoEQ),
          limite: `≥ ${formatCurrency(minimoRisultatoEQ)}`,
          messaggio: "La quota destinata alla retribuzione di risultato è inferiore al 15% delle risorse destinate complessivamente a posizione e risultato.",
          riferimentoNormativo: "CCNL 2022-2024",
          gravita: 'warning',
          relatedPage: 'distribuzioneRisorse',
        });
      }
    }

    checks = [...checks, ...verificaCorrispondenzaRisorseVincolate(fundData)];
  }

  const maxIncrementoSimulatore = annualData.simulatoreRisultati?.fase5_incrementoNettoEffettivoFondo;
  if (maxIncrementoSimulatore !== undefined && maxIncrementoSimulatore > 0) {
    const incrementoInserito = fondoAccessorioDipendenteData?.st_incrementoDecretoPA || 0;
    if (incrementoInserito > maxIncrementoSimulatore) {
      checks.push({
        id: 'coerenza_simulatore_decreto_pa',
        descrizione: "Incoerenza tra Simulatore e Incremento Decreto PA",
        isCompliant: false,
        valoreAttuale: formatCurrency(incrementoInserito),
        limite: formatCurrency(maxIncrementoSimulatore),
        messaggio: "L'incremento Decreto PA inserito nel fondo dipendenti supera il valore massimo calcolato dal simulatore.",
        riferimentoNormativo: riferimenti_normativi.art14_dl25_2025 as string,
        gravita: 'warning',
        relatedPage: 'fondoAccessorioDipendente',
      });
    }
  }

  return checks;
};
