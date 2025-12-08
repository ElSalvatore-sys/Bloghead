import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  archiveConversation,
  getChatStats,
  searchConversations,
  formatMessageTime,
  formatMessageDate,
  getOtherParticipant,
  subscribeToMessages,
  subscribeToConversations,
  type Conversation,
  type Message,
  type ChatStats
} from '../../services/chatService'

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color
}: {
  label: string
  value: number
  icon: string
  color: string
}) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-sm`}>
          {icon}
        </div>
        <div>
          <p className="text-lg font-bold text-white">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

// Conversation Item Component
function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  onClick
}: {
  conversation: Conversation
  currentUserId: string
  isActive: boolean
  onClick: () => void
}) {
  const otherParticipant = getOtherParticipant(conversation, currentUserId)
  const displayName = conversation.title ||
    otherParticipant?.membername ||
    `${otherParticipant?.vorname || ''} ${otherParticipant?.nachname || ''}`.trim() ||
    'Unbekannt'
  const initials = displayName.charAt(0).toUpperCase()
  const hasUnread = (conversation.unread_count || 0) > 0

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 flex items-start gap-3 rounded-xl transition-all text-left ${
        isActive
          ? 'bg-purple-500/20 border border-purple-500/30'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {otherParticipant?.profile_image_url ? (
          <img
            src={otherParticipant.profile_image_url}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold">
            {initials}
          </div>
        )}
        {/* Online indicator (placeholder) */}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#171717]" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-medium truncate ${hasUnread ? 'text-white' : 'text-gray-300'}`}>
            {displayName}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {conversation.last_message_at ? formatMessageTime(conversation.last_message_at) : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${hasUnread ? 'text-gray-300' : 'text-gray-500'}`}>
            {conversation.last_message_preview || 'Keine Nachrichten'}
          </p>
          {hasUnread && (
            <span className="ml-2 flex-shrink-0 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
              {conversation.unread_count}
            </span>
          )}
        </div>
        {/* Booking badge */}
        {conversation.booking && (
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
            Buchung #{conversation.booking.booking_number}
          </span>
        )}
      </div>
    </button>
  )
}

// Message Bubble Component
function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showDate
}: {
  message: Message
  isOwn: boolean
  showAvatar: boolean
  showDate: string | null
}) {
  const sender = message.sender
  const displayName = sender?.membername || `${sender?.vorname || ''} ${sender?.nachname || ''}`.trim() || 'Unbekannt'
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <>
      {/* Date Divider */}
      {showDate && (
        <div className="flex items-center justify-center my-4">
          <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400">
            {showDate}
          </div>
        </div>
      )}

      {/* Message */}
      <div className={`flex items-end gap-2 mb-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        {showAvatar && !isOwn ? (
          sender?.profile_image_url ? (
            <img
              src={sender.profile_image_url}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
          )
        ) : (
          <div className="w-8 flex-shrink-0" />
        )}

        {/* Bubble */}
        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-purple-500 text-white rounded-br-md'
                : 'bg-white/10 text-white rounded-bl-md'
            }`}
          >
            {/* System message styling */}
            {message.message_type === 'system' ? (
              <p className="text-sm italic text-gray-400">{message.content}</p>
            ) : message.message_type === 'booking_update' ? (
              <div className="flex items-center gap-2">
                <span>📅</span>
                <p className="text-sm">{message.content}</p>
              </div>
            ) : message.message_type === 'image' && message.file_url ? (
              <img
                src={message.file_url}
                alt="Bild"
                className="max-w-full rounded-lg"
              />
            ) : message.message_type === 'file' && message.file_url ? (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm underline"
              >
                <span>📎</span>
                <span>{message.file_name || 'Datei herunterladen'}</span>
              </a>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
          </div>

          {/* Metadata */}
          <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : ''}`}>
            <span className="text-xs text-gray-500">
              {formatMessageTime(message.created_at)}
            </span>
            {message.is_edited && (
              <span className="text-xs text-gray-500">(bearbeitet)</span>
            )}
            {isOwn && message.is_read && (
              <span className="text-xs text-purple-400">✓✓</span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Empty State Component
function EmptyState({ type }: { type: 'no-chats' | 'no-selection' | 'no-messages' }) {
  const config = {
    'no-chats': {
      icon: '💬',
      title: 'Noch keine Chats',
      description: 'Starte eine Unterhaltung mit einem Künstler oder Veranstalter.'
    },
    'no-selection': {
      icon: '👈',
      title: 'Wähle einen Chat',
      description: 'Wähle eine Unterhaltung aus der Liste aus, um Nachrichten zu sehen.'
    },
    'no-messages': {
      icon: '📝',
      title: 'Keine Nachrichten',
      description: 'Schreibe die erste Nachricht, um die Unterhaltung zu starten.'
    }
  }

  const { icon, title, description } = config[type]

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md">{description}</p>
    </div>
  )
}

// Mock Data Generator
function generateMockData(): {
  conversations: Conversation[]
  messages: Record<string, Message[]>
} {
  const mockConversations: Conversation[] = [
    {
      id: 'conv1',
      booking_id: 'booking1',
      booking_request_id: null,
      participant_ids: ['currentUser', 'user1'],
      title: null,
      last_message_at: '2024-12-07T10:30:00Z',
      last_message_preview: 'Perfekt, dann sehen wir uns am Samstag!',
      is_archived: false,
      is_muted_by: null,
      created_at: '2024-12-01T09:00:00Z',
      updated_at: '2024-12-07T10:30:00Z',
      unread_count: 2,
      participants: [
        {
          id: 'user1',
          membername: 'DJ Soundwave',
          vorname: 'Max',
          nachname: 'Müller',
          profile_image_url: null,
          user_type: 'artist'
        }
      ],
      booking: {
        id: 'booking1',
        booking_number: 'BH-2024-0042',
        event_type: 'Hochzeit',
        event_date: '2024-12-14',
        status: 'confirmed'
      }
    },
    {
      id: 'conv2',
      booking_id: null,
      booking_request_id: 'req1',
      participant_ids: ['currentUser', 'user2'],
      title: null,
      last_message_at: '2024-12-06T18:45:00Z',
      last_message_preview: 'Vielen Dank für die Anfrage! Ich schaue mir das an.',
      is_archived: false,
      is_muted_by: null,
      created_at: '2024-12-06T14:00:00Z',
      updated_at: '2024-12-06T18:45:00Z',
      unread_count: 0,
      participants: [
        {
          id: 'user2',
          membername: 'Luna Beats',
          vorname: 'Lisa',
          nachname: 'Schmidt',
          profile_image_url: null,
          user_type: 'artist'
        }
      ],
      booking: null
    },
    {
      id: 'conv3',
      booking_id: null,
      booking_request_id: null,
      participant_ids: ['currentUser', 'user3'],
      title: null,
      last_message_at: '2024-12-05T12:00:00Z',
      last_message_preview: 'Hi! Ich habe eine Frage zu deinem Profil...',
      is_archived: false,
      is_muted_by: null,
      created_at: '2024-12-05T11:30:00Z',
      updated_at: '2024-12-05T12:00:00Z',
      unread_count: 1,
      participants: [
        {
          id: 'user3',
          membername: 'ClubNightWI',
          vorname: 'Anna',
          nachname: 'Weber',
          profile_image_url: null,
          user_type: 'veranstalter'
        }
      ],
      booking: null
    }
  ]

  const mockMessages: Record<string, Message[]> = {
    conv1: [
      {
        id: 'msg1',
        conversation_id: 'conv1',
        sender_id: 'currentUser',
        content: 'Hallo! Ich freue mich auf die Hochzeit am Samstag!',
        message_type: 'text',
        file_url: null,
        file_name: null,
        file_size: null,
        file_type: null,
        is_read: true,
        read_at: '2024-12-07T09:35:00Z',
        read_by: null,
        is_edited: false,
        edited_at: null,
        is_deleted: false,
        deleted_at: null,
        created_at: '2024-12-07T09:30:00Z',
        sender: {
          id: 'currentUser',
          membername: 'Mein Account',
          vorname: 'Max',
          nachname: 'Mustermann',
          profile_image_url: null
        }
      },
      {
        id: 'msg2',
        conversation_id: 'conv1',
        sender_id: 'user1',
        content: 'Hallo! Ich auch! Hast du noch irgendwelche speziellen Musikwünsche?',
        message_type: 'text',
        file_url: null,
        file_name: null,
        file_size: null,
        file_type: null,
        is_read: true,
        read_at: '2024-12-07T10:00:00Z',
        read_by: null,
        is_edited: false,
        edited_at: null,
        is_deleted: false,
        deleted_at: null,
        created_at: '2024-12-07T09:45:00Z',
        sender: {
          id: 'user1',
          membername: 'DJ Soundwave',
          vorname: 'Max',
          nachname: 'Müller',
          profile_image_url: null
        }
      },
      {
        id: 'msg3',
        conversation_id: 'conv1',
        sender_id: 'currentUser',
        content: 'Ja, wir hätten gerne viel 80er und 90er Musik! Und natürlich den Hochzeitswalzer.',
        message_type: 'text',
        file_url: null,
        file_name: null,
        file_size: null,
        file_type: null,
        is_read: true,
        read_at: '2024-12-07T10:10:00Z',
        read_by: null,
        is_edited: false,
        edited_at: null,
        is_deleted: false,
        deleted_at: null,
        created_at: '2024-12-07T10:05:00Z',
        sender: {
          id: 'currentUser',
          membername: 'Mein Account',
          vorname: 'Max',
          nachname: 'Mustermann',
          profile_image_url: null
        }
      },
      {
        id: 'msg4',
        conversation_id: 'conv1',
        sender_id: 'user1',
        content: 'Perfekt, dann sehen wir uns am Samstag!',
        message_type: 'text',
        file_url: null,
        file_name: null,
        file_size: null,
        file_type: null,
        is_read: false,
        read_at: null,
        read_by: null,
        is_edited: false,
        edited_at: null,
        is_deleted: false,
        deleted_at: null,
        created_at: '2024-12-07T10:30:00Z',
        sender: {
          id: 'user1',
          membername: 'DJ Soundwave',
          vorname: 'Max',
          nachname: 'Müller',
          profile_image_url: null
        }
      }
    ],
    conv2: [
      {
        id: 'msg5',
        conversation_id: 'conv2',
        sender_id: 'currentUser',
        content: 'Hallo Luna! Ich würde dich gerne für unser Firmenevent am 20. Dezember buchen.',
        message_type: 'text',
        file_url: null,
        file_name: null,
        file_size: null,
        file_type: null,
        is_read: true,
        read_at: '2024-12-06T15:00:00Z',
        read_by: null,
        is_edited: false,
        edited_at: null,
        is_deleted: false,
        deleted_at: null,
        created_at: '2024-12-06T14:00:00Z',
        sender: {
          id: 'currentUser',
          membername: 'Mein Account',
          vorname: 'Max',
          nachname: 'Mustermann',
          profile_image_url: null
        }
      },
      {
        id: 'msg6',
        conversation_id: 'conv2',
        sender_id: 'user2',
        content: 'Vielen Dank für die Anfrage! Ich schaue mir das an.',
        message_type: 'text',
        file_url: null,
        file_name: null,
        file_size: null,
        file_type: null,
        is_read: true,
        read_at: '2024-12-06T19:00:00Z',
        read_by: null,
        is_edited: false,
        edited_at: null,
        is_deleted: false,
        deleted_at: null,
        created_at: '2024-12-06T18:45:00Z',
        sender: {
          id: 'user2',
          membername: 'Luna Beats',
          vorname: 'Lisa',
          nachname: 'Schmidt',
          profile_image_url: null
        }
      }
    ],
    conv3: [
      {
        id: 'msg7',
        conversation_id: 'conv3',
        sender_id: 'user3',
        content: 'Hi! Ich habe eine Frage zu deinem Profil...',
        message_type: 'text',
        file_url: null,
        file_name: null,
        file_size: null,
        file_type: null,
        is_read: false,
        read_at: null,
        read_by: null,
        is_edited: false,
        edited_at: null,
        is_deleted: false,
        deleted_at: null,
        created_at: '2024-12-05T12:00:00Z',
        sender: {
          id: 'user3',
          membername: 'ClubNightWI',
          vorname: 'Anna',
          nachname: 'Weber',
          profile_image_url: null
        }
      }
    ]
  }

  return { conversations: mockConversations, messages: mockMessages }
}

export default function MyChatPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [stats, setStats] = useState<ChatStats>({
    totalConversations: 0,
    unreadMessages: 0,
    archivedConversations: 0
  })
  const [showMobileChat, setShowMobileChat] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Demo mode detection
  const isDemoMode = !user
  const currentUserId = user?.id || 'currentUser'

  // Load conversations
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)

      if (isDemoMode) {
        const mockData = generateMockData()
        setConversations(mockData.conversations)
        setStats({
          totalConversations: mockData.conversations.length,
          unreadMessages: mockData.conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0),
          archivedConversations: 0
        })
        setIsLoading(false)
        return
      }

      try {
        const [convsRes, statsRes] = await Promise.all([
          getConversations(currentUserId),
          getChatStats(currentUserId)
        ])

        setConversations(convsRes.data || [])
        setStats(statsRes)
      } catch (error) {
        console.error('Error loading chat data:', error)
      }

      setIsLoading(false)
    }

    loadData()
  }, [currentUserId, isDemoMode])

  // Load messages when conversation is selected
  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversation) {
        setMessages([])
        return
      }

      if (isDemoMode) {
        const mockData = generateMockData()
        setMessages(mockData.messages[selectedConversation.id] || [])
        return
      }

      try {
        const { data } = await getMessages(selectedConversation.id)
        setMessages(data || [])

        // Mark messages as read
        await markMessagesAsRead(selectedConversation.id, currentUserId)

        // Update unread count in conversation list
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConversation.id ? { ...c, unread_count: 0 } : c
          )
        )
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
  }, [selectedConversation, currentUserId, isDemoMode])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedConversation?.id || isDemoMode) return

    const unsubscribe = subscribeToMessages(
      selectedConversation.id,
      (newMessage) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m.id === newMessage.id)) return prev
          return [...prev, newMessage]
        })
        scrollToBottom()

        // If message is from someone else, mark it as read
        if (newMessage.sender_id !== currentUserId) {
          markMessagesAsRead(selectedConversation.id, currentUserId)
        }
      }
    )

    return () => unsubscribe()
  }, [selectedConversation?.id, currentUserId, isDemoMode, scrollToBottom])

  // Real-time subscription for conversation updates
  useEffect(() => {
    if (isDemoMode) return

    const unsubscribe = subscribeToConversations(
      currentUserId,
      (updatedConversation) => {
        setConversations(prev => {
          const index = prev.findIndex(c => c.id === updatedConversation.id)
          if (index >= 0) {
            // Update existing conversation
            const updated = [...prev]
            updated[index] = { ...updated[index], ...updatedConversation }
            return updated
          }
          // New conversation - add to list
          return [updatedConversation, ...prev]
        })
      }
    )

    return () => unsubscribe()
  }, [currentUserId, isDemoMode])

  // Handle search
  async function handleSearch(term: string) {
    setSearchTerm(term)

    if (!term.trim()) {
      if (isDemoMode) {
        const mockData = generateMockData()
        setConversations(mockData.conversations)
      } else {
        const { data } = await getConversations(currentUserId)
        setConversations(data || [])
      }
      return
    }

    if (isDemoMode) {
      const mockData = generateMockData()
      const lowerTerm = term.toLowerCase()
      setConversations(
        mockData.conversations.filter(c =>
          c.title?.toLowerCase().includes(lowerTerm) ||
          c.last_message_preview?.toLowerCase().includes(lowerTerm) ||
          c.participants?.some(p =>
            p.membername?.toLowerCase().includes(lowerTerm) ||
            p.vorname?.toLowerCase().includes(lowerTerm) ||
            p.nachname?.toLowerCase().includes(lowerTerm)
          )
        )
      )
      return
    }

    const { data } = await searchConversations(currentUserId, term)
    setConversations(data || [])
  }

  // Handle send message
  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)

    if (isDemoMode) {
      // Add mock message
      const mockMessage: Message = {
        id: `msg-${Date.now()}`,
        conversation_id: selectedConversation.id,
        sender_id: 'currentUser',
        content: newMessage,
        message_type: 'text',
        file_url: null,
        file_name: null,
        file_size: null,
        file_type: null,
        is_read: false,
        read_at: null,
        read_by: null,
        is_edited: false,
        edited_at: null,
        is_deleted: false,
        deleted_at: null,
        created_at: new Date().toISOString(),
        sender: {
          id: 'currentUser',
          membername: 'Mein Account',
          vorname: 'Max',
          nachname: 'Mustermann',
          profile_image_url: null
        }
      }
      setMessages(prev => [...prev, mockMessage])

      // Update conversation preview
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? {
                ...c,
                last_message_at: mockMessage.created_at,
                last_message_preview: newMessage.substring(0, 100)
              }
            : c
        )
      )

      setNewMessage('')
      setIsSending(false)
      inputRef.current?.focus()
      return
    }

    try {
      const { data } = await sendMessage(selectedConversation.id, currentUserId, newMessage)
      if (data) {
        setMessages(prev => [...prev, data])

        // Update conversation preview
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConversation.id
              ? {
                  ...c,
                  last_message_at: data.created_at,
                  last_message_preview: newMessage.substring(0, 100)
                }
              : c
          )
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }

    setNewMessage('')
    setIsSending(false)
    inputRef.current?.focus()
  }

  // Handle archive conversation
  async function handleArchive(conversationId: string) {
    if (isDemoMode) {
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
      }
      return
    }

    const { error } = await archiveConversation(conversationId)
    if (!error) {
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
      }
    }
  }

  // Handle conversation selection
  function handleSelectConversation(conversation: Conversation) {
    setSelectedConversation(conversation)
    setShowMobileChat(true)
  }

  // Get date dividers for messages
  function getMessageDateDivider(message: Message, prevMessage?: Message): string | null {
    const msgDate = new Date(message.created_at).toDateString()
    const prevDate = prevMessage ? new Date(prevMessage.created_at).toDateString() : null

    if (msgDate !== prevDate) {
      return formatMessageDate(message.created_at)
    }
    return null
  }

  // Should show avatar (first message in group from same sender)
  function shouldShowAvatar(message: Message, nextMessage?: Message): boolean {
    if (!nextMessage) return true
    return message.sender_id !== nextMessage.sender_id
  }

  return (
    <div className="min-h-screen bg-[#171717] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Meine Nachrichten</h1>
          <p className="text-gray-400">
            Kommuniziere mit Künstlern und Veranstaltern
          </p>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/30 rounded-xl">
            <p className="text-orange-400 text-sm">
              🎭 <strong>Demo-Modus:</strong> Du siehst Beispieldaten. Melde dich an, um deine echten Nachrichten zu sehen.
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard
            label="Chats"
            value={stats.totalConversations}
            icon="💬"
            color="bg-purple-500/20"
          />
          <StatCard
            label="Ungelesen"
            value={stats.unreadMessages}
            icon="📩"
            color="bg-orange-500/20"
          />
          <StatCard
            label="Archiviert"
            value={stats.archivedConversations}
            icon="📦"
            color="bg-gray-500/20"
          />
        </div>

        {/* Main Chat Container */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden" style={{ height: 'calc(100vh - 350px)', minHeight: '500px' }}>
          <div className="flex h-full">
            {/* Conversation List (Sidebar) */}
            <div className={`w-full md:w-96 border-r border-white/10 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
              {/* Search */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Chats durchsuchen..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="space-y-1">
                    {conversations.map(conversation => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        currentUserId={currentUserId}
                        isActive={selectedConversation?.id === conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="no-chats" />
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Mobile back button */}
                      <button
                        onClick={() => setShowMobileChat(false)}
                        className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                      >
                        ←
                      </button>

                      {/* Participant info */}
                      {(() => {
                        const other = getOtherParticipant(selectedConversation, currentUserId)
                        const name = selectedConversation.title ||
                          other?.membername ||
                          `${other?.vorname || ''} ${other?.nachname || ''}`.trim() ||
                          'Unbekannt'
                        const initials = name.charAt(0).toUpperCase()

                        return (
                          <>
                            {other?.profile_image_url ? (
                              <img
                                src={other.profile_image_url}
                                alt={name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                {initials}
                              </div>
                            )}
                            <div>
                              <h3 className="text-white font-medium">{name}</h3>
                              {selectedConversation.booking && (
                                <p className="text-xs text-orange-400">
                                  Buchung #{selectedConversation.booking.booking_number}
                                </p>
                              )}
                            </div>
                          </>
                        )
                      })()}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleArchive(selectedConversation.id)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Archivieren"
                      >
                        📦
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Mehr Optionen"
                      >
                        ⋮
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {messages.length > 0 ? (
                      <>
                        {messages.map((message, index) => (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={message.sender_id === currentUserId}
                            showAvatar={shouldShowAvatar(message, messages[index + 1])}
                            showDate={getMessageDateDivider(message, messages[index - 1])}
                          />
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <EmptyState type="no-messages" />
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      {/* Attachment button */}
                      <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Datei anhängen"
                      >
                        📎
                      </button>

                      {/* Input */}
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="Nachricht schreiben..."
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      />

                      {/* Emoji button */}
                      <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Emoji"
                      >
                        😊
                      </button>

                      {/* Send button */}
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                      >
                        {isSending ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          '➤'
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState type="no-selection" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/artists"
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>🔍</span>
            <span>Künstler finden</span>
          </a>
          <button
            onClick={() => alert('Archiv-Funktion kommt bald!')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>📦</span>
            <span>Archiv anzeigen</span>
          </button>
        </div>
      </div>
    </div>
  )
}
