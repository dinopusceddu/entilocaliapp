import { describe, it, expect } from 'vitest';
import { buildDetermina } from '../determinaTemplate';
import { FundData, CalculationResult, User } from '../../domain';
import { TipologiaEnte } from '../../enums';

describe('determinaTemplate - Art. 79 c.1 lett. c terminology', () => {
  const mockUser: User = {
    id: 'user-1',
    name: 'Mario Rossi',
    role: 'Responsabile',
  } as unknown as User;

  const createMockFundData = (art79c1cValue: number): FundData => ({
    annualData: {
      annoRiferimento: 2026,
      denominazioneEnte: 'Comune di Test',
      tipologiaEnte: TipologiaEnte.COMUNE,
      manualDipendentiEquivalenti2018: 10,
      ccnl2024: {
        monteSalari2021: 500000,
      },
    } as any,
    historicalData: {
      personaleServizio2018: 10,
    } as any,
    fondoAccessorioDipendenteData: {
      st_art79c1_art67c1_unicoImporto2017: 50000,
      st_art79c1c_incrementoStabileConsistenzaPers: art79c1cValue,
    } as any,
    fondoElevateQualificazioniData: {} as any,
    fondoSegretarioComunaleData: {} as any,
    fondoDirigenzaData: {} as any,
    distribuzioneRisorseData: {} as any,
    personaleServizio: {} as any,
  });

  const mockCalculationResult: CalculationResult = {
    fondi: {
      dipendente: {
        summary: {
          totaleFondo: 100000,
          totaleStabili: 51234.56,
          totaleVariabili: 48765.44,
          limite2016: 95000,
          rispettoLimite: true,
        },
      },
    },
    compliance: {
      art23c2: {
        limite: 95000,
        risorseSoggette: 51234.56,
        rispettato: true,
        differenza: 43765.44,
      },
    },
  } as unknown as CalculationResult;

  it('D1. includes the corrected contractual terminology in the narrative body', () => {
    const fundData = createMockFundData(1234.56);
    const output = buildDetermina(mockCalculationResult, fundData, mockUser);

    expect(output).toContain(
      'Incremento stabile della consistenza di personale (art. 79, comma 1, lett. c, CCNL 16/11/2022)'
    );
  });

  it('D2. includes the corrected contractual terminology in the analytic prospectus table', () => {
    const fundData = createMockFundData(1234.56);
    const output = buildDetermina(mockCalculationResult, fundData, mockUser);

    expect(output).toContain(
      'Incremento stabile della consistenza di personale (art. 79, c. 1, lett. c)'
    );
  });

  it('D3. does not contain the legacy "nuove assunzioni" phrasing for Art. 79 c.1 lett. c', () => {
    const fundData = createMockFundData(1234.56);
    const output = buildDetermina(mockCalculationResult, fundData, mockUser);

    expect(output).not.toContain(
      'Risorse per nuove assunzioni (art. 79, comma 1, lett. c, CCNL 16/11/2022)'
    );
    expect(output).not.toContain(
      'Incrementi nuove assunzioni (art. 79, c. 1, lett. c)'
    );
  });

  it('D4. displays the correct formatted amount for Art. 79 c.1 lett. c', () => {
    const fundData = createMockFundData(1234.56);
    const output = buildDetermina(mockCalculationResult, fundData, mockUser);

    // 1234.56 formatted in Italian currency notation
    expect(output).toMatch(/1\.234,56/);
  });

  it('D5. maintains correct totals (totA, totSoggette) including Art. 79 c.1 lett. c', () => {
    const fundData = createMockFundData(1234.56);
    const output = buildDetermina(mockCalculationResult, fundData, mockUser);

    // totA = 50000 + 1234.56 = 51234.56
    expect(output).toContain('Totale risorse stabili soggette al limite: Euro 51.234,56');
    expect(output).toContain('TOTALE RISORSE STABILI SOGGETTE AL LIMITE');
  });
});
