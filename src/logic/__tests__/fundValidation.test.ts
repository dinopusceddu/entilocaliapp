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

  it('Canonical-only: entityClassification.entityType COMUNE è sufficiente anche senza tipologiaEnte legacy', () => {
    const data = createValidBaseFundData();
    data.annualData.denominazioneEnte = 'Comune Canonico';
    data.annualData.tipologiaEnte = undefined;
    data.annualData.entityClassification = {
      entityType: 'COMUNE'
    };

    const errors = validateFundData(data);
    expect(errors['fundData.annualData.tipologiaEnte']).toBeUndefined();
    expect(errors['fundData.annualData.art33ManualDecision']).toBeUndefined();
  });

  it('Entrambi assenti: tipologiaEnte e entityClassification mancanti generano errore su tipologiaEnte', () => {
    const data = createValidBaseFundData();
    data.annualData.tipologiaEnte = undefined;
    data.annualData.entityClassification = undefined;

    const errors = validateFundData(data);
    expect(errors['fundData.annualData.tipologiaEnte']).toBeDefined();
    expect(errors['fundData.annualData.tipologiaEnte']).toBe('La tipologia di ente è obbligatoria.');
  });

  it('Canonical precedence in validation: canonical COMUNE prevale su legacy PROVINCIA (nessun errore Art. 33)', () => {
    const data = createValidBaseFundData();
    data.annualData.tipologiaEnte = TipologiaEnte.PROVINCIA;
    data.annualData.entityClassification = {
      entityType: 'COMUNE'
    };

    const errors = validateFundData(data);
    expect(errors['fundData.annualData.tipologiaEnte']).toBeUndefined();
    expect(errors['fundData.annualData.art33ManualDecision']).toBeUndefined();
  });

  describe('Validazione Integrità FTE Art. 23 (FTE Canonico)', () => {
    it('A. analytic 2018 PT0 -> errore path corretto', () => {
      const data = createValidBaseFundData();
      data.annualData.personale2018PerArt23 = [{ id: 'e1', partTimePercentage: 0 }];
      const errors = validateFundData(data);
      expect(errors['fundData.annualData.personale2018PerArt23.0.partTimePercentage']).toBeDefined();
      expect(errors['fundData.annualData.personale2018PerArt23.0.partTimePercentage']).toBe(
        'La percentuale part-time deve essere maggiore di 0 e non superiore a 100.'
      );
    });

    it('B. analytic current PT0 -> errore', () => {
      const data = createValidBaseFundData();
      data.annualData.personaleAnnoRifPerArt23 = [{ id: 'e1', partTimePercentage: 0, cedoliniEmessi: 12 }];
      const errors = validateFundData(data);
      expect(errors['fundData.annualData.personaleAnnoRifPerArt23.0.partTimePercentage']).toBeDefined();
      expect(errors['fundData.annualData.personaleAnnoRifPerArt23.0.partTimePercentage']).toBe(
        'La percentuale part-time deve essere maggiore di 0 e non superiore a 100.'
      );
    });

    it('C. analytic current ced0 -> errore', () => {
      const data = createValidBaseFundData();
      data.annualData.personaleAnnoRifPerArt23 = [{ id: 'e1', partTimePercentage: 100, cedoliniEmessi: 0 }];
      const errors = validateFundData(data);
      expect(errors['fundData.annualData.personaleAnnoRifPerArt23.0.cedoliniEmessi']).toBeDefined();
      expect(errors['fundData.annualData.personaleAnnoRifPerArt23.0.cedoliniEmessi']).toBe(
        'Il numero di cedolini deve essere un intero compreso tra 1 e 12.'
      );
    });

    it('D. ced13 -> errore', () => {
      const data = createValidBaseFundData();
      data.annualData.personaleAnnoRifPerArt23 = [{ id: 'e1', partTimePercentage: 100, cedoliniEmessi: 13 }];
      const errors = validateFundData(data);
      expect(errors['fundData.annualData.personaleAnnoRifPerArt23.0.cedoliniEmessi']).toBeDefined();
      expect(errors['fundData.annualData.personaleAnnoRifPerArt23.0.cedoliniEmessi']).toBe(
        'Il numero di cedolini deve essere un intero compreso tra 1 e 12.'
      );
    });

    it('E. ced6.5 -> errore', () => {
      const data = createValidBaseFundData();
      data.annualData.personaleAnnoRifPerArt23 = [{ id: 'e1', partTimePercentage: 100, cedoliniEmessi: 6.5 }];
      const errors = validateFundData(data);
      expect(errors['fundData.annualData.personaleAnnoRifPerArt23.0.cedoliniEmessi']).toBeDefined();
      expect(errors['fundData.annualData.personaleAnnoRifPerArt23.0.cedoliniEmessi']).toBe(
        'Il numero di cedolini deve essere un intero compreso tra 1 e 12.'
      );
    });

    it('F. manual mode con manual values validi + stale analytic invalid -> nessun errore FTE', () => {
      const data = createValidBaseFundData();
      data.annualData.isArt23FteManualMode = true;
      data.annualData.manualDipendentiEquivalenti2018 = 10;
      data.annualData.manualDipendentiEquivalentiAnnoRif = 12;
      data.annualData.personale2018PerArt23 = [{ id: 'e1', partTimePercentage: 0 }];
      data.annualData.personaleAnnoRifPerArt23 = [{ id: 'e2', partTimePercentage: 0, cedoliniEmessi: 0 }];
      const errors = validateFundData(data);
      expect(errors['fundData.annualData.personale2018PerArt23.0.partTimePercentage']).toBeUndefined();
      expect(errors['fundData.annualData.personaleAnnoRifPerArt23.0.partTimePercentage']).toBeUndefined();
      expect(errors['fundData.annualData.personaleAnnoRifPerArt23.0.cedoliniEmessi']).toBeUndefined();
    });

    it('G. manual mode senza manual 2018 + analytic PT0 -> errore', () => {
      const data = createValidBaseFundData();
      data.annualData.isArt23FteManualMode = true;
      data.annualData.manualDipendentiEquivalenti2018 = undefined;
      data.annualData.manualDipendentiEquivalentiAnnoRif = 10;
      data.annualData.personale2018PerArt23 = [{ id: 'e1', partTimePercentage: 0 }];
      const errors = validateFundData(data);
      expect(errors['fundData.annualData.personale2018PerArt23.0.partTimePercentage']).toBeDefined();
    });

    it('H. manual mode senza manual current annual/legacy + ced0 -> errore', () => {
      const data = createValidBaseFundData();
      data.annualData.isArt23FteManualMode = true;
      data.annualData.manualDipendentiEquivalenti2018 = 10;
      data.annualData.manualDipendentiEquivalentiAnnoRif = undefined;
      data.personaleServizio = { dettagli: [] }; // no legacy manual
      data.annualData.personaleAnnoRifPerArt23 = [{ id: 'e1', partTimePercentage: 100, cedoliniEmessi: 0 }];
      const errors = validateFundData(data);
      expect(errors['fundData.annualData.personaleAnnoRifPerArt23.0.cedoliniEmessi']).toBeDefined();
    });
  });
});
