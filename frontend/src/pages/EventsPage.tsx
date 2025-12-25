import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EventCard } from '../components/events'
import { getEvents, getEventTypes, getPopularCities, type Event, type EventFilters } from '../services/eventService'
import { updatePageMeta, pageSEO } from '../lib/seo'

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Filter state
  const [filters, setFilters] = useState<EventFilters>({
    event_type: '',
    city: '',
    dateFrom: '',
    dateTo: '',
  })

  const [showFilters, setShowFilters] = useState(false)

  const eventTypes = getEventTypes()
  const popularCities = getPopularCities()

  // SEO
  useEffect(() => {
    updatePageMeta(pageSEO.events)
  }, [])

  // Fetch events
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      setError(null)

      const cleanFilters: EventFilters = {}
      if (filters.event_type) cleanFilters.event_type = filters.event_type
      if (filters.city) cleanFilters.city = filters.city
      if (filters.dateFrom) cleanFilters.dateFrom = filters.dateFrom
      if (filters.dateTo) cleanFilters.dateTo = filters.dateTo

      const { data, error: fetchError, count } = await getEvents(cleanFilters)

      if (fetchError) {
        console.error('Error fetching events:', fetchError)
        setError('Veranstaltungen konnten nicht geladen werden.')
      } else {
        setEvents(data || [])
        setTotalCount(count || 0)
      }

      setLoading(false)
    }

    fetchEvents()
  }, [filters])

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      event_type: '',
      city: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  const hasActiveFilters = filters.event_type || filters.city || filters.dateFrom || filters.dateTo

  return (
    <div className="min-h-screen bg-bg-primary pb-16">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600"
          alt="Events background"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-bg-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-5xl md:text-7xl text-white mb-4"
            >
              VERANSTALTUNGEN
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-white/70 text-lg max-w-2xl mx-auto px-4"
            >
              Entdecke kommende Events und finde den perfekten Künstler für deine Veranstaltung
            </motion.p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/10">
          {/* Mobile Filter Toggle */}
          <button
            className="md:hidden w-full flex items-center justify-between text-white mb-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="font-medium">Filter</span>
            <svg
              className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Filter Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            {/* Event Type */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Event-Typ
              </label>
              <select
                value={filters.event_type}
                onChange={(e) => handleFilterChange('event_type', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Alle Typen</option>
                {eventTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Stadt
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Alle Städte</option>
                {popularCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Von
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Bis
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Filter zurücksetzen
                </button>
              ) : (
                <div className="w-full py-2.5 text-white/40 text-sm text-center">
                  {totalCount} Events gefunden
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Results Count */}
        {hasActiveFilters && (
          <p className="text-white/60 text-sm mb-6">
            {totalCount} {totalCount === 1 ? 'Event' : 'Events'} gefunden
          </p>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-white/10" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                  <div className="h-10 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Fehler beim Laden</h3>
            <p className="text-white/60">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Keine Events gefunden</h3>
            <p className="text-white/60 mb-6">
              {hasActiveFilters
                ? 'Versuche es mit anderen Filtereinstellungen.'
                : 'Es gibt derzeit keine kommenden Veranstaltungen.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}

        {/* Events Grid */}
        <AnimatePresence mode="wait">
          {!loading && !error && events.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
