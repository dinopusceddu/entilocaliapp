import Big from 'big.js';

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
    return Number(result.round(2).toString());
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
    return Number(result.round(2).toString());
  },

  /**
   * Safely adds two numbers and returns a precise number without rounding (useful for intermediate calculations)
   */
  addExact: (a: number, b: number): number => {
    return Number(new Big(a).plus(new Big(b)).toString());
  },

  /**
   * Safely subtracts two numbers and returns a precise number without rounding (useful for intermediate calculations)
   */
  subtractExact: (a: number, b: number): number => {
    return Number(new Big(a).minus(new Big(b)).toString());
  },

  /**
   * Safely multiplies two numbers and returns a precise number without rounding
   */
  multiplyExact: (a: number, b: number): number => {
    return Number(new Big(a).times(new Big(b)).toString());
  },

    /**
   * Safely rounds a number to exactly two decimal places
   */
    roundTo2DP: (val: number): number => {
        return Number(new Big(val).round(2).toString());
    }
};

export default FinancialMath;
