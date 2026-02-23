import { readFileSync } from 'fs';
import { resolve } from 'path';

// 1. Legge il file .env manualmente (senza bisogno di installare dotenv)
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

const supabaseUrl = envVars.VITE_SUPABASE_URL || '';
// ATTENZIONE: per scrivere nel database protetto serve la SERVICE_ROLE_KEY, non la anon_key
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY || '';
const openaiKey = envVars.OPENAI_API_KEY || '';

if (!supabaseUrl || !supabaseServiceKey || !openaiKey) {
    console.error("❌ Errore: Variabili d'ambiente mancanti.");
    process.exit(1);
}

// 2. Il testo fittizio (Il "Manuale") da inserire
const manualText = `
Capitolo 1: Salario Accessorio e Indennità
Il fondo per il salario accessorio destinato al personale dipendente per l'anno 2024 prevede un incremento del 3% per le attività di front-office.
L'indennità per le specifiche responsabilità è fissata ad un massimo di 2.500 euro annui lordi per dipendente.

Capitolo 2: Elevate Qualificazioni (EQ)
Il budget destinato al personale con Elevata Qualificazione è gestito separatamente. L'indennità di posizione varia da un minimo di 5.000 euro a un massimo di 16.000 euro annui, a seconda della pesatura del ruolo.

Capitolo 3: Performance e Premi
I premi collegati alla performance individuale vengono erogati solo ai dipendenti che hanno raggiunto almeno l'85% degli obiettivi prefissati nella scheda di valutazione annuale. La quota massima erogabile non può superare il 30% della retribuzione base.
`;

async function main() {
    console.log('⏳ Suddivisione del testo in paragrafi (chunks)...');

    // Dividiamo il testo in paragrafi usando il doppio a capo come separatore
    const chunks = manualText.split('\n\n').map(c => c.trim()).filter(c => c.length > 10);

    for (let i = 0; i < chunks.length; i++) {
        const content = chunks[i];
        console.log(`\n🔹 Elaborazione paragrafo ${i + 1}/${chunks.length}...`);

        try {
            // A. Genera il vettore usando direttamente le API REST di OpenAI
            const aiResponse = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    input: content,
                    model: 'text-embedding-3-small'
                })
            });

            if (!aiResponse.ok) {
                const errObj = await aiResponse.json();
                throw new Error('Errore OpenAI: ' + JSON.stringify(errObj));
            }

            const aiData = await aiResponse.json();
            const embedding = aiData.data[0].embedding;

            // B. Salva su Supabase
            const supaResponse = await fetch(`${supabaseUrl}/rest/v1/document_chunks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    content: content,
                    metadata: { source: 'Manuale Test 2024', chunk_index: i },
                    embedding: embedding
                })
            });

            if (!supaResponse.ok) {
                const errObj = await supaResponse.json();
                throw new Error('Errore Supabase: ' + JSON.stringify(errObj));
            }

            console.log(`✅ Paragrafo ${i + 1} salvato con successo!`);

        } catch (error: any) {
            console.error(`❌ Fallimento sul paragrafo ${i + 1}:`, error.message);
        }
    }

    console.log('\n🎉 Ingestion completata!');
}

main();
