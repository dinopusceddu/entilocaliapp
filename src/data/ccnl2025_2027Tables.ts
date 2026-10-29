// src/data/ccnl2025_2027Tables.ts

export type ContractualArea =
  | 'OPERATORI'
  | 'OPERATORI_ESPERTI'
  | 'ISTRUTTORI'
  | 'FUNZIONARI_EQ';

export type HistoricalLevelCode =
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6'
  | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'B8'
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6'
  | 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7';

export type SpecialSectionKey =
  | 'NONE'
  | 'EDUCATORI_INSEGNANTI_ART92'          // +350 €/anno per Istruttori (Art. 92 CCNL 16.11.2022 / Art. 18 CCNL 28.10.2026)
  | 'POLIZIA_LOCALE_COORDINAMENTO_ART96'  // +350 €/anno per Istruttori PL con funzioni di coordinamento (Art. 96 CCNL 16.11.2022)
  | 'ALBI_ORDINI_SANITARI_ART102_106';    // +150 €/anno per Istruttori, +200 €/anno per Funzionari/EQ (Artt. 102 e 106 CCNL 16.11.2022)

export type RegimeEpoch =
  | 'NOV_DEC_2026_REGIME'
  | 'DAL_GEN_2027_REGIME'
  | 'DAL_LUG_2027_REGIME';

export const AREA_LABELS: Record<ContractualArea, string> = {
  OPERATORI: 'Area degli Operatori (ex Cat. A)',
  OPERATORI_ESPERTI: 'Area degli Operatori Esperti (ex Cat. B)',
  ISTRUTTORI: 'Area degli Istruttori (ex Cat. C)',
  FUNZIONARI_EQ: 'Area dei Funzionari e dell’Elevata Qualificazione (ex Cat. D)',
};

/**
 * TABELLA A — Incrementi mensili lordi (per 13 mensilità)
 * Art. 35, comma 1, CCNL 28.10.2026 (I valori dal 01.01.2026 assorbono quelli dal 01.01.2025; quelli dal 01.01.2027 assorbono quelli dal 01.01.2026)
 */
export const TABELLA_A_INCREMENTI_MENSILI: Record<ContractualArea, {
  dal_2025_01_01: number;
  dal_2026_01_01: number;
  dal_2027_01_01: number;
  delta_2027_su_2026: number;
}> = {
  FUNZIONARI_EQ:     { dal_2025_01_01: 49.04, dal_2026_01_01: 99.18, dal_2027_01_01: 138.52, delta_2027_su_2026: 39.34 },
  ISTRUTTORI:        { dal_2025_01_01: 45.20, dal_2026_01_01: 91.40, dal_2027_01_01: 127.63, delta_2027_su_2026: 36.23 },
  OPERATORI_ESPERTI: { dal_2025_01_01: 40.22, dal_2026_01_01: 81.33, dal_2027_01_01: 113.53, delta_2027_su_2026: 32.20 },
  OPERATORI:         { dal_2025_01_01: 38.63, dal_2026_01_01: 78.12, dal_2027_01_01: 108.95, delta_2027_su_2026: 30.83 },
};

/**
 * TABELLA B — Nuovo Stipendio Tabellare Annullo (per 12 mensilità) e Mensile (÷ 12) + IVC 2022-2024 Conglobata
 * Nota: dal 01.01.2026 lo stipendio base pre-rinnovo include il conglobamento di parte dell'Indennità di Comparto ex Art. 32 CCNL 23.02.2026.
 */
export const TABELLA_B_STIPENDI_TABELLARI: Record<ContractualArea, {
  mensile_base_2025_pre_rinnovo: number; // Tabellare CCNL 16.11.2022 + IVC 2022-2024 conglobata
  mensile_base_2026_pre_rinnovo: number; // Include conglobamento quota Indennità di Comparto dal 01.01.2026
  mensile_dal_2025_01_01: number;        // Base 2025 + Inc. 2025
  mensile_dal_2026_01_01: number;        // Base 2026 + Inc. 2026
  mensile_dal_2027_01_01: number;        // Base 2026 + Inc. 2027 (Regime)
  annuo_12m_dal_2025_01_01: number;
  annuo_12m_dal_2026_01_01: number;
  annuo_12m_dal_2027_01_01: number;
}> = {
  FUNZIONARI_EQ: {
    mensile_base_2025_pre_rinnovo: 2078.47,
    mensile_base_2026_pre_rinnovo: 2092.84,
    mensile_dal_2025_01_01: 2127.51,
    mensile_dal_2026_01_01: 2192.02,
    mensile_dal_2027_01_01: 2231.36,
    annuo_12m_dal_2025_01_01: 25530.15,
    annuo_12m_dal_2026_01_01: 26304.27,
    annuo_12m_dal_2027_01_01: 26776.35,
  },
  ISTRUTTORI: {
    mensile_base_2025_pre_rinnovo: 1915.55,
    mensile_base_2026_pre_rinnovo: 1928.23,
    mensile_dal_2025_01_01: 1960.75,
    mensile_dal_2026_01_01: 2019.63,
    mensile_dal_2027_01_01: 2055.86,
    annuo_12m_dal_2025_01_01: 23528.99,
    annuo_12m_dal_2026_01_01: 24235.55,
    annuo_12m_dal_2027_01_01: 24670.31,
  },
  OPERATORI_ESPERTI: {
    mensile_base_2025_pre_rinnovo: 1704.38,
    mensile_base_2026_pre_rinnovo: 1715.27,
    mensile_dal_2025_01_01: 1744.60,
    mensile_dal_2026_01_01: 1796.60,
    mensile_dal_2027_01_01: 1828.80,
    annuo_12m_dal_2025_01_01: 20935.19,
    annuo_12m_dal_2026_01_01: 21559.19,
    annuo_12m_dal_2027_01_01: 21945.59,
  },
  OPERATORI: {
    mensile_base_2025_pre_rinnovo: 1637.12,
    mensile_base_2026_pre_rinnovo: 1646.09,
    mensile_dal_2025_01_01: 1675.75,
    mensile_dal_2026_01_01: 1724.21,
    mensile_dal_2027_01_01: 1755.04,
    annuo_12m_dal_2025_01_01: 20108.99,
    annuo_12m_dal_2026_01_01: 20690.51,
    annuo_12m_dal_2027_01_01: 21060.47,
  },
};

/**
 * TABELLA C — Indennità di Comparto (per 12 mensilità, Art. 36-bis CCNL 28.10.2026)
 */
export const TABELLA_C_INDENNITA_COMPARTO: Record<ContractualArea, {
  mensile_2025: number;              // Valore prima del conglobamento 01.01.2026
  mensile_dal_2026_01_01: number;    // Valore dal 01.01.2026 al 30.06.2027
  incremento_dal_2027_07_01: number; // Incremento dal 01.07.2027 (Tabella C)
  mensile_dal_2027_07_01: number;    // Nuovo valore a regime dal 01.07.2027
}> = {
  FUNZIONARI_EQ:     { mensile_2025: 51.90, mensile_dal_2026_01_01: 36.33, incremento_dal_2027_07_01: 15.61, mensile_dal_2027_07_01: 51.94 },
  ISTRUTTORI:        { mensile_2025: 45.80, mensile_dal_2026_01_01: 32.06, incremento_dal_2027_07_01: 13.77, mensile_dal_2027_07_01: 45.83 },
  OPERATORI_ESPERTI: { mensile_2025: 39.31, mensile_dal_2026_01_01: 27.52, incremento_dal_2027_07_01: 11.82, mensile_dal_2027_07_01: 39.34 },
  OPERATORI:         { mensile_2025: 32.40, mensile_dal_2026_01_01: 22.68, incremento_dal_2027_07_01: 9.74,  mensile_dal_2027_07_01: 32.42 },
};

/**
 * VALORI MAGGIORAZIONE IVC 2025-2027 EROGATA IN BUSTA PAGA (Art. 1 c. 128 L. 207/2024 - Legge di Bilancio 2025)
 * - Dal 01.04.2025 al 31.12.2025 (+ 13ª 2025 = 10 quote): 0,6%
 * - Dal 01.01.2026: 1,0%
 * Nota: l'IVC 2022-2024 base (10,34 / 9,53 / 8,48 / 8,15 €) è già conglobata nel tabellare base di partenza;
 * gli incrementi di Tabella A (49,04 / 45,20 / 40,22 / 38,63 € nel 2025 e 99,18 / 91,40 / 81,33 / 78,12 € nel 2026)
 * assorbono invece la Maggiorazione IVC 2025-2027 (L. 207/2024) già anticipata mese per mese!
 */
export const IVC_ANTICIPATA_2025_2026_MENSILE: Record<ContractualArea, {
  ivc_2025_apr_dic_mensile: number; // 0,6% erogato da Aprile a Dicembre 2025 + 13ª (10 quote)
  ivc_2026_mensile: number;         // 1,0% erogato da Gennaio 2026
}> = {
  FUNZIONARI_EQ:     { ivc_2025_apr_dic_mensile: 12.93, ivc_2026_mensile: 21.55 },
  ISTRUTTORI:        { ivc_2025_apr_dic_mensile: 11.93, ivc_2026_mensile: 19.88 },
  OPERATORI_ESPERTI: { ivc_2025_apr_dic_mensile: 10.61, ivc_2026_mensile: 17.69 },
  OPERATORI:         { ivc_2025_apr_dic_mensile: 10.19, ivc_2026_mensile: 16.99 },
};

/**
 * 27 POSIZIONI ECONOMICHE STORICHE EX-PEO (Art. 78, comma 3, lett. b CCNL 16.11.2022)
 * Importo mensile lordo per 13 mensilità del differenziale storico rispetto alla posizione iniziale (A1, B1, C1, D1).
 */
export interface HistoricalLevelDefinition {
  code: HistoricalLevelCode;
  area: ContractualArea;
  label: string;
  monthlyDifferential13m: number; // Importo mensile fisso per 13 mensilità
  annualDifferential13m: number;  // Importo annuo su 13 mensilità
}

export const HISTORICAL_LEVELS_MAP: Record<HistoricalLevelCode, HistoricalLevelDefinition> = {
  // AREA OPERATORI (ex Cat. A)
  A1: { code: 'A1', area: 'OPERATORI', label: 'Ex A1 (Posizione iniziale)', monthlyDifferential13m: 0.00,   annualDifferential13m: 0.00 },
  A2: { code: 'A2', area: 'OPERATORI', label: 'Ex A2',                      monthlyDifferential13m: 19.91,  annualDifferential13m: 258.83 },
  A3: { code: 'A3', area: 'OPERATORI', label: 'Ex A3',                      monthlyDifferential13m: 50.74,  annualDifferential13m: 659.62 },
  A4: { code: 'A4', area: 'OPERATORI', label: 'Ex A4',                      monthlyDifferential13m: 77.01,  annualDifferential13m: 1001.13 },
  A5: { code: 'A5', area: 'OPERATORI', label: 'Ex A5',                      monthlyDifferential13m: 108.38, annualDifferential13m: 1408.94 },
  A6: { code: 'A6', area: 'OPERATORI', label: 'Ex A6',                      monthlyDifferential13m: 136.04, annualDifferential13m: 1768.52 },

  // AREA OPERATORI ESPERTI (ex Cat. B)
  B1: { code: 'B1', area: 'OPERATORI_ESPERTI', label: 'Ex B1 (Posizione iniziale)', monthlyDifferential13m: 0.00,   annualDifferential13m: 0.00 },
  B2: { code: 'B2', area: 'OPERATORI_ESPERTI', label: 'Ex B2',                      monthlyDifferential13m: 25.10,  annualDifferential13m: 326.30 },
  B3: { code: 'B3', area: 'OPERATORI_ESPERTI', label: 'Ex B3 (ex accesso B3)',      monthlyDifferential13m: 86.53,  annualDifferential13m: 1124.89 },
  B4: { code: 'B4', area: 'OPERATORI_ESPERTI', label: 'Ex B4',                      monthlyDifferential13m: 110.82, annualDifferential13m: 1440.66 },
  B5: { code: 'B5', area: 'OPERATORI_ESPERTI', label: 'Ex B5',                      monthlyDifferential13m: 138.15, annualDifferential13m: 1795.95 },
  B6: { code: 'B6', area: 'OPERATORI_ESPERTI', label: 'Ex B6',                      monthlyDifferential13m: 168.37, annualDifferential13m: 2188.81 },
  B7: { code: 'B7', area: 'OPERATORI_ESPERTI', label: 'Ex B7',                      monthlyDifferential13m: 234.15, annualDifferential13m: 3043.95 },
  B8: { code: 'B8', area: 'OPERATORI_ESPERTI', label: 'Ex B8',                      monthlyDifferential13m: 273.99, annualDifferential13m: 3561.87 },

  // AREA ISTRUTTORI (ex Cat. C)
  C1: { code: 'C1', area: 'ISTRUTTORI', label: 'Ex C1 (Posizione iniziale)', monthlyDifferential13m: 0.00,   annualDifferential13m: 0.00 },
  C2: { code: 'C2', area: 'ISTRUTTORI', label: 'Ex C2',                      monthlyDifferential13m: 41.14,  annualDifferential13m: 534.82 },
  C3: { code: 'C3', area: 'ISTRUTTORI', label: 'Ex C3',                      monthlyDifferential13m: 89.74,  annualDifferential13m: 1166.62 },
  C4: { code: 'C4', area: 'ISTRUTTORI', label: 'Ex C4',                      monthlyDifferential13m: 146.52, annualDifferential13m: 1904.76 },
  C5: { code: 'C5', area: 'ISTRUTTORI', label: 'Ex C5',                      monthlyDifferential13m: 216.41, annualDifferential13m: 2813.33 },
  C6: { code: 'C6', area: 'ISTRUTTORI', label: 'Ex C6',                      monthlyDifferential13m: 271.84, annualDifferential13m: 3533.92 },

  // AREA FUNZIONARI ED EQ (ex Cat. D)
  D1: { code: 'D1', area: 'FUNZIONARI_EQ', label: 'Ex D1 (Posizione iniziale)', monthlyDifferential13m: 0.00,   annualDifferential13m: 0.00 },
  D2: { code: 'D2', area: 'FUNZIONARI_EQ', label: 'Ex D2',                      monthlyDifferential13m: 91.30,  annualDifferential13m: 1186.90 },
  D3: { code: 'D3', area: 'FUNZIONARI_EQ', label: 'Ex D3 (ex accesso D3)',      monthlyDifferential13m: 278.45, annualDifferential13m: 3619.85 },
  D4: { code: 'D4', area: 'FUNZIONARI_EQ', label: 'Ex D4',                      monthlyDifferential13m: 369.86, annualDifferential13m: 4808.18 },
  D5: { code: 'D5', area: 'FUNZIONARI_EQ', label: 'Ex D5',                      monthlyDifferential13m: 468.93, annualDifferential13m: 6096.09 },
  D6: { code: 'D6', area: 'FUNZIONARI_EQ', label: 'Ex D6',                      monthlyDifferential13m: 634.82, annualDifferential13m: 8252.66 },
  D7: { code: 'D7', area: 'FUNZIONARI_EQ', label: 'Ex D7',                      monthlyDifferential13m: 757.32, annualDifferential13m: 9845.16 },
};

/**
 * NUOVI DIFFERENZIALI STIPENDIALI (Tabella A CCNL 16.11.2022 / Art. 18 CCNL 28.10.2026)
 * Erogati per 13 mensilità.
 */
export const NEW_DIFFERENTIALS_RULES: Record<ContractualArea, {
  baseAnnualAmount13m: number;
  maxAllowedCount: number;
  specialAddonsAnnual13m: Partial<Record<SpecialSectionKey, number>>;
}> = {
  OPERATORI: {
    baseAnnualAmount13m: 550.00,
    maxAllowedCount: 5,
    specialAddonsAnnual13m: {},
  },
  OPERATORI_ESPERTI: {
    baseAnnualAmount13m: 650.00,
    maxAllowedCount: 5,
    specialAddonsAnnual13m: {},
  },
  ISTRUTTORI: {
    baseAnnualAmount13m: 750.00,
    maxAllowedCount: 5,
    specialAddonsAnnual13m: {
      EDUCATORI_INSEGNANTI_ART92: 350.00,         // Totale: 1.100,00 €/anno (84,62 €/mese)
      POLIZIA_LOCALE_COORDINAMENTO_ART96: 350.00, // Totale: 1.100,00 €/anno (84,62 €/mese)
      ALBI_ORDINI_SANITARI_ART102_106: 150.00,    // Totale: 900,00 €/anno (69,23 €/mese)
    },
  },
  FUNZIONARI_EQ: {
    baseAnnualAmount13m: 1600.00,
    maxAllowedCount: 6,
    specialAddonsAnnual13m: {
      ALBI_ORDINI_SANITARI_ART102_106: 200.00,    // Totale: 1.800,00 €/anno (138,46 €/mese)
    },
  },
};

/**
 * COSTANTI FISSE E INDENNITÀ SPECIFICHE DI SEZIONE / CONTRATTUALI
 */
export const CONTRACTUAL_ALLOWANCE_CONSTANTS = {
  DIVISORE_ORARIO_36H: 156,
  DIVISORE_ORARIO_35H: 151.66, // 35 * 52 / 12 (Art. 24 CCNL 16.11.2022)
  DIVISORE_GIORNALIERO_6GG: 26,
  DIVISORE_GIORNALIERO_5GG: 22,
  DIVISORE_INDENNITA_FERIE_ART30: 312, // 12 * 26 fisso (Art. 30 c. 1-bis CCNL 28.10.2026)
  SOGLIA_MINIMA_GIORNALIERA_FERIE_ART30: 3.00, // >= 3,00 €/giorno (936,00 €/anno)
  MINIMO_CONDIZIONI_LAVORO_E_SERVIZIO_ESTERNO_DAL_2027: 2.00, // Art. 38 c. 4 CCNL 28.10.2026
  MAX_CONDIZIONI_LAVORO_GIORNALIERO: 15.00,
  REPERIBILITA_12H_BASE: 10.33,
  REPERIBILITA_12H_MAX_ENTE: 13.00,
  INDENNITA_VIGILANZA_PL_FUNZIONI_ART99_MENSILE_12M: 115.97, // 1.391,64 € / 12
  INDENNITA_VIGILANZA_PL_COLLAB_ART99_MENSILE_12M: 77.73,    // 932,76 € / 12
  INDENNITA_PROF_EDUCATORI_INSEGNANTI_ART94_MENSILE_12M: 64.56,
  RIMBORSO_PASTO_TRASFERTA_1_PASTO_ART44: 24.48,
  RIMBORSO_PASTO_TRASFERTA_2_PASTI_ART44: 48.68,
};
