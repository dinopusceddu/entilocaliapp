import { describe, expect, it } from 'vitest';
import { AnnualSnapshotStatus } from '../../../domain';
import type { CanonicalFundResult } from '../../../domain';
import type { CabinaIssue } from '../../cabina/resolveChecklist';
import { resolveClosureInstructionReadiness as resolve } from '../resolveClosureInstructionReadiness';

const valid = Object.freeze({ status: 'VALID' as const, total: 10000 });
const blocking: CabinaIssue = { severity: 'BLOCKING', message: 'Verifica', userMessage: 'Correggere il dato', target: 'fundDetails' };
const missing: CabinaIssue = { severity: 'MISSING_PREREQUISITE', message: 'Dato mancante', userMessage: 'Completare il dato', target: 'wizard2026Preview' };
const warning: CabinaIssue = { severity: 'WARNING', message: 'Avviso', userMessage: 'Avviso da valutare' };

describe('Closure instruction readiness: canonical/checklist projection without execution', () => {
  it('R1 VALID and no issue is READY without requiring distribution or document metadata', () => {
    expect(resolve({ canonicalFund: valid })).toEqual({ status: 'READY', reasons: [], primaryReason: null });
  });
  it.each(['UNDETERMINED', 'INVALID'] as const)('R2/R3 %s is NOT_READY even with a numerical total', status => {
    expect(resolve({ canonicalFund: { status, total: 3400 } })).toMatchObject({
      status: 'NOT_READY', primaryReason: { kind: 'CANONICAL', action: { target: 'fondoDipendenti' } },
    });
  });
  it.each([undefined, null])('R4 missing calculation %s never becomes ready/zero', canonicalFund => {
    expect(resolve({ canonicalFund }).status).toBe('NOT_READY');
  });
  it('VALID with null authority is not ready, explicit zero is ready', () => {
    expect(resolve({ canonicalFund: { status: 'VALID', total: null } }).status).toBe('NOT_READY');
    expect(resolve({ canonicalFund: { status: 'VALID', total: 0 } }).status).toBe('READY');
  });
  it('R5 VALID + BLOCKING routes to existing related page', () => {
    expect(resolve({ canonicalFund: valid, issues: [blocking] })).toMatchObject({
      status: 'NOT_READY', primaryReason: {
        kind: 'BLOCKING', message: 'Correggere il dato', action: { label: 'Apri le verifiche', target: 'fundDetails' },
      },
    });
  });
  it('R6 WARNING alone does not block', () => {
    expect(resolve({ canonicalFund: valid, issues: [warning] }).status).toBe('READY');
  });
  it('R7 missing prerequisite is distinct from compliance failure and preserves target', () => {
    const result = resolve({ canonicalFund: { status: 'UNDETERMINED', total: null }, issues: [missing] });
    expect(result.status).toBe('NOT_READY');
    expect(result.primaryReason?.action).toEqual({ label: 'Vai alla Costituzione', target: 'wizard2026Preview' });
    expect(result.reasons.map(reason => reason.kind)).toEqual(['CANONICAL', 'MISSING_PREREQUISITE']);
  });
  it('an explicit missing prerequisite prevents freezing even with an inconsistent VALID input', () => {
    expect(resolve({ canonicalFund: valid, issues: [missing] })).toMatchObject({
      status: 'NOT_READY', primaryReason: { kind: 'MISSING_PREREQUISITE' },
    });
  });
  it('R8 CLOSED has absolute priority, including missing calculation and blocker', () => {
    expect(resolve({ snapshotStatus: AnnualSnapshotStatus.CLOSED, issues: [blocking] }))
      .toEqual({ status: 'ALREADY_CLOSED', reasons: [], primaryReason: null });
  });
  it('uses the first normalized blocker in native order, without sorting frozen inputs', () => {
    const issues = Object.freeze([Object.freeze(warning), Object.freeze(blocking),
      Object.freeze({ ...blocking, userMessage: 'Seconda issue', target: 'compliance' })]);
    const snapshot = structuredClone(issues);
    expect(resolve({ canonicalFund: valid, issues }).primaryReason?.action.target).toBe('fundDetails');
    expect(issues).toEqual(snapshot);
    expect(valid).toEqual({ status: 'VALID', total: 10000 });
  });
  it('targetless issues use deterministic business fallbacks', () => {
    expect(resolve({ canonicalFund: valid, issues: [{ ...blocking, target: undefined }] })
      .primaryReason?.action.target).toBe('compliance');
    expect(resolve({ canonicalFund: valid, issues: [{ ...missing, target: undefined }] })
      .primaryReason?.action.target).toBe('fondoDipendenti');
  });
  it('canonical incompleteness takes priority over compliance, retaining both reasons', () => {
    const result = resolve({ canonicalFund: { status: 'UNDETERMINED', total: null }, issues: [blocking] });
    expect(result.reasons.map(reason => reason.kind)).toEqual(['CANONICAL', 'BLOCKING']);
  });
  it('legacy numbers are irrelevant to missing canonical input', () => {
    const input = { legacyTotal: 99999, canonicalFund: undefined };
    expect(resolve(input).status).toBe('NOT_READY');
  });
  it('result action objects are isolated between invocations', () => {
    const one = resolve({ canonicalFund: valid, issues: [blocking] });
    one.primaryReason!.action.target = 'changed';
    expect(resolve({ canonicalFund: valid, issues: [blocking] }).primaryReason?.action.target).toBe('fundDetails');
  });
  it('does not inspect unresolved raw entries or introduce another calculation authority', () => {
    const canonical = { ...valid, entries: [{ amount: 99999, status: 'UNDETERMINED' }] } as unknown as CanonicalFundResult;
    expect(resolve({ canonicalFund: canonical }).status).toBe('READY');
  });
});
