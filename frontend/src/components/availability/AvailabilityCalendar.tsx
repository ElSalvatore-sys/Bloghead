/**
 * AvailabilityCalendar Component
 * Calendar view for artists to manage their availability
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getArtistAvailabilityRange,
  setBulkAvailability,
  type AvailabilityStatus,
  type AvailabilityRangeItem
} from '../../services/availabilityService'

// Icons
function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// Types
interface CalendarDay {
  date: string
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
  isPast: boolean
  availability?: AvailabilityRangeItem
}

interface AvailabilityCalendarProps {
  artistId: string
  onDateSelect?: (date: string, availability?: AvailabilityRangeItem) => void
  readOnly?: boolean
  className?: string
}

// Month names in German
const MONTH_NAMES_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

export function AvailabilityCalendar({
  artistId,
  onDateSelect,
  readOnly = false,
  className = ''
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailabilityData] = useState<AvailabilityRangeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Get first and last day of current month view (including adjacent month days)
  const getMonthBounds = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    // First day of month
    const firstDay = new Date(year, month, 1)
    // Last day of month
    const lastDay = new Date(year, month + 1, 0)

    // Adjust to start from Sunday (or Monday for German locale)
    const startDate = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    // Adjust for Monday start (German convention)
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startDate.setDate(startDate.getDate() - daysToSubtract)

    // End date (complete the last week)
    const endDate = new Date(lastDay)
    const lastDayOfWeek = lastDay.getDay()
    const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek
    endDate.setDate(endDate.getDate() + daysToAdd)

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }, [])

  // Fetch availability data
  const fetchAvailability = useCallback(async () => {
    if (!artistId) return

    setLoading(true)
    const { startDate, endDate } = getMonthBounds(currentDate)

    const { data, error } = await getArtistAvailabilityRange(artistId, startDate, endDate)

    if (error) {
      console.error('Error fetching availability:', error)
    } else if (data) {
      setAvailabilityData(data)
    }

    setLoading(false)
  }, [artistId, currentDate, getMonthBounds])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  // Generate calendar days
  const calendarDays = useMemo((): CalendarDay[] => {
    const { startDate, endDate } = getMonthBounds(currentDate)
    const days: CalendarDay[] = []

    const current = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const currentMonth = currentDate.getMonth()

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]
      const dayAvailability = availability.find(a => a.date === dateStr)

      days.push({
        date: dateStr,
        dayOfMonth: current.getDate(),
        isCurrentMonth: current.getMonth() === currentMonth,
        isToday: current.getTime() === today.getTime(),
        isPast: current < today,
        availability: dayAvailability
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentDate, availability, getMonthBounds])

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Date selection handlers
  const handleDateClick = (day: CalendarDay) => {
    if (readOnly || day.isPast) return

    if (isSelecting) {
      // Multi-select mode
      const newSelected = new Set(selectedDates)
      if (newSelected.has(day.date)) {
        newSelected.delete(day.date)
      } else {
        newSelected.add(day.date)
      }
      setSelectedDates(newSelected)
    } else {
      // Single select - trigger callback
      onDateSelect?.(day.date, day.availability)
    }
  }

  const toggleSelectionMode = () => {
    if (isSelecting) {
      setSelectedDates(new Set())
    }
    setIsSelecting(!isSelecting)
    setShowBulkActions(!isSelecting)
  }

  // Bulk update handler
  const handleBulkUpdate = async (status: AvailabilityStatus) => {
    if (selectedDates.size === 0) return

    const dates = Array.from(selectedDates)
    const { error } = await setBulkAvailability(artistId, dates, status)

    if (error) {
      console.error('Error updating availability:', error)
    } else {
      await fetchAvailability()
      setSelectedDates(new Set())
      setIsSelecting(false)
      setShowBulkActions(false)
    }
  }

  // Get day cell style based on availability
  const getDayStyle = (day: CalendarDay) => {
    const baseStyle = 'relative w-full aspect-square flex items-center justify-center rounded-lg transition-all duration-200'

    if (!day.isCurrentMonth) {
      return `${baseStyle} text-white/20`
    }

    if (day.isPast) {
      return `${baseStyle} text-white/30 cursor-not-allowed`
    }

    if (selectedDates.has(day.date)) {
      return `${baseStyle} bg-accent-purple text-white ring-2 ring-accent-purple ring-offset-2 ring-offset-bg-primary`
    }

    if (day.availability) {
      const status = day.availability.status
      if (status === 'available') {
        return `${baseStyle} bg-green-500/20 text-green-400 hover:bg-green-500/30 cursor-pointer`
      }
      if (status === 'booked') {
        return `${baseStyle} bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 cursor-pointer`
      }
      if (status === 'blocked') {
        return `${baseStyle} bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer`
      }
      if (status === 'tentative') {
        return `${baseStyle} bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 cursor-pointer`
      }
    }

    // Default available
    return `${baseStyle} text-white/70 hover:bg-white/10 cursor-pointer`
  }

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            {MONTH_NAMES_DE[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Heute
            </button>
            <button
              onClick={goToPreviousMonth}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selection mode toggle */}
        {!readOnly && (
          <button
            onClick={toggleSelectionMode}
            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              isSelecting
                ? 'bg-accent-purple text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {isSelecting
              ? `${selectedDates.size} Tage ausgewählt`
              : 'Mehrere Tage auswählen'}
          </button>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers - German week starts Monday */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} className="text-center text-xs text-white/40 font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-white/5 animate-pulse"
              />
            ))
          ) : (
            calendarDays.map((day, index) => (
              <motion.button
                key={day.date}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleDateClick(day)}
                disabled={day.isPast || readOnly}
                className={getDayStyle(day)}
              >
                <span className={day.isToday ? 'font-bold' : ''}>
                  {day.dayOfMonth}
                </span>

                {/* Today indicator */}
                {day.isToday && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-purple rounded-full" />
                )}

                {/* Booked indicator */}
                {day.availability?.event_name && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-orange rounded-full" />
                )}
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-500/30" />
            <span className="text-white/50">Verfügbar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-accent-purple/30" />
            <span className="text-white/50">Gebucht</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500/30" />
            <span className="text-white/50">Blockiert</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-yellow-500/30" />
            <span className="text-white/50">Vorläufig</span>
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      <AnimatePresence>
        {showBulkActions && selectedDates.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 border-t border-white/10 bg-white/5"
          >
            <p className="text-sm text-white/60 mb-3">
              Status für {selectedDates.size} ausgewählte Tage setzen:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkUpdate('available')}
                className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
                Verfügbar
              </button>
              <button
                onClick={() => handleBulkUpdate('blocked')}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <XIcon className="w-4 h-4" />
                Blockieren
              </button>
              <button
                onClick={() => handleBulkUpdate('tentative')}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
              >
                Vorläufig
              </button>
              <button
                onClick={() => {
                  setSelectedDates(new Set())
                  setIsSelecting(false)
                  setShowBulkActions(false)
                }}
                className="px-3 py-2 bg-white/10 text-white/60 rounded-lg hover:bg-white/20 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AvailabilityCalendar
