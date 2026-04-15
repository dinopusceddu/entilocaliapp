/**
 * 10_import_legacy_json.js — Import diretto dei pareri storici mancanti
 *
 * Legge guida.pareriAran.json (i 17 pareri legacy) e li inserisce su Supabase.
 * Utile perché questi pareri sono troppo vecchi per essere nel dataset ARAN ufficiale,
 * ma sono necessari per non rompere i link nelle guide dell'app.
 *
 * Comando: npm run normativa:import-legacy
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const LEGACY_FILE = path.join(ROOT_DIR, 'src/data/normativa/guida.pareriAran.json');

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

function normalizza(testo) {
    return (testo || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function calcolaHash(quesito, risposta) {
    const contenuto = normalizza(quesito) + '\n' + normalizza(risposta);
    return createHash('sha256').update(contenuto, 'utf8').digest('hex');
}

async function importLegacy() {
    if (!fs.existsSync(LEGACY_FILE)) {
        console.error('File legacy non trovato:', LEGACY_FILE);
        process.exit(1);
    }

    const legacyData = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf8'));
    console.log(`📦 Import Legacy — ${legacyData.length} pareri da caricare`);

    const records = legacyData.map(p => {
        const id = p.codiceParere || p.id;
        const quesito = p.domanda || p.quesito || '';
        const risposta = p.risposta || '';

        return {
            aran_id: id,
            version_no: 1,
            is_current: true,
            codici_secondari: [id],
            data_pubblicazione: 'Storico',
            titolo: p.titoloScheda || null,
            quesito: quesito,
            risposta: risposta,
            hash_contenuto: calcolaHash(quesito, risposta),
            argomenti: ['Legacy'],
            hash_tags_argomento: ['#Legacy'],
            riferimenti_normativi_estratti: [],
            articoli_collegati: [],
            schede_collegate: p.schedaId ? [p.schedaId] : [],
            stato: 'published',
            parse_status: 'ok',
            qa_flags: ['legacy_import'],
            needs_editorial_review: false,
            note_admin: 'Importato da guida.pareriAran.json'
        };
    });

    const { error } = await supabase
        .from('pareri_aran_staging')
        .upsert(records, { onConflict: 'aran_id,version_no' });

    if (error) {
        console.error('❌ Errore durante l\'importazione:', error.message);
    } else {
        console.log(`✅ ${records.length} pareri legacy caricati con successo.`);
        console.log('Esegui ora normativa:publish per aggiornare il JSON pubblico.');
    }
}

importLegacy().catch(err => { console.error('Errore fatale:', err); process.exit(1); });
