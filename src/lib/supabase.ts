import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.generated'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient<Database>(supabaseUrl, supabasePublishableKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null

// database.generated.ts lags behind the live schema, so queries on columns it
// is missing go through this untyped view of the same client.
export const untypedSupabase = supabase as unknown as SupabaseClient | null
