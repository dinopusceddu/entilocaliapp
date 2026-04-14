/**
 * 04_extract_indice.js — Estrazione Indice Analitico della Raccolta Sistematica
 * 
 * La sezione "Indice analitico" è presente alla fine del DOCX della raccolta.
 * L'indice ha il formato: "Voce (eventuale sottvoce); n_pag; n_pag; ..."
 * 
 * Output: normativa.indiceAnalitico.json
 * Schema di ogni voce:
 *   - id
 *   - label (voce principale)
 *   - subLabel (sottovoce, se presente)
 *   - pageRefsOriginali (es. "121; 125; 148")
 *   - relatedArticleIds: [] (filled by 06_match_pareri.js)
 *   - relatedSchedaIds: []
 *   - relatedParereIds: []
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

const htmlFile = path.join(ROOT_DIR, 'fileprogetto/hardening_raccolta.html');

if (!fs.existsSync(htmlFile)) {
    console.error(`File HTML raccolta non trovato: ${htmlFile}`);
    process.exit(1);
}

const htmlRaw = fs.readFileSync(htmlFile, 'utf16le');
const html = htmlRaw.replace(/^\uFEFF/, '');
const $ = cheerio.load(html);

// Troviamo la posizione dell'indice analitico nel testo
let inIndice = false;
const voci = [];
const qaProblems = [];

$('h1, h2, h3, h4, p').each((i, el) => {
    const tag = (el.tagName || el.name || '').toLowerCase();
    const $el = $(el);
    const text = $el.text().replace(/\s+/g, ' ').trim();

    if (!text) return;

    // Identifica inizio sezione indice analitico
    if (text.match(/indice\s+analitico/i)) {
        inIndice = true;
        return;
    }

    if (!inIndice) return;

    // Le voci dell'indice sono paragrafi con numeri di pagina (es. "Age management; 121; 125")
    // Pattern: testo seguito da punto e virgola e numeri
    if (tag === 'p') {
        // Pattern di voce indice: "Termine; n; n; n"
        // Oppure "Termine — sottovoce; n"
        const pagePattern = /[;,]\s*\d+/;
        if (!pagePattern.test(text)) return; // Non è una voce di indice

        // Estrai la parte testuale e i numeri di pagina
        // Split sul primo numero di pagina
        const splitMatch = text.match(/^(.+?)[;,]\s*(\d[\d;,\s]*)$/);
        if (!splitMatch) return;

        const labelPart = splitMatch[1].trim();
        const pageRefsPart = splitMatch[2].trim();
        const pageRefs = pageRefsPart.split(/[;,]/).map(s => s.trim()).filter(s => /^\d+$/.test(s)).join('; ');

        // Separa voce principale da sottovoce
        // Pattern: "Voce principale — sottovoce" oppure "Voce principale: sottovoce"
        let label = labelPart;
        let subLabel = '';

        const dashSplit = labelPart.split(/\s[–—-]\s/);
        if (dashSplit.length >= 2) {
            label = dashSplit[0].trim();
            subLabel = dashSplit.slice(1).join(' — ').trim();
        } else {
            const colonSplit = labelPart.split(/:\s+/);
            if (colonSplit.length >= 2 && colonSplit[0].length < 40) {
                label = colonSplit[0].trim();
                subLabel = colonSplit.slice(1).join(': ').trim();
            }
        }

        if (!label) return;

        const id = `indice-${voci.length}-${label.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}`;

        voci.push({
            id,
            label,
            subLabel: subLabel || undefined,
            pageRefsOriginali: pageRefs,
            relatedArticleIds: [],  // filled by 06_match_pareri.js
            relatedSchedaIds: [],   // filled by 06_match_pareri.js
            relatedParereIds: []    // filled by 06_match_pareri.js
        });
    }
});

// QA
if (voci.length < 50) {
    qaProblems.push({ tipo: 'INDICE_INCOMPLETO', msg: `Solo ${voci.length} voci estratte dall'indice analitico. Attese almeno 50.` });
}

const labelsUniq = new Set(voci.map(v => v.label));
if (labelsUniq.size < voci.length * 0.8) {
    qaProblems.push({ tipo: 'VOCI_DUPLICATE', msg: 'Molte voci con label identici, possibile errore di parsing' });
}

// Salvataggio
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

fs.writeFileSync(path.join(OUT_DIR, 'normativa.indiceAnalitico.json'), JSON.stringify(voci, null, 2));

const qaReport = {
    timestamp: new Date().toISOString(),
    totaleVoci: voci.length,
    conSottovoce: voci.filter(v => v.subLabel).length,
    senzaPageRefs: voci.filter(v => !v.pageRefsOriginali).length,
    problemi: qaProblems
};
fs.writeFileSync(path.join(REPORTS_DIR, 'indice_qa.json'), JSON.stringify(qaReport, null, 2));

console.log(`✅ Indice Analitico: ${voci.length} voci estratte`);
console.log(`   Con sottovoce: ${qaReport.conSottovoce}`);
if (qaProblems.length > 0) {
    console.warn(`⚠️  Problemi: ${qaProblems.map(p => p.msg).join(', ')}`);
}
