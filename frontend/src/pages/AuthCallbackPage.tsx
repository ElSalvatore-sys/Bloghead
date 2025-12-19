import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState('')
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    const handleCallback = async () => {
      console.log('[AuthCallback] Starting...')
      console.log('[AuthCallback] URL:', window.location.href)

      // CRITICAL: Redirect www to non-www IMMEDIATELY
      if (window.location.hostname === 'www.blogyydev.xyz') {
        const newUrl = window.location.href.replace('www.blogyydev.xyz', 'blogyydev.xyz')
        console.log('[AuthCallback] Redirecting www to non-www:', newUrl)
        window.location.replace(newUrl)
        return
      }

      // Check for OAuth error in URL
      const params = new URLSearchParams(window.location.search)
      const error = params.get('error')
      const errorDesc = params.get('error_description')

      if (error) {
        console.error('[AuthCallback] OAuth error:', error, errorDesc)
        setErrorMessage(errorDesc || error)
        setStatus('error')
        return
      }

      // IMPORTANT: We do NOT manually exchange the code!
      // Supabase's detectSessionInUrl: true auto-handles the PKCE exchange
      // We just need to wait for the session to appear
      console.log('[AuthCallback] Waiting for Supabase to process session (detectSessionInUrl: true)...')

      // Poll for session (Supabase auto-exchanges the code)
      let attempts = 0
      const maxAttempts = 20 // 10 seconds max

      const checkSession = async (): Promise<void> => {
        attempts++
        console.log(`[AuthCallback] Checking for session (attempt ${attempts})...`)

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError)
        }

        if (session) {
          console.log('[AuthCallback] Session found:', session.user?.email)
          await handleSuccess(session)
          return
        }

        if (attempts < maxAttempts) {
          // Wait 500ms and try again
          await new Promise(resolve => setTimeout(resolve, 500))
          return checkSession()
        }

        // Max attempts reached
        console.error('[AuthCallback] No session after max attempts')
        setErrorMessage('Anmeldung fehlgeschlagen. Bitte versuche es erneut.')
        setStatus('error')
      }

      // Also listen for auth state changes as backup
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[AuthCallback] Auth state change:', event)

        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe()
          await handleSuccess(session)
        }
      })

      // Start polling
      await checkSession()

      // Cleanup subscription after timeout
      setTimeout(() => {
        subscription.unsubscribe()
      }, 12000)
    }

    const handleSuccess = async (session: { user: { id: string; email?: string | null } } | null) => {
      if (!session?.user) {
        navigate('/', { replace: true })
        return
      }

      setStatus('success')
      console.log('[AuthCallback] Processing user:', session.user.email)

      // Check user profile for user_type
      const { data: profile } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .maybeSingle()

      const userType = profile?.user_type
      const needsOnboarding = !userType || userType === '' || userType === 'community'

      console.log('[AuthCallback] user_type:', userType, '| needsOnboarding:', needsOnboarding)

      // Clear code from URL
      window.history.replaceState({}, '', '/auth/callback')

      setTimeout(() => {
        if (needsOnboarding) {
          console.log('[AuthCallback] → Redirecting to onboarding')
          navigate('/?onboarding=true', { replace: true })
        } else {
          console.log('[AuthCallback] → Redirecting to dashboard')
          navigate('/dashboard', { replace: true })
        }
      }, 300)
    }

    handleCallback()
  }, [navigate])

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
          <button
            onClick={() => navigate('/', { replace: true })}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#610AD1] to-[#FB7A43] text-white font-medium rounded-lg hover:opacity-90 transition-colors"
          >
            Zur Startseite
          </button>
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
          {status === 'success' ? 'Erfolgreich angemeldet!' : 'Anmeldung...'}
        </h1>
        <p className="text-gray-400">
          {status === 'success' ? 'Du wirst weitergeleitet...' : 'Bitte warte einen Moment...'}
        </p>
      </div>
    </div>
  )
}
