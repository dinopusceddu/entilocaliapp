import { describe, expect, it } from 'vitest';
import { resolvePnrrFaculty, PnrrFacultyInput } from '../pnrrFaculty';

const eligible: PnrrFacultyInput = {
  referenceYear: 2026, exerciseDecision: 'EXERCISED', stableCertifiedFund2016: 100000,
  requirementA: true, requirementB: true, incidenceLatestApprovedStatement: 8, requirementD: true,
  amountApplied: 3000,
};
describe('CALC-05 annual faculty, eligibility and monetary boundaries', () => {
  it('N1: administrative waiver needs neither evidence nor a maximum', () => {
    expect(resolvePnrrFaculty({ referenceYear: 2026, exerciseDecision: 'NOT_EXERCISED' }))
      .toMatchObject({ status: 'VALID', amountApplied: 0, contribution: 0, reasons: [] });
  });
  it.each([2022, 2023, 2024, 2025, 2026, 2027])('statutory year %s and Y-1', year => {
    const result = resolvePnrrFaculty({ ...eligible, referenceYear: year });
    expect(result.period).toBe(year >= 2023 && year <= 2026 ? 'APPLICABLE_PERIOD' : 'NOT_APPLICABLE');
    expect(result.previousYear).toBe(year - 1);
    if (year === 2026) expect(result.previousYear).toBe(2025);
    if (year === 2027) expect(result.contribution).toBe(0);
  });
  it.each([
    [true, true, 8, true, 'ELIGIBLE'],
    [false, true, 8, true, 'NOT_ELIGIBLE'],
    [true, false, 8, true, 'NOT_ELIGIBLE'],
    [true, true, 8.01, true, 'NOT_ELIGIBLE'],
    [true, true, 8, false, 'NOT_ELIGIBLE'],
    [undefined, true, 8, true, 'UNDETERMINED'],
    [true, undefined, 8, true, 'UNDETERMINED'],
    [true, true, undefined, true, 'UNDETERMINED'],
    [true, true, 8, undefined, 'UNDETERMINED'],
    [false, undefined, undefined, undefined, 'NOT_ELIGIBLE'],
  ] as const)('four requirements %s/%s/%s/%s -> %s', (A, B, C, D, status) => {
    const result = resolvePnrrFaculty({ ...eligible, requirementA: A, requirementB: B,
      incidenceLatestApprovedStatement: C, requirementD: D });
    expect(result.eligibility).toBe(status);
    if (status !== 'ELIGIBLE') expect(result.contribution).toBe(0);
    if (status === 'NOT_ELIGIBLE') expect(result.status).toBe('INVALID');
  });
  it.each([0, 1, 3000, 4999.99, 5000, 5000.01])('N2-N4: applied %s against max 5000', amount => {
    const result = resolvePnrrFaculty({ ...eligible, amountApplied: amount });
    expect(result.maximumAvailable).toBe(5000);
    expect(result.status).toBe(amount > 5000 ? 'INVALID' : 'VALID');
    expect(result.contribution).toBe(amount > 5000 ? 0 : amount);
  });
  it('N5/N6: certified zero is distinct from missing; zero application is valid', () => {
    const missing = resolvePnrrFaculty({ ...eligible, stableCertifiedFund2016: undefined });
    expect(missing.maximumAvailable).toBeUndefined();
    expect(missing.status).toBe('UNDETERMINED');
    expect(resolvePnrrFaculty({ ...eligible, stableCertifiedFund2016: 0, amountApplied: 100 }))
      .toMatchObject({ maximumAvailable: 0, status: 'INVALID', contribution: 0 });
    expect(resolvePnrrFaculty({ ...eligible, stableCertifiedFund2016: 0, amountApplied: 0 }))
      .toMatchObject({ maximumAvailable: 0, status: 'VALID', contribution: 0 });
  });
  it('N11/N12: use 7500, all 20000 or zero; never auto-apply maximum', () => {
    for (const amount of [0, 7500, 20000]) {
      expect(resolvePnrrFaculty({ ...eligible, stableCertifiedFund2016: 400000, amountApplied: amount }))
        .toMatchObject({ maximumAvailable: 20000, status: 'VALID', contribution: amount });
    }
    expect(resolvePnrrFaculty({ ...eligible, amountApplied: undefined }))
      .toMatchObject({ maximumAvailable: 5000, status: 'UNDETERMINED', contribution: 0 });
  });
  it('UNSET is preserved and cannot authorize a positive resource', () => {
    expect(resolvePnrrFaculty({ ...eligible, exerciseDecision: undefined }))
      .toMatchObject({ exerciseDecision: 'UNSET', status: 'UNDETERMINED', contribution: 0 });
    expect(resolvePnrrFaculty({ referenceYear: 2026 }).exerciseDecision).toBe('UNSET');
  });
  it.each([NaN, Infinity, -1])('local fail closed for invalid monetary input %s', bad => {
    for (const field of ['stableCertifiedFund2016', 'amountApplied', 'incidenceLatestApprovedStatement']) {
      const result = resolvePnrrFaculty({ ...eligible, [field]: bad });
      expect(result.status).toBe('INVALID');
      expect(result.contribution).toBe(0);
    }
  });
  it.each([[100000.10, 5000.01], [100000.09, 5000], [0.10, 0.01], [0.09, 0]])('half-up base %s gives %s', (base, maximum) => {
    expect(resolvePnrrFaculty({ ...eligible, stableCertifiedFund2016: base, amountApplied: 0 }).maximumAvailable).toBe(maximum);
  });
});
