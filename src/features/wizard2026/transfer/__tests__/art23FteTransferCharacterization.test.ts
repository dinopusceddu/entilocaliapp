import { describe, it, expect } from 'vitest';
import { initialWizard2026DraftState } from '../../initialState';
import { simulateWizard2026Transfer } from '../transferPreviewEngine';
import { calculateArt23Limit } from '../../../../logic/wizard2026/art23Limit';
import { normalizeInput } from '../../../../application/input/inputNormalizer';
import { calculateArt23c2Adjustment } from '../../../../logic/calculation/fundCalculations';
import { calculateFundCompletely } from '../../../../logic/calculation/fundEngine';
import { runAllComplianceChecks } from '../../../../logic/verification/complianceChecks';
import { Wizard2026DraftState } from '../../types';
import { FundData, TipologiaEnte } from '../../../../domain';

describe('art23FteTransferCharacterization — Caratterizzazione FTE Art. 23 e Valori Manuali Stale dopo Transfer', () => {

  const mockNormativeData = {
    riferimenti_normativi: {
      art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017'
    }
  } as any;

  const createCleanFundData = (): FundData => ({
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoPersonaleNonDirEQ2018_Art23: 100000,
      fondoEQ2018_Art23: 0,
      fondoElevateQualificazioni2016: 0,
      risorseSegretarioComunale2016: 0,
      fondoDirigenza2016: 0,
      fondoStraordinario2016: 0
    },
    annualData: {
      annoRiferimento: 2026,
      tipologiaEnte: TipologiaEnte.COMUNE,
      personaleServizioAttuale: [],
      proventiSpecifici: [],
      personale2018PerArt23: [],
      personaleAnnoRifPerArt23: [],
      fondoLavoroStraordinario: 0,
      incrementoFondoStraordinario: 0,
      simulatoreInput: {}
    },
    fondoAccessorioDipendenteData: {} as any,
    fondoElevateQualificazioniData: {} as any,
    fondoSegretarioComunaleData: {} as any,
    fondoDirigenzaData: {} as any,
    distribuzioneRisorseData: {} as any,
    personaleServizio: {
      dettagli: []
    }
  });

  const createBaseWizardDraft = (): Wizard2026DraftState => ({
    ...initialWizard2026DraftState,
    ente: {
      ...initialWizard2026DraftState.ente,
      annoRiferimento: 2026,
      hasDirigenza: false,
      entityType: 'COMUNE'
    },
    art23: {
      ...initialWizard2026DraftState.art23,
      fondoPersonaleDipendente2016: 100000,
      fondoDipendenti2018Soggetto: 100000,
      risorsePoEq2018Soggette: 0,
      usaCalcoloManualePersonaleArt23: false,
      personale2018Art23: [
        { id: '1', partTimePercentage: 100 } // 1.0 FTE
      ],
      personale2026Art23: [
        { id: '1', partTimePercentage: 100, cedoliniEmessi: 12 }, // 1.0 FTE
        { id: '2', partTimePercentage: 100, cedoliniEmessi: 12 }  // 1.0 FTE -> Totale: 2.0 FTE
      ]
    }
  });

  it('Test A — Controllo Analitico Pulito: Wizard e Fondo perfettamente allineati senza valori manuali residui', () => {
    // CONTROL CASE: nessun valore manuale nel draft e nessun valore manuale nel FundData destinazione
    const wizardDraft = createBaseWizardDraft();
    wizardDraft.art23.usaCalcoloManualePersonaleArt23 = false;
    wizardDraft.art23.manualDipendentiEquivalenti2018 = undefined;
    wizardDraft.art23.manualDipendentiEquivalenti2026 = undefined;

    const currentFundData = createCleanFundData();

    // 1. Calcolo Wizard
    const wizardRes = calculateArt23Limit(wizardDraft.art23);
    expect(wizardRes.dipendentiEquivalenti2018).toBe(1);
    expect(wizardRes.dipendentiEquivalenti2026).toBe(2);
    expect(wizardRes.differenzaPersonale).toBe(1);
    expect(wizardRes.incrementoProCapiteLimite).toBe(100000);
    expect(wizardRes.limiteArt23Attualizzato).toBe(200000);

    // 2. Trasferimento
    const transferredFundData = simulateWizard2026Transfer(wizardDraft, currentFundData);
    expect(transferredFundData.annualData.isArt23FteManualMode).toBe(false);
    expect(transferredFundData.personaleServizio?.isManualMode).toBeFalsy();
    expect(transferredFundData.annualData.personale2018PerArt23).toHaveLength(1);
    expect(transferredFundData.annualData.personaleAnnoRifPerArt23).toHaveLength(2);
    expect(transferredFundData.annualData.manualDipendentiEquivalenti2018).toBeUndefined();
    expect(transferredFundData.annualData.manualDipendentiEquivalentiAnnoRif).toBeUndefined();
    expect(transferredFundData.personaleServizio?.manualDipendentiEquivalenti).toBeUndefined();

    // 3. Normalizzazione
    const normalized = normalizeInput(transferredFundData);
    expect(normalized.calculatedInputs.isArt23FteManualMode).toBe(false);
    expect(normalized.calculatedInputs.isManualMode).toBe(false);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(1);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(2);

    // 4. Calcolo Fondo (Low-Level Adapter)
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isArt23FteManualMode,
      mockNormativeData.riferimenti_normativi
    );

    expect(fundRes.importo).toBe(100000);
    expect(fundRes.component).toBeDefined();

    // 5. Calcolo Fondo Completo (Canonical Fund Engine)
    const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
    expect(fullFundResult.compliance.art23c2.limite).toBe(200000);

    // Allineamento perfetto Wizard / Fondo
    expect(fundRes.importo).toBe(wizardRes.incrementoProCapiteLimite);
    expect(fullFundResult.compliance.art23c2.limite).toBe(wizardRes.limiteArt23Attualizzato);
  });

  it('Test B — BUGFIX REGRESSION: Stale manual values in draft are cleared on analytic transfer (Wizard and Fund aligned)', () => {
    // BUGFIX VERIFICATION: in modalità analitica, i valori manuali residui nel draft vengono ignorati dal transfer
    const wizardDraft = createBaseWizardDraft();
    // Modalità analitica, ma con campi manuali rimasti valorizzati nel draft
    wizardDraft.art23.usaCalcoloManualePersonaleArt23 = false;
    wizardDraft.art23.manualDipendentiEquivalenti2018 = 10;
    wizardDraft.art23.manualDipendentiEquivalenti2026 = 12;

    const currentFundData = createCleanFundData();

    // 1. Calcolo Wizard: in modalità analitica ignora i manuali 10 e 12
    const wizardRes = calculateArt23Limit(wizardDraft.art23);
    expect(wizardRes.dipendentiEquivalenti2018).toBe(1);
    expect(wizardRes.dipendentiEquivalenti2026).toBe(2);
    expect(wizardRes.differenzaPersonale).toBe(1);
    expect(wizardRes.incrementoProCapiteLimite).toBe(100000);
    expect(wizardRes.limiteArt23Attualizzato).toBe(200000);

    // 2. Trasferimento: simulateWizard2026Transfer rimuove i campi manuali perché usaCalcoloManualePersonaleArt23 === false
    const transferredFundData = simulateWizard2026Transfer(wizardDraft, currentFundData);
    expect(transferredFundData.annualData.isArt23FteManualMode).toBe(false);
    expect(transferredFundData.personaleServizio?.isManualMode).toBeFalsy();
    expect(transferredFundData.annualData.manualDipendentiEquivalenti2018).toBeUndefined();
    expect(transferredFundData.annualData.manualDipendentiEquivalentiAnnoRif).toBeUndefined();
    expect(transferredFundData.personaleServizio?.manualDipendentiEquivalenti).toBeUndefined();
    expect(transferredFundData.annualData.personale2018PerArt23).toHaveLength(1);
    expect(transferredFundData.annualData.personaleAnnoRifPerArt23).toHaveLength(2);

    // 3. Normalizzazione: con isArt23FteManualMode === false legge gli array analitici
    const normalized = normalizeInput(transferredFundData);
    expect(normalized.calculatedInputs.isArt23FteManualMode).toBe(false);
    expect(normalized.calculatedInputs.isManualMode).toBe(false);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(1);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(2);

    // 4. Calcolo Fondo (Low-Level Adapter): calcola con gli array analitici 1 -> 2 FTE
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isArt23FteManualMode,
      mockNormativeData.riferimenti_normativi
    );

    expect(fundRes.importo).toBe(100000);
    expect(fundRes.component).toBeDefined();

    // 5. Calcolo Fondo Completo (Canonical Fund Engine)
    const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
    expect(fullFundResult.compliance.art23c2.limite).toBe(200000);

    // ALLINEAMENTO PERFETTO DOPO IL BUGFIX: Wizard = 200.000 € == Fondo = 200.000 €
    expect(wizardRes.incrementoProCapiteLimite).toBe(100000);
    expect(fundRes.importo).toBe(100000);
    expect(fundRes.importo).toBe(wizardRes.incrementoProCapiteLimite);

    expect(wizardRes.limiteArt23Attualizzato).toBe(200000);
    expect(fullFundResult.compliance.art23c2.limite).toBe(200000);
    expect(fullFundResult.compliance.art23c2.limite).toBe(wizardRes.limiteArt23Attualizzato);
  });

  it('Test C — BUGFIX REGRESSION: Pre-existing stale manual values in destination FundData are cleared on analytic transfer', () => {
    // BUGFIX VERIFICATION: in modalità analitica, i valori manuali preesistenti nel Fondo di destinazione vengono rimossi dal clone
    const wizardDraft = createBaseWizardDraft();
    wizardDraft.art23.usaCalcoloManualePersonaleArt23 = false;
    wizardDraft.art23.manualDipendentiEquivalenti2018 = undefined;
    wizardDraft.art23.manualDipendentiEquivalenti2026 = undefined;

    // FundData di destinazione con valori manuali preesistenti da una precedente sessione manuale
    const currentFundData = createCleanFundData();
    currentFundData.annualData.manualDipendentiEquivalenti2018 = 10;
    currentFundData.annualData.manualDipendentiEquivalentiAnnoRif = 12;
    if (!currentFundData.personaleServizio) currentFundData.personaleServizio = { dettagli: [] };
    currentFundData.personaleServizio.manualDipendentiEquivalenti = 12;
    currentFundData.personaleServizio.isManualMode = true;

    // 1. Calcolo Wizard
    const wizardRes = calculateArt23Limit(wizardDraft.art23);
    expect(wizardRes.dipendentiEquivalenti2018).toBe(1);
    expect(wizardRes.dipendentiEquivalenti2026).toBe(2);
    expect(wizardRes.incrementoProCapiteLimite).toBe(100000);
    expect(wizardRes.limiteArt23Attualizzato).toBe(200000);

    // 2. Trasferimento: simulateWizard2026Transfer pulisce i manuali FTE nel clone trasferito senza toccare isManualMode globale
    const transferredFundData = simulateWizard2026Transfer(wizardDraft, currentFundData);
    expect(transferredFundData.annualData.isArt23FteManualMode).toBe(false);
    expect(transferredFundData.personaleServizio?.isManualMode).toBe(true);
    expect(transferredFundData.annualData.manualDipendentiEquivalenti2018).toBeUndefined();
    expect(transferredFundData.annualData.manualDipendentiEquivalentiAnnoRif).toBeUndefined();
    expect(transferredFundData.personaleServizio?.manualDipendentiEquivalenti).toBeUndefined();
    expect(transferredFundData.annualData.personale2018PerArt23).toHaveLength(1);
    expect(transferredFundData.annualData.personaleAnnoRifPerArt23).toHaveLength(2);

    // Verifica non-mutazione del currentFundData originale
    expect(currentFundData.annualData.manualDipendentiEquivalenti2018).toBe(10);
    expect(currentFundData.annualData.manualDipendentiEquivalentiAnnoRif).toBe(12);
    expect(currentFundData.personaleServizio.manualDipendentiEquivalenti).toBe(12);
    expect(currentFundData.personaleServizio.isManualMode).toBe(true);

    // 3. Normalizzazione: isArt23FteManualMode === false legge gli array analitici (1 -> 2), mentre isManualMode globale resta true
    const normalized = normalizeInput(transferredFundData);
    expect(normalized.calculatedInputs.isArt23FteManualMode).toBe(false);
    expect(normalized.calculatedInputs.isManualMode).toBe(true);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(1);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(2);

    // 4. Calcolo Fondo (Low-Level Adapter)
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isArt23FteManualMode,
      mockNormativeData.riferimenti_normativi
    );

    expect(fundRes.importo).toBe(100000);
    expect(fundRes.component).toBeDefined();

    // 5. Calcolo Fondo Completo (Canonical Fund Engine)
    const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
    expect(fullFundResult.compliance.art23c2.limite).toBe(200000);

    // ALLINEAMENTO PERFETTO DOPO IL BUGFIX: Wizard = 200.000 € == Fondo = 200.000 €
    expect(wizardRes.incrementoProCapiteLimite).toBe(100000);
    expect(fundRes.importo).toBe(100000);
    expect(fundRes.importo).toBe(wizardRes.incrementoProCapiteLimite);

    expect(wizardRes.limiteArt23Attualizzato).toBe(200000);
    expect(fullFundResult.compliance.art23c2.limite).toBe(200000);
    expect(fullFundResult.compliance.art23c2.limite).toBe(wizardRes.limiteArt23Attualizzato);
  });

  it('Test D — NON-REGRESSION: Manual mode correctly transfers manual FTE values when enabled', () => {
    // Dimostra che il bugfix analitico non intacca il corretto trasferimento della modalità manuale
    const wizardDraft = createBaseWizardDraft();
    wizardDraft.art23.usaCalcoloManualePersonaleArt23 = true;
    wizardDraft.art23.manualDipendentiEquivalenti2018 = 10;
    wizardDraft.art23.manualDipendentiEquivalenti2026 = 12;

    const currentFundData = createCleanFundData();

    // 1. Calcolo Wizard
    const wizardRes = calculateArt23Limit(wizardDraft.art23);
    expect(wizardRes.dipendentiEquivalenti2018).toBe(10);
    expect(wizardRes.dipendentiEquivalenti2026).toBe(12);
    expect(wizardRes.differenzaPersonale).toBe(2);
    expect(wizardRes.incrementoProCapiteLimite).toBe(20000);
    expect(wizardRes.limiteArt23Attualizzato).toBe(120000);

    // 2. Trasferimento
    const transferredFundData = simulateWizard2026Transfer(wizardDraft, currentFundData);
    expect(transferredFundData.annualData.isArt23FteManualMode).toBe(true);
    expect(transferredFundData.personaleServizio?.isManualMode).toBeFalsy();
    expect(transferredFundData.annualData.manualDipendentiEquivalenti2018).toBe(10);
    expect(transferredFundData.annualData.manualDipendentiEquivalentiAnnoRif).toBe(12);
    expect(transferredFundData.personaleServizio?.manualDipendentiEquivalenti).toBe(12);

    // 3. Normalizzazione
    const normalized = normalizeInput(transferredFundData);
    expect(normalized.calculatedInputs.isArt23FteManualMode).toBe(true);
    expect(normalized.calculatedInputs.isManualMode).toBe(false);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(10);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(12);

    // 4. Calcolo Fondo (Low-Level Adapter)
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isArt23FteManualMode,
      mockNormativeData.riferimenti_normativi
    );

    expect(fundRes.importo).toBe(20000);
    expect(fundRes.component).toBeDefined();

    // 5. Calcolo Fondo Completo (Canonical Fund Engine)
    const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
    expect(fullFundResult.compliance.art23c2.limite).toBe(120000);

    // Allineamento perfetto in modalità manuale: Wizard = 120.000 € == Fondo = 120.000 €
    expect(fundRes.importo).toBe(wizardRes.incrementoProCapiteLimite);
    expect(fullFundResult.compliance.art23c2.limite).toBe(wizardRes.limiteArt23Attualizzato);
  });

  it('Test E — LEGACY / INCOMPLETE ANALYTIC PAYLOAD: Do not delete destination FTE overrides when lists are empty or partial', () => {
    // Scenario 1: Array entrambi vuoti con fallback legacy valorizzati
    const wizardDraft = createBaseWizardDraft();
    wizardDraft.art23.usaCalcoloManualePersonaleArt23 = false;
    wizardDraft.art23.personale2018Art23 = [];
    wizardDraft.art23.personale2026Art23 = [];
    wizardDraft.art23.personaleServizio31122018 = 1;
    wizardDraft.art23.personalePrevisto2026Piao = 2;
    wizardDraft.art23.manualDipendentiEquivalenti2018 = undefined;
    wizardDraft.art23.manualDipendentiEquivalenti2026 = undefined;

    const currentFundData = createCleanFundData();
    currentFundData.annualData.manualDipendentiEquivalenti2018 = 10;
    currentFundData.annualData.manualDipendentiEquivalentiAnnoRif = 12;
    if (!currentFundData.personaleServizio) currentFundData.personaleServizio = { dettagli: [] };
    currentFundData.personaleServizio.manualDipendentiEquivalenti = 12;
    currentFundData.personaleServizio.isManualMode = true;

    // 1. Wizard usa i fallback legacy
    const wizardRes = calculateArt23Limit(wizardDraft.art23);
    expect(wizardRes.dipendentiEquivalenti2018).toBe(1);
    expect(wizardRes.dipendentiEquivalenti2026).toBe(2);

    // 2. Transfer: con elenchi analitici vuoti, NON cancella gli override manuali di destinazione (comportamento legacy)
    const transferredFundData = simulateWizard2026Transfer(wizardDraft, currentFundData);
    expect(transferredFundData.personaleServizio?.isManualMode).toBe(true);
    expect(transferredFundData.annualData.isArt23FteManualMode).toBeUndefined();
    expect(transferredFundData.annualData.manualDipendentiEquivalenti2018).toBe(10);
    expect(transferredFundData.annualData.manualDipendentiEquivalentiAnnoRif).toBe(12);
    expect(transferredFundData.personaleServizio?.manualDipendentiEquivalenti).toBe(12);

    // Scenario 2: Array parziali (2018 popolato, 2026 vuoto) -> ancora nessun delete
    const wizardDraftPartial = createBaseWizardDraft();
    wizardDraftPartial.art23.usaCalcoloManualePersonaleArt23 = false;
    wizardDraftPartial.art23.personale2018Art23 = [{ id: '1', partTimePercentage: 100 }];
    wizardDraftPartial.art23.personale2026Art23 = [];

    const transferredPartial = simulateWizard2026Transfer(wizardDraftPartial, currentFundData);
    expect(transferredPartial.annualData.manualDipendentiEquivalenti2018).toBe(10);
    expect(transferredPartial.annualData.manualDipendentiEquivalentiAnnoRif).toBe(12);
    expect(transferredPartial.personaleServizio?.manualDipendentiEquivalenti).toBe(12);
  });

  it('Test F — LEGACY FALLBACK WITH CLEAN DESTINATION: Wizard legacy fallback FTEs are not transferred to clean FundData (POSSIBLE BUG)', () => {
    // 1. Setup Wizard con modalità analitica (false), elenchi vuoti e fallback legacy valorizzati (1 -> 2 FTE)
    const wizardDraft = createBaseWizardDraft();
    wizardDraft.art23.usaCalcoloManualePersonaleArt23 = false;
    wizardDraft.art23.personale2018Art23 = [];
    wizardDraft.art23.personale2026Art23 = [];
    wizardDraft.art23.personaleServizio31122018 = 1;
    wizardDraft.art23.personalePrevisto2026Piao = 2;
    wizardDraft.art23.manualDipendentiEquivalenti2018 = undefined;
    wizardDraft.art23.manualDipendentiEquivalenti2026 = undefined;

    // Destinazione pulita (nessun override manuale)
    const currentFundData = createCleanFundData();

    // 1. Calcolo Wizard (utilizza i fallback legacy 1 e 2)
    const wizardRes = calculateArt23Limit(wizardDraft.art23);
    expect(wizardRes.dipendentiEquivalenti2018).toBe(1);
    expect(wizardRes.dipendentiEquivalenti2026).toBe(2);
    expect(wizardRes.differenzaPersonale).toBe(1);
    expect(wizardRes.incrementoProCapiteLimite).toBe(100000);
    expect(wizardRes.limiteArt23Attualizzato).toBe(200000);

    // 2. Trasferimento: elenchi vuoti trasferiti ad annualData, nessun manual override impostato
    const transferred = simulateWizard2026Transfer(wizardDraft, currentFundData);
    expect(transferred.personaleServizio?.isManualMode).toBeFalsy();
    expect(transferred.annualData.isArt23FteManualMode).toBeUndefined();
    expect(transferred.annualData.personale2018PerArt23).toEqual([]);
    expect(transferred.annualData.personaleAnnoRifPerArt23).toEqual([]);
    expect(transferred.annualData.manualDipendentiEquivalenti2018).toBeUndefined();
    expect(transferred.annualData.manualDipendentiEquivalentiAnnoRif).toBeUndefined();
    expect(transferred.personaleServizio?.manualDipendentiEquivalenti).toBeUndefined();

    // 3. Normalizzazione
    const normalized = normalizeInput(transferred);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(0);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(0);
    expect(normalized.calculatedInputs.isManualMode).toBe(false);
    expect(normalized.calculatedInputs.isArt23FteManualMode).toBe(false);

    // 4. Calcolo Fondo Low-Level Adapter
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isArt23FteManualMode,
      mockNormativeData.riferimenti_normativi
    );
    expect(fundRes.importo).toBe(0);
    expect(fundRes.component).toBeUndefined();

    // 5. Calcolo Fondo Completo
    const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
    expect(fullFundResult.compliance.art23c2.limite).toBe(100000);

    // DIVERGENZA CARATTERIZZATA: Wizard = 200.000 € vs Fondo = 100.000 €
    // CLASSIFICAZIONE: POSSIBLE BUG — WIZARD LEGACY FTE FALLBACK IS NOT PROPAGATED TO CLEAN FUND DESTINATION
  });

  it('Test G — LEGACY FALLBACK WITH STALE DESTINATION: Wizard legacy fallback and preserved destination manual FTE produce different fund limit (POSSIBLE BUG)', () => {
    // 1. Setup Wizard: fallback legacy 1 -> 2
    const wizardDraft = createBaseWizardDraft();
    wizardDraft.art23.usaCalcoloManualePersonaleArt23 = false;
    wizardDraft.art23.personale2018Art23 = [];
    wizardDraft.art23.personale2026Art23 = [];
    wizardDraft.art23.personaleServizio31122018 = 1;
    wizardDraft.art23.personalePrevisto2026Piao = 2;
    wizardDraft.art23.manualDipendentiEquivalenti2018 = undefined;
    wizardDraft.art23.manualDipendentiEquivalenti2026 = undefined;

    // Destinazione con override manuali preesistenti 10 -> 12
    const currentFundData = createCleanFundData();
    currentFundData.annualData.manualDipendentiEquivalenti2018 = 10;
    currentFundData.annualData.manualDipendentiEquivalentiAnnoRif = 12;
    if (!currentFundData.personaleServizio) currentFundData.personaleServizio = { dettagli: [] };
    currentFundData.personaleServizio.manualDipendentiEquivalenti = 12;
    currentFundData.personaleServizio.isManualMode = true;

    // 1. Calcolo Wizard (usa 1 -> 2, adeguamento = 100.000 €, limite = 200.000 €)
    const wizardRes = calculateArt23Limit(wizardDraft.art23);
    expect(wizardRes.dipendentiEquivalenti2018).toBe(1);
    expect(wizardRes.dipendentiEquivalenti2026).toBe(2);
    expect(wizardRes.incrementoProCapiteLimite).toBe(100000);
    expect(wizardRes.limiteArt23Attualizzato).toBe(200000);

    // 2. Trasferimento: elenchi vuoti, isManualMode preservato true, override manuali PRESERVATI da PR #28
    const destinationBeforeTransfer = structuredClone(currentFundData);
    const transferred = simulateWizard2026Transfer(wizardDraft, currentFundData);
    expect(currentFundData).toEqual(destinationBeforeTransfer);
    expect(transferred.personaleServizio?.isManualMode).toBe(true);
    expect(transferred.annualData.isArt23FteManualMode).toBeUndefined();
    expect(transferred.annualData.manualDipendentiEquivalenti2018).toBe(10);
    expect(transferred.annualData.manualDipendentiEquivalentiAnnoRif).toBe(12);
    expect(transferred.personaleServizio?.manualDipendentiEquivalenti).toBe(12);

    // 3. Normalizzazione: con isArt23FteManualMode undefined, fallback a global isManualMode = true -> 10 e 12
    const normalized = normalizeInput(transferred);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(10);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(12);
    expect(normalized.calculatedInputs.isManualMode).toBe(true);
    expect(normalized.calculatedInputs.isArt23FteManualMode).toBe(true);

    // 4. Calcolo Fondo Low-Level Adapter (calculateArt23c2Adjustment legge annualData.manualDipendentiEquivalenti...)
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isArt23FteManualMode,
      mockNormativeData.riferimenti_normativi
    );
    // Nel Fondo: 2018 = 10, AnnoRif = 12 -> Delta = +2 -> base pro capite = 100.000 / 10 = 10.000 * 2 = 20.000 €
    expect(fundRes.importo).toBe(20000);
    expect(fundRes.component).toBeDefined();

    // 5. Calcolo Fondo Completo
    const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
    expect(fullFundResult.compliance.art23c2.limite).toBe(120000);

    // DIVERGENZA CARATTERIZZATA: Wizard = 200.000 € vs Fondo = 120.000 €
    // CLASSIFICAZIONE: POSSIBLE BUG — LEGACY WIZARD FALLBACK AND PRESERVED DESTINATION MANUAL FTE PRODUCE DIFFERENT FUND LIMIT
  });

  it('Test H — PARTIAL ANALYTIC PAYLOAD: Partial analytic payload loses current-year legacy fallback on transfer (POSSIBLE BUG)', () => {
    // 1. Setup Wizard: 2018 analitico (1 record = 1 FTE), 2026 vuoto con fallback legacy (2 FTE)
    const wizardDraft = createBaseWizardDraft();
    wizardDraft.art23.usaCalcoloManualePersonaleArt23 = false;
    wizardDraft.art23.personale2018Art23 = [
      { id: '1', partTimePercentage: 100 } // 1.0 FTE
    ];
    wizardDraft.art23.personale2026Art23 = [];
    wizardDraft.art23.personaleServizio31122018 = undefined;
    wizardDraft.art23.personalePrevisto2026Piao = 2; // fallback legacy 2.0 FTE
    wizardDraft.art23.manualDipendentiEquivalenti2018 = undefined;
    wizardDraft.art23.manualDipendentiEquivalenti2026 = undefined;

    const currentFundData = createCleanFundData();

    // 1. Calcolo Wizard: 2018 da array (1 FTE), 2026 da fallback PIAO (2 FTE) -> incremento 100.000 €, limite 200.000 €
    const wizardRes = calculateArt23Limit(wizardDraft.art23);
    expect(wizardRes.dipendentiEquivalenti2018).toBe(1);
    expect(wizardRes.dipendentiEquivalenti2026).toBe(2);
    expect(wizardRes.differenzaPersonale).toBe(1);
    expect(wizardRes.incrementoProCapiteLimite).toBe(100000);
    expect(wizardRes.limiteArt23Attualizzato).toBe(200000);

    // 2. Trasferimento
    const transferred = simulateWizard2026Transfer(wizardDraft, currentFundData);
    expect(transferred.annualData.personale2018PerArt23).toHaveLength(1);
    expect(transferred.annualData.personaleAnnoRifPerArt23).toEqual([]);
    expect(transferred.personaleServizio?.isManualMode).toBeFalsy();
    expect(transferred.annualData.isArt23FteManualMode).toBeUndefined();

    // 3. Normalizzazione
    const normalized = normalizeInput(transferred);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(1);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(0);
    expect(normalized.calculatedInputs.isArt23FteManualMode).toBe(false);
    expect(normalized.calculatedInputs.isManualMode).toBe(false);

    // 4. Calcolo Fondo Low-Level Adapter
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isArt23FteManualMode,
      mockNormativeData.riferimenti_normativi
    );
    // Fondo: 2018 = 1, AnnoRif = 0 -> Delta = -1 -> adeguamento = 0
    expect(fundRes.importo).toBe(0);
    expect(fundRes.component).toBeUndefined();

    // 5. Calcolo Fondo Completo
    const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
    expect(fullFundResult.compliance.art23c2.limite).toBe(100000);

    // DIVERGENZA CARATTERIZZATA: Wizard = 200.000 € vs Fondo = 100.000 €
    // CLASSIFICAZIONE: POSSIBLE BUG — PARTIAL ANALYTIC PAYLOAD LOSES CURRENT-YEAR LEGACY FALLBACK ON TRANSFER
  });

  it('Test I — MANUAL MODE NORMALIZER INCONSISTENCY: manual resolved FTEs and variazioneDipendenti use different sources (POSSIBLE BUG)', () => {
    // 1. Setup FundData in modalita manuale con FTE 10 -> 12 e array analitici vuoti
    const fundData: FundData = {
      historicalData: {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
        fondoPersonaleNonDirEQ2018_Art23: 100000,
        fondoEQ2018_Art23: 0,
        fondoElevateQualificazioni2016: 0,
        risorseSegretarioComunale2016: 0,
        fondoDirigenza2016: 0,
        fondoStraordinario2016: 0
      },
      annualData: {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.COMUNE,
        personaleServizioAttuale: [],
        proventiSpecifici: [],
        personale2018PerArt23: [],
        personaleAnnoRifPerArt23: [],
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalentiAnnoRif: 12,
        isArt23FteManualMode: true,
        fondoLavoroStraordinario: 0,
        incrementoFondoStraordinario: 0,
        simulatoreInput: {}
      },
      fondoAccessorioDipendenteData: {} as any,
      fondoElevateQualificazioniData: {} as any,
      fondoSegretarioComunaleData: {} as any,
      fondoDirigenzaData: {} as any,
      distribuzioneRisorseData: {} as any,
      personaleServizio: {
        dettagli: [],
        isManualMode: true,
        manualDipendentiEquivalenti: 12
      }
    };

    // 2. Normalizzazione
    const normalized = normalizeInput(fundData);

    // Caratterizzazione: gli FTE risolti leggono i campi manuali
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(10);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(12);
    expect(normalized.calculatedInputs.isArt23FteManualMode).toBe(true);
    expect(normalized.calculatedInputs.isManualMode).toBe(true);

    // variazioneDipendenti calcolata dagli stessi FTE risolti (12 - 10 = 2)
    // CLASSIFICAZIONE: FIXED — variazioneDipendenti USES THE SAME RESOLVED FTE SOURCES
    expect(normalized.calculatedInputs.variazioneDipendenti).toBe(2);

    // 3. Calcolo Fondo Adapter Low-Level
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isArt23FteManualMode,
      mockNormativeData.riferimenti_normativi
    );
    // Base 100.000 / 10 = 10.000 * 2 = 20.000 €
    expect(fundRes.importo).toBe(20000);
    expect(fundRes.component).toBeDefined();

    // 4. Calcolo Fondo Completo
    const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
    expect(fullFundResult.compliance.art23c2.limite).toBe(120000);

    // 5. Compliance: con variazioneDipendenti = 2, l'incremento calcolato è 20.000 € e scatta il warning di consistenza
    const complianceChecks = runAllComplianceChecks(fullFundResult, normalized, mockNormativeData);
    const consistenzaCheck = complianceChecks.find(c => c.id === 'verifica_incremento_consistenza');
    expect(consistenzaCheck).toBeDefined();
    expect(consistenzaCheck?.isCompliant).toBe(false);
    expect(consistenzaCheck?.gravita).toBe('warning');
  });

  it('Test J — DECOUPLED ART. 23 FTE MANUAL MODE: Art. 23 manual FTE mode does not activate global personnel manual overrides (FIXED)', () => {
    // 1. Scenario Principale: Destinazione con isManualMode = false, manualProgressioni 111, manualIndennita 222
    const currentFundData = createCleanFundData();
    currentFundData.personaleServizio.isManualMode = false;
    currentFundData.personaleServizio.manualProgressioni = 111;
    currentFundData.personaleServizio.manualIndennita = 222;

    // Setup Wizard in modalita manuale Art. 23 (10 -> 12 FTE)
    const wizardDraft = createBaseWizardDraft();
    wizardDraft.art23.usaCalcoloManualePersonaleArt23 = true;
    wizardDraft.art23.manualDipendentiEquivalenti2018 = 10;
    wizardDraft.art23.manualDipendentiEquivalenti2026 = 12;

    // 2. Trasferimento
    const transferred = simulateWizard2026Transfer(wizardDraft, currentFundData);

    // Il trasferimento imposta solo il flag dedicato isArt23FteManualMode = true, lasciando isManualMode invariato (false)
    expect(transferred.annualData.isArt23FteManualMode).toBe(true);
    expect(transferred.personaleServizio?.isManualMode).toBe(false);
    expect(transferred.personaleServizio?.manualProgressioni).toBe(111);
    expect(transferred.personaleServizio?.manualIndennita).toBe(222);
    expect(transferred.annualData.manualDipendentiEquivalenti2018).toBe(10);
    expect(transferred.annualData.manualDipendentiEquivalentiAnnoRif).toBe(12);

    // 3. Normalizzazione
    const normalized = normalizeInput(transferred);
    expect(normalized.calculatedInputs.isArt23FteManualMode).toBe(true);
    expect(normalized.calculatedInputs.isManualMode).toBe(false);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(10);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(12);
    expect(normalized.calculatedInputs.variazioneDipendenti).toBe(2);
    expect(normalized.calculatedInputs.manualProgressioni).toBe(111);
    expect(normalized.calculatedInputs.manualIndennita).toBe(222);

    // 4. Calcolo Fondo Completo: con isManualMode = false, le progressioni e indennita assorbite analitiche sono 0 (non 333!)
    const manualModeResult = calculateFundCompletely(normalized, mockNormativeData);
    expect(manualModeResult.compliance.art23c2.limite).toBe(120000);
    expect(manualModeResult.compliance.art23Compliance?.art23Componenti?.comparto).toBe(0);

    // CLASSIFICAZIONE: FIXED — ART23 FTE MANUAL MODE NO LONGER ACTIVATES GLOBAL PERSONNEL MANUAL OVERRIDES

    // 5. Control Case (Section 15): Global manual già attivo nella destinazione
    const manualDestFundData = createCleanFundData();
    manualDestFundData.personaleServizio.isManualMode = true;
    manualDestFundData.personaleServizio.manualProgressioni = 111;
    manualDestFundData.personaleServizio.manualIndennita = 222;

    const transferredToManualDest = simulateWizard2026Transfer(wizardDraft, manualDestFundData);
    expect(transferredToManualDest.annualData.isArt23FteManualMode).toBe(true);
    expect(transferredToManualDest.personaleServizio?.isManualMode).toBe(true);

    const normalizedManualDest = normalizeInput(transferredToManualDest);
    expect(normalizedManualDest.calculatedInputs.isArt23FteManualMode).toBe(true);
    expect(normalizedManualDest.calculatedInputs.isManualMode).toBe(true);
    expect(normalizedManualDest.calculatedInputs.variazioneDipendenti).toBe(2);

    const manualDestResult = calculateFundCompletely(normalizedManualDest, mockNormativeData);
    expect(manualDestResult.compliance.art23c2.limite).toBe(120000);
    expect(manualDestResult.compliance.art23Compliance?.art23Componenti?.comparto).toBe(333);

    // 6. Analytic Complete + Global Manual Case (Section 16)
    const analyticDraft = createBaseWizardDraft();
    analyticDraft.art23.usaCalcoloManualePersonaleArt23 = false;
    // Array completi 1 -> 2
    analyticDraft.art23.personale2018Art23 = [{ id: '1', partTimePercentage: 100 }];
    analyticDraft.art23.personale2026Art23 = [
      { id: '1', partTimePercentage: 100, cedoliniEmessi: 12 },
      { id: '2', partTimePercentage: 100, cedoliniEmessi: 12 }
    ];

    const staleDestFundData = createCleanFundData();
    staleDestFundData.personaleServizio.isManualMode = true;
    staleDestFundData.personaleServizio.manualProgressioni = 111;
    staleDestFundData.personaleServizio.manualIndennita = 222;
    staleDestFundData.annualData.manualDipendentiEquivalenti2018 = 10;
    staleDestFundData.annualData.manualDipendentiEquivalentiAnnoRif = 12;

    const transferredAnalytic = simulateWizard2026Transfer(analyticDraft, staleDestFundData);
    expect(transferredAnalytic.annualData.isArt23FteManualMode).toBe(false);
    expect(transferredAnalytic.personaleServizio?.isManualMode).toBe(true);
    expect(transferredAnalytic.annualData.manualDipendentiEquivalenti2018).toBeUndefined();
    expect(transferredAnalytic.annualData.manualDipendentiEquivalentiAnnoRif).toBeUndefined();
    expect(transferredAnalytic.personaleServizio?.manualProgressioni).toBe(111);
    expect(transferredAnalytic.personaleServizio?.manualIndennita).toBe(222);

    const normalizedAnalytic = normalizeInput(transferredAnalytic);
    expect(normalizedAnalytic.calculatedInputs.isArt23FteManualMode).toBe(false);
    expect(normalizedAnalytic.calculatedInputs.isManualMode).toBe(true);
    expect(normalizedAnalytic.calculatedInputs.dipendentiEquivalenti2018).toBe(1);
    expect(normalizedAnalytic.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(2);
    expect(normalizedAnalytic.calculatedInputs.variazioneDipendenti).toBe(1);

    const analyticResult = calculateFundCompletely(normalizedAnalytic, mockNormativeData);
    expect(analyticResult.compliance.art23c2.limite).toBe(200000);
    expect(analyticResult.compliance.art23Compliance?.art23Componenti?.comparto).toBe(333);

    // 7. Backward Compatibility Case (Section 17): FundData legacy senza isArt23FteManualMode
    const legacyFundData = createCleanFundData();
    legacyFundData.annualData.isArt23FteManualMode = undefined;
    legacyFundData.personaleServizio.isManualMode = true;
    legacyFundData.annualData.manualDipendentiEquivalenti2018 = 10;
    legacyFundData.personaleServizio.manualDipendentiEquivalenti = 12;

    const normalizedLegacy = normalizeInput(legacyFundData);
    expect(normalizedLegacy.calculatedInputs.isArt23FteManualMode).toBe(true);
    expect(normalizedLegacy.calculatedInputs.isManualMode).toBe(true);
    expect(normalizedLegacy.calculatedInputs.dipendentiEquivalenti2018).toBe(10);
    expect(normalizedLegacy.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(12);
    expect(normalizedLegacy.calculatedInputs.variazioneDipendenti).toBe(2);

    const legacyResult = calculateFundCompletely(normalizedLegacy, mockNormativeData);
    expect(legacyResult.compliance.art23c2.limite).toBe(120000);
  });

  it('Test K — EXPLICIT ANALYTIC MODE IGNORES STALE ANNUAL MANUAL FTE IN CANONICAL ENGINE', () => {
    // 1. Costruzione diretta di FundData con isArt23FteManualMode = false ma campi manuali stale valorizzati
    const fundData: FundData = {
      historicalData: {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
        fondoPersonaleNonDirEQ2018_Art23: 100000,
        fondoEQ2018_Art23: 0,
        fondoElevateQualificazioni2016: 0,
        risorseSegretarioComunale2016: 0,
        fondoDirigenza2016: 0,
        fondoStraordinario2016: 0
      },
      annualData: {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.COMUNE,
        isArt23FteManualMode: false,
        personaleServizioAttuale: [],
        proventiSpecifici: [],
        personale2018PerArt23: [
          { id: '1', partTimePercentage: 100 } // 1.0 FTE
        ],
        personaleAnnoRifPerArt23: [
          { id: '1', partTimePercentage: 100, cedoliniEmessi: 12 }, // 1.0 FTE
          { id: '2', partTimePercentage: 100, cedoliniEmessi: 12 }  // 1.0 FTE -> Totale: 2.0 FTE
        ],
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalentiAnnoRif: 12,
        fondoLavoroStraordinario: 0,
        incrementoFondoStraordinario: 0,
        simulatoreInput: {}
      },
      fondoAccessorioDipendenteData: {} as any,
      fondoElevateQualificazioniData: {} as any,
      fondoSegretarioComunaleData: {} as any,
      fondoDirigenzaData: {} as any,
      distribuzioneRisorseData: {} as any,
      personaleServizio: {
        dettagli: [],
        isManualMode: false,
        manualDipendentiEquivalenti: 12
      }
    };

    // 2. Normalizzazione
    const normalized = normalizeInput(fundData);
    expect(normalized.calculatedInputs.isArt23FteManualMode).toBe(false);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(1);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(2);
    expect(normalized.calculatedInputs.variazioneDipendenti).toBe(1);

    // 3. Calcolo Motore Canonico Fondo: con isArt23FteManualMode === false ignora i manuali 10 -> 12
    const result = calculateFundCompletely(normalized, mockNormativeData);
    expect(result.compliance.art23c2.limite).toBe(200000);

    // CLASSIFICAZIONE: FIXED — EXPLICIT ANALYTIC ART23 MODE IGNORES STALE ANNUAL MANUAL FTE
  });

});
