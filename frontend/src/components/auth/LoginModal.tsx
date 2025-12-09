import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { sanitizeInput, isValidEmail } from '../../lib/security/sanitize'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onRegisterClick: () => void
  onForgotPasswordClick?: () => void
}

export function LoginModal({
  isOpen,
  onClose,
  onRegisterClick,
  onForgotPasswordClick,
}: LoginModalProps) {
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setError(null)
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
      const timeout = setTimeout(() => {
        setIsVisible(false)
        setEmail('')
        setPassword('')
        setError(null)
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  // Handle Escape key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    },
    [isOpen, onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Sanitize and validate inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase()

    if (!isValidEmail(sanitizedEmail)) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signIn(sanitizedEmail, password)
      if (error) {
        // Map Supabase error messages to German
        if (error.message.includes('Invalid login credentials')) {
          setError('Ungültige Anmeldedaten. Bitte überprüfe deine E-Mail und dein Passwort.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Bitte bestätige zuerst deine E-Mail-Adresse.')
        } else {
          setError(error.message)
        }
      } else {
        onClose()
      }
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
      }
    } catch {
      setError('Google-Anmeldung fehlgeschlagen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const { error } = await signInWithFacebook()
      if (error) {
        setError(error.message)
      }
    } catch {
      setError('Facebook-Anmeldung fehlgeschlagen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isAnimating ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        className={`relative w-full max-w-[500px] rounded-[20px] bg-[#610AD1] p-10 transition-all duration-200 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white disabled:opacity-50"
          aria-label="Schließen"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Title */}
        <h2
          id="login-modal-title"
          className="mb-8 text-center font-sans text-[28px] font-bold uppercase tracking-wide text-white"
        >
          LETS WORK TOGETHER!
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-white">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="EMAIL"
            disabled={isLoading}
            className="w-full rounded-full border border-white/30 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/60 placeholder:uppercase placeholder:tracking-wider placeholder:text-xs focus:border-white focus:outline-none transition-colors disabled:opacity-50"
            autoComplete="email"
            required
          />

          {/* Password Input */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORT"
            disabled={isLoading}
            className="w-full rounded-full border border-white/30 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/60 placeholder:uppercase placeholder:tracking-wider placeholder:text-xs focus:border-white focus:outline-none transition-colors disabled:opacity-50"
            autoComplete="current-password"
            required
          />

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-[#F92B02] to-[#FB7A43] py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 active:opacity-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>WIRD GELADEN...</span>
              </>
            ) : (
              'LOGIN!'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/60 text-xs uppercase tracking-wider">oder</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Social Login Buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full rounded-full border border-white/30 bg-white py-3 text-sm font-medium text-gray-800 transition-all hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Mit Google anmelden
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={isLoading}
            className="w-full rounded-full bg-[#1877F2] py-3 text-sm font-medium text-white transition-all hover:bg-[#166FE5] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Mit Facebook anmelden
          </button>
        </div>

        {/* Links */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {onForgotPasswordClick && (
            <button
              type="button"
              onClick={onForgotPasswordClick}
              disabled={isLoading}
              className="text-sm text-white/70 transition-colors hover:text-white disabled:opacity-50"
            >
              Passwort vergessen?
            </button>
          )}
          <button
            type="button"
            onClick={onRegisterClick}
            disabled={isLoading}
            className="text-sm text-white/70 transition-colors hover:text-white disabled:opacity-50"
          >
            Noch kein Mitglied?{' '}
            <span className="font-bold text-white">Registrieren</span>
          </button>
        </div>
      </div>
    </div>
  )
}
