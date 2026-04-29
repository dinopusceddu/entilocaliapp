import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performFundCalculationWorkflow } from '../fundWorkflow';
import * as logic from '../../logic/index.ts';

// Mock logic functions
vi.mock('../../logic/index.ts', () => ({
  validateFundData: vi.fn(),
  calculateFundCompletely: vi.fn(),
}));

describe('performFundCalculationWorkflow', () => {
  const mockDispatch = vi.fn();
  const mockSaveState = vi.fn();
  const mockNormativeData = { some: 'data' } as any;
  
  const mockState = {
    fundData: { some: 'fundData' },
  } as any;

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
    }
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('interrompe il calcolo se la validazione fallisce', async () => {
    // Mock validazione con errori
    (logic.validateFundData as any).mockReturnValue({ error: 'invalid' });

    await performFundCalculationWorkflow(mockDeps, mockState, mockDispatch, mockNormativeData, mockSaveState);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_VALIDATION_ERRORS',
      payload: { error: 'invalid' }
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_ERROR', payload: undefined });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_LOADING', payload: false });
    
    // Verifica che il calcolo non sia stato avviato
    expect(logic.calculateFundCompletely).not.toHaveBeenCalled();
    expect(mockSaveState).not.toHaveBeenCalled();
  });

  it('esegue il calcolo e salva se i dati sono validi', async () => {
    // Mock validazione vuota (successo)
    (logic.validateFundData as any).mockReturnValue({});
    
    const mockCalculationResult = { 
      result: 'ok', 
      compliance: { 
        checks: [{ id: '1', message: 'ok' }] 
      } 
    };
    
    (logic.calculateFundCompletely as any).mockReturnValue(mockCalculationResult);

    await performFundCalculationWorkflow(mockDeps, mockState, mockDispatch, mockNormativeData, mockSaveState);

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CALCULATE_FUND_START' });
    
    expect(logic.calculateFundCompletely).toHaveBeenCalledWith(expect.objectContaining({
      annualData: expect.any(Object),
      fondi: expect.any(Object)
    }), mockNormativeData);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CALCULATE_FUND_SUCCESS',
      payload: { 
        result: mockCalculationResult, 
        checks: mockCalculationResult.compliance.checks 
      }
    });
    
    // Verifica l'autosave
    expect(mockSaveState).toHaveBeenCalledWith(mockDeps);
  });

  it('gestisce gli errori durante il calcolo', async () => {
    (logic.validateFundData as any).mockReturnValue({});
    (logic.calculateFundCompletely as any).mockImplementation(() => {
      throw new Error('Calcolo fallito');
    });

    await performFundCalculationWorkflow(mockDeps, mockState, mockDispatch, mockNormativeData, mockSaveState);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CALCULATE_FUND_ERROR',
      payload: 'Errore nel calcolo: Calcolo fallito'
    });
    
    expect(mockSaveState).not.toHaveBeenCalled();
  });
});
