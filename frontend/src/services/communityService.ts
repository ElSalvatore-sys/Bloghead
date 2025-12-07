import { supabase } from '../lib/supabase'

// Types for followers
export type FollowerType = 'fan' | 'veranstalter'

export interface Follower {
  id: string
  follower_id: string
  artist_id: string
  follower_type: FollowerType
  notify_new_events: boolean
  notify_availability: boolean
  created_at: string
  // Joined user data
  follower?: {
    id: string
    membername: string | null
    vorname: string | null
    nachname: string | null
    profile_image_url: string | null
    user_type: string | null
  }
  // Joined artist data
  artist?: {
    id: string
    künstlername: string | null
    profilbild_url: string | null
    genre: string[] | null
    ort: string | null
  }
}

// Types for favorites
export interface Favorite {
  id: string
  user_id: string
  artist_id: string
  notes: string | null
  created_at: string
  // Joined artist data
  artist?: {
    id: string
    künstlername: string | null
    profilbild_url: string | null
    genre: string[] | null
    ort: string | null
    user_id: string
  }
}

// Community stats
export interface CommunityStats {
  followers: number
  following: number
  favorites: number
}

// Get all followers of an artist
export async function getFollowers(
  artistId: string
): Promise<{ data: Follower[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('followers')
    .select(`
      *,
      follower:users!follower_id(
        id,
        membername,
        vorname,
        nachname,
        profile_image_url,
        user_type
      )
    `)
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })

  return { data: data as Follower[] | null, error }
}

// Get all artists a user is following
export async function getFollowing(
  userId: string
): Promise<{ data: Follower[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('followers')
    .select(`
      *,
      artist:artist_profiles!artist_id(
        id,
        künstlername,
        profilbild_url,
        genre,
        ort
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })

  return { data: data as Follower[] | null, error }
}

// Follow an artist
export async function followArtist(
  userId: string,
  artistId: string,
  options?: {
    followerType?: FollowerType
    notifyNewEvents?: boolean
    notifyAvailability?: boolean
  }
): Promise<{ data: Follower | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('followers')
    .insert({
      follower_id: userId,
      artist_id: artistId,
      follower_type: options?.followerType || 'fan',
      notify_new_events: options?.notifyNewEvents ?? true,
      notify_availability: options?.notifyAvailability ?? true
    })
    .select()
    .single()

  return { data: data as Follower | null, error }
}

// Unfollow an artist
export async function unfollowArtist(
  userId: string,
  artistId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', userId)
    .eq('artist_id', artistId)

  return { error }
}

// Update follow notification settings
export async function updateFollowSettings(
  userId: string,
  artistId: string,
  settings: {
    notifyNewEvents?: boolean
    notifyAvailability?: boolean
  }
): Promise<{ error: Error | null }> {
  const updateData: Record<string, boolean> = {}
  if (settings.notifyNewEvents !== undefined) {
    updateData.notify_new_events = settings.notifyNewEvents
  }
  if (settings.notifyAvailability !== undefined) {
    updateData.notify_availability = settings.notifyAvailability
  }

  const { error } = await supabase
    .from('followers')
    .update(updateData)
    .eq('follower_id', userId)
    .eq('artist_id', artistId)

  return { error }
}

// Check if user is following an artist
export async function isFollowing(
  userId: string,
  artistId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', userId)
    .eq('artist_id', artistId)
    .maybeSingle()

  return !!data
}

// Get all favorites of a user
export async function getFavorites(
  userId: string
): Promise<{ data: Favorite[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      artist:artist_profiles!artist_id(
        id,
        künstlername,
        profilbild_url,
        genre,
        ort,
        user_id
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: data as Favorite[] | null, error }
}

// Add artist to favorites
export async function addFavorite(
  userId: string,
  artistId: string,
  notes?: string
): Promise<{ data: Favorite | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      artist_id: artistId,
      notes: notes || null
    })
    .select()
    .single()

  return { data: data as Favorite | null, error }
}

// Remove artist from favorites
export async function removeFavorite(
  userId: string,
  artistId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('artist_id', artistId)

  return { error }
}

// Update favorite notes
export async function updateFavoriteNotes(
  userId: string,
  artistId: string,
  notes: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('favorites')
    .update({ notes })
    .eq('user_id', userId)
    .eq('artist_id', artistId)

  return { error }
}

// Check if artist is in user's favorites
export async function isFavorite(
  userId: string,
  artistId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('artist_id', artistId)
    .maybeSingle()

  return !!data
}

// Get community stats for a user
export async function getCommunityStats(
  userId: string,
  artistId?: string
): Promise<CommunityStats> {
  const stats: CommunityStats = {
    followers: 0,
    following: 0,
    favorites: 0
  }

  // Get followers count (if user is an artist)
  if (artistId) {
    const { count: followersCount } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', artistId)
    stats.followers = followersCount || 0
  }

  // Get following count
  const { count: followingCount } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)
  stats.following = followingCount || 0

  // Get favorites count
  const { count: favoritesCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  stats.favorites = favoritesCount || 0

  return stats
}

// Search followers by name
export async function searchFollowers(
  artistId: string,
  searchTerm: string
): Promise<{ data: Follower[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('followers')
    .select(`
      *,
      follower:users!follower_id(
        id,
        membername,
        vorname,
        nachname,
        profile_image_url,
        user_type
      )
    `)
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return { data: null, error }
  }

  // Filter by search term on client side (since we need to search joined data)
  const term = searchTerm.toLowerCase()
  const filtered = data.filter(f => {
    const follower = f.follower
    if (!follower) return false
    return (
      follower.membername?.toLowerCase().includes(term) ||
      follower.vorname?.toLowerCase().includes(term) ||
      follower.nachname?.toLowerCase().includes(term)
    )
  })

  return { data: filtered as Follower[], error: null }
}

// Search following by artist name
export async function searchFollowing(
  userId: string,
  searchTerm: string
): Promise<{ data: Follower[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('followers')
    .select(`
      *,
      artist:artist_profiles!artist_id(
        id,
        künstlername,
        profilbild_url,
        genre,
        ort
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return { data: null, error }
  }

  // Filter by search term on client side
  const term = searchTerm.toLowerCase()
  const filtered = (data as unknown as Follower[]).filter(f => {
    const artist = f.artist
    if (!artist) return false
    return (
      artist.künstlername?.toLowerCase().includes(term) ||
      artist.ort?.toLowerCase().includes(term) ||
      artist.genre?.some((g: string) => g.toLowerCase().includes(term))
    )
  })

  return { data: filtered, error: null }
}

// Search favorites by artist name
export async function searchFavorites(
  userId: string,
  searchTerm: string
): Promise<{ data: Favorite[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      artist:artist_profiles!artist_id(
        id,
        künstlername,
        profilbild_url,
        genre,
        ort,
        user_id
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return { data: null, error }
  }

  // Filter by search term on client side
  const term = searchTerm.toLowerCase()
  const filtered = (data as unknown as Favorite[]).filter(f => {
    const artist = f.artist
    if (!artist) return false
    return (
      artist.künstlername?.toLowerCase().includes(term) ||
      artist.ort?.toLowerCase().includes(term) ||
      artist.genre?.some((g: string) => g.toLowerCase().includes(term)) ||
      f.notes?.toLowerCase().includes(term)
    )
  })

  return { data: filtered, error: null }
}

// Get follower type display config
export const FOLLOWER_TYPE_CONFIG: Record<FollowerType, {
  label: string
  color: string
  bgColor: string
}> = {
  fan: {
    label: 'Fan',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  veranstalter: {
    label: 'Veranstalter',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20'
  }
}

// Format date for display (German locale)
export function formatJoinDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
