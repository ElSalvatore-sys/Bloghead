import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui'
import { getEventById, type Event } from '../services/eventService'

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  festival: { label: 'Festival', icon: '🎪', color: 'bg-orange-500' },
  concert: { label: 'Konzert', icon: '🎵', color: 'bg-purple-500' },
  party: { label: 'Party', icon: '🎉', color: 'bg-pink-500' },
  wedding: { label: 'Hochzeit', icon: '💒', color: 'bg-rose-500' },
  corporate: { label: 'Firmenfeier', icon: '🏢', color: 'bg-blue-500' },
  birthday: { label: 'Geburtstag', icon: '🎂', color: 'bg-yellow-500' },
  exhibition: { label: 'Messe', icon: '🎭', color: 'bg-teal-500' },
  other: { label: 'Sonstiges', icon: '📅', color: 'bg-gray-500' },
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatTime(time: string | undefined) {
  if (!time) return ''
  return time.slice(0, 5) + ' Uhr'
}

function formatBudget(min?: number, max?: number) {
  if (!min && !max) return null
  const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
  if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`
  if (min) return `Ab ${formatter.format(min)}`
  if (max) return `Bis ${formatter.format(max)}`
  return null
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-bg-primary animate-pulse">
      <div className="h-80 md:h-96 bg-white/10" />
      <div className="max-w-4xl mx-auto px-4 -mt-20">
        <div className="bg-white/5 rounded-xl p-8 space-y-6">
          <div className="h-8 bg-white/10 rounded w-3/4" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-32 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  )
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return
      setLoading(true)
      const { data, error: fetchError } = await getEventById(id)
      if (fetchError) {
        setError('Event nicht gefunden')
      } else {
        setEvent(data)
      }
      setLoading(false)
    }
    fetchEvent()
  }, [id])

  if (loading) return <LoadingSkeleton />

  if (error || !event) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Event nicht gefunden</h2>
          <p className="text-white/60 mb-6">Das gesuchte Event existiert nicht oder wurde entfernt.</p>
          <Link to="/events">
            <Button variant="primary">Zurück zu Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  const typeConfig = EVENT_TYPE_CONFIG[event.event_type] || EVENT_TYPE_CONFIG.other
  const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600'
  const budgetDisplay = formatBudget(event.budget_min, event.budget_max)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `${event.title} - ${formatDate(event.event_date)} in ${event.city}`,
          url: window.location.href,
        })
      } catch {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link kopiert!')
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-16">
      {/* Hero Image */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img
          src={event.cover_image_url || defaultImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-black/40 to-black/20" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>

        {/* Event Type Badge */}
        <div className={`absolute bottom-24 left-6 ${typeConfig.color} rounded-full px-4 py-2 flex items-center gap-2`}>
          <span className="text-lg">{typeConfig.icon}</span>
          <span className="text-sm font-medium text-white">{typeConfig.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-white/10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{event.title}</h1>

            {/* Key Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date */}
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Datum</p>
                  <p className="text-sm font-medium">{formatDate(event.event_date)}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Uhrzeit</p>
                  <p className="text-sm font-medium">
                    {formatTime(event.start_time)}
                    {event.end_time && ` - ${formatTime(event.end_time)}`}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-medium">{event.venue_name || event.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 md:p-8 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Über das Event</h2>
            <p className="text-white/70 whitespace-pre-wrap leading-relaxed">
              {event.description || 'Keine Beschreibung verfügbar.'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="p-6 md:p-8 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Expected Guests */}
              {event.expected_guests && (
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Gäste</p>
                  <p className="text-white font-medium">{event.expected_guests.toLocaleString('de-DE')}</p>
                </div>
              )}

              {/* Budget */}
              {budgetDisplay && (
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-white font-medium">{budgetDisplay}</p>
                </div>
              )}

              {/* Indoor/Outdoor */}
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Location-Typ</p>
                <p className="text-white font-medium">
                  {event.is_indoor && event.is_outdoor && 'Indoor & Outdoor'}
                  {event.is_indoor && !event.is_outdoor && 'Indoor'}
                  {!event.is_indoor && event.is_outdoor && 'Outdoor'}
                  {!event.is_indoor && !event.is_outdoor && 'Nicht angegeben'}
                </p>
              </div>

              {/* City */}
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Stadt</p>
                <p className="text-white font-medium">{event.city}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          {(event.venue_name || event.address) && (
            <div className="p-6 md:p-8 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Adresse</h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  {event.venue_name && <p className="text-white font-medium">{event.venue_name}</p>}
                  {event.address && <p className="text-white/70">{event.address}</p>}
                  <p className="text-white/70">{event.postal_code} {event.city}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${event.address || ''} ${event.postal_code || ''} ${event.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-flex items-center gap-1"
                  >
                    In Google Maps öffnen
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="p-6 md:p-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Künstler für dieses Event buchen?</h3>
              <p className="text-white/70 mb-6">Finde den perfekten Künstler für diese Veranstaltung.</p>
              <Link to="/artists">
                <Button variant="primary" size="lg">
                  Künstler entdecken
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
