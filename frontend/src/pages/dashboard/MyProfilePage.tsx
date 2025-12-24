import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Edit,
  MapPin,
  Star,
  Calendar,
  Music,
  Share2,
  ExternalLink,
  Users,
  Heart,
  BadgeCheck,
  Instagram,
  Globe,
  Headphones,
  Play,
  Briefcase,
  PartyPopper,
  Clock
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import { ProfilePageSkeleton } from '../../components/ui/DashboardSkeletons'

// Calculate profile completeness percentage
function calculateCompleteness(
  userData: Record<string, unknown> | null,
  profile: Record<string, unknown> | null,
  userType: string | null
): { percentage: number; missing: string[] } {
  const missing: string[] = []
  let score = 0
  const maxScore = 100

  // Bio: 20%
  if (profile?.bio) {
    score += 20
  } else {
    missing.push('Bio hinzufügen')
  }

  // Profile image: 20%
  if (userData?.profile_image_url) {
    score += 20
  } else {
    missing.push('Profilbild hochladen')
  }

  // Cover image: 10%
  if (userData?.cover_image_url) {
    score += 10
  } else {
    missing.push('Titelbild hinzufügen')
  }

  if (userType === 'artist') {
    // Genres: 15%
    const genres = profile?.genre as string[] | undefined
    if (genres && genres.length > 0) {
      score += 15
    } else {
      missing.push('Genres auswählen')
    }

    // Prices: 15%
    if (profile?.preis_minimum || profile?.preis_pro_veranstaltung) {
      score += 15
    } else {
      missing.push('Preise festlegen')
    }

    // Social links: 10%
    if (profile?.instagram_profile || profile?.website_url || profile?.soundcloud_url) {
      score += 10
    } else {
      missing.push('Social Media verknüpfen')
    }

    // Audio/Video: 10%
    const audioUrls = profile?.audio_urls as string[] | undefined
    const videoUrls = profile?.video_urls as string[] | undefined
    if ((audioUrls && audioUrls.length > 0) || (videoUrls && videoUrls.length > 0) || profile?.intro_video_url) {
      score += 10
    } else {
      missing.push('Audio/Video hinzufügen')
    }
  } else if (userType === 'service_provider') {
    // Service category: 15%
    if (profile?.service_category_id) {
      score += 15
    } else {
      missing.push('Kategorie auswählen')
    }

    // Prices: 15%
    if (profile?.price_min || profile?.price_max) {
      score += 15
    } else {
      missing.push('Preise festlegen')
    }

    // Social/Website: 10%
    if (profile?.website_url || profile?.instagram_profile) {
      score += 10
    } else {
      missing.push('Website/Social Media hinzufügen')
    }

    // Portfolio: 10%
    const portfolioImages = profile?.portfolio_images as string[] | undefined
    if (portfolioImages && portfolioImages.length > 0) {
      score += 10
    } else {
      missing.push('Portfolio hochladen')
    }
  } else if (userType === 'event_organizer' || userType === 'veranstalter') {
    // Company info: 25%
    if (profile?.company_name || profile?.organization_name) {
      score += 25
    } else {
      missing.push('Firmenname hinzufügen')
    }

    // Contact: 25%
    if (userData?.telefonnummer || profile?.contact_phone) {
      score += 25
    } else {
      missing.push('Kontaktdaten ergänzen')
    }
  } else {
    // Fan: simpler requirements
    // Location: 25%
    if (userData?.city || profile?.stadt) {
      score += 25
    } else {
      missing.push('Standort hinzufügen')
    }

    // Interests: 25%
    const interests = profile?.interests as string[] | undefined
    if (interests && interests.length > 0) {
      score += 25
    } else {
      missing.push('Interessen auswählen')
    }
  }

  return { percentage: Math.min(score, maxScore), missing }
}

// Format date to German month/year
function formatMemberSince(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
}

export default function MyProfilePage() {
  const { user } = useAuth()
  const { profile, userData, userType, loading } = useProfile()

  // Calculate profile completeness
  const { percentage: completeness, missing: missingFields } = useMemo(
    () => calculateCompleteness(userData, profile, userType),
    [userData, profile, userType]
  )

  if (loading) {
    return (
      <DashboardLayout>
        <ProfilePageSkeleton />
      </DashboardLayout>
    )
  }

  // Get display values from either profile or userData
  const displayName = (profile?.kuenstlername as string) ||
                      (profile?.business_name as string) ||
                      (profile?.company_name as string) ||
                      (userData?.membername as string) ||
                      user?.user_metadata?.username ||
                      'Dein Name'

  const profileImage = (userData?.profile_image_url as string) || null
  const coverImage = (userData?.cover_image_url as string) || null
  const bio = (profile?.bio as string) || null
  const city = (profile?.stadt as string) || (profile?.city as string) || null
  const genres = (profile?.genre as string[]) || []
  const avgRating = (profile?.star_rating as number) || 0
  const totalRatings = (profile?.total_ratings as number) || 0
  const totalBookings = (profile?.total_bookings as number) || 0
  const totalFollowers = (profile?.total_followers as number) || 0
  const isVerified = (profile?.is_verified as boolean) || (userData?.is_verified as boolean) || false
  const memberSince = formatMemberSince((userData?.created_at as string) || (profile?.created_at as string))

  // Social links
  const instagramProfile = (profile?.instagram_profile as string) || null
  const websiteUrl = (profile?.website_url as string) || null
  const soundcloudUrl = (profile?.soundcloud_url as string) || null

  // Media
  const audioUrls = (profile?.audio_urls as string[]) || []
  const videoUrls = (profile?.video_urls as string[]) || []
  const introVideoUrl = (profile?.intro_video_url as string) || null

  // Service provider specific
  const serviceCategory = (profile?.category_name as string) || (profile?.service_type as string) || null

  // Event organizer specific
  const eventsCreated = (profile?.events_created as number) || 0

  // Fan specific
  const favoritesCount = (profile?.favorites_count as number) || 0
  const ratingsGiven = (profile?.ratings_given as number) || 0

  // Get profile ID for public link
  const profileId = (profile?.id as string) || null

  // User type display labels
  const userTypeLabels: Record<string, string> = {
    artist: 'Künstler',
    service_provider: 'Dienstleister',
    event_organizer: 'Veranstalter',
    veranstalter: 'Veranstalter',
    fan: 'Fan',
  }

  // Get public profile path based on user type
  const getPublicProfilePath = () => {
    if (!profileId) return null
    if (userType === 'artist') return `/artists/${profileId}`
    if (userType === 'service_provider') return `/services/${profileId}`
    if (userType === 'event_organizer' || userType === 'veranstalter') return `/organizers/${profileId}`
    return null
  }

  const publicProfilePath = getPublicProfilePath()

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display text-white">Mein Profil</h1>
        <div className="flex items-center gap-2">
          {publicProfilePath && (
            <Link
              to={publicProfilePath}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
            >
              <ExternalLink size={18} />
              <span className="hidden sm:inline">Öffentlich ansehen</span>
            </Link>
          )}
          <Link
            to="/profile/edit"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
          >
            <Edit size={18} />
            <span className="hidden sm:inline">Bearbeiten</span>
          </Link>
        </div>
      </div>

      {/* Profile Completeness Bar */}
      {completeness < 100 && (
        <div className="mb-6 p-4 bg-bg-secondary rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Profil-Vollständigkeit</span>
            <span className={`font-bold ${completeness >= 80 ? 'text-green-400' : completeness >= 50 ? 'text-yellow-400' : 'text-orange-400'}`}>
              {completeness}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-yellow-500' : 'bg-gradient-to-r from-purple-500 to-orange-500'
              }`}
              style={{ width: `${completeness}%` }}
            />
          </div>
          {missingFields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {missingFields.slice(0, 3).map((field) => (
                <span key={field} className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-full">
                  {field}
                </span>
              ))}
              {missingFields.length > 3 && (
                <span className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-full">
                  +{missingFields.length - 3} mehr
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-bg-secondary rounded-2xl border border-white/10 overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-br from-purple-600/30 to-orange-600/30 relative">
          {coverImage && (
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-bg-secondary bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-4xl text-white font-bold overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                displayName[0]?.toUpperCase() || '?'
              )}
            </div>
            {isVerified && (
              <div className="absolute bottom-2 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-bg-secondary">
                <BadgeCheck size={18} className="text-white" />
              </div>
            )}
          </div>

          {/* Name & Type */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-display text-white">
                {displayName}
              </h2>
              {isVerified && (
                <BadgeCheck size={24} className="text-blue-500" />
              )}
            </div>
            <p className="text-purple-400">{userTypeLabels[userType || ''] || 'Member'}</p>
            {memberSince && (
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <Clock size={14} />
                Mitglied seit {memberSince}
              </p>
            )}
          </div>

          {/* Quick Stats - Dynamic based on user type */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {userType === 'artist' && (
              <>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{avgRating.toFixed(1)}</p>
                  <p className="text-gray-500 text-sm">
                    Bewertung {totalRatings > 0 && <span className="text-xs">({totalRatings})</span>}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{totalBookings}</p>
                  <p className="text-gray-500 text-sm">Buchungen</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{totalFollowers}</p>
                  <p className="text-gray-500 text-sm">Follower</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Music className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{genres.length}</p>
                  <p className="text-gray-500 text-sm">Genres</p>
                </div>
              </>
            )}

            {userType === 'service_provider' && (
              <>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{avgRating.toFixed(1)}</p>
                  <p className="text-gray-500 text-sm">Bewertung</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{totalBookings}</p>
                  <p className="text-gray-500 text-sm">Buchungen</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Briefcase className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white truncate">{serviceCategory || '-'}</p>
                  <p className="text-gray-500 text-sm">Kategorie</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white truncate">{city || '-'}</p>
                  <p className="text-gray-500 text-sm">Standort</p>
                </div>
              </>
            )}

            {(userType === 'event_organizer' || userType === 'veranstalter') && (
              <>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <PartyPopper className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{eventsCreated}</p>
                  <p className="text-gray-500 text-sm">Events erstellt</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{totalBookings}</p>
                  <p className="text-gray-500 text-sm">Buchungen</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white truncate">{city || '-'}</p>
                  <p className="text-gray-500 text-sm">Standort</p>
                </div>
              </>
            )}

            {userType === 'fan' && (
              <>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{favoritesCount}</p>
                  <p className="text-gray-500 text-sm">Favoriten</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{ratingsGiven}</p>
                  <p className="text-gray-500 text-sm">Bewertungen</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white truncate">{city || '-'}</p>
                  <p className="text-gray-500 text-sm">Standort</p>
                </div>
              </>
            )}

            {/* Location for artists (they have 4 stats, so this goes to a new row on mobile) */}
            {userType === 'artist' && (
              <div className="bg-white/5 rounded-xl p-4 text-center col-span-2 md:col-span-4 lg:col-span-1">
                <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-lg font-bold text-white truncate">{city || 'Nicht angegeben'}</p>
                <p className="text-gray-500 text-sm">Standort</p>
              </div>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Über mich</h3>
              <p className="text-gray-400">{bio}</p>
            </div>
          )}

          {/* Genres (for artists) */}
          {userType === 'artist' && genres.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((g: string) => (
                  <span key={g} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Links */}
          {(instagramProfile || websiteUrl || soundcloudUrl) && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Social Media</h3>
              <div className="flex flex-wrap gap-3">
                {instagramProfile && (
                  <a
                    href={`https://instagram.com/${instagramProfile.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 rounded-xl text-white transition-all"
                  >
                    <Instagram size={18} />
                    <span>@{instagramProfile.replace('@', '')}</span>
                  </a>
                )}
                {websiteUrl && (
                  <a
                    href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                  >
                    <Globe size={18} />
                    <span>Website</span>
                  </a>
                )}
                {soundcloudUrl && (
                  <a
                    href={soundcloudUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-xl text-orange-400 transition-all"
                  >
                    <Headphones size={18} />
                    <span>SoundCloud</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Audio/Video Preview (Artists only) */}
          {userType === 'artist' && (audioUrls.length > 0 || videoUrls.length > 0 || introVideoUrl) && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Medien</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Audio Preview */}
                {audioUrls.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Headphones size={20} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Audio</p>
                        <p className="text-gray-500 text-sm">{audioUrls.length} Track{audioUrls.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <audio
                      src={audioUrls[0]}
                      controls
                      className="w-full h-10 rounded-lg"
                      style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                    />
                  </div>
                )}

                {/* Video Preview */}
                {(videoUrls.length > 0 || introVideoUrl) && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Play size={20} className="text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Video</p>
                        <p className="text-gray-500 text-sm">
                          {introVideoUrl ? 'Intro Video' : `${videoUrls.length} Video${videoUrls.length > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                    <div className="aspect-video bg-black/50 rounded-lg overflow-hidden">
                      <video
                        src={introVideoUrl || videoUrls[0]}
                        controls
                        className="w-full h-full object-cover"
                        poster={coverImage || undefined}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: displayName,
                      text: `Schau dir ${displayName} auf Bloghead an!`,
                      url: publicProfilePath ? window.location.origin + publicProfilePath : window.location.href,
                    })
                  } catch {
                    // User cancelled
                  }
                } else {
                  await navigator.clipboard.writeText(
                    publicProfilePath ? window.location.origin + publicProfilePath : window.location.href
                  )
                  alert('Link kopiert!')
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              <Share2 size={18} />
              Profil teilen
            </button>
          </div>
        </div>
      </div>

      {/* Profile Completion Hint (if very incomplete) */}
      {completeness < 50 && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-yellow-400">
            <strong>Tipp:</strong> Ein vollständiges Profil erhöht deine Sichtbarkeit!{' '}
            <Link to="/profile/edit" className="underline hover:text-yellow-300">
              Jetzt vervollständigen
            </Link>
          </p>
        </div>
      )}

      {/* 100% Complete Celebration */}
      {completeness === 100 && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <p className="text-green-400 flex items-center gap-2">
            <BadgeCheck size={20} />
            <strong>Perfekt!</strong> Dein Profil ist vollständig. Du bist jetzt optimal sichtbar!
          </p>
        </div>
      )}
    </DashboardLayout>
  )
}
