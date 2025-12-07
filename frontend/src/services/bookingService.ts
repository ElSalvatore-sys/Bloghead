import { supabase } from '../lib/supabase'

export interface BookingRequest {
  id: string
  artist_id: string | null
  requester_id: string | null
  veranstalter_id: string | null
  event_date: string
  event_time_start: string | null
  event_time_end: string | null
  event_type: string | null
  event_location_name: string | null
  event_location_address: string | null
  event_location_maps_link: string | null
  event_size: number | null
  event_description: string | null
  equipment_available: string | null
  equipment_needed: string | null
  hospitality_unterbringung: boolean | null
  hospitality_verpflegung: boolean | null
  transport_type: string | null
  proposed_budget: number | null
  agreed_price: number | null
  deposit_amount: number | null
  message: string | null
  status: 'pending' | 'accepted' | 'declined' | 'negotiating' | 'cancelled' | 'expired'
  rejection_reason: string | null
  expires_at: string | null
  responded_at: string | null
  created_at: string
  updated_at: string | null
  // Joined data
  requester?: {
    id: string
    membername: string
    vorname: string
    nachname: string
    profile_image_url: string | null
  }
  artist?: {
    id: string
    kuenstlername: string
    jobbezeichnung: string | null
    star_rating: number | null
  }
  veranstalter?: {
    id: string
    membername: string
    profile_image_url: string | null
  }
}

export interface Booking {
  id: string
  booking_number: string
  request_id: string
  artist_id?: string
  provider_id?: string
  organizer_id: string
  event_name: string
  event_date: string
  event_time: string
  location: string
  expected_guests: number
  agreed_price: number
  status: 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  // Joined data
  artist_profile?: {
    kuenstlername: string
    profile_image_url?: string
  }
  provider_profile?: {
    business_name: string
    profile_image_url?: string
  }
  organizer?: {
    full_name: string
    company_name?: string
  }
}

// Get booking requests for current user (incoming or outgoing)
export async function getBookingRequests(
  userId: string,
  direction: 'incoming' | 'outgoing',
  status?: string
) {
  console.log('[bookingService] Fetching requests:', { userId, direction, status })

  let query = supabase
    .from('booking_requests')
    .select(`
      *,
      requester:users!requester_id(
        id,
        membername,
        vorname,
        nachname,
        profile_image_url
      ),
      artist:artist_profiles!artist_id(
        id,
        kuenstlername,
        jobbezeichnung,
        star_rating
      )
    `)

  if (direction === 'incoming') {
    // Incoming: I'm the artist receiving requests
    query = query.eq('artist_id', userId)
  } else {
    // Outgoing: I'm the requester sending requests
    query = query.eq('requester_id', userId)
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  console.log('[bookingService] Query result:', { data, error, count: data?.length })

  return { data, error }
}

// Get request stats for dashboard
export async function getRequestStats(userId: string) {
  // Get pending incoming count
  const { count: pendingCount } = await supabase
    .from('booking_requests')
    .select('id', { count: 'exact', head: true })
    .eq('artist_id', userId)
    .eq('status', 'pending')

  // Get total incoming count
  const { count: totalIncoming } = await supabase
    .from('booking_requests')
    .select('id', { count: 'exact', head: true })
    .eq('artist_id', userId)

  // Get accepted count
  const { count: acceptedCount } = await supabase
    .from('booking_requests')
    .select('id', { count: 'exact', head: true })
    .eq('artist_id', userId)
    .eq('status', 'accepted')

  // Get outgoing count
  const { count: outgoingCount } = await supabase
    .from('booking_requests')
    .select('id', { count: 'exact', head: true })
    .eq('requester_id', userId)

  // Calculate response rate
  const responseRate = totalIncoming && totalIncoming > 0
    ? Math.round(((acceptedCount || 0) / totalIncoming) * 100)
    : 0

  return {
    pending: pendingCount || 0,
    totalIncoming: totalIncoming || 0,
    accepted: acceptedCount || 0,
    outgoing: outgoingCount || 0,
    responseRate
  }
}

// Create a new booking request
export async function createBookingRequest(request: Partial<BookingRequest>) {
  const { data, error } = await supabase
    .from('booking_requests')
    .insert({
      ...request,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

// Update booking request status
export async function updateBookingRequestStatus(
  requestId: string,
  status: BookingRequest['status'],
  rejectionReason?: string
) {
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
    responded_at: new Date().toISOString()
  }

  if (rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }

  const { data, error } = await supabase
    .from('booking_requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single()

  return { data, error }
}

// Cancel an outgoing request
export async function cancelBookingRequest(requestId: string, userId: string, reason?: string) {
  const { data, error } = await supabase
    .from('booking_requests')
    .update({
      status: 'cancelled',
      cancelled_by: userId,
      cancellation_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .eq('requester_id', userId) // Only requester can cancel their own request
    .select()
    .single()

  return { data, error }
}

// Get bookings for current user
export async function getBookings(userId: string, type: 'upcoming' | 'past') {
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('bookings')
    .select(`
      *,
      artist_profile:artist_profiles(kuenstlername, profile_image_url),
      provider_profile:service_provider_profiles(business_name, profile_image_url),
      organizer:users!organizer_id(membername, vorname, nachname)
    `)
    .or(`artist_id.eq.${userId},provider_id.eq.${userId},organizer_id.eq.${userId}`)

  if (type === 'upcoming') {
    query = query.gte('event_date', today).neq('status', 'cancelled')
  } else {
    query = query.lt('event_date', today)
  }

  query = query.order('event_date', { ascending: type === 'upcoming' })

  const { data, error } = await query
  return { data, error }
}

// Get booking by ID
export async function getBookingById(bookingId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      artist_profile:artist_profiles(*),
      provider_profile:service_provider_profiles(*),
      organizer:users!organizer_id(*),
      request:booking_requests(*)
    `)
    .eq('id', bookingId)
    .single()

  return { data, error }
}

// Get booking stats for dashboard
export async function getBookingStats(userId: string) {
  const today = new Date().toISOString().split('T')[0]

  // Get upcoming count
  const { count: upcomingCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .or(`artist_id.eq.${userId},provider_id.eq.${userId},organizer_id.eq.${userId}`)
    .gte('event_date', today)
    .neq('status', 'cancelled')

  // Get completed count
  const { count: completedCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .or(`artist_id.eq.${userId},provider_id.eq.${userId}`)
    .eq('status', 'completed')

  // Get total revenue
  const { data: revenueData } = await supabase
    .from('bookings')
    .select('agreed_price')
    .or(`artist_id.eq.${userId},provider_id.eq.${userId}`)
    .eq('status', 'completed')

  const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.agreed_price || 0), 0) || 0

  // Get this month's bookings count
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: thisMonthCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .or(`artist_id.eq.${userId},provider_id.eq.${userId},organizer_id.eq.${userId}`)
    .gte('event_date', startOfMonth.toISOString().split('T')[0])
    .lte('event_date', today)

  return {
    upcoming: upcomingCount || 0,
    completed: completedCount || 0,
    thisMonth: thisMonthCount || 0,
    totalRevenue
  }
}

// Generate booking number
export function generateBookingNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return `BH-${year}-${random}`
}

// Event type icons mapping
export const EVENT_TYPE_ICONS: Record<string, string> = {
  'konzert': '🎵',
  'hochzeit': '💒',
  'firmenfeier': '🏢',
  'geburtstag': '🎂',
  'festival': '🎪',
  'club': '🎧',
  'privat': '🏠',
  'messe': '📊',
  'gala': '✨',
  'other': '📅'
}

// Get event type icon
export function getEventTypeIcon(eventType: string | null): string {
  if (!eventType) return EVENT_TYPE_ICONS.other
  const key = eventType.toLowerCase()
  return EVENT_TYPE_ICONS[key] || EVENT_TYPE_ICONS.other
}

// Format time range
export function formatTimeRange(start: string | null, end: string | null): string {
  if (!start) return 'Zeit nicht angegeben'
  const startFormatted = start.slice(0, 5) // HH:MM
  if (!end) return `ab ${startFormatted} Uhr`
  const endFormatted = end.slice(0, 5)
  return `${startFormatted} - ${endFormatted} Uhr`
}

// Calculate expiration status
export function getExpirationStatus(expiresAt: string | null): {
  isExpired: boolean
  isExpiringSoon: boolean
  daysLeft: number | null
  text: string
} {
  if (!expiresAt) {
    return { isExpired: false, isExpiringSoon: false, daysLeft: null, text: '' }
  }

  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry.getTime() - now.getTime()
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs <= 0) {
    return { isExpired: true, isExpiringSoon: false, daysLeft: 0, text: 'Abgelaufen' }
  }

  if (daysLeft <= 2) {
    return {
      isExpired: false,
      isExpiringSoon: true,
      daysLeft,
      text: daysLeft === 1 ? 'Läuft morgen ab' : `Läuft in ${daysLeft} Tagen ab`
    }
  }

  return {
    isExpired: false,
    isExpiringSoon: false,
    daysLeft,
    text: `Gültig noch ${daysLeft} Tage`
  }
}
