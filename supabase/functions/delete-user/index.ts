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
        const authorization = req.headers.get('Authorization')
        if (!authorization) throw new Error('Unauthorized')

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authorization } } }
        )

        // Check if the user calling this function is an ADMIN
        const { data: { user: currentUser }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !currentUser) throw new Error('Unauthorized')

        // Create the Admin Client (Service Role) for the canonical read and authorized deletion.
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? ''
        )

        // Only public.profiles.role for the verified caller authorizes deletion.
        const { data: adminCheck, error: roleError } = await Promise.resolve(supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .maybeSingle()
        ).catch(() => { throw new Error('Authorization check failed') })

        if (roleError) throw new Error('Authorization check failed')
        if (adminCheck?.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required')
        }

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
