import { supabase } from '../lib/supabase'

// Types
export interface DashboardStats {
  totalUsers: number
  totalArtists: number
  totalBookings: number
  totalRevenue: number
  newUsersToday: number
  activeTickets: number
}

export interface AdminUser {
  id: string
  email: string
  membername: string
  vorname: string | null
  nachname: string | null
  user_type: string
  role: string
  is_verified: boolean
  is_banned: boolean
  banned_at: string | null
  banned_reason: string | null
  banned_by: string | null
  created_at: string
  last_login: string | null
}

export interface Payout {
  id: string
  artist_id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'on_hold'
  stripe_transfer_id: string | null
  created_at: string
  processed_at: string | null
  hold_reason: string | null
  artist?: {
    kuenstlername: string
    user?: { email: string; membername: string }
  }
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  target_id: string | null
  target_type: string | null
  details: Record<string, unknown>
  ip_address: string | null
  created_at: string
  user?: { membername: string; email: string }
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string | null
  reported_content_id: string | null
  report_type: string
  reason: string
  status: string
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
  reporter?: { membername: string; email: string }
  reported_user?: { membername: string; email: string }
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  is_active: boolean
  target_audience: 'all' | 'artists' | 'fans' | 'organizers'
  created_by: string
  created_at: string
  expires_at: string | null
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  category: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string | null
  created_at: string
  updated_at: string
  user?: { membername: string; email: string }
}

export interface AnalyticsData {
  userGrowth: { date: string; count: number }[]
  bookingsByMonth: { month: string; count: number }[]
  revenueByMonth: { month: string; amount: number }[]
  usersByType: { type: string; count: number }[]
}

// Enhanced Dashboard Stats with trends
export interface EnhancedDashboardStats {
  totalUsers: { value: number; previousValue: number; changePercent: number; trend: 'up' | 'down' | 'stable' }
  totalArtists: { value: number; previousValue: number; changePercent: number; trend: 'up' | 'down' | 'stable' }
  totalBookings: { value: number; previousValue: number; changePercent: number; trend: 'up' | 'down' | 'stable' }
  totalRevenue: { value: number; previousValue: number; changePercent: number; trend: 'up' | 'down' | 'stable' }
  newUsersToday: number
  activeTickets: number
}

export interface TopArtist {
  id: string
  name: string
  profileImage: string | null
  bookingsCount: number
  revenue: number
  rating: number | null
}

export interface RecentBooking {
  id: string
  artistName: string
  customerName: string
  eventDate: string
  status: string
  totalPrice: number
  createdAt: string
}

export interface RecentUser {
  id: string
  membername: string
  email: string
  userType: string
  createdAt: string
  profileImage: string | null
}

// Check if user is admin
export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) return false
  return data.role === 'admin'
}

// Dashboard Stats
export async function getDashboardStats(): Promise<{ data: DashboardStats | null; error: Error | null }> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // Get counts in parallel
    const [
      usersResult,
      artistsResult,
      bookingsResult,
      newUsersResult,
      ticketsResult
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('user_type', 'artist'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open')
    ])

    // Get total revenue from completed bookings
    const { data: revenueData } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('status', 'completed')

    const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

    return {
      data: {
        totalUsers: usersResult.count || 0,
        totalArtists: artistsResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalRevenue,
        newUsersToday: newUsersResult.count || 0,
        activeTickets: ticketsResult.count || 0
      },
      error: null
    }
  } catch (err) {
    console.error('Error fetching dashboard stats:', err)
    return { data: null, error: err as Error }
  }
}

// User Management
export async function getUsers(
  page = 1,
  limit = 20,
  search?: string,
  userType?: string
): Promise<{ data: AdminUser[]; total: number; error: Error | null }> {
  try {
    let query = supabase
      .from('users')
      .select('id, email, membername, vorname, nachname, user_type, role, is_verified, is_banned, banned_at, banned_reason, banned_by, created_at, last_login', { count: 'exact' })

    if (search) {
      query = query.or(`email.ilike.%${search}%,membername.ilike.%${search}%`)
    }

    if (userType && userType !== 'all') {
      query = query.eq('user_type', userType)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('Error fetching users:', err)
    return { data: [], total: 0, error: err as Error }
  }
}

export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin' | 'moderator'
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
    return { error }
  }
  return { error: null }
}

export async function updateUserVerification(
  userId: string,
  isVerified: boolean
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('users')
    .update({ is_verified: isVerified })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user verification:', error)
    return { error }
  }
  return { error: null }
}

export async function deleteUser(userId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) {
    console.error('Error deleting user:', error)
    return { error }
  }
  return { error: null }
}

// Reports Management
export async function getReports(
  status?: string,
  page = 1,
  limit = 20
): Promise<{ data: Report[]; total: number; error: Error | null }> {
  try {
    let query = supabase
      .from('report_tickets')
      .select(`
        *,
        reporter:reporter_id(membername, email),
        reported_user:reported_user_id(membername, email)
      `, { count: 'exact' })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('Error fetching reports:', err)
    return { data: [], total: 0, error: err as Error }
  }
}

export async function updateReportStatus(
  reportId: string,
  status: string,
  resolvedBy?: string
): Promise<{ error: Error | null }> {
  const updateData: Record<string, unknown> = { status }

  if (status === 'resolved' && resolvedBy) {
    updateData.resolved_at = new Date().toISOString()
    updateData.resolved_by = resolvedBy
  }

  const { error } = await supabase
    .from('report_tickets')
    .update(updateData)
    .eq('id', reportId)

  if (error) {
    console.error('Error updating report status:', error)
    return { error }
  }
  return { error: null }
}

// Announcements Management
export async function getAnnouncements(
  includeInactive = false
): Promise<{ data: Announcement[]; error: Error | null }> {
  try {
    let query = supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error fetching announcements:', err)
    return { data: [], error: err as Error }
  }
}

export async function createAnnouncement(
  announcement: Omit<Announcement, 'id' | 'created_at'>
): Promise<{ data: Announcement | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcement)
    .select()
    .single()

  if (error) {
    console.error('Error creating announcement:', error)
    return { data: null, error }
  }
  return { data, error: null }
}

export async function updateAnnouncement(
  id: string,
  updates: Partial<Announcement>
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating announcement:', error)
    return { error }
  }
  return { error: null }
}

export async function deleteAnnouncement(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting announcement:', error)
    return { error }
  }
  return { error: null }
}

// Support Tickets Management
export async function getTickets(
  status?: string,
  priority?: string,
  page = 1,
  limit = 20
): Promise<{ data: SupportTicket[]; total: number; error: Error | null }> {
  try {
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        user:user_id(membername, email)
      `, { count: 'exact' })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('Error fetching tickets:', err)
    return { data: [], total: 0, error: err as Error }
  }
}

export async function updateTicket(
  ticketId: string,
  updates: Partial<SupportTicket>
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('support_tickets')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId)

  if (error) {
    console.error('Error updating ticket:', error)
    return { error }
  }
  return { error: null }
}

export async function assignTicket(
  ticketId: string,
  assignedTo: string
): Promise<{ error: Error | null }> {
  return updateTicket(ticketId, {
    assigned_to: assignedTo,
    status: 'in_progress'
  })
}

// Analytics
export async function getAnalytics(): Promise<{ data: AnalyticsData | null; error: Error | null }> {
  try {
    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: users } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // Group users by date
    const userGrowth: { date: string; count: number }[] = []
    const usersByDate = new Map<string, number>()

    users?.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0]
      usersByDate.set(date, (usersByDate.get(date) || 0) + 1)
    })

    usersByDate.forEach((count, date) => {
      userGrowth.push({ date, count })
    })

    // Get bookings by month (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const { data: bookings } = await supabase
      .from('bookings')
      .select('created_at, total_price, status')
      .gte('created_at', twelveMonthsAgo.toISOString())

    const bookingsByMonth: { month: string; count: number }[] = []
    const revenueByMonth: { month: string; amount: number }[] = []
    const bookingsMap = new Map<string, number>()
    const revenueMap = new Map<string, number>()

    bookings?.forEach(booking => {
      const month = new Date(booking.created_at).toISOString().slice(0, 7)
      bookingsMap.set(month, (bookingsMap.get(month) || 0) + 1)
      if (booking.status === 'completed') {
        revenueMap.set(month, (revenueMap.get(month) || 0) + (booking.total_price || 0))
      }
    })

    bookingsMap.forEach((count, month) => {
      bookingsByMonth.push({ month, count })
    })

    revenueMap.forEach((amount, month) => {
      revenueByMonth.push({ month, amount })
    })

    // Get users by type
    const { data: userTypes } = await supabase
      .from('users')
      .select('user_type')

    const typeCount = new Map<string, number>()
    userTypes?.forEach(user => {
      const type = user.user_type || 'unknown'
      typeCount.set(type, (typeCount.get(type) || 0) + 1)
    })

    const usersByType: { type: string; count: number }[] = []
    typeCount.forEach((count, type) => {
      usersByType.push({ type, count })
    })

    return {
      data: {
        userGrowth,
        bookingsByMonth,
        revenueByMonth,
        usersByType
      },
      error: null
    }
  } catch (err) {
    console.error('Error fetching analytics:', err)
    return { data: null, error: err as Error }
  }
}

// Create support ticket (for users)
export async function createSupportTicket(
  userId: string,
  subject: string,
  description: string,
  category: string,
  priority: string = 'medium'
): Promise<{ data: SupportTicket | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: userId,
      subject,
      description,
      category,
      priority,
      status: 'open'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating support ticket:', error)
    return { data: null, error }
  }
  return { data, error: null }
}

// Get active announcements for users
export async function getActiveAnnouncements(
  targetAudience?: string
): Promise<{ data: Announcement[]; error: Error | null }> {
  try {
    const now = new Date().toISOString()

    let query = supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })

    if (targetAudience && targetAudience !== 'all') {
      query = query.or(`target_audience.eq.all,target_audience.eq.${targetAudience}`)
    }

    const { data, error } = await query

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error fetching active announcements:', err)
    return { data: [], error: err as Error }
  }
}

// Enhanced Dashboard Stats with period comparison
export async function getEnhancedDashboardStats(
  period: '7d' | '30d' | '90d' | '12m' = '30d'
): Promise<{ data: EnhancedDashboardStats | null; error: Error | null }> {
  try {
    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate period dates
    let currentStart: Date
    let previousStart: Date
    let previousEnd: Date

    switch (period) {
      case '7d':
        currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousEnd = currentStart
        previousStart = new Date(previousEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        previousEnd = currentStart
        previousStart = new Date(previousEnd.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        currentStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        previousEnd = currentStart
        previousStart = new Date(previousEnd.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '12m':
        currentStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        previousEnd = currentStart
        previousStart = new Date(currentStart.getFullYear() - 1, currentStart.getMonth(), currentStart.getDate())
        break
    }

    // Get current period counts
    const [
      currentUsers,
      currentArtists,
      currentBookings,
      previousUsers,
      previousArtists,
      previousBookings,
      newUsersResult,
      ticketsResult
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', currentStart.toISOString()),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('user_type', 'artist').gte('created_at', currentStart.toISOString()),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('created_at', currentStart.toISOString()),
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', previousStart.toISOString()).lt('created_at', previousEnd.toISOString()),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('user_type', 'artist').gte('created_at', previousStart.toISOString()).lt('created_at', previousEnd.toISOString()),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('created_at', previousStart.toISOString()).lt('created_at', previousEnd.toISOString()),
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open')
    ])

    // Get revenue data
    const { data: currentRevenue } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('status', 'completed')
      .gte('created_at', currentStart.toISOString())

    const { data: previousRevenue } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('status', 'completed')
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', previousEnd.toISOString())

    const currentRevenueTotal = currentRevenue?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0
    const previousRevenueTotal = previousRevenue?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

    const calculateChange = (current: number, previous: number): { changePercent: number; trend: 'up' | 'down' | 'stable' } => {
      if (previous === 0) return { changePercent: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'stable' }
      const change = ((current - previous) / previous) * 100
      return {
        changePercent: Math.abs(Math.round(change * 10) / 10),
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      }
    }

    const usersChange = calculateChange(currentUsers.count || 0, previousUsers.count || 0)
    const artistsChange = calculateChange(currentArtists.count || 0, previousArtists.count || 0)
    const bookingsChange = calculateChange(currentBookings.count || 0, previousBookings.count || 0)
    const revenueChange = calculateChange(currentRevenueTotal, previousRevenueTotal)

    return {
      data: {
        totalUsers: {
          value: currentUsers.count || 0,
          previousValue: previousUsers.count || 0,
          ...usersChange
        },
        totalArtists: {
          value: currentArtists.count || 0,
          previousValue: previousArtists.count || 0,
          ...artistsChange
        },
        totalBookings: {
          value: currentBookings.count || 0,
          previousValue: previousBookings.count || 0,
          ...bookingsChange
        },
        totalRevenue: {
          value: currentRevenueTotal,
          previousValue: previousRevenueTotal,
          ...revenueChange
        },
        newUsersToday: newUsersResult.count || 0,
        activeTickets: ticketsResult.count || 0
      },
      error: null
    }
  } catch (err) {
    console.error('Error fetching enhanced dashboard stats:', err)
    return { data: null, error: err as Error }
  }
}

// Get top performing artists
export async function getTopArtists(limit = 5): Promise<{ data: TopArtist[]; error: Error | null }> {
  try {
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        artist_id,
        total_price,
        status,
        artist:artist_id(id, user:user_id(membername, profile_image_url))
      `)
      .eq('status', 'completed')

    if (!bookings || bookings.length === 0) {
      return { data: [], error: null }
    }

    // Group by artist
    const artistStats = new Map<string, { bookingsCount: number; revenue: number; name: string; profileImage: string | null }>()

    bookings.forEach(booking => {
      const artistId = booking.artist_id
      const artistData = booking.artist as unknown as { id: string; user: { membername: string; profile_image_url: string | null } | null } | null

      if (!artistId || !artistData) return

      const existing = artistStats.get(artistId) || {
        bookingsCount: 0,
        revenue: 0,
        name: artistData.user?.membername || 'Unbekannt',
        profileImage: artistData.user?.profile_image_url || null
      }

      artistStats.set(artistId, {
        ...existing,
        bookingsCount: existing.bookingsCount + 1,
        revenue: existing.revenue + (booking.total_price || 0)
      })
    })

    // Convert to array and sort by revenue
    const topArtists: TopArtist[] = Array.from(artistStats.entries())
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        profileImage: stats.profileImage,
        bookingsCount: stats.bookingsCount,
        revenue: stats.revenue,
        rating: null
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)

    return { data: topArtists, error: null }
  } catch (err) {
    console.error('Error fetching top artists:', err)
    return { data: [], error: err as Error }
  }
}

// Get recent bookings
export async function getRecentBookings(limit = 10): Promise<{ data: RecentBooking[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        event_date,
        status,
        total_price,
        created_at,
        artist:artist_id(user:user_id(membername)),
        customer:customer_id(membername)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    const bookings: RecentBooking[] = (data || []).map(b => {
      const artist = b.artist as unknown as { user: { membername: string } | null } | null
      const customer = b.customer as unknown as { membername: string } | null

      return {
        id: b.id,
        artistName: artist?.user?.membername || 'Unbekannt',
        customerName: customer?.membername || 'Unbekannt',
        eventDate: b.event_date,
        status: b.status,
        totalPrice: b.total_price || 0,
        createdAt: b.created_at
      }
    })

    return { data: bookings, error: null }
  } catch (err) {
    console.error('Error fetching recent bookings:', err)
    return { data: [], error: err as Error }
  }
}

// Get recent user signups
export async function getRecentUsers(limit = 10): Promise<{ data: RecentUser[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, membername, email, user_type, created_at, profile_image_url')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    const users: RecentUser[] = (data || []).map(u => ({
      id: u.id,
      membername: u.membername,
      email: u.email,
      userType: u.user_type,
      createdAt: u.created_at,
      profileImage: u.profile_image_url
    }))

    return { data: users, error: null }
  } catch (err) {
    console.error('Error fetching recent users:', err)
    return { data: [], error: err as Error }
  }
}

// Get user growth chart data
export async function getUserGrowthChart(
  period: '7d' | '30d' | '90d' | '12m' = '30d'
): Promise<{ data: { date: string; value: number }[]; error: Error | null }> {
  try {
    const now = new Date()
    let startDate: Date
    let dateFormat: 'day' | 'week' | 'month'

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFormat = 'day'
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        dateFormat = 'day'
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        dateFormat = 'week'
        break
      case '12m':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        dateFormat = 'month'
        break
    }

    const { data: users } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    const groupedData = new Map<string, number>()

    users?.forEach(user => {
      const date = new Date(user.created_at)
      let key: string

      switch (dateFormat) {
        case 'day':
          key = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
          break
        case 'week': {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
          break
        }
        case 'month':
          key = date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
          break
      }

      groupedData.set(key, (groupedData.get(key) || 0) + 1)
    })

    const chartData = Array.from(groupedData.entries()).map(([date, value]) => ({
      date,
      value
    }))

    return { data: chartData, error: null }
  } catch (err) {
    console.error('Error fetching user growth chart:', err)
    return { data: [], error: err as Error }
  }
}

// Get revenue chart data
export async function getRevenueChart(
  period: '7d' | '30d' | '90d' | '12m' = '30d'
): Promise<{ data: { date: string; value: number }[]; error: Error | null }> {
  try {
    const now = new Date()
    let startDate: Date
    let dateFormat: 'day' | 'week' | 'month'

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFormat = 'day'
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        dateFormat = 'day'
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        dateFormat = 'week'
        break
      case '12m':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        dateFormat = 'month'
        break
    }

    const { data: bookings } = await supabase
      .from('bookings')
      .select('created_at, total_price')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    const groupedData = new Map<string, number>()

    bookings?.forEach(booking => {
      const date = new Date(booking.created_at)
      let key: string

      switch (dateFormat) {
        case 'day':
          key = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
          break
        case 'week': {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
          break
        }
        case 'month':
          key = date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
          break
      }

      groupedData.set(key, (groupedData.get(key) || 0) + (booking.total_price || 0))
    })

    const chartData = Array.from(groupedData.entries()).map(([date, value]) => ({
      date,
      value
    }))

    return { data: chartData, error: null }
  } catch (err) {
    console.error('Error fetching revenue chart:', err)
    return { data: [], error: err as Error }
  }
}

// Get bookings by status for pie chart
export async function getBookingsByStatus(): Promise<{ data: { name: string; value: number; color: string }[]; error: Error | null }> {
  try {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('status')

    const statusCounts = new Map<string, number>()
    bookings?.forEach(b => {
      statusCounts.set(b.status, (statusCounts.get(b.status) || 0) + 1)
    })

    const statusColors: Record<string, string> = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      completed: '#10B981',
      cancelled: '#EF4444',
      disputed: '#8B5CF6'
    }

    const statusLabels: Record<string, string> = {
      pending: 'Ausstehend',
      confirmed: 'Bestätigt',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert',
      disputed: 'Streitfall'
    }

    const chartData = Array.from(statusCounts.entries()).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
      color: statusColors[status] || '#6B7280'
    }))

    return { data: chartData, error: null }
  } catch (err) {
    console.error('Error fetching bookings by status:', err)
    return { data: [], error: err as Error }
  }
}

// Get users by type for pie chart
export async function getUsersByType(): Promise<{ data: { name: string; value: number; color: string }[]; error: Error | null }> {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('user_type')

    const typeCounts = new Map<string, number>()
    users?.forEach(u => {
      const type = u.user_type || 'fan'
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1)
    })

    const typeColors: Record<string, string> = {
      fan: '#7C3AED',
      artist: '#EC4899',
      service_provider: '#F59E0B',
      event_organizer: '#10B981'
    }

    const typeLabels: Record<string, string> = {
      fan: 'Fans',
      artist: 'Künstler',
      service_provider: 'Dienstleister',
      event_organizer: 'Veranstalter'
    }

    const chartData = Array.from(typeCounts.entries()).map(([type, count]) => ({
      name: typeLabels[type] || type,
      value: count,
      color: typeColors[type] || '#6B7280'
    }))

    return { data: chartData, error: null }
  } catch (err) {
    console.error('Error fetching users by type:', err)
    return { data: [], error: err as Error }
  }
}

// =====================================================
// BAN/UNBAN USER FUNCTIONS
// =====================================================

export async function banUser(
  userId: string,
  reason: string
): Promise<{ error: Error | null }> {
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Nicht authentifiziert')

    const { error } = await supabase
      .from('users')
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_reason: reason,
        banned_by: currentUser.id
      })
      .eq('id', userId)

    if (error) throw error

    // Log admin action
    await logAdminAction('user_banned', userId, 'user', { reason })

    return { error: null }
  } catch (err) {
    return { error: err as Error }
  }
}

export async function unbanUser(userId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_banned: false,
        banned_at: null,
        banned_reason: null,
        banned_by: null
      })
      .eq('id', userId)

    if (error) throw error

    // Log admin action
    await logAdminAction('user_unbanned', userId, 'user', {})

    return { error: null }
  } catch (err) {
    return { error: err as Error }
  }
}

// =====================================================
// AUDIT LOG FUNCTIONS
// =====================================================

export async function logAdminAction(
  action: string,
  targetId: string | null,
  targetType: string | null,
  details: Record<string, unknown>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      target_id: targetId,
      target_type: targetType,
      details,
      created_at: new Date().toISOString()
    })
  } catch {
    // Silent fail for audit logging
  }
}

export async function getAuditLogs(
  filters?: {
    action?: string
    userId?: string
    dateFrom?: string
    dateTo?: string
  },
  page = 1,
  limit = 50
): Promise<{ data: AuditLog[]; total: number; error: Error | null }> {
  try {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:users!audit_logs_user_id_fkey(membername, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters?.action) {
      query = query.eq('action', filters.action)
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    return { data: [], total: 0, error: err as Error }
  }
}

export async function getAuditLogActionTypes(): Promise<string[]> {
  return [
    'user_banned',
    'user_unbanned',
    'user_role_changed',
    'user_deleted',
    'user_verified',
    'payout_approved',
    'payout_held',
    'payout_released',
    'ticket_assigned',
    'ticket_closed',
    'report_resolved',
    'announcement_created',
    'announcement_updated',
    'announcement_deleted',
    'settings_changed'
  ]
}

// =====================================================
// PAYOUT MANAGEMENT FUNCTIONS
// =====================================================

export async function getPayouts(
  filters?: {
    status?: string
    artistId?: string
    dateFrom?: string
    dateTo?: string
  },
  page = 1,
  limit = 20
): Promise<{ data: Payout[]; total: number; error: Error | null }> {
  try {
    let query = supabase
      .from('payouts')
      .select(`
        *,
        artist:artist_profiles!payouts_artist_id_fkey(
          kuenstlername,
          user:users!artist_profiles_user_id_fkey(email, membername)
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.artistId) {
      query = query.eq('artist_id', filters.artistId)
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    return { data: [], total: 0, error: err as Error }
  }
}

export async function getPayoutStats(): Promise<{
  data: {
    pendingCount: number
    pendingAmount: number
    processedThisMonth: number
    processedAmountThisMonth: number
  } | null
  error: Error | null
}> {
  try {
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [pending, processed] = await Promise.all([
      supabase
        .from('payouts')
        .select('amount')
        .eq('status', 'pending'),
      supabase
        .from('payouts')
        .select('amount')
        .eq('status', 'completed')
        .gte('processed_at', firstOfMonth)
    ])

    const pendingAmount = pending.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const processedAmount = processed.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    return {
      data: {
        pendingCount: pending.data?.length || 0,
        pendingAmount,
        processedThisMonth: processed.data?.length || 0,
        processedAmountThisMonth: processedAmount
      },
      error: null
    }
  } catch (err) {
    return { data: null, error: err as Error }
  }
}

export async function updatePayoutStatus(
  payoutId: string,
  status: Payout['status']
): Promise<{ error: Error | null }> {
  try {
    const updateData: Record<string, unknown> = { status }

    if (status === 'completed') {
      updateData.processed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('payouts')
      .update(updateData)
      .eq('id', payoutId)

    if (error) throw error

    await logAdminAction(`payout_${status}`, payoutId, 'payout', { status })

    return { error: null }
  } catch (err) {
    return { error: err as Error }
  }
}

export async function holdPayout(
  payoutId: string,
  reason: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('payouts')
      .update({
        status: 'on_hold',
        hold_reason: reason
      })
      .eq('id', payoutId)

    if (error) throw error

    await logAdminAction('payout_held', payoutId, 'payout', { reason })

    return { error: null }
  } catch (err) {
    return { error: err as Error }
  }
}

export async function releasePayout(payoutId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('payouts')
      .update({
        status: 'pending',
        hold_reason: null
      })
      .eq('id', payoutId)

    if (error) throw error

    await logAdminAction('payout_released', payoutId, 'payout', {})

    return { error: null }
  } catch (err) {
    return { error: err as Error }
  }
}
