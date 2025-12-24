import { useState } from 'react'
import type { AdminUser } from '../../services/adminService'

interface UserTableProps {
  users: AdminUser[]
  onUpdateRole: (userId: string, role: 'user' | 'admin' | 'moderator') => void
  onToggleVerification: (userId: string, isVerified: boolean) => void
  onDeleteUser: (userId: string) => void
  onBanUser?: (userId: string) => void
  onUnbanUser?: (userId: string) => void
  loading?: boolean
}

export function UserTable({
  users,
  onUpdateRole,
  onToggleVerification,
  onDeleteUser,
  onBanUser,
  onUnbanUser,
  loading
}: UserTableProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nie'
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fan: 'Fan',
      artist: 'Kuenstler',
      service_provider: 'Dienstleister',
      event_organizer: 'Veranstalter',
      veranstalter: 'Veranstalter',
      customer: 'Kunde'
    }
    return labels[type] || type
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-600 text-white'
      case 'moderator':
        return 'bg-blue-600 text-white'
      default:
        return 'bg-gray-600 text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-gray-800 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
            <th className="pb-3 pr-4">Benutzer</th>
            <th className="pb-3 pr-4">Typ</th>
            <th className="pb-3 pr-4">Rolle</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Registriert</th>
            <th className="pb-3 pr-4">Letzter Login</th>
            <th className="pb-3">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr
              key={user.id}
              className={`border-b border-gray-800 hover:bg-gray-800/50 ${
                user.is_banned ? 'bg-red-900/10' : ''
              }`}
            >
              <td className="py-4 pr-4">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      {user.membername}
                      {user.is_banned && (
                        <span className="px-1.5 py-0.5 bg-red-600/20 text-red-400 text-xs rounded">
                          Gesperrt
                        </span>
                      )}
                    </p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    {user.is_banned && user.banned_reason && (
                      <p className="text-red-400/70 text-xs mt-1" title={user.banned_reason}>
                        Grund: {user.banned_reason.length > 30
                          ? user.banned_reason.slice(0, 30) + '...'
                          : user.banned_reason}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-4 pr-4">
                <span className="text-gray-300">{getUserTypeLabel(user.user_type)}</span>
              </td>
              <td className="py-4 pr-4">
                <select
                  value={user.role || 'user'}
                  onChange={(e) => onUpdateRole(user.id, e.target.value as 'user' | 'admin' | 'moderator')}
                  className={`px-2 py-1 rounded text-sm ${getRoleBadgeClass(user.role)} bg-opacity-80 border-0 cursor-pointer`}
                  disabled={user.is_banned}
                >
                  <option value="user">Benutzer</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="py-4 pr-4">
                <button
                  onClick={() => onToggleVerification(user.id, !user.is_verified)}
                  disabled={user.is_banned}
                  className={`px-3 py-1 rounded-full text-sm ${
                    user.is_verified
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-gray-600/20 text-gray-400'
                  } ${user.is_banned ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {user.is_verified ? 'Verifiziert' : 'Nicht verifiziert'}
                </button>
              </td>
              <td className="py-4 pr-4 text-gray-400">
                {formatDate(user.created_at)}
              </td>
              <td className="py-4 pr-4 text-gray-400">
                {formatDate(user.last_login)}
              </td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  {/* Ban/Unban Button */}
                  {user.is_banned ? (
                    onUnbanUser && (
                      <button
                        onClick={() => onUnbanUser(user.id)}
                        className="px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded text-sm transition-colors"
                      >
                        Entsperren
                      </button>
                    )
                  ) : (
                    onBanUser && (
                      <button
                        onClick={() => onBanUser(user.id)}
                        className="px-3 py-1 text-yellow-400 hover:bg-yellow-600/10 rounded text-sm transition-colors"
                      >
                        Sperren
                      </button>
                    )
                  )}

                  {/* Delete Button */}
                  {confirmDelete === user.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onDeleteUser(user.id)
                          setConfirmDelete(null)
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Bestaetigen
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(user.id)}
                      className="px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded text-sm"
                    >
                      Loeschen
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Keine Benutzer gefunden
        </div>
      )}
    </div>
  )
}
