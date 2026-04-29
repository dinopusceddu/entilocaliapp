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

    // 1. Calcolo dipendenti equivalenti per Art. 79 c.1c
    const dipendentiEquivalenti2018 = (annualData.personale2018PerArt23 || []).reduce(
        (sum, emp) => sum + ((emp.partTimePercentage || 100) / 100), 
        0
    );

    const dipendentiEquivalentiAnnoRif = (annualData.personaleAnnoRifPerArt23 || []).reduce(
        (sum, emp) => {
            const ptPerc = (emp.partTimePercentage || 100) / 100;
            const cedoliniRatio = emp.cedoliniEmessi !== undefined && emp.cedoliniEmessi > 0 && emp.cedoliniEmessi <= 12 
                ? emp.cedoliniEmessi / 12 
                : 1;
            return sum + (ptPerc * cedoliniRatio);
        }, 
        0
    );

    const variazioneDipendenti = dipendentiEquivalentiAnnoRif - dipendentiEquivalenti2018;

    // 2. Calcoli per Art. 48 (Differenziazione premio)
    const numDipendentiContrattazione = annualData.ccnl2024?.personaleInServizio01012026 ??
        (annualData.personaleServizioAttuale || []).reduce((sum, item) => sum + (item.count || 0), 0);

    const isArt48Applicabile = numDipendentiContrattazione > 5;

    // 3. Costruzione DTO normalizzato
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
        personaleDettaglio: fundData.personaleServizio?.dettagli || [],
        calculatedInputs: {
            dipendentiEquivalenti2018: (fundData as any).personaleServizio?.isManualMode 
                ? ((fundData as any).annualData?.manualDipendentiEquivalenti2018 || dipendentiEquivalenti2018)
                : dipendentiEquivalenti2018,
            dipendentiEquivalentiAnnoRif: (fundData as any).personaleServizio?.isManualMode
                ? ((fundData as any).personaleServizio?.manualDipendentiEquivalenti || dipendentiEquivalentiAnnoRif)
                : dipendentiEquivalentiAnnoRif,
            variazioneDipendenti,
            isArt48Applicabile,
            numDipendentiContrattazione,
            isManualMode: (fundData as any).personaleServizio?.isManualMode,
            manualProgressioni: (fundData as any).personaleServizio?.manualProgressioni,
            manualIndennita: (fundData as any).personaleServizio?.manualIndennita,
            manualDipendentiEquivalentiAnnoRif: (fundData as any).personaleServizio?.manualDipendentiEquivalenti
        }
    };
};
