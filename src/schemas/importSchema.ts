import { z } from 'zod';
import { TipologiaEnte } from '../enums.ts';
import { parseItalianNumber, parseBoolean } from '../logic/import/csvParser.ts';

// Helper per pre-processare i numeri italiani
const italianNumber = z.preprocess(
    (val) => (typeof val === 'string' ? parseItalianNumber(val) : val),
    z.number({ message: "Deve essere un numero valido." })
     .nonnegative("L'importo non può essere negativo.")
     .optional()
);

// Helper per pre-processare i booleani italiani
const italianBoolean = z.preprocess(
    (val) => (typeof val === 'string' ? parseBoolean(val) : val),
    z.boolean({ message: "Deve essere un valore booleano (sì/no, true/false)." }).optional()
);

// Mappatura TipologiaEnte da stringa CSV
const tipologiaEnteMapping: Record<string, TipologiaEnte> = {
    'COMUNE': TipologiaEnte.COMUNE,
    'PROVINCIA': TipologiaEnte.PROVINCIA,
    'UNIONE_COMUNI': TipologiaEnte.UNIONE_COMUNI,
    'COMUNITA_MONTANA': TipologiaEnte.COMUNITA_MONTANA,
    'ALTRO': TipologiaEnte.ALTRO,
};

const italianTipologiaEnte = z.preprocess(
    (val) => {
        if (typeof val !== 'string') return val;
        const upper = val.trim().toUpperCase();
        return tipologiaEnteMapping[upper] || val;
    },
    z.nativeEnum(TipologiaEnte)
);

/**
 * Schema di validazione per una singola riga del CSV di importazione dati generali.
 */
export const ImportDatiGeneraliRowSchema = z.object({
    anno: z.preprocess((val) => (typeof val === 'string' ? parseInt(val, 10) : val), z.number().int()),
    denominazione_ente: z.string().min(2, "La denominazione deve avere almeno 2 caratteri."),
    tipologia_ente: italianTipologiaEnte,
    numero_abitanti: italianNumber,
    has_dirigenza: italianBoolean,
    monte_salari_2021: italianNumber,
    fondo_personale_2016: italianNumber,
    fondo_eq_2016: italianNumber,
    fondo_dirigenza_2016: italianNumber,
    risorse_segretario_2016: italianNumber,
    fondo_straordinario_2016: italianNumber,
    fondo_personale_2018: italianNumber,
    fondo_eq_2018: italianNumber,
    personale_fte_2018: italianNumber,
    stipendi_tabellari_2023: italianNumber,
    spesa_personale_2023: italianNumber,
    media_entrate_correnti: italianNumber,
    tetto_spesa_l296: italianNumber,
    costo_assunzioni_piao: italianNumber,
}).refine(data => {
    // Validazione condizionale: numero_abitanti obbligatorio per Comuni e Province
    if ((data.tipologia_ente === TipologiaEnte.COMUNE || data.tipologia_ente === TipologiaEnte.PROVINCIA) && (data.numero_abitanti === undefined || data.numero_abitanti <= 0)) {
        return false;
    }
    return true;
}, {
    message: "Il numero di abitanti è obbligatorio per Comuni e Province.",
    path: ["numero_abitanti"]
});

export type ImportDatiGeneraliRow = z.infer<typeof ImportDatiGeneraliRowSchema>;
