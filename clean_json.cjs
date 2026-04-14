const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'data', 'normativa');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

const replacements = {
  'ÔÇö': '—',
  'ÔÇ£': '“',
  'ÔÇØ': '”',
  '├¿': 'è',
  '┬á': ' ',
  'ÔÇÖ': '’',
  'ÔÇô': '–', // en dash (guess)
  'Ã¨': 'è',
  'Ã©': 'é',
  'Ã ': 'à',
  'Ã¬': 'ì',
  'Ã¹': 'ù',
  'Ã²': 'ò',
  '├á': 'à',
  '├®': 'é',
  '├¼': 'ì',
  '├▓': 'ò',
  '├╣': 'ù'
};

let totalReplacements = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalLength = content.length;
  
  let tempContent = content;
  for (const [bad, good] of Object.entries(replacements)) {
    tempContent = tempContent.split(bad).join(good);
  }
  
  if (tempContent !== content) {
    fs.writeFileSync(filePath, tempContent, 'utf8');
    console.log('Fixed', file);
    totalReplacements++;
  }
}

console.log('Total files cleaned:', totalReplacements);
