# Bloghead Phase 4: Stripe Payment Integration

**Status:** ✅ Step 2 Complete | ⏳ Step 3 Pending
**Last Updated:** December 11, 2024
**Author:** Ali (EA Solutions)

---

## Overview

Phase 4 implements the complete payment infrastructure for Bloghead, including:
- Stripe Connect for artist payouts
- Booking payment flow with escrow
- Bloghead Coins purchase system
- German payment method support (SEPA, Giropay)

---

## Implementation Progress

| Step | Task | Status |
|------|------|--------|
| 2.1 | Install Stripe packages | ✅ Complete |
| 2.2 | Environment variables | ✅ Complete |
| 2.3 | Database migration | ✅ Complete |
| 2.4 | Stripe service | ✅ Complete |
| 2.5 | Payment components | ✅ Complete |
| 2.6 | Build verification | ✅ Passed |
| 3.1 | Supabase Edge Functions | ⏳ Pending |
| 3.2 | Webhook handlers | ⏳ Pending |
| 3.3 | Integration testing | ⏳ Pending |

---

## Files Created

### Database Migration
**File:** `supabase/migrations/004_stripe_tables.sql`

Tables created:
| Table | Purpose |
|-------|---------|
| `artist_stripe_accounts` | Stripe Connect accounts for artists |
| `escrow` | Payment escrow for bookings |
| `user_payment_methods` | Saved cards & SEPA accounts |
| `stripe_webhook_events` | Webhook event logging |
| `coin_purchase_sessions` | Coin purchase tracking |

All tables include:
- UUID primary keys
- RLS (Row Level Security) policies
- Performance indexes
- Foreign key constraints

### Stripe Service
**File:** `src/services/stripeService.ts`

Services exported:
| Service | Methods |
|---------|---------|
| `stripeConnectService` | getAccountStatus, createConnectAccount, getOnboardingLink, getDashboardLink, refreshAccountStatus |
| `bookingPaymentService` | createPaymentIntent, getEscrowStatus, requestRefund, getPaymentHistory |
| `coinPurchaseService` | createCheckout, verifyCheckout, getPackages, getPurchaseHistory |
| `paymentMethodsService` | getSavedMethods, setDefault, remove |

Utilities:
- `getStripe()` - Singleton Stripe instance with German locale
- `formatAmountEur()` - German currency formatting
- `formatAmount()` - Amount without currency symbol
- `calculatePlatformFee()` - 10% platform fee calculation
- `calculateArtistPayout()` - Artist payout after fees
- `eurToCents()` / `centsToEur()` - Currency conversion
- `validateGermanIBAN()` - German IBAN validation
- `formatIBAN()` - IBAN display formatting
- `getGermanErrorMessage()` - Stripe error code translations

Constants:
- `GERMAN_PAYMENT_METHODS` - Card, SEPA, Giropay, Sofort
- `COIN_PACKAGES` - 5 packages from €9.99 to €179.99

### Payment Components
**Directory:** `src/components/payment/`

| Component | Purpose |
|-----------|---------|
| `CheckoutForm.tsx` | Stripe Elements payment form with dark theme |
| `PaymentStatus.tsx` | Payment success/failure status display |
| `CoinPurchaseModal.tsx` | Coin package selection & checkout |
| `ArtistOnboardingCard.tsx` | Stripe Connect onboarding status card |
| `PaymentMethodSelector.tsx` | Saved payment methods management |
| `index.ts` | Barrel exports |

---

## Database Schema

### artist_stripe_accounts
```sql
CREATE TABLE artist_stripe_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_account_id TEXT NOT NULL UNIQUE,
  stripe_account_type VARCHAR(20) DEFAULT 'express',
  stripe_account_status VARCHAR(20) DEFAULT 'pending',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_url TEXT,
  onboarding_expires_at TIMESTAMPTZ,
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  details_submitted BOOLEAN DEFAULT FALSE,
  default_currency VARCHAR(3) DEFAULT 'EUR',
  country VARCHAR(2) DEFAULT 'DE',
  business_type VARCHAR(20),
  payout_schedule_interval VARCHAR(20) DEFAULT 'weekly',
  payout_schedule_weekly_anchor VARCHAR(10) DEFAULT 'monday',
  verification_status VARCHAR(20) DEFAULT 'pending',
  verification_due_by TIMESTAMPTZ,
  currently_due TEXT[],
  eventually_due TEXT[],
  past_due TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### escrow
```sql
CREATE TABLE escrow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency VARCHAR(3) DEFAULT 'EUR',
  platform_fee_cents INTEGER DEFAULT 0 CHECK (platform_fee_cents >= 0),
  artist_payout_cents INTEGER NOT NULL CHECK (artist_payout_cents > 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'held', 'release_scheduled', 'released',
    'partially_released', 'disputed', 'refunded', 'partially_refunded'
  )),
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_transfer_id TEXT,
  stripe_refund_id TEXT,
  held_at TIMESTAMPTZ,
  release_scheduled_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  refund_amount_cents INTEGER,
  refund_reason TEXT,
  dispute_reason TEXT,
  dispute_resolved_at TIMESTAMPTZ,
  dispute_resolution VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_payment_methods
```sql
CREATE TABLE user_payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL,
  card_brand VARCHAR(20),
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  sepa_bank_name TEXT,
  sepa_last4 VARCHAR(4),
  billing_name TEXT,
  billing_email TEXT,
  billing_country VARCHAR(2) DEFAULT 'DE',
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### stripe_webhook_events
```sql
CREATE TABLE stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  retry_count INTEGER DEFAULT 0,
  payload JSONB NOT NULL,
  related_booking_id UUID REFERENCES bookings(id),
  related_user_id UUID REFERENCES users(id),
  received_at TIMESTAMPTZ DEFAULT NOW()
);
```

### coin_purchase_sessions
```sql
CREATE TABLE coin_purchase_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_checkout_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  package_id TEXT NOT NULL,
  coin_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  bonus_coins INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'completed', 'expired', 'cancelled'
  )),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Payment Flows

### 1. Booking Payment Flow
```
Customer → Select Artist → Send Booking Request
                              ↓
                     Artist Accepts Booking
                              ↓
                     Customer Pays (Stripe)
                              ↓
                     Payment Held in Escrow
                              ↓
                     Event Completed
                              ↓
                     7 Days Waiting Period
                              ↓
                     Escrow Released to Artist
                     (minus 10% platform fee)
```

### 2. Coin Purchase Flow
```
User → Select Coin Package → Stripe Checkout
                                  ↓
                          Payment Confirmed
                                  ↓
                          Webhook Received
                                  ↓
                          Coins Added to Wallet
```

### 3. Artist Onboarding Flow
```
Artist → Dashboard → "Zahlungen aktivieren"
                            ↓
                    Stripe Connect Express
                            ↓
                    Identity Verification
                            ↓
                    Bank Account Setup
                            ↓
                    Onboarding Complete
                            ↓
                    Can Receive Payouts
```

---

## Coin Packages

| Package | Coins | Bonus | Total | Price | Per Coin |
|---------|-------|-------|-------|-------|----------|
| Starter | 100 | 0 | 100 | €9.99 | €0.100 |
| Basic | 250 | 25 | 275 | €19.99 | €0.073 |
| **Beliebt** | 500 | 75 | 575 | €39.99 | €0.070 |
| Pro | 1000 | 200 | 1200 | €74.99 | €0.062 |
| Business | 2500 | 625 | 3125 | €179.99 | €0.058 |

---

## German Payment Methods

| Method | ID | Description |
|--------|-----|-------------|
| Kreditkarte | `card` | Visa, Mastercard, American Express |
| SEPA Lastschrift | `sepa_debit` | German bank account direct debit |
| Giropay | `giropay` | German online banking |
| Sofortüberweisung | `sofort` | Klarna Sofort instant transfer |

---

## Environment Variables

### Frontend (Vite)
```env
# .env.local
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Backend (Supabase Edge Functions)
```env
# Set via Supabase Dashboard or CLI
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## Component Usage

### CheckoutForm
```tsx
import { CheckoutForm } from '@/components/payment'

<CheckoutForm
  clientSecret={clientSecret}
  amountCents={5000}
  description="Buchung: DJ Max für Geburtstag"
  onSuccess={(paymentIntentId) => console.log('Paid:', paymentIntentId)}
  onError={(error) => console.error(error)}
  onCancel={() => console.log('Cancelled')}
  returnUrl="https://bloghead.com/payment/success"
/>
```

### CoinPurchaseModal
```tsx
import { CoinPurchaseModal } from '@/components/payment'

<CoinPurchaseModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={(coins, bonus) => {
    console.log(`Added ${coins} coins + ${bonus} bonus`)
    refreshWallet()
  }}
  userId={user.id}
/>
```

### ArtistOnboardingCard
```tsx
import { ArtistOnboardingCard } from '@/components/payment'

<ArtistOnboardingCard
  artistId={artistProfile.id}
  onOnboardingComplete={() => {
    toast.success('Zahlungen aktiviert!')
    refreshProfile()
  }}
/>
```

### PaymentMethodSelector
```tsx
import { PaymentMethodSelector } from '@/components/payment'

<PaymentMethodSelector
  userId={user.id}
  selectedMethodId={selectedMethod}
  onSelect={(methodId) => setSelectedMethod(methodId)}
  onAddNew={() => setShowAddPaymentModal(true)}
  showAddNew={true}
  disabled={isProcessing}
/>
```

---

## Service Usage

### Stripe Connect (Artist Payouts)
```typescript
import { stripeConnectService } from '@/services/stripeService'

// Check artist account status
const status = await stripeConnectService.getAccountStatus(artistId)
if (status.needsOnboarding) {
  // Start onboarding
  const { url } = await stripeConnectService.getOnboardingLink(artistId)
  window.location.href = url
}

// Get Express Dashboard link
if (status.canReceivePayments) {
  const { url } = await stripeConnectService.getDashboardLink(artistId)
  window.open(url, '_blank')
}
```

### Booking Payments
```typescript
import { bookingPaymentService } from '@/services/stripeService'

// Create payment intent
const { data } = await bookingPaymentService.createPaymentIntent({
  bookingId: booking.id,
  amountCents: 25000, // €250.00
  artistStripeAccountId: artist.stripeAccountId,
  description: `Buchung: ${artist.name} für ${event.name}`
})

// Check escrow status
const { escrow } = await bookingPaymentService.getEscrowStatus(bookingId)
console.log(`Status: ${escrow.status}, Release: ${escrow.releaseScheduledAt}`)
```

### Coin Purchases
```typescript
import { coinPurchaseService, COIN_PACKAGES } from '@/services/stripeService'

// Get packages
const packages = coinPurchaseService.getPackages()

// Create checkout
const { url } = await coinPurchaseService.createCheckout('coins_500')
window.location.href = url

// Verify after return
const { coinsAdded } = await coinPurchaseService.verifyCheckout(sessionId)
```

### Payment Methods
```typescript
import { paymentMethodsService } from '@/services/stripeService'

// Get saved methods
const { methods } = await paymentMethodsService.getSavedMethods(userId)

// Set default
await paymentMethodsService.setDefault(methodId)

// Remove method
await paymentMethodsService.remove(methodId)
```

---

## Security Considerations

### PCI Compliance
- All card data handled by Stripe Elements
- No card numbers stored in our database
- Only tokenized payment method IDs stored

### Row Level Security (RLS)
All tables have RLS policies:
- Users can only view their own payment methods
- Artists can only view their own Stripe accounts
- Escrow visible to booking participants
- Webhook events are service-only (no user access)

### German Compliance
- PSD2/SCA: Strong Customer Authentication via 3D Secure
- GDPR: No unnecessary data storage
- SEPA: European payment method support

---

## Error Messages (German)

| Error Code | German Message |
|------------|----------------|
| `card_declined` | Die Karte wurde abgelehnt. Bitte versuchen Sie eine andere Zahlungsmethode. |
| `expired_card` | Die Karte ist abgelaufen. Bitte verwenden Sie eine gültige Karte. |
| `incorrect_cvc` | Der Sicherheitscode (CVC) ist falsch. |
| `insufficient_funds` | Nicht genügend Guthaben auf dem Konto. |
| `invalid_card_number` | Die Kartennummer ist ungültig. |
| `processing_error` | Ein Verarbeitungsfehler ist aufgetreten. Bitte versuchen Sie es erneut. |
| `authentication_required` | Zusätzliche Authentifizierung erforderlich (3D Secure). |

---

## Next Steps (Step 3)

### Supabase Edge Functions to Create:
1. `stripe-create-connect-account` - Create Express account for artists
2. `stripe-get-onboarding-link` - Generate onboarding URL
3. `stripe-get-dashboard-link` - Generate Express Dashboard URL
4. `stripe-refresh-connect-status` - Sync account status from Stripe
5. `stripe-create-payment-intent` - Create payment for booking
6. `stripe-create-coin-checkout` - Create checkout session for coins
7. `stripe-verify-coin-checkout` - Verify coin purchase
8. `stripe-webhook` - Handle all Stripe webhooks
9. `stripe-set-default-payment-method` - Set user's default method
10. `stripe-remove-payment-method` - Delete saved payment method

### Webhook Events to Handle:
- `payment_intent.succeeded` - Update escrow status
- `payment_intent.payment_failed` - Notify customer
- `checkout.session.completed` - Credit coins to wallet
- `account.updated` - Update artist Connect status
- `transfer.created` - Log artist payout
- `charge.dispute.created` - Handle disputes

---

## Testing

### Stripe Test Cards
| Card Number | Behavior |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 3220 | 3D Secure required |
| 4000 0000 0000 9995 | Declined (insufficient funds) |
| 4000 0000 0000 0002 | Declined (generic) |

### Test SEPA IBAN
- `DE89370400440532013000` - Success
- `DE62370400440532013001` - Failure

### Test Commands
```bash
# Build verification
cd ~/Developer/Bloghead/frontend
npm run build

# Type check only
npx tsc --noEmit

# Run dev server
npm run dev
```

---

## Appendix: Type Definitions

```typescript
// Payment Status Types
type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled'
type EscrowStatus = 'pending' | 'held' | 'release_scheduled' | 'released' | 'disputed' | 'refunded'
type ConnectAccountStatus = 'pending' | 'active' | 'restricted' | 'rejected'

// Coin Package
interface CoinPackage {
  id: string
  coins: number
  priceEur: number
  priceCents: number
  bonus: number
  totalCoins: number
  popular: boolean
  label: string
}

// Stripe Connect Account
interface StripeConnectAccount {
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

// Escrow Info
interface EscrowInfo {
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
```

---

**Documentation maintained by EA Solutions**
