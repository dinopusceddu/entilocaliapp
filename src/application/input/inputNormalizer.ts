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
    const analyticFte2018 = (annualData.personale2018PerArt23 || []).reduce(
        (sum, emp) => sum + ((emp.partTimePercentage || 100) / 100), 
        0
    );

    const analyticFteAnnoRif = (annualData.personaleAnnoRifPerArt23 || []).reduce(
        (sum, emp) => {
            const ptPerc = (emp.partTimePercentage || 100) / 100;
            const cedoliniRatio = emp.cedoliniEmessi !== undefined && emp.cedoliniEmessi > 0 && emp.cedoliniEmessi <= 12 
                ? emp.cedoliniEmessi / 12 
                : 1;
            return sum + (ptPerc * cedoliniRatio);
        }, 
        0
    );

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

    const resolvedFte2018 = isArt23FteManualMode 
        ? (annualData.manualDipendentiEquivalenti2018 || analyticFte2018)
        : analyticFte2018;

    const resolvedFteAnnoRif = isArt23FteManualMode
        ? (fundData?.personaleServizio?.manualDipendentiEquivalenti || analyticFteAnnoRif)
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
            manualDipendentiEquivalentiAnnoRif: fundData?.personaleServizio?.manualDipendentiEquivalenti
        }
    };
};
