import { Wizard2026DraftState } from '../types';

export type Wizard2026LetterMode = 'FULL' | 'MISSING_ONLY' | 'CURRENT_STEP';

export type Wizard2026LetterFieldStatus = 'PRESENTE' | 'MANCANTE' | 'DA_VERIFICARE' | 'NON_APPLICABILE';

export interface Wizard2026CatalogItem {
  stepId: number;
  stepTitle: string;
  field: string;
  label: string;
  descrizione: string;
  norma: string;
  percheServe: string;
  obbligatorieta: 'OBBLIGATORIO' | 'CONDIZIONALE' | 'OPZIONALE';
  destinatarioSuggerito: 'Ufficio Personale' | 'Ufficio Ragioneria' | 'Entrambi';
  includeWhen?: (state: Wizard2026DraftState) => boolean;
}

export interface Wizard2026LetterFieldInfo {
  catalogItem: Wizard2026CatalogItem;
  status: Wizard2026LetterFieldStatus;
  valueString: string;
  currentValue: any;
}

export interface Wizard2026LetterSection {
  stepId: number;
  stepTitle: string;
  fields: Wizard2026LetterFieldInfo[];
}

export interface Wizard2026LetterContext {
  ente: {
    denominazione: string;
    tipologia: string;
    hasDirigenza?: boolean;
    isDissesto?: boolean;
    isStrutturalmenteDeficitario?: boolean;
    isPianoRiequilibrio?: boolean;
  };
  annoRiferimento: number;
  dataGenerazione: string;
  destinatario: string;
  firmatario: string;
  organizzazione: string;
  termineRisposta: string;
  note?: string;
  mode: Wizard2026LetterMode;
  currentStep?: number;
  sections: Wizard2026LetterSection[];
  allFields: Wizard2026LetterFieldInfo[];
}
