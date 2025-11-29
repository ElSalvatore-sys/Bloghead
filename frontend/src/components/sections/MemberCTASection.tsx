import { Button } from '../ui/Button'

interface MemberCTASectionProps {
  className?: string
  onMemberClick?: () => void
}

export function MemberCTASection({ className = '', onMemberClick }: MemberCTASectionProps) {
  return (
    <section
      className={`relative w-full py-20 md:py-28 lg:py-32 overflow-hidden ${className}`}
    >
      {/* Gradient Background with 60% opacity */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(97, 10, 209, 0.6) 0%, rgba(249, 43, 2, 0.6) 50%, rgba(251, 122, 67, 0.6) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mb-8 leading-tight">
          BE A MEMBER. BE A FAN.
        </h2>

        <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Du willst mehr? Werde Member und genieße exklusive Vorteile,
          Vergünstigungen und vieles mehr!
        </p>

        <Button
          variant="outline"
          size="lg"
          onClick={onMemberClick}
          className="border-2 border-white text-white hover:bg-white hover:text-bg-primary px-10 py-4 text-base font-bold uppercase tracking-wider"
        >
          MEMBER WERDEN
        </Button>
      </div>
    </section>
  )
}
