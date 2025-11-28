# Bloghead Component API Reference

## Component Overview

| Category | Component | Description |
|----------|-----------|-------------|
| **UI** | [Button](#button) | Action buttons with variants |
| **UI** | [Input](#input) | Form text inputs |
| **UI** | [Card](#card) | Content containers |
| **UI** | [ArtistCard](#artistcard) | Artist listing preset |
| **UI** | [Badge](#badge) | Status indicators |
| **UI** | [GenreBadge](#genrebadge) | Selectable genre tags |
| **UI** | [StatusBadge](#statusbadge) | Booking status indicators |
| **UI** | [Modal](#modal) | Dialog overlays |
| **UI** | [AuthModal](#authmodal) | Login/register modal |
| **UI** | [StarRating](#starrating) | Rating component |
| **UI** | [GradientBrush](#gradientbrush) | Decorative gradient |
| **UI** | [SectionDivider](#sectiondivider) | Section separator |
| **Layout** | [Header](#header) | Navigation header |
| **Layout** | [Footer](#footer) | Site footer |
| **Icons** | [Icons](#icons) | 20+ SVG icons |

---

## UI Components

### Button

Primary action component with multiple variants and sizes.

**Import**
```tsx
import { Button } from '@/components/ui'
```

**Props Interface**
```tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}
```

**Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'primary'` | Visual style |
| `size` | `string` | `'md'` | Button size |
| `fullWidth` | `boolean` | `false` | Full width button |
| `disabled` | `boolean` | `false` | Disabled state |
| `children` | `ReactNode` | - | Button content |

**Variants**
| Variant | Description | Visual |
|---------|-------------|--------|
| `primary` | Purple→Red gradient, white text | Main CTA |
| `secondary` | Dark background, white border | Secondary actions |
| `outline` | Transparent, white border | Tertiary actions |
| `ghost` | Transparent, no border | Subtle actions |

**Examples**
```tsx
// Primary button (default)
<Button>Sign Up</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Small outline button
<Button variant="outline" size="sm">Learn More</Button>

// Full width large button
<Button size="lg" fullWidth>Book Now</Button>

// Disabled
<Button disabled>Processing...</Button>
```

**Design Reference:** `styleguide-page-03.png` - "SIGN IN" button example

---

### Input

Form input with label, error, and helper text support.

**Import**
```tsx
import { Input } from '@/components/ui'
```

**Props Interface**
```tsx
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}
```

**Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label |
| `error` | `string` | - | Error message (shows red border) |
| `helperText` | `string` | - | Helper text below input |
| `placeholder` | `string` | - | Placeholder text |
| `type` | `string` | `'text'` | Input type |
| `disabled` | `boolean` | `false` | Disabled state |

**Examples**
```tsx
// Basic input
<Input placeholder="Enter email" />

// With label
<Input label="Email Address" placeholder="you@example.com" />

// With error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// With helper text
<Input
  label="Username"
  helperText="This will be your public display name"
/>

// Disabled
<Input label="Read Only" disabled value="Cannot edit" />
```

**Design Reference:** `website-page-09-small.jpg` - Registration form inputs

---

### Card

Generic content container with variants.

**Import**
```tsx
import { Card } from '@/components/ui'
```

**Props Interface**
```tsx
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}
```

**Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'default'` | Card style |
| `hoverable` | `boolean` | `false` | Hover animation |
| `padding` | `string` | `'md'` | Internal padding |
| `children` | `ReactNode` | - | Card content |

**Examples**
```tsx
// Default card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Elevated with hover effect
<Card variant="elevated" hoverable>
  <h3>Interactive Card</h3>
</Card>

// No padding (for custom layouts)
<Card padding="none">
  <img src="..." className="w-full" />
</Card>
```

---

### ArtistCard

Pre-styled card for artist listings.

**Import**
```tsx
import { ArtistCard } from '@/components/ui'
```

**Props Interface**
```tsx
interface ArtistCardProps {
  image?: string
  name: string
  category: string
  location: string
  rating: number
  price?: string
  onViewProfile?: () => void
  onFavorite?: () => void
  isFavorite?: boolean
}
```

**Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `string` | - | Profile image URL |
| `name` | `string` | **required** | Artist name |
| `category` | `string` | **required** | "DJ, Singer, Performer" |
| `location` | `string` | **required** | "Berlin, Germany" |
| `rating` | `number` | **required** | 1-5 star rating |
| `price` | `string` | - | Starting price "ab 200€" |
| `onViewProfile` | `function` | - | View profile callback |
| `onFavorite` | `function` | - | Favorite toggle callback |
| `isFavorite` | `boolean` | `false` | Favorite state |

**Example**
```tsx
<ArtistCard
  image="/artists/shannon.jpg"
  name="Shannon Cuomo"
  category="DJ, Singer, Performer"
  location="Berlin, Germany"
  rating={4}
  price="200€"
  isFavorite={true}
  onViewProfile={() => navigate(`/artist/${id}`)}
  onFavorite={() => toggleFavorite(id)}
/>
```

**Design Reference:** `website-page-04-small.jpg` - Artist listing grid

---

### Badge

Status and category indicators.

**Import**
```tsx
import { Badge } from '@/components/ui'
```

**Props Interface**
```tsx
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
}
```

**Variants**
| Variant | Background | Text Color | Use Case |
|---------|------------|------------|----------|
| `default` | Dark gray | Gray | Neutral tags |
| `primary` | Purple/20% | Purple | Highlighted info |
| `success` | Green/20% | Green | Confirmed states |
| `warning` | Salmon/20% | Salmon | Pending states |
| `error` | Red/20% | Red | Error/cancelled |

**Example**
```tsx
<Badge>Default</Badge>
<Badge variant="primary">Featured</Badge>
<Badge variant="success">Available</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Cancelled</Badge>
```

---

### GenreBadge

Selectable genre tag for filtering.

**Import**
```tsx
import { GenreBadge } from '@/components/ui'
```

**Props Interface**
```tsx
interface GenreBadgeProps {
  genre: string
  selected?: boolean
  onClick?: () => void
}
```

**Example**
```tsx
const [selectedGenres, setSelectedGenres] = useState(['Hip-Hop'])

{genres.map(genre => (
  <GenreBadge
    key={genre}
    genre={genre}
    selected={selectedGenres.includes(genre)}
    onClick={() => toggleGenre(genre)}
  />
))}
```

**Design Reference:** `website-page-11-small.jpg` - Genre selection in registration

---

### StatusBadge

Booking status indicator with predefined states.

**Import**
```tsx
import { StatusBadge } from '@/components/ui'
```

**Props Interface**
```tsx
interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}
```

**Status Mapping**
| Status | Label | Color |
|--------|-------|-------|
| `pending` | Ausstehend | Warning (salmon) |
| `confirmed` | Bestätigt | Success (green) |
| `cancelled` | Storniert | Error (red) |
| `completed` | Abgeschlossen | Primary (purple) |

**Example**
```tsx
<StatusBadge status="pending" />    // Shows "Ausstehend"
<StatusBadge status="confirmed" />  // Shows "Bestätigt"
```

---

### Modal

Base modal dialog component.

**Import**
```tsx
import { Modal } from '@/components/ui'
```

**Props Interface**
```tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg'
}
```

**Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | **required** | Modal visibility |
| `onClose` | `function` | **required** | Close callback |
| `title` | `string` | - | Modal header title |
| `size` | `string` | `'md'` | Modal width |
| `children` | `ReactNode` | **required** | Modal content |

**Features**
- Closes on backdrop click
- Closes on Escape key
- Prevents body scroll when open
- Purple gradient header effect

**Example**
```tsx
const [showModal, setShowModal] = useState(false)

<Button onClick={() => setShowModal(true)}>Open Modal</Button>

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Booking"
  size="sm"
>
  <p>Are you sure you want to book this artist?</p>
  <div className="flex gap-3 mt-4">
    <Button variant="ghost" onClick={() => setShowModal(false)}>
      Cancel
    </Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>
```

**Design Reference:** `website-page-09-small.jpg` through `website-page-12-small.jpg`

---

### AuthModal

Pre-configured modal for authentication flows.

**Import**
```tsx
import { AuthModal } from '@/components/ui'
```

**Props Interface**
```tsx
interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register'
  onModeSwitch?: () => void
}
```

**Example**
```tsx
const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
const [showAuth, setShowAuth] = useState(false)

<AuthModal
  isOpen={showAuth}
  onClose={() => setShowAuth(false)}
  mode={authMode}
  onModeSwitch={() => setAuthMode(prev =>
    prev === 'login' ? 'register' : 'login'
  )}
/>
```

---

### StarRating

Rating display and input component.

**Import**
```tsx
import { StarRating } from '@/components/ui'
```

**Props Interface**
```tsx
interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
}
```

**Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rating` | `number` | **required** | Current rating value |
| `maxRating` | `number` | `5` | Maximum stars |
| `size` | `string` | `'md'` | Star size |
| `interactive` | `boolean` | `false` | Allow clicking |
| `onChange` | `function` | - | Rating change callback |

**Examples**
```tsx
// Display only
<StarRating rating={4} />

// Interactive
const [rating, setRating] = useState(0)
<StarRating
  rating={rating}
  interactive
  onChange={setRating}
  size="lg"
/>
```

**Design Reference:** `styleguide-page-06.png` - Star icons (outline/filled)

---

### GradientBrush

Decorative gradient line element.

**Import**
```tsx
import { GradientBrush, SectionDivider } from '@/components/ui'
```

**Props Interface**
```tsx
interface GradientBrushProps {
  className?: string
  variant?: 'horizontal' | 'diagonal'
  size?: 'sm' | 'md' | 'lg'
}
```

**Examples**
```tsx
// Simple divider
<GradientBrush />

// Large diagonal
<GradientBrush size="lg" variant="diagonal" />

// Custom width
<GradientBrush className="w-64" />

// Section divider (with padding)
<SectionDivider />
```

**Design Reference:** `styleguide-page-03.png` - Gradient brush stroke, `styleguide-page-04.png`

---

## Layout Components

### Header

Main navigation header with mobile support.

**Import**
```tsx
import { Header } from '@/components/layout'
```

**Props Interface**
```tsx
interface HeaderProps {
  onNavigate?: (page: string) => void
  currentPage?: string
}
```

**Features**
- Responsive mobile menu
- Social icons (Instagram, Facebook)
- Integrated auth modal
- Sticky positioning

**Example**
```tsx
<Header
  currentPage="artists"
  onNavigate={(page) => navigate(`/${page}`)}
/>
```

**Design Reference:** `website-page-01-small.jpg` - Header with navigation

---

### Footer

Site footer with links and social icons.

**Import**
```tsx
import { Footer } from '@/components/layout'
```

**Features**
- Gradient brush divider
- Impressum, Kontakt, Datenschutz links
- Social media icons
- Copyright notice

**Example**
```tsx
<Footer />
```

**Design Reference:** `website-page-01-small.jpg` - Footer section

---

## Icons

20+ SVG icons as React components.

**Import**
```tsx
import {
  HeartIcon,
  HeartFilledIcon,
  StarIcon,
  StarFilledIcon,
  CalendarIcon,
  UserIcon,
  InstagramIcon,
  FacebookIcon,
  AudioIcon,
  CommunityIcon,
  UploadIcon,
  DownloadIcon,
  EditIcon,
  CameraIcon,
  PlayIcon,
  NextIcon,
  CoinIcon,
  LinkIcon,
  MenuIcon,
  CloseIcon,
  PlusIcon,
} from '@/components/icons'
```

**Props Interface**
```tsx
interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
}
```

**Example**
```tsx
// Default size (24px)
<HeartIcon />

// Custom size
<StarIcon size={32} />

// With color
<HeartFilledIcon className="text-accent-purple" />

// In button
<Button>
  <HeartIcon size={16} className="mr-2" />
  Favorite
</Button>
```

**Available Icons**

| Icon | Usage |
|------|-------|
| `HeartIcon` / `HeartFilledIcon` | Favorites |
| `StarIcon` / `StarFilledIcon` | Ratings |
| `CalendarIcon` | Booking calendar |
| `UserIcon` | Profile |
| `InstagramIcon` | Social link |
| `FacebookIcon` | Social link |
| `AudioIcon` | Sound/music |
| `CommunityIcon` | Community features |
| `UploadIcon` | File upload |
| `DownloadIcon` | File download |
| `EditIcon` | Edit action |
| `CameraIcon` | Photo upload |
| `PlayIcon` | Media play |
| `NextIcon` | Navigation arrow |
| `CoinIcon` | Coin/payment |
| `LinkIcon` | External link |
| `MenuIcon` | Mobile menu |
| `CloseIcon` | Close/dismiss |
| `PlusIcon` | Add action |

**Design Reference:** `styleguide-page-04.png`, `styleguide-page-05.png`, `styleguide-page-06.png`

---

## Usage Patterns

### Page Layout Pattern
```tsx
import { Header, Footer } from '@/components/layout'
import { GradientBrush } from '@/components/ui'

export function PageTemplate({ children }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12">
        {children}
      </main>
      <Footer />
    </div>
  )
}
```

### Form Pattern
```tsx
import { Input, Button } from '@/components/ui'

export function LoginForm() {
  return (
    <form className="space-y-4 max-w-sm">
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Input label="Password" type="password" />
      <Button fullWidth>Login</Button>
    </form>
  )
}
```

### Card Grid Pattern
```tsx
import { ArtistCard } from '@/components/ui'

export function ArtistGrid({ artists }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {artists.map(artist => (
        <ArtistCard key={artist.id} {...artist} />
      ))}
    </div>
  )
}
```

---

*Last updated: November 2024*
