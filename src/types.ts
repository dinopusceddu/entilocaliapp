import React from 'react';

export interface NormativeData {
  valori_pro_capite: {
    art67_ccnl_2018: number;
    art79_ccnl_2022_b: number;
  };
  limiti: {
    incidenza_salario_accessorio: number;
    incremento_virtuosi_dl25_2025: number;
    incremento_pnrr_dl13_2023: number;
  };
  riferimenti_normativi: { [key: string]: string };
  progression_economic_values: { [key in AreaQualifica]?: { [key in LivelloPeo]?: number } };
  indennita_comparto_values: { [key in AreaQualifica]?: number };
}

export interface FundStructureItem {
  section: 'stabili' | 'vs_soggette' | 'vn_non_soggette' | 'fin_decurtazioni' | 'cl_limiti';
  operator: '+' | '-';
  isRelevantToArt23Limit: boolean;
}

export type FundStructureConfig = Record<string, FundStructureItem>;

export enum UserRole {
  ADMIN = 'ADMIN',
  FINANCE = 'FINANCE',
  HR = 'HR',
  AUDITOR = 'AUDITOR',
  GUEST = 'GUEST',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
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

export interface AppFeedback {
  id: string;
  created_at: string;
  user_id: string;
  user_name: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  admin_notes?: string;
}

export interface Entity {
  id: string;
  name: string;
  user_id: string;
}

export interface HistoricalData {
  fondoSalarioAccessorioPersonaleNonDirEQ2016?: number;
  fondoElevateQualificazioni2016?: number;
  fondoDirigenza2016?: number;
  risorseSegretarioComunale2016?: number;
  personaleServizio2018?: number;
  spesaStipendiTabellari2023?: number;
  includeDifferenzialiStipendiali2023?: boolean;
  fondoPersonaleNonDirEQ2018_Art23?: number;
  fondoEQ2018_Art23?: number;
  // New fields for Simulation Mode (Manual Overrides)
  manualPersonalFundLimit2016?: number;
  manualStrategyFundLimit2016?: number;
}

export interface Art23EmployeeDetail {
  id: string;
  partTimePercentage?: number;
  cedoliniEmessi?: number;
}

export enum EmployeeCategory {
  DIPENDENTE = 'Personale Dipendente non Dirigente',
  DIRIGENTE = 'Personale Dirigente',
  EQ = 'Titolari di Incarichi di Elevata Qualificazione (EQ)',
  SEGRETARIO = 'Segretario Generale',
}

export const ALL_EMPLOYEE_CATEGORIES: EmployeeCategory[] = [
  EmployeeCategory.DIPENDENTE,
  EmployeeCategory.EQ,
  EmployeeCategory.DIRIGENTE,
  EmployeeCategory.SEGRETARIO,
];

export enum TipologiaEnte {
  COMUNE = "Comune",
  PROVINCIA = "Provincia",
  UNIONE_COMUNI = "Unione dei Comuni",
  COMUNITA_MONTANA = "Comunità Montana",
  ALTRO = "Altro"
}

export interface ProventoSpecifico {
  id: string;
  descrizione: string;
  importo?: number;
  riferimentoNormativo: string;
}

export interface SimulatoreIncrementoInput {
  simStipendiTabellari2023?: number;
  simFondoStabileAnnoApplicazione?: number;
  simRisorsePOEQAnnoApplicazione?: number;
  simSpesaPersonaleConsuntivo2023?: number;
  simMediaEntrateCorrenti2021_2023?: number;
  simTettoSpesaPersonaleL296_06?: number;
  simCostoAnnuoNuoveAssunzioniPIAO?: number;
  simPercentualeOneriIncremento?: number;
}

export interface SimulatoreIncrementoRisultati {
  fase1_obiettivo48?: number;
  fase1_fondoAttualeComplessivo?: number;
  fase1_incrementoPotenzialeLordo?: number;
  fase2_spesaPersonaleAttualePrevista?: number;
  fase2_sogliaPercentualeDM17_03_2020?: number;
  fase2_limiteSostenibileDL34?: number;
  fase2_spazioDisponibileDL34?: number;
  fase3_margineDisponibileL296_06?: number;
  fase4_spazioUtilizzabileLordo?: number;
  fase5_incrementoNettoEffettivoFondo?: number;
}

export interface FondoAccessorioDipendenteData {
  st_art79c1_art67c1_unicoImporto2017?: number;
  st_art79c1_art67c1_alteProfessionalitaNonUtil?: number;
  st_art79c1_art67c2a_incr8320?: number;
  st_art79c1_art67c2b_incrStipendialiDiff?: number;
  st_art79c1_art4c2_art67c2c_integrazioneRIA?: number;
  st_art79c1_art67c2d_risorseRiassorbite165?: number;
  st_art79c1_art15c1l_art67c2e_personaleTrasferito?: number;
  st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig?: number;
  st_art79c1_art14c3_art67c2g_riduzioneStraordinario?: number;
  st_taglioFondoDL78_2010?: number;
  st_riduzioniPersonaleATA_PO_Esternalizzazioni?: number;
  st_art67c1_decurtazionePO_AP_EntiDirigenza?: number;
  st_art79c1b_euro8450?: number;
  st_art79c1c_incrementoStabileConsistenzaPers?: number;
  st_art79c1d_differenzialiStipendiali2022?: number;
  st_art79c1bis_diffStipendialiB3D3?: number;
  st_incrementoDecretoPA?: number;
  st_riduzionePerIncrementoEQ?: number;
  st_riduzioneFondoStraordinario?: number;
  vs_art4c3_art15c1k_art67c3c_recuperoEvasione?: number;
  vs_art4c2_art67c3d_integrazioneRIAMensile?: number;
  vs_art67c3g_personaleCaseGioco?: number;
  vs_art79c2b_max1_2MonteSalari1997?: number;
  vs_art67c3k_integrazioneArt62c2e_personaleTrasferito?: number;
  vs_art79c2c_risorseScelteOrganizzative?: number;
  cl_totaleParzialeRisorsePerConfrontoTetto2016?: number;
  cl_art23c2_decurtazioneIncrementoAnnualeTetto2016?: number;
  vn_art15c1d_art67c3a_sponsorConvenzioni?: number;
  vn_art54_art67c3f_rimborsoSpeseNotifica?: number;
  vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione?: number;
  vn_art15c1k_art67c3c_incentiviTecniciCondoni?: number;
  vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti?: number;
  vn_art15c1m_art67c3e_risparmiStraordinario?: number;
  vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale?: number;
  vn_art80c1_sommeNonUtilizzateStabiliPrec?: number;
  vn_l145_art1c1091_incentiviRiscossioneIMUTARI?: number;
  vn_l178_art1c870_risparmiBuoniPasto2020?: number;
  vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga?: number;
  vn_art79c3_022MonteSalari2018_da2022Proporzionale?: number;
  vn_art79c1b_euro8450_unaTantum2021_2022?: number;
  vn_art79c3_022MonteSalari2018_da2022UnaTantum2022?: number;
  vn_art58c2_incremento_max022_ms2021?: number;
  vn_art58c2_incremento_max022_ms2021_anno2025?: number;
  vn_dl13_art8c3_incrementoPNRR_max5stabile2016?: number;
  fin_art4_dl16_misureMancatoRispettoVincoli?: number;
  st_art60c2_CCNL2026_decurtazioneIndennitaComparto?: number;
}

export interface FondoElevateQualificazioniData {
  ris_fondoPO2017?: number;
  ris_incrementoConRiduzioneFondoDipendenti?: number;
  ris_incrementoLimiteArt23c2_DL34?: number;
  ris_incremento022MonteSalari2018?: number;
  fin_art23c2_adeguamentoTetto2016?: number;

  va_incremento022_ms2021_eq?: number;

  // -- RIPARTO RETRIBUZIONE --
  st_art16c2_retribuzionePosizione?: number; // Retribuzione di Posizione Art. 16 c. 2 CCNL Funzioni Locali 23.02.2026
  va_art16c3_retribuzioneRisultato?: number; // Retribuzione di Risultato Art. 16 c. 3
  va_art18c5_CCNL2026_maggiorazioneSediLavoro?: number;
  va_art16c5_CCNL2026_maggiorazioneInterim?: number;
  va_dl25_2025_armonizzazione?: number;
}

export interface FondoSegretarioComunaleData {
  st_art3c6_CCNL2011_retribuzionePosizione?: number;
  st_art58c1_CCNL2024_differenzialeAumento?: number;
  st_art60c1_CCNL2024_retribuzionePosizioneClassi?: number;
  st_art60c3_CCNL2024_maggiorazioneComplessita?: number;
  st_art60c5_CCNL2024_allineamentoDirigEQ?: number;
  st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni?: number;
  st_art56c1h_CCNL2024_indennitaReggenzaSupplenza?: number;
  va_art56c1f_CCNL2024_dirittiSegreteria?: number;
  va_art56c1i_CCNL2024_altriCompensiLegge?: number;
  va_art8c3_DL13_2023_incrementoPNRR?: number;
  va_art61c2_CCNL2024_retribuzioneRisultato10?: number;
  va_art61c2bis_CCNL2024_retribuzioneRisultato15?: number;
  va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane?: number;
  va_art61c3_CCNL2024_incremento022MonteSalari2018?: number;
  st_art36_CCNL2022_2024_incrementoRetribuzionePosizione?: number;
  va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021?: number;
  va_art40c2_CCNL2022_2024_incremento0_22MonteSalari2021?: number;
  va_art40c1_CCNL2026_incremento080MS2021?: number;
  va_art40c2_CCNL2026_incremento022MS2021_L207?: number;
  va_art21c1m_CCNL2026_incentiviFunzioniTecniche?: number;
  fin_totaleRisorseRilevantiLimite?: number;
  fin_percentualeCoperturaPostoSegretario?: number;
}

export interface FondoDirigenzaData {
  st_art57c2a_CCNL2020_unicoImporto2020?: number;
  st_art57c2a_CCNL2020_riaPersonaleCessato2020?: number;
  st_art56c1_CCNL2020_incremento1_53MonteSalari2015?: number;
  st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo?: number;
  st_art57c2e_CCNL2020_risorseAutonomeStabili?: number;
  st_art39c1_CCNL2024_incremento2_01MonteSalari2018?: number;
  va_art57c2b_CCNL2020_risorseLeggeSponsor?: number;
  va_art57c2d_CCNL2020_sommeOnnicomprensivita?: number;
  va_art57c2e_CCNL2020_risorseAutonomeVariabili?: number;
  va_art57c3_CCNL2020_residuiAnnoPrecedente?: number;
  va_dl13_2023_art8c3_incrementoPNRR?: number;
  va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020?: number;
  va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023?: number;
  va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione?: number;
  va_art33c2_DL34_2019_incrementoDeroga?: number;
  lim_totaleParzialeRisorseConfrontoTetto2016?: number;
  lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016?: number;
  lim_art4_DL16_2014_misureMancatoRispettoVincoli?: number;
  st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021?: number;
  va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021?: number;
  va_compensiExLege_rilevanti?: number;
  va_compensiExLege_nonRilevanti?: number;
  u_art64c1_CCNL2024_coperturaInterimDirigenziale?: number;
  u_art24c2_CCNL2026_arretratiRisultato?: number;
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

export interface PersonaleServizioDettaglio {
  id: string;
  partTimePercentage?: number;
  fullYearService: boolean;
  assunzioneDate?: string;
  cessazioneDate?: string;
  livelloPeoStoriche?: LivelloPeo;
  numeroDifferenziali?: number;
  tipoMaggiorazione?: TipoMaggiorazione;
  areaQualifica?: AreaQualifica;
}

export interface AnnualEmployeeCount {
  category: EmployeeCategory;
  count?: number;
}

export interface AnnualData {
  annoRiferimento: number;
  denominazioneEnte?: string;
  tipologiaEnte?: TipologiaEnte;
  altroTipologiaEnte?: string;
  numeroAbitanti?: number;
  isEnteDissestato?: boolean;
  isEnteStrutturalmenteDeficitario?: boolean;
  isEnteRiequilibrioFinanziario?: boolean;
  hasDirigenza?: boolean;
  isDistributionMode?: boolean;
  personaleServizioAttuale: AnnualEmployeeCount[];
  rispettoEquilibrioBilancioPrecedente?: boolean;
  rispettoDebitoCommercialePrecedente?: boolean;
  incidenzaSalarioAccessorioUltimoRendiconto?: number;
  approvazioneRendicontoPrecedente?: boolean;
  proventiSpecifici: ProventoSpecifico[];
  incentiviPNRROpMisureStraordinarie?: number;
  condizioniVirtuositaFinanziariaSoddisfatte?: boolean;
  personale2018PerArt23: Art23EmployeeDetail[];
  personaleAnnoRifPerArt23: Art23EmployeeDetail[];

  // Manual overrides for Art. 23
  manualDipendentiEquivalenti2018?: number;
  manualDipendentiEquivalentiAnnoRif?: number;

  simulatoreInput: SimulatoreIncrementoInput;
  simulatoreRisultati?: SimulatoreIncrementoRisultati;
  fondoStabile2016PNRR?: number;
  calcolatoIncrementoPNRR3?: number;
  fondoLavoroStraordinario?: number;
  incrementoFondoStraordinario?: number;
  riduzioneFondoParteStabile?: boolean;

  // CCNL Funzioni Locali 23.02.2026 Settings
  ccnl2024?: Ccnl2024Settings;
}

export interface Ccnl2024Settings {
  monteSalari2021?: number;
  fondoPersonale2025?: number;
  fondoEQ2025?: number;
  optionalIncreaseVariableFrom2026Percentage?: number;
  optionalIncreaseVariable2026OnlyPercentage?: number;
  isEnteConDirigenza?: boolean;
  personaleInServizio01012026?: number;
  valoreTabellaCCol3?: number;
  applyPartTimeProportion?: boolean;
  averagePartTimePercentage?: number;

  // Union Detachment removed

  // IVC Conglobation Calculation
  ivcConglobation?: IvcConglobationData;
}

export interface IvcConglobationEmployee {
  id: string;
  area: AreaQualifica;
  partTimePercentage: number;
}

export interface IvcConglobationData {
  mode: 'aggregated' | 'analytic';
  // Mode A: Aggregated
  aggregatedCounts?: {
    [key in AreaQualifica]?: number;
  };
  // Mode B: Analytic
  analyticEmployees?: IvcConglobationEmployee[];

  totalReduction: number;
}

export interface RisorsaVariabileDetail {
  stanziate?: number;
  risparmi?: number;
  aBilancio?: number;
}

export interface DistribuzioneRisorseData {
  u_diffProgressioniStoriche?: number;
  u_assegnoAdPersonamRiassorbibile?: number;
  u_indennitaComparto?: number;
  u_incrIndennitaEducatori?: RisorsaVariabileDetail;
  u_incrIndennitaScolastico?: RisorsaVariabileDetail;
  u_indennitaEx8QF?: RisorsaVariabileDetail;
  p_performanceOrganizzativa?: RisorsaVariabileDetail;
  p_performanceIndividuale?: RisorsaVariabileDetail;
  p_maggiorazionePerformanceIndividuale?: RisorsaVariabileDetail;
  p_indennitaCondizioniLavoro?: RisorsaVariabileDetail;
  p_indennitaTurno?: RisorsaVariabileDetail;
  p_indennitaReperibilita?: RisorsaVariabileDetail;
  p_indennitaLavoroGiornoRiposo?: RisorsaVariabileDetail;
  p_compensiSpecificheResponsabilita?: RisorsaVariabileDetail;
  p_indennitaFunzione?: RisorsaVariabileDetail;
  p_indennitaServizioEsterno?: RisorsaVariabileDetail;
  p_obiettiviPoliziaLocale?: RisorsaVariabileDetail;
  p_incentiviContoTerzi?: RisorsaVariabileDetail;
  p_compensiAvvocatura?: RisorsaVariabileDetail;
  p_incentiviCondonoFunzioniTecnichePre2018?: RisorsaVariabileDetail;
  p_incentiviFunzioniTecnichePost2018?: RisorsaVariabileDetail;
  p_incentiviIMUTARI?: RisorsaVariabileDetail;
  p_compensiMessiNotificatori?: RisorsaVariabileDetail;
  p_compensiCaseGioco?: RisorsaVariabileDetail;
  p_compensiCaseGiocoNonCoperti?: RisorsaVariabileDetail;
  p_diffStipendialiAnnoCorrente?: RisorsaVariabileDetail;
  p_pianiWelfare?: RisorsaVariabileDetail;
  p_indennitaCentralinistiNonVedenti?: RisorsaVariabileDetail;
  p_incentiviServiziAssociatiInnovazione?: RisorsaVariabileDetail;
  criteri_isConsuntivoMode?: boolean;
  criteri_percPerfIndividuale?: number;
  criteri_percMaggiorazionePremio?: number;
  criteri_percDipendentiBonus?: number;
  art48_applicaObiettiviEnte?: boolean;
}

export interface FundData {
  historicalData: HistoricalData;
  annualData: AnnualData;
  fondoAccessorioDipendenteData: FondoAccessorioDipendenteData;
  fondoElevateQualificazioniData: FondoElevateQualificazioniData;
  fondoSegretarioComunaleData: FondoSegretarioComunaleData;
  fondoDirigenzaData: FondoDirigenzaData;
  distribuzioneRisorseData: DistribuzioneRisorseData;
  personaleServizio: {
    dettagli: PersonaleServizioDettaglio[];
    isManualMode?: boolean;
    manualProgressioni?: number;
    manualIndennita?: number;
    manualDipendentiEquivalenti?: number;
  };
}

export interface FundComponent {
  descrizione: string;
  importo: number;
  riferimento: string;
  tipo: 'stabile' | 'variabile';
  esclusoDalLimite2016?: boolean;
}

export interface FundDetailTotals {
  stabile: number;
  variabile: number;
  totale: number;
}

export interface CalculatedFund {
  fondoBase2016: number;
  incrementiStabiliCCNL: FundComponent[];
  adeguamentoProCapite: FundComponent;
  incrementoDeterminatoArt23C2?: FundComponent;
  incrementoOpzionaleVirtuosi?: FundComponent;
  risorseVariabili: FundComponent[];
  totaleFondoRisorseDecentrate: number;
  limiteArt23C2Modificato?: number;
  ammontareSoggettoLimite2016: number;
  superamentoLimite2016?: number;
  totaleRisorseSoggetteAlLimiteDaFondiSpecifici: number;
  totaleFondo: number;
  totaleParteStabile: number;
  totaleParteVariabile: number;
  totaleComponenteStabile: number;
  totaleComponenteVariabile: number;
  dettaglioFondi: {
    dipendente: FundDetailTotals;
    eq: FundDetailTotals;
    segretario: FundDetailTotals;
    dirigenza: FundDetailTotals;
  };
}

export interface ComplianceCheck {
  id: string;
  descrizione: string;
  isCompliant: boolean;
  valoreAttuale?: string | number;
  limite?: string | number;
  messaggio: string;
  riferimentoNormativo: string;
  gravita: 'info' | 'warning' | 'error';
  relatedPage?: string;
}

export interface AppState {
  currentUser: User;
  currentYear: number;
  entities: Entity[];
  currentEntity?: Entity;
  fundData: FundData;
  calculatedFund?: CalculatedFund;
  complianceChecks: ComplianceCheck[];
  isLoading: boolean;
  isNormativeDataLoading: boolean;
  normativeData?: NormativeData;
  error?: string;
  validationErrors: Record<string, string>;
  activeTab: string;
}

export type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_CURRENT_YEAR'; payload: number }
  | { type: 'UPDATE_HISTORICAL_DATA'; payload: Partial<HistoricalData> }
  | { type: 'UPDATE_ANNUAL_DATA'; payload: Partial<AnnualData> }
  | { type: 'ADD_PROVENTO_SPECIFICO'; payload: ProventoSpecifico }
  | { type: 'UPDATE_PROVENTO_SPECIFICO'; payload: { index: number; provento: ProventoSpecifico } }
  | { type: 'REMOVE_PROVENTO_SPECIFICO'; payload: number }
  | { type: 'CALCULATE_FUND_START' }
  | { type: 'CALCULATE_FUND_SUCCESS'; payload: { fund: CalculatedFund; checks: ComplianceCheck[] } }
  | { type: 'CALCULATE_FUND_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NORMATIVE_DATA_LOADING'; payload: boolean }
  | { type: 'SET_NORMATIVE_DATA'; payload: NormativeData }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_VALIDATION_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'ADD_ART23_EMPLOYEE_DETAIL'; payload: { yearType: '2018' | 'annoRif'; detail: Art23EmployeeDetail } }
  | { type: 'UPDATE_ART23_EMPLOYEE_DETAIL'; payload: { yearType: '2018' | 'annoRif'; detail: Art23EmployeeDetail } }
  | { type: 'REMOVE_ART23_EMPLOYEE_DETAIL'; payload: { yearType: '2018' | 'annoRif'; id: string } }
  | { type: 'ADD_PERSONALE_SERVIZIO_DETTAGLIO'; payload: PersonaleServizioDettaglio }
  | { type: 'UPDATE_PERSONALE_SERVIZIO_DETTAGLIO'; payload: { id: string; changes: Partial<PersonaleServizioDettaglio> } }
  | { type: 'REMOVE_PERSONALE_SERVIZIO_DETTAGLIO'; payload: { id: string } }
  | { type: 'SET_PERSONALE_SERVIZIO_DETTAGLI'; payload: PersonaleServizioDettaglio[] }
  | { type: 'UPDATE_PERSONALE_SERVIZIO_MANUAL_MODE'; payload: { isManualMode: boolean; manualProgressioni?: number; manualIndennita?: number } }
  | { type: 'UPDATE_SIMULATORE_INPUT'; payload: Partial<SimulatoreIncrementoInput> }
  | { type: 'UPDATE_SIMULATORE_RISULTATI'; payload: SimulatoreIncrementoRisultati | undefined }
  | { type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA'; payload: Partial<FondoAccessorioDipendenteData> }
  | { type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA'; payload: Partial<FondoElevateQualificazioniData> }
  | { type: 'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA'; payload: Partial<FondoSegretarioComunaleData> }
  | { type: 'UPDATE_FONDO_DIRIGENZA_DATA'; payload: Partial<FondoDirigenzaData> }
  | { type: 'UPDATE_CALCOLATO_INCREMENTO_PNRR3'; payload: number | undefined }
  | { type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA'; payload: Partial<DistribuzioneRisorseData> }
  | { type: 'UPDATE_EMPLOYEE_COUNT'; payload: { category: EmployeeCategory; count?: number } }
  | { type: 'LOAD_STATE_FROM_DB'; payload: Partial<AppState> }
  | { type: 'SET_ENTITIES'; payload: Entity[] }
  | { type: 'SET_CURRENT_ENTITY'; payload: Entity }
  | { type: 'UPDATE_ENTITY_NAME'; payload: string };

export interface PageModule {
  id: string;
  name: string;
  component: React.FC;
}