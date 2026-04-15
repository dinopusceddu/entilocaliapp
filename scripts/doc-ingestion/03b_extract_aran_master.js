/**
 * 03b_extract_aran_master.js — Parser Master Pareri ARAN
 * Fonte: fileprogetto/pareri_aran_funzioni_locali.txt (file completo, ~362 pareri)
 * 
 * Struttura file sorgente:
 *   === (separatore tra pareri)
 *   Id: XXXXX
 *   Data pubblicazione DD Mese YYYY
 *   [testo unico: quesito + risposta concatenati]
 *   (riga vuota)
 *   Argomento
 *   #tag1
 *   #tag2
 * 
 * Strategia separazione quesito/risposta:
 *   Il file NON separa esplicitamente quesito e risposta.
 *   Il quesito è la prima parte (domanda), la risposta inizia con pattern noti.
 *   Marcatori di inizio risposta: "In merito", "Con riferimento", "Si evidenzia",
 *   "Al riguardo", "In proposito", "Si fa presente", "Si rappresenta", ecc.
 *   Se nessun marcatore trovato, il contenuto è attribuito interamente al quesito e la risposta è stringa vuota.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const DATA_FILE = path.join(ROOT_DIR, 'fileprogetto/pareri_aran_funzioni_locali.txt');
const OUT_DIR = path.join(ROOT_DIR, 'src/data/normativa');
const REPORTS_DIR = path.join(ROOT_DIR, 'scripts/doc-ingestion/reports');

if (!fs.existsSync(DATA_FILE)) {
    console.error(`File master pareri ARAN non trovato: ${DATA_FILE}`);
    process.exit(1);
}

// Pattern che marcano l'inizio della risposta ARAN
const RISPOSTA_STARTS = [
    'Con riferimento',
    'Si evidenzia',
    'Al riguardo',
    'In merito',
    'In proposito',
    'Si fa presente',
    'Si rappresenta',
    'Occorre preliminarmente',
    'Premesso che',
    'Si osserva che',
    'Si precisa che',
    'Nella fattispecie',
    'In via preliminare',
    'Sentito il parere',
    'Ad avviso di questa Agenzia',
    "Al riguardo si fa",
    'Con riguardo',
    'Per quanto concerne',
    'In ordine al',
];

/**
 * Separa il contenuto testuale in quesito e risposta.
 * L'approccio è cercare il primo marcatore di risposta all'interno del testo.
 * Se trovato, il quesito è il testo prima del marcatore, la risposta è il testo dal marcatore in poi.
 * Se non trovato, tutto il contenuto è il quesito (la risposta è vuota).
 */
function separaQuesito(contenuto) {
    // Cerca il primo marcatore di risposta
    let bestPos = -1;
    let bestMarker = '';

    for (const marker of RISPOSTA_STARTS) {
        // Cerca il marcatore solo dopo una certa distanza dall'inizio
        // (evita falsi positivi nella prima frase del quesito)
        const pos = contenuto.indexOf(marker, 50);
        if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
            bestPos = pos;
            bestMarker = marker;
        }
    }

    if (bestPos === -1) {
        // Nessun marcatore trovato: tutto è quesito
        return { quesito: contenuto.trim(), risposta: '' };
    }

    const quesito = contenuto.substring(0, bestPos).trim();
    const risposta = contenuto.substring(bestPos).trim();
    return { quesito, risposta };
}

/**
 * Normalizza il testo per il calcolo dell'hash.
 * Idempotente: trim + collasso spazi multipli + lowercase.
 */
function normalizza(testo) {
    return (testo || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Calcola SHA-256 del contenuto normalizzato (quesito + risposta).
 * Stabile su variazioni marginali di formattazione.
 */
function calcolaHash(quesito, risposta) {
    const contenuto = normalizza(quesito) + '\n' + normalizza(risposta);
    return createHash('sha256').update(contenuto, 'utf8').digest('hex');
}

/**
 * Valuta i qaFlags e il parseStatus per un parere.
 * @returns { qaFlags: string[], parseStatus: string, needsEditorialReview: boolean }
 */
function valutaQA(quesito, risposta, splittato) {
    const flags = [];

    if (!risposta || risposta.trim().length === 0) {
        flags.push('risposta_vuota');
    }

    if (quesito && risposta && quesito.trim() === risposta.trim()) {
        flags.push('quesito_uguale_risposta');
    } else if (quesito && risposta && risposta.trim().length > 0) {
        // Similarità approssimata: se i primi 80 caratteri coincidono
        const q80 = quesito.trim().substring(0, 80).toLowerCase();
        const r80 = risposta.trim().substring(0, 80).toLowerCase();
        if (q80 === r80) flags.push('quesito_uguale_risposta');
    }

    if (!splittato) {
        flags.push('split_incerto');
    }

    const parseStatus = flags.includes('quesito_uguale_risposta') ? 'error'
        : flags.length > 0 ? 'warning'
        : 'ok';

    return {
        qaFlags: flags,
        parseStatus,
        needsEditorialReview: flags.length > 0,
    };
}

/**
 * Estrae i riferimenti normativi espliciti dal testo.
 */
function estraiRiferimentiNormativi(testo) {
    const refs = new Set();
    
    // Articoli del CCNL
    const regexArt = /\b(?:artt?\.?|articol[oi])\s+(\d+[a-z]?(?:\s*(?:bis|ter|quater|quinquies))?)/gi;
    let m;
    while ((m = regexArt.exec(testo)) !== null) {
        refs.add(`Art. ${m[1].trim()}`);
    }
    
    // Decreti legislativi
    const regexDlgs = /D\.?\s*Lgs\.?\s*(?:n\.?\s*)?(\d+\/\d+|\d+\s*del\s*\d+)/gi;
    while ((m = regexDlgs.exec(testo)) !== null) {
        refs.add(`D.Lgs. ${m[1]}`);
    }
    
    // Leggi
    const regexLegge = /(?:Legge|L\.)\s+(?:n\.?\s*)?(\d+\/\d+)/gi;
    while ((m = regexLegge.exec(testo)) !== null) {
        refs.add(`L. ${m[1]}`);
    }
    
    return [...refs];
}

// === PARSING PRINCIPALE ===
const content = fs.readFileSync(DATA_FILE, 'utf8');
const blocks = content.split('===').map(b => b.trim()).filter(Boolean);

const pareri = [];
const qaProblems = [];

blocks.forEach((block, index) => {
    const lines = block.split('\n').map(l => l.replace('\r', '').trim());
    
    let id = '';
    let dataPubblicazione = '';
    let hashTagsArgomento = [];
    let argomenti = [];
    const contenutoAccumulator = [];

    let fase = 'header'; // header | content | argomento

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (!line) continue;

        if (line.startsWith('Id:')) {
            id = line.replace('Id:', '').trim();
            fase = 'header';
            continue;
        }
        
        if (line.startsWith('Data pubblicazione')) {
            dataPubblicazione = line.replace('Data pubblicazione', '').trim();
            fase = 'content';
            continue;
        }
        
        if (line === 'Argomento') {
            fase = 'argomento';
            continue;
        }
        
        if (fase === 'content') {
            contenutoAccumulator.push(line);
        } else if (fase === 'argomento') {
            if (line.startsWith('#')) {
                const tag = line.substring(1).trim();
                hashTagsArgomento.push('#' + tag);
                argomenti.push(tag);
            }
        }
    }

    const contenutoCompleto = contenutoAccumulator.join('\n').trim();
    
    if (!id || !contenutoCompleto) {
        qaProblems.push({ index, id, problema: 'Parere vuoto o senza ID' });
        return;
    }

    const { quesito, risposta } = separaQuesito(contenutoCompleto);
    const splittato = risposta.trim().length > 0; // true se lo split ha trovato una risposta

    // QA: raccogli e persisti i flags nel dataset
    const { qaFlags, parseStatus, needsEditorialReview } = valutaQA(quesito, risposta, splittato);

    // Backward compat: mantieni anche il report QA esterno
    if (qaFlags.includes('quesito_uguale_risposta')) {
        qaProblems.push({ id, problema: 'Quesito e risposta identici (possibile duplicazione)' });
    }

    const riferimentiNormativiEstratti = estraiRiferimentiNormativi(contenutoCompleto);
    const aranId = id || `aran_${index}`;

    pareri.push({
        aranId,
        id: aranId,               // alias backward-compat
        dataPubblicazione,
        quesito,
        risposta,
        argomenti,
        hashTagsArgomento,
        riferimentiNormativiEstratti,
        hashContenuto: calcolaHash(quesito, risposta),
        qaFlags,
        parseStatus,
        needsEditorialReview,
        articoliCollegati: [],    // filled by 06_match_pareri.js
        schedeCollegate: []       // filled by 06_match_pareri.js
    });
});

// === SALVATAGGIO ===
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

fs.writeFileSync(path.join(OUT_DIR, 'aran.pareri.json'), JSON.stringify(pareri, null, 2));

const qaReport = {
    timestamp: new Date().toISOString(),
    totalePareri: pareri.length,
    conRisposta: pareri.filter(p => p.risposta.length > 10).length,
    soloQuesito: pareri.filter(p => p.risposta.length <= 10).length,
    problemi: qaProblems
};
fs.writeFileSync(path.join(REPORTS_DIR, 'aran_qa.json'), JSON.stringify(qaReport, null, 2));

console.log(`✅ Dataset Master Pareri ARAN: ${pareri.length} pareri`);
console.log(`   Con risposta separata: ${qaReport.conRisposta} | Solo quesito: ${qaReport.soloQuesito}`);
if (qaProblems.length > 0) {
    console.warn(`⚠️  ${qaProblems.length} problemi rilevati (vedi aran_qa.json)`);
}
