// constants.ts
import { EmployeeCategory, UserRole, TipologiaEnte, LivelloPeo, TipoMaggiorazione, AreaQualifica } from './enums.ts';
import { SimulatoreIncrementoInput, FondoAccessorioDipendenteData, FondoElevateQualificazioniData, FondoSegretarioComunaleData, FondoDirigenzaData, DistribuzioneRisorseData } from './types.ts';

export const APP_NAME = "Toolbox Funzioni Locali";

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
export const RIF_CCNL_DIR_2022_2024_ART24C1 = "Art. 24, c.1, CCNL Dirigenza 2022-2024 (Ipotesi 11/11/2025)";
export const RIF_CCNL_DIR_2022_2024_ART24C2 = "Art. 24, c.2, CCNL Dirigenza 2022-2024 (Ipotesi 11/11/2025)";
export const RIF_CCNL_DIR_2022_2024_ART24C3 = "Art. 24, c.3, CCNL Dirigenza 2022-2024 (Ipotesi 11/11/2025)";
export const RIF_CCNL_SEG_2022_2024_ART36 = "Art. 36, CCNL Segretari 2022-2024 (Ipotesi 11/11/2025)";
export const RIF_CCNL_SEG_2022_2024_ART40C1 = "Art. 40, c.1, CCNL Segretari 2022-2024 (Ipotesi 11/11/2025)";
export const RIF_CCNL_SEG_2022_2024_ART40C2 = "Art. 40, c.2, CCNL Segretari 2022-2024 (Ipotesi 11/11/2025)";
export const RIF_CCNL_SEG_2022_2024_ART39 = "Art. 39, CCNL Segretari 2022-2024 (Ipotesi 11/11/2025)";
export const RIF_CCNL_2022_2024_ART17 = "Art. 17, CCNL Funzioni Locali 23.02.2026"; // Compensi Aggiuntivi EQ
export const RIF_CCNL_2022_2024_INC_022_EQ = "CCNL Funzioni Locali 23.02.2026 - Incremento 0,22% MS 2021 per EQ";


// Values from Tabella C - Colonna 3 (Monthly)
// Annual = Monthly * 13
export const IVC_VALUES = {
  [AreaQualifica.FUNZIONARIO_EQ]: 10.62,
  [AreaQualifica.ISTRUTTORE]: 9.40,
  [AreaQualifica.OPERATORE_ESPERTO]: 8.06,
  [AreaQualifica.OPERATORE]: 6.63,
};

export const INITIAL_IVC_DATA: any = {
  mode: 'aggregated',
  aggregatedCounts: {},
  analyticEmployees: [],
  totalReduction: 0,
};

export const PLACEHOLDER_ENTITY_NAME = "Comune di Esempio (Medie Dimensioni)";

export const INITIAL_HISTORICAL_DATA = {
  fondoSalarioAccessorioPersonaleNonDirEQ2016: 1200000.00,
  fondoElevateQualificazioni2016: 150000.00,
  fondoDirigenza2016: 300000.00,
  risorseSegretarioComunale2016: 30000.00,
  personaleServizio2018: 125,
  spesaStipendiTabellari2023: 2500000.00,
  includeDifferenzialiStipendiali2023: false,
  // Nuovi campi per Art. 23 c.2, calcolo su base 2018
  fondoPersonaleNonDirEQ2018_Art23: 1250000.00,
  fondoEQ2018_Art23: 160000.00,
};

export const ALL_TIPOLOGIE_ENTE: { value: TipologiaEnte; label: string }[] = Object.values(TipologiaEnte).map(value => ({ value, label: value as string }));

export const INITIAL_SIMULATORE_INPUT: SimulatoreIncrementoInput = {
  simStipendiTabellari2023: 2500000.00,
  simFondoStabileAnnoApplicazione: 1300000.00,
  simRisorsePOEQAnnoApplicazione: 160000.00,
  simSpesaPersonaleConsuntivo2023: 4000000.00,
  simMediaEntrateCorrenti2021_2023: 15000000.00,
  simTettoSpesaPersonaleL296_06: 3800000.00,
  simCostoAnnuoNuoveAssunzioniPIAO: 100000.00,
  simPercentualeOneriIncremento: 27.4,
};

export const INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA: FondoAccessorioDipendenteData = {
  st_art79c1_art67c1_unicoImporto2017: undefined,
  st_art79c1_art67c1_alteProfessionalitaNonUtil: undefined,
  st_art79c1_art67c2a_incr8320: undefined,
  st_art79c1_art67c2b_incrStipendialiDiff: undefined,
  st_art79c1_art4c2_art67c2c_integrazioneRIA: undefined,
  st_art79c1_art67c2d_risorseRiassorbite165: undefined,
  st_art79c1_art15c1l_art67c2e_personaleTrasferito: undefined,
  st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig: undefined,
  st_art79c1_art14c3_art67c2g_riduzioneStraordinario: undefined,
  st_taglioFondoDL78_2010: undefined,
  st_riduzioniPersonaleATA_PO_Esternalizzazioni: undefined,
  st_art67c1_decurtazionePO_AP_EntiDirigenza: undefined,
  st_art79c1b_euro8450: undefined,
  st_art79c1c_incrementoStabileConsistenzaPers: undefined,
  st_art79c1d_differenzialiStipendiali2022: undefined,
  st_art79c1bis_diffStipendialiB3D3: undefined,
  st_incrementoDecretoPA: undefined,
  st_riduzionePerIncrementoEQ: undefined,
  st_art60c2_CCNL2026_decurtazioneIndennitaComparto: undefined,
  vs_art4c3_art15c1k_art67c3c_recuperoEvasione: undefined,
  vs_art4c2_art67c3d_integrazioneRIAMensile: undefined,
  vs_art67c3g_personaleCaseGioco: undefined,
  vs_art79c2b_max1_2MonteSalari1997: undefined,
  vs_art67c3k_integrazioneArt62c2e_personaleTrasferito: undefined,
  vs_art79c2c_risorseScelteOrganizzative: undefined,
  cl_totaleParzialeRisorsePerConfrontoTetto2016: undefined,
  cl_art23c2_decurtazioneIncrementoAnnualeTetto2016: undefined,
  vn_art15c1d_art67c3a_sponsorConvenzioni: undefined,
  vn_art54_art67c3f_rimborsoSpeseNotifica: undefined,
  vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione: undefined,
  vn_art15c1k_art67c3c_incentiviTecniciCondoni: undefined,
  vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti: undefined,
  vn_art15c1m_art67c3e_risparmiStraordinario: undefined,
  vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale: undefined,
  vn_art80c1_sommeNonUtilizzateStabiliPrec: undefined,
  vn_l145_art1c1091_incentiviRiscossioneIMUTARI: undefined,
  vn_l178_art1c870_risparmiBuoniPasto2020: undefined,
  vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga: undefined,
  vn_art79c3_022MonteSalari2018_da2022Proporzionale: undefined,
  vn_art79c1b_euro8450_unaTantum2021_2022: undefined,
  vn_art79c3_022MonteSalari2018_da2022UnaTantum2022: undefined,
  vn_dl13_art8c3_incrementoPNRR_max5stabile2016: undefined,
  fin_art4_dl16_misureMancatoRispettoVincoli: undefined,
};

export const INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA: FondoElevateQualificazioniData = {
  ris_fondoPO2017: undefined,
  ris_incrementoConRiduzioneFondoDipendenti: undefined,
  ris_incrementoLimiteArt23c2_DL34: undefined,
  ris_incremento022MonteSalari2018: undefined,
  fin_art23c2_adeguamentoTetto2016: undefined,

  va_incremento022_ms2021_eq: undefined,

  st_art16c2_retribuzionePosizione: undefined,
  va_art16c3_retribuzioneRisultato: undefined,
  va_art18c5_CCNL2026_maggiorazioneSediLavoro: undefined,
  va_art16c5_CCNL2026_maggiorazioneInterim: undefined,
  va_dl25_2025_armonizzazione: undefined,
};

export const INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA: FondoSegretarioComunaleData = {
  st_art3c6_CCNL2011_retribuzionePosizione: undefined,
  st_art58c1_CCNL2024_differenzialeAumento: undefined,
  st_art60c1_CCNL2024_retribuzionePosizioneClassi: undefined,
  st_art60c3_CCNL2024_maggiorazioneComplessita: undefined,
  st_art60c5_CCNL2024_allineamentoDirigEQ: undefined,
  st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni: undefined,
  st_art56c1h_CCNL2024_indennitaReggenzaSupplenza: undefined,
  va_art56c1f_CCNL2024_dirittiSegreteria: undefined,
  va_art56c1i_CCNL2024_altriCompensiLegge: undefined,
  va_art8c3_DL13_2023_incrementoPNRR: undefined,
  va_art61c2_CCNL2024_retribuzioneRisultato10: undefined,
  va_art61c2bis_CCNL2024_retribuzioneRisultato15: undefined,
  va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane: undefined,
  va_art61c3_CCNL2024_incremento022MonteSalari2018: undefined,
  st_art36_CCNL2022_2024_incrementoRetribuzionePosizione: undefined,
  va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021: undefined,
  va_art40c2_CCNL2022_2024_incremento0_22MonteSalari2021: undefined,
  va_art40c1_CCNL2026_incremento080MS2021: undefined,
  va_art40c2_CCNL2026_incremento022MS2021_L207: undefined,
  va_art21c1m_CCNL2026_incentiviFunzioniTecniche: undefined,
  fin_totaleRisorseRilevantiLimite: undefined,
  fin_percentualeCoperturaPostoSegretario: 100,
};

export const INITIAL_FONDO_DIRIGENZA_DATA: FondoDirigenzaData = {
  st_art57c2a_CCNL2020_unicoImporto2020: undefined,
  st_art57c2a_CCNL2020_riaPersonaleCessato2020: undefined,
  st_art56c1_CCNL2020_incremento1_53MonteSalari2015: undefined,
  st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo: undefined,
  st_art57c2e_CCNL2020_risorseAutonomeStabili: undefined,
  st_art39c1_CCNL2024_incremento2_01MonteSalari2018: undefined,
  va_art57c2b_CCNL2020_risorseLeggeSponsor: undefined,
  va_art57c2d_CCNL2020_sommeOnnicomprensivita: undefined,
  va_art57c2e_CCNL2020_risorseAutonomeVariabili: undefined,
  va_art57c3_CCNL2020_residuiAnnoPrecedente: undefined,
  va_dl13_2023_art8c3_incrementoPNRR: undefined,
  va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020: undefined,
  va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023: undefined,
  va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione: undefined,
  va_art33c2_DL34_2019_incrementoDeroga: undefined,
  lim_totaleParzialeRisorseConfrontoTetto2016: undefined,
  lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016: undefined,
  lim_art4_DL16_2014_misureMancatoRispettoVincoli: undefined,
  st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021: undefined,
  va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021: undefined,
  va_compensiExLege_rilevanti: undefined,
  va_compensiExLege_nonRilevanti: undefined,
  u_art64c1_CCNL2024_coperturaInterimDirigenziale: undefined,
  u_art24c2_CCNL2026_arretratiRisultato: undefined,
};

export const INITIAL_DISTRIBUZIONE_RISORSE_DATA: DistribuzioneRisorseData = {
  u_diffProgressioniStoriche: undefined,
  u_assegnoAdPersonamRiassorbibile: undefined,
  u_indennitaComparto: undefined,
  u_incrIndennitaEducatori: undefined,
  u_incrIndennitaScolastico: undefined,
  u_indennitaEx8QF: undefined,
  p_performanceOrganizzativa: undefined,
  p_performanceIndividuale: undefined,
  p_maggiorazionePerformanceIndividuale: undefined,
  p_indennitaCondizioniLavoro: undefined,
  p_indennitaTurno: undefined,
  p_indennitaReperibilita: undefined,
  p_indennitaLavoroGiornoRiposo: undefined,
  p_compensiSpecificheResponsabilita: undefined,
  p_indennitaFunzione: undefined,
  p_indennitaServizioEsterno: undefined,
  p_obiettiviPoliziaLocale: undefined,
  p_incentiviContoTerzi: undefined,
  p_compensiAvvocatura: undefined,
  p_incentiviCondonoFunzioniTecnichePre2018: undefined,
  p_incentiviFunzioniTecnichePost2018: undefined,
  p_incentiviIMUTARI: undefined,
  p_compensiMessiNotificatori: undefined,
  p_compensiCaseGioco: undefined,
  p_compensiCaseGiocoNonCoperti: undefined,
  p_diffStipendialiAnnoCorrente: undefined,
  p_pianiWelfare: undefined,
  p_indennitaCentralinistiNonVedenti: undefined,
  p_incentiviServiziAssociatiInnovazione: undefined,
  criteri_isConsuntivoMode: false,
  criteri_percPerfIndividuale: 50,
  criteri_percMaggiorazionePremio: 20,
  criteri_percDipendentiBonus: 5,
  art48_applicaObiettiviEnte: false,
};

export const INITIAL_ANNUAL_DATA = {
  annoRiferimento: DEFAULT_CURRENT_YEAR,
  denominazioneEnte: PLACEHOLDER_ENTITY_NAME,
  tipologiaEnte: TipologiaEnte.COMUNE,
  altroTipologiaEnte: undefined,
  numeroAbitanti: 15000,
  isEnteDissestato: false,
  isEnteStrutturalmenteDeficitario: false,
  isEnteRiequilibrioFinanziario: false,
  hasDirigenza: true,
  isDistributionMode: false,
  personaleServizioAttuale: Object.values(EmployeeCategory).map(cat => ({ category: cat, count: undefined })),
  rispettoEquilibrioBilancioPrecedente: true,
  rispettoDebitoCommercialePrecedente: true,
  incidenzaSalarioAccessorioUltimoRendiconto: 7.2,
  approvazioneRendicontoPrecedente: true,
  proventiSpecifici: [],
  incentiviPNRROpMisureStraordinarie: 0,
  condizioniVirtuositaFinanziariaSoddisfatte: true,
  personale2018PerArt23: [],
  personaleAnnoRifPerArt23: [],
  simulatoreInput: INITIAL_SIMULATORE_INPUT,
  simulatoreRisultati: undefined,
  fondoStabile2016PNRR: 1200000.00,
  calcolatoIncrementoPNRR3: undefined,
  fondoLavoroStraordinario: 50000.00,
  ccnl2024: {
    ivcConglobation: INITIAL_IVC_DATA,
  },
};

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