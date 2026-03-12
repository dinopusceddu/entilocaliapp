// services/xlsReportService.ts
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type {
    FondoAccessorioDipendenteData,
    NormativeData,
    SimulatoreIncrementoRisultati,
    CalculatedFund,
    DistribuzioneRisorseData
} from '../types.ts';
import { getFadFieldDefinitions, getDistribuzioneFieldDefinitions } from '../pages/FondoAccessorioDipendentePageHelpers.ts';
import { getFadEffectiveValueHelper, calculateFadTotals } from '../logic/fundEngine.ts';

/**
 * Genera un file Excel (.xlsx) professionale con il dettaglio completo (Costituzione e Utilizzo)
 */
export const generateFondoDipendenteXLS = async (
    fadData: FondoAccessorioDipendenteData,
    annoRiferimento: number,
    simulatoreRisultati: SimulatoreIncrementoRisultati | undefined,
    isEnteInCondizioniSpeciali: boolean,
    incrementoEQconRiduzioneDipendenti: number | undefined,
    normativeData: NormativeData,
    calculatedFund: CalculatedFund,
    denominazioneEnte: string,
    distribuzioneData: DistribuzioneRisorseData
): Promise<void> => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fondo Dipendenti');

    const fadFieldDefinitions = getFadFieldDefinitions(normativeData);
    const distFieldDefinitions = getDistribuzioneFieldDefinitions(normativeData);
    const fadTotals = calculateFadTotals(fadData, simulatoreRisultati, isEnteInCondizioniSpeciali, incrementoEQconRiduzioneDipendenti, normativeData);

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

    const resSections = [
        { label: 'A.1) Risorse Stabili', key: 'stabili', total: fadTotals.sommaStabili_Dipendenti },
        { label: 'A.2) Risorse Variabili Soggette', key: 'vs_soggette', total: fadTotals.sommaVariabiliSoggette_Dipendenti },
        { label: 'A.3) Risorse Variabili Non Soggette', key: 'vn_non_soggette', total: fadTotals.sommaVariabiliNonSoggette_Dipendenti },
        { label: 'A.4) Altre Decurtazioni', key: 'fin_decurtazioni', total: fadTotals.altreRisorseDecurtazioniFinali_Dipendenti },
        { label: 'A.5) Verifica Rispetto Limiti', key: 'cl_limiti', total: fadTotals.decurtazioniLimiteSalarioAccessorio_Dipendenti }
    ];

    resSections.forEach(sec => {
        worksheet.addRow([sec.label, '', '', '', '']).eachCell(c => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
        });

        fadFieldDefinitions.filter(f => f.section === sec.key).forEach(f => {
            const val = getFadEffectiveValueHelper(f.key, (fadData as any)[f.key], f.isDisabledByCondizioniSpeciali, isEnteInCondizioniSpeciali, simulatoreRisultati, incrementoEQconRiduzioneDipendenti);
            if (val !== 0) {
                const row = worksheet.addRow([
                    '',
                    f.description,
                    f.riferimento,
                    f.isSubtractor ? -Math.abs(val) : val,
                    f.isRelevantToArt23Limit ? 'Sì' : 'No'
                ]);
                if (f.isSubtractor) row.getCell(4).font = { color: { argb: 'C02128' } };
            }
        });

        const totRow = worksheet.addRow(['', `Totale ${sec.label}`, '', sec.total, '']);
        totRow.getCell(2).font = { bold: true };
        totRow.getCell(4).font = { bold: true };
    });

    const totGenRes = worksheet.addRow(['TOTALE GENERALE RISORSE DISPONIBILI', '', '', fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti, '']);
    totGenRes.eachCell(c => c.style = totalStyle);
    worksheet.addRow([]);

    // ── QUADRO B: UTILIZZI (DESTINAZIONI) ──────────────────────────────────────
    const quadroBRow = worksheet.addRow(['QUADRO B: UTILIZZO DEL FONDO (DESTINAZIONI)']);
    quadroBRow.eachCell(c => c.style = sectionStyle);
    const headerQuadroB = worksheet.addRow(['CATEGORIA', 'VOCE', 'RIFERIMENTO', 'IMPORTO', '']);
    headerQuadroB.eachCell(c => c.style = headerStyle);

    const utilizes = [
        { label: 'B.1) Utilizzi Parte Stabile (Art. 80 c.1)', key: 'Utilizzi Parte Stabile (Art. 80 c.1)' },
        { label: 'B.2) Utilizzi Parte Variabile (Art. 80 c.2)', key: 'Utilizzi Parte Variabile (Art. 80 c.2)' }
    ];

    let totalUtilizzi = 0;
    utilizes.forEach(sec => {
        worksheet.addRow([sec.label, '', '', '', '']).eachCell(c => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
        });
        let secTot = 0;
        distFieldDefinitions.filter(f => f.section === sec.key).forEach(f => {
            const rawVal = (distribuzioneData as any)[f.key];
            const val = typeof rawVal === 'number' ? rawVal : (rawVal?.aBilancio || 0);

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

    const limite = calculatedFund.limiteArt23C2Modificato || calculatedFund.fondoBase2016;
    const soggette = calculatedFund.totaleRisorseSoggetteAlLimiteDaFondiSpecifici;
    const delta = limite - soggette;
    const conforme = delta >= 0;

    worksheet.addRow(['DESCRIZIONE', '', '', 'VALORE', 'ESITO']);
    worksheet.addRow(['', 'Limite 2016 (compreso adeguamento pro-capite)', '', limite, '']);
    worksheet.addRow(['', 'Risorse soggette al limite (anno corrente)', '', soggette, '']);

    const esitoRow = worksheet.addRow(['', 'CAPIENZA (+) / SUPERAMENTO (-)', '', delta, conforme ? 'CONFORME' : 'NON CONFORME']);
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
