import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export function SettingsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    bookings: true,
    marketing: false,
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Einstellungen</h1>

      {/* Account Settings */}
      <div className="bg-bg-card rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Kontoinformationen</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-text-muted text-sm mb-2">E-Mail Adresse</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-bg-primary border border-white/10 rounded-lg text-white opacity-60"
            />
            <p className="text-text-muted text-xs mt-1">E-Mail kann nicht geändert werden</p>
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-2">Passwort</label>
            <button className="px-4 py-2 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors">
              Passwort ändern
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-bg-card rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Benachrichtigungen</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">E-Mail Benachrichtigungen</p>
              <p className="text-text-muted text-sm">Erhalte Updates per E-Mail</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
              className="w-5 h-5 rounded bg-bg-primary border-white/20 text-accent-purple focus:ring-accent-purple"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">Push Benachrichtigungen</p>
              <p className="text-text-muted text-sm">Browser Push-Nachrichten</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
              className="w-5 h-5 rounded bg-bg-primary border-white/20 text-accent-purple focus:ring-accent-purple"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">Buchungsbenachrichtigungen</p>
              <p className="text-text-muted text-sm">Updates zu deinen Buchungen</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.bookings}
              onChange={(e) => setNotifications({ ...notifications, bookings: e.target.checked })}
              className="w-5 h-5 rounded bg-bg-primary border-white/20 text-accent-purple focus:ring-accent-purple"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">Marketing E-Mails</p>
              <p className="text-text-muted text-sm">News und Angebote</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.marketing}
              onChange={(e) => setNotifications({ ...notifications, marketing: e.target.checked })}
              className="w-5 h-5 rounded bg-bg-primary border-white/20 text-accent-purple focus:ring-accent-purple"
            />
          </label>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-bg-card rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Privatsphäre</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">Profil öffentlich</p>
              <p className="text-text-muted text-sm">Andere können dein Profil sehen</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded bg-bg-primary border-white/20 text-accent-purple focus:ring-accent-purple"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">Aktivitätsstatus anzeigen</p>
              <p className="text-text-muted text-sm">Zeige wann du online bist</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded bg-bg-primary border-white/20 text-accent-purple focus:ring-accent-purple"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-bg-card rounded-xl border border-accent-red/30 p-6">
        <h2 className="text-lg font-semibold text-accent-red mb-4">Gefahrenzone</h2>
        <p className="text-text-muted text-sm mb-4">
          Das Löschen deines Kontos ist endgültig und kann nicht rückgängig gemacht werden.
        </p>
        <button className="px-4 py-2 bg-accent-red/10 border border-accent-red text-accent-red text-sm font-medium rounded-lg hover:bg-accent-red/20 transition-colors">
          Konto löschen
        </button>
      </div>
    </div>
  )
}
