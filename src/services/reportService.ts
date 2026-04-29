// services/reportService.ts
import { 
    CalculationResult, 
    User, 
    DistribuzioneRisorseData, 
    NormativeData 
} from '../domain';
import { buildDetermina } from './determinaTemplate.ts';
import { generateFondoDipendenteXLS } from './documents/xlsReportService.ts';
import { generateFondoPDF } from './documents/pdfReportService.ts';
import { generateTabella15XLS, generateTabella15CSV } from './documents/tabella15XlsService.ts';
import { mapToTabella15 } from '../logic/calculation/tabella15Mapper.ts';

/**
 * Genera il report PDF completo.
 */
export const generateFullSummaryPDF = async (
    calculationResult: CalculationResult,
    denominazioneEnte: string,
    currentUser: User
): Promise<void> => {
    await generateFondoPDF(calculationResult, denominazioneEnte, currentUser);
};

/**
 * Genera la bozza della determinazione in formato TXT.
 */
export const generateDeterminazioneTXT = (
    calculationResult: CalculationResult,
    fundData: any, // Mantenuto per compatibilità con determinaTemplate
    currentUser: User
): void => {
    const anno = calculationResult.metadata.annoRiferimento;
    const content = buildDetermina(calculationResult, fundData, currentUser);

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Determinazione_Fondo_${anno}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Genera il file Excel del Fondo Dipendenti.
 */
export const generateFADXLS = async (
    calculationResult: CalculationResult,
    denominazioneEnte: string,
    _distribuzioneData?: DistribuzioneRisorseData, // Ignorato, ora nel DTO
    _normativeData?: NormativeData // Ignorato, ora nel DTO
): Promise<void> => {
    await generateFondoDipendenteXLS(
        calculationResult,
        denominazioneEnte
    );
};

/**
 * Genera il file Excel della Tabella 15.
 */
export const generateTabella15ExportXLS = async (
    calculationResult: CalculationResult,
    normativeData: NormativeData
): Promise<void> => {
    const data = mapToTabella15(calculationResult, normativeData);
    await generateTabella15XLS(data);
};

/**
 * Genera il file CSV della Tabella 15.
 */
export const generateTabella15ExportCSV = (
    calculationResult: CalculationResult,
    normativeData: NormativeData
): void => {
    const data = mapToTabella15(calculationResult, normativeData);
    generateTabella15CSV(data);
};
