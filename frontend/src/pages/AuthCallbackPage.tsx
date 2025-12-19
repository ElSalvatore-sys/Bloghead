import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [statusMessage, setStatusMessage] = useState('Anmeldung wird verarbeitet...')
  const [errorMessage, setErrorMessage] = useState('')
  const processedRef = useRef(false)

  useEffect(() => {
    // Prevent double execution (React StrictMode)
    if (processedRef.current) {
      console.log('[AuthCallback] Already processed, skipping')
      return
    }
    processedRef.current = true

    const handleCallback = async () => {
      console.log('[AuthCallback] Starting...')
      console.log('[AuthCallback] URL:', window.location.href)
      console.log('[AuthCallback] Hostname:', window.location.hostname)

      // CRITICAL: Redirect www to non-www IMMEDIATELY
      // www and non-www have different localStorage = PKCE verifier lost!
      if (window.location.hostname === 'www.blogyydev.xyz') {
        const newUrl = window.location.href.replace('www.blogyydev.xyz', 'blogyydev.xyz')
        console.log('[AuthCallback] Redirecting www to non-www:', newUrl)
        window.location.replace(newUrl)
        return
      }

      try {
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDesc = searchParams.get('error_description')

        console.log('[AuthCallback] Params:', { hasCode: !!code, error: errorParam })

        // Step 1: Handle OAuth errors from provider
        if (errorParam) {
          throw new Error(errorDesc || errorParam)
        }

        // Step 2: Exchange PKCE code for session
        if (code) {
          console.log('[AuthCallback] Exchanging PKCE code...')
          setStatusMessage('Verifiziere Anmeldung...')

          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error('[AuthCallback] Exchange error:', error.message)

            // PKCE verifier missing - common when localStorage was cleared or domain changed
            if (error.message.includes('code verifier') || error.message.includes('invalid request')) {
              console.log('[AuthCallback] PKCE verifier issue, checking for existing session...')
              setStatusMessage('Prüfe bestehende Sitzung...')

              // Wait briefly for any async session updates
              await new Promise(resolve => setTimeout(resolve, 500))

              const { data: { session } } = await supabase.auth.getSession()
              if (session) {
                console.log('[AuthCallback] Found existing session:', session.user?.email)
                await handleSuccess(session)
                return
              }

              // No session found - redirect to home to try again
              console.log('[AuthCallback] No session, redirecting to home')
              setStatusMessage('Bitte erneut anmelden...')
              await new Promise(resolve => setTimeout(resolve, 1000))
              window.history.replaceState({}, '', '/')
              navigate('/', { replace: true })
              return
            }

            throw error
          }

          if (data.session) {
            console.log('[AuthCallback] Exchange successful:', data.user?.email)
            await handleSuccess(data.session)
            return
          }
        }

        // Step 3: Check for hash tokens (email confirmation / magic link)
        const hash = window.location.hash
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')

          if (accessToken && refreshToken) {
            console.log('[AuthCallback] Setting session from hash tokens...')
            setStatusMessage('Bestätige E-Mail...')

            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (error) throw error

            // Clear hash from URL
            window.history.replaceState({}, '', window.location.pathname)
            await handleSuccess(data.session)
            return
          }
        }

        // Step 4: Check for existing session
        console.log('[AuthCallback] Checking for existing session...')
        setStatusMessage('Prüfe Sitzung...')

        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log('[AuthCallback] Found existing session:', session.user?.email)
          await handleSuccess(session)
          return
        }

        // Step 5: Wait for auth state change (last resort)
        console.log('[AuthCallback] Waiting for auth state change...')
        setStatusMessage('Warte auf Authentifizierung...')

        const authTimeout = setTimeout(() => {
          console.log('[AuthCallback] Timeout reached, redirecting to home')
          navigate('/', { replace: true })
        }, 5000)

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[AuthCallback] Auth state change:', event)
          if (event === 'SIGNED_IN' && session) {
            clearTimeout(authTimeout)
            subscription.unsubscribe()
            await handleSuccess(session)
          }
        })

      } catch (err: unknown) {
        console.error('[AuthCallback] Error:', err)
        const errorMsg = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten'
        setErrorMessage(errorMsg)
        setStatus('error')
      }
    }

    const handleSuccess = async (session: { user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } } | null) => {
      if (!session?.user?.id) {
        console.error('[AuthCallback] No user in session')
        navigate('/', { replace: true })
        return
      }

      setStatus('success')
      setStatusMessage('Anmeldung erfolgreich!')
      console.log('[AuthCallback] Success for:', session.user.email)

      // Check if user needs onboarding
      const { data: profile } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .maybeSingle()

      const userType = profile?.user_type || session.user.user_metadata?.user_type
      const needsOnboarding = !userType || userType === '' || userType === 'community'

      console.log('[AuthCallback] User type:', userType, '| Needs onboarding:', needsOnboarding)

      // Small delay to show success state
      await new Promise(resolve => setTimeout(resolve, 300))

      if (needsOnboarding) {
        console.log('[AuthCallback] Redirecting to onboarding...')
        navigate('/?onboarding=true', { replace: true })
      } else {
        console.log('[AuthCallback] Redirecting to dashboard...')
        navigate('/dashboard/profile', { replace: true })
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
                processedRef.current = false
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
