/**
 * Stripe Create Connect Account Edge Function
 *
 * Creates a Stripe Connect Express account for artists
 * to receive payouts from bookings.
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
      .select('id, user_id, stage_name')
      .eq('id', artistId)
      .eq('user_id', user.id)
      .single()

    if (artistError || !artist) {
      throw new Error('Künstlerprofil nicht gefunden')
    }

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('artist_stripe_accounts')
      .select('stripe_account_id')
      .eq('artist_id', artistId)
      .single()

    if (existingAccount) {
      throw new Error('Stripe-Konto existiert bereits')
    }

    // Get user email
    const { data: userData } = await supabase
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', user.id)
      .single()

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'DE',
      email: userData?.email || user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
        sepa_debit_payments: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        name: artist.stage_name,
        mcc: '7929', // Entertainment services
        url: `https://blog-head.com/artists/${artistId}`,
      },
      metadata: {
        artist_id: artistId,
        user_id: user.id,
      },
    })

    // Save to database
    const { error: insertError } = await supabase
      .from('artist_stripe_accounts')
      .insert({
        artist_id: artistId,
        stripe_account_id: account.id,
        stripe_account_status: 'pending',
        onboarding_completed: false,
        charges_enabled: false,
        payouts_enabled: false,
        default_currency: 'EUR',
        country: 'DE',
      })

    if (insertError) {
      // Rollback: delete Stripe account
      await stripe.accounts.del(account.id)
      throw new Error('Fehler beim Speichern des Kontos')
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `https://blog-head.com/dashboard/artist/payments?refresh=true`,
      return_url: `https://blog-head.com/dashboard/artist/payments?success=true`,
      type: 'account_onboarding',
    })

    // Save onboarding URL
    await supabase
      .from('artist_stripe_accounts')
      .update({
        onboarding_url: accountLink.url,
        onboarding_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('artist_id', artistId)

    return new Response(
      JSON.stringify({
        accountId: account.id,
        onboardingUrl: accountLink.url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating Connect account:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
