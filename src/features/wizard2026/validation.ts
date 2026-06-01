import {
  Wizard2026Check,
  validateArt23Limit,
  validateDl25Increment,
  validateCcnl2026Increments,
  validateConglobamentoArt60,
  validateStraordinarioIncrement,
  validatePnrrIncrement,
} from '../../logic/wizard2026';
import { Wizard2026DraftState } from './types';

export function validateWizard2026Art23Step(state: Wizard2026DraftState): Wizard2026Check[] {
  return validateArt23Limit({
    limite2016CertificatoEnte: state.art23.limite2016CertificatoEnte,
    fondoPersonaleDipendente2016: state.art23.fondoPersonaleDipendente2016,
    fondoEqPo2016: state.art23.fondoEqPo2016,
    fondoDirigenza2016: state.art23.fondoDirigenza2016,
    risorseSegretario2016: state.art23.risorseSegretario2016,
    fondoStraordinario2016: state.art23.fondoStraordinario2016,
    altreVoci2016Soggette: state.art23.altreVoci2016Soggette,
    fondoDipendenti2018Soggetto: state.art23.fondoDipendenti2018Soggetto,
    risorsePoEq2018Soggette: state.art23.risorsePoEq2018Soggette,
    personaleServizio31122018: state.art23.personaleServizio31122018,
    personalePrevisto2026Piao: state.art23.personalePrevisto2026Piao,
    hasDirigenza: state.ente.hasDirigenza,
    personale2018Art23: state.art23.personale2018Art23,
    personale2026Art23: state.art23.personale2026Art23,
    usaCalcoloManualePersonaleArt23: state.art23.usaCalcoloManualePersonaleArt23,
    manualDipendentiEquivalenti2018: state.art23.manualDipendentiEquivalenti2018,
    manualDipendentiEquivalenti2026: state.art23.manualDipendentiEquivalenti2026,
  });
}

export function validateWizard2026Dl25Step(state: Wizard2026DraftState): Wizard2026Check[] {
  if (!state.ente.entityType) return [];
  return validateDl25Increment({
    entityType: state.ente.entityType,
    stipendiTabellari2023NonDirigenti: state.dl25.stipendiTabellari2023NonDirigenti,
    fondoStabile2025Certificato: state.dl25.fondoStabile2025Certificato,
    budgetEq2025: state.dl25.budgetEq2025,
    altreRisorse2025DaSottrarre: state.dl25.altreRisorse2025DaSottrarre,
    isPrimaFasciaDl34: state.ente.isPrimaFasciaDl34,
    isEquilibrioPluriennaleAsseverato: state.ente.isEquilibrioPluriennaleAsseverato,
    isDissesto: state.ente.isDissesto,
    isStrutturalmenteDeficitario: state.ente.isStrutturalmenteDeficitario,
    isPianoRiequilibrio: state.ente.isPianoRiequilibrio,
    quotaTrasferitaAderentiDL25_2025: state.dl25.quotaTrasferitaAderentiDL25_2025,
    attiComuniAderentiPresenti: state.dl25.attiComuniAderentiPresenti,
    riduzionePermanenteFondiComuniCertificata: state.dl25.riduzionePermanenteFondiComuniCertificata,
    certificazioneRevisoriComuni: state.dl25.certificazioneRevisoriComuni,
    hasApprovazioneCosfel: state.ente.hasApprovazioneCosfel,
    quoteAderenti: state.dl25.quoteAderenti,
    documentazioneCosfelDl25: state.dl25.documentazioneCosfelDl25,
    // Campi per verifica virtuosità
    popolazioneEnte: state.dl25.popolazioneEnte,
    entrateCorrentiN1: state.dl25.entrateCorrentiN1,
    entrateCorrentiN2: state.dl25.entrateCorrentiN2,
    entrateCorrentiN3: state.dl25.entrateCorrentiN3,
    fcdeStanziato: state.dl25.fcdeStanziato,
    spesaPersonaleUltimoRendiconto: state.dl25.spesaPersonaleUltimoRendiconto,
    // Campi per verifica sostenibilità (informativa)
    limiteStoricoSpesaPersonale: state.dl25.limiteStoricoSpesaPersonale,
    baseCalcoloLimiteStorico: state.dl25.baseCalcoloLimiteStorico,
    spesaPersonalePrevista2026AnteIncremento: state.dl25.spesaPersonalePrevista2026AnteIncremento,
  });
}


export function validateWizard2026Ccnl2026Step(state: Wizard2026DraftState): Wizard2026Check[] {
  return validateCcnl2026Increments({
    monteSalari2021: state.ccnl2026.monteSalari2021,
    applicaIncremento022: state.ccnl2026.applicaIncremento022,
    percentualeApplicata022: state.ccnl2026.percentualeApplicata022,
    isStrutturalmenteDeficitario: state.ente.isStrutturalmenteDeficitario,
    hasApprovazioneCosfel: state.ente.hasApprovazioneCosfel,
  });
}

export function validateWizard2026ConglobamentoArt60Step(state: Wizard2026DraftState): Wizard2026Check[] {
  return validateConglobamentoArt60({
    mode: state.conglobamentoArt60.mode,
    personaleInteroArea: state.conglobamentoArt60.personaleInteroArea,
    partTimeNativi: state.conglobamentoArt60.partTimeNativi,
    valoreManuale: state.conglobamentoArt60.valoreManuale,
    notaManuale: state.conglobamentoArt60.notaManuale,
    valoreConsolidato2026: state.conglobamentoArt60.valoreConsolidato2026,
    annoRiferimento: state.ente.annoRiferimento,
  });
}

export function validateWizard2026StraordinarioStep(state: Wizard2026DraftState): Wizard2026Check[] {
  return validateStraordinarioIncrement({
    hasDirigenza: state.ente.hasDirigenza,
    margineArt23: state.art23.result?.margineArt23,
    isStrutturalmenteDeficitario: state.ente.isStrutturalmenteDeficitario,
    hasApprovazioneCosfel: state.ente.hasApprovazioneCosfel,

    fondoStraordinarioOrdinario2016: state.straordinario.fondoStraordinarioOrdinario2016,
    fondoStraordinarioOrdinarioAnnoCorrente: state.straordinario.fondoStraordinarioOrdinarioAnnoCorrente,
    incrementoStraordinarioOrdinarioProposto: state.straordinario.incrementoStraordinarioOrdinarioProposto,
    fonteDatoStraordinarioOrdinario: state.straordinario.fonteDatoStraordinarioOrdinario,

    riduzioneStabileStraordinarioArt67: state.straordinario.riduzioneStabileStraordinarioArt67,

    incrementoStraordinarioOrdinario: state.straordinario.incrementoStraordinarioOrdinario,
    quotaFinanziataConCapienzaArt23: state.straordinario.quotaFinanziataConCapienzaArt23,
    quotaFinanziataConRiduzioneFondo: state.straordinario.quotaFinanziataConRiduzioneFondo,
    contrattazioneIntegrativaRiduzioneFondo: state.straordinario.contrattazioneIntegrativaRiduzioneFondo,

    risorseEscluse: state.straordinario.risorseEscluse,

    stanziamentoStraordinarioOrdinarioAnnoPrecedente: state.straordinario.stanziamentoStraordinarioOrdinarioAnnoPrecedente,
    spesaStraordinarioOrdinarioAnnoPrecedente: state.straordinario.spesaStraordinarioOrdinarioAnnoPrecedente,
    economieStraordinarioCertificate: state.straordinario.economieStraordinarioCertificate,

    // Retrocompatibilità (mantenuti per compatibilità)
    fondoStraordinario2016: state.straordinario.fondoStraordinario2016,
    fondoStraordinarioAnnoCorrente: state.straordinario.fondoStraordinarioAnnoCorrente,
    incrementoRichiesto: state.straordinario.incrementoRichiesto,
    riduzioneFondoDecentrato: state.straordinario.riduzioneFondoDecentrato,
    economieStraordinarioAnnoPrecedente: state.straordinario.economieStraordinarioAnnoPrecedente,
    straordinarioElettoraleEscluso: state.straordinario.straordinarioElettoraleEscluso,
    straordinarioCalamitaEscluso: state.straordinario.straordinarioCalamitaEscluso,
    altreRisorseStraordinarioEscluse: state.straordinario.altreRisorseStraordinarioEscluse,
  });
}

export function validateWizard2026PnrrStep(state: Wizard2026DraftState): Wizard2026Check[] {
  return validatePnrrIncrement({
    annoRiferimento: state.ente.annoRiferimento,
    soggettoAttuatorePnrr: state.pnrr.soggettoAttuatorePnrr,
    componenteStabileFondoDipendenti2016: state.pnrr.componenteStabileFondoDipendenti2016,
    componenteStabileFondoDirigenza2016: state.pnrr.componenteStabileFondoDirigenza2016,
    hasDirigenza: state.ente.hasDirigenza,
    equilibrioEsercizioPrecedente: state.pnrr.equilibrioEsercizioPrecedente,
    parametriDebitoCommercialeEsercizioPrecedente: state.pnrr.parametriDebitoCommercialeEsercizioPrecedente,
    incidenzaSalarioAccessorioScelta: state.pnrr.incidenzaSalarioAccessorioScelta,
    incidenzaSalarioAccessorioPercentuale: state.pnrr.incidenzaSalarioAccessorioPercentuale,
    salarioAccessorioIndicatori: state.pnrr.salarioAccessorioIndicatori,
    spesaPersonaleIndicatori: state.pnrr.spesaPersonaleIndicatori,
    rendicontoApprovatoTermini: state.pnrr.rendicontoApprovatoTermini,
    isDissesto: state.ente.isDissesto,
    isStrutturalmenteDeficitario: state.ente.isStrutturalmenteDeficitario,
    isPianoRiequilibrio: state.ente.isPianoRiequilibrio,
    hasApprovazioneCosfel: state.ente.hasApprovazioneCosfel,
    
    // Retrocompatibilità
    componenteStabile2016: state.pnrr.componenteStabile2016,
    incrementoApplicato: state.pnrr.incrementoApplicato,
    enteInEquilibrio: state.pnrr.enteInEquilibrio,
    requisitiVerificati: state.pnrr.requisitiVerificati,
  });
}

export function validateWizard2026All(state: Wizard2026DraftState): Wizard2026Check[] {
  return [
    ...validateWizard2026Art23Step(state),
    ...validateWizard2026Dl25Step(state),
    ...validateWizard2026Ccnl2026Step(state),
    ...validateWizard2026ConglobamentoArt60Step(state),
    ...validateWizard2026StraordinarioStep(state),
    ...validateWizard2026PnrrStep(state),
  ];
}
