import { confirmedFixtureWrite, FIXTURE_VERSION } from '../../test/fixtures/b1Persistence';
import { absentBaseline } from '../../application/snapshots/versionedSnapshotContract';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import * as XLSX from 'xlsx';
import type { FundData } from '../types';
import type { NormativeData } from '../index';
import { UserRole } from '../enums';
import { createEmptyAnnualData, createEmptyFundData, createEmptyHistoricalData } from '../emptyFund';
import { hydrateFundData } from '../../application/input/hydrateFundData';
import { normalizeInput } from '../../application/input/inputNormalizer';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { resolveDirigenzaArt23Subject } from '../../logic/calculation/dirigenzaArt23';
import { resolvePnrrFaculty } from '../../logic/shared/pnrrFaculty';
import { resolveAnnualDl25 } from '../../logic/shared/dl25CarryForward';
import { resolveChecklist } from '../../logic/cabina/resolveChecklist';
import { resolveCabinaViewModel } from '../../logic/cabina/resolveCabinaViewModel';
import { resolveDistributionFundBudget } from '../../logic/distribution/resolveDistributionFundBudget';
import { DOCUMENT_KINDS, resolveDocumentKindReadiness } from '../documentKindReadiness';
import { resolveClosureInstructionReadiness } from '../../logic/closure/resolveClosureInstructionReadiness';
import { initializeAnnualSnapshot, loadAnnualSnapshot, saveAnnualSnapshot, switchActiveYear } from '../../application/snapshots/snapshotWorkflow';
import type { WorkflowDependencies } from '../../application/ports';
import { mapCsvRowToFundData } from '../../logic/import/csvMapper';
import { generateExcelTemplate } from '../../services/excelService';
import { createEmptyWizard2026DraftState } from '../../features/wizard2026/initialState';
import { wizard2026Reducer } from '../../features/wizard2026/reducer';
import * as samples from '../../test/fixtures/legacyDemoFund';

vi.mock('xlsx', async importOriginal => ({
  ...await importOriginal<typeof import('xlsx')>(), writeFile: vi.fn(),
}));

const demoPaths = [
  ...Object.entries(samples.INITIAL_HISTORICAL_DATA).filter(([, value]) => typeof value === 'number').map(([key, value]) => [`historicalData.${key}`, value]),
  ...Object.entries(samples.INITIAL_SIMULATORE_INPUT).map(([key, value]) => [`annualData.simulatoreInput.${key}`, value]),
  ['annualData.numeroAbitanti', 15000], ['annualData.fondoLavoroStraordinario', 50000],
  ['fondoSegretarioComunaleData.fin_percentualeCoperturaPostoSegretario', 100],
  ['distribuzioneRisorseData.criteri_percPerfIndividuale', 50],
  ['distribuzioneRisorseData.criteri_percMaggiorazionePremio', 20],
  ['distribuzioneRisorseData.criteri_percDipendentiBonus', 5],
] as [string, number][];
const valueAt = (data: unknown, path: string): unknown => path.split('.').reduce<any>((value, key) => value?.[key], data);
const assertNoDemo = (data: FundData) => {
  for (const [path, old] of demoPaths) { expect(valueAt(data, path), path).not.toBe(old); }
};
const normative = JSON.parse(readFileSync('public/normativa.json', 'utf8')) as NormativeData;
const user = { id: 'data01-local', email: 'data01@example.invalid', role: UserRole.GUEST };
const entity = { id: 'data01-entity', user_id: user.id, name: 'Ente reale DATA01' };
function memoryRepository() {
  const records = new Map<string, any>();
  const stateRepository = {
    getState: vi.fn(async (_user: unknown, id: string, year: number) => ({ data: records.get(`${id}:${year}`) ?? null, error: null })),
    createState: vi.fn(async (payload: any) => {
      const result = confirmedFixtureWrite(payload);
      records.set(`${payload.entity_id}:${payload.current_year}`, result.data);
      return result;
    }),
    upsertState: vi.fn(async (payload: any) => {
      const result = confirmedFixtureWrite(payload);
      records.set(`${payload.entity_id}:${payload.current_year}`, result.data);
      return result;
    }),
  };
  const deps = { stateRepository, userRepository: { getUserRole: vi.fn(async () => ({ data: UserRole.GUEST, error: null })) },
    entityRepository: { update: vi.fn(async () => ({ error: null })) } } as unknown as WorkflowDependencies;
  return { records, stateRepository, deps };
}

describe('DATA01 real empty entity', () => {
  it('counterexample checks every known populated demo field, not just one total', () => {
    expect(demoPaths).toHaveLength(23);
    const real = createEmptyFundData(2026, entity.name);
    for (const [path] of demoPaths) expect(valueAt(real, path), path).toBeUndefined();
    expect(real.historicalData).toEqual({});
    assertNoDemo(real);
  });
  it.each(demoPaths)('%s starts missing instead of %s', (path, old) => {
    expect(valueAt(createEmptyFundData(2026), path)).toBeUndefined();
    expect(valueAt(createEmptyFundData(2026), path)).not.toBe(old);
  });
  it('does not attest classification, financial virtue or Dirigenza applicability', () => {
    const annual = createEmptyAnnualData(2026);
    for (const key of ['tipologiaEnte', 'numeroAbitanti', 'hasDirigenza', 'isEnteDissestato', 'isEnteStrutturalmenteDeficitario',
      'isEnteRiequilibrioFinanziario', 'condizioniVirtuositaFinanziariaSoddisfatte']) expect(valueAt(annual, key)).toBeUndefined();
    expect(annual.personaleServizioAttuale.every(row => row.count === undefined)).toBe(true);
  });
  it('PNRR remains UNSET with no eligibility, maximum or applied amount evidence', () => {
    const annual = createEmptyAnnualData(2026);
    const pnrr = resolvePnrrFaculty({ referenceYear: annual.annoRiferimento, exerciseDecision: annual.pnrrExerciseDecision,
      stableCertifiedFund2016: annual.fondoStabile2016PNRR, requirementA: annual.rispettoEquilibrioBilancioPrecedente,
      requirementB: annual.rispettoDebitoCommercialePrecedente, requirementD: annual.approvazioneRendicontoPrecedente });
    expect(pnrr).toMatchObject({ exerciseDecision: 'UNSET', eligibility: 'UNDETERMINED', contribution: 0 });
    expect(pnrr.maximumAvailable).toBeUndefined();
    expect(pnrr.amountApplied).toBeUndefined();
    expect(Object.values(pnrr.requirements).every(value => value === undefined)).toBe(true);
  });
  it('DL25 has no payroll/baseline/stock/date/financial room evidence', () => {
    const empty = createEmptyFundData(2026);
    expect(empty.annualData.simulatoreInput).toEqual({});
    expect(empty.annualData.dl25).toBeUndefined();
    expect(resolveAnnualDl25(empty)).toMatchObject({ state: 'UNDETERMINED', issues: ['DL25_BASELINE_MISSING'] });
  });
  it('declaring hasDirigenza without detail does not fabricate a zero model', () => {
    const empty = createEmptyFundData(2026);
    empty.annualData.hasDirigenza = true;
    expect(Object.keys(empty.fondoDirigenzaData)).toEqual([]);
    expect(resolveDirigenzaArt23Subject(empty.fondoDirigenzaData, true)).toMatchObject({ status: 'UNDETERMINED', subjectAmount: null });
  });
  it('optional Dirigenza absences contribute zero only after real detail is supplied', () => {
    const empty = createEmptyFundData(2026);
    empty.annualData.hasDirigenza = true;
    empty.fondoDirigenzaData = { st_art57c2a_CCNL2020_unicoImporto2020: 123 };
    expect(resolveDirigenzaArt23Subject(empty.fondoDirigenzaData, true)).toMatchObject({ status: 'VALID', subjectAmount: 123, excludedAmount: 0 });
  });
  it('empty entity has no final fund, certified Cabina, final document, closure or distribution budget', () => {
    const empty = createEmptyFundData(2026, entity.name);
    // A brand-new entity has no classification decision: the existing engine blocks it.
    expect(() => calculateFundCompletely(normalizeInput(empty), normative)).toThrow('decisione manuale esplicita');
    // An explicit classification choice must still not certify missing economics.
    empty.annualData.art33ManualDecision = 'DO_NOT_APPLY';
    const result = calculateFundCompletely(normalizeInput(empty), normative);
    expect(result.canonicalFund.status).toBe('UNDETERMINED');
    expect(result.canonicalFund.total).toBeNull();
    expect(result.canonicalFund.verifiedTotal).toBe(0);
    expect(result.totals.totaleFondo).toBe(0); // Known empty subtotal, never a certified final fund.
    const issues = resolveChecklist({ canonicalFund: result.canonicalFund, complianceChecks: result.compliance.checks });
    expect(resolveCabinaViewModel({ calculationResult: result, complianceChecks: result.compliance.checks }).status).toBe('TO_COMPLETE');
    for (const documentKind of DOCUMENT_KINDS) expect(resolveDocumentKindReadiness({ documentKind, canonicalFund: result.canonicalFund, issues }).status).toBe('DRAFT_ONLY');
    expect(resolveClosureInstructionReadiness({ canonicalFund: result.canonicalFund, issues }).status).toBe('NOT_READY');
    expect(resolveDistributionFundBudget(result.canonicalFund)).toMatchObject({ authoritativeFundTotal: null, basis: { mode: 'VERIFIED_DRAFT', amount: 0 } });
  });
});

describe('DATA01 mutable object isolation', () => {
  it('entity A mutation leaves every nested mutable reference of entity B independent', () => {
    const a = createEmptyFundData(2026), b = createEmptyFundData(2026);
    expect(a).toEqual(b);
    const collect = (value: unknown, objects = new Set<object>()): Set<object> => {
      if (value && typeof value === 'object') { objects.add(value); Object.values(value).forEach(child => collect(child, objects)); }
      return objects;
    };
    const aObjects = collect(a);
    for (const object of collect(b)) expect(aObjects.has(object)).toBe(false);
    const before = structuredClone(b);
    a.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 = 100000;
    a.annualData.personaleServizioAttuale[0].count = 40;
    a.annualData.proventiSpecifici.push({ id: 'A', descrizione: 'Real', importo: 1, riferimentoNormativo: 'Ente' });
    a.annualData.simulatoreInput.simStipendiTabellari2023 = 42;
    a.annualData.ccnl2024!.monteSalari2021 = 12;
    a.fondoDirigenzaData.st_art57c2a_CCNL2020_unicoImporto2020 = 100000;
    a.personaleServizio.isManualMode = true;
    expect(b).toEqual(before);
  });
  it('individual historical/annual factories allocate fresh objects without losing undefined counts', () => {
    expect(createEmptyHistoricalData()).not.toBe(createEmptyHistoricalData());
    const a = createEmptyAnnualData(2027), b = createEmptyAnnualData(2027);
    expect(a).toEqual(b);
    expect(a.personaleServizioAttuale).not.toBe(b.personaleServizioAttuale);
    expect(a.personaleServizioAttuale[0]).not.toBe(b.personaleServizioAttuale[0]);
    expect(a.personaleServizioAttuale[0]).toHaveProperty('count', undefined);
    expect(a.ccnl2024).not.toBe(b.ccnl2024);
    expect(a.ccnl2024!.ivcConglobation).toBeUndefined();
  });
  it('Wizard initialization and reset are independent and remain economically empty', () => {
    const a = createEmptyWizard2026DraftState(), b = createEmptyWizard2026DraftState();
    const before = structuredClone(b);
    a.dl25.quoteAderenti!.push({} as any);
    a.art23.personale2018Art23!.push({} as any);
    expect(b).toEqual(before);
    const r1 = wizard2026Reducer(a, { type: 'RESET_WIZARD_2026' });
    const r2 = wizard2026Reducer(a, { type: 'RESET_WIZARD_2026' });
    expect(r1).toEqual(r2);
    expect(r1).not.toBe(r2);
    expect(r1.pnrr.componenteStabileFondoDipendenti2016).toBeUndefined();
    expect(r1.dl25.stipendiTabellari2023NonDirigenti).toBeUndefined();
    expect(r1.art23.personale2018Art23).not.toBe(r2.art23.personale2018Art23);
  });
});

describe('DATA01 hydration', () => {
  it.each(['ente-con-dirigenza', 'ente-con-eq', 'ente-con-segretario', 'ente-senza-dirigenza',
    'caso-distribuzione-consuntivo', 'caso-incremento-2025', 'caso-riporti-anno-precedente', 'caso-superamento-tetto-art23'])('real %s fixture retains identical complete economics', name => {
    const source = JSON.parse(readFileSync(`tests/fixtures/fondo/${name}.json`, 'utf8')) as FundData;
    const before = structuredClone(source);
    const hydrated = hydrateFundData(source, source.annualData.annoRiferimento, source.annualData.denominazioneEnte || '');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T10:00:00Z'));
    try {
      expect(calculateFundCompletely(normalizeInput(hydrated), normative)).toEqual(calculateFundCompletely(normalizeInput(source), normative));
    } finally { vi.useRealTimers(); }
    expect(source).toEqual(before);
  });
  it('one real historical amount remains the only historical amount', () => {
    const source = { historicalData: { fondoSalarioAccessorioPersonaleNonDirEQ2016: 4321 } };
    const hydrated = hydrateFundData(source, 2026, entity.name);
    expect(hydrated.historicalData).toEqual(source.historicalData);
    expect(hydrated.annualData.simulatoreInput).toEqual({});
    assertNoDemo(hydrated);
  });
  it.each([undefined, null, 0])('present historical %s is not replaced or changed', value => {
    const historical = { fondoSalarioAccessorioPersonaleNonDirEQ2016: value };
    const hydrated = hydrateFundData({ historicalData: historical as any }, 2026, entity.name);
    expect(hydrated.historicalData).toEqual(historical);
    expect(Object.prototype.hasOwnProperty.call(hydrated.historicalData, 'fondoSalarioAccessorioPersonaleNonDirEQ2016')).toBe(true);
    expect(hydrated.historicalData.fondoEQ2018_Art23).toBeUndefined();
  });
  it.each([0, 2000, 999999])('raw legacy Dirigenza cache %s remains unresolved after hydration/normalization', cache => {
    const source = { annualData: { annoRiferimento: 2026, hasDirigenza: true, art33ManualDecision: 'DO_NOT_APPLY' as const },
      fondoDirigenzaData: { lim_totaleParzialeRisorseConfrontoTetto2016: cache } };
    const hydrated = hydrateFundData(source, 2026, entity.name);
    expect(Object.keys(hydrated.fondoDirigenzaData)).toEqual(['lim_totaleParzialeRisorseConfrontoTetto2016']);
    const normalized = normalizeInput(hydrated);
    expect(resolveDirigenzaArt23Subject(normalized.fondi.dirigenza, true)).toMatchObject({ status: 'UNDETERMINED', subjectAmount: null });
    const result = calculateFundCompletely(normalized, normative);
    expect(result.compliance.dirigenzaArt23?.status).toBe('UNDETERMINED');
    expect(result.compliance.art23c2.isCompliant).toBe(false);
  });
  it('CLOSED snapshot shape, null, zero, absent fields and own undefined are not rewritten', () => {
    const raw = { annualData: { annoRiferimento: 2025, hasDirigenza: true },
      historicalData: { fondoSalarioAccessorioPersonaleNonDirEQ2016: 0, fondoDirigenza2016: null, fondoEQ2018_Art23: undefined },
      fondoDirigenzaData: { lim_totaleParzialeRisorseConfrontoTetto2016: 5555 }, metadata: { snapshotStatus: 'CLOSED' } };
    const hydrated = hydrateFundData(raw as any, 2025, 'different display name');
    expect(hydrated).toEqual(raw);
    expect(JSON.stringify(hydrated)).toBe(JSON.stringify(raw));
    expect(hydrated).not.toBe(raw);
    expect(hydrated.historicalData).not.toBe(raw.historicalData);
  });
});

describe('DATA01 real annuality/persistence', () => {
  it('missing N+1 starts empty except the already-qualified explicit DL25 stock', async () => {
    const { deps } = memoryRepository();
    const source = createEmptyFundData(2026, entity.name);
    source.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 = 777000;
    source.annualData.dl25 = { version: 1, stipendiTabellari2023NonDirigenti: 1000000, fondoStabile2025Certificato: 300000,
      budgetEq2025: 100000, priorCumulativeApplied: 10000, priorStockProvenance: 'atto 2025', currentYearDelta: 5000 };
    source.fondoAccessorioDipendenteData.st_incrementoDL25_2025 = 15000;
    source.annualData.pnrrExerciseDecision = 'EXERCISED';
    source.annualData.fondoStabile2016PNRR = 2000;
    source.fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016 = 100;
    const before = structuredClone(source);
    const result = await switchActiveYear(deps, user, entity, 2026, 2027, UserRole.GUEST, source, createEmptyFundData(2027, entity.name), false);
    expect(result.success).toBe(true);
    const next = result.newSnapshot!.fundData as FundData;
    expect(next.annualData.annoRiferimento).toBe(2027);
    expect(next.annualData.dl25).toMatchObject({ priorCumulativeApplied: 15000, currentYearDelta: 0 });
    expect(next.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(15000);
    expect(next.historicalData).toEqual({}); // Annual snapshot lifecycle; no generic historical copy policy.
    expect(next.annualData.pnrrExerciseDecision).toBeUndefined();
    expect(next.annualData.fondoStabile2016PNRR).toBeUndefined();
    expect(next.fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016).toBeUndefined();
    assertNoDemo(next);
    next.annualData.dl25!.budgetEq2025 = 8;
    next.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 = 999;
    expect(source).toEqual(before);
  });
  it('existing target-year real historical evidence is loaded intact, including zero', async () => {
    const { deps, records, stateRepository } = memoryRepository();
    const persisted = createEmptyFundData(2027, entity.name);
    persisted.historicalData = { fondoSalarioAccessorioPersonaleNonDirEQ2016: 777000, fondoElevateQualificazioni2016: 0 };
    records.set(`${entity.id}:2027`, { entity_id: entity.id, user_id: user.id, current_year: 2027, fund_data: persisted });
    const result = await switchActiveYear(deps, user, entity, 2026, 2027, UserRole.GUEST, createEmptyFundData(2026), createEmptyFundData(2027), false);
    expect(result.newSnapshot!.fundData.historicalData).toEqual(persisted.historicalData);
    expect(stateRepository.createState).not.toHaveBeenCalled();
    expect(stateRepository.upsertState).not.toHaveBeenCalled();
  });
  it('cross-entity initialization does not inherit previous economic values or stock', async () => {
    const { deps } = memoryRepository();
    const previous = createEmptyFundData(2026, 'A');
    previous.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 = 100000;
    previous.annualData.simulatoreInput.simStipendiTabellari2023 = 4567;
    const result = await switchActiveYear(deps, user, entity, 2026, 2027, UserRole.GUEST, previous,
      createEmptyFundData(2027, entity.name), false, { ...entity, id: 'different-A' });
    expect(result.newSnapshot!.fundData.historicalData).toEqual({});
    expect(result.newSnapshot!.fundData.annualData.dl25).toBeUndefined();
    expect(result.newSnapshot!.fundData.annualData.simulatoreInput).toEqual({});
  });
  it('initialize detaches caller data, persisted payload and returned snapshot', async () => {
    const { deps, stateRepository } = memoryRepository();
    const empty = createEmptyFundData(2026, entity.name);
    const result = await initializeAnnualSnapshot(deps, user.id, entity.id, 2026, user, empty);
    expect(result.success).toBe(true);
    const saved = stateRepository.createState.mock.calls[0][0].fund_data;
    const returned = result.snapshot!.fundData;
    expect(saved).toEqual({ ...empty, metadata: { snapshotStatus: 'OPEN' } });
    expect(empty.metadata).toBeUndefined();
    expect(returned).not.toBe(empty);
    returned.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 = 1;
    expect(saved.historicalData).toEqual({});
    expect(empty.historicalData).toEqual({});
  });
  it('partial CSV import → save/reload keeps input zero and missing without sample fill', async () => {
    const { deps } = memoryRepository();
    const empty = createEmptyFundData(2026, entity.name);
    const { mappedData } = mapCsvRowToFundData({ anno: 2026, fondo_personale_2016: 3210, fondo_eq_2016: 0 } as any, empty);
    const data = hydrateFundData(mappedData, 2026, entity.name);
    expect((await saveAnnualSnapshot(deps, user, entity, 2026, UserRole.GUEST, data, absentBaseline(user.id, entity.id, 2026))).success).toBe(true);
    const loaded = await loadAnnualSnapshot(deps, user, entity.id, 2026);
    const actual = hydrateFundData(loaded.snapshot!.fundData, 2026, entity.name);
    expect(actual.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016).toBe(3210);
    expect(actual.historicalData.fondoElevateQualificazioni2016).toBe(0);
    expect(actual.historicalData.fondoDirigenza2016).toBeUndefined();
    expect(actual.annualData.simulatoreInput.simStipendiTabellari2023).toBeUndefined();
    assertNoDemo(actual);
  });
  it('empty → save/reload preserves required missing and optional absence', async () => {
    const { deps } = memoryRepository();
    const empty = createEmptyFundData(2026, entity.name);
    await saveAnnualSnapshot(deps, user, entity, 2026, UserRole.GUEST, empty, absentBaseline(user.id, entity.id, 2026));
    const loaded = await loadAnnualSnapshot(deps, user, entity.id, 2026);
    const actual = hydrateFundData(loaded.snapshot!.fundData, 2026, entity.name);
    expect(actual.historicalData).toEqual({});
    expect(actual.fondoDirigenzaData).toEqual({});
    expect(actual.annualData.personaleServizioAttuale.every(row => row.count === undefined)).toBe(true);
    assertNoDemo(actual);
  });
  it('CLOSED load/hydrate makes no write and save is rejected', async () => {
    const { deps, records, stateRepository } = memoryRepository();
    const raw = { historicalData: { fondoSalarioAccessorioPersonaleNonDirEQ2016: 0 }, annualData: { annoRiferimento: 2026 }, metadata: { snapshotStatus: 'CLOSED' } };
    records.set(`${entity.id}:2026`, { entity_id: entity.id, user_id: user.id, current_year: 2026, fund_data: raw, b1i4_version: FIXTURE_VERSION });
    const loaded = await loadAnnualSnapshot(deps, user, entity.id, 2026);
    expect(hydrateFundData(loaded.snapshot!.fundData, 2026, entity.name)).toEqual(raw);
    expect((await saveAnnualSnapshot(deps, user, entity, 2026, UserRole.GUEST, raw, loaded.baseline)).reason).toBe('STATE_CLOSED');
    expect(stateRepository.upsertState).not.toHaveBeenCalled();
    expect(stateRepository.createState).not.toHaveBeenCalled();
  });
  it('Excel export of partial data contains real values/zero and no missing sample values', () => {
    const partial = createEmptyFundData(2026, entity.name);
    partial.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 = 3210;
    partial.historicalData.fondoElevateQualificazioni2016 = 0;
    vi.mocked(XLSX.writeFile).mockClear();
    generateExcelTemplate(partial);
    const workbook = vi.mocked(XLSX.writeFile).mock.calls[0][0];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]]);
    const exported = new Map(rows.map(row => [row['Chiave Tecnica (NON MODIFICARE)'], row.Valore]));
    expect(exported.get('historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016')).toBe(3210);
    expect(exported.get('historicalData.fondoElevateQualificazioni2016')).toBe(0);
    for (const [path, old] of demoPaths) if (exported.has(path)) expect(exported.get(path), path).not.toBe(old);
  });
});

describe('DATA01 demo isolation', () => {
  it('sample data remains explicit test data; normal factories cannot import it', () => {
    expect(samples.INITIAL_HISTORICAL_DATA.fondoSalarioAccessorioPersonaleNonDirEQ2016).toBe(1200000);
    expect(samples.INITIAL_SIMULATORE_INPUT.simStipendiTabellari2023).toBe(2500000);
    const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return ['__tests__', 'test'].includes(entry.name) ? [] : walk(path);
      return /\.[tj]sx?$/.test(path) && !/\.(test|spec)\./.test(path) ? [path] : [];
    });
    for (const file of walk('src')) {
      const code = readFileSync(file, 'utf8');
      expect(code, file).not.toMatch(/from\s+['"][^'"]*(?:legacyDemoFund|test\/fixtures)[^'"]*['"]/);
    }
  });
});
