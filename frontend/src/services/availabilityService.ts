/**
 * Artist Availability Service
 * Manages artist availability calendar, rules, blocked dates, and settings
 */

import { supabase } from '../lib/supabase'

// =====================================================
// TYPES
// =====================================================

export type AvailabilityStatus = 'available' | 'booked' | 'blocked' | 'tentative'
export type AvailabilityVisibility = 'visible' | 'no_name' | 'with_link' | 'hidden'
export type RuleType = 'weekly' | 'monthly' | 'always' | 'never'
export type DefaultStatus = 'available' | 'unavailable' | 'request_only'

export interface ArtistAvailability {
  id: string
  artist_id: string
  date: string // ISO date string YYYY-MM-DD
  status: AvailabilityStatus
  visibility: AvailabilityVisibility
  event_name?: string | null
  event_link?: string | null
  booking_id?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface ArtistAvailabilityRule {
  id: string
  artist_id: string
  rule_type: RuleType
  days_of_week?: number[] | null // 0=Sunday, 1=Monday, ... 6=Saturday
  days_of_month?: number[] | null // 1-31
  start_date?: string | null
  end_date?: string | null
  is_available: boolean
  priority: number
  notes?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ArtistBlockedDates {
  id: string
  artist_id: string
  start_date: string
  end_date: string
  reason?: string | null
  notes?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ArtistAvailabilitySettings {
  id: string
  artist_id: string
  default_status: DefaultStatus
  advance_booking_days: number
  minimum_notice_hours: number
  allow_same_day: boolean
  show_calendar_publicly: boolean
  auto_decline_conflicts: boolean
  buffer_hours_before: number
  buffer_hours_after: number
  created_at: string
  updated_at: string
}

// Response from check_artist_availability function
export interface AvailabilityCheck {
  is_available: boolean
  status: AvailabilityStatus
  reason: string
}

// Response from get_artist_availability_range function
export interface AvailabilityRangeItem {
  date: string
  is_available: boolean
  status: AvailabilityStatus
  event_name: string | null
  visibility: AvailabilityVisibility
}

// Input types
export interface SetAvailabilityInput {
  date: string
  status?: AvailabilityStatus
  visibility?: AvailabilityVisibility
  event_name?: string | null
  notes?: string | null
}

export interface CreateRuleInput {
  rule_type: RuleType
  days_of_week?: number[]
  days_of_month?: number[]
  start_date?: string
  end_date?: string
  is_available?: boolean
  priority?: number
  notes?: string
}

export interface BlockDatesInput {
  start_date: string
  end_date: string
  reason?: string
  notes?: string
}

export interface UpdateSettingsInput {
  default_status?: DefaultStatus
  advance_booking_days?: number
  minimum_notice_hours?: number
  allow_same_day?: boolean
  show_calendar_publicly?: boolean
  auto_decline_conflicts?: boolean
  buffer_hours_before?: number
  buffer_hours_after?: number
}

// =====================================================
// AVAILABILITY ENTRIES (Single Dates)
// =====================================================

/**
 * Get availability for a specific date
 */
export async function getAvailabilityForDate(
  artistId: string,
  date: string
): Promise<{ data: ArtistAvailability | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_availability')
    .select('*')
    .eq('artist_id', artistId)
    .eq('date', date)
    .single()

  return { data, error: error as Error | null }
}

/**
 * Get all availability entries for an artist within a date range
 */
export async function getAvailabilityEntries(
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

  return { data, error: error as Error | null }
}

/**
 * Set availability for a single date (upsert)
 */
export async function setAvailability(
  artistId: string,
  input: SetAvailabilityInput
): Promise<{ data: ArtistAvailability | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_availability')
    .upsert({
      artist_id: artistId,
      date: input.date,
      status: input.status || 'available',
      visibility: input.visibility || 'visible',
      event_name: input.event_name,
      notes: input.notes,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'artist_id,date'
    })
    .select()
    .single()

  return { data, error: error as Error | null }
}

/**
 * Set availability for multiple dates at once
 */
export async function setBulkAvailability(
  artistId: string,
  dates: string[],
  status: AvailabilityStatus,
  visibility: AvailabilityVisibility = 'visible'
): Promise<{ data: ArtistAvailability[] | null; error: Error | null }> {
  const entries = dates.map(date => ({
    artist_id: artistId,
    date,
    status,
    visibility,
    updated_at: new Date().toISOString()
  }))

  const { data, error } = await supabase
    .from('artist_availability')
    .upsert(entries, { onConflict: 'artist_id,date' })
    .select()

  return { data, error: error as Error | null }
}

/**
 * Delete a specific availability entry
 */
export async function deleteAvailabilityEntry(
  artistId: string,
  date: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('artist_availability')
    .delete()
    .eq('artist_id', artistId)
    .eq('date', date)

  return { error: error as Error | null }
}

// =====================================================
// AVAILABILITY RULES (Recurring Patterns)
// =====================================================

/**
 * Get all active rules for an artist
 */
export async function getAvailabilityRules(
  artistId: string,
  includeInactive = false
): Promise<{ data: ArtistAvailabilityRule[] | null; error: Error | null }> {
  let query = supabase
    .from('artist_availability_rules')
    .select('*')
    .eq('artist_id', artistId)
    .order('priority', { ascending: false })

  if (!includeInactive) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  return { data, error: error as Error | null }
}

/**
 * Create a new availability rule
 */
export async function createAvailabilityRule(
  artistId: string,
  input: CreateRuleInput
): Promise<{ data: ArtistAvailabilityRule | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_availability_rules')
    .insert({
      artist_id: artistId,
      rule_type: input.rule_type,
      days_of_week: input.days_of_week,
      days_of_month: input.days_of_month,
      start_date: input.start_date,
      end_date: input.end_date,
      is_available: input.is_available ?? true,
      priority: input.priority ?? 0,
      notes: input.notes,
      is_active: true
    })
    .select()
    .single()

  return { data, error: error as Error | null }
}

/**
 * Update an availability rule
 */
export async function updateAvailabilityRule(
  ruleId: string,
  updates: Partial<CreateRuleInput & { is_active: boolean }>
): Promise<{ data: ArtistAvailabilityRule | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_availability_rules')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', ruleId)
    .select()
    .single()

  return { data, error: error as Error | null }
}

/**
 * Delete an availability rule
 */
export async function deleteAvailabilityRule(
  ruleId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('artist_availability_rules')
    .delete()
    .eq('id', ruleId)

  return { error: error as Error | null }
}

// =====================================================
// BLOCKED DATES (Vacations, Breaks)
// =====================================================

/**
 * Get all blocked date ranges for an artist
 */
export async function getBlockedDates(
  artistId: string,
  includeInactive = false
): Promise<{ data: ArtistBlockedDates[] | null; error: Error | null }> {
  let query = supabase
    .from('artist_blocked_dates')
    .select('*')
    .eq('artist_id', artistId)
    .order('start_date', { ascending: true })

  if (!includeInactive) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  return { data, error: error as Error | null }
}

/**
 * Block a date range
 */
export async function blockDateRange(
  artistId: string,
  input: BlockDatesInput
): Promise<{ data: ArtistBlockedDates | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_blocked_dates')
    .insert({
      artist_id: artistId,
      start_date: input.start_date,
      end_date: input.end_date,
      reason: input.reason || 'blocked',
      notes: input.notes,
      is_active: true
    })
    .select()
    .single()

  return { data, error: error as Error | null }
}

/**
 * Update a blocked date range
 */
export async function updateBlockedDates(
  blockId: string,
  updates: Partial<BlockDatesInput & { is_active: boolean }>
): Promise<{ data: ArtistBlockedDates | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_blocked_dates')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', blockId)
    .select()
    .single()

  return { data, error: error as Error | null }
}

/**
 * Delete a blocked date range
 */
export async function deleteBlockedDates(
  blockId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('artist_blocked_dates')
    .delete()
    .eq('id', blockId)

  return { error: error as Error | null }
}

// =====================================================
// AVAILABILITY SETTINGS
// =====================================================

/**
 * Get availability settings for an artist
 */
export async function getAvailabilitySettings(
  artistId: string
): Promise<{ data: ArtistAvailabilitySettings | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_availability_settings')
    .select('*')
    .eq('artist_id', artistId)
    .single()

  return { data, error: error as Error | null }
}

/**
 * Create or update availability settings
 */
export async function upsertAvailabilitySettings(
  artistId: string,
  settings: UpdateSettingsInput
): Promise<{ data: ArtistAvailabilitySettings | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('artist_availability_settings')
    .upsert({
      artist_id: artistId,
      ...settings,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'artist_id'
    })
    .select()
    .single()

  return { data, error: error as Error | null }
}

// =====================================================
// DATABASE FUNCTIONS (RPC Calls)
// =====================================================

/**
 * Check if artist is available on a specific date
 * Uses the database function for accurate calculation
 */
export async function checkArtistAvailability(
  artistId: string,
  date: string
): Promise<{ data: AvailabilityCheck | null; error: Error | null }> {
  const { data, error } = await supabase
    .rpc('check_artist_availability', {
      p_artist_id: artistId,
      p_date: date
    })
    .single()

  return { data: data as AvailabilityCheck | null, error: error as Error | null }
}

/**
 * Get availability for a date range using database function
 * More accurate than just fetching entries as it considers rules
 */
export async function getArtistAvailabilityRange(
  artistId: string,
  startDate: string,
  endDate: string
): Promise<{ data: AvailabilityRangeItem[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .rpc('get_artist_availability_range', {
      p_artist_id: artistId,
      p_start_date: startDate,
      p_end_date: endDate
    })

  return { data, error: error as Error | null }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get day names in German
 */
export const DAY_NAMES_DE = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag'
]

/**
 * Get short day names in German
 */
export const DAY_NAMES_SHORT_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

/**
 * Convert days of week array to readable string
 */
export function formatDaysOfWeek(days: number[]): string {
  return days.map(d => DAY_NAMES_DE[d]).join(', ')
}

/**
 * Get status display text in German
 */
export function getStatusTextDE(status: AvailabilityStatus): string {
  const statusMap: Record<AvailabilityStatus, string> = {
    available: 'Verfügbar',
    booked: 'Gebucht',
    blocked: 'Blockiert',
    tentative: 'Vorläufig'
  }
  return statusMap[status]
}

/**
 * Get status color class
 */
export function getStatusColor(status: AvailabilityStatus): string {
  const colorMap: Record<AvailabilityStatus, string> = {
    available: 'bg-green-500/20 text-green-400 border-green-500/30',
    booked: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30',
    blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
    tentative: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  }
  return colorMap[status]
}

/**
 * Generate date range array
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * Check if a date is within booking window
 */
export function isWithinBookingWindow(
  date: string,
  settings: ArtistAvailabilitySettings | null
): boolean {
  if (!settings) return true

  const targetDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check minimum notice
  const minNoticeDate = new Date(today)
  minNoticeDate.setHours(minNoticeDate.getHours() + settings.minimum_notice_hours)

  if (targetDate < minNoticeDate && !settings.allow_same_day) {
    return false
  }

  // Check advance booking limit
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + settings.advance_booking_days)

  return targetDate <= maxDate
}

/**
 * Format date for display in German format
 */
export function formatDateDE(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
