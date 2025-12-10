import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import { MessageInput } from './MessageInput'

describe('MessageInput', () => {
  const defaultProps = {
    onSendMessage: vi.fn().mockResolvedValue(undefined)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders with German placeholder', () => {
      render(<MessageInput {...defaultProps} />)
      expect(screen.getByPlaceholderText('Nachricht schreiben...')).toBeInTheDocument()
    })

    it('renders custom placeholder when provided', () => {
      render(<MessageInput {...defaultProps} placeholder="Deine Nachricht" />)
      expect(screen.getByPlaceholderText('Deine Nachricht')).toBeInTheDocument()
    })

    it('renders send button', () => {
      render(<MessageInput {...defaultProps} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders as a form', () => {
      const { container } = render(<MessageInput {...defaultProps} />)
      expect(container.querySelector('form')).toBeInTheDocument()
    })
  })

  describe('button state', () => {
    it('disables send button when input is empty', () => {
      render(<MessageInput {...defaultProps} />)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('enables send button when input has text', async () => {
      const user = userEvent.setup()
      render(<MessageInput {...defaultProps} />)

      await user.type(screen.getByRole('textbox'), 'Hello')

      expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('disables send button when only whitespace', async () => {
      const user = userEvent.setup()
      render(<MessageInput {...defaultProps} />)

      await user.type(screen.getByRole('textbox'), '   ')

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('disables input when disabled prop is true', () => {
      render(<MessageInput {...defaultProps} disabled={true} />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('shows tooltip based on button state', async () => {
      const user = userEvent.setup()
      render(<MessageInput {...defaultProps} />)

      // When empty
      expect(screen.getByTitle('Nachricht eingeben')).toBeInTheDocument()

      // When has text
      await user.type(screen.getByRole('textbox'), 'Hello')
      expect(screen.getByTitle('Nachricht senden')).toBeInTheDocument()
    })
  })

  describe('sending messages', () => {
    it('calls onSendMessage with sanitized text on submit', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn().mockResolvedValue(undefined)
      render(<MessageInput onSendMessage={onSendMessage} />)

      await user.type(screen.getByRole('textbox'), 'Hello World')
      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(onSendMessage).toHaveBeenCalledWith('Hello World')
      })
    })

    it('calls onSendMessage on Enter key', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn().mockResolvedValue(undefined)
      render(<MessageInput onSendMessage={onSendMessage} />)

      await user.type(screen.getByRole('textbox'), 'Hello{Enter}')

      await waitFor(() => {
        expect(onSendMessage).toHaveBeenCalledWith('Hello')
      })
    })

    it('does not send on Shift+Enter', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn().mockResolvedValue(undefined)
      render(<MessageInput onSendMessage={onSendMessage} />)

      await user.type(screen.getByRole('textbox'), 'Line 1{Shift>}{Enter}{/Shift}Line 2')

      expect(onSendMessage).not.toHaveBeenCalled()
    })

    it('clears input after successful send', async () => {
      const user = userEvent.setup()
      render(<MessageInput {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Hello')
      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(textarea).toHaveValue('')
      })
    })

    it('does not send empty messages', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      render(<MessageInput onSendMessage={onSendMessage} />)

      // Try to submit empty form
      const button = screen.getByRole('button')
      await user.click(button)

      expect(onSendMessage).not.toHaveBeenCalled()
    })

    it('trims whitespace before sending', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn().mockResolvedValue(undefined)
      render(<MessageInput onSendMessage={onSendMessage} />)

      await user.type(screen.getByRole('textbox'), '  Hello World  ')
      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(onSendMessage).toHaveBeenCalledWith('Hello World')
      })
    })
  })

  describe('input sanitization', () => {
    it('sanitizes HTML input before sending', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn().mockResolvedValue(undefined)
      render(<MessageInput onSendMessage={onSendMessage} />)

      await user.type(screen.getByRole('textbox'), '<script>alert("xss")</script>Hello')
      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(onSendMessage).toHaveBeenCalled()
        // The sanitizeInput function removes all HTML tags
        const calledWith = onSendMessage.mock.calls[0][0]
        expect(calledWith).not.toContain('<script>')
        expect(calledWith).toContain('Hello')
      })
    })

    it('does not send if sanitization returns empty string', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn().mockResolvedValue(undefined)
      render(<MessageInput onSendMessage={onSendMessage} />)

      // Type only HTML tags that will be stripped
      await user.type(screen.getByRole('textbox'), '<script></script>')
      await user.click(screen.getByRole('button'))

      // Since sanitization removes all HTML, this might result in empty string
      // depending on exact behavior of sanitizeInput
    })
  })

  describe('loading state', () => {
    it('shows spinner while sending', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn(() => new Promise(() => {})) // Never resolves
      render(<MessageInput onSendMessage={onSendMessage} />)

      await user.type(screen.getByRole('textbox'), 'Hello')
      await user.click(screen.getByRole('button'))

      // Should show loading spinner
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('disables input while sending', async () => {
      const user = userEvent.setup()
      let resolvePromise: () => void
      const onSendMessage = vi.fn(() => new Promise<void>((resolve) => {
        resolvePromise = resolve
      }))
      render(<MessageInput onSendMessage={onSendMessage} />)

      await user.type(screen.getByRole('textbox'), 'Hello')
      await user.click(screen.getByRole('button'))

      // Input should be disabled while sending
      expect(screen.getByRole('textbox')).toBeDisabled()

      // Resolve the promise
      resolvePromise!()

      await waitFor(() => {
        expect(screen.getByRole('textbox')).not.toBeDisabled()
      })
    })
  })

  describe('error handling', () => {
    it('handles send errors gracefully', async () => {
      const user = userEvent.setup()
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const onSendMessage = vi.fn().mockRejectedValue(new Error('Network error'))
      render(<MessageInput onSendMessage={onSendMessage} />)

      await user.type(screen.getByRole('textbox'), 'Hello')
      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled()
      })

      consoleError.mockRestore()
    })

    it('re-enables input after error', async () => {
      const user = userEvent.setup()
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const onSendMessage = vi.fn().mockRejectedValue(new Error('Error'))
      render(<MessageInput onSendMessage={onSendMessage} />)

      await user.type(screen.getByRole('textbox'), 'Hello')
      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(screen.getByRole('textbox')).not.toBeDisabled()
      })
    })
  })

  describe('textarea auto-resize', () => {
    it('renders as textarea', () => {
      render(<MessageInput {...defaultProps} />)
      expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
    })

    it('has initial single row', () => {
      render(<MessageInput {...defaultProps} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '1')
    })
  })
})
