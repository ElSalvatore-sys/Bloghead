import { Button } from '../ui/Button'

interface FeaturesSectionProps {
  onRegisterClick?: () => void
}

export function FeaturesSection({ onRegisterClick }: FeaturesSectionProps) {
  return (
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-12">
          {/* Left: Text Content */}
          <div>
            <h2
              className="text-white text-xl md:text-2xl font-bold uppercase leading-tight mb-6"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Every Business Is Essential<br />
              To Have A Professional USP
            </h2>
            <p
              className="text-white/50 text-sm md:text-base leading-relaxed"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Our platform is able to manage your USP, Kalender, bookings and most important
              help you in your bookkeeping administration. Find out what benefits we have for you.
            </p>
          </div>

          {/* Right: 3 Icons Row */}
          <div className="grid grid-cols-3 gap-6 md:gap-8">
            {/* Icon 1: Calendar */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 mb-3 text-white">
                <CalendarIcon />
              </div>
              <span
                className="text-white text-xs uppercase tracking-wide leading-tight"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Essential<br />
                Calendar<br />
                Management
              </span>
            </div>

            {/* Icon 2: Bookkeeping */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 mb-3 text-white">
                <BookkeepingIcon />
              </div>
              <span
                className="text-white text-xs uppercase tracking-wide leading-tight"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Bookkeeping<br />
                And<br />
                Paymentplan
              </span>
            </div>

            {/* Icon 3: USP */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 mb-3 text-white">
                <PersonIcon />
              </div>
              <span
                className="text-white text-xs uppercase tracking-wide leading-tight"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Getting<br />
                Your USP
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button - Centered */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onRegisterClick}
            className="border-accent-purple text-accent-purple hover:bg-accent-purple/10 px-10 py-3 tracking-wider uppercase rounded-full text-sm font-bold"
          >
            Jetzt Registrieren
          </Button>
        </div>
      </div>
    </section>
  )
}

// Calendar Icon
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
      <path d="M22 34l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Bookkeeping Icon (document with plus)
function BookkeepingIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <rect x="8" y="4" width="32" height="40" rx="4" />
      <path d="M16 14h16M16 22h16M16 30h10" strokeLinecap="round" />
      <circle cx="36" cy="36" r="8" fill="currentColor" stroke="none" />
      <path d="M36 32v8M32 36h8" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Person Icon
function PersonIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="24" cy="14" r="8" />
      <path d="M8 44c0-8.837 7.163-16 16-16s16 7.163 16 16" />
    </svg>
  )
}
