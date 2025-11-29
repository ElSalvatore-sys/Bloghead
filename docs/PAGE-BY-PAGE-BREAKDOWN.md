# Bloghead Page-by-Page Breakdown

Detailed documentation of every element in the design files.
**Source:** `pdf-pages/website-page-01-12-small.jpg`

---

## Page Index

| Page | Type | Purpose |
|------|------|---------|
| 01-03 | Homepage | Complete one-page scrolling website |
| 04-05 | Artists Listing | Browse/filter all artists |
| 06-08 | Artist Profile | Individual artist detail page |
| 09-12 | Auth Modals | Registration and login flows |

---

## Page 01-03: Homepage (Complete Scroll)

**Note:** Pages 01, 02, and 03 show the same homepage. Page 03 shows the navigation dropdown menu open.

### Header (Sticky Navigation)

**Layout:** Logo left, nav center, icons + CTA right

| Element | Type | Label/Content | Action |
|---------|------|---------------|--------|
| Logo | Image | "BlogHead" brush script | Link → Homepage |
| Nav Item | Link | ABOUT | Scroll to About section |
| Nav Item | Link | ARTISTS | Navigate → Artists listing page |
| Nav Item | Link | EVENTS | Scroll to Events section |
| Social Icon | Link | Instagram icon | External → Instagram |
| Social Icon | Link | Facebook icon | External → Facebook |
| Profile Icon | Button | User silhouette | Opens auth modal (if logged out) or profile menu (if logged in) |
| CTA Button | Button | SIGN IN (gradient) | Opens login modal |

**Page 03 Dropdown Menu Contents:**
- "Wir sind noch nicht bereit zu launchen..." (We're not ready to launch yet...)
- Navigation items repeated
- "Member Login"
- "Member Chat"

### Hero Section

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Background | Image | B&W performer with microphone | Full-width, high contrast |
| Tagline | Text | "BE A MEMBER OF" | Small caps, white |
| Logo | Image | "BlogHead" large brush script | Centered, white |
| Gradient Brush | Decorative | Purple→red→salmon line | Below logo |

### About Section

**Section Title:** "ABOUT" (Hyperwave One font)

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Heading | H2 | "OUR GOAL IS TO CONNECT YOU TO YOUR FUTURE!" | White text |
| Image Grid | Images | 4 performer photos with purple accent boxes | Collage layout |
| Subheading | H3 | "EVERY BUSINESS IS ESSENTIAL TO HAVE A PROFESSIONAL USP" | |
| Body Text | Paragraph | Lorem ipsum placeholder | German text about platform benefits |

**Feature Icons Row (3 items):**

| Icon | Label | Description |
|------|-------|-------------|
| Audio waveform | ARTIST PRESENTATION | "Präsentiere dich und deine Musik" |
| Community icon | BOOKKEEPING | "Verwalte deine Finanzen" |
| Calendar icon | GETTING BOOKED | "Werde gebucht und manage Termine" |

**CTA Button:** "JETZT ANMELDEN" (Register now) → Registration modal

### Artists Section

**Section Title:** "ARTISTS" (Hyperwave One font)

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Heading | H2 | "UPGRADE YOUR BUSINESS" | |
| Subheading | H3 | "One of the most important challenges of each artist..." | Body copy about platform value |
| CTA Button | Button | "FIND OUT MORE" (gradient) | → Artists listing page |

**Artist Preview Cards (3 visible):**
Each card shows:
- Profile image
- "MAKE ARTIST" label
- Artist photo thumbnail

**Membership Promo Box:**
| Element | Type | Content |
|---------|------|---------|
| Heading | H3 | "BE A MEMBER. BE A FAN." |
| Subheading | Text | "VORTEILE MEMBER" (Member benefits) |
| List | Bullet points | Benefits list (placeholder text) |

### Events Section

**Section Title:** "EVENTS" (Hyperwave One font)

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Heading | H2 | "READY TO INSPIRE YOU." | |
| Event Image | Image | Performer with guitar | Large featured image |
| Carousel | Slider | Event thumbnails | 3 visible, navigation arrows |
| Prev Arrow | Button | < | Previous slide |
| Next Arrow | Button | > | Next slide |
| Body Text | Paragraph | "HIER STEHT ETWAS ZUM THEMA EVENTS" (placeholder) | |

### VR Experiences Section

**Section Title:** "VR EXPERIENCES" (Hyperwave One font)

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Purple Box | Container | Gradient purple background | Contains VR content |
| Heading | H3 | "HIER STEHT NOCH BLINDTEXT" (placeholder) | |
| Body Text | Paragraph | Placeholder text about VR | |

### Footer

| Element | Type | Content | Action |
|---------|------|---------|--------|
| Gradient Brush | Decorative | Purple→salmon line | Section divider |
| Link | Text | IMPRESSUM | → Legal/Imprint page |
| Link | Text | KONTAKT | → Contact page |
| Link | Text | DATENSCHUTZ | → Privacy policy page |

---

## Page 04-05: Artists Listing Page

**Note:** Pages 04 and 05 show the same page at different scroll positions.

### Header
Same as Homepage header (see above)

### Page Hero

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Background | Image | B&W performer close-up | Full-width banner |
| Title | H1 | "ARTISTS" (Hyperwave One) | Large, centered |
| Gradient Brush | Decorative | Purple→salmon line | Below title |

### Filter Bar

| Filter | Type | Options/Placeholder |
|--------|------|---------------------|
| Genre | Dropdown/Button | "GENRE" |
| Location | Dropdown/Button | "ORT-UMKREIS" (Location-radius) |
| Gig Type | Dropdown/Button | "GIG" |
| Price | Dropdown/Button | "PREIS" (Price) |
| Expand Filters | Button | "FILTER ERWEITERN" (gradient) |

### Artist Cards Grid

**Layout:** 3 columns, responsive

**Card Structure (repeated for each artist):**

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Image | Photo | Artist profile photo | Square, top of card |
| Favorite Icon | Button | Heart outline (top-right of image) | Toggle favorite |
| Name | H3 | "SHANNON CUOMO" (or "KÜNSTLERNAME") | Artist name |
| Category | Text | "DJ, Singer, Performer" | Comma-separated roles |
| Location | Text | "Wiesbaden, Frankfurt und Main" | City/region |
| Price | Text | "PREIS VON BIS 1000 MINDESTBETRAG" | Price range |
| Rating | Stars | 4 out of 5 stars filled | Star rating display |
| CTA Button | Button | "PROFIL ANSEHEN" (View Profile) | → Artist profile page |

**Visible Artists (Page 04-05):**
1. Shannon Cuomo - DJ, Singer, Performer - Wiesbaden - 4 stars
2. Künstlername - [placeholder] - Frankfurt und Main - 3 stars
3. Künstlername - [placeholder] - Hamburg - 4 stars
4. Künstlername - [placeholder] - Berlin - 3 stars
5. Künstlername - [placeholder] - [location] - [rating]
6. Künstlername - [placeholder] - [location] - [rating]
7. Künstlername - [placeholder] - [location] - [rating]
8. Künstlername - [placeholder] - [location] - [rating]
9. Künstlername - [placeholder] - [location] - [rating]

### Registration Prompt Box (Purple)

| Element | Type | Content |
|---------|------|---------|
| Heading | H3 | "NEU BEI BLOGHEAD?" (New to Bloghead?) |
| Input | Text field | Email/username placeholder |
| Button | CTA | "WEITER" (Continue) → Registration flow |

### Footer
Same as Homepage footer

---

## Page 06-08: Artist Profile Page

**Note:** Pages 06, 07, and 08 show the same profile at different scroll positions with slight data variations.

### Header
Same as Homepage header

### Profile Hero

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Cover Image | Photo | Concert crowd/stage | Full-width banner |
| Profile Photo | Image | Circular artist photo | Overlapping cover, left-aligned |
| Artist Name | H1 | "SHANNON CUOMO" | Large, white |
| Role | Text | "DJ, Singer, Performer" | Below name |
| Share Icon | Button | Share/external icon | Top-right |

### Profile Info Grid (2 columns)

**Left Column:**

| Field Label | Value Example |
|-------------|---------------|
| KÜNSTLERNAME | Shannon Cuomo |
| GESCHÄFTSADRESSE STR. 8 | [Address placeholder] |
| STADT | Wiesbaden |
| ARTIST ORT | DJ, München |
| ID-NR. | [ID number] |
| VON BIS FUNK | 200,00€ Pauschal |
| ORT/FUNKTION | 250€ inkl. Anna, Vollsystem, DJ-Kiste |
| BÜCHER/ARTIKEL | Passiv |
| TECHNIK | n/a |
| URL | [links] |

**Right Column:**

| Field Label | Value Example |
|-------------|---------------|
| DJ. SHANNON | [name variant] |
| HIP-HOP, R'N'B, TRI-HOP | Genre tags |
| DEUTSCHLAND | Country |
| DJ, MÜNCHEN | Location variant |
| MINIMUM | [minimum booking] |
| PREIS PRO VERANSTALTUNG/STUNDE | Hourly rate |
| INKL. SETUP, VALENTINE, DJ-ALEX | Included services |
| PASSIV | Status |
| YOUTUBE, INSTAGRAM | Social links |

### Something About Section

| Element | Type | Content |
|---------|------|---------|
| Icon | Decorative | Sparkle/magic icon |
| Heading | H3 | "SOMETHING ABOUT" |
| Body Text | Paragraph | "Hier sollte etwas über den Künstler. Bünge/Feste/Party/Musik. Coole Facts. Was kann ich können. Was mache heute ich am liebsten pur" |

### Audio Section

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Icon | Decorative | Play button circle |
| Heading | H3 | "LISTEN TO ME ON SOUNDCLOUD" | |
| Audio Player | Embed | Waveform visualization | 6 audio tracks visible |
| Tracks | List | Track thumbnails with waveforms | Horizontal scroll |

### Instagram Section

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Icon | Decorative | Instagram icon |
| Heading | H3 | "SEE ME ON INSTAGRAM" (or "INSTAGRAM PROFIL EINGEBUNDEN") |
| Photo Grid | Images | 6 photos (2x3 grid) | Instagram-style thumbnails |

### Calendar Section

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Icon | Decorative | Calendar icon |
| Heading | H3 | "CALENDAR" |
| Calendar Grid | Table | Monthly calendar view | |

**Calendar Structure:**

| Element | Description |
|---------|-------------|
| Header Row | MO, TUE, WED, THU, FRI, SAT, SUN |
| Date Cells | Numbers 1-31 |
| Available Dates | Purple background |
| Booked/Busy Dates | Gray or marked |
| Selected Date | Highlighted with icon |

**Legend/Status Indicators:**
- Purple cell = Available for booking
- Marked cell = Already booked
- Heart icon = Favorited date
- Clock icon = Pending request

### Footer
Same as Homepage footer

---

## Page 09: Registration Modal - Step 1

### Modal Container

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Background | Overlay | Dark semi-transparent | Dims page behind |
| Modal Box | Container | Purple gradient top → dark | Centered, rounded corners |
| Close Button | Button | X icon | Top-right corner |

### Modal Content

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Heading | H2 | "NEU BEI BLOGHEAD?" | Centered |
| Input 1 | Text field | Email/Username placeholder | Full width |
| Input 2 | Password field | Password placeholder | Full width |
| Submit Button | Button | "WEITER" (Continue) - gradient | Full width |
| Link | Text | "Bereits registriert? Anmelden" | → Login modal |

---

## Page 10: Registration Modal - Step 2

### Modal Content

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Heading | H2 | "NEU BEI BLOGHEAD?" | |
| Subheading | Text | "Wähle deine Rolle" (Choose your role) | |

### Account Type Selection (Radio buttons/Cards)

| Option | Label | Description | Notes |
|--------|-------|-------------|-------|
| Option 1 | ARTIST | "Präsentiere dich und werde gebucht" | Gradient border when selected |
| Option 2 | CUSTOMER | "Buche Künstler für dein Event" | |
| Option 3 | EVENT/LOCATION/UNTERNEHMEN | "Verwalte deine Location" | For venues/businesses |
| Option 4 | FAN | "Werde Teil der Community" | Grayed out / different tier |

### Progress Indicator

| Element | Type | Content |
|---------|------|---------|
| Step 1 | Dot | Completed (filled) |
| Step 2 | Dot | Active (highlighted) |
| Step 3 | Dot | Pending (outline) |

### Navigation

| Element | Type | Content |
|---------|------|---------|
| Back Button | Link | "Zurück" (Back) |
| Continue Button | Button | "WEITER" (Continue) - gradient |

---

## Page 11: Registration Modal - Step 3

### Modal Content

| Element | Type | Content |
|---------|------|---------|
| Heading | H2 | "NEU BEI BLOGHEAD?" |
| Subheading | Text | "Willst du uns mehr erzählen? Wofür interessierst du dich? Bleiben wir in Bloghead-Community" |

### Genre Selection (Multi-select checkboxes/badges)

**Visible Genre Options:**
- Hip-Hop
- R'n'B
- Electronic
- House
- Techno
- Pop
- Rock
- Jazz
- Classical
- (more options likely scrollable)

### Additional Fields

| Field | Type | Placeholder |
|-------|------|-------------|
| Name | Text input | "Dein Name" |
| Username | Text input | "Dein Membername" |
| Location | Text input | "Dein Standort" |

### Final CTA

| Element | Type | Content |
|---------|------|---------|
| Submit Button | Button | "JETZT REGISTRIEREN" (Register now) - gradient |
| Terms | Checkbox | "Ich akzeptiere die AGB und Datenschutz" |

---

## Page 12: Login Modal

### Modal Content

| Element | Type | Content | Notes |
|---------|------|---------|-------|
| Heading | H2 | "LETS WORK TOGETHER!" | Different tone from registration |
| Input 1 | Text field | Email/Username | Full width |
| Input 2 | Password field | Password | Full width |
| Submit Button | Button | "LOGIN" - gradient | Full width |
| Forgot Link | Link | "Passwort vergessen?" | Below button |
| Register Link | Text + Link | "Noch kein Account? Registrieren" | → Registration modal |

---

## Navigation Flow Summary

```
Homepage
├── ABOUT (scroll) ────────────────────────────────────────────────┐
├── ARTISTS (link) → Artists Listing Page                          │
│                    ├── Filter (Genre/Ort/Gig/Preis)              │
│                    ├── Artist Card → Artist Profile Page         │
│                    │                 ├── Info Grid               │
│                    │                 ├── Audio Player            │
│                    │                 ├── Instagram Embed         │
│                    │                 ├── Booking Calendar        │
│                    │                 └── [BOOK NOW] → ???        │
│                    └── Registration Box → Registration Modal     │
├── EVENTS (scroll) ───────────────────────────────────────────────┤
├── VR EXPERIENCES (scroll) ───────────────────────────────────────┤
├── SIGN IN → Login Modal                                          │
│             ├── Login Form                                       │
│             └── "Registrieren" → Registration Modal              │
└── Profile Icon → Auth Modal / Profile Menu                       │
                                                                   │
Registration Modal Flow:                                           │
Step 1: Email + Password ────────────────────────────────────────┐ │
Step 2: Account Type Selection                                   │ │
Step 3: Genre + Profile Details                                  │ │
        └── "JETZT REGISTRIEREN" → ??? (Dashboard? Homepage?)    ◄─┘
```

---

## Missing Designs (Not in PDF)

Based on flowchart analysis, these screens are referenced but NOT designed:

| Screen | Purpose | Priority |
|--------|---------|----------|
| User Dashboard | Post-login landing page | HIGH |
| Profile Edit Mode | Edit artist/customer profile | HIGH |
| Booking Request Form | Send booking inquiry | HIGH |
| Booking Management | Accept/reject/track bookings | HIGH |
| Events Listing Page | Standalone events (not just section) | MEDIUM |
| Membership/Payment | Upgrade tiers, coin purchase | MEDIUM |
| Chat Interface | Platform messaging | LOW |
| Invoice/Receipts | LexOffice integration views | LOW |
| Admin Dashboard | Content moderation | LOW |

---

## Build Sequence Recommendation

### Phase 2A: Public Pages (No Auth Required)
1. Homepage (sections already exist in design)
2. Artists Listing Page
3. Artist Profile Page (public view)

### Phase 2B: Auth Flow
4. Login Modal
5. Registration Flow (3 steps)
6. Auth state management

### Phase 2C: Logged-In Experience (Need designs OR assumptions)
7. User Dashboard
8. Profile Edit
9. Booking Flow

---

*Document created: November 2024*
*Source: BlogHead-Website-Ansicht.pdf (12 pages)*
