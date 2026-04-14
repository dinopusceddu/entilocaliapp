import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const DATA_FILE = path.join(ROOT_DIR, 'fileprogetto/pareri_aran_funzioni_locali.txt');
const OUT_DIR = path.join(ROOT_DIR, 'src/data/normativa');

if (!fs.existsSync(DATA_FILE)) {
    console.error('Master ARAN file not found');
    process.exit(1);
}

const content = fs.readFileSync(DATA_FILE, 'utf8');
const blocks = content.split('===').map(b => b.trim()).filter(Boolean);

const pareri = blocks.map((block, index) => {
    const lines = block.split('\n').map(l => l.trim());
    
    let id = '';
    let data = '';
    let domanda = '';
    let risposta = '';
    let tags = [];
    
    let currentField = '';
    let domandaAccumulator = [];
    let rispostaAccumulator = [];

    // Lo schema è:
    // Id: ...
    // Data ...
    // Domanda (linea 3)
    // Risposta (linee successive fino a "Argomento")
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('Id:')) {
            id = line.replace('Id:', '').trim();
        } else if (line.startsWith('Data pubblicazione')) {
            data = line.replace('Data pubblicazione', '').trim();
            // La riga dopo la data è solitamente l'inizio della domanda
            if (lines[i+1] && !lines[i+1].startsWith('Argomento')) {
                domanda = lines[i+1];
                i++; // Salta la riga della domanda
                
                // Tutto quello che segue fino a "Argomento" è la risposta
                let j = i + 1;
                while (j < lines.length && !lines[j].startsWith('Argomento')) {
                    if (lines[j]) rispostaAccumulator.push(lines[j]);
                    j++;
                }
                risposta = rispostaAccumulator.join('\n');
                i = j - 1; // Riprendi da "Argomento"
            }
        } else if (line.startsWith('Argomento')) {
            let j = i + 1;
            while (j < lines.length) {
                if (lines[j].startsWith('#')) {
                    tags.push(lines[j].substring(1).trim());
                }
                j++;
            }
            break;
        }
    }

    return {
        id: id || `aran_${index}`,
        data,
        domanda,
        risposta,
        tags
    };
});

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

fs.writeFileSync(path.join(OUT_DIR, 'aran.pareri.json'), JSON.stringify(pareri, null, 2));

console.log(`✅ Estrazione Pareri ARAN completata: ${pareri.length} pareri processati.`);
