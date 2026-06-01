import { Wizard2026DraftState } from './types';

export const initialWizard2026DraftState: Wizard2026DraftState = {
  meta: {
    currentStep: 1,
    completedSteps: [],
    isPreviewMode: true,
    canTransferToLegacy: false,
  },
  ente: {
    entityType: undefined,
    denominazioneEnte: undefined,
    annoRiferimento: 2026,
    hasDirigenza: undefined,
    isDissesto: undefined,
    isStrutturalmenteDeficitario: undefined,
    isPianoRiequilibrio: undefined,
    isPrimaFasciaDl34: undefined,
    isEquilibrioPluriennaleAsseverato: undefined,
    hasApprovazioneCosfel: undefined,
  },
  art23: {
    limite2016CertificatoEnte: undefined,
    fondoPersonaleDipendente2016: undefined,
    fondoEqPo2016: undefined,
    fondoDirigenza2016: undefined,
    risorseSegretario2016: undefined,
    fondoStraordinario2016: undefined,
    altreVoci2016Soggette: undefined,
    fondoDipendenti2018Soggetto: undefined,
    risorsePoEq2018Soggette: undefined,
    personaleServizio31122018: undefined,
    criterioConteggioPersonale2018: '',
    personalePrevisto2026Piao: undefined,
    criterioConteggioPersonale2026: '',
    fondoCertificatoParteStabile2018: undefined,
    personaleTempoIndeterminato2026: undefined,
    personaleTempoDeterminato2026: undefined,
    assunzioniPreviste2026: undefined,
    cessazioniPreviste2026: undefined,
    noteFontePersonale2026: '',
    risorseSoggetteAttuali: undefined,
    risorseEscluseAttuali: undefined,
    personale2018Art23: [],
    personale2026Art23: [],
    usaCalcoloManualePersonaleArt23: false,
    manualDipendentiEquivalenti2018: undefined,
    manualDipendentiEquivalenti2026: undefined,
    result: undefined,
    checks: [],
  },
  dl25: {
    // Campi attivi MOD-011-quater
    stipendiTabellari2023NonDirigenti: undefined,
    fondoStabile2025Certificato: undefined,
    budgetEq2025: undefined,
    altreRisorse2025DaSottrarre: undefined,
    quotaTrasferitaAderentiDL25_2025: undefined,
    attiComuniAderentiPresenti: undefined,
    riduzionePermanenteFondiComuniCertificata: undefined,
    certificazioneRevisoriComuni: undefined,
    quoteAderenti: [],
    documentazioneCosfelDl25: undefined,
    // Verifica virtuosità
    popolazioneEnte: undefined,
    entrateCorrentiN1: undefined,
    entrateCorrentiN2: undefined,
    entrateCorrentiN3: undefined,
    fcdeStanziato: undefined,
    spesaPersonaleUltimoRendiconto: undefined,
    // Verifica sostenibilità (informativa)
    limiteStoricoSpesaPersonale: undefined,
    baseCalcoloLimiteStorico: undefined,
    spesaPersonalePrevista2026AnteIncremento: undefined,
    // Campi @deprecated — non più inizializzati con default
    incrementoApplicato: undefined,
    fonteDatoStipendi2023: undefined,
    attiAutorizzazioneDl25: undefined,
    parereRevisoriDl25: undefined,
    aliquotaOneriRiflessi: undefined,
    aliquotaIRAP: undefined,
    accettaRiduzioneSostenibilita: undefined,
    accettaRiduzioneLimiteStorico: undefined,
    spesaPersonalePrevistaPostDl25: undefined,

    result: undefined,
    checks: [],
  },
  ccnl2026: {
    monteSalari2021: undefined,
    monteSalari2021Consolidato2026: undefined,
    fondoRisorseDecentrate2024: undefined,
    risorseEQ2024: undefined,
    incremento022Anno: undefined,
    applicaIncremento022: undefined,
    percentualeApplicata022: undefined,
    result: undefined,
    checks: [],
  },

  conglobamentoArt60: {
    mode: 'guided',
    personaleInteroArea: {},
    partTimeNativi: [],
    valoreManuale: undefined,
    notaManuale: '',
    valoreConsolidato2026: undefined,
    ftePerArea: {},
    result: undefined,
    checks: [],
  },
  straordinario: {
    // Sezione 1
    fondoStraordinarioOrdinario2016: undefined,
    fondoStraordinarioOrdinarioAnnoCorrente: undefined,
    incrementoStraordinarioOrdinarioProposto: undefined,
    fonteDatoStraordinarioOrdinario: '',

    // Sezione 1-bis
    riduzioneStabileStraordinarioArt67: undefined,

    // Sezione 2
    incrementoStraordinarioOrdinario: undefined,
    quotaFinanziataConCapienzaArt23: undefined,
    quotaFinanziataConRiduzioneFondo: undefined,
    contrattazioneIntegrativaRiduzioneFondo: undefined,

    // Sezione 3
    risorseEscluse: [],

    // Sezione 4
    stanziamentoStraordinarioOrdinarioAnnoPrecedente: undefined,
    spesaStraordinarioOrdinarioAnnoPrecedente: undefined,
    economieStraordinarioCertificate: undefined,

    // Retrocompatibilità (mantenuti per compatibilità)
    fondoStraordinario2016: undefined,
    fondoStraordinarioAnnoCorrente: undefined,
    incrementoRichiesto: undefined,
    margineArt23: undefined,
    riduzioneFondoDecentrato: undefined,
    economieStraordinarioAnnoPrecedente: undefined,
    straordinarioElettoraleEscluso: undefined,
    straordinarioCalamitaEscluso: undefined,
    altreRisorseStraordinarioEscluse: undefined,

    result: undefined,
    checks: [],
  },
  pnrr: {
    // Campi legacy
    componenteStabile2016: undefined,
    incrementoApplicato: undefined,
    enteInEquilibrio: undefined,
    requisitiVerificati: undefined,

    // Nuovi campi MOD PNRR
    soggettoAttuatorePnrr: undefined,
    componenteStabileFondoDipendenti2016: undefined,
    componenteStabileFondoDirigenza2016: undefined,
    equilibrioEsercizioPrecedente: undefined,
    parametriDebitoCommercialeEsercizioPrecedente: undefined,
    incidenzaSalarioAccessorioScelta: 'diretto',
    incidenzaSalarioAccessorioPercentuale: undefined,
    salarioAccessorioIndicatori: undefined,
    spesaPersonaleIndicatori: undefined,
    rendicontoApprovatoTermini: undefined,

    result: undefined,
    checks: [],
  },
  riepilogo: {
    totaleErrori: 0,
    totaleWarning: 0,
    totaleInfo: 0,
    readyForPreview: false,
    readyForFutureTransfer: false,
  },
};
