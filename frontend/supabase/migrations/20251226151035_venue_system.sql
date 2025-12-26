-- ============================================
-- PHASE 12: VENUE MANAGEMENT SYSTEM
-- ============================================

-- 1. VENUES TABLE (Core venue profiles)
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  tagline VARCHAR(255),
  description TEXT,

  -- Location
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Germany',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Contact
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),

  -- Social Media
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  tiktok VARCHAR(255),

  -- Venue Details
  venue_type VARCHAR(50) CHECK (venue_type IN ('club', 'bar', 'concert_hall', 'theater', 'outdoor', 'festival', 'private_venue', 'restaurant', 'hotel', 'other')),
  capacity_min INTEGER,
  capacity_max INTEGER,
  price_range VARCHAR(20) CHECK (price_range IN ('budget', 'moderate', 'premium', 'luxury')),

  -- Media
  cover_image TEXT,
  logo_url TEXT,

  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VENUE GALLERY
CREATE TABLE IF NOT EXISTS venue_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption VARCHAR(255),
  is_cover BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VENUE EQUIPMENT CATALOG
CREATE TABLE IF NOT EXISTS venue_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,

  -- Equipment Details
  category VARCHAR(50) CHECK (category IN ('audio', 'lighting', 'stage', 'video', 'backline', 'dj_equipment', 'other')),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  quantity INTEGER DEFAULT 1,

  -- Condition & Availability
  condition VARCHAR(50) CHECK (condition IN ('excellent', 'good', 'fair', 'needs_maintenance')),
  is_included BOOLEAN DEFAULT TRUE,
  extra_cost DECIMAL(10, 2),

  -- Notes
  specifications TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VENUE ROOMS (Main space, green rooms, etc.)
CREATE TABLE IF NOT EXISTS venue_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,

  -- Room Details
  name VARCHAR(255) NOT NULL,
  room_type VARCHAR(50) CHECK (room_type IN ('main_hall', 'stage', 'greenroom', 'dressing_room', 'vip_lounge', 'backstage', 'storage', 'office', 'other')),

  -- Specs
  capacity INTEGER,
  size_sqm DECIMAL(10, 2),
  floor_level INTEGER DEFAULT 0,

  -- Amenities
  has_bathroom BOOLEAN DEFAULT FALSE,
  has_shower BOOLEAN DEFAULT FALSE,
  has_mirror BOOLEAN DEFAULT FALSE,
  has_wifi BOOLEAN DEFAULT TRUE,
  has_ac BOOLEAN DEFAULT FALSE,
  amenities TEXT[], -- ['couch', 'fridge', 'tv', etc.]

  -- Media
  photos TEXT[],

  -- Notes
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VENUE OPENING HOURS
CREATE TABLE IF NOT EXISTS venue_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,

  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,

  -- Special notes
  notes VARCHAR(255),

  UNIQUE(venue_id, day_of_week),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VENUE SPECIAL HOURS (Holidays, special events)
CREATE TABLE IF NOT EXISTS venue_special_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,

  date DATE NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  reason VARCHAR(255), -- 'Holiday', 'Private Event', etc.

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VENUE AMENITIES (What venue offers)
CREATE TABLE IF NOT EXISTS venue_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,

  category VARCHAR(50) CHECK (category IN ('parking', 'accessibility', 'catering', 'security', 'technical', 'comfort', 'other')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_included BOOLEAN DEFAULT TRUE,
  extra_cost DECIMAL(10, 2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VENUE STAFF (Optional - key contacts)
CREATE TABLE IF NOT EXISTS venue_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  role VARCHAR(100), -- 'Manager', 'Sound Engineer', 'Booking Agent'
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary_contact BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. VENUE REVIEWS (Artists reviewing venues)
CREATE TABLE IF NOT EXISTS venue_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Overall Rating
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),

  -- Category Ratings
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  hospitality_rating INTEGER CHECK (hospitality_rating BETWEEN 1 AND 5),
  equipment_rating INTEGER CHECK (equipment_rating BETWEEN 1 AND 5),
  ambience_rating INTEGER CHECK (ambience_rating BETWEEN 1 AND 5),

  -- Review Content
  title VARCHAR(255),
  content TEXT,

  -- Response from venue
  response TEXT,
  response_at TIMESTAMPTZ,

  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. VENUE FAVORITES (Artists saving venues)
CREATE TABLE IF NOT EXISTS venue_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_venues_owner ON venues(owner_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_venues_active ON venues(is_active);
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_venue_equipment_venue ON venue_equipment(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_rooms_venue ON venue_rooms(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue ON venue_reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_favorites_user ON venue_favorites(user_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_special_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_favorites ENABLE ROW LEVEL SECURITY;

-- Venues: Public read, owner write
CREATE POLICY "Venues are viewable by everyone" ON venues FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create venues" ON venues FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their venues" ON venues FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their venues" ON venues FOR DELETE USING (auth.uid() = owner_id);

-- Gallery: Public read, owner write
CREATE POLICY "Venue gallery viewable by everyone" ON venue_gallery FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage gallery" ON venue_gallery FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Equipment: Public read, owner write
CREATE POLICY "Venue equipment viewable by everyone" ON venue_equipment FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage equipment" ON venue_equipment FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Rooms: Public read, owner write
CREATE POLICY "Venue rooms viewable by everyone" ON venue_rooms FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage rooms" ON venue_rooms FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Hours: Public read, owner write
CREATE POLICY "Venue hours viewable by everyone" ON venue_hours FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage hours" ON venue_hours FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Special Hours: Public read, owner write
CREATE POLICY "Venue special hours viewable by everyone" ON venue_special_hours FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage special hours" ON venue_special_hours FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Amenities: Public read, owner write
CREATE POLICY "Venue amenities viewable by everyone" ON venue_amenities FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage amenities" ON venue_amenities FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Staff: Owner only (private contact info)
CREATE POLICY "Venue staff visible to owner only" ON venue_staff FOR SELECT USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);
CREATE POLICY "Venue owners can manage staff" ON venue_staff FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Reviews: Public read, authenticated write
CREATE POLICY "Venue reviews viewable by everyone" ON venue_reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Authenticated users can create reviews" ON venue_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update their reviews" ON venue_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Favorites: User only
CREATE POLICY "Users can view their favorites" ON venue_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their favorites" ON venue_favorites FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate slug from venue name
CREATE OR REPLACE FUNCTION generate_venue_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_venue_slug
  BEFORE INSERT ON venues
  FOR EACH ROW
  EXECUTE FUNCTION generate_venue_slug();

-- Update timestamp
CREATE OR REPLACE FUNCTION update_venue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_venues_timestamp
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_venue_timestamp();

-- Get venue average rating
CREATE OR REPLACE FUNCTION get_venue_rating(venue_uuid UUID)
RETURNS TABLE (
  avg_rating DECIMAL,
  total_reviews INTEGER,
  avg_communication DECIMAL,
  avg_hospitality DECIMAL,
  avg_equipment DECIMAL,
  avg_ambience DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating)::DECIMAL, 1),
    COUNT(*)::INTEGER,
    ROUND(AVG(communication_rating)::DECIMAL, 1),
    ROUND(AVG(hospitality_rating)::DECIMAL, 1),
    ROUND(AVG(equipment_rating)::DECIMAL, 1),
    ROUND(AVG(ambience_rating)::DECIMAL, 1)
  FROM venue_reviews
  WHERE venue_id = venue_uuid AND is_visible = true;
END;
$$ LANGUAGE plpgsql;

-- Search venues
CREATE OR REPLACE FUNCTION search_venues(
  search_query TEXT DEFAULT NULL,
  venue_type_filter VARCHAR DEFAULT NULL,
  city_filter VARCHAR DEFAULT NULL,
  min_capacity INTEGER DEFAULT NULL,
  max_capacity INTEGER DEFAULT NULL
)
RETURNS SETOF venues AS $$
BEGIN
  RETURN QUERY
  SELECT v.*
  FROM venues v
  WHERE v.is_active = true
    AND (search_query IS NULL OR
         v.name ILIKE '%' || search_query || '%' OR
         v.description ILIKE '%' || search_query || '%' OR
         v.city ILIKE '%' || search_query || '%')
    AND (venue_type_filter IS NULL OR v.venue_type = venue_type_filter)
    AND (city_filter IS NULL OR v.city ILIKE '%' || city_filter || '%')
    AND (min_capacity IS NULL OR v.capacity_max >= min_capacity)
    AND (max_capacity IS NULL OR v.capacity_min <= max_capacity)
  ORDER BY v.is_featured DESC, v.created_at DESC;
END;
$$ LANGUAGE plpgsql;
