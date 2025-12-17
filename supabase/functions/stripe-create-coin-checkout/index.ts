/**
 * Stripe Create Coin Checkout Edge Function
 *
 * Creates a Stripe Checkout Session for purchasing coin packages.
 * These are direct purchases (not Connect), so 100% goes to platform.
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

// Coin packages (defined here and in frontend)
const COIN_PACKAGES = [
  { id: 'starter', name: 'Starter', coins: 100, priceCents: 999 },
  { id: 'popular', name: 'Popular', coins: 500, priceCents: 3999 },
  { id: 'premium', name: 'Premium', coins: 1200, priceCents: 7999 },
]

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

    const { packageId } = await req.json()

    // Validate package
    const coinPackage = COIN_PACKAGES.find(p => p.id === packageId)
    if (!coinPackage) {
      throw new Error('Ungültiges Coin-Paket')
    }

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

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card', 'sepa_debit', 'giropay'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${coinPackage.name} Coin-Paket`,
              description: `${coinPackage.coins} Coins für Bloghead`,
            },
            unit_amount: coinPackage.priceCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'coin_purchase',
        package_id: packageId,
        coins: coinPackage.coins.toString(),
        user_id: user.id,
      },
      success_url: `https://blog-head.com/coins/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://blog-head.com/coins?canceled=true`,
    })

    // Create pending coin transaction
    await supabase
      .from('coin_transactions')
      .insert({
        user_id: user.id,
        type: 'purchase',
        amount: coinPackage.coins,
        stripe_checkout_session_id: session.id,
        status: 'pending',
        description: `${coinPackage.name} Coin-Paket gekauft`,
      })

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating coin checkout:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
