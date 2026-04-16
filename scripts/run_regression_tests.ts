
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { calculateFundCompletely } from '../src/logic/fundCalculations.ts';
import { runAllComplianceChecks } from '../src/logic/complianceChecks.ts';
import { NormativeData, FundData } from '../src/types.ts';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures/fondo');
const NORMATIVA_FILE = join(process.cwd(), 'public/normativa.json');
const GOLDEN_FILE = join(FIXTURES_DIR, 'golden_results.json');

// Helper per il confronto profondo e la generazione di diff
function compare(expected: any, actual: any, path: string = ''): string[] {
    const differences: string[] = [];

    if (expected === actual) return [];

    if (typeof expected !== typeof actual) {
        return [`Campo [${path}]: Tipo diverso. Atteso ${typeof expected}, Got ${typeof actual}`];
    }

    if (typeof expected === 'object' && expected !== null && actual !== null) {
        const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
        for (const key of keys) {
            const newPath = path ? `${path}.${key}` : key;
            if (!(key in expected)) {
                differences.push(`Campo [${newPath}]: Inatteso (non presente nella baseline)`);
            } else if (!(key in actual)) {
                differences.push(`Campo [${newPath}]: Mancante (presente nella baseline ma non nell'output)`);
            } else {
                differences.push(...compare(expected[key], actual[key], newPath));
            }
        }
    } else {
        // Confronto valori primitivi (con tolleranza per numeri)
        if (typeof expected === 'number' && typeof actual === 'number') {
            if (Math.abs(expected - actual) > 0.01) {
                differences.push(`Campo [${path}]: Valore diverso. Atteso ${expected}, Got ${actual}`);
            }
        } else if (expected !== actual) {
            differences.push(`Campo [${path}]: Valore diverso. Atteso "${expected}", Got "${actual}"`);
        }
    }

    return differences;
}

async function runRegressionTests() {
    console.log('--- Test di Regressione del Motore di Calcolo (Consolidato) ---');
    
    try {
        const normativeData: NormativeData = JSON.parse(readFileSync(NORMATIVA_FILE, 'utf-8'));
        const goldenResults = JSON.parse(readFileSync(GOLDEN_FILE, 'utf-8'));
        const fixtureFiles = Object.keys(goldenResults);
        
        let totalTests = 0;
        let passedTests = 0;

        for (const file of fixtureFiles) {
            totalTests++;
            process.stdout.write(`Testing: ${file}... `);
            
            try {
                const fundData: FundData = JSON.parse(readFileSync(join(FIXTURES_DIR, file), 'utf-8'));
                const expected = goldenResults[file];
                
                const actualFund = calculateFundCompletely(fundData, normativeData);
                const complianceChecks = runAllComplianceChecks(actualFund, fundData, normativeData);
                
                const actualWarnings = complianceChecks
                    .filter(c => !c.isCompliant)
                    .map(c => ({ id: c.id, gravita: c.gravita }))
                    .sort((a, b) => a.id.localeCompare(b.id) || a.gravita.localeCompare(b.gravita));

                const currentResult = JSON.parse(JSON.stringify({
                    totaleFondo: actualFund.totaleFondo,
                    totaleParteStabile: actualFund.totaleParteStabile,
                    totaleParteVariabile: actualFund.totaleParteVariabile,
                    limiteArt23C2Modificato: actualFund.limiteArt23C2Modificato,
                    ammontareSoggettoLimite2016: actualFund.ammontareSoggettoLimite2016,
                    superamentoLimite2016: actualFund.superamentoLimite2016,
                    dettaglioFondi: actualFund.dettaglioFondi,
                    warnings: actualWarnings
                }));

                const diffs = compare(expected, currentResult);

                if (diffs.length === 0) {
                    console.log('✅ OK');
                    passedTests++;
                } else {
                    console.log('❌ FAIL');
                    diffs.forEach(d => console.log(`   - ${d}`));
                }
            } catch (e) {
                console.log(`❌ ERROR (${e instanceof Error ? e.message : String(e)})`);
            }
        }

        console.log(`\n--- Risultato Finale: ${passedTests}/${totalTests} superati ---`);
        process.exit(passedTests === totalTests ? 0 : 1);

    } catch (err) {
        console.error('\n❌ Errore critico durante i test:', err);
        process.exit(1);
    }
}

runRegressionTests();
