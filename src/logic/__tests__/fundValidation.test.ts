import { describe, it, expect } from 'vitest';
import { validateFundData } from '../validation';
import { TipologiaEnte } from '../../domain/enums';
import type { FundData } from '../../domain/types';

function createValidBaseFundData(): FundData {
  return {
    annualData: {
      denominazioneEnte: 'Comune di Test',
      tipologiaEnte: TipologiaEnte.COMUNE,
      hasDirigenza: false,
      annoRiferimento: 2026,
      personaleServizioAttuale: [],
      proventiSpecifici: [],
      personale2018PerArt23: [],
      personaleAnnoRifPerArt23: [],
      simulatoreInput: {},
    },
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoPersonaleNonDirEQ2018_Art23: 105000,
    },
    fondoAccessorioDipendenteData: {},
    fondoElevateQualificazioniData: {},
    fondoSegretarioComunaleData: {},
    fondoDirigenzaData: {},
    distribuzioneRisorseData: {},
    personaleServizio: { dettagli: [] },
  } as unknown as FundData;
}

describe('validateFundData — Validazione FundData con Policy Art. 33', () => {
  it('APPLY con tutti i dati necessari -> nessun errore di validazione', () => {
    const data = createValidBaseFundData();
    const errors = validateFundData(data);
    expect(errors).toEqual({});
  });

  it('APPLY senza fondoPersonaleNonDirEQ2018_Art23 -> errore bloccante su historicalData.fondoPersonaleNonDirEQ2018_Art23', () => {
    const data = createValidBaseFundData();
    delete (data.historicalData as any).fondoPersonaleNonDirEQ2018_Art23;

    const errors = validateFundData(data);
    expect(errors['fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23']).toBeDefined();
    expect(errors['fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23']).toContain('calcolo dell\'adeguamento Art. 33');
  });

  it('SKIP (es. UNIONE_COMUNI) senza fondoPersonaleNonDirEQ2018_Art23 -> NON segnala errore per il dato 2018', () => {
    const data = createValidBaseFundData();
    data.annualData.tipologiaEnte = TipologiaEnte.UNIONE_COMUNI;
    delete (data.historicalData as any).fondoPersonaleNonDirEQ2018_Art23;

    const errors = validateFundData(data);
    expect(errors['fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23']).toBeUndefined();
    expect(errors['fundData.annualData.art33ManualDecision']).toBeUndefined();
  });

  it('SKIP tramite decisione manuale DO_NOT_APPLY su ALTRO -> nessun errore anche se manca dato 2018', () => {
    const data = createValidBaseFundData();
    data.annualData.tipologiaEnte = TipologiaEnte.ALTRO;
    data.annualData.art33ManualDecision = 'DO_NOT_APPLY';
    delete (data.historicalData as any).fondoPersonaleNonDirEQ2018_Art23;

    const errors = validateFundData(data);
    expect(errors['fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23']).toBeUndefined();
    expect(errors['fundData.annualData.art33ManualDecision']).toBeUndefined();
  });

  it('BLOCK (es. PROVINCIA senza territorialContext né decisione manuale) -> errore su annualData.art33ManualDecision', () => {
    const data = createValidBaseFundData();
    data.annualData.tipologiaEnte = TipologiaEnte.PROVINCIA;
    data.annualData.art33ManualDecision = undefined;

    const errors = validateFundData(data);
    expect(errors['fundData.annualData.art33ManualDecision']).toBeDefined();
    expect(errors['fundData.annualData.art33ManualDecision']).toContain('richiede una verifica manuale');
  });

  it('BLOCK (es. ALTRO senza decisione manuale) -> errore su annualData.art33ManualDecision e NON su dato 2018', () => {
    const data = createValidBaseFundData();
    data.annualData.tipologiaEnte = TipologiaEnte.ALTRO;
    delete (data.historicalData as any).fondoPersonaleNonDirEQ2018_Art23;

    const errors = validateFundData(data);
    expect(errors['fundData.annualData.art33ManualDecision']).toBeDefined();
    expect(errors['fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23']).toBeUndefined();
  });

  it('APPLY (es. ALTRO con decisione manuale APPLY) richiede fondoPersonaleNonDirEQ2018_Art23', () => {
    const data = createValidBaseFundData();
    data.annualData.tipologiaEnte = TipologiaEnte.ALTRO;
    data.annualData.art33ManualDecision = 'APPLY';
    delete (data.historicalData as any).fondoPersonaleNonDirEQ2018_Art23;

    const errors = validateFundData(data);
    expect(errors['fundData.annualData.art33ManualDecision']).toBeUndefined();
    expect(errors['fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23']).toBeDefined();
  });
});
