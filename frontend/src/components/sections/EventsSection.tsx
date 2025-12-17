import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { OptimizedImage } from '../ui/OptimizedImage'

// Arrow icons
function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export function EventsSection() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleRegisterClick = () => {
    if (!user) {
      navigate('/registrieren')
    } else {
      navigate('/events')
    }
  }

  return (
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Title - Left aligned */}
        <motion.h2
          className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-8 italic"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          Events
        </motion.h2>

        {/* Image Grid Layout - matching designer d6/d7 */}
        <motion.div
          className="relative mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Navigation Arrows */}
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 -translate-x-1/2"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 translate-x-1/2"
            aria-label="Next"
          >
            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Grid: Text left, 3 columns of images */}
          <div className="grid grid-cols-12 gap-2 md:gap-3">
            {/* Left Column - Text + Bottom Image */}
            <div className="col-span-3 flex flex-col gap-2 md:gap-3">
              {/* Text Block */}
              <div className="flex-1 flex flex-col justify-end pb-4">
                <h3 className="font-display text-xl md:text-2xl lg:text-3xl text-white leading-tight mb-3 italic">
                  Ready To<br />
                  Inspire You.
                </h3>
                <p
                  className="text-white/50 text-xs leading-relaxed hidden md:block"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo.
                </p>
              </div>

              {/* Small Image Bottom Left */}
              <div className="aspect-[4/3] overflow-hidden">
                <OptimizedImage
                  src="/images/pexels-luis-quintero-2091383.webp"
                  alt="Event"
                  className="w-full h-full"
                  sizes="(max-width: 768px) 25vw, 200px"
                />
              </div>
            </div>

            {/* Second Column - 2 stacked images */}
            <div className="col-span-3 flex flex-col gap-2 md:gap-3">
              <div className="flex-1 overflow-hidden">
                <OptimizedImage
                  src="/images/alexander-popov-f3e6YNo3Y98-unsplash.webp"
                  alt="Concert crowd"
                  className="w-full h-full"
                  sizes="(max-width: 768px) 25vw, 300px"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <OptimizedImage
                  src="/images/flavio-gasperini-QO0hJHVUVso-unsplash.webp"
                  alt="Concert lights"
                  className="w-full h-full"
                  sizes="(max-width: 768px) 25vw, 300px"
                />
              </div>
            </div>

            {/* Center Large Image with Purple bar */}
            <div className="col-span-3 relative overflow-hidden">
              {/* Purple bar on top */}
              <div
                className="absolute top-0 left-0 right-0 h-2 md:h-3 z-10"
                style={{ backgroundColor: '#610AD1' }}
              />
              <OptimizedImage
                src="/images/luis-reynoso-J5a0MRXVnUI-unsplash.webp"
                alt="Main event"
                className="w-full h-full"
                sizes="(max-width: 768px) 25vw, 400px"
              />
            </div>

            {/* Right Column - 2 stacked images with purple bar on last */}
            <div className="col-span-3 flex flex-col gap-2 md:gap-3">
              <div className="flex-1 overflow-hidden">
                <OptimizedImage
                  src="/images/jazmin-quaynor-8ALMAJP0Ago-unsplash.webp"
                  alt="Artist performing"
                  className="w-full h-full"
                  sizes="(max-width: 768px) 25vw, 300px"
                />
              </div>
              <div className="flex-1 relative overflow-hidden">
                {/* Purple bar on right side */}
                <div
                  className="absolute top-0 bottom-0 right-0 w-2 md:w-3 z-10"
                  style={{ backgroundColor: '#610AD1' }}
                />
                <OptimizedImage
                  src="/images/german-lopez-sP45Es070zI-unsplash.webp"
                  alt="DJ set"
                  className="w-full h-full"
                  sizes="(max-width: 768px) 25vw, 300px"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section - Centered text and button */}
        <div className="text-center">
          <motion.h3
            className="font-display text-xl md:text-2xl lg:text-3xl text-white mb-4 italic"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Hier Steht Etwas Zum Thema Events.
          </motion.h3>
          <motion.p
            className="text-white/50 text-sm leading-relaxed max-w-3xl mx-auto mb-8"
            style={{ fontFamily: 'Roboto, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
            Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur
            ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              variant="outline"
              onClick={handleRegisterClick}
              className="border-accent-purple text-accent-purple hover:bg-accent-purple/10 px-10 py-3 tracking-wider uppercase rounded-full text-sm font-bold"
            >
              {user ? 'Events Entdecken' : 'Jetzt Registrieren'}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
