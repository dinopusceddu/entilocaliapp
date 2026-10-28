// @vitest-environment node
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import ExcelJS from 'exceljs';
import type { CanonicalFundResult, FundData, NormalizedInput, NormativeData } from '../../../domain';
import { UserRole } from '../../../domain';
import { deriveCanonicalFundResult } from '../../calculation/canonicalFundLedger';
import { calculateFundCompletely } from '../../calculation/fundEngine';
import { resolveDistributionFundBudget, resolveDistributionBalances } from '../resolveDistributionFundBudget';
import { resolveCabinaViewModel } from '../../cabina/resolveCabinaViewModel';
import { createReportViewModel } from '../../../presenters/reportPresenter';
import { FondoAccessorioDipendentePage } from '../../../pages/FondoAccessorioDipendentePage';
import { DistribuzioneRisorsePage } from '../../../pages/DistribuzioneRisorsePage';
import { buildFondoDipendenteWorkbook } from '../../../services/documents/xlsReportService';
import { buildFundSummaryPdf } from '../../../services/documents/pdfReportService';
import { formatCurrency } from '../../../utils/formatters';

const boundary = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('../../../contexts/AppContext.tsx', () => ({ useAppContext: () => ({
  state: boundary.state, dispatch: vi.fn(), saveState: vi.fn(), performLocalCalculation: vi.fn(),
}) }));
vi.mock('../../../hooks/useNormativeData.ts', () => ({ useNormativeData: () => ({
  data: { riferimenti_normativi: {} }, isLoading: false,
}) }));

const base = (amount: number): CanonicalFundResult => deriveCanonicalFundResult([{
  id: 'BASE', amount, component: 'STABLE', operation: 'ADDITION', competenceYear: 2025,
  status: 'VALID', source: 'MANUAL', art23Treatment: 'EXCLUDED',
}]);
const pending = (status: 'INVALID' | 'UNDETERMINED' = 'UNDETERMINED'): CanonicalFundResult => ({
  ...base(3400), status, total: null,
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

describe('CALC02 distribution canonical economic budget', () => {
  it('D1 VALID copies authoritative 10000 independently of legacy 99999', () => {
    const canonical = Object.freeze(base(10000));
    expect(resolveDistributionFundBudget(canonical)).toEqual({
      canonicalStatus: 'VALID', authoritativeFundTotal: 10000, verifiedFundSubtotal: 10000,
      basis: { mode: 'AUTHORITATIVE', amount: 10000 },
    });
  });
  it('D2 explicit canonical zero remains AUTHORITATIVE zero', () => {
    const budget = resolveDistributionFundBudget(base(0));
    expect(budget.authoritativeFundTotal).toBe(0);
    expect(budget.basis).toEqual({ mode: 'AUTHORITATIVE', amount: 0 });
    expect(resolveDistributionBalances(budget.basis, 10, 20).residual).toBe(-20);
  });
  it('D3 UNDETERMINED separates null authority from 3400 draft', () => {
    expect(resolveDistributionFundBudget(pending())).toEqual({
      canonicalStatus: 'UNDETERMINED', authoritativeFundTotal: null, verifiedFundSubtotal: 3400,
      basis: { mode: 'VERIFIED_DRAFT', amount: 3400 },
    });
  });
  it('D4 real A/2025 unresolved recovery is not part of the budget', () => {
    const result = calculateFundCompletely(astraInput(), { riferimenti_normativi: {} } as NormativeData);
    expect(result.canonicalFund.entries.find(row => row.id === 'CCNL_014_RECOVERY_LEGACY_2024_2025')).toMatchObject({
      amount: 2800, status: 'UNDETERMINED',
    });
    expect(resolveDistributionFundBudget(result.canonicalFund).basis.amount).toBe(3400);
  });
  it.each(['INVALID', 'UNDETERMINED'] as const)('D5 %s cannot authorize even a numeric canonical total', status => {
    const budget = resolveDistributionFundBudget({ ...pending(status), total: 9999 });
    expect(budget.authoritativeFundTotal).toBeNull();
    expect(budget.basis.mode).toBe('VERIFIED_DRAFT');
  });
  it.each([undefined, null])('D6 missing canonical %s is not zero', canonical => {
    const budget = resolveDistributionFundBudget(canonical);
    expect(budget).toEqual({
      canonicalStatus: 'MISSING', authoritativeFundTotal: null, verifiedFundSubtotal: null,
      basis: { mode: 'UNAVAILABLE', amount: null },
    });
    expect(resolveDistributionBalances(budget.basis, 100, 500)).toEqual({
      mode: 'UNAVAILABLE', availableForNegotiation: null, residual: null,
    });
  });
  it('VALID with null total cannot turn verified subtotal into final authority', () => {
    const budget = resolveDistributionFundBudget({ ...base(3400), total: null });
    expect(budget.authoritativeFundTotal).toBeNull();
    expect(budget.basis).toEqual({ mode: 'VERIFIED_DRAFT', amount: 3400 });
  });
  it('D7 changing only legacy summary cannot change the canonical budget/balances', () => {
    const canonicalFund = base(10000);
    const first = { canonicalFund, fondi: { dipendente: { summary: { totaleFondo: 99999 } } } };
    const second = { ...first, fondi: { dipendente: { summary: { totaleFondo: 1 } } } };
    const economic = (value: typeof first) => {
      const budget = resolveDistributionFundBudget(value.canonicalFund);
      return { budget, balances: resolveDistributionBalances(budget.basis, 1200, 2500) };
    };
    expect(economic(first)).toEqual(economic(second));
  });
  it('D8 authoritative residual uses canonical cents and existing exact subtraction', () => {
    const budget = resolveDistributionFundBudget(base(10000));
    expect(resolveDistributionBalances(budget.basis, 1200.01, 2500.02)).toEqual({
      mode: 'AUTHORITATIVE', availableForNegotiation: 8799.99, residual: 7499.98,
    });
  });
  it('D9 residual on verified subtotal retains VERIFIED_DRAFT qualification', () => {
    const budget = resolveDistributionFundBudget(pending());
    expect(resolveDistributionBalances(budget.basis, 400, 1000)).toEqual({
      mode: 'VERIFIED_DRAFT', availableForNegotiation: 3000, residual: 2400,
    });
    expect(budget.authoritativeFundTotal).toBeNull();
  });
  it('static TypeScript contract: distribution budget cannot read legacy economics', () => {
    for (const filename of ['src/pages/DistribuzioneRisorsePage.tsx', 'src/logic/distribution/resolveDistributionFundBudget.ts']) {
      const ast = ts.createSourceFile(filename, readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true);
      const names: string[] = [];
      function visit(node: ts.Node) {
        if (ts.isPropertyAccessExpression(node)) names.push(node.name.text);
        if (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression)) names.push(node.argumentExpression.text);
        if (ts.isImportSpecifier(node)) names.push(node.name.text);
        ts.forEachChild(node, visit);
      }
      visit(ast);
      for (const forbidden of ['summary', 'totaleFondo', 'constitution', 'calculateFadTotals']) expect(names).not.toContain(forbidden);
    }
  });
  it('D10 final A/2025 cross-consumer probe includes actual Distribution UI, XLS and PDF', async () => {
    const input = astraInput();
    const result = calculateFundCompletely(input, { riferimenti_normativi: {} } as NormativeData);
    const canonical = result.canonicalFund;
    const budget = resolveDistributionFundBudget(canonical);
    const presenter = createReportViewModel(result, 'Comune Astra');
    const cabina = resolveCabinaViewModel({ calculationResult: result });
    const user = { id: 'local', email: 'local@example.invalid', name: 'Local review', role: UserRole.ADMIN };
    boundary.state = { calculationResult: result, currentUser: user, currentYear: 2025,
      fundData: { historicalData: input.historicalData, annualData: input.annualData,
        fondoAccessorioDipendenteData: input.fondi.dipendente, fondoElevateQualificazioniData: {},
        fondoSegretarioComunaleData: {}, fondoDirigenzaData: {}, distribuzioneRisorseData: {},
        personaleServizio: { dettagli: [] } } as FundData };
    const text = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    const personnelHtml = renderToStaticMarkup(React.createElement(FondoAccessorioDipendentePage));
    expect(text(personnelHtml)).toContain('Fondo Costituito Totale Non determinabile');
    expect(text(personnelHtml)).toContain(`Il subtotale verificato è ${formatCurrency(3400)}`);
    const distributionHtml = renderToStaticMarkup(React.createElement(DistribuzioneRisorsePage));
    expect(text(distributionHtml)).toContain('Totale da Distribuire Non determinato');
    expect(text(distributionHtml)).toContain(`Subtotale verificato: ${formatCurrency(3400)}`);
    expect(text(distributionHtml)).toContain('Rimanenza (bozza)');
    expect(text(distributionHtml)).not.toContain(formatCurrency(2800));
    for (const [verified, total] of [[canonical.verifiedTotal, canonical.total],
      [cabina.constitution.verifiedSubtotal, cabina.constitution.total],
      [presenter.fadCanonical.verifiedTotal, presenter.fadCanonical.authoritativeTotal],
      [budget.verifiedFundSubtotal, budget.authoritativeFundTotal]]) {
      expect({ verified, total }).toEqual({ verified: 3400, total: null });
    }
    const xls = buildFondoDipendenteWorkbook(presenter);
    const loaded = new ExcelJS.Workbook();
    const xlsBytes = await xls.workbook.xlsx.writeBuffer();
    await loaded.xlsx.load(xlsBytes);
    const cellFor = (label: string) => {
      let value: ExcelJS.CellValue = null;
      loaded.worksheets[0].eachRow(row => {
        if (row.getCell(1).value === label || row.getCell(2).value === label) value = row.getCell(4).value;
      });
      return value;
    };
    expect(cellFor('SUBTOTALE VERIFICATO RISORSE (FAD)')).toBe(3400);
    expect(cellFor('TOTALE GENERALE RISORSE DISPONIBILI (FAD)')).toBe('NON DETERMINATO');
    const pdf = buildFundSummaryPdf(presenter, user);
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    const options = { data: new Uint8Array(pdf.doc.output('arraybuffer')), disableWorker: true };
    const document = await pdfjs.getDocument(options).promise;
    const pages: string[] = [];
    for (let index = 1; index <= document.numPages; index++) {
      const content = await (await document.getPage(index)).getTextContent();
      pages.push(content.items.map(item => 'str' in item ? item.str : '').join(' ').replace(/\s+/g, ' '));
    }
    await document.destroy();
    const pdfText = pages.join('\n');
    expect(pdfText).toContain(`Subtotale verificato FAD: ${formatCurrency(3400)}`);
    expect(pdfText).toContain('Totale Fondo Dipendenti: NON DETERMINATO');
    expect(cabina.constitution.showDefinitiveTotal).toBe(false);
    const dir = process.env.DISTRIBUTION_PROBE_DIR || path.join(tmpdir(), 'distribution-canonical-probe');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'A2025.pdf'), new Uint8Array(pdf.doc.output('arraybuffer')));
    await writeFile(path.join(dir, 'A2025.pdf.txt'), pdfText);
    await writeFile(path.join(dir, 'A2025.xlsx'), Buffer.from(xlsBytes));
    await writeFile(path.join(dir, 'Distribution-A2025.html'), distributionHtml);
    await writeFile(path.join(dir, 'FondoPersonale-A2025.html'), personnelHtml);
    await writeFile(path.join(dir, 'cross-consumer-A2025.json'), JSON.stringify({
      status: canonical.status, stable: canonical.verifiedStableTotal, variable: canonical.verifiedVariableTotal,
      canonical: { verified: canonical.verifiedTotal, authoritative: canonical.total },
      fondoPersonale: { verified: 3400, authoritative: null, realHtmlInspected: true },
      cabina: cabina.constitution, distribution: budget,
      readModel: { verified: presenter.fadCanonical.verifiedTotal, authoritative: presenter.fadCanonical.authoritativeTotal },
      xls: { verified: cellFor('SUBTOTALE VERIFICATO RISORSE (FAD)'), authoritative: cellFor('TOTALE GENERALE RISORSE DISPONIBILI (FAD)') },
      pdf: { verified: 3400, authoritative: 'NON DETERMINATO', realTextInspected: true },
    }, null, 2));
  });
});
