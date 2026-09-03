import { describe, it, expect } from 'vitest';
import { normalizeInput } from '../../../application/input/inputNormalizer';
import { calculateArt23Limit } from '../../wizard2026/art23Limit';
import { calculateArt23c2Adjustment } from '../../calculation/fundCalculations';
import type { FundData, HistoricalData, AnnualData } from '../../../domain';

/**
 * CHARACTERIZATION — EXPECTED TO CHANGE IN NEXT FTE WIRING PR
 * 
 * Questa suite congela le divergenze semantiche attuali tra i diversi layer
 * (inputNormalizer, Wizard 2026, Fund Engine canonico, complianceChecks, FAD UI)
 * prima del futuro wiring del contratto canonico calculateArt23Fte.
 */
describe('CHARACTERIZATION — Divergenze Semantiche Attuali Calcolo FTE (Pre-Wiring)', () => {

  // Helper per creare FundData minimale per inputNormalizer
  function createFundDataForNormalizer(params: {
    personale2018?: Array<{ id: string; partTimePercentage?: number; cedoliniEmessi?: number }>;
    personaleAnnoRif?: Array<{ id: string; partTimePercentage?: number; cedoliniEmessi?: number }>;
  }): FundData {
    return {
      annualData: {
        denominazioneEnte: 'Test Ente',
        tipologiaEnte: 'Comune' as any,
        annoRiferimento: 2026,
        personale2018PerArt23: params.personale2018,
        personaleAnnoRifPerArt23: params.personaleAnnoRif,
      },
      historicalData: {},
      fondoAccessorioDipendenteData: {},
      fondoElevateQualificazioniData: {},
      fondoSegretarioComunaleData: {},
      fondoDirigenzaData: {},
      distribuzioneRisorseData: {},
      personaleServizio: { dettagli: [] }
    } as unknown as FundData;
  }

  // Helper per calcolare l'FTE secondo la formula locale di FondoAccessorioDipendentePage
  function computeFadPageFte(personale: Array<{ id?: string; partTimePercentage?: number; cedoliniEmessi?: number }>, isCurrentYear: boolean): number {
    return personale.reduce((sum, emp) => {
      const ptPerc = (emp.partTimePercentage || 0) / 100;
      if (!isCurrentYear) {
        return sum + ptPerc;
      }
      const cedoliniRatio = emp.cedoliniEmessi !== undefined && emp.cedoliniEmessi > 0 && emp.cedoliniEmessi <= 12 ? emp.cedoliniEmessi / 12 : 0;
      return sum + (ptPerc * cedoliniRatio);
    }, 0);
  }

  describe('1. Caso Ordinario Valido Comune a Tutti (PT=50%, Cedolini=6)', () => {
    it('tutti i layer calcolano 0.25 FTE per PT=50 e Cedolini=6', () => {
      const emp = { id: 'emp1', partTimePercentage: 50, cedoliniEmessi: 6 };

      // inputNormalizer
      const norm = normalizeInput(createFundDataForNormalizer({ personaleAnnoRif: [emp] }));
      expect(norm.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(0.25);

      // Wizard calculateArt23Limit
      const wiz = calculateArt23Limit({
        personale2026Art23: [emp],
        hasDirigenza: false
      });
      expect(wiz.dipendentiEquivalenti2026).toBe(0.25);

      // Fund Engine adapter (calculateArt23c2Adjustment)
      // Passiamo calculatedFteAnnoRif = 0 per forzare il fallback interno calculateArt23Fte(personaleAnnoRifPerArt23).
      const historicalData: HistoricalData = { fondoPersonaleNonDirEQ2018_Art23: 100000 };
      const annualData: AnnualData = {
        annoRiferimento: 2026,
        personale2018PerArt23: [
          {
            id: 'emp2018',
            partTimePercentage: 10,
          }
        ],
        personaleAnnoRifPerArt23: [emp]
      } as unknown as AnnualData;

      const fundAdj = calculateArt23c2Adjustment(historicalData, annualData, 0, false, {});

      const expectedFte2018 = 0.10;
      const expectedCurrentFte = 0.25;
      const expectedImporto = (100000 / expectedFte2018) * (expectedCurrentFte - expectedFte2018); // 150000

      expect(fundAdj.importo).toBeGreaterThan(0);
      expect(fundAdj.importo).toBeCloseTo(expectedImporto, 8);

      // FAD Page formula
      expect(computeFadPageFte([emp], true)).toBe(0.25);
    });
  });

  describe('2. Allineamento Part-Time Zero (partTimePercentage = 0)', () => {
    it('inputNormalizer produce 0 FTE (valore esplicito 0 non più trattato come assente)', () => {
      const emp2018 = { id: 'emp1', partTimePercentage: 0 };
      const norm = normalizeInput(createFundDataForNormalizer({ personale2018: [emp2018] }));
      expect(norm.calculatedInputs.dipendentiEquivalenti2018).toBe(0);
    });

    it('Wizard calculateArt23Limit produce 0 FTE (distingue undefined da 0)', () => {
      const emp2018 = { id: 'emp1', partTimePercentage: 0 };
      const wiz = calculateArt23Limit({
        personale2018Art23: [emp2018],
        hasDirigenza: false
      });
      expect(wiz.dipendentiEquivalenti2018).toBe(0);
    });

    it('FAD Page formula produce 0 FTE (usa || 0)', () => {
      const emp2018 = { partTimePercentage: 0 };
      expect(computeFadPageFte([emp2018], false)).toBe(0);
    });
  });

  describe('3. Allineamento Cedolini Zero (partTimePercentage = 100, cedoliniEmessi = 0)', () => {
    it('inputNormalizer produce 0 FTE (valore esplicito 0 non più trattato come anno intero)', () => {
      const empCurr = { id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 0 };
      const norm = normalizeInput(createFundDataForNormalizer({ personaleAnnoRif: [empCurr] }));
      expect(norm.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(0);
    });

    it('Wizard calculateArt23Limit produce 0 FTE (cedolini 0 / 12 = 0)', () => {
      const empCurr = { id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 0 };
      const wiz = calculateArt23Limit({
        personale2026Art23: [empCurr],
        hasDirigenza: false
      });
      expect(wiz.dipendentiEquivalenti2026).toBe(0);
    });

    it('FAD Page formula produce 0 FTE (fallback a 0 se non > 0)', () => {
      const empCurr = { partTimePercentage: 100, cedoliniEmessi: 0 };
      expect(computeFadPageFte([empCurr], true)).toBe(0);
    });
  });

  describe('4. Gestione Valori Assenti (Missing Values: PT undefined, Cedolini undefined)', () => {
    it('PT undefined: inputNormalizer e Wizard assumono 100% (1 FTE), FAD Page assume 0% (0 FTE)', () => {
      const empNoPt = { id: 'emp1' };

      const norm = normalizeInput(createFundDataForNormalizer({ personale2018: [empNoPt] }));
      expect(norm.calculatedInputs.dipendentiEquivalenti2018).toBe(1);

      const wiz = calculateArt23Limit({
        personale2018Art23: [empNoPt],
        hasDirigenza: false
      });
      expect(wiz.dipendentiEquivalenti2018).toBe(1);

      expect(computeFadPageFte([empNoPt], false)).toBe(0);
    });

    it('Cedolini undefined: inputNormalizer e Wizard assumono 12 mesi (1 ratio), FAD Page assume 0 mesi (0 ratio)', () => {
      const empNoCed = { id: 'emp1', partTimePercentage: 100 };

      const norm = normalizeInput(createFundDataForNormalizer({ personaleAnnoRif: [empNoCed] }));
      expect(norm.calculatedInputs.dipendentiEquivalentiAnnoRif).toBe(1);

      const wiz = calculateArt23Limit({
        personale2026Art23: [empNoCed],
        hasDirigenza: false
      });
      expect(wiz.dipendentiEquivalenti2026).toBe(1);

      expect(computeFadPageFte([empNoCed], true)).toBe(0);
    });
  });
});
