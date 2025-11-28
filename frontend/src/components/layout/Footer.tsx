import { GradientBrush } from '../ui/GradientBrush'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { label: 'Impressum', href: '/impressum' },
    { label: 'Kontakt', href: '/kontakt' },
    { label: 'Datenschutz', href: '/datenschutz' },
  ]

  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://instagram.com',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="18" cy="6" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: 'https://facebook.com',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="10" />
          <path d="M15 8h-2a3 3 0 0 0-3 3v2h-2v3h2v5h3v-5h2l1-3h-3v-2a1 1 0 0 1 1-1h2V8z" />
        </svg>
      ),
    },
  ]

  return (
    <footer className="bg-bg-primary">
      {/* Gradient Divider */}
      <div className="max-w-4xl mx-auto px-4">
        <GradientBrush size="lg" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="text-center md:text-left">
            <span className="font-display text-2xl text-text-primary">BlogHead</span>
            <p className="text-text-muted text-sm mt-1">BE A MEMBER</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-8">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-text-muted text-sm">
            &copy; {currentYear} BlogHead. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  )
}
