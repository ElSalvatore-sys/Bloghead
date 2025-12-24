import { motion } from 'framer-motion'

// Placeholder data for artists/service providers
const mockBookings = [
  {
    id: '1',
    clientName: 'Max Mustermann',
    clientImage: null,
    eventType: 'Hochzeit',
    eventDate: '2024-08-15',
    location: 'Frankfurt',
    price: 1500,
    status: 'confirmed',
    createdAt: '2024-06-01',
  },
  {
    id: '2',
    clientName: 'Lisa Schmidt',
    clientImage: null,
    eventType: 'Geburtstagsparty',
    eventDate: '2024-07-20',
    location: 'Wiesbaden',
    price: 800,
    status: 'pending',
    createdAt: '2024-06-10',
  },
  {
    id: '3',
    clientName: 'Thomas Weber',
    clientImage: null,
    eventType: 'Firmenfeier',
    eventDate: '2024-06-10',
    location: 'Mainz',
    price: 2000,
    status: 'completed',
    createdAt: '2024-05-01',
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

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Ausstehend', className: 'bg-yellow-500/20 text-yellow-400' },
  confirmed: { label: 'Bestätigt', className: 'bg-green-500/20 text-green-400' },
  completed: { label: 'Abgeschlossen', className: 'bg-white/10 text-text-muted' },
  cancelled: { label: 'Storniert', className: 'bg-accent-red/20 text-accent-red' },
}

export function BookingsPage() {
  const pendingBookings = mockBookings.filter(b => b.status === 'pending')
  const confirmedBookings = mockBookings.filter(b => b.status === 'confirmed')
  const completedBookings = mockBookings.filter(b => b.status === 'completed')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Meine Buchungen</h1>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-bg-card border border-white/10 rounded-lg text-white text-sm">
            <option value="all">Alle Status</option>
            <option value="pending">Ausstehend</option>
            <option value="confirmed">Bestätigt</option>
            <option value="completed">Abgeschlossen</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-card rounded-xl border border-white/10 p-4"
        >
          <p className="text-text-muted text-sm">Ausstehend</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingBookings.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-bg-card rounded-xl border border-white/10 p-4"
        >
          <p className="text-text-muted text-sm">Bestätigt</p>
          <p className="text-2xl font-bold text-green-400">{confirmedBookings.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-card rounded-xl border border-white/10 p-4"
        >
          <p className="text-text-muted text-sm">Abgeschlossen</p>
          <p className="text-2xl font-bold text-white">{completedBookings.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-bg-card rounded-xl border border-white/10 p-4"
        >
          <p className="text-text-muted text-sm">Gesamt Einnahmen</p>
          <p className="text-2xl font-bold text-accent-purple">
            {mockBookings.reduce((sum, b) => sum + b.price, 0).toLocaleString('de-DE')} €
          </p>
        </motion.div>
      </div>

      {/* Bookings List */}
      {mockBookings.length === 0 ? (
        <div className="bg-bg-card rounded-xl border border-white/10 p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Keine Buchungen</h2>
          <p className="text-text-muted">
            Du hast noch keine Buchungen erhalten.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockBookings.map((booking, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              key={booking.id}
              className="bg-bg-card rounded-xl border border-white/10 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {/* Client Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center text-white font-bold">
                    {booking.clientName.charAt(0)}
                  </div>

                  {/* Booking Info */}
                  <div>
                    <h3 className="text-white font-semibold mb-1">{booking.clientName}</h3>
                    <p className="text-accent-purple font-medium mb-2">{booking.eventType}</p>
                    <div className="flex items-center gap-4 text-text-muted text-sm">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(booking.eventDate).toLocaleDateString('de-DE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        {booking.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusConfig[booking.status].className}`}>
                    {statusConfig[booking.status].label}
                  </span>
                  <p className="text-white text-xl font-bold mt-2">{booking.price.toLocaleString('de-DE')} €</p>
                </div>
              </div>

              {/* Actions */}
              {booking.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                  <button className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors">
                    Annehmen
                  </button>
                  <button className="px-4 py-2 border border-accent-red text-accent-red text-sm font-medium rounded-lg hover:bg-accent-red/10 transition-colors">
                    Ablehnen
                  </button>
                  <button className="px-4 py-2 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors ml-auto">
                    Details
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
