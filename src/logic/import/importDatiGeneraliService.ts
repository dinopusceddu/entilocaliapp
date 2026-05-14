import { FundData } from '../../domain/types';
import { parseCsv } from './csvParser.ts';
import { ImportDatiGeneraliRowSchema } from '../../schemas/importSchema.ts';
import { mapCsvRowToFundData, ImportPreviewRow } from './csvMapper.ts';

export interface ImportError {
    row?: number;
    column?: string;
    message: string;
}

export interface ImportWarning {
    row?: number;
    column?: string;
    message: string;
}

export interface ImportResult {
    success: boolean;
    mappedData?: Partial<FundData>;
    previewRows: ImportPreviewRow[];
    errors: ImportError[];
    warnings: ImportWarning[];
}

/**
 * Service per l'importazione dei dati generali da file CSV.
 */
export const importDatiGeneraliFromCsv = async (
    file: File,
    currentFundData: FundData,
    selectedYear: number
): Promise<ImportResult> => {
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];
    let mappedData: Partial<FundData> | undefined = undefined;
    let previewRows: ImportPreviewRow[] = [];

    try {
        const text = await file.text();
        const { data, errors: parseErrors } = parseCsv(text);

        if (parseErrors.length > 0) {
            parseErrors.forEach(err => errors.push({ message: err }));
            return { success: false, previewRows, errors, warnings };
        }

        if (data.length === 0) {
            errors.push({ message: "Il file non contiene righe di dati." });
            return { success: false, previewRows, errors, warnings };
        }

        // Prendiamo solo la prima riga di dati (per ora l'import è per singolo ente/anno)
        const rawRow = data[0];
        
        // Validazione con Zod
        const validationResult = ImportDatiGeneraliRowSchema.safeParse(rawRow);

        if (!validationResult.success) {
            validationResult.error.issues.forEach(issue => {
                errors.push({
                    column: issue.path.join('.'),
                    message: issue.message
                });
            });
            return { success: false, previewRows, errors, warnings };
        }

        const validatedRow = validationResult.data;

        // Controllo Anno Discordante (Bloccante)
        if (validatedRow.anno !== selectedYear) {
            errors.push({
                column: 'anno',
                message: `L'anno nel CSV (${validatedRow.anno}) non coincide con l'anno aperto (${selectedYear}).`
            });
            return { success: false, previewRows, errors, warnings };
        }

        // Mapping
        const mappingResult = mapCsvRowToFundData(validatedRow, currentFundData);
        mappedData = mappingResult.mappedData;
        previewRows = mappingResult.previewRows;

        // Recuperiamo i warning dal mapping
        previewRows.forEach(row => {
            if (row.status === 'warning') {
                warnings.push({ column: row.field, message: row.message || 'Dato sospetto' });
            }
        });

        return {
            success: errors.length === 0,
            mappedData,
            previewRows,
            errors,
            warnings
        };

    } catch (err: any) {
        errors.push({ message: `Errore durante la lettura del file: ${err.message}` });
        return { success: false, previewRows, errors, warnings };
    }
};
