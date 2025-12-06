import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Verarbeite Anmeldung...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL hash (OAuth callback)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setStatus('Fehler bei der Anmeldung')
          setTimeout(() => navigate('/'), 2000)
          return
        }

        if (session?.user) {
          // Check if user has completed onboarding (has user_type)
          const userType = session.user.user_metadata?.user_type
          const onboardingCompleted = session.user.user_metadata?.onboarding_completed

          if (!userType && !onboardingCompleted) {
            // New OAuth user - needs onboarding
            setStatus('Willkommen! Leite weiter...')
            // Redirect to home with onboarding flag
            navigate('/?onboarding=true', { replace: true })
          } else {
            // Existing user - redirect to profile
            setStatus('Erfolgreich angemeldet!')
            navigate('/profile/edit', { replace: true })
          }
        } else {
          // No session, redirect to home
          navigate('/', { replace: true })
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('Ein Fehler ist aufgetreten')
        setTimeout(() => navigate('/'), 2000)
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        handleAuthCallback()
      }
    })

    // Also try immediately in case the session is already set
    handleAuthCallback()

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  )
}
