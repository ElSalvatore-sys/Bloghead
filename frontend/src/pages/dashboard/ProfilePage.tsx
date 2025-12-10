import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { type UserRole } from '../../config/navigationConfig'

export function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const userRole = user?.user_metadata?.user_type as UserRole | undefined

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || ''
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const roleDisplayNames: Record<UserRole, string> = {
    fan: 'Community Member',
    artist: 'Künstler',
    service_provider: 'Dienstleister',
    event_organizer: 'Event Organizer',
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Mein Profil</h1>

      {/* Profile Card */}
      <div className="bg-bg-card rounded-xl border border-white/10 p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {avatarInitial}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
            <p className="text-text-muted mb-4">{email}</p>
            <span className="inline-block px-3 py-1 bg-accent-purple/20 text-accent-purple text-sm font-medium rounded-full">
              {userRole ? roleDisplayNames[userRole] : 'Member'}
            </span>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => navigate('/profile/edit')}
            className="px-4 py-2 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
          >
            Profil bearbeiten
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <p className="text-text-muted text-sm mb-1">Mitglied seit</p>
          <p className="text-white text-xl font-semibold">
            {user?.created_at ? new Date(user.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : '-'}
          </p>
        </div>
        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <p className="text-text-muted text-sm mb-1">Verifiziert</p>
          <p className="text-white text-xl font-semibold">
            {user?.email_confirmed_at ? 'Ja' : 'Nein'}
          </p>
        </div>
        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <p className="text-text-muted text-sm mb-1">Status</p>
          <p className="text-green-400 text-xl font-semibold">Aktiv</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-bg-card rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Kontaktinformationen</h3>
        <div className="space-y-4">
          <div>
            <p className="text-text-muted text-sm mb-1">E-Mail</p>
            <p className="text-white">{email}</p>
          </div>
          <div>
            <p className="text-text-muted text-sm mb-1">Telefon</p>
            <p className="text-white">{user?.user_metadata?.phone || 'Nicht angegeben'}</p>
          </div>
          <div>
            <p className="text-text-muted text-sm mb-1">Standort</p>
            <p className="text-white">{user?.user_metadata?.location || 'Nicht angegeben'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
