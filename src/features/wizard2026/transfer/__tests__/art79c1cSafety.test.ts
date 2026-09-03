import { describe, it, expect } from 'vitest';
import { simulateWizard2026Transfer, buildWizard2026TransferPreview } from '../transferPreviewEngine';
import { applyWizard2026Transfer } from '../applyWizard2026Transfer';
import { Wizard2026DraftState } from '../../types';
import { initialWizard2026DraftState } from '../../initialState';
import { FundData, TipologiaEnte } from '../../../../domain';

function createMockFundData(stArt79Value?: number): FundData {
  return {
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoElevateQualificazioni2016: 20000,
      fondoDirigenza2016: 0,
      risorseSegretarioComunale2016: 0,
      fondoStraordinario2016: 10000,
      fondoPersonaleNonDirEQ2018_Art23: 100000,
      fondoEQ2018_Art23: 20000,
    },
    annualData: {
      annoRiferimento: 2026,
      denominazioneEnte: 'Comune Test',
      tipologiaEnte: TipologiaEnte.COMUNE,
      hasDirigenza: false,
      personale2018PerArt23: [],
      personaleAnnoRifPerArt23: [],
      fondoCertificatoParteStabile2018: 100000,
      personaleServizioAttuale: [],
      proventiSpecifici: [],
      simulatoreInput: {} as any,
    },
    fondoAccessorioDipendenteData: {
      st_art79c1c_incrementoStabileConsistenzaPers: stArt79Value,
    } as any,
    fondoElevateQualificazioniData: {} as any,
    fondoSegretarioComunaleData: {} as any,
    fondoDirigenzaData: {} as any,
    distribuzioneRisorseData: {} as any,
    personaleServizio: {
      dettagli: [],
    },
  };
}

function createMockDraftState(estimateArt79: number = 20000): Wizard2026DraftState {
  return {
    ...initialWizard2026DraftState,
    ente: {
      ...initialWizard2026DraftState.ente,
      annoRiferimento: 2026,
      hasDirigenza: false,
      entityType: 'COMUNE',
    },
    art23: {
      ...initialWizard2026DraftState.art23,
      fondoPersonaleDipendente2016: 100000,
      fondoEqPo2016: 20000,
      fondoDirigenza2016: 0,
      risorseSegretario2016: 0,
      fondoStraordinario2016: 10000,
      altreVoci2016Soggette: 0,
      fondoDipendenti2018Soggetto: 100000,
      risorsePoEq2018Soggette: 20000,
      fondoCertificatoParteStabile2018: 100000,
      usaCalcoloManualePersonaleArt23: true,
      manualDipendentiEquivalenti2018: 10,
      manualDipendentiEquivalenti2026: 12,
      result: {
        limite2016Base: 130000,
        fonteLimite2016: 'RICOSTRUITO',
        totaleVoci2016Ricostruite: 130000,
        baseAccessorio2018ProCapite: 120000,
        valoreMedioProCapite2018: 12000,
        differenzaPersonale: 2,
        incrementoProCapiteLimite: 24000,
        limiteArt23Attualizzato: 154000,
        dipendentiEquivalenti2018: 10,
        dipendentiEquivalenti2026: 12,
        incrementoStabileAumentoPersonale: estimateArt79,
        fondoCertificatoParteStabile2018: 100000,
        limiteArt23: 154000,
        limiteRicostruito2016: 130000,
        limiteCertificatoUtilizzato: false,
        risorseSoggetteAttuali: 0,
        risorseEscluseAttuali: 0,
        margineArt23: 0,
        superamentoArt23: 0,
      },
    },
    conglobamentoArt60: {
      ...initialWizard2026DraftState.conglobamentoArt60,
      mode: 'manual',
    },
  };
}

describe('Art. 79 c. 1 lett. c Safety & Isolation Tests', () => {
  it('1. current Fund value undefined + Wizard estimate = 20000 -> simulate transfer preserves undefined', () => {
    const current = createMockFundData(undefined);
    const draft = createMockDraftState(20000);

    const simulated = simulateWizard2026Transfer(draft, current);
    expect(simulated.fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers).toBeUndefined();
  });

  it('2. current Fund value = 7500 + Wizard estimate = 20000 -> actual field remains 7500', () => {
    const current = createMockFundData(7500);
    const draft = createMockDraftState(20000);

    const simulated = simulateWizard2026Transfer(draft, current);
    expect(simulated.fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers).toBe(7500);
  });

  it('3. current value = 7500 + localSources = manual -> actual field remains 7500', () => {
    const current = createMockFundData(7500);
    const draft = createMockDraftState(20000);
    const localSources = {
      'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers': 'manual',
    };

    const simulated = simulateWizard2026Transfer(draft, current, localSources);
    expect(simulated.fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers).toBe(7500);
  });

  it('4. current value = 7500 + localSources = wizard2026 -> actual field remains 7500', () => {
    const current = createMockFundData(7500);
    const draft = createMockDraftState(20000);
    const localSources = {
      'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers': 'wizard2026',
    };

    const simulated = simulateWizard2026Transfer(draft, current, localSources);
    expect(simulated.fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers).toBe(7500);
  });

  it('5. preview: legacy estimate is visible as CONTROL_ONLY item in SOLO_CONTROLLO category', () => {
    const current = createMockFundData(undefined);
    const draft = createMockDraftState(20000);

    const preview = buildWizard2026TransferPreview(draft, current);
    const item = preview.items.find(i => i.id === 'st_art79c1c_incrementoStabileConsistenzaPers');

    expect(item).toBeDefined();
    expect(item?.status).toBe('CONTROL_ONLY');
    expect(item?.categoria).toBe('SOLO_CONTROLLO');
    expect(item?.valoreProposto).toBe(20000);
    expect(item?.etichetta).toContain('NON trasferita');
    expect(item?.campoDestinazione).toBe('simulato.art79c1c.stimaLegacy');
  });

  it('6. preview: does NOT present the actual Fund field as READY or CONFLICT', () => {
    const current = createMockFundData(5000);
    const draft = createMockDraftState(20000);

    const preview = buildWizard2026TransferPreview(draft, current);
    const actualDestinationItem = preview.items.find(
      i => i.campoDestinazione === 'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers'
    );
    expect(actualDestinationItem).toBeUndefined();

    const readyItems = preview.items.filter(
      i => i.id === 'st_art79c1c_incrementoStabileConsistenzaPers' && (i.status === 'READY' || i.status === 'CONFLICT')
    );
    expect(readyItems).toHaveLength(0);
  });

  it('7. other Art. 23 transfers remain unaffected and active', () => {
    const current = createMockFundData(undefined);
    const draft = createMockDraftState(20000);

    const simulated = simulateWizard2026Transfer(draft, current);
    // manualDipendentiEquivalenti2018 / 2026 transferred
    expect(simulated.annualData.manualDipendentiEquivalenti2018).toBe(10);
    expect(simulated.annualData.manualDipendentiEquivalentiAnnoRif).toBe(12);
    expect(simulated.annualData.isArt23FteManualMode).toBe(true);
    // fondoCertificatoParteStabile2018 transferred
    expect(simulated.annualData.fondoCertificatoParteStabile2018).toBe(100000);
  });

  it('8. applyWizard2026Transfer snapshot records CONTROL_ONLY under simulato.art79c1c.stimaLegacy', () => {
    const current = createMockFundData(12345);
    const draft = createMockDraftState(20000);

    const applied = applyWizard2026Transfer(draft, current);
    // Field itself is untouched
    expect(applied.fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers).toBe(12345);

    // Snapshot transfer plan check
    const plan = applied.wizard2026TransferSnapshot?.transferPlan;
    expect(plan).toBeDefined();

    const actualDestPlanItem = plan.find(
      (p: any) => p.destinationPath === 'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers'
    );
    expect(actualDestPlanItem).toBeUndefined();

    const legacyPlanItem = plan.find(
      (p: any) => p.destinationPath === 'simulato.art79c1c.stimaLegacy'
    );
    expect(legacyPlanItem).toBeDefined();
    expect(legacyPlanItem.status).toBe('CONTROL_ONLY');
    expect(legacyPlanItem.art23Treatment).toBe('SOLO_CONTROLLO');
    expect(legacyPlanItem.proposedValue).toBe(20000);
    expect(legacyPlanItem.currentValue).toBe(12345);
  });

  it('9. nuovo Wizard / calcolo corrente (stima = 0 o assente) -> preview NON contiene item Art79 legacy, fondo invariato', () => {
    const current = createMockFundData(7500);
    const draft = createMockDraftState(0);

    const preview = buildWizard2026TransferPreview(draft, current);
    const item = preview.items.find(i => i.id === 'st_art79c1c_incrementoStabileConsistenzaPers');
    expect(item).toBeUndefined();

    const simulated = simulateWizard2026Transfer(draft, current);
    expect(simulated.fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers).toBe(7500);
  });

  it('10. vecchio draft/result con stima legacy = 20000 -> preview contiene item CONTROL_ONLY, fondo invariato', () => {
    const current = createMockFundData(7500);
    const draft = createMockDraftState(20000);

    const preview = buildWizard2026TransferPreview(draft, current);
    const item = preview.items.find(i => i.id === 'st_art79c1c_incrementoStabileConsistenzaPers');
    expect(item).toBeDefined();
    expect(item?.status).toBe('CONTROL_ONLY');
    expect(item?.categoria).toBe('SOLO_CONTROLLO');
    expect(item?.valoreProposto).toBe(20000);
    expect(item?.campoDestinazione).toBe('simulato.art79c1c.stimaLegacy');

    const simulated = simulateWizard2026Transfer(draft, current);
    expect(simulated.fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers).toBe(7500);
  });
});
