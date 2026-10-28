import { fixtureBaseline, confirmedFixtureClosure } from '../../test/fixtures/b1Persistence';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { closeYearAndPrepareNext } from '../yearClosureWorkflow';
import { 
  AnnualSnapshotStatus, 
  UserRole,
  TipologiaEnte
} from '../../domain';

describe('Year Closure Workflow (AG-123)', () => {
  const mockDeps: any = {
    stateRepository: {
      getState: vi.fn(),
      upsertState: vi.fn(),
      createState: vi.fn(),
      closeYearAtomic: vi.fn(),
    },
    interactionService: { confirm: vi.fn().mockResolvedValue(true) },
    entityRepository: {
      update: vi.fn(),
    },
    userRepository: {
      getUserRole: vi.fn().mockResolvedValue({ data: UserRole.ADMIN }),
    }
  };

  const mockUser = { id: 'u1', email: 'test@example.com', role: UserRole.ADMIN };
  const mockEntity = { id: 'e1', name: 'Comune Test', user_id: mockUser.id };
  const mockYear = 2024;
  const mockKey = 'e1:2024';

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
  
  const mockFundData: any = {
    metadata: { snapshotStatus: AnnualSnapshotStatus.OPEN },
    annualData: { 
      annoRiferimento: 2024,
      tipologiaEnte: TipologiaEnte.COMUNE,
    },
    fondoAccessorioDipendenteData: { st_art79c1_art67c1_unicoImporto2017: 1000 },
    fondoElevateQualificazioniData: { ris_fondoPO2017: 500 },
    distribuzioneRisorseData: { 
      u_indennitaComparto: 400,
      p_performanceIndividuale: { stanziate: 100, risparmi: 250 } // Simuliamo risparmi reali per il carry-forward
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockDeps.userRepository.getUserRole.mockResolvedValue({ data: UserRole.ADMIN, error: null });
    mockDeps.stateRepository.getState.mockResolvedValue({ data: null, error: null });
    mockDeps.interactionService.confirm.mockResolvedValue(true);
    mockDeps.stateRepository.closeYearAtomic.mockImplementation((p: any) => confirmedFixtureClosure(p, mockUser, mockEntity));
  });

  it('should successfully close a year and inject carry-forward into the next', async () => {
    // B1 captures current baseline; only the target is read before atomic closure.
    const result = await closeYearAndPrepareNext(
      mockDeps,
      mockUser,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      mockFundData,
      mockNormative,
      {} as any,
      mockKey,
      fixtureBaseline(mockUser, mockEntity, mockYear, mockFundData)
    );

    expect(result.success).toBe(true);
    expect(result.closedYear).toBe(2024);
    expect(result.nextYear).toBe(2025);
    // Residuo FAD: 1000 (stabile) - 400 (utilità) = 600
    // Nota: depends on calculation engine mock or real engine. 
    // Il calcolo reale restituirà un valore basato sui dati passati.
    expect(result.carryForward).toBeGreaterThan(0);
  });

  it('should block closure if the snapshot is already CLOSED', async () => {
    const result = await closeYearAndPrepareNext(
      mockDeps,
      mockUser,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      mockFundData,
      mockNormative,
      {} as any,
      mockKey,
      fixtureBaseline(mockUser, mockEntity, mockYear, { ...mockFundData, metadata: { snapshotStatus: AnnualSnapshotStatus.CLOSED } })
    );

    expect(result.success).toBe(false);
    expect((result.technicalCause as any)?.code).toBe('STATE_CLOSED');
    expect(mockDeps.stateRepository.closeYearAtomic).not.toHaveBeenCalled();
  });

  it('should block closure if the hydratedSnapshotKey is mismatched', async () => {
    const result = await closeYearAndPrepareNext(
      mockDeps,
      mockUser,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      mockFundData,
      mockNormative,
      {} as any,
      'WRONG_KEY'
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Errore di sincronizzazione');
  });

  it('should report residuals for other funds as warnings but not transfer them', async () => {
    // Rendiamo EQ orizzontale per triggerare residuo
    const dataWithEqResidual = {
      ...mockFundData,
      fondoElevateQualificazioniData: { ris_fondoPO2017: 5000 },
      // Nessun utilizzo per EQ definito in mockFundData
    };

    const result = await closeYearAndPrepareNext(
      mockDeps,
      mockUser,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      dataWithEqResidual,
      mockNormative,
      {} as any,
      mockKey,
      fixtureBaseline(mockUser, mockEntity, mockYear, mockFundData)
    );

    expect(result.success).toBe(true);
    expect(result.nonTransferredResiduals.some(r => r.fund === 'Elevate Qualificazioni')).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('fallisce la chiusura dell anno e blocca il salvataggio se i dati analitici FTE contengono valori non validi (cedolini = 0)', async () => {
    mockDeps.stateRepository.getState.mockResolvedValueOnce({
      data: { fund_data: { metadata: { snapshotStatus: AnnualSnapshotStatus.OPEN } } }
    });

    const invalidFundData = {
      ...mockFundData,
      annualData: {
        ...mockFundData.annualData,
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.COMUNE,
        isArt23FteManualMode: false,
        personaleAnnoRifPerArt23: [
          { id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 0 }
        ],
      },
    };

    const result = await closeYearAndPrepareNext(
      mockDeps,
      mockUser,
      mockEntity,
      2026,
      UserRole.ADMIN,
      invalidFundData,
      mockNormative,
      {} as any,
      'e1:2026',
      fixtureBaseline(mockUser, mockEntity, 2026, invalidFundData)
    );

    expect(result.success).toBe(false);
    expect((result.technicalCause as any)?.message).toContain('Calcolo bloccato: i dati FTE Art. 23 contengono valori non validi');
    expect(mockDeps.stateRepository.closeYearAtomic).not.toHaveBeenCalled();
    expect(mockDeps.stateRepository.createState).not.toHaveBeenCalled();
    expect(mockDeps.stateRepository.upsertState).not.toHaveBeenCalled();
  });
  it.each([
    { status: 'CLOSED', version: null, code: 'STATE_VERSION_REQUIRED' },
    { status: 'CLOSED', version: '11111111-1111-4111-8111-111111111111', code: 'STATE_CLOSED' },
    { status: 'OPEN', version: null, code: 'STATE_VERSION_REQUIRED' },
  ])('RBR6 guard precedence $status version=$version denies with $code before I/O', async ({ status, version, code }) => {
    const data = { ...mockFundData, metadata: { snapshotStatus: status } };
    const baseline = fixtureBaseline(mockUser, mockEntity, mockYear, data, { b1i4_version: version });
    const result = await closeYearAndPrepareNext(mockDeps, mockUser, mockEntity, mockYear,
      UserRole.ADMIN, data, mockNormative, {} as any, mockKey, baseline);
    expect(result.success).toBe(false);
    expect((result.technicalCause as any)?.code).toBe(code);
    expect(mockDeps.stateRepository.getState).not.toHaveBeenCalled();
    expect(mockDeps.stateRepository.closeYearAtomic).not.toHaveBeenCalled();
    expect(mockDeps.stateRepository.upsertState).not.toHaveBeenCalled();
    expect(mockDeps.stateRepository.createState).not.toHaveBeenCalled();
  });

});
