/**
 * 07_stage_new_pareri.js — Staging pareri ARAN nuovi o modificati su Supabase
 *
 * Confronta il file TXT master aggiornato con i record già presenti su Supabase
 * e inserisce:
 *   - Nuovi aranId → draft (versionNo=1, isCurrent=false)
 *   - aranId esistente, hash diverso → review (versionNo++, supersedesRecordId, isCurrent=false)
 *   - aranId esistente, hash uguale → skip
 *
 * Non modifica mai i record published+is_current=true senza azione admin esplicita.
 *
 * Prerequisito: npm run normativa:bootstrap già eseguito.
 * Comando: npm run normativa:stage
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const REPORTS_DIR = path.join(ROOT_DIR, 'scripts/doc-ingestion/reports');

// Carica .env manualmente
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

// Pattern marcatori risposta (stesso set del parser master)
const RISPOSTA_STARTS = [
    'Con riferimento', 'Si evidenzia', 'Al riguardo', 'In merito', 'In proposito',
    'Si fa presente', 'Si rappresenta', 'Occorre preliminarmente', 'Premesso che',
    'Si osserva che', 'Si precisa che', 'Nella fattispecie', 'In via preliminare',
    'Sentito il parere', 'Ad avviso di questa Agenzia', 'Al riguardo si fa',
    'Con riguardo', 'Per quanto concerne', 'In ordine al',
];

function normalizza(testo) {
    return (testo || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function calcolaHash(quesito, risposta) {
    const contenuto = normalizza(quesito) + '\n' + normalizza(risposta);
    return createHash('sha256').update(contenuto, 'utf8').digest('hex');
}

function separaQuesito(contenuto) {
    let bestPos = -1;
    for (const marker of RISPOSTA_STARTS) {
        const pos = contenuto.indexOf(marker, 50);
        if (pos !== -1 && (bestPos === -1 || pos < bestPos)) bestPos = pos;
    }
    if (bestPos === -1) return { quesito: contenuto.trim(), risposta: '', splittato: false };
    return {
        quesito: contenuto.substring(0, bestPos).trim(),
        risposta: contenuto.substring(bestPos).trim(),
        splittato: true,
    };
}

function valutaQA(quesito, risposta, splittato) {
    const flags = [];
    if (!risposta || risposta.trim().length === 0) flags.push('risposta_vuota');
    if (quesito && risposta && normalizza(quesito).substring(0, 80) === normalizza(risposta).substring(0, 80)) {
        flags.push('quesito_uguale_risposta');
    }
    if (!splittato) flags.push('split_incerto');
    const parseStatus = flags.includes('quesito_uguale_risposta') ? 'error'
        : flags.length > 0 ? 'warning' : 'ok';
    return { qaFlags: flags, parseStatus, needsEditorialReview: flags.length > 0 };
}

function parseTxt(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const blocks = content.split('===').map(b => b.trim()).filter(Boolean);
    const pareri = [];
    blocks.forEach((block, index) => {
        const lines = block.split('\n').map(l => l.replace('\r', '').trim());
        let id = '', dataPubblicazione = '';
        const contenutoAccumulator = [], argomenti = [], hashTagsArgomento = [];
        let fase = 'header';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            if (line.startsWith('Id:')) { id = line.replace('Id:', '').trim(); continue; }
            if (line.startsWith('Data pubblicazione')) { dataPubblicazione = line.replace('Data pubblicazione', '').trim(); fase = 'content'; continue; }
            if (line === 'Argomento') { fase = 'argomento'; continue; }
            if (fase === 'content') contenutoAccumulator.push(line);
            else if (fase === 'argomento' && line.startsWith('#')) {
                const tag = line.substring(1).trim();
                hashTagsArgomento.push('#' + tag);
                argomenti.push(tag);
            }
        }
        const contenutoCompleto = contenutoAccumulator.join('\n').trim();
        if (!id || !contenutoCompleto) return;
        const { quesito, risposta, splittato } = separaQuesito(contenutoCompleto);
        const { qaFlags, parseStatus, needsEditorialReview } = valutaQA(quesito, risposta, splittato);
        pareri.push({
            aranId: id || `aran_${index}`,
            dataPubblicazione, quesito, risposta, argomenti, hashTagsArgomento,
            hashContenuto: calcolaHash(quesito, risposta),
            qaFlags, parseStatus, needsEditorialReview,
        });
    });
    return pareri;
}

async function stage() {
    const TXT_FILE = path.join(ROOT_DIR, 'fileprogetto/pareri_aran_funzioni_locali.txt');
    if (!fs.existsSync(TXT_FILE)) { console.error('File TXT master non trovato:', TXT_FILE); process.exit(1); }

    const pareriTxt = parseTxt(TXT_FILE);
    console.log(`📄 TXT master: ${pareriTxt.length} pareri`);

    // Carica tutti i record correnti da Supabase (published + is_current=true)
    const { data: correnti, error: errLoad } = await supabase
        .from('pareri_aran_staging')
        .select('record_id, aran_id, version_no, hash_contenuto, stato, is_current');

    if (errLoad) { console.error('Errore lettura Supabase:', errLoad.message); process.exit(1); }

    // Mappa aranId → record corrente (is_current=true) e tutti i record per quell'aranId
    const mappaCorrente = {};    // aranId → { record_id, version_no, hash_contenuto }
    const mappaVersioni = {};    // aranId → maxVersionNo
    (correnti || []).forEach(r => {
        if (!mappaVersioni[r.aran_id] || r.version_no > mappaVersioni[r.aran_id]) {
            mappaVersioni[r.aran_id] = r.version_no;
        }
        if (r.is_current) mappaCorrente[r.aran_id] = r;
    });

    const report = { nuovi: [], aggiornati: [], saltati: [], errori: [] };

    for (const parere of pareriTxt) {
        const corrente = mappaCorrente[parere.aranId];
        const maxVersion = mappaVersioni[parere.aranId] || 0;

        // Matching suggeriti articoli/schede: lasciati vuoti (compilerà 06_match o admin)
        const record = {
            aran_id: parere.aranId,
            data_pubblicazione: parere.dataPubblicazione,
            quesito: parere.quesito,
            risposta: parere.risposta,
            hash_contenuto: parere.hashContenuto,
            argomenti: parere.argomenti,
            hash_tags_argomento: parere.hashTagsArgomento,
            riferimenti_normativi_estratti: [],
            articoli_collegati: [],
            schede_collegate: [],
            qa_flags: parere.qaFlags,
            parse_status: parere.parseStatus,
            needs_editorial_review: parere.needsEditorialReview,
            note_admin: null,
            is_current: false,
        };

        if (!corrente) {
            // Nuovo aranId
            const { error } = await supabase
                .from('pareri_aran_staging')
                .insert({ ...record, version_no: 1, stato: 'draft' });
            if (error) { report.errori.push({ aranId: parere.aranId, err: error.message }); }
            else { report.nuovi.push(parere.aranId); }

        } else if (corrente.hash_contenuto === parere.hashContenuto) {
            // Hash identico: skip
            report.saltati.push(parere.aranId);

        } else {
            // Hash diverso: crea revisione in review
            const qaFlags = [...(parere.qaFlags || []), 'hash_cambiato'];
            const { error } = await supabase
                .from('pareri_aran_staging')
                .insert({
                    ...record,
                    version_no: maxVersion + 1,
                    stato: 'review',
                    supersedes_record_id: corrente.record_id,
                    qa_flags: qaFlags,
                    parse_status: qaFlags.includes('quesito_uguale_risposta') ? 'error' : 'warning',
                    needs_editorial_review: true,
                });
            if (error) { report.errori.push({ aranId: parere.aranId, err: error.message }); }
            else { report.aggiornati.push(parere.aranId); }
        }
    }

    // Salva report
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const reportFull = { timestamp: new Date().toISOString(), ...report };
    fs.writeFileSync(path.join(REPORTS_DIR, 'staging_report.json'), JSON.stringify(reportFull, null, 2));

    console.log('\n📊 Report Staging:');
    console.log(`   Nuovi (draft):     ${report.nuovi.length}`);
    console.log(`   Aggiornati (review): ${report.aggiornati.length}`);
    console.log(`   Saltati (invariati): ${report.saltati.length}`);
    console.log(`   Errori:            ${report.errori.length}`);
    if (report.errori.length > 0) console.error('   Errori dettaglio:', report.errori);
    console.log('\n✅  Staging completato. Ora rivedi i draft su Supabase o nel pannello admin.');
}

stage().catch(err => { console.error('Errore fatale:', err); process.exit(1); });
