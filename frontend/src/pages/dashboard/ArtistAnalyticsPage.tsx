/**
 * ArtistAnalyticsPage - Phase 8
 * Analytics dashboard for artists showing earnings, bookings, profile views
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  Calendar,
  Eye,
  Star,
  MessageCircle,
  Users,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  StatCard,
  DateRangePicker,
  ChartContainer,
  AnalyticsLineChart,
  AnalyticsBarChart,
  AnalyticsPieChart,
} from '@/components/analytics'
import {
  getArtistDashboardStats,
  getArtistEarningsChart,
  getArtistBookingsChart,
  getArtistMonthlyComparison,
  formatCurrency,
  getPeriodLabel,
  type AnalyticsPeriod,
  type ArtistDashboardStats,
  type EarningsChartData,
  type BookingsChartData,
  type MonthlyComparison,
} from '@/services/analyticsService'

export function ArtistAnalyticsPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [stats, setStats] = useState<ArtistDashboardStats | null>(null)
  const [earningsData, setEarningsData] = useState<EarningsChartData | null>(null)
  const [bookingsData, setBookingsData] = useState<BookingsChartData | null>(null)
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison | null>(null)

  // Load analytics data
  useEffect(() => {
    if (!user?.id) return

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Load all data in parallel
        const [statsResult, earningsResult, bookingsResult, comparisonResult] = await Promise.all([
          getArtistDashboardStats(user.id, period),
          getArtistEarningsChart(user.id, period),
          getArtistBookingsChart(user.id, period),
          getArtistMonthlyComparison(user.id),
        ])

        if (statsResult.error) {
          setError(statsResult.error.message)
        } else {
          setStats(statsResult.data)
        }

        setEarningsData(earningsResult.data)
        setBookingsData(bookingsResult.data)
        setMonthlyComparison(comparisonResult.data)
      } catch (err) {
        console.error('Error loading analytics:', err)
        setError('Fehler beim Laden der Statistiken')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id, period])

  // Placeholder data for development (will be replaced by real data)
  const placeholderStats: ArtistDashboardStats = {
    total_earnings: { value: 12450, previous_value: 10200, change_percent: 22.1, trend: 'up' },
    total_bookings: { value: 28, previous_value: 24, change_percent: 16.7, trend: 'up' },
    profile_views: { value: 1847, previous_value: 1520, change_percent: 21.5, trend: 'up' },
    avg_rating: { value: 4.8, previous_value: 4.7, change_percent: 2.1, trend: 'up' },
    response_rate: { value: 94, previous_value: 89, change_percent: 5.6, trend: 'up' },
    repeat_clients: { value: 12, previous_value: 9, change_percent: 33.3, trend: 'up' },
  }

  const placeholderEarningsData: EarningsChartData = {
    data: [
      { date: '01.12', value: 450 },
      { date: '05.12', value: 1200 },
      { date: '10.12', value: 800 },
      { date: '15.12', value: 2100 },
      { date: '20.12', value: 1650 },
      { date: '25.12', value: 950 },
      { date: '30.12', value: 1800 },
    ],
    total: 8950,
    currency: 'EUR',
  }

  const placeholderBookingsData: BookingsChartData = {
    data: [
      { date: 'Mo', value: 2 },
      { date: 'Di', value: 4 },
      { date: 'Mi', value: 3 },
      { date: 'Do', value: 6 },
      { date: 'Fr', value: 8 },
      { date: 'Sa', value: 12 },
      { date: 'So', value: 5 },
    ],
    total: 40,
    by_status: { completed: 28, cancelled: 3, pending: 9 },
  }

  const placeholderMonthlyComparison = {
    current_month: { earnings: 4500, bookings: 12, views: 850 },
    previous_month: { earnings: 3800, bookings: 10, views: 720 },
    changes: { earnings_percent: 18.4, bookings_percent: 20.0, views_percent: 18.1 },
  }

  // Use real data or placeholder
  const displayStats = stats || placeholderStats
  const displayEarnings = earningsData || placeholderEarningsData
  const displayBookings = bookingsData || placeholderBookingsData
  const displayComparison = monthlyComparison || placeholderMonthlyComparison

  // Booking status pie chart data
  const bookingStatusData = [
    { name: 'Abgeschlossen', value: displayBookings.by_status.completed, color: '#10B981' },
    { name: 'Ausstehend', value: displayBookings.by_status.pending, color: '#F59E0B' },
    { name: 'Storniert', value: displayBookings.by_status.cancelled, color: '#EF4444' },
  ]

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
          <p className="text-white/60">Statistiken werden geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Statistiken</h1>
          <p className="text-white/60 mt-1">{getPeriodLabel(period)}</p>
        </div>
        <DateRangePicker value={period} onChange={setPeriod} />
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            title: "Einnahmen",
            value: formatCurrency(displayStats.total_earnings.value),
            icon: <DollarSign className="w-5 h-5" />,
            trend: {
              value: displayStats.total_earnings.change_percent,
              direction: displayStats.total_earnings.trend,
            },
            variant: "gradient" as const,
          },
          {
            title: "Buchungen",
            value: displayStats.total_bookings.value,
            icon: <Calendar className="w-5 h-5" />,
            trend: {
              value: displayStats.total_bookings.change_percent,
              direction: displayStats.total_bookings.trend,
            },
          },
          {
            title: "Profilaufrufe",
            value: displayStats.profile_views.value.toLocaleString('de-DE'),
            icon: <Eye className="w-5 h-5" />,
            trend: {
              value: displayStats.profile_views.change_percent,
              direction: displayStats.profile_views.trend,
            },
          },
          {
            title: "Bewertung",
            value: displayStats.avg_rating.value.toFixed(1),
            subtitle: "von 5.0",
            icon: <Star className="w-5 h-5" />,
            trend: {
              value: displayStats.avg_rating.change_percent,
              direction: displayStats.avg_rating.trend,
            },
          },
          {
            title: "Antwortrate",
            value: `${displayStats.response_rate.value}%`,
            icon: <MessageCircle className="w-5 h-5" />,
            trend: {
              value: displayStats.response_rate.change_percent,
              direction: displayStats.response_rate.trend,
            },
          },
          {
            title: "Stammkunden",
            value: displayStats.repeat_clients.value,
            icon: <Users className="w-5 h-5" />,
            trend: {
              value: displayStats.repeat_clients.change_percent,
              direction: displayStats.repeat_clients.trend,
            },
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <ChartContainer
            title="Einnahmen"
            subtitle={`Gesamt: ${formatCurrency(displayEarnings.total)}`}
            isEmpty={!displayEarnings.data.length}
          >
            <AnalyticsLineChart
              data={displayEarnings.data as { date: string; value: number }[]}
              formatYAxis="currency"
              height={280}
            />
          </ChartContainer>
        </motion.div>

        {/* Bookings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          <ChartContainer
            title="Buchungen nach Tag"
            subtitle={`Gesamt: ${displayBookings.total} Buchungen`}
            isEmpty={!displayBookings.data.length}
          >
            <AnalyticsBarChart
              data={displayBookings.data.map((d) => ({ name: d.date || '', value: d.value }))}
              height={280}
            />
          </ChartContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <ChartContainer
            title="Buchungsstatus"
            isEmpty={!bookingStatusData.some((d) => d.value > 0)}
          >
            <AnalyticsPieChart
              data={bookingStatusData}
              height={260}
              innerRadius={50}
              outerRadius={80}
              centerValue={displayBookings.total}
              centerLabel="Gesamt"
            />
          </ChartContainer>
        </motion.div>

        {/* Monthly Comparison */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.5 }}
        >
          <ChartContainer
            title="Monatsvergleich"
            subtitle="Aktueller vs. vorheriger Monat"
          >
            <div className="grid grid-cols-3 gap-4 h-full">
              {/* Earnings Comparison */}
              <div className="bg-white/5 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Einnahmen</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(displayComparison.current_month.earnings)}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span
                    className={`text-sm font-medium ${
                      displayComparison.changes.earnings_percent >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {displayComparison.changes.earnings_percent >= 0 ? '+' : ''}
                    {displayComparison.changes.earnings_percent.toFixed(1)}%
                  </span>
                  <span className="text-white/40 text-sm">vs. Vormonat</span>
                </div>
              </div>

              {/* Bookings Comparison */}
              <div className="bg-white/5 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Buchungen</p>
                  <p className="text-2xl font-bold text-white">
                    {displayComparison.current_month.bookings}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span
                    className={`text-sm font-medium ${
                      displayComparison.changes.bookings_percent >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {displayComparison.changes.bookings_percent >= 0 ? '+' : ''}
                    {displayComparison.changes.bookings_percent.toFixed(1)}%
                  </span>
                  <span className="text-white/40 text-sm">vs. Vormonat</span>
                </div>
              </div>

              {/* Views Comparison */}
              <div className="bg-white/5 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Profilaufrufe</p>
                  <p className="text-2xl font-bold text-white">
                    {displayComparison.current_month.views.toLocaleString('de-DE')}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span
                    className={`text-sm font-medium ${
                      displayComparison.changes.views_percent >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {displayComparison.changes.views_percent >= 0 ? '+' : ''}
                    {displayComparison.changes.views_percent.toFixed(1)}%
                  </span>
                  <span className="text-white/40 text-sm">vs. Vormonat</span>
                </div>
              </div>
            </div>
          </ChartContainer>
        </motion.div>
      </div>

      {/* Tips Section */}
      <motion.div
        className="bg-gradient-to-br from-accent-purple/20 to-accent-red/20 rounded-xl border border-accent-purple/30 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-white mb-3">💡 Tipps zur Verbesserung</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Antwortrate verbessern:",
              text: "Beantworte Anfragen innerhalb von 2 Stunden für eine höhere Buchungsrate."
            },
            {
              title: "Mehr Profilaufrufe:",
              text: "Füge mehr Fotos und Audio-Samples hinzu."
            },
            {
              title: "Stammkunden gewinnen:",
              text: "Biete Rabatte für wiederkehrende Buchungen an."
            }
          ].map((tip, index) => (
            <motion.div
              key={tip.title}
              className="bg-white/5 rounded-lg p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + (index * 0.1), duration: 0.4 }}
            >
              <p className="text-white/80 text-sm">
                <strong className="text-white">{tip.title}</strong> {tip.text}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ArtistAnalyticsPage
