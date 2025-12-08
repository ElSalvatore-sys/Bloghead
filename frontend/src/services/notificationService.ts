import { supabase } from '../lib/supabase'

export type NotificationType =
  | 'booking_request' // New booking request received
  | 'booking_confirmed' // Booking was confirmed
  | 'booking_declined' // Booking was declined
  | 'booking_cancelled' // Booking was cancelled
  | 'new_message' // New chat message
  | 'new_review' // Someone left a review
  | 'new_follower' // Someone followed you
  | 'payment_received' // Payment received
  | 'payment_pending' // Payment pending
  | 'reminder' // Event reminder
  | 'system' // System notification

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
  } | null
  booking_id: string | null
  message_id: string | null
  is_read: boolean
  read_at: string | null
  push_sent: boolean
  push_sent_at: string | null
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
}

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
    case 'booking_declined':
      return 'x-circle'
    case 'booking_cancelled':
      return 'calendar-x'
    case 'new_message':
      return 'message-circle'
    case 'new_review':
      return 'star'
    case 'new_follower':
      return 'user-plus'
    case 'payment_received':
      return 'dollar-sign'
    case 'payment_pending':
      return 'clock'
    case 'reminder':
      return 'bell'
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
    case 'payment_received':
      return 'text-green-400'
    case 'booking_declined':
    case 'booking_cancelled':
      return 'text-red-400'
    case 'booking_request':
    case 'new_message':
      return 'text-accent-purple'
    case 'new_review':
      return 'text-accent-salmon'
    case 'new_follower':
      return 'text-blue-400'
    case 'payment_pending':
    case 'reminder':
      return 'text-accent-orange'
    case 'system':
    default:
      return 'text-white/70'
  }
}
