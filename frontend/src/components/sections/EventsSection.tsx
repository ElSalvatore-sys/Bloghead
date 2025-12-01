import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { GradientBrush } from '../ui/GradientBrush'

interface EventImage {
  src: string
  alt: string
  title?: string
  date?: string
  location?: string
}

interface EventsSectionProps {
  className?: string
  images?: EventImage[]
}

// Default event images
const defaultImages: EventImage[] = [
  {
    src: '/images/flavio-gasperini-QO0hJHVUVso-unsplash.jpg',
    alt: 'Concert crowd with purple lights',
    title: 'SUMMER BEATS FESTIVAL',
    date: '15. JULI 2025',
    location: 'Frankfurt am Main',
  },
  {
    src: '/images/german-lopez-sP45Es070zI-unsplash.jpg',
    alt: 'DJ performing live',
    title: 'CLUB NIGHT',
    date: '22. JULI 2025',
    location: 'Berlin',
  },
  {
    src: '/images/pexels-wendy-wei-1699161.jpg',
    alt: 'Concert audience',
    title: 'LIVE ACOUSTIC',
    date: '28. JULI 2025',
    location: 'Hamburg',
  },
]

export function EventsSection({
  className = '',
  images = defaultImages,
}: EventsSectionProps) {
  const featuredEvent = images[0]
  const sideEvents = images.slice(1, 3)

  return (
    <section className={`bg-bg-primary py-16 md:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white mb-4">
            EVENTS
          </h2>
          <GradientBrush className="w-32 md:w-40" size="md" />
        </div>

        {/* Image Grid - Featured Left, Stack Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {/* Featured Event - Large Left Image */}
          <Link
            to="/events"
            className="lg:col-span-2 relative group overflow-hidden aspect-[4/3] lg:aspect-auto lg:row-span-2"
          >
            <img
              src={featuredEvent.src}
              alt={featuredEvent.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Event Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              {/* Purple Accent Bar */}
              <div className="w-12 h-1 bg-accent-purple mb-4" />

              <h3 className="text-white font-bold text-xl md:text-2xl uppercase tracking-wide mb-2">
                {featuredEvent.title}
              </h3>
              <p className="text-white/80 text-sm uppercase tracking-wider">
                {featuredEvent.date} • {featuredEvent.location}
              </p>
            </div>
          </Link>

          {/* Side Events - Stacked Right */}
          {sideEvents.map((event, index) => (
            <Link
              key={index}
              to="/events"
              className="relative group overflow-hidden aspect-[4/3]"
            >
              <img
                src={event.src}
                alt={event.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Event Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                {/* Purple Accent Bar */}
                <div className="w-8 h-1 bg-accent-purple mb-3" />

                <h4 className="text-white font-bold text-base md:text-lg uppercase tracking-wide mb-1">
                  {event.title}
                </h4>
                <p className="text-white/80 text-xs uppercase tracking-wider">
                  {event.date} • {event.location}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Text Content Below Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left - Headline */}
          <div>
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-tight">
              READY TO<br />
              INSPIRE YOU.
            </h3>
          </div>

          {/* Right - Description and CTA */}
          <div>
            <p className="text-white/70 text-base leading-relaxed mb-6">
              Entdecke einzigartige Events und unvergessliche Momente mit unseren Künstlern.
              Von intimen Akustik-Sessions bis zu großen Bühnenauftritten – erlebe Live-Musik
              wie nie zuvor. Unsere Events bringen Menschen zusammen und schaffen bleibende
              Erinnerungen.
            </p>
            <Link to="/events">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-3 tracking-wider uppercase rounded-full"
              >
                Alle Events Ansehen
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
