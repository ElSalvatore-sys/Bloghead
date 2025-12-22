# Changelog

All notable changes to the Bloghead frontend will be documented in this file.

## [0.5.0] - 2024-12-22

### Added
- **Interactive Map Feature** - Discover artists by location with Leaflet
- `ArtistMapLeaflet` component with dark theme and custom markers
- Category-based marker colors and emojis (DJ, Band, Singer, etc.)
- Glassmorphism popup cards with artist info
- `ViewToggle` component for grid/map switching
- `mapService.ts` with location utilities
- German city coordinates lookup (80+ cities)
- User location detection with geolocation API
- Demo artists with sample locations

### Changed
- Profile fetch timeout increased from 5s to 10s
- ArtistsPage now supports both grid and map views

### Fixed
- Removed debug console.log statements from mapService
- Map popup arrow tip removed for cleaner design

## [0.4.0] - 2024-12-17

### Added
- **Stripe Payment Integration**
- Stripe Connect for artist onboarding
- Coin purchase system with SEPA/Giropay
- Payment components (CheckoutForm, CoinPurchaseModal)
- 8 Supabase Edge Functions for payments
- Webhook handling for Stripe events

### Changed
- Animation system with Framer Motion
- Modal animations with step transitions

## [0.3.0] - 2024-12-15

### Added
- **Supabase Backend Integration**
- User authentication (email + OAuth)
- Artist profiles with real data
- File storage for images and audio
- Row Level Security policies

## [0.2.0] - 2024-12-10

### Added
- **Complete Frontend UI**
- All pages: Home, Artists, Events, About, Profile
- 26+ reusable components
- Dark theme with Hyperwave branding
- Mobile-responsive design

## [0.1.0] - 2024-12-05

### Added
- Initial project setup
- React + Vite + TypeScript
- TailwindCSS configuration
- Git repository connected
