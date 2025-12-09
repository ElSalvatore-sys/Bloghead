import { Button } from '../ui/Button'

export function AboutSection() {
  return (
    <section className="relative bg-bg-primary py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Title - Top Left */}
        <div className="mb-8 md:mb-12">
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-white italic">
            About
          </h2>
          {/* Gradient underline bar - matches designer exactly */}
          <div
            className="h-1 w-32 md:w-40 mt-2"
            style={{
              background: 'linear-gradient(90deg, #610AD1 0%, #F92B02 100%)'
            }}
          />
        </div>

        {/* Main Layout - Image with overlapping purple card */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Image (takes about 45% width) */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[3/4] lg:aspect-auto lg:h-[500px] relative overflow-hidden">
                <img
                  src="/images/miguel-davis-V6K83zGHkUE-unsplash.webp"
                  alt="Artist performing"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right: Purple Card (overlaps image on desktop) */}
            <div className="lg:col-span-7 lg:-ml-12 relative z-10">
              <div
                className="h-full p-8 md:p-10 lg:p-12 flex flex-col justify-center min-h-[400px]"
                style={{
                  backgroundColor: '#610AD1',
                }}
              >
                {/* "OUR GOAL IS" - small caps */}
                <p
                  className="text-white/70 text-xs uppercase mb-3"
                  style={{
                    letterSpacing: '0.2em',
                    fontFamily: 'Roboto, sans-serif',
                  }}
                >
                  Our Goal Is
                </p>

                {/* Main headline */}
                <h3
                  className="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  To Connect You<br />
                  To Your Future
                </h3>

                {/* Description paragraph */}
                <p
                  className="text-white/80 text-sm md:text-base leading-relaxed mb-6"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Wir sind die Plattform, die Talente mit Event-Organisatoren zusammenbringt.
                  Ob DJ, Sänger, Band oder Musiker – bei uns findest du die perfekte Bühne
                  für dein Talent oder den idealen Künstler für dein Event.
                </p>

                <p
                  className="text-white/70 text-sm leading-relaxed mb-8"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Bloghead macht Buchungen einfach, transparent und sicher.
                </p>

                {/* CTA Button - white outline, rounded */}
                <div>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 py-3 tracking-wider uppercase rounded-full text-sm font-bold"
                  >
                    Find Out More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
