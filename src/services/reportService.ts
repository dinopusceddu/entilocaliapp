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
    void _distribuzioneData;
    void _normativeData;
    await generateFondoDipendenteXLS(
        calculationResult,
        denominazioneEnte
    );
};

/**
 * Asserisce che l'export definitivo della Tabella 15 sia consentito.
 */
export const assertDefinitiveTabella15ExportAllowed = (data: ReturnType<typeof mapToTabella15>): void => {
    if (!data.isArithmeticExportReady || data.grandTotal === null || data.overallStatus !== 'VALID' || data.unresolvedClassifications.length > 0) {
        throw new Error('Export definitivo Tabella 15 bloccato: quadratura aritmetica non completata o annualità in istruttoria.');
    }
};

/**
 * Genera il file Excel della Tabella 15.
 */
export const generateTabella15ExportXLS = async (
    calculationResult: CalculationResult,
    normativeData: NormativeData,
    options?: { mode?: 'DRAFT_PREVIEW' | 'DEFINITIVE_EXPORT' }
): Promise<void> => {
    const data = mapToTabella15(calculationResult, normativeData);
    if (options?.mode === 'DEFINITIVE_EXPORT') {
        assertDefinitiveTabella15ExportAllowed(data);
    }
    await generateTabella15XLS(data);
};

/**
 * Genera il file CSV della Tabella 15.
 */
export const generateTabella15ExportCSV = (
    calculationResult: CalculationResult,
    normativeData: NormativeData,
    options?: { mode?: 'DRAFT_PREVIEW' | 'DEFINITIVE_EXPORT' }
): void => {
    const data = mapToTabella15(calculationResult, normativeData);
    if (options?.mode === 'DEFINITIVE_EXPORT') {
        assertDefinitiveTabella15ExportAllowed(data);
    }
    generateTabella15CSV(data);
};

/**
 * Esegue l'export definitivo del file Excel della Tabella 15. Blocca se non consentito.
 */
export const exportDefinitiveTabella15XLS = async (
    calculationResult: CalculationResult,
    normativeData: NormativeData
): Promise<void> => {
    return generateTabella15ExportXLS(calculationResult, normativeData, { mode: 'DEFINITIVE_EXPORT' });
};

/**
 * Esegue l'export definitivo del file CSV della Tabella 15. Blocca se non consentito.
 */
export const exportDefinitiveTabella15CSV = (
    calculationResult: CalculationResult,
    normativeData: NormativeData
): void => {
    generateTabella15ExportCSV(calculationResult, normativeData, { mode: 'DEFINITIVE_EXPORT' });
};

/**
 * Genera l'anteprima/bozza tecnica Excel della Tabella 15 in modalità DRAFT_PREVIEW.
 */
export const previewDraftTabella15XLS = async (
    calculationResult: CalculationResult,
    normativeData: NormativeData
): Promise<void> => {
    return generateTabella15ExportXLS(calculationResult, normativeData, { mode: 'DRAFT_PREVIEW' });
};

/**
 * Genera l'anteprima/bozza tecnica CSV della Tabella 15 in modalità DRAFT_PREVIEW.
 */
export const previewDraftTabella15CSV = (
    calculationResult: CalculationResult,
    normativeData: NormativeData
): void => {
    generateTabella15ExportCSV(calculationResult, normativeData, { mode: 'DRAFT_PREVIEW' });
};
