import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''
// In a real environment we'd use service role key for inserting, but anon key might work if RLS allows it

const supabase = createClient(supabaseUrl, supabaseKey)

// You will need OPENAI_API_KEY in your .env or system env variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function main() {
    const content = `Il fondo accessorio per il personale dell'anno 2024 è stato incrementato del 5% rispetto all'anno precedente. 
Le risorse destinate alle Elevate Qualificazioni sono state riviste secondo le nuove direttive sindacali regionali, portando a un budget separato di 50.000 euro netti.`

    console.log('Generating embedding...')
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: content,
        })

        const embedding = response.data[0].embedding

        console.log('Inserting into Supabase...')
        const { data, error } = await supabase
            .from('knowledge_base')
            .insert([
                {
                    content,
                    embedding,
                    metadata: { title: 'Documento Test Salario 2024' }
                }
            ])

        if (error) {
            console.error('Error inserting document:', error)
        } else {
            console.log('Document inserted successfully!', data)
        }
    } catch (e: any) {
        console.error("OpenAI or Supabase Error. Make sure OPENAI_API_KEY is exported and pgvector/RLS are set correctly.", e.message)
    }
}

main()
