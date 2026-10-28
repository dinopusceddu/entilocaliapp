import { describe, expect, it } from 'vitest';
import type { AnnualData, CalculationSection, FundLedgerEntry } from '../../../domain';
import { buildCanonicalFundLedger, deriveCanonicalFundResult } from '../canonicalFundLedger';
import { calculateArt23c2Adjustment } from '../fundCalculations';
import { calculateCcnl2026Increments } from '../../wizard2026/ccnl2026Increments';
import { calculateConglobamentoArt60 } from '../../wizard2026/conglobamentoArt60';

const emptySections: Record<string, CalculationSection> = {
  stabili: { id: 'stabili', title: 'Stabili', total: 0, items: [] },
  variabili_soggette: { id: 'variabili_soggette', title: 'Variabili', total: 0, items: [] },
};

const annual = (year: number, monteSalari2021 = 1_000_000): AnnualData => ({
  annoRiferimento: year,
  ccnl2024: { monteSalari2021 },
  personale2018PerArt23: [],
  personaleAnnoRifPerArt23: [],
} as unknown as AnnualData);

const validEntry = (overrides: Partial<FundLedgerEntry>): FundLedgerEntry => ({
  id: 'ENTRY',
  amount: 0,
  component: 'STABLE',
  operation: 'ADDITION',
  competenceYear: 2026,
  source: 'MANUAL',
  art23Treatment: 'EXCLUDED',
  status: 'VALID',
  ...overrides,
});

describe('Canonical fund ledger — permanent contract L1-L16', () => {
  it('L1 rejects duplicate semantic IDs', () => {
    expect(() => deriveCanonicalFundResult([
      validEntry({ id: 'DUPLICATE', amount: 1 }),
      validEntry({ id: 'DUPLICATE', amount: 2 }),
    ])).toThrow(/Duplicate canonical fund ledger entry id/);
  });

  it('L2 keeps one CCNL_014_CURRENT entry after Wizard transfer and reload', () => {
    const input = {
      year: 2026,
      annualData: annual(2026),
      fadData: { st_art58c1_CCNL2026_incremento014_MS2021: 1_400 },
      sections: emptySections,
      wizardTransferSnapshot: {
        transferPlan: [{ destinationPath: 'fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021' }],
      },
    };
    const first = buildCanonicalFundLedger(input);
    const reload = buildCanonicalFundLedger(input);
    for (const result of [first, reload]) {
      const entries = result.entries.filter(entry => entry.id === 'CCNL_014_CURRENT');
      expect(entries).toHaveLength(1);
      expect(entries[0]).toEqual(expect.objectContaining({ amount: 1_400, source: 'TRANSFERRED' }));
    }
  });

  it('L3 represents current and recovery as different entries', () => {
    const result = buildCanonicalFundLedger({
      year: 2026,
      annualData: annual(2026),
      fadData: {
        st_art58c1_CCNL2026_incremento014_MS2021: 1_400,
        vn_art58_CCNL2026_arretrati2024_2025: 2_800,
      },
      sections: emptySections,
    });
    expect(result.entries).toContainEqual(expect.objectContaining({ id: 'CCNL_014_CURRENT', amount: 1_400, status: 'VALID' }));
    expect(result.entries).toContainEqual(expect.objectContaining({
      id: 'CCNL_014_RECOVERY_LEGACY_2024_2025',
      amount: 2_800,
      status: 'UNDETERMINED',
    }));
  });

  it('records Wizard provenance on every transferred canonical resource', () => {
    const result = buildCanonicalFundLedger({
      year: 2026,
      annualData: annual(2026),
      fadData: {
        st_art58c1_CCNL2026_incremento014_MS2021: 1_400,
        vn_art58c2_CCNL2026_incremento022_MS2021: 0,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44,
      },
      sections: emptySections,
      wizardTransferSnapshot: {
        transferPlan: [
          { destinationPath: 'fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021' },
          { destinationPath: 'fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021' },
          { destinationPath: 'fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto' },
        ],
      },
    });

    for (const id of ['CCNL_014_CURRENT', 'CCNL_022_CURRENT', 'ART60_CONSOLIDATION']) {
      expect(result.entries.find(entry => entry.id === id)?.source).toBe('TRANSFERRED');
    }
  });

  it.each([
    ['L4', 2024, 0],
    ['L5', 2025, 2_200],
    ['L6', 2026, 2_200],
  ])('%s applies the annual 0.22%% maximum in %i', (_id, year, expected) => {
    expect(calculateCcnl2026Increments({ monteSalari2021: 1_000_000, annoRiferimento: year }).limiteMassimo022).toBe(expected);
  });

  it('L7 keeps a recovery separate from the annual 0.22% maximum', () => {
    const result = calculateCcnl2026Increments({ monteSalari2021: 1_000_000, annoRiferimento: 2026 });
    expect(result.limiteMassimo022).toBe(2_200);
    expect(result).not.toHaveProperty('recupero022');
  });

  it('L8 and L9 apply Art. 60 only from 2026', () => {
    const workforce = { FUNZIONARIO_EQ: 1 } as const;
    expect(calculateConglobamentoArt60({ mode: 'guided', annoRiferimento: 2025, personaleInteroArea: workforce }).riduzioneTotale).toBe(0);
    expect(calculateConglobamentoArt60({ mode: 'guided', annoRiferimento: 2026, personaleInteroArea: workforce }).riduzioneTotale).toBe(127.44);
  });

  it('L10 treats canonical zero as present and never revives legacy 900', () => {
    const result = buildCanonicalFundLedger({
      year: 2026,
      annualData: annual(2026),
      fadData: {
        vn_art58c2_CCNL2026_incremento022_MS2021: 0,
        vn_art58c2_incremento_max022_ms2021: 900,
      },
      sections: emptySections,
    });
    expect(result.entries.find(entry => entry.id === 'CCNL_022_CURRENT')?.amount).toBe(0);
  });

  it('L11 ignores a denormalized Art. 23 cache when entries sum to 2,000', () => {
    const sections: Record<string, CalculationSection> = {
      ...emptySections,
      variabili_soggette: {
        id: 'variabili_soggette',
        title: 'Variabili',
        total: 2_000,
        items: [{
          key: 'subject_resource', description: 'Risorsa soggetta', amount: 2_000,
          isRelevantToArt23Limit: true, operator: '+', isSubtractor: false,
        }],
      },
    };
    const result = buildCanonicalFundLedger({
      year: 2025,
      annualData: annual(2025),
      fadData: { cl_totaleParzialeRisorsePerConfrontoTetto2016: 0 },
      sections,
    });
    expect(result.art23Subject).toBe(2_000);
    expect(result.warnings).toContainEqual(expect.stringContaining('cache ignorata'));
  });

  it('L12-L15 derives all totals and Art. 23 values only from entries', () => {
    const result = deriveCanonicalFundResult([
      validEntry({ id: 'S+', amount: 2_000, component: 'STABLE', art23Treatment: 'SUBJECT' }),
      validEntry({ id: 'S-', amount: 250, component: 'STABLE', operation: 'DEDUCTION', art23Treatment: 'SUBJECT' }),
      validEntry({ id: 'V+', amount: 700, component: 'VARIABLE', art23Treatment: 'EXCLUDED' }),
    ]);
    expect(result.stableTotal).toBe(1_750);
    expect(result.variableTotal).toBe(700);
    expect(result.total).toBe(2_450);
    expect(result.art23Subject).toBe(1_750);
  });

  it('L16 preserves a missing Art. 33 prerequisite as UNDETERMINED', () => {
    const result = calculateArt23c2Adjustment(
      { fondoEQ2018_Art23: 0 },
      annual(2026),
      0,
      true,
      {}
    );
    expect(result.status).toBe('UNDETERMINED');
    expect(result.missingPrerequisites).toEqual(expect.arrayContaining([
      'ART33_FRD2018_MISSING',
      'ART33_PERSONALE2018_MISSING_OR_ZERO',
    ]));
  });
});
