import { AppState, AppAction, NormativeData } from '../domain';
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
  dispatch: React.Dispatch<AppAction>,
  normativeData: NormativeData | undefined,
  saveState: (deps: Pick<WorkflowDependencies, 'stateRepository' | 'entityRepository'>) => Promise<void>
) => {
  if (!normativeData) {
    return;
  }

  // 1. Validation
  const validationErrors = validateFundData(state.fundData);
  if (Object.keys(validationErrors).length > 0) {
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: validationErrors });
    dispatch({ type: 'SET_ERROR', payload: undefined });
    dispatch({ type: 'SET_LOADING', payload: false });
    return;
  }

  // 2. Calculation
  dispatch({ type: 'CALCULATE_FUND_START' });
  try {
    // Normalizzazione input: isola il motore dallo stato UI e pre-calcola grandezze derivate
    const normalizedInput = normalizeInput(state.fundData);
    
    const calculationResult = calculateFundCompletely(normalizedInput, normativeData);
    
    // 4. Update state with results
    dispatch({ 
      type: 'CALCULATE_FUND_SUCCESS', 
      payload: { 
        result: calculationResult,
        checks: calculationResult.compliance.checks 
      } 
    });
    
    // 5. Persist the updated state
    await saveState(deps);
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    dispatch({ type: 'CALCULATE_FUND_ERROR', payload: `Errore nel calcolo: ${error}` });
    console.error("Calculation error:", e);
  }
};
