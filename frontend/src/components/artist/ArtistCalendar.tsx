import { useState, useEffect, useCallback } from 'react'
import { CalendarIcon } from '../icons'
import { getAvailability, type AvailabilityEntry, type AvailabilityStatus } from '../../services/calendarService'

interface ArtistCalendarProps {
  artistId: string
  className?: string
  onDateSelect?: (date: string, status: AvailabilityStatus | 'unset') => void
}

const WEEKDAYS = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO']
const MONTHS = [
  'JANUAR', 'FEBRUAR', 'MÄRZ', 'APRIL', 'MAI', 'JUNI',
  'JULI', 'AUGUST', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DEZEMBER'
]

// Status configuration with colors
const STATUS_CONFIG: Record<AvailabilityStatus | 'unset' | 'past', {
  bg: string
  text: string
  label: string
  clickable: boolean
}> = {
  available: {
    bg: 'bg-green-500/30',
    text: 'text-green-400',
    label: 'Verfügbar',
    clickable: true
  },
  booked: {
    bg: 'bg-purple-500/40',
    text: 'text-purple-300',
    label: 'Gebucht',
    clickable: false
  },
  pending: {
    bg: 'bg-yellow-500/30',
    text: 'text-yellow-400',
    label: 'Anfrage ausstehend',
    clickable: false
  },
  blocked: {
    bg: 'bg-red-500/30',
    text: 'text-red-400',
    label: 'Blockiert',
    clickable: false
  },
  open_gig: {
    bg: 'bg-blue-500/30',
    text: 'text-blue-400',
    label: 'Open Gig',
    clickable: true
  },
  unset: {
    bg: 'bg-transparent hover:bg-white/10',
    text: 'text-white/70',
    label: 'Keine Angabe',
    clickable: true
  },
  past: {
    bg: 'bg-transparent',
    text: 'text-white/20',
    label: 'Vergangen',
    clickable: false
  }
}

// Microphone icon for events/gigs
function MicIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="10"
      height="10"
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
  artistId,
  className = '',
  onDateSelect,
}: ArtistCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [availability, setAvailability] = useState<Map<string, AvailabilityEntry>>(new Map())
  const [loading, setLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Fetch availability when month/year changes
  const fetchAvailability = useCallback(async () => {
    if (!artistId) return

    setLoading(true)

    // Calculate date range for current view (include padding for prev/next month days)
    const startDate = new Date(year, month, 1)
    startDate.setDate(startDate.getDate() - 7) // Week before
    const endDate = new Date(year, month + 1, 0)
    endDate.setDate(endDate.getDate() + 7) // Week after

    const { data, error } = await getAvailability(
      artistId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )

    if (error) {
      console.error('Error fetching availability:', error)
    } else if (data) {
      const map = new Map<string, AvailabilityEntry>()
      data.forEach(entry => {
        map.set(entry.date, entry)
      })
      setAvailability(map)
    }

    setLoading(false)
  }, [artistId, year, month])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  // Get first day of month (0 = Sunday, adjust for Monday start)
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Get today's info
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const todayDate = today.getDate()

  // Generate calendar days
  const calendarDays: (number | null)[] = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
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

  const getDateString = (day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getStatusForDay = (day: number): AvailabilityStatus | 'unset' | 'past' => {
    const dateStr = getDateString(day)
    const dayDate = new Date(year, month, day)
    dayDate.setHours(0, 0, 0, 0)

    // Check if past
    if (dayDate < today) {
      return 'past'
    }

    // Check availability
    const entry = availability.get(dateStr)
    if (entry) {
      return entry.status
    }

    return 'unset'
  }

  const handleDateClick = (day: number) => {
    const status = getStatusForDay(day)
    const config = STATUS_CONFIG[status]

    if (!config.clickable) return

    const dateStr = getDateString(day)
    setSelectedDate(dateStr)
    onDateSelect?.(dateStr, status === 'past' ? 'unset' : status)
  }

  const getDayClasses = (day: number) => {
    const status = getStatusForDay(day)
    const config = STATUS_CONFIG[status]
    const dateStr = getDateString(day)
    const isToday = isCurrentMonth && day === todayDate
    const isSelected = dateStr === selectedDate

    let classes = `aspect-square flex items-center justify-center text-sm rounded-lg relative transition-all duration-200 ${config.bg} ${config.text}`

    if (config.clickable) {
      classes += ' cursor-pointer'
    } else {
      classes += ' cursor-default'
    }

    if (isToday) {
      classes += ' ring-2 ring-accent-purple ring-offset-1 ring-offset-bg-primary'
    }

    if (isSelected) {
      classes += ' ring-2 ring-white'
    }

    return classes
  }

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <CalendarIcon size={24} className="text-white/60" />
        <h3 className="text-lg font-bold text-white uppercase tracking-wide">
          Verfügbarkeit
        </h3>
      </div>

      {/* Calendar Container */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white font-bold text-lg">
            {MONTHS[month]} {year}
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Vorheriger Monat"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Nächster Monat"
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
              className="text-center text-xs font-bold text-white/40 uppercase py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="aspect-square bg-white/5 rounded-lg animate-pulse" />
            ))
          ) : (
            calendarDays.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <button
                    onClick={() => handleDateClick(day)}
                    className={getDayClasses(day)}
                    disabled={!STATUS_CONFIG[getStatusForDay(day)].clickable}
                  >
                    {day}
                    {/* Show mic icon for booked/open_gig days */}
                    {(getStatusForDay(day) === 'booked' || getStatusForDay(day) === 'open_gig') && (
                      <MicIcon className="absolute bottom-0.5 right-0.5 opacity-60" />
                    )}
                  </button>
                ) : (
                  <div className="aspect-square" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50" />
            <span className="text-white/60">Verfügbar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500/40 border border-purple-500/50" />
            <span className="text-white/60">Gebucht</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500/30 border border-yellow-500/50" />
            <span className="text-white/60">Ausstehend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500/50" />
            <span className="text-white/60">Blockiert</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-500/50" />
            <span className="text-white/60">Open Gig</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-white/20" />
            <span className="text-white/60">Keine Angabe</span>
          </div>
        </div>

        {/* Selected date hint */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-accent-purple/20 rounded-lg border border-accent-purple/30">
            <p className="text-white/80 text-sm">
              <span className="font-medium text-white">
                {new Date(selectedDate).toLocaleDateString('de-DE', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
              {' '}ausgewählt
            </p>
            <p className="text-white/60 text-xs mt-1">
              Klicke auf "Anfrage senden" um diesen Termin anzufragen
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
