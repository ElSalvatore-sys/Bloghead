import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// IMPORTANT: Always use non-www for consistency
// www.blogyydev.xyz and blogyydev.xyz have DIFFERENT localStorage!
// This causes PKCE code verifier to be lost between OAuth redirect
const getCanonicalSiteUrl = (): string => {
  if (import.meta.env.PROD) {
    // Always use non-www in production - never dynamic origin
    return 'https://blogyydev.xyz'
  }
  return 'http://localhost:5173'
}

// Client-side redirect: www -> non-www (backup for Vercel redirect)
// This runs BEFORE Supabase client is created
if (typeof window !== 'undefined' && window.location.hostname === 'www.blogyydev.xyz') {
  const newUrl = window.location.href.replace('www.blogyydev.xyz', 'blogyydev.xyz')
  window.location.replace(newUrl)
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Use consistent storage key to prevent issues
    storageKey: 'bloghead-auth-token',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

// Export helper for OAuth redirects - ALWAYS uses canonical non-www URL
export const getOAuthRedirectUrl = (): string => {
  return `${getCanonicalSiteUrl()}/auth/callback`
}

export { supabase as default }
