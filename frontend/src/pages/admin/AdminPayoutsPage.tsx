/**
 * AdminPayoutsPage - Phase 10
 * Manage artist payouts with filtering, status updates, and export
 */

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Download,
  RefreshCw,
  Euro,
  X
} from 'lucide-react'
import {
  getPayouts,
  getPayoutStats,
  updatePayoutStatus,
  holdPayout,
  releasePayout,
  type Payout
} from '../../services/adminService'
import { exportToCSV, formatCurrencyCSV, formatDateTimeCSV } from '../../utils/csvExport'
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminStatCard,
  AdminPagination,
  AdminEmptyState,
  TableSkeleton
} from '@/components/admin/ui'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

const STATUS_CONFIG = {
  pending: { label: 'Ausstehend', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  processing: { label: 'In Bearbeitung', color: 'bg-blue-500/20 text-blue-400', icon: RefreshCw },
  completed: { label: 'Abgeschlossen', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  failed: { label: 'Fehlgeschlagen', color: 'bg-red-500/20 text-red-400', icon: XCircle },
  on_hold: { label: 'Angehalten', color: 'bg-orange-500/20 text-orange-400', icon: Pause }
}

export function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    pendingCount: number
    pendingAmount: number
    processedThisMonth: number
    processedAmountThisMonth: number
  } | null>(null)

  // Modal state for hold reason
  const [holdModalOpen, setHoldModalOpen] = useState(false)
  const [holdPayoutId, setHoldPayoutId] = useState<string | null>(null)
  const [holdReason, setHoldReason] = useState('')

  const limit = 20

  const loadPayouts = useCallback(async () => {
    setLoading(true)
    setError(null)

    const statusFilter = status !== 'all' ? status : undefined
    const { data, total, error } = await getPayouts({ status: statusFilter }, page, limit)

    if (error) {
      setError('Fehler beim Laden der Auszahlungen')
    } else {
      setPayouts(data)
      setTotal(total)
    }
    setLoading(false)
  }, [page, status])

  const loadStats = useCallback(async () => {
    const { data } = await getPayoutStats()
    if (data) setStats(data)
  }, [])

  useEffect(() => {
    loadPayouts()
    loadStats()
  }, [loadPayouts, loadStats])

  const handleStatusChange = async (payoutId: string, newStatus: Payout['status']) => {
    const { error } = await updatePayoutStatus(payoutId, newStatus)
    if (error) {
      setError('Fehler beim Aktualisieren des Status')
    } else {
      loadPayouts()
      loadStats()
    }
  }

  const handleHold = async () => {
    if (!holdPayoutId || !holdReason.trim()) return

    const { error } = await holdPayout(holdPayoutId, holdReason)
    if (error) {
      setError('Fehler beim Anhalten der Auszahlung')
    } else {
      loadPayouts()
      loadStats()
    }

    setHoldModalOpen(false)
    setHoldPayoutId(null)
    setHoldReason('')
  }

  const handleRelease = async (payoutId: string) => {
    const { error } = await releasePayout(payoutId)
    if (error) {
      setError('Fehler beim Freigeben der Auszahlung')
    } else {
      loadPayouts()
      loadStats()
    }
  }

  const handleExport = () => {
    exportToCSV(payouts, 'auszahlungen', [
      { key: (p) => p.artist?.kuenstlername || '-', label: 'Künstler' },
      { key: (p) => p.artist?.user?.email || '-', label: 'E-Mail' },
      { key: (p) => formatCurrencyCSV(p.amount), label: 'Betrag' },
      { key: (p) => STATUS_CONFIG[p.status]?.label || p.status, label: 'Status' },
      { key: (p) => formatDateTimeCSV(p.created_at), label: 'Erstellt' },
      { key: (p) => formatDateTimeCSV(p.processed_at), label: 'Verarbeitet' },
      { key: (p) => p.hold_reason || '', label: 'Grund für Halt' }
    ])
  }

  const totalPages = Math.ceil(total / limit)
  const statuses = ['all', 'pending', 'processing', 'completed', 'on_hold', 'failed']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <AdminPageHeader
        icon={Banknote}
        title="Auszahlungen"
        description="Verwalten Sie Künstler-Auszahlungen"
        actions={
          <AdminButton
            variant="secondary"
            icon={Download}
            onClick={handleExport}
            disabled={payouts.length === 0}
          >
            CSV Export
          </AdminButton>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminStatCard
            title="Ausstehend"
            value={stats.pendingCount}
            icon={Clock}
            color="orange"
            delay={0}
          />
          <AdminStatCard
            title="Ausstehender Betrag"
            value={formatCurrency(stats.pendingAmount)}
            icon={Euro}
            color="orange"
            delay={0.05}
          />
          <AdminStatCard
            title="Diesen Monat"
            value={stats.processedThisMonth}
            icon={CheckCircle}
            color="green"
            delay={0.1}
          />
          <AdminStatCard
            title="Ausgezahlt (Monat)"
            value={formatCurrency(stats.processedAmountThisMonth)}
            icon={Banknote}
            color="purple"
            delay={0.15}
          />
        </div>
      )}

      {/* Filters */}
      <AdminCard hover={false}>
        <div className="p-4 flex items-center gap-4">
          <span className="text-sm text-gray-400">Status:</span>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <motion.button
                key={s}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setStatus(s)
                  setPage(1)
                }}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  status === s
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {s === 'all' ? 'Alle' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
              </motion.button>
            ))}
          </div>
        </div>
      </AdminCard>

      {/* Error Message */}
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

      {/* Payouts Table */}
      <AdminCard hover={false} className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : payouts.length === 0 ? (
          <AdminEmptyState
            icon={Banknote}
            title="Keine Auszahlungen"
            description="Es wurden keine Auszahlungen mit den aktuellen Filtern gefunden."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Künstler</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Betrag</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Erstellt</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Verarbeitet</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {payouts.map((payout) => {
                  const statusConfig = STATUS_CONFIG[payout.status]
                  const StatusIcon = statusConfig?.icon || Clock

                  return (
                    <tr key={payout.id} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">
                            {payout.artist?.kuenstlername || 'Unbekannt'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {payout.artist?.user?.email || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-semibold">
                          {formatCurrency(payout.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig?.label || payout.status}
                        </span>
                        {payout.hold_reason && (
                          <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={payout.hold_reason}>
                            Grund: {payout.hold_reason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {formatDate(payout.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {payout.processed_at ? formatDate(payout.processed_at) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {payout.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(payout.id, 'completed')}
                                className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="Genehmigen"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setHoldPayoutId(payout.id)
                                  setHoldModalOpen(true)
                                }}
                                className="p-2 text-orange-400 hover:bg-orange-500/20 rounded-lg transition-colors"
                                title="Anhalten"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {payout.status === 'on_hold' && (
                            <button
                              onClick={() => handleRelease(payout.id)}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                              title="Freigeben"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {payout.status === 'failed' && (
                            <button
                              onClick={() => handleStatusChange(payout.id, 'pending')}
                              className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                              title="Erneut versuchen"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 pt-6 border-t border-gray-800/50">
            <AdminPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </AdminCard>

      {/* Hold Reason Modal */}
      {holdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setHoldModalOpen(false)}
          />
          <div className="relative bg-[#1f1f1f] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Auszahlung anhalten</h3>
            <p className="text-gray-400 text-sm mb-4">
              Bitte geben Sie einen Grund an, warum diese Auszahlung angehalten werden soll.
            </p>
            <textarea
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              placeholder="Grund eingeben..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setHoldModalOpen(false)
                  setHoldReason('')
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleHold}
                disabled={!holdReason.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anhalten
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default AdminPayoutsPage
