import Big from 'big.js';
import FinancialMath from '../../utils/financialMath';
import type { Art33ApplicationAction } from './art33ApplicationPolicy';
export const DL144_EFFECTIVE_DATE = '2026-08-08';
export type Dl25Regime = 'HISTORICAL' | 'L296_DISAPPLIED' | 'TEMPORAL_REGIME_UNDETERMINED' | 'ART33_SCOPE_UNDETERMINED';
export function isDl25BusinessDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y,m,d] = value.split('-').map(Number);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  return y >= 2025 && m >= 1 && m <= 12 && d >= 1 && d <= [31,leap?29:28,31,30,31,30,31,31,30,31,30,31][m-1];
}
export function resolveDl25Regime(year: number | undefined, date: string | undefined, scope: Art33ApplicationAction): Dl25Regime {
  if (date !== undefined && (!isDl25BusinessDate(date) || (year !== undefined && Number(date.slice(0,4)) !== year))) return 'TEMPORAL_REGIME_UNDETERMINED';
  if (year !== undefined && year < 2026) return 'HISTORICAL';
  if (scope === 'SKIP') return 'HISTORICAL';
  if (scope === 'BLOCK') return 'ART33_SCOPE_UNDETERMINED';
  if (date) return date < DL144_EFFECTIVE_DATE ? 'HISTORICAL' : 'L296_DISAPPLIED';
  if (year !== undefined && year > 2026) return 'L296_DISAPPLIED';
  return 'TEMPORAL_REGIME_UNDETERMINED';
}

/** NET_FUND_AMOUNT is never divided. Only GROSS_EMPLOYER_COST is converted, DP=20. */
export function resolveDl25AvailableIncrement(input: {
  margin48Net: number; art33Gross: number; l296Gross?: number; employerChargesPercent: number; regime: Dl25Regime; allowDateIndifference?: boolean;
}) {
  const invalid = ![input.margin48Net,input.art33Gross,input.employerChargesPercent].every(Number.isFinite)
    || (input.l296Gross !== undefined && !Number.isFinite(input.l296Gross))
    || input.employerChargesPercent < 0 || input.employerChargesPercent >= 100;
  if (invalid) return { state: 'INVALID' as const, availableNet: undefined, art33Net: undefined, l296Net: undefined, dateIndifferent: false };
  const coefficient = new Big(1).plus(new Big(input.employerChargesPercent).div(100));
  const positive = (n: number) => new Big(n > 0 ? n : 0);
  const art33 = positive(input.art33Gross).div(coefficient);
  const margin48 = positive(input.margin48Net);
  const post = margin48.lt(art33) ? margin48 : art33;
  const historic = input.l296Gross !== undefined && Number.isFinite(input.l296Gross) ? positive(input.l296Gross).div(coefficient) : undefined;
  const pre = historic && historic.lt(post) ? historic : post;
  const uncertain = input.regime === 'TEMPORAL_REGIME_UNDETERMINED' || input.regime === 'ART33_SCOPE_UNDETERMINED';
  const indifferent = input.regime === 'TEMPORAL_REGIME_UNDETERMINED' && input.allowDateIndifference !== false && historic !== undefined && pre.eq(post);
  const determined = input.regime === 'L296_DISAPPLIED' || (!uncertain && historic !== undefined) || indifferent;
  const final = input.regime === 'L296_DISAPPLIED' ? post : pre;
  return { state: determined ? 'VALID' as const : 'UNDETERMINED' as const,
    availableNet: determined ? FinancialMath.roundTo2DP(Number(final.toString())) : undefined,
    art33Net: FinancialMath.roundTo2DP(Number(art33.toString())),
    l296Net: historic ? FinancialMath.roundTo2DP(Number(historic.toString())) : undefined,
    dateIndifferent: indifferent };
}
