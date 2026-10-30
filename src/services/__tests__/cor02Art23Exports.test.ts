// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
const captured = vi.hoisted(() => ({ pdfs: [] as ArrayBuffer[] }));
vi.mock('jspdf', async original => {
  const actual = await original<typeof import('jspdf')>();
  class CapturingPdf extends actual.jsPDF {
    constructor() { super(); this.save = (() => { captured.pdfs.push(this.output('arraybuffer')); return this; }) as unknown as typeof this.save; }
  }
  return { ...actual, default: CapturingPdf, jsPDF: CapturingPdf };
});
vi.mock('file-saver', () => ({ saveAs: vi.fn() }));
import { markArt23ResultStale, presentArt23Verification } from '../../domain/art23Verification';
import { createDocumentViewModel } from '../../presenters/documentPresenter';
import { createReportViewModel } from '../../presenters/reportPresenter';
import { buildFundSummaryPdf } from '../documents/pdfReportService';
import { buildFondoDipendenteWorkbook } from '../documents/xlsReportService';
import { generateDeterminaPDF } from '../documents/pdfDeterminaService';
import { DocumentFactory } from '../documents/documentFactory';
import { buildDeterminaV2 } from '../templates/determinaTemplateV2';
import { generateFondoDipendenteXLS } from '../xlsReportService';
import { buildRisultati } from '../pdfReportService';
import { buildDetermina } from '../determinaTemplate';
import { cor02Scenarios } from '../../test/fixtures/cor02Art23';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { normalizeInput } from '../../application/input/inputNormalizer';
import { UserRole, type NormativeData } from '../../domain';
const normative = { riferimenti_normativi: {} } as NormativeData;
const user = { id: 'cor02-user', name: 'Revisore sintetico', email: 'cor02@fixture.invalid', role: UserRole.GUEST };
beforeEach(() => { vi.clearAllMocks(); captured.pdfs.length = 0; });
describe('COR-02 real report writers preserve qualified Art23 outcomes', () => {
  it.each(cor02Scenarios)('scenario $id: Excel and determination never certify an indeterminate comparison', async ({ make, status }) => {
    const fund = make(); const before = JSON.stringify(fund);
    const result = calculateFundCompletely(normalizeInput(fund), normative);
    await generateFondoDipendenteXLS(result, 'Ente sintetico COR02', fund.distribuzioneRisorseData, normative);
    const blob = vi.mocked(saveAs).mock.calls[0][0] as Blob;
    const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(Buffer.from(await blob.arrayBuffer()) as any);
    const sheet = workbook.worksheets[0]; let esito: ExcelJS.Row | undefined;
    sheet.eachRow(row => { if (row.getCell(2).value === 'CAPIENZA (+) / SUPERAMENTO (-)') esito = row; });
    expect(esito?.getCell(5).value).toBe(status === 'VALID' ? 'CONFORME' : 'NON DETERMINABILE');
    if (status !== 'VALID') expect(esito?.getCell(4).value).toBe('Non determinabile');
    const determination = buildDetermina(result, fund, user);
    if (status !== 'VALID') {
      expect(determination).toContain('NON DETERMINABILE');
      expect(determination).not.toContain('e sono contenute nel limite');
      expect(determination).not.toContain('•  il rispetto del limite di cui');
    }
    expect(JSON.stringify(fund)).toBe(before);
  });
  it('the real PDF contains an indeterminate outcome instead of a conformity statement', async () => {
    const fund = cor02Scenarios[0].make(); const result = calculateFundCompletely(normalizeInput(fund), normative);
    const doc = new jsPDF(); buildRisultati(doc, result, fund);
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(doc.output('arraybuffer')), useSystemFonts: true }).promise;
    let text = ''; for (let i = 1; i <= pdf.numPages; i++) text += (await (await pdf.getPage(i)).getTextContent()).items.map((x: any) => x.str).join(' ');
    expect(text).toContain('NON DETERMINABILE'); expect(text).not.toContain('CONFORME'); await pdf.destroy();
  });

  it.each(['UNDETERMINED', 'STALE', 'INVALID'] as const)('real legacy/canonical writers preserve %s without a false conformity', async status => {
    const fund = status === 'UNDETERMINED' ? cor02Scenarios[0].make() : cor02Scenarios[2].make();
    if (status === 'INVALID') fund.historicalData.manualPersonalFundLimit2016 = 0;
    let result = calculateFundCompletely(normalizeInput(fund), normative);
    if (status === 'STALE') result = markArt23ResultStale(result)!;
    const label = presentArt23Verification(result).label;
    const vm = createDocumentViewModel(result, 'Ente COR02', user);
    const report = createReportViewModel(result, 'Ente COR02');
    expect(vm.compliance.art23c2.esitoLabel).toBe(label);
    expect(report.fondoDipendenti.limiteArt23.esitoLabel).toBe(label);
    const oldInputs = JSON.stringify(fund);
    await generateFondoDipendenteXLS(result, 'Ente COR02', fund.distribuzioneRisorseData, normative);
    const legacyBlob = vi.mocked(saveAs).mock.calls[0][0] as Blob;
    const legacyBook = new ExcelJS.Workbook(); await legacyBook.xlsx.load(Buffer.from(await legacyBlob.arrayBuffer()) as any);
    const canonical = buildFondoDipendenteWorkbook(report);
    const canonicalBook = new ExcelJS.Workbook(); await canonicalBook.xlsx.load(await canonical.workbook.xlsx.writeBuffer());
    for (const book of [legacyBook, canonicalBook]) {
      const cells: unknown[] = []; book.worksheets.forEach(sheet => sheet.eachRow(row => row.eachCell(cell => cells.push(cell.value))));
      expect(cells).toContain(label);
      if (status !== 'INVALID') { expect(cells).not.toContain('CONFORME'); expect(cells).not.toContain('NON CONFORME'); }
    }
    const legacyPdf = new jsPDF(); buildRisultati(legacyPdf, result, fund);
    const summary = buildFundSummaryPdf(report, user);
    generateDeterminaPDF(vm, { mode: 'DRAFT_PREVIEW' });
    const formalBytes = captured.pdfs[captured.pdfs.length - 1]!;
    for (const bytes of [legacyPdf.output('arraybuffer'), summary.doc.output('arraybuffer'), formalBytes!]) {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: true }).promise;
      let text = ''; for (let page = 1; page <= pdf.numPages; page++) text += (await (await pdf.getPage(page)).getTextContent()).items.map((x: any) => x.str).join(' ');
      expect(text).toContain(label);
      if (status !== 'INVALID') expect(text).not.toMatch(/\bCONFORME\b/);
      await pdf.destroy();
    }
    for (const text of [buildDetermina(result, fund, user), buildDeterminaV2(vm)]) {
      expect(text).toContain(label);
      if (status !== 'INVALID') {
        expect(text).not.toContain('e sono contenute nel limite');
        expect(text).not.toContain('la costituzione rispetta i seguenti limiti');
        expect(text).toContain(status === 'STALE' ? 'Ricalcolare' : 'Completare');
      }
    }
    if (status === 'STALE') {
      expect(canonical.isDraft).toBe(true); expect(summary.isDraft).toBe(true);
      expect(() => buildFondoDipendenteWorkbook(report, { mode: 'DEFINITIVE_EXPORT' })).toThrow(/Ricalcolare/);
      expect(() => buildFundSummaryPdf(report, user, { mode: 'DEFINITIVE_EXPORT' })).toThrow(/Ricalcolare/);
      const factory = new DocumentFactory(result, 'Ente COR02', user);
      for (const kind of ['DETERMINA', 'RELAZIONE', 'PROSPETTO', 'SUMMARY_PDF', 'FAD_XLS'] as const) {
        expect(() => factory.assertDefinitiveExportAllowed(kind)).toThrow(/Ricalcolare/);
      }
      expect(result.canonicalFund.total).toBe(8700);
    }
    expect(JSON.stringify(fund)).toBe(oldInputs);
  });

  it('all eight legacy economic golden blocks are unchanged and remain asserted independently of new control states', () => {
    const goldens = JSON.parse(readFileSync('tests/fixtures/fondo/golden_results.json', 'utf8'));
    const economics = Object.fromEntries(Object.entries<any>(goldens).map(([key, v]) => [key, {
      totaleFondo: v.totaleFondo, totaleParteStabile: v.totaleParteStabile, totaleParteVariabile: v.totaleParteVariabile,
      ammontareSoggettoLimite2016: v.ammontareSoggettoLimite2016, dettaglioFondi: v.dettaglioFondi }]));
    expect(createHash('sha256').update(JSON.stringify(economics)).digest('hex')).toBe('5ad4f81f6f24e5bccd6061db087e153c2739ab037ca8022db1e221bd12040bd9');
    const n = JSON.parse(readFileSync('public/normativa.json', 'utf8'));
    for (const [file, expected] of Object.entries<any>(goldens)) {
      const fund = JSON.parse(readFileSync('tests/fixtures/fondo/' + file, 'utf8'));
      const r = calculateFundCompletely(normalizeInput(fund), n);
      expect(r.totals).toMatchObject({ stabile: expected.totaleParteStabile, variabile: expected.totaleParteVariabile, totaleFondo: expected.totaleFondo });
      expect(r.compliance.art23c2.valoreSoggetto).toBe(expected.ammontareSoggettoLimite2016);
      for (const [name, detail] of Object.entries<any>(expected.dettaglioFondi)) {
        expect(r.fondi[name as keyof typeof r.fondi].summary).toMatchObject({
          totaleStabile: detail.stabile, totaleVariabile: detail.variabile, totaleFondo: detail.totale });
      }
      expect(r.compliance.art23c2.status).toBe('UNDETERMINED');
      expect(r.compliance.art23c2.isCompliant).toBe(false);
    }
  });
});
