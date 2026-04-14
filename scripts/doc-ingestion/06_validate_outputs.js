import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const OUT_DIR = path.join(ROOT_DIR, 'src/data/normativa');
const QA_DIR = path.join(ROOT_DIR, 'qa/normativa');

const da_rivedere_raccolta = [];
const da_rivedere_guida = [];
const pareri_aran_da_rivedere = [];

try {
  const articlesFile = path.join(OUT_DIR, 'raccolta.articles.json');
  if (fs.existsSync(articlesFile)) {
    const articles = JSON.parse(fs.readFileSync(articlesFile, 'utf8'));
    articles.forEach(a => {
      // Un articolo è sospetto se non ha commi o è eccezionalmente corto, oppure non ha rubrica/fonte.
      if (a.commi.length === 0 || a.testoIntegrale.length < 50) {
        da_rivedere_raccolta.push({ id: a.id, title: a.articolo, reason: 'Nessun comma o testo troppo corto (possibile voce di indice)' });
      } else if (!a.rubrica || !a.fonte) {
        da_rivedere_raccolta.push({ id: a.id, title: a.articolo, reason: 'Asenza rubrica o fonte' });
      }
    });
  }
  
  const schedeFile = path.join(OUT_DIR, 'guida.schede.json');
  if (fs.existsSync(schedeFile)) {
    const schede = JSON.parse(fs.readFileSync(schedeFile, 'utf8'));
    schede.forEach(s => {
      if (!s.titoloScheda || s.blocchiStrutturati.length === 0) {
        da_rivedere_guida.push({ id: s.id, reason: 'Nessun titoloScheda o zero blocchiStrutturati', section: s.sezione });
      }
    });
  }

  const pareriFile = path.join(OUT_DIR, 'guida.pareriAran.json');
  if (fs.existsSync(pareriFile)) {
    const pareri = JSON.parse(fs.readFileSync(pareriFile, 'utf8'));
    pareri.forEach(p => {
      if (!p.codiceParere || !p.risposta || p.risposta.length < 30) {
        pareri_aran_da_rivedere.push({ id: p.id, scheda: p.schedaId, reason: 'Codice o contenuto parere mancante/anomalo' });
      }
    });
  }

  fs.writeFileSync(path.join(QA_DIR, 'raccolta_da_rivedere.json'), JSON.stringify(da_rivedere_raccolta, null, 2));
  fs.writeFileSync(path.join(QA_DIR, 'guida_da_rivedere.json'), JSON.stringify(da_rivedere_guida, null, 2));
  fs.writeFileSync(path.join(QA_DIR, 'pareri_aran_da_rivedere.json'), JSON.stringify(pareri_aran_da_rivedere, null, 2));
  
  console.log(`Validation complete. QA reports:
  - ${da_rivedere_raccolta.length} anomalie nella Raccolta
  - ${da_rivedere_guida.length} anomalie nella Guida
  - ${pareri_aran_da_rivedere.length} anomalie nei Pareri ARAN`);

} catch (e) {
  console.error(e);
}
