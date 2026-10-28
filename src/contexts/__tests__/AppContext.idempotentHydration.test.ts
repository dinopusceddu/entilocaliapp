import { describe, expect, it } from 'vitest';
import { appReducer } from '../AppContext';

const hydratedState = {
  currentUser: { id: 'u1', name: 'User', email: 'u@test.local', role: 'GUEST' },
  currentYear: 2026,
  currentEntity: { id: 'e1', name: 'Comune prima', user_id: 'u1' },
  entities: [],
  fundData: {
    annualData: { annoRiferimento: 2026 },
    historicalData: {},
    fondoAccessorioDipendenteData: {
      st_art58c1_CCNL2026_incremento014_MS2021: 1_400,
    },
  },
  calculationResult: { canonicalFund: { stableTotal: 1_272.56 } },
  complianceChecks: [],
  isLoading: false,
  isNormativeDataLoading: false,
  validationErrors: {},
  activeTab: 'home',
  navigationScope: 'FONDO',
  isYearSwitching: true,
  hydratedSnapshotKey: 'e1:2026',
} as any;

describe('AppContext bootstrap hydration is idempotent', () => {
  it('preserves the hydrated ledger when the same entity is resolved again', () => {
    const next = appReducer(hydratedState, {
      type: 'SET_CURRENT_ENTITY',
      payload: { id: 'e1', name: 'Comune aggiornato', user_id: 'u1' },
    } as any);

    expect(next.currentEntity?.name).toBe('Comune aggiornato');
    expect(next.fundData).toBe(hydratedState.fundData);
    expect(next.calculationResult).toBe(hydratedState.calculationResult);
    expect(next.hydratedSnapshotKey).toBe('e1:2026');
  });

  it('preserves the hydrated ledger when the same year is resolved again', () => {
    const next = appReducer(hydratedState, {
      type: 'SET_CURRENT_YEAR',
      payload: 2026,
    } as any);

    expect(next).toBe(hydratedState);
  });
});
