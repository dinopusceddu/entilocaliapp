import {
  Wizard2026Check,
  Wizard2026EntityType,
  Art23LimitResult,
  Dl25IncrementResult,
  Ccnl2026IncrementsResult,
  ConglobamentoArt60Result,
  StraordinarioIncrementResult,
  PnrrIncrementResult,
  AreaConglobamentoArt60,
  Wizard2026Art23PersonaleEntry,
  Wizard2026Dl25Quote,
  PartTimeNativoRow,
  RisorsaEsclusaStraordinario,
} from '../../logic/wizard2026';

export type {
  Wizard2026Check,
  Wizard2026EntityType,
  Art23LimitResult,
  Dl25IncrementResult,
  Ccnl2026IncrementsResult,
  ConglobamentoArt60Result,
  StraordinarioIncrementResult,
  PnrrIncrementResult,
  AreaConglobamentoArt60,
  Wizard2026Art23PersonaleEntry,
  Wizard2026Dl25Quote,
  PartTimeNativoRow,
  RisorsaEsclusaStraordinario,
};

export interface Wizard2026MetaState {
  currentStep: number;
  completedSteps: number[];
  lastCalculatedAt?: string;
  isPreviewMode: boolean;
  canTransferToLegacy: boolean;
}

export interface Wizard2026EnteStepState {
  entityType?: Wizard2026EntityType;
  denominazioneEnte?: string;
  annoRiferimento?: number;
  hasDirigenza?: boolean;
  isDissesto?: boolean;
  isStrutturalmenteDeficitario?: boolean;
  isPianoRiequilibrio?: boolean;
  isPrimaFasciaDl34?: boolean;
  isEquilibrioPluriennaleAsseverato?: boolean;
  hasApprovazioneCosfel?: boolean;
}


export interface Wizard2026Art23StepState {
  // Dati 2016
  limite2016CertificatoEnte?: number;
  fondoPersonaleDipendente2016?: number;
  fondoEqPo2016?: number;
  fondoDirigenza2016?: number;
  risorseSegretario2016?: number; // facoltativo, non obbligatorio
  fondoStraordinario2016?: number;
  altreVoci2016Soggette?: number;

  // Dati 2018 per valore medio pro capite
  fondoDipendenti2018Soggetto?: number;
  risorsePoEq2018Soggette?: number;
  personaleServizio31122018?: number;
  criterioConteggioPersonale2018?: string;

  // Programmazione 2026 (PIAO)
  personalePrevisto2026Piao?: number;
  criterioConteggioPersonale2026?: string;
  fondoCertificatoParteStabile2018?: number;

  // Dettagli istruttori opzionali personale 2026
  personaleTempoIndeterminato2026?: number;
  personaleTempoDeterminato2026?: number;
  assunzioniPreviste2026?: number;
  cessazioniPreviste2026?: number;
  noteFontePersonale2026?: string;

  // MOD-009: Calcolo automatico/manuale dipendenti Art. 23
  personale2018Art23?: Wizard2026Art23PersonaleEntry[];
  personale2026Art23?: Wizard2026Art23PersonaleEntry[];
  usaCalcoloManualePersonaleArt23?: boolean;
  manualDipendentiEquivalenti2018?: number;
  manualDipendentiEquivalenti2026?: number;

  /** @deprecated Risorse soggette correnti, rimosse dallo Step 2 */
  risorseSoggetteAttuali?: number;
  /** @deprecated Risorse escluse correnti, rimosse dallo Step 2 */
  risorseEscluseAttuali?: number;

  result?: Art23LimitResult;
  checks: Wizard2026Check[];
}



export interface Wizard2026Dl25StepState {
  // ── Campi attivi MOD-011-quater ──────────────────────────────────────────
  stipendiTabellari2023NonDirigenti?: number;
  fondoStabile2025Certificato?: number;
  budgetEq2025?: number;
  altreRisorse2025DaSottrarre?: number;
  quotaTrasferitaAderentiDL25_2025?: number;
  attiComuniAderentiPresenti?: boolean;
  riduzionePermanenteFondiComuniCertificata?: boolean;
  certificazioneRevisoriComuni?: boolean;
  quoteAderenti?: Wizard2026Dl25Quote[];

  // COSFEL — condizionale: solo se ente strutturalmente deficitario
  documentazioneCosfelDl25?: string;

  // Verifica virtuosità (Comuni)
  popolazioneEnte?: number;
  entrateCorrentiN1?: number;
  entrateCorrentiN2?: number;
  entrateCorrentiN3?: number;
  fcdeStanziato?: number;
  spesaPersonaleUltimoRendiconto?: number;

  // Verifica sostenibilità (informativa)
  limiteStoricoSpesaPersonale?: number;
  baseCalcoloLimiteStorico?: string;
  spesaPersonalePrevista2026AnteIncremento?: number;

  // ── Campi @deprecated MOD-011-quater (rimossi da UI, mantenuti per retrocompatibilità) ──
  /** @deprecated MOD-011-quater: lo Step 3 non raccoglie più l'importo richiesto */
  incrementoApplicato?: number;
  /** @deprecated MOD-011-quater */
  fonteDatoStipendi2023?: string;
  /** @deprecated MOD-011-quater */
  attiAutorizzazioneDl25?: string;
  /** @deprecated MOD-011-quater */
  parereRevisoriDl25?: boolean;
  /** @deprecated MOD-011-quater */
  estremiParereRevisoriDl25?: string;
  /** @deprecated MOD-011-quater */
  estremiAsseverazioneEquilibrioPluriennale?: string;
  /** @deprecated MOD-011-quater */
  aliquotaOneriRiflessi?: number;
  /** @deprecated MOD-011-quater */
  aliquotaIRAP?: number;
  /** @deprecated MOD-011-quater */
  accettaRiduzioneSostenibilita?: boolean;
  /** @deprecated MOD-011-quater */
  accettaRiduzioneLimiteStorico?: boolean;
  /** @deprecated MOD-011-quater */
  spesaPersonalePrevistaPostDl25?: number;

  result?: Dl25IncrementResult;
  checks: Wizard2026Check[];
}

export interface Wizard2026Ccnl2026StepState {
  monteSalari2021?: number;
  /** Per anni > 2026: Monte Salari 2021 consolidato dall'istruttoria 2026. Non ricalcolare, non azzerare se mancante. */
  monteSalari2021Consolidato2026?: number;
  /** Intero Fondo risorse decentrate anno 2024 (base di riparto proporzionale 0,22%) */
  fondoRisorseDecentrate2024?: number;
  /** Intere risorse EQ anno 2024 per retribuzione posizione e risultato (base di riparto proporzionale 0,22%) */
  risorseEQ2024?: number;
  /** Quota 0,22% che l'ente intende applicare per l'anno (opzionale; se assente non blocca il calcolo del limite massimo) */
  incremento022Anno?: number;
  /** @deprecated MOD-012 */
  applicaIncremento022?: boolean;
  /** @deprecated MOD-012 */
  percentualeApplicata022?: number;
  result?: Ccnl2026IncrementsResult;
  checks: Wizard2026Check[];
}


export interface Wizard2026ConglobamentoArt60StepState {
  mode: 'guided' | 'manual';
  personaleInteroArea: Partial<Record<AreaConglobamentoArt60, number>>;
  partTimeNativi: PartTimeNativoRow[];
  valoreManuale?: number;
  notaManuale?: string;
  valoreConsolidato2026?: number;
  ftePerArea: Partial<Record<AreaConglobamentoArt60, number>>;
  result?: ConglobamentoArt60Result;
  checks: Wizard2026Check[];
}

export interface Wizard2026StraordinarioStepState {
  // Sezione 1
  /** @deprecated MOD-017: La consistenza storica complessiva è gestita nello Step 2 */
  fondoStraordinarioOrdinario2016?: number;
  fondoStraordinarioOrdinarioAnnoCorrente?: number;
  incrementoStraordinarioOrdinarioProposto?: number;
  /** @deprecated MOD-017: Rimosso dalla UI e non più obbligatorio */
  fonteDatoStraordinarioOrdinario?: string;

  // Sezione 1-bis (Riduzione Stabile Art. 67 CCNL 21.5.2018)
  riduzioneStabileStraordinarioArt67?: number;

  // Sezione 2
  incrementoStraordinarioOrdinario?: number;
  quotaFinanziataConCapienzaArt23?: number;
  quotaFinanziataConRiduzioneFondo?: number;
  contrattazioneIntegrativaRiduzioneFondo?: boolean;

  // Sezione 3
  risorseEscluse?: RisorsaEsclusaStraordinario[];

  // Sezione 4
  stanziamentoStraordinarioOrdinarioAnnoPrecedente?: number;
  spesaStraordinarioOrdinarioAnnoPrecedente?: number;
  economieStraordinarioCertificate?: number;

  // Retrocompatibilità (mantenuti per compatibilità)
  fondoStraordinario2016?: number;
  fondoStraordinarioAnnoCorrente?: number;
  incrementoRichiesto?: number;
  margineArt23?: number;
  riduzioneFondoDecentrato?: number;
  economieStraordinarioAnnoPrecedente?: number;
  straordinarioElettoraleEscluso?: number;
  straordinarioCalamitaEscluso?: number;
  altreRisorseStraordinarioEscluse?: number;

  result?: StraordinarioIncrementResult;
  checks: Wizard2026Check[];
}

export interface Wizard2026PnrrStepState {
  // Campi legacy (mantenuti per compatibilità)
  componenteStabile2016?: number;
  incrementoApplicato?: number;
  enteInEquilibrio?: boolean;
  requisitiVerificati?: boolean;

  // Nuovi campi MOD PNRR
  soggettoAttuatorePnrr?: boolean | null;
  componenteStabileFondoDipendenti2016?: number;
  componenteStabileFondoDirigenza2016?: number;
  equilibrioEsercizioPrecedente?: boolean | null;
  parametriDebitoCommercialeEsercizioPrecedente?: boolean | null;
  incidenzaSalarioAccessorioScelta?: 'diretto' | 'assistito';
  incidenzaSalarioAccessorioPercentuale?: number;
  salarioAccessorioIndicatori?: number;
  spesaPersonaleIndicatori?: number;
  rendicontoApprovatoTermini?: boolean | null;

  result?: PnrrIncrementResult;
  checks: Wizard2026Check[];
}

export interface Wizard2026RiepilogoStepState {
  totaleErrori: number;
  totaleWarning: number;
  totaleInfo: number;
  readyForPreview: boolean;
  readyForFutureTransfer: boolean;
}

export interface Wizard2026DraftState {
  meta: Wizard2026MetaState;
  ente: Wizard2026EnteStepState;
  art23: Wizard2026Art23StepState;
  dl25: Wizard2026Dl25StepState;
  ccnl2026: Wizard2026Ccnl2026StepState;
  conglobamentoArt60: Wizard2026ConglobamentoArt60StepState;
  straordinario: Wizard2026StraordinarioStepState;
  pnrr: Wizard2026PnrrStepState;
  riepilogo: Wizard2026RiepilogoStepState;
}
