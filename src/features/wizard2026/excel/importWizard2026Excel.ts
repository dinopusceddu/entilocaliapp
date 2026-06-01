import * as XLSX from 'xlsx';
import { Wizard2026DraftState } from '../types';
import { wizard2026ExcelSchema, REVERSE_ENTITY_TYPE_LABELS } from './wizard2026ExcelSchema';

export interface ImportValidationResult {
  success: boolean;
  importedCount: number;
  ignoredCount: number;
  errors: string[];
  warnings: string[];
  resultState: Partial<Wizard2026DraftState>;
}

// Helper per impostare un valore in una struttura ad oggetti annidati
function setNestedValue(obj: any, path: string, value: any) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

export const importWizard2026Excel = async (file: File): Promise<ImportValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({
            success: false,
            importedCount: 0,
            ignoredCount: 0,
            errors: ['Impossibile leggere il contenuto del file.'],
            warnings: [],
            resultState: {},
          });
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        
        let importedCount = 0;
        let ignoredCount = 0;
        const errors: string[] = [];
        const warnings: string[] = [];
        const resultState: any = {};

        // Validiamo la presenza dei fogli previsti
        const missingSheets: string[] = [];
        wizard2026ExcelSchema.forEach(sheet => {
          if (!workbook.SheetNames.includes(sheet.sheetName)) {
            missingSheets.push(sheet.sheetName);
          }
        });

        // Se mancano fogli fondamentali, rifiutiamo il workbook
        if (missingSheets.length > 0) {
          resolve({
            success: false,
            importedCount: 0,
            ignoredCount: 0,
            errors: [`Il file Excel non è valido. Mancano i seguenti fogli necessari: ${missingSheets.join(', ')}`],
            warnings: [],
            resultState: {},
          });
          return;
        }

        // Procediamo alla scansione di ciascun foglio
        wizard2026ExcelSchema.forEach(sheetSchema => {
          const sheet = workbook.Sheets[sheetSchema.sheetName];
          // Convertiamo il foglio in un array di array (righe e colonne)
          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

          if (rows.length <= 1) {
            warnings.push(`Il foglio "${sheetSchema.sheetName}" risulta vuoto o non contiene dati.`);
            return;
          }

          // Scorriamo le righe saltando l'intestazione (indice 0)
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 5) continue;

            const rawValue = row[2];
            const keyPath = row[4]; // Chiave tecnica nascosta in colonna E

            if (!keyPath || typeof keyPath !== 'string') continue;

            // Trova la definizione del campo nello schema
            const fieldSchema = sheetSchema.fields.find(f => f.key === keyPath);
            if (!fieldSchema) continue;

            // Se la cella è di tipo "calcolato", la ignoriamo per l'importazione
            if (fieldSchema.cellType === 'calculated') {
              ignoredCount++;
              continue;
            }

            // Gestione dei valori vuoti o nulli
            if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') {
              if (fieldSchema.cellType === 'input_required') {
                warnings.push(`Il campo obbligatorio "${fieldSchema.label}" nel foglio "${sheetSchema.sheetName}" è vuoto.`);
              }
              setNestedValue(resultState, keyPath, undefined);
              ignoredCount++;
              continue;
            }

            // Conversione del tipo di dato
            let convertedValue: any = undefined;
            let hasFormatError = false;

            if (fieldSchema.type === 'boolean') {
              const strVal = String(rawValue).trim().toLowerCase();
              if (strVal === 'sì' || strVal === 'si' || strVal === 'true' || strVal === '1') {
                convertedValue = true;
              } else if (strVal === 'no' || strVal === 'false' || strVal === '0') {
                convertedValue = false;
              } else {
                hasFormatError = true;
              }
            } else if (fieldSchema.type === 'number') {
              // Se è già un numero, lo usiamo. Altrimenti proviamo a parsarlo
              if (typeof rawValue === 'number') {
                convertedValue = rawValue;
              } else {
                const parsed = parseFloat(String(rawValue).replace(/,/g, '.').replace(/\s/g, ''));
                if (!isNaN(parsed)) {
                  convertedValue = parsed;
                } else {
                  hasFormatError = true;
                }
              }
            } else if (fieldSchema.type === 'select') {
              const strVal = String(rawValue).trim();
              if (keyPath === 'ente.entityType') {
                // Mappiamo l'etichetta visualizzata alla chiave interna
                const internalKey = REVERSE_ENTITY_TYPE_LABELS[strVal];
                if (internalKey) {
                  convertedValue = internalKey;
                } else {
                  hasFormatError = true;
                }
              } else {
                convertedValue = strVal;
              }
            } else {
              // String o altro
              convertedValue = String(rawValue).trim();
            }

            if (hasFormatError) {
              errors.push(
                `Valore non valido per il campo "${fieldSchema.label}" nel foglio "${sheetSchema.sheetName}". ` +
                `Valore letto: "${rawValue}". Tipo atteso: ${fieldSchema.type === 'boolean' ? 'Sì/No' : fieldSchema.type}.`
              );
              setNestedValue(resultState, keyPath, undefined);
            } else {
              setNestedValue(resultState, keyPath, convertedValue);
              importedCount++;
            }
          }
        });

        // Post-processing per il conglobamento Art. 60
        if (resultState.conglobamentoArt60) {
          const areas: ('OPERATORE' | 'OPERATORE_ESPERTO' | 'ISTRUTTORE' | 'FUNZIONARIO_EQ')[] = [
            'OPERATORE',
            'OPERATORE_ESPERTO',
            'ISTRUTTORE',
            'FUNZIONARIO_EQ'
          ];
          
          const partTimeNativi: any[] = [];
          const personaleInteroArea: Record<string, number> = {};

          areas.forEach(area => {
            const interoVal = resultState.conglobamentoArt60.personaleInteroArea?.[area];
            const trasformatoVal = resultState.conglobamentoArt60.fullTimeTrasformatoPartTime?.[area];
            const fteVal = resultState.conglobamentoArt60.partTimeNativoFte?.[area];

            if (interoVal !== undefined || trasformatoVal !== undefined) {
              personaleInteroArea[area] = (interoVal ?? 0) + (trasformatoVal ?? 0);
            }

            if (fteVal !== undefined && fteVal > 0) {
              partTimeNativi.push({
                id: Math.random().toString(36).substring(2, 9),
                area,
                percentualePartTime: 100,
                numeroDipendenti: fteVal,
                nota: 'Importato da Excel (FTE)',
              });
            }
          });

          // Sovrascriviamo gli oggetti reali
          if (Object.keys(personaleInteroArea).length > 0) {
            resultState.conglobamentoArt60.personaleInteroArea = personaleInteroArea;
          } else {
            delete resultState.conglobamentoArt60.personaleInteroArea;
          }

          if (partTimeNativi.length > 0) {
            resultState.conglobamentoArt60.partTimeNativi = partTimeNativi;
          }

          // Rimuoviamo le chiavi fittizie
          delete resultState.conglobamentoArt60.partTimeNativoFte;
          delete resultState.conglobamentoArt60.fullTimeTrasformatoPartTime;
        }

        resolve({
          success: errors.length === 0,
          importedCount,
          ignoredCount,
          errors,
          warnings,
          resultState,
        });

      } catch (err: any) {
        resolve({
          success: false,
          importedCount: 0,
          ignoredCount: 0,
          errors: [`Errore durante il parsing del file Excel: ${err.message || err}`],
          warnings: [],
          resultState: {},
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        importedCount: 0,
        ignoredCount: 0,
        errors: ['Errore di lettura del file.'],
        warnings: [],
        resultState: {},
      });
    };

    reader.readAsArrayBuffer(file);
  });
};
