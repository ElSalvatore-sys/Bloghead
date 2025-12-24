import { useState, useEffect } from 'react'
import type { Announcement } from '../../services/adminService'

interface AnnouncementFormProps {
  announcement?: Announcement | null
  onSubmit: (data: Omit<Announcement, 'id' | 'created_at'>) => void
  onCancel: () => void
  userId: string
}

export function AnnouncementForm({ announcement, onSubmit, onCancel, userId }: AnnouncementFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'error'>('info')
  const [targetAudience, setTargetAudience] = useState<'all' | 'artists' | 'fans' | 'organizers'>('all')
  const [isActive, setIsActive] = useState(true)
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title)
      setContent(announcement.content)
      setType(announcement.type)
      setTargetAudience(announcement.target_audience)
      setIsActive(announcement.is_active)
      setExpiresAt(announcement.expires_at ? announcement.expires_at.slice(0, 16) : '')
    }
  }, [announcement])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      content,
      type,
      target_audience: targetAudience,
      is_active: isActive,
      created_by: userId,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-300 text-sm mb-2">Titel</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          placeholder="Ankuendigungstitel..."
          required
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm mb-2">Inhalt</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
          placeholder="Ankuendigungstext..."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 text-sm mb-2">Typ</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="info">Information</option>
            <option value="warning">Warnung</option>
            <option value="success">Erfolg</option>
            <option value="error">Fehler</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Zielgruppe</label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value as typeof targetAudience)}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">Alle Benutzer</option>
            <option value="artists">Nur Kuenstler</option>
            <option value="fans">Nur Fans</option>
            <option value="organizers">Nur Veranstalter</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-gray-300 text-sm mb-2">Ablaufdatum (optional)</label>
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 rounded border-gray-700 bg-[#1a1a1a] text-purple-600 focus:ring-purple-500"
        />
        <label htmlFor="isActive" className="text-gray-300 text-sm">
          Sofort aktiv
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          {announcement ? 'Aktualisieren' : 'Erstellen'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}
