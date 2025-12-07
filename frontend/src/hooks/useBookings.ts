import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getBookingRequests,
  getBookings,
  getBookingStats,
  updateBookingRequestStatus,
  type BookingRequest,
  type Booking
} from '../services/bookingService'

export function useBookingRequests(direction: 'incoming' | 'outgoing') {
  const { user } = useAuth()
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async (status?: string) => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await getBookingRequests(user.id, direction, status)

    if (fetchError) {
      setError(fetchError.message)
      setRequests([])
    } else {
      setRequests(data || [])
    }
    setLoading(false)
  }, [user, direction])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const updateStatus = async (
    requestId: string,
    status: BookingRequest['status'],
    message?: string
  ) => {
    const { error: updateError } = await updateBookingRequestStatus(requestId, status, message)
    if (!updateError) {
      await fetchRequests() // Refresh list
    }
    return { error: updateError }
  }

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    updateStatus
  }
}

export function useBookings(type: 'upcoming' | 'past') {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await getBookings(user.id, type)

    if (fetchError) {
      setError(fetchError.message)
      setBookings([])
    } else {
      setBookings(data || [])
    }
    setLoading(false)
  }, [user, type])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings
  }
}

export function useBookingStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    thisMonth: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setLoading(false)
        return
      }

      const data = await getBookingStats(user.id)
      setStats(data)
      setLoading(false)
    }

    fetchStats()
  }, [user])

  return { stats, loading }
}

// Hook for pending request count (for sidebar badge)
export function usePendingRequestsCount() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      if (!user) return

      const { data } = await getBookingRequests(user.id, 'incoming', 'pending')
      setCount(data?.length || 0)
    }

    fetchCount()

    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  return count
}
