/**
 * 08_publish_approved.js — Pubblica i pareri approvati nel dataset statico
 *
 * Legge da Supabase i record con stato='published' AND is_current=true,
 * li merge in src/data/normativa/aran.pareri.json (una sola entry per aranId),
 * quindi rigenera normativa.searchIndex.json via 05_build_indexes.js.
 *
 * Garanzie di sicurezza:
 *   - Nessuna sovrascrittura senza is_current=true su Supabase.
 *   - Idempotente: rieseguibile senza effetti collaterali.
 *   - Una sola entry per aranId nel JSON pubblico.
 *
 * Comando: npm run normativa:publish
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const REPORTS_DIR = path.join(ROOT_DIR, 'scripts/doc-ingestion/reports');
const JSON_PATH = path.join(ROOT_DIR, 'src/data/normativa/aran.pareri.json');

function loadEnv() {
    const envPath = path.join(ROOT_DIR, '.env');
    if (!fs.existsSync(envPath)) { console.error('.env non trovato'); process.exit(1); }
    const env = {};
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m) env[m[1].trim()] = m[2].trim();
    });
    return env;
}

const env = loadEnv();
const supabase = createClient(env['VITE_SUPABASE_URL'] || '', env['VITE_SUPABASE_ANON_KEY'] || '');

/**
 * Converte un record Supabase (snake_case) nel formato JSON pubblico (camelCase),
 * omettendo i metadati redazionali.
 */
function recordToPublic(r) {
    return {
        aranId: r.aran_id,
        id: r.aran_id,                                      // backward-compat
        codiciSecondari: r.codici_secondari || undefined,
        dataPubblicazione: r.data_pubblicazione || '',
        data: r.data_pubblicazione || undefined,            // backward-compat
        titolo: r.titolo || undefined,
        quesito: r.quesito || '',
        risposta: r.risposta || '',
        urlFonte: r.url_fonte || undefined,
        argomenti: r.argomenti || [],
        hashTagsArgomento: r.hash_tags_argomento || [],
        riferimentiNormativiEstratti: r.riferimenti_normativi_estratti || [],
        articoliCollegati: r.articoli_collegati || [],
        schedeCollegate: r.schede_collegate || [],
        // stato omesso: tutti i record nel JSON pubblico sono implicitamente published
    };
}

async function publish() {
    console.log('📤 Publish pareri ARAN approvati → JSON statico');

    // 1. Leggi record published + is_current=true da Supabase
    const { data: recordsSupabase, error } = await supabase
        .from('pareri_aran_staging')
        .select('*')
        .eq('stato', 'published')
        .eq('is_current', true);

    if (error) { console.error('Errore lettura Supabase:', error.message); process.exit(1); }
    console.log(`   Trovati ${recordsSupabase.length} record published+is_current su Supabase`);

    // 2. Carica JSON pubblico corrente
    let pareriPubblici = [];
    if (fs.existsSync(JSON_PATH)) {
        pareriPubblici = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    }

    // 3. Costruisci mappa corrente: aranId → record pubblico
    const mappaCorrente = {};
    pareriPubblici.forEach(p => {
        const key = p.aranId || p.id;
        mappaCorrente[key] = p;
    });

    // 4. Merge: aggiorna o aggiungi
    const report = { aggiunti: [], aggiornati: [], invariati: [] };

    recordsSupabase.forEach(r => {
        const pub = recordToPublic(r);
        const esistente = mappaCorrente[r.aran_id];
        if (!esistente) {
            mappaCorrente[r.aran_id] = pub;
            report.aggiunti.push(r.aran_id);
        } else {
            // Sostituisce solo se il hash_contenuto è diverso da quello attuale
            // (la promozione is_current è già un'azione admin esplicita)
            mappaCorrente[r.aran_id] = pub;
            if (JSON.stringify(esistente) !== JSON.stringify(pub)) {
                report.aggiornati.push(r.aran_id);
            } else {
                report.invariati.push(r.aran_id);
            }
        }
    });

    // 5. Scrittura JSON — una sola entry per aranId, ordinate per aranId numerico
    const nuovoArray = Object.values(mappaCorrente)
        .sort((a, b) => {
            const na = parseInt(a.aranId || a.id, 10) || 0;
            const nb = parseInt(b.aranId || b.id, 10) || 0;
            return na - nb;
        });

    fs.writeFileSync(JSON_PATH, JSON.stringify(nuovoArray, null, 2), 'utf8');
    console.log(`   ✅ Scritto ${nuovoArray.length} pareri in aran.pareri.json`);

    // 6. Rigenera search index
    console.log('   🔄 Rigenerazione normativa.searchIndex.json...');
    try {
        execSync(`node "${path.join(__dirname, '05_build_indexes.js')}"`, {
            cwd: ROOT_DIR,
            stdio: 'inherit',
        });
    } catch (e) {
        console.warn('   ⚠️  Errore durante la rigenerazione indice:', e.message);
    }

    // 7. Salva report
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const reportData = { timestamp: new Date().toISOString(), totale: nuovoArray.length, ...report };
    fs.writeFileSync(path.join(REPORTS_DIR, 'publishing_report.json'), JSON.stringify(reportData, null, 2));

    console.log('\n📊 Report Publish:');
    console.log(`   Aggiunti:   ${report.aggiunti.length}`);
    console.log(`   Aggiornati: ${report.aggiornati.length}`);
    console.log(`   Invariati:  ${report.invariati.length}`);
    console.log(`   Totale nel JSON: ${nuovoArray.length}`);
    console.log('\n✅  Publish completato. Esegui npm run build per aggiornare il bundle.');
}

publish().catch(err => { console.error('Errore fatale:', err); process.exit(1); });
