import { TipologiaEnte } from '../../domain/enums';

export interface LetterRequestDataContext {
    ente: {
        denominazione: string;
        tipologia: TipologiaEnte;
        hasDirigenza: boolean;
    };
    annoRiferimento: number;
    dataGenerazione: string;

    // Stato dei dati (true se presente/valorizzato)
    dataStatus: {
        fondo2016: boolean;
        fondo2018: boolean;
        fte2018: boolean;
        stipendi2023: boolean;
        spesaPersonale2023: boolean;
        entrate2021_2023: boolean;
        monteSalari2021: boolean;
        tettoSpesa: boolean;
        piao: boolean;
    };

    // Valori specifici se necessari (opzionale, la lettera usa principalmente booleani per chiedere i dati mancanti)
    values: {
        fondo2016?: number;
        fte2018?: number;
        monteSalari2021?: number;
    };

    customOptions?: {
        firmatario?: string;
        organizzazione?: string;
    };
}

export interface GeneratedLetter {
    markdown: string;
    context: LetterRequestDataContext;
}
