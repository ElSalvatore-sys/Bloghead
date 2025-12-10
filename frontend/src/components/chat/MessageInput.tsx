import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { sanitizeInput } from '../../lib/security/sanitize'

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Nachricht schreiben...'
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage || sending || disabled) return

    // Sanitize the message before sending
    const sanitizedMessage = sanitizeInput(trimmedMessage)
    if (!sanitizedMessage) return

    setSending(true)
    try {
      await onSendMessage(sanitizedMessage)
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const isDisabled = disabled || sending
  const canSend = message.trim().length > 0 && !isDisabled

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 bg-[#171717] border-t border-white/10">
      {/* Text Input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className={`w-full px-4 py-3 bg-[#262626] text-white rounded-2xl border border-white/10
            focus:border-[#610AD1] focus:ring-1 focus:ring-[#610AD1] focus:outline-none
            placeholder:text-gray-500 resize-none transition-colors
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
      </div>

      {/* Send Button */}
      <button
        type="submit"
        disabled={!canSend}
        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all
          ${canSend
            ? 'bg-gradient-to-r from-[#610AD1] to-[#F92B02] text-white hover:opacity-90 active:scale-95'
            : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }`}
        title={canSend ? 'Nachricht senden' : 'Nachricht eingeben'}
      >
        {sending ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        )}
      </button>
    </form>
  )
}

export default MessageInput
