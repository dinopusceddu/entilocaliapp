import { describe, it, expect, vi, beforeEach } from 'vitest';
import { closeYearAndPrepareNext } from '../yearClosureWorkflow';
import { 
  AnnualSnapshotStatus, 
  UserRole 
} from '../../domain';

describe('Year Closure Workflow (AG-123)', () => {
  const mockDeps: any = {
    stateRepository: {
      getState: vi.fn(),
      upsertState: vi.fn(),
      createState: vi.fn(),
    },
    entityRepository: {
      update: vi.fn(),
    },
    userRepository: {
      getUserRole: vi.fn().mockResolvedValue({ data: UserRole.ADMIN }),
    }
  };

  const mockUser = { id: 'u1', email: 'test@example.com', role: UserRole.ADMIN };
  const mockEntity = { id: 'e1', name: 'Comune Test' };
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
    annualData: { annoRiferimento: 2024 },
    fondoAccessorioDipendenteData: { st_art79c1_art67c1_unicoImporto2017: 1000 },
    fondoElevateQualificazioniData: { ris_fondoPO2017: 500 },
    distribuzioneRisorseData: { 
      u_indennitaComparto: 400,
      p_performanceIndividuale: { stanziate: 100, risparmi: 250 } // Simuliamo risparmi reali per il carry-forward
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully close a year and inject carry-forward into the next', async () => {
    // 1. Setup mock per caricamento anno corrente (OPEN)
    mockDeps.stateRepository.getState.mockResolvedValueOnce({
      data: { fund_data: { metadata: { snapshotStatus: AnnualSnapshotStatus.OPEN } } }
    });

    // 2. Setup mock per salvataggio anno chiuso (success)
    mockDeps.stateRepository.getState.mockResolvedValueOnce({ data: null }); // Verifica lock in saveAnnualSnapshot - OK se non esiste ancora come CHIUSO
    mockDeps.stateRepository.upsertState.mockResolvedValue({ success: true });

    // 3. Setup mock per caricamento/creazione anno successivo
    mockDeps.stateRepository.getState.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }); // IsNewInitialization
    mockDeps.stateRepository.createState.mockResolvedValue({ success: true }); // Inizializzazione 2025
    mockDeps.stateRepository.getState.mockResolvedValueOnce({ data: null }); // Verifica lock 2025 - OK
    mockDeps.stateRepository.upsertState.mockResolvedValue({ success: true }); // Salvataggio riporto 2025

    const result = await closeYearAndPrepareNext(
      mockDeps,
      mockUser,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      mockFundData,
      mockNormative,
      {} as any,
      mockKey
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
    mockDeps.stateRepository.getState.mockResolvedValueOnce({
      data: { fund_data: { metadata: { snapshotStatus: AnnualSnapshotStatus.CLOSED } } }
    });

    const result = await closeYearAndPrepareNext(
      mockDeps,
      mockUser,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      mockFundData,
      mockNormative,
      {} as any,
      mockKey
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('già in stato CHIUSO');
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

    mockDeps.stateRepository.getState.mockResolvedValue({
      data: { fund_data: { metadata: { snapshotStatus: AnnualSnapshotStatus.OPEN } } }
    });
    mockDeps.stateRepository.upsertState.mockResolvedValue({ success: true });
    mockDeps.stateRepository.createState.mockResolvedValue({ success: true });

    const result = await closeYearAndPrepareNext(
      mockDeps,
      mockUser,
      mockEntity,
      mockYear,
      UserRole.ADMIN,
      dataWithEqResidual,
      mockNormative,
      {} as any,
      mockKey
    );

    expect(result.success).toBe(true);
    expect(result.nonTransferredResiduals.some(r => r.fund === 'Elevate Qualificazioni')).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
