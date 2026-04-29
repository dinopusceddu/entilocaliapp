
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { calculateFundCompletely, runAllComplianceChecks } from '../src/logic/index.ts';
import { normalizeInput } from '../src/application/input/inputNormalizer';
import { NormativeData, FundData } from '../src/domain';

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
        for (const key in expected) {
            const newPath = path ? `${path}.${key}` : key;
            if (!(key in actual)) {
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
                
                const normalizedInput = normalizeInput(fundData, normativeData);
                const actualFund = calculateFundCompletely(normalizedInput, normativeData);
                const complianceChecks = runAllComplianceChecks(actualFund, normalizedInput, normativeData);
                
                const actualWarnings = complianceChecks
                    .filter(c => !c.isCompliant)
                    .map(c => ({ id: c.id, gravita: c.gravita }))
                    .sort((a, b) => a.id.localeCompare(b.id) || a.gravita.localeCompare(b.gravita));

                const currentResult = JSON.parse(JSON.stringify({
                    totaleFondo: actualFund.totals.totaleFondo,
                    totaleParteStabile: actualFund.totals.stabile,
                    totaleParteVariabile: actualFund.totals.variabile,
                    limiteArt23C2Modificato: actualFund.compliance.art23c2.limite,
                    ammontareSoggettoLimite2016: actualFund.compliance.art23c2.valoreSoggetto,
                    ...(expected.superamentoLimite2016 !== undefined ? { superamentoLimite2016: Math.max(0, -actualFund.compliance.art23c2.delta) } : {}),
                    dettaglioFondi: {
                        dipendente: {
                            stabile: actualFund.fondi.dipendente.summary.totaleStabile,
                            variabile: actualFund.fondi.dipendente.summary.totaleVariabile,
                            totale: actualFund.fondi.dipendente.summary.totaleFondo
                        },
                        eq: {
                            stabile: actualFund.fondi.eq.summary.totaleStabile,
                            variabile: actualFund.fondi.eq.summary.totaleVariabile,
                            totale: actualFund.fondi.eq.summary.totaleFondo
                        },
                        segretario: {
                            stabile: actualFund.fondi.segretario.summary.totaleStabile,
                            variabile: actualFund.fondi.segretario.summary.totaleVariabile,
                            totale: actualFund.fondi.segretario.summary.totaleFondo
                        },
                        dirigenza: {
                            stabile: actualFund.fondi.dirigenza.summary.totaleStabile,
                            variabile: actualFund.fondi.dirigenza.summary.totaleVariabile,
                            totale: actualFund.fondi.dirigenza.summary.totaleFondo
                        }
                    },
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
