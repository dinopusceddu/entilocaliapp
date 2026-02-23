import { AreaQualifica, IvcConglobationData } from '../types';
import { IVC_VALUES } from '../constants';

/**
 * Calculates the total IVC Conglobation Reduction based on the mode (aggregated or analytic).
 * Formula: Monthly Value * 13 * Count (or Part-Time %)
 */
export const calculateIvcReduction = (data: IvcConglobationData): number => {
    let total = 0;

    // Sum Aggregated Counts (if any)
    if (data.aggregatedCounts) {
        Object.entries(data.aggregatedCounts).forEach(([area, count]) => {
            if (!count) return;
            const monthlyValue = IVC_VALUES[area as AreaQualifica];
            if (monthlyValue) {
                total += monthlyValue * 13 * count;
            }
        });
    }

    // Sum Analytic Employees (if any)
    if (data.analyticEmployees) {
        data.analyticEmployees.forEach(employee => {
            const monthlyValue = IVC_VALUES[employee.area];
            if (monthlyValue) {
                total += monthlyValue * 13 * (employee.partTimePercentage / 100);
            }
        });
    }

    return Number(total.toFixed(2));
};
