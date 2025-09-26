-- SocialDog Database Schema
-- Run this script in Supabase SQL Editor: https://supabase.com/dashboard/project/tgivjokzuhlunkmenukn/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- PROFILES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT,
  location TEXT,
  location_display TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  age INTEGER,
  bio TEXT,
  profile_photo TEXT,
  auth_provider TEXT DEFAULT 'email',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- DOGS TABLE (Enhanced Schema)
-- =========================================
CREATE TABLE IF NOT EXISTS dogs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  primary_breed TEXT NOT NULL,
  secondary_breed TEXT,
  age INTEGER,
  date_of_birth DATE,
  size TEXT CHECK (size IN ('small', 'medium', 'large', 'extra-large')),
  weight DECIMAL,
  temperament TEXT[],
  energy_level TEXT CHECK (energy_level IN ('low', 'moderate', 'high', 'very-high')),
  training_level TEXT CHECK (training_level IN ('none', 'basic', 'intermediate', 'advanced')),
  socialization TEXT CHECK (socialization IN ('excellent', 'good', 'fair', 'needs-work')),
  good_with_kids BOOLEAN DEFAULT false,
  good_with_dogs BOOLEAN DEFAULT false,
  good_with_cats BOOLEAN DEFAULT false,
  interaction_styles TEXT[],
  vaccination_status TEXT CHECK (vaccination_status IN ('up-to-date', 'overdue', 'puppy-schedule', 'unknown')),
  vaccinated BOOLEAN DEFAULT false,
  neutered BOOLEAN DEFAULT false,
  puppy_not_vaccinated BOOLEAN DEFAULT false,
  photos TEXT[],
  bio TEXT,
  location_lat DECIMAL NOT NULL,
  location_lng DECIMAL NOT NULL,
  location_display TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- DOG PROFILES TABLE (Legacy Support)
-- =========================================
CREATE TABLE IF NOT EXISTS dog_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  size TEXT CHECK (size IN ('small', 'medium', 'large', 'extra-large')),
  temperament TEXT CHECK (temperament IN ('friendly', 'playful', 'calm', 'energetic', 'protective')),
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- HEALTH RECORDS
-- =========================================
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  frequency TEXT,
  clinic TEXT,
  next_due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS worming_treatments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  frequency TEXT,
  next_due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flea_treatments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  frequency TEXT,
  next_due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- SOCIAL FEATURES
-- =========================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  context_dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_user_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

CREATE TABLE IF NOT EXISTS reported_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- UTILITY FUNCTIONS
-- =========================================

-- Haversine formula function for distance calculation
CREATE OR REPLACE FUNCTION find_dogs_within_radius(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km INTEGER DEFAULT 10
) RETURNS TABLE (
  id UUID,
  owner_id UUID,
  name TEXT,
  primary_breed TEXT,
  secondary_breed TEXT,
  age INTEGER,
  size TEXT,
  temperament TEXT[],
  photos TEXT[],
  bio TEXT,
  location_display TEXT,
  distance_km DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.owner_id,
    d.name,
    d.primary_breed,
    d.secondary_breed,
    d.age,
    d.size,
    d.temperament,
    d.photos,
    d.bio,
    d.location_display,
    ROUND(
      (6371 * acos(
        cos(radians(user_lat)) * cos(radians(d.location_lat)) *
        cos(radians(d.location_lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(d.location_lat))
      ))::numeric, 2
    ) AS distance_km,
    d.created_at
  FROM dogs d
  WHERE (
    6371 * acos(
      cos(radians(user_lat)) * cos(radians(d.location_lat)) *
      cos(radians(d.location_lng) - radians(user_lng)) +
      sin(radians(user_lat)) * sin(radians(d.location_lat))
    )
  ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- TRIGGERS FOR UPDATED_AT
-- =========================================
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_dogs_updated_at
  BEFORE UPDATE ON dogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_dog_profiles_updated_at
  BEFORE UPDATE ON dog_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vaccinations_updated_at
  BEFORE UPDATE ON vaccinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_worming_treatments_updated_at
  BEFORE UPDATE ON worming_treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_flea_treatments_updated_at
  BEFORE UPDATE ON flea_treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE worming_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE flea_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_users ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Dogs RLS policies
CREATE POLICY "Users can view all dogs" ON dogs FOR SELECT USING (true);
CREATE POLICY "Users can update own dogs" ON dogs FOR UPDATE USING (
  owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert dogs to own profile" ON dogs FOR INSERT WITH CHECK (
  owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own dogs" ON dogs FOR DELETE USING (
  owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Dog profiles RLS policies (legacy support)
CREATE POLICY "Users can view all dog profiles" ON dog_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own dog profiles" ON dog_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dog profiles" ON dog_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own dog profiles" ON dog_profiles FOR DELETE USING (auth.uid() = user_id);

-- Health records RLS policies
CREATE POLICY "Users can manage own dog health records" ON vaccinations FOR ALL USING (
  dog_id IN (
    SELECT d.id FROM dogs d
    JOIN profiles p ON d.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own dog worming treatments" ON worming_treatments FOR ALL USING (
  dog_id IN (
    SELECT d.id FROM dogs d
    JOIN profiles p ON d.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own dog flea treatments" ON flea_treatments FOR ALL USING (
  dog_id IN (
    SELECT d.id FROM dogs d
    JOIN profiles p ON d.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Social features RLS policies
CREATE POLICY "Users can manage own friendships" ON friendships FOR ALL USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  friend_user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own conversations" ON conversations FOR ALL USING (
  participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access messages from own conversations" ON messages FOR ALL USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE
    participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage own blocked users" ON blocked_users FOR ALL USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create reports" ON reported_users FOR INSERT WITH CHECK (
  reporter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- =========================================
-- CREATE STORAGE BUCKET
-- =========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('dog-photos', 'dog-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage
CREATE POLICY "Anyone can view dog photos" ON storage.objects FOR SELECT USING (bucket_id = 'dog-photos');
CREATE POLICY "Authenticated users can upload dog photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'dog-photos' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own dog photos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'dog-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own dog photos" ON storage.objects FOR DELETE USING (
  bucket_id = 'dog-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_dogs_owner_id ON dogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_dogs_location ON dogs(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_dogs_created_at ON dogs(created_at);
CREATE INDEX IF NOT EXISTS idx_dog_profiles_user_id ON dog_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(user_id, friend_user_id);

-- =========================================
-- COMPLETION MESSAGE
-- =========================================
DO $$
BEGIN
  RAISE NOTICE 'SocialDog database schema created successfully!';
  RAISE NOTICE 'Tables created: profiles, dogs, dog_profiles, vaccinations, worming_treatments, flea_treatments, friendships, conversations, messages, notifications, blocked_users, reported_users';
  RAISE NOTICE 'Storage bucket created: dog-photos';
  RAISE NOTICE 'RLS policies enabled for all tables';
  RAISE NOTICE 'Performance indexes created';
  RAISE NOTICE 'Run this in Supabase SQL Editor to set up your database.';
END $$;