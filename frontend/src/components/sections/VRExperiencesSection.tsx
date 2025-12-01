import { Link } from 'react-router-dom'

export function VRExperiencesSection() {
  return (
    <section className="bg-bg-primary py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-12 lg:mb-16">
          VR EXPERIENCES
        </h2>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Left: VR Image */}
          <div className="relative overflow-hidden rounded-lg aspect-[4/3] lg:aspect-auto lg:min-h-[400px]">
            <img
              src="/images/minh-pham-jSAb1ifwf8Y-unsplash.jpg"
              alt="Person wearing VR headset experiencing virtual concert"
              className="w-full h-full object-cover"
            />
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/50 to-transparent" />
          </div>

          {/* Right: Gradient Card */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-accent-purple via-accent-red to-accent-salmon p-8 md:p-10 lg:p-12 flex flex-col justify-between min-h-[400px]">
            {/* Content */}
            <div>
              <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide mb-6">
                Virtuelle Konzerte erleben
              </h3>
              <p className="text-white/90 text-base md:text-lg leading-relaxed mb-8">
                Tauche ein in die Welt der virtuellen Realität und erlebe Konzerte wie nie zuvor.
                Mit unserer VR-Technologie bist du mittendrin im Geschehen, egal wo du dich befindest.
                Interagiere mit anderen Fans und genieße Live-Performances aus der ersten Reihe.
              </p>
            </div>

            {/* CTA Button */}
            <div>
              <Link
                to="/events/vr"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-accent-purple font-bold text-sm uppercase tracking-wider rounded-full hover:bg-white/90 hover:-translate-y-0.5 transition-all duration-200"
              >
                Entdecken
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
