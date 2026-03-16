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
  InputCompensatore,
  RetribuzioniBase,
  RigaRiepilogo,
  RisultatoCompensatore,
  SezioneSpeciale,
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
 * Fonte: CCNL Funzioni Locali 23.02.2026 (Regime definitivo).
 */
export const STIPENDI_TABELLARI: Record<FaseContrattuale, Record<AreaCCNL, Record<string, number>>> = {
  [FaseContrattuale.REGIME_2026]: {
    [AreaCCNL.OPERATORE]: {
      A1: 1626.18, A2: 1646.09, A3: 1676.92, A4: 1703.19, A5: 1734.56, A6: 1762.22,
    },
    [AreaCCNL.OPERATORE_ESPERTO]: {
      B1: 1715.27, B2: 1740.37, B3: 1801.80, B4: 1826.09, B5: 1853.42,
      B6: 1883.64, B7: 1949.42, B8: 1989.26,
    },
    [AreaCCNL.ISTRUTTORE]: {
      C1: 1928.23, C2: 1969.37, C3: 2017.97, C4: 2074.75, C5: 2144.64, C6: 2200.07,
    },
    [AreaCCNL.FUNZIONARIO_EQ]: {
      D1: 2092.84, D2: 2184.14, D3: 2371.29, D4: 2462.70, D5: 2561.77, D6: 2727.66, D7: 2850.16,
    },
  },
};

/**
 * Valori annui lordi dei differenziali stipendiali per area.
 * Tabella A — CCNL 2022-2024.
 */
export const VALORI_DIFFERENZIALI_BASE: Record<AreaCCNL, number> = {
  [AreaCCNL.OPERATORE]: 550,
  [AreaCCNL.OPERATORE_ESPERTO]: 650,
  [AreaCCNL.ISTRUTTORE]: 750,
  [AreaCCNL.FUNZIONARIO_EQ]: 1600,
};

/**
 * Maggiorazioni sul valore annuo del differenziale per sezioni speciali.
 * Non cumulabili.
 */
export function getValoreAnnuoDifferenziale(area: AreaCCNL, sezione: SezioneSpeciale): number {
  let base = VALORI_DIFFERENZIALI_BASE[area];
  let incremento = 0;

  switch (sezione) {
    case SezioneSpeciale.PERSONALE_EDUCATIVO:
    case SezioneSpeciale.POLIZIA_LOCALE:
      if (area === AreaCCNL.ISTRUTTORE) incremento = 350;
      break;
    case SezioneSpeciale.ALBI_ORDINI_PROFESSIONALI:
    case SezioneSpeciale.SANITARIO_SOCIOSANITARIO:
      if (area === AreaCCNL.ISTRUTTORE) incremento = 150;
      if (area === AreaCCNL.FUNZIONARIO_EQ) incremento = 200;
      break;
  }

  return base + incremento;
}

/**
 * Valori mensili residui dell'indennità di comparto (Tabella C "uscita").
 * A carico del Fondo Risorse Decentrate, ma parte della retribuzione globale di fatto.
 */
export const INDENNITA_COMPARTO_RESIDUA: Record<AreaCCNL, number> = {
  [AreaCCNL.OPERATORE]: 22.68,
  [AreaCCNL.OPERATORE_ESPERTO]: 27.52,
  [AreaCCNL.ISTRUTTORE]: 32.06,
  [AreaCCNL.FUNZIONARIO_EQ]: 36.33,
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
  
  // Calcolo differenziali: (Valore Annuo / 13) * numero
  const valoreAnnuoSingoloDiff = getValoreAnnuoDifferenziale(input.area, input.sezioneSpeciale);
  const differenzialiAcquisiti = round2((valoreAnnuoSingoloDiff / 13) * input.numeroDifferenziali);

  const ria = input.ria ?? 0;
  const apnr = input.assegnoPersonaleNonRiassorbibile ?? 0;
  const apr = input.assegnoPersonaleRiassorbibile ?? 0;
  const indennitaPosizioneEQ = input.indennitaPosizioneEQ ?? 0;
  const altriAccessori = input.altriCompensiAccessoriMese ?? 0;

  // 1. Retribuzione BASE (Art. 74 c.2 lett. b) - Per Straordinario
  // Include: Tabellare + Differenziali + Assegni personali (NR e R)
  // Esclude: RIA, Comparto, Accessori
  const retribuzioneBase = round2(stipendioTabellare + differenzialiAcquisiti + apnr + apr);
  
  // Rateo 13esima su Base b: (Retribuzione Base) / 12
  const rateo13a = round2(retribuzioneBase / 12);

  const divisoreOrario = calcolaDivisore(
    input.tipoOrario,
    input.percentualePartTime,
    input.tipoPartTime
  );

  /**
   * RBO: Retribuzione Oraria Base — usata per lo straordinario.
   * Formula: (Retribuzione base mensile + rateo 13a) / divisoreOrario
   */
  const rbo = round2((retribuzioneBase + rateo13a) / divisoreOrario);

  // 2. Retribuzione INDIVIDUALE (Art. 74 c.2 lett. c) - Per Turni
  // Include: Base + RIA
  const retribuzioneIndividuale = round2(retribuzioneBase + ria);

  // RT: Retribuzione Oraria di Turno — Art. 30 c.1: calcolata su retribuzione individuale (senza 13a)
  const rt = round2(retribuzioneIndividuale / divisoreOrario);

  // 3. Retribuzione GLOBALE DI FATTO (Art. 74 c.2 lett. d) - Per Supplementare
  // Include: Individuale + Rateo 13a Individuale + Comparto + EQ + Altri Accessori
  const rateo13aIndividuale = round2(retribuzioneIndividuale / 12);
  const indennitaComparto = INDENNITA_COMPARTO_RESIDUA[input.area];
  
  const retribuzioneGlobaleDiFatto = round2(
    retribuzioneIndividuale + 
    rateo13aIndividuale + 
    indennitaPosizioneEQ + 
    indennitaComparto +
    altriAccessori
  );

  const rog = round2(retribuzioneGlobaleDiFatto / divisoreOrario);

  return {
    stipendioTabellare,
    differenzialiAcquisiti,
    ria,
    assegnoPersonale: apnr + apr,
    indennitaPosizioneEQ,
    rateo13a,
    retribuzioneMensileBase: retribuzioneBase,
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
    const valoreOrario = retribuzioni.rog;
    const maggiorazione = PARAMETRI_CCNL.supplementareEntro25;
    righe.push({
      voce: 'Ore supplementari entro il 25%',
      riferimentoNormativo: 'Art. 62 c.2a CCNL 2018',
      ore: oreEntro,
      valoreOrario,
      maggiorazionePercentuale: maggiorazione,
      totale: round2(valoreOrario * (1 + maggiorazione) * oreEntro),
    });
  }

  const oreOltre = input.oreSupplementariOltre25 ?? 0;
  if (oreOltre > 0) {
    const valoreOrario = retribuzioni.rog;
    const maggiorazione = PARAMETRI_CCNL.supplementareOltre25;
    righe.push({
      voce: 'Ore supplementari oltre il 25%',
      riferimentoNormativo: 'Art. 62 c.2b CCNL 2018',
      ore: oreOltre,
      valoreOrario,
      maggiorazionePercentuale: maggiorazione,
      totale: round2(valoreOrario * (1 + maggiorazione) * oreOltre),
    });
  }

  return righe;
}

// ---------------------------------------------------------------
// 7. CALCOLO INDENNITÀ DI TURNO (Art. 30 CCNL 2019-2021)
// ---------------------------------------------------------------

/**
 * Helper per ottenere la maggiorazione del turno.
 */
function getMaggiorazioneTurno(tipo: TipoTurno): number {
  switch (tipo) {
    case TipoTurno.DIURNO: return PARAMETRI_CCNL.turnoDiurno;
    case TipoTurno.NOTTURNO: return PARAMETRI_CCNL.turnoNotturno;
    case TipoTurno.FESTIVO: return PARAMETRI_CCNL.turnoFestivo;
    case TipoTurno.FESTIVO_NOTTURNO: return PARAMETRI_CCNL.turnoFestivoNotturno;
    case TipoTurno.FESTIVO_INFRASETTIMANALE: return PARAMETRI_CCNL.turnoFestivoInfrasettimanale;
    default: return 0;
  }
}

/**
 * Calcola i compensi per indennità di turno.
 * Artt. 30 e 74 CCNL Funzioni Locali 2022-2024.
 *
 * Maggiorazioni:
 * - Notturno: 30% della RT (Base / 156)
 * - Festivo infrasettimanale: 100% della RIM (Individuale / 156)
 * - Festivo / Riposo: 50%
 */
export function calcolaTurni(
  input: InputCompensatore,
  retribuzioni: RetribuzioniBase
): RigaRiepilogo[] {
  const righe: RigaRiepilogo[] = [];
  const baseOraria = retribuzioni.rt;
  const orePerTurno = input.orePerTurno;

  for (const [tipo, ore] of Object.entries(orePerTurno)) {
    if (!ore) continue;

    const maggiorazione = getMaggiorazioneTurno(tipo as TipoTurno);
    // Il turno è una maggiorazione oraria: valore = % del valore orario
    const totale = round2(baseOraria * maggiorazione * ore);

    righe.push({
      voce: `Indennità Turno ${tipo.replace('_', ' ')}`,
      riferimentoNormativo: 'Art. 30 CCNL 2018 / CCNL 2026',
      ore,
      valoreOrario: baseOraria,
      maggiorazionePercentuale: maggiorazione,
      totale,
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
