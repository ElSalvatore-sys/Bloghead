# Bloghead Product Specifications

## Overview

Bloghead is a platform connecting 4 user groups in the events/entertainment industry.

---

## Homepage Structure & Content

**General Layout:**
- Left side: Dedicated advertising space (revenue generation)
- Main area: Clear presentation of the 4 user groups and a central call-to-action button

### User Group Selection:
1. **Community** (Fans)
2. **Artists**
3. **Service Providers**
4. **Event Organizers**

**Option:** Each group features a short explainer video introducing its role within the ecosystem.

**Central Button:** "Become a member" (or "Join Now")
- When clicked, a dropdown menu opens where the user selects their membership type

**Navigation:**
- Clicking on any group opens a dedicated page with tailored search tools and content
- Example: Service provider page → search by category (Hairdresser, lighting, sound, security, etc.)
- **Login Button** in the top right corner for existing users
- **Footer** includes: Imprint, Contact, Privacy Policy

---

## Registration Process - All User Groups

### Common Structure (All users go through same base flow):
1. Username (Membername/Artistname/Companyname)
2. First Name
3. Last Name
4. Email Address
5. Password
6. Confirm Password

### Optional sign-up methods:
- Register via **Google**, **Facebook**, or **Instagram**

### Required checkboxes:
- ✅ Accept **Terms & Conditions** (link to AGB)
- ✅ Optional: Subscribe to **Newsletter / Promotional emails**

### Automated process:
1. After submission, user receives a **confirmation email**
2. Must click the **verification link** (double opt-in)
3. Once verified, automatically redirected to **profile setup**

---

## Category-Specific Registration Differences

### Community / Fan Member
- Username: **Member Name**
- After verification: access to personal profile page

### Artist
- Username: **Artist Name**
- Additional fields:
  - Address
  - Music Genre (Pop, Rock, Jazz, etc.)
  - Tax Number / VAT ID
  - Profession (DJ, Singer, Guitarist, etc.)
  - Business Type (Sole Trader, GbR, GmbH, etc.)
  - Phone Number (optional – for booking releases)

### Service Provider
- Username: **Company Name**
- Additional fields:
  - Industry
  - Address
  - VAT ID
  - Business Type
  - Phone Number (**required**)

### Event Organizer
- Username: **Company Name**
- Same process as Service Provider

---

## Profile Setup - User Groups

### Community / Fan Member Profile

**Optional fields:**
- Upload Profile Picture
- Location (City + Country)
- Social Media Links: Instagram, Facebook, TikTok, Snapchat, YouTube, Personal Website
- About Me: up to 200 characters
- Token Status Display
- Interest Dropdown: select interests or preferred (music) genres, interactions etc.
- Languages: select up to 5

### Artist Profile

**Optional fields:**
- Profile Picture Upload
- Main Location
- Social Media Links
- Music / Podcast Platforms: Spotify, SoundCloud, Apple Music etc.
- Intro Video
- Audio/Video Samples (max 3 videos × 1–2 min)
- Bio / Description (up to ~500 chars)
- Instruments (up to 8 selectable)
- Tech Rider Button (available / required)
- Merchandising Upload or Shop Link
- Artist Tokens for fan purchases
- Band Linking to other Bloghead profiles
- Calendar with color codes: Free, Booked, Unavailable, Reserved/Pending, Open Gigs

### Service Provider Profile

**Optional fields:**
- Profile Picture Upload
- Location (City + Country)
- Social Media & LinkedIn
- Website / Online Shop
- Image Gallery (Services / Portfolio)
- Description (up to 500 chars)
- Calendar Function (same logic as artists)

### Event Organizer Profile

**Same as Service Provider:**
- Profile Picture, Location, Social Links, LinkedIn
- Website / Event Page
- Gallery (past events or calls for artists)

---

## Event Planner Flow

The organizer profile focuses less on public presentation and more on **event creation and management**.

### Event Creation

**"Plan Your Event"** - A survey/guided setup begins:

**Step 1 – Event Type**
- User selects from pre-defined categories: wedding, company party, birthday, concert, film premiere, etc.

**Step 2 – Smart AI Setup**
- Once category is selected, AI module generates a **personalized checklist/survey flow** based on:
  - Number of guests
  - Date and time
  - Catering preference (buffet, à la carte, etc.)
  - Indoor or outdoor venue
  - Budget range
- AI provides a **"cheat-sheet style" planning guide**, listing all required elements

### Search and Matching

**Service Grid "Waffle View"** where organizer selects needed service categories:
- 🎵 Musician / DJ
- 🍽️ Caterer
- 💇 Hairstylist
- 🎪 Venue / Location
- 💐 Florist
- 🛡️ Security
- 🎭 Decorator
- ...and more

### Filters

Once a category (e.g., Caterer) is selected, a **filter panel** opens:
- Number of guests to serve
- Cuisine type (Italian, Asian, buffet, etc.)
- Price range
- Date availability (based on previously entered event date)
- Distance / radius (e.g., "100 km around Frankfurt")

System returns all matching **registered providers** within radius who are available and fit filters.

### Display Logic

Results displayed in order of relevance:
1. **Newcomers first** (highlighted – no ratings yet)
2. Then by **average rating** (highest first: 4.8⭐ → 4.6⭐ → ...)

Each card shows:
- Provider name and category
- Profile image
- Short description
- Rating average
- Location

### Provider Detail View

Clicking a provider opens their full profile page:
- Uploaded photos and videos
- Description / services
- Capacity (max guests served)
- Contact details
- Rating & reviews
- **"Send Inquiry"** button

### Inquiry & Notification Flow

When organizer clicks **"Send Inquiry"**, a pop-up form opens:
- Event date and time
- Number of guests
- Price per person or budget estimate
- Optional notes

Upon submission:
- Provider receives an **automatic notification** with full request details
- Provider can respond via dashboard (accept, decline, or propose alternative)

### Optional Add-Ons
- Automatic AI suggestions for additional services
- Saved searches for repeated or future events
- Progress tracker: marks which service types have been booked or are pending

---

## Organizer–Service Provider Interaction Flow

### Inquiry Notification
- When organizer sends inquiry, **service provider receives notification**
- Provider reviews request and decides whether it can be fulfilled

### Offer Creation (AI / Automatic)
Provider creates a **formal offer** including:
- Service description
- Pricing details
- Terms & Conditions
- Individual company policies / guidelines
- Offer sent to organizer's **Messagebox**

### Messagebox Functionality

Each user (Organizer & Service Provider) has integrated **Messagebox**:
- Incoming offers and negotiations appear as separate message threads
- Messages can include attachments (PDFs, contracts, images)
- Real-time notifications for new messages or updates

### Organizer Response Options

Upon opening the offer, organizer has **three options**:

1. ✅ **Accept Offer**
   - Booking becomes **legally binding**
   - **SEPA direct debit** automatically initiated
   - Funds held securely by **Bloghead** until service executed

2. ❌ **Decline Offer**
   - Organizer rejects without negotiation
   - Communication thread closes
   - Provider notified that offer was declined

3. 🔁 **Negotiate Offer**
   - Opens **text field** for organizer to propose changes
   - Negotiation message returns to provider's Messagebox
   - Provider can: Accept counter-offer, Decline, or Submit revised offer
   - Loop continues until both parties agree or request is closed

---

## Post-Event Flow

After event date passes:
- Both **Organizer and Provider** receive confirmation prompt:
  - "Did the event and service take place as agreed?"
- Options:
  - ✅ Yes, successfully executed
  - ❌ No, did not take place

### Event Successfully Completed

If both parties confirm "Yes":

**A. Service Rating**
- Organizer rates the service:
  - 1–5 stars
  - Evaluation categories depend on service type
  - Optional short comment (up to 100 characters)

**B. Tip Option**
- Organizer sees **Tip (Gratuity) field**:
  - Free input or suggested options (5%, 10%, 15%)
  - Payment in Euro or **Bloghead Tokens** (if provider accepts crypto)

**C. Invoice & Payment Release**
- System generates **invoice** automatically
- **Funds released** to service provider
- Tip processed in same transaction batch

### Event Not Completed / Disputed

If **either party** clicks "No":
- Case **automatically flagged** to **Bloghead Support Team**
- Payment remains **frozen (escrow locked)** until resolved

**Possible Outcomes:**
- If **service provider at fault**: Funds **refunded** to organizer
- If **organizer canceled** or event failed independently: Funds **released** to provider

Each decision logged, time-stamped, and visible to both parties in Messagebox.

---

## Technical Requirements Summary

### Database Entities Needed:
- Users (with user_type: community, artist, service_provider, event_organizer)
- Profiles (4 different schemas based on user_type)
- Events
- Services
- Inquiries
- Offers
- Messages/Messagebox
- Transactions (SEPA, escrow)
- Ratings/Reviews
- Tokens (Bloghead crypto)

### Key Features:
- Multi-step registration with email verification
- OAuth (Google, Facebook, Instagram)
- Calendar system with availability
- Search with filters (location radius, price, date, category)
- Real-time messaging
- Payment processing with escrow
- AI-powered event planning wizard
- Rating system with categories
- Dispute resolution workflow

---

## Implementation Phases

### Phase 2 (Current): Marketing Website
- Homepage with user group presentation
- Artist browsing and profiles
- Registration/Login modals
- Static pages (About, Events, etc.)

### Phase 3: Backend & Core Platform
- Supabase setup with all database tables
- Authentication (email + OAuth)
- User profile CRUD for all 4 types
- Basic search functionality

### Phase 4: Event Planning & Booking
- Event creation wizard
- Service provider search with filters
- Inquiry system
- Offer creation and negotiation

### Phase 5: Payments & Messaging
- SEPA integration
- Escrow system
- Real-time Messagebox
- Invoice generation

### Phase 6: Post-Event & Advanced
- Rating system
- Tip functionality
- Dispute resolution
- Bloghead Tokens integration
- AI recommendations
