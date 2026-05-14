import { FundData } from '../../domain/types';
import { LetterRequestDataContext } from './letterRequestDataTypes';

/**
 * Trasforma il FundData dell'applicazione in un contesto semplificato per la generazione della lettera.
 */
export const buildLetterContext = (
    fundData: FundData,
    customOptions?: { firmatario?: string; organizzazione?: string }
): LetterRequestDataContext => {
    const { annualData, historicalData } = fundData;
    const { simulatoreInput, ccnl2024 } = annualData;

    // Helper per verificare se un valore è "presente" (non nullo e > 0)
    const isSet = (val: any) => val !== undefined && val !== null && val !== 0 && val !== '';

    return {
        ente: {
            denominazione: annualData.denominazioneEnte || '[INSERIRE DENOMINAZIONE ENTE]',
            tipologia: annualData.tipologiaEnte || 'ALTRO' as any,
            hasDirigenza: annualData.hasDirigenza || false,
        },
        annoRiferimento: annualData.annoRiferimento,
        dataGenerazione: new Date().toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }),
        dataStatus: {
            fondo2016: isSet(historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016),
            fondo2018: isSet(historicalData.fondoPersonaleNonDirEQ2018_Art23),
            fte2018: isSet(annualData.manualDipendentiEquivalenti2018),
            stipendi2023: isSet(simulatoreInput.simStipendiTabellari2023),
            spesaPersonale2023: isSet(simulatoreInput.simSpesaPersonaleConsuntivo2023),
            entrate2021_2023: isSet(simulatoreInput.simMediaEntrateCorrenti2021_2023),
            monteSalari2021: isSet(ccnl2024?.monteSalari2021),
            tettoSpesa: isSet(simulatoreInput.simTettoSpesaPersonaleL296_06),
            piao: isSet(simulatoreInput.simCostoAnnuoNuoveAssunzioniPIAO),
        },
        values: {
            fondo2016: historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016,
            fte2018: annualData.manualDipendentiEquivalenti2018,
            monteSalari2021: ccnl2024?.monteSalari2021,
        },
        customOptions: {
            firmatario: customOptions?.firmatario || '[NOME FIRMATARIO]',
            organizzazione: customOptions?.organizzazione || 'FP CGIL'
        }
    };
};
