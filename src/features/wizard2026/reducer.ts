import { Wizard2026Check } from '../../logic/wizard2026';
import {
  Wizard2026DraftState,
  Wizard2026EnteStepState,
  Wizard2026Art23StepState,
  Wizard2026Dl25StepState,
  Wizard2026Ccnl2026StepState,
  Wizard2026ConglobamentoArt60StepState,
  Wizard2026StraordinarioStepState,
  Wizard2026PnrrStepState,
} from './types';
import { initialWizard2026DraftState } from './initialState';

export type Wizard2026StepKey =
  | 'ente'
  | 'art23'
  | 'dl25'
  | 'ccnl2026'
  | 'conglobamentoArt60'
  | 'straordinario'
  | 'pnrr'
  | 'riepilogo';

export type Wizard2026Action =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'UPDATE_ENTE_STEP'; payload: Partial<Wizard2026EnteStepState> }
  | { type: 'UPDATE_ART23_STEP'; payload: Partial<Wizard2026Art23StepState> }
  | { type: 'UPDATE_DL25_STEP'; payload: Partial<Wizard2026Dl25StepState> }
  | { type: 'UPDATE_CCNL2026_STEP'; payload: Partial<Wizard2026Ccnl2026StepState> }
  | { type: 'UPDATE_CONGLOBAMENTO_ART60_STEP'; payload: Partial<Wizard2026ConglobamentoArt60StepState> }
  | { type: 'UPDATE_STRAORDINARIO_STEP'; payload: Partial<Wizard2026StraordinarioStepState> }
  | { type: 'UPDATE_PNRR_STEP'; payload: Partial<Wizard2026PnrrStepState> }
  | { type: 'SET_STEP_RESULT'; payload: { step: Wizard2026StepKey; result: any } }
  | { type: 'SET_STEP_CHECKS'; payload: { step: Wizard2026StepKey; checks: Wizard2026Check[] } }
  | { type: 'IMPORT_EXCEL_DATA'; payload: Partial<Wizard2026DraftState> }
  | { type: 'RESTORE_WIZARD_2026'; payload: Wizard2026DraftState }
  | { type: 'RESET_WIZARD_2026' };

export function wizard2026Reducer(state: Wizard2026DraftState = initialWizard2026DraftState, action: Wizard2026Action): Wizard2026DraftState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        meta: {
          ...state.meta,
          currentStep: action.payload,
        },
      };

    case 'MARK_STEP_COMPLETED': {
      const step = action.payload;
      const completedSteps = state.meta.completedSteps.includes(step)
        ? state.meta.completedSteps
        : [...state.meta.completedSteps, step];
      return {
        ...state,
        meta: {
          ...state.meta,
          completedSteps,
        },
      };
    }

    case 'UPDATE_ENTE_STEP':
      return {
        ...state,
        ente: {
          ...state.ente,
          ...action.payload,
        },
      };

    case 'UPDATE_ART23_STEP':
      return {
        ...state,
        art23: {
          ...state.art23,
          ...action.payload,
        },
      };

    case 'UPDATE_DL25_STEP':
      return {
        ...state,
        dl25: {
          ...state.dl25,
          ...action.payload,
        },
      };

    case 'UPDATE_CCNL2026_STEP':
      return {
        ...state,
        ccnl2026: {
          ...state.ccnl2026,
          ...action.payload,
        },
      };

    case 'UPDATE_CONGLOBAMENTO_ART60_STEP':
      return {
        ...state,
        conglobamentoArt60: {
          ...state.conglobamentoArt60,
          ...action.payload,
          personaleInteroArea: {
            ...state.conglobamentoArt60.personaleInteroArea,
            ...(action.payload.personaleInteroArea || {}),
          },
          ftePerArea: {
            ...state.conglobamentoArt60.ftePerArea,
            ...(action.payload.ftePerArea || {}),
          },
        },
      };

    case 'UPDATE_STRAORDINARIO_STEP':
      return {
        ...state,
        straordinario: {
          ...state.straordinario,
          ...action.payload,
        },
      };

    case 'UPDATE_PNRR_STEP':
      return {
        ...state,
        pnrr: {
          ...state.pnrr,
          ...action.payload,
        },
      };

    case 'SET_STEP_RESULT': {
      const { step, result } = action.payload;
      if (step === 'conglobamentoArt60') {
        const is2026 = state.ente.annoRiferimento === 2026;
        return {
          ...state,
          conglobamentoArt60: {
            ...state.conglobamentoArt60,
            result,
            ftePerArea: result.ftePerArea,
            ...(is2026 ? { valoreConsolidato2026: result.riduzioneTotale } : {}),
          },
        };
      }
      return {
        ...state,
        [step]: {
          ...(state[step] as any),
          result,
        },
      };
    }

    case 'SET_STEP_CHECKS': {
      const { step, checks } = action.payload;
      return {
        ...state,
        [step]: {
          ...(state[step] as any),
          checks,
        },
      };
    }

    case 'IMPORT_EXCEL_DATA':
      return {
        ...state,
        ente: {
          ...state.ente,
          ...(action.payload.ente || {}),
        },
        art23: {
          ...state.art23,
          ...(action.payload.art23 || {}),
          personale2018Art23: action.payload.art23?.personale2018Art23 !== undefined 
            ? action.payload.art23.personale2018Art23 
            : state.art23.personale2018Art23,
          personale2026Art23: action.payload.art23?.personale2026Art23 !== undefined 
            ? action.payload.art23.personale2026Art23 
            : state.art23.personale2026Art23,
        },
        dl25: {
          ...state.dl25,
          ...(action.payload.dl25 || {}),
          quoteAderenti: action.payload.dl25?.quoteAderenti !== undefined
            ? action.payload.dl25.quoteAderenti
            : state.dl25.quoteAderenti,
        },
        ccnl2026: {
          ...state.ccnl2026,
          ...(action.payload.ccnl2026 || {}),
        },
        conglobamentoArt60: {
          ...state.conglobamentoArt60,
          ...(action.payload.conglobamentoArt60 || {}),
          personaleInteroArea: {
            ...state.conglobamentoArt60.personaleInteroArea,
            ...(action.payload.conglobamentoArt60?.personaleInteroArea || {}),
          },
          ftePerArea: {
            ...state.conglobamentoArt60.ftePerArea,
            ...(action.payload.conglobamentoArt60?.ftePerArea || {}),
          },
          partTimeNativi: action.payload.conglobamentoArt60?.partTimeNativi !== undefined
            ? action.payload.conglobamentoArt60.partTimeNativi
            : state.conglobamentoArt60.partTimeNativi,
        },
        straordinario: {
          ...state.straordinario,
          ...(action.payload.straordinario || {}),
          risorseEscluse: action.payload.straordinario?.risorseEscluse !== undefined
            ? action.payload.straordinario.risorseEscluse
            : state.straordinario.risorseEscluse,
        },
        pnrr: {
          ...state.pnrr,
          ...(action.payload.pnrr || {}),
        },
      };

    case 'RESTORE_WIZARD_2026':
      return action.payload;

    case 'RESET_WIZARD_2026':
      return initialWizard2026DraftState;

    default:
      return state;
  }
}
