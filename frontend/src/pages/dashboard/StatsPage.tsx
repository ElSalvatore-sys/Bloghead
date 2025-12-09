// Statistics page for artists, service providers, and event organizers

function ChartBarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function TrendUpIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function TrendDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  )
}

// Mock stats
const stats = {
  totalBookings: 24,
  bookingsChange: 12,
  totalRevenue: 18500,
  revenueChange: 8,
  profileViews: 1250,
  viewsChange: -5,
  averageRating: 4.8,
  ratingChange: 0.2,
}

const monthlyData = [
  { month: 'Jan', bookings: 2, revenue: 1200 },
  { month: 'Feb', bookings: 3, revenue: 2100 },
  { month: 'Mar', bookings: 2, revenue: 1500 },
  { month: 'Apr', bookings: 4, revenue: 3200 },
  { month: 'Mai', bookings: 3, revenue: 2400 },
  { month: 'Jun', bookings: 5, revenue: 4000 },
  { month: 'Jul', bookings: 5, revenue: 4100 },
]

const recentActivity = [
  { type: 'booking', message: 'Neue Buchung von Max Mustermann', time: 'vor 2 Stunden' },
  { type: 'review', message: 'Neue 5-Sterne Bewertung erhalten', time: 'vor 5 Stunden' },
  { type: 'view', message: '50 neue Profilaufrufe heute', time: 'vor 8 Stunden' },
  { type: 'booking', message: 'Buchung bestätigt für 15. August', time: 'gestern' },
]

export function StatsPage() {
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue))

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Statistiken</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-text-muted text-sm">Buchungen</p>
            <span className={`flex items-center gap-1 text-xs ${stats.bookingsChange >= 0 ? 'text-green-400' : 'text-accent-red'}`}>
              {stats.bookingsChange >= 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
              {Math.abs(stats.bookingsChange)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
          <p className="text-text-muted text-xs mt-1">Dieses Jahr</p>
        </div>

        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-text-muted text-sm">Einnahmen</p>
            <span className={`flex items-center gap-1 text-xs ${stats.revenueChange >= 0 ? 'text-green-400' : 'text-accent-red'}`}>
              {stats.revenueChange >= 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
              {Math.abs(stats.revenueChange)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-accent-purple">{stats.totalRevenue.toLocaleString('de-DE')} €</p>
          <p className="text-text-muted text-xs mt-1">Dieses Jahr</p>
        </div>

        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-text-muted text-sm">Profilaufrufe</p>
            <span className={`flex items-center gap-1 text-xs ${stats.viewsChange >= 0 ? 'text-green-400' : 'text-accent-red'}`}>
              {stats.viewsChange >= 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
              {Math.abs(stats.viewsChange)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.profileViews.toLocaleString('de-DE')}</p>
          <p className="text-text-muted text-xs mt-1">Diesen Monat</p>
        </div>

        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-text-muted text-sm">Bewertung</p>
            <span className={`flex items-center gap-1 text-xs ${stats.ratingChange >= 0 ? 'text-green-400' : 'text-accent-red'}`}>
              {stats.ratingChange >= 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
              {stats.ratingChange >= 0 ? '+' : ''}{stats.ratingChange}
            </span>
          </div>
          <p className="text-3xl font-bold text-accent-salmon">{stats.averageRating}</p>
          <p className="text-text-muted text-xs mt-1">Durchschnitt</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Einnahmen pro Monat</h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-accent-purple to-accent-purple/50 rounded-t transition-all hover:from-accent-purple hover:to-accent-purple/70"
                  style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                />
                <span className="text-text-muted text-xs mt-2">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Letzte Aktivitäten</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'booking' ? 'bg-green-400' :
                  activity.type === 'review' ? 'bg-accent-salmon' :
                  'bg-accent-purple'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-text-muted text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-gradient-to-r from-accent-purple/20 to-accent-red/20 rounded-xl border border-accent-purple/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">💡 Tipps zur Verbesserung</h3>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li className="flex items-start gap-2">
            <span className="text-accent-purple">•</span>
            Füge mehr Fotos zu deinem Profil hinzu, um mehr Aufrufe zu generieren
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-purple">•</span>
            Antworte schnell auf Buchungsanfragen, um deine Conversion zu erhöhen
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-purple">•</span>
            Bitte zufriedene Kunden um eine Bewertung
          </li>
        </ul>
      </div>
    </div>
  )
}
