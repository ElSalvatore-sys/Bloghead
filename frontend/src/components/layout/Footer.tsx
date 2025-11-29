import { Link } from 'react-router-dom'
import { InstagramIcon, FacebookIcon } from '../icons'

export function Footer() {
  const footerLinks = [
    { label: 'IMPRESSUM', href: '/impressum' },
    { label: 'KONTAKT', href: '/kontakt' },
    { label: 'DATENSCHUTZ', href: '/datenschutz' },
  ]

  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://instagram.com',
      icon: InstagramIcon,
    },
    {
      label: 'Facebook',
      href: 'https://facebook.com',
      icon: FacebookIcon,
    },
  ]

  return (
    <footer className="relative">
      {/* Purple curved wave at top */}
      <div className="relative">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
            fill="#610AD1"
          />
        </svg>
      </div>

      {/* Purple background section */}
      <div className="bg-[#610AD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
          {/* Navigation Links */}
          <nav className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
            {footerLinks.map((link, index) => (
              <span key={link.href} className="flex items-center">
                <Link
                  to={link.href}
                  className="text-white/80 hover:text-white text-xs sm:text-sm font-medium tracking-wider transition-colors"
                >
                  {link.label}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className="text-white/40 ml-4 sm:ml-8 hidden sm:inline">|</span>
                )}
              </span>
            ))}
          </nav>

          {/* Social Icons */}
          <div className="flex items-center justify-center gap-6 mb-6">
            {socialLinks.map((social) => {
              const IconComponent = social.icon
              return (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <IconComponent size={24} />
                </a>
              )
            })}
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-white/60 text-xs sm:text-sm">
              © 2025 Bloghead. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
