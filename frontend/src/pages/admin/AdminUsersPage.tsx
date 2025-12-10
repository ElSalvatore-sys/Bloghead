import { useEffect, useState, useCallback } from 'react'
import { UserTable } from '../../components/admin'
import {
  getUsers,
  updateUserRole,
  updateUserVerification,
  deleteUser,
  type AdminUser
} from '../../services/adminService'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [userType, setUserType] = useState('all')
  const [error, setError] = useState<string | null>(null)

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

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Benutzerverwaltung</h1>
        <span className="text-gray-400">{total} Benutzer gesamt</span>
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded-xl p-4 text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">
            Schliessen
          </button>
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
    </div>
  )
}
