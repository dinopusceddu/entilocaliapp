import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  loadEntitiesWorkflow, 
  loadAvailableYearsWorkflow,
  saveAppStateWorkflow,
  entityManagementWorkflow,
  yearManagementWorkflow
} from '../stateWorkflow';
import { UserRole } from '../../types.ts';
import { DEFAULT_CURRENT_YEAR } from '../../constants';


describe('stateWorkflow', () => {
  const mockDispatch = vi.fn();
  const mockUser = { id: 'u1', email: 'test@example.com' };
  
  const mockDeps = {
    stateRepository: {
      getState: vi.fn(),
      getAvailableYears: vi.fn(),
      createState: vi.fn(),
      upsertState: vi.fn(),
      deleteState: vi.fn(),
      deleteStatesByEntity: vi.fn(),
    },
    entityRepository: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userRepository: {
      getUserRole: vi.fn(),
    },
    interactionService: {
      alert: vi.fn(),
      confirm: vi.fn(),
      reload: vi.fn(),
    }
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockDeps.interactionService.confirm.mockResolvedValue(true);
  });

  describe('loadEntitiesWorkflow', () => {
    it('carica le entità per un utente non-ADMIN (filtra per user_id)', async () => {
      const mockData = [{ id: 'e1', name: 'Ente 1' }];
      mockDeps.entityRepository.getAll.mockResolvedValue({ data: mockData, error: null });

      await loadEntitiesWorkflow(mockDeps, mockUser, mockDispatch);

      expect(mockDeps.entityRepository.getAll).toHaveBeenCalledWith(mockUser.id);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_ENTITIES', payload: mockData });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_CURRENT_ENTITY', payload: mockData[0] });
    });

    it('carica tutte le entità per un utente ADMIN (non filtra per user_id)', async () => {
      const mockData = [{ id: 'e1', name: 'Ente 1' }, { id: 'e2', name: 'Ente 2' }];
      const adminUser = { id: 'admin1', email: 'admin@test.it', role: UserRole.ADMIN };
      mockDeps.entityRepository.getAll.mockResolvedValue({ data: mockData, error: null });

      await loadEntitiesWorkflow(mockDeps, adminUser, mockDispatch);

      expect(mockDeps.entityRepository.getAll).toHaveBeenCalledWith(undefined);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_ENTITIES', payload: mockData });
    });

    it('ignora fl_last_context con anno futuro spurio 2030 e mantiene il contesto DEFAULT_CURRENT_YEAR', async () => {
      const mockData = [{ id: 'e1', name: 'Ente 1' }];
      localStorage.setItem('fl_last_context_u1', JSON.stringify({ entityId: 'e1', year: 2030 }));
      mockDeps.entityRepository.getAll.mockResolvedValue({ data: mockData, error: null });

      const ctx = await loadEntitiesWorkflow(mockDeps, mockUser, mockDispatch);

      expect(ctx).toEqual({ entity: mockData[0], year: DEFAULT_CURRENT_YEAR });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_CURRENT_YEAR', payload: DEFAULT_CURRENT_YEAR });
    });

    it('ignora fl_last_year 2030 legacy e seleziona l annualita DEFAULT_CURRENT_YEAR', async () => {
      const mockData = [{ id: 'e1', name: 'Ente 1' }];
      localStorage.setItem('fl_last_entity_id', 'e1');
      localStorage.setItem('fl_last_year', '2030');
      mockDeps.entityRepository.getAll.mockResolvedValue({ data: mockData, error: null });

      const ctx = await loadEntitiesWorkflow(mockDeps, mockUser, mockDispatch);

      expect(ctx).toEqual({ entity: mockData[0], year: DEFAULT_CURRENT_YEAR });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_CURRENT_YEAR', payload: DEFAULT_CURRENT_YEAR });
    });
  });

  describe('loadAvailableYearsWorkflow', () => {
    it('carica gli anni disponibili per un utente non-ADMIN (filtra per user_id)', async () => {
      const setAvailableYears = vi.fn();
      mockDeps.stateRepository.getAvailableYears.mockResolvedValue({ 
        data: [{ current_year: 2024 }, { current_year: 2023 }], 
        error: null 
      });

      await loadAvailableYearsWorkflow(mockDeps, mockUser, 'e1', setAvailableYears);

      expect(mockDeps.stateRepository.getAvailableYears).toHaveBeenCalledWith(mockUser.id, 'e1');
      expect(setAvailableYears).toHaveBeenCalledWith([2024, 2023]);
    });

    it('carica gli anni disponibili per un utente ADMIN (non filtra per user_id)', async () => {
      const setAvailableYears = vi.fn();
      const adminUser = { id: 'admin1', email: 'admin@test.it', role: UserRole.ADMIN };
      mockDeps.stateRepository.getAvailableYears.mockResolvedValue({ 
        data: [{ current_year: 2024 }], 
        error: null 
      });

      await loadAvailableYearsWorkflow(mockDeps, adminUser, 'e1', setAvailableYears);

      expect(mockDeps.stateRepository.getAvailableYears).toHaveBeenCalledWith(undefined, 'e1');
      expect(setAvailableYears).toHaveBeenCalledWith([2024]);
    });
  });



  describe('saveAppStateWorkflow', () => {
    it('salva lo stato con upsert', async () => {
      const mockLoadYears = vi.fn();
      mockDeps.stateRepository.upsertState.mockResolvedValue({ error: null });

      const mockFundData = { annualData: { denominazioneEnte: 'E' } };
      await saveAppStateWorkflow(mockDeps, mockUser, { id: 'e1', name: 'E' }, 2024, UserRole.ADMIN, mockFundData, mockLoadYears);

      expect(mockDeps.stateRepository.upsertState).toHaveBeenCalled();
      expect(mockLoadYears).toHaveBeenCalled();
    });
  });

  describe('entityManagementWorkflow', () => {
    it('crea un ente e ricarica elenco', async () => {
      const mockLoadEntities = vi.fn();
      const newEntity = { id: 'new', name: 'New Ente' };

      mockDeps.entityRepository.create.mockResolvedValue({ data: newEntity, error: null });

      await entityManagementWorkflow.create(mockDeps, mockUser, 'New Ente', mockLoadEntities, mockDispatch);

      expect(mockDeps.entityRepository.create).toHaveBeenCalledWith('New Ente', mockUser.id);
      expect(mockLoadEntities).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_CURRENT_ENTITY', payload: newEntity });
    });

    it('elimina un ente dopo conferma', async () => {
      const mockLoadEntities = vi.fn();
      const mockEntities = [{ id: 'e1' }, { id: 'e2' }];

      mockDeps.interactionService.confirm.mockResolvedValue(true);
      mockDeps.stateRepository.deleteStatesByEntity.mockResolvedValue({ error: null });
      mockDeps.entityRepository.delete.mockResolvedValue({ error: null });

      await entityManagementWorkflow.delete(mockDeps, mockUser, 'e1', { id: 'e1' }, mockEntities, mockLoadEntities, mockDispatch);

      expect(mockDeps.interactionService.confirm).toHaveBeenCalled();
      expect(mockDeps.stateRepository.deleteStatesByEntity).toHaveBeenCalledWith('e1');
      expect(mockDeps.entityRepository.delete).toHaveBeenCalledWith('e1');
      expect(mockLoadEntities).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_CURRENT_ENTITY', payload: { id: 'e2' } });
    });
  });

  describe('yearManagementWorkflow', () => {
    it('elimina un anno dopo conferma', async () => {
      const mockLoadAvailableYears = vi.fn();
      mockDeps.interactionService.confirm.mockResolvedValue(true);
      mockDeps.stateRepository.deleteState.mockResolvedValue({ error: null });

      await yearManagementWorkflow.delete(mockDeps, mockUser, 'e1', 2024, 2024, [2024, 2023], mockLoadAvailableYears, mockDispatch);

      expect(mockDeps.interactionService.confirm).toHaveBeenCalled();
      expect(mockDeps.stateRepository.deleteState).toHaveBeenCalledWith('e1', 2024);
      expect(mockLoadAvailableYears).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_CURRENT_YEAR', payload: 2023 });
    });
  });
});
