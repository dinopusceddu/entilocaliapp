import { describe, it, expect } from 'vitest';
import { calculateFundCompletely } from '../calculation/fundEngine';
import { NormalizedInput, TipologiaEnte } from '../../domain';

const createMockInput = (
  overrides: any = {}
): NormalizedInput => {
  const { fondi, annualData, historicalData, ...rest } = overrides;
  return {
    fondi: {
      dipendente: {
        cl_totaleParzialeRisorsePerConfrontoTetto2016: 100000,
        ...fondi?.dipendente
      },
      eq: {
        ris_fondoPO2017: 15000,
        ...fondi?.eq
      },
      segretario: {
        fin_percentualeCoperturaPostoSegretario: 100,
        st_art3c6_CCNL2011_retribuzionePosizione: 8000,
        st_art60c1_CCNL2024_retribuzionePosizioneClassi: 2000,
        va_art61c2_CCNL2024_retribuzioneRisultato10: 1000,
        ...fondi?.segretario
      },
      dirigenza: {
        lim_totaleParzialeRisorseConfrontoTetto2016: 30000,
        ...fondi?.dirigenza
      }
    },
    annualData: {
      annoRiferimento: 2026,
      tipologiaEnte: TipologiaEnte.COMUNE,
      numeroAbitanti: 15000,
      hasDirigenza: true,
      fondoLavoroStraordinario: 10000,
      incrementoFondoStraordinario: 0,
      ...annualData
    },
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoElevateQualificazioni2016: 15000,
      risorseSegretarioComunale2016: 11000,
      fondoDirigenza2016: 30000,
      fondoStraordinario2016: 10000,
      ...historicalData
    },
    distribuzione: {},
    personaleDettaglio: [],
    calculatedInputs: {
      isManualMode: true,
      manualProgressioni: 0,
      manualIndennita: 0,
      dipendentiEquivalentiAnnoRif: 10
    },
    ...rest
  } as any;
};

const mockNormativeData = {
  riferimenti_normativi: {}
} as any;

describe('MOD-031A - Central Art. 23 Compliance Engine Tests', () => {
  // Caso 1: Ente Ordinario (Nessuna deroga applicata, >3000 abitanti)
  it('Caso 1: Ente Ordinario (>3.000 abitanti)', () => {
    const input = createMockInput({
      annualData: {
        numeroAbitanti: 5000,
        tipologiaEnte: TipologiaEnte.COMUNE
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    const compliance = result.compliance.art23Compliance;
    expect(compliance).toBeDefined();
    
    // In regime ordinario, Segretario è incluso interamente (8000 + 2000 + 1000 = 11000)
    expect(compliance?.art23Componenti?.segretario).toBe(11000);
    expect(compliance?.art23Componenti?.segretarioQuotaEsclusaDL19_2026).toBe(0);
    expect(compliance?.limiteArt23Attualizzato).toBe(166000); // 100k + 15k + 11k + 30k + 10k
  });

  // Caso 2: Ente <= 3.000 abitanti in regime ordinario
  it('Caso 2: Ente <= 3.000 abitanti in regime ordinario', () => {
    const input = createMockInput({
      annualData: {
        numeroAbitanti: 2500,
        tipologiaEnte: TipologiaEnte.COMUNE
      },
      fondi: {
        segretario: {
          segretarioDerogaMode: 'ordinario',
          st_art3c6_CCNL2011_retribuzionePosizione: 8000,
          st_art60c1_CCNL2024_retribuzionePosizioneClassi: 2000,
          va_art61c2_CCNL2024_retribuzioneRisultato10: 1000
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    const compliance = result.compliance.art23Compliance;
    expect(compliance?.art23Componenti?.segretario).toBe(11000);
    expect(compliance?.art23Componenti?.segretarioQuotaEsclusaDL19_2026).toBe(0);
  });

  // Caso 3: Ente <= 3.000 abitanti in deroga solo corrente
  it('Caso 3: Ente <= 3.000 abitanti in deroga solo corrente', () => {
    const input = createMockInput({
      annualData: {
        numeroAbitanti: 2500,
        tipologiaEnte: TipologiaEnte.COMUNE
      },
      fondi: {
        segretario: {
          segretarioDerogaMode: 'dl19_2026_solo_corrente',
          st_art3c6_CCNL2011_retribuzionePosizione: 8000,
          st_art60c1_CCNL2024_retribuzionePosizioneClassi: 2000,
          va_art61c2_CCNL2024_retribuzioneRisultato10: 1000
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    const compliance = result.compliance.art23Compliance;
    // Spesa corrente esclusa: 8000 + 2000 + 1000 = 11000.
    // Il consumo netto del Segretario dovrebbe essere 0 (poichè le sole 3 voci inserite sono tutte escluse).
    expect(compliance?.art23Componenti?.segretario).toBe(0);
    expect(compliance?.art23Componenti?.segretarioQuotaEsclusaDL19_2026).toBe(11000);
    expect(compliance?.limiteArt23Attualizzato).toBe(166000); // Limite storico non modificato
  });

  // Caso 4: Ente <= 3.000 abitanti in deroga doppia neutralizzazione (con quota 2016)
  it('Caso 4: Ente <= 3.000 abitanti in deroga doppia neutralizzazione (con quota 2016)', () => {
    const input = createMockInput({
      annualData: {
        numeroAbitanti: 2500,
        tipologiaEnte: TipologiaEnte.COMUNE
      },
      fondi: {
        segretario: {
          segretarioDerogaMode: 'dl19_2026_doppia_neutralizzazione',
          quotaSegretario2016Neutralizzabile: 5000,
          st_art3c6_CCNL2011_retribuzionePosizione: 8000,
          st_art60c1_CCNL2024_retribuzionePosizioneClassi: 2000,
          va_art61c2_CCNL2024_retribuzioneRisultato10: 1000
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    const compliance = result.compliance.art23Compliance;
    expect(compliance?.art23Componenti?.segretario).toBe(0);
    expect(compliance?.art23Componenti?.segretarioQuotaEsclusaDL19_2026).toBe(11000);
    // Limite storico ridotto di 5000: 166000 - 5000 = 161000
    expect(compliance?.limiteArt23Attualizzato).toBe(161000);
    expect(compliance?.warnings?.length).toBe(0);
  });

  // Caso 5: Ente <= 3.000 abitanti in deroga doppia neutralizzazione (senza quota 2016)
  it('Caso 5: Ente <= 3.000 abitanti in deroga doppia neutralizzazione (senza quota 2016)', () => {
    const input = createMockInput({
      annualData: {
        numeroAbitanti: 2500,
        tipologiaEnte: TipologiaEnte.COMUNE
      },
      fondi: {
        segretario: {
          segretarioDerogaMode: 'dl19_2026_doppia_neutralizzazione',
          quotaSegretario2016Neutralizzabile: undefined, // assente
          st_art3c6_CCNL2011_retribuzionePosizione: 8000,
          st_art60c1_CCNL2024_retribuzionePosizioneClassi: 2000,
          va_art61c2_CCNL2024_retribuzioneRisultato10: 1000
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    const compliance = result.compliance.art23Compliance;
    // Fallback automatico a 'dl19_2026_solo_corrente'
    expect(compliance?.art23Componenti?.segretario).toBe(0);
    expect(compliance?.limiteArt23Attualizzato).toBe(166000); // Nessuna neutralizzazione applicata
    expect(compliance?.warnings?.some(w => w.includes("Impossibile applicare la doppia neutralizzazione"))).toBe(true);
  });

  // Caso 6: Inclusione della Dirigenza nel consumo corrente
  it('Caso 6: Inclusione della Dirigenza nel consumo corrente', () => {
    const inputWithDir = createMockInput({
      annualData: { hasDirigenza: true },
      fondi: { dirigenza: { lim_totaleParzialeRisorseConfrontoTetto2016: 35000 } }
    });
    const resultWithDir = calculateFundCompletely(inputWithDir, mockNormativeData);
    expect(resultWithDir.compliance.art23Compliance?.art23Componenti?.dirigenza).toBe(35000);

    const inputWithoutDir = createMockInput({
      annualData: { hasDirigenza: false }
    });
    const resultWithoutDir = calculateFundCompletely(inputWithoutDir, mockNormativeData);
    expect(resultWithoutDir.compliance.art23Compliance?.art23Componenti?.dirigenza).toBe(0);
  });

  // Caso 7: Mantenimento del fondo straordinario corrente senza doppio conteggio
  it('Caso 7: Mantenimento del fondo straordinario corrente senza doppio conteggio', () => {
    const input = createMockInput({
      annualData: {
        fondoLavoroStraordinario: 10000,
        incrementoFondoStraordinario: 2000 // Non deve raddoppiare se già compreso
      },
      historicalData: {
        fondoStraordinario2016: 10000
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    const compliance = result.compliance.art23Compliance;
    expect(compliance?.art23Componenti?.straordinario).toBe(12000); // 10000 + 2000
  });

  // Caso 8: Disaggregazione per componenti
  it('Caso 8: Verifica disaggregazione DTO', () => {
    const input = createMockInput();
    const result = calculateFundCompletely(input, mockNormativeData);
    const components = result.compliance.art23Compliance?.art23Componenti;
    expect(components).toBeDefined();
    expect(components?.comparto).toBe(90000); // fad_soggette_lordo (100k) - straordinario (10k) = 90k
    expect(components?.eq).toBe(15000);
    expect(components?.segretario).toBe(11000);
    expect(components?.dirigenza).toBe(30000);
    expect(components?.straordinario).toBe(10000);
  });

  // Caso 9: Percentuale di copertura Segretario
  it('Caso 9: Percentuale di copertura Segretario', () => {
    const input = createMockInput({
      fondi: {
        segretario: {
          fin_percentualeCoperturaPostoSegretario: 60, // 60%
          st_art3c6_CCNL2011_retribuzionePosizione: 10000,
          st_art60c1_CCNL2024_retribuzionePosizioneClassi: 0,
          va_art61c2_CCNL2024_retribuzioneRisultato10: 0
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    const compliance = result.compliance.art23Compliance;
    // 10000 * 60% = 6000
    expect(compliance?.art23Componenti?.segretario).toBe(6000);
    expect(compliance?.art23Componenti?.segretarioQuotaOrdinaria).toBe(6000);
  });

  // MOD-032-FIX4 specific tests
  it('MOD-032-FIX4: Verifica limite 0.22% MS 2021 con moltiplicatore x2 nel 2026', () => {
    // Anno 2026: 0.44% è consentito (sotto la soglia x2)
    const input2026 = createMockInput({
      annualData: {
        annoRiferimento: 2026,
        ccnl2024: {
          optionalIncreaseVariableFrom2026Percentage: 0.44
        }
      }
    });
    const result2026 = calculateFundCompletely(input2026, mockNormativeData);
    const errors2026 = result2026.compliance.art23Compliance?.errors || [];
    const has022Error = errors2026.some(e => e.includes('supera la soglia contrattuale massima dello 0.22%'));
    expect(has022Error).toBe(false); // Non deve dare errore per lo 0.44% nel 2026
  });

  it('MOD-032-FIX4: Verifica limite 0.22% MS 2021 con moltiplicatore x1 nel 2027', () => {
    // Anno 2027: 0.44% deve generare errore
    const input2027 = createMockInput({
      annualData: {
        annoRiferimento: 2027,
        ccnl2024: {
          optionalIncreaseVariableFrom2026Percentage: 0.44
        }
      }
    });
    const result2027 = calculateFundCompletely(input2027, mockNormativeData);
    const errors2027 = result2027.compliance.art23Compliance?.errors || [];
    const has022Error = errors2027.some(e => e.includes('supera la soglia contrattuale massima dello 0.22%'));
    expect(has022Error).toBe(true); // Deve dare errore per lo 0.44% nel 2027
  });
});
