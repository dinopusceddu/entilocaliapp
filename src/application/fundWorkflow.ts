import { AppState, AppAction, CalculationRequestContext, NormativeData } from '../domain';
import { 
  calculateFundCompletely, 
  validateFundData
} from '../logic';
import { normalizeInput } from './input/inputNormalizer';
import { WorkflowDependencies } from './ports';

/**
 * Workflow for calculating the fund and running compliance checks.
 * This function orchestrates the application logic for the "Calculation" use case.
 */
export const performFundCalculationWorkflow = async (
  deps: Pick<WorkflowDependencies, 'stateRepository' | 'entityRepository'>,
  state: AppState,
  requestContext: CalculationRequestContext,
  dispatch: React.Dispatch<AppAction>,
  normativeData: NormativeData | undefined,
  saveState: (deps: Pick<WorkflowDependencies, 'stateRepository' | 'entityRepository'>) => Promise<any>,
  isRequestCurrent: (requestContext: CalculationRequestContext) => boolean,
  skipPersistence?: boolean
) => {
  if (!normativeData) {
    return;
  }

  dispatch({ type: 'CALCULATE_FUND_START', payload: { requestContext } });
  if (!isRequestCurrent(requestContext)) {
    return;
  }

  // 1. Validation
  const validationErrors = validateFundData(state.fundData);
  if (Object.keys(validationErrors).length > 0) {
    dispatch({
      type: 'CALCULATE_FUND_VALIDATION_FAILED',
      payload: { requestContext, errors: validationErrors }
    });
    return;
  }

  // 2. Calculation
  try {
    // Normalizzazione input: isola il motore dallo stato UI e pre-calcola grandezze derivate
    const normalizedInput = normalizeInput(state.fundData);
    
    const calculationResult = calculateFundCompletely(normalizedInput, normativeData);
    
    // 4. Update state with results
    dispatch({ 
      type: 'CALCULATE_FUND_SUCCESS', 
      payload: { 
        requestContext,
        result: calculationResult,
        checks: calculationResult.compliance.checks 
      } 
    });
    
    // 5. Persist the updated state (skipped in local-only calculation mode)
    if (!skipPersistence && isRequestCurrent(requestContext)) {
      await saveState(deps);
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    dispatch({
      type: 'CALCULATE_FUND_ERROR',
      payload: { requestContext, error: `Errore nel calcolo: ${error}` }
    });
    console.error("Calculation error:", e);
  }
};
