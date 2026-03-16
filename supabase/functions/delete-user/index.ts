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
        const { data: { user: currentUser }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !currentUser) throw new Error('Unauthorized')

        // Verify Admin role in public.user_app_state
        const { data: adminCheck, error: roleError } = await supabaseClient
            .from('user_app_state')
            .select('role')
            .eq('user_id', currentUser.id)
            .limit(1)
            .single()

        if (roleError || adminCheck?.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required')
        }

        // Create the Admin Client (Service Role) to perform deletion
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? ''
        )

        const { userId } = await req.json()

        if (!userId) {
            throw new Error('UserId is required')
        }

        // Delete User from Auth
        // This will trigger CASCADE deletion in public tables if configured
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (deleteError) throw deleteError

        return new Response(
            JSON.stringify({ success: true, message: `User ${userId} deleted successfully` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
