import { useState } from 'react'
import { CalendarIcon } from '../icons'

// Calendar day status types
type DayStatus = 'available' | 'booked' | 'pending' | 'unavailable'

interface CalendarDay {
  date: number
  status: DayStatus
  hasEvent?: boolean
}

interface ArtistCalendarProps {
  className?: string
  bookedDates?: number[]
  pendingDates?: number[]
  eventDates?: number[]
  onDateSelect?: (date: number) => void
}

const WEEKDAYS = ['MO', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
]

// Microphone icon for events
function MicIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  )
}

export function ArtistCalendar({
  className = '',
  bookedDates = [],
  pendingDates = [],
  eventDates = [],
  onDateSelect,
}: ArtistCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<number | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month (0 = Sunday, adjust for Monday start)
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Get today's date for highlighting
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const todayDate = today.getDate()

  // Generate calendar days
  const calendarDays: (CalendarDay | null)[] = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    let status: DayStatus = 'available'

    if (bookedDates.includes(day)) {
      status = 'booked'
    } else if (pendingDates.includes(day)) {
      status = 'pending'
    }

    calendarDays.push({
      date: day,
      status,
      hasEvent: eventDates.includes(day),
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (day: CalendarDay) => {
    if (day.status === 'booked') return
    setSelectedDate(day.date)
    onDateSelect?.(day.date)
  }

  const getDayClasses = (day: CalendarDay) => {
    const baseClasses = 'aspect-square flex items-center justify-center text-sm rounded relative transition-all duration-200'

    const statusClasses: Record<DayStatus, string> = {
      available: 'bg-transparent hover:bg-white/10 cursor-pointer text-white',
      booked: 'bg-accent-purple text-white cursor-default',
      pending: 'bg-white/20 text-white/60 cursor-default',
      unavailable: 'bg-transparent text-white/30 cursor-not-allowed',
    }

    const isToday = isCurrentMonth && day.date === todayDate
    const isSelected = day.date === selectedDate

    let classes = `${baseClasses} ${statusClasses[day.status]}`

    if (isToday) {
      classes += ' ring-1 ring-accent-purple'
    }

    if (isSelected && day.status !== 'booked') {
      classes += ' bg-accent-red'
    }

    return classes
  }

  return (
    <div className={`${className}`}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <CalendarIcon size={24} className="text-white/60" />
        <h3 className="text-lg font-bold text-white uppercase tracking-wide">
          Calendar
        </h3>
      </div>

      {/* Calendar Container */}
      <div className="bg-transparent">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white font-bold text-lg">
            {MONTHS[month]} {year}
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Previous month"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Next month"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="text-center text-xs font-bold text-white/60 uppercase py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div key={index} className="aspect-square">
              {day ? (
                <button
                  onClick={() => handleDateClick(day)}
                  className={getDayClasses(day)}
                  disabled={day.status === 'unavailable'}
                >
                  {day.date}
                  {day.hasEvent && (
                    <MicIcon className="absolute bottom-0.5 right-0.5 text-white/80" />
                  )}
                </button>
              ) : (
                <div className="aspect-square" />
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent-purple" />
            <span>Gebucht</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/20" />
            <span>Ausstehend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-white/30" />
            <span>Verfügbar</span>
          </div>
          <div className="flex items-center gap-2">
            <MicIcon className="text-white/60" />
            <span>Auftritt</span>
          </div>
        </div>
      </div>
    </div>
  )
}
