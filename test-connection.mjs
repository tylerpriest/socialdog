#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key available:', !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      console.log('Connection test error:', error.message)
      console.log('This is expected - tables need to be created via Supabase SQL editor')
      console.log('Please run the SQL script in: /Users/tyler/Projects/Chats/socialdog/database-setup.sql')
      console.log('In Supabase SQL editor: https://supabase.com/dashboard/project/tgivjokzuhlunkmenukn/sql/new')
    } else {
      console.log('✅ Database connection successful!')
      console.log('Found profiles:', data?.length || 0)
    }

    // Test auth users table
    const { data: authTest, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.log('Auth error:', authError.message)
    } else {
      console.log('✅ Auth system working')
      console.log('Users found:', authTest.users?.length || 0)
    }

  } catch (error) {
    console.error('Connection test failed:', error.message)
  }
}

testConnection()