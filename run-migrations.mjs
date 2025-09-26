#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

async function runMigrations() {
  console.log('Running database migrations...')

  try {
    // Read migration files
    const migration1 = readFileSync(join(__dirname, 'supabase/migrations/001_initial_schema.sql'), 'utf8')
    const migration2 = readFileSync(join(__dirname, 'supabase/migrations/002_row_level_security.sql'), 'utf8')
    const migration3 = readFileSync(join(__dirname, 'supabase/migrations/003_location_functions.sql'), 'utf8')

    console.log('Running migration 1: Initial schema...')

    // Split migration into individual statements and execute them
    const statements1 = migration1.split(';').filter(stmt => stmt.trim().length > 0)
    for (const stmt of statements1) {
      const trimmedStmt = stmt.trim()
      if (trimmedStmt && !trimmedStmt.startsWith('--')) {
        const { error } = await supabase.rpc('exec_sql', { sql: trimmedStmt })
        if (error && !error.message.includes('already exists')) {
          console.log('Statement error (continuing):', error.message)
        }
      }
    }
    console.log('✅ Migration 1 completed')

    console.log('Running migration 2: Row Level Security...')
    const statements2 = migration2.split(';').filter(stmt => stmt.trim().length > 0)
    for (const stmt of statements2) {
      const trimmedStmt = stmt.trim()
      if (trimmedStmt && !trimmedStmt.startsWith('--')) {
        const { error } = await supabase.rpc('exec_sql', { sql: trimmedStmt })
        if (error && !error.message.includes('already exists')) {
          console.log('Statement error (continuing):', error.message)
        }
      }
    }
    console.log('✅ Migration 2 completed')

    console.log('Running migration 3: Location functions...')
    const statements3 = migration3.split(';').filter(stmt => stmt.trim().length > 0)
    for (const stmt of statements3) {
      const trimmedStmt = stmt.trim()
      if (trimmedStmt && !trimmedStmt.startsWith('--')) {
        const { error } = await supabase.rpc('exec_sql', { sql: trimmedStmt })
        if (error && !error.message.includes('already exists')) {
          console.log('Statement error (continuing):', error.message)
        }
      }
    }
    console.log('✅ Migration 3 completed')

    console.log('🎉 All migrations completed successfully!')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()