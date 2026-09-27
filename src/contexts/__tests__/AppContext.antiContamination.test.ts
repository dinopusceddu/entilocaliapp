import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AnnualSnapshotStatus,
  NavigationScope,
  UserRole,
  type AppState,
  type CalculationRequestContext,
  type CalculationResult,
  type ComplianceCheck,
  type Entity,
  type FundData,
} from '../../domain';
import {
  INITIAL_ANNUAL_DATA,
  INITIAL_DISTRIBUZIONE_RISORSE_DATA,
  INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA,
  INITIAL_FONDO_DIRIGENZA_DATA,
  INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA,
  INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA,
  INITIAL_HISTORICAL_DATA,
} from '../../constants';
import { AppProvider, appReducer, useAppContext } from '../AppContext';
import { SupabaseEntityRepository } from '../../infrastructure/persistence/SupabaseEntityRepository';
import { SupabaseStateRepository } from '../../infrastructure/persistence/SupabaseStateRepository';
import { SupabaseUserRepository } from '../../infrastructure/persistence/SupabaseUserRepository';
import normativeDataFixture from '../../../public/normativa.json';

let providerNormativeData: Record<string, unknown> | undefined;

vi.mock('../AuthContext.tsx', () => {
  const user = { id: 'u1', email: 'user@example.test' };
  return { useAuth: () => ({ user }) };
});

vi.mock('../../hooks/useNormativeData.ts', () => ({
  useNormativeData: () => ({ data: providerNormativeData }),
}));

const ENTITY_A: Entity = { id: 'A', name: 'Ente A', user_id: 'u1' };
const ENTITY_B: Entity = { id: 'B', name: 'Ente B', user_id: 'u1' };

function createFundData(
  year: number,
  snapshotStatus: AnnualSnapshotStatus = AnnualSnapshotStatus.OPEN
): FundData {
  return {
    historicalData: { ...INITIAL_HISTORICAL_DATA },
    annualData: {
      ...INITIAL_ANNUAL_DATA,
      annoRiferimento: year,
      denominazioneEnte: 'Ente test',
    },
    fondoAccessorioDipendenteData: { ...INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA },
    fondoElevateQualificazioniData: { ...INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA },
    fondoSegretarioComunaleData: { ...INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA },
    fondoDirigenzaData: { ...INITIAL_FONDO_DIRIGENZA_DATA },
    distribuzioneRisorseData: { ...INITIAL_DISTRIBUZIONE_RISORSE_DATA },
    personaleServizio: {
      dettagli: [],
      isManualMode: false,
      manualProgressioni: 0,
      manualIndennita: 0,
      manualDipendentiEquivalenti: 0,
    },
    metadata: { snapshotStatus },
  };
}

function createResult(label: string, year = 2025): CalculationResult {
  const fund = {
    label,
    summary: { totaleStabile: 100, totaleVariabile: 20, totaleFondo: 120 },
  };
  return {
    metadata: {
      annoRiferimento: year,
      denominazioneEnte: label,
      timestamp: label,
    },
    inputs: {
      hasDirigenza: false,
      isEnteInCondizioniSpeciali: false,
      fteAnnoRiferimento: 1,
    },
    fondi: {
      dipendente: fund,
      eq: fund,
      segretario: fund,
      dirigenza: fund,
    },
    canonicalFund: {
      stableTotal: 100,
      variableTotal: 20,
      total: 120,
      verifiedStableTotal: 100,
      verifiedVariableTotal: 20,
      verifiedTotal: 120,
      art23Subject: 120,
      art23Excluded: 0,
      verifiedArt23Subject: 120,
      verifiedArt23Excluded: 0,
      entries: [],
      status: 'VALID',
      warnings: [],
      missingPrerequisites: [],
    },
    compliance: {
      checks: [],
      art23c2: { limite: 200, valoreSoggetto: 120, delta: 80, isCompliant: true },
    },
    totals: { stabile: 100, variabile: 20, totaleFondo: 120 },
    alerts: [],
  };
}

function createCheck(id: string): ComplianceCheck {
  return {
    id,
    descrizione: id,
    isCompliant: true,
    messaggio: id,
    riferimentoNormativo: 'test',
    gravita: 'info',
  };
}

function createState(
  entity: Entity = ENTITY_A,
  year = 2025,
  contextEpoch = 40
): AppState {
  return {
    currentUser: { id: 'u1', name: 'User', role: UserRole.ADMIN },
    currentYear: year,
    entities: [ENTITY_A, ENTITY_B],
    currentEntity: entity,
    fundData: createFundData(year),
    calculationResult: undefined,
    complianceChecks: [],
    isLoading: false,
    isNormativeDataLoading: false,
    error: undefined,
    validationErrors: {},
    activeTab: 'home',
    navigationScope: NavigationScope.FONDO,
    calculationRuntime: { contextEpoch },
  };
}

function request(
  entityId: string,
  year: number,
  contextEpoch: number,
  requestId: number
): CalculationRequestContext {
  return { entityId, year, contextEpoch, requestId };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(resolver => {
    resolve = resolver;
  });
  return { promise, resolve };
}

describe('AppContext G10 anti-contamination contract', () => {
  it('rejects stale START and completion after A/2025 -> B/2026', () => {
    const requestA = request('A', 2025, 40, 10);
    let state = appReducer(createState(), {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext: requestA },
    });
    state = appReducer(state, { type: 'SET_CURRENT_ENTITY', payload: ENTITY_B });
    state = appReducer(state, { type: 'SET_CURRENT_YEAR', payload: 2026 });

    const switched = state;
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext: requestA },
    })).toBe(switched);
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_SUCCESS',
      payload: { requestContext: requestA, result: createResult('stale'), checks: [] },
    })).toBe(switched);
  });

  it('rejects A/2025 completion after switching to B/2025', () => {
    const requestA = request('A', 2025, 40, 10);
    let state = appReducer(createState(), {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext: requestA },
    });
    state = appReducer(state, { type: 'SET_CURRENT_ENTITY', payload: ENTITY_B });

    expect(appReducer(state, {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext: requestA },
    })).toBe(state);
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_SUCCESS',
      payload: { requestContext: requestA, result: createResult('stale'), checks: [] },
    })).toBe(state);
  });

  it('never revives an old epoch after A -> B -> A', () => {
    const requestA = request('A', 2025, 40, 10);
    let state = appReducer(createState(), { type: 'SET_CURRENT_ENTITY', payload: ENTITY_B });
    state = appReducer(state, { type: 'SET_CURRENT_ENTITY', payload: ENTITY_A });

    expect(state.calculationRuntime?.contextEpoch).toBe(42);
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext: requestA },
    })).toBe(state);
  });

  it('creates a new epoch for LOAD_STATE_FROM_DB on the same entity/year', () => {
    const state = createState();
    const loaded = appReducer(state, {
      type: 'LOAD_STATE_FROM_DB',
      payload: {
        currentEntity: ENTITY_A,
        currentYear: 2025,
        fundData: createFundData(2025),
      },
      meta: { scheduleFundCalculation: true },
    });

    expect(loaded.calculationRuntime).toEqual({
      contextEpoch: 41,
      latestRequest: undefined,
      postHydrationCalculationPending: true,
    });
  });

  it('gives consecutive LOAD_STATE_FROM_DB generations unique, non-reusable epochs', () => {
    const firstLoad = appReducer(createState(), {
      type: 'LOAD_STATE_FROM_DB',
      payload: { currentEntity: ENTITY_A, currentYear: 2025, fundData: createFundData(2025) },
      meta: { scheduleFundCalculation: true },
    });
    const firstLoadRequest = request('A', 2025, 41, 20);

    const secondLoad = appReducer(firstLoad, {
      type: 'LOAD_STATE_FROM_DB',
      payload: { currentEntity: ENTITY_A, currentYear: 2025, fundData: createFundData(2025) },
      meta: { scheduleFundCalculation: true },
    });

    expect(secondLoad.calculationRuntime?.contextEpoch).toBe(42);
    expect(appReducer(secondLoad, {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext: firstLoadRequest },
    })).toBe(secondLoad);
  });

  it('keeps only the newest overlapping request authoritative', () => {
    const request11 = request('A', 2025, 40, 11);
    const request12 = request('A', 2025, 40, 12);
    let state = appReducer(createState(), {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext: request11 },
    });
    state = appReducer(state, {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext: request12 },
    });

    const current = state;
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_SUCCESS',
      payload: { requestContext: request11, result: createResult('old'), checks: [] },
    })).toBe(current);

    state = appReducer(state, {
      type: 'CALCULATE_FUND_SUCCESS',
      payload: { requestContext: request12, result: createResult('new'), checks: [createCheck('new')] },
    });
    expect(state.calculationResult?.metadata.timestamp).toBe('new');
    expect(state.complianceChecks[0].id).toBe('new');
    expect(state.isLoading).toBe(false);
  });

  it('rejects a preallocated scheduled callback resolved after A -> B -> A', async () => {
    const gate = deferred<void>();
    const scheduledRequest = request('A', 2025, 40, 10);
    let state = createState();
    const scheduledCallback = gate.promise.then(() => {
      state = appReducer(state, {
        type: 'CALCULATE_FUND_START',
        payload: { requestContext: scheduledRequest },
      });
    });

    state = appReducer(state, { type: 'SET_CURRENT_ENTITY', payload: ENTITY_B });
    state = appReducer(state, { type: 'SET_CURRENT_ENTITY', payload: ENTITY_A });
    const returnedToA = state;

    gate.resolve();
    await scheduledCallback;
    expect(state).toBe(returnedToA);
  });

  it('stale SUCCESS cannot replace the current result or checks', () => {
    const oldRequest = request('A', 2025, 40, 11);
    const currentRequest = request('A', 2025, 40, 12);
    let state = appReducer(createState(), {
      type: 'CALCULATE_FUND_START', payload: { requestContext: oldRequest },
    });
    state = appReducer(state, {
      type: 'CALCULATE_FUND_START', payload: { requestContext: currentRequest },
    });
    state = appReducer(state, {
      type: 'CALCULATE_FUND_SUCCESS',
      payload: { requestContext: currentRequest, result: createResult('current'), checks: [createCheck('current')] },
    });

    const current = state;
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_SUCCESS',
      payload: { requestContext: oldRequest, result: createResult('stale'), checks: [createCheck('stale')] },
    })).toBe(current);
  });

  it('stale ERROR cannot cancel the current result, checks, or loading', () => {
    const oldRequest = request('A', 2025, 40, 11);
    const currentRequest = request('A', 2025, 40, 12);
    let state: AppState = {
      ...createState(),
      calculationResult: createResult('current'),
      complianceChecks: [createCheck('current')],
    };
    state = appReducer(state, {
      type: 'CALCULATE_FUND_START', payload: { requestContext: oldRequest },
    });
    state = appReducer(state, {
      type: 'CALCULATE_FUND_START', payload: { requestContext: currentRequest },
    });

    const loadingCurrent = state;
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_ERROR',
      payload: { requestContext: oldRequest, error: 'stale error' },
    })).toBe(loadingCurrent);
    expect(loadingCurrent.isLoading).toBe(true);
    expect(loadingCurrent.calculationResult?.metadata.timestamp).toBe('current');
    expect(loadingCurrent.complianceChecks[0].id).toBe('current');
  });

  it('stale VALIDATION_FAILED changes no validation, error, or loading state', () => {
    const oldRequest = request('A', 2025, 40, 11);
    const currentRequest = request('A', 2025, 40, 12);
    let state = appReducer(createState(), {
      type: 'CALCULATE_FUND_START', payload: { requestContext: oldRequest },
    });
    state = appReducer(state, {
      type: 'CALCULATE_FUND_START', payload: { requestContext: currentRequest },
    });

    const loadingCurrent = state;
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_VALIDATION_FAILED',
      payload: { requestContext: oldRequest, errors: { stale: 'stale' } },
    })).toBe(loadingCurrent);
    expect(loadingCurrent.validationErrors).toEqual({});
    expect(loadingCurrent.error).toBeUndefined();
    expect(loadingCurrent.isLoading).toBe(true);
  });

  it('applies loading transitions only for the current request', () => {
    const currentRequest = request('A', 2025, 40, 12);
    let state = appReducer(createState(), {
      type: 'CALCULATE_FUND_START', payload: { requestContext: currentRequest },
    });
    expect(state.isLoading).toBe(true);

    const success = appReducer(state, {
      type: 'CALCULATE_FUND_SUCCESS',
      payload: { requestContext: currentRequest, result: createResult('success'), checks: [] },
    });
    expect(success.isLoading).toBe(false);

    state = appReducer(createState(), {
      type: 'CALCULATE_FUND_START', payload: { requestContext: currentRequest },
    });
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_ERROR',
      payload: { requestContext: currentRequest, error: 'error' },
    }).isLoading).toBe(false);

    expect(appReducer(state, {
      type: 'CALCULATE_FUND_VALIDATION_FAILED',
      payload: { requestContext: currentRequest, errors: { field: 'invalid' } },
    }).isLoading).toBe(false);
  });

  it('rejects START 11 when START 12 was already accepted', () => {
    const request12 = request('A', 2025, 40, 12);
    let state = appReducer(createState(), {
      type: 'CALCULATE_FUND_START', payload: { requestContext: request12 },
    });
    const current = state;
    state = appReducer(state, {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext: request('A', 2025, 40, 11) },
    });
    expect(state).toBe(current);
  });

  it('rejects a newer requestId carrying an older epoch', () => {
    const state = createState(ENTITY_A, 2025, 42);
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext: request('A', 2025, 40, 999) },
    })).toBe(state);
  });

  it('invalidates requests across OPEN -> CLOSED -> OPEN loads', () => {
    const currentRequest = request('A', 2025, 40, 12);
    let state = appReducer(createState(), {
      type: 'CALCULATE_FUND_START', payload: { requestContext: currentRequest },
    });
    state = appReducer(state, {
      type: 'LOAD_STATE_FROM_DB',
      payload: { fundData: createFundData(2025, AnnualSnapshotStatus.CLOSED) },
    });

    expect(state.calculationRuntime?.contextEpoch).toBe(41);
    expect(state.calculationRuntime?.latestRequest).toBeUndefined();
    expect(state.isLoading).toBe(false);
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_SUCCESS',
      payload: { requestContext: currentRequest, result: createResult('stale'), checks: [] },
    })).toBe(state);

    const closedRequest = request('A', 2025, 41, 13);
    state = appReducer(state, {
      type: 'CALCULATE_FUND_START', payload: { requestContext: closedRequest },
    });
    state = appReducer(state, {
      type: 'LOAD_STATE_FROM_DB',
      payload: { fundData: createFundData(2025, AnnualSnapshotStatus.OPEN) },
    });

    expect(state.calculationRuntime?.contextEpoch).toBe(42);
    expect(state.fundData.metadata?.snapshotStatus).toBe(AnnualSnapshotStatus.OPEN);
    expect(appReducer(state, {
      type: 'CALCULATE_FUND_ERROR',
      payload: { requestContext: closedRequest, error: 'stale closed request' },
    })).toBe(state);
  });

  it('keeps epoch for idempotent entity/year actions and increments it for LOAD', () => {
    const state = createState();
    const sameEntity = appReducer(state, {
      type: 'SET_CURRENT_ENTITY',
      payload: { ...ENTITY_A, name: 'Ente A aggiornato' },
    });
    expect(sameEntity.calculationRuntime?.contextEpoch).toBe(40);

    const sameYear = appReducer(sameEntity, { type: 'SET_CURRENT_YEAR', payload: 2025 });
    expect(sameYear.calculationRuntime?.contextEpoch).toBe(40);

    const loaded = appReducer(sameYear, {
      type: 'LOAD_STATE_FROM_DB',
      payload: { currentEntity: ENTITY_A, currentYear: 2025, fundData: createFundData(2025) },
    });
    expect(loaded.calculationRuntime?.contextEpoch).toBe(41);
  });
});

describe('AppProvider G10 production scheduling and persistence boundaries', () => {
  let providerContext: ReturnType<typeof useAppContext>;

  const Probe = () => {
    providerContext = useAppContext();
    return null;
  };

  const renderProvider = async () => {
    await act(async () => {
      render(React.createElement(AppProvider, null, React.createElement(Probe)));
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  const dispatchHydration = (entity: Entity, status = AnnualSnapshotStatus.OPEN) => {
    act(() => {
      providerContext.dispatch({
        type: 'LOAD_STATE_FROM_DB',
        payload: {
          currentEntity: entity,
          currentYear: 2025,
          fundData: createFundData(2025, status),
        },
        meta: { scheduleFundCalculation: true },
      });
    });
  };

  beforeEach(() => {
    providerNormativeData = undefined;
    vi.spyOn(SupabaseEntityRepository.prototype, 'getAll')
      .mockResolvedValue({ data: [], error: null });
    vi.spyOn(SupabaseEntityRepository.prototype, 'update')
      .mockResolvedValue({ error: null });
    vi.spyOn(SupabaseStateRepository.prototype, 'getAvailableYears')
      .mockResolvedValue({ data: [], error: null });
    vi.spyOn(SupabaseStateRepository.prototype, 'upsertState')
      .mockResolvedValue({ error: null });
    vi.spyOn(SupabaseUserRepository.prototype, 'getUserRole')
      .mockResolvedValue({ data: UserRole.ADMIN, error: null });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('cancella il timer della generazione A precedente nel vero path LOAD -> effect -> timer dopo A -> B -> A', async () => {
    providerNormativeData = normativeDataFixture;
    await renderProvider();
    vi.useFakeTimers();

    dispatchHydration(ENTITY_A);
    const firstAEpoch = providerContext.state.calculationRuntime?.contextEpoch;
    expect(vi.getTimerCount()).toBe(1);

    dispatchHydration(ENTITY_B);
    const bEpoch = providerContext.state.calculationRuntime?.contextEpoch;
    expect(bEpoch).not.toBe(firstAEpoch);
    expect(vi.getTimerCount()).toBe(1);

    dispatchHydration(ENTITY_A);
    const returnedAEpoch = providerContext.state.calculationRuntime?.contextEpoch;
    expect(returnedAEpoch).not.toBe(firstAEpoch);
    expect(returnedAEpoch).not.toBe(bEpoch);
    expect(vi.getTimerCount()).toBe(1);

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(providerContext.state.calculationRuntime?.latestRequest).toEqual(
      expect.objectContaining({ entityId: 'A', year: 2025, contextEpoch: returnedAEpoch })
    );
    expect(providerContext.state.calculationRuntime?.latestRequest?.contextEpoch).not.toBe(firstAEpoch);
  });

  it('mantiene soltanto il timer del secondo LOAD nel vero provider', async () => {
    providerNormativeData = normativeDataFixture;
    await renderProvider();
    vi.useFakeTimers();

    dispatchHydration(ENTITY_A);
    const firstEpoch = providerContext.state.calculationRuntime?.contextEpoch;
    expect(vi.getTimerCount()).toBe(1);

    dispatchHydration(ENTITY_A);
    const secondEpoch = providerContext.state.calculationRuntime?.contextEpoch;
    expect(secondEpoch).not.toBe(firstEpoch);
    expect(vi.getTimerCount()).toBe(1);

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(providerContext.state.calculationRuntime?.latestRequest?.contextEpoch).toBe(secondEpoch);
    expect(providerContext.state.calculationRuntime?.latestRequest?.contextEpoch).not.toBe(firstEpoch);
  });

  it('attraversa AppContext.saveState senza inoltrare runtime token al persistence workflow', async () => {
    await renderProvider();

    act(() => {
      providerContext.dispatch({
        type: 'LOAD_STATE_FROM_DB',
        payload: {
          currentEntity: ENTITY_A,
          currentYear: 2025,
          fundData: createFundData(2025),
        },
      });
    });

    await act(async () => {
      await providerContext.saveState();
    });

    const upsert = vi.mocked(SupabaseStateRepository.prototype.upsertState);
    expect(upsert).toHaveBeenCalledTimes(1);
    const persistedRecord = upsert.mock.calls[0][0];
    expect(persistedRecord).not.toHaveProperty('calculationRuntime');
    expect(persistedRecord).not.toHaveProperty('contextEpoch');
    expect(persistedRecord).not.toHaveProperty('latestRequest');
    expect(persistedRecord).not.toHaveProperty('requestId');
    expect(persistedRecord.fund_data).toBe(providerContext.state.fundData);
    expect(persistedRecord.fund_data).not.toHaveProperty('calculationRuntime');
    expect(persistedRecord.fund_data).not.toHaveProperty('contextEpoch');
    expect(persistedRecord.fund_data).not.toHaveProperty('latestRequest');
    expect(persistedRecord.fund_data).not.toHaveProperty('requestId');
  });
});
