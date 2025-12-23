-- =============================================
-- PHASE 8: Analytics & Dashboard System
-- Migration: 009_analytics.sql
-- Created: December 2024
-- =============================================

-- =============================================
-- SECTION 1: ENUMS
-- =============================================

-- Analytics event types
CREATE TYPE analytics_event_type AS ENUM (
  'profile_view',
  'booking_created',
  'booking_completed',
  'booking_cancelled',
  'message_sent',
  'review_submitted',
  'favorite_added',
  'search_performed',
  'page_view'
);

-- Period types for analytics queries
CREATE TYPE analytics_period AS ENUM (
  '7d',
  '30d',
  '90d',
  '12m',
  'all'
);

-- =============================================
-- SECTION 2: TABLES
-- =============================================

-- Table: analytics_events (raw event tracking)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type analytics_event_type NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  user_agent TEXT,
  ip_hash TEXT, -- Hashed for GDPR compliance
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: daily_artist_stats (aggregated daily stats for artists)
CREATE TABLE daily_artist_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  profile_views INTEGER DEFAULT 0,
  bookings_received INTEGER DEFAULT 0,
  bookings_completed INTEGER DEFAULT 0,
  bookings_cancelled INTEGER DEFAULT 0,
  earnings DECIMAL(12,2) DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  reviews_received INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  new_followers INTEGER DEFAULT 0,
  search_appearances INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, date)
);

-- Table: daily_fan_stats (aggregated daily stats for fans/clients)
CREATE TABLE daily_fan_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_spent DECIMAL(12,2) DEFAULT 0,
  bookings_made INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  reviews_written INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  artists_favorited INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fan_id, date)
);

-- Table: daily_platform_stats (admin platform-wide stats)
CREATE TABLE daily_platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  -- User metrics
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  -- Artist metrics
  total_artists INTEGER DEFAULT 0,
  new_artists INTEGER DEFAULT 0,
  active_artists INTEGER DEFAULT 0,
  -- Booking metrics
  total_bookings INTEGER DEFAULT 0,
  new_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  pending_bookings INTEGER DEFAULT 0,
  -- Revenue metrics
  total_revenue DECIMAL(14,2) DEFAULT 0,
  daily_revenue DECIMAL(14,2) DEFAULT 0,
  platform_fees DECIMAL(14,2) DEFAULT 0,
  -- Review metrics
  total_reviews INTEGER DEFAULT 0,
  new_reviews INTEGER DEFAULT 0,
  average_platform_rating DECIMAL(3,2),
  -- Engagement metrics
  total_messages INTEGER DEFAULT 0,
  new_messages INTEGER DEFAULT 0,
  total_favorites INTEGER DEFAULT 0,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECTION 3: INDEXES
-- =============================================

-- Analytics events indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_target_user_id ON analytics_events(target_user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);

-- Daily artist stats indexes
CREATE INDEX idx_daily_artist_stats_artist_id ON daily_artist_stats(artist_id);
CREATE INDEX idx_daily_artist_stats_date ON daily_artist_stats(date DESC);
CREATE INDEX idx_daily_artist_stats_artist_date ON daily_artist_stats(artist_id, date DESC);

-- Daily fan stats indexes
CREATE INDEX idx_daily_fan_stats_fan_id ON daily_fan_stats(fan_id);
CREATE INDEX idx_daily_fan_stats_date ON daily_fan_stats(date DESC);
CREATE INDEX idx_daily_fan_stats_fan_date ON daily_fan_stats(fan_id, date DESC);

-- Daily platform stats indexes
CREATE INDEX idx_daily_platform_stats_date ON daily_platform_stats(date DESC);

-- =============================================
-- SECTION 4: RLS POLICIES
-- =============================================

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_artist_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_fan_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_platform_stats ENABLE ROW LEVEL SECURITY;

-- Analytics events: Users can see events they triggered or are targets of
CREATE POLICY "Users can view their own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = target_user_id);

-- Artists can view their own stats
CREATE POLICY "Artists can view their own daily stats"
  ON daily_artist_stats FOR SELECT
  USING (auth.uid() = artist_id);

-- Fans can view their own stats
CREATE POLICY "Fans can view their own daily stats"
  ON daily_fan_stats FOR SELECT
  USING (auth.uid() = fan_id);

-- Only admins can view platform stats (via service role)
CREATE POLICY "Admins can view platform stats"
  ON daily_platform_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- =============================================
-- SECTION 5: RPC FUNCTIONS - Artist Analytics
-- =============================================

-- Function 1: Get artist dashboard stats
CREATE OR REPLACE FUNCTION get_artist_dashboard_stats(
  p_artist_id UUID,
  p_period TEXT DEFAULT '30d'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_result JSON;
BEGIN
  -- Calculate start date based on period
  v_start_date := CASE p_period
    WHEN '7d' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN CURRENT_DATE - INTERVAL '90 days'
    WHEN '12m' THEN CURRENT_DATE - INTERVAL '12 months'
    ELSE '1970-01-01'::DATE
  END;

  SELECT json_build_object(
    'total_earnings', COALESCE(SUM(earnings), 0),
    'total_bookings', COALESCE(SUM(bookings_received), 0),
    'completed_bookings', COALESCE(SUM(bookings_completed), 0),
    'cancelled_bookings', COALESCE(SUM(bookings_cancelled), 0),
    'pending_bookings', COALESCE(SUM(bookings_received) - SUM(bookings_completed) - SUM(bookings_cancelled), 0),
    'profile_views', COALESCE(SUM(profile_views), 0),
    'messages_received', COALESCE(SUM(messages_received), 0),
    'reviews_received', COALESCE(SUM(reviews_received), 0),
    'new_followers', COALESCE(SUM(new_followers), 0),
    'average_rating', ROUND(COALESCE(AVG(average_rating), 0), 2),
    'period', p_period,
    'start_date', v_start_date,
    'end_date', CURRENT_DATE
  ) INTO v_result
  FROM daily_artist_stats
  WHERE artist_id = p_artist_id
    AND date >= v_start_date;

  RETURN v_result;
END;
$$;

-- Function 2: Get artist earnings chart data
CREATE OR REPLACE FUNCTION get_artist_earnings_chart(
  p_artist_id UUID,
  p_period TEXT DEFAULT '30d'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_result JSON;
BEGIN
  v_start_date := CASE p_period
    WHEN '7d' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN CURRENT_DATE - INTERVAL '90 days'
    WHEN '12m' THEN CURRENT_DATE - INTERVAL '12 months'
    ELSE '1970-01-01'::DATE
  END;

  SELECT json_agg(
    json_build_object(
      'date', date,
      'earnings', earnings,
      'bookings', bookings_completed
    ) ORDER BY date
  ) INTO v_result
  FROM daily_artist_stats
  WHERE artist_id = p_artist_id
    AND date >= v_start_date;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

-- Function 3: Get artist bookings breakdown (for pie chart)
CREATE OR REPLACE FUNCTION get_artist_bookings_chart(
  p_artist_id UUID,
  p_period TEXT DEFAULT '30d'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_completed INTEGER;
  v_cancelled INTEGER;
  v_pending INTEGER;
BEGIN
  v_start_date := CASE p_period
    WHEN '7d' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN CURRENT_DATE - INTERVAL '90 days'
    WHEN '12m' THEN CURRENT_DATE - INTERVAL '12 months'
    ELSE '1970-01-01'::DATE
  END;

  SELECT
    COALESCE(SUM(bookings_completed), 0),
    COALESCE(SUM(bookings_cancelled), 0),
    COALESCE(SUM(bookings_received) - SUM(bookings_completed) - SUM(bookings_cancelled), 0)
  INTO v_completed, v_cancelled, v_pending
  FROM daily_artist_stats
  WHERE artist_id = p_artist_id
    AND date >= v_start_date;

  RETURN json_build_array(
    json_build_object('name', 'Abgeschlossen', 'value', v_completed, 'color', '#22c55e'),
    json_build_object('name', 'Storniert', 'value', v_cancelled, 'color', '#ef4444'),
    json_build_object('name', 'Ausstehend', 'value', v_pending, 'color', '#f59e0b')
  );
END;
$$;

-- Function 4: Get artist monthly comparison
CREATE OR REPLACE FUNCTION get_artist_monthly_comparison(
  p_artist_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_this_month JSON;
  v_last_month JSON;
BEGIN
  -- This month stats
  SELECT json_build_object(
    'earnings', COALESCE(SUM(earnings), 0),
    'bookings', COALESCE(SUM(bookings_completed), 0),
    'profile_views', COALESCE(SUM(profile_views), 0),
    'reviews', COALESCE(SUM(reviews_received), 0)
  ) INTO v_this_month
  FROM daily_artist_stats
  WHERE artist_id = p_artist_id
    AND date >= DATE_TRUNC('month', CURRENT_DATE);

  -- Last month stats
  SELECT json_build_object(
    'earnings', COALESCE(SUM(earnings), 0),
    'bookings', COALESCE(SUM(bookings_completed), 0),
    'profile_views', COALESCE(SUM(profile_views), 0),
    'reviews', COALESCE(SUM(reviews_received), 0)
  ) INTO v_last_month
  FROM daily_artist_stats
  WHERE artist_id = p_artist_id
    AND date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    AND date < DATE_TRUNC('month', CURRENT_DATE);

  RETURN json_build_object(
    'this_month', v_this_month,
    'last_month', v_last_month
  );
END;
$$;

-- =============================================
-- SECTION 6: RPC FUNCTIONS - Fan Analytics
-- =============================================

-- Function 5: Get fan dashboard stats
CREATE OR REPLACE FUNCTION get_fan_dashboard_stats(
  p_fan_id UUID,
  p_period TEXT DEFAULT '30d'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_result JSON;
  v_favorite_count INTEGER;
  v_upcoming_events INTEGER;
BEGIN
  v_start_date := CASE p_period
    WHEN '7d' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN CURRENT_DATE - INTERVAL '90 days'
    WHEN '12m' THEN CURRENT_DATE - INTERVAL '12 months'
    ELSE '1970-01-01'::DATE
  END;

  -- Get favorite artists count
  SELECT COUNT(*) INTO v_favorite_count
  FROM favorites
  WHERE user_id = p_fan_id;

  -- Get upcoming events count
  SELECT COUNT(*) INTO v_upcoming_events
  FROM booking_requests br
  WHERE br.requester_id = p_fan_id
    AND br.status IN ('confirmed', 'accepted')
    AND br.event_date > CURRENT_DATE;

  SELECT json_build_object(
    'total_spent', COALESCE(SUM(amount_spent), 0),
    'bookings_made', COALESCE(SUM(bookings_made), 0),
    'events_attended', COALESCE(SUM(events_attended), 0),
    'reviews_written', COALESCE(SUM(reviews_written), 0),
    'favorite_artists', v_favorite_count,
    'upcoming_events', v_upcoming_events,
    'period', p_period,
    'start_date', v_start_date,
    'end_date', CURRENT_DATE
  ) INTO v_result
  FROM daily_fan_stats
  WHERE fan_id = p_fan_id
    AND date >= v_start_date;

  RETURN v_result;
END;
$$;

-- Function 6: Get fan spending chart
CREATE OR REPLACE FUNCTION get_fan_spending_chart(
  p_fan_id UUID,
  p_period TEXT DEFAULT '30d'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_result JSON;
BEGIN
  v_start_date := CASE p_period
    WHEN '7d' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN CURRENT_DATE - INTERVAL '90 days'
    WHEN '12m' THEN CURRENT_DATE - INTERVAL '12 months'
    ELSE '1970-01-01'::DATE
  END;

  SELECT json_agg(
    json_build_object(
      'date', date,
      'amount', amount_spent,
      'bookings', bookings_made
    ) ORDER BY date
  ) INTO v_result
  FROM daily_fan_stats
  WHERE fan_id = p_fan_id
    AND date >= v_start_date;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

-- Function 7: Get fan's favorite/most-booked artists
CREATE OR REPLACE FUNCTION get_fan_favorite_artists(
  p_fan_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(artist_data) INTO v_result
  FROM (
    SELECT json_build_object(
      'artist_id', ap.user_id,
      'artist_name', ap.kuenstlername,
      'profile_image', u.profile_image_url,
      'genre', ap.genre,
      'bookings_count', COUNT(br.id),
      'total_spent', COALESCE(SUM(br.agreed_price), 0),
      'last_booking', MAX(br.event_date)
    ) as artist_data
    FROM booking_requests br
    JOIN artist_profiles ap ON br.artist_id = ap.id
    JOIN users u ON ap.user_id = u.id
    WHERE br.requester_id = p_fan_id
      AND br.status IN ('completed', 'confirmed', 'accepted')
    GROUP BY ap.user_id, ap.kuenstlername, u.profile_image_url, ap.genre
    ORDER BY COUNT(br.id) DESC, SUM(br.agreed_price) DESC
    LIMIT p_limit
  ) sub;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

-- =============================================
-- SECTION 7: RPC FUNCTIONS - Admin Analytics
-- =============================================

-- Function 8: Get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats(
  p_period TEXT DEFAULT '30d'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_result JSON;
  v_total_users INTEGER;
  v_total_artists INTEGER;
  v_total_revenue DECIMAL;
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  v_start_date := CASE p_period
    WHEN '7d' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN CURRENT_DATE - INTERVAL '90 days'
    WHEN '12m' THEN CURRENT_DATE - INTERVAL '12 months'
    ELSE '1970-01-01'::DATE
  END;

  -- Get current totals
  SELECT COUNT(*) INTO v_total_users FROM users WHERE is_active = true;
  SELECT COUNT(*) INTO v_total_artists FROM users WHERE user_type = 'artist' AND is_active = true;

  SELECT json_build_object(
    'total_users', v_total_users,
    'new_users', COALESCE(SUM(new_users), 0),
    'total_artists', v_total_artists,
    'new_artists', COALESCE(SUM(new_artists), 0),
    'total_bookings', COALESCE(SUM(new_bookings), 0),
    'completed_bookings', COALESCE(SUM(completed_bookings), 0),
    'cancelled_bookings', COALESCE(SUM(cancelled_bookings), 0),
    'total_revenue', COALESCE(SUM(daily_revenue), 0),
    'platform_fees', COALESCE(SUM(platform_fees), 0),
    'total_reviews', COALESCE(SUM(new_reviews), 0),
    'average_rating', ROUND(COALESCE(AVG(average_platform_rating), 0), 2),
    'total_messages', COALESCE(SUM(new_messages), 0),
    'period', p_period,
    'start_date', v_start_date,
    'end_date', CURRENT_DATE
  ) INTO v_result
  FROM daily_platform_stats
  WHERE date >= v_start_date;

  RETURN v_result;
END;
$$;

-- Function 9: Get admin growth chart
CREATE OR REPLACE FUNCTION get_admin_growth_chart(
  p_period TEXT DEFAULT '30d',
  p_metric TEXT DEFAULT 'users'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_result JSON;
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  v_start_date := CASE p_period
    WHEN '7d' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN CURRENT_DATE - INTERVAL '90 days'
    WHEN '12m' THEN CURRENT_DATE - INTERVAL '12 months'
    ELSE '1970-01-01'::DATE
  END;

  SELECT json_agg(
    json_build_object(
      'date', date,
      'value', CASE p_metric
        WHEN 'users' THEN new_users
        WHEN 'artists' THEN new_artists
        WHEN 'revenue' THEN daily_revenue
        WHEN 'bookings' THEN new_bookings
        ELSE new_users
      END,
      'cumulative', CASE p_metric
        WHEN 'users' THEN total_users
        WHEN 'artists' THEN total_artists
        WHEN 'revenue' THEN total_revenue
        WHEN 'bookings' THEN total_bookings
        ELSE total_users
      END
    ) ORDER BY date
  ) INTO v_result
  FROM daily_platform_stats
  WHERE date >= v_start_date;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

-- Function 10: Get top artists for admin
CREATE OR REPLACE FUNCTION get_admin_top_artists(
  p_period TEXT DEFAULT '30d',
  p_limit INTEGER DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_result JSON;
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  v_start_date := CASE p_period
    WHEN '7d' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN CURRENT_DATE - INTERVAL '90 days'
    WHEN '12m' THEN CURRENT_DATE - INTERVAL '12 months'
    ELSE '1970-01-01'::DATE
  END;

  SELECT json_agg(artist_data) INTO v_result
  FROM (
    SELECT json_build_object(
      'artist_id', das.artist_id,
      'artist_name', ap.kuenstlername,
      'profile_image', u.profile_image_url,
      'total_earnings', SUM(das.earnings),
      'total_bookings', SUM(das.bookings_completed),
      'profile_views', SUM(das.profile_views),
      'average_rating', ROUND(AVG(das.average_rating), 2)
    ) as artist_data
    FROM daily_artist_stats das
    JOIN users u ON das.artist_id = u.id
    LEFT JOIN artist_profiles ap ON u.id = ap.user_id
    WHERE das.date >= v_start_date
    GROUP BY das.artist_id, ap.kuenstlername, u.profile_image_url
    ORDER BY SUM(das.earnings) DESC
    LIMIT p_limit
  ) sub;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

-- Function 11: Get admin revenue breakdown (for pie chart)
CREATE OR REPLACE FUNCTION get_admin_revenue_breakdown(
  p_period TEXT DEFAULT '30d'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_booking_revenue DECIMAL;
  v_platform_fees DECIMAL;
  v_subscription_revenue DECIMAL;
  v_coin_revenue DECIMAL;
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  v_start_date := CASE p_period
    WHEN '7d' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN '30d' THEN CURRENT_DATE - INTERVAL '30 days'
    WHEN '90d' THEN CURRENT_DATE - INTERVAL '90 days'
    WHEN '12m' THEN CURRENT_DATE - INTERVAL '12 months'
    ELSE '1970-01-01'::DATE
  END;

  -- Get revenue from different sources
  SELECT COALESCE(SUM(amount), 0) INTO v_booking_revenue
  FROM transactions
  WHERE transaction_type IN ('deposit', 'final_payment')
    AND status = 'completed'
    AND created_at >= v_start_date;

  SELECT COALESCE(SUM(amount), 0) INTO v_platform_fees
  FROM transactions
  WHERE transaction_type = 'platform_fee'
    AND status = 'completed'
    AND created_at >= v_start_date;

  SELECT COALESCE(SUM(amount), 0) INTO v_subscription_revenue
  FROM transactions
  WHERE transaction_type = 'subscription'
    AND status = 'completed'
    AND created_at >= v_start_date;

  SELECT COALESCE(SUM(amount), 0) INTO v_coin_revenue
  FROM transactions
  WHERE transaction_type = 'coin_purchase'
    AND status = 'completed'
    AND created_at >= v_start_date;

  RETURN json_build_array(
    json_build_object('name', 'Buchungen', 'value', v_booking_revenue, 'color', '#8b5cf6'),
    json_build_object('name', 'Plattformgebühren', 'value', v_platform_fees, 'color', '#22c55e'),
    json_build_object('name', 'Abonnements', 'value', v_subscription_revenue, 'color', '#3b82f6'),
    json_build_object('name', 'Coin-Käufe', 'value', v_coin_revenue, 'color', '#f59e0b')
  );
END;
$$;

-- =============================================
-- SECTION 8: HELPER FUNCTIONS
-- =============================================

-- Function: Track an analytics event
CREATE OR REPLACE FUNCTION track_analytics_event(
  p_event_type analytics_event_type,
  p_user_id UUID DEFAULT NULL,
  p_target_user_id UUID DEFAULT NULL,
  p_booking_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO analytics_events (
    event_type,
    user_id,
    target_user_id,
    booking_id,
    metadata
  ) VALUES (
    p_event_type,
    COALESCE(p_user_id, auth.uid()),
    p_target_user_id,
    p_booking_id,
    p_metadata
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- Function: Update daily artist stats (called by triggers or cron)
CREATE OR REPLACE FUNCTION update_daily_artist_stats(
  p_artist_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_views INTEGER;
  v_bookings_received INTEGER;
  v_bookings_completed INTEGER;
  v_bookings_cancelled INTEGER;
  v_earnings DECIMAL;
  v_messages INTEGER;
  v_reviews INTEGER;
  v_avg_rating DECIMAL;
  v_new_followers INTEGER;
BEGIN
  -- Count profile views from analytics events
  SELECT COUNT(*) INTO v_profile_views
  FROM analytics_events
  WHERE target_user_id = p_artist_id
    AND event_type = 'profile_view'
    AND DATE(created_at) = p_date;

  -- Count bookings from booking_requests
  SELECT
    COUNT(*) FILTER (WHERE status IN ('pending', 'accepted', 'confirmed', 'completed')),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'cancelled')
  INTO v_bookings_received, v_bookings_completed, v_bookings_cancelled
  FROM booking_requests br
  JOIN artist_profiles ap ON br.artist_id = ap.id
  WHERE ap.user_id = p_artist_id
    AND DATE(br.created_at) = p_date;

  -- Calculate earnings
  SELECT COALESCE(SUM(agreed_price), 0) INTO v_earnings
  FROM booking_requests br
  JOIN artist_profiles ap ON br.artist_id = ap.id
  WHERE ap.user_id = p_artist_id
    AND br.status = 'completed'
    AND DATE(br.updated_at) = p_date;

  -- Count reviews received
  SELECT COUNT(*), ROUND(AVG(overall_rating), 2)
  INTO v_reviews, v_avg_rating
  FROM reviews
  WHERE reviewee_id = p_artist_id
    AND DATE(created_at) = p_date;

  -- Count new followers
  SELECT COUNT(*) INTO v_new_followers
  FROM followers f
  JOIN artist_profiles ap ON f.artist_id = ap.id
  WHERE ap.user_id = p_artist_id
    AND DATE(f.created_at) = p_date;

  -- Upsert daily stats
  INSERT INTO daily_artist_stats (
    artist_id, date, profile_views, bookings_received, bookings_completed,
    bookings_cancelled, earnings, reviews_received, average_rating, new_followers
  ) VALUES (
    p_artist_id, p_date, v_profile_views, v_bookings_received, v_bookings_completed,
    v_bookings_cancelled, v_earnings, v_reviews, v_avg_rating, v_new_followers
  )
  ON CONFLICT (artist_id, date) DO UPDATE SET
    profile_views = EXCLUDED.profile_views,
    bookings_received = EXCLUDED.bookings_received,
    bookings_completed = EXCLUDED.bookings_completed,
    bookings_cancelled = EXCLUDED.bookings_cancelled,
    earnings = EXCLUDED.earnings,
    reviews_received = EXCLUDED.reviews_received,
    average_rating = EXCLUDED.average_rating,
    new_followers = EXCLUDED.new_followers,
    updated_at = NOW();
END;
$$;

-- Function: Update daily platform stats (for admin cron job)
CREATE OR REPLACE FUNCTION update_daily_platform_stats(
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_users INTEGER;
  v_new_users INTEGER;
  v_total_artists INTEGER;
  v_new_artists INTEGER;
  v_new_bookings INTEGER;
  v_completed_bookings INTEGER;
  v_cancelled_bookings INTEGER;
  v_daily_revenue DECIMAL;
  v_total_revenue DECIMAL;
  v_new_reviews INTEGER;
  v_avg_rating DECIMAL;
  v_new_messages INTEGER;
BEGIN
  -- User stats
  SELECT COUNT(*) INTO v_total_users FROM users WHERE is_active = true;
  SELECT COUNT(*) INTO v_new_users FROM users WHERE DATE(created_at) = p_date;
  SELECT COUNT(*) INTO v_total_artists FROM users WHERE user_type = 'artist' AND is_active = true;
  SELECT COUNT(*) INTO v_new_artists FROM users WHERE user_type = 'artist' AND DATE(created_at) = p_date;

  -- Booking stats
  SELECT COUNT(*) INTO v_new_bookings FROM booking_requests WHERE DATE(created_at) = p_date;
  SELECT COUNT(*) INTO v_completed_bookings FROM booking_requests WHERE status = 'completed' AND DATE(updated_at) = p_date;
  SELECT COUNT(*) INTO v_cancelled_bookings FROM booking_requests WHERE status = 'cancelled' AND DATE(updated_at) = p_date;

  -- Revenue stats
  SELECT COALESCE(SUM(amount), 0) INTO v_daily_revenue
  FROM transactions
  WHERE status = 'completed' AND DATE(created_at) = p_date;

  SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
  FROM transactions
  WHERE status = 'completed';

  -- Review stats
  SELECT COUNT(*), ROUND(AVG(overall_rating), 2)
  INTO v_new_reviews, v_avg_rating
  FROM reviews WHERE DATE(created_at) = p_date;

  -- Message stats
  SELECT COUNT(*) INTO v_new_messages FROM messages WHERE DATE(created_at) = p_date;

  -- Upsert platform stats
  INSERT INTO daily_platform_stats (
    date, total_users, new_users, total_artists, new_artists,
    new_bookings, completed_bookings, cancelled_bookings,
    daily_revenue, total_revenue, new_reviews, average_platform_rating, new_messages
  ) VALUES (
    p_date, v_total_users, v_new_users, v_total_artists, v_new_artists,
    v_new_bookings, v_completed_bookings, v_cancelled_bookings,
    v_daily_revenue, v_total_revenue, v_new_reviews, v_avg_rating, v_new_messages
  )
  ON CONFLICT (date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    new_users = EXCLUDED.new_users,
    total_artists = EXCLUDED.total_artists,
    new_artists = EXCLUDED.new_artists,
    new_bookings = EXCLUDED.new_bookings,
    completed_bookings = EXCLUDED.completed_bookings,
    cancelled_bookings = EXCLUDED.cancelled_bookings,
    daily_revenue = EXCLUDED.daily_revenue,
    total_revenue = EXCLUDED.total_revenue,
    new_reviews = EXCLUDED.new_reviews,
    average_platform_rating = EXCLUDED.average_platform_rating,
    new_messages = EXCLUDED.new_messages,
    updated_at = NOW();
END;
$$;

-- =============================================
-- SECTION 9: TRIGGERS
-- =============================================

-- Trigger: Track profile views
CREATE OR REPLACE FUNCTION trigger_track_profile_view()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Track the profile view event
  PERFORM track_analytics_event(
    'profile_view'::analytics_event_type,
    auth.uid(),
    NEW.user_id,
    NULL,
    jsonb_build_object('source', 'artist_profile')
  );
  RETURN NEW;
END;
$$;

-- Note: Profile view tracking would typically be done via API calls
-- rather than database triggers since it's based on page loads

-- =============================================
-- SECTION 10: GRANTS
-- =============================================

-- Grant execute permissions on analytics functions
GRANT EXECUTE ON FUNCTION get_artist_dashboard_stats(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_artist_earnings_chart(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_artist_bookings_chart(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_artist_monthly_comparison(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_fan_dashboard_stats(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_fan_spending_chart(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_fan_favorite_artists(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_growth_chart(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_top_artists(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_revenue_breakdown(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION track_analytics_event(analytics_event_type, UUID, UUID, UUID, JSONB) TO authenticated;

-- =============================================
-- SECTION 11: COMMENTS
-- =============================================

COMMENT ON TABLE analytics_events IS 'Raw event tracking for user actions';
COMMENT ON TABLE daily_artist_stats IS 'Aggregated daily statistics for artist dashboards';
COMMENT ON TABLE daily_fan_stats IS 'Aggregated daily statistics for fan/client dashboards';
COMMENT ON TABLE daily_platform_stats IS 'Platform-wide daily statistics for admin dashboard';

COMMENT ON FUNCTION get_artist_dashboard_stats IS 'Get comprehensive stats for artist dashboard';
COMMENT ON FUNCTION get_artist_earnings_chart IS 'Get earnings data for line chart visualization';
COMMENT ON FUNCTION get_artist_bookings_chart IS 'Get booking status breakdown for pie chart';
COMMENT ON FUNCTION get_artist_monthly_comparison IS 'Compare this month vs last month performance';
COMMENT ON FUNCTION get_fan_dashboard_stats IS 'Get comprehensive stats for fan dashboard';
COMMENT ON FUNCTION get_fan_spending_chart IS 'Get spending data for line chart visualization';
COMMENT ON FUNCTION get_fan_favorite_artists IS 'Get most-booked artists for a fan';
COMMENT ON FUNCTION get_admin_dashboard_stats IS 'Get platform-wide statistics for admin';
COMMENT ON FUNCTION get_admin_growth_chart IS 'Get growth metrics for admin line charts';
COMMENT ON FUNCTION get_admin_top_artists IS 'Get top performing artists for admin';
COMMENT ON FUNCTION get_admin_revenue_breakdown IS 'Get revenue by category for admin pie chart';
COMMENT ON FUNCTION track_analytics_event IS 'Track a user action for analytics';
