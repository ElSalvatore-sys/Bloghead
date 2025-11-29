import { Button } from '../ui/Button'
import { GradientBrush } from '../ui/GradientBrush'

interface AboutSectionProps {
  image?: string
  onLearnMoreClick?: () => void
}

export function AboutSection({
  image = '/images/about-artist.jpg',
  onLearnMoreClick
}: AboutSectionProps) {
  return (
    <section className="relative bg-bg-primary py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Title */}
        <div className="mb-12 md:mb-16">
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-white">
            About
          </h2>
          <GradientBrush className="w-32 md:w-48 mt-4" size="md" />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Left: Image */}
          <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[500px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${image})`,
              }}
            />
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/20 to-transparent" />
          </div>

          {/* Right: Purple Card */}
          <div className="relative">
            <div
              className="h-full p-8 md:p-12 flex flex-col justify-center"
              style={{
                background: 'linear-gradient(135deg, #610AD1 0%, #4A08A1 100%)',
              }}
            >
              {/* Card Title */}
              <h3 className="text-text-secondary/80 text-sm tracking-widest uppercase mb-4">
                Our Goal Is
              </h3>
              <h4 className="font-bold text-2xl md:text-3xl lg:text-4xl text-white leading-tight mb-6">
                To Connect You<br />
                To Your Future
              </h4>

              {/* Description */}
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8">
                Wir sind die Plattform, die Talente mit Event-Organisatoren zusammenbringt.
                Ob DJ, Sänger, Band oder Musiker - bei uns findest du die perfekte Bühne
                für dein Talent oder den idealen Künstler für dein Event.
              </p>

              <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8">
                Bloghead macht Buchungen einfach, transparent und sicher. Verbinde dich
                mit einer Community aus kreativen Köpfen und Veranstaltern aus ganz Deutschland.
              </p>

              {/* CTA Button */}
              <div>
                <Button
                  variant="outline"
                  onClick={onLearnMoreClick}
                  className="border-white text-white hover:bg-white/10 px-8 py-3 tracking-wider uppercase rounded-full"
                >
                  Find Out More
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - Below Main Content */}
        <div className="mt-16 md:mt-24">
          <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide mb-8">
            Every Business Is Essential<br />
            To Have A Professional USP
          </h3>

          <p className="text-text-secondary max-w-2xl mb-12 leading-relaxed">
            Unsere Plattform bietet alles, was Künstler und Veranstalter brauchen:
            Professionelle Profile, sichere Buchungen, integrierte Kommunikation und
            transparente Bewertungen.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <FeatureItem
              icon={<ArtistIcon />}
              label="Artist"
              sublabel="Presentation"
            />
            <FeatureItem
              icon={<CalendarIcon />}
              label="Essential"
              sublabel="Calendar/Booking"
            />
            <FeatureItem
              icon={<BookingIcon />}
              label="Bookingpage"
              sublabel="Connect"
            />
            <FeatureItem
              icon={<MessageIcon />}
              label="Getting"
              sublabel="In Touch"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// Feature Item Component
interface FeatureItemProps {
  icon: React.ReactNode
  label: string
  sublabel: string
}

function FeatureItem({ icon, label, sublabel }: FeatureItemProps) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="w-12 h-12 md:w-16 md:h-16 mb-4 text-white/80">
        {icon}
      </div>
      <span className="text-white font-bold text-sm uppercase tracking-wide">
        {label}
      </span>
      <span className="text-text-muted text-xs uppercase tracking-wide">
        {sublabel}
      </span>
    </div>
  )
}

// Icon Components
function ArtistIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="24" cy="16" r="8" />
      <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" />
      <path d="M32 8l4-4M36 12l4 0" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <rect x="6" y="10" width="36" height="32" rx="4" />
      <path d="M6 20h36" />
      <path d="M16 6v8M32 6v8" strokeLinecap="round" />
      <circle cx="16" cy="28" r="2" fill="currentColor" />
      <circle cx="24" cy="28" r="2" fill="currentColor" />
      <circle cx="32" cy="28" r="2" fill="currentColor" />
      <circle cx="16" cy="36" r="2" fill="currentColor" />
      <circle cx="24" cy="36" r="2" fill="currentColor" />
    </svg>
  )
}

function BookingIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <rect x="8" y="8" width="32" height="32" rx="4" />
      <path d="M16 20h16M16 28h12" strokeLinecap="round" />
      <circle cx="36" cy="36" r="8" fill="currentColor" stroke="none" />
      <path d="M33 36h6M36 33v6" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path d="M8 12h32v24H20l-8 6v-6H8V12z" strokeLinejoin="round" />
      <path d="M16 22h16M16 28h10" strokeLinecap="round" />
    </svg>
  )
}
