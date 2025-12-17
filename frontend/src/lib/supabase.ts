import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging for production troubleshooting
console.log('[Supabase] Initializing...')
console.log('[Supabase] URL configured:', !!supabaseUrl, supabaseUrl ? `(${supabaseUrl.substring(0, 30)}...)` : '(missing)')
console.log('[Supabase] Anon key configured:', !!supabaseAnonKey, supabaseAnonKey ? '(set)' : '(missing)')

let supabase: SupabaseClient

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables! Check Vercel env configuration.')
  console.error('[Supabase] Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  // Create a dummy client that will fail gracefully
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,  // IMPORTANT for email confirmation redirect
      flowType: 'pkce',  // More secure OAuth flow
    },
  })
  console.log('[Supabase] Client initialized successfully')
}

export { supabase }
