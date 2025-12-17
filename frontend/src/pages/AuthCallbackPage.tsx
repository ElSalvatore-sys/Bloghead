import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Bestätige dein Konto...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Debug: Log full URL info
        console.log('[AuthCallback] Starting callback processing...')
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
          return
        }

        // PRIORITY 1: Handle hash-based tokens (email confirmation, magic link)
        if (accessToken && refreshToken) {
          console.log('[AuthCallback] Found hash tokens, setting session...')
          setStatus('Melde dich an...')

          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error('[AuthCallback] setSession error:', sessionError)
            setError(sessionError.message)
            return
          }

          console.log('[AuthCallback] Session set successfully:', data.user?.email)

          // Clear hash from URL to prevent re-processing
          window.history.replaceState(null, '', window.location.pathname)

          // Redirect based on token type
          setStatus('Erfolgreich bestätigt! Leite weiter...')

          await handleSuccessfulAuth(data.session?.user?.id, tokenType === 'signup')
          return
        }

        // PRIORITY 2: Handle PKCE code exchange (OAuth)
        if (code) {
          console.log('[AuthCallback] Found PKCE code, exchanging...')
          setStatus('Verifiziere OAuth...')

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('[AuthCallback] Code exchange error:', exchangeError)
            setError(exchangeError.message)
            return
          }

          console.log('[AuthCallback] Code exchanged successfully:', data.user?.email)
          setStatus('Erfolgreich angemeldet! Leite weiter...')

          await handleSuccessfulAuth(data.session?.user?.id, false)
          return
        }

        // PRIORITY 3: Check if Supabase already processed the URL (detectSessionInUrl)
        console.log('[AuthCallback] No explicit tokens, checking for existing session...')
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          console.log('[AuthCallback] Found existing session:', session.user.email)
          setStatus('Session gefunden! Leite weiter...')

          await handleSuccessfulAuth(session.user.id, false)
          return
        }

        // No valid auth data found
        console.error('[AuthCallback] No tokens, code, or session found')
        setError('Keine gültigen Anmeldedaten gefunden. Bitte versuche es erneut.')

      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err)
        setError('Ein unerwarteter Fehler ist aufgetreten')
      }
    }

    // Helper function to handle successful authentication
    const handleSuccessfulAuth = async (userId: string | undefined, _isNewSignup: boolean) => {
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

        console.log('[AuthCallback] Profile check:', { profile, error: profileError })

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

    // Small delay to ensure Supabase client is ready and URL is processed
    const timeoutId = setTimeout(handleAuthCallback, 150)

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
              onClick={() => window.location.reload()}
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
