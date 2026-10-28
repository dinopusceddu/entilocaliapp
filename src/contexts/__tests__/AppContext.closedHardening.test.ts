import React from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, appReducer, useAppContext } from '../AppContext';
import {
  AnnualSnapshotStatus,
  AppState,
  Entity,
  FundData,
  NavigationScope,
  UserRole,
} from '../../domain';
import {
  DEFAULT_CURRENT_YEAR,
  DEFAULT_USER,
  INITIAL_ANNUAL_DATA,
  INITIAL_DISTRIBUZIONE_RISORSE_DATA,
  INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA,
  INITIAL_FONDO_DIRIGENZA_DATA,
  INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA,
  INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA,
  INITIAL_HISTORICAL_DATA,
} from '../../test/fixtures/legacyDemoFund';
import { saveLocalDraft, hasLocalDraft } from '../../application/localDraftStorage';
import { baselineFromRow } from '../../application/snapshots/versionedSnapshotContract';

const repositoryMocks = vi.hoisted(() => ({
  entityGetAll: vi.fn(),
  entityUpdate: vi.fn(),
  stateGetAvailableYears: vi.fn(),
  stateGetState: vi.fn(),
  stateUpsertState: vi.fn(),
  stateCreateState: vi.fn(),
  userGetRole: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  user: { id: 'u1', email: 'user@example.test' },
}));

vi.mock('../AuthContext.tsx', () => ({
  useAuth: () => ({ user: authMocks.user }),
}));

vi.mock('../../hooks/useNormativeData.ts', () => ({
  useNormativeData: () => ({ data: undefined }),
}));

vi.mock('../../hooks/useFundDataAutosave.ts', () => ({
  useFundDataAutosave: () => ({ flush: vi.fn().mockResolvedValue({ success: true, noWrite: true }) }),
}));

vi.mock('../../infrastructure/persistence/SupabaseEntityRepository.ts', () => ({
  SupabaseEntityRepository: class {
    getAll(userId?: string) { return repositoryMocks.entityGetAll(userId); }
    update(id: string, name: string) { return repositoryMocks.entityUpdate(id, name); }
  },
}));

vi.mock('../../infrastructure/persistence/SupabaseStateRepository.ts', () => ({
  SupabaseStateRepository: class {
    getAvailableYears(userId: string | undefined, entityId: string) {
      return repositoryMocks.stateGetAvailableYears(userId, entityId);
    }
    getState(userId: string | undefined, entityId: string, year: number) {
      return repositoryMocks.stateGetState(userId, entityId, year);
    }
    upsertState(data: unknown) { return repositoryMocks.stateUpsertState(data); }
    createState(data: unknown) { return repositoryMocks.stateCreateState(data); }
  },
}));

vi.mock('../../infrastructure/persistence/SupabaseUserRepository.ts', () => ({
  SupabaseUserRepository: class {
    getUserRole(userId: string) { return repositoryMocks.userGetRole(userId); }
  },
}));

const ENTITY_A: Entity = { id: 'A', name: 'Ente A', user_id: 'u1' };
const ENTITY_B: Entity = { id: 'B', name: 'Ente B', user_id: 'u1' };

const createDeferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const createState = (snapshotStatus: AnnualSnapshotStatus): AppState => ({
  currentUser: structuredClone(DEFAULT_USER),
  currentYear: DEFAULT_CURRENT_YEAR,
  entities: [ENTITY_A, ENTITY_B],
  currentEntity: ENTITY_A,
  fundData: {
    historicalData: structuredClone(INITIAL_HISTORICAL_DATA),
    annualData: structuredClone(INITIAL_ANNUAL_DATA),
    fondoAccessorioDipendenteData: structuredClone(INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA),
    fondoElevateQualificazioniData: structuredClone(INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA),
    fondoSegretarioComunaleData: structuredClone(INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA),
    fondoDirigenzaData: structuredClone(INITIAL_FONDO_DIRIGENZA_DATA),
    distribuzioneRisorseData: structuredClone(INITIAL_DISTRIBUZIONE_RISORSE_DATA),
    personaleServizio: { dettagli: [] },
    metadata: { snapshotStatus },
  },
  complianceChecks: [],
  isLoading: false,
  isNormativeDataLoading: false,
  validationErrors: {},
  activeTab: 'dashboard',
  navigationScope: NavigationScope.DASHBOARD,
  calculationRuntime: { contextEpoch: 0 },
});

describe('appReducer CLOSED hardening', () => {
  it('respinge IMPORT_FUND_DATA usando lo stato corrente, anche se il payload tenta di riaprire il fondo', () => {
    const state = createState(AnnualSnapshotStatus.CLOSED);
    const beforeFundData = structuredClone(state.fundData);

    const result = appReducer(state, {
      type: 'IMPORT_FUND_DATA',
      payload: {
        ...state.fundData,
        metadata: { snapshotStatus: AnnualSnapshotStatus.OPEN },
        historicalData: {
          ...state.fundData.historicalData,
          fondoSalarioAccessorioPersonaleNonDirEQ2016: 999999,
        },
      },
    });

    expect(result).toBe(state);
    expect(result.fundData).toEqual(beforeFundData);
    expect(result.fundData.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.CLOSED);
  });

  it('respinge IMPORT_DATI_GENERALI_CSV senza modificare dati storici, annuali, simulatore o CCNL', () => {
    const state = createState(AnnualSnapshotStatus.CLOSED);
    const beforeFundData = structuredClone(state.fundData);

    const result = appReducer(state, {
      type: 'IMPORT_DATI_GENERALI_CSV',
      payload: {
        historicalData: { fondoSalarioAccessorioPersonaleNonDirEQ2016: 888888 },
        annualData: {
          ...state.fundData.annualData,
          denominazioneEnte: 'Ente importato',
          simulatoreInput: { simStipendiTabellari2023: 777777 },
          ccnl2024: { monteSalari2021: 666666 },
        },
      },
    });

    expect(result).toBe(state);
    expect(result.fundData.historicalData).toEqual(beforeFundData.historicalData);
    expect(result.fundData.annualData).toEqual(beforeFundData.annualData);
    expect(result.fundData.annualData.simulatoreInput).toEqual(beforeFundData.annualData.simulatoreInput);
    expect(result.fundData.annualData.ccnl2024).toEqual(beforeFundData.annualData.ccnl2024);
  });

  it('respinge UPDATE_ANNUAL_DATA in CLOSED come difesa autoritativa del salvataggio metadati report', () => {
    const state = createState(AnnualSnapshotStatus.CLOSED);

    const result = appReducer(state, {
      type: 'UPDATE_ANNUAL_DATA',
      payload: { denominazioneEnte: 'Mutazione non consentita' },
    });

    expect(result).toBe(state);
    expect(result.fundData.annualData.denominazioneEnte).not.toBe('Mutazione non consentita');
  });

  it('conserva il comportamento degli import per un fondo OPEN', () => {
    const state = createState(AnnualSnapshotStatus.OPEN);
    const importedFund = appReducer(state, {
      type: 'IMPORT_FUND_DATA',
      payload: {
        historicalData: {
          ...state.fundData.historicalData,
          fondoSalarioAccessorioPersonaleNonDirEQ2016: 123456,
        },
        annualData: {
          denominazioneEnte: 'Import completo',
          simulatoreInput: { simStipendiTabellari2023: 234567 },
          ccnl2024: { monteSalari2021: 345678 },
        },
      },
    });

    expect(importedFund).not.toBe(state);
    expect(importedFund.fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016).toBe(123456);
    expect(importedFund.fundData.annualData.denominazioneEnte).toBe('Import completo');
    expect(importedFund.fundData.annualData.simulatoreInput.simStipendiTabellari2023).toBe(234567);
    expect(importedFund.fundData.annualData.ccnl2024?.monteSalari2021).toBe(345678);

    const importedCsv = appReducer(state, {
      type: 'IMPORT_DATI_GENERALI_CSV',
      payload: {
        historicalData: { fondoSalarioAccessorioPersonaleNonDirEQ2016: 456789 },
        annualData: {
          ...state.fundData.annualData,
          denominazioneEnte: 'Import CSV',
          simulatoreInput: { simStipendiTabellari2023: 567890 },
          ccnl2024: { monteSalari2021: 678901 },
        },
      },
    });

    expect(importedCsv).not.toBe(state);
    expect(importedCsv.fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016).toBe(456789);
    expect(importedCsv.fundData.annualData.denominazioneEnte).toBe('Import CSV');
    expect(importedCsv.fundData.annualData.simulatoreInput.simStipendiTabellari2023).toBe(567890);
    expect(importedCsv.fundData.annualData.ccnl2024?.monteSalari2021).toBe(678901);
  });

  it('LOAD_STATE_FROM_DB invalida atomicamente il pending del contesto precedente', () => {
    const state = createState(AnnualSnapshotStatus.OPEN);
    state.hasPendingDraft = true;
    state.pendingDraftData = structuredClone(state.fundData);
    state.pendingDraftSources = { 'annualData.denominazioneEnte': 'manual' };
    state.pendingDraftMetadata = { entityId: 'A', year: state.currentYear };

    const loaded = appReducer(state, {
      type: 'LOAD_STATE_FROM_DB',
      payload: {
        currentEntity: ENTITY_B,
        currentYear: 2026,
        fundData: { ...structuredClone(state.fundData), metadata: { snapshotStatus: AnnualSnapshotStatus.OPEN } },
      },
    });

    expect(loaded.currentEntity?.id).toBe('B');
    expect(loaded.currentYear).toBe(2026);
    expect(loaded.hasPendingDraft).toBe(false);
    expect(loaded.pendingDraftData).toBeNull();
    expect(loaded.pendingDraftSources).toBeUndefined();
    expect(loaded.pendingDraftMetadata).toBeNull();
  });

  it('SET_USER invalida pending e stato switch soltanto quando cambia davvero userId', () => {
    const state = createState(AnnualSnapshotStatus.OPEN);
    state.currentUser = { ...state.currentUser, id: 'u1' };
    state.hasPendingDraft = true;
    state.pendingDraftData = structuredClone(state.fundData);
    state.pendingDraftSources = { 'annualData.denominazioneEnte': 'manual' };
    state.pendingDraftMetadata = { userId: 'u1', entityId: 'A', year: state.currentYear };
    state.isYearSwitching = true;
    state.lastYearSwitchError = 'errore precedente';

    const sameUser = appReducer(state, {
      type: 'SET_USER',
      payload: { ...state.currentUser, name: 'Nome aggiornato' },
    });
    expect(sameUser.pendingDraftData).toBe(state.pendingDraftData);
    expect(sameUser.isYearSwitching).toBe(true);
    expect(sameUser.lastYearSwitchError).toBe('errore precedente');

    const changedUser = appReducer(state, {
      type: 'SET_USER',
      payload: { ...state.currentUser, id: 'u2', email: 'u2@example.test' },
    });
    expect(changedUser.hasPendingDraft).toBe(false);
    expect(changedUser.pendingDraftData).toBeNull();
    expect(changedUser.pendingDraftSources).toBeUndefined();
    expect(changedUser.pendingDraftMetadata).toBeNull();
    expect(changedUser.isYearSwitching).toBe(false);
    expect(changedUser.lastYearSwitchError).toBeUndefined();
  });
});

describe('AppProvider pending draft context contract', () => {
  let providerContext: ReturnType<typeof useAppContext>;
  let providerView: ReturnType<typeof render>;
  const snapshots = new Map<string, FundData>();

  const Probe = () => {
    providerContext = useAppContext();
    return null;
  };

  const createSnapshotFund = (
    entity: Entity,
    year: number,
    snapshotStatus = AnnualSnapshotStatus.OPEN
  ): FundData => ({
    ...createState(snapshotStatus).fundData,
    annualData: {
      ...createState(snapshotStatus).fundData.annualData,
      annoRiferimento: year,
      denominazioneEnte: entity.name,
    },
    metadata: { snapshotStatus },
  });

  const createDraftFund = (entity: Entity, year: number, label: string): FundData => ({
    ...createSnapshotFund(entity, year),
    annualData: {
      ...createSnapshotFund(entity, year).annualData,
      denominazioneEnte: label,
    },
  });

  const storeDraft = (entity: Entity, year: number, label: string, userId = 'u1') => {
    const fundData = createDraftFund(entity, year, label);
    saveLocalDraft(
      userId,
      entity.id,
      year,
      fundData,
      { 'annualData.denominazioneEnte': 'manual' },
      entity.name
    );
    return fundData;
  };

  const renderProvider = () => {
    providerView = render(React.createElement(AppProvider, null, React.createElement(Probe)));
    return providerView;
  };

  const changeAuthenticatedUser = async (userId: string) => {
    authMocks.user = { id: userId, email: `${userId}@example.test` };
    providerView.rerender(React.createElement(AppProvider, null, React.createElement(Probe)));
    await waitFor(() => expect(providerContext.state.currentUser.id).toBe(userId));
  };

  const switchTo = async (entity: Entity, year: number) => {
    let switched = false;
    await act(async () => {
      switched = await providerContext.switchYearAtomic(year, entity);
    });
    await waitFor(() => expect(providerContext.state.currentEntity?.id).toBe(entity.id));
    return switched;
  };

  const showContext = async (entity: Entity, year: number) => {
    await act(async () => {
      // Model completed hydration for automatic-year effects, not two asynchronous UI commands.
      const fundData = snapshots.get(entity.id + ':' + year) || createSnapshotFund(entity, year);
      const row = { entity_id: entity.id, current_year: year, user_id: entity.user_id,
        role: providerContext.state.currentUser.role, fund_data: fundData,
        b1i4_version: '11111111-1111-4111-8111-111111111111' };
      providerContext.dispatch({ type: 'LOAD_STATE_FROM_DB', payload: {
        currentEntity: entity, currentYear: year, fundData,
        snapshotBaseline: baselineFromRow(authMocks.user.id, row)
      } });
    });
    await waitFor(() => {
      expect(providerContext.state.currentEntity?.id).toBe(entity.id);
      expect(providerContext.state.currentYear).toBe(year);
    });
  };

  const keepBootstrapRoleStable = () => {
    repositoryMocks.userGetRole.mockResolvedValue({ data: UserRole.GUEST, error: null });
    repositoryMocks.stateGetState.mockImplementation(async (_userId, entityId, year) => {
      const fundData = snapshots.get(`${entityId}:${year}`);
      return fundData
        ? {
            data: {
              entity_id: entityId,
              current_year: year,
              user_id: 'u1',
              role: UserRole.GUEST,
              fund_data: fundData,
              updated_at: '2026-09-26T00:00:00.000Z',
                b1i4_version: '11111111-1111-4111-8111-111111111111',
            },
            error: null,
          }
        : { data: null, error: null };
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.user = { id: 'u1', email: 'user@example.test' };
    localStorage.clear();
    sessionStorage.clear();
    snapshots.clear();
    snapshots.set('A:2025', createSnapshotFund(ENTITY_A, 2025));
    snapshots.set('B:2026', createSnapshotFund(ENTITY_B, 2026));

    repositoryMocks.entityGetAll.mockResolvedValue({ data: [], error: null });
    repositoryMocks.entityUpdate.mockResolvedValue({ error: null });
    repositoryMocks.stateGetAvailableYears.mockResolvedValue({ data: [], error: null });
    repositoryMocks.stateGetState
      .mockImplementation(async (_userId, entityId, year) => {
        const fundData = snapshots.get(`${entityId}:${year}`);
        return fundData
          ? {
              data: {
                entity_id: entityId,
                current_year: year,
                user_id: 'u1',
                role: UserRole.ADMIN,
                fund_data: fundData,
                updated_at: '2026-09-26T00:00:00.000Z',
                b1i4_version: '11111111-1111-4111-8111-111111111111',
              },
              error: null,
            }
          : { data: null, error: null };
      });
    repositoryMocks.stateUpsertState.mockResolvedValue({ error: null });
    repositoryMocks.stateCreateState.mockImplementation(async row => ({ data: { ...row, b1i4_expected: null, b1i4_version: '22222222-2222-4222-8222-222222222222' }, error: null }));
    repositoryMocks.userGetRole.mockResolvedValue({ data: UserRole.ADMIN, error: null });
  });

  afterEach(() => {
    cleanup();
  });

  it('A con bozza -> B senza bozza elimina il pending A senza cancellarne lo storage', async () => {
    storeDraft(ENTITY_A, 2025, 'Bozza A');
    await renderProvider();

    expect(await switchTo(ENTITY_A, 2025)).toBe(true);
    expect(providerContext.state.pendingDraftMetadata).toEqual(expect.objectContaining({ entityId: 'A', year: 2025 }));

    expect(await switchTo(ENTITY_B, 2026)).toBe(true);
    expect(providerContext.state.currentEntity?.id).toBe('B');
    expect(providerContext.state.currentYear).toBe(2026);
    expect(providerContext.state.hasPendingDraft).toBe(false);
    expect(providerContext.state.pendingDraftData).toBeNull();
    expect(providerContext.state.pendingDraftSources).toBeUndefined();
    expect(providerContext.state.pendingDraftMetadata).toBeNull();
    expect(hasLocalDraft('u1', 'A', 2025)).toBe(true);
  });

  it('A con bozza -> B con bozza propone soltanto la bozza B', async () => {
    storeDraft(ENTITY_A, 2025, 'Bozza A');
    const draftB = storeDraft(ENTITY_B, 2026, 'Bozza B');
    await renderProvider();

    await switchTo(ENTITY_A, 2025);
    await switchTo(ENTITY_B, 2026);

    expect(providerContext.state.pendingDraftData).toEqual(draftB);
    expect(providerContext.state.pendingDraftSources).toEqual({ 'annualData.denominazioneEnte': 'manual' });
    expect(providerContext.state.pendingDraftMetadata).toEqual(expect.objectContaining({ entityId: 'B', year: 2026 }));
    expect(providerContext.state.pendingDraftMetadata?.entityName).toBe('Ente B');
  });

  it('OPEN conserva la bozza legacy non versionata per consultazione senza applicarla o salvarla', async () => {
    const draftA = storeDraft(ENTITY_A, 2025, 'Bozza A ripristinata');
    await renderProvider();
    await switchTo(ENTITY_A, 2025);

    act(() => providerContext.restorePendingDraft());

    expect(providerContext.state.fundData.annualData.denominazioneEnte).toBe(ENTITY_A.name);
    expect(providerContext.persistence.retained.some(session => session.values.annualData.denominazioneEnte === draftA.annualData.denominazioneEnte)).toBe(true);
    expect(providerContext.persistence.blocked).toBe(true);
    expect(providerContext.state.hasPendingDraft).toBe(true);
    expect(providerContext.state.pendingDraftData).toEqual(draftA);
    expect(hasLocalDraft('u1', 'A', 2025)).toBe(true);
    expect(repositoryMocks.stateUpsertState).not.toHaveBeenCalled();
  });

  it('OPEN legittimo scarta la bozza usando le coordinate associate al pending', async () => {
    storeDraft(ENTITY_A, 2025, 'Bozza A');
    await renderProvider();
    await switchTo(ENTITY_A, 2025);

    act(() => providerContext.discardPendingDraft());

    expect(hasLocalDraft('u1', 'A', 2025)).toBe(false);
    expect(providerContext.state.hasPendingDraft).toBe(false);
    expect(providerContext.state.pendingDraftData).toBeNull();
  });

  it('cambio utente sullo stesso ente/anno invalida il pending U1 senza cancellarne lo storage', async () => {
    storeDraft(ENTITY_A, 2025, 'Bozza U1', 'u1');
    await renderProvider();
    await switchTo(ENTITY_A, 2025);
    expect(providerContext.state.pendingDraftMetadata).toEqual(expect.objectContaining({
      userId: 'u1',
      entityId: 'A',
      year: 2025,
    }));

    await changeAuthenticatedUser('u2');

    expect(providerContext.state.currentUser.id).toBe('u2');
    expect(providerContext.state.currentEntity).toBeUndefined();
    expect(providerContext.state.hydratedSnapshotKey).toBeNull();
    expect(providerContext.state.currentYear).toBe(2025);
    expect(providerContext.state.pendingDraftData).toBeNull();
    expect(hasLocalDraft('u1', 'A', 2025)).toBe(true);
  });

  it('restore con pending di U1 nel contesto U2 non importa, non aggiorna sorgenti e non consuma il pending', async () => {
    const draftU1 = storeDraft(ENTITY_A, 2025, 'Bozza U1', 'u1');
    await renderProvider();
    await switchTo(ENTITY_A, 2025);

    await changeAuthenticatedUser('u2');
    act(() => {
      providerContext.dispatch({
        type: 'SET_PENDING_DRAFT',
        payload: {
          fundData: draftU1,
          sources: { 'annualData.denominazioneEnte': 'manual' },
          metadata: { userId: 'u1', entityId: 'A', year: 2025, entityName: 'Ente A', updatedAt: 'oggi' },
        },
      });
    });
    const fundBefore = providerContext.state.fundData;
    const sourcesBefore = providerContext.state.localSources;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    act(() => providerContext.restorePendingDraft());

    expect(providerContext.state.fundData).toBe(fundBefore);
    expect(providerContext.state.localSources).toBe(sourcesBefore);
    expect(providerContext.state.pendingDraftData).toBe(draftU1);
    expect(hasLocalDraft('u1', 'A', 2025)).toBe(true);
    expect(repositoryMocks.stateUpsertState).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('discard tardivo U1 non cancella storage U1/U2; discard legittimo U2 cancella soltanto U2', async () => {
    const draftU1 = storeDraft(ENTITY_A, 2025, 'Bozza U1', 'u1');
    const draftU2 = storeDraft(ENTITY_A, 2025, 'Bozza U2', 'u2');
    await renderProvider();
    await switchTo(ENTITY_A, 2025);

    await changeAuthenticatedUser('u2');
    act(() => {
      providerContext.dispatch({
        type: 'SET_PENDING_DRAFT',
        payload: {
          fundData: draftU1,
          sources: { 'annualData.denominazioneEnte': 'manual' },
          metadata: { userId: 'u1', entityId: 'A', year: 2025, entityName: 'Ente A', updatedAt: 'oggi' },
        },
      });
    });
    const fundBefore = providerContext.state.fundData;

    act(() => providerContext.discardPendingDraft());

    expect(providerContext.state.fundData).toBe(fundBefore);
    expect(providerContext.state.pendingDraftData).toBeNull();
    expect(hasLocalDraft('u1', 'A', 2025)).toBe(true);
    expect(hasLocalDraft('u2', 'A', 2025)).toBe(true);

    await showContext(ENTITY_A, 2025);
    act(() => {
      providerContext.dispatch({
        type: 'SET_PENDING_DRAFT',
        payload: {
          fundData: draftU2,
          sources: { 'annualData.denominazioneEnte': 'manual' },
          metadata: { userId: 'u2', entityId: 'A', year: 2025, entityName: 'Ente A', updatedAt: 'oggi' },
        },
      });
    });
    act(() => providerContext.discardPendingDraft());

    expect(hasLocalDraft('u1', 'A', 2025)).toBe(true);
    expect(hasLocalDraft('u2', 'A', 2025)).toBe(false);
    expect(providerContext.state.pendingDraftData).toBeNull();
  });

  it('mismatch blocca restore e discard invalida solo il pending visualizzato senza cancellare storage A o B', async () => {
    const draftA = storeDraft(ENTITY_A, 2025, 'Bozza A');
    await renderProvider();
    await switchTo(ENTITY_B, 2026);
    storeDraft(ENTITY_B, 2026, 'Bozza B storage');
    const fundBefore = providerContext.state.fundData;
    const sourcesBefore = providerContext.state.localSources;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    act(() => {
      providerContext.dispatch({
        type: 'SET_PENDING_DRAFT',
        payload: {
          fundData: draftA,
          sources: { 'annualData.denominazioneEnte': 'manual' },
          metadata: { userId: 'u1', entityId: 'A', year: 2025, entityName: 'Ente A', updatedAt: 'oggi' },
        },
      });
    });
    act(() => providerContext.restorePendingDraft());

    expect(providerContext.state.fundData).toBe(fundBefore);
    expect(providerContext.state.localSources).toBe(sourcesBefore);
    expect(providerContext.state.pendingDraftData).toBe(draftA);
    expect(repositoryMocks.stateUpsertState).not.toHaveBeenCalled();

    act(() => providerContext.discardPendingDraft());
    expect(providerContext.state.pendingDraftData).toBeNull();
    expect(hasLocalDraft('u1', 'A', 2025)).toBe(true);
    expect(hasLocalDraft('u1', 'B', 2026)).toBe(true);
    warnSpy.mockRestore();
  });

  it('CLOSED con pending legittimo resta consultabile e scartabile ma non ripristinabile', async () => {
    snapshots.set('B:2026', createSnapshotFund(ENTITY_B, 2026, AnnualSnapshotStatus.CLOSED));
    const draftB = storeDraft(ENTITY_B, 2026, 'Bozza B chiusa');
    await renderProvider();
    await switchTo(ENTITY_B, 2026);
    const fundBefore = providerContext.state.fundData;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(providerContext.state.pendingDraftData).toEqual(draftB);
    act(() => providerContext.restorePendingDraft());
    expect(providerContext.state.fundData).toBe(fundBefore);
    expect(providerContext.state.pendingDraftData).toEqual(draftB);
    expect(repositoryMocks.stateUpsertState).not.toHaveBeenCalled();

    act(() => providerContext.discardPendingDraft());
    expect(hasLocalDraft('u1', 'B', 2026)).toBe(false);
    expect(providerContext.state.pendingDraftData).toBeNull();
    warnSpy.mockRestore();
  });

  it('una request A stale dopo loadAvailableYearsForEntity non può sovrascrivere fundData o pending B', async () => {
    const draftB = storeDraft(ENTITY_B, 2026, 'Bozza B');
    const delayedAYears = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const aYearsStarted = createDeferred<void>();
    let delayedA = false;
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (_userId, entityId) => {
      if (entityId === 'A' && !delayedA) {
        delayedA = true;
        aYearsStarted.resolve(undefined);
        return delayedAYears.promise;
      }
      return { data: [{ current_year: entityId === 'A' ? 2025 : 2026 }], error: null };
    });
    await renderProvider();

    const admittedSwitch = providerContext.switchYearAtomic;
    let firstSwitch!: Promise<boolean>;
    await act(async () => {
      firstSwitch = admittedSwitch(2025, ENTITY_A);
      await aYearsStarted.promise;
    });

    let secondSwitchResult = false;
    await act(async () => {
      secondSwitchResult = await admittedSwitch(2026, ENTITY_B);
    });
    expect(secondSwitchResult).toBe(true);
    await waitFor(() => expect(providerContext.state.pendingDraftData).toEqual(draftB));
    const fundBAuthoritative = providerContext.state.fundData;
    const pendingBAuthoritative = providerContext.state.pendingDraftData;
    const sourcesBAuthoritative = providerContext.state.pendingDraftSources;
    const yearsBAuthoritative = providerContext.availableYears;

    let firstSwitchResult = true;
    await act(async () => {
      delayedAYears.resolve({ data: [{ current_year: 2025 }], error: null });
      firstSwitchResult = await firstSwitch;
    });
    expect(firstSwitchResult).toBe(false);

    expect(providerContext.state.currentEntity?.id).toBe('B');
    expect(providerContext.state.currentYear).toBe(2026);
    expect(providerContext.state.fundData).toBe(fundBAuthoritative);
    expect(providerContext.state.pendingDraftData).toBe(pendingBAuthoritative);
    expect(providerContext.state.pendingDraftSources).toBe(sourcesBAuthoritative);
    expect(providerContext.availableYears).toBe(yearsBAuthoritative);
    expect(providerContext.availableYears).toEqual([2026]);
    expect(providerContext.state.pendingDraftMetadata).toEqual(expect.objectContaining({
      userId: 'u1',
      entityId: 'B',
      year: 2026,
    }));
  });

  it('A -> B -> A mantiene autorevole la nuova A quando la vecchia A riprende per ultima', async () => {
    const oldA = createSnapshotFund(ENTITY_A, 2025);
    oldA.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 = 111;
    const finalA = createSnapshotFund(ENTITY_A, 2025);
    finalA.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 = 333;
    snapshots.set('A:2025', oldA);
    storeDraft(ENTITY_A, 2025, 'Bozza A finale');
    storeDraft(ENTITY_B, 2026, 'Bozza B');

    const delayedAYears = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const aYearsStarted = createDeferred<void>();
    let aYearsCalls = 0;
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (_userId, entityId) => {
      if (entityId === 'A' && aYearsCalls++ === 0) {
        aYearsStarted.resolve(undefined);
        return delayedAYears.promise;
      }
      return { data: [{ current_year: entityId === 'A' ? 2025 : 2026 }], error: null };
    });
    await renderProvider();

    const initiallyAdmittedSwitch = providerContext.switchYearAtomic;
    let oldASwitch!: Promise<boolean>;
    await act(async () => {
      oldASwitch = initiallyAdmittedSwitch(2025, ENTITY_A);
      await aYearsStarted.promise;
    });
    let bSwitchResult = false;
    await act(async () => {
      bSwitchResult = await initiallyAdmittedSwitch(2026, ENTITY_B);
    });
    expect(bSwitchResult).toBe(true);

    snapshots.set('A:2025', finalA);
    let finalASwitchResult = false;
    await act(async () => {
      finalASwitchResult = await providerContext.switchYearAtomic(2025, ENTITY_A);
    });
    expect(finalASwitchResult).toBe(true);
    await waitFor(() => expect(providerContext.state.currentEntity?.id).toBe('A'));
    expect(providerContext.state.fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016).toBe(333);
    const authoritativeFundA = providerContext.state.fundData;
    const authoritativePendingA = providerContext.state.pendingDraftData;

    let oldASwitchResult = true;
    await act(async () => {
      delayedAYears.resolve({ data: [{ current_year: 2025 }], error: null });
      oldASwitchResult = await oldASwitch;
    });
    expect(oldASwitchResult).toBe(false);

    expect(providerContext.state.currentEntity?.id).toBe('A');
    expect(providerContext.state.currentYear).toBe(2025);
    expect(providerContext.state.fundData).toBe(authoritativeFundA);
    expect(providerContext.state.pendingDraftData).toBe(authoritativePendingA);
    expect(providerContext.state.pendingDraftMetadata).toEqual(expect.objectContaining({
      userId: 'u1',
      entityId: 'A',
      year: 2025,
    }));
  });

  it('cambio utente durante await invalida la request U1 anche con stesso ente/anno', async () => {
    await renderProvider();
    await switchTo(ENTITY_A, 2025);

    const originalGetState = repositoryMocks.stateGetState.getMockImplementation();
    const delayedAState = createDeferred<{ data: unknown; error: null }>();
    const aStateStarted = createDeferred<void>();
    repositoryMocks.stateGetState.mockImplementation(async (userId, entityId, year) => {
      if (entityId === 'A' && year === 2025) {
        aStateStarted.resolve(undefined);
        return delayedAState.promise;
      }
      if (!originalGetState) return { data: null, error: null };
      return originalGetState(userId, entityId, year);
    });

    let staleU1Switch!: Promise<boolean>;
    await act(async () => {
      staleU1Switch = providerContext.switchYearAtomic(2025, ENTITY_A);
      await aStateStarted.promise;
    });
    await changeAuthenticatedUser('u2');
    const draftU2 = storeDraft(ENTITY_A, 2025, 'Bozza U2', 'u2');
    act(() => {
      providerContext.dispatch({
        type: 'SET_PENDING_DRAFT',
        payload: {
          fundData: draftU2,
          sources: { 'annualData.denominazioneEnte': 'manual' },
          metadata: { userId: 'u2', entityId: 'A', year: 2025, entityName: 'Ente A', updatedAt: 'oggi' },
        },
      });
    });
    const fundU2 = providerContext.state.fundData;

    let staleU1Result = true;
    await act(async () => {
      delayedAState.resolve({
        data: {
          entity_id: 'A',
          current_year: 2025,
          user_id: 'u1',
          role: UserRole.ADMIN,
          fund_data: createSnapshotFund(ENTITY_A, 2025),
          updated_at: '2026-09-26T00:00:00.000Z',
                b1i4_version: '11111111-1111-4111-8111-111111111111',
        },
        error: null,
      });
      staleU1Result = await staleU1Switch;
    });
    expect(staleU1Result).toBe(false);

    expect(providerContext.state.currentUser.id).toBe('u2');
    expect(providerContext.state.currentEntity).toBeUndefined();
    expect(providerContext.state.hydratedSnapshotKey).toBeNull();
    expect(providerContext.state.currentYear).toBe(2025);
    expect(providerContext.state.fundData).toBe(fundU2);
    expect(providerContext.state.pendingDraftData).toBe(draftU2);
    expect(providerContext.state.pendingDraftMetadata).toEqual(expect.objectContaining({ userId: 'u2' }));
    expect(providerContext.state.isYearSwitching).toBe(false);
    expect(providerContext.state.lastYearSwitchError).toBeUndefined();
    expect(hasLocalDraft('u2', 'A', 2025)).toBe(true);
  });

  it('una request rifiutata da isYearSwitching non invalida la sequence della request ammessa', async () => {
    const delayedAState = createDeferred<{ data: unknown; error: null }>();
    const aStateStarted = createDeferred<void>();
    repositoryMocks.stateGetState.mockImplementation(async (_userId, entityId, year) => {
      if (entityId === 'A' && year === 2025) {
        aStateStarted.resolve(undefined);
        return delayedAState.promise;
      }
      return { data: null, error: null };
    });
    await renderProvider();

    let admittedA!: Promise<boolean>;
    await act(async () => {
      admittedA = providerContext.switchYearAtomic(2025, ENTITY_A);
      await aStateStarted.promise;
    });
    await waitFor(() => expect(providerContext.state.isYearSwitching).toBe(true));

    expect(await providerContext.switchYearAtomic(2026, ENTITY_B)).toBe(false);

    let admittedAResult = false;
    await act(async () => {
      delayedAState.resolve({
        data: {
          entity_id: 'A',
          current_year: 2025,
          user_id: 'u1',
          role: UserRole.ADMIN,
          fund_data: createSnapshotFund(ENTITY_A, 2025),
          updated_at: '2026-09-26T00:00:00.000Z',
                b1i4_version: '11111111-1111-4111-8111-111111111111',
        },
        error: null,
      });
      admittedAResult = await admittedA;
    });
    expect(admittedAResult).toBe(true);
    await waitFor(() => expect(providerContext.state.isYearSwitching).toBe(false));

    expect(providerContext.state.currentEntity?.id).toBe('A');
    expect(providerContext.state.currentYear).toBe(2025);
    expect(providerContext.state.lastYearSwitchError).toBeUndefined();
  });

  it('errore stale dopo caricamento anni non modifica error, loading o pending del contesto B', async () => {
    const draftB = storeDraft(ENTITY_B, 2026, 'Bozza B');
    const delayedAYears = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const aYearsStarted = createDeferred<void>();
    let delayedA = false;
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (_userId, entityId) => {
      if (entityId === 'A' && !delayedA) {
        delayedA = true;
        aYearsStarted.resolve(undefined);
        return delayedAYears.promise;
      }
      return { data: [{ current_year: entityId === 'A' ? 2025 : 2026 }], error: null };
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await renderProvider();

    const admittedSwitch = providerContext.switchYearAtomic;
    let staleA!: Promise<boolean>;
    await act(async () => {
      staleA = admittedSwitch(2025, ENTITY_A);
      await aYearsStarted.promise;
    });
    let bSwitchResult = false;
    await act(async () => {
      bSwitchResult = await admittedSwitch(2026, ENTITY_B);
    });
    expect(bSwitchResult).toBe(true);
    await waitFor(() => expect(providerContext.state.pendingDraftData).toEqual(draftB));
    const fundB = providerContext.state.fundData;
    const pendingB = providerContext.state.pendingDraftData;
    const yearsB = providerContext.availableYears;

    let staleAResult = true;
    await act(async () => {
      delayedAYears.reject(new Error('errore A stale'));
      staleAResult = await staleA;
    });
    expect(staleAResult).toBe(false);

    expect(providerContext.state.currentEntity?.id).toBe('B');
    expect(providerContext.state.currentYear).toBe(2026);
    expect(providerContext.state.fundData).toBe(fundB);
    expect(providerContext.state.pendingDraftData).toBe(pendingB);
    expect(providerContext.availableYears).toBe(yearsB);
    expect(providerContext.availableYears).toEqual([2026]);
    expect(providerContext.state.isYearSwitching).toBe(false);
    expect(providerContext.state.lastYearSwitchError).toBeUndefined();
    errorSpy.mockRestore();
  });

  it('una risposta tardiva A non sostituisce il pending B già caricato', async () => {
    const draftB = storeDraft(ENTITY_B, 2026, 'Bozza B');
    const originalGetState = repositoryMocks.stateGetState.getMockImplementation();
    let resolveA!: (value: { data: unknown; error: null }) => void;
    const delayedA = new Promise<{ data: unknown; error: null }>(resolve => {
      resolveA = resolve;
    });
    repositoryMocks.stateGetState.mockImplementation(async (userId, entityId, year) => {
      if (entityId === 'A' && year === 2025) return delayedA;
      if (!originalGetState) return { data: null, error: null };
      return originalGetState(userId, entityId, year);
    });
    await renderProvider();

    let firstSwitch!: Promise<boolean>;
    await act(async () => {
      firstSwitch = providerContext.switchYearAtomic(2025, ENTITY_A);
      await Promise.resolve();
    });
    let secondSwitchResult = false;
    await act(async () => {
      secondSwitchResult = await providerContext.switchYearAtomic(2026, ENTITY_B);
    });
    expect(secondSwitchResult).toBe(true);
    await waitFor(() => expect(providerContext.state.currentEntity?.id).toBe('B'));

    let firstSwitchResult = true;
    await act(async () => {
      resolveA({
        data: {
          entity_id: 'A',
          current_year: 2025,
          user_id: 'u1',
          role: UserRole.ADMIN,
          fund_data: createSnapshotFund(ENTITY_A, 2025),
          updated_at: '2026-09-26T00:00:00.000Z',
                b1i4_version: '11111111-1111-4111-8111-111111111111',
        },
        error: null,
      });
      firstSwitchResult = await firstSwitch;
    });
    expect(firstSwitchResult).toBe(false);
    await waitFor(() => expect(providerContext.state.pendingDraftData).toEqual(draftB));

    expect(providerContext.state.currentEntity?.id).toBe('B');
    expect(providerContext.state.currentYear).toBe(2026);
    expect(providerContext.state.pendingDraftData).toEqual(draftB);
    expect(providerContext.state.pendingDraftMetadata).toEqual(expect.objectContaining({ entityId: 'B', year: 2026 }));
  });

  it('il caricamento automatico A tardivo non sostituisce gli anni di B', async () => {
    const oldA = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const oldAStarted = createDeferred<void>();
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (_userId, entityId) => {
      if (entityId === 'A') {
        oldAStarted.resolve(undefined);
        return oldA.promise;
      }
      return { data: [{ current_year: 2026 }], error: null };
    });
    renderProvider();

    await showContext(ENTITY_A, 2025);
    await oldAStarted.promise;
    await showContext(ENTITY_B, 2026);
    await waitFor(() => expect(providerContext.availableYears).toEqual([2026]));

    await act(async () => {
      oldA.resolve({ data: [{ current_year: 2025 }], error: null });
      await oldA.promise;
    });
    expect(providerContext.availableYears).toEqual([2026]);
  });

  it('nel caricamento automatico A -> B -> A la vecchia A non supera la nuova A', async () => {
    const oldA = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const oldAStarted = createDeferred<void>();
    let aCalls = 0;
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (_userId, entityId) => {
      if (entityId === 'A' && aCalls++ === 0) {
        oldAStarted.resolve(undefined);
        return oldA.promise;
      }
      return { data: [{ current_year: entityId === 'A' ? 2027 : 2026 }], error: null };
    });
    renderProvider();

    await showContext(ENTITY_A, 2025);
    await oldAStarted.promise;
    await showContext(ENTITY_B, 2026);
    await waitFor(() => expect(providerContext.availableYears).toEqual([2026]));
    await showContext(ENTITY_A, 2027);
    await waitFor(() => expect(providerContext.availableYears).toEqual([2027]));

    await act(async () => {
      oldA.resolve({ data: [{ current_year: 2025 }], error: null });
      await oldA.promise;
    });
    expect(providerContext.availableYears).toEqual([2027]);
  });

  it('il caricamento automatico U1 tardivo non sostituisce gli anni di U2 nello stesso ente/anno', async () => {
    const oldU1 = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const oldU1Started = createDeferred<void>();
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (userId, _entityId) => {
      if (userId === 'u1') {
        oldU1Started.resolve(undefined);
        return oldU1.promise;
      }
      return { data: [{ current_year: 2030 }], error: null };
    });
    renderProvider();

    await showContext(ENTITY_A, 2025);
    await oldU1Started.promise;
    await changeAuthenticatedUser('u2');
    expect(providerContext.state.currentEntity).toBeUndefined();
    await showContext(ENTITY_A, 2025);
    await waitFor(() => expect(providerContext.availableYears).toEqual([2030]));

    await act(async () => {
      oldU1.resolve({ data: [{ current_year: 2025 }], error: null });
      await oldU1.promise;
    });
    expect(providerContext.availableYears).toEqual([2030]);
  });

  it('il caricamento automatico distingue due anni dello stesso ente', async () => {
    const oldYear = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const oldYearStarted = createDeferred<void>();
    let calls = 0;
    repositoryMocks.stateGetAvailableYears.mockImplementation(async () => {
      if (calls++ === 0) {
        oldYearStarted.resolve(undefined);
        return oldYear.promise;
      }
      return { data: [{ current_year: 2026 }], error: null };
    });
    renderProvider();

    await showContext(ENTITY_A, 2025);
    await oldYearStarted.promise;
    await act(async () => {
      providerContext.dispatch({ type: 'SET_CURRENT_YEAR', payload: 2026 });
    });
    await waitFor(() => expect(providerContext.availableYears).toEqual([2026]));

    await act(async () => {
      oldYear.resolve({ data: [{ current_year: 2025 }], error: null });
      await oldYear.promise;
    });
    expect(providerContext.availableYears).toEqual([2026]);
  });

  it('il caricamento automatico normale applica gli anni ordinati senza concorrenza', async () => {
    repositoryMocks.stateGetAvailableYears.mockResolvedValue({
      data: [{ current_year: 2024 }, { current_year: 2026 }, { current_year: 2025 }],
      error: null,
    });
    renderProvider();

    await showContext(ENTITY_A, 2025);
    await waitFor(() => expect(providerContext.availableYears).toEqual([2026, 2025, 2024]));
  });

  it('il cleanup del provider impedisce di applicare una risposta anni tardiva', async () => {
    const delayedYears = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const started = createDeferred<void>();
    repositoryMocks.stateGetAvailableYears.mockImplementation(async () => {
      started.resolve(undefined);
      return delayedYears.promise;
    });
    renderProvider();
    await showContext(ENTITY_A, 2025);
    await started.promise;
    act(() => providerView.unmount());

    await act(async () => {
      delayedYears.resolve({ data: [{ current_year: 2025 }], error: null });
      await delayedYears.promise;
    });
    expect(providerContext.availableYears).toEqual([]);
  });

  it('un errore automatico stale non modifica anni, loading o error del contesto corrente', async () => {
    const oldA = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const oldAStarted = createDeferred<void>();
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (_userId, entityId) => {
      if (entityId === 'A') {
        oldAStarted.resolve(undefined);
        return oldA.promise;
      }
      return { data: [{ current_year: 2026 }], error: null };
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderProvider();

    await showContext(ENTITY_A, 2025);
    await oldAStarted.promise;
    await showContext(ENTITY_B, 2026);
    await waitFor(() => expect(providerContext.availableYears).toEqual([2026]));
    const loadingB = providerContext.state.isYearSwitching;
    const errorB = providerContext.state.lastYearSwitchError;

    await act(async () => {
      oldA.reject(new Error('old A failed'));
      try { await oldA.promise; } catch { /* the workflow handles this rejection */ }
    });
    expect(providerContext.availableYears).toEqual([2026]);
    expect(providerContext.state.isYearSwitching).toBe(loadingB);
    expect(providerContext.state.lastYearSwitchError).toBe(errorB);
    errorSpy.mockRestore();
  });

  it('bootstrap A stale non sovrascrive fl_last_context dopo uno switch B', async () => {
    keepBootstrapRoleStable();
    const draftB = storeDraft(ENTITY_B, 2026, 'Bozza B');
    repositoryMocks.entityGetAll.mockResolvedValue({ data: [ENTITY_A, ENTITY_B], error: null });
    const oldA = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const oldAStarted = createDeferred<void>();
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (_userId, entityId) => {
      if (entityId === 'A') {
        oldAStarted.resolve(undefined);
        return oldA.promise;
      }
      return { data: [{ current_year: 2026 }], error: null };
    });
    renderProvider();
    await oldAStarted.promise;

    let switched = false;
    await act(async () => {
      switched = await providerContext.switchYearAtomic(2026, ENTITY_B);
    });
    expect(switched).toBe(true);
    await waitFor(() => expect(providerContext.state.pendingDraftData).toEqual(draftB));
    const storedB = localStorage.getItem('fl_last_context_u1');
    expect(JSON.parse(storedB || '{}')).toEqual(expect.objectContaining({ entityId: 'B', year: 2026 }));
    const fundB = providerContext.state.fundData;
    const pendingB = providerContext.state.pendingDraftData;

    await act(async () => {
      oldA.resolve({ data: [{ current_year: 2025 }], error: null });
      await oldA.promise;
    });
    expect(localStorage.getItem('fl_last_context_u1')).toBe(storedB);
    expect(providerContext.state.currentEntity?.id).toBe('B');
    expect(providerContext.state.currentYear).toBe(2026);
    expect(providerContext.state.fundData).toBe(fundB);
    expect(providerContext.state.pendingDraftData).toBe(pendingB);
  });

  it('bootstrap A vecchio non scrive sopra la preferenza della nuova A in A -> B -> A', async () => {
    keepBootstrapRoleStable();
    repositoryMocks.entityGetAll.mockResolvedValue({ data: [ENTITY_A, ENTITY_B], error: null });
    const oldA = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const oldAStarted = createDeferred<void>();
    let aCalls = 0;
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (_userId, entityId) => {
      if (entityId === 'A' && aCalls++ === 0) {
        oldAStarted.resolve(undefined);
        return oldA.promise;
      }
      return { data: [{ current_year: entityId === 'A' ? 2025 : 2026 }], error: null };
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    renderProvider();
    await oldAStarted.promise;

    expect(await switchTo(ENTITY_B, 2026)).toBe(true);
    expect(await switchTo(ENTITY_A, 2025)).toBe(true);
    const latestA = localStorage.getItem('fl_last_context_u1');
    expect(JSON.parse(latestA || '{}')).toEqual(expect.objectContaining({ entityId: 'A', year: 2025 }));
    const writesBeforeOldA = setItemSpy.mock.calls.filter(([key]) => key === 'fl_last_context_u1').length;

    await act(async () => {
      oldA.resolve({ data: [{ current_year: 2025 }], error: null });
      await oldA.promise;
    });
    expect(setItemSpy.mock.calls.filter(([key]) => key === 'fl_last_context_u1')).toHaveLength(writesBeforeOldA);
    expect(localStorage.getItem('fl_last_context_u1')).toBe(latestA);
    expect(providerContext.state.currentEntity?.id).toBe('A');
    expect(providerContext.state.currentYear).toBe(2025);
    setItemSpy.mockRestore();
  });

  it('bootstrap U1 stale dopo SET_USER non scrive la preferenza U1 né altera U2', async () => {
    keepBootstrapRoleStable();
    repositoryMocks.entityGetAll.mockResolvedValue({ data: [ENTITY_A], error: null });
    const oldU1 = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const oldU1Started = createDeferred<void>();
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (userId) => {
      if (userId === 'u1') {
        oldU1Started.resolve(undefined);
        return oldU1.promise;
      }
      return { data: [{ current_year: 2025 }], error: null };
    });
    renderProvider();
    await oldU1Started.promise;
    await changeAuthenticatedUser('u2');
    await waitFor(() => expect(providerContext.state.currentEntity?.id).toBe('A'));
    await waitFor(() => expect(providerContext.state.currentYear).toBe(2025));
    const storedU2 = localStorage.getItem('fl_last_context_u2');
    expect(JSON.parse(storedU2 || '{}')).toEqual(expect.objectContaining({ entityId: 'A', year: 2025 }));
    const fundU2 = providerContext.state.fundData;
    const pendingU2 = providerContext.state.pendingDraftData;
    expect(localStorage.getItem('fl_last_context_u1')).toBeNull();

    await act(async () => {
      oldU1.resolve({ data: [{ current_year: 2025 }], error: null });
      await oldU1.promise;
    });
    expect(localStorage.getItem('fl_last_context_u1')).toBeNull();
    expect(localStorage.getItem('fl_last_context_u2')).toBe(storedU2);
    expect(providerContext.state.currentUser.id).toBe('u2');
    expect(providerContext.state.fundData).toBe(fundU2);
    expect(providerContext.state.pendingDraftData).toBe(pendingU2);
  });

  it('bootstrap normale salva la preferenza nel formato esistente e carica il contesto', async () => {
    keepBootstrapRoleStable();
    repositoryMocks.entityGetAll.mockResolvedValue({ data: [ENTITY_A], error: null });
    repositoryMocks.stateGetAvailableYears.mockResolvedValue({
      data: [{ current_year: 2024 }, { current_year: 2025 }],
      error: null,
    });
    renderProvider();

    await waitFor(() => expect(providerContext.state.currentEntity?.id).toBe('A'));
    await waitFor(() => expect(providerContext.state.currentYear).toBe(2025));
    await waitFor(() => expect(providerContext.state.fundData.annualData.annoRiferimento).toBe(2025));
    const stored = JSON.parse(localStorage.getItem('fl_last_context_u1') || '{}');
    expect(Object.keys(stored)).toEqual(['entityId', 'year', 'updatedAt']);
    expect(stored).toEqual({ entityId: 'A', year: 2025, updatedAt: expect.any(String) });
  });

  it('bootstrap P1 dopo unmount non scrive né modifica il pending del nuovo provider P2', async () => {
    keepBootstrapRoleStable();
    const draftB = storeDraft(ENTITY_B, 2026, 'Bozza B');
    let entityCalls = 0;
    repositoryMocks.entityGetAll.mockImplementation(async () => ({
      data: ++entityCalls === 1 ? [ENTITY_A] : [ENTITY_B],
      error: null,
    }));
    const oldAYears = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const oldAStarted = createDeferred<void>();
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (_userId, entityId) => {
      if (entityId === 'A') {
        oldAStarted.resolve(undefined);
        return oldAYears.promise;
      }
      return { data: [{ current_year: 2026 }], error: null };
    });
    renderProvider();
    await oldAStarted.promise;
    act(() => providerView.unmount());

    renderProvider();
    await waitFor(() => expect(providerContext.state.currentEntity?.id).toBe('B'));
    await waitFor(() => expect(providerContext.state.pendingDraftData).toEqual(draftB));
    await waitFor(() => expect(providerContext.availableYears).toEqual([2026]));
    const storedB = localStorage.getItem('fl_last_context_u1');
    expect(JSON.parse(storedB || '{}')).toEqual(expect.objectContaining({ entityId: 'B', year: 2026 }));
    const p2Fund = providerContext.state.fundData;
    const p2Pending = providerContext.state.pendingDraftData;
    const p2Entities = providerContext.state.entities;
    const p2Error = providerContext.state.lastYearSwitchError;
    const p2Loading = providerContext.state.isYearSwitching;
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await act(async () => {
      oldAYears.resolve({ data: [{ current_year: 2025 }], error: null });
      await oldAYears.promise;
    });
    expect(setItemSpy.mock.calls.filter(([key]) => key === 'fl_last_context_u1')).toHaveLength(0);
    expect(localStorage.getItem('fl_last_context_u1')).toBe(storedB);
    expect(repositoryMocks.stateGetState.mock.calls.some(([, entityId]) => entityId === 'A')).toBe(false);
    expect(providerContext.state.entities).toBe(p2Entities);
    expect(providerContext.state.fundData).toBe(p2Fund);
    expect(providerContext.state.pendingDraftData).toBe(p2Pending);
    expect(providerContext.state.lastYearSwitchError).toBe(p2Error);
    expect(providerContext.state.isYearSwitching).toBe(p2Loading);
    expect(errorSpy).not.toHaveBeenCalled();
    setItemSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('StrictMode invalida il primo setup anche dopo il nuovo setup della stessa istanza', async () => {
    keepBootstrapRoleStable();
    const oldGetAll = createDeferred<{ data: Entity[]; error: null }>();
    let entityCalls = 0;
    repositoryMocks.entityGetAll.mockImplementation(async () => {
      if (++entityCalls === 1) return oldGetAll.promise;
      return { data: [ENTITY_B], error: null };
    });
    repositoryMocks.stateGetAvailableYears.mockResolvedValue({
      data: [{ current_year: 2026 }],
      error: null,
    });
    providerView = render(React.createElement(
      React.StrictMode,
      null,
      React.createElement(AppProvider, null, React.createElement(Probe))
    ));

    await waitFor(() => expect(entityCalls).toBeGreaterThanOrEqual(2));
    await waitFor(() => expect(providerContext.state.currentEntity?.id).toBe('B'));
    const storedB = localStorage.getItem('fl_last_context_u1');
    expect(JSON.parse(storedB || '{}')).toEqual(expect.objectContaining({ entityId: 'B', year: 2026 }));
    const entitiesB = providerContext.state.entities;
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    await act(async () => {
      oldGetAll.resolve({ data: [ENTITY_A], error: null });
      await oldGetAll.promise;
    });
    expect(setItemSpy.mock.calls.filter(([key]) => key === 'fl_last_context_u1')).toHaveLength(0);
    expect(localStorage.getItem('fl_last_context_u1')).toBe(storedB);
    expect(providerContext.state.entities).toBe(entitiesB);
    expect(providerContext.state.currentEntity?.id).toBe('B');
    expect(repositoryMocks.stateGetAvailableYears.mock.calls.some(([, entityId]) => entityId === 'A')).toBe(false);
    setItemSpy.mockRestore();
  });

  it('due bootstrap concorrenti mantengono autorevoli enti, anni, pending e preferenza del più recente', async () => {
    keepBootstrapRoleStable();
    const draftB = storeDraft(ENTITY_B, 2026, 'Bozza B');
    let entityCalls = 0;
    repositoryMocks.entityGetAll.mockImplementation(async () => ({
      data: ++entityCalls === 1 ? [ENTITY_A] : [ENTITY_B],
      error: null,
    }));
    const oldAYears = createDeferred<{ data: { current_year: number }[]; error: null }>();
    const oldAStarted = createDeferred<void>();
    repositoryMocks.stateGetAvailableYears.mockImplementation(async (_userId, entityId) => {
      if (entityId === 'A') {
        oldAStarted.resolve(undefined);
        return oldAYears.promise;
      }
      return { data: [{ current_year: 2026 }], error: null };
    });
    renderProvider();
    await oldAStarted.promise;

    act(() => providerContext.dispatch({
      type: 'SET_USER',
      payload: { ...providerContext.state.currentUser, role: UserRole.ADMIN },
    }));
    await waitFor(() => expect(entityCalls).toBeGreaterThanOrEqual(2));
    await waitFor(() => expect(providerContext.state.currentEntity?.id).toBe('B'));
    await waitFor(() => expect(providerContext.state.pendingDraftData).toEqual(draftB));
    await waitFor(() => expect(providerContext.availableYears).toEqual([2026]));
    const storedB = localStorage.getItem('fl_last_context_u1');
    const entitiesB = providerContext.state.entities;
    const fundB = providerContext.state.fundData;
    const pendingB = providerContext.state.pendingDraftData;
    const yearsB = providerContext.availableYears;
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    await act(async () => {
      oldAYears.resolve({ data: [{ current_year: 2025 }], error: null });
      await oldAYears.promise;
    });
    expect(setItemSpy.mock.calls.filter(([key]) => key === 'fl_last_context_u1')).toHaveLength(0);
    expect(localStorage.getItem('fl_last_context_u1')).toBe(storedB);
    expect(providerContext.state.entities).toBe(entitiesB);
    expect(providerContext.state.fundData).toBe(fundB);
    expect(providerContext.state.pendingDraftData).toBe(pendingB);
    expect(providerContext.availableYears).toBe(yearsB);
    setItemSpy.mockRestore();
  });
});
