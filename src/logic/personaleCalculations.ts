import { PersonaleServizioDettaglio, NormativeData } from '../types';

export const calculateServiceRatio = (employee: PersonaleServizioDettaglio, annoRiferimento: number): number => {
    if (employee.fullYearService) return 1;

    if (!employee.assunzioneDate && !employee.cessazioneDate) return 0;

    const yearStartDate = new Date(annoRiferimento, 0, 1);
    const yearEndDate = new Date(annoRiferimento, 11, 31, 23, 59, 59, 999);

    const startDate = employee.assunzioneDate ? new Date(employee.assunzioneDate) : yearStartDate;
    const endDate = employee.cessazioneDate ? new Date(employee.cessazioneDate) : yearEndDate;

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) return 0;

    const effectiveStart = startDate > yearStartDate ? startDate : yearStartDate;
    const effectiveEnd = endDate < yearEndDate ? endDate : yearEndDate;

    if (effectiveEnd < effectiveStart) return 0;

    const diffTime = effectiveEnd.getTime() - effectiveStart.getTime();
    const serviceDaysInYear = (diffTime / (1000 * 60 * 60 * 24)) + 1;

    const isLeap = new Date(annoRiferimento, 1, 29).getDate() === 29;
    const daysInYear = isLeap ? 366 : 365;

    return Math.max(0, Math.min(1, serviceDaysInYear / daysInYear));
};

export const calculateAbsorbedProgression = (
    employeeList: PersonaleServizioDettaglio[],
    annoRiferimento: number,
    normativeData: NormativeData
): number => {
    return (employeeList || []).reduce((sum, employee) => {
        if (employee.areaQualifica && employee.livelloPeoStoriche) {
            const areaValues = normativeData.progression_economic_values[employee.areaQualifica];
            const progressionValue = areaValues?.[employee.livelloPeoStoriche];
            if (typeof progressionValue === 'number') {
                const ptPercentage = (employee.partTimePercentage ?? 100) / 100;
                const serviceRatio = calculateServiceRatio(employee, annoRiferimento);
                return sum + (progressionValue * ptPercentage * serviceRatio);
            }
        }
        return sum;
    }, 0);
};

export const calculateAbsorbedIndennitaComparto = (
    employeeList: PersonaleServizioDettaglio[],
    annoRiferimento: number,
    normativeData: NormativeData
): number => {
    return (employeeList || []).reduce((sum, employee) => {
        if (employee.areaQualifica) {
            const indennitaValue = normativeData.indennita_comparto_values[employee.areaQualifica];
            if (typeof indennitaValue === 'number') {
                const ptPercentage = (employee.partTimePercentage ?? 100) / 100;
                const serviceRatio = calculateServiceRatio(employee, annoRiferimento);
                return sum + (indennitaValue * ptPercentage * serviceRatio);
            }
        }
        return sum;
    }, 0);
};

export const calculateTotalDipendentiEquivalenti = (
    employeeList: PersonaleServizioDettaglio[],
    annoRiferimento: number
): number => {
    return (employeeList || []).reduce((sum, employee) => {
        const ptPercentage = (employee.partTimePercentage ?? 100) / 100;
        const serviceRatio = calculateServiceRatio(employee, annoRiferimento);
        const fte = ptPercentage * serviceRatio;
        return sum + fte;
    }, 0);
};
