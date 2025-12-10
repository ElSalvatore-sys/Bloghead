import { useEffect, useState } from 'react'
import { AnalyticsChart, PieChart } from '../../components/admin'
import { getAnalytics, type AnalyticsData } from '../../services/adminService'

export function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await getAnalytics()
    if (error) {
      setError('Fehler beim Laden der Analysen')
    } else {
      setAnalytics(data)
    }
    setLoading(false)
  }

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01')
    return date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  }

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fan: 'Fans',
      artist: 'Kuenstler',
      service_provider: 'Dienstleister',
      event_organizer: 'Veranstalter',
      veranstalter: 'Veranstalter',
      customer: 'Kunden',
      unknown: 'Unbekannt'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Analysen</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#262626] rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-48 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Analysen</h1>
        <div className="bg-red-600/20 border border-red-600 rounded-xl p-6 text-red-400">
          {error}
          <button onClick={loadAnalytics} className="ml-4 underline">
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analysen</h1>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Aktualisieren
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Neue Benutzer (letzte 30 Tage)"
          data={analytics?.userGrowth.map(d => ({
            label: formatDate(d.date),
            value: d.count
          })) || []}
          type="line"
          color="#9333ea"
        />

        <PieChart
          title="Benutzer nach Typ"
          data={analytics?.usersByType.map(d => ({
            label: getUserTypeLabel(d.type),
            value: d.count
          })) || []}
        />

        <AnalyticsChart
          title="Buchungen pro Monat"
          data={analytics?.bookingsByMonth.map(d => ({
            label: formatMonth(d.month),
            value: d.count
          })) || []}
          type="bar"
          color="#f97316"
        />

        <AnalyticsChart
          title="Umsatz pro Monat"
          data={analytics?.revenueByMonth.map(d => ({
            label: formatMonth(d.month),
            value: d.amount
          })) || []}
          type="bar"
          color="#22c55e"
          valuePrefix=""
          valueSuffix=" EUR"
        />
      </div>

      <div className="bg-[#262626] rounded-xl p-6 border border-gray-800">
        <h2 className="text-white font-medium mb-4">Zusammenfassung</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-400 text-sm">Neue Benutzer (30 Tage)</p>
            <p className="text-2xl font-bold text-white">
              {analytics?.userGrowth.reduce((sum, d) => sum + d.count, 0) || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Buchungen (12 Monate)</p>
            <p className="text-2xl font-bold text-white">
              {analytics?.bookingsByMonth.reduce((sum, d) => sum + d.count, 0) || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Gesamtumsatz (12 Monate)</p>
            <p className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR'
              }).format(analytics?.revenueByMonth.reduce((sum, d) => sum + d.amount, 0) || 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Durchschn. Buchungswert</p>
            <p className="text-2xl font-bold text-white">
              {(() => {
                const totalBookings = analytics?.bookingsByMonth.reduce((sum, d) => sum + d.count, 0) || 0
                const totalRevenue = analytics?.revenueByMonth.reduce((sum, d) => sum + d.amount, 0) || 0
                const avg = totalBookings > 0 ? totalRevenue / totalBookings : 0
                return new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(avg)
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
