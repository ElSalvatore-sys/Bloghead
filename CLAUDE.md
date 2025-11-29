# Bloghead - Claude Code Context

## Project Overview
Bloghead is a German artist booking platform connecting performers (DJs, singers, musicians) with event organizers (Veranstalter). Built with React 19 + TypeScript + Vite 7 frontend, targeting Supabase PostgreSQL backend.

## Current State
- **Phase 1 Complete**: Component library with 15+ UI components
- **Phase 2 Ready**: All documentation complete, ready for implementation

## Key Documentation (READ THESE FIRST)
1. `docs/SYSTEM-ARCHITECTURE.md` - All 6 core systems explained
2. `docs/DATABASE-SCHEMA.md` - Complete Supabase schema (30+ tables)
3. `docs/DESIGN-SPECS.md` - Colors, typography, component CSS
4. `docs/PAGE-BY-PAGE-BREAKDOWN.md` - Every UI element documented

## Design References
- `pdf-pages/*.jpg` - Compressed screenshots of all 12 website designs
- Original PDFs not in repo (too large) - available locally if needed

## Tech Stack
- Frontend: React 19, TypeScript, Vite 7, Tailwind CSS v4
- Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Payments: Stripe Connect (future)

## Quick Start
```bash
cd frontend && npm install && npm run dev
```

## German Context
- UI text is in German (KÜNSTLER, VERANSTALTER, BUCHEN, etc.)
- Currency: EUR with custom "Coins" system
- Legal: German business law (Impressum, Datenschutz, AGB)
