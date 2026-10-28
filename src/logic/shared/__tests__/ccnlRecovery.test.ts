import { describe, expect, it } from 'vitest';
import type { CcnlRecoveryInstruction } from '../../../domain/ccnlRecovery';
import { considered022Years, resolveCcnlRecoveries, resolveCcnlRecoveryInstruction } from '../ccnlRecovery';
import { parseMonetaryValue, defaultMonetaryPolicy, validateMonetaryData } from '../../../domain/monetaryBoundary';
import { CcnlRecoveryInstructionSchema } from '../../../schemas/fundDataSchemas';

import { recovery014, recovery022, resolvedZeroState } from '../../../test/fixtures/ccnlRecovery';

const resolve = (i: CcnlRecoveryInstruction) => resolveCcnlRecoveryInstruction(i, 2026, 1000000, resolvedZeroState());

describe('NORM-02 qualified recovery instructions', () => {
  it('candidates are missing decisions, never automatic 2800/2200; no universal post-2026 window', () => {
    const r = resolveCcnlRecoveries(undefined, 2026, 1000000);
    expect(r).toHaveLength(3); expect(r.every(i => i.status === 'UNDETERMINED' && i.recoveryAmount === null)).toBe(true);
    expect(resolveCcnlRecoveries(undefined, 2027, 1000000)).toEqual([]);
    expect(resolveCcnlRecoveries(undefined, 2025, 1000000)).toEqual([]);
    expect(resolveCcnlRecoveries(undefined, 2026, 0)).toEqual([]);
  });
  it.each(['originAdministrativeStatus', 'automaticResidualPerformanceClause'] as const)('%s UNKNOWN is never zero', field => {
    expect(resolve(recovery014({ [field]: 'UNKNOWN' }))).toMatchObject({ status: 'UNDETERMINED', recoveryAmount: null });
  });
  it.each(['PRESENT', 'ABSENT'] as const)('clause %s chooses exactly one route', clause => {
    expect(resolve(recovery014({ automaticResidualPerformanceClause: clause }))).toMatchObject({ status: 'VALID',
      route: clause === 'PRESENT' ? 'PERFORMANCE_ARREARS' : 'FUND_VARIABLE_RESIDUAL', recoveryAmount: 1400, remainingResidual: 0 });
  });
  it('full, partial, already recognized and remaining residual are distinct', () => {
    expect(resolve(recovery014({ instructionStatus: 'RECOVER_PARTIAL', alreadyRecognizedAmount: 200, requestedRecoveryAmount: 1000 })))
      .toMatchObject({ status: 'VALID', recoverableResidual: 1200, recoveryAmount: 1000, remainingResidual: 200 });
    expect(resolve(recovery014({ alreadyRecognizedAmount: 400, requestedRecoveryAmount: 1000 })))
      .toMatchObject({ status: 'VALID', recoverableResidual: 1000, remainingResidual: 0 });
    expect(resolve(recovery014({ alreadyRecognizedAmount: 1400, requestedRecoveryAmount: 0 }))).toMatchObject({ status: 'VALID', decision: 'RESOLVED_ZERO', recoverableResidual: 0 });
  });
  it.each([{ alreadyRecognizedAmount: 1401 }, { alreadyRecognizedAmount: 400, requestedRecoveryAmount: 1001 },
    { instructionStatus: 'NOT_TO_RECOVER' as const }, { requestedRecoveryAmount: 1000 }])('incoherent/over recovery %j fails closed', patch => {
    expect(resolve(recovery014(patch))).toMatchObject({ status: 'INVALID', recoveryAmount: null });
  });
  it('zero needs source, decision and material facts; non-applicable origin is explicit', () => {
    expect(resolve(recovery014({ instructionStatus: 'NOT_TO_RECOVER', requestedRecoveryAmount: 0 }))).toMatchObject({ status: 'VALID', decision: 'RESOLVED_ZERO' });
    expect(resolve(recovery014({ requestedRecoveryAmount: 0, source: undefined }))).toMatchObject({ status: 'UNDETERMINED' });
    expect(resolve(recovery014({ originAdministrativeStatus: 'NOT_CLOSED_AND_DEFINED', instructionStatus: 'NOT_TO_RECOVER', requestedRecoveryAmount: 0 })))
      .toMatchObject({ status: 'VALID', decision: 'NOT_APPLICABLE', route: 'NOT_APPLICABLE' });
    expect(resolve(recovery014({ originAdministrativeStatus: 'NOT_CLOSED_AND_DEFINED' })).status).toBe('INVALID');
    expect(resolve(recovery014({ originAdministrativeStatus: 'NOT_CLOSED_AND_DEFINED', instructionStatus: 'NOT_TO_RECOVER', requestedRecoveryAmount: 0, alreadyRecognizedAmount: 2000 })).status).toBe('INVALID');
  });
  it('0.22 activation is a decision distinct from maximum, current and prior-year fund/EQ recognition', () => {
    expect(resolve(recovery022())).toMatchObject({ status: 'VALID', theoreticalMaximum: 2200, authorizedFundAmount: 800,
      authorizedEqAmount: 200, recoveryAmount: 800, recoveryEqAmount: 200 });
    expect(resolve(recovery022({ activatedAmount2025: undefined })).status).toBe('UNDETERMINED');
    expect(resolve(recovery022({ activationDecisionAttested: undefined })).status).toBe('UNDETERMINED');
    expect(resolve(recovery022({ activatedAmount2025: 2201 })).status).toBe('INVALID');
    expect(resolve(recovery022({ instructionStatus: 'NOT_TO_RECOVER', activatedAmount2025: 0, requestedRecoveryAmount: 0, requestedEqRecoveryAmount: 0 })))
      .toMatchObject({ status: 'VALID', decision: 'RESOLVED_ZERO', recoveryAmount: 0, recoveryEqAmount: 0 });
  });
  it('0.22 partial fund/EQ residuals and source clause do not fabricate a different allocation', () => {
    expect(resolve(recovery022({ instructionStatus: 'RECOVER_PARTIAL', alreadyRecognizedAmount: 100, requestedRecoveryAmount: 300, requestedEqRecoveryAmount: 100 })))
      .toMatchObject({ status: 'VALID', remainingResidual: 400, remainingEqResidual: 100 });
    expect(resolve(recovery022({ requestedEqRecoveryAmount: 201 })).status).toBe('INVALID');
    expect(resolve(recovery022({ alreadyRecognizedEqAmount: 201 })).status).toBe('INVALID');
    expect(resolve(recovery022({ automaticResidualPerformanceClause: 'PRESENT' })))
      .toMatchObject({ route: 'PERFORMANCE_ARREARS', recoveryEqAmount: 200 });
  });
  it('duplicates fail closed with a single invalid canonical identity', () => {
    const state = { instructions: [recovery014(), recovery014()] };
    const r = resolveCcnlRecoveries(state, 2026, 1000000);
    expect(r.filter(i => i.instruction.competenceYear === 2024)).toHaveLength(1);
    expect(r[0]).toMatchObject({ status: 'INVALID', recoveryAmount: null, issues: ['CCNL_RECOVERY_DUPLICATE_COMPETENCE_YEAR'] });
  });
  it.each([2027, 2028])('first-time 0.22 2025 in %i requires applicable rule', year => {
    expect(resolveCcnlRecoveryInstruction(recovery022({ recognitionYear: year }), year, 1000000, resolvedZeroState()))
      .toMatchObject({ status: 'UNDETERMINED', recoveryAmount: null, issues: ['CCNL_FIRST_QUALIFICATION_AFTER_2026_REQUIRES_APPLICABLE_RULE'] });
  });
  it('constituted certified carry has reference, no recomputation and no new recovery amount', () => {
    const carry = recovery014({ recognitionYear: 2027, mode: 'BOUND_RESIDUAL_CARRY', requestedRecoveryAmount: 0,
      constitutedAndCertified2026: true, qualifiedResidualReference: 'Fondo 2026 certificato: voce residuo vincolato' });
    expect(resolveCcnlRecoveryInstruction(carry, 2027)).toMatchObject({ status: 'VALID', route: 'BOUND_RESIDUAL_CARRY', recoveryAmount: 0, theoreticalMaximum: null });
    expect(resolveCcnlRecoveryInstruction({ ...carry, requestedRecoveryAmount: 1000 }, 2027).status).toBe('INVALID');
    expect(resolveCcnlRecoveryInstruction({ ...carry, constitutedAndCertified2026: undefined }, 2027).status).toBe('UNDETERMINED');
  });
  it('considered 0.22 years follow current and resolved instructions, not a constant 2', () => {
    expect(considered022Years(2026, [])).toBe(1);
    expect(considered022Years(2026, [resolve(recovery022())])).toBe(2);
    expect(considered022Years(2026, [resolve(recovery022({ activatedAmount2025: undefined }))])).toBe(1);
  });
  it.each([-1, 'malformed', NaN, Infinity, 1e308, true, [], 123.456])('new monetary input %j has no schema/registry bypass', raw => {
    const i = { ...recovery014(), requestedRecoveryAmount: raw };
    expect(CcnlRecoveryInstructionSchema.safeParse(i).success).toBe(false);
    expect(validateMonetaryData({ annualData: { ccnlRecovery: { instructions: [i] } } }).length).toBeGreaterThan(0);
    expect(validateMonetaryData({ ccnl2026: { recoveryInstructions: [i] } }, 'wizard').length).toBeGreaterThan(0);
    expect(resolve(i as CcnlRecoveryInstruction).status).toBe('INVALID');
  });
  it('blank remains missing, zero and source survive serialization, no input rounding', () => {
    expect(parseMonetaryValue('', defaultMonetaryPolicy).status).toBe('MISSING');
    const i = recovery014({ instructionStatus: 'NOT_TO_RECOVER', requestedRecoveryAmount: 0 });
    expect(CcnlRecoveryInstructionSchema.parse(JSON.parse(JSON.stringify(i)))).toEqual(i);
    expect(resolve(i).recoveryAmount).toBe(0);
  });
  it.each([null, {}, [], { kind: 'UNKNOWN', competenceYear: 2024, recognitionYear: 2026 }])('malformed instruction identity %j is invalid without a crash', raw => {
    expect(() => resolveCcnlRecoveries({ instructions: [raw] } as unknown as import('../../../domain/ccnlRecovery').CcnlRecoveryState, 2026, 1000000)).not.toThrow();
    expect(resolveCcnlRecoveries({ instructions: [raw] } as unknown as import('../../../domain/ccnlRecovery').CcnlRecoveryState, 2026, 1000000)[0].status).toBe('INVALID');
  });
});
