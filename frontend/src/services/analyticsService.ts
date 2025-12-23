/**
 * Analytics Service - Phase 8
 * Handles all analytics-related API calls to Supabase RPC functions
 */

import { supabase } from '../lib/supabase'

// ============================================================================
// TYPES
// ============================================================================

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '12m' | 'all'

// Stat types for different dashboards
export interface StatValue {
  value: number
  previous_value: number
  change_percent: number
  trend: 'up' | 'down' | 'stable'
}

// Artist Analytics
export interface ArtistDashboardStats {
  total_earnings: StatValue
  total_bookings: StatValue
  profile_views: StatValue
  avg_rating: StatValue
  response_rate: StatValue
  repeat_clients: StatValue
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface EarningsChartData {
  data: ChartDataPoint[]
  total: number
  currency: string
}

export interface BookingsChartData {
  data: ChartDataPoint[]
  total: number
  by_status: {
    completed: number
    cancelled: number
    pending: number
  }
}

export interface MonthlyComparison {
  current_month: {
    earnings: number
    bookings: number
    views: number
  }
  previous_month: {
    earnings: number
    bookings: number
    views: number
  }
  changes: {
    earnings_percent: number
    bookings_percent: number
    views_percent: number
  }
}

// Fan Analytics
export interface FanDashboardStats {
  total_spent: StatValue
  events_attended: StatValue
  artists_booked: StatValue
  avg_booking_value: StatValue
  upcoming_events: number
  coins_balance: number
}

export interface SpendingChartData {
  data: ChartDataPoint[]
  total: number
  by_category: {
    bookings: number
    tips: number
    coins: number
  }
}

export interface FavoriteArtist {
  artist_id: string
  artist_name: string
  profile_image_url: string | null
  total_bookings: number
  total_spent: number
  last_booking_date: string
}

// Admin Analytics
export interface AdminDashboardStats {
  total_users: StatValue
  total_artists: StatValue
  total_bookings: StatValue
  total_revenue: StatValue
  platform_fees: StatValue
  active_users_today: number
}

export interface GrowthChartData {
  data: ChartDataPoint[]
  metric: string
  total: number
}

export interface TopArtist {
  artist_id: string
  artist_name: string
  profile_image_url: string | null
  total_earnings: number
  total_bookings: number
  avg_rating: number
}

export interface RevenueBreakdown {
  booking_fees: number
  coin_purchases: number
  subscriptions: number
  tips: number
  total: number
  by_period: ChartDataPoint[]
}

// ============================================================================
// ARTIST ANALYTICS
// ============================================================================

/**
 * Get artist dashboard statistics
 */
export async function getArtistDashboardStats(
  artistId: string,
  period: AnalyticsPeriod = '30d'
): Promise<{ data: ArtistDashboardStats | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_artist_dashboard_stats', {
      p_artist_id: artistId,
      p_period: period,
    })

    if (error) throw error
    return { data: data as ArtistDashboardStats, error: null }
  } catch (error) {
    console.error('Error fetching artist dashboard stats:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get artist earnings chart data
 */
export async function getArtistEarningsChart(
  artistId: string,
  period: AnalyticsPeriod = '30d'
): Promise<{ data: EarningsChartData | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_artist_earnings_chart', {
      p_artist_id: artistId,
      p_period: period,
    })

    if (error) throw error
    return { data: data as EarningsChartData, error: null }
  } catch (error) {
    console.error('Error fetching artist earnings chart:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get artist bookings chart data
 */
export async function getArtistBookingsChart(
  artistId: string,
  period: AnalyticsPeriod = '30d'
): Promise<{ data: BookingsChartData | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_artist_bookings_chart', {
      p_artist_id: artistId,
      p_period: period,
    })

    if (error) throw error
    return { data: data as BookingsChartData, error: null }
  } catch (error) {
    console.error('Error fetching artist bookings chart:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get artist monthly comparison
 */
export async function getArtistMonthlyComparison(
  artistId: string
): Promise<{ data: MonthlyComparison | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_artist_monthly_comparison', {
      p_artist_id: artistId,
    })

    if (error) throw error
    return { data: data as MonthlyComparison, error: null }
  } catch (error) {
    console.error('Error fetching artist monthly comparison:', error)
    return { data: null, error: error as Error }
  }
}

// ============================================================================
// FAN ANALYTICS
// ============================================================================

/**
 * Get fan dashboard statistics
 */
export async function getFanDashboardStats(
  fanId: string,
  period: AnalyticsPeriod = '30d'
): Promise<{ data: FanDashboardStats | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_fan_dashboard_stats', {
      p_fan_id: fanId,
      p_period: period,
    })

    if (error) throw error
    return { data: data as FanDashboardStats, error: null }
  } catch (error) {
    console.error('Error fetching fan dashboard stats:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get fan spending chart data
 */
export async function getFanSpendingChart(
  fanId: string,
  period: AnalyticsPeriod = '30d'
): Promise<{ data: SpendingChartData | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_fan_spending_chart', {
      p_fan_id: fanId,
      p_period: period,
    })

    if (error) throw error
    return { data: data as SpendingChartData, error: null }
  } catch (error) {
    console.error('Error fetching fan spending chart:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get fan's favorite artists
 */
export async function getFanFavoriteArtists(
  fanId: string,
  limit: number = 5
): Promise<{ data: FavoriteArtist[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_fan_favorite_artists', {
      p_fan_id: fanId,
      p_limit: limit,
    })

    if (error) throw error
    return { data: data as FavoriteArtist[], error: null }
  } catch (error) {
    console.error('Error fetching fan favorite artists:', error)
    return { data: null, error: error as Error }
  }
}

// ============================================================================
// ADMIN ANALYTICS
// ============================================================================

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats(
  period: AnalyticsPeriod = '30d'
): Promise<{ data: AdminDashboardStats | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats', {
      p_period: period,
    })

    if (error) throw error
    return { data: data as AdminDashboardStats, error: null }
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get admin growth chart data
 */
export async function getAdminGrowthChart(
  period: AnalyticsPeriod = '30d',
  metric: 'users' | 'artists' | 'bookings' | 'revenue' = 'users'
): Promise<{ data: GrowthChartData | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_admin_growth_chart', {
      p_period: period,
      p_metric: metric,
    })

    if (error) throw error
    return { data: data as GrowthChartData, error: null }
  } catch (error) {
    console.error('Error fetching admin growth chart:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get top performing artists
 */
export async function getAdminTopArtists(
  period: AnalyticsPeriod = '30d',
  limit: number = 10
): Promise<{ data: TopArtist[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_admin_top_artists', {
      p_period: period,
      p_limit: limit,
    })

    if (error) throw error
    return { data: data as TopArtist[], error: null }
  } catch (error) {
    console.error('Error fetching admin top artists:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get admin revenue breakdown
 */
export async function getAdminRevenueBreakdown(
  period: AnalyticsPeriod = '30d'
): Promise<{ data: RevenueBreakdown | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_admin_revenue_breakdown', {
      p_period: period,
    })

    if (error) throw error
    return { data: data as RevenueBreakdown, error: null }
  } catch (error) {
    console.error('Error fetching admin revenue breakdown:', error)
    return { data: null, error: error as Error }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Track an analytics event
 */
export async function trackAnalyticsEvent(
  eventType: string,
  userId?: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase.rpc('track_analytics_event', {
      p_event_type: eventType,
      p_user_id: userId,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_metadata: metadata,
    })

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error tracking analytics event:', error)
    return { success: false, error: error as Error }
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Get period label in German
 */
export function getPeriodLabel(period: AnalyticsPeriod): string {
  const labels: Record<AnalyticsPeriod, string> = {
    '7d': 'Letzte 7 Tage',
    '30d': 'Letzte 30 Tage',
    '90d': 'Letzte 90 Tage',
    '12m': 'Letzte 12 Monate',
    all: 'Gesamter Zeitraum',
  }
  return labels[period]
}
