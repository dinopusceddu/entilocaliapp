import { describe, it, expect } from 'vitest';
import { calculateFundCompletely } from '../fundEngine';
import { 
  NormalizedInput, 
  TipologiaEnte, 
  NormativeData 
} from '../../../domain';

const mockNormativeData: NormativeData = {
  riferimenti_normativi: {
    art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017',
  }
} as unknown as NormativeData;

const createBaseFundInput = (overrides: any = {}): NormalizedInput => {
  const { fondi, annualData, historicalData, calculatedInputs, ...rest } = overrides;
  return {
    fondi: {
      dipendente: {
        cl_totaleParzialeRisorsePerConfrontoTetto2016: 100000,
        ...fondi?.dipendente,
      },
      eq: {
        ris_fondoPO2017: 10000,
        ...fondi?.eq,
      },
      segretario: {
        fin_percentualeCoperturaPostoSegretario: 100,
        ...fondi?.segretario,
      },
      dirigenza: {
        lim_totaleParzialeRisorseConfrontoTetto2016: 20000,
        ...fondi?.dirigenza,
      },
    },
    annualData: {
      annoRiferimento: 2026,
      tipologiaEnte: TipologiaEnte.COMUNE,
      numeroAbitanti: 10000,
      hasDirigenza: false,
      fondoLavoroStraordinario: 5000,
      incrementoFondoStraordinario: 0,
      personale2018PerArt23: [{ id: 'emp2018', partTimePercentage: 100 }],
      personaleAnnoRifPerArt23: [{ id: 'emp2026', partTimePercentage: 100, cedoliniEmessi: 12 }],
      ...annualData,
    },
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoElevateQualificazioni2016: 10000,
      risorseSegretarioComunale2016: 0,
      fondoDirigenza2016: 0,
      fondoStraordinario2016: 5000,
      fondoPersonaleNonDirEQ2018_Art23: 100000,
      ...historicalData,
    },
    distribuzione: {},
    personaleDettaglio: [],
    calculatedInputs: {
      isManualMode: false,
      manualProgressioni: 0,
      manualIndennita: 0,
      dipendentiEquivalentiAnnoRif: 1,
      isArt23FteManualMode: false,
      ...calculatedInputs,
    },
    ...rest,
  };
};

describe('fundEngine — Art. 23 FTE Safety Gate', () => {
  it('1. COMUNE analytic PT0 -> lancia eccezione con messaggio chiaro', () => {
    const input = createBaseFundInput({
      annualData: {
        personale2018PerArt23: [{ id: 'e1', partTimePercentage: 0 }],
      }
    });

    expect(() => calculateFundCompletely(input, mockNormativeData)).toThrowError(
      "Calcolo bloccato: i dati FTE Art. 23 contengono valori non validi di part-time o cedolini."
    );
  });

  it('2. COMUNE analytic ced0 -> lancia eccezione con messaggio chiaro', () => {
    const input = createBaseFundInput({
      annualData: {
        personaleAnnoRifPerArt23: [{ id: 'e1', partTimePercentage: 100, cedoliniEmessi: 0 }],
      }
    });

    expect(() => calculateFundCompletely(input, mockNormativeData)).toThrowError(
      "Calcolo bloccato: i dati FTE Art. 23 contengono valori non validi di part-time o cedolini."
    );
  });

  it('3. UNIONE_COMUNI SKIP + analytic ced0 -> lancia comunque eccezione (data integrity non bypassata)', () => {
    const input = createBaseFundInput({
      annualData: {
        tipologiaEnte: TipologiaEnte.UNIONE_COMUNI,
        personaleAnnoRifPerArt23: [{ id: 'e1', partTimePercentage: 100, cedoliniEmessi: 0 }],
      }
    });

    expect(() => calculateFundCompletely(input, mockNormativeData)).toThrowError(
      "Calcolo bloccato: i dati FTE Art. 23 contengono valori non validi di part-time o cedolini."
    );
  });

  it('4. manual mode con manual FTE validi e stale analytic invalid -> NON lancia eccezione', () => {
    const input = createBaseFundInput({
      annualData: {
        isArt23FteManualMode: true,
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalentiAnnoRif: 12,
        personale2018PerArt23: [{ id: 'e1', partTimePercentage: 0 }],
        personaleAnnoRifPerArt23: [{ id: 'e2', partTimePercentage: 0, cedoliniEmessi: 0 }],
      },
      calculatedInputs: {
        isArt23FteManualMode: true,
        manualDipendentiEquivalentiAnnoRif: 12,
        dipendentiEquivalentiAnnoRif: 12,
      }
    });

    expect(() => calculateFundCompletely(input, mockNormativeData)).not.toThrow();
  });

  it('5. manual mode senza current manual, analytic ced0 -> lancia eccezione', () => {
    const input = createBaseFundInput({
      annualData: {
        isArt23FteManualMode: true,
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalentiAnnoRif: undefined,
        personaleAnnoRifPerArt23: [{ id: 'e1', partTimePercentage: 100, cedoliniEmessi: 0 }],
      },
      calculatedInputs: {
        isArt23FteManualMode: true,
        manualDipendentiEquivalentiAnnoRif: undefined,
      }
    });

    expect(() => calculateFundCompletely(input, mockNormativeData)).toThrowError(
      "Calcolo bloccato: i dati FTE Art. 23 contengono valori non validi di part-time o cedolini."
    );
  });

  it('6. input valido PT50 / ced6 -> nessun throw e calcolo corretto', () => {
    const input = createBaseFundInput({
      annualData: {
        personale2018PerArt23: [{ id: 'e1', partTimePercentage: 10 }], // 0.10 FTE
        personaleAnnoRifPerArt23: [{ id: 'e2', partTimePercentage: 50, cedoliniEmessi: 6 }], // 0.25 FTE
      },
      calculatedInputs: {
        isArt23FteManualMode: false,
        dipendentiEquivalentiAnnoRif: 0.25,
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    expect(result).toBeDefined();
    // Adeguamento fondo: (100000 / 0.10) * (0.25 - 0.10) = 150000
    const art33Increment =
      (result.compliance.art23Compliance?.limiteArt23Attualizzato ?? 0) -
      (result.compliance.art23Compliance?.limiteStorico2016Neutralizzato ?? 0);
    expect(art33Increment).toBe(150000);
  });

  it('7. automatic mode con raw flag undefined e manual stale (10/12) -> usa analitico (0.10/0.25)', () => {
    const input = createBaseFundInput({
      annualData: {
        isArt23FteManualMode: undefined,
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalentiAnnoRif: 12,
        personale2018PerArt23: [{ id: 'a', partTimePercentage: 10 }], // 0.10 FTE
        personaleAnnoRifPerArt23: [{ id: 'b', partTimePercentage: 50, cedoliniEmessi: 6 }], // 0.25 FTE
      },
      calculatedInputs: {
        isArt23FteManualMode: false,
        dipendentiEquivalenti2018: 0.10,
        dipendentiEquivalentiAnnoRif: 0.25,
        variazioneDipendenti: 0.15,
      }
    });

    const result = calculateFundCompletely(input, mockNormativeData);
    expect(result).toBeDefined();
    // I valori manuali stale 10/12 vengono neutralizzati dal flag risolto false:
    // Adeguamento fondo: (100000 / 0.10) * (0.25 - 0.10) = 150000 (NON (100000 / 10) * (12 - 10) = 20000)
    const art33Increment =
      (result.compliance.art23Compliance?.limiteArt23Attualizzato ?? 0) -
      (result.compliance.art23Compliance?.limiteStorico2016Neutralizzato ?? 0);
    expect(art33Increment).toBe(150000);
  });

  it('8. flag in conflitto (raw false, calculated true) + analitico invalido stale -> modalità risolta manual prevale (no throw, usa 10/12)', () => {
    const input = createBaseFundInput({
      annualData: {
        isArt23FteManualMode: false, // raw flag in conflitto
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalentiAnnoRif: 12,
        personale2018PerArt23: [{ id: 'a', partTimePercentage: 0 }], // stale invalido
        personaleAnnoRifPerArt23: [{ id: 'b', partTimePercentage: 100, cedoliniEmessi: 0 }], // stale invalido
      },
      calculatedInputs: {
        isArt23FteManualMode: true, // modalità canonica risolta
        dipendentiEquivalenti2018: 10,
        dipendentiEquivalentiAnnoRif: 12,
        manualDipendentiEquivalentiAnnoRif: 12,
        variazioneDipendenti: 2,
      }
    });

    // Non deve lanciare eccezione perché la modalità risolta è manuale e i manual FTE sono definiti e validi
    let result: any;
    expect(() => {
      result = calculateFundCompletely(input, mockNormativeData);
    }).not.toThrow();

    expect(result).toBeDefined();
    // Calcolo con manual FTE: (100000 / 10) * (12 - 10) = 20000
    const art33Increment =
      (result.compliance.art23Compliance?.limiteArt23Attualizzato ?? 0) -
      (result.compliance.art23Compliance?.limiteStorico2016Neutralizzato ?? 0);
    expect(art33Increment).toBe(20000);
  });

  it('9. reverse flag conflict (raw true, calculated false) + analytic ced0 -> modalità risolta automatic prevale (throw FTE)', () => {
    const input = createBaseFundInput({
      annualData: {
        isArt23FteManualMode: true, // raw flag stale
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalentiAnnoRif: 12,
        personale2018PerArt23: [{ id: 'a', partTimePercentage: 100 }],
        personaleAnnoRifPerArt23: [{ id: 'b', partTimePercentage: 100, cedoliniEmessi: 0 }], // invalido
      },
      calculatedInputs: {
        isArt23FteManualMode: false, // modalità canonica risolta
        dipendentiEquivalenti2018: 1,
        dipendentiEquivalentiAnnoRif: 0,
      }
    });

    expect(() => calculateFundCompletely(input, mockNormativeData)).toThrowError(
      "Calcolo bloccato: i dati FTE Art. 23 contengono valori non validi di part-time o cedolini."
    );
  });
});
