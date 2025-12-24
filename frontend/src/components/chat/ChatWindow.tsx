import { useEffect, useRef, useCallback } from 'react'
import { type Message, type Conversation } from '../../services/chatService'
import { getOtherParticipant } from '../../services/chatService'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'

interface ChatWindowProps {
  conversation: Conversation | null
  messages: Message[]
  currentUserId: string
  loading?: boolean
  sending?: boolean
  error?: string | null
  hasMore?: boolean
  onSendMessage: (content: string) => Promise<boolean>
  onLoadMore?: () => Promise<void>
  onBack?: () => void
  showBackButton?: boolean
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  loading = false,
  sending = false,
  error = null,
  hasMore = false,
  onSendMessage,
  onLoadMore,
  onBack,
  showBackButton = false
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollHeightRef = useRef<number>(0)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  // Handle scroll for loading more messages
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || !hasMore || loading || !onLoadMore) return

    const { scrollTop } = messagesContainerRef.current
    if (scrollTop < 100) {
      // Save scroll height before loading more
      lastScrollHeightRef.current = messagesContainerRef.current.scrollHeight
      onLoadMore()
    }
  }, [hasMore, loading, onLoadMore])

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (messagesContainerRef.current && lastScrollHeightRef.current > 0) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight
      const scrollDiff = newScrollHeight - lastScrollHeightRef.current
      if (scrollDiff > 0) {
        messagesContainerRef.current.scrollTop = scrollDiff
      }
      lastScrollHeightRef.current = 0
    }
  }, [messages])

  const handleSendMessage = async (content: string) => {
    await onSendMessage(content)
  }

  // Get display info for header
  const otherParticipant = conversation ? getOtherParticipant(conversation, currentUserId) : null
  const displayName = conversation?.title ||
    otherParticipant?.membername ||
    `${otherParticipant?.vorname || ''} ${otherParticipant?.nachname || ''}`.trim() ||
    'Chat'
  const initials = displayName.charAt(0).toUpperCase()

  // No conversation selected state
  if (!conversation) {
    return (
      <div className="flex flex-col h-full bg-[#1a1a1a]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-gray-400 mb-2">Waehle eine Konversation</p>
            <p className="text-sm text-gray-500">
              Oder starte eine neue Unterhaltung
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = []
  let currentDate = ''

  messages.forEach((message) => {
    const messageDate = new Date(message.created_at).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    if (messageDate !== currentDate) {
      currentDate = messageDate
      groupedMessages.push({ date: messageDate, messages: [message] })
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message)
    }
  })

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-[#171717] border-b border-white/10">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
            title="Zurueck"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-gray-400"
            >
              <path
                fillRule="evenodd"
                d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Avatar */}
        {otherParticipant?.profile_image_url ? (
          <img
            src={otherParticipant.profile_image_url}
            alt={displayName}
            loading="lazy"
            decoding="async"
            className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#610AD1] to-[#F92B02] flex items-center justify-center text-white font-bold">
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-medium text-white truncate">{displayName}</h2>
          {conversation.booking && (
            <p className="text-xs text-[#610AD1]">
              Buchung #{conversation.booking.booking_number}
            </p>
          )}
        </div>

        {/* Actions menu placeholder */}
        <button
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          title="Optionen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-gray-400"
          >
            <path
              fillRule="evenodd"
              d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar p-4"
      >
        {/* Load more indicator */}
        {loading && messages.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#610AD1] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Has more indicator */}
        {hasMore && !loading && (
          <div className="flex justify-center py-2">
            <button
              onClick={onLoadMore}
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              Aeltere Nachrichten laden
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <p className="text-gray-400 mb-2">Noch keine Nachrichten</p>
            <p className="text-sm text-gray-500">
              Sende eine Nachricht, um die Unterhaltung zu starten
            </p>
          </div>
        )}

        {/* Messages grouped by date */}
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-white/5 rounded-full">
                <span className="text-xs text-gray-500">{group.date}</span>
              </div>
            </div>

            {/* Messages */}
            {group.messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId
              const prevMessage = index > 0 ? group.messages[index - 1] : null
              const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              )
            })}
          </div>
        ))}

        {/* Loading state for initial load */}
        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-[#610AD1] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex justify-center py-4">
            <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sending}
      />
    </div>
  )
}

export default ChatWindow
