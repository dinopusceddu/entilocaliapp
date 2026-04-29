// services/xlsReportService.ts
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CalculationResult } from '../../domain';
import { createReportViewModel } from '../../presenters';

/**
 * Genera un file Excel (.xlsx) professionale con il dettaglio completo (Costituzione e Utilizzo)
 * utilizzando il ReportViewModel dal presenter.
 */
export const generateFondoDipendenteXLS = async (
    calculationResult: CalculationResult,
    denominazioneEnte: string
): Promise<void> => {
    const viewModel = createReportViewModel(calculationResult, denominazioneEnte);
    const { fondoDipendenti, annoRiferimento } = viewModel;

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
    titleRow.values = [`COSTITUZIONE E UTILIZZO FONDO PERSONALE DIPENDENTE - ANNO ${annoRiferimento}`];
    worksheet.mergeCells('A1:E1');
    titleRow.height = 30;
    titleRow.eachCell(c => c.style = titleStyle);

    worksheet.addRow(['Ente:', denominazioneEnte]);
    worksheet.addRow([]);

    // ── QUADRO A: COSTITUZIONE (RISORSE) ───────────────────────────────────────
    const quadroARow = worksheet.addRow(['QUADRO A: COSTITUZIONE DEL FONDO (RISORSE)']);
    quadroARow.eachCell(c => c.style = sectionStyle);
    const headerQuadroA = worksheet.addRow(['CATEGORIA', 'VOCE', 'RIFERIMENTO', 'IMPORTO', 'RILEVANTE LIMITE']);
    headerQuadroA.eachCell(c => c.style = headerStyle);

    fondoDipendenti.costituzione.forEach(sec => {
        worksheet.addRow([sec.title, '', '', '', '']).eachCell(c => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
        });

        sec.items.forEach(item => {
            const row = worksheet.addRow([
                '',
                item.description,
                item.riferimentoNormativo || '',
                item.isSubtractor ? -Math.abs(item.amount) : item.amount,
                item.isRelevantToArt23Limit ? 'Sì' : 'No'
            ]);
            if (item.isSubtractor) row.getCell(4).font = { color: { argb: 'C02128' } };
        });

        const totRow = worksheet.addRow(['', `Totale ${sec.title}`, '', sec.total, '']);
        totRow.getCell(2).font = { bold: true };
        totRow.getCell(4).font = { bold: true };
    });

    const totGenRes = worksheet.addRow(['TOTALE GENERALE RISORSE DISPONIBILI (FAD)', '', '', calculationResult.fondi.dipendente.summary.totaleFondo, '']);
    totGenRes.eachCell(c => c.style = totalStyle);
    worksheet.addRow([]);

    // ── QUADRO B: UTILIZZI (DESTINAZIONI) ──────────────────────────────────────
    const quadroBRow = worksheet.addRow(['QUADRO B: UTILIZZO DEL FONDO (DESTINAZIONI)']);
    quadroBRow.eachCell(c => c.style = sectionStyle);
    const headerQuadroB = worksheet.addRow(['CATEGORIA', 'VOCE', 'RIFERIMENTO', 'IMPORTO', '']);
    headerQuadroB.eachCell(c => c.style = headerStyle);

    let totalUtilizziTotal = 0;
    fondoDipendenti.utilizzi.forEach(sec => {
        worksheet.addRow([sec.title, '', '', '', '']).eachCell(c => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
        });

        sec.items.forEach(item => {
            worksheet.addRow(['', item.description, item.riferimentoNormativo || '', item.amount, '']);
            totalUtilizziTotal += item.amount;
        });

        const r = worksheet.addRow(['', `Totale ${sec.title}`, '', sec.total, '']);
        r.getCell(2).font = { bold: true };
        r.getCell(4).font = { bold: true };
    });

    const totGenUtil = worksheet.addRow(['TOTALE GENERALE UTILIZZI DEL FONDO', '', '', totalUtilizziTotal, '']);
    totGenUtil.eachCell(c => c.style = totalStyle);
    worksheet.addRow([]);

    // ── QUADRO C: VERIFICA LIMITI ART. 23 C. 2 ─────────────────────────────────
    const quadroCRow = worksheet.addRow(['QUADRO C: VERIFICA LIMITE ART. 23 C. 2 D.LGS. 75/2017']);
    quadroCRow.eachCell(c => c.style = sectionStyle);

    const art23 = fondoDipendenti.limiteArt23;

    worksheet.addRow(['DESCRIZIONE', '', '', 'VALORE', 'ESITO']);
    worksheet.addRow(['', 'Limite Art. 23 c. 2 (tetto 2016 ricalcolato)', '', art23.limite, '']);
    worksheet.addRow(['', 'Risorse soggette al limite (anno corrente)', '', art23.valoreSoggetto, '']);

    const esitoRow = worksheet.addRow(['', 'CAPIENZA (+) / SUPERAMENTO (-)', '', art23.delta, art23.esitoLabel]);
    esitoRow.getCell(4).font = { bold: true };
    esitoRow.getCell(5).font = { bold: true, color: { argb: WHITE } };
    esitoRow.getCell(5).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: art23.isCompliant ? '16A34A' : 'DC2626' }
    };
    esitoRow.getCell(5).alignment = { horizontal: 'center' };

    // ── ESPORTAZIONE ──────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Fondo_Dipendenti_${denominazioneEnte}_${annoRiferimento}.xlsx`);
};
