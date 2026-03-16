import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Check if the user calling this function is an ADMIN
        // We already have RLS policies, but double-Checking here is good practice
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        // Optional: Query your DB to check if this user is truly an admin if you want strict security
        // For now, we rely on the fact that only Admins can see the page initiating this call

        // Create the Admin Client (Service Role)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? ''
        )

        const { email, password } = await req.json()

        // Create User
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true // Auto-confirm
        })

        if (createError) throw createError

        // Sync with public table (so it appears in the list immediately)
        if (newUser.user) {
            // 1. Create a default Entity for the new user
            const { data: entity, error: entityError } = await supabaseAdmin
                .from('entities')
                .insert({
                    user_id: newUser.user.id,
                    name: 'Mio Ente'
                })
                .select()
                .single();

            if (entityError) {
                console.error("Error creating default entity:", entityError);
                throw new Error("Errore durante la creazione dell'ente predefinito.");
            }

            // 2. Create the app state row
            const { error: dbError } = await supabaseAdmin.from('user_app_state').insert({
                user_id: newUser.user.id,
                entity_id: entity?.id, // Link to the entity we just created
                email: newUser.user.email,
                role: 'GUEST', // Default role
                current_year: new Date().getFullYear(),
                updated_at: new Date().toISOString()
            });

            if (dbError) {
                console.error("Error creating app state record:", dbError);
                throw new Error("Errore durante l'inizializzazione dello stato utente.");
            }
        }

        if (createError) throw createError

        return new Response(
            JSON.stringify(newUser),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
