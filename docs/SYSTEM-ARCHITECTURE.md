# Bloghead System Architecture

Comprehensive system architecture for the Bloghead artist booking platform.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BLOGHEAD PLATFORM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   BOOKING    │  │   FINANCE    │  │    LEGAL     │  │   RATING     │ │
│  │   SYSTEM     │  │   SYSTEM     │  │   SYSTEM     │  │   SYSTEM     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   WÄHRUNG    │  │     VR       │  │     FAN      │                   │
│  │   (COINS)    │  │   SYSTEM     │  │   SYSTEM     │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                         COMMUNICATION LAYER                              │
│              (Secure Chat, Video Calls, Notifications)                   │
├─────────────────────────────────────────────────────────────────────────┤
│                           DATA LAYER                                     │
│                    (Supabase PostgreSQL + Storage)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. BOOKING SYSTEM

The core system enabling artists and customers to connect for events.

### 1.1 Artists

#### Präsentation (Profile Presentation)

| Category | Fields | Description |
|----------|--------|-------------|
| **Personal** | Person(en) | Individual or band members |
| **Media** | Audiocontent | Music samples, demo tracks |
| | Videocontent | Performance videos, promo clips |
| **Historie** | Veranstaltungen | Past events performed |
| | Veranstalter | Previous organizers worked with |
| | Locations | Venues performed at |
| **Technik** | Anforderungen | Technical requirements |
| | Was wird benötigt? | What equipment needed |
| | Was bringt der Künstler mit? | What artist brings |
| | Extrakosten? | Additional costs for equipment |
| **Hospitality** | Essen | Food requirements |
| | Trinken | Beverage requirements |
| | Unterbringung | Accommodation needs |
| **CI Mappe** | Logo | Artist logo files |
| | Farben | Brand colors |
| | Schriftarten | Brand fonts |
| **Kosten** | Preisvorstellung | Base pricing |
| | Pakete | Package options |

#### Terminverwaltung (Calendar Management)

**Verfügbarkeiten (Availability):**

| Visibility Mode | Description |
|-----------------|-------------|
| Sichtbar (Ohne Name) | Shows as "Booked" without event details |
| Sichtbar (Mit Name/Link) | Shows event name, links to event |
| Versteckt | Hidden from public view |

**Policies:**

| Policy | Options |
|--------|---------|
| Anfragen erlaubt? | Anyone can request / Verified only / Invite only |
| Mehrfachbuchung? | Allow requests when already booked for day? |

#### Anfragen (Booking Requests)

**Required Fields:**

| Category | Field | Description |
|----------|-------|-------------|
| **Basics** | Datum | Event date |
| | Ort | Event location |
| | Zeit | Start and end time |
| **Event Type** | Veranstaltungsart | Sektempfang, Party, Hochzeit, Firmenfeier, etc. |
| **Cliente** | Größe der VA | Expected attendees |
| | Location | Venue details |
| | Personen | Key contacts |
| **Equipment** | Was gibt es vor Ort? | Available on-site equipment |
| | Was muss mitgebracht werden? | What artist must bring |
| **Hospitality** | Unterbringung | Accommodation (yes/no, details) |
| | Verpflegung | Food provided? |
| | Essen | Meal details |
| | Trinken | Beverages |
| | Alkohol? | Alcohol available? |
| **Transport** | Eigenanreise | Self-arranged travel |
| | Organisiert | Organizer arranges transport |

#### Buchungen (Confirmed Bookings)

**Booking Policies:**

| Policy | Configuration |
|--------|---------------|
| Stornofrist | How long before event can be cancelled |
| Stornokosten | Cancellation fee structure |
| Zahlungsmodalitäten | Payment terms (deposit, final payment) |
| Verbindliche Zusage | Binding confirmation requirements |

**Post-Booking Actions:**

| Action | Description |
|--------|-------------|
| Kalendereintrag | Auto-create calendar event |
| Verfügbarkeiten Update | Mark date as booked |
| Export/Sync | Apple Calendar, Google Calendar sync |

#### Kommunikation (Communication)

**Security Features:**

| Feature | Implementation |
|---------|----------------|
| Plattform-gesichert | All comms through platform |
| Keine öffentliche Nummer | Phone hidden, use platform calling |
| Anrufe über Umleitung | Call forwarding through platform |
| Videocall | Built-in video call feature |
| Chat in der App | In-app messaging |
| Versteckte eMail | Platform-masked email addresses |

**Protection:**

| Type | Measure |
|------|---------|
| Datenschutz | GDPR-compliant data handling |
| Personenschutz | Identity protection, spam prevention |

---

### 1.2 Veranstalter (Event Organizers)

#### Profile Information

| Category | Fields |
|----------|--------|
| **Location** | Name, Address, Maps Link |
| | Eintritt (Entry details) |
| | Öffnungszeiten (Operating hours) |
| | Social Links |
| **Ausstattung** | Audio equipment |
| | Licht (Lighting) |
| | Räumlichkeiten (Venue spaces) |
| | Künstlerräumlichkeiten (Artist areas) |
| **Marketing** | Video content |
| | Bild (Photos) |
| | Ton (Audio samples) |
| **CI Mappe** | Logo |
| | Farben (Colors) |
| | Schriftarten (Fonts) |
| **Historie** | Previous Künstler booked |
| | Past Veranstaltungen |
| | Other Locations managed |
| **Verification** | Gegenseitige Verifizierung (Mutual verification with artists) |

#### Anfragen (Booking Requests to Artists)

| Field | Description |
|-------|-------------|
| Wann? | Date/time selection |
| Slotauswahl | Available time slots |
| Equipment vor Ort | Equipment provided on-site |
| Hospitality | Verpflegung (Essen, Trinken, Alkohol?) |
| Nachricht | Custom message to artist |

#### Additional Features

| Feature | Description |
|---------|-------------|
| Social Sharing | Share events using CI package |
| Merch | Merchandise integration |
| Partner | Partner/sponsor management |
| Verlängerung | Event extension requests |
| Nachverhandlung | Renegotiation flow |
| Push Nachrichten | Real-time notifications |

---

## 2. FINANCE SYSTEM

### 2.1 Zahlungsabwicklung (Payment Processing)

#### Payment Flow

```
Request → Deposit → Event → Final Payment → Payout
    │         │                    │           │
    │         │                    │           └── 7 days auto OR
    │         │                    │               earlier with VA confirmation
    │         │                    │
    │         │                    └── After event completion
    │         │
    │         └── When booking confirmed
    │             (Options: immediately, 3/6/12 months before)
    │
    └── Booking request submitted
```

#### Deposit Configuration

| Setting | Options |
|---------|---------|
| Höhe (Amount) | Percentage or fixed amount |
| Wann wird gebucht? | Mit Bestätigung / 3 Monate / 6 Monate / 12 Monate vorher |

#### Payout Timing

| Scenario | Timing |
|----------|--------|
| Standard | 7 days after event (automatic) |
| Early | Before 7 days with VA confirmation |
| Disputed | Held until resolution |

#### Cancellation Handling

| Cancelled By | Policy |
|--------------|--------|
| Veranstalter | Deposit forfeited to artist (configurable) |
| Artist | Full refund to veranstalter (configurable) |
| Mutual | Negotiated split |

#### Platform Fees

| Model | Description |
|-------|-------------|
| Deposit | Platform holds deposit until event |
| Prozente | Percentage fee per transaction |
| Abomodell | Subscription-based (Premium tier) |

#### Dispute Resolution

| Step | Action |
|------|--------|
| 1 | Unzufriedenheit reported |
| 2 | Mediation through platform |
| 3 | Änderungen proposed |
| 4 | Resolution or escalation |

### 2.2 Zahlungsmethoden (Payment Methods)

| Method | Integration |
|--------|-------------|
| Kreditkarte | Stripe / Adyen |
| PayPal | PayPal API |
| SEPA | Stripe / Mollie |

**Note:** No invoice/billing option (Bonität risk)

### 2.3 Payment Partners

| Partner | Use Case |
|---------|----------|
| Stripe | Primary payment processor |
| PayPal | Alternative payment |
| Adyen | Enterprise option |
| Mollie | EU-focused alternative |

### 2.4 Steuerberater Access (Accountant Access)

| Feature | Description |
|---------|-------------|
| Zugang | Read-only access for accountants |
| Belege | Receipt/invoice export |
| Kosten | Transaction history |
| Zahlungseingang | Income tracking |
| Kontoabgleich | Bank reconciliation export |
| Partner | LexOffice, DATEV integration |

---

## 3. LEGAL SYSTEM

### 3.1 Versicherung (Insurance)

| Coverage | Description |
|----------|-------------|
| Technik | Equipment insurance |
| Ausfall | Cancellation insurance |
| Kosten | Premium calculations |

### 3.2 Vertragswesen (Contract Management)

| Document | Purpose |
|----------|---------|
| Künstlervertrag | Artist performance contract |
| Nutzungsbedingungen | Platform terms of use |
| Datenschutz | Privacy policy |
| AGB | General terms and conditions |

### 3.3 Partner Integrations

| Partner | Integration |
|---------|-------------|
| LexOffice | Invoice generation, bookkeeping |
| DATEV | Accounting export |

### 3.4 Marktplatz (Marketplace)

| Concept | Implementation |
|---------|----------------|
| Wert und Gegenwert | Clear value exchange |
| Treuhand | Escrow for payments |

---

## 4. BEWERTUNGSSYSTEM (Rating System)

### 4.1 Künstler Ratings (Artist Ratings)

| Category | Description | Scale |
|----------|-------------|-------|
| Zuverlässigkeit | Reliability, punctuality | 1-5 stars |
| Kommunikation | Response time, clarity | 1-5 stars |
| Preis-Leistungsverhältnis | Value for money | 1-5 stars |
| Stimmung | Atmosphere created, energy | 1-5 stars |

### 4.2 Veranstalter Ratings (Organizer Ratings)

| Category | Description | Scale |
|----------|-------------|-------|
| Kommunikation | Clear instructions, responsiveness | 1-5 stars |
| Hospitality | Food, drinks, accommodation quality | 1-5 stars |
| Equipment | Quality of provided equipment | 1-5 stars |
| Ambiente | Venue atmosphere, professionalism | 1-5 stars |

### 4.3 Rating Flow

```
Event Completed
      │
      ▼
Rating Prompt (before payment release)
      │
      ├── Ja (Yes) ────────────────────────┐
      │                                     │
      └── Nein (No) ── Skip ──┐            │
                              │            ▼
                              │   Nachricht? (Optional message)
                              │            │
                              │            ▼
                              │   3-5 Auswahlmöglichkeiten
                              │   (Quick feedback options)
                              │            │
                              │            ▼
                              │   Walkthrough Rating
                              │   (Category by category)
                              │            │
                              ▼            ▼
                         Rating Saved
```

**Inspiration:** Kleinanzeigen (eBay Kleinanzeigen) rating system

### 4.4 Friendliness System

| Level | Requirement | Badge |
|-------|-------------|-------|
| Freundlich | 1+ positive interactions | ⭐ |
| Sehr Freundlich | 5+ positive interactions | ⭐⭐ |
| Besonders Freundlich | 10+ positive interactions | ⭐⭐⭐ |

### 4.5 Calculated Metrics

| Metric | Calculation | Display |
|--------|-------------|---------|
| Antwortrate | Responses / Total inquiries | Percentage |
| Durchschnitt | Average of all ratings | Stars |
| Antwortzeit | Average response time | "Usually responds in X hours" |

### 4.6 Follower Types

| Type | Description |
|------|-------------|
| Fans | Users following artist for updates |
| Veranstalter | Organizers who favorited artist |

---

## 5. WÄHRUNG SYSTEM (Currency/Coins)

### 5.1 Coin Types

| Coin | Symbol | Scope | Pricing |
|------|--------|-------|---------|
| **Bloghead Coin** | BHC | Universal - works for all artists | Higher price |
| **Künstlerhead Coin** | [Artist]HEAD | Specific - only for one artist | Lower price |

### 5.2 Coin Mechanics

#### Value Calculation

```
Initial Value: 1.01€
Value Increase: +0.01€ per new fan
Current Value = 1.01 + (0.01 × total_fans)
```

#### Faktorisierung (Scaling)

| Concern | Solution |
|---------|----------|
| Large fan bases | Factor decreases as fans grow |
| Inflation control | Total supply cap |
| Gesamtvolumen | Limited by total platform fans |

### 5.3 Coin / NFT Properties

| Property | Description |
|----------|-------------|
| Tradeable | Can be transferred between users |
| Value fluctuation | Based on artist popularity |
| Eigene Währung | Self-contained economy |

### 5.4 Künstler Investment

| Feature | Description |
|---------|-------------|
| Investment | Fans can invest in artist coins |
| Value growth | Coin value grows with artist success |
| Early supporter rewards | Higher returns for early investors |

### 5.5 Artist Shop

Artists can offer coin-purchasable items:

| Item Type | Description |
|-----------|-------------|
| Merch | Merchandise (t-shirts, etc.) |
| VR Content | Exclusive virtual experiences |
| Tickets | Event tickets at discount |
| Meeting | Meet & greet opportunities |
| Exclusive Content | Behind-the-scenes, unreleased tracks |

---

## 6. ADDITIONAL SYSTEMS

### 6.1 VR System

| Feature | Description |
|---------|-------------|
| Konzerte Virtuell | Virtual concert experiences |
| Werbematerial | VR promotional content |
| Exklusivcontent | Premium VR content for coin holders |

### 6.2 Fan System

| Feature | Description |
|---------|-------------|
| Social Plattform | Social features (follow, like, share) |
| Ticketsystem | Event ticket purchasing |
| Währung Integration | Coin earning and spending |
| Community | Fan-to-fan interaction |

---

## 7. COMMUNICATION LAYER

### 7.1 Messaging

| Feature | Implementation |
|---------|----------------|
| In-app Chat | Real-time messaging |
| Message History | Persistent conversation logs |
| File Sharing | Images, documents, contracts |
| Read Receipts | Message seen indicators |

### 7.2 Notifications

| Type | Channel |
|------|---------|
| Push | Mobile app notifications |
| Email | Important updates, summaries |
| In-app | Badge counts, notification center |
| SMS | Critical alerts (optional) |

### 7.3 Video/Voice

| Feature | Implementation |
|---------|----------------|
| Video Calls | WebRTC-based |
| Voice Calls | Platform number forwarding |
| Recording | Optional call recording (with consent) |

---

## 8. DATA ARCHITECTURE

### 8.1 Database (Supabase PostgreSQL)

| Schema | Tables |
|--------|--------|
| auth | users, sessions |
| public | profiles, bookings, ratings, etc. |
| finance | transactions, subscriptions, invoices |
| messaging | conversations, messages |
| coins | wallets, transactions |

### 8.2 Storage (Supabase Storage)

| Bucket | Contents |
|--------|----------|
| avatars | Profile images |
| covers | Cover images |
| media | Audio, video content |
| documents | Contracts, invoices |
| ci-assets | Logo, brand assets |

### 8.3 Real-time

| Feature | Implementation |
|---------|----------------|
| Live updates | Supabase Realtime |
| Presence | Online status |
| Typing indicators | Real-time chat features |

---

## 9. SECURITY

### 9.1 Authentication

| Method | Implementation |
|--------|----------------|
| Email/Password | Supabase Auth |
| OAuth | Google, Facebook, Apple |
| 2FA | Optional TOTP |

### 9.2 Authorization

| Level | Implementation |
|-------|----------------|
| Row Level Security | Supabase RLS policies |
| Role-based Access | user_type field |
| Feature flags | Premium vs Basic access |

### 9.3 Data Protection

| Requirement | Implementation |
|-------------|----------------|
| GDPR | EU data residency, consent management |
| Encryption | At-rest and in-transit |
| Audit logs | Action tracking |

---

## 10. INTEGRATIONS

### 10.1 Payment

| Provider | Purpose |
|----------|---------|
| Stripe | Primary payments |
| PayPal | Alternative payments |

### 10.2 Accounting

| Provider | Purpose |
|----------|---------|
| LexOffice | Invoice generation |
| DATEV | Export for accountants |

### 10.3 Calendar

| Provider | Purpose |
|----------|---------|
| Google Calendar | Sync bookings |
| Apple Calendar | Sync bookings |
| iCal | Generic calendar export |

### 10.4 Social

| Provider | Purpose |
|----------|---------|
| Instagram | Profile embed, content sync |
| SoundCloud | Audio embed |
| YouTube | Video embed |
| Spotify | Music links |

---

*Document Version: 1.0*
*Last Updated: November 2024*
