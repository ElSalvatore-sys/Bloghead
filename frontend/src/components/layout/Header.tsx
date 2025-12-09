import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { HeartIcon, UserIcon, InstagramIcon, FacebookIcon, MenuIcon, CloseIcon } from '../icons'
import { LoginModal, RegisterModal } from '../auth'
import { NotificationBell } from '../notifications'
import { useAuth } from '../../contexts/AuthContext'
import { getFullNavigationForRole, type UserRole } from '../../config/navigationConfig'

// Types
interface NavDropdownItem {
  label: string
  href: string
}

interface NavItem {
  label: string
  href: string
  dropdown?: NavDropdownItem[]
}

interface UserMenuItem {
  label: string
  href: string
  icon?: React.ReactNode
}

// Navigation configuration
const navItems: NavItem[] = [
  {
    label: 'ABOUT',
    href: '/about',
    dropdown: [
      { label: 'Wer wir sind', href: '/about/who-we-are' },
      { label: 'Unsere Vorteile', href: '/about/benefits' },
      { label: 'Bloghead Coins', href: '/about/coins' },
    ],
  },
  {
    label: 'ARTISTS',
    href: '/artists',
  },
  {
    label: 'SERVICES',
    href: '/services',
  },
  {
    label: 'EVENTS',
    href: '/events',
    dropdown: [
      { label: 'Veranstaltungen', href: '/events' },
      { label: 'VR Events', href: '/events/vr' },
    ],
  },
]

// User menu items are now role-based - see navigationConfig.ts
// This function converts role nav items to user menu items format
function getRoleBasedUserMenuItems(userRole: UserRole | undefined): UserMenuItem[] {
  const navItems = getFullNavigationForRole(userRole)
  return navItems.map(item => ({
    label: item.label,
    href: item.path,
  }))
}

// Chevron Down Icon
function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 4.5L6 8L9.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Dropdown Component
function NavDropdown({
  items,
  isOpen,
  onClose,
}: {
  items: NavDropdownItem[]
  isOpen: boolean
  onClose: () => void
}) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 min-w-[200px] bg-bg-card border border-white/10 rounded-lg shadow-lg py-2 z-50"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="block px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          onClick={onClose}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}

// User Dropdown Component
function UserDropdown({
  isOpen,
  onClose,
  onLogout,
  userRole,
}: {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  userRole: UserRole | undefined
}) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuItems = getRoleBasedUserMenuItems(userRole)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 min-w-[200px] bg-bg-card border border-white/10 rounded-lg shadow-lg py-2 z-50"
    >
      {menuItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="block px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          onClick={onClose}
        >
          {item.label}
        </Link>
      ))}
      <div className="border-t border-white/10 mt-2 pt-2">
        <button
          onClick={() => {
            onLogout()
            onClose()
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-accent-red hover:bg-white/5 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

// Mobile Menu Component
function MobileMenu({
  isOpen,
  onClose,
  isLoggedIn,
  onSignInClick,
  onRegisterClick,
  onLogout,
  userRole,
}: {
  isOpen: boolean
  onClose: () => void
  isLoggedIn: boolean
  onSignInClick: () => void
  onRegisterClick: () => void
  onLogout: () => void
  userRole: UserRole | undefined
}) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const userMenuItems = getRoleBasedUserMenuItems(userRole)

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Link to="/" className="font-display text-2xl text-text-primary" onClick={onClose}>
          BLOGHEAD
        </Link>
        <button
          onClick={onClose}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close menu"
        >
          <CloseIcon size={24} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col p-4 overflow-y-auto h-[calc(100vh-80px)]">
        {navItems.map((item) => (
          <div key={item.href} className="border-b border-white/5">
            {item.dropdown ? (
              <>
                <button
                  onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                  className="flex items-center justify-between w-full py-4 text-lg font-medium text-text-primary"
                >
                  {item.label}
                  <ChevronDownIcon
                    className={`transition-transform ${expandedItem === item.label ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedItem === item.label && (
                  <div className="pl-4 pb-4 space-y-3">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.href}
                        to={subItem.href}
                        className="block py-2 text-text-secondary hover:text-text-primary transition-colors"
                        onClick={onClose}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.href}
                className="block py-4 text-lg font-medium text-text-primary"
                onClick={onClose}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}

        {/* Favorites Link */}
        <Link
          to="/favorites"
          className="flex items-center gap-3 py-4 text-lg font-medium text-text-primary border-b border-white/5"
          onClick={onClose}
        >
          <HeartIcon size={20} />
          Favoriten
        </Link>

        {/* User Menu Items (if logged in) */}
        {isLoggedIn && (
          <div className="border-b border-white/5">
            <button
              onClick={() => setExpandedItem(expandedItem === 'user' ? null : 'user')}
              className="flex items-center justify-between w-full py-4 text-lg font-medium text-text-primary"
            >
              <span className="flex items-center gap-3">
                <UserIcon size={20} />
                Mein Konto
              </span>
              <ChevronDownIcon
                className={`transition-transform ${expandedItem === 'user' ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedItem === 'user' && (
              <div className="pl-4 pb-4 space-y-3">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block py-2 text-text-secondary hover:text-text-primary transition-colors"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    onLogout()
                    onClose()
                  }}
                  className="block py-2 text-accent-red hover:opacity-80 transition-opacity"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Auth Buttons (if not logged in) */}
        {!isLoggedIn && (
          <div className="pt-6 space-y-3">
            <button
              onClick={() => {
                onRegisterClick()
                onClose()
              }}
              className="w-full py-3 px-6 border border-white/30 text-white font-bold text-sm tracking-wider uppercase rounded-full hover:bg-white/10 transition-all"
            >
              REGISTRIEREN
            </button>
            <button
              onClick={() => {
                onSignInClick()
                onClose()
              }}
              className="w-full py-3 px-6 bg-gradient-to-r from-accent-red to-accent-salmon text-white font-bold text-sm tracking-wider uppercase rounded-full hover:opacity-90 transition-opacity"
            >
              SIGN IN
            </button>
          </div>
        )}

        {/* Social Links */}
        <div className="flex items-center justify-center gap-6 pt-8 mt-auto">
          <a
            href="https://instagram.com/bloghead"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Instagram"
          >
            <InstagramIcon size={28} />
          </a>
          <a
            href="https://facebook.com/bloghead"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Facebook"
          >
            <FacebookIcon size={28} />
          </a>
        </div>
      </nav>
    </div>
  )
}

// Main Header Component
export function Header() {
  const { user, userProfile, signOut } = useAuth()
  const isLoggedIn = !!user
  const userRole = userProfile?.user_type as UserRole | undefined

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Handle ?login=true URL parameter (from protected route redirect)
  useEffect(() => {
    if (searchParams.get('login') === 'true' && !isLoggedIn) {
      setShowLoginModal(true)
      // Clean up URL
      searchParams.delete('login')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, isLoggedIn])

  // Handle scroll for sticky header effect
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignInClick = () => {
    setShowLoginModal(true)
  }

  const handleLogout = async () => {
    setUserDropdownOpen(false)
    await signOut()
  }

  // Check if a nav link is active (from footer-layout-router branch)
  const isActiveLink = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'bg-bg-primary/95 backdrop-blur-md border-b border-white/10 shadow-lg'
            : 'bg-bg-primary border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="font-display text-2xl lg:text-3xl text-text-primary hover:opacity-80 transition-opacity"
            >
              BLOGHEAD
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <div key={item.href} className="relative">
                  {item.dropdown ? (
                    <>
                      <button
                        onClick={() =>
                          setActiveDropdown(activeDropdown === item.label ? null : item.label)
                        }
                        className={`flex items-center gap-1.5 text-sm font-medium tracking-wider transition-colors ${
                          activeDropdown === item.label || isActiveLink(item.href)
                            ? 'text-text-primary'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {item.label}
                        <ChevronDownIcon
                          className={`transition-transform ${
                            activeDropdown === item.label ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <NavDropdown
                        items={item.dropdown}
                        isOpen={activeDropdown === item.label}
                        onClose={() => setActiveDropdown(null)}
                      />
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      className={`text-sm font-medium tracking-wider transition-colors ${
                        isActiveLink(item.href)
                          ? 'text-text-primary'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Favorites */}
              <Link
                to="/favorites"
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Favorites"
              >
                <HeartIcon size={22} />
              </Link>

              {/* Notifications (only when logged in) */}
              {isLoggedIn && <NotificationBell />}

              {/* User Icon / Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      setUserDropdownOpen(!userDropdownOpen)
                    } else {
                      handleSignInClick()
                    }
                  }}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label={isLoggedIn ? 'User menu' : 'Sign in'}
                >
                  <UserIcon size={22} />
                </button>
                {isLoggedIn && (
                  <UserDropdown
                    isOpen={userDropdownOpen}
                    onClose={() => setUserDropdownOpen(false)}
                    onLogout={handleLogout}
                    userRole={userRole}
                  />
                )}
              </div>

              {/* Auth Buttons */}
              {!isLoggedIn && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="py-2 px-5 border border-white/30 text-white font-bold text-xs tracking-wider uppercase rounded-full hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    REGISTRIEREN
                  </button>
                  <button
                    onClick={handleSignInClick}
                    className="relative py-2 px-5 bg-gradient-to-r from-accent-red to-accent-salmon text-white font-bold text-xs tracking-wider uppercase rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    SIGN IN
                    {/* Decorative brush stroke */}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-accent-purple via-accent-red to-accent-salmon rounded-full opacity-60" />
                  </button>
                </div>
              )}

              {/* Social Icons */}
              <div className="flex items-center gap-2 ml-2 pl-4 border-l border-white/10">
                <a
                  href="https://instagram.com/bloghead"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={20} />
                </a>
                <a
                  href="https://facebook.com/bloghead"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={20} />
                </a>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        onSignInClick={handleSignInClick}
        onRegisterClick={() => setShowRegisterModal(true)}
        onLogout={handleLogout}
        userRole={userRole}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onRegisterClick={() => {
          setShowLoginModal(false)
          setShowRegisterModal(true)
        }}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onLoginClick={() => {
          setShowRegisterModal(false)
          setShowLoginModal(true)
        }}
      />
    </>
  )
}
