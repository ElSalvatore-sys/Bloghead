-- ============================================
-- PHASE 13: TECHNICAL REQUIREMENTS SYSTEM
-- ============================================

-- 1. EQUIPMENT CATALOG (Master list of equipment types)
CREATE TABLE IF NOT EXISTS equipment_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Classification
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'audio', 'lighting', 'stage', 'video', 'backline',
    'dj_equipment', 'instruments', 'microphones', 'monitoring', 'other'
  )),
  subcategory VARCHAR(100),

  -- Equipment Info
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Common brands/models (for suggestions)
  common_brands TEXT[],
  common_models TEXT[],

  -- Specifications
  typical_specs JSONB, -- { "power": "1000W", "channels": 4, etc. }

  -- Display
  icon_name VARCHAR(50), -- Lucide icon name
  sort_order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EQUIPMENT TEMPLATES (Pre-built setups for different artist types)
CREATE TABLE IF NOT EXISTS equipment_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,

  -- Type
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN (
    'dj', 'band', 'solo_artist', 'speaker', 'duo',
    'full_band', 'acoustic', 'electronic', 'custom'
  )),

  -- Equipment List (references equipment_catalog)
  equipment_items JSONB NOT NULL DEFAULT '[]',
  -- Format: [{ "catalog_id": "uuid", "quantity": 1, "is_required": true, "notes": "" }]

  -- Display
  icon_name VARCHAR(50),
  cover_image TEXT,

  -- Status
  is_system BOOLEAN DEFAULT FALSE, -- System templates can't be deleted
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ARTIST EQUIPMENT (What artist owns/brings)
CREATE TABLE IF NOT EXISTS artist_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Equipment Details
  catalog_id UUID REFERENCES equipment_catalog(id) ON DELETE SET NULL,
  custom_name VARCHAR(255), -- If not from catalog
  category VARCHAR(50) NOT NULL,

  -- Specific Item
  brand VARCHAR(100),
  model VARCHAR(100),
  quantity INTEGER DEFAULT 1,

  -- Condition & Transport
  condition VARCHAR(50) CHECK (condition IN ('excellent', 'good', 'fair', 'needs_repair')),
  transport_notes TEXT, -- "Fits in car", "Needs van", etc.

  -- Availability
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ARTIST REQUIREMENTS (What artist needs from venue)
CREATE TABLE IF NOT EXISTS artist_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Equipment Details
  catalog_id UUID REFERENCES equipment_catalog(id) ON DELETE SET NULL,
  custom_name VARCHAR(255),
  category VARCHAR(50) NOT NULL,

  -- Requirement Level
  is_required BOOLEAN DEFAULT TRUE, -- Required vs Nice-to-have
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5), -- 1=Critical, 5=Optional

  -- Specifications
  quantity INTEGER DEFAULT 1,
  min_specs TEXT, -- Minimum acceptable specs
  preferred_specs TEXT, -- Preferred specs

  -- Alternatives
  alternatives TEXT, -- "Or similar mixer with 4+ channels"

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TECHNICAL RIDERS (PDF uploads and generated riders)
CREATE TABLE IF NOT EXISTS technical_riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Rider Info
  name VARCHAR(255) NOT NULL DEFAULT 'Technical Rider',
  version VARCHAR(50) DEFAULT '1.0',

  -- Content
  rider_type VARCHAR(50) CHECK (rider_type IN ('uploaded', 'generated', 'hybrid')),
  file_url TEXT, -- For uploaded PDFs
  content JSONB, -- For generated riders

  -- Stage Plot
  stage_plot_url TEXT,
  stage_plot_notes TEXT,

  -- Input List
  input_list JSONB, -- Channel list: [{ "channel": 1, "instrument": "Kick", "mic": "SM91", "notes": "" }]

  -- Status
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BOOKING EQUIPMENT (Equipment for specific bookings)
CREATE TABLE IF NOT EXISTS booking_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,

  -- Source
  source VARCHAR(50) CHECK (source IN ('artist_brings', 'venue_provides', 'rental_needed', 'tbd')),

  -- Equipment
  catalog_id UUID REFERENCES equipment_catalog(id) ON DELETE SET NULL,
  custom_name VARCHAR(255),
  category VARCHAR(50) NOT NULL,

  -- Details
  brand VARCHAR(100),
  model VARCHAR(100),
  quantity INTEGER DEFAULT 1,

  -- Status
  status VARCHAR(50) CHECK (status IN ('confirmed', 'pending', 'unavailable', 'alternative_needed')),

  -- Cost (if rental)
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  cost_responsibility VARCHAR(50) CHECK (cost_responsibility IN ('artist', 'venue', 'split', 'tbd')),

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EQUIPMENT MATCH CONFLICTS (Auto-detected issues)
CREATE TABLE IF NOT EXISTS equipment_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,

  -- Conflict Details
  conflict_type VARCHAR(50) CHECK (conflict_type IN (
    'missing_required', 'insufficient_quantity', 'incompatible', 'quality_mismatch'
  )),
  severity VARCHAR(20) CHECK (severity IN ('critical', 'warning', 'info')),

  -- What's affected
  requirement_id UUID REFERENCES artist_requirements(id),
  venue_equipment_id UUID REFERENCES venue_equipment(id),

  -- Description
  description TEXT NOT NULL,
  suggested_resolution TEXT,

  -- Resolution
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_equipment_catalog_category ON equipment_catalog(category);
CREATE INDEX IF NOT EXISTS idx_equipment_templates_type ON equipment_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_artist_equipment_artist ON artist_equipment(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_requirements_artist ON artist_requirements(artist_id);
CREATE INDEX IF NOT EXISTS idx_technical_riders_artist ON technical_riders(artist_id);
CREATE INDEX IF NOT EXISTS idx_booking_equipment_booking ON booking_equipment(booking_id);
CREATE INDEX IF NOT EXISTS idx_equipment_conflicts_booking ON equipment_conflicts(booking_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE equipment_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_conflicts ENABLE ROW LEVEL SECURITY;

-- Equipment Catalog: Public read
CREATE POLICY "Equipment catalog is public" ON equipment_catalog FOR SELECT USING (is_active = true);

-- Equipment Templates: Public read
CREATE POLICY "Equipment templates are public" ON equipment_templates FOR SELECT USING (is_active = true);

-- Artist Equipment: Owner read/write, public read for active artists
CREATE POLICY "Artists can manage their equipment" ON artist_equipment FOR ALL USING (auth.uid() = artist_id);
CREATE POLICY "Public can view artist equipment" ON artist_equipment FOR SELECT USING (is_available = true);

-- Artist Requirements: Owner read/write, public read
CREATE POLICY "Artists can manage their requirements" ON artist_requirements FOR ALL USING (auth.uid() = artist_id);
CREATE POLICY "Public can view artist requirements" ON artist_requirements FOR SELECT USING (true);

-- Technical Riders: Owner read/write, booking parties can view
CREATE POLICY "Artists can manage their riders" ON technical_riders FOR ALL USING (auth.uid() = artist_id);
CREATE POLICY "Public can view active riders" ON technical_riders FOR SELECT USING (is_active = true);

-- Booking Equipment: Booking parties only
CREATE POLICY "Booking parties can view equipment" ON booking_equipment FOR SELECT USING (
  booking_id IN (
    SELECT id FROM bookings
    WHERE artist_id = auth.uid() OR organizer_id = auth.uid()
  )
);
CREATE POLICY "Booking parties can manage equipment" ON booking_equipment FOR ALL USING (
  booking_id IN (
    SELECT id FROM bookings
    WHERE artist_id = auth.uid() OR organizer_id = auth.uid()
  )
);

-- Equipment Conflicts: Booking parties only
CREATE POLICY "Booking parties can view conflicts" ON equipment_conflicts FOR SELECT USING (
  booking_id IN (
    SELECT id FROM bookings
    WHERE artist_id = auth.uid() OR organizer_id = auth.uid()
  )
);

-- ============================================
-- SEED DATA: Equipment Catalog
-- ============================================

INSERT INTO equipment_catalog (category, subcategory, name, description, common_brands, icon_name, sort_order) VALUES
-- Audio
('audio', 'mixer', 'DJ Mixer', '2-4 Kanal DJ Mixer', ARRAY['Pioneer', 'Allen & Heath', 'Rane'], 'sliders', 1),
('audio', 'mixer', 'Live Mixer', 'Mischpult für Live-Sound', ARRAY['Yamaha', 'Behringer', 'Soundcraft'], 'sliders', 2),
('audio', 'speakers', 'PA System', 'Aktive PA-Lautsprecher', ARRAY['JBL', 'QSC', 'RCF', 'EV'], 'speaker', 3),
('audio', 'speakers', 'Subwoofer', 'Aktiver Subwoofer', ARRAY['JBL', 'QSC', 'RCF'], 'speaker', 4),
('audio', 'monitors', 'Monitor Speaker', 'Bühnenmonitor', ARRAY['JBL', 'Yamaha', 'QSC'], 'volume-2', 5),
('audio', 'monitors', 'In-Ear System', 'In-Ear Monitoring', ARRAY['Shure', 'Sennheiser', 'Audio-Technica'], 'headphones', 6),

-- DJ Equipment
('dj_equipment', 'cdj', 'CDJ/Media Player', 'DJ Media Player', ARRAY['Pioneer', 'Denon'], 'disc', 10),
('dj_equipment', 'turntable', 'Turntable', 'Plattenspieler', ARRAY['Technics', 'Pioneer', 'Reloop'], 'disc', 11),
('dj_equipment', 'controller', 'DJ Controller', 'All-in-One DJ Controller', ARRAY['Pioneer', 'Native Instruments', 'Denon'], 'sliders-horizontal', 12),

-- Microphones
('microphones', 'dynamic', 'Dynamisches Mikrofon', 'Für Gesang & Instrumente', ARRAY['Shure', 'Sennheiser', 'AKG'], 'mic', 20),
('microphones', 'condenser', 'Kondensator Mikrofon', 'Studio/Live Kondensator', ARRAY['Neumann', 'AKG', 'Audio-Technica'], 'mic', 21),
('microphones', 'wireless', 'Funkmikrofon', 'Drahtloses Mikrofonsystem', ARRAY['Shure', 'Sennheiser', 'Audio-Technica'], 'mic', 22),

-- Backline
('backline', 'guitar_amp', 'Gitarrenverstärker', 'E-Gitarren Verstärker', ARRAY['Fender', 'Marshall', 'Vox'], 'music', 30),
('backline', 'bass_amp', 'Bassverstärker', 'E-Bass Verstärker', ARRAY['Ampeg', 'Fender', 'Markbass'], 'music', 31),
('backline', 'drums', 'Schlagzeug', 'Akustisches Schlagzeug-Set', ARRAY['Pearl', 'DW', 'Tama', 'Yamaha'], 'drum', 32),
('backline', 'keyboard', 'Keyboard/Piano', 'Stage Piano oder Synthesizer', ARRAY['Nord', 'Yamaha', 'Roland', 'Korg'], 'piano', 33),

-- Lighting
('lighting', 'moving_head', 'Moving Head', 'Bewegliche Scheinwerfer', ARRAY['Chauvet', 'ADJ', 'Martin'], 'lightbulb', 40),
('lighting', 'par', 'LED PAR', 'PAR Scheinwerfer', ARRAY['Chauvet', 'ADJ', 'Stairville'], 'lightbulb', 41),
('lighting', 'laser', 'Laser', 'Show-Laser', ARRAY['Laserworld', 'Kvant'], 'zap', 42),
('lighting', 'fog', 'Nebelmaschine', 'Nebel/Haze Maschine', ARRAY['Antari', 'Look Solutions'], 'cloud', 43),

-- Stage
('stage', 'riser', 'Bühnenpodest', 'Bühnenelemente', ARRAY['Prolyte', 'Eurotruss'], 'square', 50),
('stage', 'backdrop', 'Backdrop/Molton', 'Bühnenhintergrund', ARRAY[]::TEXT[], 'image', 51),
('stage', 'dj_booth', 'DJ Booth/Pult', 'DJ Tisch oder Booth', ARRAY['Gorilla', 'Custom'], 'table', 52),

-- Video
('video', 'projector', 'Projektor', 'Video-Beamer', ARRAY['Epson', 'BenQ', 'Panasonic'], 'projector', 60),
('video', 'led_wall', 'LED Wand', 'LED Video Wall', ARRAY['Absen', 'ROE'], 'monitor', 61)

ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: Equipment Templates
-- ============================================

INSERT INTO equipment_templates (name, slug, description, template_type, equipment_items, icon_name, is_system) VALUES
(
  'DJ Setup - Standard',
  'dj-standard',
  'Standard DJ Setup mit 2 CDJs und Mixer',
  'dj',
  '[
    {"name": "CDJ/Media Player", "category": "dj_equipment", "quantity": 2, "is_required": true},
    {"name": "DJ Mixer", "category": "audio", "quantity": 1, "is_required": true},
    {"name": "Monitor Speaker", "category": "audio", "quantity": 1, "is_required": true},
    {"name": "DJ Booth/Pult", "category": "stage", "quantity": 1, "is_required": false}
  ]'::JSONB,
  'disc',
  true
),
(
  'DJ Setup - Vinyl',
  'dj-vinyl',
  'Vinyl DJ Setup mit Turntables',
  'dj',
  '[
    {"name": "Turntable", "category": "dj_equipment", "quantity": 2, "is_required": true},
    {"name": "DJ Mixer", "category": "audio", "quantity": 1, "is_required": true},
    {"name": "Monitor Speaker", "category": "audio", "quantity": 1, "is_required": true}
  ]'::JSONB,
  'disc',
  true
),
(
  'Live Band - Standard',
  'band-standard',
  'Standard Band Setup mit Backline und PA',
  'band',
  '[
    {"name": "Live Mixer", "category": "audio", "quantity": 1, "is_required": true},
    {"name": "PA System", "category": "audio", "quantity": 2, "is_required": true},
    {"name": "Monitor Speaker", "category": "audio", "quantity": 4, "is_required": true},
    {"name": "Dynamisches Mikrofon", "category": "microphones", "quantity": 4, "is_required": true},
    {"name": "Schlagzeug", "category": "backline", "quantity": 1, "is_required": false},
    {"name": "Gitarrenverstärker", "category": "backline", "quantity": 2, "is_required": false},
    {"name": "Bassverstärker", "category": "backline", "quantity": 1, "is_required": false}
  ]'::JSONB,
  'music',
  true
),
(
  'Solo Acoustic',
  'solo-acoustic',
  'Solo Künstler mit akustischen Instrumenten',
  'acoustic',
  '[
    {"name": "PA System", "category": "audio", "quantity": 2, "is_required": true},
    {"name": "Monitor Speaker", "category": "audio", "quantity": 1, "is_required": true},
    {"name": "Kondensator Mikrofon", "category": "microphones", "quantity": 1, "is_required": true},
    {"name": "Dynamisches Mikrofon", "category": "microphones", "quantity": 1, "is_required": true}
  ]'::JSONB,
  'guitar',
  true
),
(
  'Speaker/Redner',
  'speaker',
  'Setup für Vorträge und Präsentationen',
  'speaker',
  '[
    {"name": "PA System", "category": "audio", "quantity": 2, "is_required": true},
    {"name": "Funkmikrofon", "category": "microphones", "quantity": 1, "is_required": true},
    {"name": "Monitor Speaker", "category": "audio", "quantity": 1, "is_required": false},
    {"name": "Projektor", "category": "video", "quantity": 1, "is_required": false}
  ]'::JSONB,
  'mic',
  true
)

ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to match artist requirements with venue equipment
CREATE OR REPLACE FUNCTION match_equipment(
  p_artist_id UUID,
  p_venue_id UUID
)
RETURNS TABLE (
  requirement_name VARCHAR,
  requirement_category VARCHAR,
  requirement_quantity INTEGER,
  is_required BOOLEAN,
  venue_has BOOLEAN,
  venue_quantity INTEGER,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(ar.custom_name, ec.name) AS requirement_name,
    ar.category AS requirement_category,
    ar.quantity AS requirement_quantity,
    ar.is_required,
    ve.id IS NOT NULL AS venue_has,
    COALESCE(ve.quantity, 0) AS venue_quantity,
    CASE
      WHEN ve.id IS NULL AND ar.is_required THEN 'missing_required'
      WHEN ve.id IS NULL AND NOT ar.is_required THEN 'missing_optional'
      WHEN ve.quantity < ar.quantity THEN 'insufficient'
      ELSE 'available'
    END AS status
  FROM artist_requirements ar
  LEFT JOIN equipment_catalog ec ON ar.catalog_id = ec.id
  LEFT JOIN venue_equipment ve ON (
    ve.venue_id = p_venue_id AND
    (ve.category = ar.category OR ve.name ILIKE '%' || COALESCE(ar.custom_name, ec.name) || '%')
  )
  WHERE ar.artist_id = p_artist_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check booking equipment conflicts
CREATE OR REPLACE FUNCTION check_booking_conflicts(p_booking_id UUID)
RETURNS SETOF equipment_conflicts AS $$
DECLARE
  v_booking RECORD;
  v_requirement RECORD;
  v_venue_equipment RECORD;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;

  IF v_booking IS NULL THEN
    RETURN;
  END IF;

  -- Check each artist requirement
  FOR v_requirement IN
    SELECT ar.*, COALESCE(ar.custom_name, ec.name) as req_name
    FROM artist_requirements ar
    LEFT JOIN equipment_catalog ec ON ar.catalog_id = ec.id
    WHERE ar.artist_id = v_booking.artist_id
  LOOP
    -- Check if venue has matching equipment
    SELECT * INTO v_venue_equipment
    FROM venue_equipment ve
    WHERE ve.venue_id = v_booking.venue_id
      AND (ve.category = v_requirement.category OR ve.name ILIKE '%' || v_requirement.req_name || '%')
    LIMIT 1;

    IF v_venue_equipment IS NULL AND v_requirement.is_required THEN
      -- Missing required equipment
      INSERT INTO equipment_conflicts (
        booking_id, conflict_type, severity, requirement_id,
        description, suggested_resolution
      ) VALUES (
        p_booking_id, 'missing_required', 'critical', v_requirement.id,
        'Benötigtes Equipment fehlt: ' || v_requirement.req_name,
        'Künstler bringt mit oder Equipment wird gemietet'
      )
      RETURNING * INTO v_venue_equipment;

      RETURN NEXT v_venue_equipment;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;
