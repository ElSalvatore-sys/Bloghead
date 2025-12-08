import { supabase } from '../lib/supabase'

export interface Event {
  id: string
  organizer_id: string
  title: string
  description: string
  event_type: string
  event_date: string
  start_time: string
  end_time?: string
  venue_name?: string
  city: string
  postal_code?: string
  country: string
  address?: string
  is_indoor?: boolean
  is_outdoor?: boolean
  expected_guests?: number
  budget_min?: number
  budget_max?: number
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  is_public: boolean
  cover_image_url?: string
  created_at: string
  updated_at?: string
  organizer?: {
    membername?: string
    vorname?: string
    nachname?: string
  }
}

export interface EventFilters {
  city?: string
  event_type?: string
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
  limit?: number
  offset?: number
}

// Get public events
export async function getEvents(filters: EventFilters = {}) {
  let query = supabase
    .from('events')
    .select(`
      *,
      organizer:users!organizer_id(membername, vorname, nachname)
    `, { count: 'exact' })
    .eq('is_public', true)
    .eq('status', 'published')

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  if (filters.event_type) {
    query = query.eq('event_type', filters.event_type)
  }

  if (filters.dateFrom) {
    query = query.gte('event_date', filters.dateFrom)
  }

  if (filters.dateTo) {
    query = query.lte('event_date', filters.dateTo)
  }

  if (filters.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`)
  }

  const limit = filters.limit || 20
  const offset = filters.offset || 0

  query = query
    .order('event_date', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query
  return { data, error, count }
}

// Get single event
export async function getEventById(eventId: string) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:users!organizer_id(membername, vorname, nachname, email)
    `)
    .eq('id', eventId)
    .single()

  return { data, error }
}

// Get events by organizer
export async function getOrganizerEvents(organizerId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', organizerId)
    .order('event_date', { ascending: false })

  return { data, error }
}

// Create event
export async function createEvent(event: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()

  return { data, error }
}

// Update event
export async function updateEvent(eventId: string, updates: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()

  return { data, error }
}

// Delete event
export async function deleteEvent(eventId: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  return { error }
}

// Get event types for filter
export function getEventTypes() {
  return [
    { id: 'wedding', label: 'Hochzeit', icon: '💒' },
    { id: 'corporate', label: 'Firmenfeier', icon: '🏢' },
    { id: 'birthday', label: 'Geburtstag', icon: '🎂' },
    { id: 'concert', label: 'Konzert', icon: '🎵' },
    { id: 'festival', label: 'Festival', icon: '🎪' },
    { id: 'party', label: 'Party', icon: '🎉' },
    { id: 'exhibition', label: 'Messe', icon: '🎭' },
    { id: 'other', label: 'Sonstiges', icon: '📅' }
  ]
}

// Get cities for filter (common cities in Rhein-Main area)
export function getPopularCities() {
  return [
    'Frankfurt',
    'Wiesbaden',
    'Mainz',
    'Darmstadt',
    'Offenbach',
    'Bad Homburg',
    'Hanau',
    'Rüsselsheim'
  ]
}
