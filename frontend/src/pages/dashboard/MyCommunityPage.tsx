import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import {
  getFollowers,
  getFollowing,
  getFavorites,
  getCommunityStats,
  unfollowArtist,
  removeFavorite,
  updateFollowSettings,
  searchFollowers,
  searchFollowing,
  searchFavorites,
  FOLLOWER_TYPE_CONFIG,
  formatJoinDate,
  type Follower,
  type Favorite,
  type CommunityStats
} from '../../services/communityService'
import { CommunityPageSkeleton } from '../../components/ui/DashboardSkeletons'

type TabType = 'followers' | 'following' | 'favorites'
type SortOption = 'newest' | 'oldest' | 'name'

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color,
  index
}: {
  label: string
  value: number
  icon: string
  color: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/5 rounded-xl p-4 border border-white/10"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

// User Card Component for Followers
function FollowerCard({
  follower,
  onUpdateSettings,
  isArtistView,
  index
}: {
  follower: Follower
  onUpdateSettings: (settings: { notifyNewEvents?: boolean; notifyAvailability?: boolean }) => void
  isArtistView: boolean
  index: number
}) {
  const [showSettings, setShowSettings] = useState(false)
  const user = follower.follower
  const typeConfig = FOLLOWER_TYPE_CONFIG[follower.follower_type]

  if (!user) return null

  const displayName = user.membername || `${user.vorname || ''} ${user.nachname || ''}`.trim() || 'Unbekannt'
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.profile_image_url ? (
            <img
              src={user.profile_image_url}
              alt={displayName}
              className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-medium truncate">{displayName}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.bgColor} ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Folgt seit {formatJoinDate(follower.created_at)}
          </p>

          {/* Notification badges */}
          <div className="flex gap-2 mt-2">
            {follower.notify_new_events && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                Events
              </span>
            )}
            {follower.notify_availability && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                Verfügbarkeit
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {isArtistView && (
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Einstellungen"
            >
              ⚙️
            </button>
          </div>
        )}
      </div>

      {/* Settings Panel (for artist view) */}
      {showSettings && isArtistView && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400 mb-2">Benachrichtigungen für diesen Follower:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onUpdateSettings({ notifyNewEvents: !follower.notify_new_events })}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                follower.notify_new_events
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Events {follower.notify_new_events ? '✓' : '○'}
            </button>
            <button
              onClick={() => onUpdateSettings({ notifyAvailability: !follower.notify_availability })}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                follower.notify_availability
                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Verfügbarkeit {follower.notify_availability ? '✓' : '○'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Artist Card Component for Following/Favorites
function ArtistCard({
  artist,
  onRemove,
  notes,
  isFavorite,
  index
}: {
  artist: {
    id: string
    künstlername: string | null
    profilbild_url: string | null
    genre: string[] | null
    ort: string | null
  }
  onRemove: () => void
  notes?: string | null
  isFavorite?: boolean
  index: number
}) {
  const displayName = artist.künstlername || 'Unbekannter Künstler'
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          {artist.profilbild_url ? (
            <img
              src={artist.profilbild_url}
              alt={displayName}
              className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
          )}
          {isFavorite && (
            <span className="absolute -top-1 -right-1 text-lg">⭐</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate mb-1">{displayName}</h3>

          {artist.ort && (
            <p className="text-sm text-gray-400 mb-2">
              📍 {artist.ort}
            </p>
          )}

          {/* Genre tags */}
          {artist.genre && artist.genre.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {artist.genre.slice(0, 3).map((g, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400"
                >
                  {g}
                </span>
              ))}
              {artist.genre.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                  +{artist.genre.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Notes for favorites */}
          {notes && (
            <p className="text-sm text-gray-500 mt-2 italic">
              "{notes}"
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex gap-2">
          <a
            href={`/artists/${artist.id}`}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Profil ansehen"
          >
            👁️
          </a>
          <button
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title={isFavorite ? 'Aus Favoriten entfernen' : 'Entfolgen'}
          >
            {isFavorite ? '💔' : '✕'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Empty State Component
function EmptyState({ type }: { type: TabType }) {
  const config = {
    followers: {
      icon: '👥',
      title: 'Noch keine Follower',
      description: 'Sobald Fans und Veranstalter dir folgen, erscheinen sie hier.'
    },
    following: {
      icon: '🎵',
      title: 'Du folgst niemandem',
      description: 'Entdecke Künstler und folge ihnen, um Updates zu erhalten.'
    },
    favorites: {
      icon: '⭐',
      title: 'Keine Favoriten',
      description: 'Speichere deine Lieblingskünstler als Favoriten für schnellen Zugriff.'
    }
  }

  const { icon, title, description } = config[type]

  return (
    <div className="text-center py-12">
      <span className="text-5xl mb-4 block">{icon}</span>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md mx-auto">{description}</p>
      {type !== 'followers' && (
        <a
          href="/artists"
          className="inline-block mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          Künstler entdecken
        </a>
      )}
    </div>
  )
}

// Mock Data for Demo
function generateMockData(): {
  followers: Follower[]
  following: Follower[]
  favorites: Favorite[]
} {
  const mockFollowers: Follower[] = [
    {
      id: '1',
      follower_id: 'user1',
      artist_id: 'artist1',
      follower_type: 'fan',
      notify_new_events: true,
      notify_availability: true,
      created_at: '2024-11-15T10:00:00Z',
      follower: {
        id: 'user1',
        membername: 'MusicLover92',
        vorname: 'Max',
        nachname: 'Müller',
        profile_image_url: null,
        user_type: 'community'
      }
    },
    {
      id: '2',
      follower_id: 'user2',
      artist_id: 'artist1',
      follower_type: 'veranstalter',
      notify_new_events: true,
      notify_availability: false,
      created_at: '2024-10-20T14:30:00Z',
      follower: {
        id: 'user2',
        membername: 'ClubNightWI',
        vorname: 'Lisa',
        nachname: 'Schmidt',
        profile_image_url: null,
        user_type: 'veranstalter'
      }
    },
    {
      id: '3',
      follower_id: 'user3',
      artist_id: 'artist1',
      follower_type: 'fan',
      notify_new_events: false,
      notify_availability: true,
      created_at: '2024-09-05T08:15:00Z',
      follower: {
        id: 'user3',
        membername: 'DJFanatic',
        vorname: 'Anna',
        nachname: 'Weber',
        profile_image_url: null,
        user_type: 'community'
      }
    }
  ]

  const mockFollowing: Follower[] = [
    {
      id: '4',
      follower_id: 'currentUser',
      artist_id: 'artist2',
      follower_type: 'fan',
      notify_new_events: true,
      notify_availability: true,
      created_at: '2024-11-01T12:00:00Z',
      artist: {
        id: 'artist2',
        künstlername: 'DJ Soundwave',
        profilbild_url: null,
        genre: ['House', 'Techno', 'Deep House'],
        ort: 'Frankfurt'
      }
    },
    {
      id: '5',
      follower_id: 'currentUser',
      artist_id: 'artist3',
      follower_type: 'fan',
      notify_new_events: true,
      notify_availability: false,
      created_at: '2024-10-15T09:30:00Z',
      artist: {
        id: 'artist3',
        künstlername: 'Luna Beats',
        profilbild_url: null,
        genre: ['Minimal', 'Melodic Techno'],
        ort: 'Berlin'
      }
    }
  ]

  const mockFavorites: Favorite[] = [
    {
      id: '6',
      user_id: 'currentUser',
      artist_id: 'artist4',
      notes: 'Perfekt für Hochzeiten!',
      created_at: '2024-11-10T16:00:00Z',
      artist: {
        id: 'artist4',
        künstlername: 'The Groove Masters',
        profilbild_url: null,
        genre: ['Funk', 'Soul', 'R&B'],
        ort: 'Wiesbaden',
        user_id: 'artistUser4'
      }
    },
    {
      id: '7',
      user_id: 'currentUser',
      artist_id: 'artist5',
      notes: null,
      created_at: '2024-09-25T11:45:00Z',
      artist: {
        id: 'artist5',
        künstlername: 'Electronic Dreams',
        profilbild_url: null,
        genre: ['Trance', 'Progressive'],
        ort: 'Mainz',
        user_id: 'artistUser5'
      }
    }
  ]

  return { followers: mockFollowers, following: mockFollowing, favorites: mockFavorites }
}

export default function MyCommunityPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('followers')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [isLoading, setIsLoading] = useState(true)

  const [followers, setFollowers] = useState<Follower[]>([])
  const [following, setFollowing] = useState<Follower[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [stats, setStats] = useState<CommunityStats>({
    followers: 0,
    following: 0,
    favorites: 0
  })

  // Demo mode detection
  const isDemoMode = !user

  // Load data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)

      if (isDemoMode) {
        // Use mock data in demo mode
        const mockData = generateMockData()
        setFollowers(mockData.followers)
        setFollowing(mockData.following)
        setFavorites(mockData.favorites)
        setStats({
          followers: mockData.followers.length,
          following: mockData.following.length,
          favorites: mockData.favorites.length
        })
        setIsLoading(false)
        return
      }

      // Load real data from Supabase
      const userId = user?.id
      const artistId = user?.user_metadata?.artist_profile_id as string | undefined

      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        // Load all data in parallel
        const [followersRes, followingRes, favoritesRes, statsRes] = await Promise.all([
          artistId ? getFollowers(artistId) : { data: [] },
          getFollowing(userId),
          getFavorites(userId),
          getCommunityStats(userId, artistId)
        ])

        setFollowers(followersRes.data || [])
        setFollowing(followingRes.data || [])
        setFavorites(favoritesRes.data || [])
        setStats(statsRes)
      } catch (error) {
        console.error('Error loading community data:', error)
      }

      setIsLoading(false)
    }

    loadData()
  }, [user, isDemoMode])

  // Search handler
  async function handleSearch(term: string) {
    setSearchTerm(term)

    if (!term.trim()) {
      // Reload original data
      if (isDemoMode) {
        const mockData = generateMockData()
        setFollowers(mockData.followers)
        setFollowing(mockData.following)
        setFavorites(mockData.favorites)
      }
      return
    }

    if (isDemoMode) {
      // Client-side search for demo mode
      const mockData = generateMockData()
      const lowerTerm = term.toLowerCase()

      setFollowers(mockData.followers.filter(f =>
        f.follower?.membername?.toLowerCase().includes(lowerTerm) ||
        f.follower?.vorname?.toLowerCase().includes(lowerTerm) ||
        f.follower?.nachname?.toLowerCase().includes(lowerTerm)
      ))
      setFollowing(mockData.following.filter(f =>
        f.artist?.künstlername?.toLowerCase().includes(lowerTerm)
      ))
      setFavorites(mockData.favorites.filter(f =>
        f.artist?.künstlername?.toLowerCase().includes(lowerTerm) ||
        f.notes?.toLowerCase().includes(lowerTerm)
      ))
      return
    }

    // Real search
    const userId = user?.id
    const artistId = user?.user_metadata?.artist_profile_id as string | undefined

    if (!userId) return

    try {
      const [followersRes, followingRes, favoritesRes] = await Promise.all([
        artistId ? searchFollowers(artistId, term) : { data: [] },
        searchFollowing(userId, term),
        searchFavorites(userId, term)
      ])

      setFollowers(followersRes.data || [])
      setFollowing(followingRes.data || [])
      setFavorites(favoritesRes.data || [])
    } catch (error) {
      console.error('Error searching:', error)
    }
  }

  // Sort handler
  function sortData<T extends { created_at: string }>(data: T[], getName: (item: T) => string): T[] {
    const sorted = [...data]
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case 'name':
        return sorted.sort((a, b) => getName(a).localeCompare(getName(b)))
      default:
        return sorted
    }
  }

  // Remove handlers
  async function handleUnfollow(artistId: string) {
    if (isDemoMode) {
      setFollowing(prev => prev.filter(f => f.artist_id !== artistId))
      setStats(prev => ({ ...prev, following: prev.following - 1 }))
      return
    }

    if (!user?.id) return
    const { error } = await unfollowArtist(user.id, artistId)
    if (!error) {
      setFollowing(prev => prev.filter(f => f.artist_id !== artistId))
      setStats(prev => ({ ...prev, following: prev.following - 1 }))
    }
  }

  async function handleRemoveFavorite(artistId: string) {
    if (isDemoMode) {
      setFavorites(prev => prev.filter(f => f.artist_id !== artistId))
      setStats(prev => ({ ...prev, favorites: prev.favorites - 1 }))
      return
    }

    if (!user?.id) return
    const { error } = await removeFavorite(user.id, artistId)
    if (!error) {
      setFavorites(prev => prev.filter(f => f.artist_id !== artistId))
      setStats(prev => ({ ...prev, favorites: prev.favorites - 1 }))
    }
  }

  async function handleUpdateFollowerSettings(followerId: string, artistId: string, settings: { notifyNewEvents?: boolean; notifyAvailability?: boolean }) {
    if (isDemoMode) {
      setFollowers(prev => prev.map(f =>
        f.follower_id === followerId
          ? {
              ...f,
              notify_new_events: settings.notifyNewEvents ?? f.notify_new_events,
              notify_availability: settings.notifyAvailability ?? f.notify_availability
            }
          : f
      ))
      return
    }

    const { error } = await updateFollowSettings(followerId, artistId, settings)
    if (!error) {
      setFollowers(prev => prev.map(f =>
        f.follower_id === followerId
          ? {
              ...f,
              notify_new_events: settings.notifyNewEvents ?? f.notify_new_events,
              notify_availability: settings.notifyAvailability ?? f.notify_availability
            }
          : f
      ))
    }
  }

  // Get sorted data
  const sortedFollowers = sortData(followers, f => f.follower?.membername || '')
  const sortedFollowing = sortData(following, f => f.artist?.künstlername || '')
  const sortedFavorites = sortData(favorites, f => f.artist?.künstlername || '')

  // Tab config
  const tabs: { id: TabType; label: string; count: number; icon: string }[] = [
    { id: 'followers', label: 'Follower', count: stats.followers, icon: '👥' },
    { id: 'following', label: 'Folge ich', count: stats.following, icon: '🎵' },
    { id: 'favorites', label: 'Favoriten', count: stats.favorites, icon: '⭐' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#171717] pt-24 pb-16"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meine Community</h1>
          <p className="text-gray-400">
            Verwalte deine Follower, die Künstler denen du folgst und deine Favoriten
          </p>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/30 rounded-xl">
            <p className="text-orange-400 text-sm">
              🎭 <strong>Demo-Modus:</strong> Du siehst Beispieldaten. Melde dich an, um deine echte Community zu sehen.
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Follower"
            value={stats.followers}
            icon="👥"
            color="bg-purple-500/20"
            index={0}
          />
          <StatCard
            label="Folge ich"
            value={stats.following}
            icon="🎵"
            color="bg-orange-500/20"
            index={1}
          />
          <StatCard
            label="Favoriten"
            value={stats.favorites}
            icon="⭐"
            color="bg-yellow-500/20"
            index={2}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={
                activeTab === 'followers'
                  ? 'Follower suchen...'
                  : activeTab === 'following'
                  ? 'Künstler suchen...'
                  : 'Favoriten suchen...'
              }
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="newest">Neueste zuerst</option>
            <option value="oldest">Älteste zuerst</option>
            <option value="name">Nach Name</option>
          </select>
        </div>

        {/* Content */}
        {isLoading ? (
          <CommunityPageSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            {/* Followers Tab */}
            {activeTab === 'followers' && (
              <motion.div
                key="followers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {sortedFollowers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedFollowers.map((follower, index) => (
                      <FollowerCard
                        key={follower.id}
                        follower={follower}
                        onUpdateSettings={(settings) =>
                          handleUpdateFollowerSettings(follower.follower_id, follower.artist_id, settings)
                        }
                        isArtistView={true}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="followers" />
                )}
              </motion.div>
            )}

            {/* Following Tab */}
            {activeTab === 'following' && (
              <motion.div
                key="following"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {sortedFollowing.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedFollowing.map((follow, index) => (
                      follow.artist && (
                        <ArtistCard
                          key={follow.id}
                          artist={follow.artist}
                          onRemove={() => handleUnfollow(follow.artist_id)}
                          isFavorite={false}
                          index={index}
                        />
                      )
                    ))}
                  </div>
                ) : (
                  <EmptyState type="following" />
                )}
              </motion.div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {sortedFavorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedFavorites.map((favorite, index) => (
                      favorite.artist && (
                        <ArtistCard
                          key={favorite.id}
                          artist={favorite.artist}
                          onRemove={() => handleRemoveFavorite(favorite.artist_id)}
                          notes={favorite.notes}
                          isFavorite={true}
                          index={index}
                        />
                      )
                    ))}
                  </div>
                ) : (
                  <EmptyState type="favorites" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-2xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Schnellaktionen</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href="/artists"
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🔍</span>
              <span>Künstler entdecken</span>
            </a>
            <a
              href="/events"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>📅</span>
              <span>Events ansehen</span>
            </a>
            <button
              onClick={() => {
                // TODO: Implement export functionality
                // Would export: followers, following, or favorites list based on activeTab
                alert('Export-Funktion kommt bald!')
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>📤</span>
              <span>Liste exportieren</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
