import { describe, it, expect } from 'vitest';
import { calculateArt23Limit } from '../../../../logic/wizard2026/art23Limit';
import { calculateCcnl2026Increments } from '../../../../logic/wizard2026/ccnl2026Increments';
import { calculateConglobamentoArt60 } from '../../../../logic/wizard2026/conglobamentoArt60';
import { calculateDl25Increment } from '../../../../logic/wizard2026/dl25Increment';
import { simulateWizard2026Transfer } from '../transferPreviewEngine';
import { Wizard2026DraftState } from '../../types';
import { initialWizard2026DraftState } from '../../initialState';
import { FundData } from '../../../../domain/types';

const createMockFundData = (partial: Partial<FundData> = {}): FundData => {
  return {
    historicalData: {},
    annualData: {
      annoRiferimento: 2026,
      personaleServizioAttuale: [],
      proventiSpecifici: [],
      personale2018PerArt23: [],
      personaleAnnoRifPerArt23: [],
      simulatoreInput: {},
    },
    fondoAccessorioDipendenteData: {},
    fondoElevateQualificazioniData: {},
    fondoSegretarioComunaleData: {},
    fondoDirigenzaData: {},
    distribuzioneRisorseData: {},
    personaleServizio: { dettagli: [] },
    ...partial,
  } as FundData;
};

describe('Normative Engine 2026 - Numerical Validation Cases', () => {

  describe('Case A: Base Comune without dirigenza (Spreadsheet 2026 Column)', () => {
    
    it('1. Limite Art. 23 - Verification of 2016 Base and Reattualizzazione', () => {
      const art23Input = {
        limite2016CertificatoEnte: 880238, // from Row 55 Col C
        fondoPersonaleDipendente2016: 868238, // from Row 25 Col C
        fondoEqPo2016: 191600, // from Row 22 Col C
        fondoStraordinario2016: 0,
        altreVoci2016Soggette: 12000, // from Row 28 Col C
        fondoDipendenti2018Soggetto: 892541, // from Row 25 Col D
        risorsePoEq2018Soggette: 191600, // from Row 22 Col D
        personaleServizio31122018: 190, // from Row 11 Col M
        personalePrevisto2026Piao: 190,
        hasDirigenza: false,
        fondoCertificatoParteStabile2018: 892541,
      };

      const result = calculateArt23Limit(art23Input);

      // Verify base values are reconstructed properly
      expect(result.totaleVoci2016Ricostruite).toBe(1071838); // 868238 + 191600 + 12000
      expect(result.limite2016Base).toBe(880238); // since certificato is used
      expect(result.dipendentiEquivalenti2018).toBe(190);
      expect(result.dipendentiEquivalenti2026).toBe(190);
      expect(result.differenzaPersonale).toBe(0);
      expect(result.incrementoProCapiteLimite).toBe(0);
      expect(result.limiteArt23Attualizzato).toBe(880238);
      expect(result.incrementoStabileAumentoPersonale).toBe(0);
    });

    it('2. CCNL 23.02.2026 - 0.14% Stabile and Arrear Calculations', () => {
      const ccnlInput = {
        monteSalari2021: 5033777, // from Row 66 Col C
        annoRiferimento: 2026,
        fondoRisorseDecentrate2024: 880238, // H60 (decentrate limit base)
        risorseEQ2024: 191600, // H59 (EQ base)
        incremento022Anno: 0, // Row 42 Col H is 0
      };

      const result = calculateCcnl2026Increments(ccnlInput);

      // 0.14% of 5,033,777 = 7,047.2878
      expect(result.incrementoStabile014).toBeCloseTo(7047.2878);
      expect(result.arretrati014).toBeCloseTo(14094.5756); // 2 annualities
      
      // Riparto proporzionale for 0.22% (base is 880238 + 191600 = 1071838)
      expect(result.baseRiparto2024).toBe(1071838);
      expect(result.quotaFondo).toBeCloseTo(880238 / 1071838);
      expect(result.quotaEQ).toBeCloseTo(191600 / 1071838);
    });

    it('3. Conglobamento Art. 60 - guided mode with headcount values', () => {
      const art60Input = {
        mode: 'guided' as const,
        personaleInteroArea: {
          FUNZIONARIO_EQ: 40,
          ISTRUTTORE: 60,
          OPERATORE_ESPERTO: 80,
          OPERATORE: 10,
        },
      };

      const result = calculateConglobamentoArt60(art60Input);

      // 40*127.44 + 60*112.80 + 80*96.72 + 10*79.56 = 20398.80
      expect(result.riduzioneTotale).toBeCloseTo(20398.80);
      expect(result.ftePerArea.FUNZIONARIO_EQ).toBe(40);
      expect(result.ftePerArea.ISTRUTTORE).toBe(60);
      expect(result.ftePerArea.OPERATORE_ESPERTO).toBe(80);
      expect(result.ftePerArea.OPERATORE).toBe(10);
    });

    it('4. DL 25/2025 (Art. 14, comma 1-bis) - Limit Maximum vs Spreadsheet Applied Values', () => {
      const dl25Input = {
        entityType: 'COMUNE' as const,
        stipendiTabellari2023NonDirigenti: 5923776, // from Tab12 + Tab13 sum (Row 64 Col I + Col K)
        fondoStabile2025Certificato: 1011308.54, // Row 25 Col G
        budgetEq2025: 191600, // Row 22 Col G
        altreRisorse2025DaSottrarre: 0,
        isPrimaFasciaDl34: true,
        isEquilibrioPluriennaleAsseverato: true,
      };

      const result = calculateDl25Increment(dl25Input);

      // Soglia 48% of 5,923,776 = 2,843,412.48
      expect(result.soglia48).toBeCloseTo(2843412.48);
      // Risorse 2025 = 1,011,308.54 + 191,600 = 1,202,908.54
      expect(result.risorse2025DaSottrarre).toBeCloseTo(1202908.54);
      // Limite = 2,843,412.48 - 1,202,908.54 = 1,640,503.94
      expect(result.limiteMassimoDL25).toBeCloseTo(1640503.94);
    });

    it('5. Full Simulation and Mapping checks (Identifying Discrepancies)', () => {
      const conglobamentoResult = calculateConglobamentoArt60({
        mode: 'guided',
        personaleInteroArea: {
          FUNZIONARIO_EQ: 40,
          ISTRUTTORE: 60,
          OPERATORE_ESPERTO: 80,
          OPERATORE: 10,
        },
      });

      const ccnl2026Result = calculateCcnl2026Increments({
        monteSalari2021: 5033777,
        annoRiferimento: 2026,
        fondoRisorseDecentrate2024: 880238,
        risorseEQ2024: 191600,
        incremento022Anno: 0,
      });

      const draft: Wizard2026DraftState = {
        ...initialWizard2026DraftState,
        ente: {
          entityType: 'COMUNE',
          annoRiferimento: 2026,
          hasDirigenza: false,
        },
        art23: {
          limite2016CertificatoEnte: 880238,
          fondoPersonaleDipendente2016: 868238,
          fondoEqPo2016: 191600,
          fondoStraordinario2016: 0,
          altreVoci2016Soggette: 12000,
          fondoDipendenti2018Soggetto: 892541,
          risorsePoEq2018Soggette: 191600,
          personaleServizio31122018: 190,
          personalePrevisto2026Piao: 190,
          fondoCertificatoParteStabile2018: 892541,
          checks: [],
        },
        dl25: {
          stipendiTabellari2023NonDirigenti: 5923776,
          fondoStabile2025Certificato: 1011308.54,
          budgetEq2025: 191600,
          altreRisorse2025DaSottrarre: 0,
          incrementoApplicato: 846765.93, // Spreadsheet Row 20 Col H
          result: {
            soglia48: 2843412.48,
            risorse2025DaSottrarre: 1202908.54,
            limiteMassimoDL25: 1640503.94,
            isApplicabileDirettamente: true,
            isCalcolabile: true,
            applicabilityStatus: 'DIRECTLY_APPLICABLE',
          },
          checks: [],
        },
        ccnl2026: {
          monteSalari2021: 5033777,
          fondoRisorseDecentrate2024: 880238,
          risorseEQ2024: 191600,
          incremento022Anno: 0,
          result: ccnl2026Result,
          checks: [],
        },
        conglobamentoArt60: {
          mode: 'guided',
          personaleInteroArea: {
            FUNZIONARIO_EQ: 40,
            ISTRUTTORE: 60,
            OPERATORE_ESPERTO: 80,
            OPERATORE: 10,
          },
          ftePerArea: {
            FUNZIONARIO_EQ: 40,
            ISTRUTTORE: 60,
            OPERATORE_ESPERTO: 80,
            OPERATORE: 10,
          },
          partTimeNativi: [],
          result: conglobamentoResult,
          checks: [],
        },
        straordinario: {
          economieStraordinarioCertificate: 66225, // Row 38 Col H
          result: {
            fondoStraordinarioOrdinarioResiduo: 0,
            totaleStraordinarioEsclusoArt23: 0,
            straordinarioOrdinarioFinaleSoggettoArt23: 0,
            incrementoParteStabileDaRiduzioneStraordinario: 0,
            economieDaTrasferireVariabileUnaTantum: 66225,
            straordinarioOrdinarioSoggettoArt23: 0,
          } as any,
          checks: [],
        },
        pnrr: {
          soggettoAttuatorePnrr: false,
          checks: [],
        },
        riepilogo: {
          totaleErrori: 0,
          totaleWarning: 0,
          totaleInfo: 0,
          readyForPreview: true,
          readyForFutureTransfer: true,
        },
      };

      const fundData = createMockFundData();
      const simulated = simulateWizard2026Transfer(draft, fundData);

      // Verify the transferred values on FundData
      expect(simulated.fondoAccessorioDipendenteData?.st_art60c2_CCNL2026_decurtazioneIndennitaComparto).toBeCloseTo(20398.80);
      expect(simulated.fondoAccessorioDipendenteData?.vn_art15c1m_art67c3e_risparmiStraordinario).toBe(66225);
      expect(simulated.fondoAccessorioDipendenteData?.st_incrementoDL25_2025).toBe(846765.93);
      expect(simulated.fondoAccessorioDipendenteData?.vn_art58_CCNL2026_arretrati2024_2025).toBeCloseTo(14094.58);

      // Discrepancy 1: Full vs Split 0.14% increment
      // The app transfers the full 0.14% (7047.29) stably into st_art58c1_CCNL2026_incremento014_MS2021
      expect(simulated.fondoAccessorioDipendenteData?.st_art58c1_CCNL2026_incremento014_MS2021).toBeCloseTo(7047.29);
      // However, the spreadsheet net stabile addition is 5787.53 because the EQ portion (1259.76) is subtracted in H23.
      // The app does NOT transfer this EQ reduction automatically during transfer preview.
      
      // Discrepancy 2: EQ reduction for DL 25/2025 (134,873.39) is NOT automatically subtracted from Comparto during transfer.
      // In the spreadsheet, the total DL 25 increment of 981,639.32 is split, and EQ reduction of 134,873.39 is subtracted in Row 24.
      // In the app, only the net comparto increment is input as incrementoApplicato (846,765.93) to st_incrementoDL25_2025.
    });

  });

  describe('Case B: Comune with Dirigenza (Synthetic Case)', () => {
    
    it('1. Limite Art. 23 - Verification including Dirigenza 2016 Base', () => {
      const art23Input = {
        limite2016CertificatoEnte: 1030238, // 880238 + 150000 dirigenza
        fondoPersonaleDipendente2016: 868238,
        fondoEqPo2016: 191600,
        fondoDirigenza2016: 150000, // added dirigenza
        fondoStraordinario2016: 0,
        altreVoci2016Soggette: 12000,
        fondoDipendenti2018Soggetto: 892541,
        risorsePoEq2018Soggette: 191600,
        personaleServizio31122018: 190,
        personalePrevisto2026Piao: 190,
        hasDirigenza: true, // true
        fondoCertificatoParteStabile2018: 892541,
      };

      const result = calculateArt23Limit(art23Input);

      // Reconstructed 2016: 868238 + 191600 + 150000 + 12000 = 1221838
      expect(result.totaleVoci2016Ricostruite).toBe(1221838);
      // Certificato limit is used
      expect(result.limite2016Base).toBe(1030238);
      expect(result.limiteArt23Attualizzato).toBe(1030238);
    });

  });

});
