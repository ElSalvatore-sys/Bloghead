/**
 * Review Service - Phase 7 Update
 * Handles all review and rating operations
 * Supports both legacy ratings table and new reviews system
 */

import { supabase } from '../lib/supabase'

// ============================================================================
// LEGACY TYPES (for backwards compatibility with ratings table)
// ============================================================================

export interface LegacyReview {
  id: string
  booking_id: string | null
  rater_id: string
  rated_entity_type: 'artist' | 'veranstalter'
  rated_entity_id: string
  overall_rating: number
  review_title: string | null
  review_text: string | null
  quick_feedback: string[] | null
  zuverlaessigkeit: number | null
  kommunikation: number | null
  preis_leistung: number | null
  stimmung: number | null
  hospitality: number | null
  equipment: number | null
  ambiente: number | null
  is_verified: boolean
  is_public: boolean
  response_text: string | null
  response_at: string | null
  created_at: string
  updated_at: string
  // Joined rater data from Supabase query
  rater?: {
    vorname: string | null
    nachname: string | null
    profile_image_url: string | null
    membername: string | null
  } | null
}

export interface LegacyReviewStats {
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

export interface LegacyCreateReviewData {
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

// ============================================================================
// NEW PHASE 7 TYPES
// ============================================================================

export type ReviewerType = 'client' | 'artist'
export type ReviewStatus = 'pending' | 'published' | 'flagged' | 'removed'
export type ReviewCategory =
  | 'performance'
  | 'communication'
  | 'punctuality'
  | 'professionalism'
  | 'value_for_money'
  | 'clarity'
  | 'payment_promptness'
  | 'venue_conditions'
  | 'respectfulness'

export type BadgeType =
  | 'top_rated'
  | 'rising_star'
  | 'reliable'
  | 'communicator'
  | 'crowd_favorite'
  | 'verified_pro'
  | 'trusted_client'

export interface CategoryRating {
  category: ReviewCategory
  rating: number
}

export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  reviewer_type: ReviewerType
  overall_rating: number
  title: string | null
  content: string | null
  status: ReviewStatus
  is_public: boolean
  helpful_count: number
  flag_count: number
  event_date: string
  created_at: string
  updated_at: string
  reviewer?: {
    id: string
    name: string
    profile_image_url: string | null
  }
  reviewee?: {
    id: string
    name: string
    profile_image_url: string | null
  }
  categories?: CategoryRating[]
  response?: {
    content: string
    created_at: string
  } | null
}

export interface UserRatingStats {
  id: string
  user_id: string
  user_type: ReviewerType
  total_reviews: number
  average_rating: number
  rating_distribution: Record<string, number>
  category_averages: Record<string, number>
  badges: BadgeType[]
  last_review_at: string | null
}

export interface CanReviewResult {
  can_review: boolean
  reason?: string
  reviewer_type?: ReviewerType
  reviewee_id?: string
  existing_review_id?: string
}

export interface BookingReviewStatus {
  booking_id: string
  client_review: {
    id: string
    rating: number
    created_at: string
  } | null
  artist_review: {
    id: string
    rating: number
    created_at: string
  } | null
  can_client_review: CanReviewResult
  can_artist_review: CanReviewResult
}

export interface ReviewsResponse {
  reviews: Review[]
  total: number
  limit: number
  offset: number
}

// ============================================================================
// CATEGORY DEFINITIONS
// ============================================================================

// Categories for reviewing artists (used by clients)
export const ARTIST_REVIEW_CATEGORIES: { category: ReviewCategory; label: string; description: string }[] = [
  { category: 'performance', label: 'Performance', description: 'Qualität der Performance/Dienstleistung' },
  { category: 'communication', label: 'Kommunikation', description: 'Erreichbarkeit und Klarheit' },
  { category: 'punctuality', label: 'Pünktlichkeit', description: 'Pünktlich wie vereinbart' },
  { category: 'professionalism', label: 'Professionalität', description: 'Professionelles Auftreten' },
  { category: 'value_for_money', label: 'Preis-Leistung', description: 'Preis-Leistungs-Verhältnis' },
]

// Categories for reviewing clients (used by artists)
export const CLIENT_REVIEW_CATEGORIES: { category: ReviewCategory; label: string; description: string }[] = [
  { category: 'communication', label: 'Kommunikation', description: 'Klare Anweisungen und Erwartungen' },
  { category: 'clarity', label: 'Klarheit', description: 'Klare Event-Anforderungen' },
  { category: 'payment_promptness', label: 'Zahlungspünktlichkeit', description: 'Pünktliche Zahlung wie vereinbart' },
  { category: 'venue_conditions', label: 'Venue-Bedingungen', description: 'Qualität des Veranstaltungsortes/Ausstattung' },
  { category: 'respectfulness', label: 'Respektvolles Verhalten', description: 'Professioneller und respektvoller Umgang' },
]

// Badge display info
export const BADGE_INFO: Record<BadgeType, { label: string; icon: string; color: string }> = {
  top_rated: { label: 'Top Bewertet', icon: '⭐', color: 'text-yellow-400' },
  rising_star: { label: 'Aufsteigender Stern', icon: '🌟', color: 'text-purple-400' },
  reliable: { label: 'Zuverlässig', icon: '✓', color: 'text-green-400' },
  communicator: { label: 'Guter Kommunikator', icon: '💬', color: 'text-blue-400' },
  crowd_favorite: { label: 'Publikumsliebling', icon: '❤️', color: 'text-pink-400' },
  verified_pro: { label: 'Verifizierter Profi', icon: '✓', color: 'text-emerald-400' },
  trusted_client: { label: 'Vertrauenswürdiger Kunde', icon: '🤝', color: 'text-indigo-400' },
}

// ============================================================================
// NEW PHASE 7 API FUNCTIONS
// ============================================================================

/**
 * Check if user can submit a review for a booking
 */
export async function canSubmitReview(bookingId: string): Promise<{ data: CanReviewResult | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  const { data, error } = await supabase.rpc('can_submit_review', {
    p_booking_id: bookingId,
    p_reviewer_id: user.id,
  })

  if (error) {
    return { data: null, error }
  }

  return { data: data as CanReviewResult, error: null }
}

/**
 * Submit a review for a completed booking (Phase 7)
 */
export async function submitReview(
  bookingId: string,
  overallRating: number,
  title?: string,
  content?: string,
  categoryRatings: CategoryRating[] = []
): Promise<{ data: { success: boolean; review_id?: string; error?: string } | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('submit_review', {
    p_booking_id: bookingId,
    p_overall_rating: overallRating,
    p_title: title || null,
    p_content: content || null,
    p_category_ratings: categoryRatings,
  })

  if (error) {
    return { data: null, error }
  }

  return { data: data as { success: boolean; review_id?: string; error?: string }, error: null }
}

/**
 * Get reviews for a user (received or given) - Phase 7
 */
export async function getUserReviews(
  userId: string,
  asReviewer: boolean = false,
  limit: number = 10,
  offset: number = 0
): Promise<{ data: ReviewsResponse | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_user_reviews', {
    p_user_id: userId,
    p_as_reviewer: asReviewer,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    return { data: null, error }
  }

  return { data: data as ReviewsResponse, error: null }
}

/**
 * Get review status for a booking (both parties)
 */
export async function getBookingReviewStatus(
  bookingId: string
): Promise<{ data: BookingReviewStatus | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_booking_review_status', {
    p_booking_id: bookingId,
  })

  if (error) {
    return { data: null, error }
  }

  return { data: data as BookingReviewStatus, error: null }
}

/**
 * Get user rating statistics (Phase 7)
 */
export async function getUserRatingStats(
  userId: string
): Promise<{ data: UserRatingStats | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('user_rating_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { data: null, error }
  }

  return { data: data as UserRatingStats | null, error: null }
}

/**
 * Flag a review as inappropriate
 */
export async function flagReview(
  reviewId: string,
  reason: string
): Promise<{ data: { success: boolean; flag_count?: number; error?: string } | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('flag_review', {
    p_review_id: reviewId,
    p_reason: reason,
  })

  if (error) {
    return { data: null, error }
  }

  return { data: data as { success: boolean; flag_count?: number; error?: string }, error: null }
}

/**
 * Vote a review as helpful (toggle)
 */
export async function voteReviewHelpful(
  reviewId: string
): Promise<{ data: { success: boolean; voted: boolean; helpful_count: number } | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('vote_review_helpful', {
    p_review_id: reviewId,
  })

  if (error) {
    return { data: null, error }
  }

  return { data: data as { success: boolean; voted: boolean; helpful_count: number }, error: null }
}

/**
 * Respond to a review (Phase 7)
 */
export async function respondToReview(
  reviewId: string,
  content: string
): Promise<{ data: { success: boolean; response_id?: string; error?: string } | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('respond_to_review', {
    p_review_id: reviewId,
    p_content: content,
  })

  if (error) {
    return { data: null, error }
  }

  return { data: data as { success: boolean; response_id?: string; error?: string }, error: null }
}

/**
 * Get a single review by ID (Phase 7)
 */
export async function getReviewById(
  reviewId: string
): Promise<{ data: Review | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:reviewer_id(id, vorname, nachname, profile_image_url),
      reviewee:reviewee_id(id, vorname, nachname, profile_image_url),
      review_categories(*),
      review_responses(*)
    `)
    .eq('id', reviewId)
    .single()

  if (error) {
    return { data: null, error }
  }

  // Transform the data
  const review: Review = {
    ...data,
    reviewer: data.reviewer ? {
      id: data.reviewer.id,
      name: `${data.reviewer.vorname} ${data.reviewer.nachname?.charAt(0)}.`,
      profile_image_url: data.reviewer.profile_image_url,
    } : undefined,
    reviewee: data.reviewee ? {
      id: data.reviewee.id,
      name: `${data.reviewee.vorname} ${data.reviewee.nachname}`,
      profile_image_url: data.reviewee.profile_image_url,
    } : undefined,
    categories: data.review_categories?.map((rc: { category: ReviewCategory; rating: number }) => ({
      category: rc.category,
      rating: rc.rating,
    })),
    response: data.review_responses?.[0] ? {
      content: data.review_responses[0].content,
      created_at: data.review_responses[0].created_at,
    } : null,
  }

  return { data: review, error: null }
}

/**
 * Get pending reviews for current user
 */
export async function getPendingReviewsForUser(): Promise<{ data: { booking_id: string; artist_name: string; event_date: string; days_left: number }[] | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const { data: bookings, error } = await supabase
    .from('booking_requests')
    .select(`
      id,
      event_date,
      artist:artist_id(vorname, nachname),
      requester:requester_id(id)
    `)
    .eq('status', 'completed')
    .gte('event_date', fourteenDaysAgo.toISOString().split('T')[0])
    .or(`artist_id.eq.${user.id},requester_id.eq.${user.id}`)

  if (error) {
    return { data: null, error }
  }

  const pendingReviews: { booking_id: string; artist_name: string; event_date: string; days_left: number }[] = []

  for (const booking of bookings || []) {
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', booking.id)
      .eq('reviewer_id', user.id)
      .single()

    if (!existingReview) {
      const eventDate = new Date(booking.event_date)
      const daysLeft = 14 - Math.floor((Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24))

      pendingReviews.push({
        booking_id: booking.id,
        artist_name: `${(booking.artist as any)?.vorname || ''} ${(booking.artist as any)?.nachname || ''}`.trim(),
        event_date: booking.event_date,
        days_left: Math.max(0, daysLeft),
      })
    }
  }

  return { data: pendingReviews, error: null }
}

/**
 * Check if current user has voted a review as helpful
 */
export async function hasVotedHelpful(reviewId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from('review_helpful_votes')
    .select('id')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .single()

  return !!data
}

// ============================================================================
// LEGACY API FUNCTIONS (backwards compatibility with ratings table)
// ============================================================================

/**
 * @deprecated Use getUserReviews instead
 * Get reviews for an artist from legacy ratings table
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

  return { data: data as LegacyReview[] | null, error }
}

/**
 * @deprecated Use getUserReviews instead
 * Get reviews for a service provider
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

  return { data: data as LegacyReview[] | null, error }
}

/**
 * @deprecated Use submitReview instead
 * Create a new review in legacy ratings table
 */
export async function createReview(data: LegacyCreateReviewData) {
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
 * Check if user already reviewed this booking (legacy)
 */
export async function hasReviewedBooking(userId: string, bookingId: string): Promise<boolean> {
  // Check both legacy and new tables
  const [legacyResult, newResult] = await Promise.all([
    supabase.from('ratings').select('id').eq('rater_id', userId).eq('booking_id', bookingId).maybeSingle(),
    supabase.from('reviews').select('id').eq('reviewer_id', userId).eq('booking_id', bookingId).maybeSingle(),
  ])

  return !!(legacyResult.data || newResult.data)
}

/**
 * Check if user already reviewed this entity (legacy)
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
 * @deprecated Use getUserRatingStats instead
 * Get review statistics for an artist from legacy table
 */
export async function getArtistReviewStats(artistId: string): Promise<LegacyReviewStats> {
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
 * Get review statistics for a provider (legacy)
 */
export async function getProviderReviewStats(providerId: string): Promise<LegacyReviewStats> {
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
 * Get total review count for an entity (legacy)
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
 * @deprecated Use respondToReview instead
 * Add a response to a review (legacy)
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format rating as stars display
 */
export function formatRatingStars(rating: number): string {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

  return '★'.repeat(fullStars) + (hasHalf ? '½' : '') + '☆'.repeat(emptyStars)
}

/**
 * Get review age text (e.g., "vor 2 Tagen")
 */
export function getReviewAgeText(createdAt: string): string {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Heute'
  if (diffDays === 1) return 'Gestern'
  if (diffDays < 7) return `vor ${diffDays} Tagen`
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`
  if (diffDays < 365) return `vor ${Math.floor(diffDays / 30)} Monaten`
  return `vor ${Math.floor(diffDays / 365)} Jahren`
}

/**
 * Calculate time left to review
 */
export function getTimeLeftToReview(eventDate: string): { canReview: boolean; daysLeft: number; text: string } {
  const event = new Date(eventDate)
  const now = new Date()
  const diffMs = now.getTime() - event.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const daysLeft = 14 - diffDays

  if (daysLeft <= 0) {
    return { canReview: false, daysLeft: 0, text: 'Bewertungsfrist abgelaufen' }
  }

  if (daysLeft === 1) {
    return { canReview: true, daysLeft: 1, text: 'Noch 1 Tag zum Bewerten' }
  }

  return { canReview: true, daysLeft, text: `Noch ${daysLeft} Tage zum Bewerten` }
}

/**
 * Get categories based on reviewer type
 */
export function getCategoriesForReviewerType(reviewerType: ReviewerType) {
  return reviewerType === 'client' ? ARTIST_REVIEW_CATEGORIES : CLIENT_REVIEW_CATEGORIES
}
