// @vitest-environment node
import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { normalizeInput } from '../../application/input/inputNormalizer';
import { createReportViewModel } from '../../presenters/reportPresenter';
import { buildFondoDipendenteWorkbook } from '../documents/xlsReportService';
import { buildFundSummaryPdf } from '../documents/pdfReportService';
import { cor04Fund } from '../../test/fixtures/cor04Ccnl022';
import { formatCurrency } from '../../utils/formatters';
import { UserRole, type NormativeData } from '../../domain';
const user = { id: 'cor04', name: 'Revisore sintetico', email: 'cor04@fixture.invalid', role: UserRole.GUEST };
const cases = [
  { name: 'qualified allocation', fondo: 1760, eq: 440, state: 'VALID', total: 2760 },
  { name: 'combined allocation above annual cap', fondo: 2400, eq: 600, state: 'INVALID', total: 3400 },
  { name: 'canonical deficit: authorization evidence unavailable', fondo: 1760, eq: 440, state: 'UNDETERMINED', total: 2760 },
  { name: 'missing monte salari', fondo: 1760, eq: 440, state: 'UNDETERMINED', total: 2760 },
];
describe('COR-04 actual canonical report exports', () => {
  it.each(cases)('$name preserves raw economics and qualified output', async ({ name, fondo, eq, state, total }) => {
    const f = cor04Fund(fondo, eq); if (name.startsWith('canonical deficit')) f.annualData.isEnteStrutturalmenteDeficitario = true; if (name === 'missing monte salari') delete f.annualData.ccnl2024!.monteSalari2021;
    const before = JSON.stringify(f); const r = calculateFundCompletely(normalizeInput(f), { riferimenti_normativi: {} } as NormativeData);
    expect(r.canonicalFund.status).toBe(state); expect(r.canonicalFund.verifiedTotal).toBe(total);
    expect(r.fondi.eq.summary.totaleFondo).toBe(500 + eq);
    const report = createReportViewModel(r, 'Comune COR04');
    expect(report.fadCanonical.authoritativeTotal).toBe(state === 'VALID' ? total : null);
    const built = buildFondoDipendenteWorkbook(report); expect(built.isDraft).toBe(state !== 'VALID');
    const book = new ExcelJS.Workbook(); await book.xlsx.load(await built.workbook.xlsx.writeBuffer());
    const rows: ExcelJS.Row[] = []; book.worksheets[0].eachRow(row => rows.push(row));
    const current = rows.filter(row => row.getCell(2).text.startsWith('Incremento variabile 0,22%'));
    expect(current).toHaveLength(1); expect(current[0].getCell(4).value).toBe(fondo);
    expect(rows.find(row => row.getCell(1).text === 'SUBTOTALE VERIFICATO RISORSE (FAD)')?.getCell(4).value).toBe(total);
    expect(rows.find(row => row.getCell(1).text === 'TOTALE GENERALE RISORSE DISPONIBILI (FAD)')?.getCell(4).value)
      .toBe(state === 'VALID' ? total : 'NON DETERMINATO');
    const { doc } = buildFundSummaryPdf(report, user);
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(doc.output('arraybuffer')), useSystemFonts: true }).promise;
    let text = ''; for (let i = 1; i <= pdf.numPages; i++) text += (await (await pdf.getPage(i)).getTextContent()).items.map((x: any) => x.str).join(' ');
    await pdf.destroy(); expect(text).toContain(state); expect(text).toContain(formatCurrency(fondo).slice(2));
    if (state !== 'VALID') { expect(text).toContain('NON DETERMINATO'); expect(text).not.toMatch(/\bCONFORME\b/); }
    expect(JSON.stringify(f)).toBe(before);
  });
});
