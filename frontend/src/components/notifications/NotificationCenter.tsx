import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  getNotificationsFiltered,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  getNotificationStats,
  subscribeToNotifications,
  groupNotificationsByDate,
  type Notification,
  type NotificationType,
  type NotificationStats,
} from '../../services/notificationService'
import { NotificationItem } from './NotificationItem'

// Filter tabs
const FILTER_TABS: { label: string; value: 'all' | 'unread' | NotificationType[] }[] = [
  { label: 'Alle', value: 'all' },
  { label: 'Ungelesen', value: 'unread' },
  { label: 'Buchungen', value: ['booking_request', 'booking_confirmed', 'booking_declined', 'booking_cancelled', 'booking_completed'] },
  { label: 'Nachrichten', value: ['new_message'] },
  { label: 'Zahlungen', value: ['payment_received', 'payment_pending', 'payout_sent'] },
]

// Icons
const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const CheckAllIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
)

export function NotificationCenter() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | NotificationType[]>('all')
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const LIMIT = 20

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (reset = false) => {
      if (!user) return

      const newOffset = reset ? 0 : offset
      setLoading(reset)
      setRefreshing(!reset)

      const unreadOnly = activeTab === 'unread'
      const types = Array.isArray(activeTab) ? activeTab : undefined

      const { data } = await getNotificationsFiltered(user.id, {
        unreadOnly,
        types,
        limit: LIMIT,
        offset: newOffset,
      })

      if (data) {
        if (reset) {
          setNotifications(data)
        } else {
          setNotifications((prev) => [...prev, ...data])
        }
        setHasMore(data.length === LIMIT)
        setOffset(newOffset + data.length)
      }

      setLoading(false)
      setRefreshing(false)
    },
    [user, activeTab, offset]
  )

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!user) return
    const { data } = await getNotificationStats(user.id)
    if (data) setStats(data)
  }, [user])

  // Initial load
  useEffect(() => {
    if (user) {
      setOffset(0)
      fetchNotifications(true)
      fetchStats()
    }
  }, [user, activeTab])

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev])
      setStats((prev) =>
        prev
          ? { ...prev, total_count: prev.total_count + 1, unread_count: prev.unread_count + 1 }
          : null
      )
    })

    return unsubscribe
  }, [user])

  // Handle mark as read
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setStats((prev) =>
      prev ? { ...prev, unread_count: Math.max(0, prev.unread_count - 1) } : null
    )
  }

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    if (!user) return
    await markAllAsRead(user.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setStats((prev) => (prev ? { ...prev, unread_count: 0 } : null))
  }

  // Handle delete notification
  const handleDelete = async (id: string) => {
    await deleteNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setStats((prev) =>
      prev ? { ...prev, total_count: Math.max(0, prev.total_count - 1) } : null
    )
  }

  // Handle clear read notifications
  const handleClearRead = async () => {
    if (!user) return
    await deleteReadNotifications(user.id)
    setNotifications((prev) => prev.filter((n) => !n.is_read))
    fetchStats()
  }

  // Load more
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(false)
    }
  }

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(notifications)

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <BellIcon />
          </div>
          <p className="text-white/50">Bitte melde dich an</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Benachrichtigungen</h1>
          {stats && (
            <p className="text-white/50 text-sm mt-1">
              {stats.unread_count} ungelesen von {stats.total_count} gesamt
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white disabled:opacity-50"
            title="Aktualisieren"
          >
            <RefreshIcon />
          </button>
          <Link
            to="/dashboard/settings/notifications"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
            title="Einstellungen"
          >
            <SettingsIcon />
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {FILTER_TABS.map((tab) => {
          const isActive =
            activeTab === tab.value ||
            (Array.isArray(activeTab) &&
              Array.isArray(tab.value) &&
              JSON.stringify(activeTab) === JSON.stringify(tab.value))

          return (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.value as typeof activeTab)
                setOffset(0)
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-accent-purple text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.value === 'unread' && stats && stats.unread_count > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {stats.unread_count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <div className="flex gap-2 mb-6">
          {stats && stats.unread_count > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
            >
              <CheckAllIcon />
              Alle als gelesen markieren
            </button>
          )}
          <button
            onClick={handleClearRead}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
          >
            <TrashIcon />
            Gelesene löschen
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl animate-pulse">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && notifications.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <BellIcon />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Keine Benachrichtigungen</h3>
          <p className="text-white/50 max-w-sm mx-auto">
            {activeTab === 'unread'
              ? 'Du hast alle Benachrichtigungen gelesen!'
              : 'Hier siehst du Updates zu Buchungen, Nachrichten und mehr.'}
          </p>
        </div>
      )}

      {/* Notifications List (Grouped by Date) */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-6">
          {Array.from(groupedNotifications.entries()).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <h3 className="text-sm font-medium text-white/50 mb-3">{dateLabel}</h3>
              <div className="space-y-2">
                {items.map((notification) => (
                  <div
                    key={notification.id}
                    className="group relative bg-white/5 rounded-xl hover:bg-white/[0.07] transition-colors"
                  >
                    <NotificationItem
                      notification={notification}
                      onRead={() => handleMarkAsRead(notification.id)}
                      onClose={() => {}}
                      showFullContent
                    />
                    {/* Delete button on hover */}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white/50 hover:text-red-400"
                      title="Löschen"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={refreshing}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                {refreshing ? 'Laden...' : 'Mehr laden'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
