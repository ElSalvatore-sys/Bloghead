# Changelog

All notable changes to the Bloghead frontend will be documented in this file.

## [0.11.0] - 2024-12-26

### Added
- **Comprehensive Documentation**
- `docs/PROJECT-STATUS.md` - Current project status and metrics
- `docs/PHASE-SUMMARIES.md` - Detailed phase implementation summaries
- Updated `README.md` with badges, quick start, and project overview

## [0.10.1] - 2024-12-25

### Fixed
- **Accessibility Improvements**
- Color contrast fix for header links (2.11:1 → 7:1)
- Increased text-secondary opacity from 0.7 to 0.9
- Increased text-muted opacity from 0.5 to 0.6
- Lighthouse Accessibility score: 95 → 100

### Added
- **Sentry Error Tracking Integration**
- Sentry SDK initialized with session replay
- Error tracking for production (10% performance, 100% errors)
- CSP policy updated to allow Sentry connections
- `SENTRY-SETUP-GUIDE.md` - Setup documentation
- `SENTRY-DEBUG-REPORT.md` - Debugging documentation
- `verify-sentry-deep.mjs` - Comprehensive diagnostics tool

## [0.10.0] - 2024-12-24

### Added
- **Full Platform Polish & Performance**
- Animation system with Framer Motion utilities
- Loading skeletons for all pages
- Bundle splitting for faster load times
- Image lazy loading
- `docs/ANIMATION-UTILITIES-GUIDE.md`
- `docs/ANIMATION-QUICK-REFERENCE.md`
- `docs/ANIMATION-UTILITIES-SUMMARY.md`

### Changed
- Polished all public pages (Home, Artists, Events)
- Polished all dashboard pages
- Polished all common components
- Enhanced mobile responsiveness

### Performance
- Lighthouse Performance: 85 → 91
- Core Web Vitals optimized (FCP: 1.3s, LCP: 1.5s, CLS: 0.001)

## [0.9.0] - 2024-12-22

### Added
- **Phase 10: Admin Panel Enhancements**
- Admin payout management system
- User ban/unban functionality with reason tracking
- Audit log for all admin actions
- CSV export for users, payouts, tickets, audit logs
- `docs/PHASE-10-SUMMARY.md`

### Added
- **Phase 9: Notifications & Communication**
- In-app notification system with bell icon
- Real-time toast notifications
- Email notification system (17 types)
- Notification preferences page
- Reminder system (24h + 1h before events)
- German email templates
- `docs/PHASE-9-SUMMARY.md`

### Database
- Migration `011_admin_enhancements.sql`
- Tables: admin_audit_logs, user_bans, support_tickets
- Migration `010_notifications.sql`
- Tables: notifications, notification_preferences, email_logs, scheduled_reminders

## [0.8.0] - 2024-12-23

### Added
- **Phase 8: Analytics & Dashboard System**
- Artist analytics page with earnings, bookings, profile views
- Fan analytics page with spending, events, favorites
- Enhanced admin dashboard with charts and tables
- 7 shared analytics components (StatCard, LineChart, BarChart, etc.)
- Period-based filtering (7d, 30d, 90d, 12m)
- Trend indicators and comparison data
- `docs/PHASE-8-SUMMARY.md`

### Database
- Migration `009_analytics.sql`
- Tables: analytics_events, daily_artist_stats, daily_platform_stats
- RPC functions for analytics aggregation

## [0.7.0] - 2024-12-20

### Added
- **Phase 7: Reviews & Ratings System**
- Two-way review system (artist ↔ client)
- Star ratings (1-5) with categories
- Review responses by artists
- Helpful votes on reviews
- Review badges and verification

### Database
- Tables: reviews, review_categories, review_responses, user_rating_stats

## [0.5.0] - 2024-12-22

### Added
- **Phase 5: Interactive Map Feature**
- `ArtistMapLeaflet` component with dark theme
- Custom markers by category with emojis
- Glassmorphism popup cards
- `ViewToggle` component for grid/map switching
- `mapService.ts` with location utilities
- German city coordinates lookup (80+ cities)
- User location detection
- `docs/PHASE5_SUMMARY.md`

### Changed
- Profile fetch timeout increased from 5s to 10s
- ArtistsPage now supports both grid and map views

### Fixed
- Removed debug console.log statements
- Map popup arrow tip removed for cleaner design

## [0.4.0] - 2024-12-17

### Added
- **Phase 4: Stripe Payment Integration**
- Stripe Connect for artist onboarding
- Payment processing (SEPA, Giropay, Cards)
- Coin purchase system
- Payment components (CheckoutForm, CoinPurchaseModal, ArtistOnboardingCard)
- 8 Supabase Edge Functions deployed
- Webhook handling for Stripe events
- `docs/PHASE-4-STRIPE-INTEGRATION.md`
- `docs/PHASE-4-UPDATES.md`
- `docs/PHASE-4-COMPLETE.md`

### Database
- Migration `004_stripe_tables.sql`
- Tables: artist_stripe_accounts, payments, user_coins, coin_transactions, stripe_webhook_events

### Changed
- Animation system with Framer Motion
- Modal animations with step transitions

## [0.3.0] - 2024-12-15

### Added
- **Phase 3: Supabase Backend Integration**
- User authentication (email + OAuth)
- Artist profiles with real data
- File storage for images and audio
- Row Level Security policies
- Real-time subscriptions

### Database
- Migration `001_initial_schema.sql`
- Migration `002_artists_and_bookings.sql`
- Migration `003_messaging_and_calendar.sql`

## [0.2.0] - 2024-12-10

### Added
- **Phase 2: Complete Frontend UI**
- All pages: Home, Artists, Events, About, Profile, Impressum, Datenschutz
- 26+ reusable components
- Layout: Header, Footer, Layout
- Sections: Hero, About, Features, Artists, MemberCTA
- UI: Badge, Button, Card, Input, Modal, StarRating
- Auth: LoginModal, RegisterModal (3-step)
- Artist: ArtistCalendar, AudioPlayer, FilterBar
- Dark theme with Hyperwave branding
- Mobile-responsive design

## [0.1.0] - 2024-12-05

### Added
- **Phase 1: Initial Project Setup**
- React + Vite + TypeScript
- TailwindCSS configuration
- Folder structure created
- Git repository connected
- Fonts configured (Hyperwave One, Roboto)

---

## Version History Summary

| Version | Date | Key Features |
|---------|------|--------------|
| 0.11.0 | 2024-12-26 | Documentation overhaul |
| 0.10.1 | 2024-12-25 | Accessibility & Sentry |
| 0.10.0 | 2024-12-24 | Polish & Performance |
| 0.9.0 | 2024-12-22 | Admin Panel & Notifications |
| 0.8.0 | 2024-12-23 | Analytics System |
| 0.7.0 | 2024-12-20 | Reviews & Ratings |
| 0.5.0 | 2024-12-22 | Interactive Map |
| 0.4.0 | 2024-12-17 | Stripe Payments |
| 0.3.0 | 2024-12-15 | Backend Integration |
| 0.2.0 | 2024-12-10 | Frontend UI |
| 0.1.0 | 2024-12-05 | Project Setup |

---

**Current Version:** 0.11.0
**Status:** Production Ready (91% complete)
**Next Release:** Phase 6 (Contracts & Riders) - TBD
