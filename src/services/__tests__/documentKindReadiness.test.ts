// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import ExcelJS from 'exceljs';
import { DOCUMENT_KINDS, DOCUMENT_KIND_POLICIES, resolveDocumentKindReadiness } from '../../domain/documentKindReadiness';
import { projectFundDocument } from '../../domain/documentProjection';
import { resolveChecklist } from '../../logic/cabina/resolveChecklist';
import { DocumentFactory } from '../documents/documentFactory';
import { generateFADXLS, generateFullSummaryPDF } from '../reportService';
import { documentCheck, documentResult, documentUser } from './documentReadinessFixture';
import type { DocumentMetadata } from '../../domain';

const boundary = vi.hoisted(() => ({ pdfs: [] as { filename: string; bytes: Uint8Array }[], files: [] as { filename: string; blob: Blob }[] }));
vi.mock('file-saver', () => ({ saveAs: (blob: Blob, filename: string) => boundary.files.push({ blob, filename }) }));
vi.mock('jspdf', async original => {
  const actual = await original<typeof import('jspdf')>();
  class CapturingPdf extends actual.jsPDF {
    constructor() { super(); this.save = ((filename: string) => {
      boundary.pdfs.push({ filename, bytes: new Uint8Array(this.output('arraybuffer')) }); return this;
    }) as unknown as typeof this.save; }
  }
  return { ...actual, default: CapturingPdf, jsPDF: CapturingPdf };
});

beforeEach(() => { boundary.pdfs.length = 0; boundary.files.length = 0; });

describe.each(DOCUMENT_KINDS)('DOCUMENT_KIND_READINESS %s', kind => {
  const resolve = (status: Parameters<typeof documentResult>[0] = 'VALID', checks = [] as ReturnType<typeof documentCheck>[], amount = 100) => {
    const result = documentResult(status, amount);
    return resolveDocumentKindReadiness({ documentKind: kind, canonicalFund: result.canonicalFund,
      issues: resolveChecklist({ canonicalFund: result.canonicalFund, complianceChecks: checks }) });
  };
  it('VALID with supplied metadata can be final', () => expect(resolve().status).toBe('FINAL_READY'));
  it('missing optional metadata does not impose unapproved prerequisites', () => {
    expect(resolve().status).toBe('FINAL_READY'); expect(resolve().missingFields).toEqual([]);
    expect(DOCUMENT_KIND_POLICIES[kind].classification).toMatch(/DOCUMENT|REPORT/);
  });
  it('explicit canonical zero is determined', () => expect(resolve('VALID', [], 0).status).toBe('FINAL_READY'));
  it.each(['UNDETERMINED', 'INVALID', 'MISSING'] as const)('%s allows only draft', status => {
    expect(resolve(status)).toMatchObject({ status: 'DRAFT_ONLY', mode: 'DRAFT_PREVIEW' });
  });
  it('BLOCKING prevents final while numeric validity remains VALID', () => {
    expect(resolve('VALID', [documentCheck()])).toMatchObject({ status: 'DRAFT_ONLY', correctiveTarget: 'fondoDipendenti' });
    expect(documentResult().canonicalFund?.status).toBe('VALID');
  });
  it('WARNING alone does not prevent final', () => expect(resolve('VALID', [documentCheck('warning')]).status).toBe('FINAL_READY'));
  it('CLOSED permits read-only document generation under the same policy', () => {
    const snapshot = Object.freeze({ status: 'CLOSED', result: documentResult() });
    expect(resolveDocumentKindReadiness({ documentKind: kind, canonicalFund: snapshot.result.canonicalFund }).status).toBe('FINAL_READY');
    expect(snapshot.status).toBe('CLOSED');
  });
});

it('is pure for frozen canonical input and normalized issue arrays; primary issue retains order', () => {
  const canonicalFund = Object.freeze({ ...documentResult().canonicalFund!, missingPrerequisites: Object.freeze([]) as unknown as string[] });
  const issues = Object.freeze([Object.freeze({ severity: 'BLOCKING' as const, message: 'one', userMessage: 'Prima', target: 'prima' }),
    Object.freeze({ severity: 'BLOCKING' as const, message: 'two', userMessage: 'Seconda', target: 'seconda' })]);
  const before = JSON.stringify({ canonicalFund, issues });
  expect(resolveDocumentKindReadiness({ documentKind: 'DETERMINA', canonicalFund, issues })).toMatchObject({ primaryReason: 'Prima', correctiveTarget: 'prima' });
  expect(JSON.stringify({ canonicalFund, issues })).toBe(before);
});
it('missing prerequisite remains a separate draft reason; unavailable requires no constructible preview', () => {
  const canonicalFund = documentResult().canonicalFund!;
  const issues = [{ severity: 'MISSING_PREREQUISITE' as const, message: 'Dato', userMessage: 'Completare dato', target: 'dati' }];
  expect(resolveDocumentKindReadiness({ documentKind: 'PROSPETTO', canonicalFund, issues })).toMatchObject({ status: 'DRAFT_ONLY', correctiveTarget: 'dati' });
  expect(resolveDocumentKindReadiness({ documentKind: 'PROSPETTO', previewAvailable: false }).status).toBe('UNAVAILABLE');
});

describe('forced definitive boundaries', () => {
  it.each(['exportDefinitiveDetermina', 'exportDefinitiveDeterminaPDF', 'exportDefinitiveRelazioneTecnica', 'exportDefinitiveProspetto'] as const)('%s refuses BLOCKING with zero downloads', method => {
    const factory = new DocumentFactory(documentResult(), 'Comune Policy', documentUser, undefined, [documentCheck()]);
    expect(() => factory[method]()).toThrow(/Export definitivo bloccato/);
    expect(boundary.files).toHaveLength(0); expect(boundary.pdfs).toHaveLength(0);
  });
  it.each(['VALID', 'UNDETERMINED', 'INVALID', 'MISSING'] as const)('financial forced final refuses %s when unready', async status => {
    const options = { mode: 'DEFINITIVE_EXPORT' as const, complianceChecks: [documentCheck()] };
    await expect(generateFullSummaryPDF(documentResult(status), 'Comune Policy', documentUser, options)).rejects.toThrow(/Export definitivo bloccato/);
    await expect(generateFADXLS(documentResult(status), 'Comune Policy', undefined, undefined, options)).rejects.toThrow(/Export definitivo bloccato/);
    expect(boundary.files).toHaveLength(0); expect(boundary.pdfs).toHaveLength(0);
  });
  it('unspecified factory mode cannot silently bypass blocking readiness', async () => {
    const factory = new DocumentFactory(documentResult(), 'Comune Policy', documentUser, undefined, [documentCheck()]);
    factory.generateDetermina(); factory.generateRelazioneTecnica(); factory.generateProspettoContrattazione(); factory.generateDeterminaDocumentPDF();
    expect(boundary.files.every(file => file.filename.includes('BOZZA'))).toBe(true);
    expect(boundary.pdfs[0].filename).toContain('BOZZA');
    expect(await boundary.files[0].blob.text()).not.toContain('DI COSTITUIRE');
  });
});

describe('metadata red-team: optional facts remain explicit', () => {
  const combinations: DocumentMetadata[] = [ {}, { numVerbaleRevisori: '1' }, { dataVerbaleRevisori: '2026-01-01' },
    { numVerbaleRevisori: '1', dataVerbaleRevisori: '2026-01-01', opinionOutcome: 'UNKNOWN' },
    { numVerbaleRevisori: '1', dataVerbaleRevisori: '2026-01-01', opinionOutcome: 'FAVORABLE' },
    { numVerbaleRevisori: '1', dataVerbaleRevisori: '2026-01-01', opinionOutcome: 'UNFAVORABLE' },
    { transmissionStatus: 'DOCUMENTED_SENT' }, { transmissionStatus: 'NOT_DOCUMENTED' },
    { numDeliberaGc: '1' }, { dataDeliberaGc: '2026-01-01' },
    { numDeliberaGc: '1', dataDeliberaGc: '2026-01-01' },
    { numDeliberaGc: '1', dataDeliberaGc: '2026-01-01', adoptionStatus: 'DOCUMENTED_ADOPTED' },
    { numDeliberaGc: '1', dataDeliberaGc: '2026-01-01', adoptionStatus: 'NOT_DOCUMENTED' },
  ];
  it.each(combinations)('does not infer facts or require favourable outcome: %j', async meta => {
    const projection = projectFundDocument(documentResult(), 'Comune Policy', meta);
    expect(projection.hasRevisoriParere).toBe(meta.opinionOutcome === 'FAVORABLE' && !!meta.numVerbaleRevisori && !!meta.dataVerbaleRevisori);
    expect(projection.hasDeliberaGC).toBe(meta.adoptionStatus === 'DOCUMENTED_ADOPTED' && !!meta.numDeliberaGc && !!meta.dataDeliberaGc);
    const factory = new DocumentFactory(documentResult(), 'Comune Policy', documentUser, meta);
    expect(factory.getReadiness('DETERMINA').status).toBe('FINAL_READY');
    factory.exportDefinitiveDetermina();
    expect(boundary.files[0].filename).not.toContain('BOZZA');
    const text = await boundary.files[0].blob.text();
    expect(text.includes('Del parere favorevole espresso')).toBe(projection.hasRevisoriParere);
    expect(text.includes('La deliberazione della G.C. n. 1')).toBe(projection.hasDeliberaGC);
    if (meta.opinionOutcome === 'UNFAVORABLE') expect(text).toContain('parere NON favorevole');
  });
});

describe('real files in TEMP; real writers, only download boundary intercepted', () => {
  it.each(['FINAL', 'OPTIONAL_PLACEHOLDERS', 'UNDETERMINED', 'BLOCKING'] as const)('inspects %s PDFs/TXT/XLSX', async scenario => {
    const result = documentResult(scenario === 'UNDETERMINED' ? 'UNDETERMINED' : 'VALID');
    const checks = scenario === 'BLOCKING' ? [documentCheck()] : [];
    const meta = scenario === 'FINAL' ? { numeroDetermina: '42', dataDetermina: '2026-10-01', firmaDigitale: 'Responsabile' } : undefined;
    const factory = new DocumentFactory(result, 'Comune Policy', documentUser, meta, checks);
    const draft = factory.getReadiness('DETERMINA').status !== 'FINAL_READY';
    if (draft) { factory.previewDraftDetermina(); factory.previewDraftDeterminaPDF(); factory.previewDraftRelazioneTecnica(); factory.previewDraftProspetto(); }
    else { factory.exportDefinitiveDetermina(); factory.exportDefinitiveDeterminaPDF(); factory.exportDefinitiveRelazioneTecnica(); factory.exportDefinitiveProspetto(); }
    await generateFullSummaryPDF(result, 'Comune Policy', documentUser, { complianceChecks: checks });
    await generateFADXLS(result, 'Comune Policy', undefined, undefined, { complianceChecks: checks });
    const dir = await mkdtemp(path.join(tmpdir(), 'document-kind-inspection-'));
    await mkdir(dir, { recursive: true });
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    for (const pdf of boundary.pdfs) {
      const file = path.join(dir, pdf.filename); await writeFile(file, pdf.bytes);
      const parsed = await pdfjs.getDocument({ data: new Uint8Array(await readFile(file)), disableFontFace: true, useSystemFonts: true }).promise;
      let text = '';
      for (let page = 1; page <= parsed.numPages; page++) text += (await (await parsed.getPage(page)).getTextContent()).items.map((item: any) => item.str ?? '').join(' ');
      await parsed.destroy(); await writeFile(file + '.txt', text);
      expect(pdf.filename.includes('BOZZA')).toBe(draft); expect(text.includes('BOZZA')).toBe(draft);
      expect(text).not.toContain('parere favorevole espresso'); if (scenario !== 'UNDETERMINED') expect(text).toContain('100');
      if (scenario === 'BLOCKING') expect(text).toContain('Risolvere la verifica');
      if (scenario === 'BLOCKING' && pdf.filename.startsWith('Determina')) expect(text).not.toContain('Del rispetto degli obiettivi');
      if (scenario === 'OPTIONAL_PLACEHOLDERS' && pdf.filename.startsWith('Determina')) expect(text).toContain('{{NUMERO_DETERMINA}}');
    }
    for (const file of boundary.files) {
      const target = path.join(dir, file.filename); await writeFile(target, new Uint8Array(await file.blob.arrayBuffer()));
      expect(file.filename.includes('BOZZA')).toBe(draft);
      if (file.filename.endsWith('.txt')) {
        const text = await readFile(target, 'utf8'); expect(text.includes('BOZZA')).toBe(draft);
        expect(text).not.toContain('parere favorevole espresso');
        if (draft && file.filename.startsWith('Determina')) expect(text).not.toContain('DI COSTITUIRE');
        if (scenario === 'BLOCKING') {
          expect(text).not.toContain('NON ANCORA DETERMINABILE');
          expect(text).not.toContain('Del rispetto degli obiettivi');
          if (!file.filename.startsWith('Determina')) expect(text).toMatch(/economico canonico/i);
        }
      } else {
        const workbook = new ExcelJS.Workbook(); await workbook.xlsx.readFile(target);
        expect(workbook.worksheets.map(sheet => sheet.name)).toEqual(['Fondo Dipendenti']);
        expect(workbook.worksheets[0].getCell('A1').text.includes('BOZZA')).toBe(draft);
        const cells: ExcelJS.Cell[] = []; workbook.worksheets[0].eachRow(row => row.eachCell(cell => cells.push(cell)));
        expect(cells.some(cell => cell.type === ExcelJS.ValueType.Formula)).toBe(false);
        if (scenario === 'BLOCKING') expect(cells.some(cell => cell.text.includes('Risolvere la verifica'))).toBe(true);
      }
    }
  });
});
