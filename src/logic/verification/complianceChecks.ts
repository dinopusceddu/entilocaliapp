import {
  NormalizedInput,
  CalculationResult,
  ComplianceCheck,
  DistribuzioneRisorseData,
  RisorsaVariabileDetail,
  NormativeData
} from '../../domain';

import { formatCurrency } from '../../utils/formatters.ts';

/**
 * Interfaccia interna per mappare fonti e usi vincolati in modo tipizzato.
 */
interface VincoloMapping {
  fonteKey: string; // keyof FondoAccessorioDipendenteData
  usoKey?: keyof DistribuzioneRisorseData;
  usoKeys?: (keyof DistribuzioneRisorseData)[];
  descrizione: string;
  riferimento: string;
}

/**
 * Verifica la corrispondenza tra le fonti di finanziamento vincolate e il loro utilizzo nella distribuzione delle risorse.
 * @param {NormalizedInput} input - L'input normalizzato.
 * @returns {ComplianceCheck[]} Un array di controlli di conformità relativi alle risorse vincolate.
 */
const verificaCorrispondenzaRisorseVincolate = (input: NormalizedInput): ComplianceCheck[] => {
  const { fondi, distribuzione } = input;
  const { dipendente } = fondi;
  
  const results: ComplianceCheck[] = [];

  const MAPPINGS_FONTI_USI_VINCOLATI: VincoloMapping[] = [
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
    const fonteImporto = (dipendente as any)[mapping.fonteKey] || 0;

    let usoImporto = 0;
    if (mapping.usoKey) {
      const detail = distribuzione[mapping.usoKey];
      usoImporto = (detail && typeof detail === 'object') ? (detail as RisorsaVariabileDetail).stanziate || 0 : 0;
    } else if (mapping.usoKeys) {
      usoImporto = mapping.usoKeys.reduce((sum: number, key) => {
        const detail = distribuzione[key];
        const val = (detail && typeof detail === 'object') ? (detail as RisorsaVariabileDetail).stanziate || 0 : 0;
        return sum + val;
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
 * @param {CalculationResult} calculationResult - L'oggetto del fondo calcolato.
 * @param {NormalizedInput} input - L'input normalizzato.
 * @param {NormativeData} normativeData - I dati normativi.
 * @returns {ComplianceCheck[]} Un array di oggetti che rappresentano i risultati di ogni controllo.
 */
export const runAllComplianceChecks = (
  calculationResult: CalculationResult, 
  input: NormalizedInput, 
  normativeData: NormativeData
): ComplianceCheck[] => {
  let checks: ComplianceCheck[] = [];
  const { annualData, fondi, distribuzione, calculatedInputs, historicalData } = input;
  const { riferimenti_normativi } = normativeData;

  // 1. Verifica Limite Art. 23, comma 2, D.Lgs. 75/2017
  const { limite, valoreSoggetto, delta } = calculationResult.compliance.art23c2;
  const superamento = delta < 0 ? Math.abs(delta) : 0;

  if (superamento && superamento > 0) {
    checks.push({
      id: 'limite_art23_c2',
      descrizione: "Superamento limite Art. 23 c.2 D.Lgs. 75/2017 (Fondo 2016)",
      isCompliant: false,
      valoreAttuale: formatCurrency(valoreSoggetto),
      limite: formatCurrency(limite),
      messaggio: `Rilevato superamento del limite di ${formatCurrency(superamento)}. È necessario applicare una riduzione di pari importo su uno o più fondi per rispettare il vincolo.`,
      riferimentoNormativo: riferimenti_normativi.art23_dlgs75_2017,
      gravita: 'error',
      relatedPage: 'fundDetails',
    });
  } else {
    checks.push({
      id: 'limite_art23_c2',
      descrizione: "Rispetto limite Art. 23 c.2 D.Lgs. 75/2017 (Fondo 2016)",
      isCompliant: true,
      valoreAttuale: formatCurrency(valoreSoggetto),
      limite: formatCurrency(limite),
      messaggio: "Il totale delle risorse soggette al limite dei fondi specifici rispetta il tetto storico del 2016 (come modificato).",
      riferimentoNormativo: String(riferimenti_normativi.art23_dlgs75_2017),
      gravita: 'info',
    });
  }

  // 2. Verifica dell'incremento per consistenza organica
  const { fondoPersonaleNonDirEQ2018_Art23 } = historicalData;
  const dipendentiEquivalenti2018_art79c1c = calculatedInputs.dipendentiEquivalenti2018;
  const variazioneDipendenti_art79c1c = calculatedInputs.variazioneDipendenti;
  
  let valoreMedioProCapite_art79c1c = 0;
  if ((fondoPersonaleNonDirEQ2018_Art23 || 0) > 0 && dipendentiEquivalenti2018_art79c1c > 0) {
    valoreMedioProCapite_art79c1c = (fondoPersonaleNonDirEQ2018_Art23 || 0) / dipendentiEquivalenti2018_art79c1c;
  }
  const incrementoCalcolatoPerArt79c1c = Math.max(0, valoreMedioProCapite_art79c1c * variazioneDipendenti_art79c1c);
  const roundedIncremento = Math.round((incrementoCalcolatoPerArt79c1c + Number.EPSILON) * 100) / 100;

  const valoreInserito = fondi.dipendente?.st_art79c1c_incrementoStabileConsistenzaPers;
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
    const risorseDaDistribuire = calculationResult.fondi.dipendente.summary.totaleFondo;
    if (risorseDaDistribuire > 0) {
      const data = distribuzione;
      const utilizziParteStabile =
        (data.u_diffProgressioniStoriche || 0) +
        (data.u_indennitaComparto || 0) +
        (data.u_incrIndennitaEducatori?.stanziate || 0) +
        (data.u_incrIndennitaScolastico?.stanziate || 0) +
        (data.u_indennitaEx8QF?.stanziate || 0);

      const utilizziParteVariabile = Object.keys(data)
        .filter(key => key.startsWith('p_'))
        .reduce((sum, key) => {
          const value = data[key as keyof DistribuzioneRisorseData];
          const val = (value && typeof value === 'object') ? (value as RisorsaVariabileDetail).stanziate || 0 : 0;
          return sum + val;
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
        const pIndividuale = data.p_performanceIndividuale?.stanziate || 0;
        const pMaggiorazione = data.p_maggiorazionePerformanceIndividuale?.stanziate || 0;

        // Determiniamo il totale dei dipendenti dell'ente (GIÀ CALCOLATO IN NORMALIZED INPUT)
        const numDipendenti = calculatedInputs.numDipendentiContrattazione;
        const isArt48Applicable = calculatedInputs.isArt48Applicabile;

        if (!isArt48Applicable) {
          checks.push({
            id: 'art48_applicabilita',
            descrizione: "Applicabilità Art. 48 (Differenziazione del premio)",
            isCompliant: true,
            valoreAttuale: `${numDipendenti} dipendenti`,
            limite: "> 5 dipendenti",
            messaggio: "L'ente ha un organico pari o inferiore a 5 dipendenti: l'istituto della differenziazione del premio (Art. 48) non trova applicazione (Errata Corrige ARAN).",
            riferimentoNormativo: "Art. 48 CCNL Funzioni Locali 23.02.2026",
            gravita: 'info',
            relatedPage: 'distribuzioneRisorse',
          });
        } else {
          // Indicatore 2: Soglia minima maggiorazione
          let minPercent = 30;
          if (numDipendenti <= 10) {
            minPercent = 25;
          }
          if (data.art48_applicaObiettiviEnte) {
            minPercent = 20;
          }

          const percImpostata = data.criteri_percMaggiorazionePremio || 0;
          const isSogliaCompliant = percImpostata >= minPercent;

          checks.push({
            id: 'art48_soglia_maggiorazione',
            descrizione: "Soglia minima maggiorazione premio individuale",
            isCompliant: isSogliaCompliant,
            valoreAttuale: `${percImpostata}%`,
            limite: `≥ ${minPercent}%`,
            messaggio: isSogliaCompliant
              ? `La maggiorazione impostata per l'incentivo rispetta il vincolo contrattuale minimo (${minPercent}%).`
              : `La maggiorazione impostata (${percImpostata}%) è inferiore alla soglia contrattuale minima applicabile del ${minPercent}% in base all'organico e/o obiettivi integrati.`,
            riferimentoNormativo: "Art. 48 CCNL Funzioni Locali 23.02.2026",
            gravita: isSogliaCompliant ? 'info' : 'error',
            relatedPage: 'distribuzioneRisorse',
          });

        }

        // Indicatore 4: Coerenza premio vs maggiorazione
        if (pMaggiorazione > 0 && pIndividuale === 0) {
          checks.push({
            id: 'art48_coerenza_premio',
            descrizione: "Coerenza maggiorazione performance individuale",
            isCompliant: false,
            valoreAttuale: `Premio Base: ${formatCurrency(pIndividuale)}, Maggiorazione: ${formatCurrency(pMaggiorazione)}`,
            limite: "Stanziato Base > 0",
            messaggio: "Attenzione: è stata allocata in bilancio una sommatoria per la maggiorazione del premio individuale, ma lo stanziamento del premio base risulta a zero. Verifica l'input della tabella di distribuzione.",
            riferimentoNormativo: "Coerenza di bilancio / Art. 48 CCNL Funzioni Locali 23.02.2026",
            gravita: 'warning',
            relatedPage: 'distribuzioneRisorse',
          });
        }
      }
    }

    const totaleFondoEQ = calculationResult.fondi.eq.summary.totaleFondo;
    if (totaleFondoEQ > 0) {
      const posizioneOrdinaria = fondi.eq.st_art16c2_retribuzionePosizione || 0;
      const risultatoStanziatoEQ = fondi.eq.va_art16c3_retribuzioneRisultato || 0;

      const sommaDistribuzioneFondoEQ = posizioneOrdinaria + risultatoStanziatoEQ;

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
          riferimentoNormativo: "CCNL Funzioni Locali 23.02.2026",
          gravita: 'warning',
          relatedPage: 'distribuzioneRisorse',
        });
      }
    }

    checks = [...checks, ...verificaCorrispondenzaRisorseVincolate(input)];
  }

  // 3. Verifica Limite 48% (D.L. 25/2025) - Risorse Stabili / Tabellari 2023
  const tabellari2023 = historicalData.spesaStipendiTabellari2023 || 0;
  if (tabellari2023 > 0) {
    const risorseStabiliGlobali = calculationResult.fondi.dipendente.summary.totaleStabile + calculationResult.fondi.eq.summary.totaleStabile;
    const rapporto = (risorseStabiliGlobali / tabellari2023) * 100;
    
    const isCompliant48 = rapporto <= 48.005; // Tolleranza arrotondamento
    checks.push({
      id: 'limite_48_percento',
      descrizione: "Verifica limite 48% (D.L. 25/2025)",
      isCompliant: isCompliant48,
      valoreAttuale: `${rapporto.toFixed(2)}%`,
      limite: "48.00%",
      messaggio: isCompliant48 
        ? "Il rapporto tra risorse stabili e stipendi tabellari 2023 rispetta il limite del 48%."
        : `Il totale delle risorse stabili (Dipendenti + EQ) supera il 48% degli stipendi tabellari 2023. Ai sensi dell'Art. 14 c. 1-bis D.L. 25/2025, l'incremento non può eccedere tale soglia.`,
      riferimentoNormativo: "Art. 14 c. 1-bis D.L. 25/2025",
      gravita: isCompliant48 ? 'info' : 'error',
      relatedPage: 'fundDetails'
    });
  }

  // 4. Verifica Limite 0,22% MS 2021 (Art. 58 c. 2)
  const ccnl2024 = annualData.ccnl2024;
  if (ccnl2024) {
    const percDal2026 = ccnl2024.optionalIncreaseVariableFrom2026Percentage || 0;
    const percSolo2026 = ccnl2024.optionalIncreaseVariable2026OnlyPercentage || 0;

    if (percDal2026 > 0.2201) {
      checks.push({
        id: 'limite_022_ms2021_permanente',
        descrizione: "Superamento limite 0,22% MS 2021 (Permanente)",
        isCompliant: false,
        valoreAttuale: `${percDal2026}%`,
        limite: "0.22%",
        messaggio: `L'incremento variabile opzionale permanente (${percDal2026}%) supera il limite massimo consentito dello 0,22%.`,
        riferimentoNormativo: "Art. 58 c. 2 CCNL 23.02.2026",
        gravita: 'error',
        relatedPage: 'ccnl2024Settings'
      });
    }

    if (percSolo2026 > 0.2201) {
      checks.push({
        id: 'limite_022_ms2021_una_tantum',
        descrizione: "Superamento limite 0,22% MS 2021 (Una Tantum)",
        isCompliant: false,
        valoreAttuale: `${percSolo2026}%`,
        limite: "0.22%",
        messaggio: `L'incremento variabile opzionale una tantum (${percSolo2026}%) supera il limite massimo consentito dello 0,22%.`,
        riferimentoNormativo: "Art. 58 c. 2 CCNL 23.02.2026",
        gravita: 'error',
        relatedPage: 'ccnl2024Settings'
      });
    }
  }

  const maxIncrementoSimulatore = annualData.simulatoreRisultati?.fase5_incrementoNettoEffettivoFondo;
  if (maxIncrementoSimulatore !== undefined && maxIncrementoSimulatore > 0) {
    const incrementoInserito = fondi.dipendente?.st_incrementoDL25_2025 || 0;
    if (incrementoInserito > maxIncrementoSimulatore) {
      checks.push({
        id: 'coerenza_simulatore_decreto_pa',
        descrizione: "Incoerenza tra Simulatore e Incremento Decreto PA",
        isCompliant: false,
        valoreAttuale: formatCurrency(incrementoInserito),
        limite: formatCurrency(maxIncrementoSimulatore),
        messaggio: "L'incremento Decreto PA inserito nel fondo dipendenti supera il valore massimo calcolato dal simulatore.",
        riferimentoNormativo: riferimenti_normativi.art14_dl25_2025,
        gravita: 'warning',
        relatedPage: 'fondoAccessorioDipendente',
      });
    }
  }

  return checks;
};
