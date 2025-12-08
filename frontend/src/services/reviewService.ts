import { supabase } from '../lib/supabase'

export interface Review {
  id: string
  booking_id: string | null
  rater_id: string
  rated_entity_type: 'artist' | 'veranstalter'
  rated_entity_id: string
  overall_rating: number
  review_title: string | null
  review_text: string | null
  quick_feedback: string[] | null
  // Category ratings for artists
  zuverlaessigkeit: number | null
  kommunikation: number | null
  preis_leistung: number | null
  stimmung: number | null
  // Category ratings for venues
  hospitality: number | null
  equipment: number | null
  ambiente: number | null
  // Meta
  is_verified: boolean
  is_public: boolean
  response_text: string | null
  response_at: string | null
  created_at: string
  updated_at: string
  // Joined data
  rater?: {
    vorname: string | null
    nachname: string | null
    profile_image_url: string | null
    membername: string | null
  } | null
}

export interface ReviewStats {
  avgRating: number
  totalReviews: number
  distribution: Record<number, number>
  categoryAverages?: {
    zuverlaessigkeit: number
    kommunikation: number
    preis_leistung: number
    stimmung: number
  }
}

export interface CreateReviewData {
  booking_id?: string
  rater_id: string
  rated_entity_type: 'artist' | 'veranstalter'
  rated_entity_id: string
  overall_rating: number
  review_title?: string
  review_text?: string
  quick_feedback?: string[]
  zuverlaessigkeit?: number
  kommunikation?: number
  preis_leistung?: number
  stimmung?: number
}

/**
 * Get reviews for an artist
 */
export async function getArtistReviews(artistId: string, limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      rater:users!ratings_rater_id_fkey(
        vorname,
        nachname,
        profile_image_url,
        membername
      )
    `)
    .eq('rated_entity_type', 'artist')
    .eq('rated_entity_id', artistId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { data: data as Review[] | null, error }
}

/**
 * Get reviews for a service provider (using veranstalter type)
 */
export async function getProviderReviews(providerId: string, limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      rater:users!ratings_rater_id_fkey(
        vorname,
        nachname,
        profile_image_url,
        membername
      )
    `)
    .eq('rated_entity_type', 'veranstalter')
    .eq('rated_entity_id', providerId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { data: data as Review[] | null, error }
}

/**
 * Create a new review
 */
export async function createReview(data: CreateReviewData) {
  const { data: result, error } = await supabase
    .from('ratings')
    .insert({
      booking_id: data.booking_id || null,
      rater_id: data.rater_id,
      rated_entity_type: data.rated_entity_type,
      rated_entity_id: data.rated_entity_id,
      overall_rating: data.overall_rating,
      review_title: data.review_title || null,
      review_text: data.review_text || null,
      quick_feedback: data.quick_feedback || null,
      zuverlaessigkeit: data.zuverlaessigkeit || null,
      kommunikation: data.kommunikation || null,
      preis_leistung: data.preis_leistung || null,
      stimmung: data.stimmung || null,
      is_public: true,
      is_verified: false,
    })
    .select()
    .single()

  return { data: result, error }
}

/**
 * Check if user already reviewed this booking
 */
export async function hasReviewedBooking(userId: string, bookingId: string): Promise<boolean> {
  const { data } = await supabase
    .from('ratings')
    .select('id')
    .eq('rater_id', userId)
    .eq('booking_id', bookingId)
    .maybeSingle()

  return !!data
}

/**
 * Check if user already reviewed this entity (without booking)
 */
export async function hasReviewedEntity(
  userId: string,
  entityId: string,
  entityType: 'artist' | 'veranstalter'
): Promise<boolean> {
  const { data } = await supabase
    .from('ratings')
    .select('id')
    .eq('rater_id', userId)
    .eq('rated_entity_id', entityId)
    .eq('rated_entity_type', entityType)
    .maybeSingle()

  return !!data
}

/**
 * Get review statistics for an artist
 */
export async function getArtistReviewStats(artistId: string): Promise<ReviewStats> {
  const { data } = await supabase
    .from('ratings')
    .select('overall_rating, zuverlaessigkeit, kommunikation, preis_leistung, stimmung')
    .eq('rated_entity_type', 'artist')
    .eq('rated_entity_id', artistId)
    .eq('is_public', true)

  if (!data || data.length === 0) {
    return {
      avgRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }

  const total = data.length
  const sum = data.reduce((acc, r) => acc + Number(r.overall_rating), 0)
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  data.forEach((r) => {
    const rounded = Math.round(Number(r.overall_rating))
    if (rounded >= 1 && rounded <= 5) {
      distribution[rounded]++
    }
  })

  // Calculate category averages
  const categoryAverages = {
    zuverlaessigkeit: 0,
    kommunikation: 0,
    preis_leistung: 0,
    stimmung: 0,
  }

  const categoryCounts = {
    zuverlaessigkeit: 0,
    kommunikation: 0,
    preis_leistung: 0,
    stimmung: 0,
  }

  data.forEach((r) => {
    if (r.zuverlaessigkeit) {
      categoryAverages.zuverlaessigkeit += r.zuverlaessigkeit
      categoryCounts.zuverlaessigkeit++
    }
    if (r.kommunikation) {
      categoryAverages.kommunikation += r.kommunikation
      categoryCounts.kommunikation++
    }
    if (r.preis_leistung) {
      categoryAverages.preis_leistung += r.preis_leistung
      categoryCounts.preis_leistung++
    }
    if (r.stimmung) {
      categoryAverages.stimmung += r.stimmung
      categoryCounts.stimmung++
    }
  })

  Object.keys(categoryAverages).forEach((key) => {
    const k = key as keyof typeof categoryAverages
    if (categoryCounts[k] > 0) {
      categoryAverages[k] = categoryAverages[k] / categoryCounts[k]
    }
  })

  return {
    avgRating: sum / total,
    totalReviews: total,
    distribution,
    categoryAverages,
  }
}

/**
 * Get review statistics for a provider
 */
export async function getProviderReviewStats(providerId: string): Promise<ReviewStats> {
  const { data } = await supabase
    .from('ratings')
    .select('overall_rating')
    .eq('rated_entity_type', 'veranstalter')
    .eq('rated_entity_id', providerId)
    .eq('is_public', true)

  if (!data || data.length === 0) {
    return {
      avgRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }

  const total = data.length
  const sum = data.reduce((acc, r) => acc + Number(r.overall_rating), 0)
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  data.forEach((r) => {
    const rounded = Math.round(Number(r.overall_rating))
    if (rounded >= 1 && rounded <= 5) {
      distribution[rounded]++
    }
  })

  return {
    avgRating: sum / total,
    totalReviews: total,
    distribution,
  }
}

/**
 * Get total review count for an entity
 */
export async function getReviewCount(
  entityId: string,
  entityType: 'artist' | 'veranstalter'
): Promise<number> {
  const { count } = await supabase
    .from('ratings')
    .select('*', { count: 'exact', head: true })
    .eq('rated_entity_type', entityType)
    .eq('rated_entity_id', entityId)
    .eq('is_public', true)

  return count || 0
}

/**
 * Add a response to a review (for the reviewed entity)
 */
export async function addReviewResponse(reviewId: string, responseText: string) {
  const { error } = await supabase
    .from('ratings')
    .update({
      response_text: responseText,
      response_at: new Date().toISOString(),
    })
    .eq('id', reviewId)

  return { error }
}
