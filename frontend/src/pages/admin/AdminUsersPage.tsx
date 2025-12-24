import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Download, Search, X } from 'lucide-react'
import { UserTable } from '../../components/admin'
import {
  getUsers,
  updateUserRole,
  updateUserVerification,
  deleteUser,
  banUser,
  unbanUser,
  type AdminUser
} from '../../services/adminService'
import { exportToCSV, formatDateTimeCSV, type CSVColumn } from '../../utils/csvExport'
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminPagination,
  TableSkeleton,
} from '@/components/admin/ui'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [userType, setUserType] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Ban modal state
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [banUserId, setBanUserId] = useState<string | null>(null)
  const [banReason, setBanReason] = useState('')

  const limit = 20

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, total, error } = await getUsers(page, limit, search || undefined, userType)
    if (error) {
      setError('Fehler beim Laden der Benutzer')
    } else {
      setUsers(data)
      setTotal(total)
    }
    setLoading(false)
  }, [page, search, userType])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadUsers()
  }

  const handleUpdateRole = async (userId: string, role: 'user' | 'admin' | 'moderator') => {
    const { error } = await updateUserRole(userId, role)
    if (error) {
      setError('Fehler beim Aktualisieren der Rolle')
    } else {
      loadUsers()
    }
  }

  const handleToggleVerification = async (userId: string, isVerified: boolean) => {
    const { error } = await updateUserVerification(userId, isVerified)
    if (error) {
      setError('Fehler beim Aktualisieren des Verifizierungsstatus')
    } else {
      loadUsers()
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const { error } = await deleteUser(userId)
    if (error) {
      setError('Fehler beim Loeschen des Benutzers')
    } else {
      loadUsers()
    }
  }

  const handleBanClick = (userId: string) => {
    setBanUserId(userId)
    setBanReason('')
    setBanModalOpen(true)
  }

  const handleBanConfirm = async () => {
    if (!banUserId || !banReason.trim()) {
      setError('Bitte geben Sie einen Grund fuer die Sperrung an')
      return
    }

    const { error } = await banUser(banUserId, banReason.trim())
    if (error) {
      setError('Fehler beim Sperren des Benutzers')
    } else {
      setSuccessMessage('Benutzer erfolgreich gesperrt')
      setTimeout(() => setSuccessMessage(null), 3000)
      loadUsers()
    }
    setBanModalOpen(false)
    setBanUserId(null)
    setBanReason('')
  }

  const handleUnban = async (userId: string) => {
    const { error } = await unbanUser(userId)
    if (error) {
      setError('Fehler beim Entsperren des Benutzers')
    } else {
      setSuccessMessage('Benutzer erfolgreich entsperrt')
      setTimeout(() => setSuccessMessage(null), 3000)
      loadUsers()
    }
  }

  const handleExportCSV = () => {
    const columns: CSVColumn<AdminUser>[] = [
      { key: 'membername', label: 'Benutzername' },
      { key: 'email', label: 'E-Mail' },
      { key: (row) => row.vorname || '', label: 'Vorname' },
      { key: (row) => row.nachname || '', label: 'Nachname' },
      { key: 'user_type', label: 'Benutzertyp' },
      { key: 'role', label: 'Rolle' },
      { key: 'is_verified', label: 'Verifiziert' },
      { key: 'is_banned', label: 'Gesperrt' },
      { key: (row) => row.banned_reason || '', label: 'Sperrgrund' },
      { key: (row) => formatDateTimeCSV(row.created_at), label: 'Registriert' },
      { key: (row) => formatDateTimeCSV(row.last_login), label: 'Letzter Login' }
    ]
    exportToCSV(users, 'benutzer', columns)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <AdminPageHeader
        icon={Users}
        title="Benutzerverwaltung"
        description={`${total} Benutzer gesamt`}
        actions={
          <AdminButton
            variant="secondary"
            icon={Download}
            onClick={handleExportCSV}
            disabled={users.length === 0}
          >
            CSV Export
          </AdminButton>
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

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AdminCard hover={false}>
        <div className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Suche nach Name oder E-Mail..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#171717] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
            </div>
            <select
              value={userType}
              onChange={(e) => {
                setUserType(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2.5 bg-[#171717] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
            >
              <option value="all">Alle Typen</option>
              <option value="fan">Fans</option>
              <option value="artist">Künstler</option>
              <option value="service_provider">Dienstleister</option>
              <option value="event_organizer">Veranstalter</option>
            </select>
            <AdminButton type="submit" icon={Search}>
              Suchen
            </AdminButton>
          </form>

          {loading ? (
            <TableSkeleton rows={10} cols={6} />
          ) : (
            <UserTable
              users={users}
              onUpdateRole={handleUpdateRole}
              onToggleVerification={handleToggleVerification}
              onDeleteUser={handleDeleteUser}
              onBanUser={handleBanClick}
              onUnbanUser={handleUnban}
              loading={false}
            />
          )}

          {totalPages > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-800/50">
              <AdminPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </AdminCard>

      {/* Ban Modal */}
      {banModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#262626] rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Benutzer sperren</h3>
            <p className="text-gray-400 mb-4">
              Bitte geben Sie einen Grund fuer die Sperrung an. Dieser wird im Audit-Log gespeichert.
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Grund fuer die Sperrung..."
              rows={3}
              className="w-full px-4 py-2 bg-[#171717] text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setBanModalOpen(false)
                  setBanUserId(null)
                  setBanReason('')
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleBanConfirm}
                disabled={!banReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sperren
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
