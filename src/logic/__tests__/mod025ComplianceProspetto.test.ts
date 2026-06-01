import { describe, it, expect } from 'vitest';
import { calculateFundCompletely } from '../calculation/fundEngine';
import { NormalizedInput, TipologiaEnte } from '../../domain';

const createMockInput = (
  fad: any = {},
  annualData: any = {},
  historicalData: any = {}
): NormalizedInput => ({
  fondi: {
    dipendente: {
      cl_totaleParzialeRisorsePerConfrontoTetto2016: undefined,
      ...fad
    },
    eq: {},
    segretario: {},
    dirigenza: {}
  },
  annualData: {
    annoRiferimento: 2026,
    tipologiaEnte: TipologiaEnte.COMUNE,
    numeroAbitanti: 15000,
    hasDirigenza: false,
    ...annualData
  },
  historicalData: {
    fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
    fondoElevateQualificazioni2016: 20000,
    ...historicalData
  },
  distribuzione: {},
  personaleDettaglio: [],
  calculatedInputs: {
    isManualMode: true,
    manualProgressioni: 0,
    manualIndennita: 0,
    dipendentiEquivalentiAnnoRif: 10
  }
} as any);

const mockNormativeData = {
  riferimenti_normativi: {}
} as any;

describe('MOD-025 compliance check tests', () => {
  it('should calculate the four prospectus values correctly and verify Art. 60 is figuratively added back', () => {
    const input = createMockInput(
      {
        st_art79c1_art67c1_unicoImporto2017: 80000,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 1200
      },
      {
        ccnl2024: {
          optionalIncreaseVariableFrom2026Percentage: 0
        }
      }
    );

    const result = calculateFundCompletely(input, mockNormativeData);

    const compliance = result.compliance.art23Compliance;
    expect(compliance).toBeDefined();
    if (compliance) {
      expect(compliance.computoFigurativoArt60).toBe(1200);
      expect(compliance.risorseRilevantiArt23).toBe(80000);
    }
  });

  it('should generate an error if PNRR increment exceeds the calcolatoIncrementoPNRR3 limit', () => {
    const input = createMockInput(
      {
        vn_dl13_art8c3_incrementoPNRR_max5stabile2016: 6000
      },
      {
        calcolatoIncrementoPNRR3: 5000,
        rispettoEquilibrioBilancioPrecedente: true,
        rispettoDebitoCommercialePrecedente: true,
        approvazioneRendicontoPrecedente: true,
        incidenzaSalarioAccessorioUltimoRendiconto: 5,
        fondoStabile2016PNRR: 100000
      }
    );

    const result = calculateFundCompletely(input, mockNormativeData);
    const compliance = result.compliance.art23Compliance;
    
    expect(compliance?.errors).toBeDefined();
    expect(compliance?.errors.some(e => e.includes("PNRR") && e.includes("supera"))).toBe(true);
  });

  it('should generate an error if DL 25 increment exceeds the fase5_incrementoNettoEffettivoFondo limit', () => {
    const input = createMockInput(
      {
        st_incrementoDL25_2025: 15000
      },
      {
        simulatoreRisultati: {
          fase5_incrementoNettoEffettivoFondo: 10000
        }
      }
    );

    const result = calculateFundCompletely(input, mockNormativeData);
    const compliance = result.compliance.art23Compliance;

    expect(compliance?.errors).toBeDefined();
    expect(compliance?.errors.some(e => e.includes("D.L. 25/2025") && e.includes("supera"))).toBe(true);
  });
});

describe('MOD-027 Art. 60 Coherence Scenarios', () => {
  it('Scenario 1 — Solo valore da wizard/parametri CCNL', () => {
    const input = createMockInput(
      {
        st_art79c1_art67c1_unicoImporto2017: 90000,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0
      },
      {
        ccnl2024: {
          ivcConglobation: {
            totalReduction: 1500,
            mode: 'aggregated'
          }
        }
      }
    );

    const result = calculateFundCompletely(input, mockNormativeData);
    expect(result.totals.totaleFondo).toBe(88500); // 90000 - 1500 (riduzione reale)
    expect(result.compliance.art23Compliance?.valoreArt60Effettivo).toBe(1500);
    expect(result.compliance.art23Compliance?.valoreArt60VoceFondo).toBe(0);
    expect(result.compliance.art23Compliance?.valoreArt60Contrattuale).toBe(1500);
    expect(result.compliance.art23Compliance?.showWarningDisallineamento).toBe(false);
    expect(result.compliance.art23Compliance?.risorseRilevantiArt23).toBe(90000);
  });

  it('Scenario 2 — Solo valore manuale in Costituzione Fondo', () => {
    const input = createMockInput(
      {
        st_art79c1_art67c1_unicoImporto2017: 90000,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 1500
      },
      {}
    );

    const result = calculateFundCompletely(input, mockNormativeData);
    expect(result.totals.totaleFondo).toBe(88500); // 90000 - 1500 (riduzione reale)
    expect(result.compliance.art23Compliance?.valoreArt60Effettivo).toBe(1500);
    expect(result.compliance.art23Compliance?.valoreArt60VoceFondo).toBe(1500);
    expect(result.compliance.art23Compliance?.valoreArt60Contrattuale).toBe(0);
    expect(result.compliance.art23Compliance?.showWarningDisallineamento).toBe(false);
    expect(result.compliance.art23Compliance?.risorseRilevantiArt23).toBe(90000);
  });

  it('Scenario 3 — Valori coincidenti', () => {
    const input = createMockInput(
      {
        st_art79c1_art67c1_unicoImporto2017: 90000,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 1500
      },
      {
        ccnl2024: {
          ivcConglobation: {
            totalReduction: 1500,
            mode: 'aggregated'
          }
        }
      }
    );

    const result = calculateFundCompletely(input, mockNormativeData);
    expect(result.totals.totaleFondo).toBe(88500); // 90000 - 1500 (una sola riduzione reale)
    expect(result.compliance.art23Compliance?.valoreArt60Effettivo).toBe(1500);
    expect(result.compliance.art23Compliance?.valoreArt60VoceFondo).toBe(1500);
    expect(result.compliance.art23Compliance?.valoreArt60Contrattuale).toBe(1500);
    expect(result.compliance.art23Compliance?.showWarningDisallineamento).toBe(false);
    expect(result.compliance.art23Compliance?.risorseRilevantiArt23).toBe(90000);
  });

  it('Scenario 4 — Valori divergenti', () => {
    const input = createMockInput(
      {
        st_art79c1_art67c1_unicoImporto2017: 90000,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 1800
      },
      {
        ccnl2024: {
          ivcConglobation: {
            totalReduction: 1500,
            mode: 'aggregated'
          }
        }
      }
    );

    const result = calculateFundCompletely(input, mockNormativeData);
    expect(result.totals.totaleFondo).toBe(88200); // 90000 - 1800 (usa valore voce fondo)
    expect(result.compliance.art23Compliance?.valoreArt60Effettivo).toBe(1800);
    expect(result.compliance.art23Compliance?.valoreArt60VoceFondo).toBe(1800);
    expect(result.compliance.art23Compliance?.valoreArt60Contrattuale).toBe(1500);
    expect(result.compliance.art23Compliance?.showWarningDisallineamento).toBe(true);
    expect(result.compliance.art23Compliance?.risorseRilevantiArt23).toBe(90000);
  });
});

describe('MOD-028 allineamento straordinario e personale dipendente', () => {
  it('should use historical straordinario 2016 instead of current straordinario when calculating 2016 base', () => {
    const input = createMockInput(
      {}, // FAD
      {
        fondoLavoroStraordinario: 50000 // Corrente
      },
      {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
        fondoElevateQualificazioni2016: 20000,
        fondoDirigenza2016: 10000,
        risorseSegretarioComunale2016: 5000,
        fondoStraordinario2016: 45000 // Storico
      }
    );

    const result = calculateFundCompletely(input, mockNormativeData);
    expect(result.compliance.art23Compliance?.limiteArt23Attualizzato).toBe(180000); // 100k + 20k + 10k + 5k + 45k
    expect(result.compliance.art23Compliance?.showWarningStraordinario2016).toBe(false);
  });

  it('should trigger warning when historical straordinario 2016 is missing and falls back to current extraordinary', () => {
    const input = createMockInput(
      {},
      {
        fondoLavoroStraordinario: 50000 // Corrente (usato come fallback)
      },
      {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
        fondoElevateQualificazioni2016: 20000,
        fondoDirigenza2016: 10000,
        risorseSegretarioComunale2016: 5000,
        fondoStraordinario2016: undefined // Assente
      }
    );

    const result = calculateFundCompletely(input, mockNormativeData);
    expect(result.compliance.art23Compliance?.limiteArt23Attualizzato).toBe(185000); // 100k + 20k + 10k + 5k + 50k (fallback)
    expect(result.compliance.art23Compliance?.showWarningStraordinario2016).toBe(true);
    expect(result.compliance.art23Compliance?.warnings.some(w => w.includes("Fondo straordinario 2016 storico non inserito"))).toBe(true);
  });

  it('should prevent double counting of extraordinary fund increase when current extraordinary is already the total', () => {
    // Caso A: fondo straordinario corrente = base (50000), incremento = 5000. Deve sommare => totale = 55000
    const inputA = createMockInput(
      {},
      {
        fondoLavoroStraordinario: 50000,
        incrementoFondoStraordinario: 5000
      },
      {
        fondoStraordinario2016: 50000
      }
    );
    const resultA = calculateFundCompletely(inputA, mockNormativeData);
    // Le risorse soggette includono lo straordinario totale (55000)
    // valoreSoggetto = stabili + variabili + straordinario = 0 + 0 + 55000
    expect(resultA.compliance.art23Compliance?.risorseRilevantiArt23).toBe(55000);

    // Caso B: fondo straordinario corrente = totale (55000), incremento = 5000. Non deve sommare => totale = 55000 (evitato doppio conteggio)
    const inputB = createMockInput(
      {},
      {
        fondoLavoroStraordinario: 55000,
        incrementoFondoStraordinario: 5000
      },
      {
        fondoStraordinario2016: 50000
      }
    );
    const resultB = calculateFundCompletely(inputB, mockNormativeData);
    expect(resultB.compliance.art23Compliance?.risorseRilevantiArt23).toBe(55000);
  });

  it('should compute st_art79c1c_incrementoStabileConsistenzaPers as subject resource inside Art 23 limit', () => {
    const input = createMockInput(
      {
        st_art79c1c_incrementoStabileConsistenzaPers: 8000
      },
      {},
      {
        fondoStraordinario2016: 50000
      }
    );

    const result = calculateFundCompletely(input, mockNormativeData);
    // Deve essere considerata tra le risorse rilevanti al limite dell'Art 23 (valoreSoggetto o risorseRilevantiArt23)
    // stabili soggette = 8000. variabili soggette = 0. straordinario = 0. totale = 8000.
    expect(result.compliance.art23Compliance?.risorseRilevantiArt23).toBe(8000);
    // E NON deve essere conteggiata come risorsa esclusa
    expect(result.compliance.art23Compliance?.risorseEscluseArt23).toBe(0);
  });

  it('should verify regression of Art 60, 0.14%, 0.22%, DL 25 and PNRR logic', () => {
    const input = createMockInput(
      {
        // Storica stabile (non rilevante per il limite Art 23 corrente)
        st_art79c1_art67c1_unicoImporto2017: 60000,
        
        // Risorsa stabile soggetta (consuma il limite)
        st_art79c1c_incrementoStabileConsistenzaPers: 8000,
        
        // Escluse dal limite stabili (in deroga)
        st_art79c1b_euro8450: 1500,
        st_incrementoDL25_2025: 3000,
        
        // Escluse dal limite variabili
        vn_art58c2_incremento_max022_ms2021: 2200,
        vn_art58_CCNL2026_arretrati2024_2025: 3000,
        vn_dl13_art8c3_incrementoPNRR_max5stabile2016: 4000,
        
        // Decurtazione Art 60 (reale ma figurativamente riaggiunta)
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 1000
      },
      {
        fondoLavoroStraordinario: 50000,
        simulatoreRisultati: {
          fase5_incrementoNettoEffettivoFondo: 10000
        }
      },
      {
        fondoStraordinario2016: 50000
      }
    );

    const result = calculateFundCompletely(input, mockNormativeData);
    
    // Le stabili escluse sono: 1500 (euro 8450) + 3000 (DL25) = 4500
    // Le variabili escluse sono: 2200 (0.22%) + 3000 (arretrati) + 4000 (PNRR) = 9200
    // Risorse escluse totali = 4500 + 9200 = 13700
    expect(result.compliance.art23Compliance?.risorseEscluseArt23).toBe(13700);

    // Fondo Costituito Totale = stabili (60000 + 8000 + 1500 + 3000 - 1000) + variabili (2200 + 3000 + 4000) = 71500 + 9200 = 80700
    expect(result.compliance.art23Compliance?.fondoCostituitoTotale).toBe(80700);

    // Risorse stabili soggette = 8000 (incremento consistenza)
    // Risorse variabili soggette = 0
    // Straordinario corrente = 50000
    // Detrazione reale Art 60 = -1000 => ammontareSoggettoLimite2016 = 120000
    // Reintegro figurativo Art 60 = +1000 => risorseRilevantiArt23Effettive = 121000
    expect(result.compliance.art23Compliance?.risorseRilevantiArt23).toBe(121000);
  });
});

describe('MOD-032-FIX1: Verifica limitazione 0,22% MS 2021 e Ripartizione Fondo/EQ', () => {
  it('Anno 2026: limite massimo operativo = MS2021 * 0.22% * 2. Con MS=230k, limite=1012. Con 1012 e conforme, con 1013 superato.', () => {
    const inputConforme = createMockInput(
      {
        vn_art58c2_CCNL2026_incremento022_MS2021: 800
      },
      {
        annoRiferimento: 2026,
        ccnl2024: {
          monteSalari2021: 230000
        }
      }
    );
    // Assegna la quota EQ nella struttura del fondo
    inputConforme.fondi.eq = {
      va_incremento022_ms2021_eq: 212
    } as any;

    const resultConf = calculateFundCompletely(inputConforme, mockNormativeData);
    const checkConf = resultConf.compliance.checks.find(c => c.id === 'limite_022_ms2021_complessivo' || c.id === 'incremento_022_complessivo');
    expect(checkConf).toBeDefined();
    expect(checkConf?.isCompliant).toBe(true);
    expect(checkConf?.messaggio).toContain("conforme");

    const inputNonConforme = createMockInput(
      {
        vn_art58c2_CCNL2026_incremento022_MS2021: 800
      },
      {
        annoRiferimento: 2026,
        ccnl2024: {
          monteSalari2021: 230000
        }
      }
    );
    inputNonConforme.fondi.eq = {
      va_incremento022_ms2021_eq: 213
    } as any;

    const resultNonConf = calculateFundCompletely(inputNonConforme, mockNormativeData);
    const checkNonConf = resultNonConf.compliance.checks.find(c => c.id === 'limite_022_ms2021_complessivo' || c.id === 'incremento_022_complessivo');
    expect(checkNonConf?.isCompliant).toBe(false);
    expect(checkNonConf?.messaggio).toContain("superato");
  });

  it('Anno 2027: limite massimo operativo = MS2021 * 0.22% * 1. Con MS=230k, limite=506. Con 506 e conforme, con 507 superato.', () => {
    const inputConforme = createMockInput(
      {
        vn_art58c2_CCNL2026_incremento022_MS2021: 400
      },
      {
        annoRiferimento: 2027,
        ccnl2024: {
          monteSalari2021: 230000
        }
      }
    );
    inputConforme.fondi.eq = {
      va_incremento022_ms2021_eq: 106
    } as any;

    const resultConf = calculateFundCompletely(inputConforme, mockNormativeData);
    const checkConf = resultConf.compliance.checks.find(c => c.id === 'limite_022_ms2021_complessivo' || c.id === 'incremento_022_complessivo');
    expect(checkConf?.isCompliant).toBe(true);

    const inputNonConforme = createMockInput(
      {
        vn_art58c2_CCNL2026_incremento022_MS2021: 400
      },
      {
        annoRiferimento: 2027,
        ccnl2024: {
          monteSalari2021: 230000
        }
      }
    );
    inputNonConforme.fondi.eq = {
      va_incremento022_ms2021_eq: 107
    } as any;

    const resultNonConf = calculateFundCompletely(inputNonConforme, mockNormativeData);
    const checkNonConf = resultNonConf.compliance.checks.find(c => c.id === 'limite_022_ms2021_complessivo' || c.id === 'incremento_022_complessivo');
    expect(checkNonConf?.isCompliant).toBe(false);
  });
});

