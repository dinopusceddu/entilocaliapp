import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Leggiamo la chiave anonima dal .env per autenticare la chiamata alla funzione pubblica
const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf8');

const envVars = Object.fromEntries(
    envContent.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
            const splitIdx = line.indexOf('=');
            const key = line.slice(0, splitIdx).trim();
            let value = line.slice(splitIdx + 1).trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            return [key, value];
        })
);

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

async function testEdgeFunction() {
    const question = 'Quali sono i requisiti per i premi legati alla performance?';
    console.log(`\n🗣️ Domanda: "${question}"`);
    console.log(`\n⏳ Contatto I'Intelligenza Artificiale (Llama 3) in corso...\n`);

    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/chat-rag`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({ query: question })
        });

        if (!response.ok) {
            const err = await response.text();
            writeFileSync('./out.txt', err);
            console.log('Error saved to out.txt');
            return;
        }

        const data = await response.json();
        console.log(`🤖 Ops, l'AI ha risposto:\n`);
        console.log(`\x1b[32m${data.answer}\x1b[0m\n`); // Stampa in verde
    } catch (e: any) {
        console.log('--- EXCEPTION LOG ---');
        console.log(e.message);
        console.log('---------------------');
    }
}

testEdgeFunction();
