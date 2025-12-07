import { supabase } from '../lib/supabase'

// Availability status types
export type AvailabilityStatus = 'available' | 'booked' | 'pending' | 'blocked' | 'open_gig'
export type AvailabilityVisibility = 'visible' | 'visible_with_name' | 'hidden'

// Time slot for granular availability
export interface TimeSlot {
  start: string // HH:MM format
  end: string   // HH:MM format
  status: AvailabilityStatus
  notes?: string
}

// Availability entry for a single date
export interface AvailabilityEntry {
  id: string
  artist_id: string
  date: string // YYYY-MM-DD
  time_slots: TimeSlot[] | null
  status: AvailabilityStatus
  visibility: AvailabilityVisibility
  booking_id: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
  // Joined booking data
  booking?: {
    id: string
    booking_number: string
    event_type: string | null
    event_location_name: string | null
    client_id: string | null
    total_price: number
  } | null
}

// Stats for the calendar
export interface CalendarStats {
  availableDays: number
  bookedDays: number
  pendingDays: number
  blockedDays: number
  openGigDays: number
  upcomingBookings: number
}

// Get availability for a date range
export async function getAvailability(
  artistId: string,
  startDate: string,
  endDate: string
): Promise<{ data: AvailabilityEntry[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_availability')
    .select(`
      *,
      booking:bookings!booking_id(
        id,
        booking_number,
        event_type,
        event_location_name,
        client_id,
        total_price
      )
    `)
    .eq('artist_id', artistId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  return { data: data as AvailabilityEntry[] | null, error }
}

// Get availability for a specific date
export async function getAvailabilityForDate(
  artistId: string,
  date: string
): Promise<{ data: AvailabilityEntry | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_availability')
    .select(`
      *,
      booking:bookings!booking_id(
        id,
        booking_number,
        event_type,
        event_location_name,
        client_id,
        total_price
      )
    `)
    .eq('artist_id', artistId)
    .eq('date', date)
    .maybeSingle()

  return { data: data as AvailabilityEntry | null, error }
}

// Set availability for a date (upsert)
export async function setAvailability(
  artistId: string,
  date: string,
  status: AvailabilityStatus,
  options?: {
    timeSlots?: TimeSlot[]
    visibility?: AvailabilityVisibility
    notes?: string
    bookingId?: string
  }
): Promise<{ data: AvailabilityEntry | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_availability')
    .upsert(
      {
        artist_id: artistId,
        date,
        status,
        time_slots: options?.timeSlots || null,
        visibility: options?.visibility || 'visible',
        notes: options?.notes || null,
        booking_id: options?.bookingId || null,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'artist_id,date' }
    )
    .select()
    .single()

  return { data: data as AvailabilityEntry | null, error }
}

// Set availability for multiple dates (bulk)
export async function setAvailabilityBulk(
  artistId: string,
  dates: string[],
  status: AvailabilityStatus,
  options?: {
    visibility?: AvailabilityVisibility
    notes?: string
  }
): Promise<{ data: AvailabilityEntry[] | null; error: Error | null }> {
  const entries = dates.map(date => ({
    artist_id: artistId,
    date,
    status,
    visibility: options?.visibility || 'visible',
    notes: options?.notes || null,
    time_slots: null,
    booking_id: null,
    updated_at: new Date().toISOString()
  }))

  const { data, error } = await supabase
    .from('artist_availability')
    .upsert(entries, { onConflict: 'artist_id,date' })
    .select()

  return { data: data as AvailabilityEntry[] | null, error }
}

// Delete availability for a date (removes entry, makes it "unset")
export async function deleteAvailability(
  artistId: string,
  date: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('artist_availability')
    .delete()
    .eq('artist_id', artistId)
    .eq('date', date)

  return { error }
}

// Delete availability for multiple dates
export async function deleteAvailabilityBulk(
  artistId: string,
  dates: string[]
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('artist_availability')
    .delete()
    .eq('artist_id', artistId)
    .in('date', dates)

  return { error }
}

// Get calendar stats for a month
export async function getCalendarStats(
  artistId: string,
  month: number,
  year: number
): Promise<CalendarStats> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('artist_availability')
    .select('status, date')
    .eq('artist_id', artistId)
    .gte('date', startDate)
    .lte('date', endDate)

  const stats: CalendarStats = {
    availableDays: 0,
    bookedDays: 0,
    pendingDays: 0,
    blockedDays: 0,
    openGigDays: 0,
    upcomingBookings: 0
  }

  if (data) {
    data.forEach(entry => {
      switch (entry.status) {
        case 'available':
          stats.availableDays++
          break
        case 'booked':
          stats.bookedDays++
          if (entry.date >= today) {
            stats.upcomingBookings++
          }
          break
        case 'pending':
          stats.pendingDays++
          break
        case 'blocked':
          stats.blockedDays++
          break
        case 'open_gig':
          stats.openGigDays++
          break
      }
    })
  }

  return stats
}

// Get bookings for a specific date (from bookings table)
export async function getBookingsForDate(
  artistId: string,
  date: string
): Promise<{ data: unknown[] | null; error: Error | null }> {
  const { data, error } = await supabase
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
    .eq('artist_id', artistId)
    .eq('event_date', date)
    .neq('status', 'cancelled')
    .order('event_time_start', { ascending: true })

  return { data, error }
}

// Generate dates for a week (for quick block actions)
export function getWeekDates(startDate: Date): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)

  // Get to start of week (Monday)
  const day = current.getDay()
  const diff = current.getDate() - day + (day === 0 ? -6 : 1)
  current.setDate(diff)

  for (let i = 0; i < 7; i++) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}

// Generate dates for a month
export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = []
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    dates.push(date)
  }

  return dates
}

// Generate weekends for a month
export function getWeekendDates(year: number, month: number): string[] {
  const dates: string[] = []
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      dates.push(date.toISOString().split('T')[0])
    }
  }

  return dates
}

// Generate weekdays for a month
export function getWeekdayDates(year: number, month: number): string[] {
  const dates: string[] = []
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(date.toISOString().split('T')[0])
    }
  }

  return dates
}

// Status display configuration
export const AVAILABILITY_STATUS_CONFIG: Record<AvailabilityStatus, {
  label: string
  color: string
  bgColor: string
  icon: string
}> = {
  available: {
    label: 'Verfügbar',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    icon: 'check-circle'
  },
  booked: {
    label: 'Gebucht',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    icon: 'calendar-check'
  },
  pending: {
    label: 'Anfrage ausstehend',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    icon: 'clock'
  },
  blocked: {
    label: 'Blockiert',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    icon: 'x-circle'
  },
  open_gig: {
    label: 'Open Gig',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    icon: 'music'
  }
}

// Format date for display (German locale)
export function formatDateGerman(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Format date short
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit'
  })
}

// Check if date is in the past
export function isDatePast(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  return date < today
}

// Check if date is today
export function isDateToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}
