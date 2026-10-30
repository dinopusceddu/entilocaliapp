import { fixtureRow, fixtureBaseline, confirmedFixtureWrite, FIXTURE_VERSION } from '../../../test/fixtures/b1Persistence';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import type { FundData, NormativeData, FondoDirigenzaData } from '../../../domain';
import { AnnualSnapshotStatus, TipologiaEnte, UserRole } from '../../../domain';
import { calculateFundCompletely } from '../fundEngine';
import { normalizeInput } from '../../../application/input/inputNormalizer';
import { createCharacterizationFundInput, mockNormativeData } from '../../__tests__/fixtures/limite2016CharacterizationFixtures';
import { resolveCabinaViewModel } from '../../cabina/resolveCabinaViewModel';
import { resolveChecklist } from '../../cabina/resolveChecklist';
import { resolveDocumentKindReadiness, DOCUMENT_KINDS } from '../../../domain/documentKindReadiness';
import { resolveClosureInstructionReadiness } from '../../closure/resolveClosureInstructionReadiness';
import { loadAnnualSnapshot, saveAnnualSnapshot } from '../../../application/snapshots/snapshotWorkflow';

const base = 'st_art57c2a_CCNL2020_unicoImporto2020';
const cacheKey = 'lim_totaleParzialeRisorseConfrontoTetto2016';
const frozen = () => JSON.parse(readFileSync('tests/fixtures/fondo/ente-con-dirigenza.json', 'utf8')) as FundData;
const normative = JSON.parse(readFileSync('public/normativa.json', 'utf8')) as NormativeData;
const localInput = (dirigenza: FondoDirigenzaData, cap = 1000, hasDirigenza = true) => createCharacterizationFundInput({
  annualData: { annoRiferimento: 2025, tipologiaEnte: TipologiaEnte.UNIONE_COMUNI, hasDirigenza, ccnl2024: { monteSalari2021: 0 } },
  historicalData: { manualPersonalFundLimit2016: cap }, fondi: { dirigenza },
});
function readiness(result: ReturnType<typeof calculateFundCompletely>) {
  const issues = resolveChecklist({ canonicalFund: result.canonicalFund, complianceChecks: result.compliance.checks });
  return {
    cabina: resolveCabinaViewModel({ calculationResult: result, complianceChecks: result.compliance.checks }).status,
    documents: DOCUMENT_KINDS.map(documentKind => resolveDocumentKindReadiness({ documentKind, canonicalFund: result.canonicalFund, issues }).status),
    closure: resolveClosureInstructionReadiness({ canonicalFund: result.canonicalFund, issues }).status,
  };
}
function economics(result: ReturnType<typeof calculateFundCompletely>) {
  return { subject: result.compliance.art23Compliance?.art23Componenti?.dirigenza, art23: result.compliance.art23c2,
    checks: result.compliance.checks, status: result.canonicalFund.status, errors: result.compliance.art23Compliance?.errors, ...readiness(result) };
}

describe('whole entity Dirigenza Art23', () => {
  it('frozen input preserves 1.61m and nominal delta 70000 but missing prerequisites cannot certify compliance', () => {
    const data = frozen();
    const before = JSON.stringify(data);
    const result = calculateFundCompletely(normalizeInput(data), normative);
    expect(result.compliance.dirigenzaArt23).toMatchObject({ status: 'VALID', subjectAmount: 280000, excludedAmount: 20000 });
    expect(result.compliance.art23c2).toMatchObject({ limite: 1680000, valoreSoggetto: 1610000, delta: 70000, isCompliant: false, status: 'UNDETERMINED' });
    expect(result.totals.totaleFondo).toBe(1675000);
    expect(JSON.stringify(data)).toBe(before);
  });
  it.each([undefined, null, 0, 1, 280000, 2000, 999999, NaN, Infinity, 'malformed'])('frozen cache %s never changes economics or gates', cache => {
    const original = frozen();
    const expected = calculateFundCompletely(normalizeInput(original), normative);
    const data = frozen();
    (data.fondoDirigenzaData as Record<string, unknown>)[cacheKey] = cache;
    const result = calculateFundCompletely(normalizeInput(data), normative);
    expect(economics(result)).toEqual(economics(expected));
  });
  it.each([undefined, null, 0, 1, 2000, 999999])('original CALC04 counterexample cache %s remains non-compliant', cache => {
    const result = calculateFundCompletely(localInput({ [base]: 2000, [cacheKey]: cache } as FondoDirigenzaData), mockNormativeData);
    expect(result.compliance.art23c2).toMatchObject({ limite: 1000, valoreSoggetto: 2000, delta: -1000, isCompliant: false, status: 'INVALID', comparisonReady: true });
    expect(readiness(result)).toEqual({ cabina: 'BLOCKED', documents: DOCUMENT_KINDS.map(() => 'DRAFT_ONLY'), closure: 'NOT_READY' });
  });
  it('stale positive cache does not invent a breach', () => {
    const result = calculateFundCompletely(localInput({ [base]: 500, [cacheKey]: 2000 }), mockNormativeData);
    expect(result.compliance.art23c2.isCompliant).toBe(true);
    expect(result.compliance.dirigenzaArt23?.reconciliation.status).toBe('MISMATCH');
    expect(readiness(result)).toEqual({ cabina: 'CONSTITUTION_VERIFIED', documents: DOCUMENT_KINDS.map(() => 'FINAL_READY'), closure: 'READY' });
  });
  it('declared zero never falls back', () => {
    const result = calculateFundCompletely(localInput({ [base]: 0, [cacheKey]: 5000 }), mockNormativeData);
    expect(result.compliance.dirigenzaArt23).toMatchObject({ status: 'VALID', subjectAmount: 0 });
    expect(result.compliance.art23c2.valoreSoggetto).toBe(0);
  });
  it('hasDirigenza false ignores stale cache and invalid detail', () => {
    const result = calculateFundCompletely(localInput({ [base]: Infinity, [cacheKey]: 50000 }, 1000, false), mockNormativeData);
    expect(result.compliance.art23c2.valoreSoggetto).toBe(0);
    expect(result.compliance.art23c2.isCompliant).toBe(true);
  });
  it.each([undefined, 0, 2000, 999999])('legacy cache-only %s is unresolved, never a fallback', cache => {
    const result = calculateFundCompletely(localInput({ [cacheKey]: cache }), mockNormativeData);
    expect(result.compliance.dirigenzaArt23?.status).toBe('UNDETERMINED');
    expect(result.compliance.art23c2.isCompliant).toBe(false);
    expect(result.compliance.checks.find(c => c.id === 'limite_art23_c2')?.isCompliant).toBe(false);
    expect(readiness(result)).toEqual({ cabina: 'TO_COMPLETE', documents: DOCUMENT_KINDS.map(() => 'DRAFT_ONLY'), closure: 'NOT_READY' });
  });
  it.each([NaN, Infinity, -1, 'malformed', Number.MAX_VALUE])('invalid atomic %s fails closed without arithmetic exceptions', value => {
    const result = calculateFundCompletely(localInput({ [base]: value, [cacheKey]: 2000 } as unknown as FondoDirigenzaData), mockNormativeData);
    expect(result.compliance.dirigenzaArt23?.status).toBe('INVALID');
    expect(result.compliance.art23c2.isCompliant).toBe(false);
    expect(readiness(result)).toEqual({ cabina: 'BLOCKED', documents: DOCUMENT_KINDS.map(() => 'DRAFT_ONLY'), closure: 'NOT_READY' });
  });
  it('FAD 500 + EQ 100 + Segretario 100 + Dirigenza 200 + overtime 100 count once', () => {
    const input = localInput({ [base]: 200 });
    input.fondi.dipendente = { st_art79c1_art67c1_unicoImporto2017: 500, cl_totaleParzialeRisorsePerConfrontoTetto2016: 999999 };
    input.fondi.eq = { ris_fondoPO2017: 100 };
    input.fondi.segretario = { st_art3c6_CCNL2011_retribuzionePosizione: 100 };
    input.annualData.fondoLavoroStraordinario = 100;
    const result = calculateFundCompletely(input, mockNormativeData);
    expect(result.compliance.art23c2.valoreSoggetto).toBe(1000);
    expect(result.compliance.art23Compliance?.art23Componenti).toMatchObject({ comparto: 500, eq: 100, segretario: 100, dirigenza: 200, straordinario: 100 });
    expect(result.canonicalFund.entries.some(entry => entry.id.startsWith('DIRIGENZA'))).toBe(false);
  });
  it.each([0, 1500, 8000])('remaining 500 is invariant with cache %s', cache => {
    const input = localInput({ [base]: 1500, [cacheKey]: cache }, 10000);
    input.fondi.dipendente = { st_art79c1_art67c1_unicoImporto2017: 8000 };
    expect(calculateFundCompletely(input, mockNormativeData).compliance.art23c2.delta).toBe(500);
  });
  it('excluded addition changes excluded amount without changing subject', () => {
    const result = calculateFundCompletely(localInput({ [base]: 500, st_art56c1_CCNL2020_incremento1_53MonteSalari2015: 100 }), mockNormativeData);
    expect(result.compliance.art23c2.valoreSoggetto).toBe(500);
    expect(result.compliance.art23Compliance?.risorseEscluseArt23).toBe(100);
  });
  it('FAD entries and economics survive unresolved Dirigenza unchanged', () => {
    const goodInput = localInput({ [base]: 0 });
    goodInput.fondi.dipendente = { st_art79c1_art67c1_unicoImporto2017: 500 };
    const good = calculateFundCompletely(goodInput, mockNormativeData);
    const unresolved = calculateFundCompletely({ ...goodInput, fondi: { ...goodInput.fondi, dirigenza: { [cacheKey]: 5000 } } }, mockNormativeData);
    expect(unresolved.canonicalFund.entries).toEqual(good.canonicalFund.entries);
    expect(unresolved.canonicalFund.verifiedTotal).toBe(good.canonicalFund.verifiedTotal);
    expect(unresolved.canonicalFund.verifiedArt23Subject).toBe(good.canonicalFund.verifiedArt23Subject);
    expect(unresolved.canonicalFund.status).toBe('UNDETERMINED');
  });
  it('CLOSED read-only derivation preserves the snapshot byte representation', () => {
    const data = frozen();
    data.metadata = { ...data.metadata, snapshotStatus: AnnualSnapshotStatus.CLOSED };
    data.fondoDirigenzaData![cacheKey] = 999999;
    const before = JSON.stringify(data);
    const result = calculateFundCompletely(normalizeInput(data), normative);
    expect(result.compliance.art23c2.valoreSoggetto).toBe(1610000);
    expect(JSON.stringify(data)).toBe(before);
  });
  it('OPEN save/load transports atoms and legacy cache without economic drift; CLOSED load writes nothing', async () => {
    let saved = frozen();
    saved.metadata = { snapshotStatus: AnnualSnapshotStatus.OPEN };
    let version = FIXTURE_VERSION;
    const deps = {
      stateRepository: {
        getState: vi.fn(async () => ({ data: fixtureRow(saved, user, entity, 2024, { b1i4_version: version }) })),
        upsertState: vi.fn(async (record: { fund_data: FundData }) => { const result = confirmedFixtureWrite(record); saved = result.data.fund_data; version = result.data.b1i4_version; return result; }),
      }, entityRepository: { update: vi.fn(async () => ({ error: null })) },
    };
    const user = { id: 'owner', role: UserRole.ADMIN, email: 'local@example.invalid' };
    const entity = { id: 'entity', user_id: 'owner', name: saved.annualData.denominazioneEnte };
    const data = frozen();
    data.metadata = { snapshotStatus: AnnualSnapshotStatus.OPEN };
    data.fondoDirigenzaData![cacheKey] = 2000;
    const save = await saveAnnualSnapshot(deps as never, user, entity, 2024, UserRole.ADMIN, data, fixtureBaseline(user, entity, 2024, saved, { b1i4_version: version }));
    expect(save.success).toBe(true);
    const loaded = await loadAnnualSnapshot(deps as never, user, entity.id, 2024);
    expect(loaded.success).toBe(true);
    const result = calculateFundCompletely(normalizeInput(loaded.snapshot!.fundData as FundData), normative);
    expect(result.compliance.art23c2).toMatchObject({ limite: 1680000, valoreSoggetto: 1610000, delta: 70000, isCompliant: false, status: 'UNDETERMINED' });
    expect(saved.fondoDirigenzaData![cacheKey]).toBe(2000);
    saved.metadata = { ...saved.metadata, snapshotStatus: AnnualSnapshotStatus.CLOSED };
    deps.stateRepository.upsertState.mockClear();
    await loadAnnualSnapshot(deps as never, user, entity.id, 2024);
    expect(deps.stateRepository.upsertState).not.toHaveBeenCalled();
    expect((await saveAnnualSnapshot(deps as never, user, entity, 2024, UserRole.ADMIN, data, fixtureBaseline(user, entity, 2024, saved, { b1i4_version: version }))).reason).toBe('STATE_CLOSED');
    expect(deps.stateRepository.upsertState).not.toHaveBeenCalled();
  });
});
