/**
 * 03_extract_guida.js — Parser Guida al Contratto CCNL Funzioni Locali
 * 
 * Regola principale: ogni <h2> del Word (Titolo 2) = una scheda/istituto autonomo.
 * Fallback: blocchi <strong>/<b> isolati all'inizio di paragrafo se l'h2 manca.
 * QA: schede vuote, duplicati, segmentazione anomala.
 * 
 * Ogni scheda produce:
 *   - id, titolo, sezione
 *   - riferimentiNormativi
 *   - blocchi strutturati (con riconoscimento blocchi standard)
 *   - testoCompleto
 *   - pareriCorrelati: [] (filled by 06_match_pareri.js)
 *   - articoliCollegati: [] (filled by 06_match_pareri.js)
 */
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const OUT_DIR = path.join(ROOT_DIR, 'src/data/normativa');
const REPORTS_DIR = path.join(ROOT_DIR, 'scripts/doc-ingestion/reports');

// File HTML della guida generato da Mammoth
const htmlFile = path.join(ROOT_DIR, 'fileprogetto/hardening_guida.html');

if (!fs.existsSync(htmlFile)) {
    console.error(`File HTML guida non trovato: ${htmlFile}. Esegui prima: npx mammoth fileprogetto/guidaccnlfunzionilocali07042026_giust.docx --output-format=html > fileprogetto/hardening_guida.html`);
    process.exit(1);
}

const htmlRaw = fs.readFileSync(htmlFile, 'utf16le');
const html = htmlRaw.replace(/^\uFEFF/, '');
const $ = cheerio.load(html);

// === CONFIGURAZIONE BLOCCHI STANDARD ===
const BLOCCHI_STANDARD = {
    cosE: ["cos'è", "cose", "definizione", "che cos", "cos'e"],
    quantoDura: ["quanto dura", "durata", "periodo", "quanta durata"],
    quando: ["quando?", "quando spetta", "decorrenza", "timing", "a partire"],
    aChi: ["a chi si applica", "destinatari", "soggetti", "chi può", "personale"],
    chiDispone: ["chi lo dispone", "soggetto erogante", "chi autorizza", "chi concede"],
    puoEssereNegato: ["può essere negato", "diniego", "eccezioni", "quando non spetta", "limiti"],
    requisiti: ["requisiti", "condizioni", "presupposti", "documentazione"],
    note: ["note", "attenzione", "avvertenza", "importante", "osservazione"],
    pareriAran: ["pareri aran", "orientamenti aran", "chiarimenti aran", "parere aran"]
};

function classificaBlocco(testo) {
    const lower = testo.toLowerCase().trim();
    for (const [key, patterns] of Object.entries(BLOCCHI_STANDARD)) {
        if (patterns.some(p => lower.includes(p))) {
            return key;
        }
    }
    return null;
}

// === ESTRAZIONE RIFERIMENTI NORMATIVI ===
function estraiRiferimenti(testo) {
    const refs = new Set();
    // Art. del CCNL
    const artRegex = /\b(?:artt?\.?|articol[oi])\s+(\d+[a-z]?(?:\s*(?:bis|ter|quater|quinquies))?)/gi;
    let m;
    while ((m = artRegex.exec(testo)) !== null) {
        refs.add(`Art. ${m[1].trim()}`);
    }
    // Decreti e Leggi
    const leggiRegex = /D\.?\s*Lgs\.?\s*(?:n\.?\s*)?(\d+\/\d+)/gi;
    while ((m = leggiRegex.exec(testo)) !== null) {
        refs.add(`D.Lgs. ${m[1]}`);
    }
    return [...refs];
}

// === NORMALIZZAZIONE ID ===
function idFromTitle(title, idx) {
    const slug = title
        .toLowerCase()
        .replace(/[àáä]/g, 'a')
        .replace(/[èé]/g, 'e')
        .replace(/[ìí]/g, 'i')
        .replace(/[òó]/g, 'o')
        .replace(/[ùú]/g, 'u')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 60);
    return `scheda-${slug}-${idx}`;
}

// === PARSING PRINCIPALE ===
const schede = [];
const qaWarnings = [];
const qaErrors = [];

let currentSezione = '';
let currentScheda = null;

// Raccogli tutti gli elementi h1, h2, h3, p, ol, ul
$('h1, h2, h3, p, ol, ul').each((i, el) => {
    const tag = (el.tagName || el.name || '').toLowerCase();
    const $el = $(el);
    const text = $el.text().replace(/\s+/g, ' ').trim();

    // h1 = sezione principale (es. "Introduzione", "Part-time", ecc.)
    if (tag === 'h1') {
        if (currentScheda) finalizzaScheda(currentScheda);
        currentSezione = text;
        currentScheda = null;
        return;
    }

    // h2 = scheda/istituto (REGOLA PRINCIPALE)
    if (tag === 'h2') {
        if (currentScheda) finalizzaScheda(currentScheda);
        currentScheda = creaScheda(text, currentSezione, schede.length);
        schede.push(currentScheda);
        return;
    }

    // h3 = sotto-sezione dentro una scheda
    if (tag === 'h3') {
        if (!currentScheda) {
            // FALLBACK: crea una scheda anche da h3 se non c'è un h2 padre
            currentScheda = creaScheda(text, currentSezione, schede.length);
            schede.push(currentScheda);
        } else {
            const classe = classificaBlocco(text);
            currentScheda.blocchi.push({
                tipo: 'intestazione',
                chiaveStandard: classe,
                contenuto: text
            });
            currentScheda.testoCompleto += '\n\n' + text;
        }
        return;
    }

    if (!currentScheda) return;

    if (tag === 'p') {
        if (!text) return;
        
        // Fallback: paragrafo che inizia con testo in grassetto = possibile sotto-sezione
        const boldText = $el.find('strong, b').first().text().trim();
        if (boldText && boldText.length < 60 && (boldText === text || text.startsWith(boldText))) {
            const classe = classificaBlocco(boldText);
            currentScheda.blocchi.push({
                tipo: 'intestazione',
                chiaveStandard: classe,
                contenuto: boldText
            });
            const resto = text.substring(boldText.length).trim();
            if (resto) {
                currentScheda.blocchi.push({ tipo: 'testo', contenuto: resto });
                currentScheda.testoCompleto += '\n\n' + boldText + '\n' + resto;
            } else {
                currentScheda.testoCompleto += '\n\n' + boldText;
            }
            return;
        }

        // Aggiorna il blocco corrente in base al contesto
        currentScheda.blocchi.push({ tipo: 'testo', contenuto: text });
        currentScheda.testoCompleto += '\n' + text;
    }

    if (tag === 'ol' || tag === 'ul') {
        const items = [];
        $el.find('li').each((j, li) => {
            const liText = $(li).text().replace(/\s+/g, ' ').trim();
            if (liText) items.push(liText);
        });
        if (items.length > 0) {
            currentScheda.blocchi.push({ tipo: 'lista', contenuto: items });
            currentScheda.testoCompleto += '\n' + items.join('\n');
        }
    }
});

// Finalizza l'ultima scheda
if (currentScheda) finalizzaScheda(currentScheda);

function creaScheda(titolo, sezione, idx) {
    return {
        id: idFromTitle(titolo, idx),
        titolo,
        sezione,
        riferimentiNormativi: [],
        blocchi: [],
        testoCompleto: titolo,
        pareriCorrelati: [],        // filled by 06_match_pareri.js
        articoliCollegati: []       // filled by 06_match_pareri.js
    };
}

function finalizzaScheda(scheda) {
    if (!scheda) return;
    
    // Estrai riferimenti normativi dal testo completo
    scheda.riferimentiNormativi = estraiRiferimenti(scheda.testoCompleto);
    
    // QA
    if (scheda.testoCompleto.length < 100) {
        qaWarnings.push({ tipo: 'SCHEDA_BREVE', titolo: scheda.titolo, chars: scheda.testoCompleto.length });
    }
    if (scheda.blocchi.length === 0) {
        qaWarnings.push({ tipo: 'SCHEDA_SENZA_BLOCCHI', titolo: scheda.titolo });
    }
}

// === QA GLOBALE ===
// Duplicati
const titoli = schede.map(s => s.titolo);
const titoliUniq = new Set(titoli);
if (titoli.length !== titoliUniq.size) {
    qaErrors.push({ tipo: 'TITOLI_DUPLICATI', msg: `${titoli.length - titoliUniq.size} titoli duplicati` });
}

// Scheda "Introduzione" ingombrante
const intro = schede.find(s => s.titolo.toLowerCase().includes('introduzion'));
if (intro && intro.testoCompleto.length > 5000) {
    qaWarnings.push({ tipo: 'INTRODUZIONE_TROPPO_GRANDE', msg: 'La scheda Introduzione potrebbe contenere più schede non separati correttamente', chars: intro.testoCompleto.length });
}

// === SALVATAGGIO ===
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

fs.writeFileSync(path.join(OUT_DIR, 'guida.schede.json'), JSON.stringify(schede, null, 2));

const qaReport = {
    timestamp: new Date().toISOString(),
    totaleSchede: schede.length,
    sezioneTrovate: [...new Set(schede.map(s => s.sezione))],
    errori: qaErrors,
    warnings: qaWarnings
};
fs.writeFileSync(path.join(REPORTS_DIR, 'guida_qa.json'), JSON.stringify(qaReport, null, 2));

console.log(`✅ Guida: ${schede.length} schede estratte con blocchi strutturati`);
console.log(`   Sezioni: ${qaReport.sezioneTrovate.length}`);
if (qaErrors.length > 0) {
    console.error('❌ ERRORI:', qaErrors.map(e => e.msg).join(', '));
}
if (qaWarnings.length > 0) {
    console.warn(`⚠️  ${qaWarnings.length} warnings (vedi guida_qa.json)`);
    qaWarnings.slice(0, 5).forEach(w => console.warn(`   [${w.tipo}] ${w.titolo || ''}`));
}
