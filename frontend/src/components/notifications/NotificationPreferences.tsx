import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  getPreferences,
  updatePreferences,
  type NotificationPreferences as Prefs,
  type UpdatePreferencesData,
} from '../../services/notificationService'

// Toggle Switch Component
function Toggle({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${enabled ? 'bg-accent-purple' : 'bg-white/20'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}

// Section Header
function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-accent-purple">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-white/50 mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

// Preference Row
function PreferenceRow({
  label,
  description,
  enabled,
  onChange,
  disabled = false,
}: {
  label: string
  description?: string
  enabled: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex-1 pr-4">
        <p className={`font-medium ${disabled ? 'text-white/40' : 'text-white'}`}>{label}</p>
        {description && (
          <p className={`text-sm mt-0.5 ${disabled ? 'text-white/30' : 'text-white/50'}`}>
            {description}
          </p>
        )}
      </div>
      <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  )
}

// Icons
const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)

const MessageIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const EuroIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M4 10h12M4 14h9" />
    <circle cx="15" cy="12" r="7" />
  </svg>
)

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export function NotificationPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<Prefs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load preferences
  useEffect(() => {
    if (!user) return

    const loadPreferences = async () => {
      setLoading(true)
      const { data, error } = await getPreferences(user.id)
      if (error) {
        setError('Fehler beim Laden der Einstellungen')
      } else {
        setPreferences(data)
      }
      setLoading(false)
    }

    loadPreferences()
  }, [user])

  // Update a single preference
  const handleUpdate = async (key: keyof UpdatePreferencesData, value: boolean | string | null) => {
    if (!user || !preferences) return

    setSaving(true)
    setError(null)

    const { data, error } = await updatePreferences(user.id, { [key]: value })

    if (error) {
      setError('Fehler beim Speichern')
    } else if (data) {
      setPreferences(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }

    setSaving(false)
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-white/50">
        Bitte melde dich an, um deine Benachrichtigungseinstellungen zu verwalten.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 w-48 bg-white/10 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-12 bg-white/5 rounded" />
              <div className="h-12 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="p-6 text-center">
        <p className="text-white/50">
          {error || 'Einstellungen konnten nicht geladen werden.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/80"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with save indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Benachrichtigungen</h2>
          <p className="text-white/50 text-sm mt-1">
            Wähle aus, wie und wann du benachrichtigt werden möchtest
          </p>
        </div>
        {(saving || saved) && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              saved ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'
            }`}
          >
            {saved ? (
              <>
                <CheckIcon />
                Gespeichert
              </>
            ) : (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Speichern...
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Booking Notifications */}
      <section className="bg-white/5 rounded-xl p-5">
        <SectionHeader
          icon={<CalendarIcon />}
          title="Buchungen"
          description="Benachrichtigungen zu deinen Buchungen"
        />
        <div className="mt-4">
          <PreferenceRow
            label="Neue Buchungsanfragen"
            description="Werde benachrichtigt wenn jemand dich buchen möchte"
            enabled={preferences.booking_requests}
            onChange={(value) => handleUpdate('booking_requests', value)}
          />
          <PreferenceRow
            label="Buchungs-Updates"
            description="Status-Änderungen wie Bestätigung oder Absage"
            enabled={preferences.booking_updates}
            onChange={(value) => handleUpdate('booking_updates', value)}
          />
          <PreferenceRow
            label="Erinnerungen"
            description="24 Stunden und 1 Stunde vor dem Event"
            enabled={preferences.booking_reminders}
            onChange={(value) => handleUpdate('booking_reminders', value)}
          />
        </div>
      </section>

      {/* Message Notifications */}
      <section className="bg-white/5 rounded-xl p-5">
        <SectionHeader
          icon={<MessageIcon />}
          title="Nachrichten"
          description="Benachrichtigungen zu neuen Nachrichten"
        />
        <div className="mt-4">
          <PreferenceRow
            label="Neue Nachrichten"
            description="Werde benachrichtigt wenn du eine neue Nachricht erhältst"
            enabled={preferences.new_messages}
            onChange={(value) => handleUpdate('new_messages', value)}
          />
        </div>
      </section>

      {/* Social Notifications */}
      <section className="bg-white/5 rounded-xl p-5">
        <SectionHeader
          icon={<UsersIcon />}
          title="Soziales"
          description="Follower und Bewertungen"
        />
        <div className="mt-4">
          <PreferenceRow
            label="Neue Follower"
            description="Werde benachrichtigt wenn dir jemand folgt"
            enabled={preferences.new_followers}
            onChange={(value) => handleUpdate('new_followers', value)}
          />
          <PreferenceRow
            label="Neue Bewertungen"
            description="Werde benachrichtigt wenn jemand eine Bewertung abgibt"
            enabled={preferences.new_reviews}
            onChange={(value) => handleUpdate('new_reviews', value)}
          />
        </div>
      </section>

      {/* Payment Notifications */}
      <section className="bg-white/5 rounded-xl p-5">
        <SectionHeader
          icon={<EuroIcon />}
          title="Zahlungen"
          description="Benachrichtigungen zu Zahlungen und Auszahlungen"
        />
        <div className="mt-4">
          <PreferenceRow
            label="Zahlungs-Updates"
            description="Eingegangene Zahlungen und Auszahlungen"
            enabled={preferences.payment_updates}
            onChange={(value) => handleUpdate('payment_updates', value)}
          />
        </div>
      </section>

      {/* Notification Channels */}
      <section className="bg-white/5 rounded-xl p-5">
        <SectionHeader
          icon={<BellIcon />}
          title="Benachrichtigungskanäle"
          description="Wie möchtest du benachrichtigt werden?"
        />
        <div className="mt-4">
          <PreferenceRow
            label="E-Mail"
            description="Benachrichtigungen per E-Mail erhalten"
            enabled={preferences.email_enabled}
            onChange={(value) => handleUpdate('email_enabled', value)}
          />
          <PreferenceRow
            label="Push-Benachrichtigungen"
            description="Benachrichtigungen auf deinem Gerät erhalten"
            enabled={preferences.push_enabled}
            onChange={(value) => handleUpdate('push_enabled', value)}
          />
          <PreferenceRow
            label="SMS"
            description="Wichtige Benachrichtigungen per SMS erhalten"
            enabled={preferences.sms_enabled}
            onChange={(value) => handleUpdate('sms_enabled', value)}
          />
        </div>
      </section>

      {/* Marketing */}
      <section className="bg-white/5 rounded-xl p-5">
        <SectionHeader
          icon={<MailIcon />}
          title="Marketing"
          description="Newsletter und Angebote"
        />
        <div className="mt-4">
          <PreferenceRow
            label="Marketing E-Mails"
            description="Neuigkeiten, Tipps und exklusive Angebote"
            enabled={preferences.marketing_emails}
            onChange={(value) => handleUpdate('marketing_emails', value)}
          />
        </div>
      </section>

      {/* Quiet Hours */}
      <section className="bg-white/5 rounded-xl p-5">
        <SectionHeader
          icon={<MoonIcon />}
          title="Ruhezeiten"
          description="Keine Benachrichtigungen während dieser Zeit"
        />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Von</label>
            <input
              type="time"
              value={preferences.quiet_hours_start || ''}
              onChange={(e) =>
                handleUpdate('quiet_hours_start', e.target.value || null)
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Bis</label>
            <input
              type="time"
              value={preferences.quiet_hours_end || ''}
              onChange={(e) =>
                handleUpdate('quiet_hours_end', e.target.value || null)
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
            />
          </div>
        </div>
        <p className="text-xs text-white/40 mt-3">
          Während der Ruhezeiten werden Push-Benachrichtigungen pausiert. E-Mails werden
          weiterhin zugestellt.
        </p>
      </section>
    </div>
  )
}
