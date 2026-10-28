import { resolvedZeroState } from '../../test/fixtures/ccnlRecovery';
// @vitest-environment node
import { readFileSync } from 'node:fs';
import ExcelJS from 'exceljs';
import ts from 'typescript';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saveAs } from 'file-saver';
import type { AnnualData, CanonicalFundResult, FundLedgerEntry, NormalizedInput, NormativeData } from '../../domain';
import { projectFadReport, type FadReportReadModel } from '../../domain/documentProjection';
import { createReportViewModel } from '../../presenters/reportPresenter';
import { buildCanonicalFundLedger, deriveCanonicalFundResult } from '../../logic/calculation/canonicalFundLedger';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import FinancialMath from '../../utils/financialMath';
import { formatCurrency } from '../../utils/formatters';
import { buildFondoDipendenteWorkbook } from '../documents/xlsReportService';
import { generateFADXLS } from '../reportService';

// Only the browser download boundary is mocked; ledger, presenter, writer and ExcelJS are real.
vi.mock('file-saver', () => ({ saveAs: vi.fn() }));

const entry = (overrides: Partial<FundLedgerEntry>): FundLedgerEntry => ({
  id: 'ENTRY', amount: 0, component: 'STABLE', operation: 'ADDITION',
  competenceYear: 2026, source: 'MANUAL', art23Treatment: 'EXCLUDED', status: 'VALID',
  ...overrides,
});
const normative = { riferimenti_normativi: {} } as NormativeData;

function astraA2025Result() {
  return calculateFundCompletely({
    historicalData: { manualPersonalFundLimit2016: 120000 },
    annualData: {
      annoRiferimento: 2025, denominazioneEnte: 'Comune Astra', tipologiaEnte: 'Comune',
      ccnl2024: { monteSalari2021: 1_000_000 }, art33ManualDecision: 'DO_NOT_APPLY',
    },
    fondi: { dipendente: {
      st_art58c1_CCNL2026_incremento014_MS2021: 1400,
      st_art79c1_art14c3_art67c2g_riduzioneStraordinario: 2000,
      vn_art58_CCNL2026_arretrati2024_2025: 2800,
      st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44,
    }, eq: {}, segretario: {}, dirigenza: {} },
    distribuzione: {}, personaleDettaglio: [],
    calculatedInputs: {
      dipendentiEquivalenti2018: 10, dipendentiEquivalentiAnnoRif: 10,
      variazioneDipendenti: 0, isArt48Applicabile: false, numDipendentiContrattazione: 10,
    },
  } as unknown as NormalizedInput, normative);
}

const labels = {
  stable: 'Subtotale verificato Risorse Stabili',
  variable: 'Subtotale verificato Risorse Variabili',
  verified: 'SUBTOTALE VERIFICATO RISORSE (FAD)',
  final: 'TOTALE GENERALE RISORSE DISPONIBILI (FAD)',
};
function findRow(sheet: ExcelJS.Worksheet, text: string): ExcelJS.Row {
  const matches: ExcelJS.Row[] = [];
  const exact: ExcelJS.Row[] = [];
  sheet.eachRow(row => {
    if (row.getCell(1).value === text || row.getCell(2).value === text) exact.push(row);
    if (row.getCell(1).value === text || row.getCell(2).text.startsWith(text)) matches.push(row);
  });
  const selected = exact.length ? exact : matches;
  expect(selected, `unique workbook row: ${text}`).toHaveLength(1);
  return selected[0];
}
function allValues(sheet: ExcelJS.Worksheet) {
  const values: ExcelJS.CellValue[] = [];
  sheet.eachRow(row => row.eachCell(cell => values.push(cell.value)));
  return values;
}

async function inspect(model: FadReportReadModel, year = 2026) {
  const built = buildFondoDipendenteWorkbook({ fadCanonical: model, annoRiferimento: year, denominazioneEnte: 'Comune Astra' });
  const reloaded = new ExcelJS.Workbook();
  await reloaded.xlsx.load(await built.workbook.xlsx.writeBuffer());
  expect(reloaded.worksheets.map(sheet => sheet.name)).toEqual(['Fondo Dipendenti']);
  const sheet = reloaded.getWorksheet('Fondo Dipendenti')!;
  expect(sheet.state).toBe('visible');
  expect(sheet.model.merges).toEqual(['A1:E1']);
  expect(sheet.columns.map(column => column.width)).toEqual([25, 60, 45, 18, 15]);
  expect(sheet.columns.every(column => !column.hidden)).toBe(true);
  expect(sheet.getCell('A1').font).toEqual(expect.objectContaining({ name: 'Arial', size: 16, bold: true }));
  expect(sheet.getCell('A1').fill).toEqual(expect.objectContaining({ fgColor: { argb: '994D51' } }));
  expect(sheet.getCell('B2').value).toBe('Comune Astra');
  expect(sheet.getCell('A1').text).toContain(`ANNO ${year}`);
  sheet.eachRow(row => row.eachCell(cell => {
    expect(cell.type).not.toBe(ExcelJS.ValueType.Formula);
  }));
  const expected = [model.verifiedStableTotal, model.verifiedVariableTotal, model.verifiedTotal];
  [labels.stable, labels.variable, labels.verified].forEach((label, index) => {
    const cell = findRow(sheet, label).getCell(4);
    expect(cell.value).toBe(expected[index]);
    expect(cell.type).toBe(expected[index] === null ? ExcelJS.ValueType.Null : ExcelJS.ValueType.Number);
  });
  const draft = !model.canonicalAvailable || model.status !== 'VALID' || model.authoritativeTotal === null;
  expect(built.isDraft).toBe(draft);
  expect(built.filename).toBe(`Fondo_Dipendenti_${draft ? 'BOZZA_' : ''}Comune Astra_${year}.xlsx`);
  expect(sheet.getCell('A1').text.startsWith('BOZZA')).toBe(draft);
  expect(sheet.getCell('A3').text).toContain(model.status);
  const final = findRow(sheet, labels.final).getCell(4);
  expect(final.value).toBe(draft ? 'NON DETERMINATO' : model.authoritativeTotal);
  expect(final.type).toBe(draft ? ExcelJS.ValueType.String : ExcelJS.ValueType.Number);
  for (const row of model.rows) {
    const cell = findRow(sheet, row.description).getCell(4);
    expect(cell.value).toBe(row.signedAmount);
    expect(cell.type).toBe(row.signedAmount === null ? ExcelJS.ValueType.Null : ExcelJS.ValueType.Number);
    expect(cell.numFmt).toBe('#,##0.00');
  }
  // Explicitly authorized scope: retain B/C headings, without amounts or a limit outcome.
  const quadroB = findRow(sheet, 'QUADRO B: UTILIZZO DEL FONDO (DESTINAZIONI)');
  const quadroC = findRow(sheet, 'QUADRO C: VERIFICA LIMITE ART. 23 C. 2 D.LGS. 75/2017');
  for (let index = quadroB.number; index <= sheet.rowCount; index++) {
    expect(typeof sheet.getRow(index).getCell(4).value).not.toBe('number');
  }
  expect(sheet.getRow(quadroB.number + 2).getCell(2).value).toBe('Non rappresentato in questo prospetto');
  expect(sheet.getRow(quadroC.number + 2).getCell(2).value).toBe('Non rappresentato in questo prospetto');
  return { ...built, workbook: reloaded, sheet };
}
const inspectCanonical = (canonical: CanonicalFundResult, year?: number) => inspect(projectFadReport(canonical), year);

describe('CANONICAL_FAD_XLSX — real serialized workbook', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('X1 reconciles additions, deductions and canonical zero with all four canonical aggregates', async () => {
    const canonical = deriveCanonicalFundResult([
      entry({ id: 'Stable addition', amount: 50.11 }),
      entry({ id: 'Stable deduction', amount: 10.02, operation: 'DEDUCTION' }),
      entry({ id: 'Variable addition', amount: 9.99, component: 'VARIABLE' }),
      entry({ id: 'Canonical zero', amount: 0 }),
    ]);
    const { sheet } = await inspectCanonical(canonical);
    expect(findRow(sheet, labels.final).getCell(4).value).toBe(50.08);
    const values = canonical.entries.map(row => findRow(sheet, row.id).getCell(4).value as number);
    expect(FinancialMath.sumAll(...values)).toBe(canonical.total);
    expect(findRow(sheet, 'Stable deduction').getCell(4).font.color).toEqual({ argb: 'C02128' });
  });

  it('X2 explicit canonical zero defeats the nonzero legacy alias', async () => {
    const canonical = buildCanonicalFundLedger({
      year: 2025, annualData: { annoRiferimento: 2025, ccnl2024: { monteSalari2021: 0 } } as AnnualData,
      sections: {}, fadData: { vn_art58c2_CCNL2026_incremento022_MS2021: 0, vn_art58c2_incremento_max022_ms2021: 900 },
    });
    const { sheet } = await inspectCanonical(canonical, 2025);
    expect(findRow(sheet, 'Incremento variabile 0,22%').getCell(4).value).toBe(0);
    expect(findRow(sheet, labels.final).getCell(4).value).toBe(0);
    expect(allValues(sheet)).not.toContain(900);
  });

  it('X3 A/2025 replaces the actual divergent legacy path with 3400 verified and no final total', async () => {
    const result = astraA2025Result();
    const viewModel = createReportViewModel(result, 'Comune Astra');
    const legacyStable = viewModel.fondoDipendenti.costituzione.find(section => section.id === 'stabili')!;
    expect(legacyStable.total).toBe(result.canonicalFund.verifiedStableTotal);
    expect(legacyStable.items.map(item => item.amount)).toEqual(expect.arrayContaining([2000, 1400, 0]));
    const { sheet } = await inspect(viewModel.fadCanonical, 2025);
    expect(findRow(sheet, 'Riduzione stabile straordinario').getCell(4).value).toBe(2000);
    expect(findRow(sheet, 'Incremento stabile 0,14%').getCell(4).value).toBe(1400);
    expect(findRow(sheet, 'Decurtazione stabile per conglobamento').getCell(4).value).toBe(0);
    expect(findRow(sheet, labels.stable).getCell(4).value).toBe(3400);
    expect(findRow(sheet, labels.variable).getCell(4).value).toBe(0);
    expect(findRow(sheet, labels.verified).getCell(4).value).toBe(3400);
    const recovery = findRow(sheet, 'Arretrati 0,14% 2024-2025');
    expect(recovery.getCell(4).value).toBeNull();
    expect(recovery.getCell(2).text).toContain('UNDETERMINED - DA ISTRUIRE');
    expect(recovery.getCell(2).text).toContain(formatCurrency(2800));
    expect(recovery.getCell(2).text).toContain('Aggregato legacy privo di istruttoria');
    for (const forbidden of [-127.44, 2800, 4800, 6072.56]) expect(allValues(sheet)).not.toContain(forbidden);
  });

  it('X4 Art.60 2026 uses the canonical negative amount once, with no year rule in the writer', async () => {
    const canonical = buildCanonicalFundLedger({
      year: 2026, annualData: { annoRiferimento: 2026, ccnlRecovery: resolvedZeroState(), ccnl2024: { monteSalari2021: 1_000_000 } } as AnnualData,
      sections: {}, fadData: { st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44 },
    });
    const model = projectFadReport(canonical);
    const { sheet } = await inspect(model);
    const art60 = findRow(sheet, 'Decurtazione stabile per conglobamento');
    expect(art60.getCell(4).value).toBe(-127.44);
    expect(model.rows.filter(row => row.id.startsWith('ART60'))).toHaveLength(1);
    expect(FinancialMath.sumAll(...model.rows.map(row => findRow(sheet, row.description).getCell(4).value as number))).toBe(canonical.total);
  });

  it('X5 unresolved recovery is informative text, excluded from economic cells and formulas', async () => {
    const canonical = deriveCanonicalFundResult([
      entry({ id: 'Verified base', amount: 120 }),
      entry({ id: 'Recovery', amount: 2800, component: 'VARIABLE', status: 'UNDETERMINED', source: 'RECOVERY',
        provenance: { reason: 'Eligibility not documented' } }),
    ]);
    const { sheet } = await inspectCanonical(canonical);
    expect(findRow(sheet, 'Recovery').getCell(2).text).toContain('escluso dai subtotali');
    expect(findRow(sheet, 'Recovery').getCell(2).text).toContain('Eligibility not documented');
    expect(findRow(sheet, labels.verified).getCell(4).value).toBe(120);
    expect(allValues(sheet)).not.toContain(2800);
  });

  it('X6 INVALID keeps verified amounts, but no definitive total even if canonical.total is numerical', async () => {
    const canonical = deriveCanonicalFundResult([
      entry({ id: 'Verified base', amount: 100 }),
      entry({ id: 'Invalid limit', amount: -1, status: 'INVALID', economicEffect: false, provenance: { reason: 'Invalid canonical limit' } }),
    ]);
    expect(canonical.total).toBe(100);
    const { sheet } = await inspectCanonical(canonical);
    expect(findRow(sheet, 'Invalid limit').getCell(2).text).toContain('INVALID');
    expect(findRow(sheet, 'Invalid limit').getCell(4).value).toBeNull();
  });

  it.each([null, undefined])('X7 missing canonical result (%s) leaves all aggregates undetermined, never zero', async canonical => {
    const { sheet } = await inspect(projectFadReport(canonical));
    expect(allValues(sheet).filter(value => typeof value === 'number')).toEqual([]);
  });

  it('X7 missing canonical entry leaves its amount blank; verified zero remains explicitly a subtotal', async () => {
    const { sheet } = await inspectCanonical(deriveCanonicalFundResult([
      entry({ id: 'Missing amount', amount: null, status: 'MISSING' }),
    ]));
    expect(findRow(sheet, 'Missing amount').getCell(2).text).toContain('MISSING');
    expect(findRow(sheet, labels.verified).getCell(4).value).toBe(0);
  });

  it('X8 serializes canonical cent precision without additional rounding or floating point sums', async () => {
    const canonical = deriveCanonicalFundResult([
      entry({ id: 'A', amount: 0.335 }), entry({ id: 'B', amount: 0.335 }),
      entry({ id: 'C', amount: 0.335, component: 'VARIABLE' }),
      entry({ id: 'D', amount: 0.005, operation: 'DEDUCTION' }),
      entry({ id: 'E', amount: 0.005, operation: 'DEDUCTION', component: 'VARIABLE' }),
    ]);
    const { sheet } = await inspectCanonical(canonical);
    const values = ['A', 'B', 'C', 'D', 'E'].map(id => findRow(sheet, id).getCell(4).value as number);
    expect(values).toEqual([0.34, 0.34, 0.34, -0.01, -0.01]);
    expect(FinancialMath.sumAll(...values)).toBe(1);
    expect(findRow(sheet, labels.final).getCell(4).value).toBe(1);
  });

  it.each([0, 55.55])('X9 divergent legacy sections/summary/utilization/limit never influence workbook total %s', async amount => {
    const result = astraA2025Result();
    const sections = result.fondi.dipendente.constitution!.sections;
    const divergent = { ...result,
      canonicalFund: deriveCanonicalFundResult([entry({ id: 'Canonical base', amount })]),
      fondi: { ...result.fondi, dipendente: { ...result.fondi.dipendente,
        summary: { ...result.fondi.dipendente.summary, totaleFondo: 999999 },
        constitution: { sections: Object.fromEntries(Object.entries(sections).map(([id, section]) => [id, { ...section, total: 777777 }])) },
      } },
    };
    const viewModel = createReportViewModel(divergent, 'Comune Astra');
    expect(viewModel.fondoDipendenti.costituzione.every(section => section.total === 777777)).toBe(true);
    Object.defineProperty(viewModel, 'fondoDipendenti', { get: () => { throw new Error('Legacy economics must not be read'); } });
    Object.defineProperty(viewModel, 'altriFondi', { get: () => { throw new Error('Other funds must not be read'); } });
    const built = buildFondoDipendenteWorkbook(viewModel);
    const reloaded = new ExcelJS.Workbook();
    await reloaded.xlsx.load(await built.workbook.xlsx.writeBuffer());
    const sheet = reloaded.worksheets[0];
    expect(findRow(sheet, labels.final).getCell(4).value).toBe(amount);
    expect(allValues(sheet)).not.toContain(999999);
    expect(allValues(sheet)).not.toContain(777777);
    await inspect(viewModel.fadCanonical, 2025);
  });

  it('X10 structurally forbids legacy economic accesses and independent sign/rounding/total formulas', () => {
    const source = ts.createSourceFile('xlsReportService.ts', readFileSync('src/services/documents/xlsReportService.ts', 'utf8'), ts.ScriptTarget.Latest, true);
    const accesses: string[] = [];
    const imports: string[] = [];
    function visit(node: ts.Node) {
      if (ts.isPropertyAccessExpression(node)) accesses.push(node.name.text);
      if (ts.isElementAccessExpression(node) && node.argumentExpression && ts.isStringLiteral(node.argumentExpression)) accesses.push(node.argumentExpression.text);
      if (ts.isImportSpecifier(node)) imports.push(node.name.text);
      ts.forEachChild(node, visit);
    }
    visit(source);
    for (const forbidden of ['costituzione', 'constitution', 'sections', 'summary', 'totaleFondo', 'fondi', 'utilizzi', 'limiteArt23', 'calculateFadTotals', 'abs', 'toFixed', 'roundTo2DP', 'sumAll']) {
      expect([...accesses, ...imports]).not.toContain(forbidden);
    }
  });

  it('keeps UNDETERMINED prerequisites and VALID/null total nondefinitive without inventing administrative gates', async () => {
    const undetermined = deriveCanonicalFundResult([entry({ id: 'Base', amount: 42 })], [], ['EXTERNAL_MISSING']);
    expect(undetermined.total).toBe(42);
    const { sheet } = await inspectCanonical(undetermined);
    expect(findRow(sheet, 'EXTERNAL_MISSING').getCell(4).value).toBeNull();
    await inspectCanonical({ ...deriveCanonicalFundResult([entry({ id: 'Base', amount: 42 })]), total: null });
  });

  it.each(['VALID', 'UNDETERMINED'] as const)('public UI service serializes the real %s workbook with the existing MIME and qualified filename', async status => {
    const result = astraA2025Result();
    const input = status === 'VALID' ? { ...result, canonicalFund: deriveCanonicalFundResult([entry({ id: 'Canonical base', amount: 77.77 })]) } : result;
    await generateFADXLS(input, 'Comune Astra');
    expect(saveAs).toHaveBeenCalledTimes(1);
    const [blob, filename] = vi.mocked(saveAs).mock.calls[0];
    expect(blob).toBeInstanceOf(Blob);
    const exported = blob as Blob;
    expect(exported.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(filename).toBe(`Fondo_Dipendenti_${status === 'VALID' ? '' : 'BOZZA_'}Comune Astra_2025.xlsx`);
    const loaded = new ExcelJS.Workbook();
    await loaded.xlsx.load(await exported.arrayBuffer());
    expect(loaded.worksheets.map(sheet => sheet.name)).toEqual(['Fondo Dipendenti']);
    expect(findRow(loaded.worksheets[0], labels.final).getCell(4).value).toBe(status === 'VALID' ? 77.77 : 'NON DETERMINATO');
  });
});
