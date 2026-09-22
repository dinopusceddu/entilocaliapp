import { calculateCcnl2026Increments } from '../src/logic/wizard2026/ccnl2026Increments';
import { calculateConglobamentoArt60 } from '../src/logic/wizard2026/conglobamentoArt60';
import { calculateArt23c2Adjustment } from '../src/logic/calculation/fundCalculations';
import { buildCanonicalFundLedger } from '../src/logic/calculation/canonicalFundLedger';
import type { AnnualData, CalculationSection } from '../src/domain';

type OracleRow = {
  id: string;
  input: unknown;
  expected: unknown;
  actual: unknown;
  delta: number | null;
  result: 'PASS' | 'FAIL';
};

const rows: OracleRow[] = [];
const normalize = (value: unknown) => JSON.stringify(value);
const add = (id: string, input: unknown, expected: unknown, actual: unknown, delta: number | null = null) => {
  rows.push({ id, input, expected, actual, delta, result: normalize(expected) === normalize(actual) ? 'PASS' : 'FAIL' });
};

const annual = (year: number, monteSalari2021?: number): AnnualData => ({
  annoRiferimento: year,
  ccnl2024: monteSalari2021 === undefined ? {} : { monteSalari2021 },
  personale2018PerArt23: [],
  personaleAnnoRifPerArt23: [],
} as unknown as AnnualData);

for (const [id, ms, expected] of [
  ['O014-1000000', 1_000_000, 1_400],
  ['O014-0', 0, 0],
] as const) {
  const actual = calculateCcnl2026Increments({ monteSalari2021: ms, annoRiferimento: 2026 }).incrementoStabile014;
  add(id, { MS2021: ms }, expected, actual, actual === undefined ? null : actual - expected);
}

const missing014 = calculateCcnl2026Increments({ annoRiferimento: 2026 });
add('O014-missing', { MS2021: null }, 'UNDETERMINED', missing014.status);
const negative014 = calculateCcnl2026Increments({ monteSalari2021: -100, annoRiferimento: 2026 });
add('O014-negative', { MS2021: -100 }, 'INVALID', negative014.status);

for (const year of [2024, 2025, 2026, 2027]) {
  const expected = year === 2024
    ? { annualMax: 0, frd: 0, eq: 0 }
    : { annualMax: 2_200, frd: 1_760, eq: 440 };
  const result = calculateCcnl2026Increments({
    ...(year > 2026 ? { monteSalari2021Consolidato2026: 1_000_000 } : { monteSalari2021: 1_000_000 }),
    annoRiferimento: year,
    fondoRisorseDecentrate2024: 80_000,
    risorseEQ2024: 20_000,
    incremento022Anno: expected.annualMax,
  });
  add(`O022-${year}`, { MS2021: 1_000_000, year, FRD2024: 80_000, EQ2024: 20_000 }, expected, {
    annualMax: result.limiteMassimo022,
    frd: result.incremento022Fondo,
    eq: result.incremento022EQ,
  });
}

for (const year of [2025, 2026]) {
  const actual = calculateConglobamentoArt60({
    mode: 'guided', annoRiferimento: year, personaleInteroArea: { FUNZIONARIO_EQ: 1 },
  }).riduzioneTotale;
  const expected = year === 2025 ? 0 : 127.44;
  add(`O060-${year}`, { year, FTE_funz_at_20260101: 1 }, expected, actual, actual === undefined ? null : actual - expected);
}
const art602027 = calculateConglobamentoArt60({ mode: 'guided', annoRiferimento: 2027, valoreConsolidato2026: 127.44 });
add('O060-2027', { year: 2027, consolidated2026: 127.44 }, 127.44, art602027.riduzioneTotale, 0);

const art33 = calculateArt23c2Adjustment(
  { fondoEQ2018_Art23: 0 }, annual(2026), 0, true, {}
);
add('O033-missing', { FRD2018: null, personale2018: 0 }, 'UNDETERMINED', art33.status);

const subjectSections: Record<string, CalculationSection> = {
  stabili: { id: 'stabili', title: 'Stabili', total: 2_000, items: [{
    key: 'subject', description: 'Subject', amount: 2_000,
    isRelevantToArt23Limit: true, operator: '+', isSubtractor: false,
  }] },
};
const cached = buildCanonicalFundLedger({
  year: 2025,
  annualData: annual(2025, 0),
  fadData: { cl_totaleParzialeRisorsePerConfrontoTetto2016: 0 },
  sections: subjectSections,
});
add('cached-total', { components: 2_000, cache: 0 }, 2_000, cached.art23Subject, (cached.art23Subject ?? 0) - 2_000);

const zero = buildCanonicalFundLedger({
  year: 2026,
  annualData: annual(2026, 0),
  fadData: {
    vn_art58c2_CCNL2026_incremento022_MS2021: 0,
    vn_art58c2_incremento_max022_ms2021: 900,
    st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0,
  },
  sections: { stabili: { id: 'stabili', title: 'Stabili', total: 0, items: [] } },
});
const zeroActual = zero.entries.find(entry => entry.id === 'CCNL_022_CURRENT')?.amount;
add('canonical-zero / legacy-900', { canonical: 0, legacy: 900 }, 0, zeroActual, zeroActual === undefined || zeroActual === null ? null : zeroActual);

console.log(JSON.stringify({ rows, passed: rows.filter(row => row.result === 'PASS').length, total: rows.length }, null, 2));
if (rows.some(row => row.result === 'FAIL')) process.exitCode = 1;
