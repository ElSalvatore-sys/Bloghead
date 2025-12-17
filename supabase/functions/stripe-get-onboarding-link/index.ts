/**
 * Stripe Get Onboarding Link Edge Function
 *
 * Generates a new onboarding link for artists to complete
 * their Stripe Connect account setup.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Nicht authentifiziert')
    }

    const { artistId } = await req.json()

    // Verify user owns this artist profile
    const { data: artist, error: artistError } = await supabase
      .from('artist_profiles')
      .select('id, user_id')
      .eq('id', artistId)
      .eq('user_id', user.id)
      .single()

    if (artistError || !artist) {
      throw new Error('Künstlerprofil nicht gefunden')
    }

    // Get Stripe account
    const { data: stripeAccount, error } = await supabase
      .from('artist_stripe_accounts')
      .select('stripe_account_id')
      .eq('artist_id', artistId)
      .single()

    if (error || !stripeAccount) {
      throw new Error('Kein Stripe-Konto gefunden. Bitte erstellen Sie zuerst ein Konto.')
    }

    // Create new onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.stripe_account_id,
      refresh_url: `https://blog-head.com/dashboard/artist/payments?refresh=true`,
      return_url: `https://blog-head.com/dashboard/artist/payments?success=true`,
      type: 'account_onboarding',
    })

    // Update cached URL
    await supabase
      .from('artist_stripe_accounts')
      .update({
        onboarding_url: accountLink.url,
        onboarding_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('artist_id', artistId)

    return new Response(
      JSON.stringify({ url: accountLink.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error getting onboarding link:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
