/**
 * BlockedDatesManager Component
 * Manage blocked date ranges (vacations, breaks, etc.)
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getBlockedDates,
  blockDateRange,
  deleteBlockedDates,
  formatDateDE,
  type ArtistBlockedDates,
  type BlockDatesInput
} from '../../services/availabilityService'

// Icons
function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function TrashIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

interface BlockedDatesManagerProps {
  artistId: string
  onUpdate?: () => void
  className?: string
}

const REASON_OPTIONS = [
  { value: 'vacation', label: 'Urlaub' },
  { value: 'personal', label: 'Persönlich' },
  { value: 'other_booking', label: 'Andere Buchung' },
  { value: 'health', label: 'Gesundheit' },
  { value: 'travel', label: 'Reise' },
  { value: 'other', label: 'Sonstiges' }
]

export function BlockedDatesManager({
  artistId,
  onUpdate,
  className = ''
}: BlockedDatesManagerProps) {
  const [blockedDates, setBlockedDatesData] = useState<ArtistBlockedDates[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<BlockDatesInput>({
    start_date: '',
    end_date: '',
    reason: 'vacation',
    notes: ''
  })

  // Fetch blocked dates
  const fetchBlockedDates = async () => {
    setLoading(true)
    const { data, error } = await getBlockedDates(artistId)

    if (error) {
      console.error('Error fetching blocked dates:', error)
    } else if (data) {
      setBlockedDatesData(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (artistId) {
      fetchBlockedDates()
    }
  }, [artistId])

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.start_date || !formData.end_date) {
      setError('Bitte Start- und Enddatum angeben')
      return
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('Enddatum muss nach Startdatum liegen')
      return
    }

    setSaving(true)
    const { error } = await blockDateRange(artistId, formData)

    if (error) {
      setError('Fehler beim Speichern')
    } else {
      setFormData({ start_date: '', end_date: '', reason: 'vacation', notes: '' })
      setShowForm(false)
      await fetchBlockedDates()
      onUpdate?.()
    }

    setSaving(false)
  }

  // Handle delete
  const handleDelete = async (blockId: string) => {
    if (!confirm('Möchtest du diesen Zeitraum wirklich löschen?')) return

    const { error } = await deleteBlockedDates(blockId)

    if (error) {
      console.error('Error deleting blocked dates:', error)
    } else {
      await fetchBlockedDates()
      onUpdate?.()
    }
  }

  // Get reason label
  const getReasonLabel = (reason: string) => {
    return REASON_OPTIONS.find(r => r.value === reason)?.label || reason
  }

  // Calculate duration in days
  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 ${className}`}>
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Blockierte Zeiträume</h3>
          <p className="text-sm text-white/50 mt-1">
            Urlaub, Auszeiten oder andere blockierte Termine
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/80 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Zeitraum blockieren
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 bg-white/5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Startdatum
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Enddatum
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Grund
                </label>
                <select
                  value={formData.reason}
                  onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple transition-colors"
                >
                  {REASON_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Notizen (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="Zusätzliche Informationen..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent-purple transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/80 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Speichern...' : 'Speichern'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Blocked Dates List */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : blockedDates.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">Keine blockierten Zeiträume</p>
            <p className="text-white/30 text-sm">
              Füge Urlaub oder andere Auszeiten hinzu
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedDates.map((block, index) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-red-500/20 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {formatDateDE(block.start_date)} - {formatDateDE(block.end_date)}
                    </p>
                    <p className="text-sm text-white/50">
                      {getReasonLabel(block.reason || 'blocked')} • {getDuration(block.start_date, block.end_date)} Tage
                    </p>
                    {block.notes && (
                      <p className="text-xs text-white/40 mt-1">{block.notes}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(block.id)}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlockedDatesManager
