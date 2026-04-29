
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { calculateFundCompletely, runAllComplianceChecks } from '../src/logic/index.ts';
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
        
        const actual = calculateFundCompletely(fundData, normativeData);
        const complianceChecks = runAllComplianceChecks(actual, fundData, normativeData);
        
        // Normalizzazione dei warning: solo non compliant, ordinati, campi minimi
        const normalizedWarnings = complianceChecks
            .filter(c => !c.isCompliant)
            .map(c => ({ id: c.id, gravita: c.gravita }))
            .sort((a, b) => a.id.localeCompare(b.id) || a.gravita.localeCompare(b.gravita));

        goldenResults[file] = {
            // Totali Principali
            totaleFondo: actual.totaleFondo,
            totaleParteStabile: actual.totaleParteStabile,
            totaleParteVariabile: actual.totaleParteVariabile,
            
            // Variabili Limite Art. 23
            limiteArt23C2Modificato: actual.limiteArt23C2Modificato,
            ammontareSoggettoLimite2016: actual.ammontareSoggettoLimite2016,
            superamentoLimite2016: actual.superamentoLimite2016,
            
            // Dettaglio Sotto-fondi
            dettaglioFondi: actual.dettaglioFondi,
            
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
