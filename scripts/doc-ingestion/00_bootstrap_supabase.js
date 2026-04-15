/**
 * 00_bootstrap_supabase.js — Bootstrap iniziale dei pareri ARAN su Supabase
 *
 * Scopo: popolare pareri_aran_staging con i 362 pareri già pubblicati in
 *        src/data/normativa/aran.pareri.json, marcati come published + is_current=true.
 *
 * ESEGUIRE SOLO UNA VOLTA come prerequisito del workflow.
 * Idempotente: ON CONFLICT (aran_id, version_no) DO NOTHING.
 *
 * Prerequisiti: .env con VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 * Comando: npm run normativa:bootstrap
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');

// Carica variabili dal .env manualmente (gli script Node non usano import.meta.env)
function loadEnv() {
    const envPath = path.join(ROOT_DIR, '.env');
    if (!fs.existsSync(envPath)) {
        console.error('File .env non trovato in:', envPath);
        process.exit(1);
    }
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    const env = {};
    lines.forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) env[match[1].trim()] = match[2].trim();
    });
    return env;
}

const env = loadEnv();
const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY mancanti nel .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const JSON_PATH = path.join(ROOT_DIR, 'src/data/normativa/aran.pareri.json');

if (!fs.existsSync(JSON_PATH)) {
    console.error('File non trovato:', JSON_PATH);
    process.exit(1);
}

const pareriData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

/**
 * Normalizza il testo per il calcolo dell'hash.
 * Idempotente: trim + collasso spazi multipli + lowercase.
 */
function normalizza(testo) {
    return (testo || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Calcola SHA-256 del contenuto normalizzato.
 */
function calcolaHash(quesito, risposta) {
    const contenuto = normalizza(quesito) + '\n' + normalizza(risposta);
    return createHash('sha256').update(contenuto, 'utf8').digest('hex');
}

/**
 * Mappa un parere dal JSON pubblico al record Supabase (snake_case).
 */
function mappaParereARecord(parere) {
    const aranId = parere.aranId || parere.id;
    return {
        aran_id: aranId,
        version_no: 1,
        supersedes_record_id: null,
        is_current: true,
        codici_secondari: parere.codiciSecondari || null,
        data_pubblicazione: parere.dataPubblicazione || parere.data || '',
        titolo: parere.titolo || null,
        quesito: parere.quesito || parere.domanda || '',
        risposta: parere.risposta || '',
        url_fonte: parere.urlFonte || null,
        hash_contenuto: calcolaHash(parere.quesito || parere.domanda || '', parere.risposta || ''),
        argomenti: parere.argomenti || parere.tags || [],
        hash_tags_argomento: parere.hashTagsArgomento || [],
        riferimenti_normativi_estratti: parere.riferimentiNormativiEstratti || [],
        articoli_collegati: parere.articoliCollegati || [],
        schede_collegate: parere.schedeCollegate || [],
        stato: 'published',
        parse_status: 'ok',
        qa_flags: [],
        needs_editorial_review: false,
        note_admin: null,
    };
}

async function bootstrap() {
    console.log(`📦 Bootstrap Supabase — ${pareriData.length} pareri da importare`);

    let inseriti = 0;
    let saltati = 0;
    let errori = 0;

    // Lavora in batch per evitare timeout Supabase
    const BATCH_SIZE = 50;
    for (let i = 0; i < pareriData.length; i += BATCH_SIZE) {
        const batch = pareriData.slice(i, i + BATCH_SIZE);
        const records = batch.map(mappaParereARecord);

        const { data, error } = await supabase
            .from('pareri_aran_staging')
            .upsert(records, {
                onConflict: 'aran_id,version_no',
                ignoreDuplicates: true,
            });

        if (error) {
            console.error(`  ❌ Errore batch ${i}–${i + BATCH_SIZE - 1}:`, error.message);
            errori += batch.length;
        } else {
            // Supabase upsert ignoreDuplicates non restituisce conteggio preciso;
            // stimiamo in base alla dimensione del batch
            inseriti += batch.length;
            console.log(`  ✅ Batch ${i}–${i + batch.length - 1} completato`);
        }
    }

    console.log('\n📊 Report Bootstrap:');
    console.log(`   Tentati:  ${pareriData.length}`);
    console.log(`   Inseriti: ${inseriti}`);
    console.log(`   Saltati:  ${saltati}`);
    console.log(`   Errori:   ${errori}`);
    console.log('\n⚠️  Attenzione: i record saltati sono quelli già presenti (idempotente).');
    console.log('✅  Bootstrap completato. Non rieseguire.');
}

bootstrap().catch(err => {
    console.error('Errore fatale:', err);
    process.exit(1);
});
