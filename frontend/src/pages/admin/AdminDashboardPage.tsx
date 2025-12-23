/**
 * AdminDashboardPage - Phase 8.5
 * Enhanced admin dashboard with analytics, charts, and tables
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Music,
  Calendar,
  Euro,
  UserPlus,
  Ticket,
  TrendingUp,
  RefreshCw,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import {
  StatCard,
  DateRangePicker,
  ChartContainer,
  AnalyticsLineChart,
  AnalyticsPieChart,
} from '@/components/analytics'
import { getPeriodLabel } from '@/services/analyticsService'
import {
  getEnhancedDashboardStats,
  getTopArtists,
  getRecentBookings,
  getRecentUsers,
  getUserGrowthChart,
  getRevenueChart,
  getBookingsByStatus,
  getUsersByType,
  type EnhancedDashboardStats,
  type TopArtist,
  type RecentBooking,
  type RecentUser,
} from '@/services/adminService'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    disputed: 'bg-purple-500/20 text-purple-400',
  }
  return colors[status] || 'bg-gray-500/20 text-gray-400'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Ausstehend',
    confirmed: 'Bestätigt',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    disputed: 'Streitfall',
  }
  return labels[status] || status
}

const getUserTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    fan: 'Fan',
    artist: 'Künstler',
    service_provider: 'Dienstleister',
    event_organizer: 'Veranstalter',
  }
  return labels[type] || type
}

const getUserTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    fan: 'bg-accent-purple/20 text-accent-purple',
    artist: 'bg-pink-500/20 text-pink-400',
    service_provider: 'bg-yellow-500/20 text-yellow-400',
    event_organizer: 'bg-green-500/20 text-green-400',
  }
  return colors[type] || 'bg-gray-500/20 text-gray-400'
}

export function AdminDashboardPage() {
  // Exclude 'all' from admin dashboard - use a valid subset
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [stats, setStats] = useState<EnhancedDashboardStats | null>(null)
  const [topArtists, setTopArtists] = useState<TopArtist[]>([])
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [userGrowthData, setUserGrowthData] = useState<{ date: string; value: number }[]>([])
  const [revenueData, setRevenueData] = useState<{ date: string; value: number }[]>([])
  const [bookingStatusData, setBookingStatusData] = useState<{ name: string; value: number; color: string }[]>([])
  const [userTypeData, setUserTypeData] = useState<{ name: string; value: number; color: string }[]>([])

  const loadData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      // Load all data in parallel
      const [
        statsResult,
        topArtistsResult,
        recentBookingsResult,
        recentUsersResult,
        userGrowthResult,
        revenueResult,
        bookingStatusResult,
        userTypeResult,
      ] = await Promise.all([
        getEnhancedDashboardStats(period),
        getTopArtists(5),
        getRecentBookings(8),
        getRecentUsers(8),
        getUserGrowthChart(period),
        getRevenueChart(period),
        getBookingsByStatus(),
        getUsersByType(),
      ])

      if (statsResult.error) {
        setError(statsResult.error.message)
      } else {
        setStats(statsResult.data)
      }

      setTopArtists(topArtistsResult.data)
      setRecentBookings(recentBookingsResult.data)
      setRecentUsers(recentUsersResult.data)
      setUserGrowthData(userGrowthResult.data)
      setRevenueData(revenueResult.data)
      setBookingStatusData(bookingStatusResult.data)
      setUserTypeData(userTypeResult.data)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Fehler beim Laden der Dashboard-Daten')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [period])

  const handleRefresh = () => {
    loadData(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
            <p className="text-white/60">Dashboard wird geladen...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">{getPeriodLabel(period)}</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={period}
            onChange={(newPeriod) => {
              if (newPeriod !== 'all') {
                setPeriod(newPeriod)
              }
            }}
          />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          {error}
          <button onClick={handleRefresh} className="ml-4 underline">
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Neue Benutzer"
          value={stats?.totalUsers.value || 0}
          icon={<Users className="w-5 h-5" />}
          trend={{
            value: stats?.totalUsers.changePercent || 0,
            direction: stats?.totalUsers.trend || 'stable',
          }}
          variant="gradient"
        />
        <StatCard
          title="Neue Künstler"
          value={stats?.totalArtists.value || 0}
          icon={<Music className="w-5 h-5" />}
          trend={{
            value: stats?.totalArtists.changePercent || 0,
            direction: stats?.totalArtists.trend || 'stable',
          }}
        />
        <StatCard
          title="Buchungen"
          value={stats?.totalBookings.value || 0}
          icon={<Calendar className="w-5 h-5" />}
          trend={{
            value: stats?.totalBookings.changePercent || 0,
            direction: stats?.totalBookings.trend || 'stable',
          }}
        />
        <StatCard
          title="Umsatz"
          value={formatCurrency(stats?.totalRevenue.value || 0)}
          icon={<Euro className="w-5 h-5" />}
          trend={{
            value: stats?.totalRevenue.changePercent || 0,
            direction: stats?.totalRevenue.trend || 'stable',
          }}
        />
        <StatCard
          title="Heute registriert"
          value={stats?.newUsersToday || 0}
          icon={<UserPlus className="w-5 h-5" />}
        />
        <StatCard
          title="Offene Tickets"
          value={stats?.activeTickets || 0}
          icon={<Ticket className="w-5 h-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <ChartContainer
          title="Benutzer-Wachstum"
          subtitle={`${userGrowthData.reduce((sum, d) => sum + d.value, 0)} neue Benutzer`}
          isEmpty={userGrowthData.length === 0}
          emptyMessage="Keine Daten für diesen Zeitraum"
        >
          <AnalyticsLineChart
            data={userGrowthData}
            height={280}
            lines={[{ dataKey: 'value', name: 'Benutzer', color: '#7C3AED', showArea: true }]}
          />
        </ChartContainer>

        {/* Revenue Chart */}
        <ChartContainer
          title="Umsatz-Entwicklung"
          subtitle={`Gesamt: ${formatCurrency(revenueData.reduce((sum, d) => sum + d.value, 0))}`}
          isEmpty={revenueData.length === 0}
          emptyMessage="Keine Umsatzdaten für diesen Zeitraum"
        >
          <AnalyticsLineChart
            data={revenueData}
            formatYAxis="currency"
            height={280}
            lines={[{ dataKey: 'value', name: 'Umsatz', color: '#10B981', showArea: true }]}
          />
        </ChartContainer>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by Status */}
        <ChartContainer
          title="Buchungen nach Status"
          isEmpty={bookingStatusData.length === 0}
        >
          <AnalyticsPieChart
            data={bookingStatusData}
            height={260}
            innerRadius={50}
            outerRadius={80}
            centerValue={bookingStatusData.reduce((sum, d) => sum + d.value, 0).toString()}
            centerLabel="Gesamt"
          />
        </ChartContainer>

        {/* Users by Type */}
        <ChartContainer
          title="Benutzer nach Typ"
          isEmpty={userTypeData.length === 0}
        >
          <AnalyticsPieChart
            data={userTypeData}
            height={260}
            innerRadius={50}
            outerRadius={80}
            centerValue={userTypeData.reduce((sum, d) => sum + d.value, 0).toString()}
            centerLabel="Gesamt"
          />
        </ChartContainer>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Artists */}
        <div className="bg-bg-card border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-purple" />
              Top Künstler
            </h2>
            <Link to="/admin/users?filter=artist" className="text-accent-purple text-sm hover:underline">
              Alle anzeigen
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {topArtists.length === 0 ? (
              <div className="p-6 text-center text-white/40 text-sm">
                Keine Daten verfügbar
              </div>
            ) : (
              topArtists.map((artist, index) => (
                <div key={artist.id} className="p-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      {artist.profileImage ? (
                        <img src={artist.profileImage} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center text-white text-xs font-bold">
                          {artist.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{artist.name}</p>
                      <p className="text-white/40 text-xs">{artist.bookingsCount} Buchungen</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium">{formatCurrency(artist.revenue)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-bg-card border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-purple" />
              Letzte Buchungen
            </h2>
            <Link to="/admin/analytics" className="text-accent-purple text-sm hover:underline flex items-center gap-1">
              Mehr <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentBookings.length === 0 ? (
              <div className="p-6 text-center text-white/40 text-sm">
                Keine Buchungen vorhanden
              </div>
            ) : (
              recentBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="p-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-medium truncate max-w-[120px]">
                      {booking.artistName}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">{formatDate(booking.eventDate)}</span>
                    <span className="text-white/60">{formatCurrency(booking.totalPrice)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-bg-card border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-accent-purple" />
              Neue Benutzer
            </h2>
            <Link to="/admin/users" className="text-accent-purple text-sm hover:underline">
              Alle anzeigen
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center text-white/40 text-sm">
                Keine neuen Benutzer
              </div>
            ) : (
              recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="p-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.membername} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent-purple/50 to-accent-red/50 flex items-center justify-center text-white text-xs font-bold">
                          {user.membername.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{user.membername}</p>
                      <p className="text-white/40 text-xs truncate">{user.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getUserTypeColor(user.userType)}`}>
                        {getUserTypeLabel(user.userType)}
                      </span>
                      <span className="text-white/30 text-xs">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="p-4 bg-bg-card border border-white/10 rounded-xl hover:border-accent-purple/50 transition-colors group"
        >
          <Users className="w-6 h-6 text-accent-purple mb-2" />
          <p className="text-white font-medium group-hover:text-accent-purple transition-colors">Benutzerverwaltung</p>
          <p className="text-white/40 text-sm">Benutzer verwalten</p>
        </Link>
        <Link
          to="/admin/reports"
          className="p-4 bg-bg-card border border-white/10 rounded-xl hover:border-accent-purple/50 transition-colors group"
        >
          <svg className="w-6 h-6 text-accent-purple mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-white font-medium group-hover:text-accent-purple transition-colors">Meldungen</p>
          <p className="text-white/40 text-sm">Reports bearbeiten</p>
        </Link>
        <Link
          to="/admin/tickets"
          className="p-4 bg-bg-card border border-white/10 rounded-xl hover:border-accent-purple/50 transition-colors group"
        >
          <Ticket className="w-6 h-6 text-accent-purple mb-2" />
          <p className="text-white font-medium group-hover:text-accent-purple transition-colors">Support-Tickets</p>
          <p className="text-white/40 text-sm">Anfragen beantworten</p>
        </Link>
        <Link
          to="/admin/analytics"
          className="p-4 bg-bg-card border border-white/10 rounded-xl hover:border-accent-purple/50 transition-colors group"
        >
          <TrendingUp className="w-6 h-6 text-accent-purple mb-2" />
          <p className="text-white font-medium group-hover:text-accent-purple transition-colors">Detaillierte Statistiken</p>
          <p className="text-white/40 text-sm">Alle Analysen anzeigen</p>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboardPage
