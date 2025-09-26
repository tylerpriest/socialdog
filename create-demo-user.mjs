#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('Service Role Key:', supabaseKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createDemoUser() {
  console.log('Creating demo user...')

  const demoEmail = 'demo@demo.com'
  const demoPassword = 'Password123'

  try {
    // Check if user already exists
    console.log('Checking if demo user already exists...')
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(user => user.email === demoEmail)

    if (existingUser) {
      console.log('Demo user already exists with ID:', existingUser.id)
      return
    }

    // Create new user with admin API
    console.log('Creating new demo user...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true, // Skip email confirmation for demo user
      user_metadata: {
        firstName: 'Demo',
        lastName: 'User',
        location: 'Auckland, New Zealand'
      }
    })

    if (authError) {
      console.error('Error creating user:', authError)
      return
    }

    console.log('✅ Demo user created:', authData.user?.email)
    console.log('User ID:', authData.user?.id)

    // Profile creation will be handled by the application when the user first logs in
    console.log('✅ User created - profile will be created on first login')

    console.log('🎉 Demo user setup completed!')
    console.log('Email:', demoEmail)
    console.log('Password:', demoPassword)

  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

createDemoUser()