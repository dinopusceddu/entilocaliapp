import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { message, history } = await req.json()

        // 1. Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 2. Generate Embedding
        const openAiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openAiKey) throw new Error('Missing OPENAI_API_KEY in environment variables')

        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: message,
                model: 'text-embedding-3-small' // Matches vector(1536) in our schema
            })
        })

        if (!embeddingResponse.ok) {
            const errData = await embeddingResponse.text();
            throw new Error(`OpenAI API error: ${errData}`);
        }

        const embeddingData = await embeddingResponse.json()
        const embedding = embeddingData.data[0].embedding

        // 3. Query Supabase for similar documents
        const { data: documents, error: matchError } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.7, // Adjust based on testing
            match_count: 5
        })

        if (matchError) throw matchError

        let contextText = ""
        if (documents && documents.length > 0) {
            contextText = documents.map((doc: any) => doc.content).join("\n\n---\n\n")
        }

        // 4. Query OpenRouter
        const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
        if (!openRouterKey) throw new Error('Missing OPENROUTER_API_KEY in environment variables')

        const systemPrompt = `Sei un assistente virtuale per un'applicazione sindacale di gestione del "Salario Accessorio".
Rispondi alle domande dell'utente in italiano, basandoti ESCLUSIVAMENTE sul contesto fornito qui sotto.
Se il contesto non contiene informazioni per rispondere, di' chiaramente che non hai informazioni a riguardo e non inventare dati.
Puoi rispondere in modo discorsivo, amichevole e professionale. Usa il Markdown per formattare la tua risposta in modo leggibile (liste, grassetti, ecc).

Contesto fornito dai documenti:
${contextText}
`
        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []),
            { role: 'user', content: message }
        ]

        const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5000',
                'X-Title': 'Salario Accessorio App'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini', // Default model, fast and capable
                messages: messages
            })
        })

        if (!orResponse.ok) {
            const errData = await orResponse.text();
            throw new Error(`OpenRouter API error: ${errData}`);
        }

        const orData = await orResponse.json()
        const answer = orData.choices[0].message.content

        return new Response(JSON.stringify({
            answer,
            sources: documents?.map((d: any) => ({
                title: d.metadata?.title || 'Documento',
                id: d.id,
                similarity: d.similarity
            }))
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error: any) {
        console.error('Chat error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
