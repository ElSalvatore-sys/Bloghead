-- =============================================
-- PHASE 9: Notifications & Communication System
-- Migration: 010_notifications.sql
-- Created: December 2024
-- =============================================

-- =============================================
-- SECTION 1: ENUMS
-- =============================================

-- Notification types enum (matches existing TypeScript types)
CREATE TYPE notification_type_enum AS ENUM (
  'booking_request',       -- New booking request received (for artist)
  'booking_confirmed',     -- Booking was confirmed (for fan)
  'booking_declined',      -- Booking was declined (for fan)
  'booking_cancelled',     -- Booking was cancelled (both parties)
  'booking_completed',     -- Event completed successfully (both parties)
  'new_message',           -- New chat message received
  'new_review',            -- Someone left a review on profile
  'review_response',       -- Response to your review
  'new_follower',          -- Someone followed you
  'payment_received',      -- Payment received (for artist)
  'payment_pending',       -- Payment is pending
  'payout_sent',           -- Payout processed to bank (for artist)
  'reminder_24h',          -- 24 hours before event
  'reminder_1h',           -- 1 hour before event
  'profile_milestone',     -- Profile views milestone (100, 500, 1000)
  'system'                 -- System announcements
);

-- Email status enum
CREATE TYPE email_status_enum AS ENUM (
  'pending',
  'sent',
  'failed',
  'bounced'
);

-- Reminder type enum
CREATE TYPE reminder_type_enum AS ENUM (
  '24h',
  '1h'
);

-- =============================================
-- SECTION 2: TABLES
-- =============================================

-- Table: notifications (main notification storage)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type_enum NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  action_url TEXT,
  action_data JSONB DEFAULT '{}',
  booking_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
  message_id UUID, -- References messages table if exists
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  push_sent BOOLEAN DEFAULT FALSE,
  push_sent_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: notification_preferences (user settings for notifications)
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  -- Email preferences
  email_booking_updates BOOLEAN DEFAULT TRUE,
  email_messages BOOLEAN DEFAULT TRUE,
  email_reviews BOOLEAN DEFAULT TRUE,
  email_payments BOOLEAN DEFAULT TRUE,
  email_reminders BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT FALSE,
  email_weekly_digest BOOLEAN DEFAULT TRUE,
  -- In-app preferences
  inapp_booking_updates BOOLEAN DEFAULT TRUE,
  inapp_messages BOOLEAN DEFAULT TRUE,
  inapp_reviews BOOLEAN DEFAULT TRUE,
  inapp_payments BOOLEAN DEFAULT TRUE,
  inapp_reminders BOOLEAN DEFAULT TRUE,
  -- Push preferences (for future mobile app)
  push_enabled BOOLEAN DEFAULT TRUE,
  push_booking_updates BOOLEAN DEFAULT TRUE,
  push_messages BOOLEAN DEFAULT TRUE,
  push_reminders BOOLEAN DEFAULT TRUE,
  -- Quiet hours (German timezone)
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: email_logs (track all sent emails)
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  template_name TEXT,
  template_data JSONB DEFAULT '{}',
  status email_status_enum DEFAULT 'pending',
  error_message TEXT,
  provider_message_id TEXT, -- External email provider ID
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: scheduled_reminders (for booking event reminders)
CREATE TABLE scheduled_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reminder_type reminder_type_enum NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate reminders
  UNIQUE(booking_id, user_id, reminder_type)
);

-- =============================================
-- SECTION 3: INDEXES
-- =============================================

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_booking_id ON notifications(booking_id) WHERE booking_id IS NOT NULL;

-- Notification preferences indexes
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Email logs indexes
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_notification_id ON email_logs(notification_id) WHERE notification_id IS NOT NULL;

-- Scheduled reminders indexes
CREATE INDEX idx_scheduled_reminders_scheduled_for ON scheduled_reminders(scheduled_for) WHERE is_sent = FALSE;
CREATE INDEX idx_scheduled_reminders_booking_id ON scheduled_reminders(booking_id);
CREATE INDEX idx_scheduled_reminders_user_id ON scheduled_reminders(user_id);

-- =============================================
-- SECTION 4: RLS POLICIES
-- =============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);

-- Notification preferences: Users can manage their own
CREATE POLICY "Users can view their own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Email logs: Users can view their own email history
CREATE POLICY "Users can view their own email logs"
  ON email_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all email logs
CREATE POLICY "Admins can view all email logs"
  ON email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Scheduled reminders: Users can view their own
CREATE POLICY "Users can view their own reminders"
  ON scheduled_reminders FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- SECTION 5: RPC FUNCTIONS - Core Notifications
-- =============================================

-- Function 1: Get user notifications with pagination
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_unread_only BOOLEAN DEFAULT FALSE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(notification_data ORDER BY created_at DESC)
  INTO v_result
  FROM (
    SELECT json_build_object(
      'id', id,
      'user_id', user_id,
      'type', type,
      'title', title,
      'body', body,
      'action_url', action_url,
      'action_data', action_data,
      'booking_id', booking_id,
      'message_id', message_id,
      'is_read', is_read,
      'read_at', read_at,
      'push_sent', push_sent,
      'push_sent_at', push_sent_at,
      'created_at', created_at
    ) as notification_data,
    created_at
    FROM notifications
    WHERE user_id = p_user_id
      AND (NOT p_unread_only OR is_read = FALSE)
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) sub;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

-- Function 2: Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = FALSE;

  RETURN v_count;
END;
$$;

-- Function 3: Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE,
      read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid();

  RETURN FOUND;
END;
$$;

-- Function 4: Mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE notifications
    SET is_read = TRUE,
        read_at = NOW()
    WHERE user_id = p_user_id
      AND is_read = FALSE
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM updated;

  RETURN v_count;
END;
$$;

-- Function 5: Create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type_enum,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_action_data JSONB DEFAULT '{}',
  p_booking_id UUID DEFAULT NULL,
  p_sender_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
  v_preferences notification_preferences%ROWTYPE;
  v_should_notify BOOLEAN := TRUE;
BEGIN
  -- Check user's notification preferences
  SELECT * INTO v_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id;

  -- Check if notification should be suppressed based on preferences
  IF v_preferences.id IS NOT NULL THEN
    CASE
      WHEN p_type IN ('booking_request', 'booking_confirmed', 'booking_declined', 'booking_cancelled', 'booking_completed') THEN
        v_should_notify := v_preferences.inapp_booking_updates;
      WHEN p_type = 'new_message' THEN
        v_should_notify := v_preferences.inapp_messages;
      WHEN p_type IN ('new_review', 'review_response') THEN
        v_should_notify := v_preferences.inapp_reviews;
      WHEN p_type IN ('payment_received', 'payment_pending', 'payout_sent') THEN
        v_should_notify := v_preferences.inapp_payments;
      WHEN p_type IN ('reminder_24h', 'reminder_1h') THEN
        v_should_notify := v_preferences.inapp_reminders;
      ELSE
        v_should_notify := TRUE;
    END CASE;
  END IF;

  IF v_should_notify THEN
    INSERT INTO notifications (
      user_id, type, title, body, action_url, action_data, booking_id, sender_id
    ) VALUES (
      p_user_id, p_type, p_title, p_body, p_action_url, p_action_data, p_booking_id, p_sender_id
    )
    RETURNING id INTO v_notification_id;
  END IF;

  RETURN v_notification_id;
END;
$$;

-- Function 6: Delete old notifications (cleanup)
CREATE OR REPLACE FUNCTION delete_old_notifications(p_days_old INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM notifications
    WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL
      AND is_read = TRUE
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM deleted;

  RETURN v_count;
END;
$$;

-- =============================================
-- SECTION 6: RPC FUNCTIONS - Preferences
-- =============================================

-- Function 7: Get notification preferences
CREATE OR REPLACE FUNCTION get_notification_preferences(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'id', id,
    'user_id', user_id,
    'email_booking_updates', email_booking_updates,
    'email_messages', email_messages,
    'email_reviews', email_reviews,
    'email_payments', email_payments,
    'email_reminders', email_reminders,
    'email_marketing', email_marketing,
    'email_weekly_digest', email_weekly_digest,
    'inapp_booking_updates', inapp_booking_updates,
    'inapp_messages', inapp_messages,
    'inapp_reviews', inapp_reviews,
    'inapp_payments', inapp_payments,
    'inapp_reminders', inapp_reminders,
    'push_enabled', push_enabled,
    'push_booking_updates', push_booking_updates,
    'push_messages', push_messages,
    'push_reminders', push_reminders,
    'quiet_hours_enabled', quiet_hours_enabled,
    'quiet_hours_start', quiet_hours_start,
    'quiet_hours_end', quiet_hours_end,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_result
  FROM notification_preferences
  WHERE user_id = p_user_id;

  -- Return default preferences if none exist
  IF v_result IS NULL THEN
    v_result := json_build_object(
      'id', NULL,
      'user_id', p_user_id,
      'email_booking_updates', TRUE,
      'email_messages', TRUE,
      'email_reviews', TRUE,
      'email_payments', TRUE,
      'email_reminders', TRUE,
      'email_marketing', FALSE,
      'email_weekly_digest', TRUE,
      'inapp_booking_updates', TRUE,
      'inapp_messages', TRUE,
      'inapp_reviews', TRUE,
      'inapp_payments', TRUE,
      'inapp_reminders', TRUE,
      'push_enabled', TRUE,
      'push_booking_updates', TRUE,
      'push_messages', TRUE,
      'push_reminders', TRUE,
      'quiet_hours_enabled', FALSE,
      'quiet_hours_start', '22:00',
      'quiet_hours_end', '08:00'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Function 8: Update notification preferences
CREATE OR REPLACE FUNCTION update_notification_preferences(
  p_user_id UUID,
  p_preferences JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  INSERT INTO notification_preferences (
    user_id,
    email_booking_updates,
    email_messages,
    email_reviews,
    email_payments,
    email_reminders,
    email_marketing,
    email_weekly_digest,
    inapp_booking_updates,
    inapp_messages,
    inapp_reviews,
    inapp_payments,
    inapp_reminders,
    push_enabled,
    push_booking_updates,
    push_messages,
    push_reminders,
    quiet_hours_enabled,
    quiet_hours_start,
    quiet_hours_end
  ) VALUES (
    p_user_id,
    COALESCE((p_preferences->>'email_booking_updates')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'email_messages')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'email_reviews')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'email_payments')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'email_reminders')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'email_marketing')::BOOLEAN, FALSE),
    COALESCE((p_preferences->>'email_weekly_digest')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'inapp_booking_updates')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'inapp_messages')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'inapp_reviews')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'inapp_payments')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'inapp_reminders')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'push_enabled')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'push_booking_updates')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'push_messages')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'push_reminders')::BOOLEAN, TRUE),
    COALESCE((p_preferences->>'quiet_hours_enabled')::BOOLEAN, FALSE),
    COALESCE((p_preferences->>'quiet_hours_start')::TIME, '22:00'),
    COALESCE((p_preferences->>'quiet_hours_end')::TIME, '08:00')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email_booking_updates = COALESCE((p_preferences->>'email_booking_updates')::BOOLEAN, notification_preferences.email_booking_updates),
    email_messages = COALESCE((p_preferences->>'email_messages')::BOOLEAN, notification_preferences.email_messages),
    email_reviews = COALESCE((p_preferences->>'email_reviews')::BOOLEAN, notification_preferences.email_reviews),
    email_payments = COALESCE((p_preferences->>'email_payments')::BOOLEAN, notification_preferences.email_payments),
    email_reminders = COALESCE((p_preferences->>'email_reminders')::BOOLEAN, notification_preferences.email_reminders),
    email_marketing = COALESCE((p_preferences->>'email_marketing')::BOOLEAN, notification_preferences.email_marketing),
    email_weekly_digest = COALESCE((p_preferences->>'email_weekly_digest')::BOOLEAN, notification_preferences.email_weekly_digest),
    inapp_booking_updates = COALESCE((p_preferences->>'inapp_booking_updates')::BOOLEAN, notification_preferences.inapp_booking_updates),
    inapp_messages = COALESCE((p_preferences->>'inapp_messages')::BOOLEAN, notification_preferences.inapp_messages),
    inapp_reviews = COALESCE((p_preferences->>'inapp_reviews')::BOOLEAN, notification_preferences.inapp_reviews),
    inapp_payments = COALESCE((p_preferences->>'inapp_payments')::BOOLEAN, notification_preferences.inapp_payments),
    inapp_reminders = COALESCE((p_preferences->>'inapp_reminders')::BOOLEAN, notification_preferences.inapp_reminders),
    push_enabled = COALESCE((p_preferences->>'push_enabled')::BOOLEAN, notification_preferences.push_enabled),
    push_booking_updates = COALESCE((p_preferences->>'push_booking_updates')::BOOLEAN, notification_preferences.push_booking_updates),
    push_messages = COALESCE((p_preferences->>'push_messages')::BOOLEAN, notification_preferences.push_messages),
    push_reminders = COALESCE((p_preferences->>'push_reminders')::BOOLEAN, notification_preferences.push_reminders),
    quiet_hours_enabled = COALESCE((p_preferences->>'quiet_hours_enabled')::BOOLEAN, notification_preferences.quiet_hours_enabled),
    quiet_hours_start = COALESCE((p_preferences->>'quiet_hours_start')::TIME, notification_preferences.quiet_hours_start),
    quiet_hours_end = COALESCE((p_preferences->>'quiet_hours_end')::TIME, notification_preferences.quiet_hours_end),
    updated_at = NOW();

  -- Return updated preferences
  SELECT get_notification_preferences(p_user_id) INTO v_result;

  RETURN v_result;
END;
$$;

-- =============================================
-- SECTION 7: RPC FUNCTIONS - Reminders
-- =============================================

-- Function 9: Schedule booking reminders
CREATE OR REPLACE FUNCTION schedule_booking_reminders(p_booking_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking booking_requests%ROWTYPE;
  v_artist_user_id UUID;
  v_count INTEGER := 0;
  v_event_datetime TIMESTAMPTZ;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking
  FROM booking_requests
  WHERE id = p_booking_id;

  IF v_booking.id IS NULL THEN
    RETURN 0;
  END IF;

  -- Get artist's user_id from artist_profiles
  SELECT user_id INTO v_artist_user_id
  FROM artist_profiles
  WHERE id = v_booking.artist_id;

  -- Calculate event datetime (combine date and time)
  v_event_datetime := v_booking.event_date + COALESCE(v_booking.event_start_time, '12:00:00'::TIME);

  -- Only schedule reminders for future events
  IF v_event_datetime <= NOW() THEN
    RETURN 0;
  END IF;

  -- Schedule 24h reminder for requester (fan)
  IF v_event_datetime - INTERVAL '24 hours' > NOW() THEN
    INSERT INTO scheduled_reminders (booking_id, user_id, reminder_type, scheduled_for)
    VALUES (p_booking_id, v_booking.requester_id, '24h', v_event_datetime - INTERVAL '24 hours')
    ON CONFLICT (booking_id, user_id, reminder_type) DO UPDATE SET
      scheduled_for = EXCLUDED.scheduled_for,
      is_sent = FALSE;
    v_count := v_count + 1;
  END IF;

  -- Schedule 24h reminder for artist
  IF v_event_datetime - INTERVAL '24 hours' > NOW() AND v_artist_user_id IS NOT NULL THEN
    INSERT INTO scheduled_reminders (booking_id, user_id, reminder_type, scheduled_for)
    VALUES (p_booking_id, v_artist_user_id, '24h', v_event_datetime - INTERVAL '24 hours')
    ON CONFLICT (booking_id, user_id, reminder_type) DO UPDATE SET
      scheduled_for = EXCLUDED.scheduled_for,
      is_sent = FALSE;
    v_count := v_count + 1;
  END IF;

  -- Schedule 1h reminder for requester
  IF v_event_datetime - INTERVAL '1 hour' > NOW() THEN
    INSERT INTO scheduled_reminders (booking_id, user_id, reminder_type, scheduled_for)
    VALUES (p_booking_id, v_booking.requester_id, '1h', v_event_datetime - INTERVAL '1 hour')
    ON CONFLICT (booking_id, user_id, reminder_type) DO UPDATE SET
      scheduled_for = EXCLUDED.scheduled_for,
      is_sent = FALSE;
    v_count := v_count + 1;
  END IF;

  -- Schedule 1h reminder for artist
  IF v_event_datetime - INTERVAL '1 hour' > NOW() AND v_artist_user_id IS NOT NULL THEN
    INSERT INTO scheduled_reminders (booking_id, user_id, reminder_type, scheduled_for)
    VALUES (p_booking_id, v_artist_user_id, '1h', v_event_datetime - INTERVAL '1 hour')
    ON CONFLICT (booking_id, user_id, reminder_type) DO UPDATE SET
      scheduled_for = EXCLUDED.scheduled_for,
      is_sent = FALSE;
    v_count := v_count + 1;
  END IF;

  RETURN v_count;
END;
$$;

-- Function 10: Get due reminders (for cron job)
CREATE OR REPLACE FUNCTION get_due_reminders()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(reminder_data)
  INTO v_result
  FROM (
    SELECT json_build_object(
      'id', sr.id,
      'booking_id', sr.booking_id,
      'user_id', sr.user_id,
      'reminder_type', sr.reminder_type,
      'scheduled_for', sr.scheduled_for,
      'user_email', u.email,
      'user_name', COALESCE(u.vorname, u.membername),
      'event_date', br.event_date,
      'event_time', br.event_start_time,
      'event_location', br.event_location,
      'artist_name', ap.kuenstlername
    ) as reminder_data
    FROM scheduled_reminders sr
    JOIN users u ON sr.user_id = u.id
    JOIN booking_requests br ON sr.booking_id = br.id
    LEFT JOIN artist_profiles ap ON br.artist_id = ap.id
    WHERE sr.is_sent = FALSE
      AND sr.scheduled_for <= NOW()
    ORDER BY sr.scheduled_for
    LIMIT 100
  ) sub;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

-- Function 11: Mark reminder as sent
CREATE OR REPLACE FUNCTION mark_reminder_sent(
  p_reminder_id UUID,
  p_notification_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE scheduled_reminders
  SET is_sent = TRUE,
      sent_at = NOW(),
      notification_id = p_notification_id
  WHERE id = p_reminder_id;

  RETURN FOUND;
END;
$$;

-- Function 12: Cancel booking reminders
CREATE OR REPLACE FUNCTION cancel_booking_reminders(p_booking_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM scheduled_reminders
    WHERE booking_id = p_booking_id
      AND is_sent = FALSE
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM deleted;

  RETURN v_count;
END;
$$;

-- =============================================
-- SECTION 8: TRIGGERS - Auto-notifications
-- =============================================

-- Trigger function: Notify on booking status change
CREATE OR REPLACE FUNCTION trigger_booking_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_artist_user_id UUID;
  v_artist_name TEXT;
  v_requester_name TEXT;
  v_event_date_formatted TEXT;
  v_booking_url TEXT;
BEGIN
  -- Get artist's user_id and name
  SELECT ap.user_id, ap.kuenstlername
  INTO v_artist_user_id, v_artist_name
  FROM artist_profiles ap
  WHERE ap.id = NEW.artist_id;

  -- Get requester name
  SELECT COALESCE(vorname, membername) INTO v_requester_name
  FROM users
  WHERE id = NEW.requester_id;

  -- Format event date in German
  v_event_date_formatted := TO_CHAR(NEW.event_date, 'DD.MM.YYYY');
  v_booking_url := '/dashboard/bookings/' || NEW.id;

  -- New booking request (status = pending)
  IF NEW.status = 'pending' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'pending') THEN
    -- Notify artist
    IF v_artist_user_id IS NOT NULL THEN
      PERFORM create_notification(
        v_artist_user_id,
        'booking_request'::notification_type_enum,
        'Neue Buchungsanfrage',
        'Du hast eine neue Buchungsanfrage von ' || v_requester_name || ' für den ' || v_event_date_formatted,
        v_booking_url,
        jsonb_build_object('booking_id', NEW.id, 'requester_name', v_requester_name),
        NEW.id,
        NEW.requester_id
      );
    END IF;
  END IF;

  -- Booking confirmed
  IF NEW.status IN ('confirmed', 'accepted') AND (OLD IS NULL OR OLD.status NOT IN ('confirmed', 'accepted')) THEN
    -- Notify fan
    PERFORM create_notification(
      NEW.requester_id,
      'booking_confirmed'::notification_type_enum,
      'Buchung bestätigt! 🎉',
      v_artist_name || ' hat deine Buchung für den ' || v_event_date_formatted || ' bestätigt.',
      v_booking_url,
      jsonb_build_object('booking_id', NEW.id, 'artist_name', v_artist_name),
      NEW.id,
      v_artist_user_id
    );

    -- Schedule reminders
    PERFORM schedule_booking_reminders(NEW.id);
  END IF;

  -- Booking declined
  IF NEW.status = 'declined' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'declined') THEN
    -- Notify fan
    PERFORM create_notification(
      NEW.requester_id,
      'booking_declined'::notification_type_enum,
      'Buchungsanfrage abgelehnt',
      v_artist_name || ' kann den Termin am ' || v_event_date_formatted || ' leider nicht wahrnehmen.',
      v_booking_url,
      jsonb_build_object('booking_id', NEW.id, 'artist_name', v_artist_name),
      NEW.id,
      v_artist_user_id
    );
  END IF;

  -- Booking cancelled
  IF NEW.status = 'cancelled' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'cancelled') THEN
    -- Determine who cancelled (compare updated_by or use auth.uid())
    -- Notify both parties

    -- Notify fan (if artist cancelled)
    PERFORM create_notification(
      NEW.requester_id,
      'booking_cancelled'::notification_type_enum,
      'Buchung storniert',
      'Die Buchung mit ' || v_artist_name || ' für den ' || v_event_date_formatted || ' wurde storniert.',
      v_booking_url,
      jsonb_build_object('booking_id', NEW.id, 'artist_name', v_artist_name),
      NEW.id,
      NULL
    );

    -- Notify artist
    IF v_artist_user_id IS NOT NULL THEN
      PERFORM create_notification(
        v_artist_user_id,
        'booking_cancelled'::notification_type_enum,
        'Buchung storniert',
        'Die Buchung mit ' || v_requester_name || ' für den ' || v_event_date_formatted || ' wurde storniert.',
        v_booking_url,
        jsonb_build_object('booking_id', NEW.id, 'requester_name', v_requester_name),
        NEW.id,
        NULL
      );
    END IF;

    -- Cancel pending reminders
    PERFORM cancel_booking_reminders(NEW.id);
  END IF;

  -- Booking completed
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'completed') THEN
    -- Notify fan
    PERFORM create_notification(
      NEW.requester_id,
      'booking_completed'::notification_type_enum,
      'Event abgeschlossen! ⭐',
      'Dein Event mit ' || v_artist_name || ' ist abgeschlossen. Wie war''s? Hinterlasse eine Bewertung!',
      '/dashboard/reviews/write/' || NEW.id,
      jsonb_build_object('booking_id', NEW.id, 'artist_name', v_artist_name),
      NEW.id,
      v_artist_user_id
    );

    -- Notify artist
    IF v_artist_user_id IS NOT NULL THEN
      PERFORM create_notification(
        v_artist_user_id,
        'booking_completed'::notification_type_enum,
        'Event abgeschlossen! 🎵',
        'Dein Event mit ' || v_requester_name || ' am ' || v_event_date_formatted || ' ist abgeschlossen.',
        v_booking_url,
        jsonb_build_object('booking_id', NEW.id, 'requester_name', v_requester_name),
        NEW.id,
        NEW.requester_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on booking_requests
DROP TRIGGER IF EXISTS trigger_booking_status_notification ON booking_requests;
CREATE TRIGGER trigger_booking_status_notification
  AFTER INSERT OR UPDATE OF status ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_booking_notification();

-- Trigger function: Notify on new review
CREATE OR REPLACE FUNCTION trigger_review_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reviewer_name TEXT;
BEGIN
  -- Get reviewer name
  SELECT COALESCE(vorname, membername) INTO v_reviewer_name
  FROM users
  WHERE id = NEW.reviewer_id;

  -- Notify the person being reviewed
  PERFORM create_notification(
    NEW.reviewee_id,
    'new_review'::notification_type_enum,
    'Neue Bewertung erhalten! ⭐',
    v_reviewer_name || ' hat dir eine ' || NEW.overall_rating || '-Sterne Bewertung gegeben.',
    '/dashboard/reviews',
    jsonb_build_object('review_id', NEW.id, 'rating', NEW.overall_rating, 'reviewer_name', v_reviewer_name),
    NEW.booking_id,
    NEW.reviewer_id
  );

  RETURN NEW;
END;
$$;

-- Create trigger on reviews (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
    DROP TRIGGER IF EXISTS trigger_new_review_notification ON reviews;
    CREATE TRIGGER trigger_new_review_notification
      AFTER INSERT ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION trigger_review_notification();
  END IF;
END;
$$;

-- Trigger function: Notify on new follower
CREATE OR REPLACE FUNCTION trigger_follower_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_follower_name TEXT;
  v_artist_user_id UUID;
BEGIN
  -- Get follower name
  SELECT COALESCE(vorname, membername) INTO v_follower_name
  FROM users
  WHERE id = NEW.user_id;

  -- Get artist's user_id
  SELECT user_id INTO v_artist_user_id
  FROM artist_profiles
  WHERE id = NEW.artist_id;

  IF v_artist_user_id IS NOT NULL THEN
    PERFORM create_notification(
      v_artist_user_id,
      'new_follower'::notification_type_enum,
      'Neuer Follower! 🎉',
      v_follower_name || ' folgt dir jetzt.',
      '/dashboard/followers',
      jsonb_build_object('follower_id', NEW.user_id, 'follower_name', v_follower_name),
      NULL,
      NEW.user_id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on followers (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'followers') THEN
    DROP TRIGGER IF EXISTS trigger_new_follower_notification ON followers;
    CREATE TRIGGER trigger_new_follower_notification
      AFTER INSERT ON followers
      FOR EACH ROW
      EXECUTE FUNCTION trigger_follower_notification();
  END IF;
END;
$$;

-- =============================================
-- SECTION 9: GRANTS
-- =============================================

-- Grant execute permissions on notification functions
GRANT EXECUTE ON FUNCTION get_user_notifications(UUID, INTEGER, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, notification_type_enum, TEXT, TEXT, TEXT, JSONB, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_old_notifications(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_notification_preferences(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_booking_reminders(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_due_reminders() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_reminder_sent(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_booking_reminders(UUID) TO authenticated;

-- =============================================
-- SECTION 10: DEFAULT DATA & INITIALIZATION
-- =============================================

-- Create default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- SECTION 11: COMMENTS
-- =============================================

COMMENT ON TABLE notifications IS 'User notifications for all event types';
COMMENT ON TABLE notification_preferences IS 'User-configurable notification settings';
COMMENT ON TABLE email_logs IS 'Log of all sent email notifications';
COMMENT ON TABLE scheduled_reminders IS 'Scheduled reminders for upcoming bookings';

COMMENT ON FUNCTION get_user_notifications IS 'Get paginated notifications for a user';
COMMENT ON FUNCTION get_unread_notification_count IS 'Get count of unread notifications';
COMMENT ON FUNCTION mark_notification_read IS 'Mark a single notification as read';
COMMENT ON FUNCTION mark_all_notifications_read IS 'Mark all user notifications as read';
COMMENT ON FUNCTION create_notification IS 'Create a new notification (respects user preferences)';
COMMENT ON FUNCTION delete_old_notifications IS 'Cleanup old read notifications';
COMMENT ON FUNCTION get_notification_preferences IS 'Get user notification preferences';
COMMENT ON FUNCTION update_notification_preferences IS 'Update user notification preferences';
COMMENT ON FUNCTION schedule_booking_reminders IS 'Schedule 24h and 1h reminders for a booking';
COMMENT ON FUNCTION get_due_reminders IS 'Get reminders that should be sent now';
COMMENT ON FUNCTION mark_reminder_sent IS 'Mark a reminder as sent';
COMMENT ON FUNCTION cancel_booking_reminders IS 'Cancel all pending reminders for a booking';
COMMENT ON FUNCTION trigger_booking_notification IS 'Auto-create notifications on booking status changes';
COMMENT ON FUNCTION trigger_review_notification IS 'Auto-create notification when review is submitted';
COMMENT ON FUNCTION trigger_follower_notification IS 'Auto-create notification when someone follows';
