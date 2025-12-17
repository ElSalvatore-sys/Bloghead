/**
 * Stripe Payment Service for Bloghead
 *
 * Handles:
 * - Stripe Connect (artist payouts)
 * - Booking payments with escrow
 * - Coin purchases
 * - German payment methods (SEPA, Giropay, Cards)
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { supabase } from '../lib/supabase'

// ============================================
// STRIPE INITIALIZATION
// ============================================

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Get Stripe instance (singleton)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.warn('Stripe publishable key not configured')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(key, {
      locale: 'de', // German locale
    })
  }
  return stripePromise
}

// ============================================
// TYPES
// ============================================

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled'
export type EscrowStatus = 'pending' | 'held' | 'release_scheduled' | 'released' | 'disputed' | 'refunded'
export type ConnectAccountStatus = 'pending' | 'active' | 'restricted' | 'rejected'

export interface StripeConnectAccount {
  id: string
  artistId: string
  stripeAccountId: string
  status: ConnectAccountStatus
  onboardingCompleted: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  defaultCurrency: string
  country: string
}

export interface EscrowInfo {
  id: string
  bookingId: string
  amountCents: number
  platformFeeCents: number
  artistPayoutCents: number
  status: EscrowStatus
  heldAt: string | null
  releaseScheduledAt: string | null
  releasedAt: string | null
}

export interface PaymentIntentResult {
  clientSecret: string
  paymentIntentId: string
  amountCents: number
  currency: string
}

export interface CoinPackage {
  id: string
  coins: number
  priceEur: number
  priceCents: number
  bonus: number
  totalCoins: number
  popular: boolean
  label: string
}

// ============================================
// COIN PACKAGES (Germany pricing)
// ============================================

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'coins_100',
    coins: 100,
    priceEur: 9.99,
    priceCents: 999,
    bonus: 0,
    totalCoins: 100,
    popular: false,
    label: 'Starter'
  },
  {
    id: 'coins_250',
    coins: 250,
    priceEur: 19.99,
    priceCents: 1999,
    bonus: 25,
    totalCoins: 275,
    popular: false,
    label: 'Basic'
  },
  {
    id: 'coins_500',
    coins: 500,
    priceEur: 39.99,
    priceCents: 3999,
    bonus: 75,
    totalCoins: 575,
    popular: true,
    label: 'Beliebt'
  },
  {
    id: 'coins_1000',
    coins: 1000,
    priceEur: 74.99,
    priceCents: 7499,
    bonus: 200,
    totalCoins: 1200,
    popular: false,
    label: 'Pro'
  },
  {
    id: 'coins_2500',
    coins: 2500,
    priceEur: 179.99,
    priceCents: 17999,
    bonus: 625,
    totalCoins: 3125,
    popular: false,
    label: 'Business'
  },
]

// ============================================
// GERMAN PAYMENT METHODS
// ============================================

export const GERMAN_PAYMENT_METHODS = [
  { id: 'card', label: 'Kreditkarte', icon: '💳', description: 'Visa, Mastercard, American Express' },
  { id: 'sepa_debit', label: 'SEPA Lastschrift', icon: '🏦', description: 'Deutsches Bankkonto' },
  { id: 'giropay', label: 'Giropay', icon: '🔵', description: 'Online-Banking' },
  { id: 'sofort', label: 'Sofortüberweisung', icon: '🟠', description: 'Klarna Sofort' },
] as const

export type GermanPaymentMethod = typeof GERMAN_PAYMENT_METHODS[number]['id']

// ============================================
// STRIPE CONNECT SERVICE (Artist Payouts)
// ============================================

export const stripeConnectService = {
  /**
   * Check if artist has a Stripe Connect account
   */
  async getAccountStatus(artistId: string): Promise<{
    hasAccount: boolean
    account: StripeConnectAccount | null
    needsOnboarding: boolean
    canReceivePayments: boolean
  }> {
    const { data, error } = await supabase
      .from('artist_stripe_accounts')
      .select('*')
      .eq('artist_id', artistId)
      .single()

    if (error || !data) {
      return {
        hasAccount: false,
        account: null,
        needsOnboarding: true,
        canReceivePayments: false,
      }
    }

    const account: StripeConnectAccount = {
      id: data.id,
      artistId: data.artist_id,
      stripeAccountId: data.stripe_account_id,
      status: data.stripe_account_status,
      onboardingCompleted: data.onboarding_completed,
      chargesEnabled: data.charges_enabled,
      payoutsEnabled: data.payouts_enabled,
      defaultCurrency: data.default_currency,
      country: data.country,
    }

    return {
      hasAccount: true,
      account,
      needsOnboarding: !data.onboarding_completed,
      canReceivePayments: data.charges_enabled && data.payouts_enabled,
    }
  },

  /**
   * Create Stripe Connect account for artist
   * Returns onboarding URL
   */
  async createConnectAccount(artistId: string): Promise<{
    success: boolean
    onboardingUrl?: string
    error?: string
  }> {
    const { data, error } = await supabase.functions.invoke('stripe-create-connect-account', {
      body: { artistId }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      onboardingUrl: data.onboardingUrl,
    }
  },

  /**
   * Get onboarding link for existing account
   */
  async getOnboardingLink(artistId: string): Promise<{
    success: boolean
    url?: string
    error?: string
  }> {
    const { data, error } = await supabase.functions.invoke('stripe-get-onboarding-link', {
      body: { artistId }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, url: data.url }
  },

  /**
   * Get Stripe Express dashboard link for artist
   */
  async getDashboardLink(artistId: string): Promise<{
    success: boolean
    url?: string
    error?: string
  }> {
    const { data, error } = await supabase.functions.invoke('stripe-get-dashboard-link', {
      body: { artistId }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, url: data.url }
  },

  /**
   * Refresh account status from Stripe
   */
  async refreshAccountStatus(artistId: string): Promise<{
    success: boolean
    error?: string
  }> {
    const { error } = await supabase.functions.invoke('stripe-refresh-connect-status', {
      body: { artistId }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },
}

// ============================================
// BOOKING PAYMENT SERVICE
// ============================================

export const bookingPaymentService = {
  /**
   * Create payment intent for booking
   */
  async createPaymentIntent(params: {
    bookingId: string
    amountCents: number
    artistStripeAccountId: string
    description?: string
  }): Promise<{
    success: boolean
    data?: PaymentIntentResult
    error?: string
  }> {
    const { data, error } = await supabase.functions.invoke('stripe-create-payment-intent', {
      body: {
        bookingId: params.bookingId,
        amountCents: params.amountCents,
        artistStripeAccountId: params.artistStripeAccountId,
        description: params.description,
        currency: 'eur',
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
        amountCents: data.amountCents,
        currency: data.currency,
      },
    }
  },

  /**
   * Get escrow status for booking
   */
  async getEscrowStatus(bookingId: string): Promise<{
    hasEscrow: boolean
    escrow: EscrowInfo | null
  }> {
    const { data, error } = await supabase
      .from('escrow')
      .select('*')
      .eq('booking_id', bookingId)
      .single()

    if (error || !data) {
      return { hasEscrow: false, escrow: null }
    }

    return {
      hasEscrow: true,
      escrow: {
        id: data.id,
        bookingId: data.booking_id,
        amountCents: data.amount_cents,
        platformFeeCents: data.platform_fee_cents,
        artistPayoutCents: data.artist_payout_cents,
        status: data.status,
        heldAt: data.held_at,
        releaseScheduledAt: data.release_scheduled_at,
        releasedAt: data.released_at,
      },
    }
  },

  /**
   * Request refund for booking
   */
  async requestRefund(bookingId: string, reason: string): Promise<{
    success: boolean
    error?: string
  }> {
    const { error } = await supabase.functions.invoke('stripe-request-refund', {
      body: { bookingId, reason }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userId: string): Promise<{
    payments: Array<{
      id: string
      bookingId: string
      amountCents: number
      status: PaymentStatus
      createdAt: string
    }>
  }> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('payer_id', userId)
      .in('transaction_type', ['deposit', 'final_payment'])
      .order('created_at', { ascending: false })

    if (error) {
      return { payments: [] }
    }

    return {
      payments: data.map(t => ({
        id: t.id,
        bookingId: t.booking_id,
        amountCents: Math.round(t.amount * 100),
        status: t.status as PaymentStatus,
        createdAt: t.created_at,
      })),
    }
  },
}

// ============================================
// COIN PURCHASE SERVICE
// ============================================

export const coinPurchaseService = {
  /**
   * Create checkout session for coin purchase
   */
  async createCheckout(packageId: string): Promise<{
    success: boolean
    sessionId?: string
    url?: string
    error?: string
  }> {
    const coinPackage = COIN_PACKAGES.find(p => p.id === packageId)
    if (!coinPackage) {
      return { success: false, error: 'Ungültiges Paket' }
    }

    const { data, error } = await supabase.functions.invoke('stripe-create-coin-checkout', {
      body: {
        packageId,
        coins: coinPackage.totalCoins,
        priceCents: coinPackage.priceCents,
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      sessionId: data.sessionId,
      url: data.url,
    }
  },

  /**
   * Verify checkout completion
   */
  async verifyCheckout(sessionId: string): Promise<{
    success: boolean
    coinsAdded?: number
    error?: string
  }> {
    const { data, error } = await supabase.functions.invoke('stripe-verify-coin-checkout', {
      body: { sessionId }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      coinsAdded: data.coinsAdded,
    }
  },

  /**
   * Get coin packages
   */
  getPackages(): CoinPackage[] {
    return COIN_PACKAGES
  },

  /**
   * Get purchase history
   */
  async getPurchaseHistory(): Promise<{
    purchases: Array<{
      id: string
      coins: number
      priceCents: number
      createdAt: string
    }>
  }> {
    const { data, error } = await supabase
      .from('coin_purchase_sessions')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) {
      return { purchases: [] }
    }

    return {
      purchases: data.map(p => ({
        id: p.id,
        coins: p.coin_amount + (p.bonus_coins || 0),
        priceCents: p.price_cents,
        createdAt: p.created_at,
      })),
    }
  },
}

// ============================================
// USER PAYMENT METHODS SERVICE
// ============================================

export const paymentMethodsService = {
  /**
   * Get saved payment methods
   */
  async getSavedMethods(userId: string): Promise<{
    methods: Array<{
      id: string
      type: GermanPaymentMethod
      isDefault: boolean
      // Card info
      cardBrand?: string
      cardLast4?: string
      cardExpMonth?: number
      cardExpYear?: number
      // SEPA info
      sepaBankName?: string
      sepaLast4?: string
    }>
  }> {
    const { data, error } = await supabase
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })

    if (error) {
      return { methods: [] }
    }

    return {
      methods: data.map(m => ({
        id: m.id,
        type: m.type as GermanPaymentMethod,
        isDefault: m.is_default,
        cardBrand: m.card_brand,
        cardLast4: m.card_last4,
        cardExpMonth: m.card_exp_month,
        cardExpYear: m.card_exp_year,
        sepaBankName: m.sepa_bank_name,
        sepaLast4: m.sepa_last4,
      })),
    }
  },

  /**
   * Set default payment method
   */
  async setDefault(methodId: string): Promise<{
    success: boolean
    error?: string
  }> {
    const { error } = await supabase.functions.invoke('stripe-set-default-payment-method', {
      body: { paymentMethodId: methodId }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Remove payment method
   */
  async remove(methodId: string): Promise<{
    success: boolean
    error?: string
  }> {
    const { error } = await supabase.functions.invoke('stripe-remove-payment-method', {
      body: { paymentMethodId: methodId }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format amount in EUR (German locale)
 */
export function formatAmountEur(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

/**
 * Format amount without currency symbol
 */
export function formatAmount(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Calculate platform fee (default 10%)
 */
export function calculatePlatformFee(amountCents: number, feePercent: number = 10): number {
  return Math.round(amountCents * (feePercent / 100))
}

/**
 * Calculate artist payout after platform fee
 */
export function calculateArtistPayout(amountCents: number, feePercent: number = 10): number {
  return amountCents - calculatePlatformFee(amountCents, feePercent)
}

/**
 * Convert EUR to cents
 */
export function eurToCents(eur: number): number {
  return Math.round(eur * 100)
}

/**
 * Convert cents to EUR
 */
export function centsToEur(cents: number): number {
  return cents / 100
}

/**
 * Validate IBAN (basic German format check)
 */
export function validateGermanIBAN(iban: string): boolean {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase()
  // German IBANs start with DE and have 22 characters
  return /^DE\d{20}$/.test(cleanIban)
}

/**
 * Format IBAN for display (with spaces)
 */
export function formatIBAN(iban: string): string {
  const clean = iban.replace(/\s/g, '').toUpperCase()
  return clean.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Get payment method icon
 */
export function getPaymentMethodIcon(type: GermanPaymentMethod): string {
  const method = GERMAN_PAYMENT_METHODS.find(m => m.id === type)
  return method?.icon || '💳'
}

/**
 * Get payment method label
 */
export function getPaymentMethodLabel(type: GermanPaymentMethod): string {
  const method = GERMAN_PAYMENT_METHODS.find(m => m.id === type)
  return method?.label || type
}

// ============================================
// ERROR HANDLING
// ============================================

export class StripeError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'StripeError'
    this.code = code
  }
}

/**
 * Map Stripe error codes to German messages
 */
export function getGermanErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'card_declined': 'Die Karte wurde abgelehnt. Bitte versuchen Sie eine andere Zahlungsmethode.',
    'expired_card': 'Die Karte ist abgelaufen. Bitte verwenden Sie eine gültige Karte.',
    'incorrect_cvc': 'Der Sicherheitscode (CVC) ist falsch.',
    'insufficient_funds': 'Nicht genügend Guthaben auf dem Konto.',
    'invalid_card_number': 'Die Kartennummer ist ungültig.',
    'invalid_expiry_month': 'Der Ablaufmonat ist ungültig.',
    'invalid_expiry_year': 'Das Ablaufjahr ist ungültig.',
    'processing_error': 'Ein Verarbeitungsfehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    'rate_limit': 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
    'authentication_required': 'Zusätzliche Authentifizierung erforderlich (3D Secure).',
    'payment_intent_authentication_failure': 'Die Authentifizierung ist fehlgeschlagen.',
    'sepa_mandate_required': 'Ein SEPA-Lastschriftmandat ist erforderlich.',
  }

  return errorMessages[errorCode] || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
}
