import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlFile = 'fileprogetto/raw_mammoth_output.html';

if (!fs.existsSync(htmlFile)) {
    console.error(`File not found: ${htmlFile}`);
    process.exit(1);
}

const html = fs.readFileSync(htmlFile, 'utf8');
const $ = cheerio.load(html);

console.log('--- TEST STRUTTURA ---');
console.log('P:', $('p').length);
console.log('H1:', $('h1').length);
console.log('H2:', $('h2').length);
console.log('H3:', $('h3').length);

console.log('--- PRIMI 20 HEADERS ---');
$('h1, h2, h3').slice(0, 20).each((i, el) => {
    const tagName = el.name || el.tagName;
    console.log(`${tagName}: [${$(el).text().trim()}]`);
});

console.log('--- TEST FILTRO TITOLO ---');
const match = $('h1').filter((i, el) => $(el).text().includes('TITOLO'));
console.log('Trovati TITOLO in H1:', match.length);
if (match.length > 0) {
    console.log('Esempio:', match.first().text().trim());
}

console.log('--- TEST FILTRO ARTICOLO ---');
const artMatch = $('h3').filter((i, el) => $(el).text().includes('Art.'));
console.log('Trovati Art. in H3:', artMatch.length);
if (artMatch.length > 0) {
    console.log('Primo Articolo:', artMatch.first().text().trim());
}
