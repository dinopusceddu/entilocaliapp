import { describe, it, expect, vi, beforeEach } from 'vitest';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { buildFondoDipendente } from '../pdfReportService';
import { FundData } from '../../domain';
import { formatCurrency } from '../../utils/formatters';

vi.mock('jspdf-autotable', () => ({
  default: vi.fn((doc: any) => {
    doc.lastAutoTable = { finalY: 50 };
  }),
}));

describe('pdfReportService - Art. 79 c.1 lett. c terminology', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockFundData = (art79c1cValue: number): FundData => ({
    annualData: {
      annoRiferimento: 2026,
      denominazioneEnte: 'Comune di Test',
    } as any,
    historicalData: {} as any,
    fondoAccessorioDipendenteData: {
      st_art79c1_art67c1_unicoImporto2017: 50000,
      st_art79c1c_incrementoStabileConsistenzaPers: art79c1cValue,
    } as any,
    fondoElevateQualificazioniData: {} as any,
    fondoSegretarioComunaleData: {} as any,
    fondoDirigenzaData: {} as any,
    distribuzioneRisorseData: {} as any,
    personaleServizio: {} as any,
  });

  it('P1, P2, P3, P4. verifies correct label, removal of legacy text, value, and placement in Table A (Risorse Stabili Soggette al Limite)', () => {
    const doc = new jsPDF();
    const testValue = 1234.56;
    const fundData = createMockFundData(testValue);

    buildFondoDipendente(doc, fundData);

    // autoTable should be called for Table A, B, C, D
    expect(autoTable).toHaveBeenCalled();
    const calls = vi.mocked(autoTable).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(1);

    // Call 0 is Table A: "Risorse Stabili Soggette al Limite"
    const tableAOptions = calls[0][1] as any;
    expect(tableAOptions).toBeDefined();
    const rows: string[][] = tableAOptions.body;

    // P1: Check row with corrected label exists in Table A
    const art79Row = rows.find(row =>
      row[0] === 'Incremento stabile della consistenza di personale (art. 79, c. 1, lett. c)'
    );
    expect(art79Row).toBeDefined();

    // P2: Verify legacy label is not present in any row of Table A
    const legacyRow = rows.find(row =>
      row[0] === 'Risorse per nuove assunzioni (art. 79, c.1, lett. c)'
    );
    expect(legacyRow).toBeUndefined();

    // P3: Value formatted matches formatCurrency(testValue)
    expect(art79Row![1]).toBe(formatCurrency(testValue));

    // P4: Verify it is in Table A and NOT in Table B, C, or D
    for (let i = 1; i < calls.length; i++) {
      const otherTableRows: string[][] = (calls[i][1] as any).body;
      const rowInOther = otherTableRows.find(
        row => row[0].includes('art. 79, c. 1, lett. c') || row[0].includes('art. 79, c.1, lett. c')
      );
      expect(rowInOther).toBeUndefined();
    }
  });
});
