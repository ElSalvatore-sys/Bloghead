import { supabase } from '../lib/supabase'

// Message types
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'system' | 'booking_update'

// Message interface
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: MessageType
  file_url: string | null
  file_name: string | null
  file_size: number | null
  file_type: string | null
  is_read: boolean
  read_at: string | null
  read_by: string[] | null
  is_edited: boolean
  edited_at: string | null
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  // Joined sender data
  sender?: {
    id: string
    membername: string | null
    vorname: string | null
    nachname: string | null
    profile_image_url: string | null
  }
}

// Conversation interface
export interface Conversation {
  id: string
  booking_id: string | null
  booking_request_id: string | null
  participant_ids: string[]
  title: string | null
  last_message_at: string | null
  last_message_preview: string | null
  is_archived: boolean
  is_muted_by: string[] | null
  created_at: string
  updated_at: string | null
  // Computed fields
  unread_count?: number
  // Joined participant data
  participants?: {
    id: string
    membername: string | null
    vorname: string | null
    nachname: string | null
    profile_image_url: string | null
    user_type: string | null
  }[]
  // Joined booking data
  booking?: {
    id: string
    booking_number: string
    event_type: string | null
    event_date: string
    status: string
  } | null
}

// Chat stats
export interface ChatStats {
  totalConversations: number
  unreadMessages: number
  archivedConversations: number
}

// Get all conversations for a user
export async function getConversations(
  userId: string
): Promise<{ data: Conversation[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      booking:bookings!booking_id(
        id,
        booking_number,
        event_type,
        event_date,
        status
      )
    `)
    .contains('participant_ids', [userId])
    .eq('is_archived', false)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error || !data) {
    return { data: null, error }
  }

  // Fetch participant details for each conversation
  const conversationsWithParticipants = await Promise.all(
    data.map(async (conv) => {
      const { data: participants } = await supabase
        .from('users')
        .select('id, membername, vorname, nachname, profile_image_url, user_type')
        .in('id', conv.participant_ids)

      // Get unread count
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('is_read', false)
        .neq('sender_id', userId)

      return {
        ...conv,
        participants: participants || [],
        unread_count: count || 0
      }
    })
  )

  return { data: conversationsWithParticipants as Conversation[], error: null }
}

// Get archived conversations
export async function getArchivedConversations(
  userId: string
): Promise<{ data: Conversation[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .eq('is_archived', true)
    .order('last_message_at', { ascending: false })

  return { data: data as Conversation[] | null, error }
}

// Get messages for a conversation
export async function getMessages(
  conversationId: string,
  limit: number = 50,
  before?: string
): Promise<{ data: Message[] | null; error: Error | null }> {
  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:users!sender_id(
        id,
        membername,
        vorname,
        nachname,
        profile_image_url
      )
    `)
    .eq('conversation_id', conversationId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (before) {
    query = query.lt('created_at', before)
  }

  const { data, error } = await query

  // Reverse to get chronological order
  const messages = data ? [...data].reverse() : null

  return { data: messages as Message[] | null, error }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  options?: {
    messageType?: MessageType
    fileUrl?: string
    fileName?: string
    fileSize?: number
    fileType?: string
  }
): Promise<{ data: Message | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: options?.messageType || 'text',
      file_url: options?.fileUrl || null,
      file_name: options?.fileName || null,
      file_size: options?.fileSize || null,
      file_type: options?.fileType || null
    })
    .select(`
      *,
      sender:users!sender_id(
        id,
        membername,
        vorname,
        nachname,
        profile_image_url
      )
    `)
    .single()

  // Update conversation's last message
  if (data) {
    await supabase
      .from('conversations')
      .update({
        last_message_at: data.created_at,
        last_message_preview: content.substring(0, 100),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
  }

  return { data: data as Message | null, error }
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false)

  return { error }
}

// Create a new conversation
export async function createConversation(
  participantIds: string[],
  options?: {
    title?: string
    bookingId?: string
    bookingRequestId?: string
    initialMessage?: string
    senderId?: string
  }
): Promise<{ data: Conversation | null; error: Error | null }> {
  // Check if conversation already exists between these participants
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', participantIds)
    .single()

  if (existing) {
    return { data: existing as Conversation, error: null }
  }

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant_ids: participantIds,
      title: options?.title || null,
      booking_id: options?.bookingId || null,
      booking_request_id: options?.bookingRequestId || null
    })
    .select()
    .single()

  if (error || !data) {
    return { data: null, error }
  }

  // Send initial message if provided
  if (options?.initialMessage && options?.senderId) {
    await sendMessage(data.id, options.senderId, options.initialMessage)
  }

  return { data: data as Conversation, error: null }
}

// Archive a conversation
export async function archiveConversation(
  conversationId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('conversations')
    .update({
      is_archived: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)

  return { error }
}

// Unarchive a conversation
export async function unarchiveConversation(
  conversationId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('conversations')
    .update({
      is_archived: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)

  return { error }
}

// Mute a conversation
export async function muteConversation(
  conversationId: string,
  userId: string
): Promise<{ error: Error | null }> {
  // Get current muted users
  const { data: conv } = await supabase
    .from('conversations')
    .select('is_muted_by')
    .eq('id', conversationId)
    .single()

  const mutedBy = conv?.is_muted_by || []
  if (!mutedBy.includes(userId)) {
    mutedBy.push(userId)
  }

  const { error } = await supabase
    .from('conversations')
    .update({
      is_muted_by: mutedBy,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)

  return { error }
}

// Unmute a conversation
export async function unmuteConversation(
  conversationId: string,
  userId: string
): Promise<{ error: Error | null }> {
  const { data: conv } = await supabase
    .from('conversations')
    .select('is_muted_by')
    .eq('id', conversationId)
    .single()

  const mutedBy = (conv?.is_muted_by || []).filter((id: string) => id !== userId)

  const { error } = await supabase
    .from('conversations')
    .update({
      is_muted_by: mutedBy,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)

  return { error }
}

// Delete a message (soft delete)
export async function deleteMessage(
  messageId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('messages')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString()
    })
    .eq('id', messageId)

  return { error }
}

// Edit a message
export async function editMessage(
  messageId: string,
  newContent: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('messages')
    .update({
      content: newContent,
      is_edited: true,
      edited_at: new Date().toISOString()
    })
    .eq('id', messageId)

  return { error }
}

// Get chat stats for a user
export async function getChatStats(userId: string): Promise<ChatStats> {
  const stats: ChatStats = {
    totalConversations: 0,
    unreadMessages: 0,
    archivedConversations: 0
  }

  // Get total active conversations
  const { count: activeCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .contains('participant_ids', [userId])
    .eq('is_archived', false)
  stats.totalConversations = activeCount || 0

  // Get archived count
  const { count: archivedCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .contains('participant_ids', [userId])
    .eq('is_archived', true)
  stats.archivedConversations = archivedCount || 0

  // Get unread messages count (across all conversations)
  // This is a simplified version - in production you'd want a more efficient query
  const { data: convs } = await supabase
    .from('conversations')
    .select('id')
    .contains('participant_ids', [userId])
    .eq('is_archived', false)

  if (convs) {
    const convIds = convs.map(c => c.id)
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .eq('is_read', false)
      .neq('sender_id', userId)
    stats.unreadMessages = unreadCount || 0
  }

  return stats
}

// Search conversations
export async function searchConversations(
  userId: string,
  searchTerm: string
): Promise<{ data: Conversation[] | null; error: Error | null }> {
  // Search in conversation titles and last message preview
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .or(`title.ilike.%${searchTerm}%,last_message_preview.ilike.%${searchTerm}%`)
    .order('last_message_at', { ascending: false })

  return { data: data as Conversation[] | null, error }
}

// Subscribe to new messages in a conversation (real-time)
export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        callback(payload.new as Message)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Subscribe to conversation updates (for unread counts, etc.)
export function subscribeToConversations(
  userId: string,
  callback: (conversation: Conversation) => void
) {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations'
      },
      (payload) => {
        const conv = payload.new as Conversation
        if (conv.participant_ids?.includes(userId)) {
          callback(conv)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Message type display config
export const MESSAGE_TYPE_CONFIG: Record<MessageType, {
  label: string
  icon: string
}> = {
  text: { label: 'Text', icon: '💬' },
  image: { label: 'Bild', icon: '🖼️' },
  file: { label: 'Datei', icon: '📎' },
  audio: { label: 'Audio', icon: '🎵' },
  system: { label: 'System', icon: 'ℹ️' },
  booking_update: { label: 'Buchungs-Update', icon: '📅' }
}

// Format date for chat display
export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Jetzt'
  if (diffMins < 60) return `vor ${diffMins} Min.`
  if (diffHours < 24) return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  if (diffDays < 7) {
    return date.toLocaleDateString('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// Format date divider in chat
export function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)

  if (diffDays === 0) return 'Heute'
  if (diffDays === 1) return 'Gestern'
  if (diffDays < 7) {
    return date.toLocaleDateString('de-DE', { weekday: 'long' })
  }
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Participant type
export type Participant = {
  id: string
  membername: string | null
  vorname: string | null
  nachname: string | null
  profile_image_url: string | null
  user_type: string | null
}

// Get other participant in a two-person conversation
export function getOtherParticipant(
  conversation: Conversation,
  currentUserId: string
): Participant | undefined {
  return conversation.participants?.find(p => p.id !== currentUserId)
}
