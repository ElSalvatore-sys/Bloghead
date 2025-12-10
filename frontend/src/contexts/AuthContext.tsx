import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Database user profile type (exported for use in other components)
export interface UserProfile {
  id: string
  email: string
  membername: string
  vorname: string | null
  nachname: string | null
  user_type: 'fan' | 'artist' | 'service_provider' | 'event_organizer' | 'veranstalter' | 'customer'
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

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, membername, vorname, nachname, user_type, profile_image_url, cover_image_url, is_verified, membership_tier, role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        setUserProfile(null)
        return null
      }

      setUserProfile(data as UserProfile)
      return data as UserProfile
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
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

  // Check if user needs onboarding (no user_type set)
  const checkOnboardingNeeded = useCallback((profile: UserProfile | null) => {
    if (!profile) {
      setNeedsOnboarding(false)
      return
    }
    // Check if user has a user_type in their database profile
    setNeedsOnboarding(!profile.user_type)
  }, [])

  // Called when onboarding is completed
  const completeOnboarding = useCallback(() => {
    setNeedsOnboarding(false)
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Fetch user profile from database if logged in
      if (session?.user?.id) {
        const profile = await fetchUserProfile(session.user.id)
        checkOnboardingNeeded(profile)
      } else {
        setUserProfile(null)
        checkOnboardingNeeded(null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)

        // Fetch user profile from database if logged in
        if (session?.user?.id) {
          const profile = await fetchUserProfile(session.user.id)
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
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
