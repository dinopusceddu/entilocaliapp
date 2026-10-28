import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { projectProvenance, RSU_AUDIT_ITEMS } from '../provenance';
import { deriveCanonicalFundResult } from '../../logic/calculation/canonicalFundLedger';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { normalizeInput } from '../../application/input/inputNormalizer';
import { createEmptyFundData } from '../emptyFund';
import { createReportViewModel } from '../../presenters/reportPresenter';
import type { CalculationResult, FundLedgerEntry } from '../index';
import { resolvedZeroState } from '../../test/fixtures/ccnlRecovery';
import normativa from '../../../public/normativa.json';
import { UserRole } from '../enums';
import { resolveDocumentKindReadiness } from '../documentKindReadiness';
import { resolveChecklist } from '../../logic/cabina/resolveChecklist';

const entry = (patch: Partial<FundLedgerEntry> = {}): FundLedgerEntry => ({ id: 'CCNL_014_CURRENT', amount: 1400,
  source: 'CALCULATED', component: 'STABLE', operation: 'ADDITION', competenceYear: 2026,
  status: 'VALID', art23Treatment: 'EXCLUDED', normativeRef: 'Art. 58 c. 1 CCNL 23.02.2026', ...patch });
const result = (entries = [entry()]): CalculationResult => ({ canonicalFund: deriveCanonicalFundResult(entries),
  metadata: { annoRiferimento: 2026, timestamp: '2026-10-07' },
  compliance: { checks: [], art23c2: { limite: 100000, valoreSoggetto: 0, delta: -100000, isCompliant: true },
    art23Compliance: { margine: 100000 } },
} as unknown as CalculationResult);

describe('provenance read model and original RSU coverage', () => {
  it('maps all original 15 numbered audit items with actual sources and support states', () => {
    const audit = readFileSync('ASTRA_RSU_AUDIT_REPORT.md', 'utf8').split('## Quindici risposte RSU basate soltanto sul browser')[1].split('## Copertura')[0];
    const originals = [...audit.matchAll(/^(\d+)\. (.+)$/gm)];
    const model = projectProvenance(result());
    expect(originals.map(m => +m[1])).toEqual(model.questions.map(q => q.number));
    expect(RSU_AUDIT_ITEMS).toHaveLength(15);
    for (const q of model.questions) {
      expect(q.references.length).toBeGreaterThan(0); expect(q.details.length).toBeGreaterThan(0); expect(q.auditReference).toContain(`voce ${q.number}`);
      expect(q.explanation.length).toBeGreaterThan(20); expect(q.support.length).toBeGreaterThan(0);
    }
  });
  it.each(['MANUAL', 'CALCULATED', 'TRANSFERRED', 'RECOVERY', 'LEGACY_MIGRATED'] as const)('preserves canonical source %s without reclassification', source => {
    const e = entry({ source }); const row = projectProvenance(result([e])).rows[0];
    expect(row).toMatchObject({ amount: e.amount, status: e.status, source, competenceYear: e.competenceYear });
    if (source === 'MANUAL') expect(row.mode).toBe('MANUAL');
    if (source === 'CALCULATED') expect(row.mode).toBe('CALCULATED');
    if (source === 'RECOVERY') expect(row.description).toContain('da qualificare');
  });
  it.each(['VALID', 'MISSING', 'UNDETERMINED', 'INVALID'] as const)('preserves zero versus determination %s', status => {
    const row = projectProvenance(result([entry({ status, amount: status === 'VALID' ? 0 : null })])).rows[0];
    expect(row.status).toBe(status); expect(row.amount).toBe(status === 'VALID' ? 0 : null);
    if (status !== 'VALID') expect(projectProvenance(result([entry({ status, amount: 100 })])).questions[0].value).toBeNull();
  });
  it('empty result is missing, never a certified zero or compliant statement', () => {
    const model = projectProvenance(undefined, createEmptyFundData(2026));
    expect(model.status).toBe('MISSING'); expect(model.year).toBeNull();
    expect(model.questions.every(q => q.value === null && q.status === 'MISSING')).toBe(true);
  });
  it('excluded retains amount, normative reference and competence independently of zero', () => {
    const model = projectProvenance(result());
    expect(model.rows[0]).toMatchObject({ amount: 1400, inclusion: 'EXCLUDED', competenceYear: 2026, normativeReference: 'Art. 58 c. 1 CCNL 23.02.2026' });
  });
  it.each(['PNRR_APPLIED', 'DL25_CURRENT', 'CCNL_022_CURRENT'])('marks %s facultative without using its theoretical maximum', id => {
    const model = projectProvenance(result([entry({ id, amount: 0, provenance: { maximum: 90000 } })]));
    expect(model.rows[0]).toMatchObject({ mode: 'FACULTATIVE', amount: 0 });
  });
  it('document references are explicit; numbers alone do not attest certification', () => {
    const data = createEmptyFundData(2026); const missing = projectProvenance(result(), data);
    expect(missing.support[0].status).toBe('MISSING'); expect(missing.support[3].status).toBe('UNDETERMINED');
    data.annualData.documentMetadata = { numeroDetermina: '12', dataDetermina: '2026-10-07',
      numVerbaleRevisori: '7', dataVerbaleRevisori: '2026-10-06', opinionOutcome: 'FAVORABLE', transmissionStatus: 'DOCUMENTED_SENT' };
    const available = projectProvenance(result(), data);
    expect(available.support[0].status).toBe('AVAILABLE'); expect(available.support[1].status).toBe('AVAILABLE');
    expect(available.support[0].reference).toContain('contenuto non verificato');
    expect(available.rows[0].documentation[0].status).toBe('UNDETERMINED');
  });
  it('CCNL recovery support and both years survive; figurative movement requires no separate amount support', () => {
    const i = { kind: 'CCNL_014', competenceYear: 2024, source: 'Atto CCDI 2024' };
    const model = projectProvenance(result([entry({ id: 'CCNL_014_RECOVERY_2024', source: 'RECOVERY', competenceYear: 2024, originYear: 2024,
      provenance: { instruction: i, recognitionYear: 2026, status: 'VALID', route: 'FUND_VARIABLE_RESIDUAL' } }),
      entry({ id: 'FIGURATIVE', economicEffect: false })]));
    expect(model.rows[0]).toMatchObject({ competenceYear: 2024, originYear: 2024, recognitionYear: 2026 });
    expect(model.rows[0].documentation[0].status).toBe('AVAILABLE');
    expect(model.rows[1].documentation[0].status).toBe('NOT_REQUIRED');
  });
  it('stale annualita022/year/capacity are descriptive only, never amount or permissions', () => {
    const data = createEmptyFundData(2026); data.wizard2026TransferSnapshot = { year: 1900, computed: { annualita022Considerate: 99, capienza: 999999 } };
    const r = result(); const before = JSON.stringify(r);
    const model = projectProvenance(r, data, { entity: { user_id: 'owner' }, currentUser: { id: 'owner', role: UserRole.GUEST }, persistedRole: UserRole.ADMIN });
    expect(model.metadata).toMatchObject({ annualita022Considerate: 1, art23Margin: 100000 });
    expect(model.metadata.stale).toHaveLength(3); expect(model.year).toBe(2026);
    expect(model.questions[0].value).toBe(1400); expect(model.identity).toMatchObject({ ownerId: 'owner', currentRole: UserRole.GUEST, actor: null });
    expect(JSON.stringify(r)).toBe(before);
  });
  it('domain input -> real engine -> canonical -> explanation -> report presenter stays identical and read-only', () => {
    const data = createEmptyFundData(2026, 'Comune'); data.annualData.ccnl2024 = { monteSalari2021: 1000000 };
    data.annualData.ccnlRecovery = resolvedZeroState(); data.annualData.pnrrExerciseDecision = 'NOT_EXERCISED';
    data.annualData.art33ManualDecision = 'DO_NOT_APPLY'; data.historicalData.manualPersonalFundLimit2016 = 100000;
    data.fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto = 0;
    const computed = calculateFundCompletely(normalizeInput(data), normativa), before = JSON.stringify(data);
    const vm = createReportViewModel(computed, 'Comune', { fundData: data });
    const e = computed.canonicalFund.entries.find(e => e.id === 'CCNL_014_CURRENT')!;
    const row = vm.provenance.rows.find(e => e.entryId === 'CCNL_014_CURRENT');
    expect(row).toMatchObject({ amount: e.amount, status: e.status, source: e.source, competenceYear: e.competenceYear });
    expect(row?.input[0]).toMatchObject({ path: 'annualData.ccnl2024.monteSalari2021', value: 1000000 });
    expect(vm.provenance.questions[3].details[0].value).toEqual(computed.compliance.art23Compliance?.art23Componenti);
    expect(vm.provenance).toEqual(projectProvenance(computed, data)); expect(JSON.stringify(data)).toBe(before);
  });
});


describe('stale source metadata and optional document DTO', () => {
  it('absent check list stays undetermined without crashing a document presenter', () => {
    const base = result(); const { checks: _checks, ...withoutChecks } = base.compliance;
    const r = { ...base, compliance: withoutChecks } as unknown as CalculationResult;
    expect(() => projectProvenance(r)).not.toThrow();
    expect(projectProvenance(r).questions[6].status).toBe('UNDETERMINED');
  });
  it('poisoned stored year, capacity and considered years cannot change engine or readiness', () => {
    const data = createEmptyFundData(2026, 'Comune');
    data.annualData.art33ManualDecision = 'DO_NOT_APPLY';
    data.annualData.ccnl2024 = { monteSalari2021: 1000000 };
    data.annualData.ccnlRecovery = resolvedZeroState(); data.annualData.pnrrExerciseDecision = 'NOT_EXERCISED';
    data.historicalData.manualPersonalFundLimit2016 = 100000;
    data.fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto = 0;
    const clean = calculateFundCompletely(normalizeInput(data), normativa);
    const poisoned = structuredClone(data);
    poisoned.wizard2026TransferSnapshot = { year: 1900, computed: { capienza: 999999999, annualita022Considerate: 99 } };
    const dirty = calculateFundCompletely(normalizeInput(poisoned), normativa);
    expect(dirty.canonicalFund).toEqual(clean.canonicalFund);
    expect(dirty.compliance).toEqual(clean.compliance);
    const readiness = (r: CalculationResult) => resolveDocumentKindReadiness({ documentKind: 'DETERMINA', canonicalFund: r.canonicalFund,
      issues: resolveChecklist({ canonicalFund: r.canonicalFund, complianceChecks: r.compliance.checks }) });
    expect(readiness(dirty)).toEqual(readiness(clean));
    const model = projectProvenance(dirty, poisoned);
    expect(model.year).toBe(2026); expect(model.metadata.annualita022Considerate).not.toBe(99);
    expect(model.metadata.art23Margin).not.toBe(999999999); expect(model.metadata.stale).toHaveLength(3);
  });
});

describe('active authority census', () => {
  it('explanation path imports only canonical/read projections, never an economic engine', () => {
    const source = readFileSync('src/domain/provenance.ts', 'utf8');
    expect(source).not.toMatch(/import.*(?:fundEngine|fundCalculations|financialMath|canonicalFundLedgerBuild)/);
    expect(source).not.toContain('resolveCcnlRecoveries(');
    expect(source).toContain('projectFadReport(canonical)');
    expect(source).toContain('entry.amount');
  });
  it('runtime snapshot load never supplies snapshot role; metadata cannot replace current profile', () => {
    const context = readFileSync('src/contexts/AppContext.tsx', 'utf8');
    expect(context).not.toMatch(/(?:newSnapshot|snapshot|snap)\.role/);
    expect(context).toContain('currentUser: state.currentUser');
    const policy = readFileSync('src/application/policies/authorizationPolicy.ts', 'utf8');
    expect(policy).toContain('return currentGlobalRole;');
    expect(policy).not.toContain('return loadedRole;');
  });
});
