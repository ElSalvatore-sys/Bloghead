import { useState } from 'react'
import { Button } from '../ui/Button'
import { AuthModal } from '../ui/Modal'

interface HeaderProps {
  onNavigate?: (page: string) => void
  currentPage?: string
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'ABOUT', href: 'about' },
    { label: 'ARTISTS', href: 'artists' },
    { label: 'EVENTS', href: 'events' },
  ]

  const handleAuthClick = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a
              href="/"
              className="font-display text-2xl text-text-primary hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.preventDefault()
                onNavigate?.('home')
              }}
            >
              BlogHead
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={`#${link.href}`}
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate?.(link.href)
                  }}
                  className={`
                    text-sm font-medium tracking-wide transition-colors
                    ${currentPage === link.href
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right Side - Social & Auth */}
            <div className="hidden md:flex items-center gap-4">
              {/* Social Icons */}
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="18" cy="6" r="1.5" fill="currentColor" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 8h-2a3 3 0 0 0-3 3v2h-2v3h2v5h3v-5h2l1-3h-3v-2a1 1 0 0 1 1-1h2V8z" />
                  </svg>
                </a>
              </div>

              {/* Profile Icon */}
              <button className="text-text-secondary hover:text-text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Sign In Button */}
              <Button size="sm" onClick={handleAuthClick}>
                SIGN IN
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-text-secondary hover:text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={`#${link.href}`}
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate?.(link.href)
                    setMobileMenuOpen(false)
                  }}
                  className="block text-text-secondary hover:text-text-primary py-2"
                >
                  {link.label}
                </a>
              ))}
              <Button fullWidth onClick={handleAuthClick}>
                SIGN IN
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
    </>
  )
}
