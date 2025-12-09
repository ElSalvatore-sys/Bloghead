import { Link } from 'react-router-dom'

// Booking requests page for event organizers - showing requests they've sent to artists
const mockRequests = [
  {
    id: '1',
    artistName: 'DJ Thunder',
    artistId: '1',
    artistImage: '/images/alexander-popov-f3e6YNo3Y98-unsplash.webp',
    eventName: 'Summer Music Festival 2024',
    eventDate: '2024-08-15',
    price: 1500,
    status: 'pending',
    sentAt: '2024-06-01',
  },
  {
    id: '2',
    artistName: 'Sarah Voice',
    artistId: '2',
    artistImage: '/images/jazmin-quaynor-8ALMAJP0Ago-unsplash.webp',
    eventName: 'Summer Music Festival 2024',
    eventDate: '2024-08-15',
    price: 2000,
    status: 'accepted',
    sentAt: '2024-06-01',
  },
  {
    id: '3',
    artistName: 'The Groove Band',
    artistId: '3',
    artistImage: '/images/luis-reynoso-J5a0MRXVnUI-unsplash.webp',
    eventName: 'Club Night Special',
    eventDate: '2024-07-20',
    price: 2500,
    status: 'declined',
    sentAt: '2024-05-20',
  },
]

function InboxIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
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

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Ausstehend', className: 'bg-yellow-500/20 text-yellow-400' },
  accepted: { label: 'Angenommen', className: 'bg-green-500/20 text-green-400' },
  declined: { label: 'Abgelehnt', className: 'bg-accent-red/20 text-accent-red' },
  cancelled: { label: 'Storniert', className: 'bg-white/10 text-text-muted' },
}

export function BookingRequestsPage() {
  const pendingRequests = mockRequests.filter(r => r.status === 'pending')
  const acceptedRequests = mockRequests.filter(r => r.status === 'accepted')
  const declinedRequests = mockRequests.filter(r => r.status === 'declined')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Buchungsanfragen</h1>
        <Link
          to="/artists"
          className="px-4 py-2 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors"
        >
          Künstler finden
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card rounded-xl border border-white/10 p-4">
          <p className="text-text-muted text-sm">Gesamt</p>
          <p className="text-2xl font-bold text-white">{mockRequests.length}</p>
        </div>
        <div className="bg-bg-card rounded-xl border border-white/10 p-4">
          <p className="text-text-muted text-sm">Ausstehend</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingRequests.length}</p>
        </div>
        <div className="bg-bg-card rounded-xl border border-white/10 p-4">
          <p className="text-text-muted text-sm">Angenommen</p>
          <p className="text-2xl font-bold text-green-400">{acceptedRequests.length}</p>
        </div>
        <div className="bg-bg-card rounded-xl border border-white/10 p-4">
          <p className="text-text-muted text-sm">Abgelehnt</p>
          <p className="text-2xl font-bold text-accent-red">{declinedRequests.length}</p>
        </div>
      </div>

      {/* Requests List */}
      {mockRequests.length === 0 ? (
        <div className="bg-bg-card rounded-xl border border-white/10 p-12 text-center">
          <InboxIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Keine Anfragen</h2>
          <p className="text-text-muted mb-6">
            Du hast noch keine Buchungsanfragen gesendet.
          </p>
          <Link
            to="/artists"
            className="inline-block px-6 py-3 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors"
          >
            Künstler entdecken
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Ausstehende Anfragen</h2>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-bg-card rounded-xl border border-yellow-500/30 p-6"
                  >
                    <div className="flex items-start gap-4">
                      <Link to={`/artists/${request.artistId}`}>
                        <img
                          src={request.artistImage}
                          alt={request.artistName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link
                              to={`/artists/${request.artistId}`}
                              className="text-white font-semibold hover:text-accent-purple transition-colors"
                            >
                              {request.artistName}
                            </Link>
                            <p className="text-accent-purple text-sm">{request.eventName}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusConfig[request.status].className}`}>
                            {statusConfig[request.status].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-text-muted text-sm">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {new Date(request.eventDate).toLocaleDateString('de-DE')}
                          </span>
                          <span>Gesendet: {new Date(request.sentAt).toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-xl font-bold">{request.price.toLocaleString('de-DE')} €</p>
                        <button className="text-accent-red text-sm hover:underline mt-2">
                          Stornieren
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Requests */}
          {(acceptedRequests.length > 0 || declinedRequests.length > 0) && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Bearbeitete Anfragen</h2>
              <div className="space-y-4">
                {[...acceptedRequests, ...declinedRequests].map((request) => (
                  <div
                    key={request.id}
                    className="bg-bg-card rounded-xl border border-white/10 p-6"
                  >
                    <div className="flex items-start gap-4">
                      <Link to={`/artists/${request.artistId}`}>
                        <img
                          src={request.artistImage}
                          alt={request.artistName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link
                              to={`/artists/${request.artistId}`}
                              className="text-white font-semibold hover:text-accent-purple transition-colors"
                            >
                              {request.artistName}
                            </Link>
                            <p className="text-accent-purple text-sm">{request.eventName}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusConfig[request.status].className}`}>
                            {statusConfig[request.status].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-text-muted text-sm">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {new Date(request.eventDate).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-xl font-bold">{request.price.toLocaleString('de-DE')} €</p>
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
