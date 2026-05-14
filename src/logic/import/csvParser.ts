/**
 * Parser per file CSV con supporto ai formati numerici italiani e separatore punto e virgola.
 */

export interface RawCsvRow {
    [key: string]: string;
}

export interface CsvParseResult {
    data: RawCsvRow[];
    headers: string[];
    errors: string[];
}

/**
 * Parsa una stringa CSV in un array di oggetti.
 * @param csvText Il contenuto del file CSV.
 * @param delimiter Il delimitatore di colonna (default ';').
 */
export const parseCsv = (csvText: string, delimiter: string = ';'): CsvParseResult => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
        return { data: [], headers: [], errors: ['Il file CSV è vuoto.'] };
    }

    const headers = lines[0].split(delimiter).map(h => h.trim());
    const data: RawCsvRow[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter);
        if (values.length !== headers.length) {
            // Se la riga ha un numero diverso di colonne, segnaliamo l'errore ma proviamo a continuare se possibile
            // o semplicemente ignoriamo la riga se è palesemente corrotta.
            if (values.length > 1 || values[0].trim() !== '') {
               errors.push(`Riga ${i + 1}: Numero di colonne non corrispondente (attese ${headers.length}, trovate ${values.length}).`);
            }
            continue;
        }

        const row: RawCsvRow = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
    }

    return { data, headers, errors };
};

/**
 * Converte una stringa numerica (potenzialmente in formato italiano) in un numero.
 * Supporta: "1234.56", "1234,56", "1.234,56"
 */
export const parseItalianNumber = (value: string | undefined): number | undefined => {
    if (value === undefined || value === '') return undefined;

    // Rimuoviamo eventuali spazi
    let cleanValue = value.replace(/\s/g, '');

    // Se contiene sia il punto (migliaia) che la virgola (decimali) come in 1.234,56
    if (cleanValue.includes('.') && cleanValue.includes(',')) {
        // Se il punto viene prima della virgola, è il separatore delle migliaia italiano
        if (cleanValue.indexOf('.') < cleanValue.indexOf(',')) {
            cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
        } else {
            // Formato anglosassone con virgola migliaia e punto decimale? 1,234.56
            cleanValue = cleanValue.replace(/,/g, '');
        }
    } else if (cleanValue.includes(',')) {
        // Solo virgola -> decimale italiano: 1234,56
        cleanValue = cleanValue.replace(',', '.');
    }

    const num = parseFloat(cleanValue);
    return isNaN(num) ? undefined : num;
};

/**
 * Parsa un valore booleano con supporto ai termini italiani.
 */
export const parseBoolean = (value: string | undefined): boolean | undefined => {
    if (value === undefined || value === '') return undefined;
    const lower = value.toLowerCase().trim();
    if (['true', '1', 'sì', 'si', 'yes', 'y'].includes(lower)) return true;
    if (['false', '0', 'no', 'n'].includes(lower)) return false;
    return undefined;
};
