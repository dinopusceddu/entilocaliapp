import { it, expect, describe } from 'vitest';
import { resolveDl25Regime as regime, resolveDl25AvailableIncrement as available } from '../dl25Regime';
import { resolveArt33ApplicationPolicy } from '../art33ApplicationPolicy';
const amount = (r: ReturnType<typeof regime>, l296Gross=0) => available({ margin48Net:24000,art33Gross:100000,l296Gross, employerChargesPercent:27.4,regime:r });
describe('NORM-03 separate temporal and subject acceptance', () => {
  it.each([['N1','2026-08-07',0],['N2','2026-08-08',24000],['N3','2026-08-09',24000]])('%s', (_,date,expected) => {
    const scope = resolveArt33ApplicationPolicy({entityType:'COMUNE',referenceYear:2026}).action;
    expect(amount(regime(2026,date as string,scope)).availableNet).toBe(expected);
  });
  it('N4 non-Art33 retains historical limit', () => {
    const scope = resolveArt33ApplicationPolicy({entityType:'UNIONE_COMUNI',referenceYear:2026}).action;
    expect(regime(2026,'2026-08-09',scope)).toBe('HISTORICAL'); expect(amount(regime(2026,'2026-08-09',scope)).availableNet).toBe(0);
  });
  it('N5 2025 is historical', () => expect(amount(regime(2025,undefined,'APPLY')).availableNet).toBe(0));
  it('N6 2027 is post reform for subject entities', () => expect(amount(regime(2027,undefined,'APPLY')).availableNet).toBe(24000));
  it('N7 missing material date is undetermined', () => expect(amount(regime(2026,undefined,'APPLY')).state).toBe('UNDETERMINED'));
  it('N8 identical economic outcome preserves result and explains date indifference', () => {
    expect(amount(regime(2026,undefined,'APPLY'),100000)).toMatchObject({state:'VALID', availableNet:24000,dateIndifferent:true});
  });
  it('unknown subject scope never guesses disapplication', () => {
    const scope = resolveArt33ApplicationPolicy({entityType:'ALTRO',referenceYear:2026}).action;
    expect(amount(regime(2026,'2026-08-09',scope)).state).toBe('UNDETERMINED');
    expect(amount(regime(2026,'2026-08-09',scope),100000).state).toBe('UNDETERMINED');
  });
  it.each(['2026-02-30','2025-08-09','invalid'])('invalid or inconsistent business date %s', date => expect(regime(2026,date,'APPLY')).toBe('TEMPORAL_REGIME_UNDETERMINED'));
});
