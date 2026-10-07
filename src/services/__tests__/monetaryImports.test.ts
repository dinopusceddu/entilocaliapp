import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { parseExcelData } from '../excelService';
import { importWizard2026Excel } from '../../features/wizard2026/excel/importWizard2026Excel';
import { wizard2026ExcelSchema } from '../../features/wizard2026/excel/wizard2026ExcelSchema';
import { importDatiGeneraliFromCsv } from '../../logic/import/importDatiGeneraliService';
import { createEmptyFundData } from '../../domain/emptyFund';
import { MonetaryBoundaryError } from '../../domain/monetaryBoundary';
const file = (workbook: XLSX.WorkBook) => new File([XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })], 'input.xlsx');
function fundWorkbook(raw: unknown) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
    { 'Chiave Tecnica (NON MODIFICARE)': 'historicalData.manualPersonalFundLimit2016', Valore: 100 },
    { 'Chiave Tecnica (NON MODIFICARE)': 'fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017', Valore: raw },
  ]), 'Dati Fondo'); return wb;
}
function wizardWorkbook(raw: unknown) {
  const wb = XLSX.utils.book_new();
  for (const sheet of wizard2026ExcelSchema) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Campo', 'Fonte', 'Valore', 'Info', 'Chiave'],
    ...(sheet.fields.some(f => f.key === 'ccnl2026.monteSalari2021') ? [['MS2021', '', raw, '', 'ccnl2026.monteSalari2021']] : []),
  ]), sheet.sheetName); return wb;
}
describe('DATA-03 real CSV/XLS adapters', () => {
  it.each(['-100', 'malformed', '1e308', 'Infinity', '123.456', true])('real XLS rejects %j atomically', async raw => {
    await expect(parseExcelData(file(fundWorkbook(raw)))).rejects.toBeInstanceOf(MonetaryBoundaryError);
  });
  it.each(['-100', 'malformed', '1e308', 'Infinity', '123.456', true])('real Wizard workbook rejects %j without a partial payload', async raw => {
    const result = await importWizard2026Excel(file(wizardWorkbook(raw)));
    expect(result.success).toBe(false); expect(result.errors.join(' ')).toContain('monteSalari2021'); expect(result.resultState).toEqual({});
  });
  it.each([0, '1e3', '1.234,56'])('locale/scientific/zero XLS %j goes through the shared policy', async raw => {
    const result = await parseExcelData(file(fundWorkbook(raw)));
    expect(result.fondoAccessorioDipendenteData?.st_art79c1_art67c1_unicoImporto2017).toBe(raw === 0 ? 0 : raw === '1e3' ? 1000 : 1234.56);
  });
  it.each(['-100', '123.456', '1e308', 'malformed'])('CSV service rejects %s without partial mutation', async raw => {
    const current = createEmptyFundData(2025), before = structuredClone(current);
    const csv = 'anno;denominazione_ente;tipologia_ente;monte_salari_2021\n2025;Ente;UNIONE_COMUNI;' + raw;
    const inputFile = new File([csv], 'input.csv');
    // jsdom File lacks Blob.text; the real adapter still reads the exact file bytes.
    Object.defineProperty(inputFile, 'text', { value: async () => csv });
    const result = await importDatiGeneraliFromCsv(inputFile, current, 2025);
    expect(result.success).toBe(false); expect(result.mappedData).toBeUndefined(); expect(current).toEqual(before);
  });
});
