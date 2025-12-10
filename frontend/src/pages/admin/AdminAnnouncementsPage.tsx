import { useEffect, useState } from 'react'
import { AnnouncementForm } from '../../components/admin'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type Announcement
} from '../../services/adminService'
import { useAuth } from '../../contexts/AuthContext'

export function AdminAnnouncementsPage() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await getAnnouncements(true)
    if (error) {
      setError('Fehler beim Laden der Ankuendigungen')
    } else {
      setAnnouncements(data)
    }
    setLoading(false)
  }

  const handleCreate = async (data: Omit<Announcement, 'id' | 'created_at'>) => {
    const { error } = await createAnnouncement(data)
    if (error) {
      setError('Fehler beim Erstellen der Ankuendigung')
    } else {
      setShowForm(false)
      loadAnnouncements()
    }
  }

  const handleUpdate = async (data: Omit<Announcement, 'id' | 'created_at'>) => {
    if (!editingAnnouncement) return
    const { error } = await updateAnnouncement(editingAnnouncement.id, data)
    if (error) {
      setError('Fehler beim Aktualisieren der Ankuendigung')
    } else {
      setEditingAnnouncement(null)
      loadAnnouncements()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Ankuendigung wirklich loeschen?')) return
    const { error } = await deleteAnnouncement(id)
    if (error) {
      setError('Fehler beim Loeschen der Ankuendigung')
    } else {
      loadAnnouncements()
    }
  }

  const handleToggleActive = async (announcement: Announcement) => {
    const { error } = await updateAnnouncement(announcement.id, {
      is_active: !announcement.is_active
    })
    if (error) {
      setError('Fehler beim Aktualisieren des Status')
    } else {
      loadAnnouncements()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      info: 'bg-blue-600/20 text-blue-400',
      warning: 'bg-yellow-600/20 text-yellow-400',
      success: 'bg-green-600/20 text-green-400',
      error: 'bg-red-600/20 text-red-400'
    }
    const labels: Record<string, string> = {
      info: 'Info',
      warning: 'Warnung',
      success: 'Erfolg',
      error: 'Fehler'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[type] || styles.info}`}>
        {labels[type] || type}
      </span>
    )
  }

  const getAudienceLabel = (audience: string) => {
    const labels: Record<string, string> = {
      all: 'Alle',
      artists: 'Kuenstler',
      fans: 'Fans',
      organizers: 'Veranstalter'
    }
    return labels[audience] || audience
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Ankuendigungen</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Neue Ankuendigung
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

      {(showForm || editingAnnouncement) && user && (
        <div className="bg-[#262626] rounded-xl p-6 border border-gray-800">
          <h2 className="text-white font-medium mb-4">
            {editingAnnouncement ? 'Ankuendigung bearbeiten' : 'Neue Ankuendigung'}
          </h2>
          <AnnouncementForm
            announcement={editingAnnouncement}
            onSubmit={editingAnnouncement ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false)
              setEditingAnnouncement(null)
            }}
            userId={user.id}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#262626] rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-[#262626] rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <p className="text-gray-400">Keine Ankuendigungen vorhanden</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(announcement => (
            <div
              key={announcement.id}
              className={`bg-[#262626] rounded-xl p-5 border ${
                announcement.is_active ? 'border-gray-800' : 'border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{announcement.title}</h3>
                    {getTypeBadge(announcement.type)}
                    {!announcement.is_active && (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-600/20 text-gray-400">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Erstellt: {formatDate(announcement.created_at)}</span>
                    <span>Zielgruppe: {getAudienceLabel(announcement.target_audience)}</span>
                    {announcement.expires_at && (
                      <span>Laeuft ab: {formatDate(announcement.expires_at)}</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-400 mb-4">{announcement.content}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(announcement)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    announcement.is_active
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {announcement.is_active ? 'Deaktivieren' : 'Aktivieren'}
                </button>
                <button
                  onClick={() => setEditingAnnouncement(announcement)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-lg text-sm transition-colors"
                >
                  Loeschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
