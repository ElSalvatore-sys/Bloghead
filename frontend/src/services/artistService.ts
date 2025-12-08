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

// Generate placeholder image URL based on artist name
function getPlaceholderImage(name: string, size = 400): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Artist')}&background=610AD1&color=fff&size=${size}&bold=true`
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
      profile_image_url: userData?.profile_image_url || getPlaceholderImage(artist.kuenstlername),
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
    profile_image_url: userData?.profile_image_url || getPlaceholderImage(data.kuenstlername),
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
