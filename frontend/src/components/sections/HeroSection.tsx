import { motion } from 'framer-motion'

interface HeroSectionProps {
  onMemberClick?: () => void
}

export function HeroSection({}: HeroSectionProps) {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-bg-primary">
      {/* Background Image - Grayscale */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <img
          src="/images/alexandre-st-louis-IlfpKwRMln0-unsplash.webp"
          srcSet="
            /images/responsive/alexandre-st-louis-IlfpKwRMln0-unsplash-400w.webp 400w,
            /images/responsive/alexandre-st-louis-IlfpKwRMln0-unsplash-800w.webp 800w,
            /images/responsive/alexandre-st-louis-IlfpKwRMln0-unsplash-1200w.webp 1200w,
            /images/responsive/alexandre-st-louis-IlfpKwRMln0-unsplash-1600w.webp 1600w,
            /images/alexandre-st-louis-IlfpKwRMln0-unsplash.webp 1920w
          "
          sizes="100vw"
          alt="Artist performing"
          className="w-full h-full object-cover"
          style={{ filter: 'grayscale(100%)' }}
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        />
      </motion.div>

      {/* Hero Content - Centered */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
        {/* "BlogHead" - Large display font */}
        <motion.h1
          className="font-display text-white leading-none mb-4 md:mb-6"
          style={{
            fontSize: 'clamp(60px, 12vw, 160px)',
            textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          BlogHead
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-white text-lg md:text-2xl lg:text-3xl font-bold uppercase mb-4 md:mb-6"
          style={{
            letterSpacing: '0.1em',
            fontFamily: 'Roboto, sans-serif',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Backstage Control, Frontstage Connection
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="text-white/80 text-sm md:text-base lg:text-lg leading-relaxed max-w-3xl"
          style={{
            fontFamily: 'Roboto, sans-serif',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Von der ersten Anfrage bis zum letzten Applaus: Bloghead bringt Eventbuero, Dienstleisternetzwerk, Artists und Community auf eine gemeinsame Plattform.
        </motion.p>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <div className="flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
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
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
