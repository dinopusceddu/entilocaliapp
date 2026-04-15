/**
 * 09_reconcile_legacy_aliases.js — Riconciliazione alias storici da guida.pareriAran.json
 *
 * Confronta le 17 entry legacy (codici CFL72, RAL431, ecc.) con i record su Supabase.
 * Produce tre esiti: match certo (≥0.85), match probabile (0.50-0.84), nessun match (<0.50).
 * Solo i match certi aggiornano automaticamente codici_secondari su Supabase.
 *
 * NOTA: guida.pareriAran.json NON viene eliminato o modificato da questo script.
 *       Va eliminato manualmente solo dopo la verifica dei casi nessunMatch.
 *
 * Comando: npm run normativa:reconcile
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const REPORTS_DIR = path.join(ROOT_DIR, 'scripts/doc-ingestion/reports');
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

// Soglie di similarità
const SOGLIA_CERTO = 0.85;
const SOGLIA_PROBABILE = 0.50;

/**
 * Normalizza testo: lowercase, rimozione punteggiatura, collasso spazi.
 * Rimuove anche i prefissi comuni "RAL 123 - " o "CFL72 – "
 */
function normalizza(str) {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/^(ral|cfl)\s?\d+\s?[\-–—]\s?/, '') // Rimuove prefisso codice
        .replace(/[^a-zàáèéìíòóùú\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Tokenizza testo per similarity Jaccard.
 */
function tokenize(str) {
    return new Set(normalizza(str).split(' ').filter(w => w.length > 3));
}

/**
 * Similarità Jaccard tra due stringhe.
 */
function jaccard(a, b) {
    const ta = tokenize(a);
    const tb = tokenize(b);
    if (ta.size === 0 || tb.size === 0) return 0;
    const intersection = new Set([...ta].filter(x => tb.has(x)));
    const union = new Set([...ta, ...tb]);
    return intersection.size / union.size;
}

/**
 * Similarità combinata: Jaccard + substring match.
 * Bonus se il quesito Supabase contiene la domanda legacy.
 */
function similarity(a, b) {
    const aNorm = normalizza(a);
    const bNorm = normalizza(b);
    
    // Se uno dei due è vuoto dopo normalizzazione
    if (!aNorm || !bNorm) return 0;

    const j = jaccard(aNorm, bNorm);
    
    // Bonus substring: se la domanda legacy (b) è contenuta nel quesito (a)
    // Usiamo una versione leggermente accorciata per evitare problemi con punteggiatura finale
    const bShort = bNorm.substring(0, Math.min(bNorm.length, 100));
    const substringBonus = aNorm.includes(bShort) ? 0.35 : 0;
    
    // Un match quasi perfetto di substring (es. la domanda legacy è esattamente l'inizio del quesito)
    // merita di passare la soglia 0.85
    return Math.min(1, j + substringBonus);
}

async function reconcile() {
    if (!fs.existsSync(LEGACY_FILE)) {
        console.error('File legacy non trovato:', LEGACY_FILE);
        process.exit(1);
    }

    const legacyData = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf8'));
    console.log(`📚 File legacy: ${legacyData.length} entry`);

    // Carica tutti i record da Supabase (quelli published+is_current per la riconciliazione)
    const { data: records, error } = await supabase
        .from('pareri_aran_staging')
        .select('record_id, aran_id, quesito, codici_secondari')
        .eq('is_current', true);

    if (error) { console.error('Errore lettura Supabase:', error.message); process.exit(1); }
    console.log(`   Record Supabase is_current=true: ${records.length}`);

    const report = {
        timestamp: new Date().toISOString(),
        matchCerti: [],
        matchProbabili: [],
        nessunMatch: [],
    };

    const aggiornamenti = []; // { record_id, codici_da_aggiungere }

    for (const legacy of legacyData) {
        const codice = legacy.codiceParere || legacy.id || '';
        const domandaLegacy = legacy.domanda || legacy.quesito || '';

        if (!domandaLegacy) {
            report.nessunMatch.push({ codiceStorico: codice, motivo: 'domanda legacy vuota' });
            continue;
        }

        // Calcola similarity con tutti i record Supabase
        const candidati = records
            .map(r => ({ ...r, score: similarity(r.quesito, domandaLegacy) }))
            .filter(r => r.score >= SOGLIA_PROBABILE)
            .sort((a, b) => b.score - a.score);

        if (candidati.length === 0) {
            report.nessunMatch.push({ codiceStorico: codice, domandaLegacy: domandaLegacy.substring(0, 120) });
        } else if (candidati[0].score >= SOGLIA_CERTO) {
            const best = candidati[0];
            report.matchCerti.push({
                codiceStorico: codice,
                aranId: best.aran_id,
                score: Math.round(best.score * 100) / 100,
            });
            // Prepara aggiornamento Supabase
            aggiornamenti.push({ record_id: best.record_id, codice_da_aggiungere: codice });
        } else {
            report.matchProbabili.push({
                codiceStorico: codice,
                domandaLegacy: domandaLegacy.substring(0, 120),
                candidati: candidati.slice(0, 3).map(c => ({
                    aranId: c.aran_id,
                    score: Math.round(c.score * 100) / 100,
                    quesitoPreview: (c.quesito || '').substring(0, 80),
                })),
            });
        }
    }

    // Applica solo i match certi → aggiorna codici_secondari su Supabase
    console.log(`\n🔗 Applicazione ${aggiornamenti.length} match certi su Supabase...`);
    for (const { record_id, codice_da_aggiungere } of aggiornamenti) {
        // Recupera codici attuali per non sovrascrivere
        const corrente = records.find(r => r.record_id === record_id);
        const codiciAttuali = corrente?.codici_secondari || [];
        const nuoviCodici = [...new Set([...codiciAttuali, codice_da_aggiungere])];

        const { error: errUpd } = await supabase
            .from('pareri_aran_staging')
            .update({ codici_secondari: nuoviCodici })
            .eq('record_id', record_id);

        if (errUpd) {
            console.warn(`  ⚠️  Errore aggiornamento ${record_id}:`, errUpd.message);
        } else {
            console.log(`  ✅  ${codice_da_aggiungere} → aranId ${corrente?.aran_id}`);
        }
    }

    // Salva report
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(
        path.join(REPORTS_DIR, 'reconciliation_report.json'),
        JSON.stringify(report, null, 2),
        'utf8'
    );

    console.log('\n📊 Report Riconciliazione:');
    console.log(`   Match certi   (≥${SOGLIA_CERTO}): ${report.matchCerti.length}`);
    console.log(`   Match probabili (${SOGLIA_PROBABILE}-${SOGLIA_CERTO}): ${report.matchProbabili.length}`);
    console.log(`   Nessun match  (<${SOGLIA_PROBABILE}): ${report.nessunMatch.length}`);
    console.log('\n⚠️  guida.pareriAran.json NON è stato modificato o eliminato.');
    console.log('   Verifica manualmente i matchProbabili e i nessunMatch prima di archiviare il file.');
    console.log('   Poi riesegui normativa:publish per aggiornare il JSON pubblico con i codiciSecondari.');
}

reconcile().catch(err => { console.error('Errore fatale:', err); process.exit(1); });
