import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SimulatorInput } from '../types/ccnl2025_2027SimulatorTypes';
import { AREA_LABELS } from '../data/ccnl2025_2027Tables';
import { SimulatorInputSchema } from '../schemas/ccnl2025_2027SimulatorSchemas';
import { calculateRates } from '../logic/ccnl2025_2027RatesEngine';
import { calculateArrears } from '../logic/ccnl2025_2027ArrearsEngine';
import { calculateMonthlyPayslip } from '../logic/ccnl2025_2027PayslipEngine';
import { REGIME_LABELS } from '../logic/ccnl2025_2027Defaults';
import { sumMoney } from '../logic/ccnl2025_2027Math';
import Big from 'big.js';

const teal: [number, number, number] = [15, 118, 110];
const clean = (text: string) => text.replace(/[–—]/g, '-').replace(/→/g, '>').replace(/\u202f|\u00a0/g, ' ');
const currency = (n: number, digits = 2) => clean(n.toLocaleString('it-IT', { minimumFractionDigits: digits, maximumFractionDigits: digits })) + ' EUR';
export function buildCcnl20252027Pdf(input: SimulatorInput): jsPDF {
  const s = SimulatorInputSchema.parse(input);
  const a = calculateArrears(s.profile, s.arrears), m = calculateMonthlyPayslip(s);
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const heading = (title: string, subtitle: string) => {
    doc.setFillColor(...teal); doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(title, 14, 13);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text(clean(subtitle), 14, 22);
    doc.setTextColor(15, 23, 42);
  };
  const table = (startY: number, head: string[], body: string[][], fontSize = 8) => autoTable(doc, {
    startY, margin: { left: 14, right: 14, bottom: 18 }, head: [head], body: body.map(row => row.map(clean)),
    theme: 'striped', styles: { font: 'helvetica', fontSize, cellPadding: 1.6, overflow: 'linebreak', textColor: [15, 23, 42] },
    headStyles: { fillColor: teal, fontSize, textColor: 255 }, alternateRowStyles: { fillColor: [241, 245, 249] },
  });
  const trancheIds = [...new Set(a.rows.map(r => r.trancheId))];
  const rateText = (n: number) => clean(n.toLocaleString('it-IT', { minimumFractionDigits: 4, maximumFractionDigits: 4 }));
  const indemnities = a.rows.flatMap(r => {
    const year = `${r.year} / T${trancheIds.indexOf(r.trancheId) + 1}`;
    const lines = r.accessoryLines.map(l => [year, `${l.label} (${l.base})`, rateText(l.oldUnitRate), rateText(l.newUnitRate), rateText(l.deltaUnitRate), String(l.quantity), currency(l.amount)]);
    if (r.unusedVacationArrearsDelta > 0) {
      const profile = s.arrears.hasCareerChanges ? s.arrears.careerTranches.find(t => t.id === r.trancheId)!.profile : s.profile;
      const old = calculateRates(profile, r.year === 2025 ? 'PRE_RINNOVO_2025' : 'PRE_RINNOVO_2026');
      const oldDaily = new Big(old.RIM).div(old.dailyDivisor);
      const deltaDaily = new Big(r.monthlyIncrement).div(old.dailyDivisor).times(r.partTimeRatio);
      lines.push([year, 'Ferie non fruite gia liquidate (EUR/gg)', rateText(oldDaily.toNumber()), rateText(oldDaily.plus(deltaDaily).toNumber()), rateText(deltaDaily.toNumber()), String(s.arrears.unusedVacationDays), currency(r.unusedVacationArrearsDelta)]);
    }
    return lines;
  });
  const rateUnit = a.unusedVacationArrearsDelta > 0 ? 'EUR/h; ferie EUR/gg' : 'EUR/h';
  const indemnitiesTable = (startY: number) => autoTable(doc, {
    startY, margin: { left: 14, right: 14, bottom: 18 },
    head: [['Anno / tranche', 'Indennita e base', `Vecchia tariffa ${rateUnit}`, `Nuova tariffa ${rateUnit}`, `Delta +${rateUnit}`, 'Ore / gg', 'Arretrato EUR']],
    body: indemnities.map(row => row.map(clean)),
    styles: { font: 'helvetica', fontSize: 6.8, cellPadding: .8, minCellHeight: 4, textColor: [15, 23, 42] },
    headStyles: { fillColor: teal, textColor: 255 }, alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles: { 0: { cellWidth: 17 }, 1: { cellWidth: 61 }, 2: { cellWidth: 22 }, 3: { cellWidth: 22 }, 4: { cellWidth: 22 }, 5: { cellWidth: 15 }, 6: { cellWidth: 23 } },
  });
  const appendix = indemnities.length > 6;
  heading('Arretrati, costo orario e cedolino', 'Studio individuale - CCNL Funzioni Locali 2025-2027 - sottoscritto il 28.10.2026');
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text(clean(AREA_LABELS[s.profile.area]), 14, 41);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  const profileLines = [
    `Livello ${s.profile.historicalLevel} | ${s.profile.newDifferentialsCount} nuovi differenziali | Rapporto retributivo ${m.rates.partTimeRatio * 100}%`,
    `Storico mensile: ${currency(m.rates.differentials.historicalMonthlyEffective)} | Nuovi differenziali: ${currency(m.rates.differentials.totalNewDifferentialsMonthlyEffective)}`,
    `Sezione: ${s.profile.specialSection} | EQ: ${s.profile.isTitolareEQ ? 'Si' : 'No'}`,
    `Adeguamento: ${s.arrears.payrollAdjustmentMonth2026} | Servizio: ${s.arrears.serviceStatus === 'ACTIVE' ? 'Attivo' : 'Cessato il ' + s.arrears.terminationDate}`,
  ];
  profileLines.forEach((line, i) => doc.text(clean(line), 14, 49 + i * 5));
  const comparisons = ['PRE_RINNOVO_2026', 'NOV_DEC_2026_REGIME', 'DAL_GEN_2027_REGIME', 'DAL_LUG_2027_REGIME'] as const;
  const rates = comparisons.map(e => calculateRates(s.profile, e));
  table(75, ['Tariffa oraria', 'Pre-rinnovo 2026', 'Nov-Dic 2026', 'Gen-Giu 2027', 'Lug-Dic 2027'],
    (['RB_Art26', 'RBO', 'RT', 'ROG'] as const).map(key => [key, ...rates.map(r => currency(r.rates[key], 4))]));
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text('Arretrati 2025-2026', 14, 123);
  table(128, ['Anno', 'Lordo tabellare', 'IVC dedotta', 'Tabellare dopo IVC', 'Accessori', 'Totale'], [2025, 2026].map(year => {
    const rows = a.rows.filter(r => r.year === year);
    return [String(year), currency(sumMoney(rows.flatMap(r => [r.grossOrdinary, r.grossThirteenth]))), currency(sumMoney(rows.map(r => r.ivcDeducted))), currency(sumMoney(rows.map(r => r.netTabular))), currency(sumMoney(rows.map(r => r.accessoryTotal))), currency(sumMoney(rows.map(r => r.total)))];
  }), 7.5);
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...teal); doc.text(`Totale arretrati: ${currency(a.total)}`, 14, 166);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(15, 23, 42);
  const notes = [
    `Fine arretrati ordinari: ${a.cutoffDate}. Tranche elaborate: ${new Set(a.rows.map(r => r.trancheId)).size}. Dettaglio analitico nel file Excel.`,
    `Modalita IVC: ${s.arrears.ivcDeductionMode}.`,
    s.arrears.serviceStatus === 'ACTIVE' ? '13ª 2026 esclusa dagli arretrati: pagata sul nuovo tabellare nel cedolino di dicembre.' : `Ferie: differenziale ${currency(a.unusedVacationArrearsDelta)} incluso negli arretrati; compenso intero ${currency(a.unusedVacationCompensation)} esposto separatamente. Tariffe ferie in EUR/giorno.`,
    s.arrears.accessoryDeltaMode === 'INCREMENTO_TABELLARE_PIENO' ? 'Indennita: incremento tabellare pieno; banca ore a riposo: sola maggiorazione.' : 'Indennita: incremento al netto dell’IVC ordinaria media ponderata gia inclusa nelle basi; nessuna quota 13ª nella media.',
    'Calcoli secondo le formule analitiche del Master Blueprint v8.0, sez. 3.3. Gli esempi numerici delle slide non coincidono con tali formule.',
  ];
  let y = 180;
  if (indemnities.length && !appendix) {
    doc.setFont('helvetica', 'bold'); doc.text('Arretrati indennita dal 01.01.2025 / 01.01.2026', 14, 176); doc.setFont('helvetica', 'normal');
    indemnitiesTable(180);
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  }
  for (const note of notes) { const lines = doc.splitTextToSize(clean(note), 180); doc.text(lines, 14, y); y += lines.length * 4 + 3; }
  doc.addPage();
  heading('Simulazione busta paga mensile', `${REGIME_LABELS[s.regimeEpoch]} - Mese ${s.monthly.month} - Vista ${s.monthly.monthlyViewMode}`);
  const all = [
    ...m.fixedLines.filter(l => l.amount !== 0).map(l => ['A - ' + l.label, '-', String(l.quantity), currency(l.unitRate), currency(l.amount)]),
    ...m.hourlyLines.map(l => ['B - ' + l.label, l.base!, String(l.quantity), currency(l.unitRate), currency(l.amount)]),
    ...m.presenceLines.filter(l => l.quantity > 0).map(l => ['C - ' + l.label, '-', String(l.quantity), currency(l.unitRate), currency(l.amount)]),
    ['TOTALE CEDOLINO LORDO', '', '', '', currency(m.total)],
  ];
  autoTable(doc, { startY: 37, margin: { left: 14, right: 14, bottom: 62 }, head: [['Voce', 'Base', 'Ore / gg', 'Tariffa', 'Totale']], body: all.map(row => row.map(clean)),
    styles: { font: 'helvetica', fontSize: 7.2, cellPadding: .85, minCellHeight: 4.2, textColor: [15, 23, 42] },
    headStyles: { fillColor: teal, textColor: 255 }, alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles: { 0: { cellWidth: 92 }, 1: { cellWidth: 18 }, 2: { cellWidth: 18 }, 3: { cellWidth: 27 }, 4: { cellWidth: 27 } },
  });
  doc.setFillColor(240, 253, 244); doc.roundedRect(14, 238, 182, 25, 2, 2, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...teal); doc.text('Verifica indennita ferie - Art. 30 commi 1-bis e 18', 18, 244);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(15, 23, 42);
  doc.text(`Anno precedente: ${currency(m.vacationAllowance.previousYearTotal)} / 12 / 26 = ${currency(m.vacationAllowance.dailyAmount)} al giorno`, 18, 250);
  doc.text(`Soglia: ${currency(m.vacationAllowance.threshold)} | Erogabile: ${currency(m.vacationAllowance.amount)} | ${m.vacationAllowance.isInForce ? 'In vigore dal 01.01.2027' : 'Bloccata nel 2026'}`, 18, 256);
  doc.setFontSize(7);
  doc.text(['Riferimenti: CCNL 28.10.2026 artt. 18, 30, 35, 36-bis, 38; CCNL 23.02.2026 artt. 47 e 55;', 'CCNL 16.11.2022 artt. 25, 26, 32, 33, 74, 75 e sezioni speciali. Importi lordi prima di contributi e imposte.', 'Ferie non fruite: compensazione subordinata alle condizioni di legge e contratto.'], 14, 271);
  if (appendix) {
    doc.addPage();
    heading('Dettaglio arretrati sulle indennita', 'Dal 01.01.2025 e dal 01.01.2026 - Vecchia tariffa, nuova tariffa, delta unitario e ore effettive');
    doc.setFontSize(7); doc.text('Tariffe orarie in EUR/h; ferie non fruite in EUR/giorno. I totali includono solo il differenziale sulle ferie.', 14, 35);
    indemnitiesTable(40);
  }
  for (let page = 1; page <= doc.getNumberOfPages(); page++) {
    doc.setPage(page); doc.setFontSize(7); doc.setTextColor(100, 116, 139); doc.text(`Toolbox Funzioni Locali | Prospetto individuale | ${page} / ${doc.getNumberOfPages()}`, 14, 289);
  }
  return doc;
}
export function exportCcnl20252027Pdf(input: SimulatorInput): void {
  buildCcnl20252027Pdf(input).save(`Prospetto_CCNL_2025_2027_${input.profile.area}_${input.profile.historicalLevel}.pdf`);
}
