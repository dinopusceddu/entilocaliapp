import { describe, it, expect } from 'vitest';
import { calculateHistoricalLimit2016Core } from '../historicalLimit2016Core';

describe('historicalLimit2016Core — Nucleo puro di determinazione del limite storico 2016', () => {

  it('A. ricostruzione completa di tutte le componenti storiche 2016', () => {
    const res = calculateHistoricalLimit2016Core({
      fondoDipendenti: 100000,
      fondoEqPo: 20000,
      fondoDirigenza: 15000,
      risorseSegretario: 5000,
      fondoStraordinario: 10000,
      altreVociSoggette: 8000
    });

    expect(res.totaleRicostruito).toBe(158000);
    expect(res.limite2016Base).toBe(158000);
    expect(res.fonte).toBe('RICOSTRUITO');
    expect(res.differenzaCertificatoMenoRicostruito).toBeUndefined();
  });

  it('B. componenti mancanti o undefined equivalenti a zero', () => {
    const res = calculateHistoricalLimit2016Core({
      fondoDipendenti: 50000,
      fondoEqPo: undefined,
      fondoDirigenza: undefined,
      risorseSegretario: undefined,
      fondoStraordinario: undefined,
      altreVociSoggette: undefined
    });

    expect(res.totaleRicostruito).toBe(50000);
    expect(res.limite2016Base).toBe(50000);
    expect(res.fonte).toBe('RICOSTRUITO');
  });

  it('C. certificato positivo prevalente sulla ricostruzione', () => {
    const res = calculateHistoricalLimit2016Core({
      certificato: 150000,
      fondoDipendenti: 100000,
      fondoEqPo: 20000,
      fondoStraordinario: 15000
    });

    expect(res.totaleRicostruito).toBe(135000);
    expect(res.limite2016Base).toBe(150000);
    expect(res.fonte).toBe('CERTIFICATO');
    expect(res.differenzaCertificatoMenoRicostruito).toBe(15000);
  });

  it('D. certificato esplicito pari a 0 prevalente sulla ricostruzione', () => {
    const res = calculateHistoricalLimit2016Core({
      certificato: 0,
      fondoDipendenti: 100000
    });

    expect(res.totaleRicostruito).toBe(100000);
    expect(res.limite2016Base).toBe(0);
    expect(res.fonte).toBe('CERTIFICATO');
    expect(res.differenzaCertificatoMenoRicostruito).toBe(-100000);
  });

  it('E. certificato negativo prevalente e NON neutralizzato (nessun clamp)', () => {
    const res = calculateHistoricalLimit2016Core({
      certificato: -5000,
      fondoDipendenti: 100000
    });

    expect(res.totaleRicostruito).toBe(100000);
    expect(res.limite2016Base).toBe(-5000);
    expect(res.fonte).toBe('CERTIFICATO');
    expect(res.differenzaCertificatoMenoRicostruito).toBe(-105000);
  });

  it('F. certificato assente (undefined o null) produce fonte RICOSTRUITO', () => {
    const resUndef = calculateHistoricalLimit2016Core({
      certificato: undefined,
      fondoDipendenti: 80000
    });
    expect(resUndef.fonte).toBe('RICOSTRUITO');
    expect(resUndef.limite2016Base).toBe(80000);

    const resNull = calculateHistoricalLimit2016Core({
      certificato: null,
      fondoDipendenti: 80000
    });
    expect(resNull.fonte).toBe('RICOSTRUITO');
    expect(resNull.limite2016Base).toBe(80000);
  });

  it('G. calcola correttamente la differenza certificato meno ricostruito', () => {
    const resA = calculateHistoricalLimit2016Core({
      certificato: 100000,
      fondoDipendenti: 90000
    });
    expect(resA.differenzaCertificatoMenoRicostruito).toBe(10000);

    const resB = calculateHistoricalLimit2016Core({
      certificato: 80000,
      fondoDipendenti: 90000
    });
    expect(resB.differenzaCertificatoMenoRicostruito).toBe(-10000);
  });

  it('H. altreVociSoggette inclusa correttamente nel totale ricostruito', () => {
    const res = calculateHistoricalLimit2016Core({
      altreVociSoggette: 12000
    });

    expect(res.totaleRicostruito).toBe(12000);
    expect(res.limite2016Base).toBe(12000);
    expect(res.fonte).toBe('RICOSTRUITO');
  });

  it('I. totale ricostruito pari a 0 con payload vuoto', () => {
    const res = calculateHistoricalLimit2016Core({});

    expect(res.totaleRicostruito).toBe(0);
    expect(res.limite2016Base).toBe(0);
    expect(res.fonte).toBe('RICOSTRUITO');
    expect(res.differenzaCertificatoMenoRicostruito).toBeUndefined();
  });
});
