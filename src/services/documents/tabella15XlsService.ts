import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Tabella15Result } from '../../domain';
import FinancialMath from '../../utils/financialMath';

/**
 * Genera un file Excel dedicato alla Tabella 15 del Conto Annuale.
 * AG-126: Export conforme basato sul dataset del mapper canonico.
 */
export const generateTabella15XLS = async (
    data: Tabella15Result
): Promise<void> => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tabella 15');

    const BORDEAUX = '994D51';
    const WHITE = 'FFFFFF';
    const LIGHT_GRAY = 'F9FAFB';

    // ── STILI ────────────────────────────────────────────────────────────────
    const titleStyle: Partial<ExcelJS.Style> = {
        font: { name: 'Arial', family: 2, size: 14, bold: true, color: { argb: WHITE } },
        alignment: { vertical: 'middle', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: BORDEAUX } }
    };

    const headerStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, color: { argb: WHITE }, size: 10 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '7A3A3E' } },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
    };

    const sectionStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, size: 11, color: { argb: BORDEAUX } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } }
    };

    // ── COLONNE ──────────────────────────────────────────────────────────────
    worksheet.columns = [
        { header: 'COLONNA', key: 'col', width: 25, alignment: { horizontal: 'center' } },
        { header: 'DESCRIZIONE VOCE', key: 'desc', width: 65 },
        { header: 'IMPORTO (€)', key: 'amount', width: 20, style: { numFmt: '#,##0.00' } },
        { header: 'SORGENTE DATI', key: 'source', width: 30 }
    ];

    // ── INTESTAZIONE ──────────────────────────────────────────────────────────
    const titleRow = worksheet.getRow(1);
    titleRow.values = [`CONTO ANNUALE - TABELLA 15 - ANNO ${data.year}`];
    worksheet.mergeCells('A1:D1');
    titleRow.height = 25;
    titleRow.eachCell(c => c.style = titleStyle);

    worksheet.addRow(['Ente:', data.entityName]);
    worksheet.addRow(['Data Generazione:', new Date(data.metadata.generatedAt).toLocaleString('it-IT')]);
    worksheet.addRow(['Stato Validazione Schema RGS:', data.schemaVerificationStatus]);
    worksheet.addRow([]);

    // ── CORPO ────────────────────────────────────────────────────────────────
    const renderSection = (section: any) => {
        const row = worksheet.addRow([section.title.toUpperCase(), '', '', '']);
        row.eachCell(c => c.style = sectionStyle);
        worksheet.mergeCells(`A${row.number}:D${row.number}`);

        const headerRow = worksheet.addRow(['COLONNA', 'DESCRIZIONE', 'IMPORTO', 'SORGENTE']);
        headerRow.eachCell(c => c.style = headerStyle);

        section.entries.forEach((entry: any) => {
            worksheet.addRow([
                entry.columnCode,
                entry.description,
                FinancialMath.roundTo2DP(entry.amount),
                entry.source
            ]);
        });

        const totalRow = worksheet.addRow(['', `TOTALE ${section.title.toUpperCase()}`, FinancialMath.roundTo2DP(section.total), '']);
        totalRow.eachCell(c => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
        });
        worksheet.addRow([]);
    };

    renderSection(data.sections.stabile);
    renderSection(data.sections.variabile);

    if (data.grandTotal !== null) {
        const grandTotalRow = worksheet.addRow(['', 'TOTALE GENERALE TABELLA 15', FinancialMath.roundTo2DP(data.grandTotal), '']);
        grandTotalRow.eachCell(c => {
            c.font = { bold: true, size: 12, color: { argb: WHITE } };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BORDEAUX } };
        });
    } else {
        const subTotalRow = worksheet.addRow(['', 'SUBTOTALE VERIFICATO', FinancialMath.roundTo2DP(data.verifiedSubtotal), 'TOTALE COMPLESSIVO NON ANCORA DETERMINABILE']);
        subTotalRow.eachCell(c => {
            c.font = { bold: true, size: 11, color: { argb: WHITE } };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D97706' } };
        });
    }

    if (data.unresolvedClassifications && data.unresolvedClassifications.length > 0) {
        worksheet.addRow([]);
        const warnTitle = worksheet.addRow(['CLASSIFICAZIONI RGS NON RISOLTE', '', '', '']);
        warnTitle.eachCell(c => {
            c.font = { bold: true, color: { argb: WHITE } };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DC2626' } };
        });
        worksheet.mergeCells(`A${warnTitle.number}:D${warnTitle.number}`);
        data.unresolvedClassifications.forEach(u => {
            worksheet.addRow(['RGS_MAPPING_UNRESOLVED', u.description, FinancialMath.roundTo2DP(u.amount), u.reason]);
        });
    }

    // ── ESPORTAZIONE ──────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Tabella15_${data.entityName}_${data.year}.xlsx`);
};

/**
 * Genera un file CSV della Tabella 15.
 */
export const generateTabella15CSV = (data: Tabella15Result): void => {
    // W3-RGS-001: Expose schema verification status so CSV consumers know it is not SICO-validated.
    let csv = `Stato Schema RGS:;${data.schemaVerificationStatus}\n`;
    csv += `Pronto per SICO:;${data.isSicoExportReady ? 'SI' : 'NO - schema non verificato'}\n`;
    csv += `Quadratura aritmetica:;${data.isArithmeticExportReady ? 'OK' : 'NON COMPLETA'}\n`;
    csv += `\n`;
    csv += "Colonna;Descrizione;Importo;Sorgente\n";
    
    const allEntries = [
        ...data.sections.stabile.entries,
        ...data.sections.variabile.entries
    ];

    allEntries.forEach(e => {
        const rounded = FinancialMath.roundTo2DP(e.amount);
        csv += `${e.columnCode};${e.description};${rounded.toFixed(2).replace('.', ',')};${e.source}\n`;
    });

    if (data.grandTotal !== null) {
        const roundedGrand = FinancialMath.roundTo2DP(data.grandTotal);
        csv += `\n;;;\n;TOTALE GENERALE;${roundedGrand.toFixed(2).replace('.', ',')};\n`;
    } else {
        const roundedSub = FinancialMath.roundTo2DP(data.verifiedSubtotal);
        csv += `\n;;;\n;SUBTOTALE VERIFICATO;${roundedSub.toFixed(2).replace('.', ',')};(TOTALE COMPLESSIVO NON DETERMINABILE)\n`;
    }

    if (data.unresolvedClassifications && data.unresolvedClassifications.length > 0) {
        csv += `\n;AVVERTENZE CLASSIFICAZIONI RGS NON RISOLTE;${data.unresolvedClassifications.length};\n`;
        data.unresolvedClassifications.forEach(u => {
            csv += `;${u.key};${FinancialMath.roundTo2DP(u.amount).toFixed(2).replace('.', ',')};${u.reason}\n`;
        });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `Tabella15_${data.entityName}_${data.year}.csv`);
};
