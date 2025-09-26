-- Add guest user support to profiles table
-- Migration: 004_guest_authentication.sql

-- Add columns for guest user management
ALTER TABLE public.profiles
ADD COLUMN user_type TEXT DEFAULT 'permanent' CHECK (user_type IN ('guest', 'permanent')),
ADD COLUMN guest_session_expires_at TIMESTAMPTZ,
ADD COLUMN converted_from_guest_at TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX profiles_user_type_idx ON profiles (user_type);
CREATE INDEX profiles_guest_expiry_idx ON profiles (guest_session_expires_at) WHERE user_type = 'guest';

-- Update RLS policies for anonymous users
-- Allow anonymous users to view active profiles
CREATE POLICY "Anonymous users can view active profiles" ON public.profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'is_anonymous')::boolean = true
    AND is_active = true
    AND user_type = 'permanent'
  );

-- Allow anonymous users to create their own guest profile
CREATE POLICY "Anonymous users can create guest profile" ON public.profiles
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'is_anonymous')::boolean = true
    AND auth.uid() = id
    AND user_type = 'guest'
  );

-- Allow anonymous users to update their own guest profile
CREATE POLICY "Anonymous users can update own guest profile" ON public.profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'is_anonymous')::boolean = true
    AND auth.uid() = id
    AND user_type = 'guest'
  );

-- Update dogs table policies for anonymous users
-- Allow anonymous users to view active, approved dogs
CREATE POLICY "Anonymous users can view dogs" ON public.dogs
  FOR SELECT USING (
    (auth.jwt() ->> 'is_anonymous')::boolean = true
    AND is_active = true
    AND is_approved = true
  );

-- Function to clean up expired guest profiles
CREATE OR REPLACE FUNCTION cleanup_expired_guest_profiles()
RETURNS void AS $$
BEGIN
  -- Delete expired guest profiles (older than 7 days)
  DELETE FROM public.profiles
  WHERE user_type = 'guest'
    AND guest_session_expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup daily (requires pg_cron extension)
-- This will be manually configured in Supabase dashboard
-- SELECT cron.schedule('cleanup-guest-profiles', '0 2 * * *', 'SELECT cleanup_expired_guest_profiles();');

-- Add comment for documentation
COMMENT ON FUNCTION cleanup_expired_guest_profiles() IS 'Cleans up expired guest user profiles older than 7 days';
COMMENT ON COLUMN profiles.user_type IS 'Indicates whether user is a guest or permanent user';
COMMENT ON COLUMN profiles.guest_session_expires_at IS 'When the guest session expires (24 hours from creation)';
COMMENT ON COLUMN profiles.converted_from_guest_at IS 'Timestamp when guest user was converted to permanent user';