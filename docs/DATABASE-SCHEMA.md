# Bloghead Database Schema

Complete PostgreSQL database schema for Supabase implementation.

---

## Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  USER MANAGEMENT              BOOKING SYSTEM              FINANCE SYSTEM         │
│  ├── users                    ├── artist_availability     ├── transactions       │
│  ├── artist_profiles          ├── provider_availability   ├── subscriptions      │
│  ├── veranstalter_profiles    ├── booking_requests        ├── invoices           │
│  ├── fan_profiles             ├── bookings                └── payouts            │
│  ├── service_provider_profiles├── booking_extensions                             │
│  └── event_organizer_profiles └── offers (Phase 3)                               │
│                                                                                  │
│  SERVICE PROVIDERS (Phase 3)  EVENT PLANNING (Phase 3)    SEARCH (Phase 3)       │
│  └── service_categories       ├── events                  └── saved_searches     │
│                               └── event_checklist_templates                      │
│                                                                                  │
│  RATING SYSTEM                COIN SYSTEM                 COMMUNICATION          │
│  ├── ratings                  ├── coin_types              ├── conversations      │
│  └── friendliness_history     ├── coin_wallets            ├── messages           │
│                               ├── coin_transactions       └── notifications      │
│                               └── coin_value_history                             │
│                                                                                  │
│  SOCIAL                       CONTENT                     SUPPORTING             │
│  ├── favorites                ├── media_files             ├── report_tickets     │
│  ├── followers                ├── ci_packages             └── audit_logs         │
│  └── blocks                   └── artist_historie                                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. User Management

### users (Base Table)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL if OAuth only

  -- Basic Info
  membername VARCHAR(100) UNIQUE NOT NULL,
  vorname VARCHAR(100) NOT NULL,
  nachname VARCHAR(100) NOT NULL,
  telefonnummer VARCHAR(50),
  geburtsdatum DATE,

  -- Profile Media
  profile_image_url TEXT,
  cover_image_url TEXT,

  -- Account Type
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('artist', 'customer', 'fan', 'veranstalter', 'service_provider', 'event_organizer')),

  -- Membership
  membership_tier VARCHAR(20) DEFAULT 'basic' CHECK (membership_tier IN ('basic', 'premium')),
  membership_price DECIMAL(10,2),
  membership_expires_at TIMESTAMP,

  -- OAuth
  google_id VARCHAR(255),
  facebook_id VARCHAR(255),
  apple_id VARCHAR(255),
  instagram_id VARCHAR(255),

  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  deleted_at TIMESTAMP -- Soft delete for GDPR
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_membername ON users(membername);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_created ON users(created_at);
```

### artist_profiles

```sql
CREATE TABLE artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Identity
  kuenstlername VARCHAR(200) NOT NULL,
  jobbezeichnung VARCHAR(200), -- DJ, Singer, Performer, etc.

  -- Location
  region VARCHAR(100),
  stadt VARCHAR(100),
  land VARCHAR(100) DEFAULT 'Deutschland',

  -- Categorization
  genre VARCHAR(100)[], -- Array: ['Hip-Hop', 'R&B', 'Electronic']
  tagged_with VARCHAR(100)[], -- Additional tags

  -- Business Info
  firmenname VARCHAR(200),
  sitz_der_firma VARCHAR(200),
  geschaeftsadresse TEXT,
  steuernummer VARCHAR(100),
  ust_id VARCHAR(50),
  kleinunternehmerregelung BOOLEAN DEFAULT FALSE,

  -- Pricing
  preis_pro_stunde DECIMAL(10,2),
  preis_pro_veranstaltung DECIMAL(10,2),
  preis_minimum DECIMAL(10,2),
  preis_pauschal DECIMAL(10,2),
  waehrung VARCHAR(3) DEFAULT 'EUR',

  -- Technical Requirements
  technik_vorhanden TEXT, -- What artist has
  technik_benoetigt TEXT, -- What artist needs
  technik_extra_kosten DECIMAL(10,2),
  techwriter TEXT, -- Individual tech requirements

  -- Hospitality Requirements
  hospitality_essen TEXT,
  hospitality_trinken TEXT,
  hospitality_unterbringung TEXT,
  hospitality_transport VARCHAR(50), -- eigenanreise, organisiert

  -- Content
  bio TEXT,
  something_about_me TEXT,
  intro_video_url TEXT, -- Intro video upload
  instruments VARCHAR(100)[], -- up to 8 instruments

  -- Social & Media Links
  social_media JSONB, -- {instagram: "", youtube: "", spotify: "", soundcloud: ""}
  audio_urls TEXT[], -- SoundCloud/audio file URLs
  video_urls TEXT[], -- YouTube/video URLs
  instagram_profile TEXT,
  soundcloud_url TEXT,
  website_url TEXT,

  -- Statistics
  star_rating DECIMAL(2,1) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
  response_time_avg INTEGER, -- Minutes

  -- Settings
  is_bookable BOOLEAN DEFAULT TRUE,
  can_anyone_request BOOLEAN DEFAULT TRUE, -- Or verified only
  allow_double_booking_requests BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_artist_profiles_user ON artist_profiles(user_id);
CREATE INDEX idx_artist_profiles_genre ON artist_profiles USING GIN(genre);
CREATE INDEX idx_artist_profiles_region ON artist_profiles(region);
CREATE INDEX idx_artist_profiles_rating ON artist_profiles(star_rating DESC);
CREATE INDEX idx_artist_profiles_bookable ON artist_profiles(is_bookable);
```

### veranstalter_profiles

```sql
CREATE TABLE veranstalter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Business Info
  company_name VARCHAR(200),
  location_name VARCHAR(200),

  -- Address
  strasse VARCHAR(200),
  hausnummer VARCHAR(20),
  plz VARCHAR(10),
  stadt VARCHAR(100),
  land VARCHAR(100) DEFAULT 'Deutschland',

  -- Contact
  telefon_geschaeftlich VARCHAR(50),
  email_geschaeftlich VARCHAR(255),
  website TEXT,

  -- Location Details
  eintritt_info TEXT,
  opening_hours JSONB, -- {monday: {open: "18:00", close: "02:00"}, ...}
  kapazitaet INTEGER, -- Max capacity

  -- Links
  social_links JSONB, -- {instagram: "", facebook: "", ...}
  maps_link TEXT,

  -- Equipment
  ausstattung_audio TEXT,
  ausstattung_licht TEXT,
  raeumlichkeiten TEXT,
  kuenstler_raeumlichkeiten TEXT, -- Green room, etc.

  -- Marketing
  marketing_video_url TEXT,
  marketing_images TEXT[],
  marketing_audio_url TEXT,

  -- CI Package
  ci_logo_url TEXT,
  ci_colors JSONB, -- {primary: "#...", secondary: "#..."}
  ci_fonts JSONB, -- {heading: "...", body: "..."}

  -- Business
  steuernummer VARCHAR(100),
  ust_id VARCHAR(50),

  -- Statistics
  star_rating DECIMAL(2,1) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_events_hosted INTEGER DEFAULT 0,

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_veranstalter_profiles_user ON veranstalter_profiles(user_id);
CREATE INDEX idx_veranstalter_profiles_stadt ON veranstalter_profiles(stadt);
CREATE INDEX idx_veranstalter_profiles_rating ON veranstalter_profiles(star_rating DESC);
```

### fan_profiles

```sql
CREATE TABLE fan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Preferences
  favorite_genres VARCHAR(100)[],
  preferred_regions VARCHAR(100)[],

  -- Profile Info (from Functions_Script requirements)
  about_me VARCHAR(200),
  social_links JSONB, -- {instagram, facebook, tiktok, snapchat, youtube, website}
  languages VARCHAR(10)[], -- up to 5 languages
  location_city VARCHAR(100),
  location_country VARCHAR(100) DEFAULT 'Deutschland',

  -- Wallet
  coins_balance DECIMAL(15,2) DEFAULT 0,

  -- Statistics
  events_attended INTEGER DEFAULT 0,
  artists_followed INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fan_profiles_user ON fan_profiles(user_id);
```

---

## 2. Booking System

### artist_availability

```sql
CREATE TABLE artist_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,

  -- Date/Time
  date DATE NOT NULL,
  time_slots JSONB, -- [{start: "10:00", end: "14:00", status: "available"}]

  -- Status
  status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'booked', 'pending', 'blocked', 'open_gig')),

  -- Visibility
  visibility VARCHAR(30) DEFAULT 'visible' CHECK (visibility IN (
    'visible',           -- Shows as available/booked
    'visible_with_name', -- Shows event name/link
    'hidden'             -- Not shown to public
  )),

  -- Booking Reference
  booking_id UUID REFERENCES bookings(id),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(artist_id, date)
);

CREATE INDEX idx_artist_availability_date ON artist_availability(artist_id, date);
CREATE INDEX idx_artist_availability_status ON artist_availability(status);
```

### provider_availability

```sql
-- Generalized availability table for service providers
-- (Artists can continue using artist_availability OR migrate to this)
CREATE TABLE provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider Reference (polymorphic)
  provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('artist', 'service_provider')),
  provider_id UUID NOT NULL, -- References artist_profiles OR service_provider_profiles

  -- Date/Time
  date DATE NOT NULL,
  time_slots JSONB, -- [{start: "10:00", end: "14:00", status: "available"}]

  -- Status
  status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'booked', 'pending', 'blocked', 'open_gig')),

  -- Visibility
  visibility VARCHAR(30) DEFAULT 'visible' CHECK (visibility IN (
    'visible',           -- Shows as available/booked
    'visible_with_name', -- Shows event name/link
    'hidden'             -- Not shown to public
  )),

  -- Booking Reference
  booking_id UUID REFERENCES bookings(id),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(provider_type, provider_id, date)
);

CREATE INDEX idx_provider_availability_lookup ON provider_availability(provider_type, provider_id, date);
CREATE INDEX idx_provider_availability_status ON provider_availability(status);
```

### booking_requests

```sql
CREATE TABLE booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  veranstalter_id UUID REFERENCES veranstalter_profiles(id),

  -- Event Basics
  event_date DATE NOT NULL,
  event_time_start TIME,
  event_time_end TIME,
  event_type VARCHAR(100), -- Sektempfang, Party, Hochzeit, Firmenfeier

  -- Location
  event_location_name VARCHAR(200),
  event_location_address TEXT,
  event_location_maps_link TEXT,

  -- Event Details
  event_size INTEGER, -- Expected attendees
  event_description TEXT,

  -- Equipment
  equipment_available TEXT, -- What's on-site
  equipment_needed TEXT, -- What artist should bring
  equipment_extra_cost DECIMAL(10,2),

  -- Hospitality
  hospitality_unterbringung BOOLEAN DEFAULT FALSE,
  hospitality_unterbringung_details TEXT,
  hospitality_verpflegung BOOLEAN DEFAULT FALSE,
  hospitality_essen TEXT,
  hospitality_trinken TEXT,
  hospitality_alkohol BOOLEAN,

  -- Transport
  transport_type VARCHAR(50) CHECK (transport_type IN ('eigenanreise', 'organisiert')),
  transport_details TEXT,

  -- Financials
  proposed_budget DECIMAL(10,2),
  agreed_price DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  deposit_percentage DECIMAL(5,2),

  -- Message
  message TEXT,

  -- Status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Awaiting artist response
    'accepted',     -- Artist accepted, awaiting payment
    'rejected',     -- Artist declined
    'negotiating',  -- Price/terms negotiation
    'confirmed',    -- Deposit paid, booking confirmed
    'cancelled',    -- Cancelled before event
    'completed',    -- Event completed
    'expired'       -- No response, auto-expired
  )),

  -- Rejection/Cancellation
  rejection_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,

  -- Response Tracking
  responded_at TIMESTAMP,
  expires_at TIMESTAMP, -- Auto-expire if no response

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_booking_requests_artist ON booking_requests(artist_id);
CREATE INDEX idx_booking_requests_requester ON booking_requests(requester_id);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_booking_requests_date ON booking_requests(event_date);
```

### bookings

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference
  request_id UUID REFERENCES booking_requests(id),
  booking_number VARCHAR(50) UNIQUE NOT NULL, -- BH-2024-000001

  -- Parties
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  veranstalter_id UUID REFERENCES veranstalter_profiles(id),

  -- Event Details (copied from request for record)
  event_date DATE NOT NULL,
  event_time_start TIME,
  event_time_end TIME,
  event_type VARCHAR(100),
  event_location_name VARCHAR(200),
  event_location_address TEXT,
  event_size INTEGER,

  -- Contract
  contract_url TEXT,
  contract_signed_artist BOOLEAN DEFAULT FALSE,
  contract_signed_artist_at TIMESTAMP,
  contract_signed_client BOOLEAN DEFAULT FALSE,
  contract_signed_client_at TIMESTAMP,

  -- Financials
  total_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  deposit_due_date DATE,
  deposit_paid_at TIMESTAMP,
  final_payment_amount DECIMAL(10,2),
  final_payment_due_date DATE,
  final_payment_paid_at TIMESTAMP,

  -- Platform Fees
  platform_fee_percentage DECIMAL(5,2),
  platform_fee_amount DECIMAL(10,2),

  -- Payout
  artist_payout_amount DECIMAL(10,2),
  payout_status VARCHAR(20) DEFAULT 'pending' CHECK (payout_status IN (
    'pending', 'scheduled', 'processing', 'completed', 'failed'
  )),
  payout_scheduled_date DATE, -- 7 days after event by default
  payout_completed_at TIMESTAMP,

  -- Status
  status VARCHAR(30) DEFAULT 'confirmed' CHECK (status IN (
    'confirmed',    -- Deposit paid, awaiting event
    'in_progress',  -- Event happening now
    'completed',    -- Event finished successfully
    'cancelled',    -- Cancelled
    'disputed',     -- Under dispute
    'refunded'      -- Refund processed
  )),

  -- Cancellation
  cancellation_policy TEXT,
  cancellation_fee_percentage DECIMAL(5,2),
  cancelled_at TIMESTAMP,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,

  -- Calendar Sync
  google_calendar_event_id TEXT,
  apple_calendar_event_id TEXT,
  ical_uid TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_artist ON bookings(artist_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_date ON bookings(event_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_number ON bookings(booking_number);
```

### booking_extensions

```sql
CREATE TABLE booking_extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,

  -- Extension Details
  original_end_time TIME NOT NULL,
  requested_end_time TIME NOT NULL,
  additional_hours DECIMAL(4,2),

  -- Pricing
  additional_price DECIMAL(10,2),
  agreed_price DECIMAL(10,2),

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'rejected', 'confirmed'
  )),

  -- Request/Response
  requested_by UUID REFERENCES users(id),
  responded_at TIMESTAMP,
  message TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 3. Rating System

### ratings

```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,

  -- Parties
  rater_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rated_entity_type VARCHAR(20) NOT NULL CHECK (rated_entity_type IN ('artist', 'veranstalter')),
  rated_entity_id UUID NOT NULL,

  -- Artist Rating Categories (1-5)
  zuverlaessigkeit INTEGER CHECK (zuverlaessigkeit BETWEEN 1 AND 5),
  kommunikation INTEGER CHECK (kommunikation BETWEEN 1 AND 5),
  preis_leistung INTEGER CHECK (preis_leistung BETWEEN 1 AND 5),
  stimmung INTEGER CHECK (stimmung BETWEEN 1 AND 5),

  -- Veranstalter Rating Categories (1-5)
  hospitality INTEGER CHECK (hospitality BETWEEN 1 AND 5),
  equipment INTEGER CHECK (equipment BETWEEN 1 AND 5),
  ambiente INTEGER CHECK (ambiente BETWEEN 1 AND 5),
  -- kommunikation shared with artist ratings

  -- Overall
  overall_rating DECIMAL(2,1) NOT NULL,

  -- Review
  review_text TEXT,
  review_title VARCHAR(200),

  -- Quick Feedback (predefined options selected)
  quick_feedback VARCHAR(100)[], -- ['professional', 'on_time', 'great_music']

  -- Friendliness
  friendliness_level VARCHAR(30) CHECK (friendliness_level IN (
    'freundlich',          -- 1+ interactions
    'sehr_freundlich',     -- 5+ interactions
    'besonders_freundlich' -- 10+ interactions
  )),
  friendliness_points INTEGER DEFAULT 0,

  -- Moderation
  is_verified BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  flagged_reason TEXT,

  -- Response
  response_text TEXT,
  response_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(booking_id, rater_id)
);

CREATE INDEX idx_ratings_booking ON ratings(booking_id);
CREATE INDEX idx_ratings_rated ON ratings(rated_entity_type, rated_entity_id);
CREATE INDEX idx_ratings_rater ON ratings(rater_id);
CREATE INDEX idx_ratings_overall ON ratings(overall_rating DESC);
```

### friendliness_history

```sql
CREATE TABLE friendliness_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Interaction
  interaction_type VARCHAR(50), -- 'booking_completed', 'positive_rating', 'quick_response'
  points_earned INTEGER,

  -- Reference
  booking_id UUID REFERENCES bookings(id),
  rating_id UUID REFERENCES ratings(id),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_friendliness_user ON friendliness_history(user_id);
```

---

## 4. Finance System

### transactions

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(50) UNIQUE NOT NULL, -- TXN-2024-000001

  -- Reference
  booking_id UUID REFERENCES bookings(id),
  subscription_id UUID REFERENCES subscriptions(id),

  -- Parties
  payer_id UUID REFERENCES users(id),
  payee_id UUID REFERENCES users(id),

  -- Transaction Details
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
    'deposit',           -- Booking deposit
    'final_payment',     -- Final booking payment
    'refund',            -- Refund to customer
    'payout',            -- Payout to artist
    'platform_fee',      -- Platform's cut
    'subscription',      -- Membership payment
    'coin_purchase',     -- Buying coins
    'coin_transfer',     -- Coin transfer between users
    'extension_payment', -- Booking extension payment
    'tip'                -- Tip/gratuity after event
  )),

  -- Amount
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Payment Provider
  payment_provider VARCHAR(20) CHECK (payment_provider IN (
    'stripe', 'paypal', 'adyen', 'mollie', 'internal'
  )),
  provider_transaction_id TEXT,
  provider_fee DECIMAL(10,2),
  provider_status TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'refunded', 'disputed'
  )),

  -- Metadata
  description TEXT,
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_transactions_payer ON transactions(payer_id);
CREATE INDEX idx_transactions_payee ON transactions(payee_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(created_at);
```

### subscriptions

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Plan
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('basic', 'premium')),
  price_monthly DECIMAL(10,2) NOT NULL,

  -- Features (JSON for flexibility)
  features JSONB, -- {lexoffice: true, priority_support: true, ...}

  -- Billing
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'trialing', 'active', 'past_due', 'cancelled', 'unpaid'
  )),

  -- Periods
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,

  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### invoices

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL, -- INV-2024-000001

  -- Reference
  booking_id UUID REFERENCES bookings(id),
  user_id UUID REFERENCES users(id),

  -- Billing
  billing_name VARCHAR(200),
  billing_address TEXT,
  billing_email VARCHAR(255),

  -- Amounts
  subtotal DECIMAL(15,2) NOT NULL,
  tax_rate DECIMAL(5,2), -- e.g., 19.00 for 19%
  tax_amount DECIMAL(15,2),
  total_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Line Items
  line_items JSONB, -- [{description, quantity, unit_price, amount}]

  -- LexOffice Integration
  lexoffice_id TEXT,
  lexoffice_document_id TEXT,
  lexoffice_status TEXT,

  -- PDF
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP,

  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded'
  )),

  -- Dates
  issue_date DATE,
  due_date DATE,
  paid_at TIMESTAMP,
  sent_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
```

### payouts

```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_number VARCHAR(50) UNIQUE NOT NULL, -- PAY-2024-000001

  -- Reference
  booking_id UUID REFERENCES bookings(id),
  artist_id UUID REFERENCES artist_profiles(id),

  -- Amount
  gross_amount DECIMAL(15,2) NOT NULL, -- Before fees
  platform_fee DECIMAL(15,2),
  net_amount DECIMAL(15,2) NOT NULL, -- After fees
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Bank Details (encrypted reference)
  bank_account_id UUID, -- Reference to secure bank details

  -- Provider
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',     -- Awaiting processing
    'scheduled',   -- Scheduled for future date
    'processing',  -- Being processed
    'in_transit',  -- On the way to bank
    'completed',   -- Successfully paid
    'failed',      -- Payout failed
    'cancelled'    -- Cancelled
  )),

  -- Dates
  scheduled_date DATE,
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Failure
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payouts_booking ON payouts(booking_id);
CREATE INDEX idx_payouts_artist ON payouts(artist_id);
CREATE INDEX idx_payouts_status ON payouts(status);
```

---

## 5. Coin/Currency System

### coin_types

```sql
CREATE TABLE coin_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name VARCHAR(100) NOT NULL, -- "Bloghead Coin" or "Shannon Cuomo Head"
  symbol VARCHAR(20) NOT NULL, -- "BHC" or "SCHEAD"

  -- Type
  type VARCHAR(20) NOT NULL CHECK (type IN ('bloghead', 'kuenstlerhead')),
  artist_id UUID REFERENCES artist_profiles(id), -- NULL for Bloghead coins

  -- Value
  initial_value DECIMAL(15,4) DEFAULT 1.01,
  current_value DECIMAL(15,4) DEFAULT 1.01,
  value_per_fan DECIMAL(15,6) DEFAULT 0.01,

  -- Supply
  total_supply DECIMAL(20,2), -- NULL = unlimited
  circulating_supply DECIMAL(20,2) DEFAULT 0,
  max_supply DECIMAL(20,2),

  -- Value Calculation
  total_fans INTEGER DEFAULT 0,
  value_factor DECIMAL(10,6) DEFAULT 1.0, -- Decreases as fans grow

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_tradeable BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coin_types_artist ON coin_types(artist_id);
CREATE INDEX idx_coin_types_symbol ON coin_types(symbol);
CREATE INDEX idx_coin_types_type ON coin_types(type);
```

### coin_wallets

```sql
CREATE TABLE coin_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coin_type_id UUID REFERENCES coin_types(id),

  -- Balance
  balance DECIMAL(20,4) DEFAULT 0,
  locked_balance DECIMAL(20,4) DEFAULT 0, -- In pending transactions

  -- Stats
  total_received DECIMAL(20,4) DEFAULT 0,
  total_spent DECIMAL(20,4) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, coin_type_id)
);

CREATE INDEX idx_coin_wallets_user ON coin_wallets(user_id);
CREATE INDEX idx_coin_wallets_type ON coin_wallets(coin_type_id);
```

### coin_transactions

```sql
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Coin
  coin_type_id UUID REFERENCES coin_types(id),

  -- Wallets
  from_wallet_id UUID REFERENCES coin_wallets(id),
  to_wallet_id UUID REFERENCES coin_wallets(id),

  -- Amount
  amount DECIMAL(20,4) NOT NULL,
  value_at_transaction DECIMAL(15,4), -- EUR value at time of transaction

  -- Type
  transaction_type VARCHAR(30) CHECK (transaction_type IN (
    'purchase',   -- Bought with EUR
    'transfer',   -- User to user transfer
    'reward',     -- Earned (e.g., for booking)
    'spend',      -- Used for service
    'refund',     -- Returned
    'artist_mint' -- Artist created new coins
  )),

  -- Reference
  booking_id UUID REFERENCES bookings(id),

  -- Details
  description TEXT,
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coin_transactions_type ON coin_transactions(coin_type_id);
CREATE INDEX idx_coin_transactions_from ON coin_transactions(from_wallet_id);
CREATE INDEX idx_coin_transactions_to ON coin_transactions(to_wallet_id);
CREATE INDEX idx_coin_transactions_date ON coin_transactions(created_at);
```

### coin_value_history

```sql
CREATE TABLE coin_value_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_type_id UUID REFERENCES coin_types(id),

  -- Value
  value DECIMAL(15,4) NOT NULL,
  total_fans INTEGER,

  -- Timestamp
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coin_value_history_type ON coin_value_history(coin_type_id);
CREATE INDEX idx_coin_value_history_date ON coin_value_history(recorded_at);
```

---

## 6. Communication System

### conversations

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference
  booking_id UUID REFERENCES bookings(id),
  booking_request_id UUID REFERENCES booking_requests(id),

  -- Participants
  participant_ids UUID[] NOT NULL,

  -- Metadata
  title VARCHAR(200),
  last_message_at TIMESTAMP,
  last_message_preview TEXT,

  -- Status
  is_archived BOOLEAN DEFAULT FALSE,
  is_muted_by UUID[], -- Users who muted this conversation

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_booking ON conversations(booking_id);
CREATE INDEX idx_conversations_participants ON conversations USING GIN(participant_ids);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
```

### messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

  -- Sender
  sender_id UUID REFERENCES users(id),

  -- Content
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN (
    'text', 'image', 'file', 'audio', 'system', 'booking_update'
  )),

  -- Attachments
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(100),

  -- Read Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  read_by UUID[], -- For group conversations

  -- Edit/Delete
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);
```

### notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  type VARCHAR(50) NOT NULL, -- 'booking_request', 'payment_received', etc.
  title VARCHAR(200) NOT NULL,
  body TEXT,

  -- Action
  action_url TEXT, -- Deep link
  action_data JSONB,

  -- Reference
  booking_id UUID REFERENCES bookings(id),
  message_id UUID REFERENCES messages(id),

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,

  -- Push
  push_sent BOOLEAN DEFAULT FALSE,
  push_sent_at TIMESTAMP,
  push_token TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

## 7. Social Features

### favorites

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,

  -- Notes
  notes TEXT, -- Personal notes about the artist

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, artist_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_artist ON favorites(artist_id);
```

### followers

```sql
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,

  -- Type
  follower_type VARCHAR(20) DEFAULT 'fan' CHECK (follower_type IN ('fan', 'veranstalter')),

  -- Notifications
  notify_new_events BOOLEAN DEFAULT TRUE,
  notify_availability BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(follower_id, artist_id)
);

CREATE INDEX idx_followers_follower ON followers(follower_id);
CREATE INDEX idx_followers_artist ON followers(artist_id);
```

### blocks

```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Reason
  reason TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);
```

---

## 8. Content & Media

### media_files

```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- File Info
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100), -- MIME type
  file_size INTEGER, -- Bytes
  file_url TEXT NOT NULL,

  -- Media Type
  media_type VARCHAR(20) CHECK (media_type IN (
    'image', 'audio', 'video', 'document', 'logo'
  )),

  -- Usage
  usage_type VARCHAR(30), -- 'profile', 'cover', 'gallery', 'audio_sample', etc.

  -- Metadata
  metadata JSONB, -- {width, height, duration, etc.}

  -- Status
  is_public BOOLEAN DEFAULT TRUE,
  is_processed BOOLEAN DEFAULT FALSE, -- For video/audio processing

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_media_files_user ON media_files(user_id);
CREATE INDEX idx_media_files_type ON media_files(media_type);
```

### ci_packages

```sql
CREATE TABLE ci_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner (artist or veranstalter)
  owner_type VARCHAR(20) CHECK (owner_type IN ('artist', 'veranstalter')),
  artist_id UUID REFERENCES artist_profiles(id),
  veranstalter_id UUID REFERENCES veranstalter_profiles(id),

  -- Logo
  logo_url TEXT,
  logo_dark_url TEXT, -- For dark backgrounds
  logo_light_url TEXT, -- For light backgrounds

  -- Colors
  primary_color VARCHAR(7), -- #610AD1
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  background_color VARCHAR(7),
  text_color VARCHAR(7),

  -- Fonts
  heading_font VARCHAR(100),
  body_font VARCHAR(100),
  font_urls TEXT[],

  -- Additional Assets
  icon_url TEXT,
  banner_url TEXT,

  -- Guidelines
  usage_guidelines TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ci_packages_artist ON ci_packages(artist_id);
CREATE INDEX idx_ci_packages_veranstalter ON ci_packages(veranstalter_id);
```

### artist_historie

```sql
CREATE TABLE artist_historie (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,

  -- Event Info
  event_name VARCHAR(200),
  event_date DATE,
  event_type VARCHAR(100),

  -- Location
  location_name VARCHAR(200),
  location_city VARCHAR(100),

  -- Veranstalter
  veranstalter_id UUID REFERENCES veranstalter_profiles(id),
  veranstalter_name VARCHAR(200),

  -- Details
  description TEXT,
  attendees INTEGER,

  -- Media
  photos TEXT[],
  videos TEXT[],

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  booking_id UUID REFERENCES bookings(id), -- If through platform

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_artist_historie_artist ON artist_historie(artist_id);
CREATE INDEX idx_artist_historie_date ON artist_historie(event_date DESC);
```

---

## 9. Service Provider System (Phase 3)

### service_categories

```sql
-- Service Categories (Waffle View categories)
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_de VARCHAR(100) NOT NULL, -- German name
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50), -- icon name for UI
  description TEXT,
  parent_id UUID REFERENCES service_categories(id), -- for subcategories
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_categories_slug ON service_categories(slug);
CREATE INDEX idx_service_categories_parent ON service_categories(parent_id);

-- Seed default categories
INSERT INTO service_categories (name, name_de, slug, icon, display_order) VALUES
  ('Musician', 'Musiker', 'musician', 'music', 1),
  ('DJ', 'DJ', 'dj', 'disc', 2),
  ('Caterer', 'Caterer', 'caterer', 'utensils', 3),
  ('Venue', 'Location', 'venue', 'building', 4),
  ('Florist', 'Florist', 'florist', 'flower', 5),
  ('Photographer', 'Fotograf', 'photographer', 'camera', 6),
  ('Videographer', 'Videograf', 'videographer', 'video', 7),
  ('Decorator', 'Dekorateur', 'decorator', 'palette', 8),
  ('Hairdresser', 'Friseur', 'hairdresser', 'scissors', 9),
  ('Makeup Artist', 'Visagist', 'makeup-artist', 'sparkles', 10),
  ('Security', 'Security', 'security', 'shield', 11),
  ('Lighting', 'Lichttechnik', 'lighting', 'lightbulb', 12),
  ('Sound', 'Tontechnik', 'sound', 'speaker', 13),
  ('Transportation', 'Transport', 'transportation', 'car', 14),
  ('Entertainment', 'Entertainment', 'entertainment', 'star', 15);
```

### service_provider_profiles

```sql
-- Service Provider Profiles (Caterers, Florists, Security, Lighting, Sound, Decorators, Venues, Hairdressers)
CREATE TABLE service_provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Business info
  business_name VARCHAR(255) NOT NULL,
  service_category_id UUID REFERENCES service_categories(id),
  description TEXT, -- max 500 chars enforced in app

  -- Location
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Deutschland',
  coordinates POINT, -- for radius search
  service_radius_km INTEGER DEFAULT 50, -- how far they travel

  -- Business details
  vat_id VARCHAR(50), -- USt-IdNr
  business_type VARCHAR(50), -- Einzelunternehmer, GmbH, etc.
  phone VARCHAR(30),
  website_url TEXT,

  -- Media
  profile_image_url TEXT,
  gallery_urls TEXT[], -- image gallery

  -- Social
  instagram_handle VARCHAR(100),
  facebook_url TEXT,
  linkedin_url TEXT,

  -- Pricing
  price_range VARCHAR(20), -- 'budget', 'mid', 'premium', 'luxury'
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  pricing_unit VARCHAR(50), -- 'per_event', 'per_hour', 'per_person'

  -- Capacity
  min_guests INTEGER,
  max_guests INTEGER,

  -- Ratings (cached for performance)
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,

  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_newcomer BOOLEAN DEFAULT TRUE, -- show in newcomer section
  profile_completed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_provider_user ON service_provider_profiles(user_id);
CREATE INDEX idx_service_provider_category ON service_provider_profiles(service_category_id);
CREATE INDEX idx_service_provider_city ON service_provider_profiles(city);
CREATE INDEX idx_service_provider_rating ON service_provider_profiles(avg_rating DESC);
CREATE INDEX idx_service_provider_newcomer ON service_provider_profiles(is_newcomer) WHERE is_newcomer = TRUE;
```

### event_organizer_profiles

```sql
-- Event Organizer Profiles (people who hire services for events)
CREATE TABLE event_organizer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Business info (optional - can be personal)
  business_name VARCHAR(255),
  is_business BOOLEAN DEFAULT FALSE,

  -- Location
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Deutschland',

  -- Business details (if is_business = true)
  vat_id VARCHAR(50),
  business_type VARCHAR(50),
  phone VARCHAR(30),

  -- Media
  profile_image_url TEXT,
  event_gallery_urls TEXT[], -- past events gallery

  -- Social
  instagram_handle VARCHAR(100),
  facebook_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,

  -- Stats
  total_events_organized INTEGER DEFAULT 0,

  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_organizer_user ON event_organizer_profiles(user_id);
CREATE INDEX idx_event_organizer_city ON event_organizer_profiles(city);
```

---

## 10. Event Planning System (Phase 3)

### events

```sql
-- Events (created by Event Organizers)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Event basics
  title VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'wedding', 'corporate', 'birthday', 'concert', 'premiere', etc.
  description TEXT,

  -- Date/Time
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_flexible_date BOOLEAN DEFAULT FALSE,

  -- Location
  venue_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Deutschland',
  is_indoor BOOLEAN DEFAULT TRUE,
  is_outdoor BOOLEAN DEFAULT FALSE,

  -- Details
  expected_guests INTEGER,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),

  -- Preferences
  catering_preference VARCHAR(50), -- 'full_service', 'buffet', 'finger_food', 'none'
  music_preference VARCHAR(50), -- 'live_band', 'dj', 'both', 'background', 'none'

  -- Checklist (static templates, not AI)
  checklist_template VARCHAR(50), -- template name
  checklist_items JSONB DEFAULT '[]', -- [{task, completed, due_date}]

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'planning', 'confirmed', 'completed', 'cancelled'
  is_public BOOLEAN DEFAULT FALSE, -- show in events listing

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_status ON events(status);
```

### event_checklist_templates

```sql
-- Event Checklist Templates (static, no AI)
CREATE TABLE event_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- matches events.event_type
  name VARCHAR(100) NOT NULL,
  name_de VARCHAR(100) NOT NULL,

  -- Template items
  items JSONB NOT NULL,
  -- Example: [
  --   {"task": "Book venue", "task_de": "Location buchen", "months_before": 12, "category": "venue"},
  --   {"task": "Hire caterer", "task_de": "Caterer beauftragen", "months_before": 6, "category": "catering"},
  --   {"task": "Send invitations", "task_de": "Einladungen versenden", "months_before": 2, "category": "admin"}
  -- ]

  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checklist_templates_type ON event_checklist_templates(event_type);

-- Seed wedding template
INSERT INTO event_checklist_templates (event_type, name, name_de, is_default, items) VALUES
('wedding', 'Wedding Checklist', 'Hochzeits-Checkliste', TRUE, '[
  {"task": "Set budget", "task_de": "Budget festlegen", "months_before": 12, "category": "planning"},
  {"task": "Book venue", "task_de": "Location buchen", "months_before": 12, "category": "venue"},
  {"task": "Hire photographer", "task_de": "Fotograf buchen", "months_before": 10, "category": "media"},
  {"task": "Book caterer", "task_de": "Caterer buchen", "months_before": 8, "category": "catering"},
  {"task": "Book DJ/Band", "task_de": "DJ/Band buchen", "months_before": 8, "category": "music"},
  {"task": "Order flowers", "task_de": "Blumen bestellen", "months_before": 4, "category": "decoration"},
  {"task": "Send invitations", "task_de": "Einladungen versenden", "months_before": 3, "category": "admin"},
  {"task": "Final headcount", "task_de": "Finale Gästezahl", "months_before": 1, "category": "admin"},
  {"task": "Confirm all vendors", "task_de": "Alle Dienstleister bestätigen", "months_before": 1, "category": "admin"}
]');

-- Seed corporate event template
INSERT INTO event_checklist_templates (event_type, name, name_de, is_default, items) VALUES
('corporate', 'Corporate Event Checklist', 'Firmenveranstaltung-Checkliste', TRUE, '[
  {"task": "Define objectives", "task_de": "Ziele definieren", "months_before": 6, "category": "planning"},
  {"task": "Set budget", "task_de": "Budget festlegen", "months_before": 6, "category": "planning"},
  {"task": "Book venue", "task_de": "Location buchen", "months_before": 4, "category": "venue"},
  {"task": "Arrange catering", "task_de": "Catering organisieren", "months_before": 3, "category": "catering"},
  {"task": "Book AV equipment", "task_de": "Technik buchen", "months_before": 2, "category": "technical"},
  {"task": "Send invitations", "task_de": "Einladungen versenden", "months_before": 2, "category": "admin"},
  {"task": "Prepare presentations", "task_de": "Präsentationen vorbereiten", "months_before": 1, "category": "content"},
  {"task": "Confirm attendees", "task_de": "Teilnehmer bestätigen", "weeks_before": 2, "category": "admin"}
]');

-- Seed birthday template
INSERT INTO event_checklist_templates (event_type, name, name_de, is_default, items) VALUES
('birthday', 'Birthday Party Checklist', 'Geburtstags-Checkliste', TRUE, '[
  {"task": "Choose theme", "task_de": "Motto wählen", "months_before": 2, "category": "planning"},
  {"task": "Book venue", "task_de": "Location buchen", "months_before": 2, "category": "venue"},
  {"task": "Order cake", "task_de": "Torte bestellen", "weeks_before": 2, "category": "catering"},
  {"task": "Send invitations", "task_de": "Einladungen versenden", "weeks_before": 3, "category": "admin"},
  {"task": "Plan entertainment", "task_de": "Entertainment planen", "weeks_before": 2, "category": "entertainment"},
  {"task": "Buy decorations", "task_de": "Dekoration kaufen", "weeks_before": 1, "category": "decoration"},
  {"task": "Confirm guests", "task_de": "Gäste bestätigen", "days_before": 3, "category": "admin"}
]');
```

---

## 11. Offer & Negotiation System (Phase 3)

### offers

```sql
-- Offers (formal proposals from Service Providers to Event Organizers)
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id UUID REFERENCES booking_requests(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES users(id) NOT NULL, -- service provider or artist

  -- Offer details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  price_breakdown JSONB, -- [{item, amount}]
  currency VARCHAR(3) DEFAULT 'EUR',
  is_negotiable BOOLEAN DEFAULT TRUE,

  -- Terms
  terms_and_conditions TEXT,
  cancellation_policy TEXT,
  included_services TEXT[], -- what's included
  excluded_services TEXT[], -- what's NOT included

  -- Validity
  valid_until TIMESTAMPTZ,

  -- Status workflow
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending' -> waiting for organizer response
  -- 'accepted' -> organizer accepted, becomes booking
  -- 'declined' -> organizer declined
  -- 'countered' -> organizer sent counter-offer
  -- 'withdrawn' -> provider withdrew offer
  -- 'expired' -> past valid_until date

  -- Counter-offer tracking
  parent_offer_id UUID REFERENCES offers(id), -- if this is a counter-offer
  counter_offer_count INTEGER DEFAULT 0,

  -- Timestamps
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offers_booking_request ON offers(booking_request_id);
CREATE INDEX idx_offers_provider ON offers(provider_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_parent ON offers(parent_offer_id);
```

---

## 12. Search & Discovery (Phase 3)

### saved_searches

```sql
-- Saved Searches (for users to quickly repeat searches)
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  name VARCHAR(100) NOT NULL,
  search_type VARCHAR(20) NOT NULL, -- 'artist', 'service_provider', 'venue'

  -- Search criteria (stored as JSON for flexibility)
  filters JSONB NOT NULL,
  -- Example: {
  --   "category": "caterer",
  --   "city": "Frankfurt",
  --   "radius_km": 100,
  --   "min_guests": 50,
  --   "max_guests": 200,
  --   "price_range": "mid",
  --   "date": "2025-06-15"
  -- }

  -- Usage
  last_used_at TIMESTAMPTZ,
  use_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_type ON saved_searches(search_type);
```

---

## 13. Supporting Tables

### report_tickets

```sql
CREATE TABLE report_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reporter
  reporter_id UUID REFERENCES users(id),

  -- Reported
  reported_type VARCHAR(30), -- 'user', 'artist', 'veranstalter', 'booking', 'message'
  reported_id UUID,

  -- Report
  reason VARCHAR(100),
  description TEXT,
  evidence_urls TEXT[],

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'investigating', 'resolved', 'dismissed'
  )),

  -- Resolution
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  action_taken VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_report_tickets_status ON report_tickets(status);
CREATE INDEX idx_report_tickets_reporter ON report_tickets(reporter_id);
```

### audit_logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Actor
  user_id UUID REFERENCES users(id),

  -- Action
  action VARCHAR(100) NOT NULL, -- 'user.login', 'booking.create', etc.
  entity_type VARCHAR(50),
  entity_id UUID,

  -- Details
  old_values JSONB,
  new_values JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

---

## 14. Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE veranstalter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_checklist_templates ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Public artist profiles are readable by all
CREATE POLICY artist_profiles_select_public ON artist_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = artist_profiles.user_id
      AND users.is_active = TRUE
    )
  );

-- Artists can update their own profile
CREATE POLICY artist_profiles_update_own ON artist_profiles
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Booking requests visible to involved parties
CREATE POLICY booking_requests_select ON booking_requests
  FOR SELECT USING (
    requester_id = auth.uid()
    OR artist_id IN (
      SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    )
  );

-- Messages visible only to conversation participants
CREATE POLICY messages_select ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE auth.uid() = ANY(participant_ids)
    )
  );

-- Transactions visible to involved parties
CREATE POLICY transactions_select ON transactions
  FOR SELECT USING (
    payer_id = auth.uid() OR payee_id = auth.uid()
  );

-- =============================================
-- Phase 3 RLS Policies (Service Providers, Events, Offers)
-- =============================================

-- Service Provider Profiles: Public read for completed profiles
CREATE POLICY service_provider_profiles_select_public ON service_provider_profiles
  FOR SELECT USING (profile_completed = TRUE);

-- Service Provider Profiles: Users can manage own profile
CREATE POLICY service_provider_profiles_manage_own ON service_provider_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Event Organizer Profiles: Public read for completed profiles
CREATE POLICY event_organizer_profiles_select_public ON event_organizer_profiles
  FOR SELECT USING (profile_completed = TRUE);

-- Event Organizer Profiles: Users can manage own profile
CREATE POLICY event_organizer_profiles_manage_own ON event_organizer_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Events: Users can view own events
CREATE POLICY events_select_own ON events
  FOR SELECT USING (auth.uid() = organizer_id);

-- Events: Public events viewable by all
CREATE POLICY events_select_public ON events
  FOR SELECT USING (is_public = TRUE AND status = 'confirmed');

-- Events: Users can manage own events
CREATE POLICY events_manage_own ON events
  FOR ALL USING (auth.uid() = organizer_id);

-- Offers: Providers can view and manage own offers
CREATE POLICY offers_manage_own ON offers
  FOR ALL USING (auth.uid() = provider_id);

-- Offers: Organizers can view offers for their booking requests
CREATE POLICY offers_select_for_organizer ON offers
  FOR SELECT USING (
    booking_request_id IN (
      SELECT id FROM booking_requests WHERE requester_id = auth.uid()
    )
  );

-- Saved Searches: Users can manage own saved searches
CREATE POLICY saved_searches_manage_own ON saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- Service Categories: Anyone can read active categories
CREATE POLICY service_categories_select_public ON service_categories
  FOR SELECT USING (is_active = TRUE);

-- Event Checklist Templates: Anyone can read templates
CREATE POLICY event_checklist_templates_select_public ON event_checklist_templates
  FOR SELECT USING (TRUE);
```

---

## 15. Database Functions

```sql
-- Calculate artist rating
CREATE OR REPLACE FUNCTION calculate_artist_rating(p_artist_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  SELECT AVG(overall_rating) INTO avg_rating
  FROM ratings
  WHERE rated_entity_type = 'artist'
    AND rated_entity_id = p_artist_id
    AND is_public = TRUE;

  UPDATE artist_profiles
  SET star_rating = COALESCE(avg_rating, 0),
      total_ratings = (
        SELECT COUNT(*) FROM ratings
        WHERE rated_entity_type = 'artist'
          AND rated_entity_id = p_artist_id
      ),
      updated_at = NOW()
  WHERE id = p_artist_id;

  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Update coin value based on fans
CREATE OR REPLACE FUNCTION update_coin_value(p_coin_type_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  new_value DECIMAL;
  fan_count INTEGER;
BEGIN
  SELECT total_fans INTO fan_count
  FROM coin_types WHERE id = p_coin_type_id;

  new_value := 1.01 + (0.01 * fan_count * (
    SELECT value_factor FROM coin_types WHERE id = p_coin_type_id
  ));

  UPDATE coin_types
  SET current_value = new_value,
      updated_at = NOW()
  WHERE id = p_coin_type_id;

  -- Record history
  INSERT INTO coin_value_history (coin_type_id, value, total_fans)
  VALUES (p_coin_type_id, new_value, fan_count);

  RETURN new_value;
END;
$$ LANGUAGE plpgsql;

-- Generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(booking_number FROM 9) AS INTEGER)), 0) + 1
  INTO next_number
  FROM bookings
  WHERE booking_number LIKE 'BH-' || TO_CHAR(NOW(), 'YYYY') || '-%';

  RETURN 'BH-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
```

---

## 16. Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_artist_profiles_updated_at
  BEFORE UPDATE ON artist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- (Apply to other tables similarly)

-- Update follower count when followed
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artist_profiles
    SET total_followers = total_followers + 1
    WHERE id = NEW.artist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artist_profiles
    SET total_followers = total_followers - 1
    WHERE id = OLD.artist_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follower_count
  AFTER INSERT OR DELETE ON followers
  FOR EACH ROW EXECUTE FUNCTION update_follower_count();
```

---

*Schema Version: 2.1*
*Last Updated: December 3, 2025*
*Compatible with: Supabase PostgreSQL 15+*

## Phase 3 Tables Added (v2.0)
- `service_categories` - Service provider taxonomy (15 categories)
- `service_provider_profiles` - Caterers, florists, security, etc.
- `event_organizer_profiles` - Event planners profile data
- `events` - Event planning and management
- `event_checklist_templates` - Static planning templates (wedding, corporate, birthday)
- `offers` - Formal offer/negotiation system
- `saved_searches` - User search persistence

## Vision Audit Fixes (v2.1)
- Added `instagram_id` to `users` for OAuth
- Added `service_provider` and `event_organizer` to `user_type` constraint
- Added `'tip'` to `transactions.transaction_type`
- Added `'open_gig'` to `artist_availability.status`
- Added `about_me`, `social_links`, `languages`, `location_city`, `location_country` to `fan_profiles`
- Added `intro_video_url`, `instruments[]` to `artist_profiles`
- Added `provider_availability` table for service provider calendars
