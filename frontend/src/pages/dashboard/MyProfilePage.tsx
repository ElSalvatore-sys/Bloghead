import { Link } from 'react-router-dom'
import { Edit, MapPin, Star, Calendar, Music, Share2 } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../hooks/useProfile'

export default function MyProfilePage() {
  const { user } = useAuth()
  const { profile, userData, userType, loading } = useProfile()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  // Get display values from either profile or userData
  const displayName = (profile?.kuenstlername as string) ||
                      (profile?.business_name as string) ||
                      (userData?.membername as string) ||
                      user?.user_metadata?.username ||
                      'Dein Name'

  const profileImage = (userData?.profile_image_url as string) || null
  const coverImage = (userData?.cover_image_url as string) || null
  const bio = (profile?.bio as string) || null
  const city = (profile?.stadt as string) || (profile?.city as string) || null
  const genres = (profile?.genre as string[]) || []
  const avgRating = (profile?.star_rating as number) || 0
  const totalBookings = (profile?.total_bookings as number) || 0

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display text-white">Mein Profil</h1>
        <Link
          to="/profile/edit"
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
        >
          <Edit size={18} />
          Bearbeiten
        </Link>
      </div>

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
          </div>

          {/* Name & Type */}
          <div className="mb-6">
            <h2 className="text-2xl font-display text-white mb-1">
              {displayName}
            </h2>
            <p className="text-purple-400 capitalize">{userType?.replace('_', ' ') || 'Member'}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {userType === 'artist' && (
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
                  <Music className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{genres.length}</p>
                  <p className="text-gray-500 text-sm">Genres</p>
                </div>
              </>
            )}
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-white truncate">{city || 'Nicht angegeben'}</p>
              <p className="text-gray-500 text-sm">Standort</p>
            </div>
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

          {/* Share Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all">
            <Share2 size={18} />
            Profil teilen
          </button>
        </div>
      </div>

      {/* Profile Completion Hint */}
      {!bio && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-yellow-400">
            Tipp: Vervollständige dein Profil, um mehr Sichtbarkeit zu bekommen!{' '}
            <Link to="/profile/edit" className="underline hover:text-yellow-300">Jetzt bearbeiten</Link>
          </p>
        </div>
      )}
    </DashboardLayout>
  )
}
