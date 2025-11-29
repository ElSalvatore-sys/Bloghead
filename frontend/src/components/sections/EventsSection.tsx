import { Link } from 'react-router-dom'

interface Event {
  id: string
  title: string
  date: string
  location: string
  image?: string
}

// Placeholder events data
const events: Event[] = [
  {
    id: '1',
    title: 'Summer Festival 2025',
    date: '15. Juli 2025',
    location: 'Berlin',
  },
  {
    id: '2',
    title: 'Club Night Special',
    date: '22. Juli 2025',
    location: 'Hamburg',
  },
  {
    id: '3',
    title: 'Open Air Concert',
    date: '5. August 2025',
    location: 'München',
  },
]

export function EventsSection() {
  return (
    <section className="bg-bg-primary py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
          EVENTS
        </h2>
        <div className="w-24 h-1 brush-stroke rounded-full mb-12" />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-12">
          {/* Left: Featured Event Image */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-accent-purple/30 via-bg-card to-accent-blue/30 rounded-lg overflow-hidden">
              {/* Placeholder for event image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-20 h-20 text-white/20 mx-auto mb-4" viewBox="0 0 80 80" fill="currentColor">
                    <rect x="10" y="15" width="60" height="50" rx="4" opacity="0.3" />
                    <circle cx="40" cy="40" r="15" opacity="0.5" />
                    <path d="M35 35l15 10-15 10z" opacity="0.7" />
                  </svg>
                  <p className="text-white/40 text-sm uppercase tracking-wider">Featured Event</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <h3 className="text-white text-2xl md:text-3xl font-bold uppercase tracking-wide mb-4">
              Ready to inspire you.
            </h3>
            <p className="text-text-secondary text-base leading-relaxed mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius
              enim in eros elementum tristique. Duis cursus, mi quis viverra ornare,
              eros dolor interdum nulla.
            </p>

            {/* Event List */}
            <div className="space-y-4">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block p-4 bg-bg-card rounded-lg border border-white/5 hover:border-accent-purple/30 hover:bg-bg-card-hover transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold mb-1 group-hover:text-accent-purple transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-text-muted text-sm">
                        {event.date} · {event.location}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-text-muted group-hover:text-accent-purple group-hover:translate-x-1 transition-all"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Text about events */}
        <div className="text-center max-w-3xl mx-auto pt-8 border-t border-white/5">
          <h3 className="text-white text-lg md:text-xl font-bold uppercase tracking-wide mb-4">
            Hier steht etwas zum Thema Events.
          </h3>
          <p className="text-text-secondary text-base leading-relaxed">
            Entdecke die besten Events in deiner Nähe und buche deine Lieblingskünstler
            für unvergessliche Erlebnisse.
          </p>
        </div>
      </div>
    </section>
  )
}
