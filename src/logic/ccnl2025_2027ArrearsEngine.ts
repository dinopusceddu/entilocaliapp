import Big from 'big.js';
import { IVC_ANTICIPATA_2025_2026_MENSILE, TABELLA_A_INCREMENTI_MENSILI } from '../data/ccnl2025_2027Tables';
import type { ArrearsAccessoryLine, ArrearsInput, ArrearsResult, ArrearsYearResult, CareerTranche, RateKey, SimulatorProfile } from '../types/ccnl2025_2027SimulatorTypes';
import { ArrearsInputSchema, SimulatorProfileSchema } from '../schemas/ccnl2025_2027SimulatorSchemas';
import { calculateRates } from './ccnl2025_2027RatesEngine';
import { HOUR_DEFINITIONS } from './ccnl2025_2027Defaults';
import { maxDate, minDate, money, ratioFor, sumMoney } from './ccnl2025_2027Math';

/** Commercial 30ths; full calendar months (including February) always equal one. */
function monthWeights(from: string, to: string, year: number, startMonth: number, rule: ArrearsInput['partialMonthRule'], serviceEnd: string): Big {
  let result = new Big(0);
  for (let month = startMonth; month <= 12; month++) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const monthStart = `${prefix}-01`, monthEnd = `${prefix}-${lastDay}`;
    const start = maxDate(from, monthStart), end = minDate(to, monthEnd);
    if (start > end) continue;
    const endDay = end === monthEnd ? 30 : Math.min(Number(end.slice(8)), 30);
    const startDay = Number(start.slice(8));
    const covered = Math.max(0, endDay - startDay + 1);
    let fraction = new Big(covered).div(30);
    if (rule === 'FIFTEEN_DAYS' && serviceEnd.startsWith(prefix) && serviceEnd !== monthEnd) {
      const serviceDays = Number(serviceEnd.slice(8));
      fraction = serviceDays < 15 ? new Big(0) : new Big(covered).div(Math.min(serviceDays, 30));
    }
    result = result.plus(fraction);
  }
  return result;
}

export function calculateArrears(profile: SimulatorProfile, arrears: ArrearsInput): ArrearsResult {
  const p = SimulatorProfileSchema.parse(profile);
  const a = ArrearsInputSchema.parse(arrears);
  const payrollCutoff = a.payrollAdjustmentMonth2026 === '2026-11' ? '2026-10-31' : '2026-11-30';
  const serviceEnd = a.serviceStatus === 'TERMINATED' ? a.terminationDate : '2026-12-31';
  const cutoffDate = minDate(payrollCutoff, serviceEnd);
  const tranches: CareerTranche[] = a.hasCareerChanges ? a.careerTranches : [{ id: 'unica', dateFrom: '2025-01-01', dateTo: serviceEnd, profile: p, hours2025: a.hours2025, hours2026: a.hours2026 }];
  const rows: ArrearsYearResult[] = [];
  for (const tranche of tranches) {
    for (const year of [2025, 2026] as const) {
      const dateFrom = maxDate(tranche.dateFrom, `${year}-01-01`);
      const dateTo = minDate(tranche.dateTo, `${year}-12-31`, serviceEnd);
      if (dateFrom > dateTo) continue;
      const ordinaryTo = minDate(dateTo, cutoffDate);
      const hasOrdinaryPeriod = dateFrom <= ordinaryTo;
      const months = monthWeights(dateFrom, ordinaryTo, year, 1, a.partialMonthRule, serviceEnd);
      const thirteenth = year === 2025 || (a.serviceStatus === 'TERMINATED' && serviceEnd.startsWith('2026'))
        ? monthWeights(dateFrom, dateTo, year, 1, a.partialMonthRule, serviceEnd).div(12) : new Big(0);
      const hasTerminationVacation = a.serviceStatus === 'TERMINATED' && a.unusedVacationDays > 0
        && serviceEnd >= dateFrom && serviceEnd <= dateTo;
      if (!hasOrdinaryPeriod && thirteenth.eq(0) && !hasTerminationVacation) continue;
      const area = tranche.profile.area;
      const increment = TABELLA_A_INCREMENTI_MENSILI[area][year === 2025 ? 'dal_2025_01_01' : 'dal_2026_01_01'];
      const ivc = IVC_ANTICIPATA_2025_2026_MENSILE[area];
      const exact2025 = year === 2025 && a.ivcDeductionMode === 'CONGUAGLIO_ESATTO_CEDOLINO';
      const ivcMonthly = a.ivcDeductionMode === 'LORDO_SENZA_SCORPORO' ? 0 : exact2025 ? ivc.ivc_2025_apr_dic_mensile : ivc.ivc_2026_mensile;
      const ivcMonths = exact2025 ? monthWeights(dateFrom, ordinaryTo, year, 4, a.partialMonthRule, serviceEnd) : months;
      const ratio = ratioFor(tranche.profile);
      const grossOrdinary = money(months.times(increment).times(ratio));
      const grossThirteenth = money(thirteenth.times(increment).times(ratio));
      const ivcDeducted = money(ivcMonths.plus(thirteenth).times(ivcMonthly).times(ratio));
      const netTabular = money(new Big(grossOrdinary).plus(grossThirteenth).minus(ivcDeducted));
      const old = calculateRates(tranche.profile, year === 2025 ? 'PRE_RINNOVO_2025' : 'PRE_RINNOVO_2026');
      const updated = calculateRates(tranche.profile, year === 2025 ? 'ARRETRATI_2025' : 'NOV_DEC_2026_REGIME');
      // No 13th-month IVC in the hourly correction: only the weighted ordinary-month IVC.
      const ivcDeductedPerMonth = months.gt(0) ? ivcMonths.div(months).times(ivcMonthly) : new Big(0);
      const usefulIncrement = a.accessoryDeltaMode === 'AL_NETTO_IVC_GIA_INCLUSA_NELLE_BASI'
        ? new Big(increment).minus(ivcDeductedPerMonth) : new Big(increment);
      const delta = usefulIncrement.div(old.hourlyDivisor);
      const delta13 = delta.times(13).div(12);
      const deltaRates: Record<RateKey, number> = { RB_Art26: delta.toNumber(), RT: delta.toNumber(), RBO: delta13.toNumber(), ROG: delta13.toNumber() };
      const hours = year === 2025 ? tranche.hours2025 : tranche.hours2026;
      const allIndemnityRates: ArrearsAccessoryLine[] = HOUR_DEFINITIONS
        .filter(d => tranche.profile.workTimeRegime === 'PART_TIME' || !d.key.startsWith('supplementary'))
        .map(d => {
          const oldUnitRate = new Big(old.rates[d.base]).times(d.multiplier);
          const deltaUnitRate = new Big(deltaRates[d.base]).times(d.multiplier);
          const quantity = hasOrdinaryPeriod ? hours[d.key] : 0;
          return { key: d.key, label: d.label, group: d.group, base: d.base, quantity,
            oldUnitRate: oldUnitRate.toNumber(), newUnitRate: oldUnitRate.plus(deltaUnitRate).toNumber(),
            deltaUnitRate: deltaUnitRate.toNumber(), unitRate: deltaUnitRate.toNumber(),
            multiplier: Number(d.multiplier), amount: money(deltaUnitRate.times(quantity)) };
        });
      const accessoryLines = allIndemnityRates.filter(line => line.quantity > 0);
      const unusedVacationArrearsDelta = hasTerminationVacation
        ? money(new Big(increment).div(updated.dailyDivisor).times(ratio).times(a.unusedVacationDays)) : 0;
      const accessoryTotal = sumMoney([...accessoryLines.map(l => l.amount), unusedVacationArrearsDelta]);
      rows.push({ trancheId: tranche.id, year, area, dateFrom, dateTo, ordinaryMonths: months.toNumber(), thirteenthFraction: thirteenth.toNumber(),
        ivcOrdinaryMonths: ivcMonths.toNumber(), partTimeRatio: ratio.toNumber(), monthlyIncrement: increment, ivcMonthly,
        grossOrdinary, grossThirteenth, ivcDeducted, netTabular, oldRates: old.rates, newRates: updated.rates, deltaRates,
        accessoryLines, allIndemnityRates, unusedVacationArrearsDelta, accessoryTotal, total: sumMoney([netTabular, accessoryTotal]) });
    }
  }
  const tabularTotal = sumMoney(rows.map(r => r.netTabular));
  const accessoryTotal = sumMoney(rows.map(r => r.accessoryTotal));
  let unusedVacationCompensation = 0;
  if (a.serviceStatus === 'TERMINATED') {
    const lastProfile = tranches.find(t => t.dateFrom <= serviceEnd && t.dateTo >= serviceEnd)?.profile ?? p;
    const endRates = calculateRates(lastProfile, serviceEnd.startsWith('2025') ? 'ARRETRATI_2025' : 'NOV_DEC_2026_REGIME');
    unusedVacationCompensation = money(new Big(endRates.RIM).div(endRates.dailyDivisor).times(a.unusedVacationDays));
  }
  return { cutoffDate, rows, tabularTotal, accessoryTotal, ivcTotal: sumMoney(rows.map(r => r.ivcDeducted)),
    total: sumMoney([tabularTotal, accessoryTotal]), unusedVacationCompensation,
    unusedVacationArrearsDelta: sumMoney(rows.map(r => r.unusedVacationArrearsDelta)) };
}
