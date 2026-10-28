import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performFundCalculationWorkflow } from '../fundWorkflow';
import * as logic from '../../logic/index.ts';
import type { CalculationRequestContext } from '../../domain';

// Mock logic functions
vi.mock('../../logic/index.ts', () => ({
  validateFundData: vi.fn(),
  calculateFundCompletely: vi.fn(),
}));

describe('performFundCalculationWorkflow', () => {
  const mockDispatch = vi.fn();
  const mockSaveState = vi.fn();
  const mockIsRequestCurrent = vi.fn(
    (_requestContext: CalculationRequestContext): boolean => true
  );
  const mockNormativeData = { some: 'data' } as any;
  const requestContext: CalculationRequestContext = {
    entityId: 'entity-1',
    year: 2025,
    contextEpoch: 4,
    requestId: 12,
  };
  
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
    mockIsRequestCurrent.mockReturnValue(true);
  });

  it('ricalcola la vista dopo hydration senza persistere uno snapshot originale', async () => {
    (logic.validateFundData as any).mockReturnValue({});
    const result = { compliance: { checks: [] } };
    (logic.calculateFundCompletely as any).mockReturnValue(result);
    await performFundCalculationWorkflow(mockDeps, mockState, requestContext, mockDispatch,
      mockNormativeData, mockSaveState, mockIsRequestCurrent, true);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CALCULATE_FUND_SUCCESS',
      payload: { requestContext, result, checks: [] } });
    expect(mockSaveState).not.toHaveBeenCalled();
  });

  it('interrompe il calcolo se la validazione fallisce', async () => {
    // Mock validazione con errori
    (logic.validateFundData as any).mockReturnValue({ error: 'invalid' });

    await performFundCalculationWorkflow(mockDeps, mockState, requestContext, mockDispatch, mockNormativeData, mockSaveState, mockIsRequestCurrent);

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext },
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CALCULATE_FUND_VALIDATION_FAILED',
      payload: { requestContext, errors: { error: 'invalid' } }
    });
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_ERROR' }));
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_LOADING' }));
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_VALIDATION_ERRORS' }));
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    
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

    await performFundCalculationWorkflow(mockDeps, mockState, requestContext, mockDispatch, mockNormativeData, mockSaveState, mockIsRequestCurrent);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CALCULATE_FUND_START',
      payload: { requestContext },
    });
    
    expect(logic.calculateFundCompletely).toHaveBeenCalledWith(expect.objectContaining({
      annualData: expect.any(Object),
      fondi: expect.any(Object)
    }), mockNormativeData);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CALCULATE_FUND_SUCCESS',
      payload: { 
        requestContext,
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

    await performFundCalculationWorkflow(mockDeps, mockState, requestContext, mockDispatch, mockNormativeData, mockSaveState, mockIsRequestCurrent);

    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'CALCULATE_FUND_START',
      payload: { requestContext },
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CALCULATE_FUND_ERROR',
      payload: { requestContext, error: 'Errore nel calcolo: Calcolo fallito' }
    });
    
    expect(mockSaveState).not.toHaveBeenCalled();
  });

  it('non persiste request 11 se request 12 diventa current durante il calcolo', async () => {
    const request11 = { ...requestContext, requestId: 11 };
    const request12 = { ...requestContext, requestId: 12 };
    let currentRequest = request11;
    mockIsRequestCurrent.mockImplementation(candidate => candidate === currentRequest);
    (logic.validateFundData as any).mockReturnValue({});
    (logic.calculateFundCompletely as any).mockImplementation(() => {
      currentRequest = request12;
      return { compliance: { checks: [] } };
    });

    await performFundCalculationWorkflow(
      mockDeps,
      mockState,
      request11,
      mockDispatch,
      mockNormativeData,
      mockSaveState,
      mockIsRequestCurrent
    );

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CALCULATE_FUND_SUCCESS',
      payload: { requestContext: request11, result: { compliance: { checks: [] } }, checks: [] },
    });
    expect(mockSaveState).not.toHaveBeenCalled();
  });

  it('non persiste una request del vecchio epoch dopo A -> B -> A', async () => {
    const oldRequest = { ...requestContext, contextEpoch: 40, requestId: 20 };
    const returnedToARequest = { ...requestContext, contextEpoch: 42, requestId: 21 };
    let currentRequest = oldRequest;
    mockIsRequestCurrent.mockImplementation(candidate => candidate === currentRequest);
    (logic.validateFundData as any).mockReturnValue({});
    (logic.calculateFundCompletely as any).mockImplementation(() => {
      currentRequest = returnedToARequest;
      return { compliance: { checks: [] } };
    });

    await performFundCalculationWorkflow(
      mockDeps,
      mockState,
      oldRequest,
      mockDispatch,
      mockNormativeData,
      mockSaveState,
      mockIsRequestCurrent
    );

    expect(mockSaveState).not.toHaveBeenCalled();
  });
});
