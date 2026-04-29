// services/xlsReportService.ts
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
    NormativeData,
    CalculationResult,
    DistribuzioneRisorseData
} from '../domain';
import { getDistribuzioneFieldDefinitions } from '../logic/fundFieldDefinitions';

/**
 * Genera un file Excel (.xlsx) professionale con il dettaglio completo (Costituzione e Utilizzo)
 */
export const generateFondoDipendenteXLS = async (
    calculationResult: CalculationResult,
    denominazioneEnte: string,
    distribuzioneData: DistribuzioneRisorseData,
    normativeData: NormativeData
): Promise<void> => {
    const { metadata, fondi, compliance } = calculationResult;
    const annoRiferimento = metadata.annoRiferimento;
    const dipRes = fondi.dipendente;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fondo Dipendenti');

    const distFieldDefinitions = getDistribuzioneFieldDefinitions(normativeData);

    const BORDEAUX = '994D51';
    const LIGHT_GRAY = 'F9FAFB';
    const WHITE = 'FFFFFF';

    // ── STILI COMUNI ──────────────────────────────────────────────────────────
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

    if (dipRes.constitution) {
        const sections = dipRes.constitution.sections;
        Object.values(sections).forEach(sec => {
            worksheet.addRow([sec.title, '', '', '', '']).eachCell(c => {
                c.font = { bold: true };
                c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
            });

            sec.items.forEach(item => {
                if (item.amount !== 0) {
                    const row = worksheet.addRow([
                        '',
                        item.description,
                        item.riferimentoNormativo || '',
                        item.isSubtractor ? -Math.abs(item.amount) : item.amount,
                        item.isRelevantToArt23Limit ? 'Sì' : 'No'
                    ]);
                    if (item.isSubtractor) row.getCell(4).font = { color: { argb: 'C02128' } };
                }
            });

            const totRow = worksheet.addRow(['', `Totale ${sec.title}`, '', sec.total, '']);
            totRow.getCell(2).font = { bold: true };
            totRow.getCell(4).font = { bold: true };
        });
    }

    const totGenRes = worksheet.addRow(['TOTALE GENERALE RISORSE DISPONIBILI (FAD)', '', '', dipRes.summary.totaleFondo, '']);
    totGenRes.eachCell(c => c.style = totalStyle);
    worksheet.addRow([]);

    // ── QUADRO B: UTILIZZI (DESTINAZIONI) ──────────────────────────────────────
    const quadroBRow = worksheet.addRow(['QUADRO B: UTILIZZO DEL FONDO (DESTINAZIONI)']);
    quadroBRow.eachCell(c => c.style = sectionStyle);
    const headerQuadroB = worksheet.addRow(['CATEGORIA', 'VOCE', 'RIFERIMENTO', 'IMPORTO', '']);
    headerQuadroB.eachCell(c => c.style = headerStyle);

    const utilizes = [
        { label: 'B.1) Utilizzi Parte Stabile', sectionKey: 'stabili' },
        { label: 'B.2) Utilizzi Parte Variabile', sectionKey: 'variabili' }
    ];

    let totalUtilizzi = 0;
    utilizes.forEach(sec => {
        worksheet.addRow([sec.label, '', '', '', '']).eachCell(c => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
        });
        let secTot = 0;
        distFieldDefinitions.filter(f => f.section === sec.sectionKey).forEach(f => {
            const rawVal = (distribuzioneData as any)[f.key];
            const val = typeof rawVal === 'number' ? rawVal : (rawVal?.stanziate || 0);

            if (val !== 0) {
                worksheet.addRow(['', f.description, f.riferimento, val, '']);
                secTot += val;
                totalUtilizzi += val;
            }
        });
        const r = worksheet.addRow(['', `Totale ${sec.label}`, '', secTot, '']);
        r.getCell(2).font = { bold: true };
        r.getCell(4).font = { bold: true };
    });

    const totGenUtil = worksheet.addRow(['TOTALE GENERALE UTILIZZI DEL FONDO', '', '', totalUtilizzi, '']);
    totGenUtil.eachCell(c => c.style = totalStyle);
    worksheet.addRow([]);

    // ── QUADRO C: VERIFICA LIMITI ART. 23 C. 2 ─────────────────────────────────
    const quadroCRow = worksheet.addRow(['QUADRO C: VERIFICA LIMITE ART. 23 C. 2 D.LGS. 75/2017']);
    quadroCRow.eachCell(c => c.style = sectionStyle);

    const art23 = compliance.art23c2;
    const conforme = art23.isCompliant;

    worksheet.addRow(['DESCRIZIONE', '', '', 'VALORE', 'ESITO']);
    worksheet.addRow(['', 'Limite Art. 23 c. 2 (tetto 2016 ricalcolato)', '', art23.limite, '']);
    worksheet.addRow(['', 'Risorse soggette al limite (anno corrente)', '', art23.valoreSoggetto, '']);

    const esitoRow = worksheet.addRow(['', 'CAPIENZA (+) / SUPERAMENTO (-)', '', art23.delta, conforme ? 'CONFORME' : 'NON CONFORME']);
    esitoRow.getCell(4).font = { bold: true };
    esitoRow.getCell(5).font = { bold: true, color: { argb: WHITE } };
    esitoRow.getCell(5).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: conforme ? '16A34A' : 'DC2626' }
    };
    esitoRow.getCell(5).alignment = { horizontal: 'center' };

    // ── ESPORTAZIONE ──────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Fondo_Dipendenti_${denominazioneEnte}_${annoRiferimento}.xlsx`);
};
