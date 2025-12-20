import type { UserProfile } from '../contexts/AuthContext'

// Booking status types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress' | 'disputed' | 'refunded'
export type BookingRequestStatus = 'pending' | 'accepted' | 'rejected' | 'negotiating' | 'confirmed' | 'cancelled' | 'completed' | 'expired'

// Event types with German labels
export type EventType = 'wedding' | 'corporate' | 'private_party' | 'club' | 'festival' | 'birthday' | 'concert' | 'gala' | 'other'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: 'Hochzeit',
  corporate: 'Firmenfeier',
  private_party: 'Private Party',
  club: 'Club/Bar',
  festival: 'Festival',
  birthday: 'Geburtstag',
  concert: 'Konzert',
  gala: 'Gala',
  other: 'Sonstiges'
}

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
  value: value as EventType,
  label
}))

// Availability status
export type AvailabilityStatus = 'available' | 'booked' | 'pending' | 'blocked' | 'open_gig'

export const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatus, string> = {
  available: 'Verfuegbar',
  booked: 'Gebucht',
  pending: 'Anfrage ausstehend',
  blocked: 'Blockiert',
  open_gig: 'Offener Gig'
}

export const AVAILABILITY_STATUS_COLORS: Record<AvailabilityStatus, { bg: string; text: string; border: string }> = {
  available: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  booked: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
  blocked: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  open_gig: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' }
}

// Visibility types
export type AvailabilityVisibility = 'visible' | 'visible_with_name' | 'hidden'

// Time slot interface
export interface TimeSlot {
  start: string // HH:MM format
  end: string // HH:MM format
}

// Artist availability interface
export interface ArtistAvailability {
  id: string
  artist_id: string
  date: string // YYYY-MM-DD format
  time_slots: TimeSlot[] | null
  status: AvailabilityStatus
  visibility: AvailabilityVisibility
  booking_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Simplified availability for calendar display
export interface CalendarDay {
  date: string
  status: AvailabilityStatus
  hasTimeSlots: boolean
  notes?: string
  bookingId?: string
}

// Booking interface (simplified version for components)
export interface Booking {
  id: string
  booking_number: string
  artist_id: string
  customer_id: string
  event_date: string
  start_time: string
  end_time: string
  location: string
  location_address?: string
  event_type: EventType
  status: BookingStatus
  price_coins: number
  price_eur: number
  notes?: string
  created_at: string
  updated_at: string
  // Joined data
  artist?: ArtistProfile
  customer?: UserProfile
}

// Artist profile (subset for booking context)
export interface ArtistProfile {
  id: string
  user_id: string
  kuenstlername: string
  jobbezeichnung?: string
  star_rating?: number
  preis_pro_stunde?: number
  preis_pro_veranstaltung?: number
  profile_image_url?: string
}

// Create booking request input
export interface CreateBookingInput {
  artist_id: string
  customer_id: string
  event_date: string
  start_time: string
  end_time: string
  location: string
  location_address?: string
  event_type: EventType
  notes?: string
  proposed_budget?: number
}

// Availability update input (for bulk updates)
export interface AvailabilityUpdate {
  date: string
  status: AvailabilityStatus
  time_slots?: TimeSlot[]
  notes?: string
}

// Booking status configuration
export const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  pending: { label: 'Ausstehend', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: '⏳' },
  confirmed: { label: 'Bestaetigt', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: '✓' },
  cancelled: { label: 'Storniert', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: '✕' },
  completed: { label: 'Abgeschlossen', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: '✓✓' },
  in_progress: { label: 'Laeuft', color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: '▶' },
  disputed: { label: 'Streitfall', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: '⚠' },
  refunded: { label: 'Erstattet', color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: '↩' }
}

// German day names
export const GERMAN_DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
export const GERMAN_DAY_NAMES_FULL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

// German month names
export const GERMAN_MONTH_NAMES = [
  'Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

// Helper functions
export function formatDateGerman(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getDate()}. ${GERMAN_MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export function formatTimeRange(start: string, end: string): string {
  return `${start.slice(0, 5)} - ${end.slice(0, 5)} Uhr`
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Add days from previous month to fill the first week
  const startDayOfWeek = firstDay.getDay()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i)
    days.push(prevDate)
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // Add days from next month to fill the last week
  const endDayOfWeek = lastDay.getDay()
  for (let i = 1; i < 7 - endDayOfWeek; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function isPastDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0]
}

// =====================================================
// BOOKING MESSAGES
// =====================================================

export type MessageType = 'text' | 'system' | 'offer' | 'counter_offer' | 'file'

export interface BookingMessage {
  id: string
  booking_request_id: string
  sender_id: string
  message: string
  message_type: MessageType
  attachments: string[]
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
  // Joined data
  sender?: {
    id: string
    vorname: string
    nachname: string
    profile_image_url?: string
  }
}

// =====================================================
// BOOKING STATUS HISTORY
// =====================================================

export interface BookingStatusHistory {
  id: string
  booking_request_id: string
  previous_status: string | null
  new_status: string
  changed_by: string | null
  change_reason: string | null
  metadata: Record<string, unknown>
  created_at: string
  // Joined data
  changed_by_user?: {
    id: string
    vorname: string
    nachname: string
  }
}

// =====================================================
// EXTENDED STATUS LABELS & COLORS
// =====================================================

export const BOOKING_REQUEST_STATUS_LABELS: Record<BookingRequestStatus, string> = {
  pending: 'Ausstehend',
  accepted: 'Angenommen',
  rejected: 'Abgelehnt',
  negotiating: 'In Verhandlung',
  confirmed: 'Bestätigt',
  cancelled: 'Storniert',
  completed: 'Abgeschlossen',
  expired: 'Abgelaufen'
}

export const BOOKING_REQUEST_STATUS_COLORS: Record<BookingRequestStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
  accepted: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  negotiating: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  confirmed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  completed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  expired: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' }
}

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  text: 'Nachricht',
  system: 'System',
  offer: 'Angebot',
  counter_offer: 'Gegenangebot',
  file: 'Datei'
}
