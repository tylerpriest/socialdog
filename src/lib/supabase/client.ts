import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use placeholder values during build if env vars are missing
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTEyNzIwMCwiZXhwIjo5NTAzNjgzMjAwfQ.placeholder-key'

  return createBrowserClient(url, key)
}

export const supabase = createClient()