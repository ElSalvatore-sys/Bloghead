import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/utils'
import { MessageBubble } from './MessageBubble'
import type { Message } from '../../services/chatService'

// Mock the chatService formatMessageTime function
vi.mock('../../services/chatService', async () => {
  const actual = await vi.importActual('../../services/chatService')
  return {
    ...actual,
    formatMessageTime: vi.fn((timestamp: string) => {
      const date = new Date(timestamp)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    })
  }
})

describe('MessageBubble', () => {
  const baseMessage: Message = {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_id: 'user-1',
    content: 'Hallo, wie geht es dir?',
    message_type: 'text',
    created_at: '2025-12-09T10:30:00Z',
    is_read: false,
    is_edited: false,
    sender: {
      id: 'user-1',
      membername: 'MaxMustermann',
      vorname: 'Max',
      nachname: 'Mustermann',
      profile_image_url: null
    }
  }

  describe('rendering', () => {
    it('renders message content', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />)
      expect(screen.getByText('Hallo, wie geht es dir?')).toBeInTheDocument()
    })

    it('renders sender name for received messages', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />)
      expect(screen.getByText('MaxMustermann')).toBeInTheDocument()
    })

    it('does not render sender name for own messages', () => {
      render(<MessageBubble message={baseMessage} isOwn={true} />)
      expect(screen.queryByText('MaxMustermann')).not.toBeInTheDocument()
    })

    it('renders timestamp', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />)
      // formatMessageTime returns HH:MM format - time may vary by timezone
      // Just check that there's a timestamp-like pattern displayed
      const timestampElement = document.querySelector('.text-\\[10px\\]')
      expect(timestampElement).toBeInTheDocument()
      expect(timestampElement?.textContent).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe('avatar', () => {
    it('shows initials when no profile image', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />)
      expect(screen.getByText('M')).toBeInTheDocument() // First letter of MaxMustermann
    })

    it('shows profile image when available', () => {
      const messageWithImage: Message = {
        ...baseMessage,
        sender: {
          ...baseMessage.sender!,
          profile_image_url: 'https://example.com/avatar.jpg'
        }
      }
      render(<MessageBubble message={messageWithImage} isOwn={false} />)
      expect(screen.getByAltText('MaxMustermann')).toBeInTheDocument()
    })

    it('hides avatar when showAvatar is false', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} showAvatar={false} />)
      expect(screen.queryByText('M')).not.toBeInTheDocument()
    })

    it('does not show avatar for own messages', () => {
      render(<MessageBubble message={baseMessage} isOwn={true} showAvatar={true} />)
      // Own messages align right and don't show avatar
      expect(screen.queryByText('M')).not.toBeInTheDocument()
    })
  })

  describe('read status', () => {
    it('shows single checkmark for unread own messages', () => {
      render(<MessageBubble message={baseMessage} isOwn={true} />)
      expect(screen.getByTitle('Gesendet')).toBeInTheDocument()
    })

    it('shows double checkmark for read own messages', () => {
      const readMessage: Message = { ...baseMessage, is_read: true }
      render(<MessageBubble message={readMessage} isOwn={true} />)
      expect(screen.getByTitle('Gelesen')).toBeInTheDocument()
    })

    it('does not show read status for received messages', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />)
      expect(screen.queryByTitle('Gesendet')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Gelesen')).not.toBeInTheDocument()
    })
  })

  describe('edited status', () => {
    it('shows edited indicator when message is edited', () => {
      const editedMessage: Message = { ...baseMessage, is_edited: true }
      render(<MessageBubble message={editedMessage} isOwn={false} />)
      expect(screen.getByText('(bearbeitet)')).toBeInTheDocument()
    })

    it('does not show edited indicator when not edited', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />)
      expect(screen.queryByText('(bearbeitet)')).not.toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('applies gradient background for own messages', () => {
      const { container } = render(<MessageBubble message={baseMessage} isOwn={true} />)
      const bubble = container.querySelector('.bg-gradient-to-r')
      expect(bubble).toBeInTheDocument()
    })

    it('applies dark background for received messages', () => {
      const { container } = render(<MessageBubble message={baseMessage} isOwn={false} />)
      const bubble = container.querySelector('.bg-\\[\\#262626\\]')
      expect(bubble).toBeInTheDocument()
    })

    it('aligns own messages to the right', () => {
      const { container } = render(<MessageBubble message={baseMessage} isOwn={true} />)
      expect(container.firstChild).toHaveClass('flex-row-reverse')
    })

    it('aligns received messages to the left', () => {
      const { container } = render(<MessageBubble message={baseMessage} isOwn={false} />)
      expect(container.firstChild).toHaveClass('flex-row')
    })
  })

  describe('system messages', () => {
    it('renders system message differently', () => {
      const systemMessage: Message = {
        ...baseMessage,
        message_type: 'system',
        content: 'Konversation wurde erstellt'
      }
      render(<MessageBubble message={systemMessage} isOwn={false} />)
      expect(screen.getByText('Konversation wurde erstellt')).toBeInTheDocument()
    })

    it('renders booking update message with emoji', () => {
      const bookingMessage: Message = {
        ...baseMessage,
        message_type: 'booking_update',
        content: 'Buchung bestaetigt'
      }
      render(<MessageBubble message={bookingMessage} isOwn={false} />)
      expect(screen.getByText(/Buchung bestaetigt/)).toBeInTheDocument()
    })

    it('centers system messages', () => {
      const systemMessage: Message = {
        ...baseMessage,
        message_type: 'system',
        content: 'System message'
      }
      const { container } = render(<MessageBubble message={systemMessage} isOwn={false} />)
      expect(container.firstChild).toHaveClass('justify-center')
    })
  })

  describe('file attachments', () => {
    it('renders image attachment', () => {
      const imageMessage: Message = {
        ...baseMessage,
        message_type: 'image',
        file_url: 'https://example.com/image.jpg',
        file_name: 'photo.jpg'
      }
      render(<MessageBubble message={imageMessage} isOwn={false} />)
      expect(screen.getByAltText('photo.jpg')).toBeInTheDocument()
    })

    it('renders audio attachment', () => {
      const audioMessage: Message = {
        ...baseMessage,
        message_type: 'audio',
        file_url: 'https://example.com/audio.mp3'
      }
      const { container } = render(<MessageBubble message={audioMessage} isOwn={false} />)
      expect(container.querySelector('audio')).toBeInTheDocument()
    })

    it('renders file attachment link', () => {
      const fileMessage: Message = {
        ...baseMessage,
        message_type: 'file',
        file_url: 'https://example.com/document.pdf',
        file_name: 'Vertrag.pdf'
      }
      render(<MessageBubble message={fileMessage} isOwn={false} />)
      expect(screen.getByText('Vertrag.pdf')).toBeInTheDocument()
    })

    it('shows default text when file_name is missing', () => {
      const fileMessage: Message = {
        ...baseMessage,
        message_type: 'file',
        file_url: 'https://example.com/file.pdf'
      }
      render(<MessageBubble message={fileMessage} isOwn={false} />)
      expect(screen.getByText('Datei herunterladen')).toBeInTheDocument()
    })
  })

  describe('sender name fallbacks', () => {
    it('uses membername first', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />)
      expect(screen.getByText('MaxMustermann')).toBeInTheDocument()
    })

    it('falls back to vorname nachname', () => {
      const messageWithoutMembername: Message = {
        ...baseMessage,
        sender: {
          ...baseMessage.sender!,
          membername: ''
        }
      }
      render(<MessageBubble message={messageWithoutMembername} isOwn={false} />)
      expect(screen.getByText('Max Mustermann')).toBeInTheDocument()
    })

    it('shows Unbekannt when no name available', () => {
      const messageWithoutSender: Message = {
        ...baseMessage,
        sender: undefined
      }
      render(<MessageBubble message={messageWithoutSender} isOwn={false} />)
      expect(screen.getByText('Unbekannt')).toBeInTheDocument()
    })
  })
})
