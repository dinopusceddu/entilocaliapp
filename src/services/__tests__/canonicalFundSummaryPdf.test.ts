// @vitest-environment node
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import ExcelJS from 'exceljs';
import ts from 'typescript';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnnualData, CalculationResult, FundData, FundLedgerEntry, NormalizedInput, NormativeData, User } from '../../domain';
import { UserRole } from '../../domain/enums';
import { deriveCanonicalFundResult, buildCanonicalFundLedger } from '../../logic/calculation/canonicalFundLedger';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { createReportViewModel, type ReportViewModel } from '../../presenters/reportPresenter';
import { resolveCabinaViewModel } from '../../logic/cabina/resolveCabinaViewModel';
import { FondoAccessorioDipendentePage } from '../../pages/FondoAccessorioDipendentePage';
import { buildFundSummaryPdf } from '../documents/pdfReportService';
import { buildFondoDipendenteWorkbook } from '../documents/xlsReportService';
import { generateFullSummaryPDF } from '../reportService';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { recovery014, resolvedZeroState } from '../../test/fixtures/ccnlRecovery';

it('NORM02 real PDF shows partial recovery competence/recognition and actual 1000, not maximum', async () => {
  const state = resolvedZeroState();
  state.instructions![1] = recovery014({ competenceYear: 2025, instructionStatus: 'RECOVER_PARTIAL', alreadyRecognizedAmount: 200, requestedRecoveryAmount: 1000 });
  const canonical = buildCanonicalFundLedger({ year: 2026, annualData: { ccnlRecovery: state, ccnl2024: { monteSalari2021: 1000000 }, pnrrExerciseDecision: 'NOT_EXERCISED' } as AnnualData,
    fadData: { st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0 }, sections: {} });
  const result = { ...baseResult(), canonicalFund: canonical, metadata: { ...baseResult().metadata, annoRiferimento: 2026 } };
  const pdf = await inspect(createReportViewModel(result, 'Comune Astra'), 'ccnl-recovery-partial');
  expect(pdf.text).toContain('competenza 2025, riconoscimento 2026');
  expect(pdf.text).toContain('RECOVER_PARTIAL');
  expect(pdf.text).toContain(formatCurrency(1000));
  expect(canonical.entries.find(e => e.id === 'CCNL_014_RECOVERY_2025')?.amount).toBe(1000);
});

it('NORM02 unresolved real PDF remains draft with no authoritative recovery money', async () => {
  const canonical = buildCanonicalFundLedger({ year: 2026, annualData: { ccnl2024: { monteSalari2021: 1000000 }, pnrrExerciseDecision: 'NOT_EXERCISED' } as AnnualData,
    fadData: { st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0 }, sections: {} });
  const result = { ...baseResult(), canonicalFund: canonical, metadata: { ...baseResult().metadata, annoRiferimento: 2026 } };
  const vm = createReportViewModel(result, 'Comune Astra');
  const pdf = await inspect(vm, 'ccnl-recovery-uninstructed');
  expect(pdf.text).toContain('UNDETERMINED');
  expect(vm.fadCanonical.authoritativeTotal).toBeNull();
  expect(vm.fadCanonical.rows.filter(row => row.source === 'RECOVERY').every(row => row.signedAmount === null)).toBe(true);
});

const boundary = vi.hoisted(() => ({
  saved: [] as Array<{ filename: string; bytes: Uint8Array }>,
  state: {} as Record<string, unknown>,
}));
// Real jsPDF and autoTable; only the external download method is intercepted.
vi.mock('jspdf', async importOriginal => {
  const actual = await importOriginal<typeof import('jspdf')>();
  class CapturingPdf extends actual.jsPDF {
    constructor() {
      super();
      this.save = ((filename = 'summary.pdf') => {
        boundary.saved.push({ filename, bytes: new Uint8Array(this.output('arraybuffer')) });
        return this;
      }) as unknown as typeof this.save;
    }
  }
  return { ...actual, default: CapturingPdf, jsPDF: CapturingPdf };
});
// UI boundaries are isolated from remote state; economic UI code is real (SSR).
vi.mock('../../contexts/AppContext.tsx', () => ({ useAppContext: () => ({
  state: boundary.state, dispatch: vi.fn(), saveState: vi.fn(), performLocalCalculation: vi.fn(),
}) }));
vi.mock('../../hooks/useNormativeData.ts', () => ({ useNormativeData: () => ({
  data: { riferimenti_normativi: {} }, isLoading: false,
}) }));
// Open the real presentation cards to inspect the UI's otherwise hidden subtotals.
vi.mock('../../components/shared/Card.tsx', async importOriginal => {
  const actual = await importOriginal<typeof import('../../components/shared/Card')>();
  return { ...actual, Card: (props: React.ComponentProps<typeof actual.Card>) =>
    React.createElement(actual.Card, { ...props, defaultCollapsed: false }) };
});

const user: User = { id: 'local-review', email: 'local@example.invalid', name: 'Revisione locale', role: UserRole.ADMIN };
const normative = { riferimenti_normativi: {} } as NormativeData;
const entry = (overrides: Partial<FundLedgerEntry>): FundLedgerEntry => ({
  id: 'ENTRY', amount: 0, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026,
  source: 'MANUAL', art23Treatment: 'EXCLUDED', status: 'VALID', ...overrides,
});
const astraInput = (): NormalizedInput => ({
  historicalData: { manualPersonalFundLimit2016: 120000 },
  annualData: { annoRiferimento: 2025, denominazioneEnte: 'Comune Astra', tipologiaEnte: 'Comune',
    ccnl2024: { monteSalari2021: 1_000_000 }, art33ManualDecision: 'DO_NOT_APPLY' },
  fondi: { dipendente: {
    st_art58c1_CCNL2026_incremento014_MS2021: 1400,
    st_art79c1_art14c3_art67c2g_riduzioneStraordinario: 2000,
    vn_art58_CCNL2026_arretrati2024_2025: 2800,
    st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44,
  }, eq: {}, segretario: {}, dirigenza: {} },
  distribuzione: {}, personaleDettaglio: [],
  calculatedInputs: { dipendentiEquivalenti2018: 10, dipendentiEquivalentiAnnoRif: 10,
    variazioneDipendenti: 0, isArt48Applicabile: false, numDipendentiContrattazione: 10 },
} as unknown as NormalizedInput);
const baseResult = () => calculateFundCompletely(astraInput(), normative);
const withEntries = (entries: FundLedgerEntry[]): CalculationResult => ({
  ...baseResult(), canonicalFund: deriveCanonicalFundResult(entries),
});

let outputDir: string;
let sequence = 0;
beforeAll(async () => {
  outputDir = process.env.SUMMARY_PDF_TEST_DIR || await mkdtemp(path.join(tmpdir(), 'canonical-summary-pdf-tests-'));
  await mkdir(outputDir, { recursive: true });
});
beforeEach(() => { boundary.saved.length = 0; });

async function extract(filename: string, bytes: Uint8Array) {
  const target = path.join(outputDir, filename);
  await writeFile(target, bytes);
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
  const options = { data: new Uint8Array(await readFile(target)), disableWorker: true };
  const pdf = await pdfjs.getDocument(options).promise;
  const pages: string[] = [];
  for (let index = 1; index <= pdf.numPages; index++) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    const items = content.items.filter((item): item is import('pdfjs-dist/types/src/display/api').TextItem => 'str' in item);
    pages.push(items.map(item => item.str).join(' ').replace(/\s+/g, ' ').trim());
    // Text cannot cross page margins/footer, including multi-page canonical tables.
    for (const item of items) {
      if (!item.str.trim()) continue;
      const footer = item.str.includes('Fondo Risorse Decentrate') || /^Pagina \d+ di \d+$/.test(item.str);
      expect(item.transform[5]).toBeGreaterThan(footer ? 0 : 30);
      expect(item.transform[4]).toBeGreaterThanOrEqual(35);
      expect(item.transform[4] + item.width).toBeLessThanOrEqual(558);
    }
  }
  const text = pages.join('\n');
  await writeFile(target + '.txt', text);
  await pdf.destroy();
  return { pages, text, target };
}

async function inspect(vm: ReportViewModel, name: string) {
  const built = buildFundSummaryPdf(vm, user);
  const inspected = await extract(`${name}-${++sequence}.pdf`, new Uint8Array(built.doc.output('arraybuffer')));
  const { fadCanonical: fad } = vm;
  expect(inspected.pages.length).toBeGreaterThanOrEqual(3);
  expect(inspected.pages[0]).toContain('FONDO PERSONALE DIPENDENTE (FAD)');
  expect(inspected.pages[0]).toContain(`STATO ECONOMICO FAD: ${fad.status}`);
  expect(inspected.pages[1]).toContain('DETTAGLIO FONDO PERSONALE DIPENDENTE');
  expect(inspected.pages[inspected.pages.length - 1]).toContain('QUADRO ALTRI FONDI');
  const draft = !fad.canonicalAvailable || fad.status !== 'VALID' || fad.authoritativeTotal === null;
  expect(built.isDraft).toBe(draft);
  expect(built.filename).toBe(`Fondo_${draft ? 'BOZZA_' : ''}${vm.annoRiferimento}_Comune_Astra.pdf`);
  expect(inspected.pages[0].includes('BOZZA - RIEPILOGO')).toBe(draft);
  const money = (value: number | null) => value === null ? 'NON DETERMINATO' : formatCurrency(value);
  expect(inspected.text).toContain(`Subtotale verificato Risorse Stabili: ${money(fad.verifiedStableTotal)}`);
  expect(inspected.text).toContain(`Subtotale verificato Risorse Variabili: ${money(fad.verifiedVariableTotal)}`);
  expect(inspected.text).toContain(`Subtotale verificato FAD: ${money(fad.verifiedTotal)}`);
  expect(inspected.text).toContain(`Totale Fondo Dipendenti: ${money(fad.authoritativeTotal)}`);
  expect(inspected.text).toContain('Fondi esposti separatamente; nessun totale complessivo ente.');
  expect(inspected.text).toContain('Verifica limite Art. 23 c. 2: Non rappresentato in questo prospetto');
  expect(inspected.text).toContain('Quadro B: Utilizzo del Fondo (Destinazioni) Non rappresentato in questo prospetto');
  for (const row of fad.rows) {
    const suffix = row.signedAmount === null ? ` [${row.status} - DA ISTRUIRE]` : '';
    expect(inspected.text).toContain(row.description + suffix);
    if (row.signedAmount !== null) expect(inspected.text).toContain(formatNumber(row.signedAmount, 2));
  }
  return { ...built, ...inspected };
}

describe('CANONICAL_FUND_SUMMARY_PDF — real PDFs and canonical cross-consumer probes', () => {
  it('P1 VALID canonical additions/deductions, verified subtotals and authoritative total', async () => {
    const vm = createReportViewModel(withEntries([
      entry({ id: 'Stable base', amount: 50.11 }),
      entry({ id: 'Stable deduction', amount: 10.02, operation: 'DEDUCTION' }),
      entry({ id: 'Variable base', amount: 9.99, component: 'VARIABLE' }),
    ]), 'Comune Astra');
    const pdf = await inspect(vm, 'P1-valid');
    expect(pdf.text).toContain(`Stable deduction ${formatNumber(-10.02, 2)}`);
    expect(pdf.text).toContain(`Totale Fondo Dipendenti: ${formatCurrency(50.08)}`);
  });

  it('P2 canonical zero wins over a nonzero legacy alias and all legacy aggregate values', async () => {
    const result = { ...baseResult(), canonicalFund: buildCanonicalFundLedger({ year: 2025,
      annualData: { annoRiferimento: 2025, ccnl2024: { monteSalari2021: 0 } } as AnnualData,
      sections: {}, fadData: { vn_art58c2_CCNL2026_incremento022_MS2021: 0, vn_art58c2_incremento_max022_ms2021: 900 },
    }) };
    const pdf = await inspect(createReportViewModel(result, 'Comune Astra'), 'P2-zero');
    expect(pdf.text).toContain(`Totale Fondo Dipendenti: ${formatCurrency(0)}`);
    expect(pdf.text).not.toContain(formatCurrency(900));
  });

  it('P3 A/2025 real engine: 2000 + 1400, Art60 zero, recovery informative and verified 3400 without final total', async () => {
    const result = baseResult();
    const vm = createReportViewModel(result, 'Comune Astra');
    expect(vm.fondoDipendenti.costituzione.find(section => section.id === 'stabili')!.total).toBe(result.canonicalFund.verifiedStableTotal);
    const pdf = await inspect(vm, 'A2025');
    expect(pdf.text).toContain(formatNumber(2000, 2));
    expect(pdf.text).toContain(formatNumber(1400, 2));
    expect(pdf.text).toContain(`Decurtazione stabile per conglobamento indennità comparto (Art. 60 c. 2 CCNL 2026) ${formatNumber(0, 2)}`);
    expect(pdf.text).toContain('UNDETERMINED - DA ISTRUIRE');
    expect(pdf.text).toContain(`importo informativo: ${formatCurrency(2800)} (escluso dai subtotali)`);
    expect(pdf.text).toContain('Aggregato legacy privo di istruttoria distinta per annualità di origine.');
    for (const forbidden of ['4.800,00', '6.072,56', '-127,44', formatNumber(4800, 2), formatNumber(6072.56, 2), formatNumber(-127.44, 2)]) {
      expect(pdf.text).not.toContain(forbidden);
    }
    expect(pdf.text.split(formatCurrency(2800))).toHaveLength(2); // only the qualified note
    expect(pdf.text).toContain(`Subtotale verificato FAD: ${formatCurrency(3400)}`);
    expect(pdf.text).toContain('Totale Fondo Dipendenti: NON DETERMINATO');
    await writeFile(path.join(outputDir, 'A2025.pdf'), new Uint8Array(pdf.doc.output('arraybuffer')));
  });

  it.each([2025, 2026])('P4 / NORM-01 final probe Art60 %s: ledger, read model, real XLS and real PDF agree', async year => {
    const canonical = buildCanonicalFundLedger({ year, annualData: { annoRiferimento: year, ccnl2024: { monteSalari2021: 1_000_000 } } as AnnualData,
      sections: {}, fadData: { st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44 },
    });
    const base = baseResult();
    const vm = createReportViewModel({ ...base, metadata: { ...base.metadata, annoRiferimento: year }, canonicalFund: canonical }, 'Comune Astra');
    const expected = year === 2025 ? 0 : -127.44;
    const art = vm.fadCanonical.rows.filter(row => row.id === 'ART60_CONSOLIDATION');
    expect(art).toHaveLength(1);
    expect(art[0].signedAmount).toBe(expected);
    const xls = buildFondoDipendenteWorkbook(vm);
    const loaded = new ExcelJS.Workbook();
    await loaded.xlsx.load(await xls.workbook.xlsx.writeBuffer());
    const matches: ExcelJS.Row[] = [];
    loaded.worksheets[0].eachRow(row => { if (row.getCell(2).text === art[0].description) matches.push(row); });
    expect(matches).toHaveLength(1);
    expect(matches[0].getCell(4).value).toBe(expected);
    const pdf = await inspect(vm, `Art60-${year}`);
    expect(pdf.text.split(`${art[0].description} ${formatNumber(expected, 2)}`)).toHaveLength(2);
    if (year === 2025) expect(pdf.text).not.toContain(formatNumber(-127.44, 2));
    await writeFile(path.join(outputDir, `Art60-${year}.pdf`), new Uint8Array(pdf.doc.output('arraybuffer')));
    await writeFile(path.join(outputDir, `norm01-${year}.json`), JSON.stringify({ year, ledger: canonical.entries.find(row => row.id === 'ART60_CONSOLIDATION')?.amount,
      operation: art[0].operation, readModel: art[0].signedAmount, xls: matches[0].getCell(4).value, pdfSignedAmount: expected, economicRows: art.length }));
  });

  it('P5 unresolved recovery cannot become an economic amount, verified subtotal or final total', async () => {
    const pdf = await inspect(createReportViewModel(withEntries([
      entry({ id: 'Verified base', amount: 120 }),
      entry({ id: 'Recovery', amount: 2800, status: 'UNDETERMINED', component: 'VARIABLE', source: 'RECOVERY', provenance: { reason: 'Eligibility pending' } }),
    ]), 'Comune Astra'), 'P5-recovery');
    expect(pdf.text).toContain(`Recovery [UNDETERMINED - DA ISTRUIRE] Eligibility pending; importo informativo: ${formatCurrency(2800)} (escluso dai subtotali) NON DETERMINATO`);
    expect(pdf.text).toContain(`Subtotale verificato FAD: ${formatCurrency(120)}`);
  });

  it('P6 INVALID does not expose a numerical total even when canonical.total is numerical', async () => {
    const result = withEntries([entry({ id: 'Verified base', amount: 100 }), entry({ id: 'Invalid limit', amount: -1, status: 'INVALID', economicEffect: false })]);
    expect(result.canonicalFund.total).toBe(100);
    const pdf = await inspect(createReportViewModel(result, 'Comune Astra'), 'P6-invalid');
    expect(pdf.text).toContain('Invalid limit [INVALID]');
    expect(pdf.isDraft).toBe(true);
  });

  it('P7 missing canonical input never becomes zero or a legacy fallback', async () => {
    const result = baseResult();
    const { canonicalFund: _canonical, ...withoutCanonical } = result;
    const pdf = await inspect(createReportViewModel(withoutCanonical as CalculationResult, 'Comune Astra'), 'P7-missing-canonical');
    expect(pdf.text).toContain('Subtotale verificato FAD: NON DETERMINATO');
    expect(pdf.text).not.toContain(`Subtotale verificato FAD: ${formatCurrency(0)}`);
  });

  it('P7 missing canonical row preserves null and MISSING qualification', async () => {
    const pdf = await inspect(createReportViewModel(withEntries([entry({ id: 'Missing amount', amount: null, status: 'MISSING' })]), 'Comune Astra'), 'P7-missing-entry');
    expect(pdf.text).toContain('Missing amount [MISSING - DA ISTRUIRE] NON DETERMINATO');
  });

  it('P8 fractions reflect the canonical cents, without additional rounding', async () => {
    const pdf = await inspect(createReportViewModel(withEntries([
      entry({ id: 'A', amount: 0.335 }), entry({ id: 'B', amount: 0.335 }),
      entry({ id: 'C', amount: 0.335, component: 'VARIABLE' }),
      entry({ id: 'D', amount: 0.005, operation: 'DEDUCTION' }),
      entry({ id: 'E', amount: 0.005, operation: 'DEDUCTION', component: 'VARIABLE' }),
    ]), 'Comune Astra'), 'P8-fractions');
    expect(pdf.text).toContain(`A ${formatNumber(0.34, 2)}`);
    expect(pdf.text).toContain(`D ${formatNumber(-0.01, 2)}`);
    expect(pdf.text).toContain(`Totale Fondo Dipendenti: ${formatCurrency(1)}`);
  });

  it('P9 divergent legacy sections, summaries and aggregate values are never read by the PDF builder', async () => {
    const base = withEntries([entry({ id: 'Canonical base', amount: 55.55 })]);
    const result = { ...base, totals: { ...base.totals, totaleFondo: 888888 }, fondi: { ...base.fondi,
      dipendente: { ...base.fondi.dipendente, summary: { ...base.fondi.dipendente.summary, totaleFondo: 999999 },
        constitution: { ...base.fondi.dipendente.constitution!, sections: Object.fromEntries(
          Object.entries(base.fondi.dipendente.constitution!.sections).map(([key, section]) => [key, { ...section, total: 777777 }])) } } } };
    const vm = createReportViewModel(result, 'Comune Astra');
    Object.defineProperty(vm, 'fondoDipendenti', { get: () => { throw new Error('Legacy FAD read forbidden'); } });
    const pdf = await inspect(vm, 'P9-poison-legacy');
    for (const forbidden of [999999, 777777, 888888]) expect(pdf.text).not.toContain(formatCurrency(forbidden));
  });

  it.each(['VALID', 'UNDETERMINED'] as const)('P10/P11 preserve other funds and keep multi-fund aggregates separate when FAD %s', async status => {
    const base = status === 'VALID' ? withEntries([entry({ id: 'FAD only', amount: 10 })]) : baseResult();
    const result = { ...base, inputs: { ...base.inputs, hasDirigenza: true },
      totals: { stabile: 888888, variabile: 777777, totaleFondo: 999999 },
      fondi: { ...base.fondi,
        eq: { ...base.fondi.eq, summary: { ...base.fondi.eq.summary, totaleFondo: 222.22 } },
        segretario: { ...base.fondi.segretario, summary: { ...base.fondi.segretario.summary, totaleFondo: 333.33 } },
        dirigenza: { ...base.fondi.dirigenza, summary: { ...base.fondi.dirigenza.summary, totaleFondo: 444.44 } } } };
    const vm = createReportViewModel(result, 'Comune Astra');
    const pdf = await inspect(vm, `P10-P11-${status}`);
    const others = pdf.pages[pdf.pages.length - 1];
    for (const fond of [vm.altriFondi.eq, vm.altriFondi.segretario, vm.altriFondi.dirigenza]) expect(others).toContain(`${fond.label} ${fond.totale}`);
    for (const amount of [222.22, 333.33, 444.44]) expect(pdf.pages[0]).not.toContain(formatCurrency(amount));
    for (const amount of [888888, 777777, 999999]) expect(pdf.text).not.toContain(formatCurrency(amount));
  });

  it('P12 TypeScript AST forbids legacy FAD economics and independent monetary/sign calculations', () => {
    const source = ts.createSourceFile('pdfReportService.ts', readFileSync('src/services/documents/pdfReportService.ts', 'utf8'), ts.ScriptTarget.Latest, true);
    const names: string[] = [];
    function visit(node: ts.Node) {
      if (ts.isPropertyAccessExpression(node)) names.push(node.name.text);
      if (ts.isElementAccessExpression(node) && node.argumentExpression && ts.isStringLiteral(node.argumentExpression)) names.push(node.argumentExpression.text);
      if (ts.isImportSpecifier(node)) names.push(node.name.text);
      ts.forEachChild(node, visit);
    }
    visit(source);
    for (const forbidden of ['fondoDipendenti', 'constitution', 'costituzione', 'sections', 'summary', 'totaleFondo', 'calculateFadTotals', 'totals', 'fondi', 'abs', 'toFixed', 'roundTo2DP', 'sumAll']) expect(names).not.toContain(forbidden);
  });

  it('cross-consumer A/2025 single dataset: actual Fondo Personale SSR, Cabina resolver, canonical model, real XLS and real PDF', async () => {
    const input = astraInput();
    const result = calculateFundCompletely(input, normative);
    const canonical = result.canonicalFund;
    const vm = createReportViewModel(result, 'Comune Astra');
    const cabina = resolveCabinaViewModel({ calculationResult: result });
    expect(cabina.constitution).toEqual({ canonicalStatus: 'UNDETERMINED', total: null, verifiedSubtotal: 3400, showDefinitiveTotal: false });
    boundary.state = { calculationResult: result, currentUser: user, currentYear: 2025,
      fundData: { historicalData: input.historicalData, annualData: input.annualData,
        fondoAccessorioDipendenteData: input.fondi.dipendente, fondoElevateQualificazioniData: {},
        fondoSegretarioComunaleData: {}, fondoDirigenzaData: {}, distribuzioneRisorseData: {} } as FundData };
    const html = renderToStaticMarkup(React.createElement(FondoAccessorioDipendentePage));
    await writeFile(path.join(outputDir, 'FondoPersonale-A2025.html'), html);
    const uiText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    expect(uiText).toContain(`Il subtotale verificato è ${formatCurrency(3400)}`);
    expect(uiText).toContain('FONTI DI FINANZIAMENTO STABILI');
    expect(uiText).toContain(`SOMMA RISORSE STABILI ${formatCurrency(3400)}`);
    expect(uiText).toContain(`SOMMA RISORSE VARIABILI SOGGETTE AL LIMITE ${formatCurrency(0)}`);
    expect(uiText).toContain(`SOMMA RISORSE VARIABILI NON SOGGETTE AL LIMITE ${formatCurrency(0)}`);
    expect(uiText).toContain('Fondo Costituito Totale Non determinabile');
    expect(uiText).toContain('Risultato canonico non determinabile');
    const workbook = buildFondoDipendenteWorkbook(vm);
    const loaded = new ExcelJS.Workbook();
    await loaded.xlsx.load(await workbook.workbook.xlsx.writeBuffer());
    const sheet = loaded.worksheets[0];
    const workbookValue = (label: string) => {
      let value: ExcelJS.CellValue = null;
      sheet.eachRow(row => { if (row.getCell(1).value === label || row.getCell(2).value === label) value = row.getCell(4).value; });
      return value;
    };
    expect(workbookValue('Subtotale verificato Risorse Stabili')).toBe(3400);
    expect(workbookValue('Subtotale verificato Risorse Variabili')).toBe(0);
    expect(workbookValue('SUBTOTALE VERIFICATO RISORSE (FAD)')).toBe(3400);
    expect(workbookValue('TOTALE GENERALE RISORSE DISPONIBILI (FAD)')).toBe('NON DETERMINATO');
    const pdf = await inspect(vm, 'cross-consumer-A2025');
    const expected = { status: 'UNDETERMINED', stable: 3400, variable: 0, verified: 3400, authoritative: null };
    expect({ status: canonical.status, stable: canonical.verifiedStableTotal, variable: canonical.verifiedVariableTotal,
      verified: canonical.verifiedTotal, authoritative: canonical.total }).toEqual(expected);
    expect({ status: vm.fadCanonical.status, stable: vm.fadCanonical.verifiedStableTotal, variable: vm.fadCanonical.verifiedVariableTotal,
      verified: vm.fadCanonical.verifiedTotal, authoritative: vm.fadCanonical.authoritativeTotal }).toEqual(expected);
    await writeFile(path.join(outputDir, 'cross-consumer-A2025.json'), JSON.stringify({ expected, canonical: expected,
      fondoPersonale: { htmlInspected: true, ...expected }, cabina: cabina.constitution,
      readModel: vm.fadCanonical, xls: { stable: workbookValue('Subtotale verificato Risorse Stabili'),
        variable: workbookValue('Subtotale verificato Risorse Variabili'), verified: workbookValue('SUBTOTALE VERIFICATO RISORSE (FAD)'),
        authoritativeCell: workbookValue('TOTALE GENERALE RISORSE DISPONIBILI (FAD)'), filename: workbook.filename },
      pdf: { file: pdf.target, filename: pdf.filename, realTextInspected: true },
      distributionVerifiedBudget: result.fondi.dipendente.summary.totaleFondo }, null, 2));
  });

  it('public generateFullSummaryPDF downloads the real BOZZA PDF with the qualified name', async () => {
    await generateFullSummaryPDF(baseResult(), 'Comune Astra', user);
    expect(boundary.saved).toHaveLength(1);
    expect(boundary.saved[0].filename).toBe('Fondo_BOZZA_2025_Comune_Astra.pdf');
    const pdf = await extract('public-download.pdf', boundary.saved[0].bytes);
    expect(pdf.text).toContain('BOZZA - RIEPILOGO GENERALE E RISULTANZE');
    expect(pdf.text).toContain('Totale Fondo Dipendenti: NON DETERMINATO');
  });

  it('long canonical tables paginate without missing totals/rows or touching the footer', async () => {
    const result = withEntries(Array.from({ length: 80 }, (_, index) => entry({ id: `Canonical row ${index}`, amount: 1.01 })));
    const pdf = await inspect(createReportViewModel(result, 'Comune Astra'), 'pagination');
    expect(pdf.pages.length).toBeGreaterThan(3);
    expect(pdf.text).toContain('Canonical row 79');
  });
});
