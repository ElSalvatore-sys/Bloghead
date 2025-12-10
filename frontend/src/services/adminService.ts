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
  created_at: string
  last_sign_in_at: string | null
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
      .select('id, email, membername, vorname, nachname, user_type, role, is_verified, created_at, last_sign_in_at', { count: 'exact' })

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
