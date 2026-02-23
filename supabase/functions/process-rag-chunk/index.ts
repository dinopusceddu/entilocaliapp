import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Estrapola i dati inviati da React
    const { content, metadata, document_id } = await req.json()

    if (!content || !document_id) {
      throw new Error("Parametri mancanti: 'content' e 'document_id' sono obbligatori.")
    }

    // 2. Inizializza il client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    // Creiamo il client usando il Service Key per forzare l'inserimento
    // dato che bypassiamo la RLS per la tabella document_chunks (solo l'Edge Function può scriverci)
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Opzionale: Valida che l'utente che fa la richiesta sia autenticato
    // (potremmo usare l'header di auth, ma per ora ci fidiamo della chiamata dall'applicazione protetta)

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error("Manca la API Key di OpenAI nei Secrets.")
    }

    // 3. Genera l'Embedding tramite OpenAI
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
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`Errore OpenAI: ${errorText}`)
    }

    const aiData = await aiResponse.json()
    const embedding = aiData.data[0].embedding

    // 4. Inserimento nel database Vettoriale (Supabase pgvector)
    const { error: dbError } = await supabase
      .from('document_chunks')
      .insert({
        content: content,
        metadata: metadata || {},
        embedding: embedding,
        document_id: document_id
      })

    if (dbError) throw dbError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    console.error("Errore process-rag-chunk:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
