-- ============================================
-- PHASE 12: VENUE SYSTEM ENHANCEMENT
-- Adds missing columns + creates related tables
-- ============================================

-- 1. ADD MISSING COLUMNS TO EXISTING VENUES TABLE
ALTER TABLE venues ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Germany';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS tiktok VARCHAR(255);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS capacity_min INTEGER;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS capacity_max INTEGER;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Update price_range to use VARCHAR instead of INTEGER
ALTER TABLE venues ADD COLUMN IF NOT EXISTS price_range_new VARCHAR(20) CHECK (price_range_new IN ('budget', 'moderate', 'premium', 'luxury'));
UPDATE venues SET price_range_new = CASE
  WHEN price_range = 1 THEN 'budget'
  WHEN price_range = 2 THEN 'moderate'
  WHEN price_range = 3 THEN 'premium'
  WHEN price_range = 4 THEN 'luxury'
  ELSE 'moderate'
END WHERE price_range IS NOT NULL;
ALTER TABLE venues DROP COLUMN IF EXISTS price_range;
ALTER TABLE venues RENAME COLUMN price_range_new TO price_range;

-- Rename existing columns to match our schema
ALTER TABLE venues RENAME COLUMN image_url TO cover_image;

-- Update venue_type CHECK constraint
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_venue_type_check;
ALTER TABLE venues ADD CONSTRAINT venues_venue_type_check
  CHECK (venue_type IN ('club', 'bar', 'concert_hall', 'theater', 'outdoor', 'festival', 'private_venue', 'restaurant', 'hotel', 'other'));

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
  category VARCHAR(50) CHECK (category IN ('audio', 'lighting', 'stage', 'video', 'backline', 'dj_equipment', 'other')),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  quantity INTEGER DEFAULT 1,
  condition VARCHAR(50) CHECK (condition IN ('excellent', 'good', 'fair', 'needs_maintenance')),
  is_included BOOLEAN DEFAULT TRUE,
  extra_cost DECIMAL(10, 2),
  specifications TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VENUE ROOMS
CREATE TABLE IF NOT EXISTS venue_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  room_type VARCHAR(50) CHECK (room_type IN ('main_hall', 'stage', 'greenroom', 'dressing_room', 'vip_lounge', 'backstage', 'storage', 'office', 'other')),
  capacity INTEGER,
  size_sqm DECIMAL(10, 2),
  floor_level INTEGER DEFAULT 0,
  has_bathroom BOOLEAN DEFAULT FALSE,
  has_shower BOOLEAN DEFAULT FALSE,
  has_mirror BOOLEAN DEFAULT FALSE,
  has_wifi BOOLEAN DEFAULT TRUE,
  has_ac BOOLEAN DEFAULT FALSE,
  amenities TEXT[],
  photos TEXT[],
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VENUE HOURS (Replacing opening_hours JSONB with proper table)
CREATE TABLE IF NOT EXISTS venue_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  notes VARCHAR(255),
  UNIQUE(venue_id, day_of_week),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VENUE SPECIAL HOURS
CREATE TABLE IF NOT EXISTS venue_special_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VENUE AMENITIES (Replacing amenities TEXT[] with proper table)
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

-- 8. VENUE STAFF
CREATE TABLE IF NOT EXISTS venue_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary_contact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. VENUE REVIEWS (Replacing rating/review_count with proper table)
CREATE TABLE IF NOT EXISTS venue_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  hospitality_rating INTEGER CHECK (hospitality_rating BETWEEN 1 AND 5),
  equipment_rating INTEGER CHECK (equipment_rating BETWEEN 1 AND 5),
  ambience_rating INTEGER CHECK (ambience_rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  content TEXT,
  response TEXT,
  response_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. VENUE FAVORITES
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
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);
CREATE INDEX IF NOT EXISTS idx_venue_gallery_venue ON venue_gallery(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_equipment_venue ON venue_equipment(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_rooms_venue ON venue_rooms(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_hours_venue ON venue_hours(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue ON venue_reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_reviewer ON venue_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_venue_favorites_user ON venue_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_favorites_venue ON venue_favorites(venue_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE venue_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_special_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_favorites ENABLE ROW LEVEL SECURITY;

-- Venues policies (update existing if needed)
DROP POLICY IF EXISTS "Venues are viewable by everyone" ON venues;
DROP POLICY IF EXISTS "Users can create venues" ON venues;
DROP POLICY IF EXISTS "Owners can update their venues" ON venues;
DROP POLICY IF EXISTS "Owners can delete their venues" ON venues;

CREATE POLICY "Venues are viewable by everyone" ON venues FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create venues" ON venues FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their venues" ON venues FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their venues" ON venues FOR DELETE USING (auth.uid() = owner_id);

-- Gallery policies
CREATE POLICY "Venue gallery viewable by everyone" ON venue_gallery FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage gallery" ON venue_gallery FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Equipment policies
CREATE POLICY "Venue equipment viewable by everyone" ON venue_equipment FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage equipment" ON venue_equipment FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Rooms policies
CREATE POLICY "Venue rooms viewable by everyone" ON venue_rooms FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage rooms" ON venue_rooms FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Hours policies
CREATE POLICY "Venue hours viewable by everyone" ON venue_hours FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage hours" ON venue_hours FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Special hours policies
CREATE POLICY "Venue special hours viewable by everyone" ON venue_special_hours FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage special hours" ON venue_special_hours FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Amenities policies
CREATE POLICY "Venue amenities viewable by everyone" ON venue_amenities FOR SELECT USING (true);
CREATE POLICY "Venue owners can manage amenities" ON venue_amenities FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Staff policies
CREATE POLICY "Venue staff visible to owner only" ON venue_staff FOR SELECT USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);
CREATE POLICY "Venue owners can manage staff" ON venue_staff FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Reviews policies
CREATE POLICY "Venue reviews viewable by everyone" ON venue_reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Authenticated users can create reviews" ON venue_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update their reviews" ON venue_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Favorites policies
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

DROP TRIGGER IF EXISTS set_venue_slug ON venues;
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

DROP TRIGGER IF EXISTS update_venues_timestamp ON venues;
CREATE TRIGGER update_venues_timestamp
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_venue_timestamp();

-- Get venue average rating (from venue_reviews table)
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

-- Search venues (enhanced)
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
