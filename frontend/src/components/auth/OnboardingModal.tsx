import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: () => void
}

type UserType = 'fan' | 'artist' | 'service_provider' | 'event_organizer'

const userTypes = [
  {
    id: 'fan' as UserType,
    icon: '🎵',
    title: 'Fan / Community',
    tagline: 'Entdecke Künstler & unvergessliche Events',
    gradient: 'from-blue-500/20 to-purple-500/20',
    hoverGradient: 'hover:from-blue-500/30 hover:to-purple-500/30',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-400',
  },
  {
    id: 'artist' as UserType,
    icon: '🎤',
    title: 'Künstler',
    tagline: 'Zeig dein Talent und werde gebucht',
    gradient: 'from-purple-500/20 to-pink-500/20',
    hoverGradient: 'hover:from-purple-500/30 hover:to-pink-500/30',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400',
  },
  {
    id: 'service_provider' as UserType,
    icon: '🛠️',
    title: 'Dienstleister',
    tagline: 'Verbinde dich mit Event-Planern',
    gradient: 'from-orange-500/20 to-yellow-500/20',
    hoverGradient: 'hover:from-orange-500/30 hover:to-yellow-500/30',
    borderColor: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-400',
  },
  {
    id: 'event_organizer' as UserType,
    icon: '🎉',
    title: 'Event-Veranstalter',
    tagline: 'Plane perfekte Events mit den richtigen Leuten',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    hoverGradient: 'hover:from-emerald-500/30 hover:to-teal-500/30',
    borderColor: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-400',
  }
]

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { user, refreshUserProfile } = useAuth()
  const [selectedType, setSelectedType] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  // Additional fields based on type
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    artistName: '',
    // Artist-specific fields
    genre: '',
    description: '',
    city: '',
  })

  // Debug logging
  console.log('[OnboardingModal] Render state:', { isOpen, user: user?.email, step, loading })

  if (!isOpen || !user) {
    console.log('[OnboardingModal] Not rendering:', { isOpen, hasUser: !!user })
    return null
  }

  const handleSelectType = (typeId: UserType) => {
    setSelectedType(typeId)
    // Fans can complete immediately, others need more info
    if (typeId === 'fan') {
      handleComplete(typeId)
    } else {
      setStep(2)
    }
  }

  const handleComplete = async (typeId?: UserType) => {
    if (!user) return

    setLoading(true)
    setError(null)
    const finalType = typeId || selectedType

    try {
      // Update user metadata in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          user_type: finalType,
          onboarding_completed: true
        }
      })

      if (updateError) throw updateError

      // Create user record in users table
      const displayName = formData.username || formData.artistName ||
                          user.user_metadata?.full_name ||
                          user.email?.split('@')[0] || 'User'

      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          user_type: finalType,
          membername: displayName.toLowerCase().replace(/\s+/g, '_'),
          vorname: user.user_metadata?.full_name?.split(' ')[0] || displayName,
          nachname: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          telefonnummer: formData.phone || null,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (upsertError) throw upsertError

      console.log('[OnboardingModal] User record updated, creating profile for type:', finalType)

      // Create profile based on type
      if (finalType === 'artist') {
        await supabase.from('artist_profiles').upsert({
          user_id: user.id,
          kuenstlername: formData.artistName || displayName,
          genre: formData.genre || null,
          beschreibung: formData.description || null,
          stadt: formData.city || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      } else if (finalType === 'fan') {
        await supabase.from('fan_profiles').upsert({
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      } else if (finalType === 'service_provider') {
        await supabase.from('service_provider_profiles').upsert({
          user_id: user.id,
          business_name: formData.username || displayName,
          phone: formData.phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      } else if (finalType === 'event_organizer') {
        await supabase.from('event_organizer_profiles').upsert({
          user_id: user.id,
          business_name: formData.username || null,
          phone: formData.phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      }

      console.log('[OnboardingModal] Onboarding complete, refreshing user profile')

      // Refresh the user profile in AuthContext to update needsOnboarding
      await refreshUserProfile()

      onComplete()
    } catch (err) {
      console.error('Onboarding error:', err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const canSubmitStep2 = () => {
    if (!selectedType) return false
    if (selectedType === 'artist') {
      // Artist requires name and genre (description and city are optional)
      return formData.artistName.trim().length > 0 && formData.genre.trim().length > 0
    }
    if (selectedType === 'service_provider' || selectedType === 'event_organizer') {
      return formData.username.trim().length > 0 && formData.phone.trim().length > 0
    }
    return formData.username.trim().length > 0
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-gray-900 to-bg-primary rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="p-6 text-center border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-orange-900/20">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-display text-white mb-2">
            Willkommen bei Bloghead!
          </h2>
          <p className="text-gray-400">
            {step === 1 ? 'Wähle deine Rolle, um loszulegen' : 'Noch ein paar Details...'}
          </p>
          {user.user_metadata?.full_name && (
            <p className="text-sm text-purple-400 mt-2">
              Hallo, {user.user_metadata.full_name}!
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Choose Role */}
        {step === 1 && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userTypes.map((type, index) => (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type.id)}
                  disabled={loading}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className={`
                    relative p-6 rounded-2xl border-2 text-left
                    bg-gradient-to-br ${type.gradient} ${type.hoverGradient}
                    ${type.borderColor} ${type.hoverBorder}
                    hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10
                    transition-all duration-300 group
                    disabled:opacity-50 disabled:cursor-not-allowed
                    animate-fadeInUp
                  `}
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {type.icon}
                  </div>
                  <h3 className="text-xl font-display text-white mb-2">{type.title}</h3>
                  <p className="text-gray-400 text-sm">{type.tagline}</p>
                  <div className="absolute bottom-4 right-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all">
                    →
                  </div>
                </button>
              ))}
            </div>

            {loading && (
              <div className="flex justify-center mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Additional Info (for non-fans) */}
        {step === 2 && selectedType && (
          <div className="p-6">
            <button
              onClick={() => { setStep(1); setSelectedType(null); }}
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Zurück
            </button>

            <div className="space-y-4">
              {/* Artist Fields */}
              {selectedType === 'artist' && (
                <>
                  {/* Artist Name */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Künstlername <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.artistName}
                      onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                      placeholder="Dein Bühnenname"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                      disabled={loading}
                    />
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Genre <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                      disabled={loading}
                    >
                      <option value="" className="bg-gray-900">Genre wählen...</option>
                      <option value="DJ" className="bg-gray-900">DJ</option>
                      <option value="Live Band" className="bg-gray-900">Live Band</option>
                      <option value="Sänger/in" className="bg-gray-900">Sänger/in</option>
                      <option value="Rapper/in" className="bg-gray-900">Rapper/in</option>
                      <option value="Instrumentalist" className="bg-gray-900">Instrumentalist</option>
                      <option value="Produzent" className="bg-gray-900">Produzent</option>
                      <option value="Entertainer" className="bg-gray-900">Entertainer</option>
                      <option value="Sonstiges" className="bg-gray-900">Sonstiges</option>
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Stadt
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="z.B. Wiesbaden, Frankfurt..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                      disabled={loading}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Kurze Beschreibung
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Erzähl uns etwas über dich und deine Musik..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              {/* Username / Business Name */}
              {selectedType !== 'artist' && (
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    {selectedType === 'service_provider' ? 'Firmenname' : 'Name / Firmenname'}
                    <span className="text-red-400"> *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder={selectedType === 'service_provider' ? 'Deine Firma' : 'Dein Name oder Firma'}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Phone (required for service providers and event organizers) */}
              {(selectedType === 'service_provider' || selectedType === 'event_organizer') && (
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Telefon <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+49 123 456789"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                    disabled={loading}
                  />
                </div>
              )}

              <button
                onClick={() => handleComplete()}
                disabled={loading || !canSubmitStep2()}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold
                           hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Wird gespeichert...
                  </>
                ) : (
                  <>
                    Los geht's! 🚀
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer hint */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-gray-500">
            Du kannst deine Rolle später in den Einstellungen ändern
          </p>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-fadeInUp {
          opacity: 0;
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default OnboardingModal
