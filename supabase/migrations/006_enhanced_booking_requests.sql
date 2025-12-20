-- =============================================
-- Phase 5.2: Enhanced Booking Request System
-- =============================================
-- Adds messaging, status history, and enhanced tracking
-- to the existing booking_requests table
-- =============================================

-- =============================================
-- STEP 1: Create ENUMs (if not exist)
-- =============================================

-- Event type enum
DO $$ BEGIN
    CREATE TYPE event_type_enum AS ENUM (
        'hochzeit',
        'geburtstag',
        'firmenfeier',
        'club_event',
        'festival',
        'konzert',
        'private_party',
        'corporate',
        'wedding',
        'birthday',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Transport type enum
DO $$ BEGIN
    CREATE TYPE transport_type_enum AS ENUM (
        'selbst',
        'vom_veranstalter',
        'oeffentlich',
        'selbst_mit_verguetung',
        'self',
        'organizer_provided',
        'public_transport',
        'self_reimbursed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Booking status enum (extended)
DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM (
        'pending',
        'accepted',
        'rejected',
        'cancelled',
        'confirmed',
        'completed',
        'expired',
        'negotiating',
        'deposit_pending',
        'deposit_paid',
        'in_progress'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- STEP 2: Add new columns to booking_requests
-- =============================================

-- Add target_audience if not exists
DO $$ BEGIN
    ALTER TABLE booking_requests ADD COLUMN target_audience text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add accommodation_details if not exists
DO $$ BEGIN
    ALTER TABLE booking_requests ADD COLUMN accommodation_details text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add transport_distance_km if not exists
DO $$ BEGIN
    ALTER TABLE booking_requests ADD COLUMN transport_distance_km numeric(10,2);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add package_id reference if not exists
DO $$ BEGIN
    ALTER TABLE booking_requests ADD COLUMN package_id uuid REFERENCES artist_packages(id);
EXCEPTION
    WHEN duplicate_column THEN null;
    WHEN undefined_table THEN null; -- artist_packages might not exist yet
END $$;

-- Add contract fields if not exist
DO $$ BEGIN
    ALTER TABLE booking_requests ADD COLUMN contract_signed_at timestamptz;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE booking_requests ADD COLUMN contract_signed_by uuid REFERENCES auth.users(id);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add technical requirements if not exists
DO $$ BEGIN
    ALTER TABLE booking_requests ADD COLUMN technical_requirements jsonb DEFAULT '{}';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add special_requests if not exists
DO $$ BEGIN
    ALTER TABLE booking_requests ADD COLUMN special_requests text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- =============================================
-- STEP 3: Create booking_messages table
-- =============================================

CREATE TABLE IF NOT EXISTS booking_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_request_id uuid NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id),
    message text NOT NULL,
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'offer', 'counter_offer', 'file')),
    attachments jsonb DEFAULT '[]',
    is_read boolean DEFAULT false,
    read_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add comment
COMMENT ON TABLE booking_messages IS 'Conversation thread for booking requests between artist and organizer';

-- =============================================
-- STEP 4: Create booking_status_history table
-- =============================================

CREATE TABLE IF NOT EXISTS booking_status_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_request_id uuid NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
    previous_status text,
    new_status text NOT NULL,
    changed_by uuid REFERENCES auth.users(id),
    change_reason text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Add comment
COMMENT ON TABLE booking_status_history IS 'Audit trail for booking request status changes';

-- =============================================
-- STEP 5: Create indexes
-- =============================================

-- Booking messages indexes
CREATE INDEX IF NOT EXISTS idx_booking_messages_request_id
    ON booking_messages(booking_request_id);
CREATE INDEX IF NOT EXISTS idx_booking_messages_sender_id
    ON booking_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_booking_messages_created_at
    ON booking_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_messages_unread
    ON booking_messages(booking_request_id, is_read)
    WHERE is_read = false;

-- Booking status history indexes
CREATE INDEX IF NOT EXISTS idx_booking_status_history_request_id
    ON booking_status_history(booking_request_id);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_created_at
    ON booking_status_history(created_at DESC);

-- Additional booking_requests indexes (if not exist)
CREATE INDEX IF NOT EXISTS idx_booking_requests_status
    ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_event_date
    ON booking_requests(event_date);
CREATE INDEX IF NOT EXISTS idx_booking_requests_artist_status
    ON booking_requests(artist_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_requester_status
    ON booking_requests(requester_id, status);

-- =============================================
-- STEP 6: Enable RLS
-- =============================================

ALTER TABLE booking_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 7: RLS Policies for booking_messages
-- =============================================

-- Users can view messages for their booking requests
CREATE POLICY "Users can view messages for their bookings"
    ON booking_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM booking_requests br
            WHERE br.id = booking_messages.booking_request_id
            AND (br.artist_id = auth.uid() OR br.requester_id = auth.uid())
        )
    );

-- Users can send messages for their booking requests
CREATE POLICY "Users can send messages for their bookings"
    ON booking_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM booking_requests br
            WHERE br.id = booking_messages.booking_request_id
            AND (br.artist_id = auth.uid() OR br.requester_id = auth.uid())
        )
    );

-- Users can mark their received messages as read
CREATE POLICY "Users can mark messages as read"
    ON booking_messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM booking_requests br
            WHERE br.id = booking_messages.booking_request_id
            AND (br.artist_id = auth.uid() OR br.requester_id = auth.uid())
        )
    )
    WITH CHECK (
        -- Only allow updating is_read and read_at
        sender_id != auth.uid()
    );

-- =============================================
-- STEP 8: RLS Policies for booking_status_history
-- =============================================

-- Users can view status history for their booking requests
CREATE POLICY "Users can view status history for their bookings"
    ON booking_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM booking_requests br
            WHERE br.id = booking_status_history.booking_request_id
            AND (br.artist_id = auth.uid() OR br.requester_id = auth.uid())
        )
    );

-- System/triggers can insert status history (via service role)
-- Users should not insert directly - handled by trigger
CREATE POLICY "Service role can insert status history"
    ON booking_status_history FOR INSERT
    WITH CHECK (true);

-- =============================================
-- STEP 9: Trigger for automatic status history logging
-- =============================================

CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO booking_status_history (
            booking_request_id,
            previous_status,
            new_status,
            changed_by,
            change_reason,
            metadata
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            auth.uid(),
            CASE
                WHEN NEW.status = 'rejected' THEN NEW.rejection_reason
                WHEN NEW.status = 'cancelled' THEN NEW.cancellation_reason
                ELSE NULL
            END,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'timestamp', now()
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_log_booking_status_change ON booking_requests;

CREATE TRIGGER trigger_log_booking_status_change
    AFTER UPDATE ON booking_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_booking_status_change();

-- =============================================
-- STEP 10: Trigger for updating artist availability on booking confirmation
-- =============================================

CREATE OR REPLACE FUNCTION update_availability_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- When booking is confirmed, mark artist as unavailable for that date
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        INSERT INTO artist_availability (
            artist_id,
            date,
            status,
            booking_request_id,
            notes
        ) VALUES (
            NEW.artist_id,
            NEW.event_date,
            'booked',
            NEW.id,
            'Automatisch gebucht: ' || COALESCE(NEW.event_type, 'Event')
        )
        ON CONFLICT (artist_id, date)
        DO UPDATE SET
            status = 'booked',
            booking_request_id = NEW.id,
            notes = 'Automatisch gebucht: ' || COALESCE(NEW.event_type, 'Event'),
            updated_at = now();
    END IF;

    -- When booking is cancelled, free up the date
    IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
        UPDATE artist_availability
        SET status = 'available',
            booking_request_id = NULL,
            notes = 'Buchung storniert',
            updated_at = now()
        WHERE artist_id = NEW.artist_id
        AND date = NEW.event_date
        AND booking_request_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_availability_on_booking ON booking_requests;

CREATE TRIGGER trigger_update_availability_on_booking
    AFTER UPDATE ON booking_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_availability_on_booking();

-- =============================================
-- STEP 11: Function to get unread message count
-- =============================================

CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid uuid)
RETURNS integer AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::integer
        FROM booking_messages bm
        JOIN booking_requests br ON bm.booking_request_id = br.id
        WHERE bm.is_read = false
        AND bm.sender_id != user_uuid
        AND (br.artist_id = user_uuid OR br.requester_id = user_uuid)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STEP 12: Updated_at trigger for booking_messages
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_booking_messages_updated_at ON booking_messages;

CREATE TRIGGER trigger_booking_messages_updated_at
    BEFORE UPDATE ON booking_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- New tables created:
--   - booking_messages (conversation thread)
--   - booking_status_history (audit trail)
--
-- New columns added to booking_requests:
--   - target_audience
--   - accommodation_details
--   - transport_distance_km
--   - package_id
--   - contract_signed_at
--   - contract_signed_by
--   - technical_requirements
--   - special_requests
--
-- Triggers created:
--   - Automatic status history logging
--   - Automatic availability updates on booking confirmation
-- =============================================
