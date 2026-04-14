/**
 * 05_build_indexes.js — Genera il search index unificato per la ricerca full-text
 * 
 * Aggrega da:
 *   - raccolta.articles.json  → tipo 'articolo'
 *   - guida.schede.json       → tipo 'guida'
 *   - aran.pareri.json        → tipo 'aran'
 * 
 * Ogni entry include: id, type, title, subtitle, content(estratto per la ricerca)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const OUT_DIR = path.join(ROOT_DIR, 'src/data/normativa');

function loadJSON(filename) {
    const p = path.join(OUT_DIR, filename);
    if (!fs.existsSync(p)) {
        console.warn(`File non trovato: ${p}`);
        return [];
    }
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const articoli = loadJSON('raccolta.articles.json');
const schede = loadJSON('guida.schede.json');
const pareri = loadJSON('aran.pareri.json');

const searchIndex = [];

// Articoli della raccolta
articoli.forEach(art => {
    searchIndex.push({
        id: art.id,
        type: 'articolo',
        title: art.label + (art.titolo ? ` — ${art.titolo}` : ''),
        subtitle: art.fonte,
        content: art.testoIntegrale ? art.testoIntegrale.substring(0, 2000) : '',
        meta: {
            titoloSezione: art.titoloSezione,
            capo: art.capo,
            fonte: art.fonte
        }
    });
});

// Schede guida
schede.forEach(scheda => {
    searchIndex.push({
        id: scheda.id,
        type: 'guida',
        title: scheda.titolo,
        subtitle: scheda.sezione,
        content: scheda.testoCompleto ? scheda.testoCompleto.substring(0, 2000) : '',
        meta: {
            sezione: scheda.sezione,
            riferimentiNormativi: scheda.riferimentiNormativi
        }
    });
});

// Pareri ARAN
pareri.forEach(parere => {
    const contentParts = [parere.quesito, parere.risposta].filter(Boolean);
    searchIndex.push({
        id: parere.id,
        type: 'aran',
        title: `Parere ARAN #${parere.id}`,
        subtitle: parere.dataPubblicazione,
        content: contentParts.join(' ').substring(0, 2000),
        meta: {
            argomenti: parere.argomenti,
            hashTags: parere.hashTagsArgomento
        }
    });
});

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

fs.writeFileSync(path.join(OUT_DIR, 'normativa.searchIndex.json'), JSON.stringify(searchIndex, null, 2));

console.log(`✅ Search Index: ${searchIndex.length} entry totali`);
console.log(`   Articoli: ${articoli.length} | Schede: ${schede.length} | Pareri: ${pareri.length}`);
