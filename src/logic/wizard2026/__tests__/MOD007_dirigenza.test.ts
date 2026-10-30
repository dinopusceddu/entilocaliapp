import { describe, it, expect } from 'vitest';
import { calculateStraordinarioIncrement } from '../straordinarioIncrement';
import { calculateArt23Limit } from '../art23Limit';

describe('Test aggiuntivo obbligatorio MOD-007 — Gestione Dirigenza False', () => {
  it('hasDirigenza === false non produce alcuna riduzione automatica del fondo decentrato se incrementoRichiesto è 0', () => {
    const input = {
      hasDirigenza: false,
      incrementoRichiesto: 0,
      riduzioneFondoDecentrato: 0,
    };
    const res = calculateStraordinarioIncrement(input);
    expect(res.riduzioneFondoDecentratoNecessaria).toBe(0);
  });

  it('COR-02: hasDirigenza corrente false non cancella il Fondo Dirigenza storico 2016', () => {
    const input = {
      fondoPersonaleDipendente2016: 100000,
      fondoDirigenza2016: 50000,
      hasDirigenza: false,
    };
    const res = calculateArt23Limit(input);
    expect(res.limiteRicostruito2016).toBe(100000 + 50000);
    expect(res.historicalStatus).toBe('UNDETERMINED');
  });
});
