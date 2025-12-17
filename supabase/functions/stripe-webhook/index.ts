/**
 * Stripe Webhook Handler Edge Function
 *
 * Handles all Stripe webhook events:
 * - payment_intent.succeeded - Update booking payment status
 * - checkout.session.completed - Credit coins to user
 * - account.updated - Update artist account status
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

// Initialize Stripe without specifying apiVersion to use account default
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set')
}
if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET is not set')
}

const stripe = new Stripe(stripeSecretKey!, {
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  // Debug logging
  console.log('Webhook received')
  console.log('Signature present:', !!signature)
  console.log('Body length:', body.length)
  console.log('Webhook secret configured:', !!webhookSecret)

  if (!signature) {
    console.error('No stripe-signature header present')
    return new Response(JSON.stringify({ error: 'No signature' }), {
      status: 400,
    })
  }

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret!)
    console.log('Event verified successfully:', event.type)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    console.error('Error details:', err)
    return new Response(JSON.stringify({ error: 'Invalid signature', details: err.message }), {
      status: 400,
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(supabase, paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailed(supabase, paymentIntent)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(supabase, session)
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        await handleAccountUpdated(supabase, account)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
})

/**
 * Handle successful payment intent (booking payments)
 */
async function handlePaymentIntentSucceeded(
  supabase: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent
) {
  const bookingId = paymentIntent.metadata?.booking_id

  if (!bookingId) {
    console.log('PaymentIntent without booking_id, skipping')
    return
  }

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      paid_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
    })
    .eq('id', bookingId)

  console.log(`Payment succeeded for booking ${bookingId}`)
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(
  supabase: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent
) {
  const bookingId = paymentIntent.metadata?.booking_id

  if (!bookingId) return

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      failure_reason: paymentIntent.last_payment_error?.message,
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'failed',
    })
    .eq('id', bookingId)

  console.log(`Payment failed for booking ${bookingId}`)
}

/**
 * Handle completed checkout session (coin purchases)
 */
async function handleCheckoutSessionCompleted(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session
) {
  // Only process coin purchases
  if (session.metadata?.type !== 'coin_purchase') {
    return
  }

  const userId = session.metadata.user_id
  const coins = parseInt(session.metadata.coins, 10)

  // Update coin transaction
  await supabase
    .from('coin_transactions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('stripe_checkout_session_id', session.id)

  // Credit coins to user
  const { data: currentBalance } = await supabase
    .from('user_coins')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (currentBalance) {
    // Update existing balance
    await supabase
      .from('user_coins')
      .update({
        balance: currentBalance.balance + coins,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
  } else {
    // Create new balance record
    await supabase
      .from('user_coins')
      .insert({
        user_id: userId,
        balance: coins,
      })
  }

  console.log(`Credited ${coins} coins to user ${userId}`)
}

/**
 * Handle Connect account updates
 */
async function handleAccountUpdated(
  supabase: ReturnType<typeof createClient>,
  account: Stripe.Account
) {
  const artistId = account.metadata?.artist_id

  if (!artistId) {
    console.log('Account update without artist_id, skipping')
    return
  }

  // Determine account status
  let status = 'pending'
  if (account.details_submitted && account.charges_enabled) {
    status = 'active'
  } else if (account.requirements?.currently_due?.length) {
    status = 'incomplete'
  }

  // Update account record
  await supabase
    .from('artist_stripe_accounts')
    .update({
      stripe_account_status: status,
      onboarding_completed: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_account_id', account.id)

  console.log(`Account ${account.id} updated: status=${status}, charges=${account.charges_enabled}`)
}
