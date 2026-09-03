import { 
    FundData, 
    NormalizedInput, 
    AnnualData,
    FondoAccessorioDipendenteData,
    FondoElevateQualificazioniData,
    FondoSegretarioComunaleData,
    FondoDirigenzaData,
    DistribuzioneRisorseData,
    HistoricalData
} from '../../domain';
import { INITIAL_DISTRIBUZIONE_RISORSE_DATA } from '../../constants';
import { calculateArt23Fte } from '../../logic/shared/art23Fte';

/**
 * Normalizza i dati grezzi provenienti dallo stato UI in un contratto NormalizedInput sicuro.
 * Calcola inoltre le grandezze derivate (dipendenti equivalenti) necessarie ai layer successivi.
 */
export const normalizeInput = (
    fundData: FundData
): NormalizedInput => {
    const { 
        annualData = {} as AnnualData, 
        historicalData, 
        fondoAccessorioDipendenteData, 
        fondoElevateQualificazioniData, 
        fondoSegretarioComunaleData, 
        fondoDirigenzaData, 
        distribuzioneRisorseData 
    } = fundData || {};

    // 1. Calcolo dipendenti equivalenti analitici per Art. 79 c.1c
    const analyticFte2018 = calculateArt23Fte(
        annualData.personale2018PerArt23,
        'REFERENCE_2018'
    ).totalFte;

    const analyticFteAnnoRif = calculateArt23Fte(
        annualData.personaleAnnoRifPerArt23,
        'CURRENT_YEAR'
    ).totalFte;

    // 2. Calcoli per Art. 48 (Differenziazione premio)
    const numDipendentiContrattazione = annualData.ccnl2024?.personaleInServizio01012026 ??
        (annualData.personaleServizioAttuale || []).reduce((sum, item) => sum + (item.count || 0), 0);

    const isArt48Applicabile = numDipendentiContrattazione > 5;

    // 3. Risoluzione modalità manuali
    const globalPersonnelManualMode =
        !!fundData?.personaleServizio?.isManualMode;

    const isArt23FteManualMode =
        annualData.isArt23FteManualMode ??
        globalPersonnelManualMode;

    const manualFte2018 =
        annualData.manualDipendentiEquivalenti2018;

    const manualFteAnnoRif =
        annualData.manualDipendentiEquivalentiAnnoRif
        ?? fundData?.personaleServizio?.manualDipendentiEquivalenti;

    const resolvedFte2018 = isArt23FteManualMode 
        ? (manualFte2018 ?? analyticFte2018)
        : analyticFte2018;

    const resolvedFteAnnoRif = isArt23FteManualMode
        ? (manualFteAnnoRif ?? analyticFteAnnoRif)
        : analyticFteAnnoRif;

    const variazioneDipendenti = resolvedFteAnnoRif - resolvedFte2018;

    // 4. Costruzione DTO normalizzato
    return {
        annualData: { ...annualData } as AnnualData,
        historicalData: { ...historicalData } as HistoricalData,
        fondi: {
            dipendente: { ...fondoAccessorioDipendenteData } as FondoAccessorioDipendenteData,
            eq: { ...fondoElevateQualificazioniData } as FondoElevateQualificazioniData,
            segretario: { ...fondoSegretarioComunaleData } as FondoSegretarioComunaleData,
            dirigenza: { ...fondoDirigenzaData } as FondoDirigenzaData
        },
        distribuzione: (distribuzioneRisorseData || INITIAL_DISTRIBUZIONE_RISORSE_DATA) as DistribuzioneRisorseData,
        personaleDettaglio: fundData?.personaleServizio?.dettagli || [],
        calculatedInputs: {
            dipendentiEquivalenti2018: resolvedFte2018,
            dipendentiEquivalentiAnnoRif: resolvedFteAnnoRif,
            variazioneDipendenti,
            isArt48Applicabile,
            numDipendentiContrattazione,
            isManualMode: globalPersonnelManualMode,
            isArt23FteManualMode,
            manualProgressioni: fundData?.personaleServizio?.manualProgressioni,
            manualIndennita: fundData?.personaleServizio?.manualIndennita,
            manualDipendentiEquivalentiAnnoRif: manualFteAnnoRif
        }
    };
};
