import { type Message } from '../../services/chatService'
import { formatMessageTime } from '../../services/chatService'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const senderName = message.sender?.membername ||
    `${message.sender?.vorname || ''} ${message.sender?.nachname || ''}`.trim() ||
    'Unbekannt'
  const initials = senderName.charAt(0).toUpperCase()

  // Format timestamp
  const timestamp = formatMessageTime(message.created_at)

  // System message styling
  if (message.message_type === 'system' || message.message_type === 'booking_update') {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 max-w-[80%]">
          <p className="text-sm text-gray-400 text-center">
            {message.message_type === 'booking_update' && (
              <span className="mr-2">📅</span>
            )}
            {message.content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0">
          {message.sender?.profile_image_url ? (
            <img
              src={message.sender.profile_image_url}
              alt={senderName}
              loading="lazy"
              decoding="async"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#610AD1] to-[#F92B02] flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          )}
        </div>
      )}
      {/* Spacer for alignment when no avatar */}
      {!showAvatar && !isOwn && <div className="w-8" />}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Sender name for received messages */}
        {!isOwn && showAvatar && (
          <span className="text-xs text-gray-500 mb-1 ml-1">{senderName}</span>
        )}

        {/* Message Bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl break-words ${
            isOwn
              ? 'bg-gradient-to-r from-[#610AD1] to-[#F92B02] text-white rounded-br-md'
              : 'bg-[#262626] text-gray-100 rounded-bl-md'
          }`}
        >
          {/* Text content */}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* File attachment */}
          {message.file_url && (
            <div className="mt-2">
              {message.message_type === 'image' ? (
                <img
                  src={message.file_url}
                  alt={message.file_name || 'Bild'}
                  loading="lazy"
                  decoding="async"
                  className="max-w-full rounded-lg max-h-60 object-cover"
                />
              ) : message.message_type === 'audio' ? (
                <audio controls className="max-w-full">
                  <source src={message.file_url} />
                </audio>
              ) : (
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 text-sm ${
                    isOwn ? 'text-white/80 hover:text-white' : 'text-[#610AD1] hover:underline'
                  }`}
                >
                  <span>📎</span>
                  <span className="truncate">{message.file_name || 'Datei herunterladen'}</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Timestamp and status */}
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'mr-1' : 'ml-1'}`}>
          <span className="text-[10px] text-gray-500">{timestamp}</span>
          {isOwn && (
            <span className="text-[10px]">
              {message.is_read ? (
                <span className="text-[#610AD1]" title="Gelesen">✓✓</span>
              ) : (
                <span className="text-gray-500" title="Gesendet">✓</span>
              )}
            </span>
          )}
          {message.is_edited && (
            <span className="text-[10px] text-gray-500">(bearbeitet)</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
