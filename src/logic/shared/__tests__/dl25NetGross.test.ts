import { it, expect, describe } from 'vitest';
import { resolveDl25AvailableIncrement as available } from '../dl25Regime';
const base = { margin48Net: 24000, art33Gross: 100000, l296Gross: 100000, employerChargesPercent: 27.4, regime: 'HISTORICAL' as const };
describe('CALC-03 isolated unit acceptance', () => {
  it.each([
    ['C1', {}, 24000], ['C2', {art33Gross:12740}, 10000], ['C3', {l296Gross:6370}, 5000],
    ['C4', {l296Gross:6370, regime:'L296_DISAPPLIED'}, 24000], ['C5', {margin48Net:0}, 0], ['C6', {margin48Net:-100}, 0],
  ])('%s', (_, changes, expected) => expect(available({...base,...changes} as any).availableNet).toBe(expected));
  it('conversion has decimal precision until the final cent; threshold net is never divided', () => {
    expect(available({...base, art33Gross: 1}).availableNet).toBe(0.78);
    expect(available({...base, margin48Net: 0.01}).availableNet).toBe(0.01);
  });
});
