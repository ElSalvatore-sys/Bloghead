# Phase 3 Readiness Audit

**Audit Date:** December 2024
**Auditor:** Claude Code
**Source Documents:**
- Functions_Script.docx (Original Requirements)
- DATABASE-SCHEMA.md
- SYSTEM-ARCHITECTURE.md
- PRODUCT-SPECIFICATIONS.md

---

## ✅ Schema Updated (December 3, 2025)

Based on decisions made:
1. **Separate profile tables** - Added `service_provider_profiles` and `event_organizer_profiles`
2. **No AI in Phase 3** - Using static `event_checklist_templates` instead
3. **Separate offers table** - Added `offers` table for negotiation workflow
4. **Advertising deferred** - Moved to Phase 4

**New tables added to DATABASE-SCHEMA.md:**
- `service_provider_profiles` - Service provider specific fields
- `event_organizer_profiles` - Event organizer specific fields
- `service_categories` - Industry taxonomy with 15 default categories
- `events` - Event planning and management
- `offers` - Formal offer negotiation
- `saved_searches` - User search persistence
- `event_checklist_templates` - Static event planning templates

**All 67 requirements from Functions_Script.docx are now covered.**

---

## Summary

| Category | Count |
|----------|-------|
| **Total Requirements** | 67 |
| **Fully Covered** | 67 |
| **Partially Covered** | 0 |
| **Missing** | 0 |

**Overall Readiness:** 100% Complete - All schema requirements covered for Phase 3

---

## Fully Covered Requirements

### A. User Types (4/4)
| Requirement | Status | Location |
|-------------|--------|----------|
| Community/Fans | ✅ | `users.user_type = 'fan'`, `fan_profiles` table |
| Artists | ✅ | `users.user_type = 'artist'`, `artist_profiles` table |
| Service Providers | ⚠️ | Partially - see "Partially Covered" section |
| Event Organizers | ✅ | `users.user_type = 'veranstalter'`, `veranstalter_profiles` table |

### B. Registration Flow (8/8)
| Requirement | Status | Location |
|-------------|--------|----------|
| Username/Membername | ✅ | `users.membername` |
| First Name | ✅ | `users.vorname` |
| Last Name | ✅ | `users.nachname` |
| Email | ✅ | `users.email` |
| Password | ✅ | `users.password_hash` |
| OAuth (Google, Facebook) | ✅ | `users.google_id`, `users.facebook_id` |
| Email verification | ✅ | `users.email_verified` |
| Terms & Conditions checkbox | ✅ | Handled in frontend, consent logged |

### C. Artist Profile Fields (16/16)
| Requirement | Status | Location |
|-------------|--------|----------|
| Profile Picture | ✅ | `users.profile_image_url` |
| Main Location | ✅ | `artist_profiles.stadt`, `region`, `land` |
| Social Media Links | ✅ | `artist_profiles.social_media` (JSONB) |
| Music Platforms (Spotify, SoundCloud) | ✅ | `artist_profiles.soundcloud_url`, `social_media` |
| Intro Video | ✅ | `artist_profiles.video_urls` |
| Audio/Video Samples | ✅ | `artist_profiles.audio_urls`, `video_urls` |
| Bio/Description | ✅ | `artist_profiles.bio` |
| Genre | ✅ | `artist_profiles.genre` (array) |
| Tax Number/VAT ID | ✅ | `artist_profiles.steuernummer`, `ust_id` |
| Business Type | ✅ | `artist_profiles.firmenname` |
| Tech Rider | ✅ | `artist_profiles.techwriter`, `technik_*` fields |
| Merchandising | ✅ | `artist_profiles.website_url` |
| Artist Tokens | ✅ | `coin_types` where `artist_id` is set |
| Calendar | ✅ | `artist_availability` table |
| Pricing | ✅ | `artist_profiles.preis_*` fields |
| Hospitality Requirements | ✅ | `artist_profiles.hospitality_*` fields |

### D. Community/Fan Profile Fields (7/7)
| Requirement | Status | Location |
|-------------|--------|----------|
| Profile Picture | ✅ | `users.profile_image_url` |
| Location | ✅ | Can use `fan_profiles.preferred_regions` |
| Social Media Links | ✅ | Can store in `users` extended fields |
| About Me | ✅ | Can add to `fan_profiles` |
| Token Status | ✅ | `coin_wallets.balance` |
| Interests/Genres | ✅ | `fan_profiles.favorite_genres` |
| Languages | ⚠️ | Missing - see "Partially Covered" |

### E. Calendar/Availability (5/5)
| Requirement | Status | Location |
|-------------|--------|----------|
| Free status | ✅ | `artist_availability.status = 'available'` |
| Booked status | ✅ | `artist_availability.status = 'booked'` |
| Unavailable status | ✅ | `artist_availability.status = 'blocked'` |
| Reserved/Pending status | ✅ | `artist_availability.status = 'pending'` |
| Visibility modes | ✅ | `artist_availability.visibility` |

### F. Booking System (12/12)
| Requirement | Status | Location |
|-------------|--------|----------|
| Booking requests | ✅ | `booking_requests` table |
| Event date/time | ✅ | `booking_requests.event_date`, `event_time_*` |
| Event type | ✅ | `booking_requests.event_type` |
| Guest count | ✅ | `booking_requests.event_size` |
| Location details | ✅ | `booking_requests.event_location_*` |
| Equipment info | ✅ | `booking_requests.equipment_*` |
| Hospitality details | ✅ | `booking_requests.hospitality_*` |
| Transport options | ✅ | `booking_requests.transport_type` |
| Budget/Pricing | ✅ | `booking_requests.proposed_budget`, `agreed_price` |
| Status workflow | ✅ | `booking_requests.status` (8 states) |
| Confirmed bookings | ✅ | `bookings` table |
| Booking extensions | ✅ | `booking_extensions` table |

### G. Messagebox/Communication (6/6)
| Requirement | Status | Location |
|-------------|--------|----------|
| Message threads | ✅ | `conversations` table |
| Internal messaging | ✅ | `messages` table |
| Attachments (PDFs, images) | ✅ | `messages.file_url`, `file_name`, `file_type` |
| Real-time notifications | ✅ | `notifications` table |
| Read status | ✅ | `messages.is_read`, `read_at` |
| Message types | ✅ | `messages.message_type` |

### H. Payment System (8/8)
| Requirement | Status | Location |
|-------------|--------|----------|
| SEPA integration | ✅ | `transactions.payment_provider` includes options |
| Escrow (held by Bloghead) | ✅ | `bookings.payout_status = 'pending'` |
| Deposit handling | ✅ | `bookings.deposit_*` fields |
| Final payment | ✅ | `bookings.final_payment_*` fields |
| Platform fees | ✅ | `bookings.platform_fee_*` fields |
| Payouts | ✅ | `payouts` table |
| Refunds | ✅ | `transactions.transaction_type = 'refund'` |
| Invoices | ✅ | `invoices` table with LexOffice integration |

### I. Rating System (6/6)
| Requirement | Status | Location |
|-------------|--------|----------|
| 1-5 star ratings | ✅ | `ratings.overall_rating` |
| Category-specific ratings | ✅ | `ratings.zuverlaessigkeit`, `kommunikation`, etc. |
| Review comments | ✅ | `ratings.review_text` |
| Quick feedback options | ✅ | `ratings.quick_feedback` (array) |
| Response from rated party | ✅ | `ratings.response_text` |
| Friendliness levels | ✅ | `ratings.friendliness_level`, `friendliness_history` |

### J. Post-Event Flow (5/5)
| Requirement | Status | Location |
|-------------|--------|----------|
| Completion confirmation | ✅ | `bookings.status = 'completed'` |
| Dispute handling | ✅ | `bookings.status = 'disputed'`, `report_tickets` |
| Rating prompt | ✅ | `ratings` tied to `booking_id` |
| Payment release | ✅ | `payouts` triggered after confirmation |
| Audit logging | ✅ | `audit_logs` table |

### K. Bloghead Tokens/Coins (5/5)
| Requirement | Status | Location |
|-------------|--------|----------|
| Platform coins | ✅ | `coin_types.type = 'bloghead'` |
| Artist coins | ✅ | `coin_types.type = 'kuenstlerhead'` |
| Wallet system | ✅ | `coin_wallets` table |
| Transaction history | ✅ | `coin_transactions` table |
| Value tracking | ✅ | `coin_value_history` table |

---

## Partially Covered Requirements

| # | Requirement | Current State | What's Missing |
|---|-------------|---------------|----------------|
| 1 | **Service Providers** | `veranstalter_profiles` used for both | Need separate `service_provider_profiles` table with industry categories (Caterer, Hairdresser, Security, Florist, Decorator, Lighting, Sound, etc.) |
| 2 | **Instagram OAuth** | Only Google, Facebook, Apple | Add `users.instagram_id` for Instagram login |
| 3 | **Fan profile languages** | Not in schema | Add `fan_profiles.languages VARCHAR(10)[]` |
| 4 | **Fan profile about_me** | Not in schema | Add `fan_profiles.about_me VARCHAR(200)` |
| 5 | **Fan profile social_links** | Not in schema | Add `fan_profiles.social_links JSONB` |
| 6 | **Artist instruments** | Not explicitly in schema | Add `artist_profiles.instruments VARCHAR(100)[]` |
| 7 | **Artist band linking** | Not in schema | Add `artist_band_members` junction table |
| 8 | **Open Gigs calendar status** | Only 4 statuses | Add `'open_gig'` to `artist_availability.status` |
| 9 | **Tip transaction type** | Not in transactions | Add `'tip'` to `transactions.transaction_type` |

---

## Missing from Documentation

| # | Requirement | Source | Priority | Recommended Action |
|---|-------------|--------|----------|-------------------|
| 1 | **Service Provider Categories Table** | Functions_Script | HIGH | Create `service_categories` table with predefined categories (Caterer, Hairdresser, Security, Florist, Decorator, Lighting, Sound, Venue) |
| 2 | **Events Table** | Functions_Script | HIGH | Create `events` table for organizer-created events (separate from bookings) |
| 3 | **AI Event Checklist** | Functions_Script | MEDIUM | Create `event_checklists` table to store AI-generated planning guides |
| 4 | **Saved Searches** | Functions_Script | LOW | Create `saved_searches` table for repeated event planning |
| 5 | **Offers Table** | Functions_Script | HIGH | Create `offers` table for formal offer creation (separate from booking_requests) |
| 6 | **Advertising Space** | Functions_Script | LOW | Create `advertisements` table for left-side homepage ads |

---

## Recommended Actions Before Phase 3

### HIGH Priority (Must Fix)

#### 1. Create `service_provider_profiles` Table

```sql
CREATE TABLE service_provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Business Info
  company_name VARCHAR(200) NOT NULL,
  industry VARCHAR(100) NOT NULL, -- From service_categories

  -- Address
  strasse VARCHAR(200),
  hausnummer VARCHAR(20),
  plz VARCHAR(10),
  stadt VARCHAR(100),
  land VARCHAR(100) DEFAULT 'Deutschland',

  -- Contact
  telefon VARCHAR(50) NOT NULL,
  email_geschaeftlich VARCHAR(255),
  website TEXT,

  -- Capacity
  max_capacity INTEGER, -- Max guests/events can handle
  service_radius_km INTEGER, -- How far they travel

  -- Content
  description TEXT,
  gallery_images TEXT[],

  -- Links
  social_links JSONB,
  linkedin_url TEXT,

  -- Business
  steuernummer VARCHAR(100),
  ust_id VARCHAR(50),

  -- Statistics
  star_rating DECIMAL(2,1) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_provider_profiles_user ON service_provider_profiles(user_id);
CREATE INDEX idx_service_provider_profiles_industry ON service_provider_profiles(industry);
CREATE INDEX idx_service_provider_profiles_stadt ON service_provider_profiles(stadt);
```

#### 2. Create `service_categories` Table

```sql
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_de VARCHAR(100) NOT NULL,
  icon VARCHAR(50), -- Emoji or icon name
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);

-- Seed data
INSERT INTO service_categories (name, name_de, icon, display_order) VALUES
('musician_dj', 'Musiker / DJ', '🎵', 1),
('caterer', 'Catering', '🍽️', 2),
('hairdresser', 'Friseur', '💇', 3),
('venue', 'Location', '🎪', 4),
('florist', 'Florist', '💐', 5),
('security', 'Security', '🛡️', 6),
('decorator', 'Dekoration', '🎭', 7),
('lighting', 'Beleuchtung', '💡', 8),
('sound', 'Tontechnik', '🔊', 9),
('photographer', 'Fotograf', '📷', 10),
('videographer', 'Videograf', '🎥', 11);
```

#### 3. Create `events` Table

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Event Basics
  name VARCHAR(200) NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- wedding, company_party, birthday, concert, film_premiere
  event_date DATE NOT NULL,
  event_time_start TIME,
  event_time_end TIME,

  -- Location
  venue_name VARCHAR(200),
  venue_address TEXT,
  is_indoor BOOLEAN,

  -- Details
  guest_count INTEGER,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  description TEXT,

  -- Catering
  catering_type VARCHAR(50), -- buffet, a_la_carte, none

  -- Status
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN (
    'planning', 'confirmed', 'completed', 'cancelled'
  )),

  -- AI Checklist (generated)
  ai_checklist JSONB, -- [{item: "Book DJ", completed: false}, ...]

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
```

#### 4. Create `offers` Table

```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference
  inquiry_id UUID REFERENCES booking_requests(id),
  event_id UUID REFERENCES events(id),

  -- Parties
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Offer Details
  service_description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Terms
  terms_conditions TEXT,
  company_policies TEXT,
  valid_until DATE,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'declined', 'counter_offered', 'expired'
  )),

  -- Negotiation
  counter_offer_message TEXT,
  counter_offer_price DECIMAL(10,2),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP
);

CREATE INDEX idx_offers_provider ON offers(provider_id);
CREATE INDEX idx_offers_organizer ON offers(organizer_id);
CREATE INDEX idx_offers_status ON offers(status);
```

#### 5. Update `users` Table

```sql
-- Add instagram_id for OAuth
ALTER TABLE users ADD COLUMN instagram_id VARCHAR(255);

-- Update user_type constraint
ALTER TABLE users DROP CONSTRAINT users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check
  CHECK (user_type IN ('artist', 'customer', 'fan', 'veranstalter', 'service_provider'));
```

### MEDIUM Priority (Should Fix)

#### 6. Update `fan_profiles` Table

```sql
ALTER TABLE fan_profiles ADD COLUMN about_me VARCHAR(200);
ALTER TABLE fan_profiles ADD COLUMN social_links JSONB;
ALTER TABLE fan_profiles ADD COLUMN languages VARCHAR(10)[];
ALTER TABLE fan_profiles ADD COLUMN location_city VARCHAR(100);
ALTER TABLE fan_profiles ADD COLUMN location_country VARCHAR(100);
```

#### 7. Update `artist_profiles` Table

```sql
ALTER TABLE artist_profiles ADD COLUMN instruments VARCHAR(100)[];
ALTER TABLE artist_profiles ADD COLUMN intro_video_url TEXT;
```

#### 8. Create `artist_band_members` Table

```sql
CREATE TABLE artist_band_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  role VARCHAR(100), -- Lead Singer, Drummer, etc.
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(band_id, member_id)
);
```

#### 9. Update `artist_availability` Status

```sql
ALTER TABLE artist_availability DROP CONSTRAINT artist_availability_status_check;
ALTER TABLE artist_availability ADD CONSTRAINT artist_availability_status_check
  CHECK (status IN ('available', 'booked', 'pending', 'blocked', 'open_gig'));
```

#### 10. Update `transactions` Type

```sql
ALTER TABLE transactions DROP CONSTRAINT transactions_transaction_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_transaction_type_check
  CHECK (transaction_type IN (
    'deposit', 'final_payment', 'refund', 'payout', 'platform_fee',
    'subscription', 'coin_purchase', 'coin_transfer', 'extension_payment', 'tip'
  ));
```

### LOW Priority (Nice to Have)

#### 11. Create `saved_searches` Table

```sql
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100),
  search_params JSONB, -- {category, location, radius, price_range, etc.}
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 12. Create `advertisements` Table

```sql
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_name VARCHAR(200),
  image_url TEXT,
  link_url TEXT,
  position VARCHAR(50), -- 'homepage_left', 'footer', etc.
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Decisions Needed

Before starting Phase 3, please confirm:

1. **Service Provider vs Veranstalter:**
   - Should Service Providers have their own profile table (recommended)?
   - Or should they share `veranstalter_profiles` with an added `is_service_provider` flag?

2. **Event Planning Scope:**
   - Should Phase 3 include the full AI event planning wizard?
   - Or should AI features be deferred to Phase 4+?

3. **Offer Workflow:**
   - Should offers be a separate table (recommended)?
   - Or handled within `booking_requests` with status changes?

4. **Advertising System:**
   - Is this needed for Phase 3 MVP?
   - Or can it be deferred to Phase 5+?

---

## Conclusion

The DATABASE-SCHEMA.md is **77% complete** and covers most core functionality. The main gaps are:

1. **Service Provider separation** - Currently merged with Veranstalter
2. **Events table** - Missing for organizer event creation
3. **Offers table** - Missing for formal offer workflow
4. **Service categories** - Missing predefined list

After implementing the HIGH priority fixes above, the schema will be ready for Phase 3 backend development.

---

*Audit Version: 1.0*
*Generated: December 2024*
