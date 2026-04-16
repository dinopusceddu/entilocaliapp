
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { FundDataSchema } from '../src/schemas/fundDataSchemas.ts';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures/fondo');

async function verifyFixtures() {
    console.log('--- Validazione Fixtures Fondo ---');

    try {
        const files = readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.json') && f !== 'golden_results.json');

        const results: { file: string; status: '✅ OK' | '❌ FAIL'; errors?: any }[] = [];

        for (const file of files) {
            process.stdout.write(`Validazione: ${file}... `);
            try {
                const rawContent = readFileSync(join(FIXTURES_DIR, file), 'utf-8');
                const data = JSON.parse(rawContent);
                
                const result = FundDataSchema.safeParse(data);
                
                if (result.success) {
                    console.log(`✅`);
                    results.push({ file, status: '✅ OK' });
                } else {
                    console.log(`❌`);
                    results.push({ file, status: '❌ FAIL', errors: result.error.format() });
                }
            } catch (e) {
                console.log(`❌ (Errore Lettura)`);
                results.push({ file, status: '❌ FAIL', errors: e instanceof Error ? e.message : String(e) });
            }
        }

        console.log('\n--- Riepilogo Validazione ---');
        console.table(results.map(r => ({ Scenario: r.file, Esito: r.status })));

        const failed = results.filter(r => r.status === '❌ FAIL');
        if (failed.length > 0) {
            console.log('\n--- Dettaglio Errori ---');
            failed.forEach(f => {
                console.log(`\n[${f.file}]:`);
                console.log(JSON.stringify(f.errors, null, 2));
            });
            process.exit(1);
        } else {
            console.log('\n✨ Tutte le fixture sono valide.');
            process.exit(0);
        }

    } catch (err) {
        console.error('\n❌ Errore critico durante la scansione:', err);
        process.exit(1);
    }
}

verifyFixtures();
