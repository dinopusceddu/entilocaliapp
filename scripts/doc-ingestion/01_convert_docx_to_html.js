import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');
const DOCS_DIR = path.join(ROOT_DIR, 'fileprogetto');
const QA_DIR = path.join(ROOT_DIR, 'qa/normativa');

const files = [
  {
    in: path.join(DOCS_DIR, 'ccnl_funzioni_locali_raccoltasistematica_def.docx'),
    out: path.join(QA_DIR, 'raw_raccolta.html')
  },
  {
    in: path.join(DOCS_DIR, 'guidaccnlfunzionilocali07042026_giust.docx'),
    out: path.join(QA_DIR, 'raw_guida.html')
  }
];

async function convertAll() {
  for (const file of files) {
    if (!fs.existsSync(file.in)) {
      console.error(`File not found: ${file.in}`);
      continue;
    }
    console.log(`Converting ${path.basename(file.in)}...`);
    try {
      const result = await mammoth.convertToHtml({ path: file.in });
      fs.writeFileSync(file.out, result.value, 'utf8');
      console.log(`Saved HTML to ${path.basename(file.out)}`);
    } catch (e) {
      console.error(`Error converting ${file.in}:`, e);
    }
  }
}

convertAll();
