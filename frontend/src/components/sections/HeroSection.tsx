import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'

interface HeroSectionProps {
  backgroundImage?: string
  onMemberClick?: () => void
}

export function HeroSection({
  backgroundImage = '/images/hero-bg.jpg',
  onMemberClick
}: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true)
  }, [])

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-bg-primary">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {/* Grayscale background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat grayscale opacity-40"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/60 via-transparent to-bg-primary" />
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(97, 10, 209, 0.3) 0%, transparent 50%)'
          }}
        />
      </div>

      {/* Hero Content */}
      <div
        className={`
          relative z-10 flex flex-col items-center text-center px-4
          transition-all duration-1000 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* Tagline */}
        <p className="text-text-secondary text-sm md:text-base tracking-[0.3em] uppercase mb-4 md:mb-6">
          Be a member of Bloghead
        </p>

        {/* Main Logo Text */}
        <h1
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-white leading-none mb-8 md:mb-12"
          style={{
            textShadow: '0 0 60px rgba(97, 10, 209, 0.5), 0 0 120px rgba(249, 43, 2, 0.3)'
          }}
        >
          Bloghead
        </h1>

        {/* CTA Button */}
        <Button
          onClick={onMemberClick}
          className="px-8 py-3 md:px-12 md:py-4 text-sm md:text-base font-bold tracking-wider uppercase rounded-full"
          style={{
            background: 'linear-gradient(90deg, #610AD1 0%, #F92B02 50%, #FB7A43 100%)'
          }}
        >
          Member werden
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`
          absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer
          transition-all duration-1000 delay-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        onClick={handleScrollDown}
      >
        <div className="flex flex-col items-center gap-2 text-text-muted hover:text-white transition-colors">
          <span className="text-xs tracking-widest uppercase hidden md:block">Scroll</span>
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

      {/* Decorative side elements - optional accent lines */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-accent-purple/50 to-transparent hidden lg:block ml-8" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-accent-purple/50 to-transparent hidden lg:block mr-8" />
    </section>
  )
}
