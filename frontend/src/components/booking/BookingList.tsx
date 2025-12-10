import { useState } from 'react'
import { BookingCard, type BookingCardData } from './BookingCard'
import type { BookingStatus } from '../../types/booking'

type FilterTab = 'all' | 'upcoming' | 'past' | BookingStatus

interface BookingListProps {
  bookings: BookingCardData[]
  loading?: boolean
  error?: string | null
  onViewDetails?: (bookingId: string) => void
  onCancel?: (bookingId: string) => void
  emptyMessage?: string
  showFilters?: boolean
  compactCards?: boolean
}

// Filter tab configuration
const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'upcoming', label: 'Anstehend' },
  { value: 'past', label: 'Vergangen' },
  { value: 'confirmed', label: 'Bestaetigt' },
  { value: 'pending', label: 'Ausstehend' },
  { value: 'cancelled', label: 'Storniert' }
]

export function BookingList({
  bookings,
  loading = false,
  error,
  onViewDetails,
  onCancel,
  emptyMessage = 'Keine Buchungen vorhanden',
  showFilters = true,
  compactCards = false
}: BookingListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter bookings based on active tab and search
  const filteredBookings = bookings.filter(booking => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        booking.partnerName.toLowerCase().includes(query) ||
        booking.bookingNumber.toLowerCase().includes(query) ||
        booking.locationName?.toLowerCase().includes(query)

      if (!matchesSearch) return false
    }

    // Tab filter
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date(booking.eventDate)

    switch (activeFilter) {
      case 'all':
        return true
      case 'upcoming':
        return eventDate >= today && booking.status !== 'cancelled'
      case 'past':
        return eventDate < today
      case 'confirmed':
      case 'pending':
      case 'cancelled':
      case 'completed':
      case 'in_progress':
      case 'disputed':
      case 'refunded':
        return booking.status === activeFilter
      default:
        return true
    }
  })

  // Sort bookings: upcoming first (by date), then past (by date desc)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dateA = new Date(a.eventDate)
    const dateB = new Date(b.eventDate)

    const aIsUpcoming = dateA >= today
    const bIsUpcoming = dateB >= today

    // Upcoming events first
    if (aIsUpcoming && !bIsUpcoming) return -1
    if (!aIsUpcoming && bIsUpcoming) return 1

    // Within same category, sort by date
    if (aIsUpcoming && bIsUpcoming) {
      return dateA.getTime() - dateB.getTime() // Nearest first
    }
    return dateB.getTime() - dateA.getTime() // Most recent past first
  })

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/30 rounded-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-400 mb-2">Fehler beim Laden</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Suche nach Name, Buchungsnummer oder Ort..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === tab.value
                    ? 'bg-gradient-to-r from-[#610AD1] to-[#F92B02] text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                }`}
              >
                {tab.label}
                {tab.value !== 'all' && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {bookings.filter(b => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const eventDate = new Date(b.eventDate)

                      switch (tab.value) {
                        case 'upcoming':
                          return eventDate >= today && b.status !== 'cancelled'
                        case 'past':
                          return eventDate < today
                        default:
                          return b.status === tab.value
                      }
                    }).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results count */}
      {searchQuery && (
        <p className="text-gray-400 text-sm">
          {sortedBookings.length} Ergebnis{sortedBookings.length !== 1 ? 'se' : ''} gefunden
        </p>
      )}

      {/* Bookings list */}
      {sortedBookings.length === 0 ? (
        <div className="p-12 bg-white/5 rounded-2xl border border-white/10 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchQuery ? 'Keine Ergebnisse' : emptyMessage}
          </h3>
          <p className="text-gray-400">
            {searchQuery
              ? 'Versuche es mit anderen Suchbegriffen'
              : 'Hier werden deine Buchungen angezeigt'}
          </p>
        </div>
      ) : (
        <div className={compactCards ? 'space-y-3' : 'grid gap-6 md:grid-cols-2'}>
          {sortedBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewDetails={onViewDetails}
              onCancel={onCancel}
              compact={compactCards}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BookingList
