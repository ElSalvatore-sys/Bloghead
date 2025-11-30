import { useState, useEffect, useCallback } from 'react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (membername: string, password: string) => void
  onRegisterClick: () => void
  onForgotPasswordClick?: () => void
}

export function LoginModal({
  isOpen,
  onClose,
  onLogin,
  onRegisterClick,
  onForgotPasswordClick,
}: LoginModalProps) {
  const [membername, setMembername] = useState('')
  const [password, setPassword] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
      // Wait for animation to complete before hiding
      const timeout = setTimeout(() => {
        setIsVisible(false)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(membername, password)
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
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white"
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Membername Input */}
          <input
            type="text"
            value={membername}
            onChange={(e) => setMembername(e.target.value)}
            placeholder="MEMBERNAME"
            className="w-full rounded-full border border-white/30 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/60 placeholder:uppercase placeholder:tracking-wider placeholder:text-xs focus:border-white focus:outline-none transition-colors"
            autoComplete="username"
          />

          {/* Password Input */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORT"
            className="w-full rounded-full border border-white/30 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/60 placeholder:uppercase placeholder:tracking-wider placeholder:text-xs focus:border-white focus:outline-none transition-colors"
            autoComplete="current-password"
          />

          {/* Login Button */}
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-gradient-to-r from-[#F92B02] to-[#FB7A43] py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 active:opacity-100"
          >
            LOGIN!
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {onForgotPasswordClick && (
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Passwort vergessen?
            </button>
          )}
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-sm text-white/70 transition-colors hover:text-white"
          >
            Noch kein Mitglied?{' '}
            <span className="font-bold text-white">Registrieren</span>
          </button>
        </div>
      </div>
    </div>
  )
}
