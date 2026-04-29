import {
    AnnualData,
    HistoricalData,
    FondoAccessorioDipendenteData,
    FondoElevateQualificazioniData,
    FondoSegretarioComunaleData,
    FondoDirigenzaData,
    DistribuzioneRisorseData,
    PersonaleServizioDettaglio
} from './types';

/**
 * Rappresenta i dati di input normalizzati e pronti per il calcolo.
 * Questo DTO isola il motore dai dettagli dello stato UI (es. undefined, stringhe sporche).
 */
export interface NormalizedInput {
    // Dati anagrafici e parametri di base (normalizzati)
    annualData: AnnualData;
    historicalData: HistoricalData;
    
    // Dati economici delle fonti
    fondi: {
        dipendente: FondoAccessorioDipendenteData;
        eq: FondoElevateQualificazioniData;
        segretario: FondoSegretarioComunaleData;
        dirigenza: FondoDirigenzaData;
    };
    
    // Dati di distribuzione degli utilizzi
    distribuzione: DistribuzioneRisorseData;

    // Dettaglio analitico personale
    personaleDettaglio: PersonaleServizioDettaglio[];

    // Grandezze pre-calcolate nel layer input (Normalizer)
    // Utili sia per il calcolo che per la verifica di conformità
    calculatedInputs: {
        dipendentiEquivalenti2018: number;
        dipendentiEquivalentiAnnoRif: number;
        variazioneDipendenti: number;
        isArt48Applicabile: boolean;
        numDipendentiContrattazione: number;
        // Valori manuali di override (es. caricati da fixtures legacy)
        isManualMode?: boolean;
        manualProgressioni?: number;
        manualIndennita?: number;
        manualDipendentiEquivalentiAnnoRif?: number;
    };
}
