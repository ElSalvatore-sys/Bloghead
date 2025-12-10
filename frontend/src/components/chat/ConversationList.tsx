import { type Conversation } from '../../services/chatService'
import { getOtherParticipant, formatMessageTime } from '../../services/chatService'

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
  activeConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  loading?: boolean
  error?: string | null
}

interface ConversationItemProps {
  conversation: Conversation
  currentUserId: string
  isActive: boolean
  onClick: () => void
}

function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  onClick
}: ConversationItemProps) {
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
          ? 'bg-gradient-to-r from-[#610AD1]/20 to-[#F92B02]/20 border border-[#610AD1]/40'
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
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#610AD1] to-[#F92B02] flex items-center justify-center text-white font-bold">
            {initials}
          </div>
        )}
        {hasUnread && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F92B02] rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">
              {conversation.unread_count! > 9 ? '9+' : conversation.unread_count}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-medium truncate ${hasUnread ? 'text-white' : 'text-gray-300'}`}>
            {displayName}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {conversation.last_message_at && formatMessageTime(conversation.last_message_at)}
          </span>
        </div>
        <p className={`text-sm truncate ${hasUnread ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
          {conversation.last_message_preview || 'Noch keine Nachrichten'}
        </p>
        {conversation.booking && (
          <div className="mt-1 flex items-center gap-1 text-xs text-[#610AD1]">
            <span>📅</span>
            <span>Buchung #{conversation.booking.booking_number}</span>
          </div>
        )}
      </div>
    </button>
  )
}

export function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  onSelectConversation,
  loading = false,
  error = null
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#171717]">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Nachrichten</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#610AD1] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-[#171717]">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Nachrichten</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-[#610AD1] hover:underline"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#171717]">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white">Nachrichten</h2>
        <p className="text-sm text-gray-400">
          {conversations.length} {conversations.length === 1 ? 'Konversation' : 'Konversationen'}
        </p>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-gray-400 mb-2">Keine Konversationen</p>
            <p className="text-sm text-gray-500">
              Starte eine neue Unterhaltung mit einem Kuenstler oder Veranstalter
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUserId}
                isActive={activeConversationId === conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationList
