import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Placeholder data
const mockEvents = [
  {
    id: '1',
    name: 'Summer Music Festival 2024',
    date: '2024-07-15',
    location: 'Frankfurt',
    image: '/images/alexander-popov-f3e6YNo3Y98-unsplash.webp',
    status: 'upcoming',
  },
  {
    id: '2',
    name: 'Club Night with DJ Thunder',
    date: '2024-06-20',
    location: 'Wiesbaden',
    image: '/images/flavio-gasperini-QO0hJHVUVso-unsplash.webp',
    status: 'attended',
  },
  {
    id: '3',
    name: 'Jazz Evening',
    date: '2024-05-10',
    location: 'Mainz',
    image: '/images/jazmin-quaynor-8ALMAJP0Ago-unsplash.webp',
    status: 'attended',
  },
]

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function MapPinIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function EventsAttendedPage() {
  const upcomingEvents = mockEvents.filter(e => e.status === 'upcoming')
  const pastEvents = mockEvents.filter(e => e.status === 'attended')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold text-white mb-8">Besuchte Events</h1>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Kommende Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                to={`/events/${event.id}`}
                className="flex gap-4 bg-bg-card rounded-xl border border-white/10 p-4 hover:border-accent-purple/50 transition-colors"
              >
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold mb-1">{event.name}</h3>
                      <div className="flex items-center gap-4 text-text-muted text-sm">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                      Angemeldet
                    </span>
                  </div>
                </div>
              </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Vergangene Events</h2>
        {pastEvents.length === 0 ? (
          <div className="bg-bg-card rounded-xl border border-white/10 p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Keine vergangenen Events</h3>
            <p className="text-text-muted mb-6">
              Du hast noch an keinem Event teilgenommen.
            </p>
            <Link
              to="/events"
              className="inline-block px-6 py-3 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors"
            >
              Events entdecken
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pastEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link
                to={`/events/${event.id}`}
                className="flex gap-4 bg-bg-card rounded-xl border border-white/10 p-4 hover:border-accent-purple/50 transition-colors"
              >
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0 opacity-75"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold mb-1">{event.name}</h3>
                      <div className="flex items-center gap-4 text-text-muted text-sm">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white/10 text-text-muted text-xs font-medium rounded-full">
                      Besucht
                    </span>
                  </div>
                </div>
              </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
