import { supabase } from '../lib/supabase'

export interface ArtistFilters {
  genre?: string
  city?: string
  region?: string
  priceMin?: number
  priceMax?: number
  searchQuery?: string
  limit?: number
  offset?: number
}

export interface ArtistListItem {
  id: string
  user_id: string | null
  kuenstlername: string
  genre: string[]
  stadt: string
  region: string
  land: string
  bio: string
  preis_minimum: number | null
  preis_pro_stunde: number | null // Mapped from preis_minimum for UI compatibility
  preis_pro_veranstaltung: number | null
  star_rating: number
  total_ratings: number
  total_bookings: number
  is_bookable: boolean
  tagged_with: string[]
  jobbezeichnung: string
  // From users table via join (or placeholder)
  profile_image_url?: string
  cover_image_url?: string
}

// Unsplash placeholder images for artists (music/performance themed)
const artistPlaceholders = [
  'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400&h=400&fit=crop', // DJ at decks
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop', // Singer with mic
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', // Band performing
  'https://images.unsplash.com/photo-1547355253-ff0740f6e8c1?w=400&h=400&fit=crop', // Rapper on stage
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&h=400&fit=crop', // Violinist
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop', // Jazz musician
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop', // DJ mixing
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop', // Guitar player
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop', // Singer live
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&h=400&fit=crop', // Concert performer
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop', // Band silhouette
  'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop', // Festival DJ
]

// Generate placeholder image URL based on artist id for consistency
function getPlaceholderImage(artistId: string): string {
  // Use artist id to get a consistent placeholder (same artist always gets same image)
  const hash = artistId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  const index = hash % artistPlaceholders.length
  return artistPlaceholders[index]
}

// Get list of artists with filters
export async function getArtists(filters: ArtistFilters = {}) {
  console.log('[artistService] Fetching artists with filters:', filters)
  console.log('[artistService] Environment check - URL:', import.meta.env.VITE_SUPABASE_URL ? 'set' : 'MISSING')

  let query = supabase
    .from('artist_profiles')
    .select(`
      id,
      user_id,
      kuenstlername,
      genre,
      stadt,
      region,
      land,
      bio,
      preis_minimum,
      preis_pro_veranstaltung,
      star_rating,
      total_ratings,
      total_bookings,
      is_bookable,
      tagged_with,
      jobbezeichnung,
      users (
        profile_image_url,
        cover_image_url
      )
    `)
    .eq('is_bookable', true)

  // Apply filters
  if (filters.genre) {
    query = query.contains('genre', [filters.genre])
  }

  if (filters.city) {
    query = query.ilike('stadt', `%${filters.city}%`)
  }

  if (filters.region) {
    query = query.eq('region', filters.region)
  }

  if (filters.priceMin !== undefined) {
    query = query.gte('preis_minimum', filters.priceMin)
  }

  if (filters.priceMax !== undefined) {
    query = query.lte('preis_pro_veranstaltung', filters.priceMax)
  }

  if (filters.searchQuery) {
    query = query.or(`kuenstlername.ilike.%${filters.searchQuery}%,bio.ilike.%${filters.searchQuery}%,jobbezeichnung.ilike.%${filters.searchQuery}%`)
  }

  // Pagination
  const limit = filters.limit || 20
  const offset = filters.offset || 0
  query = query.range(offset, offset + limit - 1)

  // Order by rating
  query = query.order('star_rating', { ascending: false })

  const { data, error, count } = await query

  console.log('[artistService] Query result:', { data, error, count, dataLength: data?.length })

  if (error) {
    console.error('[artistService] Error fetching artists:', error)
    return { data: null, error, count: 0 }
  }

  // Flatten the users data into the artist object, with placeholder fallbacks
  const flattenedData = data?.map(artist => {
    const userData = artist.users as { profile_image_url?: string; cover_image_url?: string } | null
    return {
      ...artist,
      profile_image_url: userData?.profile_image_url || getPlaceholderImage(artist.id),
      cover_image_url: userData?.cover_image_url,
      // Map preis_minimum to preis_pro_stunde for backward compatibility with UI
      preis_pro_stunde: artist.preis_minimum,
      users: undefined,
    }
  }) || []

  return { data: flattenedData, error: null, count }
}

// Get single artist by ID with full details
export async function getArtistById(artistId: string) {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select(`
      *,
      users (
        id,
        email,
        vorname,
        nachname,
        profile_image_url,
        cover_image_url,
        created_at,
        is_verified
      )
    `)
    .eq('id', artistId)
    .single()

  if (error) {
    console.error('Error fetching artist:', error)
    return { data: null, error }
  }

  // Flatten user data with placeholder fallbacks
  const userData = data.users as {
    profile_image_url?: string
    cover_image_url?: string
    vorname?: string
    nachname?: string
    is_verified?: boolean
    created_at?: string
  } | null

  const flattenedData = {
    ...data,
    profile_image_url: userData?.profile_image_url || getPlaceholderImage(data.id),
    cover_image_url: userData?.cover_image_url,
    vorname: userData?.vorname,
    nachname: userData?.nachname,
    is_verified: userData?.is_verified || false,
    member_since: userData?.created_at,
    // Map preis_minimum to preis_pro_stunde for backward compatibility
    preis_pro_stunde: data.preis_minimum,
  }

  return { data: flattenedData, error: null }
}

// Get artist by user_id
export async function getArtistByUserId(userId: string) {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

// Get artist availability for calendar
export async function getArtistAvailability(artistId: string, month?: number, year?: number) {
  const now = new Date()
  const targetMonth = month ?? now.getMonth() + 1
  const targetYear = year ?? now.getFullYear()

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`
  const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('artist_availability')
    .select('*')
    .eq('artist_id', artistId)
    .gte('date', startDate)
    .lte('date', endDate)

  return { data, error }
}

// Get unique genres for filter dropdown
export async function getGenres() {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('genre')
    .eq('is_bookable', true)

  if (error || !data) return { data: [], error }

  // Flatten and dedupe genres
  const allGenres = data.flatMap(d => d.genre || [])
  const uniqueGenres = [...new Set(allGenres)].filter(Boolean).sort()

  return { data: uniqueGenres, error: null }
}

// Get unique cities for filter dropdown
export async function getCities() {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('stadt')
    .eq('is_bookable', true)
    .not('stadt', 'is', null)

  if (error || !data) return { data: [], error }

  const uniqueCities = [...new Set(data.map(d => d.stadt))].filter(Boolean).sort()

  return { data: uniqueCities as string[], error: null }
}

// Get unique regions for filter dropdown
export async function getRegions() {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('region')
    .eq('is_bookable', true)
    .not('region', 'is', null)

  if (error || !data) return { data: [], error }

  const uniqueRegions = [...new Set(data.map(d => d.region))].filter(Boolean).sort()

  return { data: uniqueRegions as string[], error: null }
}

// Get artist ratings/reviews
export async function getArtistRatings(artistId: string, limit = 10) {
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      users:rater_id (
        vorname,
        nachname,
        profile_image_url
      )
    `)
    .eq('rated_entity_id', artistId)
    .eq('rated_entity_type', 'artist')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}
