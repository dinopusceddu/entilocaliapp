import { runArrearsRegressionTest } from '../src/logic/arrearsCalculations';
import { calculateFundCompletely } from '../src/logic/fundCalculations';
import { INITIAL_FUND_DATA, INITIAL_NORMATIVE_DATA } from '../src/constants';
import { FundData } from '../src/types';

console.log('--- CCNL 2022/2024 Verification ---');

// 1. Run Arrears Regression Test
console.log('\n1. Running Arrears Regression Test (Mandatory €11.98 check)...');
const arrearsResult = runArrearsRegressionTest();
if (arrearsResult.success) {
    console.log('✅ PASS: Arrears Regression Test Passed.');
    console.log(`   Result: €${arrearsResult.result}`);
} else {
    console.error('❌ FAIL: Arrears Regression Test Failed.');
    console.error(`   Expected: €${arrearsResult.expected}, Got: €${arrearsResult.result}`);
    process.exit(1);
}

// 2. Dry Run Fund Calculation with CCNL 2024 Data
console.log('\n2. Running Fund Calculation Dry Run with CCNL 2024 Data...');
const mockFundData: FundData = {
    ...INITIAL_FUND_DATA,
    annualData: {
        ...INITIAL_FUND_DATA.annualData,
        ccnl2024: {
            monteSalari2021: 1000000,
            fondoPersonale2024: 50000,
            fondoEQ2024: 10000,
            applyOptionalIncrease022VariableFrom2026: true,
            applyOptionalIncrease022Variable2026Only: true,
            valoreTabellaCCol3: 83.20, // Example value
            personaleInServizio01012026: 10,
            applyPartTimeProportion: false
        }
    }
};

try {
    const result = calculateFundCompletely(mockFundData, INITIAL_NORMATIVE_DATA);

    // Check if new components are present
    const ccnlIncreases = result.incrementiStabiliCCNL.filter(c => c.riferimento === 'CCNL 2022-2024');
    const ccnlVarIncreases = result.risorseVariabili.filter(c => c.riferimento === 'CCNL 2022-2024');

    console.log(`   Increases found: ${ccnlIncreases.length} Stable, ${ccnlVarIncreases.length} Variable`);

    const stableInc = ccnlIncreases.find(c => c.descrizione.includes('0,14%'));
    const varInc = ccnlVarIncreases.find(c => c.descrizione.includes('0,28%'));

    if (stableInc && stableInc.importo === 1400) { // 1,000,000 * 0.0014
        console.log('✅ PASS: Mandatory Stable Increase (0.14%) calculated correctly (€1400).');
    } else {
        console.error(`❌ FAIL: Mandatory Stable Increase incorrect. Expected 1400, got ${stableInc?.importo}`);
    }

    if (varInc && varInc.importo === 2800) { // 1,000,000 * 0.0028
        console.log('✅ PASS: Mandatory Variable Increase (0.28%) calculated correctly (€2800).');
    } else {
        console.error(`❌ FAIL: Mandatory Variable Increase incorrect. Expected 2800, got ${varInc?.importo}`);
    }

    console.log('✅ PASS: Fund Calculation Dry Run completed without errors.');

} catch (error) {
    console.error('❌ FAIL: Fund Calculation crashed.', error);
    process.exit(1);
}

console.log('\n--- Verification Completed Successfully ---');
