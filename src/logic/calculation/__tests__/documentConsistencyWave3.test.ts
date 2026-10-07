import { resolvedZeroState } from '../../../test/fixtures/ccnlRecovery';
import { describe, it, expect } from 'vitest';
import { calculateFundCompletely } from '../fundEngine';
import { mapToTabella15 } from '../tabella15Mapper';
import { createDocumentViewModel } from '../../../presenters/documentPresenter';
import { generateRelazioneTecnicaTXT } from '../../../services/templates/relazioneTecnicaTemplate';
import { buildDeterminaV2 } from '../../../services/templates/determinaTemplateV2';
import { buildProspettoContrattazione, DocumentFactory } from '../../../services/documents/documentFactory';
import { projectFundDocument } from '../../../domain/documentProjection';
import type { NormalizedInput, AnnualData, NormativeData, DocumentMetadata } from '../../../domain';

describe('Wave 3 - Document & Export Consistency Suite (D1 - D14)', () => {
  const mockNormative: NormativeData = {
    riferimenti_normativi: {
      art23_dlgs75_2017: 'Art. 23 c. 2',
      art67_ccnl2018: 'Art. 67 CCNL 2018',
    }
  } as unknown as NormativeData;

  const createInputA2025 = (): NormalizedInput => ({
    historicalData: { manualPersonalFundLimit2016: 120000 },
    annualData: {
      annoRiferimento: 2025,
      denominazioneEnte: 'Comune Astra',
      tipologiaEnte: 'Comune',
      ccnl2024: { monteSalari2021: 1000000 },
      art33ManualDecision: 'DO_NOT_APPLY'
    } as unknown as AnnualData,
    fondi: {
      dipendente: {
        st_art58c1_CCNL2026_incremento014_MS2021: 1400,
        st_art79c1_art14c3_art67c2g_riduzioneStraordinario: 2000,
        vn_art58_CCNL2026_arretrati2024_2025: 2800,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44
      },
      eq: {},
      segretario: {},
      dirigenza: {}
    },
    distribuzione: {},
    personaleDettaglio: [],
    calculatedInputs: {
      dipendentiEquivalenti2018: 10,
      dipendentiEquivalentiAnnoRif: 10,
      variazioneDipendenti: 0,
      isArt48Applicabile: false,
      numDipendentiContrattazione: 10
    }
  });

  const createInput2026WithArt60 = (): NormalizedInput => ({
    historicalData: {
      manualPersonalFundLimit2016: 120000,
      fondoPersonaleNonDirEQ2018_Art23: 100000,
      personaleServizio2018: 10,
    },
    annualData: {
      annoRiferimento: 2026,
      ccnlRecovery: resolvedZeroState(),
      denominazioneEnte: 'Comune Astra 2026',
      tipologiaEnte: 'Comune',
      manualDipendentiEquivalenti2018: 10,
      manualDipendentiEquivalentiAnnoRif: 10,
      personale2018PerArt23: [{ id: '1', cedoliniEmessi: 12 }],
      personaleAnnoRifPerArt23: [{ id: '1', cedoliniEmessi: 12 }],
      isArt23FteManualMode: true,
      ccnl2024: {
        monteSalari2021: 1000000,
        personaleInServizio01012026: 1,
        valoreTabellaCCol3: 10.62
      },
      art33ManualDecision: 'DO_NOT_APPLY'
    } as unknown as AnnualData,
    fondi: {
      dipendente: {
        st_art79c1_art67c1_unicoImporto2017: 50000,
        st_art58c1_CCNL2026_incremento014_MS2021: 1400,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44
      },
      eq: {},
      segretario: {},
      dirigenza: {}
    },
    distribuzione: {},
    personaleDettaglio: [],
    calculatedInputs: {
      dipendentiEquivalenti2018: 10,
      dipendentiEquivalentiAnnoRif: 10,
      variazioneDipendenti: 0,
      isArt23FteManualMode: true,
      isArt48Applicabile: false,
      numDipendentiContrattazione: 10
    }
  });

  it('D1 — Case A/2025: Tabella 15 totals match canonical verified total (3.400 €) with grandTotal null', () => {
    const input = createInputA2025();
    const result = calculateFundCompletely(input, mockNormative);
    const tab15 = mapToTabella15(result, mockNormative);

    expect(tab15.grandTotal).toBeNull();
    expect(tab15.verifiedSubtotal).toBe(3400);
    expect(tab15.sections.stabile.total).toBe(3400);
    expect(tab15.sections.variabile.total).toBe(0);
    expect(tab15.verifiedSubtotal).toBe(result.canonicalFund.verifiedTotal);
  });

  it('D2 — Case A/2025: Tabella 15 entity name propagated correctly (Comune Astra)', () => {
    const input = createInputA2025();
    const result = calculateFundCompletely(input, mockNormative);
    const tab15 = mapToTabella15(result, mockNormative);

    expect(tab15.entityName).toBe('Comune Astra');
    expect(tab15.year).toBe(2025);
  });

  it('D3 — Case A/2025: Tabella 15 includes overtime transfer (2.000 € under S615)', () => {
    const input = createInputA2025();
    const result = calculateFundCompletely(input, mockNormative);
    const tab15 = mapToTabella15(result, mockNormative);

    const overtimeEntry = tab15.sections.stabile.entries.find(e => e.key === 'OVERTIME_STABLE_TRANSFER');
    expect(overtimeEntry).toBeDefined();
    expect(overtimeEntry?.columnCode).toBe('S615');
    expect(overtimeEntry?.amount).toBe(2000);
  });

  it('D4 — Case A/2025: Tabella 15 excludes unverified legacy recovery (2.800 €) from certified total', () => {
    const input = createInputA2025();
    const result = calculateFundCompletely(input, mockNormative);
    const tab15 = mapToTabella15(result, mockNormative);

    // Arretrati non determinati non compaiono nelle voci certificate
    const recoveryEntry = tab15.sections.variabile.entries.find(e => e.key === 'CCNL_014_RECOVERY_LEGACY_2024_2025');
    expect(recoveryEntry).toBeUndefined();
    expect(tab15.sections.variabile.total).toBe(0);
  });

  it('D5 — Case A/2025: Tabella 15 omits Art. 60 reduction in 2025 (decorrenza 2026)', () => {
    const input = createInputA2025();
    const result = calculateFundCompletely(input, mockNormative);
    const tab15 = mapToTabella15(result, mockNormative);

    const art60Entry = tab15.sections.stabile.entries.find(e => e.key === 'ART60_CONSOLIDATION');
    // Nel 2025 l'importo è 0, quindi omesso o 0
    expect(art60Entry).toBeUndefined();
    expect(tab15.sections.stabile.total).toBe(3400);
  });

  it('D6 — Year 2026 with Art. 60: Tabella 15 has S616 with negative amount (-127,44 €) and subtracts from stable total', () => {
    const input = createInput2026WithArt60();
    const result = calculateFundCompletely(input, mockNormative);
    const tab15 = mapToTabella15(result, mockNormative);

    const art60Entry = tab15.sections.stabile.entries.find(e => e.key === 'ART60_CONSOLIDATION');
    expect(art60Entry).toBeDefined();
    expect(art60Entry?.columnCode).toBe('S616');
    expect(art60Entry?.amount).toBe(-127.44);

    // 50000 + 1400 - 127.44 = 51272.56
    expect(tab15.sections.stabile.total).toBe(51272.56);
    expect(tab15.grandTotal).toBe(51272.56);
  });

  it('D7 — Case A/2025 Relazione Tecnica: components sum matches subtotale verificato (3.400 €) and marks total undetermined', () => {
    const input = createInputA2025();
    const result = calculateFundCompletely(input, mockNormative);
    const vm = createDocumentViewModel(result, 'Comune Astra', { name: 'Operatore', role: 'UTENTE' });
    const txt = generateRelazioneTecnicaTXT(vm);

    expect(txt).toContain('Parte Stabile: Euro € 3400,00');
    expect(txt).toContain('Parte Variabile: Euro € 0,00');
    expect(txt).toContain('SUBTOTALE DELLE RISORSE VERIFICATE: Euro € 3400,00');
    expect(txt).toContain('TOTALE COMPLESSIVO DEL FONDO: NON ANCORA DETERMINABILE');
    expect(txt).not.toContain('TOTALE GENERALE: Euro € 3400,00');
    expect(vm.fondi.dipendente.sezioni.stabiliSoggette.total + vm.fondi.dipendente.sezioni.stabiliNonSoggette.total).toBe(3400);
  });

  it('D8 — Case A/2025 Relazione Tecnica: shows draft banner and lists unresolved items', () => {
    const input = createInputA2025();
    const result = calculateFundCompletely(input, mockNormative);
    const vm = createDocumentViewModel(result, 'Comune Astra', { name: 'Operatore', role: 'UTENTE' });
    const txt = generateRelazioneTecnicaTXT(vm);

    expect(txt).toContain('[DOCUMENTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]');
    expect(txt).toContain('COMPONENTI IN CORSO DI ISTRUTTORIA / DA DETERMINARE');
    expect(txt).toContain('Arretrati 0,14% 2024-2025');
    expect(txt).toContain('UNDETERMINED');
  });

  it('D9 — Case A/2025 Prospetto Contrattazione: shows Subtotale Risorse Verificate and marks total undetermined', () => {
    const input = createInputA2025();
    const result = calculateFundCompletely(input, mockNormative);
    const vm = createDocumentViewModel(result, 'Comune Astra', { name: 'Operatore', role: 'UTENTE' });
    const prospetto = buildProspettoContrattazione(vm);

    expect(prospetto).toContain('Subtotale Risorse Verificate: € 3400,00');
    expect(prospetto).toContain('Totale Complessivo Fondo: NON ANCORA DETERMINABILE');
    expect(prospetto).not.toContain('Totale Disponibile Fondo Dipendenti: € 3400,00');
    expect(prospetto).toContain('- Stabili: € 3400,00');
    expect(prospetto).toContain('- Variabili: € 0,00');
    expect(prospetto).toContain('[BOZZA NON DEFINITIVA - IN ISTRUTTORIA]');
  });

  it('D10 — Case A/2025 Determina V2: does NOT cite Art. 60 CCNL 2026 consideration', () => {
    const input = createInputA2025();
    const result = calculateFundCompletely(input, mockNormative);
    const vm = createDocumentViewModel(result, 'Comune Astra', { name: 'Operatore', role: 'UTENTE' });
    const txt = buildDeterminaV2(vm);

    expect(txt).not.toContain("Per l'anno 2025 deve essere applicato l'art. 60 del CCNL 23/02/2026");
    expect(txt).not.toContain('conglobamento di parte');
    expect(txt).toContain('- Parte Stabile: Euro € 3400,00;');
    expect(txt).not.toContain('al netto della riduzione di Euro € 127,44');
  });

  it('D11 — Case A/2025 Determina V2: does NOT assert "Del parere favorevole espresso" or transmission on empty revisori metadata', () => {
    const input = createInputA2025();
    const result = calculateFundCompletely(input, mockNormative);
    const vm = createDocumentViewModel(result, 'Comune Astra', { name: 'Operatore', role: 'UTENTE' });
    const txt = buildDeterminaV2(vm);

    expect(txt).not.toContain('Del parere favorevole espresso');
    expect(txt).not.toContain('viene trasmesso al Collegio dei Revisori');
    expect(txt).toContain("Gli estremi e l'esito del parere dell'Organo di Revisione non risultano documentati nei dati disponibili;");
  });

  it('D12 — Case 2026 Determina V2: cites Art. 60 and shows lordo, reduction, and netto', () => {
    const input = createInput2026WithArt60();
    const result = calculateFundCompletely(input, mockNormative);
    const vm = createDocumentViewModel(result, 'Comune Astra 2026', { name: 'Operatore', role: 'UTENTE' });
    const txt = buildDeterminaV2(vm);
    expect(txt).toContain("Per l'anno 2026 deve essere applicato l'art. 60 del CCNL 23/02/2026");
    expect(txt).toContain('riduzione di Euro € 127,44 per conglobamento');
    expect(txt).toContain('Parte Stabile: Euro € 51.272,56, al lordo della quota di Euro € 51.400,00');
    expect(txt).toContain('importo complessivo di Euro € 51.272,56');
  });

  it('D13 — Determina V2 with explicit revisori approval and GC adoption: prints parere favorevole and delibera with actual metadata', () => {
    const input = createInput2026WithArt60();
    const result = calculateFundCompletely(input, mockNormative);
    const docMeta: DocumentMetadata = {
      numVerbaleRevisori: '12/2026',
      dataVerbaleRevisori: '15/03/2026',
      opinionOutcome: 'FAVORABLE',
      transmissionStatus: 'DOCUMENTED_SENT',
      numDeliberaGc: '45',
      dataDeliberaGc: '10/03/2026',
      adoptionStatus: 'DOCUMENTED_ADOPTED',
      numeroDetermina: '101',
      dataDetermina: '20/03/2026',
      firmaDigitale: 'Dott. Mario Rossi'
    };
    const vm = createDocumentViewModel(result, 'Comune Certificato', { name: 'Mario Rossi', role: 'DIRIGENTE' }, docMeta);
    const txt = buildDeterminaV2(vm);

    expect(txt).toContain('Del parere favorevole espresso dal Collegio dei Revisori dei Conti con verbale n. 12/2026 del 15/03/2026');
    expect(txt).toContain('La deliberazione della G.C. n. 45 del 10/03/2026');
    expect(txt).toContain('DETERMINAZIONE N. 101 DEL 20/03/2026');
  });

  it('D14 — Financial rounding and projection invariant: components match verified subtotal exactly to the cent', () => {
    const input = createInputA2025();
    const result = calculateFundCompletely(input, mockNormative);
    const projection = projectFundDocument(result);

    const sumGrossStable = projection.stableEntries.reduce((acc, curr) => acc + curr.amount, 0);
    const sumDeductions = projection.deductions.reduce((acc, curr) => acc + curr.amount, 0);
    const sumNetStable = sumGrossStable - sumDeductions;
    const sumVariable = projection.variableEntries.reduce((acc, curr) => acc + curr.amount, 0);

    expect(sumNetStable).toBe(3400);
    expect(sumVariable).toBe(0);
    expect(sumNetStable + sumVariable).toBe(projection.verifiedSubtotal);
    expect(projection.finalTotal).toBeNull();
  });
});

describe('Wave 3 Hardening — Specific Defect Tests (H1 - H20)', () => {
  const mockNormative: NormativeData = {
    riferimenti_normativi: {
      art23_dlgs75_2017: 'Art. 23 c. 2',
      art67_ccnl2018: 'Art. 67 CCNL 2018',
    }
  } as unknown as NormativeData;

  const createInputA2025 = (): NormalizedInput => ({
    historicalData: { manualPersonalFundLimit2016: 120000 },
    annualData: {
      annoRiferimento: 2025,
      denominazioneEnte: 'Comune Astra',
      tipologiaEnte: 'Comune',
      ccnl2024: { monteSalari2021: 1000000 },
      art33ManualDecision: 'DO_NOT_APPLY'
    } as unknown as AnnualData,
    fondi: {
      dipendente: {
        st_art58c1_CCNL2026_incremento014_MS2021: 1400,
        st_art79c1_art14c3_art67c2g_riduzioneStraordinario: 2000,
        vn_art58_CCNL2026_arretrati2024_2025: 2800,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44
      },
      eq: {},
      segretario: {},
      dirigenza: {}
    },
    distribuzione: {},
    personaleDettaglio: [],
    calculatedInputs: {
      dipendentiEquivalenti2018: 10,
      dipendentiEquivalentiAnnoRif: 10,
      variazioneDipendenti: 0,
      isArt48Applicabile: false,
      numDipendentiContrattazione: 10
    }
  });

  const createInput2026 = (ente = 'Comune Astra 2026'): NormalizedInput => ({
    historicalData: { manualPersonalFundLimit2016: 120000 },
    annualData: {
      annoRiferimento: 2026,
      denominazioneEnte: ente,
      tipologiaEnte: 'Comune',
      ccnl2024: {
        monteSalari2021: 1000000,
        personaleInServizio01012026: 1,
        valoreTabellaCCol3: 10.62
      },
      art33ManualDecision: 'DO_NOT_APPLY'
    } as unknown as AnnualData,
    fondi: {
      dipendente: {
        st_art79c1_art67c1_unicoImporto2017: 50000,
        st_art58c1_CCNL2026_incremento014_MS2021: 1400,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44
      },
      eq: {},
      segretario: {},
      dirigenza: {}
    },
    distribuzione: {},
    personaleDettaglio: [],
    calculatedInputs: {
      dipendentiEquivalenti2018: 10,
      dipendentiEquivalentiAnnoRif: 10,
      variazioneDipendenti: 0,
      isArt48Applicabile: false,
      numDipendentiContrattazione: 10
    }
  });

  // Helper per iniettare canonical entries
  const withEntries = (base: any, entries: any[]) => ({
    ...base,
    canonicalFund: {
      status: entries.some(e => e.status === 'UNDETERMINED') ? 'UNDETERMINED' : (entries.some(e => e.status === 'INVALID') ? 'INVALID' : 'VALID'),
      entries,
      stableTotal: entries.filter(e => e.status === 'VALID' && e.component === 'STABLE').reduce((s, e) => s + (e.operation === 'DEDUCTION' ? -e.amount : e.amount), 0),
      variableTotal: entries.some(e => e.component === 'VARIABLE' && e.status !== 'VALID') ? null : entries.filter(e => e.status === 'VALID' && e.component === 'VARIABLE').reduce((s, e) => s + e.amount, 0),
      total: entries.some(e => e.status !== 'VALID') ? null : entries.filter(e => e.status === 'VALID').reduce((s, e) => s + (e.operation === 'DEDUCTION' ? -e.amount : e.amount), 0),
      verifiedStableTotal: entries.filter(e => e.status === 'VALID' && e.component === 'STABLE').reduce((s, e) => s + (e.operation === 'DEDUCTION' ? -e.amount : e.amount), 0),
      verifiedVariableTotal: entries.filter(e => e.status === 'VALID' && e.component === 'VARIABLE').reduce((s, e) => s + e.amount, 0),
      verifiedTotal: entries.filter(e => e.status === 'VALID').reduce((s, e) => s + (e.operation === 'DEDUCTION' ? -e.amount : e.amount), 0),
      art23Subject: 0,
      art23Excluded: 0,
      verifiedArt23Subject: 0,
      verifiedArt23Excluded: 0,
      warnings: [],
      missingPrerequisites: []
    }
  });

  it('H1 — Astra A/2025: final total null', () => {
    const res = calculateFundCompletely(createInputA2025(), mockNormative);
    const proj = projectFundDocument(res);
    expect(res.canonicalFund.total).toBeNull();
    expect(proj.finalTotal).toBeNull();
    expect(proj.total).toBeNull();
    expect(proj.overallStatus).toBe('UNDETERMINED');
  });

  it('H2 — €3.400 esposto soltanto come subtotale verificato', () => {
    const res = calculateFundCompletely(createInputA2025(), mockNormative);
    const proj = projectFundDocument(res);
    expect(res.canonicalFund.verifiedTotal).toBe(3400);
    expect(proj.verifiedSubtotal).toBe(3400);
    expect(proj.formattedFinalTotal).toBe('NON ANCORA DETERMINABILE');
    expect(proj.formattedVerifiedSubtotal).toContain('3400');
  });

  it('H3 — Determina con totale null non costituisce €3.400 come totale finale', () => {
    const res = calculateFundCompletely(createInputA2025(), mockNormative);
    const vm = createDocumentViewModel(res, 'Comune Astra', { name: 'Operatore', role: 'UTENTE' });
    const det = buildDeterminaV2(vm);
    expect(det).not.toContain("DI COSTITUIRE, per le motivazioni espresse in premessa, il fondo per le risorse decentrate per il personale non dirigente per l’anno 2025 nell'importo complessivo");
    expect(det).toContain("DI DARE ATTO, in sede istruttoria, della quantificazione del subtotale delle risorse verificate per l'anno 2025");
    expect(det).toContain("3400");
  });

  it('H4 — Relazione non usa "totale generale/certificato" per €3.400 parziali', () => {
    const res = calculateFundCompletely(createInputA2025(), mockNormative);
    const vm = createDocumentViewModel(res, 'Comune Astra', { name: 'Operatore', role: 'UTENTE' });
    const rel = generateRelazioneTecnicaTXT(vm);
    expect(rel).not.toContain("TOTALE GENERALE: Euro € 3400,00");
    expect(rel).not.toContain("ESCLUSE DAL TOTALE CERTIFICATO");
    expect(rel).toContain("SUBTOTALE DELLE RISORSE VERIFICATE: Euro € 3400,00");
    expect(rel).toContain("TOTALE COMPLESSIVO DEL FONDO: NON ANCORA DETERMINABILE");
  });

  it('H5 — Prospetto non usa "totale disponibile" per importi parziali', () => {
    const res = calculateFundCompletely(createInputA2025(), mockNormative);
    const vm = createDocumentViewModel(res, 'Comune Astra', { name: 'Operatore', role: 'UTENTE' });
    const prosp = buildProspettoContrattazione(vm);
    expect(prosp).not.toContain("Totale Disponibile Fondo Dipendenti: € 3400,00");
    expect(prosp).toContain("Subtotale Risorse Verificate: € 3400,00");
    expect(prosp).toContain("Totale Complessivo Fondo: NON ANCORA DETERMINABILE");
  });

  it('H6 — Tabella 15 mantiene unresolved e stato di review', () => {
    const res = calculateFundCompletely(createInputA2025(), mockNormative);
    const tab = mapToTabella15(res, mockNormative);
    expect(tab.grandTotal).toBeNull();
    expect(tab.verifiedSubtotal).toBe(3400);
    expect(tab.overallStatus).toBe('UNDETERMINED');
    expect(tab.schemaVerificationStatus).toBe('RGS_SCHEMA_UNVERIFIED');
    expect(tab.isExportReady).toBe(false);
  });

  it('H7 — Unknown stable non riceve S615', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const unkStable = withEntries(base, [
      { id: 'CUSTOM_UNKNOWN_STABLE', amount: 11, component: 'STABLE', operation: 'ADDITION', competenceYear: 2025, source: 'MANUAL', art23Treatment: 'SUBJECT', status: 'VALID' }
    ]);
    const tab = mapToTabella15(unkStable, mockNormative);
    const entry = tab.sections.stabile.entries.find(e => e.key === 'CUSTOM_UNKNOWN_STABLE');
    expect(entry?.columnCode).toBe('RGS_MAPPING_UNRESOLVED');
    expect(entry?.columnCode).not.toBe('S615');
    expect(tab.unresolvedClassifications.some(u => u.key === 'CUSTOM_UNKNOWN_STABLE')).toBe(true);
  });

  it('H8 — Unknown variable non riceve S615', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const unkVar = withEntries(base, [
      { id: 'CUSTOM_UNKNOWN_VARIABLE', amount: 12, component: 'VARIABLE', operation: 'ADDITION', competenceYear: 2025, source: 'MANUAL', art23Treatment: 'SUBJECT', status: 'VALID' }
    ]);
    const tab = mapToTabella15(unkVar, mockNormative);
    const entry = tab.sections.variabile.entries.find(e => e.key === 'CUSTOM_UNKNOWN_VARIABLE');
    expect(entry?.columnCode).toBe('RGS_MAPPING_UNRESOLVED');
    expect(entry?.columnCode).not.toBe('S615');
    expect(entry?.columnCode).not.toBe('V699');
    expect(tab.unresolvedClassifications.some(u => u.key === 'CUSTOM_UNKNOWN_VARIABLE')).toBe(true);
  });

  it('H9 — Unknown deduction non riceve S699 automaticamente', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const unkDeduct = withEntries(base, [
      { id: 'CUSTOM_UNKNOWN_DEDUCTION', amount: 15, component: 'STABLE', operation: 'DEDUCTION', competenceYear: 2025, source: 'MANUAL', art23Treatment: 'SUBJECT', status: 'VALID' }
    ]);
    const tab = mapToTabella15(unkDeduct, mockNormative);
    const entry = tab.sections.stabile.entries.find(e => e.key === 'CUSTOM_UNKNOWN_DEDUCTION');
    expect(entry?.columnCode).toBe('RGS_MAPPING_UNRESOLVED');
    expect(entry?.columnCode).not.toBe('S699');
    expect(tab.unresolvedClassifications.some(u => u.key === 'CUSTOM_UNKNOWN_DEDUCTION')).toBe(true);
  });

  it('H10 — Rounding 100.005 produce 100.01 in ledger/DTO/XLSX/CSV', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const roundRes = withEntries(base, [
      { id: 'ROUND_TEST', amount: 100.005, component: 'STABLE', operation: 'ADDITION', competenceYear: 2025, source: 'MANUAL', art23Treatment: 'SUBJECT', status: 'VALID' }
    ]);
    const roundTab = mapToTabella15(roundRes, mockNormative);
    expect(roundTab.sections.stabile.entries[0].amount).toBe(100.01);
    expect(roundTab.verifiedSubtotal).toBe(100.01);
  });

  it('H11 — Numero/data revisori senza esito non producono parere favorevole', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const vm = createDocumentViewModel(base, 'Ente', { name: 'Op', role: 'U' }, { numVerbaleRevisori: '12', dataVerbaleRevisori: '15/03/2026' });
    const det = buildDeterminaV2(vm);
    expect(det).not.toContain('Del parere favorevole espresso');
    expect(det).toContain("Verbale n. 12 del 15/03/2026. L'esito del parere dell'Organo di Revisione non risulta documentato nei dati disponibili;");
  });

  it('H12 — Esito favorevole esplicito rappresentato correttamente', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const vm = createDocumentViewModel(base, 'Ente', { name: 'Op', role: 'U' }, { numVerbaleRevisori: '12', dataVerbaleRevisori: '15/03/2026', opinionOutcome: 'FAVORABLE' });
    const det = buildDeterminaV2(vm);
    expect(det).toContain('Del parere favorevole espresso dal Collegio dei Revisori dei Conti con verbale n. 12 del 15/03/2026;');
  });

  it('H13 — Esito non favorevole non trasformato in favorevole', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const vm = createDocumentViewModel(base, 'Ente', { name: 'Op', role: 'U' }, { numVerbaleRevisori: '12', dataVerbaleRevisori: '15/03/2026', opinionOutcome: 'UNFAVORABLE' });
    const det = buildDeterminaV2(vm);
    expect(det).toContain('Del parere NON favorevole espresso dal Collegio dei Revisori dei Conti con verbale n. 12 del 15/03/2026;');
    expect(det).not.toContain('Del parere favorevole espresso');
  });

  it('H14 — Assenza verbale non produce falsa trasmissione', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const vm = createDocumentViewModel(base, 'Ente', { name: 'Op', role: 'U' }, {});
    const det = buildDeterminaV2(vm);
    expect(det).not.toContain('viene trasmesso al Collegio dei Revisori');
    expect(det).toContain("Gli estremi e l'esito del parere dell'Organo di Revisione non risultano documentati nei dati disponibili;");
  });

  it('H15 — Stato GC assente produce testo neutro', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const vm = createDocumentViewModel(base, 'Ente', { name: 'Op', role: 'U' }, {});
    const det = buildDeterminaV2(vm);
    expect(det).not.toContain('In attesa di adozione della deliberazione');
    expect(det).toContain('La deliberazione di indirizzo della Giunta Comunale non risulta documentata nei dati disponibili;');
  });

  it('H16 — Numero/data GC non implicano adozione', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const vm = createDocumentViewModel(base, 'Ente', { name: 'Op', role: 'U' }, { numDeliberaGc: '45', dataDeliberaGc: '10/03/2026' });
    const det = buildDeterminaV2(vm);
    expect(det).not.toContain('La deliberazione della G.C. n. 45 del 10/03/2026');
    expect(det).toContain('La deliberazione di indirizzo della Giunta Comunale non risulta documentata nei dati disponibili;');
  });

  it('H17 — CanonicalFundResult assente blocca l export definitivo', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const legacyResult = { ...base, canonicalFund: undefined as any };
    const factory = new DocumentFactory(legacyResult, 'Ente', { id: 'u1', name: 'Op', role: 'USER' } as any);
    expect(factory.isDefinitiveExportReady()).toBe(false);
    expect(() => factory.assertDefinitiveExportAllowed()).toThrow(/CanonicalFundLedger/);
  });

  it('H18 — Art60 2025/2026 ancora corretto', () => {
    const res2025 = calculateFundCompletely(createInputA2025(), mockNormative);
    const tab2025 = mapToTabella15(res2025, mockNormative);
    expect(tab2025.sections.stabile.entries.find(e => e.key === 'ART60_CONSOLIDATION')).toBeUndefined();

    const res2026 = calculateFundCompletely(createInput2026(), mockNormative);
    const tab2026 = mapToTabella15(res2026, mockNormative);
    const art60Row = tab2026.sections.stabile.entries.find(e => e.key === 'ART60_CONSOLIDATION');
    expect(art60Row?.amount).toBe(-127.44);
    expect(art60Row?.columnCode).toBe('S616');
  });

  it('H19 — economicEffect=false non entra nelle risorse economiche', () => {
    const base = calculateFundCompletely(createInputA2025(), mockNormative);
    const figOnly = withEntries(base, [
      { id: 'FIG_ENTRY', amount: 50, component: 'STABLE', operation: 'ADDITION', competenceYear: 2025, source: 'MANUAL', art23Treatment: 'SUBJECT', status: 'VALID', economicEffect: false }
    ]);
    const tab = mapToTabella15(figOnly, mockNormative);
    expect(tab.sections.stabile.entries.find(e => e.key === 'FIG_ENTRY')).toBeUndefined();
    expect(tab.grandTotal).toBe(0);
  });

  it('H20 — Multi-ente e multi-anno senza contaminazione', () => {
    const cases = [createInputA2025(), createInput2026('Comune A'), createInput2026('Comune B')];
    const results = cases.map(inp => {
      const res = calculateFundCompletely(inp, mockNormative);
      const tab = mapToTabella15(res, mockNormative);
      const vm = createDocumentViewModel(res, inp.annualData.denominazioneEnte!, { name: 'Op', role: 'U' });
      return {
        tableEntity: tab.entityName,
        tableYear: tab.year,
        vmEntity: vm.ente.denominazione,
        vmYear: vm.ente.anno,
        art60: tab.sections.stabile.entries.find(e => e.key === 'ART60_CONSOLIDATION')?.amount ?? 0
      };
    });

    expect(results[0].tableEntity).toBe('Comune Astra');
    expect(results[0].tableYear).toBe(2025);
    expect(results[0].art60).toBe(0);

    expect(results[1].tableEntity).toBe('Comune A');
    expect(results[1].tableYear).toBe(2026);
    expect(results[1].art60).toBe(-127.44);

    expect(results[2].tableEntity).toBe('Comune B');
    expect(results[2].tableYear).toBe(2026);
    expect(results[2].art60).toBe(-127.44);
  });
});
