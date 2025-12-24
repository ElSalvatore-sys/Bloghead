import { supabase } from '../lib/supabase'

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType =
  | 'booking_request' // New booking request received
  | 'booking_confirmed' // Booking was confirmed
  | 'booking_declined' // Booking was declined
  | 'booking_cancelled' // Booking was cancelled
  | 'booking_completed' // Booking was completed
  | 'new_message' // New chat message
  | 'new_review' // Someone left a review
  | 'review_response' // Artist responded to review
  | 'new_follower' // Someone followed you
  | 'payment_received' // Payment received
  | 'payment_pending' // Payment pending
  | 'payout_sent' // Payout sent to artist
  | 'reminder' // Event reminder (generic)
  | 'reminder_24h' // 24 hour reminder
  | 'reminder_1h' // 1 hour reminder
  | 'profile_milestone' // Profile milestone achieved
  | 'system' // System notification

export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms'

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'bounced'

export type ReminderType = 'booking_24h' | 'booking_1h' | 'review_request' | 'payment_reminder' | 'custom'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  action_url: string | null
  action_data: {
    link?: string
    booking_id?: string
    artist_id?: string
    sender_id?: string
    sender_name?: string
    event_date?: string
    review_id?: string
    amount?: number
  } | null
  booking_id: string | null
  message_id: string | null
  is_read: boolean
  read_at: string | null
  push_sent: boolean
  push_sent_at: string | null
  email_sent: boolean
  email_sent_at: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  expires_at: string | null
  created_at: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  // Booking notifications
  booking_requests: boolean
  booking_updates: boolean
  booking_reminders: boolean
  // Message notifications
  new_messages: boolean
  // Social notifications
  new_followers: boolean
  new_reviews: boolean
  // Payment notifications
  payment_updates: boolean
  // Marketing
  marketing_emails: boolean
  // Channels
  email_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
  // Quiet hours
  quiet_hours_start: string | null // HH:MM format
  quiet_hours_end: string | null // HH:MM format
  created_at: string
  updated_at: string
}

export interface EmailLog {
  id: string
  notification_id: string | null
  user_id: string
  template_name: string
  subject: string
  recipient_email: string
  status: EmailStatus
  sent_at: string | null
  error_message: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface ScheduledReminder {
  id: string
  user_id: string
  booking_id: string | null
  reminder_type: ReminderType
  scheduled_for: string
  sent: boolean
  sent_at: string | null
  notification_id: string | null
  created_at: string
}

export interface CreateNotificationData {
  user_id: string
  type: NotificationType
  title: string
  body?: string
  action_url?: string
  action_data?: Notification['action_data']
  booking_id?: string
  message_id?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  expires_at?: string
}

export interface UpdatePreferencesData {
  booking_requests?: boolean
  booking_updates?: boolean
  booking_reminders?: boolean
  new_messages?: boolean
  new_followers?: boolean
  new_reviews?: boolean
  payment_updates?: boolean
  marketing_emails?: boolean
  email_enabled?: boolean
  push_enabled?: boolean
  sms_enabled?: boolean
  quiet_hours_start?: string | null
  quiet_hours_end?: string | null
}

export interface NotificationStats {
  total_count: number
  unread_count: number
  by_type: Record<NotificationType, number>
}

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Get user notifications with pagination
 */
export async function getNotifications(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{ data: Notification[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { data: data as Notification[] | null, error }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(
  userId: string
): Promise<{ count: number; error: Error | null }> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  return { count: count || 0, error }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(
  notificationId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)

  return { error }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(
  userId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('is_read', false)

  return { error }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  return { error }
}

/**
 * Delete all read notifications for a user
 */
export async function deleteReadNotifications(
  userId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)
    .eq('is_read', true)

  return { error }
}

/**
 * Create a notification (used by backend/triggers or admin)
 */
export async function createNotification(
  data: CreateNotificationData
): Promise<{ data: Notification | null; error: Error | null }> {
  const { data: result, error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      body: data.body || null,
      action_url: data.action_url || null,
      action_data: data.action_data || null,
      booking_id: data.booking_id || null,
      message_id: data.message_id || null,
      is_read: false,
    })
    .select()
    .single()

  return { data: result as Notification | null, error }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  onNew: (notification: Notification) => void
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNew(payload.new as Notification)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Get notification icon name based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'booking_request':
      return 'calendar-plus'
    case 'booking_confirmed':
      return 'check-circle'
    case 'booking_completed':
      return 'calendar-check'
    case 'booking_declined':
      return 'x-circle'
    case 'booking_cancelled':
      return 'calendar-x'
    case 'new_message':
      return 'message-circle'
    case 'new_review':
      return 'star'
    case 'review_response':
      return 'message-square'
    case 'new_follower':
      return 'user-plus'
    case 'payment_received':
      return 'euro'
    case 'payment_pending':
      return 'clock'
    case 'payout_sent':
      return 'banknote'
    case 'reminder':
    case 'reminder_24h':
    case 'reminder_1h':
      return 'bell-ring'
    case 'profile_milestone':
      return 'trophy'
    case 'system':
    default:
      return 'info'
  }
}

/**
 * Get notification color based on type
 */
export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'booking_confirmed':
    case 'booking_completed':
    case 'payment_received':
    case 'payout_sent':
      return 'text-green-400'
    case 'booking_declined':
    case 'booking_cancelled':
      return 'text-red-400'
    case 'booking_request':
    case 'new_message':
      return 'text-accent-purple'
    case 'new_review':
    case 'review_response':
      return 'text-accent-salmon'
    case 'new_follower':
    case 'profile_milestone':
      return 'text-blue-400'
    case 'payment_pending':
    case 'reminder':
    case 'reminder_24h':
    case 'reminder_1h':
      return 'text-accent-orange'
    case 'system':
    default:
      return 'text-white/70'
  }
}

// ============================================================================
// PREFERENCE FUNCTIONS
// ============================================================================

/**
 * Get user notification preferences
 * Uses RPC function that creates default preferences if none exist
 */
export async function getPreferences(
  userId: string
): Promise<{ data: NotificationPreferences | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_notification_preferences', {
    p_user_id: userId,
  })

  return { data: data as NotificationPreferences | null, error }
}

/**
 * Update user notification preferences
 */
export async function updatePreferences(
  userId: string,
  preferences: UpdatePreferencesData
): Promise<{ data: NotificationPreferences | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('update_notification_preferences', {
    p_user_id: userId,
    p_preferences: preferences,
  })

  return { data: data as NotificationPreferences | null, error }
}

/**
 * Check if a specific notification type is enabled for a user
 */
export async function isNotificationEnabled(
  userId: string,
  notificationType: NotificationType
): Promise<boolean> {
  const { data: prefs } = await getPreferences(userId)
  if (!prefs) return true // Default to enabled if no preferences

  switch (notificationType) {
    case 'booking_request':
      return prefs.booking_requests
    case 'booking_confirmed':
    case 'booking_declined':
    case 'booking_cancelled':
    case 'booking_completed':
      return prefs.booking_updates
    case 'reminder':
    case 'reminder_24h':
    case 'reminder_1h':
      return prefs.booking_reminders
    case 'new_message':
      return prefs.new_messages
    case 'new_follower':
      return prefs.new_followers
    case 'new_review':
    case 'review_response':
      return prefs.new_reviews
    case 'payment_received':
    case 'payment_pending':
    case 'payout_sent':
      return prefs.payment_updates
    default:
      return true // System notifications always enabled
  }
}

// ============================================================================
// RPC NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Create notification using RPC (respects user preferences)
 */
export async function createNotificationWithPreferences(
  data: CreateNotificationData
): Promise<{ data: Notification | null; error: Error | null }> {
  const { data: result, error } = await supabase.rpc('create_notification', {
    p_user_id: data.user_id,
    p_type: data.type,
    p_title: data.title,
    p_body: data.body || null,
    p_action_url: data.action_url || null,
    p_action_data: data.action_data || null,
    p_booking_id: data.booking_id || null,
    p_message_id: data.message_id || null,
    p_priority: data.priority || 'normal',
    p_expires_at: data.expires_at || null,
  })

  return { data: result as Notification | null, error }
}

/**
 * Get notifications using RPC (supports filtering)
 */
export async function getNotificationsFiltered(
  userId: string,
  options: {
    unreadOnly?: boolean
    types?: NotificationType[]
    limit?: number
    offset?: number
  } = {}
): Promise<{ data: Notification[] | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_user_notifications', {
    p_user_id: userId,
    p_unread_only: options.unreadOnly || false,
    p_types: options.types || null,
    p_limit: options.limit || 50,
    p_offset: options.offset || 0,
  })

  return { data: data as Notification[] | null, error }
}

/**
 * Get notification statistics for a user
 */
export async function getNotificationStats(
  userId: string
): Promise<{ data: NotificationStats | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_notification_stats', {
    p_user_id: userId,
  })

  return { data: data as NotificationStats | null, error }
}

/**
 * Delete old notifications using RPC
 */
export async function deleteOldNotifications(
  userId: string,
  daysOld = 30
): Promise<{ count: number; error: Error | null }> {
  const { data, error } = await supabase.rpc('delete_old_notifications', {
    p_user_id: userId,
    p_days_old: daysOld,
  })

  return { count: data as number || 0, error }
}

// ============================================================================
// SCHEDULED REMINDER FUNCTIONS
// ============================================================================

/**
 * Schedule a reminder for a booking
 */
export async function scheduleReminder(
  userId: string,
  bookingId: string,
  reminderType: ReminderType,
  scheduledFor: string
): Promise<{ data: ScheduledReminder | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('schedule_reminder', {
    p_user_id: userId,
    p_booking_id: bookingId,
    p_reminder_type: reminderType,
    p_scheduled_for: scheduledFor,
  })

  return { data: data as ScheduledReminder | null, error }
}

/**
 * Cancel a scheduled reminder
 */
export async function cancelReminder(
  reminderId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('scheduled_reminders')
    .delete()
    .eq('id', reminderId)
    .eq('sent', false)

  return { error }
}

/**
 * Get pending reminders for a user
 */
export async function getPendingReminders(
  userId: string
): Promise<{ data: ScheduledReminder[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('scheduled_reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('sent', false)
    .gte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })

  return { data: data as ScheduledReminder[] | null, error }
}

// ============================================================================
// EMAIL LOG FUNCTIONS
// ============================================================================

/**
 * Get email logs for a user
 */
export async function getEmailLogs(
  userId: string,
  limit = 20
): Promise<{ data: EmailLog[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data as EmailLog[] | null, error }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get notification icon name based on type (extended)
 */
export function getNotificationIconExtended(type: NotificationType): {
  icon: string
  bgColor: string
} {
  switch (type) {
    case 'booking_request':
      return { icon: 'calendar-plus', bgColor: 'bg-accent-purple/20' }
    case 'booking_confirmed':
      return { icon: 'check-circle', bgColor: 'bg-green-500/20' }
    case 'booking_completed':
      return { icon: 'calendar-check', bgColor: 'bg-green-500/20' }
    case 'booking_declined':
      return { icon: 'x-circle', bgColor: 'bg-red-500/20' }
    case 'booking_cancelled':
      return { icon: 'calendar-x', bgColor: 'bg-red-500/20' }
    case 'new_message':
      return { icon: 'message-circle', bgColor: 'bg-accent-purple/20' }
    case 'new_review':
      return { icon: 'star', bgColor: 'bg-accent-salmon/20' }
    case 'review_response':
      return { icon: 'message-square', bgColor: 'bg-accent-salmon/20' }
    case 'new_follower':
      return { icon: 'user-plus', bgColor: 'bg-blue-500/20' }
    case 'payment_received':
      return { icon: 'euro', bgColor: 'bg-green-500/20' }
    case 'payment_pending':
      return { icon: 'clock', bgColor: 'bg-accent-orange/20' }
    case 'payout_sent':
      return { icon: 'banknote', bgColor: 'bg-green-500/20' }
    case 'reminder':
    case 'reminder_24h':
    case 'reminder_1h':
      return { icon: 'bell-ring', bgColor: 'bg-accent-orange/20' }
    case 'profile_milestone':
      return { icon: 'trophy', bgColor: 'bg-blue-500/20' }
    case 'system':
    default:
      return { icon: 'info', bgColor: 'bg-white/10' }
  }
}

/**
 * Format notification time in German
 */
export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Gerade eben'
  if (diffMins < 60) return `vor ${diffMins} Min.`
  if (diffHours < 24) return `vor ${diffHours} Std.`
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`

  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Get priority badge styling
 */
export function getPriorityStyle(priority: Notification['priority']): {
  className: string
  label: string
} {
  switch (priority) {
    case 'urgent':
      return { className: 'bg-red-500 text-white', label: 'Dringend' }
    case 'high':
      return { className: 'bg-accent-orange text-white', label: 'Wichtig' }
    case 'low':
      return { className: 'bg-white/10 text-white/50', label: 'Niedrig' }
    case 'normal':
    default:
      return { className: '', label: '' }
  }
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(
  notifications: Notification[]
): Map<string, Notification[]> {
  const groups = new Map<string, Notification[]>()
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const notification of notifications) {
    const date = new Date(notification.created_at)
    let key: string

    if (date.toDateString() === today.toDateString()) {
      key = 'Heute'
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Gestern'
    } else {
      key = date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    }

    const existing = groups.get(key) || []
    existing.push(notification)
    groups.set(key, existing)
  }

  return groups
}
