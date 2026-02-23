import { Ccnl2024Settings } from '../types';

export interface Ccnl2024CalculationResult {
    incrementoStabile2026: number;
    incrementoVariabile2026: number;
    incrementoVariabileOpzionaleDal2026: number;
    incrementoVariabileOpzionaleSolo2026: number;
    riduzioneConglobamento: number;

    split: {
        personale: {
            incrementoStabile2026: number;
            incrementoVariabile2026: number;
            incrementoVariabileOpzionaleDal2026: number;
            incrementoVariabileOpzionaleSolo2026: number;
            totaleIncrementi: number;
        };
        eq: {
            incrementoStabile2026: number;
            incrementoVariabile2026: number;
            incrementoVariabileOpzionaleDal2026: number;
            incrementoVariabileOpzionaleSolo2026: number;
            totaleIncrementi: number;
        };
    };
}

export const calculateCcnl2024Increases = (settings: Ccnl2024Settings): Ccnl2024CalculationResult => {
    const monteSalari2021 = settings.monteSalari2021 || 0;

    // 1. Mandatory Increases
    const incrementoStabile2026 = monteSalari2021 * 0.0014; // 0.14%
    const incrementoVariabile2026 = monteSalari2021 * 0.0028; // 0.28%

    // 2. Optional Increases
    let incrementoVariabileOpzionaleDal2026 = 0;
    if (settings.optionalIncreaseVariableFrom2026Percentage) {
        // Percentage input is like 0.22, so we divide by 100 to get factor (0.0022)
        incrementoVariabileOpzionaleDal2026 = monteSalari2021 * (settings.optionalIncreaseVariableFrom2026Percentage / 100);
    }

    let incrementoVariabileOpzionaleSolo2026 = 0;
    if (settings.optionalIncreaseVariable2026OnlyPercentage) {
        // Percentage input is like 0.22, so we divide by 100 to get factor (0.0022)
        incrementoVariabileOpzionaleSolo2026 = monteSalari2021 * (settings.optionalIncreaseVariable2026OnlyPercentage / 100);
    }

    // 3. Conglobation Reduction
    // Formula: Valore Tabella C Col 3 * 13 mensilità * personale al 01/01/2026
    let riduzioneConglobamento = 0;
    if (settings.personaleInServizio01012026 && settings.valoreTabellaCCol3) {
        let unweightedReduction = settings.valoreTabellaCCol3 * 13 * settings.personaleInServizio01012026;

        // Apply Part-Time Proportion if enabled
        if (settings.applyPartTimeProportion && settings.averagePartTimePercentage !== undefined) {
            unweightedReduction = unweightedReduction * settings.averagePartTimePercentage;
        }

        riduzioneConglobamento = unweightedReduction;
    }

    // 4. Proportional Split (Personale vs EQ)
    // Default: 100% Personale, 0% EQ
    let ratioPersonale = 1;

    if (settings.fondoPersonale2025 !== undefined && settings.fondoEQ2025 !== undefined) {
        const total2025 = settings.fondoPersonale2025 + settings.fondoEQ2025;
        if (total2025 > 0) {
            ratioPersonale = settings.fondoPersonale2025 / total2025;
        }
    }

    const ratioEQ = 1 - ratioPersonale;

    return {
        incrementoStabile2026,
        incrementoVariabile2026,
        incrementoVariabileOpzionaleDal2026,
        incrementoVariabileOpzionaleSolo2026,
        riduzioneConglobamento,
        split: {
            personale: {
                incrementoStabile2026: incrementoStabile2026 * ratioPersonale,
                incrementoVariabile2026: incrementoVariabile2026 * ratioPersonale,
                incrementoVariabileOpzionaleDal2026: incrementoVariabileOpzionaleDal2026 * ratioPersonale,
                incrementoVariabileOpzionaleSolo2026: incrementoVariabileOpzionaleSolo2026 * ratioPersonale,
                totaleIncrementi: (incrementoStabile2026 + incrementoVariabile2026 + incrementoVariabileOpzionaleDal2026 + incrementoVariabileOpzionaleSolo2026) * ratioPersonale
            },
            eq: {
                incrementoStabile2026: incrementoStabile2026 * ratioEQ,
                incrementoVariabile2026: incrementoVariabile2026 * ratioEQ,
                incrementoVariabileOpzionaleDal2026: incrementoVariabileOpzionaleDal2026 * ratioEQ,
                incrementoVariabileOpzionaleSolo2026: incrementoVariabileOpzionaleSolo2026 * ratioEQ,
                totaleIncrementi: (incrementoStabile2026 + incrementoVariabile2026 + incrementoVariabileOpzionaleDal2026 + incrementoVariabileOpzionaleSolo2026) * ratioEQ
            }
        }
    };
};

export const validatePerformanceConstraint30Percent = (totalFund: number, performanceAmount: number): { isCompliant: boolean; currentPercentage: number } => {
    if (totalFund <= 0) return { isCompliant: true, currentPercentage: 0 }; // Avoid division by zero, theoretically compliant as fund is 0
    const percentage = (performanceAmount / totalFund) * 100;
    return {
        isCompliant: percentage >= 30,
        currentPercentage: percentage
    };
};
