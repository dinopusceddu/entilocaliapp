import { describe, it, expect } from 'vitest';
import { calculateDl25Increment } from '../../../../logic/wizard2026/dl25Increment';
import { calculateCcnl2026Increments } from '../../../../logic/wizard2026/ccnl2026Increments';
import { calculateArt23Limit } from '../../../../logic/wizard2026/art23Limit';
import { calculateConglobamentoArt60 } from '../../../../logic/wizard2026/conglobamentoArt60';
import { calculateStraordinarioIncrement } from '../../../../logic/wizard2026/straordinarioIncrement';
import { calculatePnrrIncrement } from '../../../../logic/wizard2026/pnrrIncrement';
import { simulateWizard2026Transfer, buildWizard2026TransferPreview } from '../transferPreviewEngine';
import { initialWizard2026DraftState } from '../../initialState';
import { Wizard2026DraftState } from '../../types';
import { FundData } from '../../../../domain/types';

describe('Audit Motore Normativo 2026 - Test di Caratterizzazione', () => {

  it('1. DL 25/2025 (Art. 14, comma 1-bis) - Calcolo e trasferimento limiti e importi', () => {
    // Il DL 25/2025 fissa la soglia al 48% del rapporto spesa personale / entrate.
    // L'incremento applicato può arrivare fino alla differenza o tetto massimo.
    const res = calculateDl25Increment({
      entityType: 'COMUNE',
      isPrimaFasciaDl34: true,
      stipendiTabellari2023NonDirigenti: 1000000,
      fondoStabile2025Certificato: 400000,
      budgetEq2025: 0,
      altreRisorse2025DaSottrarre: 0,
    });
    
    // Soglia 48% di 1.000.000 = 480.000. Spesa = 400.000. Margine = 80.000
    expect(res.soglia48).toBe(480000);
    expect(res.limiteMassimoDL25).toBe(80000);

    const draft: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      dl25: {
        incrementoApplicato: 10000, // Ente decide di applicare 10.000
        result: res as any,
        checks: []
      }
    };
    
    const fundData = { fondoAccessorioDipendenteData: {} } as unknown as FundData;
    const simulated = simulateWizard2026Transfer(draft, fundData);
    
    // Deve trasferire solo 10.000 (l'applicato), non il limite teorico di 80.000
    expect(simulated.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(10000);
  });

  it('2. Enti con e senza Dirigenza - Ricostruzione Art. 23', () => {
    // Con dirigenza -> include Fondo Dirigenza 2016
    const resConDirigenza = calculateArt23Limit({
      fondoPersonaleDipendente2016: 100000,
      fondoEqPo2016: 20000,
      fondoDirigenza2016: 50000,
      hasDirigenza: true,
    });
    expect(resConDirigenza.limiteRicostruito2016).toBe(170000);

    // Senza dirigenza -> ignora Fondo Dirigenza 2016
    const resSenzaDirigenza = calculateArt23Limit({
      fondoPersonaleDipendente2016: 100000,
      fondoEqPo2016: 20000,
      fondoDirigenza2016: 50000,
      hasDirigenza: false,
    });
    expect(resSenzaDirigenza.limiteRicostruito2016).toBe(120000);
  });

  it('3. CCNL 23.02.2026 - Incrementi 0,14% e 0,22%', () => {
    const res = calculateCcnl2026Increments({
      monteSalari2021: 1000000,
      annoRiferimento: 2026, // moltiplicatore = 2 per lo 0.22%
      incremento022Anno: 2200,
      fondoRisorseDecentrate2024: 80000,
      risorseEQ2024: 20000,
    });

    // 0,14% di 1.000.000 = 1400. Arretrati (2 annualità) = 2800.
    expect(res.incrementoStabile014).toBe(1400);
    expect(res.arretrati014).toBe(2800);
    
    // 0,22% di 1.000.000 = 2200. Nel 2026 max è 2200 * 2 = 4400.
    expect(res.limiteMassimo022).toBe(4400);
    expect(res.incremento022Fondo).toBe(1760); // 2200 * 80%
    expect(res.incremento022EQ).toBe(440); // 2200 * 20%
  });

  it('4. Conglobamento Indennità Comparto Art. 60 - Figurativo', () => {
    // Si aspetta una decurtazione che poi è TRASFERITA figurativamente
    const res = calculateConglobamentoArt60({
      mode: 'guided',
      personaleInteroArea: { FUNZIONARIO_EQ: 5 }, // 5 dipendenti * 127.44 = 637.2
    });
    expect(res.riduzioneTotale).toBeCloseTo(637.2);

    const draft: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      conglobamentoArt60: {
        mode: 'guided',
        personaleInteroArea: {},
        partTimeNativi: [],
        ftePerArea: {},
        result: res as any,
        checks: []
      }
    };
    const fundData = { fondoAccessorioDipendenteData: {} } as unknown as FundData;
    const preview = buildWizard2026TransferPreview(draft, fundData);
    const item = preview.items.find(i => i.id === 'st_art60c2_CCNL2026_decurtazioneIndennitaComparto');
    expect(item?.valoreProposto).toBeCloseTo(637.2);
    expect(item?.rilevanzaArt23).toBe('COMPUTO_FIGURATIVO');
  });

  it('5. Straordinario - Riduzioni e Trasferimenti', () => {
    const res = calculateStraordinarioIncrement({
      fondoStraordinarioOrdinarioAnnoCorrente: 50000,
      quotaFinanziataConRiduzioneFondo: 2000, // Trasferimento da straordinario a Fondo Stabile
      riduzioneStabileStraordinarioArt67: 2000,
      economieStraordinarioCertificate: 1000, // Da portare a Variabile
    });

    expect(res.riduzioneFondoDecentratoNecessaria).toBe(2000); // Da togliere allo straordinario
    expect(res.incrementoParteStabileDaRiduzioneStraordinario).toBe(2000); // Da aggiungere al fondo
    expect(res.economieDaTrasferireVariabileUnaTantum).toBe(1000);
  });

  it('6. PNRR (Art. 8 comma 3 DL 13/2023) - Control Only', () => {
    const res = calculatePnrrIncrement({
      soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 100000,
      hasDirigenza: true,
      componenteStabileFondoDirigenza2016: 20000,
      equilibrioEsercizioPrecedente: true,
      parametriDebitoCommercialeEsercizioPrecedente: true,
      rendicontoApprovatoTermini: true,
      incidenzaSalarioAccessorioScelta: 'diretto',
      incidenzaSalarioAccessorioPercentuale: 5, // Fino al 5%
    });

    // 5% di 100.000 = 5000 dipendenti. 5% di 20.000 = 1000 dirigenza.
    expect(res.limiteMassimoPnrrFondoDipendenti).toBe(5000);
    expect(res.limiteMassimoPnrrFondoDirigenza).toBe(1000);

    const draft: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        hasDirigenza: true,
      },
      pnrr: {
        result: res as any,
        checks: []
      }
    };
    
    const fundData = {
      fondoAccessorioDipendenteData: {},
      fondoDirigenzaData: {}
    } as unknown as FundData;
    const preview = buildWizard2026TransferPreview(draft, fundData);
    
    const dipItem = preview.items.find(i => i.id === 'vn_dl13_art8c3_incrementoPNRR_max5stabile2016');
    const dirItem = preview.items.find(i => i.id === 'va_dl13_2023_art8c3_incrementoPNRR');
    
    expect(dipItem?.status).toBe('CONTROL_ONLY');
    expect(dirItem?.status).toBe('CONTROL_ONLY');
  });

});
