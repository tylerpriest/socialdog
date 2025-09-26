#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin() {
  console.log('Testing demo user login...')

  const demoEmail = 'demo@demo.com'
  const demoPassword = 'Password123'

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword
    })

    if (error) {
      console.error('❌ Login failed:', error.message)
      return
    }

    console.log('✅ Login successful!')
    console.log('User ID:', data.user?.id)
    console.log('Email:', data.user?.email)
    console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No')

    // Clean up - sign out
    await supabase.auth.signOut()
    console.log('✅ Signed out successfully')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testLogin()