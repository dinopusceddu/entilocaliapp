import { 
  EmployeeCategory, 
  TipologiaEnte, 
  AreaQualifica, 
  LivelloPeo,
  TipoMaggiorazione 
} from './enums.ts';
import { 
  RisorsaVariabileDetail 
} from './valueObjects.ts';

/**
 * Interfacce centrali del dominio canonico per il motore di calcolo.
 */

export interface FundStructureItem {
  section: 'stabili' | 'vs_soggette' | 'vn_non_soggette' | 'fin_decurtazioni' | 'cl_limiti';
  operator: '+' | '-';
  isRelevantToArt23Limit: boolean;
}

export type FundStructureConfig = Record<string, FundStructureItem>;

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
  manualPersonalFundLimit2016?: number;
  manualStrategyFundLimit2016?: number;
}

export interface Art23EmployeeDetail {
  id: string;
  partTimePercentage?: number;
  cedoliniEmessi?: number;
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
  cl_ammontareSoggettoLimite2016?: number;
}

export interface FondoElevateQualificazioniData {
  ris_fondoPO2017?: number;
  ris_incrementoConRiduzioneFondoDipendenti?: number;
  ris_incrementoLimiteArt23c2_DL34?: number;
  ris_incremento022MonteSalari2018?: number;
  fin_art23c2_adeguamentoTetto2016?: number;
  va_incremento022_ms2021_eq?: number;
  st_art16c2_retribuzionePosizione?: number;
  va_art16c3_retribuzioneRisultato?: number;
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
  va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020?: number;
  va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023?: number;
  va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione?: number;
  va_art33c2_DL34_2019_incrementoDeroga?: number;
  va_dl13_2023_art8c3_incrementoPNRR?: number;
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

export interface IvcConglobationEmployee {
  id: string;
  area: AreaQualifica;
  partTimePercentage: number;
}

export interface IvcConglobationData {
  mode: 'aggregated' | 'analytic';
  aggregatedCounts?: {
    [key in AreaQualifica]?: number;
  };
  analyticEmployees?: IvcConglobationEmployee[];
  totalReduction: number;
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
  ivcConglobation?: IvcConglobationData;
}

export interface DocumentMetadata {
  numeroDetermina?: string;
  dataDetermina?: string;
  numDeliberaGc?: string;
  dataDeliberaGc?: string;
  numVerbaleRevisori?: string;
  dataVerbaleRevisori?: string;
  firmaDigitale?: string;
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
  manualDipendentiEquivalenti2018?: number;
  manualDipendentiEquivalentiAnnoRif?: number;
  simulatoreInput: SimulatoreIncrementoInput;
  simulatoreRisultati?: SimulatoreIncrementoRisultati;
  fondoStabile2016PNRR?: number;
  calcolatoIncrementoPNRR3?: number;
  fondoLavoroStraordinario?: number;
  incrementoFondoStraordinario?: number;
  riduzioneFondoParteStabile?: boolean;
  ccnl2024?: Ccnl2024Settings;
  documentMetadata?: DocumentMetadata;
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
  metadata?: any; // Will be typed as AnnualSnapshotMetadata in snapshot.ts to avoid circular deps
}

