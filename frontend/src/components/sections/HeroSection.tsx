import { useEffect, useState } from 'react'

interface HeroSectionProps {
  onMemberClick?: () => void
}

export function HeroSection({}: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-bg-primary">
      {/* Background Image - Grayscale */}
      <div className="absolute inset-0">
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
      </div>

      {/* Hero Content - Centered */}
      <div
        className={`
          relative z-10 flex flex-col items-center text-center px-4
          transition-all duration-1000 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* "BE A MEMBER OF" - small caps */}
        <p
          className="text-white text-xs md:text-sm uppercase mb-2 md:mb-4"
          style={{
            letterSpacing: '0.3em',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400
          }}
        >
          Be a member of
        </p>

        {/* "BlogHead" - Large display font */}
        <h1
          className="font-display text-white leading-none"
          style={{
            fontSize: 'clamp(80px, 15vw, 200px)',
            textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
          }}
        >
          BlogHead
        </h1>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`
          absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer
          transition-all duration-1000 delay-500
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <div className="flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors">
          <div className="animate-bounce">
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
          </div>
        </div>
      </div>
    </section>
  )
}
