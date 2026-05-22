import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Return null instead of throwing so the app can run in environments
    // where the service role key is intentionally omitted (dev without secrets).
    // Callers must handle the null case and surface a helpful error.
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set; admin client unavailable')
    return null as any
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
