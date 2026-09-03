import { describe, it, expect } from 'vitest';
import { calculateArt33AdjustmentCore } from '../art33AdjustmentCore';
import { calculateArt23Limit } from '../../wizard2026/art23Limit';
import { calculateArt23c2Adjustment } from '../../calculation/fundCalculations';
import { calculateFundCompletely } from '../../calculation/fundEngine';
import { AnnualData, HistoricalData, TipologiaEnte, FundData } from '../../../domain';
import { normalizeInput } from '../../../application/input/inputNormalizer';

const mockNormativeData: any = {
  riferimenti_normativi: {
    art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017'
  },
  parametri_generali: {}
};

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

    it('Test 16 — Fund manual mode preserves explicit current FTE zero', () => {
      // 1. Scenario: manual FTE 2018 = 10, manual FTE corrente = 0 (in annualData),
      // con legacy personaleServizio = 12 e array analitico che totalizza 12 FTE
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
          isArt23FteManualMode: true,
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
          manualDipendentiEquivalenti: 12
        }
      };

      const normalized = normalizeInput(rawFundData);

      // Normalizer: zero corrente manuale preservato, annualData prevale sul legacy 12 e array 12
      expect(normalized.calculatedInputs.isArt23FteManualMode).toBe(true);
      expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(10);
      expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(0);
      expect(normalized.calculatedInputs.variazioneDipendenti).toBe(-10);
      expect(normalized.calculatedInputs.manualDipendentiEquivalentiAnnoRif).toBe(0);

      // Calcolo low-level adapter: con FTE corrente 0, variazione negativa -> adeguamento 0
      const fundRes = calculateArt23c2Adjustment(
        normalized.historicalData,
        normalized.annualData,
        normalized.calculatedInputs.dipendentiEquivalentiAnnoRif,
        !!normalized.calculatedInputs.isArt23FteManualMode,
        { art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017' }
      );

      expect(fundRes.importo).toBe(0);
      expect(fundRes.component).toBeUndefined();

      // Calcolo Full Engine: limite Art. 23 finale torna al pavimento storico 2016 (100.000 €)
      const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
      expect(fullFundResult.compliance.art23c2.limite).toBe(100000);

      // CLASSIFICAZIONE: FIXED — CURRENT FTE ZERO RETURNS DYNAMIC LIMIT TO THE 2016 FLOOR
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

    it('Test 18 — Allineamento cedolini zero Wizard e Fondo: entrambi producono FTE 0 e incremento 0', () => {
      // CLASSIFICAZIONE:
      // FIXED — WIZARD AND FUND ADAPTER SHARE CANONICAL FTE BOUNDARY SEMANTICS

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

      // 2. Fondo: calculateArt23Fte canonico produce FTE corrente = 0 fail-safe
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

      // Fondo calcola FTE 2018 = 0.5, FTE corrente = 0, differenziale = -0.5, adeguamento = 0 €
      expect(fundRes.importo).toBe(0);
      expect(fundRes.component).toBeUndefined();

      // Asserzione esplicita di convergenza: Wizard e Fondo allineati a 0 incremento
      expect(fundRes.importo).toBe(wizardRes.incrementoProCapiteLimite);
    });

    it('Test 19 — Canonical source precedence: annual Art23 manual current FTE wins over legacy personnel field', () => {
      // Scenario: isArt23FteManualMode = true, manual 2018 = 10, annualData manual corrente = 8, legacy personaleServizio = 12, array analitico = 15
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
          manualDipendentiEquivalentiAnnoRif: 8,
          isArt23FteManualMode: true,
          personaleServizioAttuale: [],
          proventiSpecifici: [],
          personale2018PerArt23: [{ id: '1', partTimePercentage: 100 }], // 1 FTE
          personaleAnnoRifPerArt23: Array.from({ length: 15 }, (_, i) => ({
            id: String(i + 1),
            partTimePercentage: 100,
            cedoliniEmessi: 12
          })), // 15 FTE
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

      const normalized = normalizeInput(rawFundData);
      expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(10);
      expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(8);
      expect(normalized.calculatedInputs.variazioneDipendenti).toBe(-2);
      expect(normalized.calculatedInputs.manualDipendentiEquivalentiAnnoRif).toBe(8);

      const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
      expect(fullFundResult.compliance.art23c2.limite).toBe(100000);

      // CLASSIFICAZIONE: CANONICAL SOURCE PRECEDENCE — ANNUAL ART23 MANUAL CURRENT FTE WINS OVER LEGACY PERSONNEL FIELD
    });

    it('Test 20 — Legacy fallback: missing annualData manual current FTE falls back to personaleServizio legacy field', () => {
      // Scenario: isArt23FteManualMode = true, manual 2018 = 10, annualData manual corrente = undefined, legacy personaleServizio = 12, array analitico = 15
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
          manualDipendentiEquivalentiAnnoRif: undefined,
          isArt23FteManualMode: true,
          personaleServizioAttuale: [],
          proventiSpecifici: [],
          personale2018PerArt23: [{ id: '1', partTimePercentage: 100 }],
          personaleAnnoRifPerArt23: Array.from({ length: 15 }, (_, i) => ({
            id: String(i + 1),
            partTimePercentage: 100,
            cedoliniEmessi: 12
          })),
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

      const normalized = normalizeInput(rawFundData);
      expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(10);
      expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(12);
      expect(normalized.calculatedInputs.variazioneDipendenti).toBe(2);
      expect(normalized.calculatedInputs.manualDipendentiEquivalentiAnnoRif).toBe(12);

      const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
      expect(fullFundResult.compliance.art23c2.limite).toBe(120000);

      // CLASSIFICAZIONE: LEGACY FALLBACK PRESERVED
    });

    it('Test 21 — Invalid zero 2018 is preserved for validation, not silently replaced by analytic data', () => {
      // Scenario: isArt23FteManualMode = true, manual 2018 = 0, array analitico 2018 = 10, manual corrente = 12
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
          manualDipendentiEquivalenti2018: 0,
          manualDipendentiEquivalentiAnnoRif: 12,
          isArt23FteManualMode: true,
          personaleServizioAttuale: [],
          proventiSpecifici: [],
          personale2018PerArt23: Array.from({ length: 10 }, (_, i) => ({
            id: String(i + 1),
            partTimePercentage: 100
          })), // 10 FTE
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
          dettagli: [],
          isManualMode: true,
          manualDipendentiEquivalenti: 12
        }
      };

      const normalized = normalizeInput(rawFundData);
      expect(normalized.calculatedInputs.dipendentiEquivalenti2018).toBe(0);
      expect(normalized.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(12);
      expect(normalized.calculatedInputs.variazioneDipendenti).toBe(12);

      const fullFundResult = calculateFundCompletely(normalized, mockNormativeData);
      // Con FTE 2018 <= 0, il core restituisce adeguamento 0
      expect(fullFundResult.compliance.art23c2.limite).toBe(100000);

      // CLASSIFICAZIONE: INVALID ZERO 2018 IS PRESERVED FOR VALIDATION, NOT SILENTLY REPLACED
    });
  });
});
