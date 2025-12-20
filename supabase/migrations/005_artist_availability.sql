-- =====================================================
-- ARTIST AVAILABILITY SYSTEM
-- Migration: 005_artist_availability.sql
-- Created: December 20, 2024
-- Description: Complete availability calendar system for artists
-- =====================================================

-- 1. Individual Date Availability
-- Stores availability for specific dates
CREATE TABLE IF NOT EXISTS artist_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  -- 'available', 'booked', 'blocked', 'tentative'
  visibility VARCHAR(20) DEFAULT 'visible',
  -- 'visible' = Show on public profile
  -- 'no_name' = Show as busy, no event name
  -- 'with_link' = Show event name with link
  -- 'hidden' = Don't show at all
  event_name VARCHAR(255),
  event_link VARCHAR(500),
  booking_id UUID, -- Will reference bookings table when created
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, date)
);

-- 2. Recurring Availability Rules
-- E.g., "Available Fri-Sun every week"
CREATE TABLE IF NOT EXISTS artist_availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_type VARCHAR(20) NOT NULL,
  -- 'weekly' = specific days of week
  -- 'monthly' = specific days of month
  -- 'always' = always available
  -- 'never' = never available (must request)
  days_of_week INTEGER[], -- 0=Sunday, 1=Monday, ... 6=Saturday
  days_of_month INTEGER[], -- 1-31
  start_date DATE, -- Rule starts from this date
  end_date DATE, -- Rule ends at this date (null = forever)
  is_available BOOLEAN DEFAULT true, -- true=available, false=unavailable
  priority INTEGER DEFAULT 0, -- Higher priority rules override lower
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Blocked Date Ranges
-- For vacations, breaks, etc.
CREATE TABLE IF NOT EXISTS artist_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(100), -- 'vacation', 'personal', 'other_booking', etc.
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

-- 4. Artist Availability Settings
-- Global settings for the artist
CREATE TABLE IF NOT EXISTS artist_availability_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  default_status VARCHAR(20) DEFAULT 'available',
  -- 'available' = Available unless marked otherwise
  -- 'unavailable' = Unavailable unless marked available
  -- 'request_only' = Must request, no calendar shown
  advance_booking_days INTEGER DEFAULT 365, -- How far ahead can book
  minimum_notice_hours INTEGER DEFAULT 48, -- Minimum notice for booking
  allow_same_day BOOLEAN DEFAULT false,
  show_calendar_publicly BOOLEAN DEFAULT true,
  auto_decline_conflicts BOOLEAN DEFAULT true,
  buffer_hours_before INTEGER DEFAULT 0, -- Hours blocked before event
  buffer_hours_after INTEGER DEFAULT 0, -- Hours blocked after event
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_artist_availability_artist_date
  ON artist_availability(artist_id, date);
CREATE INDEX IF NOT EXISTS idx_artist_availability_date
  ON artist_availability(date);
CREATE INDEX IF NOT EXISTS idx_artist_availability_status
  ON artist_availability(status);
CREATE INDEX IF NOT EXISTS idx_artist_blocked_dates_artist
  ON artist_blocked_dates(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_blocked_dates_range
  ON artist_blocked_dates(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_artist_availability_rules_artist
  ON artist_availability_rules(artist_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE artist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_availability_settings ENABLE ROW LEVEL SECURITY;

-- artist_availability policies
CREATE POLICY "Artists can manage own availability"
  ON artist_availability FOR ALL
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Public can view visible availability"
  ON artist_availability FOR SELECT
  TO anon, authenticated
  USING (
    visibility IN ('visible', 'no_name', 'with_link')
    OR artist_id = auth.uid()
  );

-- artist_availability_rules policies
CREATE POLICY "Artists can manage own rules"
  ON artist_availability_rules FOR ALL
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Public can view active rules"
  ON artist_availability_rules FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR artist_id = auth.uid());

-- artist_blocked_dates policies
CREATE POLICY "Artists can manage own blocked dates"
  ON artist_blocked_dates FOR ALL
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Public can view blocked dates for availability check"
  ON artist_blocked_dates FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR artist_id = auth.uid());

-- artist_availability_settings policies
CREATE POLICY "Artists can manage own settings"
  ON artist_availability_settings FOR ALL
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Public can view settings for booking"
  ON artist_availability_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if artist is available on a specific date
CREATE OR REPLACE FUNCTION check_artist_availability(
  p_artist_id UUID,
  p_date DATE
) RETURNS TABLE (
  is_available BOOLEAN,
  status VARCHAR(20),
  reason TEXT
) AS $$
DECLARE
  v_settings artist_availability_settings%ROWTYPE;
  v_specific artist_availability%ROWTYPE;
  v_blocked artist_blocked_dates%ROWTYPE;
  v_rule artist_availability_rules%ROWTYPE;
  v_day_of_week INTEGER;
BEGIN
  -- Get artist settings (or use defaults)
  SELECT * INTO v_settings
  FROM artist_availability_settings
  WHERE artist_id = p_artist_id;

  -- Check for specific date entry first (highest priority)
  SELECT * INTO v_specific
  FROM artist_availability
  WHERE artist_id = p_artist_id AND date = p_date;

  IF FOUND THEN
    RETURN QUERY SELECT
      v_specific.status = 'available',
      v_specific.status,
      COALESCE(v_specific.notes, v_specific.event_name, 'Specific date entry')::TEXT;
    RETURN;
  END IF;

  -- Check for blocked date range
  SELECT * INTO v_blocked
  FROM artist_blocked_dates
  WHERE artist_id = p_artist_id
    AND is_active = true
    AND p_date BETWEEN start_date AND end_date;

  IF FOUND THEN
    RETURN QUERY SELECT
      false,
      'blocked'::VARCHAR(20),
      COALESCE(v_blocked.reason, 'Blocked period')::TEXT;
    RETURN;
  END IF;

  -- Check availability rules
  v_day_of_week := EXTRACT(DOW FROM p_date)::INTEGER;

  SELECT * INTO v_rule
  FROM artist_availability_rules
  WHERE artist_id = p_artist_id
    AND is_active = true
    AND (start_date IS NULL OR p_date >= start_date)
    AND (end_date IS NULL OR p_date <= end_date)
    AND (
      (rule_type = 'weekly' AND v_day_of_week = ANY(days_of_week))
      OR (rule_type = 'monthly' AND EXTRACT(DAY FROM p_date)::INTEGER = ANY(days_of_month))
      OR rule_type = 'always'
    )
  ORDER BY priority DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT
      v_rule.is_available,
      CASE WHEN v_rule.is_available THEN 'available' ELSE 'unavailable' END::VARCHAR(20),
      COALESCE(v_rule.notes, 'Based on availability rule')::TEXT;
    RETURN;
  END IF;

  -- Fall back to default setting
  IF v_settings.default_status IS NOT NULL AND v_settings.default_status = 'available' THEN
    RETURN QUERY SELECT true, 'available'::VARCHAR(20), 'Default available'::TEXT;
  ELSIF v_settings.default_status IS NOT NULL THEN
    RETURN QUERY SELECT false, 'unavailable'::VARCHAR(20), 'Default unavailable'::TEXT;
  ELSE
    -- No settings found, default to available
    RETURN QUERY SELECT true, 'available'::VARCHAR(20), 'Default available (no settings)'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get availability for a date range
CREATE OR REPLACE FUNCTION get_artist_availability_range(
  p_artist_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  date DATE,
  is_available BOOLEAN,
  status VARCHAR(20),
  event_name VARCHAR(255),
  visibility VARCHAR(20)
) AS $$
DECLARE
  v_current_date DATE;
  v_result RECORD;
  v_specific artist_availability%ROWTYPE;
BEGIN
  v_current_date := p_start_date;

  WHILE v_current_date <= p_end_date LOOP
    -- Check for specific entry
    SELECT * INTO v_specific
    FROM artist_availability
    WHERE artist_id = p_artist_id AND artist_availability.date = v_current_date;

    IF FOUND THEN
      RETURN QUERY SELECT
        v_current_date,
        v_specific.status = 'available',
        v_specific.status,
        v_specific.event_name,
        v_specific.visibility;
    ELSE
      -- Use the check function for calculated availability
      SELECT * INTO v_result
      FROM check_artist_availability(p_artist_id, v_current_date);

      RETURN QUERY SELECT
        v_current_date,
        v_result.is_available,
        v_result.status,
        NULL::VARCHAR(255),
        'visible'::VARCHAR(20);
    END IF;

    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set availability for a single date
CREATE OR REPLACE FUNCTION set_artist_availability(
  p_artist_id UUID,
  p_date DATE,
  p_status VARCHAR(20) DEFAULT 'available',
  p_visibility VARCHAR(20) DEFAULT 'visible',
  p_event_name VARCHAR(255) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS artist_availability AS $$
DECLARE
  v_result artist_availability;
BEGIN
  INSERT INTO artist_availability (artist_id, date, status, visibility, event_name, notes)
  VALUES (p_artist_id, p_date, p_status, p_visibility, p_event_name, p_notes)
  ON CONFLICT (artist_id, date)
  DO UPDATE SET
    status = EXCLUDED.status,
    visibility = EXCLUDED.visibility,
    event_name = EXCLUDED.event_name,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to block a date range
CREATE OR REPLACE FUNCTION block_artist_dates(
  p_artist_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_reason VARCHAR(100) DEFAULT 'blocked',
  p_notes TEXT DEFAULT NULL
) RETURNS artist_blocked_dates AS $$
DECLARE
  v_result artist_blocked_dates;
BEGIN
  INSERT INTO artist_blocked_dates (artist_id, start_date, end_date, reason, notes)
  VALUES (p_artist_id, p_start_date, p_end_date, p_reason, p_notes)
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_availability_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artist_availability_updated
  BEFORE UPDATE ON artist_availability
  FOR EACH ROW EXECUTE FUNCTION update_availability_timestamp();

CREATE TRIGGER artist_availability_rules_updated
  BEFORE UPDATE ON artist_availability_rules
  FOR EACH ROW EXECUTE FUNCTION update_availability_timestamp();

CREATE TRIGGER artist_blocked_dates_updated
  BEFORE UPDATE ON artist_blocked_dates
  FOR EACH ROW EXECUTE FUNCTION update_availability_timestamp();

CREATE TRIGGER artist_availability_settings_updated
  BEFORE UPDATE ON artist_availability_settings
  FOR EACH ROW EXECUTE FUNCTION update_availability_timestamp();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE artist_availability IS 'Individual date availability entries for artists';
COMMENT ON TABLE artist_availability_rules IS 'Recurring availability rules (e.g., available weekends only)';
COMMENT ON TABLE artist_blocked_dates IS 'Blocked date ranges (vacations, breaks)';
COMMENT ON TABLE artist_availability_settings IS 'Global availability settings per artist';
COMMENT ON FUNCTION check_artist_availability IS 'Check if an artist is available on a specific date';
COMMENT ON FUNCTION get_artist_availability_range IS 'Get availability for a date range';
COMMENT ON FUNCTION set_artist_availability IS 'Set or update availability for a single date';
COMMENT ON FUNCTION block_artist_dates IS 'Block a date range for an artist';
