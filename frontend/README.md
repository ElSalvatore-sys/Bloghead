# 🎸 Bloghead - Artist Booking Platform

[![Production](https://img.shields.io/badge/production-live-brightgreen)](https://blogyydev.xyz)
[![Lighthouse Performance](https://img.shields.io/badge/performance-91%25-brightgreen)](https://blogyydev.xyz)
[![Lighthouse Accessibility](https://img.shields.io/badge/accessibility-100%25-brightgreen)](https://blogyydev.xyz)
[![Lighthouse SEO](https://img.shields.io/badge/SEO-100%25-brightgreen)](https://blogyydev.xyz)

Professional platform connecting musicians, DJs, and performers with event organizers and venues in Germany.

**🌐 Live Site:** [blogyydev.xyz](https://blogyydev.xyz)
**📊 Status:** Production Ready (91% complete)
**💰 Platform Value:** €185,000+

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account
- Stripe account (optional, for payments)

### Installation

```bash
# Clone repository
git clone https://github.com/ElSalvatore-sys/Bloghead.git
cd Bloghead/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Visit http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/         # React components
│   │   ├── layout/        # Header, Footer, Layout
│   │   ├── sections/      # Homepage sections
│   │   ├── auth/          # Login, Register modals
│   │   ├── ui/            # Reusable UI components
│   │   ├── analytics/     # Charts and stats
│   │   └── notifications/ # Notification system
│   ├── pages/             # Route pages
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── lib/               # Utilities & services
│   ├── config/            # Configuration files
│   ├── assets/            # Images, fonts
│   └── index.css          # Global styles
├── docs/                  # Documentation
├── public/                # Static assets
└── supabase/             # Database migrations
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite 6** - Build tool
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **Recharts** - Charts & analytics
- **Leaflet** - Interactive maps
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend & Services
- **Supabase** - Database, Auth, Storage, Real-time
- **Stripe** - Payment processing
- **Sentry** - Error tracking
- **Vercel** - Hosting & deployment

---

## ✨ Key Features

### 🎤 For Artists
- ✅ Professional profile pages
- ✅ Photo gallery & audio samples
- ✅ Availability calendar
- ✅ Booking management
- ✅ Earnings analytics
- ✅ Stripe Connect integration
- ✅ Reviews & ratings
- ✅ Real-time messaging

### 🎪 For Event Organizers
- ✅ Artist search & discovery
- ✅ Interactive map view
- ✅ Genre filtering
- ✅ Booking system
- ✅ Payment processing
- ✅ Event management
- ✅ Spending analytics

### 🛡️ For Admins
- ✅ User management (ban/unban)
- ✅ Payout approval
- ✅ Support tickets
- ✅ Content moderation
- ✅ Audit logs
- ✅ Platform analytics

---

## 📊 Quality Metrics

**Lighthouse Scores (December 25, 2024):**
- ⚡ Performance: **91/100**
- ♿ Accessibility: **100/100**
- ✅ Best Practices: **92/100**
- 🔍 SEO: **100/100**

**Core Web Vitals:**
- FCP: 1.3s ✅
- LCP: 1.5s ✅
- CLS: 0.001 ✅
- TBT: 0ms ✅

---

## 🗄️ Database

**PostgreSQL (Supabase):**
- 35+ tables
- Row Level Security (RLS)
- Real-time subscriptions
- Automated triggers
- Full-text search

**Key Tables:**
- `profiles` - User profiles
- `artists` - Artist data
- `bookings` - Booking records
- `payments` - Payment transactions
- `notifications` - Notification system
- `analytics_events` - Analytics tracking

---

## 🔐 Environment Variables

Create `.env.local` with:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (optional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Sentry (optional)
VITE_SENTRY_DSN=your_sentry_dsn
```

---

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run Lighthouse audit
npm run lighthouse
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PROJECT-STATUS.md](docs/PROJECT-STATUS.md) | Current project status |
| [PHASE-SUMMARIES.md](docs/PHASE-SUMMARIES.md) | Phase implementation details |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [ANIMATION-UTILITIES-GUIDE.md](docs/ANIMATION-UTILITIES-GUIDE.md) | Animation system guide |
| [SENTRY-SETUP-GUIDE.md](SENTRY-SETUP-GUIDE.md) | Error tracking setup |

---

## 🚀 Deployment

### Vercel (Production)

Automatic deployment on push to `main`:

```bash
git push origin main
```

Deployment URL: https://blogyydev.xyz

### Manual Deployment

```bash
npm run build
vercel --prod
```

---

## 📈 Development Phases

| Phase | Status | Completion |
|-------|--------|------------|
| 1. Core Platform | ✅ | 100% |
| 2. Artist Profiles | ✅ | 100% |
| 3. Booking System | ✅ | 100% |
| 4. Stripe Payments | ✅ | 100% |
| 5. Map & Messaging | ✅ | 100% |
| 6. Contracts | ⏳ | 0% |
| 7. Reviews & Ratings | ✅ | 100% |
| 8. Analytics | ✅ | 100% |
| 9. Notifications | ✅ | 100% |
| 10. Admin Panel | ✅ | 100% |
| 11. Polish | ✅ | 100% |

**Overall:** 91% Complete

---

## 🤝 Contributing

This is a private project. For bug reports or feature requests, please open an issue.

---

## 📄 License

Proprietary - All rights reserved

---

## 👥 Team

**Lead Developer:** Ali (EA Solutions)
**Repository:** https://github.com/ElSalvatore-sys/Bloghead

---

## 📞 Support

**Production Monitoring:**
- Sentry: https://sentry.io/organizations/eldiaploo/issues/
- Vercel: https://vercel.com/eldiaploo/bloghead

**Issues:** GitHub Issues

---

**Built with ❤️ in Germany** 🇩🇪
# Accessibility Improvements
