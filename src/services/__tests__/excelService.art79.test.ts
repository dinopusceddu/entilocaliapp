import { describe, it, expect, vi, afterEach } from 'vitest';
import * as XLSX from 'xlsx';
import { generateExcelTemplate, parseExcelData } from '../excelService';
import { FundData } from '../../types';

describe('ExcelService - Art. 79 c.1 lett. c semantic corrections (Public API)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('A1. generateExcelTemplate() produces row with technical key and exact label "Incremento stabile della consistenza di personale (Art. 79 c. 1 lett. c)"', () => {
    let capturedWorkbook: XLSX.WorkBook | null = null;
    vi.spyOn(XLSX, 'writeFile').mockImplementation((wb: XLSX.WorkBook) => {
      capturedWorkbook = wb;
    });

    const mockData: FundData = {
      annualData: {} as any,
      historicalData: {} as any,
      fondoAccessorioDipendenteData: {
        st_art79c1c_incrementoStabileConsistenzaPers: 15000,
      } as any,
      fondoElevateQualificazioniData: {} as any,
      fondoSegretarioComunaleData: {} as any,
      fondoDirigenzaData: {} as any,
      distribuzioneRisorseData: {} as any,
      personaleServizio: {} as any,
    };

    generateExcelTemplate(mockData);

    expect(capturedWorkbook).not.toBeNull();
    const sheet = capturedWorkbook!.Sheets['Dati Fondo'];
    expect(sheet).toBeDefined();

    const rows = XLSX.utils.sheet_to_json<any>(sheet);
    const art79Row = rows.find(
      (r: any) => r['Chiave Tecnica (NON MODIFICARE)'] === 'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers'
    );

    expect(art79Row).toBeDefined();
    expect(art79Row['Descrizione Campo']).toBe(
      'Incremento stabile della consistenza di personale (Art. 79 c. 1 lett. c)'
    );
    expect(art79Row['Sezione']).toBe('4. Fondo Dipendenti (Stabili)');
    expect(art79Row['Valore']).toBe(15000);
  });

  it('A2. generateExcelTemplate() maintains label "Incremento 0,22% MS 2018 (Art. 79 c.3)" for Art. 79 comma 3', () => {
    let capturedWorkbook: XLSX.WorkBook | null = null;
    vi.spyOn(XLSX, 'writeFile').mockImplementation((wb: XLSX.WorkBook) => {
      capturedWorkbook = wb;
    });

    const mockData: FundData = {
      annualData: {} as any,
      historicalData: {} as any,
      fondoAccessorioDipendenteData: {
        vn_art79c3_022MonteSalari2018_da2022Proporzionale: 2500,
      } as any,
      fondoElevateQualificazioniData: {} as any,
      fondoSegretarioComunaleData: {} as any,
      fondoDirigenzaData: {} as any,
      distribuzioneRisorseData: {} as any,
      personaleServizio: {} as any,
    };

    generateExcelTemplate(mockData);

    expect(capturedWorkbook).not.toBeNull();
    const sheet = capturedWorkbook!.Sheets['Dati Fondo'];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);
    const art79c3Row = rows.find(
      (r: any) => r['Chiave Tecnica (NON MODIFICARE)'] === 'fondoAccessorioDipendenteData.vn_art79c3_022MonteSalari2018_da2022Proporzionale'
    );

    expect(art79c3Row).toBeDefined();
    expect(art79c3Row['Descrizione Campo']).toBe('Incremento 0,22% MS 2018 (Art. 79 c.3)');
    expect(art79c3Row['Sezione']).toBe('5. Fondo Dipendenti (Variabili)');
    expect(art79c3Row['Valore']).toBe(2500);
  });

  it('A3. parseExcelData() imports data via technical key even if file contains the old legacy label', async () => {
    // Simulate an Excel file generated with the OLD label: "Incremento 0,22% MS 2018 (Art. 79 c.1c)"
    const legacyRows = [
      {
        'Sezione': '4. Fondo Dipendenti (Stabili)',
        'Descrizione Campo': 'Incremento 0,22% MS 2018 (Art. 79 c.1c)', // OLD description
        'Valore': 12500,
        'Chiave Tecnica (NON MODIFICARE)': 'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers'
      },
      {
        'Sezione': '5. Fondo Dipendenti (Variabili)',
        'Descrizione Campo': 'Incremento 0,22% MS 2018 (Art. 79 c.3)',
        'Valore': 3400,
        'Chiave Tecnica (NON MODIFICARE)': 'fondoAccessorioDipendenteData.vn_art79c3_022MonteSalari2018_da2022Proporzionale'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(legacyRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dati Fondo');
    const binary = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    // Convert binary string to File
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i) & 0xFF;
    }
    const file = new File([buffer], 'test_legacy.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const parsed = await parseExcelData(file);

    expect(parsed.fondoAccessorioDipendenteData?.st_art79c1c_incrementoStabileConsistenzaPers).toBe(12500);
    expect(parsed.fondoAccessorioDipendenteData?.vn_art79c3_022MonteSalari2018_da2022Proporzionale).toBe(3400);
  });
});
