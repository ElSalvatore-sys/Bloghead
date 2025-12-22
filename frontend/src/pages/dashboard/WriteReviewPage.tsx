/**
 * WriteReviewPage - Phase 7
 * Page for writing a review for a completed booking
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import type { ReviewerType } from '@/services/reviewService'

interface BookingData {
  id: string
  artist_id: string
  client_id: string
  event_date: string
  status: string
  artist?: {
    id: string
    kuenstlername: string
    profile_image_url?: string
  }
  client?: {
    id: string
    membername?: string
    vorname?: string
    nachname?: string
    profile_image_url?: string
  }
}

export function WriteReviewPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [reviewerType, setReviewerType] = useState<ReviewerType>('client')

  useEffect(() => {
    if (!user || !bookingId) return

    const loadBooking = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch booking with related data
        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select(`
            id,
            artist_id,
            client_id,
            event_date,
            status,
            artist:artists!bookings_artist_id_fkey(
              id,
              kuenstlername,
              profile_image_url
            ),
            client:users!bookings_client_id_fkey(
              id,
              membername,
              vorname,
              nachname,
              profile_image_url
            )
          `)
          .eq('id', bookingId)
          .single()

        if (fetchError) {
          console.error('Booking fetch error:', fetchError)
          setError('Buchung konnte nicht geladen werden')
          return
        }

        if (!data) {
          setError('Buchung nicht gefunden')
          return
        }

        // Check if user is part of this booking
        if (data.client_id !== user.id && data.artist_id !== user.id) {
          setError('Du hast keinen Zugriff auf diese Buchung')
          return
        }

        // Determine reviewer type
        if (data.client_id === user.id) {
          setReviewerType('client')
        } else {
          setReviewerType('artist')
        }

        // Check if booking is completed
        if (data.status !== 'completed') {
          setError('Bewertungen können nur für abgeschlossene Buchungen abgegeben werden')
          return
        }

        // Check if within 14 days
        const eventDate = new Date(data.event_date)
        const daysSinceEvent = Math.floor(
          (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceEvent > 14) {
          setError('Die Frist für die Abgabe einer Bewertung (14 Tage) ist abgelaufen')
          return
        }

        // Check if already reviewed
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('booking_id', bookingId)
          .eq('reviewer_id', user.id)
          .maybeSingle()

        if (existingReview) {
          setError('Du hast diese Buchung bereits bewertet')
          return
        }

        setBooking(data as unknown as BookingData)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Ein Fehler ist aufgetreten')
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [user, bookingId])

  const handleSuccess = () => {
    setSubmitted(true)
  }

  // Get reviewee name and image
  const getRevieweeInfo = () => {
    if (!booking) return { name: '', image: undefined }

    if (reviewerType === 'client') {
      // Client reviewing artist
      return {
        name: booking.artist?.kuenstlername || 'Künstler',
        image: booking.artist?.profile_image_url,
      }
    } else {
      // Artist reviewing client
      const client = booking.client
      const name =
        client?.membername ||
        `${client?.vorname || ''} ${client?.nachname || ''}`.trim() ||
        'Kunde'
      return {
        name,
        image: client?.profile_image_url,
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          to="/dashboard/my-reviews"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Bewertungen
        </Link>

        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            to="/dashboard/my-reviews"
            className="inline-block px-6 py-2 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors"
          >
            Zu meinen Bewertungen
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    const revieweeInfo = getRevieweeInfo()
    return (
      <div className="space-y-6">
        <Link
          to="/dashboard/my-reviews"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Bewertungen
        </Link>

        <div className="bg-bg-card rounded-xl border border-white/10 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Vielen Dank!</h1>
          <p className="text-white/60 mb-6">
            Deine Bewertung für {revieweeInfo.name} wurde erfolgreich gespeichert.
          </p>
          <Link
            to="/dashboard/my-reviews"
            className="inline-block px-6 py-3 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors"
          >
            Meine Bewertungen anzeigen
          </Link>
        </div>
      </div>
    )
  }

  if (!booking) return null

  const revieweeInfo = getRevieweeInfo()

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Link */}
      <Link
        to="/dashboard/my-reviews"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück zu Bewertungen
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/10">
        {revieweeInfo.image ? (
          <img
            src={revieweeInfo.image}
            alt={revieweeInfo.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center text-white font-bold text-xl">
            {revieweeInfo.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">
            {reviewerType === 'client' ? 'Künstler bewerten' : 'Kunde bewerten'}
          </h1>
          <p className="text-white/60">{revieweeInfo.name}</p>
        </div>
      </div>

      {/* Review Form */}
      <ReviewForm
        bookingId={bookingId!}
        reviewerType={reviewerType}
        revieweeName={revieweeInfo.name}
        eventDate={booking.event_date}
        onSuccess={handleSuccess}
        onCancel={() => navigate('/dashboard/my-reviews')}
      />
    </div>
  )
}

export default WriteReviewPage
