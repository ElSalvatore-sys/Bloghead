import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Plus, X } from 'lucide-react'
import { AnnouncementForm } from '../../components/admin'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type Announcement
} from '../../services/adminService'
import { useAuth } from '../../contexts/AuthContext'
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminEmptyState,
  CardSkeleton
} from '@/components/admin/ui'

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <AdminPageHeader
        icon={Megaphone}
        title="Ankuendigungen"
        description={`${announcements.length} Ankuendigungen`}
        actions={
          <AdminButton
            icon={Plus}
            onClick={() => setShowForm(true)}
          >
            Neue Ankuendigung
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
      </AnimatePresence>

      <AnimatePresence>
        {(showForm || editingAnnouncement) && user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AdminCard hover={false}>
              <div className="p-6">
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
            </AdminCard>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <AdminEmptyState
          icon={Megaphone}
          title="Keine Ankuendigungen"
          description="Erstellen Sie Ihre erste Ankuendigung, um Benutzer zu informieren."
          action={{
            label: 'Ankuendigung erstellen',
            onClick: () => setShowForm(true),
            icon: Plus
          }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AdminCard className={!announcement.is_active ? 'opacity-60' : ''}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{announcement.title}</h3>
                        {getTypeBadge(announcement.type)}
                        {!announcement.is_active && (
                          <AdminBadge variant="default">Inaktiv</AdminBadge>
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
                    <AdminButton
                      variant={announcement.is_active ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleActive(announcement)}
                    >
                      {announcement.is_active ? 'Deaktivieren' : 'Aktivieren'}
                    </AdminButton>
                    <AdminButton
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAnnouncement(announcement)}
                    >
                      Bearbeiten
                    </AdminButton>
                    <AdminButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      Loeschen
                    </AdminButton>
                  </div>
                </div>
              </AdminCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
