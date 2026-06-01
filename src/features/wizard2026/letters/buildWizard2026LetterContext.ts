import { Wizard2026DraftState } from '../types';
import {
  Wizard2026LetterContext,
  Wizard2026LetterFieldInfo,
  Wizard2026LetterSection,
  Wizard2026LetterMode,
  Wizard2026LetterFieldStatus
} from './wizard2026LetterTypes';
import { wizard2026LetterCatalog } from './wizard2026LetterCatalog';
import { wizard2026ExcelSchema } from '../excel/wizard2026ExcelSchema';

export interface BuildContextOptions {
  mode: Wizard2026LetterMode;
  currentStep?: number;
  destinatario?: string;
  firmatario?: string;
  organizzazione?: string;
  termineRisposta?: string;
  note?: string;
  dataLettera?: string;
}

// Helper per estrarre valori annidati dallo stato
const getValueByPath = (state: any, path: string): any => {
  const parts = path.split('.');
  let current = state;
  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[part];
  }
  return current;
};

// Helper per formattare i valori in modo non tecnico
const formatFieldValue = (field: string, val: any): string => {
  if (val === undefined || val === null || (typeof val === 'number' && isNaN(val))) {
    return 'Da richiedere';
  }

  if (typeof val === 'boolean') {
    return val ? 'Sì' : 'No';
  }

  if (typeof val === 'number') {
    // 1. Percentuali
    if (field.toLowerCase().includes('percentuale')) {
      return `${val.toLocaleString('it-IT')}%`;
    }
    // 2. Headcounts / FTEs / Population
    // 2. Headcounts / FTEs / Population
    const isHeadcountField = (
      (field.toLowerCase().includes('personale') || field.toLowerCase().includes('dipendenti')) &&
      !(
        field.toLowerCase().includes('fondo') ||
        field.toLowerCase().includes('limite') ||
        field.toLowerCase().includes('spesa') ||
        field.toLowerCase().includes('risorse') ||
        field.toLowerCase().includes('componente')
      )
    ) ||
    field.toLowerCase().includes('piao') ||
    field.toLowerCase().includes('fte') ||
    field.toLowerCase().includes('indeterminato') ||
    field.toLowerCase().includes('determinato') ||
    field.toLowerCase().includes('assunzioni') ||
    field.toLowerCase().includes('cessazioni') ||
    field.toLowerCase().includes('servizio') ||
    field === 'dl25.popolazioneEnte';

    if (isHeadcountField) {
      return val.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
    }
    // 3. Years
    if (field === 'ente.annoRiferimento' || field === 'annoRiferimento') {
      return val.toString();
    }
    // 4. Default: Currency
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
  }

  return String(val);
};

// Helper per la ricerca dinamica dell'etichetta e della nota dall'Excel Schema
const getExcelFieldSchema = (key: string) => {
  for (const sheet of wizard2026ExcelSchema) {
    const found = sheet.fields.find(f => f.key === key);
    if (found) return found;
  }
  // Match parziale o case-insensitive per robustezza
  for (const sheet of wizard2026ExcelSchema) {
    const found = sheet.fields.find(f => f.key.toLowerCase() === key.toLowerCase());
    if (found) return found;
  }
  return undefined;
};

// Adatta il testo all'anno di riferimento sostituendo 2025 con "dell'anno precedente"
const adaptTextToYear = (text: string, annoRiferimento: number): string => {
  if (!text) return text;
  const annoPrecedente = annoRiferimento - 1;
  if (annoRiferimento === 2026) {
    return text.replace(/\b2025\b/g, "dell'anno precedente (2025 per istruttoria 2026)");
  } else {
    return text.replace(/\b2025\b/g, `dell'anno precedente (${annoPrecedente})`);
  }
};

// Adatta l'etichetta del dato
const adaptLabel = (label: string, _key: string, annoRiferimento: number): string => {
  let res = label;
  const annoPrecedente = annoRiferimento - 1;
  if (res.toLowerCase().includes("anno precedente") && !res.toLowerCase().includes("per istruttoria")) {
    if (annoRiferimento === 2026) {
      res = `${res} (2025 per istruttoria 2026)`;
    } else {
      res = `${res} (${annoPrecedente})`;
    }
  }
  return adaptTextToYear(res, annoRiferimento);
};

export const buildWizard2026LetterContext = (
  state: Wizard2026DraftState,
  options: BuildContextOptions
): Wizard2026LetterContext => {
  const {
    mode,
    currentStep,
    destinatario = '[Ufficio Personale / Ufficio Ragioneria]',
    firmatario = '[Nome Rappresentante FP CGIL]',
    organizzazione = 'FP CGIL Lombardia',
    termineRisposta = '[Termine Risposta, es. 15 giorni]',
    note = '',
    dataLettera
  } = options;

  const resolvedDate = dataLettera || new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const denominazioneEnte = state.ente.denominazioneEnte || '[DENOMINAZIONE ENTE]';
  const hasDirigenza = state.ente.hasDirigenza;

  // Raccogliamo tutte le anomalie (checks) dello stato per verificare se ci sono warning/error
  const allChecks = [
    ...(state.art23.checks || []),
    ...(state.dl25.checks || []),
    ...(state.ccnl2026.checks || []),
    ...(state.conglobamentoArt60.checks || []),
    ...(state.straordinario.checks || []),
    ...(state.pnrr.checks || [])
  ];

  const annoRiferimento = state.ente.annoRiferimento || 2026;

  // Elaboriamo ciascun campo del catalogo
  const allFields: Wizard2026LetterFieldInfo[] = wizard2026LetterCatalog.map(item => {
    const isApplicable = item.includeWhen ? item.includeWhen(state) : true;

    // Create a dynamic catalogItem copy to update labels and descriptions with dynamic year
    const catalogItemCopy = { ...item };
    const excelField = getExcelFieldSchema(item.field);

    if (excelField) {
      catalogItemCopy.label = adaptLabel(excelField.label, item.field, annoRiferimento);
      catalogItemCopy.descrizione = adaptTextToYear(excelField.note || item.descrizione, annoRiferimento);
    } else {
      catalogItemCopy.label = adaptLabel(item.label, item.field, annoRiferimento);
      catalogItemCopy.descrizione = adaptTextToYear(item.descrizione, annoRiferimento);
    }
    catalogItemCopy.percheServe = adaptTextToYear(item.percheServe, annoRiferimento);

    if (!isApplicable) {
      return {
        catalogItem: catalogItemCopy,
        status: 'NON_APPLICABILE' as Wizard2026LetterFieldStatus,
        valueString: 'Non applicabile per questo Ente',
        currentValue: undefined
      };
    }

    const value = getValueByPath(state, item.field);

    // Regola: booleani e zeri sono PRESENTE. undefined, null, stringa vuota, NaN sono MANCANTE.
    const isMissing =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (typeof value === 'number' && isNaN(value));

    let status: Wizard2026LetterFieldStatus = isMissing ? 'MANCANTE' : 'PRESENTE';

    // Se il dato è valorizzato, controlliamo se ha anomalie associate (warning/error)
    if (!isMissing) {
      const fieldShortName = item.field.split('.').pop();
      const hasAnomaly = allChecks.some(c => c.field === fieldShortName || c.field === item.field);
      if (hasAnomaly) {
        status = 'DA_VERIFICARE';
      }
    }

    return {
      catalogItem: catalogItemCopy,
      status,
      valueString: status === 'MANCANTE' ? 'Da richiedere' : formatFieldValue(item.field, value),
      currentValue: value
    };
  });

  // Filtriamo i campi in base alla modalità
  let filteredFields = allFields;

  if (mode === 'MISSING_ONLY') {
    // Include solo mancanti o da verificare
    filteredFields = allFields.filter(f => f.status === 'MANCANTE' || f.status === 'DA_VERIFICARE');
  } else if (mode === 'CURRENT_STEP') {
    // Include solo lo step corrente e che siano applicabili
    filteredFields = allFields.filter(f => f.catalogItem.stepId === currentStep && f.status !== 'NON_APPLICABILE');
  } else {
    // FULL: include tutti i campi tranne quelli non applicabili
    filteredFields = allFields.filter(f => f.status !== 'NON_APPLICABILE');
  }

  // Raggruppiamo i campi in sezioni per step
  const sectionsMap = new Map<number, Wizard2026LetterSection>();

  filteredFields.forEach(f => {
    const { stepId, stepTitle } = f.catalogItem;
    if (!sectionsMap.has(stepId)) {
      sectionsMap.set(stepId, {
        stepId,
        stepTitle,
        fields: []
      });
    }
    sectionsMap.get(stepId)!.fields.push(f);
  });

  const sections = Array.from(sectionsMap.values()).sort((a, b) => a.stepId - b.stepId);

  return {
    ente: {
      denominazione: denominazioneEnte,
      tipologia: state.ente.entityType || 'ALTRO',
      hasDirigenza,
      isDissesto: state.ente.isDissesto,
      isStrutturalmenteDeficitario: state.ente.isStrutturalmenteDeficitario,
      isPianoRiequilibrio: state.ente.isPianoRiequilibrio
    },
    annoRiferimento: state.ente.annoRiferimento || 2026,
    dataGenerazione: resolvedDate,
    destinatario,
    firmatario,
    organizzazione,
    termineRisposta,
    note,
    mode,
    currentStep,
    sections,
    allFields
  };
};
