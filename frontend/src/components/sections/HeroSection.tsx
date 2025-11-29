import { Link } from 'react-router-dom'

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-bg-primary">
      {/* Background Image with Grayscale Effect */}
      <div className="absolute inset-0">
        {/* Placeholder background - replace with actual hero image */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-card via-bg-primary/80 to-bg-primary">
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-accent-red/10 rounded-full blur-3xl" />
        </div>
        {/* Gradient overlay from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Tagline */}
        <p className="text-text-secondary text-sm md:text-base uppercase tracking-[0.3em] mb-4">
          Be a member
        </p>

        {/* Main Title */}
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-white mb-8">
          BLOGHEAD
        </h1>

        {/* Subtitle */}
        <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Die Plattform für Künstler und Veranstalter.
          Buche deine Lieblingskünstler oder werde selbst gebucht.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/artists"
            className="px-8 py-3 bg-gradient-to-r from-accent-purple to-accent-red text-white font-bold text-sm uppercase tracking-wider rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
          >
            Künstler entdecken
          </Link>
          <Link
            to="/about"
            className="px-8 py-3 bg-transparent border-2 border-white/30 text-white font-bold text-sm uppercase tracking-wider rounded-full hover:border-white/50 hover:bg-white/5 transition-all duration-200"
          >
            Mehr erfahren
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
