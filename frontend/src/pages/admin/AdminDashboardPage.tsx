/**
 * AdminDashboardPage - Phase 8.5 + Polished UI
 * Enhanced admin dashboard with analytics, charts, and tables
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  Music,
  Calendar,
  Euro,
  UserPlus,
  Ticket,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  LayoutDashboard,
  Flag,
} from 'lucide-react'
import {
  StatCard,
  DateRangePicker,
  ChartContainer,
  AnalyticsLineChart,
  AnalyticsPieChart,
} from '@/components/analytics'
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  PageSkeleton,
} from '@/components/admin/ui'
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
    return <PageSkeleton />
  }

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <AdminPageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description={getPeriodLabel(period)}
        actions={
          <div className="flex items-center gap-3">
            <DateRangePicker
              value={period}
              onChange={(newPeriod) => {
                if (newPeriod !== 'all') {
                  setPeriod(newPeriod)
                }
              }}
            />
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              icon={RefreshCw}
              loading={refreshing}
            >
              {!refreshing && 'Aktualisieren'}
            </AdminButton>
          </div>
        }
      />

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
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </motion.div>

      {/* Pie Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </motion.div>

      {/* Tables Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Artists */}
        <AdminCard className="overflow-hidden" hover={false}>
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
                        <img src={artist.profileImage} alt={artist.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
        </AdminCard>

        {/* Recent Bookings */}
        <AdminCard className="overflow-hidden" hover={false}>
          <div className="p-4 border-b border-gray-800/50 flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Letzte Buchungen
            </h2>
            <Link to="/admin/analytics" className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">
              Mehr <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-800/30">
            {recentBookings.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Keine Buchungen vorhanden
              </div>
            ) : (
              recentBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="p-3 hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-medium truncate max-w-[120px]">
                      {booking.artistName}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{formatDate(booking.eventDate)}</span>
                    <span className="text-gray-400">{formatCurrency(booking.totalPrice)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>

        {/* Recent Users */}
        <AdminCard className="overflow-hidden" hover={false}>
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
                        <img src={user.profileImage} alt={user.membername} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
        </AdminCard>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/admin/users">
          <AdminCard className="p-4 h-full">
            <Users className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white font-medium">Benutzerverwaltung</p>
            <p className="text-gray-500 text-sm">Benutzer verwalten</p>
          </AdminCard>
        </Link>
        <Link to="/admin/reports">
          <AdminCard className="p-4 h-full">
            <Flag className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white font-medium">Meldungen</p>
            <p className="text-gray-500 text-sm">Reports bearbeiten</p>
          </AdminCard>
        </Link>
        <Link to="/admin/tickets">
          <AdminCard className="p-4 h-full">
            <Ticket className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white font-medium">Support-Tickets</p>
            <p className="text-gray-500 text-sm">Anfragen beantworten</p>
          </AdminCard>
        </Link>
        <Link to="/admin/analytics">
          <AdminCard className="p-4 h-full">
            <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white font-medium">Detaillierte Statistiken</p>
            <p className="text-gray-500 text-sm">Alle Analysen anzeigen</p>
          </AdminCard>
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default AdminDashboardPage
