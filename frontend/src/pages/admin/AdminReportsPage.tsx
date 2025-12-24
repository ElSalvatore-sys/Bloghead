import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, CheckCircle, X } from 'lucide-react'
import { ReportCard } from '../../components/admin'
import { getReports, updateReportStatus, type Report } from '../../services/adminService'
import { useAuth } from '../../contexts/AuthContext'
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminPagination,
  AdminEmptyState,
  CardSkeleton
} from '@/components/admin/ui'

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <AdminPageHeader
        icon={Flag}
        title="Meldungen"
        description={`${total} Meldungen gesamt`}
        actions={
          <div className="flex items-center gap-3">
            {pending > 0 && (
              <AdminBadge variant="warning">{pending} ausstehend</AdminBadge>
            )}
            {reviewing > 0 && (
              <AdminBadge variant="info">{reviewing} in Bearbeitung</AdminBadge>
            )}
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
        <div className="p-4 flex items-center gap-2">
          <span className="text-sm text-gray-400 mr-2">Status:</span>
          {['all', 'pending', 'reviewing', 'resolved', 'dismissed'].map(s => (
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
               s === 'pending' ? 'Ausstehend' :
               s === 'reviewing' ? 'In Bearbeitung' :
               s === 'resolved' ? 'Geloest' : 'Abgelehnt'}
            </motion.button>
          ))}
        </div>
      </AdminCard>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <AdminEmptyState
          icon={CheckCircle}
          title="Keine Meldungen"
          description="Es wurden keine Meldungen mit den aktuellen Filtern gefunden."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ReportCard
                report={report}
                onUpdateStatus={handleUpdateStatus}
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
