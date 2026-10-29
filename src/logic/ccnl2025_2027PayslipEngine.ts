import Big from 'big.js';
import type { RegimeEpoch } from '../data/ccnl2025_2027Tables';
import { CONTRACTUAL_ALLOWANCE_CONSTANTS as C } from '../data/ccnl2025_2027Tables';
import type { AccessoryHours, MonthlyResult, PayslipLine, RateKey, SimulatorInput, VacationAllowanceInput, VacationAllowanceResult } from '../types/ccnl2025_2027SimulatorTypes';
import { SimulatorInputSchema } from '../schemas/ccnl2025_2027SimulatorSchemas';
import { HOUR_DEFINITIONS } from './ccnl2025_2027Defaults';
import { calculateRates } from './ccnl2025_2027RatesEngine';
import { money, sumMoney } from './ccnl2025_2027Math';

export function calculateHourlyLines(hours: AccessoryHours, rates: Record<RateKey, number>, roundUnit: boolean, allowSupplementary = true): PayslipLine[] {
  return HOUR_DEFINITIONS.filter(d => hours[d.key] > 0 && (allowSupplementary || !d.key.startsWith('supplementary'))).map(d => {
    const exact = new Big(rates[d.base]).times(d.multiplier);
    const unitRate = roundUnit ? money(exact) : exact.toNumber();
    return { key: d.key, label: d.label, base: d.base, quantity: hours[d.key], unitRate, multiplier: Number(d.multiplier), amount: money(new Big(unitRate).times(hours[d.key])) };
  });
}
export function calculateVacationAccessoryDailyAllowance(input: VacationAllowanceInput, epoch: RegimeEpoch, partTimePercentage = 100): VacationAllowanceResult {
  const previousYearTotal = sumMoney([input.previousYearShift, input.previousYearExternalService, input.previousYearWorkingConditions]);
  const dailyAmount = money(new Big(previousYearTotal).div(C.DIVISORE_INDENNITA_FERIE_ART30));
  const threshold = input.prorateThresholdForPartTime ? money(new Big(C.SOGLIA_MINIMA_GIORNALIERA_FERIE_ART30).times(partTimePercentage).div(100)) : C.SOGLIA_MINIMA_GIORNALIERA_FERIE_ART30;
  const isInForce = epoch !== 'NOV_DEC_2026_REGIME';
  const eligible = isInForce && dailyAmount >= threshold;
  return { isInForce, eligible, previousYearTotal, dailyAmount, threshold, amount: eligible ? money(new Big(dailyAmount).times(input.vacationDays)) : 0,
    message: !isInForce ? 'In vigore dal 1° gennaio 2027 ex Art. 30 c. 18 CCNL 28.10.2026' : eligible ? 'Soglia raggiunta · Art. 30 c. 1-bis' : 'Media inferiore alla soglia giornaliera: indennità non erogabile' };
}
export function calculateMonthlyPayslip(input: SimulatorInput): MonthlyResult {
  const s = SimulatorInputSchema.parse(input);
  const m = s.monthly;
  const rates = calculateRates(s.profile, s.regimeEpoch);
  const isPartTime = s.profile.workTimeRegime === 'PART_TIME';
  const threshold = isPartTime ? new Big(m.contractualMonthlyHoursPartTime).times('.25') : new Big(0);
  const within = m.supplementaryManualOverride ? m.hours.supplementary15 : new Big(m.supplementaryHoursTotal).lte(threshold) ? m.supplementaryHoursTotal : threshold.toNumber();
  const beyond = m.supplementaryManualOverride ? m.hours.supplementary25 : new Big(m.supplementaryHoursTotal).minus(within).toNumber();
  const hours = { ...m.hours, supplementary15: isPartTime ? within : 0, supplementary25: isPartTime ? beyond : 0 };
  const hourlyLines = m.monthlyViewMode === 'SOLO_PRESENZA' ? [] : calculateHourlyLines(hours, rates.rates, true, isPartTime);
  const fixedLines = [...rates.fixedLines];
  if (m.month === 12) fixedLines.push({ key: 'thirteenth', label: '13ª mensilità · RIM Art. 75', quantity: 1, unitRate: rates.RIM, multiplier: 1, amount: rates.RIM });
  const p = m.presence;
  const vacationAllowance = calculateVacationAccessoryDailyAllowance(p, s.regimeEpoch, isPartTime ? s.profile.partTimePercentage : 100);
  const presenceEnabled = m.includePresenceAllowances && m.monthlyViewMode !== 'SOLO_ORARIE';
  const presenceLines: PayslipLine[] = presenceEnabled ? [
    ['conditions', 'Condizioni di lavoro · Art. 84-bis', p.workingConditionsDays, p.workingConditionsDailyRate],
    ['external', 'Servizio esterno PL · Art. 47', p.externalServiceDays, p.externalServiceDailyRate],
    ['availabilityWeekday', 'Reperibilità feriale · turni 12h', p.availabilityWeekdayShifts, p.availability12hRate],
    ['availabilityHoliday', 'Reperibilità festiva · turni 12h', p.availabilityHolidayShifts, money(new Big(p.availability12hRate).times(2))],
    ['cash', 'Maneggio valori', p.cashHandlingDays, p.cashHandlingDailyRate],
    ['vacation', 'Indennità ferie · Art. 30 c. 1-bis', p.vacationDays, vacationAllowance.eligible ? vacationAllowance.dailyAmount : 0],
  ].map(([key, label, quantity, rate]) => ({ key: String(key), label: String(label), quantity: Number(quantity), unitRate: Number(rate), multiplier: 1, amount: money(new Big(Number(quantity)).times(Number(rate))) })) : [];
  const fixedTotal = sumMoney(fixedLines.map(l => l.amount));
  const hourlyTotal = sumMoney(hourlyLines.map(l => l.amount));
  const presenceTotal = sumMoney(presenceLines.map(l => l.amount));
  return { rates, fixedLines, hourlyLines, presenceLines, vacationAllowance,
    supplementaryThreshold: threshold.toNumber(), supplementaryWithin: isPartTime ? within : 0, supplementaryBeyond: isPartTime ? beyond : 0,
    fixedTotal, hourlyTotal, presenceTotal, accessoryTotal: sumMoney([hourlyTotal, presenceTotal]), total: sumMoney([fixedTotal, hourlyTotal, presenceTotal]) };
}
