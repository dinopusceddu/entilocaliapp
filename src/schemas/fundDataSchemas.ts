// src/schemas/fundDataSchemas.ts
import { z } from 'zod';
import { parseMonetaryValue, validateMonetaryData, defaultMonetaryPolicy, type MonetaryPolicy } from '../domain/monetaryBoundary';
import { AreaQualifica, EmployeeCategory, LivelloPeo, TipologiaEnte, TipoMaggiorazione, UserRole } from '../enums.ts';

const numberOrUndefined = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const n = Number(val);
    return isNaN(n) ? undefined : n;
  },
  z.number().optional()
);

export const monetarySchema = (policy: Pick<MonetaryPolicy, 'scale' | 'sign'> = defaultMonetaryPolicy) => z.unknown().transform((raw, ctx) => {
  const result = parseMonetaryValue(raw, policy);
  if (result.status === 'INVALID') {
    ctx.addIssue({ code: 'custom', message: result.issue.message, params: { monetaryCode: result.issue.code } });
    return z.NEVER;
  }
  return result.value;
}).optional();
export const MonetarySchema = monetarySchema();

// Enums
export const UserRoleSchema = z.nativeEnum(UserRole);
export const EmployeeCategorySchema = z.nativeEnum(EmployeeCategory);
export const TipologiaEnteSchema = z.nativeEnum(TipologiaEnte);
export const LivelloPeoSchema = z.nativeEnum(LivelloPeo);
export const AreaQualificaSchema = z.nativeEnum(AreaQualifica);
export const TipoMaggiorazioneSchema = z.nativeEnum(TipoMaggiorazione);

export const EntityClassificationTypeSchema = z.enum([
  'REGIONE',
  'CITTA_METROPOLITANA',
  'PROVINCIA',
  'COMUNE',
  'UNIONE_COMUNI',
  'COMUNITA_MONTANA',
  'COMUNITA_ISOLANA_O_ARCIPELAGO',
  'CAMERA_COMMERCIO',
  'ENTE_REGIONALE',
  'ENTE_PARCO',
  'CONSORZIO',
  'ASP',
  'AZIENDA_SPECIALE',
  'ISTITUZIONE',
  'ALTRO_ENTE_STRUMENTALE',
  'ALTRO'
]);

export const EntityTerritorialContextSchema = z.enum([
  'ORDINARY_REGIME',
  'SICILIAN_AREA_VASTA',
  'OTHER_SPECIAL_AUTONOMY',
  'UNKNOWN'
]);

export const EntityClassificationSchema = z.object({
  entityType: EntityClassificationTypeSchema.optional(),
  territorialContext: EntityTerritorialContextSchema.optional(),
}).passthrough();

export const Art33ManualDecisionSchema = z.enum(['APPLY', 'DO_NOT_APPLY']);

// Schemas
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: UserRoleSchema,
}).passthrough();

export const NormativeDataSchema = z.object({
  valori_pro_capite: z.object({
    art67_ccnl_2018: z.number(),
    art79_ccnl_2022_b: z.number(),
  }).passthrough(),
  limiti: z.object({
    incidenza_salario_accessorio: z.number(),
    incremento_virtuosi_dl25_2025: z.number(),
    incremento_pnrr_dl13_2023: z.number(),
  }).passthrough(),
  // FIX: Corrected z.record to have two arguments (key and value schema).
  riferimenti_normativi: z.record(z.string(), z.string()),
  progression_economic_values: z.record(z.string(), z.record(z.string(), z.number())),
  indennita_comparto_values: z.record(z.string(), z.number()),
}).passthrough();

export const HistoricalDataSchema = z.object({
  fondoSalarioAccessorioPersonaleNonDirEQ2016: MonetarySchema,
  fondoElevateQualificazioni2016: MonetarySchema,
  fondoDirigenza2016: MonetarySchema,
  risorseSegretarioComunale2016: MonetarySchema,
  fondoStraordinario2016: MonetarySchema,
  personaleServizio2018: numberOrUndefined,
  spesaStipendiTabellari2023: MonetarySchema,
  includeDifferenzialiStipendiali2023: z.boolean().optional(),
  fondoPersonaleNonDirEQ2018_Art23: MonetarySchema,
  fondoEQ2018_Art23: MonetarySchema,
  manualPersonalFundLimit2016: MonetarySchema,
  manualStrategyFundLimit2016: MonetarySchema,
}).passthrough();

export const Art23EmployeeDetailSchema = z.object({
  id: z.string(),
  partTimePercentage: numberOrUndefined,
  cedoliniEmessi: numberOrUndefined,
}).passthrough();

export const ProventoSpecificoSchema = z.object({
  id: z.string(),
  descrizione: z.string(),
  importo: MonetarySchema,
  riferimentoNormativo: z.string(),
}).passthrough();

export const SimulatoreIncrementoInputSchema = z.object({
  referenceYear: numberOrUndefined,
  regimeDate: z.string().optional(),
  simStipendiTabellari2023: MonetarySchema,
  simFondoStabileAnnoApplicazione: MonetarySchema,
  simRisorsePOEQAnnoApplicazione: MonetarySchema,
  simSpesaPersonaleConsuntivo2023: MonetarySchema,
  simMediaEntrateCorrenti2021_2023: MonetarySchema,
  simTettoSpesaPersonaleL296_06: MonetarySchema,
  simCostoAnnuoNuoveAssunzioniPIAO: MonetarySchema,
  simPercentualeOneriIncremento: numberOrUndefined,
}).passthrough();

export const SimulatoreIncrementoRisultatiSchema = z.object({
  state: z.enum(['VALID','INVALID','UNDETERMINED']).optional(),
  regime: z.string().optional(),
  dateIndifferent: z.boolean().optional(),
  fase1_incrementoPotenzialeNetto: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase2_spazioDisponibileNetto: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase3_margineDisponibileNetto: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase4_spazioUtilizzabileNetto: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase1_obiettivo48: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase1_fondoAttualeComplessivo: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase1_incrementoPotenzialeLordo: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase2_spesaPersonaleAttualePrevista: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase2_sogliaPercentualeDM17_03_2020: numberOrUndefined,
  fase2_limiteSostenibileDL34: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase2_spazioDisponibileDL34: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase3_margineDisponibileL296_06: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase4_spazioUtilizzabileLordo: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fase5_incrementoNettoEffettivoFondo: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
}).passthrough();

export const AnnualEmployeeCountSchema = z.object({
  category: EmployeeCategorySchema,
  count: numberOrUndefined,
}).passthrough();

export const Ccnl2024SettingsSchema = z.object({
  monteSalari2021: MonetarySchema,
  fondoPersonale2025: MonetarySchema,
  fondoEQ2025: MonetarySchema,
  optionalIncreaseVariableFrom2026Percentage: numberOrUndefined,
  optionalIncreaseVariable2026OnlyPercentage: numberOrUndefined,
  isEnteConDirigenza: z.boolean().optional(),
  personaleInServizio01012026: numberOrUndefined,
  valoreTabellaCCol3: MonetarySchema,
  applyPartTimeProportion: z.boolean().optional(),
  averagePartTimePercentage: numberOrUndefined,



  ivcConglobation: z.object({
    mode: z.enum(['aggregated', 'analytic']),
    aggregatedCounts: z.record(AreaQualificaSchema, numberOrUndefined).optional(),
    analyticEmployees: z.array(z.object({
      id: z.string(),
      area: AreaQualificaSchema,
      partTimePercentage: z.number(),
    }).passthrough()).optional(),
    totalReduction: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }).pipe(z.number()),
  }).passthrough().optional(),
}).passthrough();

export const DocumentMetadataSchema = z.object({
  numeroDetermina: z.string().optional(),
  dataDetermina: z.string().optional(),
  numDeliberaGc: z.string().optional(),
  dataDeliberaGc: z.string().optional(),
  adoptionStatus: z.enum(['DOCUMENTED_ADOPTED', 'NOT_DOCUMENTED']).optional(),
  numVerbaleRevisori: z.string().optional(),
  dataVerbaleRevisori: z.string().optional(),
  opinionOutcome: z.enum(['FAVORABLE', 'UNFAVORABLE', 'OTHER', 'UNKNOWN']).optional(),
  transmissionStatus: z.enum(['DOCUMENTED_SENT', 'NOT_DOCUMENTED']).optional(),
  firmaDigitale: z.string().optional(),
}).passthrough();

export const Dl25AnnualStateSchema = z.object({
  version: z.literal(1).optional(),
  stipendiTabellari2023NonDirigenti: MonetarySchema,
  fondoStabile2025Certificato: MonetarySchema,
  budgetEq2025: MonetarySchema,
  altreRisorse2025DaSottrarre: MonetarySchema,
  priorCumulativeApplied: MonetarySchema,
  priorStockProvenance: z.string().optional(),
  currentYearDelta: MonetarySchema,
  legacyStoredAmount: MonetarySchema,
  legacyQualification: z.enum(['CUMULATIVE_STOCK', 'CURRENT_YEAR_DELTA', 'UNKNOWN']).optional(),
  legacyAppliedProvenance: z.string().optional(),
  regimeDate: z.string().optional(),
}).passthrough();

export const CcnlRecoveryInstructionSchema = z.object({
  kind: z.enum(['CCNL_014', 'CCNL_022']),
  competenceYear: z.number().int(),
  recognitionYear: z.number().int(),
  instructionStatus: z.enum(['UNINSTRUCTED', 'NOT_TO_RECOVER', 'RECOVER_PARTIAL', 'RECOVER_FULL']).optional(),
  originAdministrativeStatus: z.enum(['CLOSED_AND_DEFINED', 'NOT_CLOSED_AND_DEFINED', 'UNKNOWN']).optional(),
  automaticResidualPerformanceClause: z.enum(['PRESENT', 'ABSENT', 'UNKNOWN']).optional(),
  source: z.string().optional(),
  activatedAmount2025: MonetarySchema,
  activationDecisionAttested: z.boolean().optional(),
  alreadyRecognizedAmount: MonetarySchema,
  requestedRecoveryAmount: MonetarySchema,
  alreadyRecognizedEqAmount: MonetarySchema,
  requestedEqRecoveryAmount: MonetarySchema,
  eqPerformanceClauseSource: z.string().optional(),
  mode: z.enum(['FIRST_QUALIFICATION', 'BOUND_RESIDUAL_CARRY']).optional(),
  qualifiedResidualReference: z.string().optional(),
  constitutedAndCertified2026: z.boolean().optional(),
}).passthrough();

export const AnnualDataSchema = z.object({
  ccnlRecovery: z.object({
    instructions: z.array(CcnlRecoveryInstructionSchema).optional(),
    fondoRisorseDecentrate2024: MonetarySchema,
    risorseEQ2024: MonetarySchema,
  }).passthrough().optional(),
  dl25: Dl25AnnualStateSchema.optional(),
  annoRiferimento: z.number(),
  denominazioneEnte: z.string().optional(),
  tipologiaEnte: TipologiaEnteSchema.optional(),
  altroTipologiaEnte: z.string().optional(),
  entityClassification: EntityClassificationSchema.optional(),
  art33ManualDecision: Art33ManualDecisionSchema.optional(),
  numeroAbitanti: numberOrUndefined,
  isEnteDissestato: z.boolean().optional(),
  isEnteStrutturalmenteDeficitario: z.boolean().optional(),
  isEnteRiequilibrioFinanziario: z.boolean().optional(),
  hasDirigenza: z.boolean().optional(),
  isDistributionMode: z.boolean().optional(),
  personaleServizioAttuale: z.array(AnnualEmployeeCountSchema),
  rispettoEquilibrioBilancioPrecedente: z.boolean().optional(),
  rispettoDebitoCommercialePrecedente: z.boolean().optional(),
  incidenzaSalarioAccessorioUltimoRendiconto: numberOrUndefined,
  approvazioneRendicontoPrecedente: z.boolean().optional(),
  proventiSpecifici: z.array(ProventoSpecificoSchema),
  incentiviPNRROpMisureStraordinarie: MonetarySchema,
  condizioniVirtuositaFinanziariaSoddisfatte: z.boolean().optional(),
  personale2018PerArt23: z.array(Art23EmployeeDetailSchema),
  personaleAnnoRifPerArt23: z.array(Art23EmployeeDetailSchema),

  manualDipendentiEquivalenti2018: numberOrUndefined,
  manualDipendentiEquivalentiAnnoRif: numberOrUndefined,
  isArt23FteManualMode: z.boolean().optional(),

  simulatoreInput: SimulatoreIncrementoInputSchema,
  simulatoreRisultati: SimulatoreIncrementoRisultatiSchema.optional(),
  fondoStabile2016PNRR: MonetarySchema,
  pnrrExerciseDecision: z.enum(['NOT_EXERCISED', 'EXERCISED', 'UNSET']).optional(),
  pnrrSubject: z.boolean().optional(),
  calcolatoIncrementoPNRR3: monetarySchema({ scale: null, sign: 'DERIVED_ONLY' }),
  fondoLavoroStraordinario: MonetarySchema,

  ccnl2024: Ccnl2024SettingsSchema.optional(),
  documentMetadata: DocumentMetadataSchema.optional(),
}).passthrough().refine(data => data.tipologiaEnte !== TipologiaEnte.ALTRO || (data.altroTipologiaEnte && data.altroTipologiaEnte.length > 0), {
  message: "Specificare la tipologia di ente",
  path: ["altroTipologiaEnte"],
});

export const FondoDataBaseSchema = z.object({
  st_art79c1_art67c1_unicoImporto2017: MonetarySchema,
  st_art79c1_art67c1_alteProfessionalitaNonUtil: MonetarySchema,
  st_art79c1_art67c2a_incr8320: MonetarySchema,
  st_art79c1_art67c2b_incrStipendialiDiff: MonetarySchema,
  st_art79c1_art4c2_art67c2c_integrazioneRIA: MonetarySchema,
  st_art79c1_art67c2d_risorseRiassorbite165: MonetarySchema,
  st_art79c1_art15c1l_art67c2e_personaleTrasferito: MonetarySchema,
  st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig: MonetarySchema,
  st_art79c1_art14c3_art67c2g_riduzioneStraordinario: MonetarySchema,
  st_taglioFondoDL78_2010: MonetarySchema,
  st_riduzioniPersonaleATA_PO_Esternalizzazioni: MonetarySchema,
  st_art67c1_decurtazionePO_AP_EntiDirigenza: MonetarySchema,
  st_art79c1b_euro8450: MonetarySchema,
  st_art79c1c_incrementoStabileConsistenzaPers: MonetarySchema,
  st_art79c1d_differenzialiStipendiali2022: MonetarySchema,
  st_art79c1bis_diffStipendialiB3D3: MonetarySchema,
  st_art58c1_CCNL2026_incremento014_MS2021: MonetarySchema,
  st_incrementoDL25_2025: MonetarySchema,
  /** @deprecated use st_incrementoDL25_2025 instead */
  st_incrementoDecretoPA: MonetarySchema,
  st_riduzionePerIncrementoEQ: MonetarySchema,
  st_art60c2_CCNL2026_decurtazioneIndennitaComparto: MonetarySchema,
  vs_art4c3_art15c1k_art67c3c_recuperoEvasione: MonetarySchema,
  vs_art4c2_art67c3d_integrazioneRIAMensile: MonetarySchema,
  vs_art67c3g_personaleCaseGioco: MonetarySchema,
  vs_art79c2b_max1_2MonteSalari1997: MonetarySchema,
  vs_art67c3k_integrazioneArt62c2e_personaleTrasferito: MonetarySchema,
  vs_art79c2c_risorseScelteOrganizzative: MonetarySchema,
  cl_totaleParzialeRisorsePerConfrontoTetto2016: z.unknown().optional(),
  cl_art23c2_decurtazioneIncrementoAnnualeTetto2016: MonetarySchema,
  vn_art15c1d_art67c3a_sponsorConvenzioni: MonetarySchema,
  vn_art54_art67c3f_rimborsoSpeseNotifica: MonetarySchema,
  vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione: MonetarySchema,
  vn_art15c1k_art67c3c_incentiviTecniciCondoni: MonetarySchema,
  vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti: MonetarySchema,
  vn_art15c1m_art67c3e_risparmiStraordinario: MonetarySchema,
  vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale: MonetarySchema,
  vn_art80c1_sommeNonUtilizzateStabiliPrec: MonetarySchema,
  vn_l145_art1c1091_incentiviRiscossioneIMUTARI: MonetarySchema,
  vn_l178_art1c870_risparmiBuoniPasto2020: MonetarySchema,
  vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga: MonetarySchema,
  vn_art79c3_022MonteSalari2018_da2022Proporzionale: MonetarySchema,
  vn_art79c1b_euro8450_unaTantum2021_2022: MonetarySchema,
  vn_art79c3_022MonteSalari2018_da2022UnaTantum2022: MonetarySchema,
  vn_dl13_art8c3_incrementoPNRR_max5stabile2016: MonetarySchema,
  vn_art58c2_CCNL2026_incremento022_MS2021: MonetarySchema,
  vn_art58c2_incremento_max022_ms2021_anno2025: MonetarySchema,
  vn_art58_CCNL2026_arretrati2024_2025: MonetarySchema,
  fin_art4_dl16_misureMancatoRispettoVincoli: MonetarySchema,
}).passthrough();

export const FondoElevateQualificazioniDataSchema = z.object({
  ris_fondoPO2017: MonetarySchema,
  ris_incrementoConRiduzioneFondoDipendenti: MonetarySchema,
  ris_incrementoLimiteArt23c2_DL34: MonetarySchema,
  ris_incremento022MonteSalari2018: MonetarySchema,
  fin_art23c2_adeguamentoTetto2016: MonetarySchema,

  va_incremento022_ms2021_eq: MonetarySchema,

  // -- RIPARTO RETRIBUZIONE --
  st_art16c2_retribuzionePosizione: MonetarySchema,
  va_art16c3_retribuzioneRisultato: MonetarySchema,
  va_art18c5_CCNL2026_maggiorazioneSediLavoro: MonetarySchema,
  va_art16c5_CCNL2026_maggiorazioneInterim: MonetarySchema,
  va_dl25_2025_armonizzazione: MonetarySchema,
}).passthrough();

export const FondoSegretarioComunaleDataSchema = z.object({
  st_art3c6_CCNL2011_retribuzionePosizione: MonetarySchema,
  st_art58c1_CCNL2024_differenzialeAumento: MonetarySchema,
  st_art60c1_CCNL2024_retribuzionePosizioneClassi: MonetarySchema,
  st_art60c3_CCNL2024_maggiorazioneComplessita: MonetarySchema,
  st_art60c5_CCNL2024_allineamentoDirigEQ: MonetarySchema,
  st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni: MonetarySchema,
  st_art56c1h_CCNL2024_indennitaReggenzaSupplenza: MonetarySchema,
  va_art56c1f_CCNL2024_dirittiSegreteria: MonetarySchema,
  va_art56c1i_CCNL2024_altriCompensiLegge: MonetarySchema,
  va_art8c3_DL13_2023_incrementoPNRR: MonetarySchema,
  va_art61c2_CCNL2024_retribuzioneRisultato10: MonetarySchema,
  va_art61c2bis_CCNL2024_retribuzioneRisultato15: MonetarySchema,
  va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane: MonetarySchema,
  va_art61c3_CCNL2024_incremento022MonteSalari2018: MonetarySchema,
  va_art40c1_CCNL2026_incremento080MS2021: MonetarySchema,
  va_art40c2_CCNL2026_incremento022MS2021_L207: MonetarySchema,
  va_art21c1m_CCNL2026_incentiviFunzioniTecniche: MonetarySchema,
  fin_totaleRisorseRilevantiLimite: z.unknown().optional(),
  fin_percentualeCoperturaPostoSegretario: numberOrUndefined,
  segretarioDerogaMode: z.enum(['ordinario', 'dl19_2026_solo_corrente', 'dl19_2026_doppia_neutralizzazione', 'dl44_2023_temporanea']).optional(),
  quotaSegretario2016Neutralizzabile: MonetarySchema,
}).passthrough();

export const FondoDirigenzaDataSchema = z.object({
  st_art57c2a_CCNL2020_unicoImporto2020: MonetarySchema,
  st_art57c2a_CCNL2020_riaPersonaleCessato2020: MonetarySchema,
  st_art56c1_CCNL2020_incremento1_53MonteSalari2015: MonetarySchema,
  st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo: MonetarySchema,
  st_art57c2e_CCNL2020_risorseAutonomeStabili: MonetarySchema,
  st_art39c1_CCNL2024_incremento2_01MonteSalari2018: MonetarySchema,
  va_art57c2b_CCNL2020_risorseLeggeSponsor: MonetarySchema,
  va_art57c2d_CCNL2020_sommeOnnicomprensivita: MonetarySchema,
  va_art57c2e_CCNL2020_risorseAutonomeVariabili: MonetarySchema,
  va_art57c3_CCNL2020_residuiAnnoPrecedente: MonetarySchema,
  va_dl13_2023_art8c3_incrementoPNRR: MonetarySchema,
  va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020: MonetarySchema,
  va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023: MonetarySchema,
  va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione: MonetarySchema,
  va_art33c2_DL34_2019_incrementoDeroga: MonetarySchema,
  lim_totaleParzialeRisorseConfrontoTetto2016: z.unknown().optional(),
  lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016: monetarySchema({ scale: 2, sign: 'SIGNED_ADJUSTMENT' }),
  lim_art4_DL16_2014_misureMancatoRispettoVincoli: MonetarySchema,
  st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021: MonetarySchema,
  va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021: MonetarySchema,
  va_compensiExLege_rilevanti: MonetarySchema,
  va_compensiExLege_nonRilevanti: MonetarySchema,
  u_art64c1_CCNL2024_coperturaInterimDirigenziale: MonetarySchema,
  u_art24c2_CCNL2026_arretratiRisultato: MonetarySchema,
}).passthrough();

export const RisorsaVariabileDetailSchema = z.object({
  stanziate: MonetarySchema,
  risparmi: MonetarySchema,
  aBilancio: MonetarySchema,
}).passthrough();

export const DistribuzioneRisorseDataSchema = z.object({
  u_diffProgressioniStoriche: MonetarySchema,
  u_assegnoAdPersonamRiassorbibile: MonetarySchema,
  u_indennitaComparto: MonetarySchema,
  u_incrIndennitaEducatori: RisorsaVariabileDetailSchema.optional(),
  u_incrIndennitaScolastico: RisorsaVariabileDetailSchema.optional(),
  u_indennitaEx8QF: RisorsaVariabileDetailSchema.optional(),
  p_performanceOrganizzativa: RisorsaVariabileDetailSchema.optional(),
  p_performanceIndividuale: RisorsaVariabileDetailSchema.optional(),
  p_maggiorazionePerformanceIndividuale: RisorsaVariabileDetailSchema.optional(),
  p_indennitaCondizioniLavoro: RisorsaVariabileDetailSchema.optional(),
  p_indennitaTurno: RisorsaVariabileDetailSchema.optional(),
  p_indennitaReperibilita: RisorsaVariabileDetailSchema.optional(),
  p_indennitaLavoroGiornoRiposo: RisorsaVariabileDetailSchema.optional(),
  p_compensiSpecificheResponsabilita: RisorsaVariabileDetailSchema.optional(),
  p_indennitaFunzione: RisorsaVariabileDetailSchema.optional(),
  p_indennitaServizioEsterno: RisorsaVariabileDetailSchema.optional(),
  p_obiettiviPoliziaLocale: RisorsaVariabileDetailSchema.optional(),
  p_incentiviContoTerzi: RisorsaVariabileDetailSchema.optional(),
  p_compensiAvvocatura: RisorsaVariabileDetailSchema.optional(),
  p_incentiviCondonoFunzioniTecnichePre2018: RisorsaVariabileDetailSchema.optional(),
  p_incentiviFunzioniTecnichePost2018: RisorsaVariabileDetailSchema.optional(),
  p_incentiviIMUTARI: RisorsaVariabileDetailSchema.optional(),
  p_compensiMessiNotificatori: RisorsaVariabileDetailSchema.optional(),
  p_compensiCaseGioco: RisorsaVariabileDetailSchema.optional(),
  p_compensiCaseGiocoNonCoperti: RisorsaVariabileDetailSchema.optional(),
  p_diffStipendialiAnnoCorrente: RisorsaVariabileDetailSchema.optional(),
  p_pianiWelfare: RisorsaVariabileDetailSchema.optional(),
  p_indennitaCentralinistiNonVedenti: RisorsaVariabileDetailSchema.optional(),
  p_incentiviServiziAssociatiInnovazione: RisorsaVariabileDetailSchema.optional(),
  criteri_isConsuntivoMode: z.boolean().optional(),
  criteri_percPerfIndividuale: numberOrUndefined,
  criteri_percMaggiorazionePremio: numberOrUndefined,
  criteri_percDipendentiBonus: numberOrUndefined,
  art48_applicaObiettiviEnte: z.boolean().optional(),
}).passthrough();

export const PersonaleServizioDettaglioSchema = z.object({
  id: z.string(),
  partTimePercentage: numberOrUndefined,
  fullYearService: z.boolean(),
  assunzioneDate: z.string().optional(),
  cessazioneDate: z.string().optional(),
  livelloPeoStoriche: LivelloPeoSchema.optional(),
  numeroDifferenziali: numberOrUndefined,
  tipoMaggiorazione: TipoMaggiorazioneSchema.optional(),
  areaQualifica: AreaQualificaSchema.optional(),
}).passthrough();

export const FundDataSchema = z.object({
  historicalData: HistoricalDataSchema,
  annualData: AnnualDataSchema,
  // Known economic properties cannot bypass the shared monetary contract.
  fondoAccessorioDipendenteData: FondoDataBaseSchema.optional(),
  fondoElevateQualificazioniData: FondoElevateQualificazioniDataSchema.optional(),
  fondoSegretarioComunaleData: FondoSegretarioComunaleDataSchema.optional(),
  fondoDirigenzaData: FondoDirigenzaDataSchema.optional(),
  distribuzioneRisorseData: DistribuzioneRisorseDataSchema.optional(),
  personaleServizio: z.any().optional(),
  wizard2026TransferSnapshot: z.any().optional(),
}).passthrough().superRefine((data, ctx) => {
  for (const issue of validateMonetaryData(data)) ctx.addIssue({ code: 'custom', path: issue.path.split('.'), message: issue.message,
    params: { monetaryCode: issue.code } });
});
