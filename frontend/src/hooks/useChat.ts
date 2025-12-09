import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  createConversation,
  archiveConversation,
  subscribeToMessages,
  subscribeToConversations,
  getChatStats,
  type Conversation,
  type Message,
  type MessageType,
  type ChatStats
} from '../services/chatService'

// Re-export types for convenience
export type { Conversation, Message, MessageType, ChatStats }

// Hook return types
export interface UseConversationsReturn {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  stats: ChatStats | null
  refresh: () => Promise<void>
  archive: (conversationId: string) => Promise<boolean>
  startConversation: (participantIds: string[], options?: {
    title?: string
    bookingId?: string
    initialMessage?: string
  }) => Promise<Conversation | null>
}

export interface UseMessagesReturn {
  messages: Message[]
  loading: boolean
  error: string | null
  sending: boolean
  hasMore: boolean
  send: (content: string, options?: {
    messageType?: MessageType
    fileUrl?: string
    fileName?: string
    fileSize?: number
    fileType?: string
  }) => Promise<boolean>
  loadMore: () => Promise<void>
  markAsRead: () => Promise<void>
}

/**
 * Hook for managing conversation list with realtime updates
 */
export function useConversations(): UseConversationsReturn {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [stats, setStats] = useState<ChatStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      setConversations([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [convResult, statsResult] = await Promise.all([
        getConversations(user.id),
        getChatStats(user.id)
      ])

      if (convResult.error) {
        setError('Konversationen konnten nicht geladen werden.')
      } else {
        setConversations(convResult.data || [])
      }

      setStats(statsResult)
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Initial load
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = subscribeToConversations(user.id, (updatedConv) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === updatedConv.id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = { ...updated[index], ...updatedConv }
          // Re-sort by last_message_at
          return updated.sort((a, b) => {
            const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
            const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
            return bTime - aTime
          })
        }
        // New conversation - add to beginning
        return [updatedConv, ...prev]
      })
    })

    return unsubscribe
  }, [user?.id])

  // Archive conversation
  const archive = useCallback(async (conversationId: string): Promise<boolean> => {
    const result = await archiveConversation(conversationId)
    if (!result.error) {
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      return true
    }
    return false
  }, [])

  // Start new conversation
  const startConversation = useCallback(async (
    participantIds: string[],
    options?: {
      title?: string
      bookingId?: string
      initialMessage?: string
    }
  ): Promise<Conversation | null> => {
    if (!user?.id) return null

    const result = await createConversation(participantIds, {
      ...options,
      senderId: user.id
    })

    if (result.error || !result.data) {
      setError('Konversation konnte nicht erstellt werden.')
      return null
    }

    // Add to conversations if new
    setConversations(prev => {
      if (!prev.find(c => c.id === result.data!.id)) {
        return [result.data!, ...prev]
      }
      return prev
    })

    return result.data
  }, [user?.id])

  return {
    conversations,
    loading,
    error,
    stats,
    refresh: loadConversations,
    archive,
    startConversation
  }
}

/**
 * Hook for managing messages in a single conversation with realtime updates
 */
export function useMessages(conversationId: string | null): UseMessagesReturn {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const oldestMessageRef = useRef<string | undefined>(undefined)

  // Load messages
  const loadMessages = useCallback(async (before?: string) => {
    if (!conversationId) {
      setMessages([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getMessages(conversationId, 50, before)

      if (result.error) {
        setError('Nachrichten konnten nicht geladen werden.')
      } else if (result.data) {
        if (before) {
          // Loading more - prepend to existing
          setMessages(prev => [...result.data!, ...prev])
        } else {
          // Initial load
          setMessages(result.data)
        }
        setHasMore(result.data.length === 50)
        if (result.data.length > 0) {
          oldestMessageRef.current = result.data[0].created_at
        }
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  // Initial load when conversation changes
  useEffect(() => {
    oldestMessageRef.current = undefined
    setMessages([])
    setHasMore(true)
    if (conversationId) {
      loadMessages()
    }
  }, [conversationId, loadMessages])

  // Realtime subscription for new messages
  useEffect(() => {
    if (!conversationId) return

    const unsubscribe = subscribeToMessages(conversationId, (newMessage) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === newMessage.id)) {
          return prev
        }
        return [...prev, newMessage]
      })
    })

    return unsubscribe
  }, [conversationId])

  // Load more messages
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !oldestMessageRef.current) return
    await loadMessages(oldestMessageRef.current)
  }, [hasMore, loading, loadMessages])

  // Send message
  const send = useCallback(async (
    content: string,
    options?: {
      messageType?: MessageType
      fileUrl?: string
      fileName?: string
      fileSize?: number
      fileType?: string
    }
  ): Promise<boolean> => {
    if (!conversationId || !user?.id || !content.trim()) return false

    setSending(true)

    try {
      const result = await sendMessage(conversationId, user.id, content, options)

      if (result.error) {
        setError('Nachricht konnte nicht gesendet werden.')
        return false
      }

      // Message will be added via realtime subscription
      return true
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
      return false
    } finally {
      setSending(false)
    }
  }, [conversationId, user?.id])

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!conversationId || !user?.id) return
    await markMessagesAsRead(conversationId, user.id)
  }, [conversationId, user?.id])

  // Auto-mark as read when messages are loaded
  useEffect(() => {
    if (messages.length > 0 && conversationId && user?.id) {
      markAsRead()
    }
  }, [messages.length, conversationId, user?.id, markAsRead])

  return {
    messages,
    loading,
    error,
    sending,
    hasMore,
    send,
    loadMore,
    markAsRead
  }
}

/**
 * Combined hook for full chat functionality
 */
export function useChat() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const conversationsHook = useConversations()
  const messagesHook = useMessages(activeConversationId)

  const selectConversation = useCallback((conversationId: string | null) => {
    setActiveConversationId(conversationId)
  }, [])

  // Get active conversation details
  const activeConversation = activeConversationId
    ? conversationsHook.conversations.find(c => c.id === activeConversationId) || null
    : null

  return {
    // Conversation management
    conversations: conversationsHook.conversations,
    conversationsLoading: conversationsHook.loading,
    conversationsError: conversationsHook.error,
    stats: conversationsHook.stats,
    refreshConversations: conversationsHook.refresh,
    archiveConversation: conversationsHook.archive,
    startConversation: conversationsHook.startConversation,

    // Active conversation
    activeConversationId,
    activeConversation,
    selectConversation,

    // Messages
    messages: messagesHook.messages,
    messagesLoading: messagesHook.loading,
    messagesError: messagesHook.error,
    sendMessage: messagesHook.send,
    sending: messagesHook.sending,
    hasMoreMessages: messagesHook.hasMore,
    loadMoreMessages: messagesHook.loadMore,
    markAsRead: messagesHook.markAsRead
  }
}
