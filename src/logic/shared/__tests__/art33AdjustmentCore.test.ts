import { describe, it, expect } from 'vitest';
import { calculateArt33AdjustmentCore } from '../art33AdjustmentCore';

describe('art33AdjustmentCore — Nucleo puro di calcolo adeguamento Art. 33 D.L. 34/2019', () => {

  it('calcola correttamente incremento con variazione personale positiva (+2 FTE)', () => {
    const res = calculateArt33AdjustmentCore({
      baseAccessoria2018: 100000,
      fte2018: 10,
      fteAnnoCorrente: 12
    });

    expect(res.valoreMedioProCapite2018).toBe(10000);
    expect(res.differenzialeFte).toBe(2);
    expect(res.adeguamento).toBe(20000);
  });

  it('calcola differenziale e adeguamento nulli quando FTE corrente è uguale a FTE 2018 (Delta = 0)', () => {
    const res = calculateArt33AdjustmentCore({
      baseAccessoria2018: 100000,
      fte2018: 10,
      fteAnnoCorrente: 10
    });

    expect(res.valoreMedioProCapite2018).toBe(10000);
    expect(res.differenzialeFte).toBe(0);
    expect(res.adeguamento).toBe(0);
  });

  it('espone differenziale negativo senza decrementare il limite (adeguamento pari a 0)', () => {
    const res = calculateArt33AdjustmentCore({
      baseAccessoria2018: 100000,
      fte2018: 10,
      fteAnnoCorrente: 8
    });

    expect(res.valoreMedioProCapite2018).toBe(10000);
    expect(res.differenzialeFte).toBe(-2);
    expect(res.adeguamento).toBe(0);
  });

  it('gestisce correttamente FTE frazionari (+0.5 FTE)', () => {
    const res = calculateArt33AdjustmentCore({
      baseAccessoria2018: 50000,
      fte2018: 1,
      fteAnnoCorrente: 1.5
    });

    expect(res.valoreMedioProCapite2018).toBe(50000);
    expect(res.differenzialeFte).toBe(0.5);
    expect(res.adeguamento).toBe(25000);
  });

  it('gestisce frazione periodica (1/3) in modo coerente e deterministico', () => {
    const res = calculateArt33AdjustmentCore({
      baseAccessoria2018: 100000,
      fte2018: 3,
      fteAnnoCorrente: 4
    });

    expect(res.valoreMedioProCapite2018).toBeCloseTo(33333.333333, 5);
    expect(res.differenzialeFte).toBe(1);
    expect(res.adeguamento).toBeCloseTo(33333.333333, 5);
  });

  it('restituisce 0 e differenziale senza generare Infinity o NaN quando FTE 2018 è 0', () => {
    const res = calculateArt33AdjustmentCore({
      baseAccessoria2018: 100000,
      fte2018: 0,
      fteAnnoCorrente: 10
    });

    expect(res.valoreMedioProCapite2018).toBe(0);
    expect(res.differenzialeFte).toBe(10);
    expect(res.adeguamento).toBe(0);
    expect(Number.isFinite(res.valoreMedioProCapite2018)).toBe(true);
    expect(Number.isFinite(res.adeguamento)).toBe(true);
  });

  it('restituisce 0 quando base accessoria 2018 è pari a zero o negativa', () => {
    const resZero = calculateArt33AdjustmentCore({
      baseAccessoria2018: 0,
      fte2018: 10,
      fteAnnoCorrente: 12
    });
    expect(resZero.valoreMedioProCapite2018).toBe(0);
    expect(resZero.differenzialeFte).toBe(2);
    expect(resZero.adeguamento).toBe(0);

    const resNeg = calculateArt33AdjustmentCore({
      baseAccessoria2018: -5000,
      fte2018: 10,
      fteAnnoCorrente: 12
    });
    expect(resNeg.valoreMedioProCapite2018).toBe(0);
    expect(resNeg.adeguamento).toBe(0);
  });
});
