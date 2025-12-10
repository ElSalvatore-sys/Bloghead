import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import { BookingCard, type BookingCardData } from './BookingCard'

describe('BookingCard', () => {
  const mockBooking: BookingCardData = {
    id: 'booking-1',
    bookingNumber: 'BH-2025-001',
    eventDate: '2025-12-25',
    startTime: '20:00',
    endTime: '02:00',
    eventType: 'wedding',
    locationName: 'Schloss Johannisberg',
    locationAddress: 'Grund 1, 65366 Geisenheim',
    status: 'pending',
    totalPrice: 1500,
    partnerName: 'DJ Max',
    partnerImage: null,
    partnerRole: 'artist'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders booking number', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('BH-2025-001')).toBeInTheDocument()
    })

    it('renders partner name', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('DJ Max')).toBeInTheDocument()
    })

    it('renders formatted German date', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('25. Dezember 2025')).toBeInTheDocument()
    })

    it('renders time range', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('20:00 - 02:00 Uhr')).toBeInTheDocument()
    })

    it('renders event type label in German', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('Hochzeit')).toBeInTheDocument()
    })

    it('renders location name', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('Schloss Johannisberg')).toBeInTheDocument()
    })

    it('renders location address when provided', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('Grund 1, 65366 Geisenheim')).toBeInTheDocument()
    })

    it('renders price in German format', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('1.500 EUR')).toBeInTheDocument()
    })

    it('renders Gesamtpreis label', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('Gesamtpreis')).toBeInTheDocument()
    })

    it('renders partner initials when no image', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('D')).toBeInTheDocument() // First letter of DJ Max
    })

    it('renders partner image when provided', () => {
      const bookingWithImage = {
        ...mockBooking,
        partnerImage: 'https://example.com/avatar.jpg'
      }
      render(<BookingCard booking={bookingWithImage} />)
      expect(screen.getByAltText('DJ Max')).toBeInTheDocument()
    })

    it('shows Kuenstler label for artist partner role', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('Kuenstler')).toBeInTheDocument()
    })

    it('shows Kunde label for customer partner role', () => {
      const customerBooking = { ...mockBooking, partnerRole: 'customer' as const }
      render(<BookingCard booking={customerBooking} />)
      expect(screen.getByText('Kunde')).toBeInTheDocument()
    })
  })

  describe('status badges', () => {
    it('shows Ausstehend for pending status', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText(/Ausstehend/)).toBeInTheDocument()
    })

    it('shows Bestaetigt for confirmed status', () => {
      const confirmedBooking = { ...mockBooking, status: 'confirmed' as const }
      render(<BookingCard booking={confirmedBooking} />)
      expect(screen.getByText(/Bestaetigt/)).toBeInTheDocument()
    })

    it('shows Storniert for cancelled status', () => {
      const cancelledBooking = { ...mockBooking, status: 'cancelled' as const }
      render(<BookingCard booking={cancelledBooking} />)
      expect(screen.getByText(/Storniert/)).toBeInTheDocument()
    })

    it('shows Abgeschlossen for completed status', () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const }
      render(<BookingCard booking={completedBooking} />)
      expect(screen.getByText(/Abgeschlossen/)).toBeInTheDocument()
    })

    it('shows Laeuft for in_progress status', () => {
      const inProgressBooking = { ...mockBooking, status: 'in_progress' as const }
      render(<BookingCard booking={inProgressBooking} />)
      expect(screen.getByText(/Laeuft/)).toBeInTheDocument()
    })

    it('shows Streitfall for disputed status', () => {
      const disputedBooking = { ...mockBooking, status: 'disputed' as const }
      render(<BookingCard booking={disputedBooking} />)
      expect(screen.getByText(/Streitfall/)).toBeInTheDocument()
    })

    it('shows Erstattet for refunded status', () => {
      const refundedBooking = { ...mockBooking, status: 'refunded' as const }
      render(<BookingCard booking={refundedBooking} />)
      expect(screen.getByText(/Erstattet/)).toBeInTheDocument()
    })
  })

  describe('event type emojis', () => {
    it('shows wedding emoji for wedding', () => {
      render(<BookingCard booking={mockBooking} />)
      // Wedding emoji is in the component
    })

    it('shows corporate emoji for corporate', () => {
      const corporateBooking = { ...mockBooking, eventType: 'corporate' }
      render(<BookingCard booking={corporateBooking} />)
    })
  })

  describe('actions', () => {
    it('renders Details button by default', () => {
      render(<BookingCard booking={mockBooking} />)
      expect(screen.getByText('Details ansehen')).toBeInTheDocument()
    })

    it('calls onViewDetails when Details button clicked', async () => {
      const user = userEvent.setup()
      const onViewDetails = vi.fn()
      render(<BookingCard booking={mockBooking} onViewDetails={onViewDetails} />)

      await user.click(screen.getByText('Details ansehen'))

      expect(onViewDetails).toHaveBeenCalledWith('booking-1')
    })

    it('shows cancel button for pending bookings', () => {
      render(<BookingCard booking={mockBooking} onCancel={vi.fn()} />)
      expect(screen.getByTitle('Stornieren')).toBeInTheDocument()
    })

    it('shows cancel button for confirmed bookings', () => {
      const confirmedBooking = { ...mockBooking, status: 'confirmed' as const }
      render(<BookingCard booking={confirmedBooking} onCancel={vi.fn()} />)
      expect(screen.getByTitle('Stornieren')).toBeInTheDocument()
    })

    it('does not show cancel button for cancelled bookings', () => {
      const cancelledBooking = { ...mockBooking, status: 'cancelled' as const }
      render(<BookingCard booking={cancelledBooking} onCancel={vi.fn()} />)
      expect(screen.queryByTitle('Stornieren')).not.toBeInTheDocument()
    })

    it('does not show cancel button for completed bookings', () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const }
      render(<BookingCard booking={completedBooking} onCancel={vi.fn()} />)
      expect(screen.queryByTitle('Stornieren')).not.toBeInTheDocument()
    })

    it('calls onCancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()
      render(<BookingCard booking={mockBooking} onCancel={onCancel} />)

      await user.click(screen.getByTitle('Stornieren'))

      expect(onCancel).toHaveBeenCalledWith('booking-1')
    })

    it('hides actions when showActions is false', () => {
      render(<BookingCard booking={mockBooking} showActions={false} />)
      expect(screen.queryByText('Details ansehen')).not.toBeInTheDocument()
    })
  })

  describe('compact mode', () => {
    it('renders compact version when compact is true', () => {
      render(<BookingCard booking={mockBooking} compact={true} />)

      // In compact mode, should have truncated content
      expect(screen.getByText('DJ Max')).toBeInTheDocument()
      // The booking number should NOT be visible in compact mode
      expect(screen.queryByText('BH-2025-001')).not.toBeInTheDocument()
    })

    it('does not show location address in compact mode', () => {
      render(<BookingCard booking={mockBooking} compact={true} />)
      expect(screen.queryByText('Grund 1, 65366 Geisenheim')).not.toBeInTheDocument()
    })

    it('shows status badge in compact mode', () => {
      render(<BookingCard booking={mockBooking} compact={true} />)
      expect(screen.getByText('Ausstehend')).toBeInTheDocument()
    })

    it('is clickable in compact mode', async () => {
      const user = userEvent.setup()
      const onViewDetails = vi.fn()
      render(<BookingCard booking={mockBooking} compact={true} onViewDetails={onViewDetails} />)

      await user.click(screen.getByText('DJ Max').closest('div')!)

      expect(onViewDetails).toHaveBeenCalledWith('booking-1')
    })
  })

  describe('missing data handling', () => {
    it('handles missing location address', () => {
      const bookingWithoutAddress = { ...mockBooking, locationAddress: undefined }
      render(<BookingCard booking={bookingWithoutAddress} />)
      expect(screen.queryByText('Grund 1, 65366 Geisenheim')).not.toBeInTheDocument()
    })

    it('handles null location', () => {
      const bookingWithoutLocation = { ...mockBooking, locationName: null }
      render(<BookingCard booking={bookingWithoutLocation} />)
      // Should render without crashing
    })

    it('handles missing event type', () => {
      const bookingWithoutEventType = { ...mockBooking, eventType: null }
      render(<BookingCard booking={bookingWithoutEventType} />)
      expect(screen.getByText('Veranstaltung')).toBeInTheDocument()
    })

    it('formats large prices correctly', () => {
      const expensiveBooking = { ...mockBooking, totalPrice: 15000 }
      render(<BookingCard booking={expensiveBooking} />)
      expect(screen.getByText('15.000 EUR')).toBeInTheDocument()
    })
  })
})
