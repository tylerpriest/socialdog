#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('Setting up database tables...')

  try {
    // Create profiles table
    console.log('Creating profiles table...')
    const { error: profilesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
          auth_provider TEXT NOT NULL DEFAULT 'email',
          email_verified BOOLEAN NOT NULL DEFAULT false,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL,
          age INTEGER CHECK (age >= 18 AND age <= 120),
          bio TEXT,
          profile_photo TEXT,
          location TEXT NOT NULL,
          city TEXT NOT NULL,
          location_display TEXT,
          latitude DECIMAL(10,8),
          longitude DECIMAL(11,8),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `
    })

    if (profilesError && !profilesError.message.includes('already exists')) {
      console.error('Error creating profiles table:', profilesError)
    } else {
      console.log('✅ Profiles table ready')
    }

    // Create dogs table
    console.log('Creating dogs table...')
    const { error: dogsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS dogs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          name TEXT NOT NULL,
          primary_breed TEXT NOT NULL,
          secondary_breed TEXT,
          age INTEGER NOT NULL CHECK (age >= 0 AND age <= 30),
          date_of_birth DATE NOT NULL,
          size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large', 'extra-large')),
          weight DECIMAL(5,2) CHECK (weight > 0),
          breed TEXT,
          gender TEXT CHECK (gender IN ('male', 'female')),
          temperament TEXT[] NOT NULL DEFAULT '{}',
          energy_level TEXT NOT NULL CHECK (energy_level IN ('low', 'medium', 'high')),
          training_level TEXT NOT NULL CHECK (training_level IN ('basic', 'intermediate', 'advanced', 'professional')),
          socialization TEXT NOT NULL CHECK (socialization IN ('excellent', 'good', 'needs_work')),
          good_with_kids BOOLEAN NOT NULL DEFAULT false,
          good_with_dogs BOOLEAN NOT NULL DEFAULT false,
          good_with_cats BOOLEAN NOT NULL DEFAULT false,
          interaction_styles TEXT[] NOT NULL DEFAULT '{}',
          vaccination_status TEXT NOT NULL DEFAULT 'unknown' CHECK (vaccination_status IN ('up-to-date', 'overdue', 'unknown')),
          vaccinated BOOLEAN NOT NULL DEFAULT false,
          neutered BOOLEAN NOT NULL DEFAULT false,
          puppy_not_vaccinated BOOLEAN NOT NULL DEFAULT false,
          photos TEXT[] NOT NULL DEFAULT '{}',
          photo_url TEXT,
          bio TEXT,
          location_lat DECIMAL(10,8) NOT NULL,
          location_lng DECIMAL(11,8) NOT NULL,
          location_display TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `
    })

    if (dogsError && !dogsError.message.includes('already exists')) {
      console.error('Error creating dogs table:', dogsError)
    } else {
      console.log('✅ Dogs table ready')
    }

    console.log('🎉 Database setup completed!')

  } catch (error) {
    console.error('Database setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()