/**
 * AvailabilitySettings Component
 * Settings panel for artist availability configuration
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  getAvailabilitySettings,
  upsertAvailabilitySettings,
  type ArtistAvailabilitySettings,
  type DefaultStatus,
  type UpdateSettingsInput
} from '../../services/availabilityService'

interface AvailabilitySettingsProps {
  artistId: string
  onSave?: () => void
  className?: string
}

export function AvailabilitySettings({
  artistId,
  onSave,
  className = ''
}: AvailabilitySettingsProps) {
  const [, setSettings] = useState<ArtistAvailabilitySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState<UpdateSettingsInput>({
    default_status: 'available',
    advance_booking_days: 365,
    minimum_notice_hours: 48,
    allow_same_day: false,
    show_calendar_publicly: true,
    auto_decline_conflicts: true,
    buffer_hours_before: 0,
    buffer_hours_after: 0
  })

  // Fetch settings
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true)
      const { data, error } = await getAvailabilitySettings(artistId)

      if (error && !error.message.includes('no rows')) {
        setError('Fehler beim Laden der Einstellungen')
      } else if (data) {
        setSettings(data)
        setFormData({
          default_status: data.default_status,
          advance_booking_days: data.advance_booking_days,
          minimum_notice_hours: data.minimum_notice_hours,
          allow_same_day: data.allow_same_day,
          show_calendar_publicly: data.show_calendar_publicly,
          auto_decline_conflicts: data.auto_decline_conflicts,
          buffer_hours_before: data.buffer_hours_before,
          buffer_hours_after: data.buffer_hours_after
        })
      }

      setLoading(false)
    }

    if (artistId) {
      fetchSettings()
    }
  }, [artistId])

  // Handle form changes
  const handleChange = (field: keyof UpdateSettingsInput, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  // Save settings
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error } = await upsertAvailabilitySettings(artistId, formData)

    if (error) {
      setError('Fehler beim Speichern')
    } else {
      setSuccess(true)
      onSave?.()
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3" />
          <div className="h-10 bg-white/10 rounded" />
          <div className="h-10 bg-white/10 rounded" />
          <div className="h-10 bg-white/10 rounded" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 ${className}`}
    >
      <div className="p-6 border-b border-white/10">
        <h3 className="text-lg font-bold text-white">Verfügbarkeits-Einstellungen</h3>
        <p className="text-sm text-white/50 mt-1">
          Konfiguriere deine Standard-Verfügbarkeit und Buchungsoptionen
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Default Status */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Standard-Status
          </label>
          <select
            value={formData.default_status}
            onChange={e => handleChange('default_status', e.target.value as DefaultStatus)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-purple transition-colors"
          >
            <option value="available">Verfügbar (sofern nicht anders markiert)</option>
            <option value="unavailable">Nicht verfügbar (muss manuell freigeben)</option>
            <option value="request_only">Nur auf Anfrage</option>
          </select>
          <p className="text-xs text-white/40 mt-1">
            Bestimmt den Status für Tage ohne spezifische Einträge
          </p>
        </div>

        {/* Advance Booking Days */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Vorausbuchungszeitraum
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={formData.advance_booking_days}
              onChange={e => handleChange('advance_booking_days', parseInt(e.target.value))}
              min={1}
              max={730}
              className="w-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-purple transition-colors"
            />
            <span className="text-white/50">Tage im Voraus buchbar</span>
          </div>
        </div>

        {/* Minimum Notice */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Mindest-Vorlaufzeit
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={formData.minimum_notice_hours}
              onChange={e => handleChange('minimum_notice_hours', parseInt(e.target.value))}
              min={0}
              max={720}
              className="w-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-purple transition-colors"
            />
            <span className="text-white/50">Stunden Vorlaufzeit</span>
          </div>
        </div>

        {/* Buffer Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Puffer vor Event
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.buffer_hours_before}
                onChange={e => handleChange('buffer_hours_before', parseInt(e.target.value))}
                min={0}
                max={48}
                className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-purple transition-colors"
              />
              <span className="text-white/50 text-sm">Std.</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Puffer nach Event
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.buffer_hours_after}
                onChange={e => handleChange('buffer_hours_after', parseInt(e.target.value))}
                min={0}
                max={48}
                className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-purple transition-colors"
              />
              <span className="text-white/50 text-sm">Std.</span>
            </div>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-4">
          {/* Allow Same Day */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-white/70">Same-Day-Buchungen erlauben</span>
              <p className="text-xs text-white/40">Buchungen für den gleichen Tag zulassen</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('allow_same_day', !formData.allow_same_day)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.allow_same_day ? 'bg-accent-purple' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.allow_same_day ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </label>

          {/* Show Calendar Publicly */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-white/70">Kalender öffentlich anzeigen</span>
              <p className="text-xs text-white/40">Verfügbarkeit auf deinem Profil zeigen</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('show_calendar_publicly', !formData.show_calendar_publicly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.show_calendar_publicly ? 'bg-accent-purple' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.show_calendar_publicly ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </label>

          {/* Auto Decline Conflicts */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-white/70">Konflikte automatisch ablehnen</span>
              <p className="text-xs text-white/40">Anfragen bei Terminkonflikten ablehnen</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('auto_decline_conflicts', !formData.auto_decline_conflicts)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.auto_decline_conflicts ? 'bg-accent-purple' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.auto_decline_conflicts ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </label>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
            Einstellungen gespeichert!
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-accent-purple text-white font-medium rounded-xl hover:bg-accent-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Speichern...' : 'Einstellungen speichern'}
        </button>
      </div>
    </motion.div>
  )
}

export default AvailabilitySettings
