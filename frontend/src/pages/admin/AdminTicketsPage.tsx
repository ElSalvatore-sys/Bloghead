import { useEffect, useState, useCallback } from 'react'
import { TicketCard } from '../../components/admin'
import { getTickets, updateTicket, assignTicket, type SupportTicket } from '../../services/adminService'
import { useAuth } from '../../contexts/AuthContext'

export function AdminTicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const limit = 20

  const loadTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, total, error } = await getTickets(status, priority, page, limit)
    if (error) {
      setError('Fehler beim Laden der Tickets')
    } else {
      setTickets(data)
      setTotal(total)
    }
    setLoading(false)
  }, [page, status, priority])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const handleUpdateStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
    const { error } = await updateTicket(ticketId, { status: newStatus })
    if (error) {
      setError('Fehler beim Aktualisieren des Status')
    } else {
      loadTickets()
    }
  }

  const handleAssign = async (ticketId: string) => {
    if (!user) return
    const { error } = await assignTicket(ticketId, user.id)
    if (error) {
      setError('Fehler beim Uebernehmen des Tickets')
    } else {
      loadTickets()
    }
  }

  const totalPages = Math.ceil(total / limit)

  const getStatusCounts = () => {
    const open = tickets.filter(t => t.status === 'open').length
    const inProgress = tickets.filter(t => t.status === 'in_progress').length
    return { open, inProgress }
  }

  const { open, inProgress } = getStatusCounts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Support-Tickets</h1>
        <div className="flex items-center gap-4">
          {open > 0 && (
            <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-sm">
              {open} offen
            </span>
          )}
          {inProgress > 0 && (
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
              {inProgress} in Bearbeitung
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

      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <span className="text-gray-400 self-center">Status:</span>
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => {
                setStatus(s)
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                status === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#262626] text-gray-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'Alle' :
               s === 'open' ? 'Offen' :
               s === 'in_progress' ? 'In Bearbeitung' :
               s === 'resolved' ? 'Geloest' : 'Geschlossen'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-gray-400 self-center">Prioritaet:</span>
          {['all', 'urgent', 'high', 'medium', 'low'].map(p => (
            <button
              key={p}
              onClick={() => {
                setPriority(p)
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                priority === p
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#262626] text-gray-400 hover:text-white'
              }`}
            >
              {p === 'all' ? 'Alle' :
               p === 'urgent' ? 'Dringend' :
               p === 'high' ? 'Hoch' :
               p === 'medium' ? 'Mittel' : 'Niedrig'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#262626] rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-[#262626] rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400">Keine Tickets gefunden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onUpdateStatus={handleUpdateStatus}
              onAssign={handleAssign}
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
