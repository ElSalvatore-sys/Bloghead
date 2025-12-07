import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Euro, ExternalLink, Loader2 } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useBookings, useBookingStats } from '../../hooks/useBookings'

type BookingTab = 'upcoming' | 'past'

// Mock data fallback
const mockBookings = [
  {
    id: 'BH-2024-000001',
    event: 'Firmenfeier TechCorp',
    client: 'TechCorp GmbH',
    date: '2025-02-15',
    time: '19:00 - 23:00',
    location: 'Frankfurt am Main',
    guests: 150,
    amount: '2.500 EUR',
    status: 'confirmed',
    isPast: false
  },
  {
    id: 'BH-2024-000002',
    event: 'Hochzeit Meyer',
    client: 'Familie Meyer',
    date: '2025-06-20',
    time: '15:00 - 02:00',
    location: 'Rheingau',
    guests: 80,
    amount: '1.800 EUR',
    status: 'confirmed',
    isPast: false
  },
  {
    id: 'BH-2024-000003',
    event: 'Geburtstagsparty',
    client: 'Max Mustermann',
    date: '2024-11-10',
    time: '20:00 - 01:00',
    location: 'Wiesbaden',
    guests: 50,
    amount: '800 EUR',
    status: 'completed',
    isPast: true
  }
]

export default function MyBookingsPage() {
  const [tab, setTab] = useState<BookingTab>('upcoming')
  const [useMockData, setUseMockData] = useState(false)

  const { bookings: realBookings, loading, error } = useBookings(tab)
  const { stats, loading: statsLoading } = useBookingStats()

  // Switch to mock data if no real data or error
  useEffect(() => {
    if (!loading && (error || realBookings.length === 0)) {
      setUseMockData(true)
    } else if (realBookings.length > 0) {
      setUseMockData(false)
    }
  }, [loading, error, realBookings])

  // Transform real bookings or use mock
  const displayBookings = useMockData
    ? mockBookings.filter(b => tab === 'upcoming' ? !b.isPast : b.isPast)
    : realBookings.map(b => ({
        id: b.booking_number,
        event: b.event_name,
        client: b.organizer?.full_name || 'Unbekannt',
        date: b.event_date,
        time: b.event_time,
        location: b.location,
        guests: b.expected_guests,
        amount: `${b.agreed_price?.toLocaleString('de-DE')} EUR`,
        status: b.status,
        isPast: new Date(b.event_date) < new Date()
      }))

  // Calculate stats from mock data if needed
  const displayStats = useMockData
    ? {
        upcoming: mockBookings.filter(b => !b.isPast).length,
        completed: mockBookings.filter(b => b.isPast).length,
        thisMonth: 0,
        totalRevenue: mockBookings.reduce((sum, b) => {
          const amount = parseFloat(b.amount.replace(/[^\d,]/g, '').replace(',', '.'))
          return sum + (isNaN(amount) ? 0 : amount)
        }, 0)
      }
    : stats

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display text-white">Meine Buchungen</h1>
        {useMockData && (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
            Demo-Daten
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-secondary rounded-xl border border-white/10 p-4">
          <p className="text-gray-500 text-sm mb-1">Anstehend</p>
          <p className="text-2xl font-bold text-white">
            {statsLoading && !useMockData ? '...' : displayStats.upcoming}
          </p>
        </div>
        <div className="bg-bg-secondary rounded-xl border border-white/10 p-4">
          <p className="text-gray-500 text-sm mb-1">Abgeschlossen</p>
          <p className="text-2xl font-bold text-white">
            {statsLoading && !useMockData ? '...' : displayStats.completed}
          </p>
        </div>
        <div className="bg-bg-secondary rounded-xl border border-white/10 p-4">
          <p className="text-gray-500 text-sm mb-1">Diesen Monat</p>
          <p className="text-2xl font-bold text-purple-400">
            {statsLoading && !useMockData ? '...' : displayStats.thisMonth}
          </p>
        </div>
        <div className="bg-bg-secondary rounded-xl border border-white/10 p-4">
          <p className="text-gray-500 text-sm mb-1">Gesamtumsatz</p>
          <p className="text-2xl font-bold text-green-400">
            {statsLoading && !useMockData ? '...' : `${displayStats.totalRevenue.toLocaleString('de-DE')} EUR`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-xl transition-all ${
            tab === 'upcoming'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Anstehend
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-4 py-2 rounded-xl transition-all ${
            tab === 'past'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Vergangen
        </button>
      </div>

      {/* Loading State */}
      {loading && !useMockData && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      )}

      {/* Bookings List */}
      {!loading && (
        <div className="space-y-4">
          {displayBookings.length === 0 ? (
            <div className="bg-bg-secondary rounded-2xl border border-white/10 p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl text-white mb-2">Keine Buchungen</h3>
              <p className="text-gray-500">
                {tab === 'upcoming'
                  ? 'Du hast keine anstehenden Buchungen.'
                  : 'Du hast noch keine abgeschlossenen Buchungen.'}
              </p>
            </div>
          ) : (
            displayBookings.map(booking => (
              <div
                key={booking.id}
                className="bg-bg-secondary rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-purple-400 text-sm font-mono mb-1">{booking.id}</p>
                    <h3 className="text-xl font-display text-white">{booking.event}</h3>
                    <p className="text-gray-400">{booking.client}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    booking.status === 'confirmed'
                      ? 'bg-green-500/20 text-green-400'
                      : booking.status === 'completed'
                      ? 'bg-gray-500/20 text-gray-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {booking.status === 'confirmed' ? 'Bestätigt' :
                     booking.status === 'completed' ? 'Abgeschlossen' : 'Storniert'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={18} />
                    <span>{new Date(booking.date).toLocaleDateString('de-DE')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>🕐</span>
                    <span>{booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={18} />
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users size={18} />
                    <span>{booking.guests} Gäste</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400 font-bold">
                    <Euro size={18} />
                    <span>{booking.amount}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all flex items-center gap-2">
                    <ExternalLink size={18} />
                    Details
                  </button>
                  {booking.status === 'completed' && (
                    <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl text-yellow-400 transition-all">
                      Bewertung abgeben
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
