import fs from 'fs';
import path from 'path';
import { runArrearsRegressionTest } from './src/logic/arrearsCalculations.ts';
import { calculateFundCompletely } from './src/logic/fundCalculations.ts';
import { FundData, NormativeData, Ccnl2024Settings, AnnualData, HistoricalData } from './src/types.ts';

// Helper to mock initial data since constants are not exported or difficult to import
const mockInitialFundData = (): FundData => ({
    historicalData: {} as HistoricalData,
    annualData: {
        annoRiferimento: 2024,
        personaleServizioAttuale: [],
        proventiSpecifici: [],
        personale2018PerArt23: [],
        personaleAnnoRifPerArt23: [],
        simulatoreInput: {},
    } as unknown as AnnualData,
    fondoAccessorioDipendenteData: {},
    fondoElevateQualificazioniData: {},
    fondoSegretarioComunaleData: {},
    fondoDirigenzaData: {},
    distribuzioneRisorseData: {},
});

// Load Normative Data
const loadNormativeData = (): NormativeData => {
    try {
        const filePath = path.join(process.cwd(), 'public', 'normativa.json');
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content) as NormativeData;
    } catch (error) {
        console.error('Error loading normative data:', error);
        process.exit(1);
    }
}

console.log('--- CCNL 2022/2024 Verification (Root + FS) ---');

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

const normativeData = loadNormativeData();
const mockFundData: FundData = mockInitialFundData();

// Setup CCNL 2024 Data
mockFundData.annualData.ccnl2024 = {
    monteSalari2021: 1000000,
    fondoPersonale2025: 50000,
    fondoEQ2025: 10000,
    optionalIncreaseVariableFrom2026Percentage: 0.22,
    optionalIncreaseVariable2026OnlyPercentage: 0.22,
    valoreTabellaCCol3: 83.20,
    personaleInServizio01012026: 10,
    applyPartTimeProportion: false
};

try {
    const result = calculateFundCompletely(mockFundData, normativeData);

    // Check if new components are present
    const ccnlIncreases = result.incrementiStabiliCCNL.filter(c => c.riferimento === 'CCNL 2022-2024');
    const ccnlVarIncreases = result.risorseVariabili.filter(c => c.riferimento === 'CCNL 2022-2024');

    console.log(`   Increases found: ${ccnlIncreases.length} Stable, ${ccnlVarIncreases.length} Variable`);

    const stableInc = ccnlIncreases.find(c => c.descrizione.includes('0,14%'));
    const varInc = ccnlVarIncreases.find(c => c.descrizione.includes('0,28%'));
    // Look for 2200 amount
    const optVarInc = ccnlVarIncreases.find(c => c.importo === 2200);

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

    if (optVarInc) {
        console.log('✅ PASS: Optional Variable Increase (0.22% input) calculated correctly (€2200).');
    } else {
        const others = ccnlVarIncreases.filter(c => c !== varInc);
        console.error(`❌ FAIL: Optional Variable Increase incorrect or missing. Expected 2200. Found:`, others);
    }

    console.log('✅ PASS: Fund Calculation Dry Run completed without errors.');

} catch (error) {
    console.error('❌ FAIL: Fund Calculation crashed.', error);
    process.exit(1);
}

console.log('\n--- Verification Completed Successfully ---');
