import Big from 'big.js';
import { HISTORICAL_LEVELS_MAP, NEW_DIFFERENTIALS_RULES } from '../data/ccnl2025_2027Tables';
import type { ContractualArea, HistoricalLevelCode, SpecialSectionKey } from '../data/ccnl2025_2027Tables';
import type { DifferentialBreakdownResult } from '../types/ccnl2025_2027SimulatorTypes';
import { money, sumMoney } from './ccnl2025_2027Math';

export function calculateDifferentialsBreakdown(p: {
  area: ContractualArea; historicalLevel: HistoricalLevelCode; newDifferentialsCount: number;
  specialSection: SpecialSectionKey; partTimePercentage: number;
}): DifferentialBreakdownResult {
  const level = HISTORICAL_LEVELS_MAP[p.historicalLevel];
  const rule = NEW_DIFFERENTIALS_RULES[p.area];
  if (!level || !rule || level.area !== p.area) throw new Error('Area e livello storico non coerenti');
  if (!Number.isInteger(p.newDifferentialsCount) || p.newDifferentialsCount < 0 || p.newDifferentialsCount > rule.maxAllowedCount) throw new Error('Numero differenziali non ammesso');
  if (!Number.isFinite(p.partTimePercentage) || p.partTimePercentage < 1 || p.partTimePercentage > 100) throw new Error('Percentuale non ammessa');
  if (p.specialSection !== 'NONE' && !rule.specialAddonsAnnual13m[p.specialSection]) throw new Error('Sezione speciale non ammessa');
  const ratio = new Big(p.partTimePercentage).div(100);
  const addon = rule.specialAddonsAnnual13m[p.specialSection] ?? 0;
  const singleAnnual = new Big(rule.baseAnnualAmount13m).plus(addon);
  const totalAnnual = singleAnnual.times(p.newDifferentialsCount);
  // Section 3.1: divide the aggregate annual amount, avoiding per-unit rounding drift.
  const totalMonthly = money(totalAnnual.div(13));
  const historicalEffective = money(new Big(level.monthlyDifferential13m).times(ratio));
  const monthlyEffective = money(new Big(totalMonthly).times(ratio));
  return {
    historicalLevelCode: p.historicalLevel, historicalMonthlyAmount13m: level.monthlyDifferential13m,
    historicalMonthlyEffective: historicalEffective, newDifferentialsCount: p.newDifferentialsCount, maxAllowedCount: rule.maxAllowedCount,
    singleNewDifferentialAnnualBase: rule.baseAnnualAmount13m, specialSectionAddonAnnual: addon,
    singleNewDifferentialAnnualTotal: money(singleAnnual), singleNewDifferentialMonthly13m: money(singleAnnual.div(13)),
    totalNewDifferentialsAnnual13m: money(totalAnnual), totalNewDifferentialsMonthly13m: totalMonthly,
    totalNewDifferentialsMonthlyEffective: monthlyEffective, combinedDifferentialsMonthlyEffective: sumMoney([historicalEffective, monthlyEffective]),
  };
}
