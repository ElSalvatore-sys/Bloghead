import { useNavigate } from 'react-router-dom'
import { useProfile } from '../../hooks/useProfile'
import { SocialLinksDisplay } from '../../components/ui/SocialLinksDisplay'
import { type UserRole } from '../../config/navigationConfig'

// Icons
function LocationIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function MailIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function VerifiedIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function MusicIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

function EditIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { userData, profile, userType, loading, error } = useProfile()

  const roleDisplayNames: Record<UserRole, string> = {
    fan: 'Community Member',
    artist: 'Künstler',
    service_provider: 'Dienstleister',
    event_organizer: 'Event Organizer',
  }

  // Loading state
  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Mein Profil</h1>
        <div className="animate-pulse">
          <div className="bg-bg-card rounded-xl border border-white/10 p-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-8 bg-white/10 rounded w-1/3 mb-2" />
                <div className="h-4 bg-white/10 rounded w-1/4 mb-4" />
                <div className="h-6 bg-white/10 rounded w-24" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-bg-card rounded-xl border border-white/10 p-6">
                <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                <div className="h-6 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Mein Profil</h1>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  // Extract data with fallbacks
  const displayName = userData?.vorname && userData?.nachname
    ? `${userData.vorname} ${userData.nachname}`
    : userData?.vorname as string || userData?.nachname as string || userData?.membername as string || 'Benutzer'

  const email = userData?.email as string || ''
  const phone = userData?.phone as string || profile?.phone as string || null
  const city = userData?.city as string || profile?.city as string || null
  const bio = profile?.description as string || profile?.bio as string || userData?.bio as string || null
  const memberSince = userData?.created_at as string || null
  const isVerified = userData?.is_verified as boolean || profile?.is_verified as boolean || false

  // Profile image - check multiple possible sources
  const profileImageUrl = (
    userData?.profile_image_url ||
    userData?.avatar_url ||
    profile?.profile_image_url ||
    profile?.avatar_url
  ) as string | null

  // Cover image
  const coverImageUrl = (
    userData?.cover_image_url ||
    profile?.cover_image_url
  ) as string | null

  // Social media
  const socialMedia = profile?.social_media as { platform: string; url: string }[] | null
  const instagramProfile = profile?.instagram_profile as string | null
  const soundcloudUrl = profile?.soundcloud_url as string | null
  const websiteUrl = profile?.website_url as string | null

  // Artist-specific fields
  const genre = profile?.genre as string | null
  const artistName = profile?.artist_name as string || profile?.business_name as string || null
  const priceMin = profile?.min_price as number | null
  const priceMax = profile?.max_price as number | null

  // Get avatar initial as fallback
  const avatarInitial = displayName.charAt(0).toUpperCase()

  // Format role for display
  const displayRole = userType ? roleDisplayNames[userType as UserRole] || userType : 'Member'

  // Format price
  const priceDisplay = (() => {
    if (priceMin && priceMax) {
      return `€${priceMin} - €${priceMax}`
    } else if (priceMin) {
      return `ab €${priceMin}`
    } else if (priceMax) {
      return `bis €${priceMax}`
    }
    return null
  })()

  return (
    <div>
      {/* Cover Image */}
      {coverImageUrl && (
        <div className="relative h-48 md:h-64 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-xl">
          <img
            src={coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 to-transparent" />
        </div>
      )}

      <h1 className="text-3xl font-bold text-white mb-8">Mein Profil</h1>

      {/* Profile Card */}
      <div className="bg-bg-card rounded-xl border border-white/10 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={displayName}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-accent-purple/30"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center text-white font-bold text-3xl md:text-4xl border-4 border-accent-purple/30">
                {avatarInitial}
              </div>
            )}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-bg-card">
                <VerifiedIcon className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name and Artist Name */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 truncate">
              {artistName || displayName}
            </h2>
            {artistName && artistName !== displayName && (
              <p className="text-white/60 mb-2">{displayName}</p>
            )}

            {/* Email */}
            {email && (
              <p className="text-text-muted mb-3 truncate">{email}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 bg-accent-purple/20 text-accent-purple text-sm font-medium rounded-full">
                {displayRole}
              </span>
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full">
                  <VerifiedIcon className="w-4 h-4" />
                  Verifiziert
                </span>
              )}
              {genre && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-orange/20 text-accent-orange text-sm font-medium rounded-full">
                  <MusicIcon className="w-4 h-4" />
                  {genre}
                </span>
              )}
            </div>

            {/* Location */}
            {city && (
              <div className="flex items-center gap-2 text-white/60">
                <LocationIcon className="w-4 h-4" />
                <span>{city}</span>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <button
            onClick={() => navigate('/profile/edit')}
            className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
          >
            <EditIcon className="w-4 h-4" />
            Profil bearbeiten
          </button>
        </div>

        {/* Bio */}
        {bio && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wide mb-2">Über mich</h3>
            <p className="text-white/80 leading-relaxed whitespace-pre-line">{bio}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-5 h-5 text-accent-purple" />
            <p className="text-text-muted text-sm">Mitglied seit</p>
          </div>
          <p className="text-white text-xl font-semibold">
            {memberSince
              ? new Date(memberSince).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
              : '-'
            }
          </p>
        </div>
        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <VerifiedIcon className="w-5 h-5 text-green-400" />
            <p className="text-text-muted text-sm">Status</p>
          </div>
          <p className={`text-xl font-semibold ${isVerified ? 'text-green-400' : 'text-white/60'}`}>
            {isVerified ? 'Verifiziert' : 'Nicht verifiziert'}
          </p>
        </div>
        {priceDisplay ? (
          <div className="bg-bg-card rounded-xl border border-white/10 p-6">
            <p className="text-text-muted text-sm mb-2">Preis</p>
            <p className="text-accent-purple text-xl font-semibold">{priceDisplay}</p>
          </div>
        ) : (
          <div className="bg-bg-card rounded-xl border border-white/10 p-6">
            <p className="text-text-muted text-sm mb-2">Kontotyp</p>
            <p className="text-white text-xl font-semibold">{displayRole}</p>
          </div>
        )}
      </div>

      {/* Contact & Social Media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Contact Info */}
        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Kontaktinformationen</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MailIcon className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-text-muted text-sm">E-Mail</p>
                <p className="text-white">{email || 'Nicht angegeben'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-text-muted text-sm">Telefon</p>
                <p className="text-white">{phone || 'Nicht angegeben'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LocationIcon className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-text-muted text-sm">Standort</p>
                <p className="text-white">{city || 'Nicht angegeben'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Social Media</h3>
          {(socialMedia?.length || instagramProfile || soundcloudUrl || websiteUrl) ? (
            <SocialLinksDisplay
              socialMedia={socialMedia}
              instagramProfile={instagramProfile}
              soundcloudUrl={soundcloudUrl}
              websiteUrl={websiteUrl}
              size="lg"
              showLabels
              className="flex-col gap-3"
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-white/40 mb-4">Keine Social Media Links hinterlegt</p>
              <button
                onClick={() => navigate('/profile/edit')}
                className="text-accent-purple hover:text-accent-purple/80 text-sm font-medium transition-colors"
              >
                Jetzt hinzufügen →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Additional Profile Info (role-specific) */}
      {profile && Object.keys(profile).length > 0 && (() => {
        const experienceYears = profile.experience_years as number | undefined
        const equipment = profile.equipment as string | undefined
        const serviceCategory = profile.service_category as { name_de?: string } | string | undefined
        const companyName = profile.company_name as string | undefined
        const availability = profile.availability as string | undefined
        const languages = profile.languages as string[] | string | undefined

        const hasAdditionalInfo = experienceYears || equipment || serviceCategory || companyName || availability || languages

        if (!hasAdditionalInfo) return null

        return (
          <div className="bg-bg-card rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Weitere Informationen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experienceYears && (
                <div>
                  <p className="text-text-muted text-sm mb-1">Erfahrung</p>
                  <p className="text-white">{experienceYears} Jahre</p>
                </div>
              )}
              {equipment && (
                <div>
                  <p className="text-text-muted text-sm mb-1">Equipment</p>
                  <p className="text-white">{equipment}</p>
                </div>
              )}
              {serviceCategory && (
                <div>
                  <p className="text-text-muted text-sm mb-1">Kategorie</p>
                  <p className="text-white">
                    {typeof serviceCategory === 'object' ? serviceCategory.name_de : serviceCategory}
                  </p>
                </div>
              )}
              {companyName && (
                <div>
                  <p className="text-text-muted text-sm mb-1">Unternehmen</p>
                  <p className="text-white">{companyName}</p>
                </div>
              )}
              {availability && (
                <div>
                  <p className="text-text-muted text-sm mb-1">Verfügbarkeit</p>
                  <p className="text-white">{availability}</p>
                </div>
              )}
              {languages && (
                <div>
                  <p className="text-text-muted text-sm mb-1">Sprachen</p>
                  <p className="text-white">
                    {Array.isArray(languages) ? languages.join(', ') : languages}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
