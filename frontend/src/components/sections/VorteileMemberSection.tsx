import { Button } from '../ui/Button'
import { GradientBrush } from '../ui/GradientBrush'

interface Benefit {
  title: string
  description?: string
}

interface VorteileMemberSectionProps {
  className?: string
  benefits?: Benefit[]
  onMemberClick?: () => void
}

const defaultBenefits: Benefit[] = [
  {
    title: 'Vorteil 1',
    description: 'Exklusive Rabatte auf alle Buchungen',
  },
  {
    title: 'Vorteil 2',
    description: 'Frühzeitiger Zugang zu neuen Künstlern',
  },
  {
    title: 'Vorteil 3',
    description: 'Kostenlose VIP-Upgrades bei Events',
  },
  {
    title: 'Vorteil 4',
    description: 'Persönlicher Support rund um die Uhr',
  },
]

export function VorteileMemberSection({
  className = '',
  benefits = defaultBenefits,
  onMemberClick,
}: VorteileMemberSectionProps) {
  return (
    <section className={`py-16 md:py-24 px-6 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            VORTEILE ALS MEMBER
          </h2>
          <GradientBrush size="md" className="max-w-[200px] mx-auto" />
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Benefits list */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-bg-card/50 hover:bg-bg-card transition-colors"
              >
                {/* Checkmark icon with gradient */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #610AD1 0%, #F92B02 100%)',
                  }}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-white font-bold text-lg uppercase tracking-wide">
                    {benefit.title}
                  </h3>
                  {benefit.description && (
                    <p className="text-white/70 mt-1">{benefit.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Column */}
          <div className="flex flex-col items-center justify-center text-center p-8 lg:p-12 rounded-2xl bg-bg-card">
            <p className="text-white/80 text-lg mb-8 max-w-sm">
              Werde jetzt Member und profitiere von allen Vorteilen.
              Die Anmeldung ist kostenlos!
            </p>

            <Button
              variant="primary"
              size="lg"
              onClick={onMemberClick}
              className="px-10 py-4 text-base font-bold uppercase tracking-wider"
            >
              MEMBER WERDEN
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
