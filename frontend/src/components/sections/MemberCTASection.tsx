import { Link } from 'react-router-dom'

export function MemberCTASection() {
  return (
    <section className="bg-bg-primary py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Heading */}
          <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide mb-6">
            Be a member. Be a fan.
          </h2>

          {/* Description */}
          <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-8">
            You will see something new. It is clearly not significant.
            You are a choreographer searching for an artist to perform at your event?
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register?type=artist"
              className="px-8 py-3 bg-gradient-to-r from-accent-purple to-accent-red text-white font-bold text-sm uppercase tracking-wider rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
            >
              Make artist
            </Link>
            <Link
              to="/register?type=organizer"
              className="px-8 py-3 bg-transparent border-2 border-white/30 text-white font-bold text-sm uppercase tracking-wider rounded-full hover:border-white/50 hover:bg-white/5 transition-all duration-200"
            >
              Make Veranstalter
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
