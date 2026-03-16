// ============================================================
// compensiTypes.ts
// Tipi per il Calcolatore Compensi Delegato
// Riferimenti normativi: CCNL Funzioni Locali 21.05.2018,
//   CCNL Funzioni Locali 16.11.2022,
//   CCNL Funzioni Locali 23.02.2026 (CCNL 2022-2024)
// ============================================================

/**
 * Fase contrattuale che determina le tabelle stipendiali da applicare.
 * - CCNL_2019_2021: Tabellari 2018 consolidati con incrementi 2019-2021
 * - TRANSIZIONE_2024_2025: Fase transitoria con adeguamenti CCNL 2022-2024
 * - REGIME_2026: Regime definitivo con nuovi tabellari CCNL 23.02.2026
 */
export enum FaseContrattuale {
  CCNL_2019_2021 = 'CCNL_2019_2021',
  TRANSIZIONE_2024_2025 = 'TRANSIZIONE_2024_2025',
  REGIME_2026 = 'REGIME_2026',
}

/**
 * Area contrattuale di appartenenza del dipendente.
 * Fonte: Art. 1 CCNL Funzioni Locali - Sistema di classificazione
 */
export enum AreaCCNL {
  OPERATORE = 'OPERATORE',
  OPERATORE_ESPERTO = 'OPERATORE_ESPERTO',
  ISTRUTTORE = 'ISTRUTTORE',
  FUNZIONARIO_EQ = 'FUNZIONARIO_EQ',
}

/**
 * Orario contrattuale settimanale.
 * Art. 72-73 CCNL 2019-2021.
 */
export enum TipoOrario {
  ORE_36 = 'ORE_36',
  ORE_35 = 'ORE_35',
  PART_TIME = 'PART_TIME',
}

/**
 * Tipologia di part-time per il calcolo delle ore supplementari.
 * Art. 62 CCNL 2019-2021 comma 1.
 */
export enum TipoPartTime {
  ORIZZONTALE = 'ORIZZONTALE',
  VERTICALE = 'VERTICALE',
  MISTO = 'MISTO',
}

/**
 * Tipologia di lavoro straordinario.
 * Art. 32 CCNL Funzioni Locali 2019-2021 (ex art. 38 CCNL 1999).
 * Percentuali su RBO (Retribuzione Oraria Base):
 * - Diurno: +15%
 * - Notturno: +30%
 * - Festivo: +30%
 * - Festivo-Notturno: +50%
 */
export enum TipoStraordinario {
  DIURNO = 'DIURNO',
  NOTTURNO = 'NOTTURNO',
  FESTIVO = 'FESTIVO',
  FESTIVO_NOTTURNO = 'FESTIVO_NOTTURNO',
}

/**
 * Tipologia di turno.
 * Art. 30 CCNL Funzioni Locali 2019-2021.
 * Percentuali su RT (Retribuzione di Turno):
 * - Diurno: +10%
 * - Notturno: +30%
 * - Festivo: +30%
 * - Festivo-Notturno: +50%
 * - Festivo Infrasettimanale: +100% per giornata intera (0:00-23:59)
 */
export enum TipoTurno {
  DIURNO = 'DIURNO',
  NOTTURNO = 'NOTTURNO',
  FESTIVO = 'FESTIVO',
  FESTIVO_NOTTURNO = 'FESTIVO_NOTTURNO',
  FESTIVO_INFRASETTIMANALE = 'FESTIVO_INFRASETTIMANALE',
}

/**
 * Indica se lo straordinario viene pagato o conferito alla banca delle ore.
 * Art. 33 CCNL 2019-2021: il dipendente può scegliere entro il 31 gennaio dell'anno successivo.
 */
export enum ModalitaRecuperoStraordinario {
  PAGAMENTO = 'PAGAMENTO',
  BANCA_ORE = 'BANCA_ORE',
}

/**
 * Imputazione contabile di una voce di compenso.
 * Utile per chi gestisce la contrattazione integrativa.
 */
export enum ImputazioneVoce {
  FONDO_RISORSE_DECENTRATE = 'FONDO_RISORSE_DECENTRATE',
  BILANCIO = 'BILANCIO',
}

// ---------------------------------------------------------------
// Interfacce di Input
// ---------------------------------------------------------------

export interface OrePerTipoStraordinario {
  [TipoStraordinario.DIURNO]?: number;
  [TipoStraordinario.NOTTURNO]?: number;
  [TipoStraordinario.FESTIVO]?: number;
  [TipoStraordinario.FESTIVO_NOTTURNO]?: number;
}

export interface OrePerTipoTurno {
  [TipoTurno.DIURNO]?: number;
  [TipoTurno.NOTTURNO]?: number;
  [TipoTurno.FESTIVO]?: number;
  [TipoTurno.FESTIVO_NOTTURNO]?: number;
  [TipoTurno.FESTIVO_INFRASETTIMANALE]?: number;
}

/**
 * Tutti i dati di input necessari per il calcolo dei compensi.
 */
export interface InputCompensatore {
  // Contesto temporale
  annoRiferimento: number;
  meseRiferimento: number;          // 1-12
  faseContrattuale: FaseContrattuale;

  // Profilo professionale
  area: AreaCCNL;
  posizioneEconomica: string;       // Es. "C3", "D4", "B5"

  // Voci retributive aggiuntive (art. 74 CCNL 2019-2021)
  ria?: number;                     // Retribuzione Individuale di Anzianità (mensile)
  assegnoPersonaleNonRiassorbibile?: number; // APNR mensile
  indennitaPosizioneEQ?: number;    // Solo per FUNZIONARIO_EQ che detiene incarico EQ

  // Orario di lavoro
  tipoOrario: TipoOrario;
  percentualePartTime?: number;     // 0-100, solo se PART_TIME
  tipoPartTime?: TipoPartTime;      // Solo se PART_TIME

  // Straordinario
  orePerStraordinario: OrePerTipoStraordinario;
  modalitaRecuperoStraordinario: ModalitaRecuperoStraordinario;

  // Supplementare (solo per part-time)
  oreSupplementariEntro25?: number;  // Ore entro 25% delle ore concordate
  oreSupplementariOltre25?: number;  // Ore oltre 25% delle ore concordate

  // Turni
  orePerTurno: OrePerTipoTurno;
}

// ---------------------------------------------------------------
// Interfacce di Output
// ---------------------------------------------------------------

/**
 * Singola riga nel riepilogo dei compensi calcolati.
 */
export interface RigaRiepilogo {
  voce: string;                     // Descrizione della voce
  riferimentoNormativo: string;     // Es. "Art. 32 CCNL 2019-2021"
  ore: number;
  valoreOrario: number;             // Valore orario base
  maggiorazionePercentuale: number; // Es. 0.15 per 15%
  totale: number;                   // = ore * valoreOrario * (1 + maggiorazione) o formula specifica
  imputazione: ImputazioneVoce;
  note?: string;
}

/**
 * Riepilogo delle retribuzioni base calcolate (utile per verifica sindacale).
 */
export interface RetribuzioniBase {
  stipendioTabellare: number;       // Stipendio tabellare mensile
  ria: number;                      // RIA mensile
  assegnoPersonale: number;         // APNR mensile
  indennitaPosizioneEQ: number;     // Indennità posizione EQ mensile

  // Art. 73 CCNL 2019-2021
  retribuzioneMensileBase: number;   // Solo stipendio tabellare
  retribuzioneIndividuale: number;   // Tabellare + RIA + APNR
  retribuzioneGlobaleDiFatto: number; // Tutto incluso

  // Retribuzioni orarie
  divisoreOrario: number;            // 156 o 151.66 o proporzionale per PT
  rbo: number;                       // Retribuzione Oraria Base (per straordinario, art. 32)
  rog: number;                       // Retribuzione Oraria Globale di Fatto (per supplementare, art. 62)
  rt: number;                        // Retribuzione Oraria di Turno (per turni, art. 30)
}

/**
 * Output completo del calcolatore.
 */
export interface RisultatoCompensatore {
  retribuzioniBase: RetribuzioniBase;

  righeStrordinario: RigaRiepilogo[];
  righeSupplementare: RigaRiepilogo[];
  righeTurni: RigaRiepilogo[];

  totaleStrordinario: number;
  totaleSupplementare: number;
  totaleTurni: number;
  totaleComplessivo: number;

  noteBancaOre?: string;
}
