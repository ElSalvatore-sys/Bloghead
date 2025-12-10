import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'

interface FeaturesSectionProps {
  onRegisterClick?: () => void
}

export function FeaturesSection({ onRegisterClick }: FeaturesSectionProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleClick = () => {
    if (user) {
      // User is logged in - go to events or dashboard
      navigate('/events')
    } else if (onRegisterClick) {
      // User not logged in - show register modal
      onRegisterClick()
    } else {
      // Fallback - go to registration page
      navigate('/registrieren')
    }
  }
  return (
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Two Column Layout - Text left, 5 icons right in 2 rows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-12">
          {/* Left: Text Content */}
          <div>
            <h2
              className="text-white text-lg md:text-xl font-bold uppercase leading-tight mb-6"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Every Business Is Essential<br />
              To Have A Professional USP
            </h2>
            <p
              className="text-white/50 text-sm leading-relaxed"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Our platform is able to manage your USP, Kalender, bookings and most important
              help you in your bookkeeping administration. Find out what benefits we have for you.
            </p>
          </div>

          {/* Right: 5 Icons in 2 rows (2 top, 3 bottom) */}
          <div className="flex flex-col gap-8">
            {/* Top Row - 2 icons */}
            <div className="grid grid-cols-2 gap-8 justify-items-center">
              {/* Icon 1: Sound Wave - Artist Presentation */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 mb-3 text-white">
                  <SoundWaveIcon />
                </div>
                <span
                  className="text-white text-[10px] uppercase tracking-wider leading-tight"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Artist<br />
                  Presentation
                </span>
              </div>

              {/* Icon 2: Network - Worldwide Community */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 mb-3 text-white">
                  <NetworkIcon />
                </div>
                <span
                  className="text-white text-[10px] uppercase tracking-wider leading-tight"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Worldwide<br />
                  Community
                </span>
              </div>
            </div>

            {/* Bottom Row - 3 icons */}
            <div className="grid grid-cols-3 gap-6">
              {/* Icon 3: Calendar */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 mb-3 text-white">
                  <CalendarIcon />
                </div>
                <span
                  className="text-white text-[10px] uppercase tracking-wider leading-tight"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Essential<br />
                  Calendar<br />
                  Management
                </span>
              </div>

              {/* Icon 4: Plus Circle - Bookkeeping */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 mb-3 text-white">
                  <PlusCircleIcon />
                </div>
                <span
                  className="text-white text-[10px] uppercase tracking-wider leading-tight"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Bookkeeping<br />
                  And<br />
                  Paymentplan
                </span>
              </div>

              {/* Icon 5: Person - USP */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 mb-3 text-white">
                  <PersonIcon />
                </div>
                <span
                  className="text-white text-[10px] uppercase tracking-wider leading-tight"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Getting<br />
                  Your USP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button - Centered */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleClick}
            className="border-accent-purple text-accent-purple hover:bg-accent-purple/10 px-10 py-3 tracking-wider uppercase rounded-full text-sm font-bold"
          >
            {user ? 'Events Entdecken' : 'Jetzt Registrieren'}
          </Button>
        </div>
      </div>
    </section>
  )
}

// Sound Wave Icon (vertical bars like audio waveform)
function SoundWaveIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-full h-full">
      <path d="M8 24v-4M8 24v4" />
      <path d="M14 24v-8M14 24v8" />
      <path d="M20 24v-12M20 24v12" />
      <path d="M26 24v-16M26 24v16" />
      <path d="M32 24v-12M32 24v12" />
      <path d="M38 24v-8M38 24v8" />
      <path d="M44 24v-4M44 24v4" />
    </svg>
  )
}

// Network Icon (connected nodes)
function NetworkIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="24" cy="12" r="4" />
      <circle cx="12" cy="24" r="4" />
      <circle cx="36" cy="24" r="4" />
      <circle cx="16" cy="36" r="4" />
      <circle cx="32" cy="36" r="4" />
      <path d="M24 16v0M20 14l-5 7M28 14l5 7M14 28l3 5M34 28l-3 5M20 36h8" />
    </svg>
  )
}

// Calendar Icon with checkmark
function CalendarIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <rect x="8" y="12" width="32" height="28" rx="3" />
      <path d="M8 20h32" />
      <path d="M16 8v8M32 8v8" strokeLinecap="round" />
      <path d="M18 30l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Plus Circle Icon
function PlusCircleIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="24" cy="24" r="16" />
      <path d="M24 16v16M16 24h16" strokeLinecap="round" />
    </svg>
  )
}

// Person Icon
function PersonIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="24" cy="14" r="6" />
      <path d="M12 40c0-6.627 5.373-12 12-12s12 5.373 12 12" />
    </svg>
  )
}
