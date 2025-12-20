-- =====================================================
-- ARTIST GEOLOCATION FOR MAP VIEW
-- =====================================================

-- Add geolocation columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_formatted TEXT,
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ;

-- Create spatial index for fast geo queries (if PostGIS available)
-- Note: Supabase has PostGIS enabled by default
DO $$
BEGIN
  -- Check if we can use PostGIS
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    -- Add geography point column for efficient geo queries
    ALTER TABLE users ADD COLUMN IF NOT EXISTS location_point geography(POINT, 4326);

    -- Create spatial index
    CREATE INDEX IF NOT EXISTS idx_users_location_point
      ON users USING GIST (location_point);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'PostGIS not available, using basic lat/lng';
END $$;

-- Create index on lat/lng for basic queries
CREATE INDEX IF NOT EXISTS idx_users_latitude ON users(latitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_longitude ON users(longitude) WHERE longitude IS NOT NULL;

-- Function to update location_point when lat/lng changes
CREATE OR REPLACE FUNCTION update_user_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    -- Update the geography point
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
      NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    NEW.location_updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_location_update ON users;
CREATE TRIGGER user_location_update
  BEFORE INSERT OR UPDATE OF latitude, longitude ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_location_point();

-- =====================================================
-- HELPER FUNCTIONS FOR MAP QUERIES
-- =====================================================

-- Function to find artists within radius (in km)
CREATE OR REPLACE FUNCTION find_artists_in_radius(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_radius_km INTEGER DEFAULT 50,
  p_user_type VARCHAR DEFAULT 'artist'
) RETURNS TABLE (
  id UUID,
  vorname VARCHAR,
  nachname VARCHAR,
  kuenstlername VARCHAR,
  profile_image_url TEXT,
  city VARCHAR,
  genre VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL
) AS $$
BEGIN
  -- Check if PostGIS is available
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    -- Use PostGIS for accurate distance calculation
    RETURN QUERY
    SELECT
      u.id,
      u.vorname,
      u.nachname,
      u.kuenstlername,
      u.profile_image_url,
      u.city,
      u.genre,
      u.latitude,
      u.longitude,
      ROUND((ST_Distance(
        u.location_point,
        ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
      ) / 1000)::DECIMAL, 2) as distance_km
    FROM users u
    WHERE u.user_type = p_user_type
      AND u.latitude IS NOT NULL
      AND u.longitude IS NOT NULL
      AND u.location_point IS NOT NULL
      AND ST_DWithin(
        u.location_point,
        ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
        p_radius_km * 1000  -- Convert km to meters
      )
    ORDER BY distance_km ASC;
  ELSE
    -- Fallback: Haversine formula for basic lat/lng
    RETURN QUERY
    SELECT
      u.id,
      u.vorname,
      u.nachname,
      u.kuenstlername,
      u.profile_image_url,
      u.city,
      u.genre,
      u.latitude,
      u.longitude,
      ROUND((
        6371 * acos(
          cos(radians(p_latitude)) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians(p_longitude)) +
          sin(radians(p_latitude)) * sin(radians(u.latitude))
        )
      )::DECIMAL, 2) as distance_km
    FROM users u
    WHERE u.user_type = p_user_type
      AND u.latitude IS NOT NULL
      AND u.longitude IS NOT NULL
      AND (
        6371 * acos(
          cos(radians(p_latitude)) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians(p_longitude)) +
          sin(radians(p_latitude)) * sin(radians(u.latitude))
        )
      ) <= p_radius_km
    ORDER BY distance_km ASC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all artists with locations (for initial map load)
CREATE OR REPLACE FUNCTION get_artists_with_locations(
  p_user_type VARCHAR DEFAULT 'artist',
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  id UUID,
  vorname VARCHAR,
  nachname VARCHAR,
  kuenstlername VARCHAR,
  profile_image_url TEXT,
  city VARCHAR,
  genre VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  user_type VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.vorname,
    u.nachname,
    u.kuenstlername,
    u.profile_image_url,
    u.city,
    u.genre,
    u.latitude,
    u.longitude,
    u.user_type
  FROM users u
  WHERE (p_user_type IS NULL OR u.user_type = p_user_type)
    AND u.latitude IS NOT NULL
    AND u.longitude IS NOT NULL
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Added columns to users:
--   - latitude, longitude (coordinates)
--   - location_address, location_formatted (text)
--   - location_point (PostGIS geography)
--   - location_updated_at (timestamp)
--
-- Functions created:
--   - find_artists_in_radius(lat, lng, radius_km, user_type)
--   - get_artists_with_locations(user_type, limit)
-- =====================================================
