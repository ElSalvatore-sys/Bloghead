# Bloghead Frontend Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Folder Structure](#folder-structure)
4. [Tech Stack](#tech-stack)
5. [Design System](#design-system)
6. [Component Library](#component-library)
7. [Getting Started](#getting-started)
8. [Git Workflow](#git-workflow)
9. [Code Style Guidelines](#code-style-guidelines)

---

## Project Overview

**Bloghead** is an artist booking platform connecting DJs, singers, and performers with customers for events and bookings. The frontend is built with React, TypeScript, and Tailwind CSS v4, following a custom design system based on the Bloghead brand guidelines.

### Key Features
- Artist discovery and profiles
- Booking system with calendar integration
- User authentication (Artist, Customer, Fan accounts)
- Coin-based payment system
- Event listings and VR experiences

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  Pages          │  Components        │  State/Hooks         │
│  ────────────   │  ──────────────    │  ──────────────      │
│  • Home         │  • UI (Button,     │  • Auth Context      │
│  • Artists      │    Card, Modal)    │  • Custom Hooks      │
│  • Profile      │  • Layout (Header, │  • API Integration   │
│  • Events       │    Footer)         │                      │
│  • Auth         │  • Icons           │                      │
├─────────────────┴──────────────────┴───────────────────────┤
│                    Tailwind CSS v4 Design System            │
├─────────────────────────────────────────────────────────────┤
│                    Vite (Build & Dev Server)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI + Supabase)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
frontend/
├── public/                    # Static assets served as-is
│   └── vite.svg              # Favicon placeholder
│
├── src/
│   ├── assets/               # Bundled assets (processed by Vite)
│   │   └── fonts/            # Custom font files
│   │       ├── HyperwaveOne.woff
│   │       ├── HyperwaveOne.woff2
│   │       ├── Roboto-Bold.ttf
│   │       ├── Roboto-Light.ttf
│   │       ├── Roboto-Medium.ttf
│   │       └── Roboto-Regular.ttf
│   │
│   ├── components/           # Reusable components
│   │   ├── icons/            # SVG icons as React components
│   │   │   └── index.tsx     # All icon exports
│   │   │
│   │   ├── layout/           # Page structure components
│   │   │   ├── Header.tsx    # Navigation header
│   │   │   ├── Footer.tsx    # Site footer
│   │   │   └── index.ts      # Layout exports
│   │   │
│   │   ├── ui/               # Base UI components
│   │   │   ├── Button.tsx    # Button variants
│   │   │   ├── Input.tsx     # Form inputs
│   │   │   ├── Card.tsx      # Card + ArtistCard
│   │   │   ├── Badge.tsx     # Badges (status, genre)
│   │   │   ├── Modal.tsx     # Modal + AuthModal
│   │   │   ├── StarRating.tsx
│   │   │   ├── GradientBrush.tsx
│   │   │   └── index.ts      # UI exports
│   │   │
│   │   └── index.ts          # All component exports
│   │
│   ├── hooks/                # Custom React hooks (future)
│   │   └── (useAuth.ts, useBooking.ts, etc.)
│   │
│   ├── pages/                # Page-level components
│   │   └── ComponentsPreview.tsx  # Design system demo
│   │
│   ├── utils/                # Utility functions (future)
│   │   └── (formatters.ts, validators.ts, etc.)
│   │
│   ├── styles/               # Additional styles (if needed)
│   │
│   ├── App.tsx               # Root application component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles + Tailwind config
│
├── docs/                     # Documentation
│   └── COMPONENTS.md         # Component API reference
│
├── DEVELOPER-GUIDE.md        # This file
├── index.html                # HTML entry point
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite configuration
└── eslint.config.js          # ESLint rules
```

### Where Things Go

| Type | Location | Example |
|------|----------|---------|
| Reusable UI elements | `src/components/ui/` | Button, Input, Card |
| Page layouts | `src/components/layout/` | Header, Footer, Sidebar |
| SVG icons | `src/components/icons/` | HeartIcon, StarIcon |
| Full pages | `src/pages/` | HomePage, ArtistsPage |
| Custom hooks | `src/hooks/` | useAuth, useBooking |
| Utilities | `src/utils/` | formatDate, validateEmail |
| Static assets | `public/` | robots.txt, favicon.ico |
| Bundled assets | `src/assets/` | fonts, images |

---

## Tech Stack

### Core
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 7.x | Build tool & dev server |
| Tailwind CSS | 4.x | Utility-first CSS |

### Key Dependencies
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.6.2",
    "vite": "^7.2.4"
  }
}
```

### Tailwind CSS v4
This project uses **Tailwind CSS v4** which has a new configuration approach:
- Configuration is done in `src/index.css` using `@theme { }` blocks
- No `tailwind.config.js` file needed
- Uses CSS custom properties for theming

---

## Design System

### Colors

```css
/* In src/index.css @theme block */
--color-bg-primary: #171717;      /* Main background */
--color-bg-card: #232323;         /* Card background */
--color-bg-card-hover: #2a2a2a;   /* Card hover state */

--color-accent-purple: #610AD1;   /* Primary accent */
--color-accent-red: #F92B02;      /* Secondary accent */
--color-accent-salmon: #FB7A43;   /* Tertiary accent */
--color-accent-blue: #190AD1;     /* Alternate accent */

--color-text-primary: #FFFFFF;    /* Main text */
--color-text-secondary: rgba(255, 255, 255, 0.7);
--color-text-muted: rgba(255, 255, 255, 0.5);
```

#### Usage in Components
```tsx
// Tailwind classes
<div className="bg-bg-primary">         {/* #171717 */}
<div className="bg-bg-card">            {/* #232323 */}
<div className="bg-accent-purple">      {/* #610AD1 */}
<div className="text-text-primary">     {/* white */}
<div className="text-text-secondary">   {/* white 70% */}
```

### Brand Gradient
The signature Bloghead gradient: Purple → Red → Salmon

```tsx
// Using utility class
<div className="gradient-bloghead">

// Using Tailwind
<div className="bg-gradient-to-r from-accent-purple via-accent-red to-accent-salmon">

// CSS variable
background: linear-gradient(135deg, #610AD1 0%, #F92B02 50%, #FB7A43 100%);
```

### Typography

| Font | Usage | Tailwind Class |
|------|-------|----------------|
| Hyperwave One | Display titles, section headers | `font-display` |
| Roboto | Body text, UI elements | `font-sans` |

```tsx
// Display font (Hyperwave One)
<h1 className="font-display text-5xl">ARTISTS</h1>

// Body font (Roboto)
<p className="font-sans text-base">Regular text</p>
<p className="font-sans font-bold">Bold text</p>
```

### Spacing Scale
Uses Tailwind's default spacing scale with custom additions:

```css
--spacing-section: 6rem;   /* 96px - between sections */
--spacing-card: 1.5rem;    /* 24px - card padding */
```

### Border Radius
```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 1rem;       /* 16px */
--radius-full: 9999px;   /* Full round */
```

---

## Component Library

### Quick Reference

| Component | Import | Description |
|-----------|--------|-------------|
| `Button` | `@/components/ui` | Primary action buttons |
| `Input` | `@/components/ui` | Form text inputs |
| `Card` | `@/components/ui` | Content containers |
| `ArtistCard` | `@/components/ui` | Artist listing card |
| `Badge` | `@/components/ui` | Status indicators |
| `GenreBadge` | `@/components/ui` | Selectable genre tags |
| `Modal` | `@/components/ui` | Dialog overlays |
| `AuthModal` | `@/components/ui` | Login/register modal |
| `StarRating` | `@/components/ui` | Rating display/input |
| `GradientBrush` | `@/components/ui` | Decorative elements |
| `Header` | `@/components/layout` | Navigation header |
| `Footer` | `@/components/layout` | Site footer |

### Example Usage

```tsx
import { Button, Input, Card, Modal } from '@/components/ui'
import { Header, Footer } from '@/components/layout'
import { HeartIcon, StarIcon } from '@/components/icons'

function MyPage() {
  return (
    <>
      <Header />
      <main>
        <Card hoverable>
          <h2>Artist Name</h2>
          <StarRating rating={4} />
          <Button variant="primary">Book Now</Button>
        </Card>
      </main>
      <Footer />
    </>
  )
}
```

See `docs/COMPONENTS.md` for full API documentation.

---

## Getting Started

### Prerequisites
- Node.js 18+ (recommend 20+)
- npm 9+ or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/ElSalvatore-sys/Bloghead.git
cd Bloghead/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server at http://localhost:5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Development Server
```bash
npm run dev

# Output:
#   VITE v7.2.4  ready in 300 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: http://192.168.x.x:5173/
```

---

## Git Workflow

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/short-description` | `feature/artist-profile-page` |
| Bugfix | `fix/short-description` | `fix/modal-close-button` |
| Hotfix | `hotfix/short-description` | `hotfix/auth-redirect` |
| Docs | `docs/short-description` | `docs/api-reference` |
| Refactor | `refactor/short-description` | `refactor/card-component` |

### Commit Message Format

```
type: short description

- Detailed point 1
- Detailed point 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting (no code change)
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

### Workflow

1. Create feature branch from `main`
2. Make changes
3. Run `npm run build` to verify no errors
4. Commit with descriptive message
5. Push and create PR
6. Request review

---

## Code Style Guidelines

### TypeScript

```tsx
// ✅ Use type imports for types only
import { useState, type ReactNode } from 'react'

// ✅ Define interfaces for props
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

// ✅ Use functional components with explicit return types
export function Button({ variant = 'primary', children }: ButtonProps) {
  return <button className={`btn btn-${variant}`}>{children}</button>
}

// ✅ Use forwardRef for components that need ref forwarding
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => <input ref={ref} {...props} />
)
```

### Component Structure

```tsx
// 1. Imports
import { useState, type ReactNode } from 'react'

// 2. Types/Interfaces
interface MyComponentProps {
  title: string
  children?: ReactNode
}

// 3. Constants (if any)
const VARIANTS = ['primary', 'secondary'] as const

// 4. Component
export function MyComponent({ title, children }: MyComponentProps) {
  // Hooks first
  const [state, setState] = useState(false)

  // Event handlers
  const handleClick = () => setState(true)

  // Render
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  )
}

// 5. Display name (for forwardRef components)
MyComponent.displayName = 'MyComponent'
```

### Tailwind CSS

```tsx
// ✅ Group related classes
<div className="
  flex items-center justify-between    /* Layout */
  px-4 py-2                            /* Spacing */
  bg-bg-card rounded-lg                /* Visual */
  hover:bg-bg-card-hover               /* States */
  transition-colors duration-200       /* Animation */
">

// ✅ Use template literals for dynamic classes
<button className={`
  btn
  ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
  ${fullWidth ? 'w-full' : ''}
`}>

// ❌ Avoid inline styles when Tailwind can do it
<div style={{ marginTop: '16px' }}>  // Bad
<div className="mt-4">               // Good
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx`, `ArtistCard.tsx` |
| Hooks | camelCase with "use" prefix | `useAuth.ts`, `useBooking.ts` |
| Utilities | camelCase | `formatDate.ts`, `validators.ts` |
| Constants | SCREAMING_SNAKE_CASE | `API_ENDPOINTS.ts` |
| Types | PascalCase | `types.ts` or inline |

---

## Questions?

- Check the [Component API Reference](./docs/COMPONENTS.md)
- Review the [PROJECT-ANALYSIS.md](../PROJECT-ANALYSIS.md) for design specs
- Contact the team lead for architecture questions

---

*Last updated: November 2024*
