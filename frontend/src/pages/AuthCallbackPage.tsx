import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [statusMessage, setStatusMessage] = useState('Bestätige dein Konto...')
  const [errorMessage, setErrorMessage] = useState('')

  // Prevent double processing with ref
  const isProcessing = useRef(false)
  const hasCompleted = useRef(false)

  useEffect(() => {
    // Prevent double execution (React StrictMode)
    if (isProcessing.current || hasCompleted.current) {
      console.log('[AuthCallback] Skipping - already processing or completed')
      return
    }
    isProcessing.current = true

    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Starting callback processing...')
        console.log('[AuthCallback] Full URL:', window.location.href)
        console.log('[AuthCallback] Origin:', window.location.origin)
        console.log('[AuthCallback] Search:', window.location.search)
        console.log('[AuthCallback] Hash:', window.location.hash)

        // Step 1: Check for errors in URL
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (errorParam) {
          console.error('[AuthCallback] OAuth error in URL:', errorParam, errorDescription)
          throw new Error(errorDescription || errorParam)
        }

        // Step 2: Check for PKCE code (OAuth flow)
        const code = searchParams.get('code')

        if (code) {
          console.log('[AuthCallback] PKCE code found, attempting exchange...')
          setStatusMessage('Verifiziere OAuth...')

          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
              console.error('[AuthCallback] Code exchange error:', error.message)

              // Handle PKCE code verifier issue specifically
              if (error.message?.includes('code verifier') || error.message?.includes('PKCE')) {
                console.log('[AuthCallback] PKCE verifier issue, checking for existing session...')
                setStatusMessage('Überprüfe bestehende Session...')

                // The code verifier is stored in localStorage and might be lost
                // Try getting session anyway
                const { data: { session } } = await supabase.auth.getSession()

                if (session) {
                  console.log('[AuthCallback] Found existing session despite PKCE error:', session.user?.email)
                  await handleSuccessfulAuth(session)
                  return
                }

                // No session found - redirect to home to try again
                console.log('[AuthCallback] No session found after PKCE error, redirecting to home')
                setStatusMessage('Bitte melde dich erneut an...')
                await new Promise(resolve => setTimeout(resolve, 1500))
                navigate('/', { replace: true })
                return
              }

              // Other errors - try getting session anyway
              const { data: { session } } = await supabase.auth.getSession()
              if (session) {
                console.log('[AuthCallback] Session found despite exchange error:', session.user?.email)
                await handleSuccessfulAuth(session)
                return
              }
              throw error
            }

            if (data.session) {
              console.log('[AuthCallback] Code exchanged successfully:', data.user?.email)
              setStatusMessage('Erfolgreich angemeldet! Leite weiter...')
              await handleSuccessfulAuth(data.session)
              return
            }
          } catch (exchangeErr) {
            console.error('[AuthCallback] Exchange exception:', exchangeErr)

            // Final fallback - check for session one more time
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              console.log('[AuthCallback] Found session after exchange exception:', session.user?.email)
              await handleSuccessfulAuth(session)
              return
            }

            // If PKCE-related, redirect gracefully instead of showing error
            if (exchangeErr instanceof Error && exchangeErr.message?.includes('code verifier')) {
              console.log('[AuthCallback] PKCE error in catch, redirecting to home')
              navigate('/', { replace: true })
              return
            }

            throw exchangeErr
          }
        }

        // Step 3: Check for hash tokens (email confirmation / magic link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const tokenType = hashParams.get('type') // 'signup', 'recovery', 'magiclink'

        if (accessToken && refreshToken) {
          console.log('[AuthCallback] Hash tokens found, setting session... (type:', tokenType, ')')
          setStatusMessage('Melde dich an...')

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error('[AuthCallback] setSession error:', error)
            throw error
          }

          if (data.session) {
            console.log('[AuthCallback] Session set from hash:', data.user?.email)
            // Clear hash from URL to prevent re-processing
            window.history.replaceState(null, '', window.location.pathname)
            setStatusMessage('Erfolgreich bestätigt! Leite weiter...')
            await handleSuccessfulAuth(data.session, tokenType === 'signup')
            return
          }
        }

        // Step 4: Check for existing session
        console.log('[AuthCallback] No tokens found, checking existing session...')
        setStatusMessage('Überprüfe Session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (session) {
          console.log('[AuthCallback] Existing session found:', session.user?.email)
          setStatusMessage('Session gefunden! Leite weiter...')
          await handleSuccessfulAuth(session)
          return
        }

        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError)
          throw sessionError
        }

        // Step 5: Wait for auth state change (last resort)
        console.log('[AuthCallback] Waiting for auth state change...')
        setStatusMessage('Warte auf Authentifizierung...')

        const authPromise = new Promise<boolean>((resolve) => {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AuthCallback] Auth state change:', event, session?.user?.email || 'no user')

            if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
              subscription.unsubscribe()
              setStatusMessage('Authentifizierung erfolgreich! Leite weiter...')
              await handleSuccessfulAuth(session, event === 'SIGNED_IN')
              resolve(true)
            }
          })

          // Timeout after 8 seconds
          setTimeout(() => {
            subscription.unsubscribe()
            resolve(false)
          }, 8000)
        })

        const authSucceeded = await authPromise

        if (!authSucceeded) {
          // Final check for session one more time
          console.log('[AuthCallback] Final session check...')
          const { data: { session: finalSession } } = await supabase.auth.getSession()

          if (finalSession?.user) {
            console.log('[AuthCallback] Final check SUCCESS:', finalSession.user.email)
            await handleSuccessfulAuth(finalSession)
            return
          }

          // All methods failed
          console.error('[AuthCallback] All methods failed - no session established')
          throw new Error('Anmeldung fehlgeschlagen. Bitte versuche es erneut.')
        }

      } catch (err: unknown) {
        console.error('[AuthCallback] Error:', err)
        const errorMsg = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten'
        setErrorMessage(errorMsg)
        setStatus('error')
        hasCompleted.current = true
      }
    }

    // Helper function to handle successful authentication
    const handleSuccessfulAuth = async (session: { user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } }, isNewSignup = false) => {
      if (hasCompleted.current) {
        console.log('[AuthCallback] Already completed, skipping redirect')
        return
      }
      hasCompleted.current = true

      if (!session?.user?.id) {
        console.error('[AuthCallback] No user ID after auth')
        setErrorMessage('Benutzer-ID nicht gefunden')
        setStatus('error')
        return
      }

      setStatus('success')

      try {
        // Check if user has completed profile (has user_type)
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('user_type, membername')
          .eq('id', session.user.id)
          .maybeSingle() // Use maybeSingle to avoid error when no row exists

        console.log('[AuthCallback] Profile check:', {
          profile,
          error: profileError,
          isNewSignup,
          metaUserType: session.user.user_metadata?.user_type
        })

        // Small delay to ensure session is fully persisted
        await new Promise(resolve => setTimeout(resolve, 500))

        // Determine if user needs onboarding:
        // - No profile found (error or null)
        // - No user_type set
        // - user_type is 'community' (default from OAuth trigger, hasn't chosen yet)
        const userType = profile?.user_type || session.user.user_metadata?.user_type
        const needsOnboarding = profileError || !userType || userType === '' || userType === 'community'

        console.log('[AuthCallback] User type:', userType, 'Needs onboarding:', needsOnboarding)

        if (needsOnboarding) {
          // New user or OAuth user who hasn't chosen their type
          console.log('[AuthCallback] Redirecting to onboarding...')
          navigate('/?onboarding=true', { replace: true })
        } else {
          // Existing user with chosen profile type - go to dashboard
          console.log('[AuthCallback] Redirecting to dashboard...')
          navigate('/dashboard/profile', { replace: true })
        }
      } catch (err) {
        console.error('[AuthCallback] Profile check error:', err)
        // Default to onboarding on error
        navigate('/?onboarding=true', { replace: true })
      }
    }

    // Small delay to ensure Supabase client is ready
    const timeoutId = setTimeout(handleCallback, 100)

    return () => clearTimeout(timeoutId)
  }, [navigate, searchParams])

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="bg-[#232323] p-8 rounded-2xl max-w-md w-full text-center border border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Fehler bei der Anmeldung</h1>
          <p className="text-red-400 mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#610AD1] to-[#FB7A43] text-white font-medium rounded-lg hover:opacity-90 transition-colors"
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
              className="w-full px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
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
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-accent-purple/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent-purple animate-spin"></div>
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">
          {status === 'success' ? 'Erfolgreich angemeldet!' : statusMessage}
        </h1>
        <p className="text-gray-400">
          {status === 'success' ? 'Du wirst weitergeleitet...' : 'Bitte warte einen Moment...'}
        </p>
      </div>
    </div>
  )
}
