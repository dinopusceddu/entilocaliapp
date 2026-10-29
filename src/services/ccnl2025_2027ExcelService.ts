import * as XLSX from 'xlsx';
import Big from 'big.js';
import type { PayslipLine, RateEpoch, SimulatorInput } from '../types/ccnl2025_2027SimulatorTypes';
import { AREA_LABELS } from '../data/ccnl2025_2027Tables';
import { SimulatorInputSchema } from '../schemas/ccnl2025_2027SimulatorSchemas';
import { calculateRates } from '../logic/ccnl2025_2027RatesEngine';
import { calculateArrears } from '../logic/ccnl2025_2027ArrearsEngine';
import { calculateMonthlyPayslip } from '../logic/ccnl2025_2027PayslipEngine';
import { HOUR_DEFINITIONS, REGIME_LABELS } from '../logic/ccnl2025_2027Defaults';
import { money } from '../logic/ccnl2025_2027Math';

const SHEET_BASES = '1_Inquadramento_e_4_Basi';
const SHEET_ARREARS = '2_Arretrati_2025_2026';
const SHEET_MONTHLY = '3_Simulazione_Cedolino_Regime';
const format = '#,##0.00 "€"';
const formula = (sheet: XLSX.WorkSheet, address: string, f: string, v: number, z = format) => {
  // Positive monetary inputs: guard the half-cent against spreadsheet binary multiplication drift.
  const stableRounding = f.replace(/,2\)/g, '+1E-9,2)');
  sheet[address] = { t: 'n', f: stableRounding, v, z };
};
export function buildCcnl20252027Workbook(input: SimulatorInput): XLSX.WorkBook {
  const s = SimulatorInputSchema.parse(input);
  const a = calculateArrears(s.profile, s.arrears), m = calculateMonthlyPayslip(s);
  const epochs: RateEpoch[] = ['PRE_RINNOVO_2025', 'PRE_RINNOVO_2026', 'NOV_DEC_2026_REGIME', 'DAL_GEN_2027_REGIME', 'DAL_LUG_2027_REGIME'];
  const effective = epochs.map(e => calculateRates(s.profile, e));
  const fullTimeProfile = s.profile.workTimeRegime === 'PART_TIME' ? { ...s.profile, workTimeRegime: 'FULL_TIME_36H' as const, partTimePercentage: 100 } : s.profile;
  const fullTime = epochs.map(e => calculateRates(fullTimeProfile, e));
  const first: (string | number)[][] = [
    ['CCNL 2025–2027 · Inquadramento e quattro basi'], ['Area', AREA_LABELS[s.profile.area]], ['Livello storico', s.profile.historicalLevel],
    ['Nuovi differenziali', s.profile.newDifferentialsCount], ['Sezione speciale', s.profile.specialSection],
    ['Percentuale retributiva', money(new Big(m.rates.partTimeRatio).times(100))], ['Epoca selezionata', REGIME_LABELS[s.regimeEpoch]],
    ['Modalità IVC', s.arrears.ivcDeductionMode], ['Fonte', 'Master Blueprint v8.0, Tabelle A/B/C e formule §3.1–3.4; importi lordi prima di contributi e imposte'],
    ['Componenti seguenti: euro mensili equivalenti al tempo pieno; basi effettive nelle righe 25–28'],
    ['Voce', 'Pre-rinnovo 2025', 'Pre-rinnovo 2026', 'Nov–Dic 2026', 'Gen–Giu 2027', 'Lug–Dic 2027'],
    ...fullTime[0].fixedLines.map((line, i) => [line.label, ...fullTime.map(r => r.fixedLines[i].amount)]),
    [], ['RBM · b effettiva'], ['RBM + 13ª · b effettiva'], ['RIM · c effettiva'], ['RGF · d effettiva'], ['Divisore orario effettivo'], ['Divisore giornaliero'],
    ['RB_Art26 · €/h'], ['RBO · €/h'], ['RT · €/h'], ['ROG · €/h'], ['Totale fisso mensile effettivo'],
  ];
  const bSheet = XLSX.utils.aoa_to_sheet(first);
  effective.forEach((r, index) => {
    const col = XLSX.utils.encode_col(index + 1);
    for (let row = 12; row <= 23; row++) bSheet[`${col}${row}`].z = format;
    formula(bSheet, `${col}25`, `ROUND(SUM(${col}12:${col}16)*$B$6/100,2)`, r.RBM);
    formula(bSheet, `${col}26`, `ROUND(SUM(${col}12:${col}16)*13/12*$B$6/100,2)`, r.RBM_con13);
    formula(bSheet, `${col}27`, `ROUND(SUM(${col}12:${col}19)*$B$6/100,2)`, r.RIM);
    formula(bSheet, `${col}28`, `ROUND((SUM(${col}12:${col}19)*13/12+SUM(${col}20:${col}23))*$B$6/100,2)`, r.RGF);
    formula(bSheet, `${col}29`, `${r.hourlyDivisor}*$B$6/100`, r.effectiveHourlyDivisor, '0.0000');
    bSheet[`${col}30`] = { t: 'n', v: r.dailyDivisor };
    formula(bSheet, `${col}31`, `SUM(${col}12:${col}16)*$B$6/100/${col}29`, r.rates.RB_Art26, '0.0000 "€"');
    formula(bSheet, `${col}32`, `${col}31*13/12`, r.rates.RBO, '0.0000 "€"');
    formula(bSheet, `${col}33`, `SUM(${col}12:${col}19)*$B$6/100/${col}29`, r.rates.RT, '0.0000 "€"');
    formula(bSheet, `${col}34`, `(SUM(${col}12:${col}19)*13/12+SUM(${col}20:${col}23))*$B$6/100/${col}29`, r.rates.ROG, '0.0000 "€"');
    formula(bSheet, `${col}35`, `SUM(${Array.from({ length: 12 }, (_, i) => `ROUND(${col}${i + 12}*$B$6/100,2)`).join(',')})`, r.fixedMonthlyTotal);
  });
  const selectedCol = XLSX.utils.encode_col(epochs.indexOf(s.regimeEpoch) + 1);
  const arrearsData: (string | number)[][] = [
    ['Arretrati dal 01.01.2025 · dettaglio per tranche'], ['Fine arretrati ordinari', a.cutoffDate], ['Metodo IVC tabellare', s.arrears.ivcDeductionMode, '', 'Base ricalcolo indennità', s.arrears.accessoryDeltaMode],
    ['Ore effettive nei periodi di arretrato. Ferie già liquidate: nei totali si somma solo il differenziale.'],
    ['Tranche', 'Anno', 'Area', 'Mesi', 'Quota 13ª', 'Rapporto PT', 'Incremento', 'Mesi IVC', 'IVC mensile', 'Lordo ordinario', 'Lordo 13ª', 'IVC dedotta', 'Tabellare dopo IVC', 'Accessori', 'Totale'],
    ...a.rows.map(r => [r.trancheId, r.year, r.area, r.ordinaryMonths, r.thirteenthFraction, r.partTimeRatio, r.monthlyIncrement, r.ivcOrdinaryMonths, r.ivcMonthly, r.grossOrdinary, r.grossThirteenth, r.ivcDeducted, r.netTabular, r.accessoryTotal, r.total]),
    ['TOTALE'], [], ['Compenso ferie non fruite · separato', a.unusedVacationCompensation], [],
    ['Tranche', 'Anno / decorrenza', 'Indennità', 'Base / unità', 'Vecchia Tariffa (€/h)', 'Nuova Tariffa (€/h)', 'Delta (+Δ €/h)', 'Ore 2025/2026 o giorni ferie', 'Arretrato (€)', 'Base precedente', 'Moltiplicatore', 'Divisore', 'Quota 13ª', 'IVC media ordinaria'],
  ];
  const detailStart = arrearsData.length + 1;
  const details = a.rows.flatMap((r, i) => {
    const profile = s.arrears.hasCareerChanges ? s.arrears.careerTranches.find(t => t.id === r.trancheId)!.profile : s.profile;
    const old = calculateRates(profile, r.year === 2025 ? 'PRE_RINNOVO_2025' : 'PRE_RINNOVO_2026');
    const hourly = r.allIndemnityRates.map(line => ({ r, i, line,
      oldBase: r.oldRates[line.base!], divisor: old.hourlyDivisor,
      thirteenth: line.base === 'RBO' || line.base === 'ROG', isVacation: false,
    }));
    if (r.unusedVacationArrearsDelta > 0) {
      const oldUnitRate = new Big(old.RIM).div(old.dailyDivisor);
      const deltaUnitRate = new Big(r.monthlyIncrement).div(old.dailyDivisor).times(r.partTimeRatio);
      hourly.push({ r, i, oldBase: old.RIM, divisor: old.dailyDivisor, thirteenth: false, isVacation: true,
        line: { key: 'unusedVacation', label: 'Ferie non fruite già liquidate · tariffe €/giorno', group: 'Ferie · Art. 30 c. 16', base: 'RT',
          quantity: s.arrears.unusedVacationDays, multiplier: 1, unitRate: deltaUnitRate.toNumber(),
          oldUnitRate: oldUnitRate.toNumber(), newUnitRate: oldUnitRate.plus(deltaUnitRate).toNumber(), deltaUnitRate: deltaUnitRate.toNumber(), amount: r.unusedVacationArrearsDelta } });
    }
    return hourly;
  });
  details.forEach(({ r, line, oldBase, divisor, thirteenth, isVacation }) => arrearsData.push([
    r.trancheId, `${r.year} · dal 01.01.${r.year}`, line.label, isVacation ? 'RIM / gg · €/gg' : line.base!,
    line.oldUnitRate, line.newUnitRate, line.deltaUnitRate, line.quantity, line.amount,
    oldBase, line.multiplier, divisor, thirteenth ? new Big(13).div(12).toNumber() : 1, 0,
  ]));
  const aSheet = XLSX.utils.aoa_to_sheet(arrearsData);
  a.rows.forEach((r, i) => {
    const n = i + 6;
    formula(aSheet, `J${n}`, `ROUND(D${n}*F${n}*G${n},2)`, r.grossOrdinary);
    formula(aSheet, `K${n}`, `ROUND(E${n}*F${n}*G${n},2)`, r.grossThirteenth);
    formula(aSheet, `L${n}`, `ROUND((H${n}+E${n})*F${n}*I${n},2)`, r.ivcDeducted);
    formula(aSheet, `M${n}`, `J${n}+K${n}-L${n}`, r.netTabular);
    const terms = details.map((d, j) => d.i === i ? `I${detailStart + j}` : '').filter(Boolean);
    formula(aSheet, `N${n}`, terms.length ? `SUM(${terms.join(',')})` : '0', r.accessoryTotal);
    formula(aSheet, `O${n}`, `M${n}+N${n}`, r.total);
  });
  details.forEach(({ r, i, line, thirteenth, isVacation }, j) => {
    const n = detailStart + j, source = i + 6;
    const rateFormat = '0.000000 "€"';
    const ivcAverage = r.ordinaryMonths > 0 ? new Big(r.ivcOrdinaryMonths).div(r.ordinaryMonths).times(r.ivcMonthly).toNumber() : 0;
    formula(aSheet, `N${n}`, `IF($D$${source}>0,$H$${source}/$D$${source}*$I$${source},0)`, ivcAverage, '0.000000 "€"');
    formula(aSheet, `E${n}`, isVacation ? `J${n}/L${n}` : `J${n}*K${n}`, line.oldUnitRate, rateFormat);
    if (thirteenth) formula(aSheet, `M${n}`, '13/12', new Big(13).div(12).toNumber(), '0.000000');
    formula(aSheet, `G${n}`, isVacation ? `$G$${source}*$F$${source}/L${n}`
      : `($G$${source}-IF($E$3="AL_NETTO_IVC_GIA_INCLUSA_NELLE_BASI",N${n},0))/L${n}*M${n}*K${n}`, line.deltaUnitRate, rateFormat);
    formula(aSheet, `F${n}`, `E${n}+G${n}`, line.newUnitRate, rateFormat);
    formula(aSheet, `I${n}`, `ROUND(H${n}*G${n},2)`, line.amount);
  });
  const arrearsTotalRow = a.rows.length + 6;
  for (const [col, value] of [['L', a.ivcTotal], ['M', a.tabularTotal], ['N', a.accessoryTotal], ['O', a.total]] as const)
    formula(aSheet, `${col}${arrearsTotalRow}`, a.rows.length ? `SUM(${col}6:${col}${arrearsTotalRow - 1})` : '0', value);
  const monthlyData: (string | number)[][] = [
    ['Simulazione cedolino mensile · importi lordi'], ['Epoca', REGIME_LABELS[s.regimeEpoch]], ['Mese', s.monthly.month],
    ['Vista', s.monthly.monthlyViewMode], ['Ore PT concordate', s.monthly.contractualMonthlyHoursPartTime], ['Ore supplementari totali', s.monthly.supplementaryHoursTotal],
    ['Soglia supplementare 25%', m.supplementaryThreshold], ['Entro soglia', m.supplementaryWithin], ['Oltre soglia', m.supplementaryBeyond],
    ['Voce / Quadro', 'Base', 'Quantità', 'Tariffa unitaria', 'Moltiplicatore', 'Importo lordo'],
  ];
  const hourlyLines = s.monthly.monthlyViewMode === 'SOLO_PRESENZA' ? [] : HOUR_DEFINITIONS.filter(d => s.profile.workTimeRegime === 'PART_TIME' || !d.key.startsWith('supplementary')).map(d => m.hourlyLines.find(l => l.key === d.key) ?? {
    key: d.key, label: d.label, base: d.base, quantity: 0, unitRate: money(new Big(m.rates.rates[d.base]).times(d.multiplier)), multiplier: Number(d.multiplier), amount: 0,
  });
  const allLines = [...m.fixedLines, ...hourlyLines, ...m.presenceLines];
  allLines.forEach(line => monthlyData.push([line.label, line.base ?? '', line.quantity, line.unitRate, line.multiplier, line.amount]));
  const monthlyTotalRow = monthlyData.length + 1;
  monthlyData.push(['TOTALE CEDOLINO', '', '', '', '', m.total], [], ['Verifica ferie Art. 30 c. 1-bis'],
    ['Totale anno precedente', m.vacationAllowance.previousYearTotal], ['Divisore fisso', 312], ['Media giornaliera', m.vacationAllowance.dailyAmount],
    ['Soglia giornaliera', m.vacationAllowance.threshold], ['In vigore', m.vacationAllowance.isInForce ? 1 : 0], ['Giorni ferie', s.monthly.presence.vacationDays], ['Indennità erogabile', m.vacationAllowance.amount]);
  const mSheet = XLSX.utils.aoa_to_sheet(monthlyData);
  formula(mSheet, 'B7', s.profile.workTimeRegime === 'PART_TIME' ? 'B5*25/100' : '0', m.supplementaryThreshold, '0.0000');
  formula(mSheet, 'B8', s.profile.workTimeRegime !== 'PART_TIME' ? '0' : s.monthly.supplementaryManualOverride ? String(m.supplementaryWithin) : 'MIN(B6,B7)', m.supplementaryWithin, '0.0000');
  formula(mSheet, 'B9', s.profile.workTimeRegime !== 'PART_TIME' ? '0' : s.monthly.supplementaryManualOverride ? String(m.supplementaryBeyond) : 'MAX(0,B6-B7)', m.supplementaryBeyond, '0.0000');
  const ref = (row: number) => `'${SHEET_BASES}'!${selectedCol}${row}`;
  allLines.forEach((line: PayslipLine, i) => {
    const n = i + 11;
    if (line.base) {
      const rateRow = { RB_Art26: 31, RBO: 32, RT: 33, ROG: 34 }[line.base];
      formula(mSheet, `D${n}`, `ROUND(${ref(rateRow)}*E${n},2)`, line.unitRate);
      if (line.key === 'supplementary15' || line.key === 'supplementary25') formula(mSheet, `C${n}`, line.key === 'supplementary15' ? '$B$8' : '$B$9', line.quantity, '0.0000');
    } else {
      const source = m.rates.fixedLines.findIndex(l => l.key === line.key);
      if (source >= 0) formula(mSheet, `D${n}`, `ROUND(${ref(source + 12)}*'${SHEET_BASES}'!$B$6/100,2)`, line.unitRate);
      if (line.key === 'thirteenth') formula(mSheet, `D${n}`, ref(27), line.unitRate);
    }
    formula(mSheet, `F${n}`, `ROUND(C${n}*D${n},2)`, line.amount);
  });
  formula(mSheet, `F${monthlyTotalRow}`, `SUM(F11:F${monthlyTotalRow - 1})`, m.total);
  const vacationStart = monthlyTotalRow + 3;
  if (s.monthly.presence.prorateThresholdForPartTime && s.profile.workTimeRegime === 'PART_TIME')
    formula(mSheet, `B${vacationStart + 3}`, `ROUND(3*'${SHEET_BASES}'!$B$6/100,2)`, m.vacationAllowance.threshold);
  formula(mSheet, `B${vacationStart + 2}`, `ROUND(B${vacationStart}/B${vacationStart + 1},2)`, m.vacationAllowance.dailyAmount);
  formula(mSheet, `B${vacationStart + 6}`, `IF(AND(B${vacationStart + 4}=1,B${vacationStart + 2}>=B${vacationStart + 3}),ROUND(B${vacationStart + 2}*B${vacationStart + 5},2),0)`, m.vacationAllowance.amount);
  const vacationLine = allLines.findIndex(l => l.key === 'vacation');
  if (vacationLine >= 0) formula(mSheet, `D${vacationLine + 11}`, `IF(AND(B${vacationStart + 4}=1,B${vacationStart + 2}>=B${vacationStart + 3}),B${vacationStart + 2},0)`, allLines[vacationLine].unitRate);
  bSheet['!cols'] = [{ wch: 56 }, ...epochs.map(() => ({ wch: 22 }))];
  aSheet['!cols'] = [24, 26, 62, 26, 24, 24, 22, 34, 22, 24, 18, 18, 18, 26, 22].map(wch => ({ wch }));
  mSheet['!cols'] = [{ wch: 62 }, { wch: 24 }, { wch: 16 }, { wch: 21 }, { wch: 18 }, { wch: 22 }];
  bSheet['!merges'] = ['A1:F1', 'B2:F2', 'B5:F5', 'B7:F7', 'B8:F8', 'B9:F9', 'A10:F10'].map(XLSX.utils.decode_range);
  aSheet['!merges'] = ['A1:O1', 'A4:O4', 'B3:C3', 'E3:O3'].map(XLSX.utils.decode_range);
  mSheet['!merges'] = ['A1:F1'].map(XLSX.utils.decode_range);
  bSheet['!rows'] = Array.from({ length: 35 }, (_, i) => ({ hpt: i === 8 || i === 9 ? 32 : 22 }));
  aSheet['!rows'] = Array.from({ length: arrearsData.length }, (_, i) => ({ hpt: i === 3 ? 32 : 22 }));
  mSheet['!rows'] = Array.from({ length: monthlyData.length }, () => ({ hpt: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, bSheet, SHEET_BASES); XLSX.utils.book_append_sheet(wb, aSheet, SHEET_ARREARS); XLSX.utils.book_append_sheet(wb, mSheet, SHEET_MONTHLY);
  wb.Props = { Title: 'Calcolatore individuale CCNL 2025–2027', Subject: 'Formule analitiche Master Blueprint v8.0', Author: 'Toolbox Funzioni Locali' };
  return wb;
}
export function exportCcnl20252027Excel(input: SimulatorInput): void {
  XLSX.writeFile(buildCcnl20252027Workbook(input), `Prospetto_CCNL_2025_2027_${input.profile.area}_${input.profile.historicalLevel}.xlsx`, { cellStyles: true });
}
