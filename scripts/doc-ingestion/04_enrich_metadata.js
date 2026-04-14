import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const OUT_DIR = path.join(ROOT_DIR, 'src/data/normativa');

const articlesFile = path.join(OUT_DIR, 'raccolta.articles.json');
if (!fs.existsSync(articlesFile)) process.exit(0);

const articles = JSON.parse(fs.readFileSync(articlesFile, 'utf8'));
const indiceAnalitico = [];

// Determine key concepts per article via basic dictionary matching
articles.forEach(art => {
  const text = art.testoIntegrale.toLowerCase();
  const keywordsMatch = [
    'fondo', 'risorse', 'stabile', 'variabile', 'indennità', 'straordinario', 
    'specifiche responsabilità', 'performance', 'comparto', 'progressioni', 
    'differenziali', 'turnazione', 'reperibilità'
  ];
  
  const found = keywordsMatch.filter(k => text.includes(k));
  if (found.length > 0) {
    indiceAnalitico.push({ articleId: art.id, articolo: art.articolo, rubrica: art.rubrica, keywords: found });
  }
});

fs.writeFileSync(path.join(OUT_DIR, 'normativa.indiceAnalitico.json'), JSON.stringify(indiceAnalitico, null, 2));
console.log('Enriched metadata and generated normativa.indiceAnalitico.json');
