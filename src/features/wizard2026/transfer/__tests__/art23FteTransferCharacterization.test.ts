import { describe, it, expect } from 'vitest';
import { initialWizard2026DraftState } from '../../initialState';
import { simulateWizard2026Transfer } from '../transferPreviewEngine';
import { calculateArt23Limit } from '../../../../logic/wizard2026/art23Limit';
import { normalizeInput } from '../../../../application/input/inputNormalizer';
import { calculateArt23c2Adjustment } from '../../../../logic/calculation/fundCalculations';
import { calculateFundCompletely } from '../../../../logic/calculation/fundEngine';
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
    expect(transferredFundData.personaleServizio?.isManualMode).toBe(false);
    expect(transferredFundData.annualData.personale2018PerArt23).toHaveLength(1);
    expect(transferredFundData.annualData.personaleAnnoRifPerArt23).toHaveLength(2);
    expect(transferredFundData.annualData.manualDipendentiEquivalenti2018).toBeUndefined();
    expect(transferredFundData.annualData.manualDipendentiEquivalentiAnnoRif).toBeUndefined();
    expect(transferredFundData.personaleServizio?.manualDipendentiEquivalenti).toBeUndefined();

    // 3. Normalizzazione
    const normalized = normalizeInput(transferredFundData);
    expect(normalized.calculatedInputs.isManualMode).toBe(false);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(1);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(2);

    // 4. Calcolo Fondo (Low-Level Adapter)
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isManualMode,
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
    expect(transferredFundData.personaleServizio?.isManualMode).toBe(false);
    expect(transferredFundData.annualData.manualDipendentiEquivalenti2018).toBeUndefined();
    expect(transferredFundData.annualData.manualDipendentiEquivalentiAnnoRif).toBeUndefined();
    expect(transferredFundData.personaleServizio?.manualDipendentiEquivalenti).toBeUndefined();
    expect(transferredFundData.annualData.personale2018PerArt23).toHaveLength(1);
    expect(transferredFundData.annualData.personaleAnnoRifPerArt23).toHaveLength(2);

    // 3. Normalizzazione: con isManualMode === false legge gli array analitici
    const normalized = normalizeInput(transferredFundData);
    expect(normalized.calculatedInputs.isManualMode).toBe(false);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(1);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(2);

    // 4. Calcolo Fondo (Low-Level Adapter): calcola con gli array analitici 1 -> 2 FTE
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isManualMode,
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

    // 2. Trasferimento: simulateWizard2026Transfer pulisce i manuali nel clone trasferito
    const transferredFundData = simulateWizard2026Transfer(wizardDraft, currentFundData);
    expect(transferredFundData.personaleServizio?.isManualMode).toBe(false);
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

    // 3. Normalizzazione
    const normalized = normalizeInput(transferredFundData);
    expect(normalized.calculatedInputs.isManualMode).toBe(false);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(1);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(2);

    // 4. Calcolo Fondo (Low-Level Adapter)
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isManualMode,
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
    expect(transferredFundData.personaleServizio?.isManualMode).toBe(true);
    expect(transferredFundData.annualData.manualDipendentiEquivalenti2018).toBe(10);
    expect(transferredFundData.annualData.manualDipendentiEquivalentiAnnoRif).toBe(12);
    expect(transferredFundData.personaleServizio?.manualDipendentiEquivalenti).toBe(12);

    // 3. Normalizzazione
    const normalized = normalizeInput(transferredFundData);
    expect(normalized.calculatedInputs.isManualMode).toBe(true);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(10);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(12);

    // 4. Calcolo Fondo (Low-Level Adapter)
    const fundRes = calculateArt23c2Adjustment(
      normalized.historicalData,
      normalized.annualData,
      normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
      !!normalized.calculatedInputs.isManualMode,
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

});
