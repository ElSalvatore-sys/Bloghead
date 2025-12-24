import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Download, X, CheckCircle } from 'lucide-react'
import { TicketCard } from '../../components/admin'
import { getTickets, updateTicket, assignTicket, type SupportTicket } from '../../services/adminService'
import { useAuth } from '../../contexts/AuthContext'
import { exportToCSV, formatDateTimeCSV, type CSVColumn } from '../../utils/csvExport'
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminPagination,
  AdminEmptyState,
  CardSkeleton
} from '@/components/admin/ui'

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

  const statusLabels: Record<string, string> = {
    open: 'Offen',
    in_progress: 'In Bearbeitung',
    resolved: 'Geloest',
    closed: 'Geschlossen'
  }

  const priorityLabels: Record<string, string> = {
    urgent: 'Dringend',
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig'
  }

  const handleExportCSV = () => {
    const columns: CSVColumn<SupportTicket>[] = [
      { key: 'subject', label: 'Betreff' },
      { key: (row) => row.user?.membername || '', label: 'Benutzer' },
      { key: (row) => row.user?.email || '', label: 'E-Mail' },
      { key: 'category', label: 'Kategorie' },
      { key: (row) => statusLabels[row.status] || row.status, label: 'Status' },
      { key: (row) => priorityLabels[row.priority] || row.priority, label: 'Prioritaet' },
      { key: 'description', label: 'Beschreibung' },
      { key: (row) => formatDateTimeCSV(row.created_at), label: 'Erstellt' },
      { key: (row) => formatDateTimeCSV(row.updated_at), label: 'Aktualisiert' }
    ]
    exportToCSV(tickets, 'support_tickets', columns)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <AdminPageHeader
        icon={Ticket}
        title="Support-Tickets"
        description={`${total} Tickets gesamt`}
        actions={
          <div className="flex items-center gap-3">
            {open > 0 && (
              <AdminBadge variant="warning">{open} offen</AdminBadge>
            )}
            {inProgress > 0 && (
              <AdminBadge variant="info">{inProgress} in Bearbeitung</AdminBadge>
            )}
            <AdminButton
              variant="secondary"
              icon={Download}
              onClick={handleExportCSV}
              disabled={tickets.length === 0}
            >
              CSV Export
            </AdminButton>
          </div>
        }
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <AdminCard hover={false}>
        <div className="p-4 flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Status:</span>
            <div className="flex gap-2">
              {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setStatus(s)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    status === s
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'Alle' :
                   s === 'open' ? 'Offen' :
                   s === 'in_progress' ? 'In Bearbeitung' :
                   s === 'resolved' ? 'Geloest' : 'Geschlossen'}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Prioritaet:</span>
            <div className="flex gap-2">
              {['all', 'urgent', 'high', 'medium', 'low'].map(p => (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPriority(p)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    priority === p
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {p === 'all' ? 'Alle' :
                   p === 'urgent' ? 'Dringend' :
                   p === 'high' ? 'Hoch' :
                   p === 'medium' ? 'Mittel' : 'Niedrig'}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </AdminCard>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <AdminEmptyState
          icon={CheckCircle}
          title="Keine Tickets"
          description="Es wurden keine Tickets mit den aktuellen Filtern gefunden."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {tickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TicketCard
                ticket={ticket}
                onUpdateStatus={handleUpdateStatus}
                onAssign={handleAssign}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {totalPages > 1 && (
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </motion.div>
  )
}
