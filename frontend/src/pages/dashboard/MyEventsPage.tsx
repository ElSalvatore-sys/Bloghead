// My Events page for event organizers
const mockEvents = [
  {
    id: '1',
    name: 'Summer Music Festival 2024',
    date: '2024-08-15',
    location: 'Frankfurt, Stadthalle',
    image: '/images/alexander-popov-f3e6YNo3Y98-unsplash.webp',
    status: 'upcoming',
    ticketsSold: 450,
    capacity: 500,
    revenue: 22500,
  },
  {
    id: '2',
    name: 'Club Night Special',
    date: '2024-07-20',
    location: 'Wiesbaden, Club One',
    image: '/images/flavio-gasperini-QO0hJHVUVso-unsplash.webp',
    status: 'upcoming',
    ticketsSold: 180,
    capacity: 200,
    revenue: 3600,
  },
  {
    id: '3',
    name: 'Jazz Evening',
    date: '2024-05-10',
    location: 'Mainz, Kulturzentrum',
    image: '/images/jazmin-quaynor-8ALMAJP0Ago-unsplash.webp',
    status: 'completed',
    ticketsSold: 120,
    capacity: 120,
    revenue: 4800,
  },
]

function CalendarPlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <line x1="10" y1="16" x2="14" y2="16" />
    </svg>
  )
}

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

function UsersIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Entwurf', className: 'bg-white/10 text-text-muted' },
  upcoming: { label: 'Kommend', className: 'bg-green-500/20 text-green-400' },
  ongoing: { label: 'Läuft', className: 'bg-accent-purple/20 text-accent-purple' },
  completed: { label: 'Abgeschlossen', className: 'bg-white/10 text-text-muted' },
  cancelled: { label: 'Abgesagt', className: 'bg-accent-red/20 text-accent-red' },
}

export function MyEventsPage() {
  const upcomingEvents = mockEvents.filter(e => e.status === 'upcoming')
  const pastEvents = mockEvents.filter(e => e.status === 'completed')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Meine Events</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors">
          <CalendarPlusIcon className="w-5 h-5" />
          Neues Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card rounded-xl border border-white/10 p-4">
          <p className="text-text-muted text-sm">Kommende Events</p>
          <p className="text-2xl font-bold text-green-400">{upcomingEvents.length}</p>
        </div>
        <div className="bg-bg-card rounded-xl border border-white/10 p-4">
          <p className="text-text-muted text-sm">Vergangene Events</p>
          <p className="text-2xl font-bold text-white">{pastEvents.length}</p>
        </div>
        <div className="bg-bg-card rounded-xl border border-white/10 p-4">
          <p className="text-text-muted text-sm">Tickets verkauft</p>
          <p className="text-2xl font-bold text-accent-salmon">
            {mockEvents.reduce((sum, e) => sum + e.ticketsSold, 0)}
          </p>
        </div>
        <div className="bg-bg-card rounded-xl border border-white/10 p-4">
          <p className="text-text-muted text-sm">Gesamtumsatz</p>
          <p className="text-2xl font-bold text-accent-purple">
            {mockEvents.reduce((sum, e) => sum + e.revenue, 0).toLocaleString('de-DE')} €
          </p>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Kommende Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-bg-card rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="aspect-[16/9] relative">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full ${statusConfig[event.status].className}`}>
                    {statusConfig[event.status].label}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2">{event.name}</h3>
                  <div className="space-y-1 text-text-muted text-sm mb-4">
                    <p className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4" />
                      {event.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4" />
                      {event.ticketsSold} / {event.capacity} Tickets
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-muted">Auslastung</span>
                      <span className="text-white">{Math.round((event.ticketsSold / event.capacity) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent-purple to-accent-red rounded-full"
                        style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-white/5 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                      Bearbeiten
                    </button>
                    <button className="flex-1 px-3 py-2 bg-accent-purple text-white text-sm font-medium rounded-lg hover:bg-accent-purple/90 transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Vergangene Events</h2>
        {pastEvents.length === 0 ? (
          <div className="bg-bg-card rounded-xl border border-white/10 p-8 text-center">
            <p className="text-text-muted">Keine vergangenen Events</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="bg-bg-card rounded-xl border border-white/10 p-4 flex gap-4"
              >
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-24 h-24 rounded-lg object-cover opacity-75"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold mb-1">{event.name}</h3>
                      <div className="flex items-center gap-4 text-text-muted text-sm">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString('de-DE')}
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="w-4 h-4" />
                          {event.ticketsSold} Besucher
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-accent-purple font-bold">{event.revenue.toLocaleString('de-DE')} €</p>
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig[event.status].className}`}>
                        {statusConfig[event.status].label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
