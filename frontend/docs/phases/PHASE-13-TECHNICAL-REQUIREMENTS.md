# Phase 13: Technical Requirements System

**Duration:** 2 weeks
**Status:** Week 1 Complete ✅
**Priority:** CRITICAL
**Progress:** 15% → 60% (+45%)

---

## Overview

Build complete equipment catalog, artist equipment/requirements management, technical riders, and equipment matching for bookings.

---

## Week 1: Foundation (COMPLETE ✅)

### Task 1: Database Migration ✅
**File:** `supabase/migrations/20251226164306_technical_requirements.sql`
**Lines:** 494

**7 Tables Created:**
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `equipment_catalog` | Master equipment list | category, name, common_brands, typical_specs |
| `equipment_templates` | Pre-built setups | template_type, equipment_items JSONB |
| `artist_equipment` | What artist owns | catalog_id, brand, model, condition |
| `artist_requirements` | What artist needs | catalog_id, is_required, priority, min_specs |
| `technical_riders` | PDF & generated riders | rider_type, file_url, input_list |
| `booking_equipment` | Per-booking equipment | source, status, cost_responsibility |
| `equipment_conflicts` | Auto-detected issues | conflict_type, severity, resolution |

**Seed Data:**
- 25 equipment catalog items (DJ, Audio, Lighting, Stage, Video)
- 5 pre-built templates (DJ Standard, DJ Vinyl, Live Band, Solo Acoustic, Speaker)

**Security:**
- 18 RLS policies
- Public read for catalog & templates
- Owner-only write for artist data
- Booking party access for booking data

**Functions:**
- `match_equipment(artist_id, venue_id)` - Auto-match requirements
- `check_booking_conflicts(booking_id)` - Detect missing equipment

---

### Task 2: TypeScript Types ✅
**File:** `src/types/equipment.ts`
**Lines:** 462 | **Exports:** 39

**Type Aliases (9):**
- EquipmentCategory (10 types)
- TemplateType (9 types)
- EquipmentCondition (4 levels)
- RiderType (3 types)
- EquipmentSource (4 options)
- BookingEquipmentStatus (4 states)
- CostResponsibility (4 options)
- ConflictType (4 types)
- ConflictSeverity (3 levels)

**Interfaces (18):**
- Equipment: EquipmentCatalogItem, EquipmentCatalogGrouped
- Templates: EquipmentTemplate, TemplateEquipmentItem
- Artist: ArtistEquipment, ArtistEquipmentInput, ArtistRequirement, ArtistRequirementInput
- Riders: TechnicalRider, TechnicalRiderInput, InputListChannel, RiderContent
- Booking: BookingEquipment, BookingEquipmentInput
- Conflicts: EquipmentConflict, ConflictResolutionInput
- Utility: EquipmentMatchResult, ArtistTechProfile

**German Labels (12):**
- EQUIPMENT_CATEGORY_LABELS
- TEMPLATE_TYPE_LABELS
- EQUIPMENT_CONDITION_LABELS
- RIDER_TYPE_LABELS
- EQUIPMENT_SOURCE_LABELS
- BOOKING_STATUS_LABELS
- COST_RESPONSIBILITY_LABELS
- CONFLICT_TYPE_LABELS
- CONFLICT_SEVERITY_LABELS
- PRIORITY_LABELS
- CATEGORY_ICONS
- TEMPLATE_ICONS

---

### Task 3: Service Layer ✅
**File:** `src/services/equipmentService.ts`
**Functions:** 42

| Category | Functions | Purpose |
|----------|-----------|---------|
| Catalog | 4 | getEquipmentCatalog, getEquipmentCatalogGrouped, getEquipmentByCategory, searchEquipmentCatalog |
| Templates | 4 | getEquipmentTemplates, getTemplatesByType, getTemplateBySlug, getTemplateById |
| Artist Equipment | 6 | getArtistEquipment, getMyEquipment, addArtistEquipment, updateArtistEquipment, deleteArtistEquipment, applyTemplateToEquipment |
| Requirements | 6 | getArtistRequirements, getMyRequirements, addArtistRequirement, updateArtistRequirement, deleteArtistRequirement, applyTemplateToRequirements |
| Riders | 9 | getArtistRiders, getMyRiders, getPrimaryRider, getRiderById, createRider, updateRider, deleteRider, uploadRiderPDF, uploadStagePlot |
| Booking | 5 | getBookingEquipment, addBookingEquipment, updateBookingEquipment, deleteBookingEquipment, initializeBookingEquipment |
| Conflicts | 3 | getBookingConflicts, checkBookingConflicts, resolveConflict |
| Matching | 5 | matchEquipment, getArtistTechProfile, getMyTechProfile, clearArtistRequirements, clearArtistEquipment |

---

### Task 4: UI Components ✅
**Directory:** `src/components/equipment/`
**Files:** 7 | **Lines:** 1,496

| Component | Lines | Purpose |
|-----------|-------|---------|
| EquipmentCatalogBrowser | 228 | Browse 25+ items with search, category grouping |
| EquipmentTemplateCard | 137 | Display templates with required/optional lists |
| EquipmentForm | 376 | Dual-mode add/edit equipment or requirements |
| RequirementsList | 268 | Grouped requirements with priority, specs |
| EquipmentMatcher | 200 | Match artist vs venue with compatibility % |
| TechnicalRiderUpload | 287 | Upload PDF riders & stage plots |
| index.ts | - | Component exports |

**Features:**
- ✅ German UI
- ✅ Mobile-first responsive
- ✅ Loading & empty states
- ✅ Full TypeScript coverage
- ✅ Dark theme compatible

---

## Week 1 Metrics Summary

| Category | Count |
|----------|-------|
| Database Tables | 7 |
| RLS Policies | 18 |
| Seed Data Items | 30 |
| TypeScript Types | 39 |
| Service Functions | 42 |
| UI Components | 6 |
| Total Lines | ~2,500 |

---

## Week 2: Pages & Integration (PLANNED)

### Task 1: Artist Equipment Page
- My Equipment tab (what I own)
- My Requirements tab (what I need)
- Template browser & apply
- Form modals for add/edit

### Task 2: Technical Rider Page
- Rider list with primary badge
- PDF upload & preview
- Stage plot upload
- Input list editor

### Task 3: Booking Equipment Page
- Equipment matcher view
- Conflict alerts
- Cost assignment
- Status tracking

### Task 4: Admin Equipment Page
- Catalog management
- Template CRUD
- Usage analytics

### Task 5: Integration
- Connect to booking flow
- Auto-initialize equipment
- Conflict detection
- Email notifications

---

## File Structure
```
src/
├── types/
│   └── equipment.ts           # 462 lines, 39 exports
├── services/
│   └── equipmentService.ts    # 42 functions
└── components/
    └── equipment/
        ├── EquipmentCatalogBrowser.tsx
        ├── EquipmentTemplateCard.tsx
        ├── EquipmentForm.tsx
        ├── RequirementsList.tsx
        ├── EquipmentMatcher.tsx
        ├── TechnicalRiderUpload.tsx
        └── index.ts

supabase/
└── migrations/
    └── 20251226164306_technical_requirements.sql
```

---

## Equipment Categories

| Category | German | Icon | Examples |
|----------|--------|------|----------|
| audio | Audio | Speaker | PA, Mixer, Subwoofer |
| lighting | Beleuchtung | Lightbulb | Moving Head, LED PAR, Laser |
| stage | Bühne | Square | Riser, Backdrop, DJ Booth |
| video | Video | Monitor | Projector, LED Wall |
| backline | Backline | Music | Guitar Amp, Bass Amp, Drums |
| dj_equipment | DJ Equipment | Disc | CDJ, Turntables, Controller |
| instruments | Instrumente | Guitar | Keyboard, Guitar, Bass |
| microphones | Mikrofone | Mic | Dynamic, Condenser, Wireless |
| monitoring | Monitoring | Headphones | In-Ears, Stage Monitors |
| other | Sonstiges | Box | Cases, Cables, Stands |

---

## Template Types

| Type | German | Use Case |
|------|--------|----------|
| dj | DJ | Club DJ, Wedding DJ |
| band | Band | Full live band |
| solo_artist | Solo Künstler | Singer-songwriter |
| speaker | Redner | Keynote, Presenter |
| duo | Duo | Acoustic duo |
| full_band | Vollständige Band | Large band with backline |
| acoustic | Akustisch | Unplugged sets |
| electronic | Elektronisch | Electronic live acts |
| custom | Individuell | User-created |

---

## Next Steps

1. **Week 2 Task 1:** Create ArtistEquipmentPage
2. **Week 2 Task 2:** Create TechnicalRiderPage
3. **Week 2 Task 3:** Create BookingEquipmentPage
4. **Week 2 Task 4:** Integrate with booking flow
5. **Week 2 Task 5:** Documentation & deployment
