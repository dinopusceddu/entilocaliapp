import { describe, it, expect } from 'vitest';
import { wizard2026Reducer } from '../reducer';
import { initialWizard2026DraftState } from '../initialState';

describe('Wizard 2026 Reducer', () => {
  it('1. Initial state corretto', () => {
    const state = wizard2026Reducer(undefined, { type: 'RESET_WIZARD_2026' });
    expect(state).toEqual(initialWizard2026DraftState);
    expect(state.meta.currentStep).toBe(1);
    expect(state.meta.canTransferToLegacy).toBe(false);
  });

  it('2. Update di ogni step', () => {
    let state = initialWizard2026DraftState;

    state = wizard2026Reducer(state, {
      type: 'UPDATE_ENTE_STEP',
      payload: { entityType: 'COMUNE', denominazioneEnte: 'Comune di Test' },
    });
    expect(state.ente.entityType).toBe('COMUNE');

    state = wizard2026Reducer(state, {
      type: 'UPDATE_ART23_STEP',
      payload: { fondoPersonaleDipendente2016: 100000 },
    });
    expect(state.art23.fondoPersonaleDipendente2016).toBe(100000);

    state = wizard2026Reducer(state, {
      type: 'UPDATE_DL25_STEP',
      payload: { stipendiTabellari2023NonDirigenti: 2500000 },
    });
    expect(state.dl25.stipendiTabellari2023NonDirigenti).toBe(2500000);

    state = wizard2026Reducer(state, {
      type: 'UPDATE_CCNL2026_STEP',
      payload: { monteSalari2021: 1000000 },
    });
    expect(state.ccnl2026.monteSalari2021).toBe(1000000);

    state = wizard2026Reducer(state, {
      type: 'UPDATE_CONGLOBAMENTO_ART60_STEP',
      payload: { ftePerArea: { FUNZIONARIO_EQ: 2 } },
    });
    expect(state.conglobamentoArt60.ftePerArea.FUNZIONARIO_EQ).toBe(2);

    state = wizard2026Reducer(state, {
      type: 'UPDATE_STRAORDINARIO_STEP',
      payload: { incrementoRichiesto: 5000 },
    });
    expect(state.straordinario.incrementoRichiesto).toBe(5000);

    state = wizard2026Reducer(state, {
      type: 'UPDATE_PNRR_STEP',
      payload: { incrementoApplicato: 10000 },
    });
    expect(state.pnrr.incrementoApplicato).toBe(10000);
  });

  it('3. Current step e completed steps', () => {
    let state = initialWizard2026DraftState;

    state = wizard2026Reducer(state, { type: 'SET_CURRENT_STEP', payload: 3 });
    expect(state.meta.currentStep).toBe(3);

    state = wizard2026Reducer(state, { type: 'MARK_STEP_COMPLETED', payload: 1 });
    state = wizard2026Reducer(state, { type: 'MARK_STEP_COMPLETED', payload: 2 });
    expect(state.meta.completedSteps).toEqual([1, 2]);

    // idempotent check
    state = wizard2026Reducer(state, { type: 'MARK_STEP_COMPLETED', payload: 1 });
    expect(state.meta.completedSteps).toEqual([1, 2]);
  });

  it('4. Reset ripristina lo stato iniziale', () => {
    let state = wizard2026Reducer(initialWizard2026DraftState, { type: 'SET_CURRENT_STEP', payload: 5 });
    state = wizard2026Reducer(state, { type: 'RESET_WIZARD_2026' });
    expect(state).toEqual(initialWizard2026DraftState);
  });
});
