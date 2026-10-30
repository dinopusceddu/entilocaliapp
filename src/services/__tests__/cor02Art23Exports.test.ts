// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
vi.mock('file-saver', () => ({ saveAs: vi.fn() }));
import { generateFondoDipendenteXLS } from '../xlsReportService';
import { buildRisultati } from '../pdfReportService';
import { buildDetermina } from '../determinaTemplate';
import { cor02Scenarios } from '../../test/fixtures/cor02Art23';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { normalizeInput } from '../../application/input/inputNormalizer';
import { UserRole, type NormativeData } from '../../domain';
const normative = { riferimenti_normativi: {} } as NormativeData;
const user = { id: 'cor02-user', name: 'Revisore sintetico', email: 'cor02@fixture.invalid', role: UserRole.GUEST };
beforeEach(() => { vi.clearAllMocks(); });
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
      expect(r.compliance.art23c2.status).toBe('UNDETERMINED');
      expect(r.compliance.art23c2.isCompliant).toBe(false);
    }
  });
});
