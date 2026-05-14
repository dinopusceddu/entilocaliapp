import { AreaQualifica, IvcConglobationData } from '../domain';
import { IVC_VALUES } from '../constants';

/**
 * @legacy Function name 'calculateIvcReduction' is maintained for backward compatibility.
 * @context Calculates the permanent fund reduction for the consolidation of 'Indennità di Comparto' (Art. 60 CCNL 2026).
 * @rule Formula: Annual Value (Tabella C) * FTE (Full-Time Equivalent).
 * @mensilità 12 months (no 13th month multiplier applied).
 */
export const calculateIvcReduction = (data: IvcConglobationData): number => {
    let total = 0;

    // Sum Aggregated Counts (if any)
    if (data.aggregatedCounts) {
        Object.entries(data.aggregatedCounts).forEach(([area, count]) => {
            if (!count) return;
            const annualValue = IVC_VALUES[area as AreaQualifica];
            if (annualValue) {
                total += annualValue * count;
            }
        });
    }

    // Sum Analytic Employees (if any)
    if (data.analyticEmployees) {
        data.analyticEmployees.forEach(employee => {
            const annualValue = IVC_VALUES[employee.area];
            if (annualValue) {
                total += annualValue * (employee.partTimePercentage / 100);
            }
        });
    }

    return Number(total.toFixed(2));
};
