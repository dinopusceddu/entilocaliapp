import {
  FundData,
  CalculationResult,
  ComplianceCheck,
  DistribuzioneRisorseData,
  RisorsaVariabileDetail,
  FondoAccessorioDipendenteData,
  NormativeData
} from '../domain';

import { formatCurrency } from '../utils/formatters.ts';
import { resolveDL25IncrementValue } from './calculation/fundCalculations';

/**
 * Interfaccia interna per mappare fonti e usi vincolati in modo tipizzato.
 */
interface VincoloMapping {
  fonteKey: keyof FondoAccessorioDipendenteData;
  usoKey?: keyof DistribuzioneRisorseData;
  usoKeys?: (keyof DistribuzioneRisorseData)[];
  descrizione: string;
  riferimento: string;
}

/**
 * Verifica la corrispondenza tra le fonti di finanziamento vincolate e il loro utilizzo nella distribuzione delle risorse.
 * @param {FundData} fundData - I dati completi del fondo.
 * @returns {ComplianceCheck[]} Un array di controlli di conformità relativi alle risorse vincolate.
 */
const verificaCorrispondenzaRisorseVincolate = (fundData: FundData): ComplianceCheck[] => {
  const { fondoAccessorioDipendenteData, distribuzioneRisorseData } = fundData;
  if (!fondoAccessorioDipendenteData || !distribuzioneRisorseData) return [];
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
    },
    {
      fonteKey: 'vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti',
      usoKeys: ['p_compensiAvvocatura', 'p_incentiviContoTerzi'],
      descrizione: 'Corrispondenza Risorse Spese Giudizio e Censimenti (ISTAT)',
      riferimento: 'Art. 67 c.3c CCNL 2018',
    }
  ];

  for (const mapping of MAPPINGS_FONTI_USI_VINCOLATI) {
    const fonteImporto = (fondoAccessorioDipendenteData[mapping.fonteKey] as number) || 0;

    let usoImporto = 0;
    if (mapping.usoKey) {
      const detail = distribuzioneRisorseData[mapping.usoKey] as RisorsaVariabileDetail | undefined;
      usoImporto = detail?.stanziate || 0;
    } else if (mapping.usoKeys) {
      usoImporto = mapping.usoKeys.reduce((sum: number, key) => {
        const detail = distribuzioneRisorseData[key] as RisorsaVariabileDetail | undefined;
        return sum + (detail?.stanziate || 0);
      }, 0);
    }

    const id = `corrispondenza_${mapping.fonteKey}`;
    const valoreAttuale = `Fonte: ${formatCurrency(fonteImporto)}, Uso: ${formatCurrency(usoImporto)}`;

    const gruppoMatch = 'Corrispondenza voci a destinazione vincolata tra costituzione e distribuzione';

    const isAggregated = mapping.fonteKey === 'vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti';
    const postillaAggregato = isAggregated 
      ? " [Nota: il controllo è aggregato; non garantisce il presidio atomico delle due voci in quanto il modello dati attuale le accorpa]." 
      : "";

    if (usoImporto > fonteImporto) {
      results.push({
        id,
        descrizione: mapping.descrizione,
        isCompliant: false,
        valoreAttuale,
        limite: `Uso <= Fonte`,
        messaggio: `L'importo distribuito per questa finalità (${formatCurrency(usoImporto)}) supera la fonte dedicata (${formatCurrency(fonteImporto)}). Questo costituisce un'errata imputazione delle risorse.${postillaAggregato}`,
        riferimentoNormativo: mapping.riferimento,
        gravita: 'error',
        relatedPage: 'distribuzioneRisorse',
        gruppo: gruppoMatch,
      });
    } else if (fonteImporto > 0 && usoImporto < fonteImporto) {
      results.push({
        id,
        descrizione: mapping.descrizione,
        isCompliant: true,
        valoreAttuale,
        limite: `Uso <= Fonte`,
        messaggio: `Non tutte le risorse della fonte dedicata (${formatCurrency(fonteImporto)}) sono state allocate per questa finalità. Si suggerisce di verificare la corretta allocazione di ${formatCurrency(fonteImporto - usoImporto)}.${postillaAggregato}`,
        riferimentoNormativo: mapping.riferimento,
        gravita: 'warning',
        relatedPage: 'distribuzioneRisorse',
        gruppo: gruppoMatch,
      });
    } else {
      results.push({
        id,
        descrizione: mapping.descrizione,
        isCompliant: true,
        valoreAttuale,
        limite: `Uso <= Fonte`,
        messaggio: `Le risorse stanziate corrispondono a quelle allocate.${postillaAggregato}`,
        riferimentoNormativo: mapping.riferimento,
        gravita: 'info',
        gruppo: gruppoMatch,
      });
    }
  }

  return results;
};

/**
 * Esegue tutti i controlli di conformità normativa sul fondo calcolato e sui dati di input.
 * @param {CalculationResult} calculationResult - L'oggetto del fondo calcolato.
 * @param {FundData} fundData - I dati completi inseriti dall'utente.
 * @param {NormativeData} normativeData - I dati normativi.
 * @returns {ComplianceCheck[]} Un array di oggetti che rappresentano i risultati di ogni controllo.
 */
export const runAllComplianceChecks = (calculationResult: CalculationResult, fundData: FundData, normativeData: NormativeData): ComplianceCheck[] => {
  let checks: ComplianceCheck[] = [];
  const { annualData, fondoAccessorioDipendenteData, fondoElevateQualificazioniData, distribuzioneRisorseData } = fundData;
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
      riferimentoNormativo: String(riferimenti_normativi.art23_dlgs75_2017),
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

  const valoreInserito = fondoAccessorioDipendenteData?.st_art79c1c_incrementoStabileConsistenzaPers;
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

  // 3. Controllo Conglobamento Indennità di Comparto 2026
  if (annualData.annoRiferimento >= 2026) {
    const decurtazioneComparto = fondoAccessorioDipendenteData?.st_art60c2_CCNL2026_decurtazioneIndennitaComparto || 0;
    if (decurtazioneComparto === 0) {
       checks.push({
         id: 'decurtazione_indennita_comparto_2026_mancante',
         descrizione: "Conglobamento indennità di comparto 2026",
         isCompliant: false,
         valoreAttuale: "0,00",
         limite: "> 0",
         messaggio: "Dall'anno 2026 è prevista la decurtazione del fondo (parte stabile) per il conglobamento dell'indennità di comparto. Il valore risulta zero o assente. [Nota: controllo parziale basato su presenza voce].",
         riferimentoNormativo: "Art. 60 c.2 CCNL 23.02.2026",
         gravita: 'warning',
         relatedPage: 'fondoAccessorioDipendente',
       });
    } else {
       checks.push({
         id: 'decurtazione_indennita_comparto_2026_presente',
         descrizione: "Conglobamento indennità di comparto 2026",
         isCompliant: true,
         valoreAttuale: formatCurrency(Math.abs(decurtazioneComparto)),
         limite: "> 0",
         messaggio: "Rilevata decurtazione per il conglobamento dell'indennità di comparto. [Nota: controllo di livello intermedio, non garantisce la congruità matematica esatta].",
         riferimentoNormativo: "Art. 60 c.2 CCNL 23.02.2026",
         gravita: 'info',
       });
    }
  }

  // 4. Controllo Incremento 0,22% (art. 58, comma 2, CCNL 23.02.2026)
  const ms2021 = annualData.ccnl2024?.monteSalari2021 || 0;
  const annoRif = annualData.annoRiferimento ?? 2026;
  const countYears = Number(annoRif) === 2026 ? 2 : 1;
  const limiteMax022Percentuale = 0.22 * countYears;
  const limiteMax022Importo = ms2021 * (limiteMax022Percentuale / 100);

  const quotaFondo022 = fondoAccessorioDipendenteData?.vn_art58c2_CCNL2026_incremento022_MS2021 || 0;
  const quotaEQ022 = fondoElevateQualificazioniData?.va_incremento022_ms2021_eq || 0;
  const totaleStanziato022 = quotaFondo022 + quotaEQ022;

  if (totaleStanziato022 > 0 || ms2021 > 0) {
    if (ms2021 === 0) {
      checks.push({
        id: 'incremento_022_ms_mancante',
        descrizione: "Verifica incremento art. 58, comma 2, CCNL 23.02.2026 — 0,22% MS 2021",
        isCompliant: false,
        valoreAttuale: formatCurrency(totaleStanziato022),
        limite: "?",
        messaggio: "È stato inserito un incremento dello 0,22%, ma il Monte Salari 2021 non è valorizzato nei parametri generali.",
        riferimentoNormativo: "Art. 58 c. 2 CCNL 23.02.2026",
        gravita: 'warning',
        relatedPage: 'parameters',
      });
    } else {
      const is022Compliant = totaleStanziato022 <= limiteMax022Importo + 0.01;
      checks.push({
        id: 'incremento_022_complessivo',
        descrizione: "Verifica incremento art. 58, comma 2, CCNL 23.02.2026 — 0,22% MS 2021",
        isCompliant: is022Compliant,
        valoreAttuale: formatCurrency(totaleStanziato022),
        limite: formatCurrency(limiteMax022Importo),
        messaggio: is022Compliant
          ? `L'incremento stanziato è conforme al limite massimo operativo. Dettagli: Monte salari 2021: ${formatCurrency(ms2021)} | Limite annuo 0,22%: ${formatCurrency(ms2021 * 0.0022)} | Annualità considerate: ${countYears} | Limite massimo operativo dell'anno: ${formatCurrency(limiteMax022Importo)} | Importo effettivo stanziato: ${formatCurrency(totaleStanziato022)} (Quota Fondo: ${formatCurrency(quotaFondo022)}, Quota EQ: ${formatCurrency(quotaEQ022)}) | Esito: conforme.`
          : `L'incremento stanziato supera il limite massimo operativo dell'anno. Dettagli: Monte salari 2021: ${formatCurrency(ms2021)} | Limite annuo 0,22%: ${formatCurrency(ms2021 * 0.0022)} | Annualità considerate: ${countYears} | Limite massimo operativo dell'anno: ${formatCurrency(limiteMax022Importo)} | Importo effettivo stanziato: ${formatCurrency(totaleStanziato022)} (Quota Fondo: ${formatCurrency(quotaFondo022)}, Quota EQ: ${formatCurrency(quotaEQ022)}) | Esito: superato.`,
        riferimentoNormativo: "Art. 58 c. 2 CCNL 23.02.2026",
        gravita: is022Compliant ? 'info' : 'error',
        relatedPage: 'fondoAccessorioDipendente',
      });
    }
  }

  // 5. Controllo Incremento 0,14% Stabile
  const limite014 = ms2021 * 0.0014;
  const inc014 = fondoAccessorioDipendenteData?.st_art58c1_CCNL2026_incremento014_MS2021 || 0;

  if (inc014 > 0) {
    if (ms2021 === 0) {
      checks.push({
        id: 'incremento_014_ms_mancante',
        descrizione: "Incremento 0,14% - Monte Salari 2021 assente",
        isCompliant: false,
        valoreAttuale: formatCurrency(inc014),
        limite: "?",
        messaggio: "È stato inserito un incremento dello 0,14%, ma il Monte Salari 2021 non è valorizzato nei parametri generali.",
        riferimentoNormativo: "Art. 58 c.1 CCNL 23.02.2026",
        gravita: 'warning',
        relatedPage: 'parameters',
      });
    } else if (inc014 > limite014 + 0.01) {
      checks.push({
        id: 'incremento_014_supera_limite',
        descrizione: "Incremento 0,14% supera il limite calcolato",
        isCompliant: false,
        valoreAttuale: formatCurrency(inc014),
        limite: formatCurrency(limite014),
        messaggio: `L'incremento stabile inserito (${formatCurrency(inc014)}) supera lo 0,14% del Monte Salari 2021 (${formatCurrency(limite014)}).`,
        riferimentoNormativo: "Art. 58 c.1 CCNL 23.02.2026",
        gravita: 'error',
        relatedPage: 'fondoAccessorioDipendente',
      });
    }
  }

  // 6. Verifica Limite 48% (D.L. 25/2025)
  const spesaTab2023 = fundData.historicalData.spesaStipendiTabellari2023 || 0;
  // Risoluzione Alias per conformità (Stessa logica del motore di calcolo)
  const incrementoDL25 = resolveDL25IncrementValue(fondoAccessorioDipendenteData || {});

  if (incrementoDL25 > 0) {
    if (spesaTab2023 === 0) {
      checks.push({
        id: 'limite_48_tabellare_mancante',
        descrizione: "Verifica Limite 48% - Spesa Tabellare 2023 assente",
        isCompliant: false,
        valoreAttuale: formatCurrency(incrementoDL25),
        limite: "48% Tab. 2023",
        messaggio: "Incremento D.L. 25/2025 inserito, ma manca la Spesa Tabellare 2023 per verificare il limite del 48%.",
        riferimentoNormativo: "Art. 14 c. 1-bis D.L. 25/2025",
        gravita: 'warning',
        relatedPage: 'historicalData',
      });
    } else {
      const fondoStabileDip = calculationResult.fondi.dipendente.summary.totaleStabile || 0;
      const fondoEQ = (fundData.fondoElevateQualificazioniData.ris_fondoPO2017 || 0) + 
                      (fundData.fondoElevateQualificazioniData.ris_incrementoConRiduzioneFondoDipendenti || 0) + 
                      (fundData.fondoElevateQualificazioniData.ris_incrementoLimiteArt23c2_DL34 || 0);
      const numeratore = fondoStabileDip + fondoEQ;
      const rapporto = (numeratore / spesaTab2023) * 100;

      if (rapporto > 48.005) {
        checks.push({
          id: 'superamento_limite_48',
          descrizione: "Superamento Limite 48% (D.L. 25/2025)",
          isCompliant: false,
          valoreAttuale: `${rapporto.toFixed(2)}%`,
          limite: "48,00%",
          messaggio: `Il rapporto tra risorse stabili (Fondo Dip. + EQ: ${formatCurrency(numeratore)}) e spesa tabellare 2023 (${formatCurrency(spesaTab2023)}) è pari al ${rapporto.toFixed(2)}%, superando il limite del 48%.`,
          riferimentoNormativo: "Art. 14 c. 1-bis D.L. 25/2025",
          gravita: 'error',
          relatedPage: 'fondoAccessorioDipendente',
        });
      } else {
        checks.push({
          id: 'rispetto_limite_48',
          descrizione: "Rispetto Limite 48% (D.L. 25/2025)",
          isCompliant: true,
          valoreAttuale: `${rapporto.toFixed(2)}%`,
          limite: "48,00%",
          messaggio: "Il rapporto tra risorse stabili e spesa tabellare 2023 è entro il limite del 48%.",
          riferimentoNormativo: "Art. 14 c. 1-bis D.L. 25/2025",
          gravita: 'info',
        });
      }
    }
  }

  // 7. Verifica Arretrati 2024-2025
  const arretrati = fondoAccessorioDipendenteData?.vn_art58_CCNL2026_arretrati2024_2025 || 0;
  if (arretrati > 0) {
    checks.push({
      id: 'verifica_arretrati_2024_2025',
      descrizione: "Arretrati CCNL 2026 (Parte Variabile)",
      isCompliant: true,
      valoreAttuale: formatCurrency(arretrati),
      limite: "Variabile",
      messaggio: "Gli arretrati 2024-2025 sono stati correttamente inseriti nella parte variabile del fondo.",
      riferimentoNormativo: "Art. 58 CCNL 23.02.2026",
      gravita: 'info',
    });
  }

  // Controlli che si attivano solo in modalità distribuzione
  if (annualData.isDistributionMode) {
    const risorseDaDistribuire = calculationResult.fondi.dipendente.summary.totaleFondo;
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
          const value = data[key as keyof DistribuzioneRisorseData] as RisorsaVariabileDetail | undefined;
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

      // Controllo Differenziali Stipendiali finanziati da parte variabile
      const diffVariabili = data.p_diffStipendialiAnnoCorrente?.stanziate || 0;
      if (diffVariabili > 0) {
        checks.push({
          id: 'differenziali_stipendiali_variabili',
          descrizione: "Differenziali Stipendiali (DEP) in parte variabile",
          isCompliant: false,
          valoreAttuale: formatCurrency(diffVariabili),
          limite: "0,00",
          messaggio: "I differenziali stipendiali (progressioni economiche) sono stati allocati tra gli utilizzi della parte variabile. I differenziali devono essere finanziati esclusivamente con le risorse stabili del fondo.",
          riferimentoNormativo: "Principio di finanziamento stabile delle progressioni (Art. 80 CCNL)",
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

        // Determiniamo il totale dei dipendenti dell'ente (dalla tab annualData/dipendenti in servizio)
        const numDipendenti = annualData.ccnl2024?.personaleInServizio01012026 ??
          annualData.personaleServizioAttuale.reduce((sum, item) => sum + (item.count || 0), 0);

        const isArt48Applicable = numDipendenti > 5;

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
    if (totaleFondoEQ > 0 && fondoElevateQualificazioniData) {
      const posizioneOrdinaria = fondoElevateQualificazioniData.st_art16c2_retribuzionePosizione || 0;
      const risultatoStanziatoEQ = fondoElevateQualificazioniData.va_art16c3_retribuzioneRisultato || 0;

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

    checks = [...checks, ...verificaCorrispondenzaRisorseVincolate(fundData)];
  }

  const maxIncrementoSimulatore = annualData.simulatoreRisultati?.fase5_incrementoNettoEffettivoFondo;
  if (maxIncrementoSimulatore !== undefined && maxIncrementoSimulatore > 0) {
    const incrementoInserito = resolveDL25IncrementValue(fondoAccessorioDipendenteData || {});
    if (incrementoInserito > maxIncrementoSimulatore) {
      checks.push({
        id: 'coerenza_simulatore_decreto_pa',
        descrizione: "Incoerenza tra Simulatore e Incremento D.L. 25/2025",
        isCompliant: false,
        valoreAttuale: formatCurrency(incrementoInserito),
        limite: formatCurrency(maxIncrementoSimulatore),
        messaggio: "L'incremento D.L. 25/2025 inserito nel fondo dipendenti supera il valore massimo calcolato dal simulatore.",
        riferimentoNormativo: String(riferimenti_normativi.art14_dl25_2025),
        gravita: 'warning',
        relatedPage: 'fondoAccessorioDipendente',
      });
    }
  }

  return checks;
};
