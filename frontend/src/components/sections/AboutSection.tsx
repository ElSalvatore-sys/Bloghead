export function AboutSection() {
  return (
    <section className="bg-bg-primary py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-12 lg:mb-16">
          ABOUT
        </h2>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Image/Visual */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-accent-purple/20 via-bg-card to-accent-red/20 rounded-lg overflow-hidden">
              {/* Placeholder for about image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-accent-purple/30 rounded-full flex items-center justify-center">
                  <span className="text-white/60 text-4xl">B</span>
                </div>
              </div>
            </div>
            {/* Decorative gradient overlay on corner */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-accent-purple to-accent-red rounded-lg -z-10" />
          </div>

          {/* Right: Content */}
          <div>
            <h3 className="text-white text-2xl md:text-3xl font-bold uppercase tracking-wide mb-6">
              Our goal is to connect you to your future
            </h3>
            <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-6">
              Wir verbinden Künstler mit Veranstaltern und schaffen eine Plattform,
              die beide Seiten zusammenbringt. Unser Ziel ist es, den Buchungsprozess
              so einfach und transparent wie möglich zu gestalten.
            </p>
            <p className="text-text-secondary text-base md:text-lg leading-relaxed">
              Mit unserer innovativen Technologie und unserem engagierten Team
              unterstützen wir dich bei jedem Schritt auf deinem Weg zum Erfolg.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
