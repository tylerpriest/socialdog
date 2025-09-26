-- SocialDog Database Schema
-- Based on enhanced TypeScript types from schema-enhancement-specification.md
-- Supports comprehensive NZ dog social platform functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA extensions;

-- =========================================
-- PROFILES TABLE
-- Enhanced user profiles with location precision
-- =========================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Authentication fields
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    auth_provider TEXT NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'google')),
    email_verified BOOLEAN NOT NULL DEFAULT false,

    -- Personal information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER CHECK (age >= 18 AND age <= 120),
    bio TEXT,
    profile_photo TEXT,

    -- Location fields (enhanced with Nominatim integration)
    location TEXT NOT NULL, -- Legacy string location
    city TEXT NOT NULL,
    location_display TEXT, -- Full address display from Nominatim
    latitude DECIMAL(10,8), -- Precise coordinates
    longitude DECIMAL(11,8), -- Precise coordinates

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================
-- DOGS TABLE
-- Comprehensive dog profiles with behavioral matching
-- =========================================
CREATE TABLE dogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

    -- Basic information
    name TEXT NOT NULL,
    primary_breed TEXT NOT NULL,
    secondary_breed TEXT,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 30),
    date_of_birth DATE NOT NULL,
    size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large', 'extra-large')),
    weight DECIMAL(5,2) CHECK (weight > 0),

    -- Legacy compatibility fields (for gradual migration)
    breed TEXT, -- Maps to primary_breed
    gender TEXT CHECK (gender IN ('male', 'female')),

    -- Behavioral fields (CRITICAL for advanced matching)
    temperament TEXT[] NOT NULL DEFAULT '{}',
    energy_level TEXT NOT NULL CHECK (energy_level IN ('low', 'medium', 'high')),
    training_level TEXT NOT NULL CHECK (training_level IN ('basic', 'intermediate', 'advanced', 'professional')),
    socialization TEXT NOT NULL CHECK (socialization IN ('excellent', 'good', 'needs_work')),

    -- Compatibility flags
    good_with_kids BOOLEAN NOT NULL DEFAULT false,
    good_with_dogs BOOLEAN NOT NULL DEFAULT false,
    good_with_cats BOOLEAN NOT NULL DEFAULT false,

    -- Interaction preferences
    interaction_styles TEXT[] NOT NULL DEFAULT '{}',

    -- Health status
    vaccination_status TEXT NOT NULL DEFAULT 'unknown' CHECK (vaccination_status IN ('up-to-date', 'overdue', 'unknown')),
    vaccinated BOOLEAN NOT NULL DEFAULT false,
    neutered BOOLEAN NOT NULL DEFAULT false,
    puppy_not_vaccinated BOOLEAN NOT NULL DEFAULT false,

    -- Media and description
    photos TEXT[] NOT NULL DEFAULT '{}',
    photo_url TEXT, -- Legacy compatibility
    bio TEXT,

    -- Location (precise coordinates)
    location_lat DECIMAL(10,8) NOT NULL,
    location_lng DECIMAL(11,8) NOT NULL,
    location_display TEXT, -- User-friendly address

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================
-- HEALTH RECORDS TABLES
-- Comprehensive health tracking system
-- =========================================

-- Vaccinations table
CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'annually', 'every_2_years')),
    clinic TEXT,
    next_due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Worming treatments table
CREATE TABLE worming_treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'every_2_months', 'every_3_months', 'every_6_months', 'annually')),
    next_due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Flea treatments table
CREATE TABLE flea_treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'every_2_months', 'every_3_months', 'every_6_months', 'annually')),
    next_due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================
-- SOCIAL FEATURES
-- Friends, messaging, notifications system
-- =========================================

-- Friendships table
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    friend_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    context_dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Ensure users can't friend themselves and prevent duplicates
    CONSTRAINT no_self_friendship CHECK (user_id != friend_user_id),
    UNIQUE(user_id, friend_user_id)
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    context_dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Ensure participants are different
    CONSTRAINT different_participants CHECK (participant1_id != participant2_id),
    UNIQUE(participant1_id, participant2_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'match_request', 'message', 'health_reminder')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    related_dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User safety tables
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    blocked_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT no_self_blocking CHECK (user_id != blocked_user_id),
    UNIQUE(user_id, blocked_user_id)
);

CREATE TABLE reported_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Authentication support
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- Optimize for common query patterns
-- =========================================

-- Profile indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_location ON profiles(city, latitude, longitude) WHERE latitude IS NOT NULL;

-- Dogs indexes (critical for discovery and matching)
CREATE INDEX idx_dogs_owner_id ON dogs(owner_id);
CREATE INDEX idx_dogs_location ON dogs(location_lat, location_lng);
CREATE INDEX idx_dogs_size ON dogs(size);
CREATE INDEX idx_dogs_energy_level ON dogs(energy_level);
CREATE INDEX idx_dogs_training_level ON dogs(training_level);
CREATE INDEX idx_dogs_compatibility ON dogs(good_with_kids, good_with_dogs, good_with_cats);
CREATE INDEX idx_dogs_vaccination_status ON dogs(vaccination_status);
CREATE INDEX idx_dogs_created_at ON dogs(created_at);

-- Health records indexes
CREATE INDEX idx_vaccinations_dog_id ON vaccinations(dog_id);
CREATE INDEX idx_vaccinations_next_due ON vaccinations(next_due_date);
CREATE INDEX idx_worming_dog_id ON worming_treatments(dog_id);
CREATE INDEX idx_worming_next_due ON worming_treatments(next_due_date);
CREATE INDEX idx_flea_dog_id ON flea_treatments(dog_id);
CREATE INDEX idx_flea_next_due ON flea_treatments(next_due_date);

-- Social features indexes
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_user_id ON friendships(friend_user_id);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =========================================
-- FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON dogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at BEFORE UPDATE ON vaccinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worming_updated_at BEFORE UPDATE ON worming_treatments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flea_updated_at BEFORE UPDATE ON flea_treatments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- HELPER FUNCTIONS
-- =========================================

-- Calculate distance between two points (Haversine formula)
-- For "dogs within X km" functionality
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lng1 DECIMAL,
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    r DECIMAL := 6371; -- Earth's radius in kilometers
    dlat DECIMAL;
    dlng DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dlat := RADIANS(lat2 - lat1);
    dlng := RADIANS(lng2 - lng1);
    a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlng/2) * SIN(dlng/2);
    c := 2 * ASIN(SQRT(a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql;

-- Update conversation last message timestamp
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();