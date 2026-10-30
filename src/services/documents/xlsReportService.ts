// services/xlsReportService.ts
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CalculationResult } from '../../domain';
import { createReportViewModel } from '../../presenters';
import type { ReportViewModel } from '../../presenters/reportPresenter';
import { formatCurrency } from '../../utils/formatters';
import type { DocumentOutputOptions } from '../../domain/documentKindReadiness';

/**
 * Costruisce il prospetto economico FAD esclusivamente dalla projection canonica.
 * Utilizzi e verifica del limite non sono rappresentati da questo read model.
 */
export const buildFondoDipendenteWorkbook = (
    viewModel: Pick<ReportViewModel, 'fadCanonical' | 'annoRiferimento' | 'denominazioneEnte'> & Partial<Pick<ReportViewModel, 'art23Verification'>>,
    options?: DocumentOutputOptions
) => {
    const { fadCanonical, annoRiferimento, denominazioneEnte } = viewModel;
    const isEconomicDraft = !fadCanonical.canonicalAvailable || fadCanonical.status !== 'VALID'
        || fadCanonical.authoritativeTotal === null;
    const stale = viewModel.art23Verification?.status === 'STALE';
    if (stale && options?.mode === 'DEFINITIVE_EXPORT') throw new Error('Ricalcolare la bozza prima di esportare XLS definitivo.');
    const isDraft = options?.mode === 'DRAFT_PREVIEW' || isEconomicDraft || stale;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fondo Dipendenti');

    const BORDEAUX = '994D51';
    const LIGHT_GRAY = 'F9FAFB';
    const WHITE = 'FFFFFF';

    // ── STILI ────────────────────────────────────────────────────────────────
    const titleStyle: Partial<ExcelJS.Style> = {
        font: { name: 'Arial', family: 2, size: 16, bold: true, color: { argb: WHITE } },
        alignment: { vertical: 'middle', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: BORDEAUX } }
    };

    const sectionStyle: Partial<ExcelJS.Style> = {
        font: { name: 'Arial', bold: true, color: { argb: BORDEAUX }, size: 11 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } },
        border: { bottom: { style: 'thin', color: { argb: BORDEAUX } } }
    };

    const headerStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, color: { argb: WHITE }, size: 10 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '7A3A3E' } },
        alignment: { horizontal: 'center' }
    };

    const totalStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, size: 10 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } }
    };

    // ── COLONNE ──────────────────────────────────────────────────────────────
    worksheet.columns = [
        { header: 'SEZIONE', key: 'sezione', width: 25 },
        { header: 'VOCE / DESCRIZIONE', key: 'desc', width: 60 },
        { header: 'RIFERIMENTO NORMATIVO', key: 'rif', width: 45 },
        { header: 'IMPORTO (€)', key: 'val', width: 18, style: { numFmt: '#,##0.00' } },
        { header: 'ART. 23 C. 2', key: 'art23', width: 15, alignment: { horizontal: 'center' } }
    ];

    // ── INTESTAZIONE ──────────────────────────────────────────────────────────
    const titleRow = worksheet.getRow(1);
    titleRow.values = [`${isDraft ? 'BOZZA - ' : ''}COSTITUZIONE E UTILIZZO FONDO PERSONALE DIPENDENTE - ANNO ${annoRiferimento}`];
    worksheet.mergeCells('A1:E1');
    titleRow.height = 30;
    titleRow.eachCell(c => c.style = titleStyle);

    worksheet.addRow(['Ente:', denominazioneEnte]);
    worksheet.addRow([`Stato economico canonico: ${fadCanonical.status}${isEconomicDraft ? ' - TOTALE NON DETERMINATO' : ''}`]);
    if (isDraft && options?.draftReason) worksheet.addRow([`BOZZA: ${options.draftReason}`]);

    // ── QUADRO A: COSTITUZIONE (RISORSE) ───────────────────────────────────────
    const quadroARow = worksheet.addRow(['QUADRO A: COSTITUZIONE DEL FONDO (RISORSE)']);
    quadroARow.eachCell(c => c.style = sectionStyle);
    const headerQuadroA = worksheet.addRow(['CATEGORIA', 'VOCE', 'RIFERIMENTO', 'IMPORTO', 'RILEVANTE LIMITE']);
    headerQuadroA.eachCell(c => c.style = headerStyle);

    const sections = [
        { component: 'STABLE', title: 'Risorse Stabili', subtotal: fadCanonical.verifiedStableTotal },
        { component: 'VARIABLE', title: 'Risorse Variabili', subtotal: fadCanonical.verifiedVariableTotal }
    ] as const;
    sections.forEach(section => {
        worksheet.addRow([section.title, '', '', '', '']).eachCell(c => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
        });

        fadCanonical.rows.filter(item => item.component === section.component).forEach(item => {
            const qualification = item.signedAmount === null
                ? ` [${item.status} - DA ISTRUIRE]${item.reason ? ` ${item.reason}` : ''}${item.amount !== null ? `; importo informativo: ${formatCurrency(item.amount)} (escluso dai subtotali)` : ''}`
                : '';
            const row = worksheet.addRow([
                '',
                item.description + qualification,
                item.normativeRef || '',
                item.signedAmount,
                item.art23Treatment === 'SUBJECT' ? 'Sì' : item.art23Treatment === 'EXCLUDED' ? 'No' : 'Da verificare'
            ]);
            if (item.signedAmount !== null && item.signedAmount < 0) row.getCell(4).font = { color: { argb: 'C02128' } };
        });

        const totRow = worksheet.addRow(['', `Subtotale verificato ${section.title}`, '', section.subtotal, '']);
        totRow.getCell(2).font = { bold: true };
        totRow.getCell(4).font = { bold: true };
    });

    worksheet.addRow(['SUBTOTALE VERIFICATO RISORSE (FAD)', '', '', fadCanonical.verifiedTotal, '']).eachCell(c => c.style = totalStyle);
    const totGenRes = worksheet.addRow(['TOTALE GENERALE RISORSE DISPONIBILI (FAD)', '', '', isEconomicDraft ? 'NON DETERMINATO' : fadCanonical.authoritativeTotal, '']);
    totGenRes.eachCell(c => c.style = totalStyle);
    // Include unresolved figurative entries as notes, without an economic amount cell.
    fadCanonical.unresolvedItems.filter(item => item.economicEffect === false).forEach(item => {
        worksheet.addRow(['', `${item.description} [${item.status}]${item.reason ? ` ${item.reason}` : ''}`]);
    });
    fadCanonical.missingPrerequisites.forEach(reason => worksheet.addRow(['', reason]));
    worksheet.addRow([]);

    // ── QUADRO B: UTILIZZI (DESTINAZIONI) ──────────────────────────────────────
    const quadroBRow = worksheet.addRow(['QUADRO B: UTILIZZO DEL FONDO (DESTINAZIONI)']);
    quadroBRow.eachCell(c => c.style = sectionStyle);
    const headerQuadroB = worksheet.addRow(['CATEGORIA', 'VOCE', 'RIFERIMENTO', 'IMPORTO', '']);
    headerQuadroB.eachCell(c => c.style = headerStyle);

    worksheet.addRow(['', 'Non rappresentato in questo prospetto']);
    worksheet.addRow([]);

    // ── QUADRO C: VERIFICA LIMITI ART. 23 C. 2 ─────────────────────────────────
    const quadroCRow = worksheet.addRow(['QUADRO C: VERIFICA LIMITE ART. 23 C. 2 D.LGS. 75/2017']);
    quadroCRow.eachCell(c => c.style = sectionStyle);

    worksheet.addRow(['DESCRIZIONE', '', '', 'VALORE', 'ESITO']);
    worksheet.addRow(['', 'Non rappresentato in questo prospetto']);

    if (viewModel.art23Verification) worksheet.addRow(['', 'Esito verifica Art. 23', '',
        viewModel.art23Verification.guidance ?? '', viewModel.art23Verification.label]);
    const filename = `Fondo_Dipendenti_${isDraft ? 'BOZZA_' : ''}${denominazioneEnte}_${annoRiferimento}.xlsx`;
    return { workbook, filename, isDraft };
};

/** Mantiene il boundary di download e la firma pubblica esistenti. */
export const generateFondoDipendenteXLS = async (
    calculationResult: CalculationResult,
    denominazioneEnte: string,
    options?: DocumentOutputOptions
): Promise<void> => {
    const { workbook, filename } = buildFondoDipendenteWorkbook(createReportViewModel(calculationResult, denominazioneEnte), options);
    // ── ESPORTAZIONE ──────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename);
};
