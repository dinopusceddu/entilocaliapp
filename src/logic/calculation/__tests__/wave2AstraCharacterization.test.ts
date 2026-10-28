import { describe, expect, it } from 'vitest';
import { TipologiaEnte, type NormalizedInput } from '../../../domain';
import { calculateFundCompletely } from '../fundEngine';

const normativeData = { riferimenti_normativi: {} } as any;

function astraA2025Input(): NormalizedInput {
  return {
    annualData: {
      annoRiferimento: 2025,
      tipologiaEnte: TipologiaEnte.COMUNE,
      entityClassification: { entityType: 'COMUNE' },
      personaleServizioAttuale: [],
      personale2018PerArt23: [],
      personaleAnnoRifPerArt23: [],
      proventiSpecifici: [],
      simulatoreInput: {},
      fondoLavoroStraordinario: 0,
      ccnl2024: {
        monteSalari2021: 1_000_000,
        fondoPersonale2025: 80_000,
        fondoEQ2025: 0,
        ivcConglobation: {
          mode: 'analytic',
          totalReduction: 127.44,
        },
      },
    },
    historicalData: {
      manualPersonalFundLimit2016: 120_000,
      fondoPersonaleNonDirEQ2018_Art23: 0,
      fondoEQ2018_Art23: 0,
      fondoStraordinario2016: 0,
    },
    fondi: {
      dipendente: {
        st_art58c1_CCNL2026_incremento014_MS2021: 1_400,
        st_art79c1_art14c3_art67c2g_riduzioneStraordinario: 2_000,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44,
        vn_art58_CCNL2026_arretrati2024_2025: 2_800,
      },
      eq: {},
      segretario: {},
      dirigenza: {},
    },
    distribuzione: {},
    personaleDettaglio: [],
    calculatedInputs: {
      dipendentiEquivalenti2018: 0,
      dipendentiEquivalentiAnnoRif: 0,
      variazioneDipendenti: 0,
      isArt48Applicabile: false,
      numDipendentiContrattazione: 0,
      isManualMode: true,
      isArt23FteManualMode: true,
    },
  } as NormalizedInput;
}

describe('Wave 2 — Astra A/2025 characterization and canonical result', () => {
  it('preserves the legacy evidence but returns the normative state from the ledger', () => {
    const actual = calculateFundCompletely(astraA2025Input(), normativeData);

    const observedPreWave2Cabina = {
      stable: 3_272.56,
      variable: 5_600,
      total: 8_872.56,
    };

    const arithmeticReconciliation = {
      stable: 1_400 + 2_000 - 127.44,
      variable: 2_800,
      total: Math.round((1_400 + 2_000 - 127.44 + 2_800) * 100) / 100,
    };
    const normativeResult = {
      stable: 1_400 + 2_000,
      recoveryStatus: 'UNDETERMINED',
      total: null,
    };

    expect(observedPreWave2Cabina).toEqual({ stable: 3_272.56, variable: 5_600, total: 8_872.56 });
    expect(arithmeticReconciliation).toEqual({
      stable: 3_272.56,
      variable: 2_800,
      total: 6_072.56,
    });
    expect(normativeResult).toEqual({
      stable: 3_400,
      recoveryStatus: 'UNDETERMINED',
      total: null,
    });
    expect(actual.canonicalFund).toEqual(expect.objectContaining({
      stableTotal: 3_400,
      variableTotal: null,
      total: null,
      verifiedStableTotal: 3_400,
      verifiedVariableTotal: 0,
      verifiedTotal: 3_400,
      status: 'UNDETERMINED',
    }));
    expect(actual.canonicalFund.entries).toContainEqual(expect.objectContaining({
      id: 'ART60_CONSOLIDATION',
      amount: 0,
      status: 'VALID',
    }));
    expect(actual.canonicalFund.entries).toContainEqual(expect.objectContaining({
      id: 'CCNL_014_RECOVERY_LEGACY_2024_2025',
      amount: 2_800,
      status: 'UNDETERMINED',
    }));
    // Numeric compatibility summary exposes only verified entries; nullable truth lives in canonicalFund.
    expect(actual.fondi.dipendente.summary).toEqual({
      totaleStabile: 3_400,
      totaleVariabile: 0,
      totaleFondo: 3_400,
    });
  });
});
