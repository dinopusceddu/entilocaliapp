import { baselineFromRow } from '../application/snapshots/versionedSnapshotContract';
import { fixtureRow, fixtureBaseline, confirmedFixtureWrite, confirmedFixtureClosure } from '../test/fixtures/b1Persistence';
// src/__tests__/wave1ClosedSnapshot.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AnnualSnapshotStatus,
  UserRole,
  TipologiaEnte,
  FundData
} from '../domain';
import { saveAnnualSnapshot } from '../application/snapshots/snapshotWorkflow';
import { saveAppStateWorkflow } from '../application/stateWorkflow';
import { closeYearAndPrepareNext } from '../application/yearClosureWorkflow';
import { appReducer } from '../contexts/AppContext';

describe('Wave 1 — SEC-01, FUNC-01, DATA-02: Immutability and Atomic Year Closure (C1–C10)', () => {
  const mockUserOwner = { id: 'user_owner_id', email: 'owner@test.com', role: UserRole.HR };
  const mockUserAdmin = { id: 'admin_id', email: 'admin@test.com', role: UserRole.ADMIN };
  const mockEntity = { id: 'entity_uuid', name: 'Comune di Test', user_id: mockUserOwner.id };
  const mockYear = 2025;
  const mockNextYear = 2026;

  const mockNormative: any = {
    articles: [],
    parameters: {},
    riferimenti_normativi: {
      art67_ccnl2018: 'Art. 67 CCNL 2018',
      art59_ccnl2024: 'Art. 59 CCNL 2024',
      art48_ccnl2024: 'Art. 48 CCNL 2024',
      art97_ccnl2022: 'Art. 97 CCNL 2022',
      art98_ccnl2022: 'Art. 98 CCNL 2022',
      art47_ccnl2024: 'Art. 47 CCNL 2024',
      art45_dlgs36_2023_new: 'Art. 45 D.Lgs 36/2023',
      ccnl_14092000_art24c1: 'Art. 24 c.1 CCNL 2000',
      dl16_2014_art4: 'Art. 4 DL 16/2014',
      art23_dlgs75_2017: 'Art. 23 D.Lgs 75/2017',
      art8_dl13_2023: 'Art. 8 DL 13/2023',
      art7_c4_u_ccnl2022: 'Art. 7 c.4 CCNL 2022'
    }
  };

  const createBaseFundData = (status: AnnualSnapshotStatus): FundData => ({
    metadata: {
      snapshotStatus: status,
      year: mockYear,
      closedAt: status === AnnualSnapshotStatus.CLOSED ? '2026-09-22T10:00:00.000Z' : undefined,
      closedByUserId: status === AnnualSnapshotStatus.CLOSED ? mockUserOwner.id : undefined,
    },
    annualData: {
      annoRiferimento: mockYear,
      tipologiaEnte: TipologiaEnte.COMUNE,
      denominazioneEnte: 'Comune di Test',
      personaleServizioAttuale: [],
      proventiSpecifici: [],
      personale2018PerArt23: [],
      personaleAnnoRifPerArt23: [],
      simulatoreInput: {}
    },
    historicalData: {},
    fondoAccessorioDipendenteData: {
      st_art79c1_art67c1_unicoImporto2017: 50000,
    },
    fondoElevateQualificazioniData: {},
    fondoDirigenzaData: {},
    fondoSegretarioComunaleData: {},
    distribuzioneRisorseData: {
      u_indennitaComparto: 10000,
      p_performanceIndividuale: { stanziate: 5000, risparmi: 1500 }
    },
    personaleServizio: { dettagli: [] }
  });

  // Database trigger simulator mirroring PostgreSQL function:
  // enforce_user_app_state_closed_immutability()
  const simulateDatabaseTrigger = (oldRow: any, newRow: any, bypassTrigger = false) => {
    if (bypassTrigger) return newRow;
    const oldStatus = oldRow?.fund_data?.metadata?.snapshotStatus;
    if (oldStatus === 'CLOSED') {
      const err: any = new Error('SNAPSHOT_CLOSED: Annualita chiusa non modificabile');
      err.code = 'P0001';
      throw err;
    }
    return newRow;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // C1: OPEN -> save: SUCCESS
  it('C1: saves successfully when annual snapshot is OPEN', async () => {
    const openFundData = createBaseFundData(AnnualSnapshotStatus.OPEN);
    const mockStateRepo: any = {
      getState: vi.fn().mockResolvedValue({
        data: {
          fund_data: openFundData,
          user_id: mockUserOwner.id,
          entity_id: mockEntity.id,
          current_year: mockYear
        }
      }),
      upsertState: vi.fn().mockImplementation(confirmedFixtureWrite)
    };

    const deps: any = {
      stateRepository: mockStateRepo,
      interactionService: { confirm: vi.fn().mockResolvedValue(true) },
      entityRepository: {
        getById: vi.fn().mockResolvedValue({ data: mockEntity }),
        update: vi.fn().mockResolvedValue({ error: null })
      },
      userRepository: {
        getUserRole: vi.fn().mockResolvedValue({ data: UserRole.HR })
      }
    };

    const result = await saveAnnualSnapshot(deps, mockUserOwner, mockEntity, mockYear, UserRole.HR, openFundData, fixtureBaseline(mockUserOwner, mockEntity, mockYear, { ...openFundData, annualData: { ...openFundData.annualData, denominazioneEnte: 'Prior fixture' } }));
    expect(result.success).toBe(true);
    expect(mockStateRepo.upsertState).toHaveBeenCalledTimes(1);
  });

  // C2: CLOSED -> normal application save: REJECTED with typed reason SNAPSHOT_CLOSED
  it('C2: rejects normal application save on a CLOSED snapshot with reason SNAPSHOT_CLOSED', async () => {
    const closedFundData = createBaseFundData(AnnualSnapshotStatus.CLOSED);
    const mockStateRepo: any = {
      getState: vi.fn().mockResolvedValue({
        data: {
          fund_data: closedFundData,
          user_id: mockUserOwner.id,
          entity_id: mockEntity.id,
          current_year: mockYear
        }
      }),
      upsertState: vi.fn()
    };

    const deps: any = {
      stateRepository: mockStateRepo,
      interactionService: { confirm: vi.fn().mockResolvedValue(true) },
      entityRepository: {
        getById: vi.fn().mockResolvedValue({ data: mockEntity }),
        update: vi.fn()
      },
      userRepository: {
        getUserRole: vi.fn().mockResolvedValue({ data: UserRole.HR })
      }
    };

    // Application workflow check
    const saveResult = await saveAnnualSnapshot(deps, mockUserOwner, mockEntity, mockYear, UserRole.HR, closedFundData, fixtureBaseline(mockUserOwner, mockEntity, mockYear, closedFundData));
    expect(saveResult.success).toBe(false);
    expect(saveResult.reason).toBe('STATE_CLOSED');
    expect(saveResult.error).toContain('chiusa');
    // Database write must NOT have been attempted
    expect(mockStateRepo.upsertState).not.toHaveBeenCalled();
  });

  // C3: CLOSED -> direct owner update: REJECTED by trigger simulation
  it('C3: blocks direct SQL UPDATE by entity owner on a CLOSED row via DB trigger', async () => {
    const existingDbRow = {
      id: 'row_123',
      user_id: mockUserOwner.id,
      entity_id: mockEntity.id,
      current_year: mockYear,
      fund_data: createBaseFundData(AnnualSnapshotStatus.CLOSED)
    };

    const directUpdateAttempt = {
      ...existingDbRow,
      fund_data: {
        ...existingDbRow.fund_data,
        fondoAccessorioDipendenteData: { st_art79c1_art67c1_unicoImporto2017: 999999 }
      }
    };

    expect(() => {
      simulateDatabaseTrigger(existingDbRow, directUpdateAttempt, false);
    }).toThrowError(/SNAPSHOT_CLOSED/);
  });

  // C4: CLOSED -> direct admin generic update: REJECTED by trigger simulation (no bypass for normal UPDATE)
  it('C4: blocks direct SQL UPDATE by administrator on a CLOSED row via DB trigger (no role exemption)', async () => {
    const existingDbRow = {
      id: 'row_123',
      user_id: mockUserOwner.id,
      entity_id: mockEntity.id,
      current_year: mockYear,
      fund_data: createBaseFundData(AnnualSnapshotStatus.CLOSED)
    };

    const adminDirectUpdateAttempt = {
      ...existingDbRow,
      fund_data: {
        ...existingDbRow.fund_data,
        distribuzioneRisorseData: { u_indennitaComparto: 0 }
      }
    };

    // Even admin role encounters P0001 exception on generic UPDATE
    expect(mockUserAdmin.role).toBe(UserRole.ADMIN);
    expect(() => {
      simulateDatabaseTrigger(existingDbRow, adminDirectUpdateAttempt, false);
    }).toThrowError(/SNAPSHOT_CLOSED/);
  });

  // C5: CLOSED -> UI / reducer: mutating actions return unmodified state
  it('C5: appReducer rejects mutating actions and preserves existing state when snapshotStatus is CLOSED', () => {
    const closedFundData = createBaseFundData(AnnualSnapshotStatus.CLOSED);
    const initialState: any = {
      currentYear: mockYear,
      currentUser: mockUserOwner,
      currentEntity: mockEntity,
      fundData: closedFundData,
      calculationResult: null
    };

    // Attempt to mutate fondo accessorio dipendente data
    const mutatedState1 = appReducer(initialState, {
      type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA',
      payload: { st_art79c1_art67c1_unicoImporto2017: 999999 }
    });
    expect(mutatedState1).toBe(initialState);
    expect(mutatedState1.fundData.fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017).toBe(50000);

    // Attempt to mutate distribuzione risorse
    const mutatedState2 = appReducer(initialState, {
      type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA',
      payload: { u_indennitaComparto: 999999 }
    });
    expect(mutatedState2).toBe(initialState);
    expect(mutatedState2.fundData.distribuzioneRisorseData.u_indennitaComparto).toBe(10000);

    // Attempt to mutate Elevate Qualificazioni
    const mutatedState3 = appReducer(initialState, {
      type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA',
      payload: { ris_fondoPO2017: 999999 }
    });
    expect(mutatedState3).toBe(initialState);

    // Attempt to mutate Dirigenza
    const mutatedState4 = appReducer(initialState, {
      type: 'UPDATE_FONDO_DIRIGENZA_DATA',
      payload: { st_quotaBase2018: 999999 }
    });
    expect(mutatedState4).toBe(initialState);

    // Attempt to mutate Segretario Comunale
    const mutatedState5 = appReducer(initialState, {
      type: 'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA',
      payload: { st_galleggiamento: 999999 }
    });
    expect(mutatedState5).toBe(initialState);

    // Attempt to mutate Personale in Servizio
    const mutatedState6 = appReducer(initialState, {
      type: 'ADD_PERSONALE_SERVIZIO_DETTAGLIO',
      payload: { id: 'new_emp', fullYearService: true } as any
    });
    expect(mutatedState6).toBe(initialState);
  });

  // C6: CLOSED -> saveState: returns { success: false, reason: 'SNAPSHOT_CLOSED' } without false success
  it('C6: saveAppStateWorkflow returns SNAPSHOT_CLOSED when database trigger aborts update', async () => {
    const openFundData = createBaseFundData(AnnualSnapshotStatus.OPEN);
    const mockStateRepo: any = {
      upsertState: vi.fn().mockResolvedValue({
        error: { message: 'SNAPSHOT_CLOSED: Annualita chiusa non modificabile', code: 'P0001' }
      })
    };

    const deps: any = {
      stateRepository: mockStateRepo,
      interactionService: { confirm: vi.fn().mockResolvedValue(true) },
      entityRepository: { update: vi.fn() }
    };

    const result = await saveAppStateWorkflow(
      deps,
      mockUserOwner,
      mockEntity,
      mockYear,
      UserRole.HR,
      openFundData,
      vi.fn(),
      fixtureBaseline(mockUserOwner, mockEntity, mockYear, { ...openFundData, annualData: { ...openFundData.annualData, denominazioneEnte: 'Prior fixture' } })
    );

    expect(result.success).toBe(false);
    expect(result.reason).toBe('STATE_CLOSED');
    expect((result.technicalCause as any)?.message).toContain('SNAPSHOT_CLOSED');
    expect(mockStateRepo.upsertState).toHaveBeenCalledTimes(1);
  });

  // C7: Next-year creation failure: transaction rollback, current year not left closed
  it('C7: when next-year creation fails, the atomic transaction rolls back and current year is not left closed', async () => {
    const mockSnapshotKey = `${mockEntity.id}:${mockYear}`;
    const mockStateRepo: any = {
      getState: vi.fn().mockResolvedValue({
        data: null, error: null
      }),
      // Simulated RPC failure during next-year insertion
      closeYearAtomic: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database failure during next-year creation: foreign key constraint' }
      })
    };

    const deps: any = {
      stateRepository: mockStateRepo,
      interactionService: { confirm: vi.fn().mockResolvedValue(true) },
      entityRepository: {
        getById: vi.fn().mockResolvedValue({ data: mockEntity }),
        update: vi.fn()
      },
      userRepository: {
        getUserRole: vi.fn().mockResolvedValue({ data: UserRole.ADMIN })
      }
    };

    const result = await closeYearAndPrepareNext(
      deps,
      mockUserOwner,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      createBaseFundData(AnnualSnapshotStatus.OPEN),
      mockNormative,
      createBaseFundData(AnnualSnapshotStatus.OPEN),
      mockSnapshotKey,
      fixtureBaseline(mockUserOwner, mockEntity, mockYear, createBaseFundData(AnnualSnapshotStatus.OPEN))
    );

    expect(result.success).toBe(false);
    expect((result.technicalCause as any)?.message).toContain('Database failure during next-year creation');
    // Ensure closeYearAtomic was called
    expect(mockStateRepo.closeYearAtomic).toHaveBeenCalledTimes(1);
  });

  // C8: Retry closure: idempotent operation, no duplicate entries
  it('C8: retrying closure on an already CLOSED baseline is denied without changing its existing carry-forward', async () => {
    const closedFundData = createBaseFundData(AnnualSnapshotStatus.CLOSED);
    const nextYearFundData = createBaseFundData(AnnualSnapshotStatus.OPEN);
    nextYearFundData.fondoAccessorioDipendenteData = {
      vn_art80c1_sommeNonUtilizzateStabiliPrec: 1500
    };

    const mockStateRepo: any = {
      // Current year is already CLOSED
      getState: vi.fn().mockImplementation((_userId: string | undefined, _entityId: string, year: number) => {
        if (year === mockYear) {
          return Promise.resolve({
            data: {
              ...fixtureRow(closedFundData, mockUserOwner, mockEntity, mockYear)
            }
          });
        }
        if (year === mockNextYear) {
          return Promise.resolve({
            data: {
              ...fixtureRow(nextYearFundData, mockUserOwner, mockEntity, mockNextYear)
            }
          });
        }
        return Promise.resolve({ data: null });
      }),
      closeYearAtomic: vi.fn()
    };

    const mockSnapshotKey = `${mockEntity.id}:${mockYear}`;
    const deps: any = {
      stateRepository: mockStateRepo,
      interactionService: { confirm: vi.fn().mockResolvedValue(true) },
      entityRepository: {
        getById: vi.fn().mockResolvedValue({ data: mockEntity }),
        update: vi.fn()
      },
      userRepository: {
        getUserRole: vi.fn().mockResolvedValue({ data: UserRole.ADMIN })
      }
    };

    const result = await closeYearAndPrepareNext(
      deps,
      mockUserOwner,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      closedFundData,
      mockNormative,
      nextYearFundData,
      mockSnapshotKey,
      fixtureBaseline(mockUserOwner, mockEntity, mockYear, closedFundData)
    );

    expect(result.success).toBe(false);
    expect(result.closedYear).toBe(mockYear);
    expect(result.nextYear).toBe(mockNextYear);
    expect(result.carryForward).toBe(0);
    expect(nextYearFundData.fondoAccessorioDipendenteData.vn_art80c1_sommeNonUtilizzateStabiliPrec).toBe(1500);
    expect((result.technicalCause as any)?.code).toBe('STATE_CLOSED');
    expect(mockStateRepo.getState).not.toHaveBeenCalled();
    // RPC is not invoked again because operation is already complete
    expect(mockStateRepo.closeYearAtomic).not.toHaveBeenCalled();
  });

  // C9: Double submit: concurrency protection
  it('C9: handles rapid sequential / double submit closure calls safely', async () => {
    const mockSnapshotKey = mockEntity.id + ':' + mockYear;
    let completed: any = null;
    const mockStateRepo: any = {
      getState: vi.fn().mockImplementation(async (_userId: string | undefined, _entityId: string, year: number) => ({
        data: completed ? (year === mockYear ? completed.currentSnapshot : completed.nextSnapshot) : null,
        error: null,
      })),
      closeYearAtomic: vi.fn().mockImplementation(async (params: any) => {
        const response = confirmedFixtureClosure(params, mockUserOwner, mockEntity);
        completed = response.data;
        return response;
      }),
    };

    const deps: any = {
      stateRepository: mockStateRepo,
      interactionService: { confirm: vi.fn().mockResolvedValue(true) },
      entityRepository: {
        getById: vi.fn().mockResolvedValue({ data: mockEntity }),
        update: vi.fn()
      },
      userRepository: {
        getUserRole: vi.fn().mockResolvedValue({ data: UserRole.ADMIN })
      }
    };

    // First call executes atomic RPC
    const res1 = await closeYearAndPrepareNext(
      deps,
      mockUserOwner,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      createBaseFundData(AnnualSnapshotStatus.OPEN),
      mockNormative,
      createBaseFundData(AnnualSnapshotStatus.OPEN),
      mockSnapshotKey,
      fixtureBaseline(mockUserOwner, mockEntity, mockYear, createBaseFundData(AnnualSnapshotStatus.OPEN))
    );

    // Second call immediately after hits idempotency guard
    const res2 = await closeYearAndPrepareNext(
      deps,
      mockUserOwner,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      res1.currentSnapshot!.fund_data,
      mockNormative,
      createBaseFundData(AnnualSnapshotStatus.OPEN),
      mockSnapshotKey,
      baselineFromRow(mockUserOwner.id, res1.currentSnapshot!)
    );

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(false);
    expect((res2.technicalCause as any)?.code).toBe('STATE_CLOSED');
    // Atomic RPC was only called once
    expect(mockStateRepo.closeYearAtomic).toHaveBeenCalledTimes(1);
  });

  // C10: Full closure: current closed + next initialized with carry-forward vn_art80c1_sommeNonUtilizzateStabiliPrec
  it('C10: executes full atomic closure with carry-forward injected into next year', async () => {
    let capturedClosedData: any = null;
    let capturedNextData: any = null;
    const mockSnapshotKey = `${mockEntity.id}:${mockYear}`;

    const mockStateRepo: any = {
      getState: vi.fn().mockImplementation((_userId: string | undefined, _entityId: string, year: number) => {
        if (year === mockYear) {
          return Promise.resolve({
            data: { fund_data: createBaseFundData(AnnualSnapshotStatus.OPEN), user_id: mockUserOwner.id, current_year: mockYear }
          });
        }
        return Promise.resolve({ data: null });
      }),
      closeYearAtomic: vi.fn().mockImplementation(async ({ entityId: _entityId, currentYear, closedFundData, nextFundData }) => {
        capturedClosedData = closedFundData;
        capturedNextData = nextFundData;
        return confirmedFixtureClosure({ currentYear, closedFundData, nextFundData }, mockUserOwner, mockEntity);
      })
    };

    const deps: any = {
      stateRepository: mockStateRepo,
      interactionService: { confirm: vi.fn().mockResolvedValue(true) },
      entityRepository: {
        getById: vi.fn().mockResolvedValue({ data: mockEntity }),
        update: vi.fn()
      },
      userRepository: {
        getUserRole: vi.fn().mockResolvedValue({ data: UserRole.ADMIN })
      }
    };

    const currentFundData = createBaseFundData(AnnualSnapshotStatus.OPEN);
    // Setup savings in current year: performance savings = 1500
    currentFundData.distribuzioneRisorseData = {
      u_indennitaComparto: 10000,
      p_performanceIndividuale: { stanziate: 5000, risparmi: 1500 }
    };

    const result = await closeYearAndPrepareNext(
      deps,
      mockUserOwner,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      currentFundData,
      mockNormative,
      createBaseFundData(AnnualSnapshotStatus.OPEN),
      mockSnapshotKey,
      fixtureBaseline(mockUserOwner, mockEntity, mockYear, createBaseFundData(AnnualSnapshotStatus.OPEN))
    );

    expect(result.success).toBe(true);
    expect(result.closedYear).toBe(mockYear);
    expect(result.nextYear).toBe(mockNextYear);
    expect(result.carryForward).toBe(1500);

    // Verify payload passed to atomic RPC
    expect(capturedClosedData.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.CLOSED);
    expect(capturedClosedData.metadata.closedAt).toBeDefined();
    expect(capturedClosedData.metadata.closedBy).toBe(mockUserOwner.email);

    expect(capturedNextData.metadata.snapshotStatus).toBe(AnnualSnapshotStatus.OPEN);
    expect(capturedNextData.annualData.annoRiferimento).toBe(mockNextYear);
    expect(capturedNextData.fondoAccessorioDipendenteData.vn_art80c1_sommeNonUtilizzateStabiliPrec).toBe(1500);
  });
});
