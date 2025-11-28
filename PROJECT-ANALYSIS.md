# Bloghead Project Analysis

## Overview
**Bloghead** is a platform connecting artists (DJs, singers, performers) with customers/fans for bookings and events. The tagline is "BE A MEMBER OF BLOGHEAD". The design features a dark theme with purple-to-red gradient accents.

---

## 1. Folder Structure

```
Bloghead/
├── BlogHead_Styleguide.pdf          # Brand guidelines (495 KB)
├── BlogHead-FLOWChart.pdf           # User flow diagram (53 KB)
├── BlogHead-Website-Ansicht.pdf     # Full website mockups (24.5 MB)
├── Fonts/
│   ├── MyFontsWebfontsKit/          # Hyperwave One font (licensed WOFF/WOFF2)
│   └── Roboto/                      # Google Webfont (13 weights)
├── Logo BlogHead/
│   ├── Logo-Bloghead-Claim-white.eps
│   └── Logo-Bloghead-white.eps
├── SVG/                             # 27 icon assets
├── Bilder Website Vorläufig/        # 19 stock photos for mockups
└── pdf-pages/                       # Converted PNG pages
    ├── styleguide-page-01-06.png
    ├── flowchart-page-01.png
    └── website-page-01-12.png
```

---

## 2. Styleguide Summary

### Logo Variants
- **Logo ohne Claim**: "BlogHead" standalone wordmark (white, brush script style)
- **Logo mit Claim**: "BE A MEMBER OF BlogHead" with tagline above

### Color Palette
| Color | RGB | Hex | Usage |
|-------|-----|-----|-------|
| White | 255, 255, 255 | #FFFFFF | Text, logos |
| Purple | 97, 10, 209 | #610AD1 | Primary accent, gradient start |
| Dark Gray | 23, 23, 23 | #171717 | Background |
| Red | 249, 43, 2 | #F92B02 | Gradient middle, CTA buttons |
| Salmon | 251, 122, 67 | #FB7A43 | Gradient end |
| Blue | 25, 10, 209 | #190AD1 | Secondary accent |

### Gradient (Verlauf)
- **Brush stroke gradient**: Purple (#610AD1) → Red (#F92B02) → Salmon (#FB7A43)
- Used for: Section dividers, button backgrounds, decorative elements
- Background opacity: 60% of RGB(25, 10, 209)

### Typography
| Use | Font | Weight |
|-----|------|--------|
| Display/Section Titles | Hyperwave One | Regular |
| Headlines | Roboto | Bold |
| Body Copy | Roboto | Regular |

- **Hyperwave One**: Licensed WOFF/WOFF2 (brush script for "ARTISTS", "EVENTS", etc.)
- **Roboto**: Google Webfont (all 13 weights available)

### Icons
- **Header icons**: Facebook, Instagram, Profile, Bloghead "B" logo, gradient brush stroke
- **About section**: Audio waveform, Community network, Calendar, Plus/Add, Profile
- **Profile editing**: Sparkle/magic, Link, Upload, Download, Next arrow, Microphone, Edit/pencil, Star (outline/filled), Heart (outline/filled purple), Instagram, Profile circle, Play, Camera

---

## 3. Flowchart Structure (User Flow)

### User States
1. **Bloghead ohne Registrierung** (Without Registration)
2. **Bloghead Registrierung (Basic)** (Basic Registration)
3. **Bloghead mit Registrierung** (With Registration)
4. **Active Member**

### Main Sections
- **STARTSEITE** (Homepage): About, Artists, Events, VR Experiences, Sign In
- **ABOUT**: Was wir tun, Blogheads, Benefits, Coins USP
- **ARTISTS**: Filter by Name/Ort/Genre, Sterne/Bewertung, Profil ansehen
- **EVENTS**: Events listing, VR Events

### Member Registration Flow
1. **Member Werden** (Become Member)
   - Artist (SELL) path
   - Customer (BUY) path
   - Event/Location/Unternehmen/Einzel Person
   - Member (FAN) - free of charge

2. **Registration Fields**:
   - Name, Vorname, EMAIL, Membername, Passwort
   - Anmelden mit Google/Facebook option

### Artist Profile Fields
- Künstlername, Standort, Genre
- Something about me (Bio)
- Budget/Stunde, Band
- Tagged with..., Technik (TW)
- Audio (Hörprobe)
- SoMe Links (Insta-Profil)/Pictures
- Calendar (Uhrzeit-Fkt)
- Free for Booking (Texting)
- Favoritenliste

### Membership Tiers
- **AGBs** → Haftungsausschuss
- **Mitgliedsbeitrag**:
  - Basic
  - Premium (LexOffice)
  - Vertrag (12 Monate)
  - Bonus
  - Startcoins
  - Free LexOffice

### Profile Data Fields
- Name, Vorname, Künstlername
- Adresse, Telefonnummer, Mail
- Geburtsdatum, Firmenname (Rechnung)
- Steuernummer, Kleinunternehmer-Regelung (ja/nein)
- Buchbar ab XX €, Jobbezeichnung
- Genre, Region, Tagged with
- TechWriter (individual), Angaben Technik
- SoMe/Galerie, Audio
- Veranstaltungen, Newsletter
- Something about me (Bio, Coole Facts, was ich kann und was ich liebe...)
- **Coins**: Starter 10 Coins, Personal 50 Coins, Team 100 Coins

### Additional Tools
- Buchungsanfragen: Annehmen, Verhandeln, Ablehnen
- Buchungen (eigenes System): offene Buchungen, Abgeschlossene Buchungen, Storniert, Buchungsstatus
- Einnahmen Gesamt/Jahr (Counter)
- Support-Tickets
- Einzahlungen Coins, Transaktionsverlauf
- Rechnungen (LexOffice): Rechnungserstellung, Rechnungsarchiv
- Chat (Plattform)

### Booking System
- Option for booking (Pflichtfelder):
  - Vor-/Name, Ort, Datum
  - Zeitraum (Uhrzeit)
  - Budget, Technik vorhanden ja/nein
  - Option freier Text
- Profile sorting: nach meist gebucht o. gesucht
- Mehrere Buchungen am Tag
- Ausgebucht-Fkt

---

## 4. Website Screens (12 Pages)

### Page 01-03: Homepage (Full Scroll)
**Header**: BlogHead logo, Navigation (ABOUT, ARTISTS, EVENTS), Social icons (Instagram, Facebook), Profile icon, Sign In button (purple/red gradient)

**Hero Section**:
- "BE A MEMBER OF BlogHead" with large logo
- Black & white performer image background

**About Section**:
- "OUR GOAL IS TO CONNECT YOU TO YOUR FUTURE!"
- Image collage with purple accent boxes
- "EVERY BUSINESS IS ESSENTIAL TO HAVE A PROFESSIONAL USP"
- Three feature icons: Artist Presentation, Bookkeeping, Getting Booked

**Artists Section**:
- "UPGRADE YOUR BUSINESS" headline
- Artist cards with heart icons
- "BE A MEMBER. BE A FAN." subtitle
- "VORTEILE MEMBER" benefits list

**Events Section**:
- "READY TO INSPIRE YOU." headline
- Event image carousel with navigation arrows
- "HIER STEHT ETWAS ZUM THEMA EVENTS"

**VR Experiences Section**:
- "HIER STEHT NOCH BLINDTEXT"
- Purple gradient box with VR content

**Footer**: Impressum, Kontakt, Datenschutz links

### Page 04-05: Artists Listing Page
- Filter tabs: Genre, Ort-Umkreis, Gig, Preis, Filter erweitern
- Artist cards in 3-column grid:
  - Profile image
  - Artist name (e.g., "SHANNON CUOMO")
  - Category: "DJ, Singer, Performer"
  - Location
  - Price info
  - Star rating
  - "PROFIL ANSEHEN" (View Profile) button

- "NEU BEI BLOGHEAD?" signup prompt box (purple)

### Page 06-08: Artist Profile Page
**Profile Header**:
- Cover image (concert crowd)
- Profile photo (circular)
- Artist name: "SHANNON CUOMO"
- Role: "DJ, Singer, Performer"

**Profile Details Grid**:
| Field | Value |
|-------|-------|
| Artist Name | Shannon Cuomo |
| Geschäftsadresse Str. 8 | Hip-Hop, R'n'B, Tri-Hop |
| Stadt/Wiesbaden | Deutschland |
| Artist Ort | DJ, München |
| ID-Nr. | Minimum |
| Von bis Funk | 200,00€ Pauschal |
| Ort/Funktion | 250€ inkl. Anna, Vollsystem, DJ-Kiste |
| Bücher/Artikel | Passiv |
| Technik | n/a |
| URL | YouTube, Instagram |

**Sections**:
- "SOMETHING ABOUT" - Bio text
- "LISTEN TO ME ON SOUNDCLOUD" - Audio player embed
- "SEE ME ON INSTAGRAM" - Photo grid (6 images)
- "CALENDAR" - Monthly booking calendar with availability markers

### Page 09: Registration Modal (Step 1)
- "NEU BEI BLOGHEAD?" header
- Email/Username input field
- Password field
- "Weiter" (Continue) button
- Link to sign in for existing members

### Page 10: Registration Modal (Step 2)
- Account type selection:
  - Artist
  - Customer
  - Event/Location/Unternehmen
  - Fan (greyed out)
- Progress indicator

### Page 11: Registration Modal (Step 3)
- "NEU BEI BLOGHEAD?"
- "Willst du uns mehr erzählen? Wofür interessierst du dich? Bleiben wir in Bloghead-Community"
- Genre selection checkboxes
- "Jetzt registrieren" button

### Page 12: Login Modal
- "LETS WORK TOGETHER!"
- Email/Username input
- Password input
- "Login" button
- Forgot password link

---

## 5. Complete Asset Inventory

### SVG Icons (27 files)
```
SVG/
├── icon_aboutme_48px.svg         # Profile/about icon
├── icon_audio_48px.svg           # Audio waveform
├── icon_bookkeeping_48px.svg     # Bookkeeping/accounting
├── icon_calendar_48px.svg        # Calendar
├── icon_camera_48px.svg          # Camera
├── icon_coin_48px.svg            # Coin/currency
├── icon_community_48px.svg       # Community network
├── icon_download_48px.svg        # Download arrow
├── icon_edit_48px.svg            # Edit pencil
├── icon_heart_48px.svg           # Heart outline
├── icon_heart_full_48px.svg      # Heart filled
├── icon_ifb_48px.svg             # Facebook icon
├── icon_insta_48px.svg           # Instagram icon
├── icon_instaprofil_48px.svg     # Instagram profile
├── Icon_link_connect_48px.svg    # Link connected
├── Icon_link_connect_grey_48px.svg
├── Icon_link_disconnect_48px.svg # Link disconnected
├── Icon_link_disconnect_grey_48px.svg
├── icon_next_48px.svg            # Next arrow
├── icon_onair_48px.svg           # On air/live
├── icon_picture_48px.svg         # Picture/image
├── icon_profil_48px.svg          # Profile
├── icon_sound_48px.svg           # Sound/audio
├── icon_star-full_48px.svg       # Star filled
├── icon_star-outline_48px.svg    # Star outline
├── icon_upload_48px.svg          # Upload arrow
└── Verlauf-Highlight.svg         # Gradient brush stroke
```

### Fonts
```
Fonts/
├── MyFontsWebfontsKit/
│   ├── MyFontsWebfontsKit.css    # Font face definitions
│   ├── StartHere.html            # Font preview
│   └── webFonts/                 # WOFF/WOFF2 files
└── Roboto/
    ├── Roboto-Thin.ttf
    ├── Roboto-ThinItalic.ttf
    ├── Roboto-Light.ttf
    ├── Roboto-LightItalic.ttf
    ├── Roboto-Regular.ttf
    ├── Roboto-Italic.ttf
    ├── Roboto-Medium.ttf
    ├── Roboto-MediumItalic.ttf
    ├── Roboto-Bold.ttf
    ├── Roboto-BoldItalic.ttf
    ├── Roboto-Black.ttf
    ├── Roboto-BlackItalic.ttf
    └── LICENSE.txt
```

### Logo Files
```
Logo BlogHead/
├── Logo-Bloghead-Claim-white.eps   # With "BE A MEMBER OF" tagline
└── Logo-Bloghead-white.eps         # Standalone wordmark
```

### Stock Photos (19 images)
```
Bilder Website Vorläufig/
├── 0df1b407-55a7-4251-99e9-b54723369de6.jpeg
├── alexander-popov-f3e6YNo3Y98-unsplash.jpg
├── alexandre-st-louis-IlfpKwRMln0-unsplash.jpg
├── chris-zhang-8mxOt6h9gN4-unsplash.jpg
├── curtis-potvin-XBqp-UxhCVs-unsplash.jpg
├── flavio-gasperini-QO0hJHVUVso-unsplash.jpg
├── german-lopez-sP45Es070zI-unsplash.jpg
├── jazmin-quaynor-8ALMAJP0Ago-unsplash.jpg
├── joshua-fuller-ta7rN3NcWyM-unsplash.jpg
├── latrach-med-jamil-VD0LgaqFf4U-unsplash.jpg
├── leonardo-zorzi-vVtkT4ny8hM-unsplash.jpg
├── luis-reynoso-J5a0MRXVnUI-unsplash.jpg
├── miguel-davis-V6K83zGHkUE-unsplash.jpg
├── minh-pham-jSAb1ifwf8Y-unsplash.jpg
├── niclas-moser-OjWNwULqFek-unsplash.jpg
├── pexels-luis-quintero-2091383.jpg
├── pexels-wendy-wei-1699161.jpg
├── SW-jazmin-quaynor-8ALMAJP0Ago-unsplash.jpg  # B&W version
└── thiago-borrere-alvim-bf8APnBxoCk-unsplash.jpg
```

---

## 6. Key Features Summary

### Core Platform Features
1. **Artist Profiles**: Detailed profiles with booking calendar, audio samples, social links
2. **Customer/Fan Accounts**: Browse and book artists
3. **Event Listings**: Including VR experiences
4. **Booking System**: Request-based with negotiation options
5. **Coin System**: Internal currency (10/50/100 coin tiers)
6. **Rating System**: Star-based artist ratings

### Membership Tiers
- **Basic**: Free registration
- **Premium**: LexOffice integration for invoicing
- **Team**: Higher coin allocation

### Integration Points
- Google/Facebook OAuth login
- LexOffice for invoicing
- Soundcloud for audio
- Instagram for social proof
- Calendar integration

---

## 7. Technical Notes for Implementation

### Design Specifications
- **Dark mode only** - Background: #171717
- **Primary gradient**: Use CSS linear-gradient from #610AD1 to #F92B02 to #FB7A43
- **Border radius**: Rounded corners on cards and buttons
- **Card design**: Dark cards (#232323) with subtle shadows

### Responsive Considerations
- Homepage: Single column sections
- Artist grid: 3 columns → 2 columns → 1 column
- Navigation: Hamburger menu on mobile

### Font Loading
```css
/* Hyperwave One - Display font */
@font-face {
  font-family: 'Hyperwave One';
  src: url('fonts/hyperwave-one.woff2') format('woff2');
}

/* Roboto - UI font */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap');
```

### Color Variables
```css
:root {
  --bg-primary: #171717;
  --bg-card: #232323;
  --accent-purple: #610AD1;
  --accent-red: #F92B02;
  --accent-salmon: #FB7A43;
  --text-primary: #FFFFFF;
}
```

---

## 8. Documentation Index

All project documentation is centralized in the `/docs` folder.

**Documentation Hub:** [docs/README.md](./docs/README.md)

| Document | Purpose | Audience |
|----------|---------|----------|
| [PROJECT-ANALYSIS.md](./PROJECT-ANALYSIS.md) | Design analysis, screen breakdown, asset inventory | All team members |
| [docs/DEVELOPER-GUIDE.md](./docs/DEVELOPER-GUIDE.md) | Architecture, setup, coding standards | Developers |
| [docs/COMPONENTS.md](./docs/COMPONENTS.md) | Component API reference | Developers |
| [docs/DESIGN-IMPLEMENTATION-REPORT.md](./docs/DESIGN-IMPLEMENTATION-REPORT.md) | Implementation status, design-to-code mapping | UI/UX designers |

### Quick Links

- **Start developing**: `cd frontend && npm run dev`
- **View all components**: `http://localhost:5173` (ComponentsPreview page)
- **Component imports**: `import { Button, Card } from '@/components/ui'`
- **Icon imports**: `import { HeartIcon, StarIcon } from '@/components/icons'`

---

*Generated: November 2024*
