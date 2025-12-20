import { supabase } from '../lib/supabase'
import type { BookingMessage, BookingStatusHistory, MessageType } from '../types/booking'

// =====================================================
// BOOKING MESSAGES SERVICE
// =====================================================

/**
 * Get all messages for a booking request
 */
export async function getBookingMessages(bookingRequestId: string): Promise<BookingMessage[]> {
  const { data, error } = await supabase
    .from('booking_messages')
    .select(`
      *,
      sender:users!sender_id (
        id,
        vorname,
        nachname,
        profile_image_url
      )
    `)
    .eq('booking_request_id', bookingRequestId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[BookingMessages] Error fetching messages:', error)
    throw error
  }

  return data || []
}

/**
 * Send a message in a booking thread
 */
export async function sendBookingMessage(
  bookingRequestId: string,
  message: string,
  messageType: MessageType = 'text',
  attachments: string[] = []
): Promise<BookingMessage> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('booking_messages')
    .insert({
      booking_request_id: bookingRequestId,
      sender_id: user.id,
      message,
      message_type: messageType,
      attachments,
    })
    .select(`
      *,
      sender:users!sender_id (
        id,
        vorname,
        nachname,
        profile_image_url
      )
    `)
    .single()

  if (error) {
    console.error('[BookingMessages] Error sending message:', error)
    throw error
  }

  return data
}

/**
 * Mark messages as read for a booking request
 */
export async function markMessagesAsRead(bookingRequestId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const { error } = await supabase
    .from('booking_messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('booking_request_id', bookingRequestId)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('[BookingMessages] Error marking as read:', error)
  }
}

/**
 * Get unread message count for current user
 */
export async function getUnreadMessageCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 0

  // Use the database function
  const { data, error } = await supabase
    .rpc('get_unread_message_count', { user_uuid: user.id })

  if (error) {
    console.error('[BookingMessages] Error getting unread count:', error)
    return 0
  }

  return data || 0
}

/**
 * Subscribe to new messages for a booking request (real-time)
 */
export function subscribeToBookingMessages(
  bookingRequestId: string,
  onMessage: (message: BookingMessage) => void
) {
  const channel = supabase
    .channel(`booking_messages:${bookingRequestId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'booking_messages',
        filter: `booking_request_id=eq.${bookingRequestId}`,
      },
      async (payload) => {
        // Fetch the full message with sender info
        const { data } = await supabase
          .from('booking_messages')
          .select(`
            *,
            sender:users!sender_id (
              id,
              vorname,
              nachname,
              profile_image_url
            )
          `)
          .eq('id', payload.new.id)
          .single()

        if (data) {
          onMessage(data)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// =====================================================
// BOOKING STATUS HISTORY SERVICE
// =====================================================

/**
 * Get status history for a booking request
 */
export async function getBookingStatusHistory(bookingRequestId: string): Promise<BookingStatusHistory[]> {
  const { data, error } = await supabase
    .from('booking_status_history')
    .select(`
      *,
      changed_by_user:users!changed_by (
        id,
        vorname,
        nachname
      )
    `)
    .eq('booking_request_id', bookingRequestId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[BookingHistory] Error fetching history:', error)
    throw error
  }

  return data || []
}

/**
 * Subscribe to status history changes (real-time)
 */
export function subscribeToStatusHistory(
  bookingRequestId: string,
  onUpdate: (history: BookingStatusHistory) => void
) {
  const channel = supabase
    .channel(`booking_status_history:${bookingRequestId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'booking_status_history',
        filter: `booking_request_id=eq.${bookingRequestId}`,
      },
      async (payload) => {
        // Fetch the full history entry with user info
        const { data } = await supabase
          .from('booking_status_history')
          .select(`
            *,
            changed_by_user:users!changed_by (
              id,
              vorname,
              nachname
            )
          `)
          .eq('id', payload.new.id)
          .single()

        if (data) {
          onUpdate(data)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
