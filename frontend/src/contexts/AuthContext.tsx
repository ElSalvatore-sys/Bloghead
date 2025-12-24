import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, getOAuthRedirectUrl } from '../lib/supabase'

// Database user profile type (exported for use in other components)
export interface UserProfile {
  id: string
  email: string
  membername: string
  vorname: string | null
  nachname: string | null
  user_type: 'fan' | 'artist' | 'service_provider' | 'event_organizer' | 'veranstalter' | 'customer' | 'community'
  profile_image_url: string | null
  cover_image_url: string | null
  is_verified: boolean
  membership_tier: 'basic' | 'premium' | null
  role?: 'user' | 'admin' | 'moderator'
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  needsOnboarding: boolean
  completeOnboarding: () => void
  signUp: (email: string, password: string, metadata?: object) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signInWithFacebook: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  // Fetch user profile from database with retry logic for RLS timing issues
  const fetchUserProfile = useCallback(async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
    const MAX_RETRIES = 3
    const RETRY_DELAY = 300 // ms - reduced for faster retries

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, membername, vorname, nachname, user_type, profile_image_url, cover_image_url, is_verified, membership_tier, role')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle to avoid error when no row exists yet

      if (error) {
        // Retry on temporary errors or network issues
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
          return fetchUserProfile(userId, retryCount + 1)
        }

        setUserProfile(null)
        return null
      }

      // No error but no data - user might not exist in public.users yet
      if (!data) {
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
          return fetchUserProfile(userId, retryCount + 1)
        }
        setUserProfile(null)
        return null
      }

      setUserProfile(data as UserProfile)
      return data as UserProfile
    } catch {
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        return fetchUserProfile(userId, retryCount + 1)
      }
      setUserProfile(null)
      return null
    }
  }, [])

  // Refresh user profile (can be called manually)
  const refreshUserProfile = useCallback(async () => {
    if (user?.id) {
      await fetchUserProfile(user.id)
    }
  }, [user?.id, fetchUserProfile])

  // Check if user needs onboarding (no user_type set or default 'community')
  const checkOnboardingNeeded = useCallback((profile: UserProfile | null) => {
    if (!profile) {
      setNeedsOnboarding(false)
      return
    }
    // User needs onboarding if:
    // - No user_type set
    // - user_type is 'community' (default from OAuth trigger, hasn't explicitly chosen)
    // Note: Once user completes onboarding, they'll have 'fan', 'artist', 'service_provider', or 'event_organizer'
    const needsIt = !profile.user_type || profile.user_type === 'community'
    setNeedsOnboarding(needsIt)
  }, [])

  // Called when onboarding is completed
  const completeOnboarding = useCallback(() => {
    setNeedsOnboarding(false)
  }, [])

  useEffect(() => {
    // Helper to fetch profile with timeout (10s to accommodate slow networks)
    const fetchProfileWithTimeout = async (userId: string, timeoutMs = 10000): Promise<UserProfile | null> => {
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          resolve(null)
        }, timeoutMs)
      })

      return Promise.race([fetchUserProfile(userId), timeoutPromise])
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Fetch user profile from database if logged in
      if (session?.user?.id) {
        const profile = await fetchProfileWithTimeout(session.user.id)
        checkOnboardingNeeded(profile)
      } else {
        setUserProfile(null)
        checkOnboardingNeeded(null)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)

        // Fetch user profile from database if logged in
        if (session?.user?.id) {
          const profile = await fetchProfileWithTimeout(session.user.id)
          checkOnboardingNeeded(profile)
        } else {
          setUserProfile(null)
          checkOnboardingNeeded(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [checkOnboardingNeeded, fetchUserProfile])

  const signUp = async (email: string, password: string, metadata?: object) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    const redirectUrl = getOAuthRedirectUrl()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    })

    return { error }
  }

  const signInWithFacebook = async () => {
    const redirectUrl = getOAuthRedirectUrl()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectUrl,
      }
    })

    return { error }
  }

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null)
      setUserProfile(null)
      setSession(null)
      setNeedsOnboarding(false)

      // Then sign out from Supabase (this should clear localStorage)
      const { error } = await supabase.auth.signOut()

      if (error) {
        // Force clear localStorage if Supabase signOut fails
        const keys = Object.keys(localStorage).filter(k => k.includes('sb-') || k.includes('supabase'))
        keys.forEach(k => localStorage.removeItem(k))
      }
    } catch {
      // Force clear on any error
      const keys = Object.keys(localStorage).filter(k => k.includes('sb-') || k.includes('supabase'))
      keys.forEach(k => localStorage.removeItem(k))
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      session,
      loading,
      needsOnboarding,
      completeOnboarding,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
