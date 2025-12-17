-- =============================================
-- BLOGHEAD Phase 4: Stripe Payment Integration
-- Migration: 004_stripe_tables.sql
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Artist Stripe Connect Accounts
-- =============================================
CREATE TABLE IF NOT EXISTS artist_stripe_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Stripe Account Info
  stripe_account_id TEXT NOT NULL UNIQUE,
  stripe_account_type VARCHAR(20) DEFAULT 'express', -- 'express', 'standard', 'custom'
  stripe_account_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'restricted', 'rejected'

  -- Onboarding Status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_url TEXT, -- Cached onboarding URL
  onboarding_expires_at TIMESTAMPTZ,

  -- Capabilities
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  details_submitted BOOLEAN DEFAULT FALSE,

  -- Account Details
  default_currency VARCHAR(3) DEFAULT 'EUR',
  country VARCHAR(2) DEFAULT 'DE',
  business_type VARCHAR(20), -- 'individual', 'company'

  -- Payout Settings
  payout_schedule_interval VARCHAR(20) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly', 'manual'
  payout_schedule_weekly_anchor VARCHAR(10) DEFAULT 'monday',

  -- Verification
  verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'unverified'
  verification_due_by TIMESTAMPTZ,
  currently_due TEXT[], -- Array of currently due requirements
  eventually_due TEXT[], -- Array of eventually due requirements
  past_due TEXT[], -- Array of past due requirements

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. Escrow System for Booking Payments
-- =============================================
CREATE TABLE IF NOT EXISTS escrow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  transaction_id UUID REFERENCES transactions(id),

  -- Amounts (stored in cents for precision)
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency VARCHAR(3) DEFAULT 'EUR',
  platform_fee_cents INTEGER DEFAULT 0 CHECK (platform_fee_cents >= 0),
  artist_payout_cents INTEGER NOT NULL CHECK (artist_payout_cents > 0),

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Payment not yet received
    'held',         -- Payment received, held in escrow
    'release_scheduled', -- Scheduled for release after event
    'released',     -- Released to artist
    'partially_released', -- Partial release (e.g., after deposit)
    'disputed',     -- Under dispute
    'refunded',     -- Full refund to customer
    'partially_refunded' -- Partial refund
  )),

  -- Stripe References
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_transfer_id TEXT, -- For Connect payouts
  stripe_refund_id TEXT,

  -- Timeline
  held_at TIMESTAMPTZ,
  release_scheduled_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,

  -- Refund Details
  refund_amount_cents INTEGER,
  refund_reason TEXT,

  -- Dispute Details
  dispute_reason TEXT,
  dispute_resolved_at TIMESTAMPTZ,
  dispute_resolution VARCHAR(50), -- 'won', 'lost', 'withdrawn'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. Add Stripe Customer ID to Users
-- =============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_payment_method_id TEXT;

-- =============================================
-- 4. Payment Methods (for saved cards/SEPA)
-- =============================================
CREATE TABLE IF NOT EXISTS user_payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Stripe Info
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL, -- 'card', 'sepa_debit', 'giropay', etc.

  -- Card Details (masked)
  card_brand VARCHAR(20), -- 'visa', 'mastercard', 'amex', etc.
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,

  -- SEPA Details (masked)
  sepa_bank_name TEXT,
  sepa_last4 VARCHAR(4),

  -- Billing Address
  billing_name TEXT,
  billing_email TEXT,
  billing_country VARCHAR(2) DEFAULT 'DE',

  -- Status
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. Stripe Webhook Events Log
-- =============================================
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event Info
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL, -- 'payment_intent.succeeded', etc.

  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Payload
  payload JSONB NOT NULL,

  -- Related Records
  related_booking_id UUID REFERENCES bookings(id),
  related_user_id UUID REFERENCES users(id),

  -- Timestamp
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. Coin Purchase Sessions
-- =============================================
CREATE TABLE IF NOT EXISTS coin_purchase_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Stripe Session
  stripe_checkout_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,

  -- Package Details
  package_id TEXT NOT NULL,
  coin_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  bonus_coins INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'completed', 'expired', 'cancelled'
  )),

  -- Timestamps
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_artist_stripe_accounts_artist ON artist_stripe_accounts(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_stripe_accounts_stripe ON artist_stripe_accounts(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_artist_stripe_accounts_status ON artist_stripe_accounts(stripe_account_status);

CREATE INDEX IF NOT EXISTS idx_escrow_booking ON escrow(booking_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow(status);
CREATE INDEX IF NOT EXISTS idx_escrow_payment_intent ON escrow(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_escrow_release_scheduled ON escrow(release_scheduled_at) WHERE status = 'release_scheduled';

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user ON user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_stripe ON user_payment_methods(stripe_payment_method_id);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_unprocessed ON stripe_webhook_events(received_at) WHERE processed = FALSE;

CREATE INDEX IF NOT EXISTS idx_coin_purchase_sessions_user ON coin_purchase_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_purchase_sessions_stripe ON coin_purchase_sessions(stripe_checkout_session_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE artist_stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_purchase_sessions ENABLE ROW LEVEL SECURITY;

-- Artists can view their own Stripe Connect account
CREATE POLICY "Artists can view own stripe account" ON artist_stripe_accounts
  FOR SELECT USING (
    artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
  );

-- Escrow visible to booking participants
CREATE POLICY "Escrow visible to booking participants" ON escrow
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE client_id = auth.uid()
      OR artist_id IN (SELECT id FROM artist_profiles WHERE user_id = auth.uid())
      OR veranstalter_id IN (SELECT id FROM veranstalter_profiles WHERE user_id = auth.uid())
    )
  );

-- Users can view their own payment methods
CREATE POLICY "Users can view own payment methods" ON user_payment_methods
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own payment methods" ON user_payment_methods
  FOR ALL USING (user_id = auth.uid());

-- Webhook events are service-only (no user access)
CREATE POLICY "Webhook events service only" ON stripe_webhook_events
  FOR ALL USING (FALSE);

-- Users can view their own coin purchase sessions
CREATE POLICY "Users can view own coin purchases" ON coin_purchase_sessions
  FOR SELECT USING (user_id = auth.uid());

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-update updated_at for artist_stripe_accounts
CREATE OR REPLACE FUNCTION update_artist_stripe_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_artist_stripe_accounts_updated_at
  BEFORE UPDATE ON artist_stripe_accounts
  FOR EACH ROW EXECUTE FUNCTION update_artist_stripe_accounts_updated_at();

-- Auto-update updated_at for escrow
CREATE OR REPLACE FUNCTION update_escrow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_escrow_updated_at
  BEFORE UPDATE ON escrow
  FOR EACH ROW EXECUTE FUNCTION update_escrow_updated_at();

-- Calculate platform fee (default 10%)
CREATE OR REPLACE FUNCTION calculate_platform_fee(amount_cents INTEGER, fee_percent DECIMAL DEFAULT 10.0)
RETURNS INTEGER AS $$
BEGIN
  RETURN ROUND(amount_cents * (fee_percent / 100.0))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate artist payout after platform fee
CREATE OR REPLACE FUNCTION calculate_artist_payout(amount_cents INTEGER, fee_percent DECIMAL DEFAULT 10.0)
RETURNS INTEGER AS $$
BEGIN
  RETURN amount_cents - calculate_platform_fee(amount_cents, fee_percent);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE artist_stripe_accounts IS 'Stripe Connect accounts for artists to receive payouts';
COMMENT ON TABLE escrow IS 'Escrow system for holding booking payments until event completion';
COMMENT ON TABLE user_payment_methods IS 'Saved payment methods for users (cards, SEPA, etc.)';
COMMENT ON TABLE stripe_webhook_events IS 'Log of all Stripe webhook events for debugging and replay';
COMMENT ON TABLE coin_purchase_sessions IS 'Checkout sessions for purchasing Bloghead coins';

COMMENT ON COLUMN escrow.amount_cents IS 'Total payment amount in cents (EUR)';
COMMENT ON COLUMN escrow.platform_fee_cents IS 'Platform fee (default 10%) in cents';
COMMENT ON COLUMN escrow.artist_payout_cents IS 'Amount to be paid to artist after fees';
COMMENT ON COLUMN escrow.release_scheduled_at IS 'When escrow should be released (typically 7 days after event)';
