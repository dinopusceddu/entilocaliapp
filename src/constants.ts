// constants.ts
import { UserRole, TipologiaEnte, LivelloPeo, TipoMaggiorazione, AreaQualifica } from './enums.ts';

export const APP_NAME = "Toolbox Funzioni Locali - Versione Beta 1.3";

export const DEFAULT_CURRENT_YEAR = new Date().getFullYear();

// FIX: Riferimenti normativi specifici per UI/logica che non sono nel JSON
export const RIF_DELIBERA_ENTE = "Delibera Ente / Disposizione Interna";

// FIX: Added missing normative references constants
export const RIF_ART45_DLGS36_2023 = "Art. 45 D.Lgs. 36/2023";
export const RIF_ART208_CDS = "Art. 208, D.Lgs. 285/1992";
export const RIF_ART14_DL25_2025 = "Art. 14, D.L. 25/2025";
export const RIF_DM_17_03_2020 = "DM 17/03/2020";
export const RIF_L296_06_C557 = "Art. 1, c. 557, L. 296/06";
export const RIF_INCREMENTO_DECRETO_PA = "DL PA / Misure Urgenti";
export const RIF_ART23_DLGS75_2017 = "Art. 23, c.2, D.Lgs. 75/2017";
export const RIF_ART8_DL13_2023 = "Art. 8, D.L. 13/2023";
export const RIF_ART7_C4_U_CCNL2022 = "Art. 7, c.4u, CCNL 16.11.2022";
export const RIF_ART79_CCNL2022 = "Art. 79, CCNL 16.11.2022";
export const RIF_ART33_DL34_2019 = "Art. 33, D.L. 34/2019";
export const RIF_CCNL_SEG_01032011_ART3C6 = "Art. 3, c.6, CCNL Segretari 01.03.2011";
export const RIF_CCNL_SEG_16072024_ART58C1 = "Art. 58, c.1, CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART60C1 = "Art. 60, c.1, CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART60C3 = "Art. 60, c.3, CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART60C5 = "Art. 60, c.5, CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART56C1G = "Art. 56, c.1g, CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART56C1H = "Art. 56, c.1h, CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART56C1F = "Art. 56, c.1f, CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART56C1I = "Art. 56, c.1i, CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART61C2 = "Art. 61, c.2, CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART61C2BIS = "Art. 61, c.2bis, CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART61C2TER = "Art. 61, c.2ter, CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART61C3 = "Art. 61, c.3, CCNL Segretari 16.07.2024";
export const RIF_CCNL_DIR_17122020_ART57C2A = "Art. 57, c.2a, CCNL Dirigenza 17.12.2020";
export const RIF_CCNL_DIR_17122020_ART56C1 = "Art. 56, c.1, CCNL Dirigenza 17.12.2020";
export const RIF_CCNL_DIR_17122020_ART57C2C = "Art. 57, c.2c, CCNL Dirigenza 17.12.2020";
export const RIF_CCNL_DIR_17122020_ART57C2E = "Art. 57, c.2e, CCNL Dirigenza 17.12.2020";
export const RIF_CCNL_DIR_16072024_ART39C1 = "Art. 39, c.1, CCNL Dirigenza 16.07.2024";
export const RIF_CCNL_DIR_17122020_ART57C2B = "Art. 57, c.2b, CCNL Dirigenza 17.12.2020";
export const RIF_CCNL_DIR_17122020_ART57C2D = "Art. 57, c.2d, CCNL Dirigenza 17.12.2020";
export const RIF_CCNL_DIR_17122020_ART57C3 = "Art. 57, c.3, CCNL Dirigenza 17.12.2020";
export const RIF_CCNL_DIR_16072024_ART39C2 = "Art. 39, c.2, CCNL Dirigenza 16.07.2024";
export const RIF_DL16_2014_ART4 = "Art. 4, DL 16/2014";
export const RIF_CCNL_DIR_2022_2024_ART24C1 = "Art. 24, c.1, CCNL Area Funzioni Locali 23.02.2026";
export const RIF_CCNL_DIR_2022_2024_ART24C2 = "Art. 24, c.2, CCNL Area Funzioni Locali 23.02.2026";
export const RIF_CCNL_DIR_2022_2024_ART24C3 = "Art. 24, c.3, CCNL Area Funzioni Locali 23.02.2026";
export const RIF_CCNL_SEG_2022_2024_ART36 = "Art. 36, CCNL Area Funzioni Locali 23.02.2026";
export const RIF_CCNL_SEG_2022_2024_ART40C1 = "Art. 40, c.1, CCNL Area Funzioni Locali 23.02.2026";
export const RIF_CCNL_SEG_2022_2024_ART40C2 = "Art. 40, c.2, CCNL Area Funzioni Locali 23.02.2026";
export const RIF_CCNL_SEG_2022_2024_ART39 = "Art. 39, CCNL Area Funzioni Locali 23.02.2026";
export const RIF_CCNL_2022_2024_ART17 = "Art. 17, CCNL Funzioni Locali 23.02.2026"; // Compensi Aggiuntivi EQ
export const RIF_CCNL_2022_2024_INC_022_EQ = "CCNL Funzioni Locali 23.02.2026 - Incremento 0,22% MS 2021 per EQ";


/**
 * @legacy Technical name 'IVC_VALUES' is maintained for backward compatibility.
 * @context This represents the annual reduction amounts for the consolidation of 'Indennità di Comparto' 
 * into base salary as per Art. 60 c. 2 CCNL 23.02.2026 and Tabella C.
 * Values are calculated on a 12-month basis (Monthly Amount * 12).
 */
export const IVC_VALUES = {
  [AreaQualifica.FUNZIONARIO_EQ]: 127.44,
  [AreaQualifica.ISTRUTTORE]: 112.80,
  [AreaQualifica.OPERATORE_ESPERTO]: 96.72,
  [AreaQualifica.OPERATORE]: 79.56,
};

import {
  createEmptyHistoricalData, createEmptyAnnualData, createEmptySimulatoreInput,
  createEmptyFondoAccessorioDipendenteData, createEmptyFondoElevateQualificazioniData,
  createEmptyFondoSegretarioComunaleData, createEmptyFondoDirigenzaData,
  createEmptyDistribuzioneRisorseData, createEmptyIvcData,
} from './domain/emptyFund';

// Empty compatibility exports. Runtime state always calls the factories directly.
export const INITIAL_IVC_DATA = createEmptyIvcData();
export const INITIAL_HISTORICAL_DATA = createEmptyHistoricalData();
export const INITIAL_SIMULATORE_INPUT = createEmptySimulatoreInput();
export const INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA = createEmptyFondoAccessorioDipendenteData();
export const INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA = createEmptyFondoElevateQualificazioniData();
export const INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA = createEmptyFondoSegretarioComunaleData();
export const INITIAL_FONDO_DIRIGENZA_DATA = createEmptyFondoDirigenzaData();
export const INITIAL_DISTRIBUZIONE_RISORSE_DATA = createEmptyDistribuzioneRisorseData();
export const INITIAL_ANNUAL_DATA = createEmptyAnnualData(DEFAULT_CURRENT_YEAR);

export const PLACEHOLDER_ENTITY_NAME = "Comune di Esempio (Medie Dimensioni)";
export const ALL_TIPOLOGIE_ENTE: { value: TipologiaEnte; label: string }[] = Object.values(TipologiaEnte).map(value => ({ value, label: value as string }));

export const DEFAULT_USER = {
  id: 'guest01',
  name: 'Utente Ospite',
  role: UserRole.GUEST,
};

// Testi per UI

// Testi per UI
export const TEXTS_UI = {
  calculating: "Calcolo in corso...",
  saveChanges: "Salva Modifiche",
  dataSuccessfullySaved: "Dati salvati con successo.",
  errorSavingData: "Errore durante il salvataggio dei dati.",
  errorCalculatingFund: "Errore durante il calcolo del fondo.",
  confirmAction: "Conferma Azione",
  cancel: "Annulla",
  confirm: "Conferma",
  generateReport: "Genera Report",
  noDataAvailable: "Nessun dato disponibile.",
  fieldRequired: "Questo campo è obbligatorio.",
  invalidNumber: "Inserire un numero valido.",
  trueText: "Sì",
  falseText: "No",
  notApplicable: "N/D",
  add: "Aggiungi",
  remove: "Rimuovi",
};

// Costanti per i select
export const ALL_LIVELLI_PEO: { value: LivelloPeo; label: string }[] =
  Object.values(LivelloPeo).map(livello => ({ value: livello, label: livello as string }));

export const ALL_NUMERO_DIFFERENZIALI: { value: number; label: string }[] =
  Array.from({ length: 7 }, (_, i) => ({ value: i, label: i.toString() }));

export const ALL_AREE_QUALIFICA: { value: AreaQualifica; label: string }[] = [
  { value: AreaQualifica.OPERATORE, label: "Operatore" },
  { value: AreaQualifica.OPERATORE_ESPERTO, label: "Operatore Esperto" },
  { value: AreaQualifica.ISTRUTTORE, label: "Istruttore" },
  { value: AreaQualifica.FUNZIONARIO_EQ, label: "Funzionario ed Elevata Qualificazione" },
];

export const ALL_TIPI_MAGGIORAZIONE: { value: TipoMaggiorazione; label: string }[] = [
  { value: TipoMaggiorazione.NESSUNA, label: "Nessuna Maggiorazione" },
  { value: TipoMaggiorazione.EDUCATORE, label: "Educatore" },
  { value: TipoMaggiorazione.POLIZIA_LOCALE, label: "Polizia Locale" },
  { value: TipoMaggiorazione.ISCRITTO_ALBI_ORDINI, label: "Iscritto ad albi ed ordini" },
];

// FIX: Added placeholder data for PROGRESSION_ECONOMIC_VALUES and INDENNITA_COMPARTO_VALUES
export const PROGRESSION_ECONOMIC_VALUES = {
  [AreaQualifica.OPERATORE]: { [LivelloPeo.A1]: 500, [LivelloPeo.A2]: 550, [LivelloPeo.A3]: 600, [LivelloPeo.A4]: 650, [LivelloPeo.A5]: 700, [LivelloPeo.A6]: 750 },
  [AreaQualifica.OPERATORE_ESPERTO]: { [LivelloPeo.B1]: 800, [LivelloPeo.B2]: 850, [LivelloPeo.B3]: 900, [LivelloPeo.B4]: 950, [LivelloPeo.B5]: 1000, [LivelloPeo.B6]: 1050, [LivelloPeo.B7]: 1100, [LivelloPeo.B8]: 1150 },
  [AreaQualifica.ISTRUTTORE]: { [LivelloPeo.C1]: 1200, [LivelloPeo.C2]: 1250, [LivelloPeo.C3]: 1300, [LivelloPeo.C4]: 1350, [LivelloPeo.C5]: 1400, [LivelloPeo.C6]: 1450 },
  [AreaQualifica.FUNZIONARIO_EQ]: { [LivelloPeo.D1]: 1500, [LivelloPeo.D2]: 1550, [LivelloPeo.D3]: 1600, [LivelloPeo.D4]: 1650, [LivelloPeo.D5]: 1700, [LivelloPeo.D6]: 1750, [LivelloPeo.D7]: 1800 },
};

export const INDENNITA_COMPARTO_VALUES = {
  [AreaQualifica.OPERATORE]: 350,
  [AreaQualifica.OPERATORE_ESPERTO]: 400,
  [AreaQualifica.ISTRUTTORE]: 500,
  [AreaQualifica.FUNZIONARIO_EQ]: 600,
};
