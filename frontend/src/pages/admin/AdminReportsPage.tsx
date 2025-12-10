import { useEffect, useState, useCallback } from 'react'
import { ReportCard } from '../../components/admin'
import { getReports, updateReportStatus, type Report } from '../../services/adminService'
import { useAuth } from '../../contexts/AuthContext'

export function AdminReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const limit = 20

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, total, error } = await getReports(status, page, limit)
    if (error) {
      setError('Fehler beim Laden der Meldungen')
    } else {
      setReports(data)
      setTotal(total)
    }
    setLoading(false)
  }, [page, status])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    const { error } = await updateReportStatus(
      reportId,
      newStatus,
      newStatus === 'resolved' ? user?.id : undefined
    )
    if (error) {
      setError('Fehler beim Aktualisieren des Status')
    } else {
      loadReports()
    }
  }

  const totalPages = Math.ceil(total / limit)

  const getStatusCounts = () => {
    const pending = reports.filter(r => r.status === 'pending').length
    const reviewing = reports.filter(r => r.status === 'reviewing').length
    return { pending, reviewing }
  }

  const { pending, reviewing } = getStatusCounts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Meldungen</h1>
        <div className="flex items-center gap-4">
          {pending > 0 && (
            <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-sm">
              {pending} ausstehend
            </span>
          )}
          {reviewing > 0 && (
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
              {reviewing} in Bearbeitung
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded-xl p-4 text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">
            Schliessen
          </button>
        </div>
      )}

      <div className="flex gap-2">
        {['all', 'pending', 'reviewing', 'resolved', 'dismissed'].map(s => (
          <button
            key={s}
            onClick={() => {
              setStatus(s)
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              status === s
                ? 'bg-purple-600 text-white'
                : 'bg-[#262626] text-gray-400 hover:text-white'
            }`}
          >
            {s === 'all' ? 'Alle' :
             s === 'pending' ? 'Ausstehend' :
             s === 'reviewing' ? 'In Bearbeitung' :
             s === 'resolved' ? 'Geloest' : 'Abgelehnt'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#262626] rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-[#262626] rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400">Keine Meldungen gefunden</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Zurueck
          </button>
          <span className="text-gray-400">
            Seite {page} von {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  )
}
