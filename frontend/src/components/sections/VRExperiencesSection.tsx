import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export function VRExperiencesSection() {
  return (
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Title */}
        <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-8">
          VR Experiences
        </h2>

        {/* Two-column layout with orange bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          {/* Left: Orange bar + VR Image */}
          <div className="relative flex">
            {/* Orange Accent Bar */}
            <div
              className="w-4 md:w-5 flex-shrink-0"
              style={{ backgroundColor: '#FB7A43' }}
            />

            {/* VR Image */}
            <div className="flex-1 relative">
              <img
                src="/images/minh-pham-jSAb1ifwf8Y-unsplash.jpg"
                alt="Person wearing VR headset"
                className="w-full h-full object-cover min-h-[300px] md:min-h-[400px]"
              />
            </div>
          </div>

          {/* Right: Gradient Card */}
          <div
            className="p-8 md:p-10 lg:p-12 flex flex-col justify-center min-h-[300px] md:min-h-[400px]"
            style={{
              background: 'linear-gradient(135deg, #610AD1 0%, #F92B02 50%, #FB7A43 100%)',
            }}
          >
            {/* Title */}
            <h3
              className="text-white text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-wide mb-6"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Hier Steht<br />
              Noch Blindtext
            </h3>

            {/* Description */}
            <p
              className="text-white/80 text-sm md:text-base leading-relaxed mb-8"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Tauche ein in die Welt der virtuellen Realität und erlebe Konzerte wie nie zuvor.
              Mit unserer VR-Technologie bist du mittendrin im Geschehen, egal wo du dich befindest.
              Interagiere mit anderen Fans und genieße Live-Performances aus der ersten Reihe.
            </p>

            {/* CTA Button */}
            <div>
              <Link to="/events/vr">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-3 tracking-wider uppercase rounded-full text-sm font-bold"
                >
                  Find Out More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
