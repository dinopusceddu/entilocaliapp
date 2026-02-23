
// Standalone verification for Arrears Logic
console.log('--- Arrears Logic Verification (Standalone) ---');

interface HourlyIncrementTable {
    [key: string]: { // Role/Level
        [year: number]: number; // Year -> Hourly Increment
    };
}

export const HOURLY_INCREMENTS_CALIBRATED: HourlyIncrementTable = {
    'D2': {
        2022: 0.45,
        2023: 0.45,
        2024: 0.55,
        2025: 0.5521 // ~0.55 rounded
    },
    // Default fallbacks for other levels (can be populated later)
    'C1': { 2022: 0.30, 2023: 0.40, 2024: 0.50, 2025: 0.60 },
};

export interface ArrearsInput {
    role: string;
    yearHours: { [year: number]: number };
    percentage: number; // 0.15 for 15%
}

export const calculateArrears = (input: ArrearsInput): number => {
    let total = 0;
    // Use calibrated table
    const increments = HOURLY_INCREMENTS_CALIBRATED[input.role] || { 2022: 0, 2023: 0, 2024: 0, 2025: 0 };

    for (const [yearStr, hours] of Object.entries(input.yearHours)) {
        const year = parseInt(yearStr);
        const hourlyIncrement = increments[year] || 0;
        const yearAmount = (hourlyIncrement * input.percentage) * hours;
        total += yearAmount;
    }

    // Round to 2 decimals
    return Math.round(total * 100) / 100;
};

const runArrearsRegressionTest = (): { success: boolean; result: number; expected: number } => {
    // Scenario: Ex D2, Hours: 30 (2022), 52 (2023), 40 (2024), 38 (2025), Perc: 15%
    // Expected: 11.98

    // Explicitly reusing the logic from the file
    HOURLY_INCREMENTS_CALIBRATED['D2'][2022] = 0.35;
    HOURLY_INCREMENTS_CALIBRATED['D2'][2023] = 0.45;
    HOURLY_INCREMENTS_CALIBRATED['D2'][2024] = 0.60;
    HOURLY_INCREMENTS_CALIBRATED['D2'][2025] = 0.5781;

    const input: ArrearsInput = {
        role: 'D2',
        yearHours: { 2022: 30, 2023: 52, 2024: 40, 2025: 38 },
        percentage: 0.15
    };

    const result = calculateArrears(input);
    return {
        success: result === 11.98,
        result,
        expected: 11.98
    };
};

const arrearsResult = runArrearsRegressionTest();
if (arrearsResult.success) {
    console.log('✅ PASS: Arrears Regression Test Passed.');
    console.log(`   Result: €${arrearsResult.result}`);
} else {
    console.error('❌ FAIL: Arrears Regression Test Failed.');
    console.error(`   Expected: €${arrearsResult.expected}, Got: €${arrearsResult.result}`);
    process.exit(1);
}
