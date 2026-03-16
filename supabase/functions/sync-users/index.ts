
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch all users from Auth
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw authError;

        const results = [];

        // 2. Cross-reference with user_app_state
        for (const user of users) {
            const { data: state, error: stateError } = await supabaseAdmin
                .from('user_app_state')
                .select('user_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!state) {
                console.log(`Syncing user: ${user.email}`);

                // Create default Entity
                const { data: entity, error: entityError } = await supabaseAdmin
                    .from('entities')
                    .insert({ user_id: user.id, name: 'Mio Ente' })
                    .select()
                    .single();

                if (entityError) {
                    results.push({ email: user.email, status: 'error', detail: 'Entity creation failed' });
                    continue;
                }

                // Create App State
                const { error: dbError } = await supabaseAdmin.from('user_app_state').insert({
                    user_id: user.id,
                    entity_id: entity.id,
                    email: user.email,
                    role: 'GUEST',
                    current_year: new Date().getFullYear(),
                    updated_at: new Date().toISOString()
                });

                if (dbError) {
                    results.push({ email: user.email, status: 'error', detail: 'State creation failed' });
                } else {
                    results.push({ email: user.email, status: 'synced' });
                }
            } else {
                results.push({ email: user.email, status: 'ok' });
            }
        }

        return new Response(
            JSON.stringify({ results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
