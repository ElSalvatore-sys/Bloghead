/**
 * Stripe Create Payment Intent Edge Function
 *
 * Creates a PaymentIntent for booking payments with destination charges
 * to artist Stripe Connect accounts.
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

    const { bookingId, paymentMethodId, savePaymentMethod } = await req.json()

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        artist_id,
        total_price,
        payment_status,
        artist_profiles!inner (
          id,
          stage_name
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      throw new Error('Buchung nicht gefunden')
    }

    if (booking.user_id !== user.id) {
      throw new Error('Keine Berechtigung für diese Buchung')
    }

    if (booking.payment_status === 'paid') {
      throw new Error('Buchung wurde bereits bezahlt')
    }

    // Get artist's Stripe account
    const { data: stripeAccount, error: accountError } = await supabase
      .from('artist_stripe_accounts')
      .select('stripe_account_id, charges_enabled')
      .eq('artist_id', booking.artist_id)
      .single()

    if (accountError || !stripeAccount) {
      throw new Error('Künstler hat kein Stripe-Konto')
    }

    if (!stripeAccount.charges_enabled) {
      throw new Error('Künstler-Konto ist nicht verifiziert')
    }

    // Calculate platform fee (10%)
    const totalAmount = Math.round(booking.total_price * 100) // Convert to cents
    const platformFee = Math.round(totalAmount * 0.10)

    // Get or create Stripe customer
    let stripeCustomerId: string

    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingCustomer) {
      stripeCustomerId = existingCustomer.stripe_customer_id
    } else {
      // Get user details
      const { data: userData } = await supabase
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', user.id)
        .single()

      const customer = await stripe.customers.create({
        email: userData?.email || user.email,
        name: userData ? `${userData.first_name} ${userData.last_name}` : undefined,
        metadata: {
          user_id: user.id,
        },
      })

      // Save customer
      await supabase
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          stripe_customer_id: customer.id,
        })

      stripeCustomerId = customer.id
    }

    // Create PaymentIntent with destination charge
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: totalAmount,
      currency: 'eur',
      customer: stripeCustomerId,
      payment_method_types: ['card', 'sepa_debit', 'giropay'],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: stripeAccount.stripe_account_id,
      },
      metadata: {
        booking_id: bookingId,
        artist_id: booking.artist_id,
        user_id: user.id,
      },
      description: `Buchung bei ${(booking.artist_profiles as { stage_name: string }).stage_name}`,
    }

    // Attach payment method if provided
    if (paymentMethodId) {
      paymentIntentParams.payment_method = paymentMethodId
      paymentIntentParams.confirm = true
      paymentIntentParams.return_url = `https://blog-head.com/bookings/${bookingId}/success`
    }

    // Save payment method for future use
    if (savePaymentMethod && paymentMethodId) {
      paymentIntentParams.setup_future_usage = 'off_session'
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    // Save payment record
    await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        artist_id: booking.artist_id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: totalAmount,
        currency: 'EUR',
        platform_fee: platformFee,
        artist_payout: totalAmount - platformFee,
        status: paymentIntent.status,
      })

    // Update booking payment status
    await supabase
      .from('bookings')
      .update({
        payment_status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', bookingId)

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
