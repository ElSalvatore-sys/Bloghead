import { useMemo } from 'react'
import {
  GERMAN_DAY_NAMES,
  GERMAN_MONTH_NAMES,
  AVAILABILITY_STATUS_COLORS,
  AVAILABILITY_STATUS_LABELS,
  getMonthDays,
  isToday,
  isPastDate,
  formatDateForApi,
  type AvailabilityStatus,
  type CalendarDay
} from '../../types/booking'

interface AvailabilityCalendarProps {
  // Data
  availability: CalendarDay[]
  loading?: boolean

  // Mode: 'view' for customers, 'edit' for artists
  mode: 'view' | 'edit'

  // Selected date (for booking flow)
  selectedDate?: string | null
  onSelectDate?: (date: string) => void

  // For edit mode: toggle availability
  onToggleAvailability?: (date: string, currentStatus: AvailabilityStatus) => void

  // Navigation
  currentMonth: number // 0-11
  currentYear: number
  onMonthChange: (year: number, month: number) => void

  // Optional: highlight dates
  highlightedDates?: string[]

  // Optional: disable past dates
  disablePastDates?: boolean
}

export function AvailabilityCalendar({
  availability,
  loading = false,
  mode,
  selectedDate,
  onSelectDate,
  onToggleAvailability,
  currentMonth,
  currentYear,
  onMonthChange,
  highlightedDates = [],
  disablePastDates = true
}: AvailabilityCalendarProps) {
  // Generate calendar days with padding for the week start
  const calendarDays = useMemo(() => {
    const monthDays = getMonthDays(currentYear, currentMonth)

    // Create a map for quick lookup
    const availabilityMap = new Map<string, CalendarDay>()
    availability.forEach(day => availabilityMap.set(day.date, day))

    // Map each day to include availability data
    return monthDays.map(date => {
      const dateStr = formatDateForApi(date)
      const avail = availabilityMap.get(dateStr)
      const isCurrentMonth = date.getMonth() === currentMonth
      const isPast = isPastDate(date)
      const isTodayDate = isToday(date)
      const isHighlighted = highlightedDates.includes(dateStr)
      const isSelected = selectedDate === dateStr

      return {
        date,
        dateStr,
        isCurrentMonth,
        isPast,
        isToday: isTodayDate,
        isHighlighted,
        isSelected,
        status: avail?.status || 'available',
        hasTimeSlots: avail?.hasTimeSlots || false,
        notes: avail?.notes,
        bookingId: avail?.bookingId
      }
    })
  }, [availability, currentYear, currentMonth, selectedDate, highlightedDates])

  // Navigate to previous month
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(currentYear - 1, 11)
    } else {
      onMonthChange(currentYear, currentMonth - 1)
    }
  }

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(currentYear + 1, 0)
    } else {
      onMonthChange(currentYear, currentMonth + 1)
    }
  }

  // Go to today
  const goToToday = () => {
    const now = new Date()
    onMonthChange(now.getFullYear(), now.getMonth())
  }

  // Handle day click
  const handleDayClick = (day: typeof calendarDays[0]) => {
    // Don't allow clicks on past dates if disabled
    if (disablePastDates && day.isPast && !day.isToday) return

    // Don't allow clicks on days outside current month
    if (!day.isCurrentMonth) return

    if (mode === 'view') {
      // Customer view: select date for booking
      if (day.status === 'available' || day.status === 'open_gig') {
        onSelectDate?.(day.dateStr)
      }
    } else {
      // Artist view: toggle availability
      onToggleAvailability?.(day.dateStr, day.status)
    }
  }

  // Get status color classes
  const getStatusClasses = (status: AvailabilityStatus) => {
    const colors = AVAILABILITY_STATUS_COLORS[status]
    return `${colors.bg} ${colors.text}`
  }

  // Get day cell classes
  const getDayClasses = (day: typeof calendarDays[0]) => {
    const baseClasses = 'relative w-full aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all cursor-pointer'

    // Outside current month
    if (!day.isCurrentMonth) {
      return `${baseClasses} text-gray-600 opacity-40 cursor-not-allowed`
    }

    // Past dates (if disabled)
    if (disablePastDates && day.isPast && !day.isToday) {
      return `${baseClasses} text-gray-600 opacity-50 cursor-not-allowed bg-white/5`
    }

    // Selected date
    if (day.isSelected) {
      return `${baseClasses} ring-2 ring-purple-500 ${getStatusClasses(day.status)}`
    }

    // Today
    if (day.isToday) {
      return `${baseClasses} ring-2 ring-white/30 ${getStatusClasses(day.status)}`
    }

    // Status-based coloring
    return `${baseClasses} ${getStatusClasses(day.status)} hover:opacity-80`
  }

  // Check if date is clickable
  const isClickable = (day: typeof calendarDays[0]) => {
    if (!day.isCurrentMonth) return false
    if (disablePastDates && day.isPast && !day.isToday) return false

    if (mode === 'view') {
      // Only available or open_gig dates are clickable for customers
      return day.status === 'available' || day.status === 'open_gig'
    }

    // Artists can click any date
    return true
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Vorheriger Monat"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">
            {GERMAN_MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={goToToday}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Heute
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Naechster Monat"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {GERMAN_DAY_NAMES.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-white/5 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={!isClickable(day)}
              className={getDayClasses(day)}
              title={day.notes || AVAILABILITY_STATUS_LABELS[day.status]}
            >
              <span className="font-medium">{day.date.getDate()}</span>

              {/* Time slots indicator */}
              {day.hasTimeSlots && day.isCurrentMonth && (
                <span className="absolute bottom-1 w-1 h-1 bg-current rounded-full opacity-60" />
              )}

              {/* Highlighted indicator */}
              {day.isHighlighted && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500/20 border border-green-500" />
            <span className="text-gray-400">Verfuegbar</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500" />
            <span className="text-gray-400">Gebucht</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500" />
            <span className="text-gray-400">Anfrage</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500/20 border border-red-500" />
            <span className="text-gray-400">Blockiert</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500" />
            <span className="text-gray-400">Offener Gig</span>
          </div>
        </div>
      </div>

      {/* Edit mode hint */}
      {mode === 'edit' && (
        <p className="mt-3 text-xs text-gray-500">
          Klicke auf ein Datum um die Verfuegbarkeit zu aendern
        </p>
      )}
    </div>
  )
}

export default AvailabilityCalendar
