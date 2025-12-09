import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Bestätige dein Konto...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('[AuthCallback] Starting auth callback handling...')
        console.log('[AuthCallback] Current URL:', window.location.href)

        // Get the auth code/tokens from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)

        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type') || queryParams.get('type')
        const errorParam = hashParams.get('error') || queryParams.get('error')
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description')
        const code = queryParams.get('code')

        console.log('[AuthCallback] Params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type,
          hasCode: !!code,
          error: errorParam
        })

        // Check for errors in URL
        if (errorParam) {
          console.error('[AuthCallback] Error in URL:', errorParam, errorDescription)
          setError(errorDescription || errorParam)
          return
        }

        // If tokens in URL hash (email confirmation flow), set session
        if (accessToken && refreshToken) {
          console.log('[AuthCallback] Setting session from URL tokens...')
          setStatus('Melde dich an...')

          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error('[AuthCallback] Session error:', sessionError)
            setError(sessionError.message)
            return
          }

          console.log('[AuthCallback] Session set successfully')
        }

        // Try to exchange code for session (PKCE flow)
        if (code) {
          console.log('[AuthCallback] Exchanging code for session...')
          setStatus('Verifiziere...')

          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            console.error('[AuthCallback] Code exchange error:', exchangeError)
            setError(exchangeError.message)
            return
          }

          console.log('[AuthCallback] Code exchanged successfully')
        }

        // Check if we now have a session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('[AuthCallback] Current session:', session ? `User: ${session.user.id}` : 'No session')

        if (session?.user) {
          setStatus('Erfolgreich bestätigt! Leite weiter...')

          // Check if user needs onboarding
          const { data: profile } = await supabase
            .from('users')
            .select('user_type')
            .eq('id', session.user.id)
            .single()

          console.log('[AuthCallback] User profile:', profile)

          if (!profile?.user_type) {
            // New user needs onboarding
            console.log('[AuthCallback] Redirecting to onboarding...')
            navigate('/?onboarding=true', { replace: true })
          } else {
            // Existing user - go to dashboard
            console.log('[AuthCallback] Redirecting to dashboard...')
            navigate('/dashboard/profile', { replace: true })
          }
        } else {
          console.error('[AuthCallback] No session after callback')
          setError('Keine gültige Session gefunden. Bitte versuche es erneut.')
        }
      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err)
        setError('Ein unerwarteter Fehler ist aufgetreten')
      }
    }

    // Small delay to let Supabase process URL params
    const timeoutId = setTimeout(handleAuthCallback, 100)

    return () => clearTimeout(timeoutId)
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="bg-bg-card p-8 rounded-xl max-w-md text-center border border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Fehler</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/80 transition-colors"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-accent-purple/30 border-t-accent-purple animate-spin"></div>
        <p className="text-white text-lg">{status}</p>
      </div>
    </div>
  )
}
