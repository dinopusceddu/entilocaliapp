import { describe, it, expect } from 'vitest';
import { calculateAllReductions } from './reductionCalculations';
import { NormalizedInput } from '../../domain';

const createMockInput = (fad: any = {}, eq: any = {}, dir: any = {}): NormalizedInput => ({
  fondi: {
    dipendente: fad,
    eq: eq,
    segretario: {},
    dirigenza: dir
  },
  annualData: {
    annoRiferimento: 2025
  },
  historicalData: {},
  distribuzione: {},
  personaleDettaglio: [],
  calculatedInputs: {}
} as any);

describe('reductionCalculations', () => {
  it('should calculate zero reductions for empty input', () => {
    const input = createMockInput();
    const result = calculateAllReductions(input);

    expect(result.totalFadReductions).toBe(0);
    expect(result.totalEqReductions).toBe(0);
    expect(result.totalDirigenzaReductions).toBe(0);
  });

  it('should correctly sum FAD reductions', () => {
    const input = createMockInput({
      st_taglioFondoDL78_2010: 1000,
      st_art67c1_decurtazionePO_AP_EntiDirigenza: 500,
      st_riduzionePerIncrementoEQ: 200,
      fin_art4_dl16_misureMancatoRispettoVincoli: 300
    });

    const result = calculateAllReductions(input);

    expect(result.details.fad.taglioDL78_2010).toBe(1000);
    expect(result.details.fad.decurtazionePO_AP).toBe(500);
    expect(result.details.fad.riduzionePerIncrementoEQ).toBe(200);
    expect(result.details.fad.misureMancatoRispettoVincoli).toBe(300);
    expect(result.totalFadReductions).toBe(2000);
  });

  it('should handle negative inputs by taking absolute value', () => {
    const input = createMockInput({
      st_taglioFondoDL78_2010: -1000
    });

    const result = calculateAllReductions(input);

    expect(result.details.fad.taglioDL78_2010).toBe(1000);
    expect(result.totalFadReductions).toBe(1000);
  });

  it('should calculate EQ and Dirigenza reductions', () => {
    const input = createMockInput({},
      { fin_art23c2_adeguamentoTetto2016: 400 },
      { lim_art4_DL16_2014_misureMancatoRispettoVincoli: 600 }
    );

    const result = calculateAllReductions(input);

    expect(result.totalEqReductions).toBe(400);
    expect(result.totalDirigenzaReductions).toBe(600);
  });

  it('should include ATA/PO and Fondo Straordinario reductions', () => {
    const input = createMockInput({
      st_riduzioniPersonaleATA_PO_Esternalizzazioni: 150,
      st_riduzioneFondoStraordinario: 250
    });

    const result = calculateAllReductions(input);

    expect(result.details.fad.riduzioniPersonaleATA_PO_Esternalizzazioni).toBe(150);
    expect(result.details.fad.riduzioneFondoStraordinario).toBe(250);
    expect(result.totalFadReductions).toBe(400);
  });

  it('should include Art. 23 c. 2 FAD reduction', () => {
    const input = createMockInput({
      cl_art23c2_decurtazioneIncrementoAnnualeTetto2016: 123.45
    });

    const result = calculateAllReductions(input);

    expect(result.details.fad.decurtazioneLimiteArt23).toBe(123.45);
    expect(result.totalFadReductions).toBe(123.45);
  });
});
