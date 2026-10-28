import { describe, it, expect, vi } from 'vitest';

const savedArtifacts = vi.hoisted(() => [] as Array<{ filename: string; blob: Blob }>);

vi.mock('file-saver', () => ({
  saveAs: (blob: Blob, filename: string) => {
    savedArtifacts.push({ blob, filename });
  },
}));

import { deriveCanonicalFundResult } from '../canonicalFundLedger';
import { projectFundDocument } from '../../../domain/documentProjection';
import { createDocumentViewModel } from '../../../presenters/documentPresenter';
import { buildDeterminaV2 } from '../../../services/templates/determinaTemplateV2';
import { generateRelazioneTecnicaTXT } from '../../../services/templates/relazioneTecnicaTemplate';
import { buildProspettoContrattazione, DocumentFactory } from '../../../services/documents/documentFactory';
import { generateDeterminaPDF } from '../../../services/documents/pdfDeterminaService';
import { mapToTabella15 } from '../tabella15Mapper';
import { generateTabella15CSV } from '../../../services/documents/tabella15XlsService';
import {
  assertDefinitiveTabella15ExportAllowed,
  generateTabella15ExportCSV,
  generateTabella15ExportXLS
} from '../../../services/reportService';
import { DocumentMetadataSchema } from '../../../schemas/fundDataSchemas';
import type {
  CalculationResult,
  DocumentMetadata,
  FundLedgerEntry,
  NormativeData
} from '../../../domain';
import fs from 'node:fs';
import path from 'node:path';

describe('Wave 3 Systemic Fix Suite (S1 - S21)', () => {
  const mockNormative: NormativeData = {
    riferimenti_normativi: {
      art23_dlgs75_2017: 'Art. 23 c. 2',
      art67_ccnl2018: 'Art. 67 CCNL 2018',
    }
  } as unknown as NormativeData;

  const makeMockBaseResult = (): CalculationResult => ({
    metadata: { annoRiferimento: 2026, denominazioneEnte: 'Comune Test Sico' },
    inputs: { tipologiaEnte: 'Comune' } as any,
    fondi: {
      dipendente: {
        label: 'Fondo Dipendenti',
        summary: { totaleFondo: 3400 },
        constitution: { sections: { stabili: { id: 's', items: [] }, variabili: { id: 'v', items: [] } } }
      } as any,
      eq: { label: 'EQ', summary: { totaleFondo: 500 } } as any,
      segretario: { label: 'Segretario', summary: { totaleFondo: 0 } } as any,
      dirigenza: { label: 'Dirigenza', summary: { totaleFondo: 0 } } as any
    },
    compliance: { art23c2: { limite: 100000, valoreSoggetto: 3400, delta: 0, isCompliant: true } } as any,
    canonicalFund: deriveCanonicalFundResult([
      { id: 'CCNL_014_CURRENT', amount: 3400, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'CALCULATED', art23Treatment: 'SUBJECT', status: 'VALID' }
    ])
  } as unknown as CalculationResult);

  // S1: UNDETERMINED + numeric total -> no definitive clause
  it('S1 — UNDETERMINED + numeric total (3400) does NOT produce definitive clause', () => {
    const base = makeMockBaseResult();
    const undeterminedResult: CalculationResult = {
      ...base,
      canonicalFund: deriveCanonicalFundResult(
        [{ id: 'CCNL_014_CURRENT', amount: 3400, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'CALCULATED', art23Treatment: 'SUBJECT', status: 'VALID' }],
        [],
        ['REQUIRED_EXTERNAL_PREREQUISITE']
      )
    };

    expect(undeterminedResult.canonicalFund!.status).toBe('UNDETERMINED');
    expect(undeterminedResult.canonicalFund!.total).toBe(3400);

    const proj = projectFundDocument(undeterminedResult, 'Comune Test');
    expect(proj.isDefinitiveDocumentReady).toBe(false);
    expect(proj.isDraft).toBe(true);
    expect(proj.exportReadiness).toBe('DOCUMENT_DRAFT');

    const vm = createDocumentViewModel(undeterminedResult, 'Comune Test', { name: 'Op', role: 'U' });
    const detTxt = buildDeterminaV2(vm);
    expect(detTxt).not.toContain('DI COSTITUIRE');
    expect(detTxt).toContain('DI DARE ATTO, in sede istruttoria');

    const relTxt = generateRelazioneTecnicaTXT(vm);
    expect(relTxt).not.toContain('TOTALE GENERALE: Euro € 3400,00');
    expect(relTxt).toContain('TOTALE COMPLESSIVO DEL FONDO: NON ANCORA DETERMINABILE');

    const propTxt = buildProspettoContrattazione(vm);
    expect(propTxt).not.toContain('Totale Disponibile Fondo Dipendenti');
    expect(propTxt).toContain('Totale Complessivo Fondo: NON ANCORA DETERMINABILE');

    const tab = mapToTabella15(undeterminedResult, mockNormative);
    expect(tab.grandTotal).toBeNull();
    expect(tab.verifiedSubtotal).toBe(3400);
  });

  // S2: VALID + numeric total -> definitive clause allowed
  it('S2 — VALID + numeric total produces definitive clauses and totals', () => {
    const validResult = makeMockBaseResult();
    expect(validResult.canonicalFund!.status).toBe('VALID');
    expect(validResult.canonicalFund!.total).toBe(3400);

    const proj = projectFundDocument(validResult, 'Comune Test');
    expect(proj.isDefinitiveDocumentReady).toBe(true);
    expect(proj.isDraft).toBe(false);
    expect(proj.exportReadiness).toBe('DOCUMENT_FINAL_READY');

    const vm = createDocumentViewModel(validResult, 'Comune Test', { name: 'Op', role: 'U' });
    const detTxt = buildDeterminaV2(vm);
    expect(detTxt).toContain('DI COSTITUIRE');
    expect(detTxt).toContain('3400,00');

    const relTxt = generateRelazioneTecnicaTXT(vm);
    expect(relTxt).toContain('TOTALE GENERALE: Euro € 3400,00');

    const propTxt = buildProspettoContrattazione(vm);
    expect(propTxt).toContain('Totale Disponibile Fondo Dipendenti: € 3400,00');

    const tab = mapToTabella15(validResult, mockNormative);
    expect(tab.grandTotal).toBe(3400);
  });

  // S3: no canonicalFund -> definitive export blocked
  it('S3 — no canonicalFund blocks definitive export and permits only legacy preview', () => {
    const base = makeMockBaseResult();
    const legacyResult: CalculationResult = { ...base, canonicalFund: undefined as any };

    const factory = new DocumentFactory(legacyResult, 'Ente Legacy', { id: 'u', name: 'User', role: 'ADMIN' as any });
    expect(factory.isDefinitiveExportReady()).toBe(false);
    expect(() => factory.assertDefinitiveExportAllowed()).toThrow('Export definitivo bloccato');

    const vm = factory.getViewModel();
    expect(vm.isDraft).toBe(true);
    const detTxt = buildDeterminaV2(vm);
    expect(detTxt).not.toContain('DI COSTITUIRE');

    const tab = mapToTabella15(legacyResult, mockNormative);
    expect(tab.grandTotal).toBeNull();
  });

  // S4: DocumentFactory entry point blocked
  it('S4 — DocumentFactory definitive entry points throw when not ready', () => {
    const base = makeMockBaseResult();
    const undeterminedResult: CalculationResult = {
      ...base,
      canonicalFund: deriveCanonicalFundResult(
        [{ id: 'CCNL_014_CURRENT', amount: 3400, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'CALCULATED', art23Treatment: 'SUBJECT', status: 'VALID' }],
        [],
        ['EXTERNAL_PREREQ']
      )
    };

    const factory = new DocumentFactory(undeterminedResult, 'Ente', { id: 'u', name: 'User', role: 'ADMIN' as any });
    expect(() => factory.exportDefinitiveDetermina()).toThrow();
    expect(() => factory.exportDefinitiveDeterminaPDF()).toThrow();
    expect(() => factory.exportDefinitiveRelazioneTecnica()).toThrow();
    expect(() => factory.exportDefinitiveProspetto()).toThrow();
    expect(() => factory.generateDetermina({ mode: 'DEFINITIVE_EXPORT' })).toThrow();
  });

  // S5: PDF direct entry point blocked
  it('S5 — generateDeterminaPDF blocks in DEFINITIVE_EXPORT mode when draft', () => {
    const base = makeMockBaseResult();
    const undeterminedResult: CalculationResult = {
      ...base,
      canonicalFund: deriveCanonicalFundResult(
        [{ id: 'CCNL_014_CURRENT', amount: 3400, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'CALCULATED', art23Treatment: 'SUBJECT', status: 'VALID' }],
        [],
        ['EXTERNAL_PREREQ']
      )
    };
    const vm = createDocumentViewModel(undeterminedResult, 'Ente', { name: 'Op', role: 'U' });
    expect(() => generateDeterminaPDF(vm, { mode: 'DEFINITIVE_EXPORT' })).toThrow('Generazione Determina PDF definitiva bloccata');
  });

  // S6: TXT direct entry point blocked
  it('S6 — buildDeterminaV2 blocks in DEFINITIVE_EXPORT mode when draft', () => {
    const base = makeMockBaseResult();
    const undeterminedResult: CalculationResult = {
      ...base,
      canonicalFund: deriveCanonicalFundResult(
        [{ id: 'CCNL_014_CURRENT', amount: 3400, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'CALCULATED', art23Treatment: 'SUBJECT', status: 'VALID' }],
        [],
        ['EXTERNAL_PREREQ']
      )
    };
    const vm = createDocumentViewModel(undeterminedResult, 'Ente', { name: 'Op', role: 'U' });
    expect(() => buildDeterminaV2(vm, { mode: 'DEFINITIVE_EXPORT' })).toThrow('Generazione Determina definitiva bloccata');
  });

  // S7: reportService blocked
  it('S7 — reportService blocks definitive Tabella 15 exports when not ready', async () => {
    const base = makeMockBaseResult();
    const legacyResult: CalculationResult = { ...base, canonicalFund: undefined as any };
    const tab = mapToTabella15(legacyResult, mockNormative);

    expect(() => assertDefinitiveTabella15ExportAllowed(tab)).toThrow('Export definitivo Tabella 15 bloccato');
    expect(() => generateTabella15ExportCSV(legacyResult, mockNormative, { mode: 'DEFINITIVE_EXPORT' })).toThrow();
    await expect(generateTabella15ExportXLS(legacyResult, mockNormative, { mode: 'DEFINITIVE_EXPORT' })).rejects.toThrow();
  });

  // S8: ReportsPage source contains readiness check
  it('S8 — ReportsPage source checks isDefinitiveExportReady and distinguishes draft state', async () => {
    const src = await fs.promises.readFile(path.resolve('src/pages/ReportsPage.tsx'), 'utf8');
    expect(src).toContain('isDefinitiveExportReady');
    expect(src).toContain('BOZZA IN ISTRUTTORIA');
    expect(src).toContain('Scarica Bozza Determina');
  });

  // S9: Tabella15Page source displays schema verification alert
  it('S9 — Tabella15Page displays RGS schema verification warning', async () => {
    const src = await fs.promises.readFile(path.resolve('src/pages/Tabella15Page.tsx'), 'utf8');
    expect(src).toContain('schemaVerificationStatus');
    expect(src).toContain('RGS/SICO');
  });

  // S10: 100.005 single-entry reconciliation
  it('S10 — Single-entry half-up quantization: 100.005->100.01, 100.004->100.00, -100.005->-100.01', () => {
    const resPlus = deriveCanonicalFundResult([
      { id: 'P1', amount: 100.005, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'MANUAL', art23Treatment: 'SUBJECT', status: 'VALID' }
    ]);
    expect(resPlus.total).toBe(100.01);
    expect(resPlus.entries[0].amount).toBe(100.01);

    const resPlus4 = deriveCanonicalFundResult([
      { id: 'P2', amount: 100.004, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'MANUAL', art23Treatment: 'SUBJECT', status: 'VALID' }
    ]);
    expect(resPlus4.total).toBe(100.00);
    expect(resPlus4.entries[0].amount).toBe(100.00);

    const resMinus = deriveCanonicalFundResult([
      { id: 'M1', amount: 100.005, component: 'STABLE', operation: 'DEDUCTION', competenceYear: 2026, source: 'MANUAL', art23Treatment: 'SUBJECT', status: 'VALID' }
    ]);
    expect(resMinus.total).toBe(-100.01);
    expect(resMinus.entries[0].amount).toBe(100.01);
  });

  // S11: multi-entry rounding = identical across all layers
  it('S11 — Multi-entry rounding reconciliation: +100.005 +100.004 -100.005 -10.005 = 89.99 across all layers', () => {
    // Use mapped IDs: CCNL_014_CURRENT (S614), OVERTIME_STABLE_TRANSFER (S615), ART60_CONSOLIDATION (S616 deduction), RIA (S613)
    const entries: FundLedgerEntry[] = [
      { id: 'CCNL_014_CURRENT', amount: 100.005, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'CALCULATED', art23Treatment: 'SUBJECT', status: 'VALID' },
      { id: 'OVERTIME_STABLE_TRANSFER', amount: 100.004, component: 'STABLE', operation: 'ADDITION', competenceYear: 2026, source: 'CALCULATED', art23Treatment: 'SUBJECT', status: 'VALID' },
      { id: 'ART60_CONSOLIDATION', amount: 100.005, component: 'STABLE', operation: 'DEDUCTION', competenceYear: 2026, source: 'CALCULATED', art23Treatment: 'SUBJECT', status: 'VALID' },
      { id: 'RIA', amount: 10.005, component: 'STABLE', operation: 'DEDUCTION', competenceYear: 2026, source: 'CALCULATED', art23Treatment: 'SUBJECT', status: 'VALID' },
    ];
    const canonical = deriveCanonicalFundResult(entries);
    expect(canonical.total).toBe(89.99);

    const mockRes: CalculationResult = {
      metadata: { annoRiferimento: 2026, denominazioneEnte: 'Ente' },
      fondi: { dipendente: { label: 'Dip', summary: { totaleFondo: 89.99 }, constitution: { sections: { stabili: { id: 's', items: [] }, variabili: { id: 'v', items: [] } } } } } as any,
      compliance: { art23c2: {} } as any,
      canonicalFund: canonical,
    } as unknown as CalculationResult;

    const proj = projectFundDocument(mockRes, 'Ente');
    expect(proj.finalTotal).toBe(89.99);
    expect(proj.stableEntries.find(e => e.id === 'CCNL_014_CURRENT')!.amount).toBe(100.01);
    expect(proj.stableEntries.find(e => e.id === 'OVERTIME_STABLE_TRANSFER')!.amount).toBe(100.00);
    expect(proj.deductions.find(e => e.id === 'ART60_CONSOLIDATION')!.amount).toBe(100.01);
    expect(proj.deductions.find(e => e.id === 'RIA')!.amount).toBe(10.01);

    const tab = mapToTabella15(mockRes, mockNormative);
    expect(tab.grandTotal).toBe(89.99);
  });

  // S12: opinionOutcome survives Zod
  it('S12 — opinionOutcome survives Zod parsing for all valid enum values', () => {
    for (const val of ['FAVORABLE', 'UNFAVORABLE', 'OTHER', 'UNKNOWN'] as const) {
      const parsed = DocumentMetadataSchema.parse({ opinionOutcome: val });
      expect(parsed.opinionOutcome).toBe(val);
    }
  });

  // S13: transmissionStatus survives Zod
  it('S13 — transmissionStatus survives Zod parsing', () => {
    for (const val of ['DOCUMENTED_SENT', 'NOT_DOCUMENTED'] as const) {
      const parsed = DocumentMetadataSchema.parse({ transmissionStatus: val });
      expect(parsed.transmissionStatus).toBe(val);
    }
  });

  // S14: adoptionStatus survives Zod
  it('S14 — adoptionStatus survives Zod parsing', () => {
    for (const val of ['DOCUMENTED_ADOPTED', 'NOT_DOCUMENTED'] as const) {
      const parsed = DocumentMetadataSchema.parse({ adoptionStatus: val });
      expect(parsed.adoptionStatus).toBe(val);
    }
  });

  // S15: metadata survives save/reload simulation
  it('S15 — Document metadata survives JSON serialization/deserialization and Zod parse', () => {
    const original: DocumentMetadata = {
      numeroDetermina: '123',
      dataDetermina: '01/03/2026',
      numDeliberaGc: '45',
      dataDeliberaGc: '15/02/2026',
      adoptionStatus: 'DOCUMENTED_ADOPTED',
      numVerbaleRevisori: '7',
      dataVerbaleRevisori: '20/02/2026',
      opinionOutcome: 'FAVORABLE',
      transmissionStatus: 'DOCUMENTED_SENT',
      firmaDigitale: 'Il Responsabile'
    };

    const serialized = JSON.stringify(original);
    const deserialized = JSON.parse(serialized);
    const parsed = DocumentMetadataSchema.parse(deserialized);

    expect(parsed.adoptionStatus).toBe('DOCUMENTED_ADOPTED');
    expect(parsed.opinionOutcome).toBe('FAVORABLE');
    expect(parsed.transmissionStatus).toBe('DOCUMENTED_SENT');
  });

  // S16: number/date + UNKNOWN preserves endpoints but not favorable opinion
  it('S16 — Number/date + UNKNOWN outcome cites verbale and notes outcome is undocumented', () => {
    const base = makeMockBaseResult();
    const meta: DocumentMetadata = {
      numVerbaleRevisori: '12',
      dataVerbaleRevisori: '15/03/2026',
      opinionOutcome: 'UNKNOWN'
    };
    const vm = createDocumentViewModel(base, 'Ente', { name: 'Op', role: 'U' }, meta);
    const detTxt = buildDeterminaV2(vm);

    expect(detTxt).not.toContain('parere favorevole espresso');
    expect(detTxt).toContain("Verbale n. 12 del 15/03/2026. L'esito del parere dell'Organo di Revisione non risulta documentato");
    expect(detTxt).not.toContain("Gli estremi e l'esito del parere dell'Organo di Revisione non risultano documentati");
  });

  // S17: DOCUMENTED_SENT without opinion outcome does not invent opinion
  it('S17 — DOCUMENTED_SENT without opinion outcome states transmission without inventing opinion', () => {
    const base = makeMockBaseResult();
    const meta: DocumentMetadata = {
      transmissionStatus: 'DOCUMENTED_SENT'
    };
    const vm = createDocumentViewModel(base, 'Ente', { name: 'Op', role: 'U' }, meta);
    const detTxt = buildDeterminaV2(vm);

    expect(detTxt).not.toContain('parere favorevole');
    expect(detTxt).toContain("è stato trasmesso al Collegio dei Revisori dei Conti");
  });

  // S18: DOCUMENTED_ADOPTED required for adoption statement
  it('S18 — DOCUMENTED_ADOPTED is strictly required to state adoption in determina', () => {
    const base = makeMockBaseResult();

    // With extremes but NOT_DOCUMENTED
    const metaNoAdopt: DocumentMetadata = {
      numDeliberaGc: '45',
      dataDeliberaGc: '10/03/2026',
      adoptionStatus: 'NOT_DOCUMENTED'
    };
    const vmNoAdopt = createDocumentViewModel(base, 'Ente', { name: 'Op', role: 'U' }, metaNoAdopt);
    expect(buildDeterminaV2(vmNoAdopt)).not.toContain('La deliberazione della G.C. n.');

    // With extremes AND DOCUMENTED_ADOPTED
    const metaAdopt: DocumentMetadata = {
      numDeliberaGc: '45',
      dataDeliberaGc: '10/03/2026',
      adoptionStatus: 'DOCUMENTED_ADOPTED'
    };
    const vmAdopt = createDocumentViewModel(base, 'Ente', { name: 'Op', role: 'U' }, metaAdopt);
    expect(buildDeterminaV2(vmAdopt)).toContain('La deliberazione della G.C. n. 45 del 10/03/2026');
  });

  // S19: RGS_SCHEMA_UNVERIFIED appears in CSV
  it('S19 — CSV header exposes RGS_SCHEMA_UNVERIFIED', async () => {
    const base = makeMockBaseResult();
    const tab = mapToTabella15(base, mockNormative);
    savedArtifacts.length = 0;
    generateTabella15CSV(tab);

    const artifact = savedArtifacts.find(a => a.filename.endsWith('.csv'));
    expect(artifact).toBeDefined();
    const capturedCsv = await artifact!.blob.text();

    expect(capturedCsv).toContain('Stato Schema RGS:;RGS_SCHEMA_UNVERIFIED');
    expect(capturedCsv).toContain('Pronto per SICO:;NO - schema non verificato');
    expect(capturedCsv).toContain('Quadratura aritmetica:;OK');
  });

  // S20: RGS_SCHEMA_UNVERIFIED appears in UI
  it('S20 — RGS_SCHEMA_UNVERIFIED is present in ReportsPage and Tabella15Page source', async () => {
    const reportsPage = await fs.promises.readFile(path.resolve('src/pages/ReportsPage.tsx'), 'utf8');
    const tabellaPage = await fs.promises.readFile(path.resolve('src/pages/Tabella15Page.tsx'), 'utf8');

    expect(reportsPage).toContain('RGS_SCHEMA_UNVERIFIED');
    expect(tabellaPage).toContain('schemaVerificationStatus');
  });

  // S21: arithmetic ready + schema unverified != SICO ready
  it('S21 — Arithmetic readiness is decoupled from SICO readiness', () => {
    const base = makeMockBaseResult();
    const tab = mapToTabella15(base, mockNormative);

    expect(tab.isArithmeticExportReady).toBe(true);
    expect(tab.isSicoExportReady).toBe(false);
    expect(tab.isExportReady).toBe(false);
    expect(tab.schemaVerificationStatus).toBe('RGS_SCHEMA_UNVERIFIED');
  });
});
