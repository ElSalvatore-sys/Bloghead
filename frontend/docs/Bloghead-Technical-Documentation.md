# Bloghead - Technical Documentation

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Setup Instructions](#setup-instructions)
4. [Architecture Overview](#architecture-overview)
5. [Database Schema](#database-schema)
6. [Component Library](#component-library)
7. [Authentication](#authentication)
8. [API Reference](#api-reference)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3+ | UI Framework |
| TypeScript | 5.6+ | Type Safety |
| Vite | 6.0+ | Build Tool & Dev Server |
| TailwindCSS | 4.0 | Utility-First CSS |
| React Router | 6.28+ | Client-Side Routing |
| Framer Motion | 11.x | Animations |

### Backend (Supabase)
| Service | Purpose |
|---------|---------|
| PostgreSQL | Database |
| Supabase Auth | Authentication (Email + OAuth) |
| Supabase Storage | File Storage (Images, Audio) |
| Supabase Realtime | Real-time Subscriptions |
| Edge Functions | Serverless Functions |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code Linting |
| Vitest | Unit Testing |
| Playwright | E2E Testing |
| Prettier | Code Formatting |

---

## Project Structure

```
Bloghead/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/         # Admin panel components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── layout/        # Layout components (Header, Footer, etc.)
│   │   │   ├── sections/      # Page sections (Hero, Features, etc.)
│   │   │   └── ui/            # Reusable UI components
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions & Supabase client
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin pages
│   │   │   └── dashboard/     # Dashboard pages
│   │   ├── services/          # API service functions
│   │   ├── types/             # TypeScript type definitions
│   │   ├── App.tsx            # Main App component with routes
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── public/
│   │   ├── fonts/             # Custom fonts (Hyperwave One, Roboto)
│   │   └── images/            # Static images
│   ├── docs/                  # Documentation files
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/ElSalvatore-sys/Bloghead.git
cd Bloghead/frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App runs at http://localhost:5173
```

### Environment Variables

Create `.env.local` file:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics
VITE_GA_TRACKING_ID=your_ga_id
```

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:e2e     # Run E2E tests
```

---

## Architecture Overview

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Pages   │  │Components│  │ Contexts │  │  Hooks   │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
│       └─────────────┴─────────────┴─────────────┘           │
│                          │                                   │
│                    ┌─────┴─────┐                            │
│                    │ Services  │                            │
│                    └─────┬─────┘                            │
├──────────────────────────┼──────────────────────────────────┤
│                          │                                   │
│                    ┌─────┴─────┐                            │
│                    │ Supabase  │                            │
│                    │  Client   │                            │
│                    └─────┬─────┘                            │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    Supabase Backend                          │
├──────────────────────────┼──────────────────────────────────┤
│  ┌──────────┐  ┌─────────┴──┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │    Auth    │  │ Storage  │  │ Realtime │  │
│  │    DB    │  │            │  │          │  │          │  │
│  └──────────┘  └────────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Routing Structure

```typescript
// Public Routes (with Header/Footer)
/                    → HomePage
/artists             → ArtistsPage
/artists/:id         → ArtistProfilePage
/events              → EventsPage
/events/:id          → EventDetailPage
/services            → ServiceProvidersPage
/services/:id        → ServiceProviderProfilePage
/about               → AboutPage
/impressum           → ImpressumPage
/kontakt             → KontaktPage
/datenschutz         → DatenschutzPage
/auth/callback       → AuthCallbackPage

// Protected Routes (with Header/Footer)
/profile/edit        → ProfileEditPage

// Dashboard Routes (DashboardLayout, no Header/Footer)
/dashboard/profile   → ProfilePage
/dashboard/settings  → SettingsPage
/dashboard/favorites → FavoritesPage
/dashboard/bookings  → BookingsPage
/dashboard/calendar  → CalendarPage
/dashboard/reviews   → ReviewsPage
/dashboard/stats     → StatsPage
/dashboard/my-events → MyEventsPage
...

// Admin Routes (AdminLayout, AdminGuard)
/admin               → AdminDashboardPage
/admin/users         → AdminUsersPage
/admin/reports       → AdminReportsPage
/admin/announcements → AdminAnnouncementsPage
/admin/tickets       → AdminTicketsPage
/admin/analytics     → AdminAnalyticsPage
```

---

## Database Schema

### Core Tables (38 Total)

#### Users & Authentication
```sql
-- Main users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  membername VARCHAR(50) UNIQUE NOT NULL,
  vorname VARCHAR(100),
  nachname VARCHAR(100),
  user_type VARCHAR(20) NOT NULL, -- 'fan', 'artist', 'service_provider', 'organizer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- ... 30+ additional fields
);

-- Artist profiles
CREATE TABLE artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  kuenstlername VARCHAR(100) NOT NULL,
  genre VARCHAR(50)[],
  preis_ab DECIMAL(10,2),
  -- ... 40+ additional fields
);
```

#### Key Tables Overview
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | All user accounts | email, membername, user_type |
| `artist_profiles` | Artist-specific data | kuenstlername, genre, preis_ab |
| `service_provider_profiles` | Service provider data | service_type, hourly_rate |
| `organizer_profiles` | Event organizer data | company_name, venue_type |
| `events` | Event listings | title, date, location, organizer_id |
| `bookings` | Booking requests | artist_id, event_id, status, price |
| `messages` | Chat messages | sender_id, receiver_id, content |
| `reviews` | User reviews | reviewer_id, reviewee_id, rating |
| `coins` | Virtual currency | user_id, balance, transactions |
| `payments` | Payment records | booking_id, amount, status |

### Row Level Security (RLS)

All tables have RLS enabled:

```sql
-- Example: Users can only read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Example: Artists can update their own profile
CREATE POLICY "Artists can update own profile"
  ON artist_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Component Library

### UI Components

#### Button
```tsx
import { Button } from '@/components/ui/Button'

<Button variant="primary" size="lg" onClick={handleClick}>
  Jetzt buchen
</Button>

// Props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children: React.ReactNode
}
```

#### Input
```tsx
import { Input } from '@/components/ui/Input'

<Input
  type="email"
  label="E-Mail"
  placeholder="ihre@email.de"
  error={errors.email}
  {...register('email')}
/>
```

#### Modal
```tsx
import { Modal } from '@/components/ui/Modal'

<Modal isOpen={isOpen} onClose={handleClose} title="Buchungsanfrage">
  <ModalContent />
</Modal>
```

#### StarRating
```tsx
import { StarRating } from '@/components/ui/StarRating'

<StarRating rating={4.5} maxStars={5} size="md" />
```

### Layout Components

- `Header` - Navigation bar with logo, links, auth buttons
- `Footer` - Site footer with links, legal info
- `Layout` - Public page layout (Header + Outlet + Footer)
- `DashboardLayout` - Dashboard layout with sidebar
- `AdminLayout` - Admin panel layout with navigation

### Section Components

- `Hero` - Landing page hero section
- `Features` - Feature showcase grid
- `Artists` - Artist cards carousel
- `Events` - Event listings
- `MemberCTA` - Membership call-to-action

---

## Authentication

### Supported Methods

1. **Email/Password**
   - Registration with email verification
   - Password reset flow

2. **OAuth Providers**
   - Google
   - Facebook
   - Instagram

### Auth Flow

```typescript
// contexts/AuthContext.tsx
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, metadata: UserMetadata) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Protected Routes

```tsx
// components/auth/ProtectedRoute.tsx
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/" />

  return children
}
```

---

## API Reference

### User Services

```typescript
// services/userService.ts

// Get user profile
const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

// Update user profile
const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
  return { data, error }
}
```

### Artist Services

```typescript
// services/artistService.ts

// Get all artists with filters
const getArtists = async (filters?: ArtistFilters) => {
  let query = supabase.from('artist_profiles').select(`
    *,
    user:users(membername, avatar_url),
    reviews:reviews(rating)
  `)

  if (filters?.genre) query = query.contains('genre', [filters.genre])
  if (filters?.city) query = query.eq('city', filters.city)
  if (filters?.minPrice) query = query.gte('preis_ab', filters.minPrice)
  if (filters?.maxPrice) query = query.lte('preis_ab', filters.maxPrice)

  const { data, error } = await query
  return { data, error }
}
```

### Booking Services

```typescript
// services/bookingService.ts

// Create booking request
const createBooking = async (booking: NewBooking) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single()
  return { data, error }
}

// Update booking status
const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date() })
    .eq('id', bookingId)
  return { data, error }
}
```

---

## Testing

### Unit Tests (Vitest)

- **Framework:** Vitest + React Testing Library
- **Tests:** 304
- **Coverage:** 90%+

```bash
npm run test              # Run unit tests
npm run test:coverage     # Run with coverage report
```

```typescript
// Example: Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### E2E Tests (Playwright)

- **Framework:** Playwright
- **Tests:** 206
- **Browsers:** Chromium, Firefox, Mobile Chrome, Mobile Safari

```bash
npm run test:e2e          # Run all E2E tests (all browsers)
npm run test:e2e:ui       # Run with visual UI
npm run test:e2e:headed   # Run in headed mode (visible browser)
npm run test:e2e:debug    # Debug mode
npm run test:e2e:chromium # Run Chromium only
npm run test:e2e:mobile   # Run mobile browsers only
npm run test:e2e:report   # Show HTML report
```

### E2E Test Files

| File | Coverage |
|------|----------|
| `homepage.spec.ts` | Homepage, hero, auth buttons |
| `auth.spec.ts` | Login/register modals, OAuth |
| `artists.spec.ts` | Artists page, cards, navigation |
| `navigation.spec.ts` | Header/footer navigation |
| `contact.spec.ts` | Contact form validation |
| `legal.spec.ts` | Impressum, Datenschutz |
| `mobile.spec.ts` | Mobile responsiveness |
| `accessibility.spec.ts` | A11y checks (lang, alt, keyboard) |
| `performance.spec.ts` | Load times, console errors |

```typescript
// Example: auth.spec.ts
import { test, expect } from '@playwright/test'

test('opens login modal from header', async ({ page }) => {
  await page.goto('/')
  const loginBtn = page.locator('button:has-text("SIGN IN")')
  await loginBtn.click()
  await expect(page.getByRole('dialog')).toBeVisible()
})
```

### Test Summary

| Type | Count | Coverage |
|------|-------|----------|
| Unit Tests | 304 | 90% Code |
| E2E Tests | 206 | All User Flows |
| **Total** | **510** | **Vollstaendig** |

**Browsers Tested:**
- Chrome (Desktop)
- Firefox (Desktop)
- Chrome (Android/Mobile)
- Safari (iPhone/Mobile)

---

## Deployment

### Development

```bash
npm run dev
# Runs at http://localhost:5173
```

### Production Build

```bash
npm run build
# Output in /dist folder
```

### Vercel (Recommended)

1. Connect GitHub repository
2. Auto-deploys on push to `main`
3. Preview deployments for PRs

### Manual Deployment (Strato/IONOS)

```bash
# Build
npm run build

# Upload to server
scp -r dist/* user@server:/var/www/html/
```

### Performance Metrics

| Metric | Score |
|--------|-------|
| Lighthouse Performance | 93/100 |
| Lighthouse SEO | 100/100 |
| First Contentful Paint | <1.5s |
| Time to Interactive | <3s |
| Bundle Size (gzipped) | ~150KB |

---

## Troubleshooting

### Common Issues

**1. Supabase connection errors**
- Check `.env.local` has correct credentials
- Verify Supabase project is active

**2. Build errors**
- Run `npm install` to ensure all dependencies
- Check TypeScript errors with `npm run lint`

**3. Auth not working**
- Verify OAuth providers are configured in Supabase
- Check redirect URLs in Supabase Auth settings

### Support

- Documentation: `/docs/` folder
- GitHub Issues: Report bugs and feature requests
- Contact: Development team

---

*Technical Documentation - Bloghead v1.0*
*Last Updated: December 2024*
