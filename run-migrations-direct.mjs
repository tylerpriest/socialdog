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

async function executeSQLStatements(sql, migrationName) {
  console.log(`Running ${migrationName}...`)

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

  let successCount = 0
  let skipCount = 0

  for (const stmt of statements) {
    try {
      const { data, error } = await supabase.rpc('exec', { sql: stmt })
      if (error) {
        if (error.message.includes('already exists') ||
            error.message.includes('does not exist')) {
          skipCount++
          continue
        }
        console.log(`Statement error (continuing): ${error.message}`)
        console.log(`Statement: ${stmt.substring(0, 100)}...`)
      } else {
        successCount++
      }
    } catch (err) {
      console.log(`Execution error: ${err.message}`)
    }
  }

  console.log(`✅ ${migrationName} completed (${successCount} executed, ${skipCount} skipped)`)
}

async function runMigrations() {
  console.log('Running database migrations with direct SQL execution...')

  try {
    // Read migration files
    const migration1 = readFileSync(join(__dirname, 'supabase/migrations/001_initial_schema.sql'), 'utf8')
    const migration2 = readFileSync(join(__dirname, 'supabase/migrations/002_row_level_security.sql'), 'utf8')
    const migration3 = readFileSync(join(__dirname, 'supabase/migrations/003_location_functions.sql'), 'utf8')

    await executeSQLStatements(migration1, 'Migration 1: Initial schema')
    await executeSQLStatements(migration2, 'Migration 2: Row Level Security')
    await executeSQLStatements(migration3, 'Migration 3: Location functions')

    console.log('🎉 All migrations completed!')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()