/**
 * Stripe Get Dashboard Link Edge Function
 *
 * Generates a login link to the Stripe Express Dashboard
 * for artists to manage their payouts and account settings.
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
      .select('stripe_account_id, onboarding_completed, charges_enabled')
      .eq('artist_id', artistId)
      .single()

    if (error || !stripeAccount) {
      throw new Error('Kein Stripe-Konto gefunden')
    }

    if (!stripeAccount.onboarding_completed) {
      throw new Error('Onboarding noch nicht abgeschlossen. Bitte schließen Sie zuerst die Kontoeinrichtung ab.')
    }

    if (!stripeAccount.charges_enabled) {
      throw new Error('Ihr Konto ist noch nicht vollständig verifiziert.')
    }

    // Create Express Dashboard login link
    const loginLink = await stripe.accounts.createLoginLink(
      stripeAccount.stripe_account_id
    )

    return new Response(
      JSON.stringify({ url: loginLink.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error getting dashboard link:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
