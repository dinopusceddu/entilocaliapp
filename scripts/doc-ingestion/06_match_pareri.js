/**
 * 06_match_pareri.js — Matching Molti-a-Molti: Pareri ARAN ↔ Articoli ↔ Schede ↔ Indice
 * 
 * Input:
 *   - aran.pareri.json (dataset master)
 *   - raccolta.articles.json
 *   - guida.schede.json
 *   - normativa.indiceAnalitico.json
 * 
 * Output: aggiorna in place i JSON con le relazioni complete.
 * 
 * Dimensioni del matching:
 *   1. Riferimenti normativi espliciti (es. "Art. 71" nel testo del parere)
 *   2. Hashtag argomento (confronto con tag presenti nelle schede)
 *   3. Overlap parole chiave Jaccard (soglia 25%)
 *   4. Lista istituti canonici con sinonimi
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const OUT_DIR = path.join(ROOT_DIR, 'src/data/normativa');
const REPORTS_DIR = path.join(ROOT_DIR, 'scripts/doc-ingestion/reports');

// === CARICAMENTO DATI ===
function loadJSON(filename) {
    const p = path.join(OUT_DIR, filename);
    if (!fs.existsSync(p)) {
        console.error(`File non trovato: ${p}`);
        return [];
    }
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const pareri = loadJSON('aran.pareri.json');
const articoli = loadJSON('raccolta.articles.json');
const schede = loadJSON('guida.schede.json');
const indice = loadJSON('normativa.indiceAnalitico.json');

// === DIZIONARIO ISTITUTI CON SINONIMI ===
const ISTITUTI_SINONIMI = {
    'buono pasto': ['buoni pasto', 'ticket restaurant', 'ticket pasto', 'buono mensa'],
    'straordinario': ['lavoro straordinario', 'ore straordinarie', 'maggiorazione straordinario'],
    'ferie': ['riposo annuo', 'congedo ordinario'],
    'malattia': ['assenza per malattia', 'permesso malattia'],
    'maternità': ['congedo di maternità', 'astensione obbligatoria'],
    'paternità': ['congedo di paternità', 'astensione obbligatoria paternità'],
    'part-time': ['orario ridotto', 'tempo parziale', 'part time'],
    'distacco sindacale': ['distacco', 'diritti sindacali', 'prerogative sindacali'],
    'retribuzione': ['stipendio', 'paga', 'compenso', 'emolumento'],
    'progressione economica': ['progressione orizzontale', 'progressioni economiche', 'PEO'],
    'incarico dirigente': ['elevate qualificazioni', 'EQ', 'posizione organizzativa'],
    'fondo risorse decentrate': ['fondo salario accessorio', 'fondo decentrato', 'risorse decentrate'],
    'telelavoro': ['lavoro agile', 'smart working', 'lavoro a distanza'],
    'aspettativa': ['aspettative', 'sospensione rapporto'],
    'permesso retribuito': ['permessi retribuiti', 'permesso per studio', 'permesso sindacale'],
};

// Espandi: dato un sinonimo, trova il termine canonico
const SINONIMI_REVERSE = {};
Object.entries(ISTITUTI_SINONIMI).forEach(([canonical, syns]) => {
    syns.forEach(s => {
        SINONIMI_REVERSE[s.toLowerCase()] = canonical;
    });
    SINONIMI_REVERSE[canonical.toLowerCase()] = canonical;
});

function normalizzaTermine(term) {
    const lower = term.toLowerCase().trim();
    return SINONIMI_REVERSE[lower] || lower;
}

// === TOKENIZER PER JACCARD ===
const STOPWORDS = new Set(['il', 'lo', 'la', 'i', 'gli', 'le', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'e', 'o', 'ma', 'se', 'che', 'non', 'un', 'una', 'del', 'della', 'dei', 'al', 'alla', 'ai', 'alle', 'nel', 'nella', 'nei', 'nelle', 'del', 'questo', 'questa', 'questi', 'queste', 'è', 'ha', 'hanno', 'sono', 'essere', 'avere', 'fare']);

function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-zàáèéìíòóùú\s]/gi, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOPWORDS.has(w));
}

function jaccard(setA, setB) {
    if (setA.size === 0 || setB.size === 0) return 0;
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
}

// === PRE-PROCESSING ===
// Crea mappe per lookup veloce
const articoliByNum = {};
articoli.forEach(art => {
    const numMatch = art.label.match(/Art\.\s*(\d+[a-z]?\s*(?:bis|ter|quater|quinquies)?)/i);
    if (numMatch) {
        const num = numMatch[1].toLowerCase().trim();
        if (!articoliByNum[num]) articoliByNum[num] = [];
        articoliByNum[num].push(art.id);
        // Aggiungi anche varianti senza spazio (es. "71bis" vs "71 bis")
        const noSpace = num.replace(/\s/g, '');
        if (!articoliByNum[noSpace]) articoliByNum[noSpace] = [];
        if (!articoliByNum[noSpace].includes(art.id)) articoliByNum[noSpace].push(art.id);
    }
});

// Token per le schede
const schedeTokens = schede.map(s => ({
    id: s.id,
    titolo: s.titolo,
    tokens: new Set(tokenize(s.titolo + ' ' + s.testoCompleto))
}));

// Token per gli articoli
const articoliTokens = articoli.map(a => ({
    id: a.id,
    label: a.label,
    tokens: new Set(tokenize(a.titolo + ' ' + a.testoIntegrale))
}));

// === MATCHING FUNZIONE PRINCIPALE ===
const matchingStats = { totaleLink: 0, pareriConArticoli: 0, pareriConSchede: 0 };

pareri.forEach(parere => {
    const articoliMatch = new Set();
    const schedeMatch = new Set();

    const testoCompleto = parere.quesito + ' ' + parere.risposta;
    const tokensParere = new Set(tokenize(testoCompleto));

    // === DIMENSIONE 1: Riferimenti normativi espliciti ===
    parere.riferimentiNormativiEstratti.forEach(ref => {
        const numMatch = ref.match(/Art(?:icolo)?\.?\s*(\d+[a-z]?\s*(?:bis|ter|quater|quinquies)?)/i);
        if (numMatch) {
            const num = numMatch[1].toLowerCase().trim();
            // Cerca prima con spazio, poi senza
            const candidati = articoliByNum[num] || articoliByNum[num.replace(/\s/g, '')] || [];
            candidati.forEach(id => articoliMatch.add(id));
        }
    });

    // Ricerca inline nel testo completo (più aggressiva)
    const artInlineRegex = /\bart(?:icolo)?\.?\s*(\d+[a-z]?\s*(?:bis|ter|quater|quinquies)?)/gi;
    let m;
    while ((m = artInlineRegex.exec(testoCompleto)) !== null) {
        const num = m[1].toLowerCase().trim();
        const candidati = articoliByNum[num] || articoliByNum[num.replace(/\s/g, '')] || [];
        candidati.forEach(id => articoliMatch.add(id));
    }

    // === DIMENSIONE 2: Hashtag argomento vs tag schede ===
    // I pareri non hanno tag sulle schede direttamente, ma gli hashtag matchano 
    // con i titoli delle schede tramite normalizzazione
    parere.argomenti.forEach(arg => {
        const canonical = normalizzaTermine(arg);
        schede.forEach(s => {
            const titoloNorm = normalizzaTermine(s.titolo);
            if (titoloNorm.includes(canonical) || canonical.includes(titoloNorm)) {
                schedeMatch.add(s.id);
            }
        });
    });

    // === DIMENSIONE 3: Jaccard overlap ===
    const JACCARD_SOGLIA = 0.08; // soglia abbassata per più match

    schedeTokens.forEach(({ id, tokens }) => {
        const score = jaccard(tokensParere, tokens);
        if (score >= JACCARD_SOGLIA) {
            schedeMatch.add(id);
        }
    });

    articoliTokens.forEach(({ id, tokens }) => {
        const score = jaccard(tokensParere, tokens);
        if (score >= 0.1) {  // soglia leggermente più alta per gli articoli
            articoliMatch.add(id);
        }
    });

    // === DIMENSIONE 4: Istituti canonici ===
    Object.entries(ISTITUTI_SINONIMI).forEach(([canonical, syns]) => {
        const allTerms = [canonical, ...syns];
        const testoLower = testoCompleto.toLowerCase();
        const trovato = allTerms.some(t => testoLower.includes(t.toLowerCase()));
        if (trovato) {
            schede.forEach(s => {
                const titoloLower = s.titolo.toLowerCase();
                if (allTerms.some(t => titoloLower.includes(t.toLowerCase()))) {
                    schedeMatch.add(s.id);
                }
            });
        }
    });

    // Limita a massimo 10 articoli e 5 schede per parere (evita over-matching)
    parere.articoliCollegati = [...articoliMatch].slice(0, 10);
    parere.schedeCollegate = [...schedeMatch].slice(0, 5);

    if (parere.articoliCollegati.length > 0) matchingStats.pareriConArticoli++;
    if (parere.schedeCollegate.length > 0) matchingStats.pareriConSchede++;
    matchingStats.totaleLink += parere.articoliCollegati.length + parere.schedeCollegate.length;
});

// === REVERSE MATCHING: Articoli e Schede prendono i pareri che li citano ===
articoli.forEach(art => {
    art.pareriCollegati = pareri
        .filter(p => p.articoliCollegati.includes(art.id))
        .map(p => p.id);
});

schede.forEach(scheda => {
    scheda.pareriCorrelati = pareri
        .filter(p => p.schedeCollegate.includes(scheda.id))
        .map(p => p.id);
});

// === INDICE ANALITICO: Matching con articoli, schede e pareri ===
const csvPath = path.join(ROOT_DIR, 'fileprogetto/tabella_concordanza_word_ccnl_funzioni_locali.csv');
let indiceToSearchStrings = {};
if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    csvContent.split('\n').forEach(line => {
        if(!line.trim() || line.toLowerCase().startsWith('stringa')) return;
        const parts = line.split(';');
        if(parts.length >= 2) {
            const searchStr = parts[0].trim().toLowerCase();
            const voce = parts[1].trim().toLowerCase();
            if(!indiceToSearchStrings[voce]) {
                indiceToSearchStrings[voce] = [];
            }
            indiceToSearchStrings[voce].push(searchStr);
        }
    });
}

indice.forEach(voce => {
    const label = voce.label.toLowerCase();
    const subLabel = (voce.subLabel || '').toLowerCase();
    
    const fullLabel = subLabel ? `${label}, ${subLabel}` : label;
    
    let termini = [];
    if (indiceToSearchStrings[fullLabel]) {
        termini = indiceToSearchStrings[fullLabel];
    } else if (indiceToSearchStrings[label]) {
        termini = indiceToSearchStrings[label];
    } else {
        termini = [label, subLabel].filter(Boolean);
    }

    // Cerca negli articoli
    articoli.forEach(art => {
        if (termini.some(t => art.testoIntegrale.toLowerCase().includes(t) || art.titolo.toLowerCase().includes(t))) {
            if (!voce.relatedArticleIds.includes(art.id)) voce.relatedArticleIds.push(art.id);
        }
    });

    // Cerca nelle schede
    schede.forEach(s => {
        if (termini.some(t => s.testoCompleto.toLowerCase().includes(t) || s.titolo.toLowerCase().includes(t))) {
            if (!voce.relatedSchedaIds.includes(s.id)) voce.relatedSchedaIds.push(s.id);
        }
    });

    // Cerca nei pareri
    pareri.forEach(p => {
        const testoParere = (p.quesito + ' ' + p.risposta + ' ' + p.argomenti.join(' ')).toLowerCase();
        if (termini.some(t => testoParere.includes(t))) {
            if (!voce.relatedParereIds.includes(p.id)) voce.relatedParereIds.push(p.id);
        }
    });
});

// === SALVATAGGIO ===
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

fs.writeFileSync(path.join(OUT_DIR, 'aran.pareri.json'), JSON.stringify(pareri, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'raccolta.articles.json'), JSON.stringify(articoli, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'guida.schede.json'), JSON.stringify(schede, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'normativa.indiceAnalitico.json'), JSON.stringify(indice, null, 2));

const matchReport = {
    timestamp: new Date().toISOString(),
    totalePareri: pareri.length,
    pareriConArticoli: matchingStats.pareriConArticoli,
    pareriConSchede: matchingStats.pareriConSchede,
    totaleLink: matchingStats.totaleLink,
    articoliConPareri: articoli.filter(a => a.pareriCollegati.length > 0).length,
    schedeConPareri: schede.filter(s => s.pareriCorrelati.length > 0).length,
    vociIndiceConLink: indice.filter(v => v.relatedArticleIds.length + v.relatedSchedaIds.length + v.relatedParereIds.length > 0).length
};
fs.writeFileSync(path.join(REPORTS_DIR, 'matching_report.json'), JSON.stringify(matchReport, null, 2));

console.log(`✅ Matching completato:`);
console.log(`   Pareri con articoli: ${matchReport.pareriConArticoli}/${matchReport.totalePareri}`);
console.log(`   Pareri con schede: ${matchReport.pareriConSchede}/${matchReport.totalePareri}`);
console.log(`   Articoli con pareri: ${matchReport.articoliConPareri}/${articoli.length}`);
console.log(`   Schede con pareri: ${matchReport.schedeConPareri}/${schede.length}`);
console.log(`   Voci indice con link: ${matchReport.vociIndiceConLink}/${indice.length}`);
