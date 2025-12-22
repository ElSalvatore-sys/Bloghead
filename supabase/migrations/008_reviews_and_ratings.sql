-- ============================================================================
-- Migration 008: Reviews & Ratings System
-- Phase 7 - Two-way review system for clients and artists
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Reviewer type enum
CREATE TYPE reviewer_type_enum AS ENUM ('client', 'artist');

-- Review status enum
CREATE TYPE review_status_enum AS ENUM ('pending', 'published', 'flagged', 'removed');

-- Review category enum (for both artists and clients)
CREATE TYPE review_category_enum AS ENUM (
  -- Artist categories (reviewed by clients)
  'performance',
  'communication',
  'punctuality',
  'professionalism',
  'value_for_money',
  -- Client categories (reviewed by artists)
  'clarity',
  'payment_promptness',
  'venue_conditions',
  'respectfulness'
);

-- Badge type enum
CREATE TYPE badge_type_enum AS ENUM (
  'top_rated',           -- 4.8+ average
  'rising_star',         -- New with great ratings
  'reliable',            -- High punctuality score
  'communicator',        -- High communication score
  'crowd_favorite',      -- Most reviews in category
  'verified_pro',        -- Verified professional
  'trusted_client'       -- Client with good history
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Main reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_type reviewer_type_enum NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  title VARCHAR(200),
  content TEXT,
  status review_status_enum DEFAULT 'published',
  is_public BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  flag_count INTEGER DEFAULT 0,
  flag_reason TEXT,
  event_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one review per booking per direction
  CONSTRAINT unique_review_per_booking_direction UNIQUE (booking_id, reviewer_id, reviewee_id)
);

-- Review categories (detailed ratings per category)
CREATE TABLE IF NOT EXISTS review_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  category review_category_enum NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One rating per category per review
  CONSTRAINT unique_category_per_review UNIQUE (review_id, category)
);

-- Review responses (artist can respond to client reviews)
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE UNIQUE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User rating statistics (materialized/computed)
CREATE TABLE IF NOT EXISTS user_rating_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  user_type reviewer_type_enum NOT NULL, -- Whether stats are for them AS artist or AS client
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb,
  category_averages JSONB DEFAULT '{}'::jsonb,
  badges JSONB DEFAULT '[]'::jsonb,
  last_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review helpful votes (track who found reviews helpful)
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_helpful_vote UNIQUE (review_id, user_id)
);

-- Review flags (track flagged reviews)
CREATE TABLE IF NOT EXISTS review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  flagger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_flag_per_user UNIQUE (review_id, flagger_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Reviews indexes
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer_type ON reviews(reviewer_type);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_overall_rating ON reviews(overall_rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_reviewee_public ON reviews(reviewee_id, is_public, status) WHERE status = 'published' AND is_public = true;

-- Review categories indexes
CREATE INDEX idx_review_categories_review_id ON review_categories(review_id);
CREATE INDEX idx_review_categories_category ON review_categories(category);

-- User rating stats indexes
CREATE INDEX idx_user_rating_stats_user_id ON user_rating_stats(user_id);
CREATE INDEX idx_user_rating_stats_average ON user_rating_stats(average_rating DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rating_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Public reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (status = 'published' AND is_public = true);

CREATE POLICY "Users can view their own reviews (given or received)"
  ON reviews FOR SELECT
  USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

CREATE POLICY "Users can create reviews for their completed bookings"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews within 14 days"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id AND created_at > NOW() - INTERVAL '14 days');

-- Review categories policies
CREATE POLICY "Review categories viewable with review"
  ON review_categories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM reviews r
    WHERE r.id = review_id
    AND (r.status = 'published' AND r.is_public = true
         OR r.reviewer_id = auth.uid()
         OR r.reviewee_id = auth.uid())
  ));

CREATE POLICY "Users can add categories to their reviews"
  ON review_categories FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM reviews r
    WHERE r.id = review_id AND r.reviewer_id = auth.uid()
  ));

-- Review responses policies
CREATE POLICY "Review responses are publicly viewable"
  ON review_responses FOR SELECT
  USING (true);

CREATE POLICY "Reviewees can respond to reviews about them"
  ON review_responses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM reviews r
    WHERE r.id = review_id AND r.reviewee_id = auth.uid()
  ));

CREATE POLICY "Responders can update their own responses"
  ON review_responses FOR UPDATE
  USING (auth.uid() = responder_id);

-- User rating stats policies
CREATE POLICY "User rating stats are publicly viewable"
  ON user_rating_stats FOR SELECT
  USING (true);

-- Helpful votes policies
CREATE POLICY "Authenticated users can vote helpful"
  ON review_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpful vote"
  ON review_helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Review flags policies
CREATE POLICY "Authenticated users can flag reviews"
  ON review_flags FOR INSERT
  WITH CHECK (auth.uid() = flagger_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if user can review a booking
CREATE OR REPLACE FUNCTION can_submit_review(
  p_booking_id UUID,
  p_reviewer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_existing_review RECORD;
  v_review_window INTERVAL := INTERVAL '14 days';
BEGIN
  -- Get booking details
  SELECT * INTO v_booking
  FROM booking_requests
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('can_review', false, 'reason', 'Booking not found');
  END IF;

  -- Check if booking is completed
  IF v_booking.status != 'completed' THEN
    RETURN jsonb_build_object('can_review', false, 'reason', 'Booking must be completed first');
  END IF;

  -- Check if user is part of this booking
  IF p_reviewer_id != v_booking.requester_id AND p_reviewer_id != v_booking.artist_id THEN
    RETURN jsonb_build_object('can_review', false, 'reason', 'You are not part of this booking');
  END IF;

  -- Check review window (14 days after event)
  IF v_booking.event_date + v_review_window < NOW() THEN
    RETURN jsonb_build_object('can_review', false, 'reason', 'Review window has expired (14 days after event)');
  END IF;

  -- Check if already reviewed
  SELECT * INTO v_existing_review
  FROM reviews
  WHERE booking_id = p_booking_id AND reviewer_id = p_reviewer_id;

  IF FOUND THEN
    RETURN jsonb_build_object('can_review', false, 'reason', 'You have already reviewed this booking', 'existing_review_id', v_existing_review.id);
  END IF;

  RETURN jsonb_build_object(
    'can_review', true,
    'reviewer_type', CASE WHEN p_reviewer_id = v_booking.requester_id THEN 'client' ELSE 'artist' END,
    'reviewee_id', CASE WHEN p_reviewer_id = v_booking.requester_id THEN v_booking.artist_id ELSE v_booking.requester_id END
  );
END;
$$;

-- Function to submit a review
CREATE OR REPLACE FUNCTION submit_review(
  p_booking_id UUID,
  p_overall_rating INTEGER,
  p_title TEXT DEFAULT NULL,
  p_content TEXT DEFAULT NULL,
  p_category_ratings JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reviewer_id UUID := auth.uid();
  v_can_review JSONB;
  v_booking RECORD;
  v_review_id UUID;
  v_reviewer_type reviewer_type_enum;
  v_reviewee_id UUID;
  v_category RECORD;
BEGIN
  -- Check if can review
  v_can_review := can_submit_review(p_booking_id, v_reviewer_id);

  IF NOT (v_can_review->>'can_review')::boolean THEN
    RETURN jsonb_build_object('success', false, 'error', v_can_review->>'reason');
  END IF;

  -- Get booking for event date
  SELECT * INTO v_booking FROM booking_requests WHERE id = p_booking_id;

  v_reviewer_type := (v_can_review->>'reviewer_type')::reviewer_type_enum;
  v_reviewee_id := (v_can_review->>'reviewee_id')::UUID;

  -- Insert the review
  INSERT INTO reviews (
    booking_id,
    reviewer_id,
    reviewee_id,
    reviewer_type,
    overall_rating,
    title,
    content,
    event_date
  ) VALUES (
    p_booking_id,
    v_reviewer_id,
    v_reviewee_id,
    v_reviewer_type,
    p_overall_rating,
    p_title,
    p_content,
    v_booking.event_date
  ) RETURNING id INTO v_review_id;

  -- Insert category ratings
  FOR v_category IN SELECT * FROM jsonb_array_elements(p_category_ratings)
  LOOP
    INSERT INTO review_categories (review_id, category, rating)
    VALUES (
      v_review_id,
      (v_category.value->>'category')::review_category_enum,
      (v_category.value->>'rating')::INTEGER
    );
  END LOOP;

  -- Update user rating stats
  PERFORM update_user_rating_stats(v_reviewee_id);

  RETURN jsonb_build_object(
    'success', true,
    'review_id', v_review_id,
    'message', 'Review submitted successfully'
  );
END;
$$;

-- Function to update user rating statistics
CREATE OR REPLACE FUNCTION update_user_rating_stats(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats RECORD;
  v_category_avgs JSONB := '{}'::jsonb;
  v_badges JSONB := '[]'::jsonb;
  v_user_type reviewer_type_enum;
  v_rating_dist JSONB;
BEGIN
  -- Determine if user is artist or client based on their reviews received
  SELECT DISTINCT
    CASE WHEN r.reviewer_type = 'client' THEN 'artist'::reviewer_type_enum
         ELSE 'client'::reviewer_type_enum END
  INTO v_user_type
  FROM reviews r
  WHERE r.reviewee_id = p_user_id AND r.status = 'published'
  LIMIT 1;

  -- If no reviews, default to checking if they have artist profile
  IF v_user_type IS NULL THEN
    IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND is_artist = true) THEN
      v_user_type := 'artist';
    ELSE
      v_user_type := 'client';
    END IF;
  END IF;

  -- Calculate main stats
  SELECT
    COUNT(*)::INTEGER as total_reviews,
    COALESCE(AVG(overall_rating), 0)::DECIMAL(3,2) as avg_rating,
    MAX(created_at) as last_review
  INTO v_stats
  FROM reviews
  WHERE reviewee_id = p_user_id AND status = 'published';

  -- Calculate rating distribution
  SELECT jsonb_object_agg(rating::text, cnt)
  INTO v_rating_dist
  FROM (
    SELECT overall_rating as rating, COUNT(*) as cnt
    FROM reviews
    WHERE reviewee_id = p_user_id AND status = 'published'
    GROUP BY overall_rating
    UNION ALL
    SELECT generate_series(1, 5) as rating, 0 as cnt
  ) sub
  WHERE NOT EXISTS (
    SELECT 1 FROM reviews
    WHERE reviewee_id = p_user_id AND status = 'published' AND overall_rating = sub.rating
  ) OR sub.cnt > 0;

  -- Calculate category averages
  SELECT jsonb_object_agg(category::text, avg_rating)
  INTO v_category_avgs
  FROM (
    SELECT rc.category, ROUND(AVG(rc.rating), 2) as avg_rating
    FROM review_categories rc
    JOIN reviews r ON r.id = rc.review_id
    WHERE r.reviewee_id = p_user_id AND r.status = 'published'
    GROUP BY rc.category
  ) sub;

  -- Calculate badges
  IF v_stats.avg_rating >= 4.8 AND v_stats.total_reviews >= 5 THEN
    v_badges := v_badges || '"top_rated"'::jsonb;
  END IF;

  IF v_stats.avg_rating >= 4.5 AND v_stats.total_reviews >= 3 AND v_stats.total_reviews <= 10 THEN
    v_badges := v_badges || '"rising_star"'::jsonb;
  END IF;

  IF (v_category_avgs->>'punctuality')::DECIMAL >= 4.5 THEN
    v_badges := v_badges || '"reliable"'::jsonb;
  END IF;

  IF (v_category_avgs->>'communication')::DECIMAL >= 4.5 THEN
    v_badges := v_badges || '"communicator"'::jsonb;
  END IF;

  -- Upsert stats
  INSERT INTO user_rating_stats (
    user_id,
    user_type,
    total_reviews,
    average_rating,
    rating_distribution,
    category_averages,
    badges,
    last_review_at
  ) VALUES (
    p_user_id,
    v_user_type,
    v_stats.total_reviews,
    v_stats.avg_rating,
    COALESCE(v_rating_dist, '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb),
    COALESCE(v_category_avgs, '{}'::jsonb),
    v_badges,
    v_stats.last_review
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_reviews = EXCLUDED.total_reviews,
    average_rating = EXCLUDED.average_rating,
    rating_distribution = EXCLUDED.rating_distribution,
    category_averages = EXCLUDED.category_averages,
    badges = EXCLUDED.badges,
    last_review_at = EXCLUDED.last_review_at,
    updated_at = NOW();
END;
$$;

-- Function to get user reviews with pagination
CREATE OR REPLACE FUNCTION get_user_reviews(
  p_user_id UUID,
  p_as_reviewer BOOLEAN DEFAULT false,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reviews JSONB;
  v_total INTEGER;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO v_total
  FROM reviews r
  WHERE
    CASE WHEN p_as_reviewer THEN r.reviewer_id = p_user_id
         ELSE r.reviewee_id = p_user_id END
    AND r.status = 'published';

  -- Get reviews with details
  SELECT COALESCE(jsonb_agg(review_data), '[]'::jsonb)
  INTO v_reviews
  FROM (
    SELECT jsonb_build_object(
      'id', r.id,
      'overall_rating', r.overall_rating,
      'title', r.title,
      'content', r.content,
      'event_date', r.event_date,
      'created_at', r.created_at,
      'helpful_count', r.helpful_count,
      'reviewer', jsonb_build_object(
        'id', reviewer.id,
        'name', CONCAT(reviewer.vorname, ' ', LEFT(reviewer.nachname, 1), '.'),
        'profile_image_url', reviewer.profile_image_url
      ),
      'reviewee', jsonb_build_object(
        'id', reviewee.id,
        'name', CONCAT(reviewee.vorname, ' ', reviewee.nachname),
        'profile_image_url', reviewee.profile_image_url
      ),
      'categories', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'category', rc.category,
          'rating', rc.rating
        )), '[]'::jsonb)
        FROM review_categories rc
        WHERE rc.review_id = r.id
      ),
      'response', (
        SELECT jsonb_build_object(
          'content', rr.content,
          'created_at', rr.created_at
        )
        FROM review_responses rr
        WHERE rr.review_id = r.id
      )
    ) as review_data
    FROM reviews r
    JOIN users reviewer ON reviewer.id = r.reviewer_id
    JOIN users reviewee ON reviewee.id = r.reviewee_id
    WHERE
      CASE WHEN p_as_reviewer THEN r.reviewer_id = p_user_id
           ELSE r.reviewee_id = p_user_id END
      AND r.status = 'published'
    ORDER BY r.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) sub;

  RETURN jsonb_build_object(
    'reviews', v_reviews,
    'total', v_total,
    'limit', p_limit,
    'offset', p_offset
  );
END;
$$;

-- Function to get booking review status
CREATE OR REPLACE FUNCTION get_booking_review_status(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_client_review RECORD;
  v_artist_review RECORD;
  v_can_client_review JSONB;
  v_can_artist_review JSONB;
BEGIN
  SELECT * INTO v_booking FROM booking_requests WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Booking not found');
  END IF;

  -- Get existing reviews
  SELECT * INTO v_client_review
  FROM reviews
  WHERE booking_id = p_booking_id AND reviewer_type = 'client';

  SELECT * INTO v_artist_review
  FROM reviews
  WHERE booking_id = p_booking_id AND reviewer_type = 'artist';

  -- Check if each party can still review
  v_can_client_review := can_submit_review(p_booking_id, v_booking.requester_id);
  v_can_artist_review := can_submit_review(p_booking_id, v_booking.artist_id);

  RETURN jsonb_build_object(
    'booking_id', p_booking_id,
    'client_review', CASE WHEN v_client_review.id IS NOT NULL
      THEN jsonb_build_object('id', v_client_review.id, 'rating', v_client_review.overall_rating, 'created_at', v_client_review.created_at)
      ELSE NULL END,
    'artist_review', CASE WHEN v_artist_review.id IS NOT NULL
      THEN jsonb_build_object('id', v_artist_review.id, 'rating', v_artist_review.overall_rating, 'created_at', v_artist_review.created_at)
      ELSE NULL END,
    'can_client_review', v_can_client_review,
    'can_artist_review', v_can_artist_review
  );
END;
$$;

-- Function to flag a review
CREATE OR REPLACE FUNCTION flag_review(
  p_review_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_flagger_id UUID := auth.uid();
  v_flag_count INTEGER;
BEGIN
  -- Check if already flagged by this user
  IF EXISTS (SELECT 1 FROM review_flags WHERE review_id = p_review_id AND flagger_id = v_flagger_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already flagged this review');
  END IF;

  -- Insert flag
  INSERT INTO review_flags (review_id, flagger_id, reason)
  VALUES (p_review_id, v_flagger_id, p_reason);

  -- Update flag count
  UPDATE reviews
  SET flag_count = flag_count + 1,
      flag_reason = COALESCE(flag_reason || '; ', '') || p_reason
  WHERE id = p_review_id
  RETURNING flag_count INTO v_flag_count;

  -- Auto-flag review if threshold reached (3 flags)
  IF v_flag_count >= 3 THEN
    UPDATE reviews SET status = 'flagged' WHERE id = p_review_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'flag_count', v_flag_count);
END;
$$;

-- Function to vote review as helpful
CREATE OR REPLACE FUNCTION vote_review_helpful(p_review_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_helpful_count INTEGER;
BEGIN
  -- Check if already voted
  IF EXISTS (SELECT 1 FROM review_helpful_votes WHERE review_id = p_review_id AND user_id = v_user_id) THEN
    -- Remove vote
    DELETE FROM review_helpful_votes WHERE review_id = p_review_id AND user_id = v_user_id;
    UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = p_review_id RETURNING helpful_count INTO v_helpful_count;
    RETURN jsonb_build_object('success', true, 'voted', false, 'helpful_count', v_helpful_count);
  ELSE
    -- Add vote
    INSERT INTO review_helpful_votes (review_id, user_id) VALUES (p_review_id, v_user_id);
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = p_review_id RETURNING helpful_count INTO v_helpful_count;
    RETURN jsonb_build_object('success', true, 'voted', true, 'helpful_count', v_helpful_count);
  END IF;
END;
$$;

-- Function to respond to a review
CREATE OR REPLACE FUNCTION respond_to_review(
  p_review_id UUID,
  p_content TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_review RECORD;
  v_response_id UUID;
BEGIN
  -- Get review
  SELECT * INTO v_review FROM reviews WHERE id = p_review_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Review not found');
  END IF;

  -- Check if user is the reviewee
  IF v_review.reviewee_id != v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only the reviewed party can respond');
  END IF;

  -- Check if already responded
  IF EXISTS (SELECT 1 FROM review_responses WHERE review_id = p_review_id) THEN
    -- Update existing response
    UPDATE review_responses
    SET content = p_content, updated_at = NOW()
    WHERE review_id = p_review_id
    RETURNING id INTO v_response_id;
  ELSE
    -- Create new response
    INSERT INTO review_responses (review_id, responder_id, content)
    VALUES (p_review_id, v_user_id, p_content)
    RETURNING id INTO v_response_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'response_id', v_response_id);
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to auto-update stats when review changes
CREATE OR REPLACE FUNCTION trigger_update_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_user_rating_stats(OLD.reviewee_id);
    RETURN OLD;
  ELSE
    PERFORM update_user_rating_stats(NEW.reviewee_id);
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trg_update_rating_stats_on_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_update_rating_stats();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_review_responses_updated_at
BEFORE UPDATE ON review_responses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION can_submit_review(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_review(UUID, INTEGER, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_reviews(UUID, BOOLEAN, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_booking_review_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION flag_review(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION vote_review_helpful(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION respond_to_review(UUID, TEXT) TO authenticated;

-- Grant table permissions
GRANT SELECT ON reviews TO authenticated;
GRANT INSERT, UPDATE ON reviews TO authenticated;
GRANT SELECT ON review_categories TO authenticated;
GRANT INSERT ON review_categories TO authenticated;
GRANT SELECT ON review_responses TO authenticated;
GRANT INSERT, UPDATE ON review_responses TO authenticated;
GRANT SELECT ON user_rating_stats TO authenticated;
GRANT SELECT, INSERT, DELETE ON review_helpful_votes TO authenticated;
GRANT SELECT, INSERT ON review_flags TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE reviews IS 'Main reviews table for two-way client/artist review system';
COMMENT ON TABLE review_categories IS 'Category-specific ratings for detailed feedback';
COMMENT ON TABLE review_responses IS 'Artist responses to client reviews';
COMMENT ON TABLE user_rating_stats IS 'Materialized rating statistics for performance';
COMMENT ON FUNCTION submit_review IS 'Submit a review for a completed booking with category ratings';
COMMENT ON FUNCTION get_user_reviews IS 'Get paginated reviews for a user (given or received)';
COMMENT ON FUNCTION can_submit_review IS 'Check if user can submit a review for a booking';
