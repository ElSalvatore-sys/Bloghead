import { useNavigate } from 'react-router-dom'
import type { Notification, NotificationType } from '../../services/notificationService'

interface NotificationItemProps {
  notification: Notification
  onRead: () => void
  onClose?: () => void
  showFullContent?: boolean // Show full body without truncation
}

// Format relative time in German
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffSeconds < 60) {
    return 'Gerade eben'
  } else if (diffMinutes < 60) {
    return `vor ${diffMinutes} Min.`
  } else if (diffHours < 24) {
    return `vor ${diffHours} Std.`
  } else if (diffDays < 7) {
    return `vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`
  } else if (diffWeeks < 4) {
    return `vor ${diffWeeks} ${diffWeeks === 1 ? 'Woche' : 'Wochen'}`
  } else {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
}

// Get icon component based on notification type
function NotificationIcon({ type, className = '' }: { type: NotificationType; className?: string }) {
  const iconClass = `w-5 h-5 ${className}`

  switch (type) {
    case 'booking_request':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="14" x2="12" y2="18" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
      )
    case 'booking_confirmed':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    case 'booking_completed':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <polyline points="9 16 11 18 15 14" />
        </svg>
      )
    case 'booking_declined':
    case 'booking_cancelled':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )
    case 'new_message':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      )
    case 'new_review':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    case 'review_response':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="9" y1="10" x2="15" y2="10" />
        </svg>
      )
    case 'new_follower':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      )
    case 'payment_received':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M9.5 9.5h3a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3h3" />
          <path d="M12 7v2m0 6v2" />
        </svg>
      )
    case 'payout_sent':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      )
    case 'payment_pending':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    case 'reminder':
    case 'reminder_24h':
    case 'reminder_1h':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          <line x1="12" y1="2" x2="12" y2="4" />
        </svg>
      )
    case 'profile_milestone':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      )
    case 'system':
    default:
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )
  }
}

// Get icon background color based on type
function getIconBgColor(type: NotificationType): string {
  switch (type) {
    case 'booking_confirmed':
    case 'booking_completed':
    case 'payment_received':
    case 'payout_sent':
      return 'bg-green-500/20'
    case 'booking_declined':
    case 'booking_cancelled':
      return 'bg-red-500/20'
    case 'booking_request':
      return 'bg-accent-purple/20'
    case 'new_message':
      return 'bg-blue-500/20'
    case 'new_review':
    case 'review_response':
      return 'bg-accent-salmon/20'
    case 'new_follower':
    case 'profile_milestone':
      return 'bg-purple-500/20'
    case 'payment_pending':
    case 'reminder':
    case 'reminder_24h':
    case 'reminder_1h':
      return 'bg-accent-orange/20'
    case 'system':
    default:
      return 'bg-white/10'
  }
}

// Get icon color based on type
function getIconColor(type: NotificationType): string {
  switch (type) {
    case 'booking_confirmed':
    case 'booking_completed':
    case 'payment_received':
    case 'payout_sent':
      return 'text-green-400'
    case 'booking_declined':
    case 'booking_cancelled':
      return 'text-red-400'
    case 'booking_request':
      return 'text-accent-purple'
    case 'new_message':
      return 'text-blue-400'
    case 'new_review':
    case 'review_response':
      return 'text-accent-salmon'
    case 'new_follower':
    case 'profile_milestone':
      return 'text-purple-400'
    case 'payment_pending':
    case 'reminder':
    case 'reminder_24h':
    case 'reminder_1h':
      return 'text-accent-orange'
    case 'system':
    default:
      return 'text-white/70'
  }
}

export function NotificationItem({
  notification,
  onRead,
  onClose,
  showFullContent = false,
}: NotificationItemProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    // Mark as read if not already
    if (!notification.is_read) {
      onRead()
    }

    // Navigate if there's an action URL
    const link = notification.action_url || notification.action_data?.link
    if (link) {
      navigate(link)
      onClose?.()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
        hover:bg-white/5
        ${!notification.is_read ? 'bg-accent-purple/5' : ''}
      `}
    >
      {/* Icon */}
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${getIconBgColor(notification.type)}
        `}
      >
        <NotificationIcon type={notification.type} className={getIconColor(notification.type)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-medium ${showFullContent ? '' : 'truncate'} ${
              notification.is_read ? 'text-white/70' : 'text-white'
            }`}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-accent-purple" />
          )}
        </div>
        {notification.body && (
          <p
            className={`text-sm text-white/50 mt-0.5 ${showFullContent ? '' : 'line-clamp-2'}`}
          >
            {notification.body}
          </p>
        )}
        <p className="text-xs text-white/40 mt-1">{formatTimeAgo(notification.created_at)}</p>
      </div>
    </button>
  )
}
