import { describe, it, expect } from 'vitest';
import { calculateArt33AdjustmentCore } from '../art33AdjustmentCore';
import { calculateArt23Limit } from '../../wizard2026/art23Limit';
import { calculateArt23c2Adjustment } from '../../calculation/fundCalculations';
import { AnnualData, HistoricalData, TipologiaEnte, FundData } from '../../../domain';
import { normalizeInput } from '../../../application/input/inputNormalizer';

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

  describe('3. Test di Caratterizzazione Precedenza e Selezione FTE (Adapter Wizard e Fondo)', () => {
    it('Test 11 — Wizard manuale prevale su array e fallback', () => {
      const wizardRes = calculateArt23Limit({
        fondoPersonaleDipendente2016: 100000,
        fondoDipendenti2018Soggetto: 100000,
        risorsePoEq2018Soggette: 0,
        usaCalcoloManualePersonaleArt23: true,
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalenti2026: 12,
        personale2018Art23: [{ id: '1', partTimePercentage: 50 }],
        personale2026Art23: [{ id: '1', partTimePercentage: 50, cedoliniEmessi: 6 }],
        personaleServizio31122018: 99,
        personalePrevisto2026Piao: 99
      });

      expect(wizardRes.dipendentiEquivalenti2018).toBe(10);
      expect(wizardRes.dipendentiEquivalenti2026).toBe(12);
      expect(wizardRes.differenzaPersonale).toBe(2);
      expect(wizardRes.incrementoProCapiteLimite).toBe(20000);
    });

    it('Test 12 — Wizard manual mode con manuale corrente assente: differenziale e adeguamento nulli', () => {
      // CLASSIFICAZIONE: LEGACY BEHAVIOR TO PRESERVE
      const wizardRes = calculateArt23Limit({
        fondoPersonaleDipendente2016: 100000,
        fondoDipendenti2018Soggetto: 100000,
        risorsePoEq2018Soggette: 0,
        usaCalcoloManualePersonaleArt23: true,
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalenti2026: undefined,
        personale2026Art23: [{ id: '1', partTimePercentage: 100, cedoliniEmessi: 12 }],
        personalePrevisto2026Piao: 12
      });

      expect(wizardRes.dipendentiEquivalenti2018).toBe(10);
      expect(wizardRes.dipendentiEquivalenti2026).toBe(0);
      expect(wizardRes.differenzaPersonale).toBe(0);
      expect(wizardRes.incrementoProCapiteLimite).toBe(0);
    });

    it('Test 13 — Wizard: cedolini ignorati nel personale 2018', () => {
      const wizardRes = calculateArt23Limit({
        fondoPersonaleDipendente2016: 100000,
        fondoDipendenti2018Soggetto: 100000,
        risorsePoEq2018Soggette: 0,
        usaCalcoloManualePersonaleArt23: false,
        personale2018Art23: [{ id: '1', partTimePercentage: 50, cedoliniEmessi: 6 }],
        personale2026Art23: [{ id: '1', partTimePercentage: 100, cedoliniEmessi: 12 }]
      });

      // Il part-time al 50% vale 0.5 FTE (cedoliniEmessi = 6 non dimezza ulteriormente a 0.25)
      expect(wizardRes.dipendentiEquivalenti2018).toBe(0.5);
    });

    it('Test 14 — Wizard: cedolini applicati nel corrente, incluso zero', () => {
      const wizardRes = calculateArt23Limit({
        fondoPersonaleDipendente2016: 100000,
        fondoDipendenti2018Soggetto: 100000,
        risorsePoEq2018Soggette: 0,
        usaCalcoloManualePersonaleArt23: false,
        personale2018Art23: [{ id: '1', partTimePercentage: 100 }],
        personale2026Art23: [{ id: '1', partTimePercentage: 100, cedoliniEmessi: 0 }]
      });

      expect(wizardRes.dipendentiEquivalenti2026).toBe(0);
      expect(wizardRes.differenzaPersonale).toBe(-1);
      expect(wizardRes.incrementoProCapiteLimite).toBe(0);
    });

    it('Test 15 — Fondo: manuale FTE 2018 prevale anche fuori manual mode (isManualMode = false)', () => {
      const mockHistoricalData: HistoricalData = {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
        fondoPersonaleNonDirEQ2018_Art23: 100000,
        fondoEQ2018_Art23: 0,
        fondoElevateQualificazioni2016: 0,
        risorseSegretarioComunale2016: 0,
        fondoDirigenza2016: 0,
        fondoStraordinario2016: 0
      };

      const mockAnnualData: AnnualData = {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.COMUNE,
        manualDipendentiEquivalenti2018: 10,
        personale2018PerArt23: [{ id: '1', partTimePercentage: 50 }],
        manualDipendentiEquivalentiAnnoRif: 12,
        personaleServizioAttuale: [],
        proventiSpecifici: [],
        personaleAnnoRifPerArt23: [],
        fondoLavoroStraordinario: 0,
        incrementoFondoStraordinario: 0,
        simulatoreInput: {}
      };

      const fundRes = calculateArt23c2Adjustment(
        mockHistoricalData,
        mockAnnualData,
        0,
        false,
        { art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017' }
      );

      expect(fundRes.importo).toBe(20000);
      expect(fundRes.component).toBeDefined();
    });

    it('Test 16 — Fondo manual mode: valore corrente manuale zero NON prevale e attiva fallback a calculatedFte attraverso normalizeInput', () => {
      // CLASSIFICAZIONE: LEGACY BEHAVIOR TO PRESERVE
      // Dimostra il doppio fallback di produzione:
      // 1. in normalizeInput: manualDipendentiEquivalenti = 0 è falsy, quindi scartato tramite `||` a favore della lista analitica (12 FTE)
      // 2. in calculateArt23c2Adjustment: manualDipendentiEquivalentiAnnoRif = 0 è scartato perché richiede `> 0`, usando calculatedFteAnnoRif (12 FTE)

      // Scenario A: manual = 0 + lista analitica con dipendenti che totalizzano 12 FTE
      const rawFundData: FundData = {
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
          manualDipendentiEquivalenti2018: 10,
          manualDipendentiEquivalentiAnnoRif: 0,
          personaleServizioAttuale: [],
          proventiSpecifici: [],
          personale2018PerArt23: [],
          personaleAnnoRifPerArt23: [
            { id: '1', partTimePercentage: 100, cedoliniEmessi: 12 },
            { id: '2', partTimePercentage: 100, cedoliniEmessi: 12 },
            { id: '3', partTimePercentage: 100, cedoliniEmessi: 12 },
            { id: '4', partTimePercentage: 100, cedoliniEmessi: 12 },
            { id: '5', partTimePercentage: 100, cedoliniEmessi: 12 },
            { id: '6', partTimePercentage: 100, cedoliniEmessi: 12 },
            { id: '7', partTimePercentage: 100, cedoliniEmessi: 12 },
            { id: '8', partTimePercentage: 100, cedoliniEmessi: 12 },
            { id: '9', partTimePercentage: 100, cedoliniEmessi: 12 },
            { id: '10', partTimePercentage: 100, cedoliniEmessi: 12 },
            { id: '11', partTimePercentage: 100, cedoliniEmessi: 12 },
            { id: '12', partTimePercentage: 100, cedoliniEmessi: 12 }
          ],
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
          manualDipendentiEquivalenti: 0
        }
      };

      const normalized = normalizeInput(rawFundData);

      // Verifica normalizer: isManualMode è true ma lo 0 manuale viene scartato con fallback sul conteggio analitico (12 FTE)
      expect(normalized.calculatedInputs.isManualMode).toBe(true);
      expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(12);

      const fundRes = calculateArt23c2Adjustment(
        normalized.historicalData,
        normalized.annualData,
        normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
        !!normalized.calculatedInputs.isManualMode,
        { art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017' }
      );

      expect(fundRes.importo).toBe(20000);
      expect(fundRes.component).toBeDefined();

      // Scenario B: sottocaso con manual = 0 e lista analitica vuota (calculatedFte = 0)
      const rawFundDataEmptyList: FundData = {
        ...rawFundData,
        annualData: {
          ...rawFundData.annualData,
          personaleAnnoRifPerArt23: []
        }
      };

      const normalizedEmptyList = normalizeInput(rawFundDataEmptyList);

      expect(normalizedEmptyList.calculatedInputs.isManualMode).toBe(true);
      expect(normalizedEmptyList.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(0);

      const fundResEmptyList = calculateArt23c2Adjustment(
        normalizedEmptyList.historicalData,
        normalizedEmptyList.annualData,
        normalizedEmptyList.calculatedInputs.dipendentiEquivalentiAnnoRif,
        !!normalizedEmptyList.calculatedInputs.isManualMode,
        { art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017' }
      );

      expect(fundResEmptyList.importo).toBe(0);
      expect(fundResEmptyList.component).toBeUndefined();
    });

    it('Test 17 — Fondo non manual: valore corrente manuale zero prevale (differenza interna con manual mode)', () => {
      const mockHistoricalData: HistoricalData = {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
        fondoPersonaleNonDirEQ2018_Art23: 100000,
        fondoEQ2018_Art23: 0,
        fondoElevateQualificazioni2016: 0,
        risorseSegretarioComunale2016: 0,
        fondoDirigenza2016: 0,
        fondoStraordinario2016: 0
      };

      const mockAnnualData: AnnualData = {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.COMUNE,
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalentiAnnoRif: 0,
        personaleServizioAttuale: [],
        proventiSpecifici: [],
        personale2018PerArt23: [],
        personaleAnnoRifPerArt23: [],
        fondoLavoroStraordinario: 0,
        incrementoFondoStraordinario: 0,
        simulatoreInput: {}
      };

      const fundRes = calculateArt23c2Adjustment(
        mockHistoricalData,
        mockAnnualData,
        12,
        false,
        { art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017' }
      );

      expect(fundRes.importo).toBe(0);
      expect(fundRes.component).toBeUndefined();
    });

    it('Test 18 — Divergenza cedolini zero Wizard/Fondo: Wizard produce FTE 0, Fondo calculateArt23Fte produce FTE 1', () => {
      // CLASSIFICAZIONE: INTENTIONAL / LEGACY DIVERGENCE TO PRESERVE

      // 1. Wizard: cedoliniEmessi = 0 produce FTE corrente = 0
      const wizardRes = calculateArt23Limit({
        fondoPersonaleDipendente2016: 100000,
        fondoDipendenti2018Soggetto: 100000,
        risorsePoEq2018Soggette: 0,
        usaCalcoloManualePersonaleArt23: false,
        personale2018Art23: [{ id: '1', partTimePercentage: 50 }],
        personale2026Art23: [{ id: '1', partTimePercentage: 100, cedoliniEmessi: 0 }]
      });

      expect(wizardRes.dipendentiEquivalenti2018).toBe(0.5);
      expect(wizardRes.dipendentiEquivalenti2026).toBe(0);
      expect(wizardRes.differenzaPersonale).toBe(-0.5);
      expect(wizardRes.incrementoProCapiteLimite).toBe(0);

      // 2. Fondo: calculateArt23Fte tratta cedolini = 0 come ratio 1 (1 FTE corrente)
      const mockHistoricalData: HistoricalData = {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
        fondoPersonaleNonDirEQ2018_Art23: 100000,
        fondoEQ2018_Art23: 0,
        fondoElevateQualificazioni2016: 0,
        risorseSegretarioComunale2016: 0,
        fondoDirigenza2016: 0,
        fondoStraordinario2016: 0
      };

      const mockAnnualData: AnnualData = {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.COMUNE,
        personale2018PerArt23: [{ id: '1', partTimePercentage: 50 }],
        personaleAnnoRifPerArt23: [{ id: '1', partTimePercentage: 100, cedoliniEmessi: 0 }],
        personaleServizioAttuale: [],
        proventiSpecifici: [],
        fondoLavoroStraordinario: 0,
        incrementoFondoStraordinario: 0,
        simulatoreInput: {}
      };

      const fundRes = calculateArt23c2Adjustment(
        mockHistoricalData,
        mockAnnualData,
        0,
        false,
        { art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017' }
      );

      // Fondo calcola FTE 2018 = 0.5, FTE corrente = 1, differenziale = +0.5, adeguamento = 100.000 €
      expect(fundRes.importo).toBe(100000);
      expect(fundRes.component).toBeDefined();

      // Asserzione esplicita della divergenza: Wizard = 0 incremento vs Fondo = 100.000 € incremento
      expect(fundRes.importo).toBeGreaterThan(wizardRes.incrementoProCapiteLimite);
    });
  });
});
