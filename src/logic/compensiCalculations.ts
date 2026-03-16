// ============================================================
// compensiCalculations.ts
// Logica di calcolo compensi per lavoro straordinario,
// supplementare e indennità di turno.
//
// CCNL Funzioni Locali 21.05.2018 (2019-2021):
//   Art. 29-33: Lavoro straordinario
//   Art. 30:    Indennità di turno
//   Art. 62:    Lavoro supplementare (part-time)
//   Art. 73-74: Struttura della retribuzione
//   Art. 84-bis: Banca delle ore
//
// Aggiornamenti economici CCNL 23.02.2026 (quadriennio 2022-2024):
//   Nuovi tabellari stipendiali per area/posizione
//   Conglobamento indennità di comparto nelle nuove tabelle
// ============================================================

import {
  AreaCCNL,
  FaseContrattuale,
  TipoOrario,
  TipoStraordinario,
  TipoTurno,
  TipoPartTime,
  ModalitaRecuperoStraordinario,
  ImputazioneVoce,
  InputCompensatore,
  RetribuzioniBase,
  RigaRiepilogo,
  RisultatoCompensatore,
} from '../types/compensiTypes';

// ---------------------------------------------------------------
// 1. PARAMETRI CCNL (configurabili — NON hardcoded arbitrariamente)
//    Esportati per consentire verifica sindacale dal codice.
// ---------------------------------------------------------------

/**
 * Parametri normativi del CCNL Funzioni Locali.
 * Modificabili senza toccare la logica di calcolo.
 */
export const PARAMETRI_CCNL = {
  /**
   * Divisori per calcolo retribuzione oraria.
   * Art. 73 c.2 CCNL 2019-2021:
   *   - 156 per orario 36h (36 * 13 / 3 = divisore mensile)
   *   - 151.66 per orario 35h
   */
  divisoreOrdinario36h: 156,
  divisoreOrdinario35h: 151.66,

  /**
   * Straordinario — Art. 32 CCNL Funzioni Locali 2019-2021.
   * La maggiorazione si applica su RBO (Retribuzione Oraria Base).
   */
  straordDiurno: 0.15,          // +15%
  straordNotturno: 0.30,        // +30%
  straordFestivo: 0.30,         // +30%
  straordFestivoNotturno: 0.50, // +50%

  /**
   * Lavoro supplementare — Art. 62 CCNL 2019-2021.
   * Applicata su ROG (Retribuzione Oraria Globale di Fatto).
   * "Entro" = nelle prime ore pari al 25% dell'orario concordato.
   * "Oltre" = ore eccedenti il 25%.
   */
  supplementareEntro25: 0.15, // +15%
  supplementareOltre25: 0.25, // +25%

  /**
   * Indennità di turno — Art. 30 CCNL 2019-2021.
   * Applicata su RT (Retribuzione Oraria di Turno).
   */
  turnoDiurno: 0.10,                   // +10%
  turnoNotturno: 0.30,                 // +30%
  turnoFestivo: 0.30,                  // +30%
  turnoFestivoNotturno: 0.50,          // +50%
  /**
   * Festivo infrasettimanale (ex festività abolite o festivo coincidente
   * con giorno infrasettimanale): +100% per l'intera giornata 0:00-23:59.
   * Art. 30 c.3 CCNL 2019-2021.
   */
  turnoFestivoInfrasettimanale: 1.00,  // +100%
};

// ---------------------------------------------------------------
// 2. TABELLE STIPENDIALI
// ---------------------------------------------------------------

/**
 * Stipendi tabellari mensili (in euro) per posizione economica.
 * Fonte: Allegato A — CCNL Funzioni Locali 21.05.2018 consolidato 2021.
 * I valori sono lordi mensili (su 13 mensilità).
 *
 * NB: Con il CCNL 2022-2024 (CCNL 23.02.2026) l'indennità di comparto
 * viene "conglobata" nel tabellare. I nuovi valori aumentano di conseguenza.
 */
export const STIPENDI_TABELLARI: Record<FaseContrattuale, Record<AreaCCNL, Record<string, number>>> = {
  // ----- FASE 1: CCNL 2019-2021 -----
  [FaseContrattuale.CCNL_2019_2021]: {
    [AreaCCNL.OPERATORE]: {
      A1: 1340.00, A2: 1365.00, A3: 1395.00, A4: 1425.00, A5: 1455.00, A6: 1490.00,
    },
    [AreaCCNL.OPERATORE_ESPERTO]: {
      B1: 1470.00, B2: 1513.00, B3: 1565.00, B4: 1618.00, B5: 1670.00,
      B6: 1723.00, B7: 1775.00, B8: 1830.00,
    },
    [AreaCCNL.ISTRUTTORE]: {
      C1: 1698.00, C2: 1754.00, C3: 1810.00, C4: 1867.00, C5: 1924.00, C6: 1981.00,
    },
    [AreaCCNL.FUNZIONARIO_EQ]: {
      D1: 1980.00, D2: 2054.00, D3: 2127.00, D4: 2200.00, D5: 2272.00, D6: 2346.00, D7: 2419.00,
    },
  },

  // ----- FASE 2: Transizione 2024-2025 -----
  // Applicazione parziale nuovi tabellari con IVC conglobata dal 01.01.2024.
  // I valori sono orientativi sulla base delle ipotesi contrattuali disponibili.
  [FaseContrattuale.TRANSIZIONE_2024_2025]: {
    [AreaCCNL.OPERATORE]: {
      A1: 1477.00, A2: 1505.00, A3: 1538.00, A4: 1571.00, A5: 1604.00, A6: 1642.00,
    },
    [AreaCCNL.OPERATORE_ESPERTO]: {
      B1: 1621.00, B2: 1668.00, B3: 1725.00, B4: 1782.00, B5: 1839.00,
      B6: 1898.00, B7: 1956.00, B8: 2017.00,
    },
    [AreaCCNL.ISTRUTTORE]: {
      C1: 1874.00, C2: 1936.00, C3: 1998.00, C4: 2060.00, C5: 2123.00, C6: 2187.00,
    },
    [AreaCCNL.FUNZIONARIO_EQ]: {
      D1: 2186.00, D2: 2268.00, D3: 2349.00, D4: 2430.00, D5: 2510.00, D6: 2592.00, D7: 2673.00,
    },
  },

  // ----- FASE 3: Regime 2026 (CCNL 23.02.2026) -----
  // Nuovi tabellari a regime con completamento incrementi art. 3 CCNL 2022-2024.
  [FaseContrattuale.REGIME_2026]: {
    [AreaCCNL.OPERATORE]: {
      A1: 1535.00, A2: 1564.00, A3: 1598.00, A4: 1633.00, A5: 1668.00, A6: 1707.00,
    },
    [AreaCCNL.OPERATORE_ESPERTO]: {
      B1: 1685.00, B2: 1733.00, B3: 1792.00, B4: 1851.00, B5: 1910.00,
      B6: 1971.00, B7: 2031.00, B8: 2094.00,
    },
    [AreaCCNL.ISTRUTTORE]: {
      C1: 1946.00, C2: 2010.00, C3: 2074.00, C4: 2138.00, C5: 2203.00, C6: 2269.00,
    },
    [AreaCCNL.FUNZIONARIO_EQ]: {
      D1: 2270.00, D2: 2354.00, D3: 2438.00, D4: 2522.00, D5: 2605.00, D6: 2689.00, D7: 2772.00,
    },
  },
};

// ---------------------------------------------------------------
// 3. FUNZIONI AUSILIARIE
// ---------------------------------------------------------------

/**
 * Calcola il divisore orario mensile in base al tipo di orario.
 * Art. 73 c.2 CCNL 2019-2021.
 *
 * Per il part-time orizzontale il divisore è proporzionale:
 *   divisore = divisore_fulltime * (percentualePartTime / 100)
 * Per part-time verticale/misto il divisore rimane quello full-time
 * (le ore supplementari si calcolano sulle ore effettive del ciclo).
 */
function calcolaDivisore(
  tipoOrario: TipoOrario,
  percentualePartTime: number = 100,
  tipoPartTime: TipoPartTime = TipoPartTime.ORIZZONTALE
): number {
  const divisoreBase = tipoOrario === TipoOrario.ORE_35
    ? PARAMETRI_CCNL.divisoreOrdinario35h
    : PARAMETRI_CCNL.divisoreOrdinario36h;

  if (tipoOrario === TipoOrario.PART_TIME) {
    if (tipoPartTime === TipoPartTime.ORIZZONTALE) {
      return divisoreBase * (percentualePartTime / 100);
    }
    // Per verticale e misto il divisore è quello pieno:
    // le ore supplementari si rapportano al ciclo di lavoro effettivo.
    return divisoreBase;
  }

  return divisoreBase;
}

/**
 * Recupera lo stipendio tabellare per fase contrattuale, area e posizione.
 */
function getStipendioTabellare(
  fase: FaseContrattuale,
  area: AreaCCNL,
  posizione: string
): number {
  return STIPENDI_TABELLARI[fase]?.[area]?.[posizione] ?? 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------
// 4. CALCOLO RETRIBUZIONI BASE (Art. 73-74 CCNL 2019-2021)
// ---------------------------------------------------------------

/**
 * Calcola la struttura retributiva mensile e oraria del dipendente.
 *
 * Art. 73 CCNL 2019-2021 — Struttura della retribuzione:
 *   c.1: la retribuzione si compone di: stipendio tabellare, RIA, APNR, indennità integrativa speciale
 *   c.2: divisore orario = 156 (36h) o 151,66 (35h)
 *
 * Art. 74 CCNL 2019-2021 — Retribuzione globale di fatto:
 *   Include: stipendio tabellare + RIA + APNR + indennità di posizione EQ + altri assegni fissi.
 */
export function calcolaRetribuzioniBase(input: InputCompensatore): RetribuzioniBase {
  const stipendioTabellare = getStipendioTabellare(
    input.faseContrattuale,
    input.area,
    input.posizioneEconomica
  );
  const ria = input.ria ?? 0;
  const assegnoPersonale = input.assegnoPersonaleNonRiassorbibile ?? 0;
  const indennitaPosizioneEQ = input.indennitaPosizioneEQ ?? 0;

  // Art. 73 c.1: Retribuzione mensile base = solo stipendio tabellare
  const retribuzioneMensileBase = stipendioTabellare;

  // Retribuzione individuale = tabellare + RIA + assegno personale
  const retribuzioneIndividuale = stipendioTabellare + ria + assegnoPersonale;

  // Art. 74: Retribuzione globale di fatto = individuale + indennità posizione EQ
  const retribuzioneGlobaleDiFatto = retribuzioneIndividuale + indennitaPosizioneEQ;

  const divisoreOrario = calcolaDivisore(
    input.tipoOrario,
    input.percentualePartTime,
    input.tipoPartTime
  );

  // RBO: Retribuzione Oraria Base — usata per lo straordinario (art. 32)
  // Base = stipendio tabellare + RIA + assegno personale
  const rbo = round2(retribuzioneIndividuale / divisoreOrario);

  // ROG: Retribuzione Oraria Globale di Fatto — usata per supplementare (art. 62)
  const rog = round2(retribuzioneGlobaleDiFatto / divisoreOrario);

  // RT: Retribuzione Oraria di Turno — = RBO (art. 30)
  // In molte applicazioni si usa uguale alla RBO; alcune interpretazioni includono anche
  // l'indennità di turno fissa se prevista da regolamento. Usiamo RBO = RT.
  const rt = rbo;

  return {
    stipendioTabellare,
    ria,
    assegnoPersonale,
    indennitaPosizioneEQ,
    retribuzioneMensileBase,
    retribuzioneIndividuale,
    retribuzioneGlobaleDiFatto,
    divisoreOrario,
    rbo,
    rog,
    rt,
  };
}

// ---------------------------------------------------------------
// 5. CALCOLO STRAORDINARIO (Art. 32 CCNL 2019-2021)
// ---------------------------------------------------------------

interface DescrizioneStraordinario {
  label: string;
  normativa: string;
  maggiorazione: number;
}

const DESCRIZIONI_STRAORDINARIO: Record<TipoStraordinario, DescrizioneStraordinario> = {
  [TipoStraordinario.DIURNO]: {
    label: 'Straordinario diurno',
    normativa: 'Art. 32 c.1a CCNL FL 2019-2021',
    maggiorazione: PARAMETRI_CCNL.straordDiurno,
  },
  [TipoStraordinario.NOTTURNO]: {
    label: 'Straordinario notturno',
    normativa: 'Art. 32 c.1b CCNL FL 2019-2021',
    maggiorazione: PARAMETRI_CCNL.straordNotturno,
  },
  [TipoStraordinario.FESTIVO]: {
    label: 'Straordinario festivo',
    normativa: 'Art. 32 c.1c CCNL FL 2019-2021',
    maggiorazione: PARAMETRI_CCNL.straordFestivo,
  },
  [TipoStraordinario.FESTIVO_NOTTURNO]: {
    label: 'Straordinario festivo-notturno',
    normativa: 'Art. 32 c.1d CCNL FL 2019-2021',
    maggiorazione: PARAMETRI_CCNL.straordFestivoNotturno,
  },
};

/**
 * Calcola i compensi per lavoro straordinario.
 * Art. 32 CCNL Funzioni Locali 2019-2021.
 *
 * Imputazione: Fondo risorse decentrate (parte variabile).
 *
 * Se il dipendente sceglie la banca delle ore (art. 33), le ore non vengono
 * pagate ma accumulate. Viene restituita una riga informativa.
 */
export function calcolaStraordinario(
  input: InputCompensatore,
  retribuzioni: RetribuzioniBase
): RigaRiepilogo[] {
  if (input.tipoOrario === TipoOrario.PART_TIME) return []; // Per part-time non esiste straordinario

  const righe: RigaRiepilogo[] = [];

  for (const tipo of Object.values(TipoStraordinario)) {
    const ore = input.orePerStraordinario[tipo] ?? 0;
    if (ore <= 0) continue;

    const { label, normativa, maggiorazione } = DESCRIZIONI_STRAORDINARIO[tipo];
    const valoreOrarioMaggiorato = round2(retribuzioni.rbo * (1 + maggiorazione));
    const totale = round2(valoreOrarioMaggiorato * ore);

    if (input.modalitaRecuperoStraordinario === ModalitaRecuperoStraordinario.BANCA_ORE) {
      righe.push({
        voce: `${label} → Banca Ore`,
        riferimentoNormativo: `Art. 33 CCNL FL 2019-2021 (Banca Ore)`,
        ore,
        valoreOrario: retribuzioni.rbo,
        maggiorazionePercentuale: maggiorazione,
        totale: 0, // Non pagato — accumulato come riposo compensativo
        imputazione: ImputazioneVoce.FONDO_RISORSE_DECENTRATE,
        note: `Ore accantonate in banca ore. Totale teorico non erogato: € ${totale.toFixed(2)}`,
      });
    } else {
      righe.push({
        voce: label,
        riferimentoNormativo: normativa,
        ore,
        valoreOrario: retribuzioni.rbo,
        maggiorazionePercentuale: maggiorazione,
        totale,
        imputazione: ImputazioneVoce.FONDO_RISORSE_DECENTRATE,
      });
    }
  }

  return righe;
}

// ---------------------------------------------------------------
// 6. CALCOLO LAVORO SUPPLEMENTARE (Art. 62 CCNL 2019-2021)
// ---------------------------------------------------------------

/**
 * Calcola i compensi per lavoro supplementare per dipendenti part-time.
 * Art. 62 CCNL Funzioni Locali 2019-2021.
 *
 * Le ore supplementari si applicano sulla ROG (art. 62 c.2).
 * - Entro il 25% delle ore concordate: maggiorazione 15%
 * - Oltre il 25%: maggiorazione 25%
 *
 * Per part-time verticale/misto: verificare il ciclo di riferimento.
 *
 * Imputazione: Fondo risorse decentrate (parte variabile).
 */
export function calcolaSupplementare(
  input: InputCompensatore,
  retribuzioni: RetribuzioniBase
): RigaRiepilogo[] {
  if (input.tipoOrario !== TipoOrario.PART_TIME) return [];

  const righe: RigaRiepilogo[] = [];

  const oreEntro = input.oreSupplementariEntro25 ?? 0;
  if (oreEntro > 0) {
    const valoreOrario = round2(retribuzioni.rog * (1 + PARAMETRI_CCNL.supplementareEntro25));
    righe.push({
      voce: 'Lavoro supplementare (entro 25% ore concordate)',
      riferimentoNormativo: 'Art. 62 c.2a CCNL FL 2019-2021',
      ore: oreEntro,
      valoreOrario: retribuzioni.rog,
      maggiorazionePercentuale: PARAMETRI_CCNL.supplementareEntro25,
      totale: round2(valoreOrario * oreEntro),
      imputazione: ImputazioneVoce.FONDO_RISORSE_DECENTRATE,
    });
  }

  const oreOltre = input.oreSupplementariOltre25 ?? 0;
  if (oreOltre > 0) {
    const valoreOrario = round2(retribuzioni.rog * (1 + PARAMETRI_CCNL.supplementareOltre25));
    righe.push({
      voce: 'Lavoro supplementare (oltre 25% ore concordate)',
      riferimentoNormativo: 'Art. 62 c.2b CCNL FL 2019-2021',
      ore: oreOltre,
      valoreOrario: retribuzioni.rog,
      maggiorazionePercentuale: PARAMETRI_CCNL.supplementareOltre25,
      totale: round2(valoreOrario * oreOltre),
      imputazione: ImputazioneVoce.FONDO_RISORSE_DECENTRATE,
    });
  }

  return righe;
}

// ---------------------------------------------------------------
// 7. CALCOLO INDENNITÀ DI TURNO (Art. 30 CCNL 2019-2021)
// ---------------------------------------------------------------

interface DescrizioneTurno {
  label: string;
  normativa: string;
  maggiorazione: number;
}

const DESCRIZIONI_TURNO: Record<TipoTurno, DescrizioneTurno> = {
  [TipoTurno.DIURNO]: {
    label: 'Turno diurno',
    normativa: 'Art. 30 c.1a CCNL FL 2019-2021',
    maggiorazione: PARAMETRI_CCNL.turnoDiurno,
  },
  [TipoTurno.NOTTURNO]: {
    label: 'Turno notturno',
    normativa: 'Art. 30 c.1b CCNL FL 2019-2021',
    maggiorazione: PARAMETRI_CCNL.turnoNotturno,
  },
  [TipoTurno.FESTIVO]: {
    label: 'Turno festivo',
    normativa: 'Art. 30 c.1c CCNL FL 2019-2021',
    maggiorazione: PARAMETRI_CCNL.turnoFestivo,
  },
  [TipoTurno.FESTIVO_NOTTURNO]: {
    label: 'Turno festivo-notturno',
    normativa: 'Art. 30 c.1d CCNL FL 2019-2021',
    maggiorazione: PARAMETRI_CCNL.turnoFestivoNotturno,
  },
  [TipoTurno.FESTIVO_INFRASETTIMANALE]: {
    label: 'Turno giornata festiva infrasettimanale (0:00–23:59)',
    normativa: 'Art. 30 c.3 CCNL FL 2019-2021',
    maggiorazione: PARAMETRI_CCNL.turnoFestivoInfrasettimanale,
  },
};

/**
 * Calcola i compensi per indennità di turno.
 * Art. 30 CCNL Funzioni Locali 2019-2021.
 *
 * Imputazione: Fondo risorse decentrate (parte variabile).
 *
 * Nota sul festivo infrasettimanale (art. 30 c.3):
 * Il dipendente che lavora in una giornata festiva infrasettimanale per l'intera durata
 * (0:00-23:59) matura un'indennità pari al 100% della RT per ciascuna ora lavorata.
 */
export function calcolaTurni(
  input: InputCompensatore,
  retribuzioni: RetribuzioniBase
): RigaRiepilogo[] {
  const righe: RigaRiepilogo[] = [];

  for (const tipo of Object.values(TipoTurno)) {
    const ore = input.orePerTurno[tipo] ?? 0;
    if (ore <= 0) continue;

    const { label, normativa, maggiorazione } = DESCRIZIONI_TURNO[tipo];
    const valoreOrarioMaggiorato = round2(retribuzioni.rt * (1 + maggiorazione));

    righe.push({
      voce: label,
      riferimentoNormativo: normativa,
      ore,
      valoreOrario: retribuzioni.rt,
      maggiorazionePercentuale: maggiorazione,
      totale: round2(valoreOrarioMaggiorato * ore),
      imputazione: ImputazioneVoce.FONDO_RISORSE_DECENTRATE,
    });
  }

  return righe;
}

// ---------------------------------------------------------------
// 8. FUNZIONE ENTRY POINT
// ---------------------------------------------------------------

/**
 * Calcola tutti i compensi per un dipendente in un dato periodo.
 * Funzione entry point che aggrega straordinario, supplementare e turni.
 */
export function calcolaCompensatore(input: InputCompensatore): RisultatoCompensatore {
  const retribuzioniBase = calcolaRetribuzioniBase(input);

  const righeStrordinario = calcolaStraordinario(input, retribuzioniBase);
  const righeSupplementare = calcolaSupplementare(input, retribuzioniBase);
  const righeTurni = calcolaTurni(input, retribuzioniBase);

  const totaleStrordinario = righeStrordinario.reduce((s, r) => s + r.totale, 0);
  const totaleSupplementare = righeSupplementare.reduce((s, r) => s + r.totale, 0);
  const totaleTurni = righeTurni.reduce((s, r) => s + r.totale, 0);

  const noteBancaOre = input.modalitaRecuperoStraordinario === ModalitaRecuperoStraordinario.BANCA_ORE
    ? 'Le ore di straordinario sono state conferite alla banca delle ore (Art. 33 CCNL 2019-2021). Il recupero dovrà avvenire entro il 31 marzo dell\'anno successivo, salvo accordo diverso.'
    : undefined;

  return {
    retribuzioniBase,
    righeStrordinario,
    righeSupplementare,
    righeTurni,
    totaleStrordinario: round2(totaleStrordinario),
    totaleSupplementare: round2(totaleSupplementare),
    totaleTurni: round2(totaleTurni),
    totaleComplessivo: round2(totaleStrordinario + totaleSupplementare + totaleTurni),
    noteBancaOre,
  };
}
