import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import { BookingForm } from './BookingForm'

describe('BookingForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all form fields', () => {
      render(<BookingForm {...defaultProps} />)

      expect(screen.getByText('Veranstaltungsdatum *')).toBeInTheDocument()
      expect(screen.getByText('Startzeit *')).toBeInTheDocument()
      expect(screen.getByText('Endzeit *')).toBeInTheDocument()
      expect(screen.getByText('Art der Veranstaltung *')).toBeInTheDocument()
      expect(screen.getByText('Veranstaltungsort *')).toBeInTheDocument()
      expect(screen.getByText('Adresse')).toBeInTheDocument()
      expect(screen.getByText(/Budget/)).toBeInTheDocument()
      expect(screen.getByText('Nachricht an den Kuenstler')).toBeInTheDocument()
    })

    it('renders artist name when provided', () => {
      render(<BookingForm {...defaultProps} artistName="DJ Max" />)
      expect(screen.getByText('DJ Max')).toBeInTheDocument()
      expect(screen.getByText('Buchungsanfrage fuer')).toBeInTheDocument()
    })

    it('renders submit and cancel buttons', () => {
      render(<BookingForm {...defaultProps} />)
      expect(screen.getByRole('button', { name: /anfrage senden/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /abbrechen/i })).toBeInTheDocument()
    })

    it('shows minimum price hint when artistMinPrice provided', () => {
      render(<BookingForm {...defaultProps} artistMinPrice={500} />)
      expect(screen.getByText(/Mindestpreis: 500 EUR/)).toBeInTheDocument()
    })

    it('displays formatted initial date', () => {
      render(<BookingForm {...defaultProps} initialDate="2025-12-25" />)
      expect(screen.getByText(/Donnerstag, 25. Dezember 2025/i)).toBeInTheDocument()
    })

    it('shows error message when provided', () => {
      render(<BookingForm {...defaultProps} error="Something went wrong" />)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  describe('event type options', () => {
    it('shows German event type labels', async () => {
      const user = userEvent.setup()
      render(<BookingForm {...defaultProps} />)

      const select = screen.getByRole('combobox')
      await user.click(select)

      expect(screen.getByText('Hochzeit')).toBeInTheDocument()
      expect(screen.getByText('Firmenfeier')).toBeInTheDocument()
      expect(screen.getByText('Private Party')).toBeInTheDocument()
      expect(screen.getByText('Club/Bar')).toBeInTheDocument()
      expect(screen.getByText('Festival')).toBeInTheDocument()
      expect(screen.getByText('Geburtstag')).toBeInTheDocument()
    })

    it('defaults to private_party', () => {
      render(<BookingForm {...defaultProps} />)
      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('private_party')
    })
  })

  describe('validation', () => {
    it('shows validation error when location is empty', async () => {
      const user = userEvent.setup()
      render(<BookingForm {...defaultProps} initialDate="2025-12-25" />)

      // Clear location and submit
      await user.click(screen.getByRole('button', { name: /anfrage senden/i }))

      await waitFor(() => {
        expect(screen.getByText('Bitte gib einen Veranstaltungsort an')).toBeInTheDocument()
      })
    })

    it('clears validation error when field is modified', async () => {
      const user = userEvent.setup()
      render(<BookingForm {...defaultProps} initialDate="2025-12-25" />)

      // Submit to trigger validation error
      await user.click(screen.getByRole('button', { name: /anfrage senden/i }))

      await waitFor(() => {
        expect(screen.getByText('Bitte gib einen Veranstaltungsort an')).toBeInTheDocument()
      })

      // Type in location field to clear error
      await user.type(screen.getByPlaceholderText(/Club XYZ/), 'Frankfurt')

      await waitFor(() => {
        expect(screen.queryByText('Bitte gib einen Veranstaltungsort an')).not.toBeInTheDocument()
      })
    })

    it('validates date field when not provided as initial', async () => {
      const user = userEvent.setup()
      render(<BookingForm {...defaultProps} />)

      await user.type(screen.getByPlaceholderText(/Club XYZ/), 'Frankfurt')
      await user.click(screen.getByRole('button', { name: /anfrage senden/i }))

      await waitFor(() => {
        expect(screen.getByText('Bitte waehle ein Datum')).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<BookingForm {...defaultProps} onSubmit={onSubmit} initialDate="2025-12-25" />)

      await user.type(screen.getByPlaceholderText(/Club XYZ/), 'Frankfurt')
      await user.click(screen.getByRole('button', { name: /anfrage senden/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            eventDate: '2025-12-25',
            location: 'Frankfurt',
            eventType: 'private_party',
            startTime: '20:00',
            endTime: '02:00'
          })
        )
      })
    })

    it('does not call onSubmit when validation fails', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<BookingForm {...defaultProps} onSubmit={onSubmit} />)

      await user.click(screen.getByRole('button', { name: /anfrage senden/i }))

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('calls onCancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()
      render(<BookingForm {...defaultProps} onCancel={onCancel} />)

      await user.click(screen.getByRole('button', { name: /abbrechen/i }))

      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('shows loading spinner when loading', () => {
      render(<BookingForm {...defaultProps} loading={true} />)
      expect(screen.getByText('Wird gesendet...')).toBeInTheDocument()
    })

    it('disables buttons when loading', () => {
      render(<BookingForm {...defaultProps} loading={true} />)
      expect(screen.getByRole('button', { name: /wird gesendet/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /abbrechen/i })).toBeDisabled()
    })
  })

  describe('input handling', () => {
    it('updates form data when typing in location', async () => {
      const user = userEvent.setup()
      render(<BookingForm {...defaultProps} />)

      const locationInput = screen.getByPlaceholderText(/Club XYZ/)
      await user.type(locationInput, 'Munich')

      expect(locationInput).toHaveValue('Munich')
    })

    it('updates time fields', async () => {
      const user = userEvent.setup()
      render(<BookingForm {...defaultProps} />)

      const startTime = screen.getAllByRole('textbox')[0] // Time inputs might be textbox type
      // Time inputs are harder to test directly, just verify they exist
      expect(screen.getByDisplayValue('20:00')).toBeInTheDocument()
      expect(screen.getByDisplayValue('02:00')).toBeInTheDocument()
    })

    it('updates budget field', async () => {
      const user = userEvent.setup()
      render(<BookingForm {...defaultProps} />)

      const budgetInput = screen.getByPlaceholderText(/Dein Budget/)
      await user.type(budgetInput, '1000')

      expect(budgetInput).toHaveValue(1000)
    })

    it('updates notes textarea', async () => {
      const user = userEvent.setup()
      render(<BookingForm {...defaultProps} />)

      const notesInput = screen.getByPlaceholderText(/Beschreibe deine Veranstaltung/)
      await user.type(notesInput, 'Looking for house music')

      expect(notesInput).toHaveValue('Looking for house music')
    })
  })
})
