-- =============================================
-- Phase 10: Admin Panel Enhancements
-- =============================================
-- This migration adds:
-- 1. Ban/Unban user functionality columns
-- 2. Payout management table and columns
-- 3. Audit log table for admin actions
-- 4. Required indexes for performance
-- =============================================

-- =============================================
-- 1. ADD BAN COLUMNS TO PROFILES TABLE
-- =============================================

-- Add ban-related columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS banned_reason TEXT;

-- Index for filtering banned users
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);

-- =============================================
-- 2. PAYOUTS TABLE
-- =============================================

-- Create payouts table if it doesn't exist
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'on_hold')),
  stripe_payout_id TEXT,
  stripe_transfer_id TEXT,
  bank_account_last4 TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES profiles(id),
  hold_reason TEXT,
  failure_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payouts
CREATE INDEX IF NOT EXISTS idx_payouts_artist_id ON payouts(artist_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_requested_at ON payouts(requested_at);

-- Enable RLS on payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payouts
DROP POLICY IF EXISTS "Artists can view their own payouts" ON payouts;
CREATE POLICY "Artists can view their own payouts" ON payouts
  FOR SELECT USING (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Admins can view all payouts" ON payouts;
CREATE POLICY "Admins can view all payouts" ON payouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update payouts" ON payouts;
CREATE POLICY "Admins can update payouts" ON payouts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert payouts" ON payouts;
CREATE POLICY "Admins can insert payouts" ON payouts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 3. AUDIT LOG TABLE
-- =============================================

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_type ON audit_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert audit logs" ON audit_logs;
CREATE POLICY "Admins can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 4. HELPER FUNCTIONS
-- =============================================

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Function to ban a user
CREATE OR REPLACE FUNCTION ban_user(
  p_user_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can ban users';
  END IF;

  -- Update user
  UPDATE profiles
  SET
    is_banned = TRUE,
    banned_at = NOW(),
    banned_by = auth.uid(),
    banned_reason = p_reason
  WHERE id = p_user_id;

  -- Log the action
  PERFORM log_admin_action(
    'ban_user',
    'user',
    p_user_id,
    jsonb_build_object('reason', p_reason)
  );

  RETURN TRUE;
END;
$$;

-- Function to unban a user
CREATE OR REPLACE FUNCTION unban_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can unban users';
  END IF;

  -- Update user
  UPDATE profiles
  SET
    is_banned = FALSE,
    banned_at = NULL,
    banned_by = NULL,
    banned_reason = NULL
  WHERE id = p_user_id;

  -- Log the action
  PERFORM log_admin_action(
    'unban_user',
    'user',
    p_user_id,
    '{}'::jsonb
  );

  RETURN TRUE;
END;
$$;

-- =============================================
-- 5. UPDATE TRIGGER FOR PAYOUTS
-- =============================================

-- Trigger to update updated_at on payouts
CREATE OR REPLACE FUNCTION update_payouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payouts_updated_at ON payouts;
CREATE TRIGGER payouts_updated_at
  BEFORE UPDATE ON payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_payouts_updated_at();

-- =============================================
-- 6. GRANTS
-- =============================================

-- Grant usage to authenticated users
GRANT SELECT ON payouts TO authenticated;
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT UPDATE ON payouts TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION log_admin_action TO authenticated;
GRANT EXECUTE ON FUNCTION ban_user TO authenticated;
GRANT EXECUTE ON FUNCTION unban_user TO authenticated;
