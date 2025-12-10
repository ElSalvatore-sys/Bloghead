import { supabase } from '../lib/supabase'
import type {
  ArtistAvailability,
  AvailabilityStatus,
  AvailabilityUpdate,
  TimeSlot,
  CalendarDay
} from '../types/booking'

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
  request_id: string | null
  artist_id: string | null
  client_id: string | null
  veranstalter_id: string | null
  // Event details
  event_date: string
  event_time_start: string | null
  event_time_end: string | null
  event_type: string | null
  event_location_name: string | null
  event_location_address: string | null
  event_size: number | null
  // Contract
  contract_url: string | null
  contract_signed_artist: boolean
  contract_signed_artist_at: string | null
  contract_signed_client: boolean
  contract_signed_client_at: string | null
  // Financials
  total_price: number
  deposit_amount: number | null
  deposit_due_date: string | null
  deposit_paid_at: string | null
  final_payment_amount: number | null
  final_payment_due_date: string | null
  final_payment_paid_at: string | null
  // Platform fees
  platform_fee_percentage: number | null
  platform_fee_amount: number | null
  artist_payout_amount: number | null
  // Payout
  payout_status: 'pending' | 'scheduled' | 'processing' | 'completed' | 'failed' | null
  payout_scheduled_date: string | null
  payout_completed_at: string | null
  // Status
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed' | 'refunded'
  // Cancellation
  cancellation_policy: string | null
  cancellation_fee_percentage: number | null
  cancelled_at: string | null
  cancelled_by: string | null
  cancellation_reason: string | null
  // Calendar
  google_calendar_event_id: string | null
  apple_calendar_event_id: string | null
  ical_uid: string | null
  // Timestamps
  created_at: string
  updated_at: string | null
  // Joined data
  artist_profile?: {
    id: string
    kuenstlername: string
    jobbezeichnung: string | null
    star_rating: number | null
  } | null
  client?: {
    id: string
    membername: string
    vorname: string
    nachname: string
    profile_image_url: string | null
  } | null
  veranstalter?: {
    id: string
    company_name: string | null
    location_name: string | null
  } | null
  request?: BookingRequest | null
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
      artist_profile:artist_profiles!artist_id(
        id,
        kuenstlername,
        jobbezeichnung,
        star_rating
      ),
      client:users!client_id(
        id,
        membername,
        vorname,
        nachname,
        profile_image_url
      ),
      veranstalter:veranstalter_profiles!veranstalter_id(
        id,
        company_name,
        location_name
      ),
      request:booking_requests!request_id(*)
    `)
    .or(`artist_id.eq.${userId},client_id.eq.${userId},veranstalter_id.eq.${userId}`)

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
      artist_profile:artist_profiles!artist_id(
        id,
        kuenstlername,
        jobbezeichnung,
        star_rating,
        user_id
      ),
      client:users!client_id(
        id,
        membername,
        vorname,
        nachname,
        profile_image_url,
        email
      ),
      veranstalter:veranstalter_profiles!veranstalter_id(
        id,
        company_name,
        location_name,
        address
      ),
      request:booking_requests!request_id(*)
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
    .or(`artist_id.eq.${userId},client_id.eq.${userId},veranstalter_id.eq.${userId}`)
    .gte('event_date', today)
    .neq('status', 'cancelled')

  // Get completed count
  const { count: completedCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .or(`artist_id.eq.${userId},client_id.eq.${userId},veranstalter_id.eq.${userId}`)
    .eq('status', 'completed')

  // Get total revenue (for artists: artist_payout_amount, for clients: total_price)
  const { data: revenueData } = await supabase
    .from('bookings')
    .select('total_price, artist_payout_amount, artist_id')
    .or(`artist_id.eq.${userId},client_id.eq.${userId}`)
    .eq('status', 'completed')

  // Calculate revenue based on user role
  const totalRevenue = revenueData?.reduce((sum, b) => {
    // If user is the artist, show payout amount
    if (b.artist_id === userId) {
      return sum + (b.artist_payout_amount || b.total_price || 0)
    }
    // If user is the client, show total price they paid
    return sum + (b.total_price || 0)
  }, 0) || 0

  // Get this month's bookings count
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: thisMonthCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .or(`artist_id.eq.${userId},client_id.eq.${userId},veranstalter_id.eq.${userId}`)
    .gte('event_date', startOfMonth.toISOString().split('T')[0])
    .lte('event_date', today)

  // Get pending payout amount (for artists)
  const { data: pendingPayoutData } = await supabase
    .from('bookings')
    .select('artist_payout_amount')
    .eq('artist_id', userId)
    .eq('status', 'completed')
    .is('payout_completed_at', null)

  const pendingPayout = pendingPayoutData?.reduce((sum, b) => sum + (b.artist_payout_amount || 0), 0) || 0

  return {
    upcoming: upcomingCount || 0,
    completed: completedCount || 0,
    thisMonth: thisMonthCount || 0,
    totalRevenue,
    pendingPayout
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

// Payment milestone status
export interface PaymentMilestone {
  label: string
  amount: number | null
  dueDate: string | null
  paidAt: string | null
  isPaid: boolean
  isOverdue: boolean
  daysUntilDue: number | null
}

// Get payment milestones for a booking
export function getPaymentMilestones(booking: Booking): PaymentMilestone[] {
  const today = new Date()
  const milestones: PaymentMilestone[] = []

  // Deposit milestone
  if (booking.deposit_amount) {
    const depositDue = booking.deposit_due_date ? new Date(booking.deposit_due_date) : null
    const daysUntilDeposit = depositDue ? Math.ceil((depositDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null

    milestones.push({
      label: 'Anzahlung',
      amount: booking.deposit_amount,
      dueDate: booking.deposit_due_date,
      paidAt: booking.deposit_paid_at,
      isPaid: !!booking.deposit_paid_at,
      isOverdue: !booking.deposit_paid_at && depositDue ? depositDue < today : false,
      daysUntilDue: booking.deposit_paid_at ? null : daysUntilDeposit
    })
  }

  // Final payment milestone
  if (booking.final_payment_amount) {
    const finalDue = booking.final_payment_due_date ? new Date(booking.final_payment_due_date) : null
    const daysUntilFinal = finalDue ? Math.ceil((finalDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null

    milestones.push({
      label: 'Restzahlung',
      amount: booking.final_payment_amount,
      dueDate: booking.final_payment_due_date,
      paidAt: booking.final_payment_paid_at,
      isPaid: !!booking.final_payment_paid_at,
      isOverdue: !booking.final_payment_paid_at && finalDue ? finalDue < today : false,
      daysUntilDue: booking.final_payment_paid_at ? null : daysUntilFinal
    })
  }

  return milestones
}

// Contract status helper
export interface ContractStatus {
  label: string
  color: 'green' | 'yellow' | 'gray' | 'red'
  artistSigned: boolean
  clientSigned: boolean
  fullyExecuted: boolean
  pendingParty: 'artist' | 'client' | null
}

export function getContractStatus(booking: Booking): ContractStatus {
  const artistSigned = booking.contract_signed_artist
  const clientSigned = booking.contract_signed_client

  if (!booking.contract_url) {
    return {
      label: 'Kein Vertrag',
      color: 'gray',
      artistSigned: false,
      clientSigned: false,
      fullyExecuted: false,
      pendingParty: null
    }
  }

  if (artistSigned && clientSigned) {
    return {
      label: 'Vollständig unterschrieben',
      color: 'green',
      artistSigned: true,
      clientSigned: true,
      fullyExecuted: true,
      pendingParty: null
    }
  }

  if (!artistSigned && !clientSigned) {
    return {
      label: 'Warten auf Unterschriften',
      color: 'yellow',
      artistSigned: false,
      clientSigned: false,
      fullyExecuted: false,
      pendingParty: 'artist'
    }
  }

  return {
    label: artistSigned ? 'Warten auf Kunde' : 'Warten auf Künstler',
    color: 'yellow',
    artistSigned,
    clientSigned,
    fullyExecuted: false,
    pendingParty: artistSigned ? 'client' : 'artist'
  }
}

// Payout status helper
export interface PayoutStatus {
  label: string
  color: 'green' | 'yellow' | 'blue' | 'red' | 'gray'
  amount: number | null
  scheduledDate: string | null
  completedAt: string | null
}

export function getPayoutStatus(booking: Booking): PayoutStatus {
  if (!booking.artist_payout_amount) {
    return {
      label: 'Nicht festgelegt',
      color: 'gray',
      amount: null,
      scheduledDate: null,
      completedAt: null
    }
  }

  if (booking.payout_completed_at) {
    return {
      label: 'Ausgezahlt',
      color: 'green',
      amount: booking.artist_payout_amount,
      scheduledDate: booking.payout_scheduled_date,
      completedAt: booking.payout_completed_at
    }
  }

  if (booking.payout_status === 'failed') {
    return {
      label: 'Fehlgeschlagen',
      color: 'red',
      amount: booking.artist_payout_amount,
      scheduledDate: booking.payout_scheduled_date,
      completedAt: null
    }
  }

  if (booking.payout_status === 'processing') {
    return {
      label: 'In Bearbeitung',
      color: 'blue',
      amount: booking.artist_payout_amount,
      scheduledDate: booking.payout_scheduled_date,
      completedAt: null
    }
  }

  if (booking.payout_scheduled_date) {
    return {
      label: 'Geplant',
      color: 'yellow',
      amount: booking.artist_payout_amount,
      scheduledDate: booking.payout_scheduled_date,
      completedAt: null
    }
  }

  return {
    label: 'Ausstehend',
    color: 'yellow',
    amount: booking.artist_payout_amount,
    scheduledDate: null,
    completedAt: null
  }
}

// Booking status configuration
export const BOOKING_STATUS_CONFIG: Record<Booking['status'], { label: string; color: string; bgColor: string }> = {
  confirmed: { label: 'Bestätigt', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  in_progress: { label: 'Läuft', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  completed: { label: 'Abgeschlossen', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  cancelled: { label: 'Storniert', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  disputed: { label: 'Streitfall', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  refunded: { label: 'Erstattet', color: 'text-purple-400', bgColor: 'bg-purple-500/20' }
}

// Calendar sync status
export interface CalendarSyncStatus {
  hasGoogleSync: boolean
  hasAppleSync: boolean
  hasIcalSync: boolean
  anySync: boolean
}

export function getCalendarSyncStatus(booking: Booking): CalendarSyncStatus {
  return {
    hasGoogleSync: !!booking.google_calendar_event_id,
    hasAppleSync: !!booking.apple_calendar_event_id,
    hasIcalSync: !!booking.ical_uid,
    anySync: !!(booking.google_calendar_event_id || booking.apple_calendar_event_id || booking.ical_uid)
  }
}

// ============================================
// ARTIST AVAILABILITY FUNCTIONS
// ============================================

// Get artist availability for a month
export async function getArtistAvailability(
  artistId: string,
  year: number,
  month: number
): Promise<{ data: ArtistAvailability[] | null; error: Error | null }> {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  const { data, error } = await supabase
    .from('artist_availability')
    .select('*')
    .eq('artist_id', artistId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  return { data: data as ArtistAvailability[] | null, error }
}

// Get availability for a date range (useful for multi-month views)
export async function getArtistAvailabilityRange(
  artistId: string,
  startDate: string,
  endDate: string
): Promise<{ data: ArtistAvailability[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_availability')
    .select('*')
    .eq('artist_id', artistId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  return { data: data as ArtistAvailability[] | null, error }
}

// Set availability for a single date
export async function setArtistAvailability(
  artistId: string,
  date: string,
  status: AvailabilityStatus,
  timeSlots?: TimeSlot[],
  notes?: string
): Promise<{ data: ArtistAvailability | null; error: Error | null }> {
  // Check if availability already exists for this date
  const { data: existing } = await supabase
    .from('artist_availability')
    .select('id')
    .eq('artist_id', artistId)
    .eq('date', date)
    .single()

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('artist_availability')
      .update({
        status,
        time_slots: timeSlots || null,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    return { data: data as ArtistAvailability | null, error }
  } else {
    // Create new
    const { data, error } = await supabase
      .from('artist_availability')
      .insert({
        artist_id: artistId,
        date,
        status,
        time_slots: timeSlots || null,
        notes: notes || null,
        visibility: 'visible',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data: data as ArtistAvailability | null, error }
  }
}

// Bulk update availability for multiple dates
export async function setArtistAvailabilityBulk(
  artistId: string,
  updates: AvailabilityUpdate[]
): Promise<{ success: boolean; error: Error | null }> {
  try {
    for (const update of updates) {
      const { error } = await setArtistAvailability(
        artistId,
        update.date,
        update.status,
        update.time_slots,
        update.notes
      )
      if (error) {
        return { success: false, error }
      }
    }
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err as Error }
  }
}

// Delete availability entry (revert to default available)
export async function deleteArtistAvailability(
  artistId: string,
  date: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('artist_availability')
    .delete()
    .eq('artist_id', artistId)
    .eq('date', date)

  return { success: !error, error }
}

// Block a date range (useful for vacations, etc.)
export async function blockDateRange(
  artistId: string,
  startDate: string,
  endDate: string,
  notes?: string
): Promise<{ success: boolean; error: Error | null }> {
  const updates: AvailabilityUpdate[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    updates.push({
      date: d.toISOString().split('T')[0],
      status: 'blocked',
      notes
    })
  }

  return setArtistAvailabilityBulk(artistId, updates)
}

// Get calendar days with availability status for display
export function getCalendarDaysWithAvailability(
  year: number,
  month: number,
  availability: ArtistAvailability[]
): CalendarDay[] {
  const days: CalendarDay[] = []
  const lastDay = new Date(year, month + 1, 0)

  // Create a map for quick lookup
  const availabilityMap = new Map<string, ArtistAvailability>()
  availability.forEach(a => availabilityMap.set(a.date, a))

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    const dateStr = date.toISOString().split('T')[0]
    const avail = availabilityMap.get(dateStr)

    days.push({
      date: dateStr,
      status: avail?.status || 'available',
      hasTimeSlots: !!(avail?.time_slots && avail.time_slots.length > 0),
      notes: avail?.notes || undefined,
      bookingId: avail?.booking_id || undefined
    })
  }

  return days
}

// ============================================
// BOOKING MANAGEMENT (Extended)
// ============================================

// Get bookings for artist (by artist_profile.id)
export async function getBookingsForArtist(
  artistProfileId: string,
  status?: BookingRequest['status']
): Promise<{ data: Booking[] | null; error: Error | null }> {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      client:users!client_id(
        id,
        membername,
        vorname,
        nachname,
        profile_image_url
      )
    `)
    .eq('artist_id', artistProfileId)
    .order('event_date', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  return { data: data as Booking[] | null, error }
}

// Get bookings for customer
export async function getBookingsForCustomer(
  customerId: string,
  status?: BookingRequest['status']
): Promise<{ data: Booking[] | null; error: Error | null }> {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      artist_profile:artist_profiles!artist_id(
        id,
        kuenstlername,
        jobbezeichnung,
        star_rating,
        user_id
      )
    `)
    .eq('client_id', customerId)
    .order('event_date', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  return { data: data as Booking[] | null, error }
}

// Update booking status
export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status'],
  cancellationReason?: string,
  cancelledBy?: string
): Promise<{ data: Booking | null; error: Error | null }> {
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString()
  }

  if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString()
    if (cancellationReason) updateData.cancellation_reason = cancellationReason
    if (cancelledBy) updateData.cancelled_by = cancelledBy
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .select()
    .single()

  return { data: data as Booking | null, error }
}

// Cancel booking with availability update
export async function cancelBooking(
  bookingId: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error: Error | null }> {
  // First, get the booking to find the artist and date
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('artist_id, event_date')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) {
    return { success: false, error: fetchError }
  }

  // Update booking status
  const { error: updateError } = await updateBookingStatus(
    bookingId,
    'cancelled',
    reason,
    userId
  )

  if (updateError) {
    return { success: false, error: updateError }
  }

  // Update availability back to available
  if (booking.artist_id && booking.event_date) {
    await setArtistAvailability(
      booking.artist_id,
      booking.event_date,
      'available',
      undefined,
      'Buchung storniert'
    )
  }

  return { success: true, error: null }
}

// Create a confirmed booking from an accepted request
export async function createBookingFromRequest(
  requestId: string,
  totalPrice: number,
  depositAmount?: number
): Promise<{ data: Booking | null; error: Error | null }> {
  // Get the request details
  const { data: request, error: requestError } = await supabase
    .from('booking_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (requestError || !request) {
    return { data: null, error: requestError }
  }

  // Generate booking number
  const bookingNumber = generateBookingNumber()

  // Create booking
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      booking_number: bookingNumber,
      request_id: requestId,
      artist_id: request.artist_id,
      client_id: request.requester_id,
      veranstalter_id: request.veranstalter_id,
      event_date: request.event_date,
      event_time_start: request.event_time_start,
      event_time_end: request.event_time_end,
      event_type: request.event_type,
      event_location_name: request.event_location_name,
      event_location_address: request.event_location_address,
      event_size: request.event_size,
      total_price: totalPrice,
      deposit_amount: depositAmount,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (!error && data && request.artist_id && request.event_date) {
    // Update artist availability to booked
    await setArtistAvailability(
      request.artist_id,
      request.event_date,
      'booked',
      undefined,
      `Buchung ${bookingNumber}`
    )

    // Update request status to confirmed
    await supabase
      .from('booking_requests')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', requestId)
  }

  return { data: data as Booking | null, error }
}

// Get artist profile ID from user ID
export async function getArtistProfileId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data.id
}
