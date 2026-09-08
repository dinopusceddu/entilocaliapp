
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { calculateFundCompletely, runAllComplianceChecks } from '../src/logic/index.ts';
import { normalizeInput } from '../src/application/input/inputNormalizer';
import { NormativeData, FundData } from '../src/domain';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures/fondo');
const NORMATIVA_FILE = join(process.cwd(), 'public/normativa.json');
const GOLDEN_FILE = join(FIXTURES_DIR, 'golden_results.json');

async function generateGolden() {
    console.log('--- Generazione Golden Results (Consolidata) ---');
    
    const normativeData: NormativeData = JSON.parse(readFileSync(NORMATIVA_FILE, 'utf-8'));
    const fixtureFiles = readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.json') && f !== 'golden_results.json');
    
    const goldenResults: Record<string, any> = {};

    for (const file of fixtureFiles) {
        console.log(`Elaborazione: ${file}...`);
        const fundData: FundData = JSON.parse(readFileSync(join(FIXTURES_DIR, file), 'utf-8'));
        
        const normalizedInput = normalizeInput(fundData);
        const actualFund = calculateFundCompletely(normalizedInput, normativeData);
        const complianceChecks = runAllComplianceChecks(actualFund, normalizedInput, normativeData);
        
        // Normalizzazione dei warning: solo non compliant, ordinati, campi minimi
        const normalizedWarnings = complianceChecks
            .filter(c => !c.isCompliant)
            .map(c => ({ id: c.id, gravita: c.gravita }))
            .sort((a, b) => a.id.localeCompare(b.id) || a.gravita.localeCompare(b.gravita));

        const superamentoLimite2016 = Math.max(0, -actualFund.compliance.art23c2.delta);

        goldenResults[file] = {
            // Totali Principali
            totaleFondo: actualFund.totals.totaleFondo,
            totaleParteStabile: actualFund.totals.stabile,
            totaleParteVariabile: actualFund.totals.variabile,
            
            // Variabili Limite Art. 23
            limiteArt23C2Modificato: actualFund.compliance.art23c2.limite,
            ammontareSoggettoLimite2016: actualFund.compliance.art23c2.valoreSoggetto,
            ...(superamentoLimite2016 > 0 ? { superamentoLimite2016 } : {}),
            
            // Dettaglio Sotto-fondi
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
            
            // Warning Normativi
            warnings: normalizedWarnings
        };
    }

    writeFileSync(GOLDEN_FILE, JSON.stringify(goldenResults, null, 2));
    console.log(`\n✅ Golden results consolidati salvati in: ${GOLDEN_FILE}`);
}

generateGolden().catch(err => {
    console.error('❌ Errore durante la generazione dei golden results:', err);
    process.exit(1);
});
