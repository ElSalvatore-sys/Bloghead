import { useEffect, useState } from 'react'
import { StatsCard } from '../../components/admin'
import { getDashboardStats, type DashboardStats } from '../../services/adminService'

// Icons
const UsersIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const ArtistIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
)

const BookingIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const RevenueIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const NewUsersIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
)

const TicketIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
)

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    const { data, error } = await getDashboardStats()
    if (error) {
      setError('Fehler beim Laden der Statistiken')
    } else {
      setStats(data)
    }
    setLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[#262626] rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="bg-red-600/20 border border-red-600 rounded-xl p-6 text-red-400">
          {error}
          <button onClick={loadStats} className="ml-4 underline">
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button
          onClick={loadStats}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Aktualisieren
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Benutzer gesamt"
          value={stats?.totalUsers || 0}
          icon={<UsersIcon />}
          color="purple"
        />
        <StatsCard
          title="Kuenstler"
          value={stats?.totalArtists || 0}
          icon={<ArtistIcon />}
          color="orange"
        />
        <StatsCard
          title="Buchungen"
          value={stats?.totalBookings || 0}
          icon={<BookingIcon />}
          color="blue"
        />
        <StatsCard
          title="Gesamtumsatz"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={<RevenueIcon />}
          color="green"
        />
        <StatsCard
          title="Neue Benutzer heute"
          value={stats?.newUsersToday || 0}
          icon={<NewUsersIcon />}
          color="purple"
        />
        <StatsCard
          title="Offene Tickets"
          value={stats?.activeTickets || 0}
          icon={<TicketIcon />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#262626] rounded-xl p-6 border border-gray-800">
          <h2 className="text-white font-medium mb-4">Schnellzugriff</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/admin/users"
              className="p-4 bg-[#1a1a1a] rounded-lg hover:bg-gray-800 transition-colors"
            >
              <UsersIcon />
              <span className="text-white mt-2 block">Benutzerverwaltung</span>
            </a>
            <a
              href="/admin/reports"
              className="p-4 bg-[#1a1a1a] rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-white mt-2 block">Meldungen</span>
            </a>
            <a
              href="/admin/announcements"
              className="p-4 bg-[#1a1a1a] rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span className="text-white mt-2 block">Ankuendigungen</span>
            </a>
            <a
              href="/admin/tickets"
              className="p-4 bg-[#1a1a1a] rounded-lg hover:bg-gray-800 transition-colors"
            >
              <TicketIcon />
              <span className="text-white mt-2 block">Support-Tickets</span>
            </a>
          </div>
        </div>

        <div className="bg-[#262626] rounded-xl p-6 border border-gray-800">
          <h2 className="text-white font-medium mb-4">Systemstatus</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Datenbankverbindung</span>
              <span className="flex items-center gap-2 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Authentifizierung</span>
              <span className="flex items-center gap-2 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Aktiv
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Speicher</span>
              <span className="flex items-center gap-2 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Verfuegbar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
