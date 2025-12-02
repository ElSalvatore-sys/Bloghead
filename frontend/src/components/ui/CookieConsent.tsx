import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const COOKIE_CONSENT_KEY = 'bloghead_cookie_consent'

type ConsentType = 'all' | 'necessary' | null

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Check if consent already given
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
        // Trigger animation after mount
        setTimeout(() => setIsAnimating(true), 50)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleConsent = (type: ConsentType) => {
    if (type) {
      localStorage.setItem(COOKIE_CONSENT_KEY, type)
    }
    setIsAnimating(false)
    // Wait for animation to finish before hiding
    setTimeout(() => setIsVisible(false), 300)
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div
        className="backdrop-blur-md border-t border-white/10"
        style={{ backgroundColor: 'rgba(23, 23, 23, 0.95)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Text */}
            <p
              className="text-white/80 text-sm text-center md:text-left"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Wir verwenden Cookies, um deine Erfahrung zu verbessern. Mehr erfahren in unserer{' '}
              <Link
                to="/datenschutz"
                className="text-accent-purple hover:underline"
              >
                Datenschutzerklärung
              </Link>
              .
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Necessary Only */}
              <button
                onClick={() => handleConsent('necessary')}
                className="px-6 py-2.5 rounded-full border border-white/30 text-white text-sm font-medium uppercase tracking-wider hover:bg-white/10 transition-colors whitespace-nowrap"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Nur Notwendige
              </button>

              {/* Accept All */}
              <button
                onClick={() => handleConsent('all')}
                className="px-6 py-2.5 rounded-full text-white text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{
                  background: 'linear-gradient(90deg, #610AD1 0%, #F92B02 100%)',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                Alle Akzeptieren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to check consent status
export function getCookieConsent(): ConsentType {
  return localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentType
}

// Helper function to check if all cookies are accepted
export function hasFullCookieConsent(): boolean {
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'all'
}
