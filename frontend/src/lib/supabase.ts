import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Determine the correct site URL based on environment
const getSiteUrl = (): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // In production (Vercel), use the actual origin
    // In development, use localhost
    const origin = window.location.origin

    // Log for debugging
    console.log('[Supabase] Detected origin:', origin)

    // If we're on the production domain, use it
    if (origin.includes('blogyydev.xyz') || origin.includes('vercel.app')) {
      return origin
    }

    // For localhost or any other domain, use the origin as-is
    return origin
  }

  // SSR fallback (shouldn't happen in Vite SPA, but just in case)
  return 'https://blogyydev.xyz'
}

// Debug logging for production troubleshooting
console.log('[Supabase] Initializing...')
console.log('[Supabase] URL configured:', !!supabaseUrl, supabaseUrl ? `(${supabaseUrl.substring(0, 30)}...)` : '(missing)')
console.log('[Supabase] Anon key configured:', !!supabaseAnonKey, supabaseAnonKey ? '(set)' : '(missing)')
console.log('[Supabase] Environment:', import.meta.env.PROD ? 'production' : 'development')
console.log('[Supabase] Site URL:', getSiteUrl())

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
      detectSessionInUrl: true,  // IMPORTANT for email confirmation and OAuth redirects
      flowType: 'pkce',  // More secure OAuth flow
    },
  })
  console.log('[Supabase] Client initialized successfully')
}

// Export helper for OAuth redirects - use this in all OAuth calls
export const getOAuthRedirectUrl = (): string => {
  const url = `${getSiteUrl()}/auth/callback`
  console.log('[Supabase] OAuth redirect URL:', url)
  return url
}

export { supabase }
