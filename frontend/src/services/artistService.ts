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
  user_id: string
  kuenstlername: string
  genre: string[]
  stadt: string
  region: string
  land: string
  bio: string
  preis_pro_stunde: number | null
  preis_pro_veranstaltung: number | null
  star_rating: number
  total_ratings: number
  total_bookings: number
  is_bookable: boolean
  tagged_with: string[]
  jobbezeichnung: string
  // From users table via join
  profile_image_url?: string
  cover_image_url?: string
}

// Get list of artists with filters
export async function getArtists(filters: ArtistFilters = {}) {
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
      preis_pro_stunde,
      preis_pro_veranstaltung,
      star_rating,
      total_ratings,
      total_bookings,
      is_bookable,
      tagged_with,
      jobbezeichnung,
      users!inner (
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
    query = query.gte('preis_pro_stunde', filters.priceMin)
  }

  if (filters.priceMax !== undefined) {
    query = query.lte('preis_pro_stunde', filters.priceMax)
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

  if (error) {
    console.error('Error fetching artists:', error)
    return { data: null, error, count: 0 }
  }

  // Flatten the users data into the artist object
  const flattenedData = data?.map(artist => ({
    ...artist,
    profile_image_url: (artist.users as { profile_image_url?: string })?.profile_image_url,
    cover_image_url: (artist.users as { cover_image_url?: string })?.cover_image_url,
    users: undefined,
  })) || []

  return { data: flattenedData, error: null, count }
}

// Get single artist by ID with full details
export async function getArtistById(artistId: string) {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select(`
      *,
      users!inner (
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

  // Flatten user data
  const flattenedData = {
    ...data,
    profile_image_url: data.users?.profile_image_url,
    cover_image_url: data.users?.cover_image_url,
    vorname: data.users?.vorname,
    nachname: data.users?.nachname,
    is_verified: data.users?.is_verified,
    member_since: data.users?.created_at,
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
