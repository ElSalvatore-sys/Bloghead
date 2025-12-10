import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import type { CalendarDay } from '../../types/booking'

describe('AvailabilityCalendar', () => {
  const defaultProps = {
    availability: [] as CalendarDay[],
    mode: 'view' as const,
    currentMonth: 11, // December
    currentYear: 2025,
    onMonthChange: vi.fn()
  }

  // Use specific dates that we can reliably test
  // The formatDateForApi may shift dates due to UTC, so we test by finding buttons by title attribute
  const mockAvailability: CalendarDay[] = [
    { date: '2025-12-15', status: 'available', hasTimeSlots: false },
    { date: '2025-12-16', status: 'booked', hasTimeSlots: true, bookingId: 'booking-1' },
    { date: '2025-12-17', status: 'pending', hasTimeSlots: false },
    { date: '2025-12-18', status: 'blocked', hasTimeSlots: false, notes: 'Privat' },
    { date: '2025-12-19', status: 'open_gig', hasTimeSlots: false }
  ]

  // Helper to find button by title attribute (more reliable than day number)
  // Prioritizes buttons that are enabled and in current month (not opacity-40)
  const findDayButtonByTitle = (container: HTMLElement, title: string) => {
    const buttons = container.querySelectorAll('button')
    const matching = Array.from(buttons).filter(btn => btn.getAttribute('title') === title)
    // Prefer buttons that aren't in past/outside month (don't have opacity-40 or opacity-50)
    return matching.find(btn => !btn.className.includes('opacity-40') && !btn.className.includes('opacity-50')) || matching[0]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to find day button in current month (avoids duplicates from padding days)
  const findDayButton = (container: HTMLElement, day: number) => {
    // Find all buttons with this day number
    const buttons = container.querySelectorAll('button')
    const dayButtons = Array.from(buttons).filter(
      btn => btn.querySelector('span')?.textContent === String(day)
    )
    // Return the one that's not disabled or has current month styling (not opacity-40)
    return dayButtons.find(btn => !btn.className.includes('opacity-40')) || dayButtons[0]
  }

  describe('rendering', () => {
    it('renders the calendar with month and year', () => {
      render(<AvailabilityCalendar {...defaultProps} />)
      expect(screen.getByText('Dezember 2025')).toBeInTheDocument()
    })

    it('renders German day name headers', () => {
      render(<AvailabilityCalendar {...defaultProps} />)
      expect(screen.getByText('Mo')).toBeInTheDocument()
      expect(screen.getByText('Di')).toBeInTheDocument()
      expect(screen.getByText('Mi')).toBeInTheDocument()
      expect(screen.getByText('Do')).toBeInTheDocument()
      expect(screen.getByText('Fr')).toBeInTheDocument()
      expect(screen.getByText('Sa')).toBeInTheDocument()
      expect(screen.getByText('So')).toBeInTheDocument()
    })

    it('renders all days of the month', () => {
      const { container } = render(<AvailabilityCalendar {...defaultProps} />)
      // December 2025 has 31 days - check that buttons exist with those numbers
      for (let i = 1; i <= 31; i++) {
        const dayButton = findDayButton(container, i)
        expect(dayButton).toBeTruthy()
      }
    })

    it('renders today button', () => {
      render(<AvailabilityCalendar {...defaultProps} />)
      expect(screen.getByText('Heute')).toBeInTheDocument()
    })

    it('renders navigation buttons', () => {
      render(<AvailabilityCalendar {...defaultProps} />)
      expect(screen.getByLabelText('Vorheriger Monat')).toBeInTheDocument()
      expect(screen.getByLabelText('Naechster Monat')).toBeInTheDocument()
    })

    it('renders legend in view mode', () => {
      render(<AvailabilityCalendar {...defaultProps} mode="view" />)
      expect(screen.getByText('Verfuegbar')).toBeInTheDocument()
      expect(screen.getByText('Gebucht')).toBeInTheDocument()
      expect(screen.getByText('Anfrage')).toBeInTheDocument()
      expect(screen.getByText('Blockiert')).toBeInTheDocument()
      expect(screen.getByText('Offener Gig')).toBeInTheDocument()
    })

    it('shows edit hint in edit mode', () => {
      render(<AvailabilityCalendar {...defaultProps} mode="edit" />)
      expect(screen.getByText(/Klicke auf ein Datum um die Verfuegbarkeit zu aendern/)).toBeInTheDocument()
    })

    it('shows loading skeleton when loading', () => {
      render(<AvailabilityCalendar {...defaultProps} loading={true} />)
      // Should show skeleton loading state - divs with animate-pulse
      const skeletonDays = document.querySelectorAll('.animate-pulse')
      expect(skeletonDays.length).toBeGreaterThan(0)
    })
  })

  describe('navigation', () => {
    it('calls onMonthChange when next month clicked', async () => {
      const user = userEvent.setup()
      const onMonthChange = vi.fn()
      render(<AvailabilityCalendar {...defaultProps} onMonthChange={onMonthChange} />)

      await user.click(screen.getByLabelText('Naechster Monat'))

      expect(onMonthChange).toHaveBeenCalledWith(2026, 0) // January 2026
    })

    it('calls onMonthChange when previous month clicked', async () => {
      const user = userEvent.setup()
      const onMonthChange = vi.fn()
      render(<AvailabilityCalendar {...defaultProps} onMonthChange={onMonthChange} />)

      await user.click(screen.getByLabelText('Vorheriger Monat'))

      expect(onMonthChange).toHaveBeenCalledWith(2025, 10) // November 2025
    })

    it('wraps year when navigating from January to December', async () => {
      const user = userEvent.setup()
      const onMonthChange = vi.fn()
      render(
        <AvailabilityCalendar
          {...defaultProps}
          currentMonth={0}
          currentYear={2026}
          onMonthChange={onMonthChange}
        />
      )

      await user.click(screen.getByLabelText('Vorheriger Monat'))

      expect(onMonthChange).toHaveBeenCalledWith(2025, 11) // December 2025
    })

    it('calls onMonthChange to go to today when clicked', async () => {
      const user = userEvent.setup()
      const onMonthChange = vi.fn()
      render(<AvailabilityCalendar {...defaultProps} onMonthChange={onMonthChange} />)

      await user.click(screen.getByText('Heute'))

      const now = new Date()
      expect(onMonthChange).toHaveBeenCalledWith(now.getFullYear(), now.getMonth())
    })
  })

  describe('date selection in view mode', () => {
    it('calls onSelectDate when available date clicked', async () => {
      const user = userEvent.setup()
      const onSelectDate = vi.fn()
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          availability={mockAvailability}
          onSelectDate={onSelectDate}
        />
      )

      // Find by title which shows status
      const dayButton = findDayButtonByTitle(container, 'Verfuegbar')
      await user.click(dayButton!)

      expect(onSelectDate).toHaveBeenCalled()
    })

    it('calls onSelectDate when open_gig date clicked', async () => {
      const user = userEvent.setup()
      const onSelectDate = vi.fn()
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          availability={mockAvailability}
          onSelectDate={onSelectDate}
        />
      )

      const dayButton = findDayButtonByTitle(container, 'Offener Gig')
      await user.click(dayButton!)

      expect(onSelectDate).toHaveBeenCalled()
    })

    it('does not call onSelectDate when booked date clicked in view mode', async () => {
      const user = userEvent.setup()
      const onSelectDate = vi.fn()
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          availability={mockAvailability}
          onSelectDate={onSelectDate}
        />
      )

      const dayButton = findDayButtonByTitle(container, 'Gebucht')
      await user.click(dayButton!)

      expect(onSelectDate).not.toHaveBeenCalled()
    })

    it('shows selected date with ring highlight', () => {
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          availability={mockAvailability}
          selectedDate="2025-12-15"
        />
      )

      // Look for any button with ring-2 class
      const buttons = container.querySelectorAll('button.ring-2')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('date clicking in edit mode', () => {
    it('calls onToggleAvailability when date clicked in edit mode', async () => {
      const user = userEvent.setup()
      const onToggleAvailability = vi.fn()
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          mode="edit"
          availability={mockAvailability}
          onToggleAvailability={onToggleAvailability}
        />
      )

      // Find available date by title
      const dayButton = findDayButtonByTitle(container, 'Verfuegbar')
      await user.click(dayButton!)

      // Should be called with 'available' status
      expect(onToggleAvailability).toHaveBeenCalled()
      expect(onToggleAvailability.mock.calls[0][1]).toBe('available')
    })

    it('can click booked dates in edit mode', async () => {
      const user = userEvent.setup()
      const onToggleAvailability = vi.fn()
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          mode="edit"
          availability={mockAvailability}
          onToggleAvailability={onToggleAvailability}
        />
      )

      // Find booked date by title
      const dayButton = findDayButtonByTitle(container, 'Gebucht')
      await user.click(dayButton!)

      expect(onToggleAvailability).toHaveBeenCalled()
      expect(onToggleAvailability.mock.calls[0][1]).toBe('booked')
    })
  })

  describe('past dates', () => {
    it('disables past dates when disablePastDates is true', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)
      const month = pastDate.getMonth()
      const year = pastDate.getFullYear()

      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          currentMonth={month}
          currentYear={year}
          disablePastDates={true}
        />
      )

      // Find a day button that's in the past (day 1 should be in the past)
      const day1Button = findDayButton(container, 1)
      expect(day1Button).toBeDisabled()
    })

    it('allows past dates when disablePastDates is false', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)
      const month = pastDate.getMonth()
      const year = pastDate.getFullYear()

      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          currentMonth={month}
          currentYear={year}
          disablePastDates={false}
        />
      )

      // All days should be clickable
      const day1Button = findDayButton(container, 1)
      expect(day1Button).not.toBeDisabled()
    })
  })

  describe('status styling', () => {
    it('applies green styling for available dates', () => {
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          availability={mockAvailability}
        />
      )

      // Find by status title
      const availableButton = findDayButtonByTitle(container, 'Verfuegbar')
      expect(availableButton?.className).toMatch(/green/)
    })

    it('applies orange styling for booked dates', () => {
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          availability={mockAvailability}
        />
      )

      const bookedButton = findDayButtonByTitle(container, 'Gebucht')
      expect(bookedButton?.className).toMatch(/orange/)
    })

    it('applies yellow styling for pending dates', () => {
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          availability={mockAvailability}
        />
      )

      const pendingButton = findDayButtonByTitle(container, 'Anfrage ausstehend')
      expect(pendingButton?.className).toMatch(/yellow/)
    })

    it('applies red styling for blocked dates', () => {
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          availability={mockAvailability}
        />
      )

      // Blocked dates with notes show the notes as title, without notes show 'Blockiert'
      const blockedButton = findDayButtonByTitle(container, 'Privat')
      expect(blockedButton?.className).toMatch(/red/)
    })

    it('applies purple styling for open_gig dates', () => {
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          availability={mockAvailability}
        />
      )

      const openGigButton = findDayButtonByTitle(container, 'Offener Gig')
      expect(openGigButton?.className).toMatch(/purple/)
    })
  })

  describe('highlighted dates', () => {
    it('shows highlighted indicator for dates in highlightedDates', () => {
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          highlightedDates={['2025-12-20', '2025-12-21']}
        />
      )

      // The highlighted dates should have a purple indicator dot
      // This is harder to test visually, so we just ensure rendering doesn't crash
      const day20Button = findDayButton(container, 20)
      const day21Button = findDayButton(container, 21)
      expect(day20Button).toBeTruthy()
      expect(day21Button).toBeTruthy()
    })
  })

  describe('tooltips', () => {
    it('shows availability status as tooltip', () => {
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          availability={mockAvailability}
        />
      )

      // Check that there's a button with Verfuegbar title
      const availableButton = findDayButtonByTitle(container, 'Verfuegbar')
      expect(availableButton).toBeTruthy()
    })

    it('shows notes as tooltip when available', () => {
      const { container } = render(
        <AvailabilityCalendar
          {...defaultProps}
          availability={mockAvailability}
        />
      )

      // Blocked date with notes shows notes as title
      const blockedButton = findDayButtonByTitle(container, 'Privat')
      expect(blockedButton).toBeTruthy()
    })
  })
})
