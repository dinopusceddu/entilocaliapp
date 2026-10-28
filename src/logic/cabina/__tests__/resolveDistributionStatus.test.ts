import { describe, expect, it } from 'vitest';
import { INITIAL_DISTRIBUZIONE_RISORSE_DATA } from '../../../constants';
import type { DistribuzioneRisorseData } from '../../../domain';
import { resolveDistributionStatus } from '../resolveDistributionStatus';

const data = (value: unknown): DistribuzioneRisorseData => (
  { detail: value } as unknown as DistribuzioneRisorseData
);

describe('resolveDistributionStatus — PD-1R', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['empty object', {}],
    ['initial state', INITIAL_DISTRIBUZIONE_RISORSE_DATA],
    ['positive scalar only', { u_diffProgressioniStoriche: 100 }],
    ['default criteria only', {
      criteri_isConsuntivoMode: false,
      criteri_percPerfIndividuale: 50,
      criteri_percMaggiorazionePremio: 20,
      criteri_percDipendentiBonus: 5,
      art48_applicaObiettiviEnte: true,
    }],
    ['distribution mode marker only', { isDistributionMode: true }],
  ])('%s is NOT_STARTED', (_label, value) => {
    expect(resolveDistributionStatus(value as DistribuzioneRisorseData | null | undefined))
      .toBe('NOT_STARTED');
  });

  it.each([
    ['stanziate zero', { stanziate: 0 }],
    ['risparmi zero', { risparmi: 0 }],
    ['aBilancio zero', { aBilancio: 0 }],
    ['all negative', { stanziate: -1, risparmi: -2, aBilancio: -3 }],
    ['NaN', { stanziate: Number.NaN }],
    ['positive Infinity', { risparmi: Number.POSITIVE_INFINITY }],
    ['negative Infinity', { aBilancio: Number.NEGATIVE_INFINITY }],
  ])('%s is NOT_STARTED', (_label, detail) => {
    expect(resolveDistributionStatus(data(detail))).toBe('NOT_STARTED');
  });

  it.each([
    ['stanziate', { stanziate: 100 }],
    ['risparmi', { risparmi: 100 }],
    ['aBilancio', { aBilancio: 100 }],
    ['stanziate zero and risparmi positive', { stanziate: 0, risparmi: 100 }],
    ['stanziate zero and aBilancio positive', { stanziate: 0, aBilancio: 100 }],
  ])('%s positive is IN_PROGRESS', (_label, detail) => {
    expect(resolveDistributionStatus(data(detail))).toBe('IN_PROGRESS');
  });

  it('ignores arrays even when they contain financial-looking fields', () => {
    expect(resolveDistributionStatus(data([{ stanziate: 100 }]))).toBe('NOT_STARTED');
  });
});
