import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Event } from '../../services/eventService'

interface EventCardProps {
  event: Event
}

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
  return {
    day: date.getDate().toString().padStart(2, '0'),
    month: date.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase(),
    year: date.getFullYear(),
    full: date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
}

function formatTime(time: string | undefined) {
  if (!time) return ''
  return time.slice(0, 5) + ' Uhr'
}

export function EventCard({ event }: EventCardProps) {
  const typeConfig = EVENT_TYPE_CONFIG[event.event_type] || EVENT_TYPE_CONFIG.other
  const dateInfo = formatDate(event.event_date)

  const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      whileHover={{
        y: -4,
        scale: 1.01,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      className="shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-shadow duration-300"
    >
      <Link
        to={`/events/${event.id}`}
        className="group block bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20"
      >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.cover_image_url || defaultImage}
          alt={event.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-purple-600 rounded-lg px-3 py-2 text-center min-w-[60px]">
          <div className="text-2xl font-bold text-white leading-none">{dateInfo.day}</div>
          <div className="text-xs font-medium text-white/80 uppercase tracking-wider">{dateInfo.month}</div>
        </div>

        {/* Event Type Badge */}
        <div className={`absolute top-4 right-4 ${typeConfig.color} rounded-full px-3 py-1 flex items-center gap-1.5`}>
          <span>{typeConfig.icon}</span>
          <span className="text-xs font-medium text-white">{typeConfig.label}</span>
        </div>

        {/* Title on Image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
            {event.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <div className="flex items-center gap-2 text-white/70">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm truncate">
            {event.venue_name && `${event.venue_name}, `}{event.city}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-white/70">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">
            {formatTime(event.start_time)}
            {event.end_time && ` - ${formatTime(event.end_time)}`}
          </span>
        </div>

        {/* Expected Guests */}
        {event.expected_guests && (
          <div className="flex items-center gap-2 text-white/70">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm">{event.expected_guests.toLocaleString('de-DE')} Gäste erwartet</span>
          </div>
        )}

        {/* CTA Button */}
        <motion.button
          className="w-full mt-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Details ansehen
        </motion.button>
      </div>
      </Link>
    </motion.div>
  )
}
