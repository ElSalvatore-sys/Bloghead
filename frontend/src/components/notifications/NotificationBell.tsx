import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
} from '../../services/notificationService'
import type { Notification } from '../../services/notificationService'
import { NotificationItem } from './NotificationItem'

// Bell icon component
function BellIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await getNotifications(user.id)
    setNotifications(data || [])
    setLoading(false)
  }, [user])

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    const { count } = await getUnreadCount(user.id)
    setUnreadCount(count)
  }, [user])

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [user, fetchNotifications, fetchUnreadCount])

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    return unsubscribe
  }, [user])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Poll for new notifications every 30 seconds (fallback for real-time)
  useEffect(() => {
    if (!user) return
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user, fetchUnreadCount])

  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  // Handle marking all as read
  const handleMarkAllRead = async () => {
    if (!user) return
    await markAllAsRead(user.id)
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  // Toggle dropdown
  const handleToggle = () => {
    if (!isOpen) {
      // Refresh notifications when opening
      fetchNotifications()
    }
    setIsOpen(!isOpen)
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
        aria-label={`Benachrichtigungen${unreadCount > 0 ? ` (${unreadCount} ungelesen)` : ''}`}
      >
        <BellIcon className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="font-semibold text-white">Benachrichtigungen</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-accent-purple hover:text-accent-purple/80 transition-colors"
              >
                Alle gelesen
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              // Loading state
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              // Empty state
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                  <BellIcon className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-white/50 text-sm">Keine Benachrichtigungen</p>
                <p className="text-white/30 text-xs mt-1">
                  Hier siehst du Updates zu Buchungen, Nachrichten und mehr
                </p>
              </div>
            ) : (
              // Notifications
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={() => handleMarkAsRead(notification.id)}
                    onClose={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-white/10 text-center">
              <Link
                to="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-accent-purple hover:text-accent-purple/80 transition-colors"
              >
                Alle Benachrichtigungen anzeigen
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
