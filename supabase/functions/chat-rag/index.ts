import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Gestione preflight CORS (per quando chiami la funzione dal frontend React)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Estrapola la domanda dell'utente e i dati di contesto dal body della richiesta
    const { query, contextData } = await req.json()
    if (!query) throw new Error("Manca il parametro 'query' (la domanda).")

    // 2. Inizializza il client Supabase (utilizzando le chiavi automaticamente fornite all'Edge Function)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_ANON_KEY') || '' // O service_role se hai RLS stretta in lettura
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Recupera i nostri Secrets personali
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY') // Nuova chiave Google Diretta

    if (!openaiKey || !geminiKey) {
      throw new Error("Mancano le API Key di OpenAI o Gemini nei Secrets dell'Edge Function.")
    }

    console.log(`Domanda ricevuta: "${query}"`)
    if (contextData) {
      console.log(`Ricevuto contesto utente aggiuntivo di lunghezza: ${contextData.length}`)
    }

    // 3. Trasformazione della domanda in "numeri" (Embedding) tramite OpenAI
    const aiResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-3-small'
      })
    })

    if (!aiResponse.ok) throw new Error("Errore OpenAI nella generazione vettori.")
    const aiData = await aiResponse.json()
    const queryEmbedding = aiData.data[0].embedding

    // 4. Ricerca dei paragrafi simili nel database (chiamando la funzione SQL che abbiamo creato prima!)
    const { data: chunks, error: matchError } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.2, // Più è alto (es 0.8), più le parole devono essere identiche. 0.2 è flessibile.
      match_count: 5        // Prende i migliori 5 paragrafi del manuale
    })

    if (matchError) throw matchError

    // 5. Uniamo i paragrafi trovati in un unico grande testo "Contesto"
    const contextText = chunks && chunks.length > 0
      ? chunks.map((chunk: any) => chunk.content).join('\n\n--- \n\n')
      : "Nessun paragrafo rilevante trovato nel manuale."

    console.log("Contesto trovato:", contextText.substring(0, 100) + "...")

    // 6. Chiamata diretta a GEMINI (Google SDK)
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Il modello gratuito e ultra-veloce

    const prompt = `Sei un assistente esperto in materia di Salario Accessorio per gli Enti Locali. 
Rispondi alla domanda dell'utente basandoti sulle seguenti due fonti di informazioni (se presenti):
1. I DATI SPECIFICI DELL'ENTE DELL'UTENTE (Contesto specifico fornito in tempo reale).
2. IL MANUALE (Contesto RAG derivante dai documenti caricati).

Se i DATI SPECIFICI DELL'ENTE permettono di rispondere a una domanda sui numeri o sui dettagli del comune, usa quelli con priorità.
Se la risposta non è presente in nessuno dei due contesti, NON inventartela. Rispondi cortesemente: "Non ho trovato questa informazione per poter rispondere."

${contextData ? `=== DATI SPECIFICI DELL'ENTE DELL'UTENTE ===\n${contextData}\n=============================================\n` : ''}

=== CONTESTO DEL MANUALE (RAG) ===
${contextText}
==================================

DOMANDA DELL'UTENTE:
${query}`;

    const result = await model.generateContent(prompt);
    const aiMessage = result.response.text();

    return new Response(JSON.stringify({ answer: aiMessage, sources: chunks ? chunks.map((c: any) => c.metadata) : [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
