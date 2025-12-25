import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const footerLinks = [
    { label: 'IMPRESSUM', href: '/impressum' },
    { label: 'KONTAKT', href: '/kontakt' },
    { label: 'DATENSCHUTZ', href: '/datenschutz' },
  ]

  return (
    <footer ref={ref} className="relative bg-bg-primary">
      {/* Purple curved wave at top - matching d8 designer */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ willChange: 'transform, opacity' }}
        className="relative h-24 md:h-32 overflow-hidden"
      >
        <svg
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full h-auto"
          preserveAspectRatio="none"
        >
          {/* Organic wave shape matching designer */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            d="M0 200H1440V100C1440 100 1350 60 1200 80C1050 100 950 140 800 130C650 120 550 80 400 90C250 100 150 140 0 120V200Z"
            fill="#610AD1"
          />
        </svg>
      </motion.div>

      {/* Purple background section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ backgroundColor: '#610AD1', willChange: 'opacity' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-10">
          {/* Navigation Links - Centered with separators */}
          <nav className="flex items-center justify-center gap-2 sm:gap-4">
            {footerLinks.map((link, index) => (
              <motion.span
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                style={{ willChange: 'transform, opacity' }}
                className="flex items-center gap-2 sm:gap-4"
              >
                <Link
                  to={link.href}
                  className="hover:opacity-80 text-xs sm:text-sm font-medium tracking-widest uppercase transition-opacity"
                  style={{ fontFamily: 'Roboto, sans-serif', color: '#FFFFFF' }}
                >
                  {link.label}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
                )}
              </motion.span>
            ))}
          </nav>
        </div>
      </motion.div>
    </footer>
  )
}
