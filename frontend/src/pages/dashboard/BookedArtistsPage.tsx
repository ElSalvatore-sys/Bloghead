import { Link } from 'react-router-dom'

// Booked artists page for event organizers - showing confirmed bookings
const mockBookedArtists = [
  {
    id: '1',
    artistName: 'Sarah Voice',
    artistId: '2',
    artistImage: '/images/jazmin-quaynor-8ALMAJP0Ago-unsplash.webp',
    category: 'Sängerin',
    eventName: 'Summer Music Festival 2024',
    eventDate: '2024-08-15',
    performanceTime: '20:00 - 21:30',
    price: 2000,
    status: 'confirmed',
    contactEmail: 'sarah@example.com',
    contactPhone: '+49 123 456789',
  },
  {
    id: '2',
    artistName: 'DJ Thunder',
    artistId: '1',
    artistImage: '/images/alexander-popov-f3e6YNo3Y98-unsplash.webp',
    category: 'DJ',
    eventName: 'Summer Music Festival 2024',
    eventDate: '2024-08-15',
    performanceTime: '22:00 - 02:00',
    price: 1500,
    status: 'confirmed',
    contactEmail: 'thunder@example.com',
    contactPhone: '+49 123 456788',
  },
  {
    id: '3',
    artistName: 'Jazz Trio',
    artistId: '4',
    artistImage: '/images/german-lopez-sP45Es070zI-unsplash.webp',
    category: 'Band',
    eventName: 'Club Night Special',
    eventDate: '2024-07-20',
    performanceTime: '19:00 - 21:00',
    price: 1800,
    status: 'completed',
    contactEmail: 'jazztrio@example.com',
    contactPhone: '+49 123 456787',
  },
]

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

function ClockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function MailIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function PhoneIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Bestätigt', className: 'bg-green-500/20 text-green-400' },
  completed: { label: 'Abgeschlossen', className: 'bg-white/10 text-text-muted' },
}

export function BookedArtistsPage() {
  const upcomingBookings = mockBookedArtists.filter(a => a.status === 'confirmed')
  const pastBookings = mockBookedArtists.filter(a => a.status === 'completed')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Gebuchte Künstler</h1>
        <Link
          to="/artists"
          className="px-4 py-2 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors"
        >
          Weitere buchen
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-card rounded-xl border border-white/10 p-4">
          <p className="text-text-muted text-sm">Aktive Buchungen</p>
          <p className="text-2xl font-bold text-green-400">{upcomingBookings.length}</p>
        </div>
        <div className="bg-bg-card rounded-xl border border-white/10 p-4">
          <p className="text-text-muted text-sm">Abgeschlossen</p>
          <p className="text-2xl font-bold text-white">{pastBookings.length}</p>
        </div>
        <div className="bg-bg-card rounded-xl border border-white/10 p-4">
          <p className="text-text-muted text-sm">Gesamtkosten</p>
          <p className="text-2xl font-bold text-accent-purple">
            {mockBookedArtists.reduce((sum, a) => sum + a.price, 0).toLocaleString('de-DE')} €
          </p>
        </div>
      </div>

      {/* Booked Artists List */}
      {mockBookedArtists.length === 0 ? (
        <div className="bg-bg-card rounded-xl border border-white/10 p-12 text-center">
          <UsersIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Keine gebuchten Künstler</h2>
          <p className="text-text-muted mb-6">
            Du hast noch keine Künstler für deine Events gebucht.
          </p>
          <Link
            to="/artists"
            className="inline-block px-6 py-3 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors"
          >
            Künstler entdecken
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Kommende Auftritte</h2>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-bg-card rounded-xl border border-white/10 p-6"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Artist Info */}
                      <div className="flex gap-4 flex-1">
                        <Link to={`/artists/${booking.artistId}`}>
                          <img
                            src={booking.artistImage}
                            alt={booking.artistName}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        </Link>
                        <div>
                          <Link
                            to={`/artists/${booking.artistId}`}
                            className="text-white font-semibold text-lg hover:text-accent-purple transition-colors"
                          >
                            {booking.artistName}
                          </Link>
                          <p className="text-accent-purple">{booking.category}</p>
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-2 ${statusConfig[booking.status].className}`}>
                            {statusConfig[booking.status].label}
                          </span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 space-y-2 text-sm">
                        <p className="text-white font-medium">{booking.eventName}</p>
                        <p className="flex items-center gap-2 text-text-muted">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(booking.eventDate).toLocaleDateString('de-DE', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="flex items-center gap-2 text-text-muted">
                          <ClockIcon className="w-4 h-4" />
                          {booking.performanceTime}
                        </p>
                      </div>

                      {/* Contact & Price */}
                      <div className="text-right space-y-2">
                        <p className="text-white text-xl font-bold">{booking.price.toLocaleString('de-DE')} €</p>
                        <div className="flex flex-col items-end gap-1">
                          <a
                            href={`mailto:${booking.contactEmail}`}
                            className="flex items-center gap-1 text-text-muted text-xs hover:text-accent-purple transition-colors"
                          >
                            <MailIcon className="w-3 h-3" />
                            {booking.contactEmail}
                          </a>
                          <a
                            href={`tel:${booking.contactPhone}`}
                            className="flex items-center gap-1 text-text-muted text-xs hover:text-accent-purple transition-colors"
                          >
                            <PhoneIcon className="w-3 h-3" />
                            {booking.contactPhone}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                      <button className="px-4 py-2 bg-white/5 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                        Nachricht senden
                      </button>
                      <button className="px-4 py-2 bg-white/5 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                        Details anzeigen
                      </button>
                      <button className="px-4 py-2 border border-accent-red text-accent-red text-sm font-medium rounded-lg hover:bg-accent-red/10 transition-colors ml-auto">
                        Stornieren
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Vergangene Buchungen</h2>
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-bg-card rounded-xl border border-white/10 p-4 flex gap-4 opacity-75"
                  >
                    <img
                      src={booking.artistImage}
                      alt={booking.artistName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-semibold">{booking.artistName}</p>
                          <p className="text-text-muted text-sm">{booking.eventName}</p>
                          <p className="text-text-muted text-xs">
                            {new Date(booking.eventDate).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{booking.price.toLocaleString('de-DE')} €</p>
                          <button className="text-accent-purple text-sm hover:underline">
                            Bewerten
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
