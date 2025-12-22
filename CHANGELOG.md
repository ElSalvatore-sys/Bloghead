# Changelog

All notable changes to Bloghead will be documented in this file.

## [Phase 7] - December 2024

### Added
- Two-way review system (clients ↔ artists)
- Star ratings with category breakdowns
- Review responses from reviewees
- Helpful votes and flagging system
- Achievement badges (Top Rated, Rising Star, etc.)
- 14-day review window enforcement
- Dashboard pages for managing reviews

### Database
- 6 new tables (reviews, review_categories, review_responses, user_rating_stats, review_helpful_votes, review_flags)
- 4 new ENUMs (reviewer_type, review_status, review_category, badge_type)
- 7 RPC functions with triggers

### Components
- ReviewForm, ReviewCard, ReviewStats
- ReviewBadge, ReviewsList, ReviewsSection
- WriteReviewModal

---

## [Phase 6] - December 2024

### Added
- Artist availability calendar with day/time slots
- Geolocation for artist search radius
- Enhanced booking request flow
- Owner PWA inventory and task management

### Database
- Artist availability tables and functions
- Geolocation columns and indexes
- Inventory and employee tables

---

## [Phase 5] - December 2024

### Added
- Admin dashboard with user management
- Support tickets system
- Announcements system
- Analytics dashboard

---

## [Phase 4] - December 2024

### Added
- Stripe Connect integration for artists
- Coin purchase system
- Payment processing for bookings
- German payment methods (SEPA, Giropay)

---

## [Phase 3] - December 2024

### Added
- Supabase backend integration
- User authentication (Email, Google, Facebook)
- Database schema (38+ tables)
- Real-time subscriptions
- File storage for images/audio

---

## [Phase 2] - December 2024

### Added
- Complete frontend with all pages
- Artists, Events, Services pages
- Dashboard layouts for all user roles
- German legal pages (Impressum, Datenschutz, Kontakt)
- Cookie consent banner

---

## [Phase 1] - December 2024

### Added
- Project setup (React, Vite, TypeScript)
- TailwindCSS configuration
- Design system implementation
- Git repository setup
