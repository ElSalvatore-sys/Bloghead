import { supabase } from '../lib/supabase'

export interface BookingRequest {
  id: string
  requester_id: string
  recipient_id: string
  recipient_type: 'artist' | 'service_provider'
  event_name: string
  event_date: string
  event_time?: string
  location?: string
  expected_guests?: number
  budget_min?: number
  budget_max?: number
  message?: string
  response_message?: string
  status: 'pending' | 'accepted' | 'declined' | 'negotiating' | 'cancelled'
  created_at: string
  updated_at: string
  // Joined data
  requester?: {
    full_name: string
    email: string
    company_name?: string
  }
  recipient_artist?: {
    artist_name?: string
    profile_image_url?: string
  }
  recipient_provider?: {
    business_name?: string
    profile_image_url?: string
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
    artist_name: string
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
  let query = supabase
    .from('booking_requests')
    .select(`
      *,
      requester:users!requester_id(full_name, email),
      recipient_artist:artist_profiles!recipient_id(artist_name, profile_image_url),
      recipient_provider:service_provider_profiles!recipient_id(business_name, profile_image_url)
    `)

  if (direction === 'incoming') {
    query = query.eq('recipient_id', userId)
  } else {
    query = query.eq('requester_id', userId)
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  return { data, error }
}

// Create a new booking request
export async function createBookingRequest(request: Partial<BookingRequest>) {
  const { data, error } = await supabase
    .from('booking_requests')
    .insert(request)
    .select()
    .single()

  return { data, error }
}

// Update booking request status
export async function updateBookingRequestStatus(
  requestId: string,
  status: BookingRequest['status'],
  responseMessage?: string
) {
  const { data, error } = await supabase
    .from('booking_requests')
    .update({
      status,
      response_message: responseMessage,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
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
      artist_profile:artist_profiles(artist_name, profile_image_url),
      provider_profile:service_provider_profiles(business_name, profile_image_url),
      organizer:users!organizer_id(full_name)
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
