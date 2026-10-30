import { resolvedZeroState } from '../../../test/fixtures/ccnlRecovery';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ExcelJS from 'exceljs';

const savedArtifacts = vi.hoisted(() => [] as Array<{ filename: string; blob: Blob }>);
const isolationState = vi.hoisted(() => ({ tempPdfDir: '' }));

vi.mock('file-saver', () => ({
  saveAs: (blob: Blob, filename: string) => {
    savedArtifacts.push({ blob, filename });
  },
}));

vi.mock('jspdf', async (importOriginal) => {
  const actual = await importOriginal<any>();
  const ActualJsPDF = actual.default || actual.jsPDF;
  const fsSyncMod = await import('node:fs');
  const pathMod = await import('node:path');
  class MockJsPDF extends ActualJsPDF {
    constructor(...args: any[]) {
      super(...args);
      const originalSave = this.save.bind(this);
      this.save = (filename: string, options?: any) => {
        if (isolationState.tempPdfDir) {
          const targetPath = pathMod.join(isolationState.tempPdfDir, pathMod.basename(filename));
          const buffer = Buffer.from(this.output('arraybuffer'));
          fsSyncMod.writeFileSync(targetPath, buffer);
          return this;
        }
        return originalSave(filename, options);
      };
    }
  }
  return {
    ...actual,
    default: MockJsPDF,
    jsPDF: MockJsPDF,
  };
});

import { calculateFundCompletely } from '../fundEngine';
import { deriveCanonicalFundResult } from '../canonicalFundLedger';
import { mapToTabella15 } from '../tabella15Mapper';
import { createDocumentViewModel } from '../../../presenters/documentPresenter';
import { generateRelazioneTecnicaTXT } from '../../../services/templates/relazioneTecnicaTemplate';
import { buildDeterminaV2 } from '../../../services/templates/determinaTemplateV2';
import { buildProspettoContrattazione } from '../../../services/documents/documentFactory';
import { generateDeterminaPDF } from '../../../services/documents/pdfDeterminaService';
import { generateTabella15CSV, generateTabella15XLS } from '../../../services/documents/tabella15XlsService';
import type {
  AnnualData,
  CalculationResult,
  DocumentMetadata,
  FundLedgerEntry,
  NormalizedInput,
  NormativeData,
} from '../../../domain';

const outputDir = path.resolve('evidence_wave3_hardening');
const manifest: Record<string, unknown> = {};

const norme = {
  riferimenti_normativi: {
    art23_dlgs75_2017: 'Art. 23 c. 2',
    art67_ccnl2018: 'Art. 67 CCNL 2018',
    art8_dl13_2023: 'Art. 8 DL 13/2023',
  },
} as unknown as NormativeData;

function createInput(
  ente: string,
  anno: number,
  dipendente: Record<string, number> = {},
  overrides: Partial<AnnualData> = {},
): NormalizedInput {
  return {
    historicalData: {
      manualPersonalFundLimit2016: 120000,
      fondoPersonaleNonDirEQ2018_Art23: 100000, fondoEQ2018_Art23: 0,
      personaleServizio2018: 10,
    },
    annualData: {
      annoRiferimento: anno,
      denominazioneEnte: ente, hasDirigenza: false,
      tipologiaEnte: 'Comune',
      manualDipendentiEquivalenti2018: 10,
      manualDipendentiEquivalentiAnnoRif: 10,
      personale2018PerArt23: [{ id: '1', cedoliniEmessi: 12 }],
      personaleAnnoRifPerArt23: [{ id: '1', cedoliniEmessi: 12 }],
      isArt23FteManualMode: true,
      ccnl2024: { monteSalari2021: 1000000 },
      art33ManualDecision: 'DO_NOT_APPLY',
      ...overrides,
    } as unknown as AnnualData,
    fondi: { dipendente, eq: {}, segretario: {}, dirigenza: {} },
    distribuzione: {},
    personaleDettaglio: [],
    calculatedInputs: {
      dipendentiEquivalenti2018: 10,
      dipendentiEquivalentiAnnoRif: 10,
      variazioneDipendenti: 0,
      isArt23FteManualMode: true,
      isArt48Applicabile: false,
      numDipendentiContrattazione: 10,
    },
  };
}

function withEntries(base: CalculationResult, entries: FundLedgerEntry[]): CalculationResult {
  return {
    ...base,
    canonicalFund: deriveCanonicalFundResult(entries),
  };
}

async function flushCapturedArtifacts(prefix: string, anno?: number) {
  const writtenFiles: string[] = [];
  for (const artifact of savedArtifacts.splice(0)) {
    const bytes = new Uint8Array(await artifact.blob.arrayBuffer());
    const finalName = `${prefix}_${artifact.filename}`;
    const targetPath = path.join(outputDir, finalName);
    await fs.writeFile(targetPath, bytes);
    writtenFiles.push(finalName);
  }
  if (anno && isolationState.tempPdfDir) {
    for (const defaultPdfName of [`Determina_Costituzione_Fondo_${anno}.pdf`, `Determina_BOZZA_${anno}.pdf`]) {
      const pdfPath = path.join(isolationState.tempPdfDir, defaultPdfName);
      try {
        const pdfBytes = await fs.readFile(pdfPath);
        const finalPdfName = `${prefix}_${defaultPdfName}`;
        await fs.writeFile(path.join(outputDir, finalPdfName), pdfBytes);
        await fs.unlink(pdfPath);
        writtenFiles.push(finalPdfName);
      } catch {
        // PDF not generated
      }
    }
  }
  return writtenFiles;
}

beforeAll(async () => {
  await fs.mkdir(outputDir, { recursive: true });
  isolationState.tempPdfDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wave3-hardening-'));
});

afterAll(async () => {
  await fs.writeFile(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  );
  if (isolationState.tempPdfDir) {
    try {
      await fs.rm(isolationState.tempPdfDir, { recursive: true, force: true });
    } catch { /* ignore */ }
    isolationState.tempPdfDir = '';
  }
});

describe('Phase 11 — Real Artifact Generation for Scenarios A-G', () => {
  it('Scenario A: Full determined fund (2026) generates complete valid artifacts', async () => {
    const input = createInput('COMUNE_SCENARIO_A', 2026, {
      st_art79c1_art67c1_unicoImporto2017: 50000,
      st_art58c1_CCNL2026_incremento014_MS2021: 1400,
      st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44,
    }, {
      ccnlRecovery: resolvedZeroState(),
      ccnl2024: {
        monteSalari2021: 1000000,
        personaleInServizio01012026: 1,
        valoreTabellaCCol3: 10.62,
      },
    });

    const result = calculateFundCompletely(input, norme);
    const table = mapToTabella15(result, norme);
    const meta: DocumentMetadata = {
      adoptionStatus: 'DOCUMENTED_ADOPTED',
      numDeliberaGc: '10',
      dataDeliberaGc: '15/01/2026',
      opinionOutcome: 'FAVORABLE',
      numVerbaleRevisori: '3',
      dataVerbaleRevisori: '20/01/2026',
      transmissionStatus: 'DOCUMENTED_SENT',
    };
    const vm = createDocumentViewModel(result, 'COMUNE_SCENARIO_A', { name: 'Dr. Rossi', role: 'DIRIGENTE' }, meta);

    const relTxt = generateRelazioneTecnicaTXT(vm);
    const detTxt = buildDeterminaV2(vm);
    const propTxt = buildProspettoContrattazione(vm);

    await fs.writeFile(path.join(outputDir, 'Scenario_A_relazione.txt'), relTxt, 'utf8');
    await fs.writeFile(path.join(outputDir, 'Scenario_A_determina.txt'), detTxt, 'utf8');
    await fs.writeFile(path.join(outputDir, 'Scenario_A_prospetto.txt'), propTxt, 'utf8');

    await generateTabella15XLS(table);
    generateTabella15CSV(table);
    generateDeterminaPDF(vm);

    const files = await flushCapturedArtifacts('Scenario_A', 2026);

    // Inspect files from disk
    const xlsxFile = files.find(f => f.endsWith('.xlsx'))!;
    const csvFile = files.find(f => f.endsWith('.csv'))!;
    const pdfFile = files.find(f => f.endsWith('.pdf'))!;

    const xlsxBuffer = await fs.readFile(path.join(outputDir, xlsxFile));
    const csvContent = await fs.readFile(path.join(outputDir, csvFile), 'utf8');
    const pdfBuffer = await fs.readFile(path.join(outputDir, pdfFile));

    expect(xlsxBuffer.length).toBeGreaterThan(0);
    expect(csvContent.length).toBeGreaterThan(0);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(xlsxBuffer as any);
    const ws = wb.getWorksheet('Tabella 15')!;
    const xlsxRows: unknown[][] = [];
    ws.eachRow(r => xlsxRows.push((r.values as unknown[]).slice(1)));

    expect(xlsxRows.some(r => r.includes('TOTALE GENERALE TABELLA 15'))).toBe(true);
    expect(csvContent).toContain(';TOTALE GENERALE;51272,56;');
    expect(detTxt).toContain('DI COSTITUIRE');
    expect(detTxt).toContain('Del parere favorevole espresso dal Collegio dei Revisori dei Conti con verbale n. 3 del 20/01/2026');

    manifest.scenarioA = {
      status: 'VERIFIED',
      canonicalTotal: result.canonicalFund.total,
      tableGrandTotal: table.grandTotal,
      files: ['Scenario_A_relazione.txt', 'Scenario_A_determina.txt', 'Scenario_A_prospetto.txt', ...files],
    };
  });

  it('Scenario B: Fund with undetermined recovery (Astra A/2025) strictly enforces non-constitutive output', async () => {
    const input = createInput('COMUNE_SCENARIO_B', 2025, {
      st_art58c1_CCNL2026_incremento014_MS2021: 1400,
      st_art79c1_art14c3_art67c2g_riduzioneStraordinario: 2000,
      vn_art58_CCNL2026_arretrati2024_2025: 2800,
      st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44,
    });

    const result = calculateFundCompletely(input, norme);
    const table = mapToTabella15(result, norme);
    const vm = createDocumentViewModel(result, 'COMUNE_SCENARIO_B', { name: 'Dr. Rossi', role: 'DIRIGENTE' });

    const relTxt = generateRelazioneTecnicaTXT(vm);
    const detTxt = buildDeterminaV2(vm);
    const propTxt = buildProspettoContrattazione(vm);

    await fs.writeFile(path.join(outputDir, 'Scenario_B_relazione.txt'), relTxt, 'utf8');
    await fs.writeFile(path.join(outputDir, 'Scenario_B_determina.txt'), detTxt, 'utf8');
    await fs.writeFile(path.join(outputDir, 'Scenario_B_prospetto.txt'), propTxt, 'utf8');

    await generateTabella15XLS(table);
    generateTabella15CSV(table);
    generateDeterminaPDF(vm);

    const files = await flushCapturedArtifacts('Scenario_B', 2025);
    const xlsxFile = files.find(f => f.endsWith('.xlsx'))!;
    const csvFile = files.find(f => f.endsWith('.csv'))!;
    const pdfFile = files.find(f => f.endsWith('.pdf'))!;

    const xlsxBuffer = await fs.readFile(path.join(outputDir, xlsxFile));
    const csvContent = await fs.readFile(path.join(outputDir, csvFile), 'utf8');
    const pdfBuffer = await fs.readFile(path.join(outputDir, pdfFile));

    expect(xlsxBuffer.length).toBeGreaterThan(0);
    expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');

    // Strict semantic assertions: NO unconditional DI COSTITUIRE, NO TOTALE GENERALE
    expect(detTxt).not.toContain('DI COSTITUIRE l\'importo complessivo di Euro € 3400,00');
    expect(detTxt).toContain('DI DARE ATTO, in sede istruttoria, della quantificazione del subtotale delle risorse verificate');
    expect(relTxt).toContain('SUBTOTALE DELLE RISORSE VERIFICATE: Euro € 3400,00');
    expect(relTxt).toContain('TOTALE COMPLESSIVO DEL FONDO: NON ANCORA DETERMINABILE');
    expect(propTxt).toContain('Subtotale Risorse Verificate: € 3400,00');
    expect(propTxt).toContain('Totale Complessivo Fondo: NON ANCORA DETERMINABILE');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(xlsxBuffer as any);
    const ws = wb.getWorksheet('Tabella 15')!;
    const xlsxRows: unknown[][] = [];
    ws.eachRow(r => xlsxRows.push((r.values as unknown[]).slice(1)));

    expect(xlsxRows.some(r => r.includes('TOTALE GENERALE TABELLA 15'))).toBe(false);
    expect(xlsxRows.some(r => r.includes('SUBTOTALE VERIFICATO'))).toBe(true);
    expect(csvContent).toContain(';SUBTOTALE VERIFICATO;3400,00;(TOTALE COMPLESSIVO NON DETERMINABILE)');
    expect(csvContent).not.toContain(';TOTALE GENERALE;');

    manifest.scenarioB = {
      status: 'VERIFIED',
      verifiedSubtotal: table.verifiedSubtotal,
      grandTotal: table.grandTotal,
      isDetermined: vm.projection?.isDetermined,
      files: ['Scenario_B_relazione.txt', 'Scenario_B_determina.txt', 'Scenario_B_prospetto.txt', ...files],
    };
  });

  it('Scenario C: Unresolved RGS mapping triggers RGS_MAPPING_UNRESOLVED and blocks definitive export', async () => {
    const base = calculateFundCompletely(createInput('COMUNE_SCENARIO_C', 2026), norme);
    const unmappedResult = withEntries(base, [
      { id: 'CCNL_014_CURRENT', amount: 50000, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'MANUAL', art23Treatment: 'SUBJECT', status: 'VALID' },
      { id: 'CUSTOM_UNKNOWN_ENTRY', amount: 500, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'MANUAL', art23Treatment: 'SUBJECT', status: 'VALID' },
    ]);

    const table = mapToTabella15(unmappedResult, norme);
    expect(table.unresolvedClassifications.length).toBe(1);
    expect(table.unresolvedClassifications[0].key).toBe('CUSTOM_UNKNOWN_ENTRY');
    expect(table.unresolvedClassifications[0].reason).toContain('priva di mapping Tabella 15');
    expect(table.grandTotal).toBeNull();
    expect(table.isExportReady).toBe(false);

    await generateTabella15XLS(table);
    generateTabella15CSV(table);

    const files = await flushCapturedArtifacts('Scenario_C');
    const xlsxFile = files.find(f => f.endsWith('.xlsx'))!;
    const csvFile = files.find(f => f.endsWith('.csv'))!;

    const xlsxBuffer = await fs.readFile(path.join(outputDir, xlsxFile));
    const csvContent = await fs.readFile(path.join(outputDir, csvFile), 'utf8');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(xlsxBuffer as any);
    const ws = wb.getWorksheet('Tabella 15')!;
    const xlsxRows: unknown[][] = [];
    ws.eachRow(r => xlsxRows.push((r.values as unknown[]).slice(1)));

    expect(xlsxRows.some(r => r.includes('CLASSIFICAZIONI RGS NON RISOLTE'))).toBe(true);
    expect(csvContent).toContain('AVVERTENZE CLASSIFICAZIONI RGS NON RISOLTE;1');
    expect(csvContent).toContain('RGS_MAPPING_UNRESOLVED;CUSTOM_UNKNOWN_ENTRY;500,00;');

    manifest.scenarioC = {
      status: 'VERIFIED',
      unresolvedCount: table.unresolvedClassifications.length,
      isExportReady: table.isExportReady,
      files,
    };
  });

  it('Scenario D: Reviewer metadata with number/date but no favorable outcome renders neutral text', async () => {
    const input = createInput('COMUNE_SCENARIO_D', 2026, {
      st_art79c1_art67c1_unicoImporto2017: 50000,
    });
    const result = calculateFundCompletely(input, norme);
    const meta: DocumentMetadata = {
      numVerbaleRevisori: '12',
      dataVerbaleRevisori: '15/03/2026',
      opinionOutcome: 'UNKNOWN',
    };
    const vm = createDocumentViewModel(result, 'COMUNE_SCENARIO_D', { name: 'Auditor', role: 'UTENTE' }, meta);
    const detTxt = buildDeterminaV2(vm);

    await fs.writeFile(path.join(outputDir, 'Scenario_D_determina.txt'), detTxt, 'utf8');

    expect(detTxt).not.toContain('Del parere favorevole espresso');
    expect(detTxt).toContain("Verbale n. 12 del 15/03/2026. L'esito del parere dell'Organo di Revisione non risulta documentato nei dati disponibili;");

    manifest.scenarioD = {
      status: 'VERIFIED',
      opinionOutcome: meta.opinionOutcome,
      files: ['Scenario_D_determina.txt'],
    };
  });

  it('Scenario E: Reviewer transmission not documented renders neutral text', async () => {
    const input = createInput('COMUNE_SCENARIO_E', 2026, {
      st_art79c1_art67c1_unicoImporto2017: 50000,
    });
    const result = calculateFundCompletely(input, norme);
    const meta: DocumentMetadata = {
      transmissionStatus: 'NOT_DOCUMENTED',
    };
    const vm = createDocumentViewModel(result, 'COMUNE_SCENARIO_E', { name: 'Auditor', role: 'UTENTE' }, meta);
    const detTxt = buildDeterminaV2(vm);

    await fs.writeFile(path.join(outputDir, 'Scenario_E_determina.txt'), detTxt, 'utf8');

    expect(detTxt).not.toContain('il presente provvedimento viene trasmesso');
    expect(detTxt).toContain('Gli estremi e l\'esito del parere dell\'Organo di Revisione non risultano documentati nei dati disponibili;');

    manifest.scenarioE = {
      status: 'VERIFIED',
      transmissionStatus: meta.transmissionStatus,
      files: ['Scenario_E_determina.txt'],
    };
  });

  it('Scenario F: Giunta Comunale adoption not documented renders neutral text', async () => {
    const input = createInput('COMUNE_SCENARIO_F', 2026, {
      st_art79c1_art67c1_unicoImporto2017: 50000,
    });
    const result = calculateFundCompletely(input, norme);
    const meta: DocumentMetadata = {
      adoptionStatus: 'NOT_DOCUMENTED',
    };
    const vm = createDocumentViewModel(result, 'COMUNE_SCENARIO_F', { name: 'Auditor', role: 'UTENTE' }, meta);
    const detTxt = buildDeterminaV2(vm);

    await fs.writeFile(path.join(outputDir, 'Scenario_F_determina.txt'), detTxt, 'utf8');

    expect(detTxt).not.toContain('La deliberazione della G.C. n.');
    expect(detTxt).toContain('La deliberazione di indirizzo della Giunta Comunale non risulta documentata nei dati disponibili;');

    manifest.scenarioF = {
      status: 'VERIFIED',
      adoptionStatus: meta.adoptionStatus,
      files: ['Scenario_F_determina.txt'],
    };
  });

  it('Scenario G: Half-cent rounding 100.005 rounds uniformly to 100.01 across ledger, XLSX, and CSV', async () => {
    const base = calculateFundCompletely(createInput('COMUNE_SCENARIO_G', 2026), norme);
    const roundResult = withEntries(base, [
      { id: 'CCNL_014_CURRENT', amount: 100.005, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'MANUAL', art23Treatment: 'SUBJECT', status: 'VALID' },
    ]);

    const table = mapToTabella15(roundResult, norme);
    expect(roundResult.canonicalFund.total).toBe(100.01);
    expect(table.grandTotal).toBe(100.01);

    await generateTabella15XLS(table);
    generateTabella15CSV(table);

    const files = await flushCapturedArtifacts('Scenario_G');
    const xlsxFile = files.find(f => f.endsWith('.xlsx'))!;
    const csvFile = files.find(f => f.endsWith('.csv'))!;

    const xlsxBuffer = await fs.readFile(path.join(outputDir, xlsxFile));
    const csvContent = await fs.readFile(path.join(outputDir, csvFile), 'utf8');

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(xlsxBuffer as any);
    const ws = wb.getWorksheet('Tabella 15')!;
    const xlsxRows: unknown[][] = [];
    ws.eachRow(r => xlsxRows.push((r.values as unknown[]).slice(1)));

    // Verify cell numeric value is 100.01
    const totalRow = xlsxRows.find(r => r.includes('TOTALE GENERALE TABELLA 15'))!;
    expect(totalRow).toContain(100.01);
    expect(totalRow).not.toContain(100.005);

    // Verify CSV text is 100,01
    expect(csvContent).toContain(';TOTALE GENERALE;100,01;');
    expect(csvContent).not.toContain('100,005');
    expect(csvContent).not.toContain('100,00;');

    manifest.scenarioG = {
      status: 'VERIFIED',
      canonicalTotal: roundResult.canonicalFund.total,
      tableTotal: table.grandTotal,
      xlsxTotal: 100.01,
      csvTotal: '100,01',
      files,
    };
  });
});
