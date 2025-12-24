import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  subscribeToNotifications,
  markAsRead,
  getNotificationIcon,
  getNotificationColor,
  formatNotificationTime,
  type Notification,
} from '../../services/notificationService'

interface ToastProps {
  notification: Notification
  onDismiss: () => void
  onRead: () => void
}

// Single Toast Component
function Toast({ notification, onDismiss, onRead }: ToastProps) {
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(onDismiss, 300) // Wait for exit animation
  }

  const handleClick = () => {
    if (!notification.is_read) {
      onRead()
    }

    const link = notification.action_url || notification.action_data?.link
    if (link) {
      navigate(link)
    }

    handleDismiss()
  }

  const iconName = getNotificationIcon(notification.type)
  const colorClass = getNotificationColor(notification.type)

  return (
    <div
      className={`
        max-w-sm w-full bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10
        overflow-hidden cursor-pointer transform transition-all duration-300
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      onClick={handleClick}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${colorClass}`}>
            <NotificationIconSvg name={iconName} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-medium text-white truncate">
              {notification.title}
            </p>
            {notification.body && (
              <p className="text-sm text-white/50 line-clamp-2 mt-0.5">
                {notification.body}
              </p>
            )}
            <p className="text-xs text-white/40 mt-1">
              {formatNotificationTime(notification.created_at)}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDismiss()
            }}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <div
          className="h-full bg-accent-purple animate-shrink"
          style={{ animationDuration: '5s' }}
        />
      </div>
    </div>
  )
}

// Simple SVG icon component
function NotificationIconSvg({ name }: { name: string }) {
  const iconClass = 'w-5 h-5'

  switch (name) {
    case 'calendar-plus':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="14" x2="12" y2="18" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
      )
    case 'check-circle':
    case 'calendar-check':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    case 'x-circle':
    case 'calendar-x':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )
    case 'message-circle':
    case 'message-square':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    case 'user-plus':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      )
    case 'euro':
    case 'banknote':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M9.5 9.5h3a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3h3" />
          <path d="M12 7v2m0 6v2" />
        </svg>
      )
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    case 'bell':
    case 'bell-ring':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    case 'trophy':
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
    case 'info':
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

// Toast Container - manages multiple toasts
export function NotificationToastContainer() {
  const { user } = useAuth()
  const [toasts, setToasts] = useState<Notification[]>([])

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
      // Add new notification to toasts
      setToasts((prev) => [newNotification, ...prev].slice(0, 3)) // Max 3 toasts
    })

    return unsubscribe
  }, [user])

  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleRead = useCallback(async (id: string) => {
    await markAsRead(id)
  }, [])

  if (!user || toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={() => handleDismiss(notification.id)}
          onRead={() => handleRead(notification.id)}
        />
      ))}
    </div>
  )
}

// CSS for shrink animation (add to your global CSS or tailwind.config.js)
// @keyframes shrink {
//   from { width: 100%; }
//   to { width: 0%; }
// }
// .animate-shrink { animation: shrink linear forwards; }
