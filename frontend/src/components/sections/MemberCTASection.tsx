interface MemberCTASectionProps {
  className?: string
  onMemberClick?: () => void
}

export function MemberCTASection({ className = '' }: MemberCTASectionProps) {
  return (
    <section
      className={`relative w-full py-20 md:py-28 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #610AD1 0%, #F92B02 50%, #FB7A43 100%)',
      }}
    >
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Main Title - Hyperwave Font italic - matching d5 */}
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-white mb-10 leading-tight italic">
          Be a Member. Be a Fan.
        </h2>

        {/* Question Lines - Each on its own line with more spacing */}
        <div
          className="text-white/90 text-sm md:text-base leading-relaxed space-y-2"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          <p>You are an artist searching for a location to perform?</p>
          <p>You are a location searching for an artist?</p>
          <p>You are a Eventmanager searching for an artist to perform at your event?</p>
          <p>Or you just love music as we do?</p>
        </div>
      </div>
    </section>
  )
}
