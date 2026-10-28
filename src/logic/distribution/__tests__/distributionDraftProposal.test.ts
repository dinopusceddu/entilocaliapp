import { describe, expect, it } from 'vitest';
import FinancialMath from '../../../utils/financialMath';
import { resolveDistributionDraftProposal, resolveDistributionPersonnel } from '../resolveDistributionDraftProposal';
import { resolveCabinaViewModel } from '../../cabina/resolveCabinaViewModel';
import { deriveCanonicalFundResult } from '../../calculation/canonicalFundLedger';
import type { DistribuzioneRisorseData } from '../../../domain';

const input = () => ({
  basis: { mode: 'AUTHORITATIVE' as const, amount: 10000 },
  stableAllocated: 1000, otherVariableAllocated: 500, individualPercentage: 50,
});

describe('Distribution explicit proposal: existing formulas without mutation', () => {
  it('D1 AUTHORITATIVE proposes the original 50/50 residual', () => {
    expect(resolveDistributionDraftProposal(input())).toEqual({
      status: 'AVAILABLE', mode: 'AUTHORITATIVE', availableForPerformance: 8500,
      individuale: 4250, organizzativa: 4250, maggiorazione: null,
    });
  });
  it('D2 VERIFIED_DRAFT retains qualification and does not invent authority', () => {
    const basis = Object.freeze({ mode: 'VERIFIED_DRAFT' as const, amount: 3400 });
    expect(resolveDistributionDraftProposal({ ...input(), basis })).toMatchObject({
      status: 'AVAILABLE', mode: 'VERIFIED_DRAFT',
      individuale: 950, organizzativa: 950,
    });
    expect(basis).toEqual({ mode: 'VERIFIED_DRAFT', amount: 3400 });
  });
  it('D3 UNAVAILABLE has no suggested numbers, including no fabricated zero', () => {
    expect(resolveDistributionDraftProposal({ ...input(), basis: { mode: 'UNAVAILABLE', amount: null } }))
      .toEqual({ status: 'UNAVAILABLE', mode: 'UNAVAILABLE', reason: 'MISSING_BUDGET' });
  });
  it('explicit canonical zero remains a known zero proposal', () => {
    expect(resolveDistributionDraftProposal({ ...input(), basis: { mode: 'AUTHORITATIVE', amount: 0 } }))
      .toMatchObject({ status: 'AVAILABLE', individuale: 0, organizzativa: 0 });
  });
  it('preserves percentage, monetary rounding and organizational difference', () => {
    const data = { ...input(), basis: { mode: 'AUTHORITATIVE' as const, amount: 10000.01 },
      individualPercentage: 33, allocatedMaggiorazione: 127.44 };
    const available = Math.max(0, FinancialMath.subtractExact(data.basis.amount, data.stableAllocated) - data.otherVariableAllocated);
    const effective = Math.max(0, FinancialMath.subtractExact(available, 127.44));
    const individual = FinancialMath.roundTo2DP(effective * 0.33);
    expect(resolveDistributionDraftProposal(data)).toMatchObject({
      individuale: individual, organizzativa: FinancialMath.subtractExact(effective, individual),
    });
  });
  it('proposes bonus and split together, equivalent to the previous settled effects', () => {
    // 10 staff, 50% individual, 20% bonus, ceil(10 * 5%) = 1 recipient.
    const bonusPerEmployee = ((9000 * 0.5) / 10) * 0.2;
    const bonus = Math.round((bonusPerEmployee * 1 + Number.EPSILON) * 100) / 100;
    const result = resolveDistributionDraftProposal({
      ...input(), allocatedMaggiorazione: 777, maggiorazioneProCapite: bonusPerEmployee, numDipendentiBonus: 1,
    });
    const effective = FinancialMath.subtractExact(8500, bonus);
    expect(result).toMatchObject({
      maggiorazione: 90, individuale: 4205, organizzativa: 4205,
    });
    if (result.status !== 'AVAILABLE') throw Error('Expected proposal');
    expect(FinancialMath.addExact(result.individuale, result.organizzativa)).toBe(effective);
  });
  it('missing personnel preserves an allocated bonus in the suggested residual', () => {
    expect(resolveDistributionDraftProposal({ ...input(), allocatedMaggiorazione: 100 }))
      .toMatchObject({ individuale: 4200, organizzativa: 4200, maggiorazione: null });
  });
  it('D6 a basis change updates suggestions, never its frozen inputs', () => {
    const data = Object.freeze(input());
    const snapshot = structuredClone(data);
    expect(resolveDistributionDraftProposal(data)).toMatchObject({ individuale: 4250 });
    expect(resolveDistributionDraftProposal({ ...data, basis: { mode: 'AUTHORITATIVE', amount: 12000 } }))
      .toMatchObject({ individuale: 5250 });
    expect(data).toEqual(snapshot);
  });
  it('invalid numerical inputs produce no numeric proposal', () => {
    expect(resolveDistributionDraftProposal({ ...input(), individualPercentage: NaN }))
      .toMatchObject({ status: 'UNAVAILABLE', reason: 'INVALID_INPUT' });
  });
  it('D8 unapplied proposal is not distribution work and cannot override a Cabina blocker', () => {
    const data = Object.freeze({ criteri_percPerfIndividuale: 50 }) as DistribuzioneRisorseData;
    resolveDistributionDraftProposal(input());
    const canonicalFund = deriveCanonicalFundResult([{
      id: 'BASE', amount: 10000, status: 'VALID', component: 'STABLE', operation: 'ADDITION',
      competenceYear: 2026, source: 'MANUAL', art23Treatment: 'EXCLUDED',
    }]);
    const vm = resolveCabinaViewModel({
      calculationResult: { canonicalFund }, distribuzioneRisorseData: data,
      complianceChecks: [{ id: 'BLOCK', descrizione: 'Verifica', isCompliant: false,
        messaggio: 'Correggere', riferimentoNormativo: 'Test', gravita: 'error' }],
    });
    expect(vm.distribution).toEqual({ status: 'NOT_STARTED', hasExistingWork: false });
    expect(vm.status).toBe('BLOCKED');
    expect(vm.primaryAction).toEqual({ label: 'Apri le verifiche', target: 'compliance' });
  });
});

describe('Distribution personnel presence, without shared normalization', () => {
  it.each([undefined, null])('P1/P4 %s with empty default details is MISSING, not zero or <=5', count => {
    expect(resolveDistributionPersonnel(count, [])).toEqual({
      status: 'MISSING', count: null, source: null, art48Applicable: null,
    });
  });
  it('P2 explicit zero wins even over populated fallback details', () => {
    expect(resolveDistributionPersonnel(0, [{}, {}])).toEqual({
      status: 'KNOWN_ZERO', count: 0, source: 'CCNL_SETTINGS', art48Applicable: false,
    });
  });
  it.each([1, 5, 6, 10, 11])('P3 known positive %s keeps the existing >5 threshold', count => {
    expect(resolveDistributionPersonnel(count, [])).toEqual({
      status: 'KNOWN_POSITIVE', count, source: 'CCNL_SETTINGS', art48Applicable: count > 5,
    });
  });
  it('preserves the existing nonempty employee-details fallback', () => {
    expect(resolveDistributionPersonnel(undefined, Array.from({ length: 6 }, () => ({}))))
      .toEqual({ status: 'KNOWN_POSITIVE', count: 6, source: 'EMPLOYEE_DETAILS', art48Applicable: true });
  });
  it('P5 resolving a later explicit count is pure and replaces missing semantics', () => {
    const employees = Object.freeze([]);
    expect(resolveDistributionPersonnel(null, employees).count).toBeNull();
    expect(resolveDistributionPersonnel(10, employees)).toMatchObject({
      status: 'KNOWN_POSITIVE', count: 10, art48Applicable: true,
    });
    expect(employees).toEqual([]);
  });
  it.each([NaN, Infinity, -1])('invalid staff count %s is not a valid numerical band', count => {
    expect(resolveDistributionPersonnel(count, [{}]).status).toBe('MISSING');
  });
});
