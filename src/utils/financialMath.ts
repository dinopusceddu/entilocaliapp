import Big from 'big.js';
import { checkedMonetaryOutput, MonetaryBoundaryError, type MonetaryIssue } from '../domain/monetaryBoundary';

let checkedDepth = 0;
const checkedNumber = (value: Big): number => {
  // Legacy arithmetic-only callers retain their existing range checks. Application
  // conversions run in the checked scope and return an explicit invalid result.
  if (checkedDepth === 0) return Number(value.toString());
  const checked = checkedMonetaryOutput(value);
  if (checked.status === 'INVALID') throw new MonetaryBoundaryError([checked.issue]);
  return checked.value!;
};

/** Explicit checked API. Existing arithmetic stays unchanged in the valid domain. */
export function checkedMonetaryCalculation<T>(calculate: () => T): { status: 'VALID'; value: T } | { status: 'INVALID'; issues: readonly MonetaryIssue[] } {
  checkedDepth++;
  try { return { status: 'VALID', value: calculate() }; }
  catch (error) {
    if (error instanceof MonetaryBoundaryError) return { status: 'INVALID', issues: error.issues };
    // A native-number intermediate can become non-finite before reaching Big.js.
    // At this application boundary, numeric failure is an explicit invalid result.
    if (error instanceof Error && error.message === '[big.js] Invalid number') return { status: 'INVALID', issues: [{
      path: 'calculation', code: 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE', message: 'Risultato monetario non rappresentabile in sicurezza.',
    }] };
    throw error;
  }
  finally { checkedDepth--; }
}

export function checkedMonetarySum(values: readonly Big[], outputScale = 2) {
  return checkedMonetaryOutput(values.reduce((sum, value) => sum.plus(value), new Big(0)), 'aggregate', outputScale);
}

// Configuration for Big.js: Using round half-up for financial math
Big.RM = Big.roundHalfUp;
Big.DP = 20; // Internal precision (arbitrarily large to cover intermediate operations)

/**
 * Helper class for precise financial math using big.js to avoid IEEE 754 precision issues
 */
export const FinancialMath = {
  /**
   * Safely adds multiple generic values, rounding to 2 decimals at the end
   * @param values The numbers to sum
   * @returns The sum rounded to 2 decimal places
   */
  sumAll: (...values: (number | undefined | null)[]): number => {
    let result = new Big(0);
    for (const val of values) {
      if (typeof val === 'number') {
        result = result.plus(new Big(val));
      }
    }
    return checkedNumber(result.round(2));
  },

  /**
   * Safely subtracts multiple generic values sequentially from the first value.
   * @param base The base number to subtract from
   * @param values The numbers to subtract
   * @returns The result rounded to 2 decimal places
   */
  subtractAll: (base: number | undefined | null, ...values: (number | undefined | null)[]): number => {
    let result = new Big(base ?? 0);
    for (const val of values) {
      if (typeof val === 'number') {
        result = result.minus(new Big(val));
      }
    }
    return checkedNumber(result.round(2));
  },

  /**
   * Safely adds two numbers and returns a precise number without rounding (useful for intermediate calculations)
   */
  addExact: (a: number, b: number): number => {
    return checkedNumber(new Big(a).plus(new Big(b)));
  },

  /**
   * Safely subtracts two numbers and returns a precise number without rounding (useful for intermediate calculations)
   */
  subtractExact: (a: number, b: number): number => {
    return checkedNumber(new Big(a).minus(new Big(b)));
  },

  /**
   * Safely multiplies two numbers and returns a precise number without rounding
   */
  multiplyExact: (a: number, b: number): number => {
    return checkedNumber(new Big(a).times(new Big(b)));
  },

    /**
   * Safely rounds a number to exactly two decimal places
   */
    roundTo2DP: (val: number): number => {
        const safeVal = isNaN(val) || val === null || val === undefined ? 0 : val;
        return checkedNumber(new Big(safeVal).round(2));
    },

    /**
     * Ensures a value is a valid number, returning 0 if NaN or invalid.
     */
    safe: (val: any): number => {
        if (val === null || val === undefined || isNaN(val) || typeof val !== 'number') return 0;
        return val;
    }
};

export default FinancialMath;
