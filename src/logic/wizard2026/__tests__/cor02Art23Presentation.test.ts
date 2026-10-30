import { describe, it, expect } from 'vitest';
import { calculateArt23Limit } from '../art23Limit';
import { presentWizardArt23 } from '../../../features/wizard2026/art23Presentation';
import type { Wizard2026Art23StepState } from '../../../features/wizard2026/types';
describe('COR-02 wizard historical availability uses the same qualification', () => {
  it.each([true, false, undefined])('partial historical reconstruction remains unavailable with current Dirigenza %s', hasDirigenza => {
    const state: Wizard2026Art23StepState = { checks: [], fondoEqPo2016: 100, fondoStraordinario2016: 20 };
    state.result = calculateArt23Limit({ ...state, hasDirigenza });
    expect(state.result.historicalStatus).toBe('UNDETERMINED');
    expect(presentWizardArt23(state, hasDirigenza)).toMatchObject({ historicalAvailable: false, base: undefined, adjustedLimit: undefined, margin: undefined });
  });
  it('complete historical evidence includes past Dirigenza independently of current absence', () => {
    const state: Wizard2026Art23StepState = { checks: [], fondoPersonaleDipendente2016: 100000, fondoEqPo2016: 0,
      fondoDirigenza2016: 40000, risorseSegretario2016: 0, fondoStraordinario2016: 0 };
    state.result = calculateArt23Limit({ ...state, hasDirigenza: false });
    expect(state.result.historicalStatus).toBe('VALID');
    expect(presentWizardArt23(state, false)).toMatchObject({ historicalAvailable: true, base: 140000 });
  });
  it('explicit certified zero remains available while a genuinely missing certificate does not', () => {
    const state: Wizard2026Art23StepState = { checks: [], limite2016CertificatoEnte: 0 };
    state.result = calculateArt23Limit(state);
    expect(presentWizardArt23(state).base).toBe(0);
    expect(presentWizardArt23({ checks: [] }).historicalAvailable).toBe(false);
  });
});
