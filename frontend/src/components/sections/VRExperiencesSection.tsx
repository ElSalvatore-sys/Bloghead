import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { OptimizedImage } from '../ui/OptimizedImage'

export function VRExperiencesSection() {
  return (
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Title - Hyperwave italic */}
        <motion.h2
          className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-8 italic"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          VR Experiences
        </motion.h2>

        {/* Two-column layout with orange bar - matching d8 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          {/* Left: Orange bar + VR Image */}
          <motion.div
            className="relative flex min-h-[350px] md:min-h-[450px]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Orange Accent Bar - wider to match designer */}
            <div
              className="w-6 md:w-8 flex-shrink-0"
              style={{ backgroundColor: '#FB7A43' }}
            />

            {/* VR Image */}
            <div className="flex-1 relative">
              <OptimizedImage
                src="/images/minh-pham-jSAb1ifwf8Y-unsplash.webp"
                alt="Person wearing VR headset"
                className="w-full h-full"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </motion.div>

          {/* Right: Gradient Card - matching d8 gradient */}
          <motion.div
            className="p-8 md:p-10 lg:p-12 flex flex-col justify-center min-h-[350px] md:min-h-[450px]"
            style={{
              background: 'linear-gradient(135deg, #610AD1 0%, #F92B02 60%, #FB7A43 100%)',
            }}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Title - Roboto Bold uppercase */}
            <h3
              className="text-white text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-wide mb-6"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Hier Steht<br />
              Noch Blindtext
            </h3>

            {/* Description */}
            <p
              className="text-white/90 text-sm leading-relaxed mb-8"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
              Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur
              ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.
            </p>

            {/* CTA Button - white outline */}
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
          </motion.div>
        </div>
      </div>
    </section>
  )
}
