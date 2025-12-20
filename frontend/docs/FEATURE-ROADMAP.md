# Bloghead Feature Roadmap & Detailed Todos

**Created:** December 20, 2024
**Based on:** Bloghead 2.pdf Specification + New Feature Ideas
**Last Updated:** December 20, 2024

---

## 🎯 EXECUTIVE SUMMARY

This roadmap covers all features from the Bloghead 2.pdf specification plus new feature ideas. Features are organized by priority and implementation phase.

### Quick Stats
| Category | Count |
|----------|-------|
| Critical Features | 4 |
| High Priority | 12 |
| Medium Priority | 8 |
| Future/Low | 6 |
| **Total Features** | **30** |

---

## 📊 FULL STATUS TABLE

| Feature | Status | Priority | Phase | Estimate |
|---------|--------|----------|-------|----------|
| Artist Profiles | ✅ Done | - | 2 | - |
| Artist Media (Audio/Video) | ✅ Done | - | 2 | - |
| Service Provider Profiles | ✅ Done | - | 3 | - |
| Rating System | ✅ Done | - | 3 | - |
| Stripe Integration | ✅ Done | - | 4 | - |
| Social Media Links | ✅ Done | - | 4 | - |
| **Map View** | ❌ Missing | **High** | 5 | 1-2 weeks |
| **Availability Calendar** | ❌ Missing | **Critical** | 5 | 3-4 days |
| **Enhanced Booking Form** | ⚠️ Basic | **Critical** | 5 | 2-3 days |
| **In-App Messaging** | ❌ Missing | **Critical** | 5 | 1-2 weeks |
| **Calendar Sync** | ❌ Missing | High | 5 | 2-3 days |
| Technical Rider | ❌ Missing | High | 6 | 3-4 days |
| Hospitality Rider | ❌ Missing | High | 6 | 2-3 days |
| CI Mappe (Branding Kit) | ❌ Missing | Medium | 6 | 2-3 days |
| Pricing Packages | ⚠️ Basic | Medium | 6 | 2 days |
| Equipment Management | ❌ Missing | Medium | 6 | 2-3 days |
| **Coin/Token System** | ❌ Missing | **High** | 7 | 3-4 weeks |
| Deposit System | ❌ Missing | High | 7 | 1 week |
| Cancellation Policies | ❌ Missing | High | 7 | 3-4 days |
| Video Calls | ❌ Missing | Medium | 7 | 1 week |
| Friendliness Badges | ❌ Missing | Medium | 8 | 2-3 days |
| Response Metrics | ❌ Missing | Medium | 8 | 2 days |
| Enhanced Location Profiles | ⚠️ Basic | Medium | 8 | 3-4 days |
| Accountant Access | ❌ Missing | Low | 9 | 1 week |
| Lexoffice Integration | ❌ Missing | Low | 9 | 1-2 weeks |
| DATEV Integration | ❌ Missing | Low | 9 | 1-2 weeks |
| Merch Store | ❌ Missing | Future | 10+ | TBD |
| Fan Investment | ❌ Missing | Future | 10+ | TBD |
| VR Concerts | ❌ Missing | Future | 12+ | TBD |
| NFT Integration | ❌ Missing | Future | 12+ | TBD |

---

## 🚀 PHASE 5: CORE BOOKING FLOW (Current Priority)

### 5.1 🗺️ Map View for Artists/Services

**Priority:** High
**Estimate:** 1-2 weeks
**Dependencies:** Coordinates in database

#### Description
Toggle between Grid/Map view on Artists and Services pages. Users can see providers on an interactive map and filter by location.

#### Technical Requirements
```
Library: Mapbox GL JS (react-map-gl)
Theme: Dark mode matching app design
Markers: Custom icons per category
Popup: Artist preview card on click
```

#### Database Changes
```sql
-- Add coordinates to existing tables
ALTER TABLE artists ADD COLUMN coordinates GEOGRAPHY(POINT, 4326);
ALTER TABLE service_providers ADD COLUMN coordinates GEOGRAPHY(POINT, 4326);

-- Create spatial index
CREATE INDEX idx_artists_coordinates ON artists USING GIST(coordinates);
CREATE INDEX idx_providers_coordinates ON service_providers USING GIST(coordinates);
```

#### UI Components
- `MapViewToggle` - Switch between grid/map
- `ArtistMap` - Mapbox container
- `ArtistMarker` - Custom marker component
- `ArtistMapPopup` - Preview card on click
- `LocationFilter` - "Near me" + radius selector

#### Implementation Steps
1. Install mapbox-gl and react-map-gl
2. Add coordinates columns + geocoding
3. Create MapViewToggle component
4. Build ArtistMap with dark theme
5. Custom markers per category
6. Popup with artist preview
7. "Artists near me" geolocation
8. Radius filter (5km, 10km, 25km, 50km)

---

### 5.2 📅 Availability Calendar

**Priority:** Critical
**Estimate:** 3-4 days
**Dependencies:** None

#### Description
Artists can set their available dates. Visibility options: Public (anyone can see), Without Name (busy/free only), Hidden (only via direct link).

#### Database Schema
```sql
CREATE TABLE artist_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'available', -- available, busy, tentative
  visibility VARCHAR(20) DEFAULT 'public', -- public, anonymous, hidden
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, date)
);

-- RLS
ALTER TABLE artist_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public availability visible" ON artist_availability
  FOR SELECT USING (visibility = 'public');
CREATE POLICY "Artists manage own" ON artist_availability
  FOR ALL USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));
```

#### UI Components
- `AvailabilityCalendar` - Month view with clickable dates
- `DateStatusPicker` - Set available/busy/tentative
- `VisibilitySelector` - Public/Anonymous/Hidden toggle
- `BulkDateSelector` - Select date ranges

#### Implementation Steps
1. Create database table + RLS policies
2. Build calendar UI component
3. Click-to-toggle date status
4. Bulk selection mode
5. Visibility settings per date
6. Integration with booking flow
7. Show on artist profile page

---

### 5.3 📝 Enhanced Booking Request Form

**Priority:** Critical
**Estimate:** 2-3 days
**Dependencies:** Availability Calendar

#### Description
Complete booking request form with all fields from the PDF specification.

#### Form Fields (from PDF)
```
BASIC INFO:
- Datum (Date)
- Ort (Location)
- Zeit (Time - start/end)
- Inhalt (Content/Description)

EVENT TYPE:
- Veranstaltungsart: Sektempfang, Party, Hochzeit, Firmenfeier, etc.
- Clientel (Target audience)
- Größe der VA (Event size - guest count)

LOCATION:
- Location name
- Address
- Personen (Capacity)

EQUIPMENT:
- Was gibt es vor Ort? (What's available?)
- Was muss mitgebracht werden? (What needs to be brought?)

HOSPITALITY:
- Unterbringung (Accommodation)
- Verpflegung:
  - Essen (Food)
  - Trinken (Drinks)
  - Alkohol? (Alcohol available?)

TRANSPORT:
- Eigenanreise (Self-travel)
- Organisierter Transport (Organized transport)
```

#### Database Schema
```sql
CREATE TABLE booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id),
  requester_id UUID REFERENCES users(id),

  -- Basic Info
  event_date DATE NOT NULL,
  event_time_start TIME,
  event_time_end TIME,
  location_name VARCHAR(255),
  location_address TEXT,
  description TEXT,

  -- Event Details
  event_type VARCHAR(50), -- party, wedding, corporate, reception, etc.
  target_audience VARCHAR(100),
  guest_count INTEGER,

  -- Equipment
  equipment_available TEXT,
  equipment_needed TEXT,

  -- Hospitality
  accommodation_provided BOOLEAN DEFAULT FALSE,
  food_provided BOOLEAN DEFAULT FALSE,
  drinks_provided BOOLEAN DEFAULT FALSE,
  alcohol_available BOOLEAN DEFAULT FALSE,
  hospitality_notes TEXT,

  -- Transport
  transport_type VARCHAR(50), -- self, organized, hybrid
  transport_notes TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, cancelled
  artist_response TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5.4 💬 In-App Messaging

**Priority:** Critical
**Estimate:** 1-2 weeks
**Dependencies:** None

#### Description
Secure messaging through the platform. No public phone numbers. Hidden email addresses. Optional video call integration.

#### Features (from PDF)
- Gesichert über die Plattform (Secure platform messaging)
- Keine öffentliche Nummer (No public phone)
- Chat in der App (In-app chat)
- Versteckte E-Mail (Hidden email)
- Videocall (Future)
- Anrufe über Umleitung (Call forwarding - Future)

#### Database Schema
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID REFERENCES users(id),
  participant_2 UUID REFERENCES users(id),
  booking_request_id UUID REFERENCES booking_requests(id),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

#### Implementation
- Use Supabase Realtime for instant messaging
- Message encryption (future)
- Read receipts
- Push notifications
- File attachments (images, PDFs)

---

### 5.5 📆 Calendar Sync (Apple/Google)

**Priority:** High
**Estimate:** 2-3 days
**Dependencies:** Availability Calendar, Bookings

#### Description
Export bookings to Apple Calendar and Google Calendar. Sync availability bidirectionally.

#### Implementation
```typescript
// iCal export
function generateICalEvent(booking: Booking): string {
  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(booking.date, booking.startTime)}
DTEND:${formatDate(booking.date, booking.endTime)}
SUMMARY:${booking.eventName} - Bloghead Booking
LOCATION:${booking.location}
DESCRIPTION:${booking.description}
END:VEVENT
END:VCALENDAR`;
}

// Google Calendar API integration
// Apple Calendar via iCal file download
```

---

## 🎸 PHASE 6: ARTIST ENHANCEMENTS

### 6.1 Technical Rider (Technikanforderungen)

**Priority:** High
**Estimate:** 3-4 days

#### From PDF Specification
```
Technikanforderungen:
- Was braucht man an Technik? (What tech is needed?)
- Was hat man? (What do you have?)
- Bringt man das mit? (Will you bring it?)
- Kostet es Extra? (Extra cost?)
```

#### Database Schema
```sql
CREATE TABLE artist_technical_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,

  -- Required Equipment
  required_equipment JSONB, -- [{name, description, mandatory}]

  -- What artist provides
  artist_equipment JSONB, -- [{name, description, extraCost}]

  -- Notes
  stage_requirements TEXT,
  sound_requirements TEXT,
  lighting_requirements TEXT,
  power_requirements TEXT,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6.2 Hospitality Rider (Hospitalityanforderungen)

**Priority:** High
**Estimate:** 2-3 days

#### From PDF Specification
```
Hospitalityanforderungen:
- Was erwartet man vom Veranstalter? (What's expected?)
- Essen (Food)
- Trinken (Drinks)
- Etc.
```

#### Database Schema
```sql
CREATE TABLE artist_hospitality_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,

  -- Food & Drinks
  food_requirements TEXT,
  drink_requirements TEXT,
  dietary_restrictions TEXT,

  -- Accommodation
  accommodation_required BOOLEAN DEFAULT FALSE,
  accommodation_notes TEXT,

  -- Dressing Room
  dressing_room_required BOOLEAN DEFAULT FALSE,
  dressing_room_notes TEXT,

  -- Other
  other_requirements TEXT,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6.3 CI Mappe (Branding Kit)

**Priority:** Medium
**Estimate:** 2-3 days

#### From PDF Specification
```
CI Mappe:
- Logo
- Farben (Colors)
- Schriftarten (Fonts)
```

#### Implementation
- Logo upload (multiple formats: PNG, SVG, EPS)
- Brand colors (primary, secondary, accent)
- Font specifications
- Usage guidelines
- Downloadable press kit (ZIP)

---

### 6.4 Pricing Packages (Pakete)

**Priority:** Medium
**Estimate:** 2 days

#### From PDF Specification
```
Kosten:
- Preisvorstellung (Price range)
- Pakete (Packages)
```

#### Database Schema
```sql
CREATE TABLE artist_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_hours DECIMAL(4,2),
  price DECIMAL(10,2),
  includes JSONB, -- ["Sound check", "2 hour set", "Meet & greet"]

  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 💰 PHASE 7: PAYMENT & FINANCE

### 7.1 🪙 Coin/Token System

**Priority:** High
**Estimate:** 3-4 weeks
**Dependencies:** Stripe Integration

#### From PDF Specification
```
Marktplatz:
- Wert und Gegenwert (Value exchange)
- Treuhand (Escrow)
- Coin / NFT Währung (Coin/NFT currency)

Eigene Währung (Own currency):
- 1,01 Anfangswert (Starting value)
- 0,01 pro Fan Steigerung (Increase per fan)
- Faktorisierung (Factorization)

Two coin types:
- Allgemeiner Coin: Bloghead (Platform-wide, more expensive)
- Spezifischer Coin: Künstlerhead (Artist-specific, cheaper)
```

#### Tokenomics Design

**Platform Coin (BHC - Bloghead Coin)**
```
Base Value: €1.00
Use: Platform-wide payments, tips, premium features
Acquisition: Purchase with EUR, earn through engagement
```

**Artist Coin (ARC - Artist Coin)**
```
Base Value: €0.50
Multiplier: +0.01 per 100 fans
Use: Artist-specific purchases, exclusive content, VIP access
Acquisition: Purchase with EUR or BHC, earn through artist engagement
```

#### Payment Split Options
| Option | Cash | Coins | Artist Gets |
|--------|------|-------|-------------|
| Cash Only | 100% | 0% | Full EUR amount |
| Hybrid | 50% | 50% | EUR + Coin value |
| Coins Only | 0% | 100% | Full coin amount (higher value) |

#### Database Schema
```sql
-- Platform coin balance
CREATE TABLE user_coin_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bhc_balance DECIMAL(12,2) DEFAULT 0, -- Bloghead Coins
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artist-specific coins
CREATE TABLE artist_coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  coin_name VARCHAR(50),
  coin_symbol VARCHAR(10),
  base_value DECIMAL(10,4) DEFAULT 0.50,
  current_value DECIMAL(10,4) DEFAULT 0.50,
  total_supply DECIMAL(15,2) DEFAULT 0,
  fan_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User holdings of artist coins
CREATE TABLE user_artist_coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_coin_id UUID REFERENCES artist_coins(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, artist_coin_id)
);

-- Coin transactions
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  transaction_type VARCHAR(50), -- purchase, tip, payment, reward, transfer
  coin_type VARCHAR(20), -- bhc, arc
  artist_coin_id UUID REFERENCES artist_coins(id),
  amount DECIMAL(12,2),
  eur_equivalent DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Value calculation trigger
CREATE OR REPLACE FUNCTION update_artist_coin_value()
RETURNS TRIGGER AS $$
BEGIN
  -- Formula: base_value + (fan_count / 100) * 0.01
  NEW.current_value := NEW.base_value + (NEW.fan_count::DECIMAL / 100) * 0.01;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artist_coin_value_trigger
BEFORE UPDATE ON artist_coins
FOR EACH ROW EXECUTE FUNCTION update_artist_coin_value();
```

#### Implementation Phases

**Phase 7.1a: Basic Coin System (Week 1-2)**
- User coin balance
- Purchase coins with Stripe
- View balance in dashboard
- Basic transaction history

**Phase 7.1b: Artist Coins (Week 2-3)**
- Artist coin creation
- Fan following affects value
- Purchase artist coins
- Artist coin marketplace

**Phase 7.1c: Payment Integration (Week 3-4)**
- Booking payment with coins
- Tipping with coins
- Coin rewards for engagement
- Coin-to-EUR conversion

---

### 7.2 Deposit System (Anzahlung)

**Priority:** High
**Estimate:** 1 week

#### From PDF Specification
```
Anzahlung:
- Höhe? (Amount?)
- Wann wird die Anzahlung gebucht? (When charged?)
- Mit Bestätigung? (With confirmation?)
- 3/6/12 Monate vorher? (3/6/12 months before?)
```

#### Implementation
- Configurable deposit percentage (10-50%)
- Automatic charging at confirmation
- Remaining balance due before event
- Escrow until event completion

---

### 7.3 Cancellation Policies (Storno)

**Priority:** High
**Estimate:** 3-4 days

#### From PDF Specification
```
Policies:
- Wie lange kann storniert werden? (How long to cancel?)
- Stornokosten (Cancellation costs)
- Was passiert beim Storno? (What happens?)
  - Veranstalter (Organizer cancels)
  - Artist (Artist cancels)
```

#### Policy Options
| Timeline | Refund % |
|----------|----------|
| 30+ days | 100% |
| 14-30 days | 75% |
| 7-14 days | 50% |
| < 7 days | 25% |
| < 24 hours | 0% |

---

## ⭐ PHASE 8: RATING ENHANCEMENTS

### 8.1 Friendliness Badges (Kleinanzeigen-Vorbild)

**Priority:** Medium
**Estimate:** 2-3 days

#### From PDF Specification
```
Freundlichkeit:
- Freundlich: 1+
- Sehr Freundlich: 5+
- Besonders Freundlich: 10+
```

#### Implementation
```sql
-- Badge calculation
SELECT
  user_id,
  CASE
    WHEN positive_ratings >= 10 THEN 'Besonders Freundlich'
    WHEN positive_ratings >= 5 THEN 'Sehr Freundlich'
    WHEN positive_ratings >= 1 THEN 'Freundlich'
    ELSE NULL
  END as friendliness_badge
FROM user_ratings_summary;
```

---

### 8.2 Response Metrics

**Priority:** Medium
**Estimate:** 2 days

#### From PDF Specification
```
Metrics:
- Antwortrate (Response rate)
- Antwortzeit (Average PM response time)
```

#### Implementation
- Track message response times
- Calculate average response time
- Display on profile (e.g., "Responds within 2 hours")
- Response rate percentage

---

## 🏢 PHASE 9: BUSINESS INTEGRATIONS

### 9.1 Accountant Access (Steuerberater)

**Priority:** Low
**Estimate:** 1 week

#### From PDF Specification
```
Steuerberater:
- Zugang (Access)
- Foto/Belege (Photo receipts)
- Kosten (Costs)
- Zahlungseingang (Payment receipt)
- Kontoabgleich (Account reconciliation)
```

---

### 9.2 Lexoffice / DATEV Integration

**Priority:** Low
**Estimate:** 1-2 weeks each

#### From PDF Specification
```
Buchhaltung Partner:
- Lexoffice
- DATEV
```

---

## 🚀 PHASE 10+: FUTURE FEATURES

### VR Concerts (Konzerte Virtuell)
- Virtual reality event streaming
- 360° venue tours
- Virtual meet & greets

### Merch Store
- Artist merchandise integration
- Shopify/WooCommerce connection
- In-app purchasing

### Fan Investment
- Invest in artist coins
- Value grows with popularity
- Exclusive investor perks

### NFT Integration
- Concert ticket NFTs
- Exclusive content NFTs
- Collectible artist NFTs

---

## 📱 iOS APP CONSIDERATIONS

All features should be designed with iOS app compatibility in mind:
- API-first architecture
- Push notification support
- Offline capability for key features
- Native calendar integration
- Apple Pay support

---

## 📝 NOTES

### From PDF Mind Map Structure
```
BLOGHEAD
├── Booking
│   ├── Artists (profiles, media, riders, pricing, calendar)
│   ├── Anfragen (booking requests with full details)
│   └── Buchungen (bookings, policies, payments, calendar sync)
├── Locations (details, equipment, marketing)
├── Veranstalter (organizers, history, verification)
├── Finance (payments, deposits, cancellation, accounting)
├── Legal (insurance, contracts, escrow)
├── Bewertungssystem (ratings, badges, metrics)
└── Marktplatz (coins, NFTs, VR, merch)
```

### Key Principles
1. **Privacy First** - No public contact info
2. **Secure Messaging** - All communication through platform
3. **Escrow Payments** - Protect both parties
4. **Mutual Verification** - Artists and organizers verify each other
5. **German Compliance** - GDPR, GoBD, DATEV-ready

---

**Document Version:** 1.0
**Next Review:** January 2025
