import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Bestätige dein Konto...')

  // Prevent double processing with ref
  const isProcessing = useRef(false)
  const hasCompleted = useRef(false)

  useEffect(() => {
    // Prevent double execution
    if (isProcessing.current || hasCompleted.current) {
      console.log('[AuthCallback] Skipping - already processing or completed')
      return
    }
    isProcessing.current = true

    const handleAuthCallback = async () => {
      try {
        console.log('[AuthCallback] Starting bulletproof callback processing...')
        console.log('[AuthCallback] Full URL:', window.location.href)
        console.log('[AuthCallback] Hash:', window.location.hash)
        console.log('[AuthCallback] Search:', window.location.search)

        // Parse hash fragment (email confirmation, magic link, OAuth implicit)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))

        // Extract all relevant params
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const tokenType = hashParams.get('type') // 'signup', 'recovery', 'magiclink'
        const errorParam = hashParams.get('error') || searchParams.get('error')
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description')
        const code = searchParams.get('code') // PKCE code

        console.log('[AuthCallback] Parsed params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          tokenType,
          hasCode: !!code,
          error: errorParam
        })

        // Check for errors in URL
        if (errorParam) {
          console.error('[AuthCallback] Error in URL:', errorParam, errorDescription)
          setError(errorDescription || errorParam)
          hasCompleted.current = true
          return
        }

        // METHOD 1: Check if Supabase already has a session (auto-detected from URL)
        console.log('[AuthCallback] Method 1: Checking for existing session...')
        const { data: { session: existingSession } } = await supabase.auth.getSession()

        if (existingSession?.user) {
          console.log('[AuthCallback] Method 1 SUCCESS: Found existing session:', existingSession.user.email)
          setStatus('Session gefunden! Leite weiter...')
          await handleSuccessfulAuth(existingSession.user.id, false)
          return
        }

        // METHOD 2: Handle PKCE code exchange (OAuth callback)
        if (code) {
          console.log('[AuthCallback] Method 2: PKCE code exchange...')
          setStatus('Verifiziere OAuth...')

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('[AuthCallback] Method 2 FAILED:', exchangeError)
            // Don't return yet, try other methods
          } else if (data.session) {
            console.log('[AuthCallback] Method 2 SUCCESS:', data.user?.email)
            setStatus('Erfolgreich angemeldet! Leite weiter...')
            await handleSuccessfulAuth(data.session.user.id, false)
            return
          }
        }

        // METHOD 3: Handle hash-based tokens (email confirmation, magic link)
        if (accessToken && refreshToken) {
          console.log('[AuthCallback] Method 3: Setting session from hash tokens...')
          setStatus('Melde dich an...')

          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error('[AuthCallback] Method 3 FAILED:', sessionError)
            // Don't return yet, try fallback
          } else if (data.session) {
            console.log('[AuthCallback] Method 3 SUCCESS:', data.user?.email)

            // Clear hash from URL to prevent re-processing
            window.history.replaceState(null, '', window.location.pathname)

            setStatus('Erfolgreich bestätigt! Leite weiter...')
            await handleSuccessfulAuth(data.session.user.id, tokenType === 'signup')
            return
          }
        }

        // METHOD 4: Fallback - Listen for auth state change with timeout
        console.log('[AuthCallback] Method 4: Waiting for auth state change...')
        setStatus('Warte auf Authentifizierung...')

        const authPromise = new Promise<boolean>((resolve) => {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AuthCallback] Auth state changed:', event, session?.user?.email)

            if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
              subscription.unsubscribe()
              setStatus('Authentifizierung erfolgreich! Leite weiter...')
              await handleSuccessfulAuth(session.user.id, event === 'SIGNED_IN')
              resolve(true)
            }
          })

          // Timeout after 5 seconds
          setTimeout(() => {
            subscription.unsubscribe()
            resolve(false)
          }, 5000)
        })

        const authSucceeded = await authPromise

        if (!authSucceeded) {
          // Final check for session one more time
          console.log('[AuthCallback] Final session check...')
          const { data: { session: finalSession } } = await supabase.auth.getSession()

          if (finalSession?.user) {
            console.log('[AuthCallback] Final check SUCCESS:', finalSession.user.email)
            await handleSuccessfulAuth(finalSession.user.id, false)
            return
          }

          // All methods failed
          console.error('[AuthCallback] All methods failed - no session established')
          setError('Anmeldung fehlgeschlagen. Bitte versuche es erneut.')
          hasCompleted.current = true
        }

      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err)
        setError('Ein unerwarteter Fehler ist aufgetreten')
        hasCompleted.current = true
      }
    }

    // Helper function to handle successful authentication
    const handleSuccessfulAuth = async (userId: string | undefined, isNewSignup: boolean) => {
      if (hasCompleted.current) {
        console.log('[AuthCallback] Already completed, skipping redirect')
        return
      }
      hasCompleted.current = true

      if (!userId) {
        console.error('[AuthCallback] No user ID after auth')
        setError('Benutzer-ID nicht gefunden')
        return
      }

      try {
        // Check if user has completed profile (has user_type)
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('user_type, membername')
          .eq('id', userId)
          .single()

        console.log('[AuthCallback] Profile check:', { profile, error: profileError, isNewSignup })

        // Small delay to ensure session is fully persisted
        await new Promise(resolve => setTimeout(resolve, 300))

        if (profileError || !profile?.user_type) {
          // New user or incomplete profile - show onboarding
          console.log('[AuthCallback] Redirecting to onboarding (no user_type)')
          navigate('/?onboarding=true', { replace: true })
        } else {
          // Existing user with complete profile - go to dashboard
          console.log('[AuthCallback] Redirecting to dashboard')
          navigate('/dashboard/profile', { replace: true })
        }
      } catch (err) {
        console.error('[AuthCallback] Profile check error:', err)
        // Default to home with onboarding on error
        navigate('/?onboarding=true', { replace: true })
      }
    }

    // Small delay to ensure Supabase client is ready
    const timeoutId = setTimeout(handleAuthCallback, 100)

    return () => clearTimeout(timeoutId)
  }, [navigate, searchParams])

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="bg-bg-card p-8 rounded-xl max-w-md text-center border border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Fehler bei der Anmeldung</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/80 transition-colors"
            >
              Zur Startseite
            </button>
            <button
              onClick={() => {
                // Reset refs and reload
                isProcessing.current = false
                hasCompleted.current = false
                window.location.reload()
              }}
              className="w-full px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-accent-purple/30 border-t-accent-purple animate-spin"></div>
        <p className="text-white text-lg font-medium">{status}</p>
        <p className="text-gray-400 text-sm mt-2">Bitte warte einen Moment...</p>
      </div>
    </div>
  )
}
