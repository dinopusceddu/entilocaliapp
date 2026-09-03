import { describe, it, expect } from 'vitest';
import { normalizeInput } from '../inputNormalizer';
import type { FundData } from '../../../domain';

describe('inputNormalizer — Calcolo Dipendenti Equivalenti Art. 23 (FTE Canonico)', () => {
  function createFundData(annualDataOverrides: Record<string, any> = {}, extraOverrides: Record<string, any> = {}): FundData {
    return {
      annualData: {
        denominazioneEnte: 'Comune di Test',
        tipologiaEnte: 'Comune' as any,
        annoRiferimento: 2026,
        ...annualDataOverrides,
      },
      historicalData: {},
      fondoAccessorioDipendenteData: {},
      fondoElevateQualificazioniData: {},
      fondoSegretarioComunaleData: {},
      fondoDirigenzaData: {},
      distribuzioneRisorseData: {},
      personaleServizio: { dettagli: [] },
      ...extraOverrides,
    } as unknown as FundData;
  }

  it('1. 2018 PT undefined -> default retrocompatibile 1 FTE', () => {
    const data = createFundData({
      personale2018PerArt23: [{ id: 'e1' }]
    });
    const normalized = normalizeInput(data);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(1);
  });

  it('2. 2018 PT 50 -> 0.5 FTE', () => {
    const data = createFundData({
      personale2018PerArt23: [{ id: 'e1', partTimePercentage: 50 }]
    });
    const normalized = normalizeInput(data);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(0.5);
  });

  it('3. 2018 PT 0 -> 0 FTE (fail-safe canonico, non più 100%)', () => {
    const data = createFundData({
      personale2018PerArt23: [{ id: 'e1', partTimePercentage: 0 }]
    });
    const normalized = normalizeInput(data);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(0);
  });

  it('4. corrente PT100 / ced undefined -> default 1 FTE', () => {
    const data = createFundData({
      personaleAnnoRifPerArt23: [{ id: 'e1', partTimePercentage: 100 }]
    });
    const normalized = normalizeInput(data);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(1);
  });

  it('5. corrente PT50 / ced6 -> 0.25 FTE', () => {
    const data = createFundData({
      personaleAnnoRifPerArt23: [{ id: 'e1', partTimePercentage: 50, cedoliniEmessi: 6 }]
    });
    const normalized = normalizeInput(data);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(0.25);
  });

  it('6. corrente PT100 / ced0 -> 0 FTE (fail-safe canonico, non più anno intero)', () => {
    const data = createFundData({
      personaleAnnoRifPerArt23: [{ id: 'e1', partTimePercentage: 100, cedoliniEmessi: 0 }]
    });
    const normalized = normalizeInput(data);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(0);
  });

  it('7. manual mode + manual current 0 -> zero preservato via nullish coalescing', () => {
    const data = createFundData({
      isArt23FteManualMode: true,
      manualDipendentiEquivalentiAnnoRif: 0,
      personaleAnnoRifPerArt23: [{ id: 'e1', partTimePercentage: 100, cedoliniEmessi: 12 }]
    });
    const normalized = normalizeInput(data);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(0);
  });

  it('8. manual mode + manual values -> analitico non prevale', () => {
    const data = createFundData({
      isArt23FteManualMode: true,
      manualDipendentiEquivalenti2018: 5,
      manualDipendentiEquivalentiAnnoRif: 7,
      personale2018PerArt23: [{ id: 'e1', partTimePercentage: 100 }],
      personaleAnnoRifPerArt23: [{ id: 'e2', partTimePercentage: 100, cedoliniEmessi: 12 }]
    });
    const normalized = normalizeInput(data);
    expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(5);
    expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(7);
    expect(normalized.calculatedInputs.variazioneDipendenti).toBe(2);
  });
});
