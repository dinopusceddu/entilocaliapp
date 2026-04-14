const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'MEMORIA_AI.md');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Aggiorna la voce Stack Tecnico CSS
content = content.replace(
  '- **CSS / UI**: Tailwind CSS per il design.',
  '- **CSS / UI**: Tailwind CSS v3 installato **localmente** via PostCSS plugin (`tailwind.config.js`, `postcss.config.js`, `src/index.css`). NON usa il CDN — funziona completamente offline.'
);

// 2. Aggiunge la voce 51 prima della sezione stato attuale
const insertPoint = '\n## 🚀 Stato Attuale: PRODUCTION-READY';
const newEntry = `
51. **Fix Pagina Bianca all'Avvio (Aprile 2026)**
    - **Causa 1**: Tailwind era caricato via CDN esterno. Senza internet, nessun CSS → UI invisibile → pagina bianca.
    - **Causa 2**: \`supabase.auth.getSession()\` in \`AuthContext.tsx\` bloccava il render indefinitamente se Supabase era irraggiungibile (\`loading = true\` permanente).
    - **Fix Tailwind locale**: Installato \`tailwindcss@3\`, \`autoprefixer\`, \`postcss\` come devDependency. Creati \`tailwind.config.js\` (con colori custom del tema), \`postcss.config.js\`, \`src/index.css\` (\`@tailwind base/components/utilities\` + stili custom). Rimosso CDN dall'HTML.
    - **Fix Auth timeout**: Aggiunto timeout di 5 secondi in \`AuthContext.tsx\` — se Supabase non risponde, \`loading\` viene forzato a \`false\` e l'app mostra il login.
    - **Risultato**: App avvia offline. Tutti gli stili sono corretti. Verificato con screenshot browser.
    - ⚠️ **Nota**: Modifiche a \`postcss.config.js\`/\`tailwind.config.js\` richiedono **riavvio manuale di \`npm run dev\`** (l'HMR non li rileva).
`;

content = content.replace(insertPoint, newEntry + insertPoint);

// 3. Aggiorna lo stato attuale e timestamp
content = content.replace(
  'La feature Normativa è completata con pipeline hardened, struttura gerarchica fedele, matching molti-a-molti e build green confermata.',
  'La feature Normativa è completata. App avvia offline senza CDN esterni. Tailwind locale. Auth con timeout di sicurezza. Build e typecheck green.'
);

content = content.replace(
  '*Ultimo aggiornamento automatico: 10 Aprile 2026 — Session hardening pipeline normativa*',
  '*Ultimo aggiornamento automatico: 10 Aprile 2026 — Fix pagina bianca: Tailwind CDN → locale, Auth timeout Supabase*'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('OK. Righe:', content.split('\n').length);
