// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
vi.mock('file-saver', () => ({ saveAs: vi.fn() }));
import { formatCurrency } from '../../utils/formatters';
import { cor03Fund, cor03Scenarios } from '../../test/fixtures/cor03Dl25';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { normalizeInput } from '../../application/input/inputNormalizer';
import { createReportViewModel } from '../../presenters/reportPresenter';
import { projectFundDocument } from '../../domain/documentProjection';
import { buildFondoDipendenteWorkbook } from '../documents/xlsReportService';
import { buildFundSummaryPdf } from '../documents/pdfReportService';
import { generateFondoDipendenteXLS } from '../xlsReportService';
import { UserRole, type NormativeData } from '../../domain';
const normative = { riferimenti_normativi: {} } as NormativeData;
const user = { id: 'cor03', name: 'Revisore sintetico', email: 'cor03@fixture.invalid', role: UserRole.GUEST };
const calc = (f: ReturnType<typeof cor03Fund>) => calculateFundCompletely(normalizeInput(f), normative);
function findRows(sheet: ExcelJS.Worksheet, text: string) {
  const rows: ExcelJS.Row[] = [];
  sheet.eachRow(row => { if ([row.getCell(1).text, row.getCell(2).text].some(v => v.startsWith(text))) rows.push(row); });
  return rows;
}
async function pdfText(doc: jsPDF) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(doc.output('arraybuffer')), useSystemFonts: true }).promise;
  let text = '';
  for (let page = 1; page <= pdf.numPages; page++) text += (await (await pdf.getPage(page)).getTextContent()).items.map((x: any) => x.str).join(' ');
  await pdf.destroy(); return text;
}
describe('COR-03 canonical reports and actual serialized exports', () => {
  it('reconciles multiple exclusions and Art60 without changing adopted amounts', async () => {
    const fund = cor03Fund();
    Object.assign(fund.fondoAccessorioDipendenteData, { st_art79c1_art67c2a_incr8320: 500,
      st_art79c1_art67c2b_incrStipendialiDiff: 300, st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 200 });
    const before = JSON.stringify(fund); const r = calc(fund);
    // Independent arithmetic: 1000 + 7000 + 500 + 300 - 200 = 8600;
    // Art60 figurative +200 neutralizes the deduction only in the subject control.
    expect(r.canonicalFund).toMatchObject({ total: 8600, art23Subject: 1000, art23Excluded: 7800 });
    expect(r.compliance.art23c2.valoreSoggetto).toBe(1000);
    expect(r.compliance.art23Compliance?.risorseEscluseArt23).toBe(7800);
    const projection = projectFundDocument(r);
    expect(projection).toMatchObject({ total: 8600, art23Subject: 1000, art23Excluded: 7800 });
    const report = createReportViewModel(r, 'Comune COR03');
    const built = buildFondoDipendenteWorkbook(report);
    const canonicalBook = new ExcelJS.Workbook(); await canonicalBook.xlsx.load(await built.workbook.xlsx.writeBuffer());
    vi.mocked(saveAs).mockClear();
    await generateFondoDipendenteXLS(r, 'Comune COR03', fund.distribuzioneRisorseData, normative);
    const blob = vi.mocked(saveAs).mock.calls[0][0] as Blob;
    const legacyBook = new ExcelJS.Workbook(); await legacyBook.xlsx.load(Buffer.from(await blob.arrayBuffer()) as any);
    for (const book of [canonicalBook, legacyBook]) {
      const sheet = book.worksheets[0];
      expect(findRows(sheet, 'TOTALE GENERALE RISORSE DISPONIBILI (FAD)')[0].getCell(4).value).toBe(8600);
      const dl25 = findRows(sheet, 'Incremento D.L. 25/2025'); expect(dl25).toHaveLength(1);
      expect(dl25[0].getCell(4).value).toBe(7000); expect(dl25[0].getCell(5).value).toBe('No');
    }
    const text = await pdfText(buildFundSummaryPdf(report, user).doc);
    expect(text.match(/Incremento D.L. 25\/2025/g)).toHaveLength(1);
    expect(text).toContain(formatCurrency(7000).slice(2)); expect(text).toContain(formatCurrency(8600).slice(2));
    expect(text).not.toContain(formatCurrency(14000).slice(2)); expect(text).not.toContain(formatCurrency(24000).slice(2));
    expect(JSON.stringify(fund)).toBe(before);
  });
  it.each([cor03Scenarios[0], cor03Scenarios[4], { status: 'UNDETERMINED', make: () => { const f = cor03Fund(); delete f.annualData.simulatoreRisultati; return f; } }])('$status stays visible as a provisional amount in the actual PDF/XLS', async ({ make, status }) => {
    const fund = make(); const before = JSON.stringify(fund); const r = calc(fund);
    const report = createReportViewModel(r, 'Comune COR03');
    const built = buildFondoDipendenteWorkbook(report);
    const book = new ExcelJS.Workbook(); await book.xlsx.load(await built.workbook.xlsx.writeBuffer());
    const sheet = book.worksheets[0];
    const dl25 = findRows(sheet, 'Incremento D.L. 25/2025'); expect(dl25).toHaveLength(1);
    expect(dl25[0].getCell(4).value).toBeNull();
    expect(dl25[0].getCell(2).text).toContain(status); expect(dl25[0].getCell(2).text).toContain(formatCurrency(7000).slice(2));
    expect(findRows(sheet, 'TOTALE GENERALE RISORSE DISPONIBILI (FAD)')[0].getCell(4).value).toBe('NON DETERMINATO');
    const text = await pdfText(buildFundSummaryPdf(report, user).doc);
    expect(text).toContain(status); expect(text).toContain(formatCurrency(7000).slice(2)); expect(text).toContain('NON DETERMINATO');
    expect(text).toContain(status === 'UNDETERMINED' ? 'NON DETERMINABILE' : 'VERIFICA NON VALIDA');
    expect(text).not.toMatch(/\bCONFORME\b/);
    expect(JSON.stringify(fund)).toBe(before);
  });
});

it('qualified financial economics do not invent an entity decision or favorable Revisori opinion in actual determination output', async () => {
  const fund = cor03Fund(); const r = calc(fund);
  const { createDocumentViewModel } = await import('../../presenters/documentPresenter');
  const { buildDeterminaV2 } = await import('../templates/determinaTemplateV2');
  const vm = createDocumentViewModel(r, 'Comune COR03', user);
  expect(r.canonicalFund.status).toBe('VALID');
  const text = buildDeterminaV2(vm, { mode: 'DRAFT_PREVIEW' });
  expect(text).toContain('non risultano documentati'); expect(text).toContain('non risulta documentata');
  expect(text).not.toContain('Del parere favorevole espresso');
  expect(vm.determina?.hasRevisoriParere).toBe(false);
});
