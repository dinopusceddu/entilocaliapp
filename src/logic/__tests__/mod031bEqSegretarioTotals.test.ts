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
        ris_fondoPO2017: 0,
        ...fondi?.eq
      },
      segretario: {
        fin_percentualeCoperturaPostoSegretario: 100,
        ...fondi?.segretario
      },
      dirigenza: {
        lim_totaleParzialeRisorseConfrontoTetto2016: 0,
        ...fondi?.dirigenza
      }
    },
    annualData: {
      annoRiferimento: 2026,
      tipologiaEnte: TipologiaEnte.COMUNE,
      numeroAbitanti: 15000,
      hasDirigenza: false,
      fondoLavoroStraordinario: 0,
      incrementoFondoStraordinario: 0,
      ...annualData
    },
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoElevateQualificazioni2016: 20000,
      risorseSegretarioComunale2016: 10000,
      fondoDirigenza2016: 0,
      fondoStraordinario2016: 0,
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

describe('MOD-031B - EQ and Segretario UI/Motor Alignment Tests', () => {
  
  // Test EQ 1 — maggiorazione interim
  it('Test EQ 1 — maggiorazione interim', () => {
    const input = createMockInput({
      fondi: {
        eq: {
          ris_fondoPO2017: 20000,
          va_art16c5_CCNL2026_maggiorazioneInterim: 3000
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    
    // Totale disponibile EQ = 23000 (20k base + 3k interim)
    expect(result.fondi.eq?.summary.totaleFondo).toBe(23000);
    // Quota rilevante Art. 23 = 20000 (interim escluso)
    expect(result.compliance.art23Compliance?.art23Componenti?.eq).toBe(20000);
  });

  // Test EQ 2 — maggiorazione sedi lavoro
  it('Test EQ 2 — maggiorazione sedi lavoro', () => {
    const input = createMockInput({
      fondi: {
        eq: {
          ris_fondoPO2017: 20000,
          va_art18c5_CCNL2026_maggiorazioneSediLavoro: 2000
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    
    // Totale disponibile EQ = 22000 (20k base + 2k sedi)
    expect(result.fondi.eq?.summary.totaleFondo).toBe(22000);
    // Quota rilevante Art. 23 = 20000 (maggiorazione sedi escluso)
    expect(result.compliance.art23Compliance?.art23Componenti?.eq).toBe(20000);
  });

  // Test EQ 3 — armonizzazione D.L. 25/2025
  it('Test EQ 3 — armonizzazione D.L. 25/2025', () => {
    const input = createMockInput({
      fondi: {
        eq: {
          ris_fondoPO2017: 20000,
          va_dl25_2025_armonizzazione: 5000
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    
    // Totale disponibile EQ = 25000
    expect(result.fondi.eq?.summary.totaleFondo).toBe(25000);
    // Quota rilevante Art. 23 = 20000 (armonizzazione D.L. 25/2025 esclusa ex MOD-031A)
    expect(result.compliance.art23Compliance?.art23Componenti?.eq).toBe(20000);
  });

  // Test Segretario 1 — voci CCNL 2026 nel totale disponibile
  it('Test Segretario 1 — voci CCNL 2026 nel totale disponibile', () => {
    const input = createMockInput({
      fondi: {
        segretario: {
          fin_percentualeCoperturaPostoSegretario: 100,
          st_art3c6_CCNL2011_retribuzionePosizione: 10000, // ordinaria
          va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021: 1000, // esclusa
          va_art40c2_CCNL2026_incremento022MS2021_L207: 500, // esclusa
          va_art21c1m_CCNL2026_incentiviFunzioniTecniche: 800 // esclusa
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    
    // Totale disponibile = 12300 (10000 + 1000 + 500 + 800)
    expect(result.fondi.segretario?.summary.totaleFondo).toBe(12300);
    // Quota rilevante Art. 23 = 10000 (solo retribuzione di posizione ord.)
    expect(result.compliance.art23Compliance?.art23Componenti?.segretario).toBe(10000);
  });

  // Test Segretario 2 — percentuale copertura 50%
  it('Test Segretario 2 — percentuale copertura 50%', () => {
    const input = createMockInput({
      fondi: {
        segretario: {
          fin_percentualeCoperturaPostoSegretario: 50, // 50%
          st_art3c6_CCNL2011_retribuzionePosizione: 10000,
          va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021: 1000,
          va_art40c2_CCNL2026_incremento022MS2021_L207: 500,
          va_art21c1m_CCNL2026_incentiviFunzioniTecniche: 800
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    
    // Totale disponibile = 12300 * 50% = 6150
    expect(result.fondi.segretario?.summary.totaleFondo).toBe(6150);
    // Quota rilevante Art. 23 = 10000 * 50% = 5000
    expect(result.compliance.art23Compliance?.art23Componenti?.segretario).toBe(5000);
    expect(result.compliance.art23Compliance?.art23Componenti?.segretarioQuotaOrdinaria).toBe(5000);
  });

  // Test Segretario 3 — deroga D.L. 19/2026 non alterata
  it('Test Segretario 3 — deroga D.L. 19/2026 non alterata', () => {
    const input = createMockInput({
      annualData: {
        numeroAbitanti: 2500,
        tipologiaEnte: TipologiaEnte.COMUNE
      },
      fondi: {
        segretario: {
          segretarioDerogaMode: 'dl19_2026_solo_corrente',
          fin_percentualeCoperturaPostoSegretario: 100,
          st_art3c6_CCNL2011_retribuzionePosizione: 10000, // ordinaria (esclusa ex DL 19)
          va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021: 1000, // esclusa ord.
          va_art40c2_CCNL2026_incremento022MS2021_L207: 500, // esclusa ord.
          va_art21c1m_CCNL2026_incentiviFunzioniTecniche: 800 // esclusa ord.
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    const comp = result.compliance.art23Compliance;
    
    // La quota esclusa D.L. 19/2026 deve riguardare solo la posizione ordinaria (10.000)
    expect(comp?.art23Componenti?.segretarioQuotaEsclusaDL19_2026).toBe(10000);
    // La quota soggetta finale del Segretario deve essere 0 (poiché i 10.000 sono interamente esclusi da D.L. 19/2026)
    expect(comp?.art23Componenti?.segretario).toBe(0);
    // Totale disponibile è comunque 12300
    expect(result.fondi.segretario?.summary.totaleFondo).toBe(12300);
  });

  // Condizione 5: Test EQ sole voci aggiunte valorizzate
  it('Condizione 5: Test EQ sole voci aggiunte valorizzate', () => {
    const input = createMockInput({
      fondi: {
        eq: {
          ris_fondoPO2017: 0,
          va_art18c5_CCNL2026_maggiorazioneSediLavoro: 2000,
          va_art16c5_CCNL2026_maggiorazioneInterim: 3000,
          va_dl25_2025_armonizzazione: 5000
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    
    // Totale disponibile aumenta = 10000 (2000 + 3000 + 5000)
    expect(result.fondi.eq?.summary.totaleFondo).toBe(10000);
    // art23Componenti.eq NON deve aumentare (deve restare 0)
    expect(result.compliance.art23Compliance?.art23Componenti?.eq).toBe(0);
  });

  // Condizione 6: Test Segretario sole voci aggiunte valorizzate
  it('Condizione 6: Test Segretario sole voci aggiunte valorizzate', () => {
    const input = createMockInput({
      fondi: {
        segretario: {
          fin_percentualeCoperturaPostoSegretario: 100,
          st_art3c6_CCNL2011_retribuzionePosizione: 0,
          va_art40c1_CCNL25_2025: 0,
          va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021: 1000,
          va_art40c1_CCNL2026_incremento080MS2021: 2000,
          va_art40c2_CCNL2026_incremento022MS2021_L207: 1500,
          va_art21c1m_CCNL2026_incentiviFunzioniTecniche: 500
        }
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    
    // Totale disponibile aumenta = 5000 (1000 + 2000 + 1500 + 500)
    expect(result.fondi.segretario?.summary.totaleFondo).toBe(5000);
    // art23Componenti.segretario NON deve aumentare (deve restare 0)
    expect(result.compliance.art23Compliance?.art23Componenti?.segretario).toBe(0);
  });

  // Test Regressione Art. 23 complessivo
  it('Test Regressione Art. 23 complessivo', () => {
    const input = createMockInput({
      fondi: {
        dipendente: {
          cl_totaleParzialeRisorsePerConfrontoTetto2016: 105000 // 100.000 Comparto + 5000 Straordinario
        },
        eq: {
          ris_fondoPO2017: 20000
        },
        segretario: {
          st_art3c6_CCNL2011_retribuzionePosizione: 10000
        },
        dirigenza: {
          lim_totaleParzialeRisorseConfrontoTetto2016: 40000
        }
      },
      annualData: {
        hasDirigenza: true,
        fondoLavoroStraordinario: 5000
      },
      historicalData: {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: 90000, // 90.000 Comparto
        fondoElevateQualificazioni2016: 20000,
        risorseSegretarioComunale2016: 10000,
        fondoDirigenza2016: 40000,
        fondoStraordinario2016: 0 // limite storico = 90k + 20k + 10k + 40k = 160.000
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    const comp = result.compliance.art23Compliance;
    
    // Comparto = 100.000 (105k - 5k straordinario)
    expect(comp?.art23Componenti?.comparto).toBe(100000);
    // EQ = 20.000
    expect(comp?.art23Componenti?.eq).toBe(20000);
    // Segretario = 10.000
    expect(comp?.art23Componenti?.segretario).toBe(10000);
    // Dirigenza = 40.000
    expect(comp?.art23Componenti?.dirigenza).toBe(40000);
    // Straordinario = 5.000
    expect(comp?.art23Componenti?.straordinario).toBe(5000);
    // Limite = 160.000
    expect(comp?.limiteArt23Attualizzato).toBe(160000);
    // Ammontare Corrente = 175.000
    expect(comp?.risorseRilevantiArt23).toBe(175000);
    // Margine / Superamento = 15.000
    expect(comp?.margineResiduo).toBe(-15000); // delta = risorse - limite = 15000, margineResiduo = -delta = -15000
    expect(comp?.isSforamento).toBe(true);
  });
});
