import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({ isOpen, onClose, children, title, size = 'md' }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`
          relative w-full ${sizeStyles[size]} mx-4
          bg-gradient-to-b from-accent-purple/20 to-bg-card
          border border-white/10 rounded-2xl
          shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        {title && (
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className={title ? 'px-6 pb-6' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Pre-styled modal for authentication
interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register'
  onModeSwitch?: () => void
}

export function AuthModal({ isOpen, onClose, mode, onModeSwitch }: AuthModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-text-primary mb-2">
          {mode === 'login' ? 'LETS WORK TOGETHER!' : 'NEU BEI BLOGHEAD?'}
        </h2>
        {mode === 'register' && (
          <p className="text-text-secondary text-sm">
            Werde Teil der Bloghead-Community
          </p>
        )}
      </div>

      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple"
        />

        <button className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-red text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
          {mode === 'login' ? 'Login' : 'Weiter'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onModeSwitch}
          className="text-sm text-text-muted hover:text-accent-purple transition-colors"
        >
          {mode === 'login'
            ? 'Noch kein Account? Registrieren'
            : 'Bereits registriert? Anmelden'
          }
        </button>
      </div>
    </Modal>
  )
}
