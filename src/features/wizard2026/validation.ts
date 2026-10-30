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
import { selectWizard2026AllChecks, selectCcnlRecoveryChecks } from './selectors';
import { resolveWizardDl25Carry, resolveWizardDl25Simulation } from './dl25Contract';

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
  const carry = resolveWizardDl25Carry(state);
  // A legacy zero is not a qualified DL25 decision. Other wizard sections may proceed unchanged.
  const hasDecision = state.dl25.currentYearDelta !== undefined || (state.dl25.incrementoApplicato ?? 0) > 0 || (state.dl25.legacyStoredAmount ?? 0) > 0;
  const carryChecks: Wizard2026Check[] = hasDecision && carry.state !== 'VALID' ? carry.issues.map(id => ({
    id, severity: 'error', step: 'Step 3 — DL25', field: 'priorCumulativeApplied',
    message: 'Istruttoria DL25 incompleta o incoerente: qualificare stock precedente, fonte e decisione corrente.',
  })) : [];
  if (!state.ente.entityType) {
    if (hasDecision) carryChecks.push({ id: 'DL25_ENTITY_SCOPE_MISSING', severity: 'error', step: 'Step 3 — DL25', message: 'Specificare la tipologia dell’ente prima di applicare una decisione DL25.' });
    return carryChecks;
  }
  if (carry.state === 'VALID' && (carry.currentYearDelta ?? 0) > 0) {
    const financial = resolveWizardDl25Simulation(state);
    if (financial?.state !== 'VALID' || financial.fase5_incrementoNettoEffettivoFondo === undefined) {
      carryChecks.push({ id: 'DL25_FINANCIAL_REGIME_UNDETERMINED', severity: 'error', step: 'Step 3 — DL25',
        message: 'Completare i margini finanziari, gli oneri e la data business quando il regime incide sul risultato.' });
    } else if (carry.currentYearDelta! > financial.fase5_incrementoNettoEffettivoFondo) {
      carryChecks.push({ id: 'DL25_DELTA_EXCEEDS_FINANCIAL_ROOM', severity: 'error', step: 'Step 3 — DL25',
        message: 'Il nuovo incremento supera il margine finanziario disponibile al netto degli oneri.' });
    }
  }
  return [...carryChecks, ...validateDl25Increment({
    entityType: state.ente.entityType,
    stipendiTabellari2023NonDirigenti: state.dl25.stipendiTabellari2023NonDirigenti,
    fondoStabile2025Certificato: state.dl25.fondoStabile2025Certificato,
    budgetEq2025: state.dl25.budgetEq2025,
    incrementoApplicato: carry.currentYearDelta ?? state.dl25.currentYearDelta ?? state.dl25.incrementoApplicato,
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
  })];
}


export function ccnl2026InputFromDraft(state: Wizard2026DraftState) {
  return {
    annoRiferimento: state.ente.annoRiferimento,
    monteSalari2021: state.ccnl2026.monteSalari2021,
    monteSalari2021Consolidato2026: state.ccnl2026.monteSalari2021Consolidato2026,
    incremento022Anno: state.ccnl2026.incremento022Anno,
    fondoRisorseDecentrate2024: state.ccnl2026.fondoRisorseDecentrate2024,
    risorseEQ2024: state.ccnl2026.risorseEQ2024,
    applicaIncremento022: state.ccnl2026.applicaIncremento022,
    percentualeApplicata022: state.ccnl2026.percentualeApplicata022,
    isStrutturalmenteDeficitario: state.ente.isStrutturalmenteDeficitario,
    hasApprovazioneCosfel: state.ente.hasApprovazioneCosfel,
  };
}
export function validateWizard2026Ccnl2026Step(state: Wizard2026DraftState): Wizard2026Check[] {
  return validateCcnl2026Increments(ccnl2026InputFromDraft(state));
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
    exerciseDecision: state.pnrr.exerciseDecision,
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
    ...selectWizard2026AllChecks(state).filter(check => check.id.startsWith('MONEY_')),
    ...validateWizard2026Art23Step(state),
    ...validateWizard2026Dl25Step(state),
    ...validateWizard2026Ccnl2026Step(state),
    ...selectCcnlRecoveryChecks(state),
    ...validateWizard2026ConglobamentoArt60Step(state),
    ...validateWizard2026StraordinarioStep(state),
    ...validateWizard2026PnrrStep(state),
  ];
}

export interface Wizard2026TransferValidationResult {
  isTransferable: boolean;
  blockingErrors: Wizard2026Check[];
  warnings: Wizard2026Check[];
}

export function validateWizard2026Transferable(state: Wizard2026DraftState): Wizard2026TransferValidationResult {
  const allChecks = validateWizard2026All(state);

  const blockingErrors = allChecks.filter(c => c.severity === 'error');
  const warnings = allChecks.filter(c => c.severity === 'warning');

  return {
    isTransferable: blockingErrors.length === 0,
    blockingErrors,
    warnings,
  };
}

export class Wizard2026TransferBlockedError extends Error {
  public readonly blockingErrors: Wizard2026Check[];
  public readonly errorCodes: string[];

  constructor(blockingErrors: Wizard2026Check[]) {
    const errorCodes = blockingErrors.map(e => e.id);
    super(`Trasferimento Wizard 2026 non consentito. Presenza di errori bloccanti: ${errorCodes.join(', ')}`);
    this.name = 'Wizard2026TransferBlockedError';
    this.blockingErrors = blockingErrors;
    this.errorCodes = errorCodes;

    Object.setPrototypeOf(this, Wizard2026TransferBlockedError.prototype);
  }
}

export function assertWizard2026Transferable(state: Wizard2026DraftState): void {
  const result = validateWizard2026Transferable(state);
  if (!result.isTransferable) {
    throw new Wizard2026TransferBlockedError(result.blockingErrors);
  }
}
