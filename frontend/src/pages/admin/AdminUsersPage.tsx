import { useEffect, useState, useCallback } from 'react'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Benutzerverwaltung</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">{total} Benutzer gesamt</span>
          <button
            onClick={handleExportCSV}
            disabled={users.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV Export
          </button>
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

      {successMessage && (
        <div className="bg-green-600/20 border border-green-600 rounded-xl p-4 text-green-400">
          {successMessage}
        </div>
      )}

      <div className="bg-[#262626] rounded-xl p-6 border border-gray-800">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche nach Name oder E-Mail..."
            className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <select
            value={userType}
            onChange={(e) => {
              setUserType(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">Alle Typen</option>
            <option value="fan">Fans</option>
            <option value="artist">Kuenstler</option>
            <option value="service_provider">Dienstleister</option>
            <option value="event_organizer">Veranstalter</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Suchen
          </button>
        </form>

        <UserTable
          users={users}
          onUpdateRole={handleUpdateRole}
          onToggleVerification={handleToggleVerification}
          onDeleteUser={handleDeleteUser}
          onBanUser={handleBanClick}
          onUnbanUser={handleUnban}
          loading={loading}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
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
    </div>
  )
}
