import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, User, Check, CheckCheck } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  getBookingMessages,
  sendBookingMessage,
  markMessagesAsRead,
  subscribeToBookingMessages
} from '../../services/bookingMessagesService'
import type { BookingMessage, MessageType } from '../../types/booking'
import { MESSAGE_TYPE_LABELS } from '../../types/booking'
import { useAuth } from '../../contexts/AuthContext'

interface BookingMessagesPanelProps {
  bookingRequestId: string
  className?: string
}

export function BookingMessagesPanel({ bookingRequestId, className = '' }: BookingMessagesPanelProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<BookingMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load messages
  useEffect(() => {
    async function loadMessages() {
      try {
        setError(null)
        const data = await getBookingMessages(bookingRequestId)
        setMessages(data)
        await markMessagesAsRead(bookingRequestId)
      } catch (err) {
        console.error('Error loading messages:', err)
        setError('Nachrichten konnten nicht geladen werden')
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [bookingRequestId])

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = subscribeToBookingMessages(bookingRequestId, (newMsg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
      markMessagesAsRead(bookingRequestId)
    })

    return unsubscribe
  }, [bookingRequestId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto'
    // Set to scrollHeight but cap at 120px
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    setError(null)

    try {
      const sent = await sendBookingMessage(bookingRequestId, newMessage.trim())
      setMessages(prev => [...prev, sent])
      setNewMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Nachricht konnte nicht gesendet werden')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return format(date, 'HH:mm', { locale: de })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Gestern, ${format(date, 'HH:mm', { locale: de })}`
    } else {
      return format(date, 'dd.MM.yyyy, HH:mm', { locale: de })
    }
  }

  const getMessageTypeIndicator = (type: MessageType) => {
    if (type === 'text') return null

    const colors: Record<MessageType, string> = {
      text: '',
      system: 'bg-blue-500/20 text-blue-400',
      offer: 'bg-green-500/20 text-green-400',
      counter_offer: 'bg-orange-500/20 text-orange-400',
      file: 'bg-purple-500/20 text-purple-400'
    }

    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${colors[type]}`}>
        {MESSAGE_TYPE_LABELS[type]}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className={`bg-bg-card rounded-xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-bg-card rounded-xl flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold text-white">Nachrichten</h3>
        <p className="text-sm text-white/60">{messages.length} Nachrichten</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px] min-h-[200px]">
        {messages.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Send className="w-8 h-8 text-white/30" />
            </div>
            <p>Noch keine Nachrichten</p>
            <p className="text-sm mt-1">Starte die Konversation!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isOwn = msg.sender_id === user?.id
              const showDate = index === 0 ||
                new Date(msg.created_at).toDateString() !==
                new Date(messages[index - 1].created_at).toDateString()

              return (
                <div key={msg.id}>
                  {/* Date separator */}
                  {showDate && (
                    <div className="flex items-center gap-4 my-4">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs text-white/40">
                        {format(new Date(msg.created_at), 'EEEE, d. MMMM', { locale: de })}
                      </span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0 mt-1">
                        {msg.sender?.profile_image_url ? (
                          <img
                            src={msg.sender.profile_image_url}
                            alt={msg.sender.vorname}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-accent-purple" />
                          </div>
                        )}
                      </div>

                      {/* Message bubble */}
                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        {/* Sender name (only for others' messages) */}
                        {!isOwn && (
                          <span className="text-xs text-white/50 mb-1 ml-1">
                            {msg.sender?.vorname} {msg.sender?.nachname}
                          </span>
                        )}

                        {/* Message type indicator */}
                        {getMessageTypeIndicator(msg.message_type)}

                        {/* Message content */}
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            isOwn
                              ? 'bg-accent-purple text-white rounded-br-md'
                              : 'bg-white/10 text-white rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {msg.message}
                          </p>
                        </div>

                        {/* Time and read status */}
                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs text-white/40">
                            {formatMessageTime(msg.created_at)}
                          </span>
                          {isOwn && (
                            msg.is_read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-white/40" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht schreiben..."
              rows={1}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50 resize-none transition-all"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              type="button"
              className="absolute right-3 bottom-3 text-white/40 hover:text-white/70 transition-colors"
              title="Datei anhängen"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title="Nachricht senden"
          >
            <Send className={`w-5 h-5 ${isSending ? 'animate-pulse' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-white/30 mt-2 text-center">
          Drücke Enter zum Senden, Shift+Enter für neue Zeile
        </p>
      </div>
    </div>
  )
}

export default BookingMessagesPanel
