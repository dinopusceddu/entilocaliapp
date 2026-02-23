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
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 1. Authenticate User
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        // 2. Initialize Admin Client
        // We use SERVICE_ROLE_KEY (must be set in secrets)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Check if Requester is ADMIN
        // querying user_app_state to verify role
        const { data: requesterData, error: requesterError } = await supabaseAdmin
            .from('user_app_state')
            .select('role')
            .eq('user_id', user.id)
            .single()

        if (requesterError || !requesterData || requesterData.role !== 'ADMIN') {
            throw new Error('Forbidden: Only Admins can change passwords')
        }

        const { targetUserId, newPassword } = await req.json()

        if (!targetUserId || !newPassword || newPassword.length < 6) {
            throw new Error('Invalid input: Password must be at least 6 characters')
        }

        // 4. Update Password
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            targetUserId,
            { password: newPassword }
        )

        if (updateError) throw updateError

        return new Response(
            JSON.stringify({ success: true, message: 'Password updated successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
