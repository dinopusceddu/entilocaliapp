import { describe, it, expect } from 'vitest';
import { resolveDl25CarryForward as resolve, resolveDl25TotalCeiling, carryDl25ToNextYear, resolveAnnualDl25 } from '../dl25CarryForward';
import type { FundData } from '../../../domain/types';
const base = { referenceYear: 2026, totalCeiling: 24000, priorStockProvenance: 'Determina costituzione 2025 n.10' };
const baseline = { stipendiTabellari2023NonDirigenti: 300000, fondoStabile2025Certificato: 100000, budgetEq2025: 20000 };
describe('DL25 carry-forward approved gate', () => {
  it.each([
    ['CF1', 2025, 0, 4000, 'VALID', 4000, 20000],
    ['CF2', 2026, 4000, 15000, 'VALID', 19000, 5000],
    ['CF3', 2027, 19000, 5000, 'VALID', 24000, 0],
    ['CF4', 2027, 19000, 6000, 'INVALID', undefined, undefined],
    ['CF5', 2027, 24000, 0, 'VALID', 24000, 0],
    ['CF6', 2027, 24000, 0.01, 'INVALID', undefined, undefined],
    ['CF7', 2026, undefined, 1000, 'UNDETERMINED', undefined, undefined],
    ['CF8', 2026, 0, 1000, 'VALID', 1000, 23000],
    ['CF13', 2026, 25000, 0, 'INVALID', undefined, undefined],
  ])('%s', (_, referenceYear, priorCumulativeApplied, currentYearDelta, state, cumulative, remaining) => {
    const r = resolve({ ...base, referenceYear: referenceYear as number, priorCumulativeApplied: priorCumulativeApplied as number | undefined, currentYearDelta: currentYearDelta as number });
    expect(r.state).toBe(state); expect(r.currentCumulativeApplied).toBe(cumulative); expect(r.remainingAfterApplication).toBe(remaining);
  });
  it.each([
    ['CF9', 19000, 'CUMULATIVE_STOCK', 'VALID', 15000, 19000],
    ['CF10', 15000, 'CURRENT_YEAR_DELTA', 'VALID', 15000, 19000],
    ['CF11', 19000, 'UNKNOWN', 'UNDETERMINED', undefined, undefined],
    ['CF12', 3000, 'CUMULATIVE_STOCK', 'INVALID', undefined, undefined],
  ] as const)('%s explicit legacy qualification', (_, legacyStoredAmount, legacyQualification, state, delta, cumulative) => {
    const r = resolve({ ...base, priorCumulativeApplied: 4000, legacyStoredAmount, legacyQualification });
    expect(r.state).toBe(state); expect(r.currentYearDelta).toBe(delta); expect(r.currentCumulativeApplied).toBe(cumulative);
  });
  it('first-year legacy requires applied provenance; no sample auto-certification', () => {
    const input = { referenceYear: 2025, totalCeiling: 24000, legacyStoredAmount: 4000 };
    expect(resolve(input).state).toBe('UNDETERMINED');
    expect(resolve({ ...input, legacyAppliedProvenance: 'Determina 2025 n.10' }).currentCumulativeApplied).toBe(4000);
    expect(resolve({ ...input, legacyQualification: 'CUMULATIVE_STOCK' }).state).toBe('UNDETERMINED');
  });
  it('zero prior still requires a business source in later years', () => {
    expect(resolve({ ...base, priorCumulativeApplied: 0, currentYearDelta: 0, priorStockProvenance: '' }).issues).toContain('PRIOR_DL25_STOCK_PROVENANCE_MISSING');
  });
  it.each([-1, NaN, Infinity])('invalid prior %s', n => expect(resolve({ ...base, priorCumulativeApplied: n, currentYearDelta: 0 }).state).toBe('INVALID'));
  it('negative delta is not a historical correction', () => expect(resolve({ ...base, priorCumulativeApplied: 4000, currentYearDelta: -1 }).state).toBe('INVALID'));
  it('CF14 N+1 carries qualified stock exactly once and preserves CLOSED source bytes', () => {
    const previous = { annualData: { annoRiferimento: 2025, dl25: { ...baseline, version: 1, currentYearDelta: 4000 } }, fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 4000 }, metadata: { snapshotStatus: 'CLOSED' } } as unknown as FundData;
    const before = JSON.stringify(previous);
    const target = { annualData: { annoRiferimento: 2026 }, fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 4000 } } as FundData;
    const next = carryDl25ToNextYear(previous, target, 2026);
    expect(next.annualData.dl25?.priorCumulativeApplied).toBe(4000);
    expect(next.annualData.dl25?.currentYearDelta).toBe(0);
    expect(next.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(4000);
    expect(resolveAnnualDl25(next).remainingCapacity).toBe(20000);
    expect(JSON.stringify(previous)).toBe(before);
    expect(target.annualData.dl25).toBeUndefined();
    next.annualData.dl25!.currentYearDelta = 15000;
    expect(resolveAnnualDl25(next).currentCumulativeApplied).toBe(19000);
    next.fondoAccessorioDipendenteData.st_incrementoDL25_2025 = 19000;
    expect(carryDl25ToNextYear({ ...next, annualData: { ...next.annualData, annoRiferimento: 2026 } }, target, 2027).annualData.dl25?.priorCumulativeApplied).toBe(19000);
  });
  it('unqualified CLOSED legacy is read without rewriting or guessing next prior', () => {
    const previous = { annualData: { annoRiferimento: 2026 }, fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 19000 }, metadata: { snapshotStatus: 'CLOSED' } } as FundData;
    const target = { annualData: { annoRiferimento: 2027 }, fondoAccessorioDipendenteData: {} } as FundData;
    expect(carryDl25ToNextYear(previous, target, 2027)).toBe(target);
  });
  it('attested CLOSED first-year legacy is readable for N+1; a default/sample is never attested', () => {
    const previous = { annualData: { annoRiferimento: 2025, dl25: { ...baseline, legacyStoredAmount: 4000, legacyAppliedProvenance: 'Determina 2025 n.10' } }, fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 4000 }, metadata: { snapshotStatus: 'CLOSED' } } as FundData;
    const before = JSON.stringify(previous);
    const target = { annualData: { annoRiferimento: 2026 }, fondoAccessorioDipendenteData: {} } as FundData;
    expect(carryDl25ToNextYear(previous, target, 2026).annualData.dl25?.priorCumulativeApplied).toBe(4000);
    expect(JSON.stringify(previous)).toBe(before);
    delete previous.annualData.dl25!.legacyAppliedProvenance;
    expect(carryDl25ToNextYear(previous, target, 2026)).toBe(target);
  });
  it('fixed ceiling does not compound and a missing baseline stays missing', () => {
    expect(resolveDl25TotalCeiling(baseline)).toBe(24000);
    expect(resolveDl25TotalCeiling({ ...baseline, fondoStabile2025Certificato: undefined })).toBeUndefined();
  });
  it('decision replacement is idempotent: prior 4000, delta 10000 then 15000 =>19000', () => {
    expect(resolve({ ...base, priorCumulativeApplied: 4000, currentYearDelta: 10000 }).currentCumulativeApplied).toBe(14000);
    expect(resolve({ ...base, priorCumulativeApplied: 4000, currentYearDelta: 15000 }).currentCumulativeApplied).toBe(19000);
  });
  it('JSON roundtrip retains zero, provenance, qualification and business date', () => {
    const facts = { ...base, priorCumulativeApplied: 0, currentYearDelta: 0, legacyQualification: 'CUMULATIVE_STOCK' as const, regimeDate: '2026-08-07' };
    expect(JSON.parse(JSON.stringify(facts))).toEqual(facts);
  });
});
