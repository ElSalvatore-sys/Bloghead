import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Music,
  CalendarCheck,
  Loader2,
  X,
  CalendarPlus,
  CalendarMinus,
  CalendarRange,
  MapPin,
  Euro
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAvailability,
  setAvailability,
  setAvailabilityBulk,
  deleteAvailability,
  getCalendarStats,
  getWeekDates,
  getWeekendDates,
  getWeekdayDates,
  AVAILABILITY_STATUS_CONFIG,
  formatDateGerman,
  isDatePast,
  isDateToday,
  type AvailabilityEntry,
  type AvailabilityStatus,
  type CalendarStats
} from '../../services/calendarService'
import { getArtistByUserId } from '../../services/artistService'

// German month names
const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

// German weekday names (short)
const WEEKDAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// Mock availability for demo
const generateMockAvailability = (year: number, month: number): AvailabilityEntry[] => {
  const entries: AvailabilityEntry[] = []
  const statuses: AvailabilityStatus[] = ['available', 'booked', 'pending', 'blocked', 'open_gig']

  // Generate some random entries
  for (let day = 1; day <= 28; day++) {
    if (Math.random() > 0.6) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      entries.push({
        id: `mock-${day}`,
        artist_id: 'mock',
        date,
        time_slots: null,
        status,
        visibility: 'visible',
        booking_id: status === 'booked' ? 'booking-123' : null,
        notes: status === 'blocked' ? 'Urlaub' : null,
        created_at: new Date().toISOString(),
        updated_at: null,
        booking: status === 'booked' ? {
          id: 'booking-123',
          booking_number: 'BH-2024-000001',
          event_type: 'hochzeit',
          event_location_name: 'Schloss Rheingau',
          client_id: 'client-1',
          total_price: 1500
        } : null
      })
    }
  }

  return entries
}

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  color = 'text-white'
}: {
  icon: React.ElementType
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="bg-bg-secondary rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-gray-500 text-xs">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}

// Calendar day cell
function CalendarDay({
  date,
  isCurrentMonth,
  availability,
  isSelected,
  onClick
}: {
  date: Date
  isCurrentMonth: boolean
  availability?: AvailabilityEntry
  isSelected: boolean
  onClick: () => void
}) {
  const dateStr = date.toISOString().split('T')[0]
  const isPast = isDatePast(dateStr)
  const isToday = isDateToday(dateStr)
  const status = availability?.status

  const statusConfig = status ? AVAILABILITY_STATUS_CONFIG[status] : null

  return (
    <button
      onClick={onClick}
      disabled={isPast && !availability}
      className={`
        relative p-2 h-20 md:h-24 rounded-lg border transition-all text-left
        ${!isCurrentMonth ? 'opacity-30' : ''}
        ${isPast && !availability ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500/50 cursor-pointer'}
        ${isSelected ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-white/10'}
        ${isToday ? 'bg-purple-500/10' : 'bg-bg-secondary'}
      `}
    >
      {/* Date number */}
      <span className={`text-sm font-medium ${isToday ? 'text-purple-400' : 'text-white'}`}>
        {date.getDate()}
      </span>

      {/* Status indicator */}
      {statusConfig && (
        <div className={`absolute bottom-2 left-2 right-2 ${statusConfig.bgColor} rounded px-1.5 py-0.5`}>
          <span className={`text-xs ${statusConfig.color} truncate block`}>
            {statusConfig.label}
          </span>
        </div>
      )}

      {/* Booking indicator */}
      {availability?.booking && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
        </div>
      )}
    </button>
  )
}

// Availability modal
function AvailabilityModal({
  isOpen,
  onClose,
  selectedDate,
  currentAvailability,
  onSave,
  onDelete,
  saving
}: {
  isOpen: boolean
  onClose: () => void
  selectedDate: string | null
  currentAvailability: AvailabilityEntry | null
  onSave: (status: AvailabilityStatus, notes?: string) => void
  onDelete: () => void
  saving: boolean
}) {
  const [selectedStatus, setSelectedStatus] = useState<AvailabilityStatus>(
    currentAvailability?.status || 'available'
  )
  const [notes, setNotes] = useState(currentAvailability?.notes || '')

  useEffect(() => {
    setSelectedStatus(currentAvailability?.status || 'available')
    setNotes(currentAvailability?.notes || '')
  }, [currentAvailability, selectedDate])

  if (!isOpen || !selectedDate) return null

  const isPast = isDatePast(selectedDate)
  const isBooked = currentAvailability?.status === 'booked'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-2xl border border-white/10 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-display text-white">Verfügbarkeit bearbeiten</h3>
            <p className="text-sm text-gray-400">{formatDateGerman(selectedDate)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Warning for booked dates */}
          {isBooked && (
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
              <p className="text-purple-400 text-sm">
                Dieser Tag ist bereits gebucht. Die Buchung kann hier nicht geändert werden.
              </p>
            </div>
          )}

          {/* Warning for past dates */}
          {isPast && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                Dieser Tag liegt in der Vergangenheit.
              </p>
            </div>
          )}

          {/* Status selection */}
          {!isBooked && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(AVAILABILITY_STATUS_CONFIG) as [AvailabilityStatus, typeof AVAILABILITY_STATUS_CONFIG['available']][])
                    .filter(([status]) => status !== 'booked' && status !== 'pending')
                    .map(([status, config]) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          selectedStatus === status
                            ? `${config.bgColor} border-current ${config.color}`
                            : 'border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-sm font-medium">{config.label}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Notizen (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="z.B. Urlaub, Privat, etc."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                  rows={2}
                />
              </div>
            </>
          )}

          {/* Booking info */}
          {currentAvailability?.booking && (
            <div className="bg-white/5 rounded-lg p-3 space-y-2">
              <p className="text-sm text-gray-400">Buchung Details:</p>
              <div className="flex items-center gap-2 text-white">
                <CalendarCheck size={16} className="text-purple-400" />
                <span>{currentAvailability.booking.booking_number}</span>
              </div>
              {currentAvailability.booking.event_location_name && (
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={16} />
                  <span>{currentAvailability.booking.event_location_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-green-400">
                <Euro size={16} />
                <span>{currentAvailability.booking.total_price.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-white/10">
          {currentAvailability && !isBooked && (
            <button
              onClick={onDelete}
              disabled={saving}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Löschen
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          {!isBooked && (
            <button
              onClick={() => onSave(selectedStatus, notes || undefined)}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Speichern
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Quick action buttons
function QuickActions({
  onBlockToday,
  onBlockWeek,
  onSetWeekendsAvailable,
  onSetWeekdaysAvailable,
  loading
}: {
  onBlockToday: () => void
  onBlockWeek: () => void
  onSetWeekendsAvailable: () => void
  onSetWeekdaysAvailable: () => void
  loading: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onBlockToday}
        disabled={loading}
        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-1.5"
      >
        <CalendarMinus size={14} />
        Heute blockieren
      </button>
      <button
        onClick={onBlockWeek}
        disabled={loading}
        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-1.5"
      >
        <CalendarRange size={14} />
        Diese Woche blockieren
      </button>
      <button
        onClick={onSetWeekendsAvailable}
        disabled={loading}
        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors flex items-center gap-1.5"
      >
        <CalendarPlus size={14} />
        Wochenenden verfügbar
      </button>
      <button
        onClick={onSetWeekdaysAvailable}
        disabled={loading}
        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors flex items-center gap-1.5"
      >
        <CalendarPlus size={14} />
        Wochentage verfügbar
      </button>
    </div>
  )
}

export default function MyCalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailabilityState] = useState<AvailabilityEntry[]>([])
  const [stats, setStats] = useState<CalendarStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [artistId, setArtistId] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  // Fetch artist ID
  useEffect(() => {
    async function fetchArtistId() {
      // If no user, use mock data immediately
      if (!user) {
        setUseMockData(true)
        return
      }

      try {
        const { data: artist } = await getArtistByUserId(user.id)
        if (artist) {
          setArtistId(artist.id)
        } else {
          // User exists but is not an artist - use mock data
          setUseMockData(true)
        }
      } catch (error) {
        console.error('Error fetching artist ID:', error)
        setUseMockData(true)
      }
    }
    fetchArtistId()
  }, [user])

  // Fetch availability for current month
  const fetchAvailability = useCallback(async () => {
    if (!artistId && !useMockData) return

    setLoading(true)
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    try {
      if (useMockData) {
        setAvailabilityState(generateMockAvailability(year, month))
        setStats({
          availableDays: 8,
          bookedDays: 3,
          pendingDays: 2,
          blockedDays: 4,
          openGigDays: 1,
          upcomingBookings: 2
        })
      } else if (artistId) {
        const { data, error } = await getAvailability(artistId, startDate, endDate)

        if (error) {
          console.error('Error fetching availability:', error)
          // Fall back to mock data on error
          setUseMockData(true)
          setAvailabilityState(generateMockAvailability(year, month))
          setStats({
            availableDays: 8,
            bookedDays: 3,
            pendingDays: 2,
            blockedDays: 4,
            openGigDays: 1,
            upcomingBookings: 2
          })
        } else {
          setAvailabilityState(data || [])
          const statsData = await getCalendarStats(artistId, month, year)
          setStats(statsData)
        }
      }
    } catch (error) {
      console.error('Error in fetchAvailability:', error)
      // Fall back to mock data on any error
      setUseMockData(true)
      setAvailabilityState(generateMockAvailability(year, month))
      setStats({
        availableDays: 8,
        bookedDays: 3,
        pendingDays: 2,
        blockedDays: 4,
        openGigDays: 1,
        upcomingBookings: 2
      })
    } finally {
      setLoading(false)
    }
  }, [artistId, year, month, useMockData])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const days: Date[] = []
    const firstDay = new Date(year, month - 1, 1)

    // Get start of week (Monday)
    let start = new Date(firstDay)
    const dayOfWeek = start.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    start.setDate(start.getDate() + diff)

    // Generate 6 weeks of days
    for (let i = 0; i < 42; i++) {
      days.push(new Date(start))
      start.setDate(start.getDate() + 1)
    }

    return days
  }

  // Get availability for a specific date
  const getAvailabilityForDate = (dateStr: string) => {
    return availability.find(a => a.date === dateStr)
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    setSelectedDate(dateStr)
    setModalOpen(true)
  }

  // Save availability
  const handleSaveAvailability = async (status: AvailabilityStatus, notes?: string) => {
    if (!selectedDate || !artistId) {
      if (useMockData) {
        // Update mock data
        const existing = availability.find(a => a.date === selectedDate)
        if (existing) {
          existing.status = status
          existing.notes = notes || null
        } else {
          availability.push({
            id: `mock-new-${Date.now()}`,
            artist_id: 'mock',
            date: selectedDate!,
            time_slots: null,
            status,
            visibility: 'visible',
            booking_id: null,
            notes: notes || null,
            created_at: new Date().toISOString(),
            updated_at: null
          })
        }
        setAvailabilityState([...availability])
        setModalOpen(false)
      }
      return
    }

    setSaving(true)
    await setAvailability(artistId, selectedDate, status, { notes })
    await fetchAvailability()
    setSaving(false)
    setModalOpen(false)
  }

  // Delete availability
  const handleDeleteAvailability = async () => {
    if (!selectedDate || !artistId) {
      if (useMockData) {
        setAvailabilityState(availability.filter(a => a.date !== selectedDate))
        setModalOpen(false)
      }
      return
    }

    setSaving(true)
    await deleteAvailability(artistId, selectedDate)
    await fetchAvailability()
    setSaving(false)
    setModalOpen(false)
  }

  // Quick actions
  const handleBlockToday = async () => {
    const today = new Date().toISOString().split('T')[0]
    if (!artistId && !useMockData) return

    setSaving(true)
    if (artistId) {
      await setAvailability(artistId, today, 'blocked')
      await fetchAvailability()
    } else {
      handleSaveAvailability('blocked')
    }
    setSaving(false)
  }

  const handleBlockWeek = async () => {
    const weekDates = getWeekDates(new Date())
    if (!artistId && !useMockData) return

    setSaving(true)
    if (artistId) {
      await setAvailabilityBulk(artistId, weekDates, 'blocked')
      await fetchAvailability()
    }
    setSaving(false)
  }

  const handleSetWeekendsAvailable = async () => {
    const weekendDates = getWeekendDates(year, month)
    if (!artistId && !useMockData) return

    setSaving(true)
    if (artistId) {
      await setAvailabilityBulk(artistId, weekendDates, 'available')
      await fetchAvailability()
    }
    setSaving(false)
  }

  const handleSetWeekdaysAvailable = async () => {
    const weekdayDates = getWeekdayDates(year, month)
    if (!artistId && !useMockData) return

    setSaving(true)
    if (artistId) {
      await setAvailabilityBulk(artistId, weekdayDates, 'available')
      await fetchAvailability()
    }
    setSaving(false)
  }

  const calendarDays = generateCalendarDays()

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display text-white">Mein Kalender</h1>
          <p className="text-gray-400 mt-1">Verwalte deine Verfügbarkeit und Buchungen</p>
        </div>
        {useMockData && (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs self-start">
            Demo-Daten
          </span>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <StatCard
            icon={CheckCircle2}
            label="Verfügbar"
            value={stats.availableDays}
            color="text-green-400"
          />
          <StatCard
            icon={CalendarCheck}
            label="Gebucht"
            value={stats.bookedDays}
            color="text-purple-400"
          />
          <StatCard
            icon={Clock}
            label="Ausstehend"
            value={stats.pendingDays}
            color="text-yellow-400"
          />
          <StatCard
            icon={XCircle}
            label="Blockiert"
            value={stats.blockedDays}
            color="text-red-400"
          />
          <StatCard
            icon={Music}
            label="Open Gigs"
            value={stats.openGigDays}
            color="text-blue-400"
          />
          <StatCard
            icon={Calendar}
            label="Anstehend"
            value={stats.upcomingBookings}
            color="text-white"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-2">Schnellaktionen:</p>
        <QuickActions
          onBlockToday={handleBlockToday}
          onBlockWeek={handleBlockWeek}
          onSetWeekendsAvailable={handleSetWeekendsAvailable}
          onSetWeekdaysAvailable={handleSetWeekdaysAvailable}
          loading={saving}
        />
      </div>

      {/* Calendar */}
      <div className="bg-bg-secondary rounded-2xl border border-white/10 p-4 md:p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-400" />
          </button>

          <div className="flex items-center gap-4">
            <h2 className="text-xl font-display text-white">
              {MONTH_NAMES[month - 1]} {year}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm transition-colors"
            >
              Heute
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAY_NAMES.map(day => (
            <div key={day} className="text-center text-sm text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const dateStr = date.toISOString().split('T')[0]
              const isCurrentMonth = date.getMonth() === month - 1
              const availabilityEntry = getAvailabilityForDate(dateStr)

              return (
                <CalendarDay
                  key={index}
                  date={date}
                  isCurrentMonth={isCurrentMonth}
                  availability={availabilityEntry}
                  isSelected={selectedDate === dateStr}
                  onClick={() => handleDateClick(date)}
                />
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/10">
          {(Object.entries(AVAILABILITY_STATUS_CONFIG) as [AvailabilityStatus, typeof AVAILABILITY_STATUS_CONFIG['available']][]).map(
            ([status, config]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${config.bgColor}`} />
                <span className="text-xs text-gray-400">{config.label}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedDate={selectedDate}
        currentAvailability={selectedDate ? getAvailabilityForDate(selectedDate) || null : null}
        onSave={handleSaveAvailability}
        onDelete={handleDeleteAvailability}
        saving={saving}
      />
    </DashboardLayout>
  )
}
