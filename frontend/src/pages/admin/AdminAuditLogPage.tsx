import { useEffect, useState, useCallback } from 'react'
import {
  getAuditLogs,
  getAuditLogActionTypes,
  type AuditLog
} from '../../services/adminService'
import { exportToCSV, formatDateTimeCSV, type CSVColumn } from '../../utils/csvExport'

const actionLabels: Record<string, string> = {
  user_banned: 'Benutzer gesperrt',
  user_unbanned: 'Benutzer entsperrt',
  user_role_changed: 'Rolle geaendert',
  user_deleted: 'Benutzer geloescht',
  user_verified: 'Benutzer verifiziert',
  payout_approved: 'Auszahlung genehmigt',
  payout_held: 'Auszahlung zurueckgehalten',
  payout_released: 'Auszahlung freigegeben',
  payout_completed: 'Auszahlung abgeschlossen',
  payout_processing: 'Auszahlung in Bearbeitung',
  ticket_assigned: 'Ticket zugewiesen',
  ticket_closed: 'Ticket geschlossen',
  report_resolved: 'Meldung geloest',
  announcement_created: 'Ankuendigung erstellt',
  announcement_updated: 'Ankuendigung aktualisiert',
  announcement_deleted: 'Ankuendigung geloescht',
  settings_changed: 'Einstellungen geaendert'
}

const targetTypeLabels: Record<string, string> = {
  user: 'Benutzer',
  payout: 'Auszahlung',
  ticket: 'Ticket',
  report: 'Meldung',
  announcement: 'Ankuendigung',
  settings: 'Einstellungen'
}

export function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const [actionTypes, setActionTypes] = useState<string[]>([])

  const limit = 50

  useEffect(() => {
    const loadActionTypes = async () => {
      const types = await getAuditLogActionTypes()
      setActionTypes(types)
    }
    loadActionTypes()
  }, [])

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    const filters: {
      action?: string
      dateFrom?: string
      dateTo?: string
    } = {}

    if (actionFilter !== 'all') {
      filters.action = actionFilter
    }
    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom).toISOString()
    }
    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      filters.dateTo = endDate.toISOString()
    }

    const { data, total, error } = await getAuditLogs(filters, page, limit)

    if (error) {
      setError('Fehler beim Laden der Audit-Logs')
    } else {
      setLogs(data)
      setTotal(total)
    }
    setLoading(false)
  }, [page, actionFilter, dateFrom, dateTo])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleExportCSV = () => {
    const columns: CSVColumn<AuditLog>[] = [
      { key: (row) => formatDateTimeCSV(row.created_at), label: 'Zeitpunkt' },
      { key: (row) => row.user?.membername || '-', label: 'Admin' },
      { key: (row) => row.user?.email || '-', label: 'Admin E-Mail' },
      { key: (row) => actionLabels[row.action] || row.action, label: 'Aktion' },
      { key: (row) => row.target_type ? (targetTypeLabels[row.target_type] || row.target_type) : '-', label: 'Zieltyp' },
      { key: (row) => row.target_id || '-', label: 'Ziel-ID' },
      { key: (row) => JSON.stringify(row.details), label: 'Details' },
      { key: (row) => row.ip_address || '-', label: 'IP-Adresse' }
    ]
    exportToCSV(logs, 'audit_log', columns)
  }

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      log.user?.membername?.toLowerCase().includes(search) ||
      log.user?.email?.toLowerCase().includes(search) ||
      (actionLabels[log.action] || log.action).toLowerCase().includes(search) ||
      log.target_id?.toLowerCase().includes(search)
    )
  })

  const totalPages = Math.ceil(total / limit)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionColor = (action: string) => {
    if (action.includes('banned') || action.includes('deleted')) return 'text-red-400 bg-red-600/20'
    if (action.includes('approved') || action.includes('completed') || action.includes('verified')) return 'text-green-400 bg-green-600/20'
    if (action.includes('held') || action.includes('closed')) return 'text-yellow-400 bg-yellow-600/20'
    return 'text-blue-400 bg-blue-600/20'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Audit-Log</h1>
        <button
          onClick={handleExportCSV}
          disabled={logs.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          CSV Export
        </button>
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded-xl p-4 text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">
            Schliessen
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#262626] rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Suche nach Admin, Aktion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[#171717] text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 bg-[#171717] text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Alle Aktionen</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>
                  {actionLabels[action] || action}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Von:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 bg-[#171717] text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Bis:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 bg-[#171717] text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters */}
          {(actionFilter !== 'all' || dateFrom || dateTo || searchQuery) && (
            <button
              onClick={() => {
                setActionFilter('all')
                setDateFrom('')
                setDateTo('')
                setSearchQuery('')
                setPage(1)
              }}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Filter zuruecksetzen
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="bg-[#262626] rounded-xl overflow-hidden">
          <div className="animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 border-b border-gray-700 flex gap-4">
                <div className="h-4 bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
                <div className="h-4 bg-gray-700 rounded w-40"></div>
                <div className="h-4 bg-gray-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-[#262626] rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400">Keine Audit-Logs gefunden</p>
        </div>
      ) : (
        <div className="bg-[#262626] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Zeitpunkt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Aktion
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ziel
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-white">{log.user?.membername || 'System'}</div>
                      <div className="text-xs text-gray-500">{log.user?.email || ''}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.target_type && (
                        <div>
                          <div className="text-sm text-gray-400">
                            {targetTypeLabels[log.target_type] || log.target_type}
                          </div>
                          <div className="text-xs text-gray-600 font-mono">
                            {log.target_id?.slice(0, 8)}...
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {Object.keys(log.details).length > 0 ? (
                        <details className="text-sm">
                          <summary className="text-gray-400 cursor-pointer hover:text-white">
                            Details anzeigen
                          </summary>
                          <pre className="mt-2 p-2 bg-[#171717] rounded text-xs text-gray-400 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-gray-600 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
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
            Seite {page} von {totalPages} ({total} Eintraege)
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
