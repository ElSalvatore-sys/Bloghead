import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Simple calendar component
const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

// Mock events
const mockEvents = [
  { id: '1', date: '2024-07-15', title: 'Hochzeit - Frankfurt', type: 'booking' },
  { id: '2', date: '2024-07-20', title: 'Geburtstagsparty - Wiesbaden', type: 'booking' },
  { id: '3', date: '2024-07-25', title: 'Firmenfeier - Mainz', type: 'booking' },
  { id: '4', date: '2024-07-18', title: 'Proben', type: 'personal' },
]

function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const totalDays = lastDayOfMonth.getDate()

  // Get day of week for first day (0 = Sunday, so we need to adjust for Monday start)
  let startingDay = firstDayOfMonth.getDay()
  startingDay = startingDay === 0 ? 6 : startingDay - 1 // Convert to Monday = 0

  // Create array of day numbers
  const days: (number | null)[] = []
  for (let i = 0; i < startingDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return mockEvents.filter(e => e.date === dateStr)
  }

  const selectedEvents = selectedDate
    ? getEventsForDay(selectedDate.getDate())
    : []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold text-white mb-8">Mein Kalender</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-bg-card rounded-xl border border-white/10 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-text-muted text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const events = getEventsForDay(day)
              const isSelected = selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === month &&
                selectedDate?.getFullYear() === year
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors ${
                    isSelected
                      ? 'bg-accent-purple text-white'
                      : isToday
                      ? 'bg-accent-purple/20 text-accent-purple'
                      : 'hover:bg-white/10 text-white'
                  }`}
                >
                  <span className="text-sm">{day}</span>
                  {events.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {events.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-accent-salmon'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Events Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-card rounded-xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            {selectedDate
              ? selectedDate.toLocaleDateString('de-DE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Events auswählen'}
          </h3>

          <AnimatePresence mode="wait">
          {selectedDate ? (
            selectedEvents.length > 0 ? (
              <motion.div
                key="events"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {selectedEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 rounded-lg border-l-4 ${
                      event.type === 'booking'
                        ? 'bg-accent-purple/10 border-accent-purple'
                        : 'bg-white/5 border-white/30'
                    }`}
                  >
                    <p className="text-white font-medium text-sm">{event.title}</p>
                    <p className="text-text-muted text-xs mt-1">
                      {event.type === 'booking' ? 'Buchung' : 'Persönlich'}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.p
                key="no-events"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-text-muted text-sm"
              >
                Keine Events an diesem Tag
              </motion.p>
            )
          ) : (
            <motion.p
              key="select-day"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-text-muted text-sm"
            >
              Wähle einen Tag aus, um die Events zu sehen
            </motion.p>
          )}
          </AnimatePresence>

          {/* Add Event Button */}
          <button className="w-full mt-6 px-4 py-3 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors">
            + Event hinzufügen
          </button>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-salmon" />
          <span className="text-text-muted text-sm">Buchung</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white/30" />
          <span className="text-text-muted text-sm">Persönlich</span>
        </div>
      </div>
    </motion.div>
  )
}
