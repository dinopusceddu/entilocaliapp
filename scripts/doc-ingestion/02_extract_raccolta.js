/**
 * 02_extract_raccolta.js — Parser raccolta sistematica
 * Produce strutturaNormativa gerarchica fedele, con commi/lettere/punti/casi speciali.
 * QA integrato: articoli troncati, reset numerazione, mismatch inventario.
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

// Il file HTML sorgente (generato da mammoth dalla raccolta sistematica definitiva)
const htmlFile = path.join(ROOT_DIR, 'fileprogetto/hardening_raccolta.html');

if (!fs.existsSync(htmlFile)) {
    console.error(`File HTML raccolta non trovato: ${htmlFile}. Esegui prima la conversione DOCX->HTML.`);
    process.exit(1);
}

// === CONFIGURAZIONE ===
const FONTE_DEFAULT = 'CCNL 23.02.2026';
const CODICE_DEFAULT = 'ccnl-23022026';

// Fonti conosciute e i loro codici stabili
const FONTI_MAP = {
    '16.11.2022': { label: 'CCNL 16.11.2022', codice: 'ccnl-16112022' },
    '16/11/2022': { label: 'CCNL 16.11.2022', codice: 'ccnl-16112022' },
    '23.02.2026': { label: 'CCNL 23.02.2026', codice: 'ccnl-23022026' },
    '23/02/2026': { label: 'CCNL 23.02.2026', codice: 'ccnl-23022026' },
    '21.05.2018': { label: 'CCNL 21.05.2018', codice: 'ccnl-21052018' },
    '17.12.2020': { label: 'CCNL 17.12.2020', codice: 'ccnl-17122020' },
};

// === PARSING HTML ===
const htmlRaw = fs.readFileSync(htmlFile, 'utf16le');
// Rimuovi BOM se presente
const html = htmlRaw.replace(/^\uFEFF/, '');
const $ = cheerio.load(html);

const articles = [];
const toc = [];
const qaErrors = [];
const qaWarnings = [];

let currentTitoloSezione = '';
let currentCapo = '';
let started = false;
let preIndiceAnalitico = true;
let indiceAnaliticoOffset = -1;

// === REFERENCE RESOLVER ===
// Carica la registry dei riferimenti esterni se esiste
const extRefFile = path.join(OUT_DIR, 'riferimenti.esterni.json');
const extRefs = fs.existsSync(extRefFile) ? JSON.parse(fs.readFileSync(extRefFile, 'utf8')) : [];

function resolveExternalRefs(text) {
    const found = [];
    extRefs.forEach(ref => {
        ref.pattern.forEach(p => {
            if (text.toLowerCase().includes(p.toLowerCase())) {
                if (!found.includes(ref.id)) found.push(ref.id);
            }
        });
    });
    return found;
}

// === STRUTTURA NORMATIVA PARSER ===
/**
 * Determina il tipo di una riga in base al suo pattern iniziale.
 * Priorità:
 *   1. comma:     ^\d+\.\s+
 *   2. lettera speciale: ^([a-z])\s([a-z]{2,6})\)\s+  (es. "e bis)")
 *   3. lettera:   ^[a-z]\)\s+
 *   4. punto:     ^\d+\)\s+
 *   5. appendice: ^[-•]\s+
 */
function parseTipoRiga(testo, listType = 'p') {
    const t = testo.trimStart();
    
    // Se abbiamo metadati di lista, usiamo quelli come fonte di verità primaria
    if (listType === 'ol') return 'comma';      // ol top-level = commi del CCNL
    if (listType === 'ol-inner') return 'lettera'; // ol annidata = lettere
    if (listType === 'ul') return 'appendice';  // ul = elenco puntato 
    if (listType === 'ul-inner') return 'appendice'; // ul annidata
    
    // Fallback: analisi testuale (per paragrafi liberi)
    if (/^\d+\.\s+/.test(t)) return 'comma';
    // lettera speciale: es. "e bis) ", "e ter) "
    if (/^[a-z]\s[a-z]{2,6}\)\s+/i.test(t)) return 'lettera';
    // lettera semplice: es. "a) "
    if (/^[a-z]\)\s+/i.test(t)) return 'lettera';
    // punto numerico: es. "1) "
    if (/^\d+\)\s+/.test(t)) return 'punto';
    // elenco puntato
    if (/^[-•]\s+/.test(t)) return 'appendice';
    return null;
}

function estraiLabel(testo, tipo, listIndex = -1) {
    const t = testo.trimStart();
    if (tipo === 'comma') {
        // Se abbiamo il listIndex, costruiamo il label "n." da esso
        if (listIndex >= 0) return `${listIndex + 1}.`;
        const m = t.match(/^(\d+\.)\s+/);
        return m ? m[1] : '1.';
    }
    if (tipo === 'lettera') {
        // Se abbiamo il listIndex, costruiamo la lettera alfabetica da esso  
        if (listIndex >= 0) {
            // Converti indice in lettera alfabetica (0=a, 1=b, ..., 4=e, con salti come 'e bis)')
            // Usiamo direttamente il testo se inizia con pattern lettera
            const mSpeciale = t.match(/^([a-z]\s[a-z]{2,6})\)\s+/i);
            if (mSpeciale) return mSpeciale[1] + ')';
            const mSemplice = t.match(/^([a-z])\)\s+/i);
            if (mSemplice) return mSemplice[1] + ')';
            // Generazione label dalla posizione
            const lettera = String.fromCharCode(97 + listIndex);
            return `${lettera})`;
        }
        // speciale: "e bis) "
        const ms = t.match(/^([a-z]\s[a-z]{2,6})\)\s+/i);
        if (ms) return ms[1] + ')';
        const m = t.match(/^([a-z])\)\s+/i);
        return m ? m[1] + ')' : 'a)';
    }
    if (tipo === 'punto') {
        const m = t.match(/^(\d+)\)\s+/);
        return m ? m[1] + ')' : '1)';
    }
    if (tipo === 'appendice') {
        return '—';
    }
    return '';
}

function estraiTestoSenzaLabel(testo, tipo) {
    const t = testo.trimStart();
    if (tipo === 'comma') return t.replace(/^\d+\.\s+/, '');
    if (tipo === 'lettera') {
        const ms = t.replace(/^[a-z]\s[a-z]{2,6}\)\s+/i, '');
        if (ms !== t) return ms;
        return t.replace(/^[a-z]\)\s+/i, '');
    }
    if (tipo === 'punto') return t.replace(/^\d+\)\s+/, '');
    if (tipo === 'appendice') return t.replace(/^[-•]\s+/, '');
    return t;
}

/**
 * Costruisce la struttura normativa gerarchica.
 * Riceve un array di oggetti {text, listType, listIndex}.
 * listType: 'ol' = lista ordinata (commi o lettere), 'ul' = non ordinata (appendice),
 *           'ol-inner' = lista ordinata annidata (lettere), 'ul-inner' = non ordinata annidata,
 *           'p' = paragrafo libero.
 */
function costruisciStrutturaNormativa(paragrafi) {
    const struttura = [];
    let commaCorrente = null;
    let letteraCorrente = null;
    let olCounter = 0;  // contatore item in ol top-level
    let inOlContext = false;

    for (const para of paragrafi) {
        // Normalizza struttura input (supporta sia stringhe che oggetti)
        const testo = typeof para === 'string' ? para : para.text;
        const listType = typeof para === 'string' ? 'p' : para.listType;
        const listIndex = typeof para === 'string' ? -1 : para.listIndex;

        const tipo = parseTipoRiga(testo, listType);
        if (!tipo) {
            const t = testo.trim();
            if (!t) continue;
            if (letteraCorrente) {
                letteraCorrente.testo += ' ' + t;
            } else if (commaCorrente) {
                commaCorrente.testo += ' ' + t;
            } else {
                struttura.push({ tipo: 'appendice', label: '', testo: t });
            }
            continue;
        }

        const label = estraiLabel(testo, tipo, listIndex);
        const testoNetto = estraiTestoSenzaLabel(testo, tipo);
        const unita = { tipo, label, testo: testoNetto, figli: [] };

        if (tipo === 'comma') {
            struttura.push(unita);
            commaCorrente = unita;
            letteraCorrente = null;
        } else if (tipo === 'lettera') {
            if (commaCorrente) {
                commaCorrente.figli.push(unita);
            } else {
                struttura.push(unita);
            }
            letteraCorrente = unita;
        } else if (tipo === 'punto') {
            if (letteraCorrente) {
                letteraCorrente.figli.push(unita);
            } else if (commaCorrente) {
                commaCorrente.figli.push(unita);
            } else {
                struttura.push(unita);
            }
        } else if (tipo === 'appendice') {
            if (letteraCorrente) {
                letteraCorrente.figli.push(unita);
            } else if (commaCorrente) {
                commaCorrente.figli.push(unita);
            } else {
                struttura.push(unita);
            }
        }
    }

    // Pulisci figli vuoti
    const cleanFigli = (arr) => arr.map(u => {
        if (u.figli && u.figli.length === 0) delete u.figli;
        else if (u.figli) u.figli = cleanFigli(u.figli);
        return u;
    });
    return cleanFigli(struttura);
}

// === ESTRAZIONE RINVII ===
function estraiRinviiInterni(testo, artId, codiceCorrente) {
    const rinvii = [];
    // Pattern: "art. 4", "artt. 4 e 5", "articolo 4"
    const regex = /\b(?:artt?\.?|articol[oi])\s+(\d+[a-z]?(?:\s?bis|ter|quater|quinquies)?)/gi;
    let m;
    while ((m = regex.exec(testo)) !== null) {
        const num = m[1].trim();
        // ID stabile: codice-fonte + numero
        const targetId = `${codiceCorrente}-art-${num.replace(/\s/g, '-')}`;
        rinvii.push({
            label: m[0].trim(),
            targetId,
            posizione: m.index,
            fontePrevista: codiceCorrente,
            ambiguita: false
        });
    }
    return rinvii;
}

function estraiRiferimentiFonte(testo) {
    // Cerca citazioni di altri CCNL nel testo
    for (const [pattern, fonte] of Object.entries(FONTI_MAP)) {
        if (testo.includes(pattern)) return fonte;
    }
    return null;
}

// === MAIN PARSING ===
const elements = [];
$('h1, h2, h3, p, ol, ul').each((i, el) => {
    elements.push({ tag: el.tagName.toLowerCase(), el, $el: $(el) });
});

let i = 0;
while (i < elements.length) {
    const { tag, $el } = elements[i];
    const text = $el.text().replace(/\s+/g, ' ').trim();

    if (!started) {
        if (text.match(/^TITOLO\s+[IVXLC]+\b/i) && !text.includes('...')) {
            started = true;
            currentTitoloSezione = text;
        }
        i++;
        continue;
    }

    // Stop all'indice analitico
    if (text.match(/indice\s+analitico/i)) {
        indiceAnaliticoOffset = i;
        preIndiceAnalitico = false;
        break;
    }

    if (tag === 'h1') {
        currentTitoloSezione = text;
        i++;
        continue;
    }
    if (tag === 'h2') {
        currentCapo = text;
        i++;
        continue;
    }

    if (tag === 'h3' && text.match(/^Art\.\s+\d+/i)) {
        // Estrai numero e rubrica
        const titleParts = text.split(/[—–-]/).map(s => s.trim());
        const idMatch = text.match(/Art\.\s*([\d]+[a-z]?(?:\s*(?:bis|ter|quater|quinquies))?)/i);
        const artNumero = idMatch ? idMatch[1].trim().replace(/\s/g, '-') : `gen_${articles.length + 1}`;

        let label = titleParts[0];
        let rubrica = titleParts.slice(1).join(' — ').trim();
        let fonte = FONTE_DEFAULT;
        let codice = CODICE_DEFAULT;
        
        // Cerca la fonte nell'header dell'articolo
        if (text.includes('CCNL')) {
            // Prima cerca pattern esatti nella mappa
            let foundFonte = false;
            for (const [pattern, f] of Object.entries(FONTI_MAP)) {
                if (text.includes(pattern)) {
                    fonte = f.label;
                    codice = f.codice;
                    foundFonte = true;
                    break;
                }
            }
            // Fallback: estrai la data generica dal testo "CCNL DD.MM.YYYY" o "CCNL D.M.YYYY"
            if (!foundFonte) {
                const dateMatch = text.match(/CCNL\s+(\d{1,2}[./]\d{1,2}[./]\d{4})/i);
                if (dateMatch) {
                    const rawDate = dateMatch[1].replace(/\//g, '.'); // normalizza a punti
                    // Costruisci codice stabile dalla data
                    const parts = rawDate.split('.');
                    if (parts.length === 3) {
                        const d = parts[0].padStart(2, '0');
                        const mo = parts[1].padStart(2, '0');
                        const y = parts[2];
                        codice = `ccnl-${d}${mo}${y}`;
                        fonte = `CCNL ${rawDate}`;
                    }
                }
            }
        }
        
        // Il campo 'label' dell'articolo NON deve includere la data CCNL
        // (quella va in 'fonte', non nel label)
        label = label.replace(/\s+CCNL\s+[\d.\/]+/gi, '').trim();

        // Identifica i paragrafi dell'articolo (fino al prossimo h1/h2/h3)
        // Ogni paragrafo è un oggetto {text, listType, listLevel} per preservare il contesto strutturale
        const paragrafi = [];
        let j = i + 1;
        let listDepth = 0;
        
        while (j < elements.length) {
            const { tag: nextTag, $el: next$el } = elements[j];
            if (['h1', 'h2', 'h3'].includes(nextTag)) break;
            if (next$el.text().match(/indice\s+analitico/i)) break;

            if (nextTag === 'ol') {
                // Lista ordinata: ogni item è potenzialmente un comma o lettera
                let itemIdx = 0;
                next$el.children('li').each((k, li) => {
                    const $li = $(li);
                    // Testo diretto dell'li (escludendo le inner ol/ul)
                    const directText = $li.clone().children('ol, ul').remove().end().text().replace(/\s+/g, ' ').trim();
                    if (directText) {
                        paragrafi.push({ text: directText, listType: 'ol', listIndex: itemIdx });
                    }
                    // Inner lists (sub-items)
                    $li.children('ol').each((m, innerOl) => {
                        $(innerOl).children('li').each((n, innerLi) => {
                            const innerText = $(innerLi).text().replace(/\s+/g, ' ').trim();
                            if (innerText) paragrafi.push({ text: innerText, listType: 'ol-inner', listIndex: n });
                        });
                    });
                    $li.children('ul').each((m, innerUl) => {
                        $(innerUl).children('li').each((n, innerLi) => {
                            const innerText = $(innerLi).text().replace(/\s+/g, ' ').trim();
                            if (innerText) paragrafi.push({ text: innerText, listType: 'ul-inner', listIndex: n });
                        });
                    });
                    itemIdx++;
                });
            } else if (nextTag === 'ul') {
                next$el.find('li').each((k, li) => {
                    const liText = $(li).text().replace(/\s+/g, ' ').trim();
                    if (liText) paragrafi.push({ text: liText, listType: 'ul', listIndex: k });
                });
            } else {
                const pText = next$el.text().replace(/\s+/g, ' ').trim();
                if (pText && !pText.match(/^\.{4,}/)) paragrafi.push({ text: pText, listType: 'p', listIndex: -1 });
            }
            j++;
        }

        const testoIntegrale = paragrafi.map(p => p.text).join('\n');
        const strutturaNormativa = costruisciStrutturaNormativa(paragrafi);

        // Cerca se nel testo c'è citazione di una fonte diversa -> rinvii con quella fonte
        const fonteDiversa = estraiRiferimentiFonte(testoIntegrale);
        const rinviiInterni = estraiRinviiInterni(testoIntegrale, `${codice}-art-${artNumero}`, codice);
        const riferimentiEsterni = resolveExternalRefs(testoIntegrale);

        const baseId = `${codice}-art-${artNumero}`;
        // Deduplicazione: se l'ID è già presente, aggiungi un suffisso progressivo
        let finalId = baseId;
        let suffixCounter = 1;
        const existingIds = new Set(articles.map(a => a.id));
        while (existingIds.has(finalId)) {
            suffixCounter++;
            finalId = `${baseId}-v${suffixCounter}`;
        }

        const article = {
            id: finalId,
            label,
            titolo: rubrica,
            titoloSezione: currentTitoloSezione,
            capo: currentCapo,
            fonte,
            codice,
            strutturaNormativa,
            testoIntegrale,
            rinviiInterni,
            riferimentiEsterni,
            pareriCollegati: [] // filled by 06_match_pareri.js
        };

        // === QA per questo articolo ===
        const artRef = `${label} (${article.id})`;
        
        // Troncamento: finisce senza punteggiatura e testo breve post-struttura
        if (testoIntegrale.length < 200 && rubrica && strutturaNormativa.length === 0) {
            qaWarnings.push({ tipo: 'TRONCAMENTO', articolo: artRef, msg: 'Articolo con testo molto breve e nessuna struttura normativa' });
        }
        
        // Mismatch struttura: menziona lettere ma ne ha poche
        const letterCount = strutturaNormativa.reduce((acc, u) => acc + (u.figli || []).filter(f => f.tipo === 'lettera').length, 0) +
            strutturaNormativa.filter(u => u.tipo === 'lettera').length;
        if (testoIntegrale.match(/lett(?:ere|era)?\s+da\s+[a-z]\)/i) && letterCount < 5) {
            qaWarnings.push({ tipo: 'LETTERE_MANCANTI', articolo: artRef, msg: `Il testo menziona elenco di lettere ma ne sono state estratte solo ${letterCount}` });
        }

        articles.push(article);
        toc.push({ id: article.id, label: article.label, titolo: article.titolo, fonte: article.fonte });
        i = j;
        continue;
    }

    i++;
}

// === QA GLOBALE ===
// Mismatch inventario (articoli attesi: la raccolta CCNL FL ha ~84 articoli più bis/ecc.)
if (articles.length < 50) {
    qaErrors.push({ tipo: 'INVENTARIO', msg: `Solo ${articles.length} articoli estratti. Attesi almeno 50.` });
}

// Duplicati ID
const ids = articles.map(a => a.id);
const uniqueIds = new Set(ids);
if (ids.length !== uniqueIds.size) {
    qaErrors.push({ tipo: 'DUPLICATO_ID', msg: `Trovati ${ids.length - uniqueIds.size} ID duplicati` });
    ids.forEach((id, i) => {
        if (ids.indexOf(id) !== i) {
            qaErrors.push({ tipo: 'DUPLICATO_ID', articolo: id, msg: 'ID duplicato' });
        }
    });
}

// Articoli senza struttura normativa
const senzaStruttura = articles.filter(a => a.strutturaNormativa.length === 0);
if (senzaStruttura.length > 20) {
    qaWarnings.push({ tipo: 'STRUTTURA_MANCANTE', msg: `${senzaStruttura.length} articoli senza struttura normativa` });
}

// Continuità commi: cerca reset impropri (commi non progressivi)
articles.forEach(art => {
    const commi = art.strutturaNormativa.filter(u => u.tipo === 'comma');
    if (commi.length > 1) {
        for (let k = 1; k < commi.length; k++) {
            const prevNum = parseInt(commi[k-1].label, 10);
            const currNum = parseInt(commi[k].label, 10);
            if (!isNaN(prevNum) && !isNaN(currNum) && currNum !== prevNum + 1 && currNum !== 1) {
                qaWarnings.push({ tipo: 'COMMA_NON_PROGRESSIVO', articolo: art.label, msg: `Comma ${commi[k-1].label} seguito da ${commi[k].label}` });
            }
        }
    }
});

// === SALVATAGGIO ===
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

fs.writeFileSync(path.join(OUT_DIR, 'raccolta.articles.json'), JSON.stringify(articles, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'raccolta.toc.json'), JSON.stringify(toc, null, 2));

const qaReport = {
    timestamp: new Date().toISOString(),
    totaleArticoli: articles.length,
    totaleCommi: articles.reduce((acc, a) => acc + a.strutturaNormativa.filter(u => u.tipo === 'comma').length, 0),
    totaleLettere: articles.reduce((acc, a) => {
        return acc + a.strutturaNormativa.reduce((a2, u) => a2 + (u.figli || []).filter(f => f.tipo === 'lettera').length, 0) +
            a.strutturaNormativa.filter(u => u.tipo === 'lettera').length;
    }, 0),
    errori: qaErrors,
    warnings: qaWarnings
};
fs.writeFileSync(path.join(REPORTS_DIR, 'raccolta_qa.json'), JSON.stringify(qaReport, null, 2));

console.log(`✅ Pipeline Raccolta - ${articles.length} articoli estratti`);
console.log(`   QA: ${qaErrors.length} errori, ${qaWarnings.length} warnings`);
console.log(`   Struttura: ${qaReport.totaleCommi} commi, ${qaReport.totaleLettere} lettere`);
if (qaErrors.length > 0) {
    console.error('❌ ERRORI QA:');
    qaErrors.forEach(e => console.error(`   [${e.tipo}] ${e.msg}`));
}
if (qaWarnings.length > 0) {
    console.warn('⚠️  WARNINGS QA:');
    qaWarnings.slice(0, 10).forEach(w => console.warn(`   [${w.tipo}] ${w.articolo || ''} ${w.msg}`));
    if (qaWarnings.length > 10) console.warn(`   ... e altri ${qaWarnings.length - 10} warnings (vedi raccolta_qa.json)`);
}
