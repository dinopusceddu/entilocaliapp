import { describe, it, expect } from 'vitest';
import { calculateArt33AdjustmentCore } from '../art33AdjustmentCore';
import { calculateArt23Limit } from '../../wizard2026/art23Limit';
import { calculateArt23c2Adjustment } from '../../calculation/fundCalculations';
import { AnnualData, HistoricalData, TipologiaEnte } from '../../../domain';

describe('art33AdjustmentCore — Nucleo puro di calcolo adeguamento Art. 33 D.L. 34/2019', () => {

  describe('1. Nucleo Matematico Puro', () => {
    it('calcola correttamente incremento con variazione personale positiva (+2 FTE)', () => {
      const res = calculateArt33AdjustmentCore({
        baseAccessoria2018: 100000,
        fte2018: 10,
        fteAnnoCorrente: 12
      });

      expect(res.valoreMedioProCapite2018).toBe(10000);
      expect(res.differenzialeFte).toBe(2);
      expect(res.adeguamento).toBe(20000);
    });

    it('calcola differenziale e adeguamento nulli quando FTE corrente è uguale a FTE 2018 (Delta = 0)', () => {
      const res = calculateArt33AdjustmentCore({
        baseAccessoria2018: 100000,
        fte2018: 10,
        fteAnnoCorrente: 10
      });

      expect(res.valoreMedioProCapite2018).toBe(10000);
      expect(res.differenzialeFte).toBe(0);
      expect(res.adeguamento).toBe(0);
    });

    it('espone differenziale negativo senza decrementare il limite (adeguamento pari a 0)', () => {
      const res = calculateArt33AdjustmentCore({
        baseAccessoria2018: 100000,
        fte2018: 10,
        fteAnnoCorrente: 8
      });

      expect(res.valoreMedioProCapite2018).toBe(10000);
      expect(res.differenzialeFte).toBe(-2);
      expect(res.adeguamento).toBe(0);
    });

    it('gestisce correttamente FTE frazionari (+0.5 FTE)', () => {
      const res = calculateArt33AdjustmentCore({
        baseAccessoria2018: 50000,
        fte2018: 1,
        fteAnnoCorrente: 1.5
      });

      expect(res.valoreMedioProCapite2018).toBe(50000);
      expect(res.differenzialeFte).toBe(0.5);
      expect(res.adeguamento).toBe(25000);
    });

    it('gestisce frazione periodica (1/3) in modo coerente e deterministico', () => {
      const res = calculateArt33AdjustmentCore({
        baseAccessoria2018: 100000,
        fte2018: 3,
        fteAnnoCorrente: 4
      });

      expect(res.valoreMedioProCapite2018).toBeCloseTo(33333.333333, 5);
      expect(res.differenzialeFte).toBe(1);
      expect(res.adeguamento).toBeCloseTo(33333.333333, 5);
    });

    it('restituisce 0 e differenziale senza generare Infinity o NaN quando FTE 2018 è 0', () => {
      const res = calculateArt33AdjustmentCore({
        baseAccessoria2018: 100000,
        fte2018: 0,
        fteAnnoCorrente: 10
      });

      expect(res.valoreMedioProCapite2018).toBe(0);
      expect(res.differenzialeFte).toBe(10);
      expect(res.adeguamento).toBe(0);
      expect(Number.isFinite(res.valoreMedioProCapite2018)).toBe(true);
      expect(Number.isFinite(res.adeguamento)).toBe(true);
    });

    it('restituisce 0 quando base accessoria 2018 è pari a zero', () => {
      const resZero = calculateArt33AdjustmentCore({
        baseAccessoria2018: 0,
        fte2018: 10,
        fteAnnoCorrente: 12
      });
      expect(resZero.valoreMedioProCapite2018).toBe(0);
      expect(resZero.differenzialeFte).toBe(2);
      expect(resZero.adeguamento).toBe(0);
    });

    it('compatibilità aritmetica legacy con base accessoria negativa (non normalizzata)', () => {
      // NOTA: Si tratta di compatibilità aritmetica legacy con la formula originaria e non di validazione normativa dell'input.
      const resNeg = calculateArt33AdjustmentCore({
        baseAccessoria2018: -5000,
        fte2018: 10,
        fteAnnoCorrente: 12
      });
      expect(resNeg.valoreMedioProCapite2018).toBe(-500);
      expect(resNeg.differenzialeFte).toBe(2);
      expect(resNeg.adeguamento).toBe(-1000);
    });
  });

  describe('2. Test di Integrazione degli Adapter (Preservazione Divergenze Legacy)', () => {
    it('Wizard Adapter con base accessoria 2018 negativa: applica la formula aritmetica diretta non normalizzata', () => {
      const wizardRes = calculateArt23Limit({
        fondoPersonaleDipendente2016: 100000,
        fondoDipendenti2018Soggetto: -5000,
        risorsePoEq2018Soggette: 0,
        usaCalcoloManualePersonaleArt23: true,
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalenti2026: 12
      });

      expect(wizardRes.valoreMedioProCapite2018).toBe(-500);
      expect(wizardRes.differenzaPersonale).toBe(2);
      expect(wizardRes.incrementoProCapiteLimite).toBe(-1000);
      expect(wizardRes.limiteArt23Attualizzato).toBe(99000);
    });

    it('Fondo Adapter con base accessoria 2018 negativa: neutralizza l input e restituisce importo 0', () => {
      const mockHistoricalData: HistoricalData = {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
        fondoPersonaleNonDirEQ2018_Art23: -5000,
        fondoEQ2018_Art23: 0,
        fondoElevateQualificazioni2016: 0,
        risorseSegretarioComunale2016: 0,
        fondoDirigenza2016: 0,
        fondoStraordinario2016: 0
      };

      const mockAnnualData: AnnualData = {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.COMUNE,
        numeroAbitanti: 10000,
        hasDirigenza: false,
        personaleServizioAttuale: [],
        proventiSpecifici: [],
        personale2018PerArt23: [],
        personaleAnnoRifPerArt23: [],
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalentiAnnoRif: 12,
        fondoLavoroStraordinario: 0,
        incrementoFondoStraordinario: 0,
        simulatoreInput: {}
      };

      const fundRes = calculateArt23c2Adjustment(
        mockHistoricalData,
        mockAnnualData,
        12,
        true,
        { art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017' }
      );

      expect(fundRes.importo).toBe(0);
      expect(fundRes.component).toBeUndefined();
    });
  });
});
