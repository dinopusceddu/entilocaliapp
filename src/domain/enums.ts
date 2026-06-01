
/**
 * Enum centrali al nucleo applicativo del motore di calcolo del fondo.
 */

export enum EmployeeCategory {
  DIPENDENTE = 'Personale Dipendente non Dirigente',
  DIRIGENTE = 'Personale Dirigente',
  EQ = 'Titolari di Incarichi di Elevata Qualificazione (EQ)',
  SEGRETARIO = 'Segretario Generale',
}

export const ALL_EMPLOYEE_CATEGORIES = [
  EmployeeCategory.DIPENDENTE,
  EmployeeCategory.EQ,
  EmployeeCategory.DIRIGENTE,
  EmployeeCategory.SEGRETARIO
];

export enum TipologiaEnte {
  COMUNE = "Comune",
  PROVINCIA = "Provincia",
  UNIONE_COMUNI = "Unione dei Comuni",
  COMUNITA_MONTANA = "Comunità Montana",
  ALTRO = "Altro"
}

export enum LivelloPeo {
  A1 = "A1", A2 = "A2", A3 = "A3", A4 = "A4", A5 = "A5", A6 = "A6",
  B1 = "B1", B2 = "B2", B3 = "B3", B4 = "B4", B5 = "B5", B6 = "B6", B7 = "B7", B8 = "B8",
  C1 = "C1", C2 = "C2", C3 = "C3", C4 = "C4", C5 = "C5", C6 = "C6",
  D1 = "D1", D2 = "D2", D3 = "D3", D4 = "D4", D5 = "D5", D6 = "D6", D7 = "D7",
}

export enum AreaQualifica {
  OPERATORE = "OPERATORE",
  OPERATORE_ESPERTO = "OPERATORE_ESPERTO",
  ISTRUTTORE = "ISTRUTTORE",
  FUNZIONARIO_EQ = "FUNZIONARIO_EQ"
}

export enum TipoMaggiorazione {
  NESSUNA = "NESSUNA",
  EDUCATORE = "EDUCATORE",
  POLIZIA_LOCALE = "POLIZIA_LOCALE",
  ISCRITTO_ALBI_ORDINI = "ISCRITTO_ALBI_ORDINI",
}

export enum UserRole {
  ADMIN = 'ADMIN',
  FINANCE = 'FINANCE',
  HR = 'HR',
  AUDITOR = 'AUDITOR',
  GUEST = 'GUEST',
}

export enum NavigationScope {
  DASHBOARD = 'DASHBOARD',
  FONDO = 'FONDO',
  ADMIN = 'ADMIN',
  COMUNICAZIONI = 'COMUNICAZIONI',
  NORMATIVA = 'NORMATIVA',
  WIZARD = 'WIZARD',
}


export enum FeedbackType {
  BUG = 'BUG',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  CHANGE_REQUEST = 'CHANGE_REQUEST'
}

export enum FeedbackStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export type ParereAranStato = 'draft' | 'review' | 'published' | 'discarded';
