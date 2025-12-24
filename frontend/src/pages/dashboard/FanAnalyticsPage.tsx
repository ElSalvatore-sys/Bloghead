/**
 * FanAnalyticsPage - Phase 8
 * Analytics dashboard for fans showing spending, events attended, favorite artists
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Wallet,
  Calendar,
  Heart,
  TrendingUp,
  Ticket,
  Coins,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  StatCard,
  DateRangePicker,
  ChartContainer,
  AnalyticsLineChart,
  AnalyticsPieChart,
} from '@/components/analytics'
import {
  getFanDashboardStats,
  getFanSpendingChart,
  getFanFavoriteArtists,
  formatCurrency,
  getPeriodLabel,
  type AnalyticsPeriod,
  type FanDashboardStats,
  type SpendingChartData,
  type FavoriteArtist,
} from '@/services/analyticsService'

export function FanAnalyticsPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [stats, setStats] = useState<FanDashboardStats | null>(null)
  const [spendingData, setSpendingData] = useState<SpendingChartData | null>(null)
  const [favoriteArtists, setFavoriteArtists] = useState<FavoriteArtist[]>([])

  // Load analytics data
  useEffect(() => {
    if (!user?.id) return

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Load all data in parallel
        const [statsResult, spendingResult, artistsResult] = await Promise.all([
          getFanDashboardStats(user.id, period),
          getFanSpendingChart(user.id, period),
          getFanFavoriteArtists(user.id, 5),
        ])

        if (statsResult.error) {
          setError(statsResult.error.message)
        } else {
          setStats(statsResult.data)
        }

        setSpendingData(spendingResult.data)
        if (artistsResult.data) {
          setFavoriteArtists(artistsResult.data)
        }
      } catch (err) {
        console.error('Error loading analytics:', err)
        setError('Fehler beim Laden der Statistiken')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id, period])

  // Placeholder data for development
  const placeholderStats: FanDashboardStats = {
    total_spent: { value: 2850, previous_value: 2100, change_percent: 35.7, trend: 'up' },
    events_attended: { value: 12, previous_value: 8, change_percent: 50.0, trend: 'up' },
    artists_booked: { value: 6, previous_value: 4, change_percent: 50.0, trend: 'up' },
    avg_booking_value: { value: 237, previous_value: 262, change_percent: -9.5, trend: 'down' },
    upcoming_events: 3,
    coins_balance: 450,
  }

  const placeholderSpendingData: SpendingChartData = {
    data: [
      { date: '01.12', value: 0 },
      { date: '05.12', value: 450 },
      { date: '10.12', value: 0 },
      { date: '15.12', value: 850 },
      { date: '20.12', value: 200 },
      { date: '25.12', value: 0 },
      { date: '30.12', value: 650 },
    ],
    total: 2150,
    by_category: { bookings: 1800, tips: 200, coins: 150 },
  }

  const placeholderFavoriteArtists: FavoriteArtist[] = [
    {
      artist_id: '1',
      artist_name: 'DJ Max Power',
      profile_image_url: null,
      total_bookings: 4,
      total_spent: 1200,
      last_booking_date: '2024-12-15',
    },
    {
      artist_id: '2',
      artist_name: 'The Groove Masters',
      profile_image_url: null,
      total_bookings: 2,
      total_spent: 800,
      last_booking_date: '2024-11-20',
    },
    {
      artist_id: '3',
      artist_name: 'Sara Sounds',
      profile_image_url: null,
      total_bookings: 2,
      total_spent: 500,
      last_booking_date: '2024-10-05',
    },
  ]

  // Use real data or placeholder
  const displayStats = stats || placeholderStats
  const displaySpending = spendingData || placeholderSpendingData
  const displayFavorites = favoriteArtists.length > 0 ? favoriteArtists : placeholderFavoriteArtists

  // Spending breakdown pie chart data
  const spendingBreakdownData = [
    { name: 'Buchungen', value: displaySpending.by_category.bookings, color: '#7C3AED' },
    { name: 'Trinkgelder', value: displaySpending.by_category.tips, color: '#EC4899' },
    { name: 'Coins', value: displaySpending.by_category.coins, color: '#F59E0B' },
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
          <h1 className="text-3xl font-bold text-white">Meine Statistiken</h1>
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
            title: "Ausgegeben",
            value: formatCurrency(displayStats.total_spent.value),
            icon: <Wallet className="w-5 h-5" />,
            trend: {
              value: displayStats.total_spent.change_percent,
              direction: displayStats.total_spent.trend,
            },
            variant: "gradient" as const,
          },
          {
            title: "Events besucht",
            value: displayStats.events_attended.value,
            icon: <Calendar className="w-5 h-5" />,
            trend: {
              value: displayStats.events_attended.change_percent,
              direction: displayStats.events_attended.trend,
            },
          },
          {
            title: "Künstler gebucht",
            value: displayStats.artists_booked.value,
            icon: <Heart className="w-5 h-5" />,
            trend: {
              value: displayStats.artists_booked.change_percent,
              direction: displayStats.artists_booked.trend,
            },
          },
          {
            title: "Ø Buchungswert",
            value: formatCurrency(displayStats.avg_booking_value.value),
            icon: <TrendingUp className="w-5 h-5" />,
            trend: {
              value: displayStats.avg_booking_value.change_percent,
              direction: displayStats.avg_booking_value.trend,
              inverted: true,
            },
          },
          {
            title: "Kommende Events",
            value: displayStats.upcoming_events,
            icon: <Ticket className="w-5 h-5" />,
          },
          {
            title: "Coins Guthaben",
            value: displayStats.coins_balance,
            icon: <Coins className="w-5 h-5" />,
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Over Time */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <ChartContainer
            title="Ausgaben über Zeit"
            subtitle={`Gesamt: ${formatCurrency(displaySpending.total)}`}
            isEmpty={!displaySpending.data.length}
          >
            <AnalyticsLineChart
              data={displaySpending.data as { date: string; value: number }[]}
              formatYAxis="currency"
              height={280}
            />
          </ChartContainer>
        </motion.div>

        {/* Spending Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          <ChartContainer
            title="Ausgaben nach Kategorie"
            isEmpty={!spendingBreakdownData.some((d) => d.value > 0)}
          >
            <AnalyticsPieChart
              data={spendingBreakdownData}
              height={260}
              innerRadius={50}
              outerRadius={80}
              centerValue={formatCurrency(displaySpending.total)}
              centerLabel="Gesamt"
            />
          </ChartContainer>
        </motion.div>
      </div>

      {/* Favorite Artists */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        <ChartContainer
          title="Deine Lieblingskünstler"
          subtitle="Basierend auf Buchungshäufigkeit"
          isEmpty={displayFavorites.length === 0}
          emptyMessage="Du hast noch keine Künstler gebucht"
        >
          <div className="space-y-3">
            {displayFavorites.map((artist, index) => (
              <motion.div
                key={artist.artist_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + (index * 0.1), duration: 0.4 }}
              >
                <Link
                  to={`/artists/${artist.artist_id}`}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                >
              {/* Rank */}
              <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple font-bold">
                {index + 1}
              </div>

              {/* Artist Image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                {artist.profile_image_url ? (
                  <img
                    src={artist.profile_image_url}
                    alt={artist.artist_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center text-white font-bold">
                    {artist.artist_name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Artist Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium group-hover:text-accent-purple transition-colors truncate">
                  {artist.artist_name}
                </p>
                <p className="text-white/50 text-sm">
                  {artist.total_bookings} {artist.total_bookings === 1 ? 'Buchung' : 'Buchungen'}
                </p>
              </div>

              {/* Spent */}
              <div className="text-right">
                <p className="text-white font-medium">{formatCurrency(artist.total_spent)}</p>
                <p className="text-white/40 text-xs">
                  Letzte Buchung:{' '}
                  {new Date(artist.last_booking_date).toLocaleDateString('de-DE')}
                </p>
              </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </ChartContainer>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            to: "/artists",
            icon: Heart,
            title: "Neue Künstler entdecken",
            description: "Finde neue Künstler für deine nächste Veranstaltung"
          },
          {
            to: "/dashboard/bookings",
            icon: Calendar,
            title: "Buchungen verwalten",
            description: "Verwalte deine kommenden und vergangenen Buchungen"
          },
          {
            to: "/dashboard/coins",
            icon: Coins,
            title: "Coins kaufen",
            description: "Spare bei Buchungen mit Coins"
          }
        ].map((action, index) => (
          <motion.div
            key={action.to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 + (index * 0.1), duration: 0.4 }}
          >
            <Link
              to={action.to}
              className="bg-bg-card border border-white/10 rounded-xl p-6 hover:border-accent-purple/50 transition-colors group block"
            >
              <action.icon className="w-8 h-8 text-accent-purple mb-3" />
              <h3 className="text-white font-semibold mb-1 group-hover:text-accent-purple transition-colors">
                {action.title}
              </h3>
              <p className="text-white/60 text-sm">
                {action.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default FanAnalyticsPage
