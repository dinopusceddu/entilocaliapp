import { describe, it, expect } from 'vitest';
import { initialWizard2026DraftState } from '../../initialState';
import { Wizard2026DraftState } from '../../types';
import { FundData } from '../../../../domain/types';
import {
  simulateWizard2026Transfer,
  buildWizard2026TransferPreview,
} from '../transferPreviewEngine';
import { applyWizard2026Transfer } from '../applyWizard2026Transfer';

describe('Wizard 2026 Transfer Preview Engine', () => {
  const getMockFundData = (): FundData => ({
    historicalData: {
      fondoStraordinario2016: 5000,
    },
    annualData: {
      annoRiferimento: 2026,
      denominazioneEnte: 'Ente di Prova',
      ccnl2024: {},
      fondoLavoroStraordinario: 0,
    } as any,
    fondoAccessorioDipendenteData: {
      st_art58c1_CCNL2026_incremento014_MS2021: 0,
      vn_art58_CCNL2026_arretrati2024_2025: 0,
      vn_art58c2_incremento_max022_ms2021: 0,
      st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0,
      st_art79c1_art14c3_art67c2g_riduzioneStraordinario: 0,
      vn_art15c1m_art67c3e_risparmiStraordinario: 0,
      st_incrementoDL25_2025: 0,
      vn_dl13_art8c3_incrementoPNRR_max5stabile2016: 0,
    },
    fondoElevateQualificazioniData: {
      va_incremento022_ms2021_eq: 0,
    },
    fondoDirigenzaData: {
      va_dl13_2023_art8c3_incrementoPNRR: 0,
    },
    fondoSegretarioComunaleData: {},
    distribuzioneRisorseData: {},
    personaleServizio: {
      dettagli: [],
      isManualMode: false,
      manualProgressioni: 0,
      manualIndennita: 0,
      manualDipendentiEquivalenti: 0,
    },
  });

  const getPopulatedDraftState = (): Wizard2026DraftState => {
    return {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        hasDirigenza: true,
        annoRiferimento: 2026,
      },
      ccnl2026: {
        monteSalari2021: 1000000,
        monteSalari2021Consolidato2026: 1000000,
        fondoRisorseDecentrate2024: 80000,
        risorseEQ2024: 20000,
        incremento022Anno: 2200,
        applicaIncremento022: true,
        percentualeApplicata022: 0.22,
        result: {
          isCalcolabile: true,
          isMs2021Consolidato: false,
          isSuperamentoLimite022: false,
          incrementoStabile014: 1400,
          arretrati014: 2800,
          limiteMassimo022: 2200,
          incremento022Anno: 2200,
          incremento022Fondo: 1760,
          incremento022EQ: 440,
          incremento014: 1400,
          incremento022Massimo: 2200,
          incremento022Applicato: 2200,
        },
        checks: [],
      },
      conglobamentoArt60: {
        mode: 'guided',
        personaleInteroArea: {},
        partTimeNativi: [],
        result: {
          riduzioneTotale: 1200,
        } as any,
        checks: [],
      } as any,
      straordinario: {
        result: {
          fondoStraordinarioOrdinarioResiduo: 18000,
          totaleStraordinarioEsclusoArt23: 0,
          straordinarioOrdinarioFinaleSoggettoArt23: 18000,
          incrementoParteStabileDaRiduzioneStraordinario: 2000,
          economieDaTrasferireVariabileUnaTantum: 500,
          straordinarioOrdinarioSoggettoArt23: 50000, // Lo straordinario corrente è 50.000 €
        } as any,
        checks: [],
      },
      dl25: {
        result: {
          soglia48: 15000,
          risorse2025DaSottrarre: 0,
          quotaTrasferitaAderentiDL25_2025: 0,
          limiteMassimoDL25: 15000,
          isApplicabileDirettamente: true,
          applicabilityStatus: 'DIRECTLY_APPLICABLE',
        } as any,
        checks: [],
      } as any,
      pnrr: {
        result: {
          isApplicabile: true,
          isValidable: true,
          limiteMassimoPnrrFondoDipendenti: 4000,
          limiteMassimoPnrrFondoDirigenza: 1000,
          totaleLimiteMassimoPnrr: 5000,
          incrementoMassimoPnrr: 5000,
          incrementoApplicato: 0,
          incrementoNonAmmesso: 0,
        },
        checks: [],
      },
      art23: {
        fondoStraordinario2016: 5000, // Straordinario storico 2016
        result: {
          limiteArt23Attualizzato: 120000,
          incrementoProCapiteLimite: 0,
          dipendentiEquivalenti2018: 20,
          dipendentiEquivalenti2026: 20,
          valoreMedioProCapite2018: 6000,
        } as any,
        checks: [],
      },
    };
  };

  it('1. Genera la transfer preview senza mutare FundData', () => {
    const draft = getPopulatedDraftState();
    const originalFundData = getMockFundData();
    const originalJson = JSON.stringify(originalFundData);

    const simulated = simulateWizard2026Transfer(draft, originalFundData);

    // Verifica che l'originale non sia mutato
    expect(JSON.stringify(originalFundData)).toBe(originalJson);
    expect(simulated).not.toBe(originalFundData);
  });

  it('2. Corretta classificazione e valore dei campi trasferibili direttamente', () => {
    const draft = getPopulatedDraftState();
    const originalFundData = getMockFundData();

    const simulated = simulateWizard2026Transfer(draft, originalFundData);

    // 0.14% stabile
    expect(simulated.fondoAccessorioDipendenteData?.st_art58c1_CCNL2026_incremento014_MS2021).toBe(1400);
    // Arretrati 0.14%
    expect(simulated.fondoAccessorioDipendenteData?.vn_art58_CCNL2026_arretrati2024_2025).toBe(2800);
    // 0.22% Fondo
    expect(simulated.fondoAccessorioDipendenteData?.vn_art58c2_incremento_max022_ms2021).toBe(1760);
    // 0.22% EQ
    expect(simulated.fondoElevateQualificazioniData?.va_incremento022_ms2021_eq).toBe(440);
    // Riduzione stabile straordinario
    expect(simulated.fondoAccessorioDipendenteData?.st_art79c1_art14c3_art67c2g_riduzioneStraordinario).toBe(2000);
    // Risparmi straordinario (variabile una tantum)
    expect(simulated.fondoAccessorioDipendenteData?.vn_art15c1m_art67c3e_risparmiStraordinario).toBe(500);
    // Straordinario ordinario soggetto Art. 23 (va in annualData)
    expect(simulated.annualData?.fondoLavoroStraordinario).toBe(50000);
    
    // Allineamento parametri per evitare ricalcoli legacy
    expect(simulated.annualData?.ccnl2024?.monteSalari2021).toBe(1000000);
    expect(simulated.annualData?.ccnl2024?.fondoPersonale2025).toBe(80000);
    expect(simulated.annualData?.ccnl2024?.fondoEQ2025).toBe(20000);
    expect(simulated.annualData?.ccnl2024?.optionalIncreaseVariableFrom2026Percentage).toBeCloseTo(0.22);
    expect(simulated.annualData?.ccnl2024?.ivcConglobation?.totalReduction).toBe(1200);
    expect(simulated.historicalData?.fondoStraordinario2016).toBe(5000);
  });

  it('3. D.L. 25/2025 con importo applicato vuoto resta solo limite massimo di controllo', () => {
    const draft = getPopulatedDraftState();
    const originalFundData = getMockFundData();

    const simulated = simulateWizard2026Transfer(draft, originalFundData);
    expect(simulated.fondoAccessorioDipendenteData?.st_incrementoDL25_2025).toBe(0); // Resta invariato a 0 nel clone

    const preview = buildWizard2026TransferPreview(draft, originalFundData);
    const dl25Item = preview.items.find(i => i.id === 'st_incrementoDL25_2025');

    expect(dl25Item).toBeDefined();
    expect(dl25Item?.status).toBe('REQUIRES_CONFIRMATION');
    expect(dl25Item?.valoreProposto).toBe(0);
    expect(dl25Item?.rilevanzaArt23).toBe('FUORI_LIMITE');
  });

  it('3-bis. D.L. 25/2025 trasferisce l importo applicato esplicito entro il massimo teorico', () => {
    const draft = getPopulatedDraftState();
    draft.dl25.incrementoApplicato = 10000;
    draft.dl25.result = {
      ...draft.dl25.result,
      soglia48: 144000,
      risorse2025DaSottrarre: 120000,
      limiteMassimoDL25: 24000,
      incrementoApplicato: 10000,
    } as any;
    const originalFundData = getMockFundData();

    const simulated = simulateWizard2026Transfer(draft, originalFundData);
    expect(simulated.fondoAccessorioDipendenteData?.st_incrementoDL25_2025).toBe(10000);

    const result = applyWizard2026Transfer(draft, originalFundData);
    expect(result.fondoAccessorioDipendenteData?.st_incrementoDL25_2025).toBe(10000);
    expect(result.wizard2026TransferSnapshot.computed.dl25MassimoTeorico).toBe(24000);
    expect(result.wizard2026TransferSnapshot.computed.dl25ImportoApplicato).toBe(10000);
  });

  it('4. PNRR come solo limite massimo, non trasferito automaticamente', () => {
    const draft = getPopulatedDraftState();
    const originalFundData = getMockFundData();

    const simulated = simulateWizard2026Transfer(draft, originalFundData);
    expect(simulated.fondoAccessorioDipendenteData?.vn_dl13_art8c3_incrementoPNRR_max5stabile2016).toBe(0);
    expect(simulated.fondoDirigenzaData?.va_dl13_2023_art8c3_incrementoPNRR).toBe(0);

    const preview = buildWizard2026TransferPreview(draft, originalFundData);
    const pnrrDipItem = preview.items.find(i => i.id === 'vn_dl13_art8c3_incrementoPNRR_max5stabile2016');
    const pnrrDirItem = preview.items.find(i => i.id === 'va_dl13_2023_art8c3_incrementoPNRR');

    expect(pnrrDipItem).toBeDefined();
    expect(pnrrDipItem?.status).toBe('CONTROL_ONLY');
    expect(pnrrDipItem?.valoreProposto).toBe(4000);
    expect(pnrrDipItem?.rilevanzaArt23).toBe('NON_RILEVANTE');

    expect(pnrrDirItem).toBeDefined();
    expect(pnrrDirItem?.status).toBe('CONTROL_ONLY');
    expect(pnrrDirItem?.valoreProposto).toBe(1000);
    expect(pnrrDirItem?.rilevanzaArt23).toBe('NON_RILEVANTE');
  });

  it('5. Limite Art. 23 come solo controllo', () => {
    const draft = getPopulatedDraftState();
    const originalFundData = getMockFundData();

    const preview = buildWizard2026TransferPreview(draft, originalFundData);
    const art23Item = preview.items.find(i => i.id === 'limite_art23_attualizzato');

    expect(art23Item).toBeDefined();
    expect(art23Item?.status).toBe('CONTROL_ONLY');
    expect(art23Item?.valoreProposto).toBe(120000);
    expect(art23Item?.rilevanzaArt23).toBe('SOLO_CONTROLLO');
  });

  it('6. Art. 60 come computo figurativo', () => {
    const draft = getPopulatedDraftState();
    const originalFundData = getMockFundData();

    const preview = buildWizard2026TransferPreview(draft, originalFundData);
    const art60Item = preview.items.find(i => i.id === 'st_art60c2_CCNL2026_decurtazioneIndennitaComparto');

    expect(art60Item).toBeDefined();
    expect(art60Item?.status).toBe('READY');
    expect(art60Item?.valoreProposto).toBe(1200);
    expect(art60Item?.rilevanzaArt23).toBe('COMPUTO_FIGURATIVO');
  });

  it('7. Rileva CONFLICT se il valore nel fondo è già valorizzato e diverso, e localSources non è wizard2026', () => {
    const draft = getPopulatedDraftState();
    const originalFundData = getMockFundData();
    // Simula valore modificato manualmente (ad es. 1000 invece di 0)
    originalFundData.fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021 = 1000;

    // Chiamata con localSources che indica modifica manuale
    const localSources = {
      'fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021': 'manual' as const,
    };
    const preview = buildWizard2026TransferPreview(draft, originalFundData, localSources);
    const item = preview.items.find(i => i.id === 'st_art58c1_CCNL2026_incremento014_MS2021');

    expect(item).toBeDefined();
    expect(item?.status).toBe('CONFLICT');

    // Applica e verifica che il campo non sia stato sovrascritto
    const simulated = simulateWizard2026Transfer(draft, originalFundData, localSources);
    expect(simulated.fondoAccessorioDipendenteData?.st_art58c1_CCNL2026_incremento014_MS2021).toBe(1000); // Rimane a 1000!
  });

  it('8. Sovrascrive se localSources dichiara wizard2026', () => {
    const draft = getPopulatedDraftState();
    const originalFundData = getMockFundData();
    originalFundData.fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021 = 1000;

    const localSources = {
      'fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021': 'wizard2026',
    };

    const preview = buildWizard2026TransferPreview(draft, originalFundData, localSources);
    const item = preview.items.find(i => i.id === 'st_art58c1_CCNL2026_incremento014_MS2021');

    expect(item).toBeDefined();
    expect(item?.status).toBe('READY'); // Non è più in CONFLICT

    const simulated = simulateWizard2026Transfer(draft, originalFundData, localSources);
    expect(simulated.fondoAccessorioDipendenteData?.st_art58c1_CCNL2026_incremento014_MS2021).toBe(1400); // Viene aggiornato al valore del wizard!
  });

  it('9. MOD-032-FIX4 — Verifica atomicità, payload e coerenza dati', () => {
    const draft = getPopulatedDraftState();
    const originalFundData = getMockFundData();
    
    const result = applyWizard2026Transfer(draft, originalFundData);
    
    // Verifica presenza e struttura snapshot
    expect(result.wizard2026TransferSnapshot).toBeDefined();
    expect(result.wizard2026TransferSnapshot.year).toBe(2026);
    expect(result.wizard2026TransferSnapshot.input.monteSalari2021).toBe(1000000);
    expect(result.wizard2026TransferSnapshot.computed.quota022Fondo).toBe(1760);
    expect(result.wizard2026TransferSnapshot.computed.quota022EQ).toBe(440);
    expect(result.wizard2026TransferSnapshot.transferPlan.length).toBeGreaterThan(0);
  });

  it('10. Mantiene nel riepilogo importato il massimo teorico PNRR anche se non applicato al fondo', () => {
    const draft = getPopulatedDraftState();
    const originalFundData = getMockFundData();

    const result = applyWizard2026Transfer(draft, originalFundData);

    expect(result.fondoAccessorioDipendenteData?.vn_dl13_art8c3_incrementoPNRR_max5stabile2016).toBe(0);
    expect(result.wizard2026TransferSnapshot.computed.pnrrMassimoFondoDipendenti).toBe(4000);
    expect(result.wizard2026TransferSnapshot.computed.pnrrMassimoFondoDirigenza).toBe(1000);
    expect(result.wizard2026TransferSnapshot.computed.pnrrMassimoTeorico).toBe(5000);
    expect(result.wizard2026TransferSnapshot.computed.pnrrImportoApplicato).toBe(0);
  });

  it('11. Mantiene nel riepilogo importato il limite Art. 23 attualizzato e lo distingue dallo storico 2016', () => {
    const draft = getPopulatedDraftState();
    draft.art23.limite2016CertificatoEnte = 100000;
    draft.art23.result = {
      ...draft.art23.result,
      limiteArt23Attualizzato: 262000,
    } as any;
    const originalFundData = getMockFundData();

    const result = applyWizard2026Transfer(draft, originalFundData);

    expect(result.wizard2026TransferSnapshot.input.limiteArt23Storico2016).toBe(100000);
    expect(result.wizard2026TransferSnapshot.input.limiteArt23Comma2Attualizzato).toBe(262000);
    expect(result.wizard2026TransferSnapshot.computed.limiteArt23Attualizzato).toBe(262000);
  });

  it('12. Verifica che D.L. 25 non applicato e PNRR abbiano destinationPath simulati', () => {
    const draft = getPopulatedDraftState();
    draft.dl25.incrementoApplicato = undefined; // Non applicato
    const originalFundData = getMockFundData();

    const result = applyWizard2026Transfer(draft, originalFundData);
    const plan = result.wizard2026TransferSnapshot.transferPlan;

    const dl25PlanItem = plan.find((p: any) => p.source === 'dl25.result.limiteMassimoDL25');
    const pnrrPlanItem = plan.find((p: any) => p.source === 'pnrr.result.totaleLimiteMassimoPnrr');

    expect(dl25PlanItem).toBeDefined();
    expect(dl25PlanItem.destinationPath).toBe('simulato.dl25.limiteMassimoDL25');
    expect(dl25PlanItem.status).toBe('CONTROL_ONLY');

    expect(pnrrPlanItem).toBeDefined();
    expect(pnrrPlanItem.destinationPath).toBe('simulato.pnrr.totaleLimiteMassimoPnrr');
    expect(pnrrPlanItem.status).toBe('CONTROL_ONLY');
  });
});

