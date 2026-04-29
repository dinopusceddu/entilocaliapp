import React from 'react';
import { 
  User,
  Entity,
  FundData, 
  CalculationResult,
  NormativeData,
  UserRole, 
  NavigationScope 
} from './index';

export interface ComplianceCheck {
  id: string;
  descrizione: string;
  isCompliant: boolean;
  valoreAttuale?: string | number;
  limite?: string | number;
  messaggio: string;
  riferimentoNormativo: string;
  gravita: 'info' | 'warning' | 'error';
  relatedPage?: string;
  gruppo?: string;
}

export interface PageModule {
  id: string;
  name: string;
  component: React.FC;
  scope: NavigationScope;
  icon?: any;
}

export interface AppState {
  currentUser: User;
  contextRole?: UserRole;
  currentYear: number;
  entities: Entity[];
  currentEntity?: Entity;
  fundData: FundData;
  calculationResult?: CalculationResult;
  complianceChecks: ComplianceCheck[];
  isLoading: boolean;
  isNormativeDataLoading: boolean;
  normativeData?: NormativeData;
  error?: string;
  validationErrors: Record<string, string>;
  activeTab: string;
  navigationScope: NavigationScope;
  selectedArticleId?: string;
  selectedSchedaId?: string;
  selectedParereId?: string;
  isYearSwitching?: boolean;
  lastYearSwitchError?: string;
  hydratedSnapshotKey?: string | null;
}


export type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_CURRENT_YEAR'; payload: number }
  | { type: 'SET_NAVIGATION_SCOPE'; payload: NavigationScope }
  | { type: 'UPDATE_HISTORICAL_DATA'; payload: any }
  | { type: 'UPDATE_ANNUAL_DATA'; payload: any }
  | { type: 'ADD_PROVENTO_SPECIFICO'; payload: any }
  | { type: 'UPDATE_PROVENTO_SPECIFICO'; payload: { index: number; provento: any } }
  | { type: 'REMOVE_PROVENTO_SPECIFICO'; payload: number }
  | { type: 'CALCULATE_FUND_START' }
  | { type: 'CALCULATE_FUND_SUCCESS'; payload: { result: CalculationResult; checks: ComplianceCheck[] } }
  | { type: 'CALCULATE_FUND_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NORMATIVE_DATA_LOADING'; payload: boolean }
  | { type: 'SET_NORMATIVE_DATA'; payload: NormativeData }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_VALIDATION_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'ADD_ART23_EMPLOYEE_DETAIL'; payload: { yearType: '2018' | 'annoRif'; detail: any } }
  | { type: 'UPDATE_ART23_EMPLOYEE_DETAIL'; payload: { yearType: '2018' | 'annoRif'; detail: any } }
  | { type: 'REMOVE_ART23_EMPLOYEE_DETAIL'; payload: { yearType: '2018' | 'annoRif'; id: string } }
  | { type: 'ADD_PERSONALE_SERVIZIO_DETTAGLIO'; payload: any }
  | { type: 'UPDATE_PERSONALE_SERVIZIO_DETTAGLIO'; payload: { id: string; changes: any } }
  | { type: 'REMOVE_PERSONALE_SERVIZIO_DETTAGLIO'; payload: { id: string } }
  | { type: 'SET_PERSONALE_SERVIZIO_DETTAGLI'; payload: any[] }
  | { type: 'UPDATE_PERSONALE_SERVIZIO_MANUAL_MODE'; payload: { isManualMode: boolean; manualProgressioni?: number; manualIndennita?: number } }
  | { type: 'UPDATE_SIMULATORE_INPUT'; payload: any }
  | { type: 'UPDATE_SIMULATORE_RISULTATI'; payload: any | undefined }
  | { type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA'; payload: any }
  | { type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA'; payload: any }
  | { type: 'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA'; payload: any }
  | { type: 'UPDATE_FONDO_DIRIGENZA_DATA'; payload: any }
  | { type: 'UPDATE_CALCOLATO_INCREMENTO_PNRR3'; payload: number | undefined }
  | { type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA'; payload: any }
  | { type: 'UPDATE_EMPLOYEE_COUNT'; payload: { category: any; count?: number } }
  | { type: 'LOAD_STATE_FROM_DB'; payload: Partial<AppState> }
  | { type: 'SET_ENTITIES'; payload: Entity[] }
  | { type: 'SET_CURRENT_ENTITY'; payload: Entity }
  | { type: 'UPDATE_ENTITY_NAME'; payload: string }
  | { type: 'SET_SELECTED_ARTICLE'; payload: string | undefined }
  | { type: 'SET_SELECTED_SCHEDA'; payload: string | undefined }
  | { type: 'SET_SELECTED_PARERE_ARAN'; payload: string | undefined }
  | { type: 'IMPORT_FUND_DATA'; payload: any }
  | { type: 'SET_YEAR_SWITCHING'; payload: boolean }
  | { type: 'SET_YEAR_SWITCH_ERROR'; payload: string | undefined };

