import Big from 'big.js';
import { FinancialMath } from '../utils/financialMath';
export const money = (value: Big.BigSource): number => new Big(value).round(2, Big.roundHalfUp).toNumber();
export const sumMoney = (values: readonly number[]): number => FinancialMath.sumAll(...values);
export const ratioFor = (profile: { workTimeRegime: string; partTimePercentage: number }): Big =>
  new Big(profile.workTimeRegime === 'PART_TIME' ? profile.partTimePercentage : 100).div(100);
export const partTimeMonthlyHours = (profile: { partTimePercentage: number }): number =>
  new Big(156).times(profile.partTimePercentage).div(100).round(4, Big.roundHalfUp).toNumber();
export const minDate = (...dates: string[]): string => dates.filter(Boolean).sort()[0];
export const maxDate = (...dates: string[]): string => dates.filter(Boolean).sort().slice(-1)[0];
