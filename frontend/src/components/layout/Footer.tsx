import { Link } from 'react-router-dom'

export function Footer() {
  const footerLinks = [
    { label: 'IMPRESSUM', href: '/impressum' },
    { label: 'KONTAKT', href: '/kontakt' },
    { label: 'DATENSCHUTZ', href: '/datenschutz' },
  ]

  return (
    <footer className="relative bg-bg-primary">
      {/* Purple curved wave at top - matching d8 designer */}
      <div className="relative h-24 md:h-32 overflow-hidden">
        <svg
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full h-auto"
          preserveAspectRatio="none"
        >
          {/* Organic wave shape matching designer */}
          <path
            d="M0 200H1440V100C1440 100 1350 60 1200 80C1050 100 950 140 800 130C650 120 550 80 400 90C250 100 150 140 0 120V200Z"
            fill="#610AD1"
          />
        </svg>
      </div>

      {/* Purple background section */}
      <div style={{ backgroundColor: '#610AD1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-10">
          {/* Navigation Links - Centered with separators */}
          <nav className="flex items-center justify-center gap-8 sm:gap-12">
            {footerLinks.map((link, index) => (
              <span key={link.href} className="flex items-center">
                <Link
                  to={link.href}
                  className="text-white hover:text-white/80 text-xs sm:text-sm font-medium tracking-widest uppercase transition-colors"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {link.label}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className="text-white/40 ml-8 sm:ml-12">|</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
