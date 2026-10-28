import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const savedArtifacts = vi.hoisted(() => [] as Array<{ filename: string; blob: Blob }>);
const isolationState = vi.hoisted(() => ({ currentTestDir: '' }));

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
        if (isolationState.currentTestDir) {
          const targetPath = pathMod.join(isolationState.currentTestDir, pathMod.basename(filename));
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

vi.mock('lucide-react', () => ({
  Undo2: (props: any) => <span data-testid="icon-Undo2" {...props} />,
  AlertCircle: (props: any) => <span data-testid="icon-AlertCircle" {...props} />,
  CheckCircle2: (props: any) => <span data-testid="icon-CheckCircle2" {...props} />,
  AlertTriangle: (props: any) => <span data-testid="icon-AlertTriangle" {...props} />,
  Info: (props: any) => <span data-testid="icon-Info" {...props} />,
  FileText: (props: any) => <span data-testid="icon-FileText" {...props} />,
  Download: (props: any) => <span data-testid="icon-Download" {...props} />,
  Table: (props: any) => <span data-testid="icon-Table" {...props} />,
  Check: (props: any) => <span data-testid="icon-Check" {...props} />,
  Save: (props: any) => <span data-testid="icon-Save" {...props} />,
  HelpCircle: (props: any) => <span data-testid="icon-HelpCircle" {...props} />,
}));

import { deriveCanonicalFundResult } from '../canonicalFundLedger';
import { DocumentFactory } from '../../../services/documents/documentFactory';
import { mapToTabella15 } from '../tabella15Mapper';
import {
  assertDefinitiveTabella15ExportAllowed,
  exportDefinitiveTabella15XLS,
  exportDefinitiveTabella15CSV,
} from '../../../services/reportService';
import { ReportsPage } from '../../../pages/ReportsPage';
import { UserRole } from '../../../domain/enums';
import type { CalculationResult, NormativeData, User } from '../../../domain';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// AppContext mock controller
let mockCurrentState: any = {};
const mockDispatch = vi.fn();

vi.mock('../../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: mockCurrentState,
    dispatch: mockDispatch,
  }),
}));

const mockNormative: NormativeData = {
  riferimenti_normativi: {
    art23_dlgs75_2017: 'Art. 23 c. 2',
    art67_ccnl2018: 'Art. 67 CCNL 2018',
  }
} as unknown as NormativeData;

vi.mock('../../../hooks/useNormativeData', () => ({
  useNormativeData: () => ({
    data: mockNormative,
    isLoading: false,
  }),
}));

const testUser: User = {
  id: 'u-admin',
  email: 'admin@ente.it',
  role: UserRole.ADMIN,
  name: 'Responsabile Personale'
};

const buildMockValidResult = (): CalculationResult => ({
  metadata: { annoRiferimento: 2026, denominazioneEnte: 'Comune di Test' },
  inputs: { tipologiaEnte: 'Comune' } as any,
  fondi: {
    dipendente: {
      label: 'Fondo Dipendenti',
      summary: { totaleFondo: 277.44 },
      constitution: { sections: { stabili: { id: 's', items: [] }, variabili: { id: 'v', items: [] } } }
    } as any,
    eq: { label: 'EQ', summary: { totaleFondo: 0 } } as any,
    segretario: { label: 'Segretario', summary: { totaleFondo: 0 } } as any,
    dirigenza: { label: 'Dirigenza', summary: { totaleFondo: 0 } } as any
  },
  compliance: { art23c2: { limite: 50000, valoreSoggetto: 277.44, delta: 0, isCompliant: true } } as any,
  canonicalFund: deriveCanonicalFundResult([
    {
      id: 'CCNL_014_CURRENT',
      amount: 150.00,
      component: 'STABLE',
      operation: 'ADDITION',
      competenceYear: 2026,
      source: 'CALCULATED',
      art23Treatment: 'SUBJECT',
      status: 'VALID'
    },
    {
      id: 'ART60_CONSOLIDATION',
      amount: 127.44,
      component: 'STABLE',
      operation: 'ADDITION',
      competenceYear: 2026,
      source: 'CALCULATED',
      art23Treatment: 'EXCLUDED',
      status: 'VALID'
    }
  ])
} as unknown as CalculationResult);

const buildMockUndeterminedResult = (): CalculationResult => ({
  metadata: { annoRiferimento: 2026, denominazioneEnte: 'Comune di Test' },
  inputs: { tipologiaEnte: 'Comune' } as any,
  fondi: {
    dipendente: {
      label: 'Fondo Dipendenti',
      summary: { totaleFondo: 277.44 },
      constitution: { sections: { stabili: { id: 's', items: [] }, variabili: { id: 'v', items: [] } } }
    } as any,
    eq: { label: 'EQ', summary: { totaleFondo: 0 } } as any,
    segretario: { label: 'Segretario', summary: { totaleFondo: 0 } } as any,
    dirigenza: { label: 'Dirigenza', summary: { totaleFondo: 0 } } as any
  },
  compliance: { art23c2: { limite: 50000, valoreSoggetto: 277.44, delta: 0, isCompliant: true } } as any,
  canonicalFund: deriveCanonicalFundResult([
    {
      id: 'CCNL_014_CURRENT',
      amount: 150.00,
      component: 'STABLE',
      operation: 'ADDITION',
      competenceYear: 2026,
      source: 'CALCULATED',
      art23Treatment: 'SUBJECT',
      status: 'UNDETERMINED'
    }
  ])
} as unknown as CalculationResult);

const buildMockMissingCanonicalResult = (): CalculationResult => ({
  metadata: { annoRiferimento: 2026, denominazioneEnte: 'Comune di Test' },
  inputs: { tipologiaEnte: 'Comune' } as any,
  fondi: {
    dipendente: {
      label: 'Fondo Dipendenti',
      summary: { totaleFondo: 20000 },
      constitution: { sections: { stabili: { id: 's', items: [] }, variabili: { id: 'v', items: [] } } }
    } as any,
    eq: { label: 'EQ', summary: { totaleFondo: 0 } } as any,
    segretario: { label: 'Segretario', summary: { totaleFondo: 0 } } as any,
    dirigenza: { label: 'Dirigenza', summary: { totaleFondo: 0 } } as any
  },
  compliance: { art23c2: { limite: 50000, valoreSoggetto: 20000, delta: 0, isCompliant: true } } as any,
  canonicalFund: undefined
} as unknown as CalculationResult);

describe('Wave 3 UI Wiring Suite (W1 - W11)', () => {
  beforeEach(async () => {
    savedArtifacts.length = 0;
    mockDispatch.mockClear();
    isolationState.currentTestDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'wave3-ui-wiring-'));
  });

  afterEach(async () => {
    if (isolationState.currentTestDir) {
      try {
        await fs.promises.rm(isolationState.currentTestDir, { recursive: true, force: true });
      } catch { /* ignore */ }
      isolationState.currentTestDir = '';
    }
  });

  // W1: ReportsPage / fondo VALID -> export definitivo consentito e usa wrapper definitivi
  it('W1 — ReportsPage / fondo VALID: export definitivo consentito con wrapper definitivo', () => {
    const validResult = buildMockValidResult();
    mockCurrentState = {
      isLoading: false,
      calculationResult: validResult,
      currentUser: testUser,
      fundData: {
        annualData: {
          denominazioneEnte: 'Comune di Test',
          documentMetadata: { numeroDetermina: '10', dataDetermina: '2026-03-15' }
        }
      }
    };

    render(<ReportsPage />);

    // Verifico presenza bottoni definitivi
    expect(screen.getByText('Genera Determina Definitiva (PDF)')).toBeInTheDocument();
    expect(screen.getByText('Determina Definitiva (TXT)')).toBeInTheDocument();
    expect(screen.getByText('Relazione Tecnica Definitiva')).toBeInTheDocument();
    expect(screen.getByText('Prospetto Definitivo')).toBeInTheDocument();
    expect(screen.getByText('Scarica Riconciliazione Definitiva (XLS)')).toBeInTheDocument();
    expect(screen.getByText('Scarica Riconciliazione Definitiva (CSV)')).toBeInTheDocument();

    // Verifico che la factory autorizzi l'export definitivo
    const factory = new DocumentFactory(validResult, 'Comune di Test', testUser);
    expect(factory.isDefinitiveExportReady()).toBe(true);
    expect(() => factory.assertDefinitiveExportAllowed()).not.toThrow();
  });

  // W2: ReportsPage / UNDETERMINED -> definitivo bloccato, preview bozza disponibile, nessun bypass
  it('W2 — ReportsPage / UNDETERMINED: definitivo bloccato, preview bozza esplicita, nessun bypass', () => {
    const undetResult = buildMockUndeterminedResult();
    mockCurrentState = {
      isLoading: false,
      calculationResult: undetResult,
      currentUser: testUser,
      fundData: {
        annualData: {
          denominazioneEnte: 'Comune di Test',
          documentMetadata: {}
        }
      }
    };

    render(<ReportsPage />);

    // Verifica presenza bottoni bozza
    expect(screen.getByText('Scarica Bozza Determina (PDF)')).toBeInTheDocument();
    expect(screen.getByText('Bozza Determina (TXT)')).toBeInTheDocument();
    expect(screen.getByText('Bozza Relazione Tecnica')).toBeInTheDocument();
    expect(screen.getByText('Bozza Prospetto')).toBeInTheDocument();

    // Verifica bottone definitivo bloccato e disabilitato
    const blockedBtn = screen.getByText('Determina Definitiva (Bloccata)');
    expect(blockedBtn).toBeInTheDocument();
    expect(blockedBtn).toBeDisabled();

    // Verifica che l'invocazione del wrapper definitivo sollevi eccezione
    const factory = new DocumentFactory(undetResult, 'Comune di Test', testUser);
    expect(factory.isDefinitiveExportReady()).toBe(false);
    expect(() => factory.exportDefinitiveDetermina()).toThrow(/Export definitivo bloccato/);
    expect(() => factory.exportDefinitiveDeterminaPDF()).toThrow(/Export definitivo bloccato/);
    expect(() => factory.exportDefinitiveRelazioneTecnica()).toThrow(/Export definitivo bloccato/);
    expect(() => factory.exportDefinitiveProspetto()).toThrow(/Export definitivo bloccato/);
  });

  // W3: canonicalFund assente -> definitivo bloccato, solo preview legacy
  it('W3 — canonicalFund assente: definitivo bloccato, solo anteprima legacy consentita', () => {
    const missingResult = buildMockMissingCanonicalResult();
    const factory = new DocumentFactory(missingResult, 'Comune di Test', testUser);

    expect(factory.isDefinitiveExportReady()).toBe(false);
    expect(() => factory.assertDefinitiveExportAllowed()).toThrow(/privo di CanonicalFundLedger/);
    expect(() => factory.exportDefinitiveDetermina()).toThrow(/privo di CanonicalFundLedger/);

    // Anteprima legacy consentita con prefix corretto
    factory.previewDraftDetermina();
    expect(savedArtifacts.some(a => a.filename.includes('Determina_LEGACY_PREVIEW_'))).toBe(true);
  });

  // W4: mapping RGS unresolved -> XLSX/CSV definitivo bloccato
  it('W4 — mapping RGS unresolved: XLSX/CSV definitivo bloccato da guardrail', async () => {
    const unresolvedResult: CalculationResult = {
      ...buildMockValidResult(),
      canonicalFund: deriveCanonicalFundResult([
        {
          id: 'UNKNOWN_VOICE_X',
          amount: 500,
          component: 'STABLE',
          operation: 'ADDITION',
          competenceYear: 2026,
          source: 'MANUAL',
          art23Treatment: 'SUBJECT',
          status: 'VALID'
        }
      ])
    };

    const table = mapToTabella15(unresolvedResult, mockNormative);
    expect(table.unresolvedClassifications.length).toBeGreaterThan(0);
    expect(table.grandTotal).toBeNull();
    expect(table.isArithmeticExportReady).toBe(false);

    expect(() => assertDefinitiveTabella15ExportAllowed(table)).toThrow(/Export definitivo Tabella 15 bloccato/);
    await expect(exportDefinitiveTabella15XLS(unresolvedResult, mockNormative)).rejects.toThrow(/Export definitivo Tabella 15 bloccato/);
    expect(() => exportDefinitiveTabella15CSV(unresolvedResult, mockNormative)).toThrow(/Export definitivo Tabella 15 bloccato/);
  });

  // W5: arithmetic ready / RGS unverified -> nessuna dicitura SICO-ready
  it('W5 — arithmetic ready / RGS unverified: nessuna dicitura SICO-ready o ministeriale', async () => {
    const validResult = buildMockValidResult();
    const table = mapToTabella15(validResult, mockNormative);

    expect(table.isArithmeticExportReady).toBe(true);
    expect(table.isSicoExportReady).toBe(false);
    expect(table.schemaVerificationStatus).toBe('RGS_SCHEMA_UNVERIFIED');

    const srcReports = await fs.promises.readFile(path.resolve('src/pages/ReportsPage.tsx'), 'utf8');
    const srcTable = await fs.promises.readFile(path.resolve('src/pages/Tabella15Page.tsx'), 'utf8');

    // Assenza di diciture false
    expect(srcReports).not.toContain('Export SICO');
    expect(srcReports).not.toContain('Pronto SICO');
    expect(srcReports).not.toContain('Validato RGS');
    expect(srcReports).not.toContain('File ufficiale SICO');

    expect(srcTable).not.toContain('Pronto SICO');
    expect(srcTable).not.toContain('Validato RGS');

    // Presenza avviso non ministeriale
    expect(srcReports).toContain('Schema RGS/SICO annuale non verificato — file non validato per trasmissione ministeriale');
    expect(srcTable).toContain('Questa Tabella 15 non è stata validata con lo schema ministeriale annuale RGS/SICO');
  });

  // W6: handler XLS passa esplicitamente la modalità attesa
  it('W6 — handler XLS: ReportsPage invoca exportDefinitiveTabella15XLS e previewDraftTabella15XLS', async () => {
    const src = await fs.promises.readFile(path.resolve('src/pages/ReportsPage.tsx'), 'utf8');
    expect(src).toContain('exportDefinitiveTabella15XLS(calculationResult, normativeData)');
    expect(src).toContain('previewDraftTabella15XLS(calculationResult, normativeData)');
    expect(src).not.toMatch(/generateTabella15ExportXLS\([^)]*\)\s*;/); // non usa chiamate senza mode
  });

  // W7: handler CSV passa esplicitamente la modalità attesa
  it('W7 — handler CSV: ReportsPage invoca exportDefinitiveTabella15CSV e previewDraftTabella15CSV', async () => {
    const src = await fs.promises.readFile(path.resolve('src/pages/ReportsPage.tsx'), 'utf8');
    expect(src).toContain('exportDefinitiveTabella15CSV(calculationResult, normativeData)');
    expect(src).toContain('previewDraftTabella15CSV(calculationResult, normativeData)');
    expect(src).not.toMatch(/generateTabella15ExportCSV\([^)]*\)\s*;/); // non usa chiamate senza mode
  });

  // W8: Determina definitiva usa wrapper definitivo
  it('W8 — Determina definitiva: invoca exportDefinitiveDetermina() con guardrail', () => {
    const validResult = buildMockValidResult();
    const factory = new DocumentFactory(validResult, 'Comune di Test', testUser);

    factory.exportDefinitiveDetermina();
    const emitted = savedArtifacts.find(a => a.filename.includes('Determina_Costituzione_Fondo_'));
    expect(emitted).toBeDefined();

    const undetResult = buildMockUndeterminedResult();
    const badFactory = new DocumentFactory(undetResult, 'Comune di Test', testUser);
    expect(() => badFactory.exportDefinitiveDetermina()).toThrow(/Export definitivo bloccato/);
  });

  // W9: PDF definitivo usa wrapper definitivo
  it('W9 — PDF definitivo: invoca exportDefinitiveDeterminaPDF() con guardrail', () => {
    const validResult = buildMockValidResult();
    const factory = new DocumentFactory(validResult, 'Comune di Test', testUser);

    expect(() => factory.exportDefinitiveDeterminaPDF()).not.toThrow();

    const undetResult = buildMockUndeterminedResult();
    const badFactory = new DocumentFactory(undetResult, 'Comune di Test', testUser);
    expect(() => badFactory.exportDefinitiveDeterminaPDF()).toThrow(/Export definitivo bloccato/);
  });

  // W10: Relazione definitiva usa wrapper definitivo
  it('W10 — Relazione definitiva: invoca exportDefinitiveRelazioneTecnica() con guardrail', () => {
    const validResult = buildMockValidResult();
    const factory = new DocumentFactory(validResult, 'Comune di Test', testUser);

    factory.exportDefinitiveRelazioneTecnica();
    const emitted = savedArtifacts.find(a => a.filename.includes('Relazione_Tecnica_Fondo_'));
    expect(emitted).toBeDefined();

    const undetResult = buildMockUndeterminedResult();
    const badFactory = new DocumentFactory(undetResult, 'Comune di Test', testUser);
    expect(() => badFactory.exportDefinitiveRelazioneTecnica()).toThrow(/Export definitivo bloccato/);
  });

  // W11: Prospetto definitivo usa wrapper definitivo
  it('W11 — Prospetto definitivo: invoca exportDefinitiveProspetto() con guardrail', () => {
    const validResult = buildMockValidResult();
    const factory = new DocumentFactory(validResult, 'Comune di Test', testUser);

    factory.exportDefinitiveProspetto();
    const emitted = savedArtifacts.find(a => a.filename.includes('Prospetto_Contrattazione_'));
    expect(emitted).toBeDefined();

    const undetResult = buildMockUndeterminedResult();
    const badFactory = new DocumentFactory(undetResult, 'Comune di Test', testUser);
    expect(() => badFactory.exportDefinitiveProspetto()).toThrow(/Export definitivo bloccato/);
  });

  // MG1: VALID + previewDraftDeterminaPDF() -> draft PDF with banner, no DI COSTITUIRE, draft filename
  it('MG1 — VALID + previewDraftDeterminaPDF(): generates draft PDF without DI COSTITUIRE and with Determina_BOZZA_ filename', async () => {
    const validResult = buildMockValidResult();
    const factory = new DocumentFactory(validResult, 'Comune di Test', testUser);

    factory.previewDraftDeterminaPDF();

    const draftPdfPath = path.join(isolationState.currentTestDir, 'Determina_BOZZA_2026.pdf');
    const exists = await fs.promises.stat(draftPdfPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    const pdfBytes = await fs.promises.readFile(draftPdfPath);
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    const pdf = await (pdfjs as any).getDocument({ data: new Uint8Array(pdfBytes), disableWorker: true }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      pages.push(textContent.items.map((it: any) => it.str).join(' '));
    }
    const fullText = pages.join('\n');

    expect(fullText).toContain('[SCHEMA DI ATTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]');
    expect(fullText).not.toContain('DI COSTITUIRE');
    expect(fullText).toContain('DI DARE ATTO, in sede istruttoria');

    await fs.promises.unlink(draftPdfPath);
  });

  // MG2: VALID + previewDraftDetermina() -> draft text, no DI COSTITUIRE, Determina_BOZZA_ prefix
  it('MG2 — VALID + previewDraftDetermina(): generates draft TXT without DI COSTITUIRE and with Determina_BOZZA_ filename', async () => {
    const validResult = buildMockValidResult();
    const factory = new DocumentFactory(validResult, 'Comune di Test', testUser);

    factory.previewDraftDetermina();
    const artifact = savedArtifacts.find(a => a.filename.includes('Determina_BOZZA_2026.txt'));
    expect(artifact).toBeDefined();

    const text = await artifact!.blob.text();
    expect(text).toContain('[SCHEMA DI ATTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]');
    expect(text).not.toContain('DI COSTITUIRE');
    expect(text).toContain('DI DARE ATTO, in sede istruttoria');
  });

  // MG3: VALID + previewDraftRelazioneTecnica() -> draft text, proposal clause, no definitive grand total
  it('MG3 — VALID + previewDraftRelazioneTecnica(): generates draft Relazione with Relazione_BOZZA_ filename and proposal clause', async () => {
    const validResult = buildMockValidResult();
    const factory = new DocumentFactory(validResult, 'Comune di Test', testUser);

    factory.previewDraftRelazioneTecnica();
    const artifact = savedArtifacts.find(a => a.filename.includes('Relazione_BOZZA_2026.txt'));
    expect(artifact).toBeDefined();

    const text = await artifact!.blob.text();
    expect(text).toContain('[DOCUMENTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]');
    expect(text).toContain('in schema di proposta');
    expect(text).not.toContain('TOTALE GENERALE:');
    expect(text).toContain('SUBTOTALE DELLE RISORSE VERIFICATE:');
  });

  // MG4: VALID + previewDraftProspetto() -> draft text, Prospetto_BOZZA_ filename, no definitive total
  it('MG4 — VALID + previewDraftProspetto(): generates draft Prospetto with Prospetto_BOZZA_ filename', async () => {
    const validResult = buildMockValidResult();
    const factory = new DocumentFactory(validResult, 'Comune di Test', testUser);

    factory.previewDraftProspetto();
    const artifact = savedArtifacts.find(a => a.filename.includes('Prospetto_BOZZA_2026.txt'));
    expect(artifact).toBeDefined();

    const text = await artifact!.blob.text();
    expect(text).toContain('[BOZZA NON DEFINITIVA - IN ISTRUTTORIA]');
    expect(text).not.toContain('Totale Disponibile Fondo Dipendenti:');
    expect(text).toContain('Subtotale Risorse Verificate:');
  });

  // MG5: VALID + exportDefinitiveDeterminaPDF() -> definitive PDF, DI COSTITUIRE, no draft banner, definitive filename
  it('MG5 — VALID + exportDefinitiveDeterminaPDF(): generates definitive PDF with DI COSTITUIRE and no draft banner', async () => {
    const validResult = buildMockValidResult();
    const factory = new DocumentFactory(validResult, 'Comune di Test', testUser);

    factory.exportDefinitiveDeterminaPDF();

    const defPdfPath = path.join(isolationState.currentTestDir, 'Determina_Costituzione_Fondo_2026.pdf');
    const exists = await fs.promises.stat(defPdfPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    const pdfBytes = await fs.promises.readFile(defPdfPath);
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    const pdf = await (pdfjs as any).getDocument({ data: new Uint8Array(pdfBytes), disableWorker: true }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      pages.push(textContent.items.map((it: any) => it.str).join(' '));
    }
    const fullText = pages.join('\n');

    expect(fullText).toContain('DI COSTITUIRE');
    expect(fullText).not.toContain('[SCHEMA DI ATTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]');

    await fs.promises.unlink(defPdfPath);
  });

  // MG6: UNDETERMINED + definitive -> blocked
  it('MG6 — UNDETERMINED + definitive: all definitive export wrappers are blocked', () => {
    const undetResult = buildMockUndeterminedResult();
    const factory = new DocumentFactory(undetResult, 'Comune di Test', testUser);

    expect(() => factory.exportDefinitiveDetermina()).toThrow(/Export definitivo bloccato/);
    expect(() => factory.exportDefinitiveDeterminaPDF()).toThrow(/Export definitivo bloccato/);
    expect(() => factory.exportDefinitiveRelazioneTecnica()).toThrow(/Export definitivo bloccato/);
    expect(() => factory.exportDefinitiveProspetto()).toThrow(/Export definitivo bloccato/);
  });

  // MG7: UNDETERMINED + preview -> draft produced
  it('MG7 — UNDETERMINED + preview: all preview wrappers produce draft semantics', async () => {
    const undetResult = buildMockUndeterminedResult();
    const factory = new DocumentFactory(undetResult, 'Comune di Test', testUser);

    factory.previewDraftDeterminaPDF();
    const draftPdfPath = path.join(isolationState.currentTestDir, 'Determina_BOZZA_2026.pdf');
    expect(await fs.promises.stat(draftPdfPath).then(() => true).catch(() => false)).toBe(true);
    await fs.promises.unlink(draftPdfPath);

    factory.previewDraftDetermina();
    expect(savedArtifacts.some(a => a.filename.includes('Determina_BOZZA_2026.txt'))).toBe(true);

    factory.previewDraftRelazioneTecnica();
    expect(savedArtifacts.some(a => a.filename.includes('Relazione_BOZZA_2026.txt'))).toBe(true);

    factory.previewDraftProspetto();
    expect(savedArtifacts.some(a => a.filename.includes('Prospetto_BOZZA_2026.txt'))).toBe(true);
  });

  // P1 vs P2: Real PDF comparison from ReportsPage handlers
  it('P1/P2 — ReportsPage UI actions trigger genuine P1 (draft) and P2 (definitive) PDFs', async () => {
    const validResult = buildMockValidResult();
    mockCurrentState = {
      isLoading: false,
      calculationResult: validResult,
      currentUser: testUser,
      fundData: {
        annualData: {
          denominazioneEnte: 'Comune di Test',
          documentMetadata: { numeroDetermina: '15', dataDetermina: '2026-04-01' }
        }
      }
    };

    render(<ReportsPage />);

    // Click "Scarica Bozza (PDF)" -> generates P1
    const draftBtn = screen.getByText('Scarica Bozza (PDF)');
    draftBtn.click();

    const p1Path = path.join(isolationState.currentTestDir, 'Determina_BOZZA_2026.pdf');
    expect(await fs.promises.stat(p1Path).then(() => true).catch(() => false)).toBe(true);

    const p1Bytes = await fs.promises.readFile(p1Path);
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    const p1Pdf = await (pdfjs as any).getDocument({ data: new Uint8Array(p1Bytes), disableWorker: true }).promise;
    const p1Pages: string[] = [];
    for (let i = 1; i <= p1Pdf.numPages; i++) {
      const page = await p1Pdf.getPage(i);
      const textContent = await page.getTextContent();
      p1Pages.push(textContent.items.map((it: any) => it.str).join(' '));
    }
    const p1Text = p1Pages.join('\n');
    expect(p1Text).toContain('[SCHEMA DI ATTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]');
    expect(p1Text).not.toContain('DI COSTITUIRE');
    await fs.promises.unlink(p1Path);

    // Click "Genera Determina Definitiva (PDF)" -> generates P2
    const defBtn = screen.getByText('Genera Determina Definitiva (PDF)');
    defBtn.click();

    const p2Path = path.join(isolationState.currentTestDir, 'Determina_Costituzione_Fondo_2026.pdf');
    expect(await fs.promises.stat(p2Path).then(() => true).catch(() => false)).toBe(true);

    const p2Bytes = await fs.promises.readFile(p2Path);
    const p2Pdf = await (pdfjs as any).getDocument({ data: new Uint8Array(p2Bytes), disableWorker: true }).promise;
    const p2Pages: string[] = [];
    for (let i = 1; i <= p2Pdf.numPages; i++) {
      const page = await p2Pdf.getPage(i);
      const textContent = await page.getTextContent();
      p2Pages.push(textContent.items.map((it: any) => it.str).join(' '));
    }
    const p2Text = p2Pages.join('\n');
    expect(p2Text).toContain('DI COSTITUIRE');
    expect(p2Text).not.toContain('[SCHEMA DI ATTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]');
    await fs.promises.unlink(p2Path);
  });
});
