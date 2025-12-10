import {
  formatDateGerman,
  formatTimeRange,
  BOOKING_STATUS_CONFIG,
  EVENT_TYPE_LABELS,
  type BookingStatus,
  type EventType
} from '../../types/booking'

export interface BookingCardData {
  id: string
  bookingNumber: string
  eventDate: string
  startTime: string | null
  endTime: string | null
  eventType: string | null
  locationName: string | null
  locationAddress?: string | null
  status: BookingStatus
  totalPrice: number
  // Partner info (artist for customer view, customer for artist view)
  partnerName: string
  partnerImage?: string | null
  partnerRole: 'artist' | 'customer'
}

interface BookingCardProps {
  booking: BookingCardData
  onViewDetails?: (bookingId: string) => void
  onCancel?: (bookingId: string) => void
  showActions?: boolean
  compact?: boolean
}

export function BookingCard({
  booking,
  onViewDetails,
  onCancel,
  showActions = true,
  compact = false
}: BookingCardProps) {
  const statusConfig = BOOKING_STATUS_CONFIG[booking.status]
  const eventTypeLabel = booking.eventType
    ? EVENT_TYPE_LABELS[booking.eventType as EventType] || booking.eventType
    : 'Veranstaltung'

  // Check if booking can be cancelled
  const canCancel = ['pending', 'confirmed'].includes(booking.status)

  // Event type emoji
  const getEventEmoji = (eventType: string | null): string => {
    const emojis: Record<string, string> = {
      wedding: '💒',
      corporate: '🏢',
      private_party: '🎉',
      club: '🎧',
      festival: '🎪',
      birthday: '🎂',
      concert: '🎵',
      gala: '✨',
      other: '📅'
    }
    return eventType ? emojis[eventType] || emojis.other : emojis.other
  }

  if (compact) {
    return (
      <div
        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
        onClick={() => onViewDetails?.(booking.id)}
      >
        {/* Partner avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center overflow-hidden flex-shrink-0">
          {booking.partnerImage ? (
            <img
              src={booking.partnerImage}
              alt={booking.partnerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-lg">
              {booking.partnerName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-medium truncate">{booking.partnerName}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig.bgColor} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-gray-400 text-sm truncate">
            {formatDateGerman(booking.eventDate)} • {eventTypeLabel}
          </p>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <p className="text-white font-medium">{booking.totalPrice.toLocaleString('de-DE')} EUR</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
      {/* Header with status */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Buchung</span>
          <span className="text-white font-mono text-sm">{booking.bookingNumber}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${statusConfig.bgColor} ${statusConfig.color}`}>
          {statusConfig.icon} {statusConfig.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Partner info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center overflow-hidden">
            {booking.partnerImage ? (
              <img
                src={booking.partnerImage}
                alt={booking.partnerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-2xl">
                {booking.partnerName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-gray-400 text-sm">
              {booking.partnerRole === 'artist' ? 'Kuenstler' : 'Kunde'}
            </p>
            <h3 className="text-xl font-bold text-white">{booking.partnerName}</h3>
          </div>
        </div>

        {/* Event details */}
        <div className="space-y-4">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">{formatDateGerman(booking.eventDate)}</p>
              <p className="text-gray-400 text-sm">
                {formatTimeRange(booking.startTime || '', booking.endTime || '')}
              </p>
            </div>
          </div>

          {/* Event type */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">{getEventEmoji(booking.eventType)}</span>
            </div>
            <div>
              <p className="text-white font-medium">{eventTypeLabel}</p>
              <p className="text-gray-400 text-sm">Veranstaltungsart</p>
            </div>
          </div>

          {/* Location */}
          {booking.locationName && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">{booking.locationName}</p>
                {booking.locationAddress && (
                  <p className="text-gray-400 text-sm">{booking.locationAddress}</p>
                )}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-lg">{booking.totalPrice.toLocaleString('de-DE')} EUR</p>
              <p className="text-gray-400 text-sm">Gesamtpreis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={() => onViewDetails?.(booking.id)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#610AD1] to-[#F92B02] hover:opacity-90 text-white rounded-xl transition-opacity flex items-center justify-center gap-2"
          >
            <span>Details ansehen</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="px-4 py-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-xl transition-colors"
              title="Stornieren"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default BookingCard
