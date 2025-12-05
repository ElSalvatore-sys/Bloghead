import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '../components/ui'
import { ArtistCalendar, AudioPlayer } from '../components/artist'
import {
  InstagramIcon,
  PlayIcon,
  CameraIcon,
  HeartIcon,
  HeartFilledIcon,
} from '../components/icons'
import { getArtistById, getArtistAvailability } from '../services/artistService'

interface ArtistData {
  id: string
  user_id: string
  kuenstlername: string
  genre: string[]
  stadt: string
  region: string
  land: string
  bio: string
  something_about_me: string
  preis_pro_stunde: number | null
  preis_pro_veranstaltung: number | null
  preis_pauschal: number | null
  star_rating: number
  total_ratings: number
  total_bookings: number
  total_followers: number
  is_bookable: boolean
  tagged_with: string[]
  jobbezeichnung: string
  technik_vorhanden: string
  social_media: Record<string, string> | null
  instagram_profile: string
  soundcloud_url: string
  website_url: string
  intro_video_url: string
  audio_urls: string[]
  video_urls: string[]
  profile_image_url?: string
  cover_image_url?: string
  vorname?: string
  nachname?: string
  is_verified?: boolean
  member_since?: string
}

interface AvailabilityData {
  id: string
  date: string
  status: 'available' | 'booked' | 'pending' | 'blocked' | 'open_gig'
}

// Share icon component
function ShareIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle cx="38" cy="10" r="6" stroke="currentColor" strokeWidth="3" />
      <circle cx="10" cy="24" r="6" stroke="currentColor" strokeWidth="3" />
      <circle cx="38" cy="38" r="6" stroke="currentColor" strokeWidth="3" />
      <path d="M15 21l18-9M15 27l18 9" stroke="currentColor" strokeWidth="3" />
    </svg>
  )
}

// Sparkle/Magic icon for bio section
function SparkleIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 48 48"
      fill="currentColor"
      className={className}
    >
      <path d="M24 2l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z" />
      <path d="M10 20l2 6h6l-5 3 2 6-5-4-5 4 2-6-5-3h6z" opacity="0.6" />
      <path d="M38 28l2 6h6l-5 3 2 6-5-4-5 4 2-6-5-3h6z" opacity="0.6" />
    </svg>
  )
}

// Info row component for the profile grid
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-white/10">
      <span className="text-white/60 text-sm uppercase tracking-wide">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  )
}

// Loading skeleton for the profile page
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-bg-primary pb-24 animate-pulse">
      {/* Cover skeleton */}
      <div className="h-64 md:h-80 bg-white/10" />

      {/* Avatar and name skeleton */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/10" />
          <div className="pb-2">
            <div className="h-10 w-64 bg-white/10 rounded mb-2" />
            <div className="h-6 w-40 bg-white/10 rounded" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 rounded-lg h-64" />
            <div className="bg-white/5 rounded-lg aspect-video" />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-lg h-96" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ArtistProfilePage() {
  const { id: artistId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [artist, setArtist] = useState<ArtistData | null>(null)
  const [availability, setAvailability] = useState<AvailabilityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isEditMode] = useState(false)

  // Fetch artist data
  useEffect(() => {
    async function fetchArtist() {
      if (!artistId) {
        setError('Künstler nicht gefunden')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [artistResult, availabilityResult] = await Promise.all([
          getArtistById(artistId),
          getArtistAvailability(artistId),
        ])

        if (artistResult.error) {
          setError('Künstler konnte nicht geladen werden')
          console.error('Artist fetch error:', artistResult.error)
        } else {
          setArtist(artistResult.data as ArtistData)
        }

        if (availabilityResult.data) {
          setAvailability(availabilityResult.data as AvailabilityData[])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Ein unerwarteter Fehler ist aufgetreten')
      } finally {
        setLoading(false)
      }
    }

    fetchArtist()
  }, [artistId])

  // Calculate calendar dates from availability
  const calendarDates = useMemo(() => {
    const bookedDates: number[] = []
    const pendingDates: number[] = []
    const eventDates: number[] = []

    availability.forEach(a => {
      const day = new Date(a.date).getDate()
      if (a.status === 'booked') {
        bookedDates.push(day)
        eventDates.push(day)
      } else if (a.status === 'pending') {
        pendingDates.push(day)
      }
    })

    return { bookedDates, pendingDates, eventDates }
  }, [availability])

  // Format price display
  const priceDisplay = useMemo(() => {
    if (!artist) return { hourly: 'Auf Anfrage', flat: '' }

    const hourly = artist.preis_pro_stunde
      ? `${artist.preis_pro_stunde.toFixed(2)}€/H`
      : 'Auf Anfrage'

    const flat = artist.preis_pauschal || artist.preis_pro_veranstaltung
      ? `${(artist.preis_pauschal || artist.preis_pro_veranstaltung)?.toFixed(2)}€ PAUSCHAL`
      : ''

    return { hourly, flat }
  }, [artist])

  // Format social media display
  const socialMediaDisplay = useMemo(() => {
    if (!artist?.social_media) return ''
    return Object.keys(artist.social_media).map(k => k.toUpperCase()).join(', ')
  }, [artist])

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artist?.kuenstlername || 'Künstler',
          url: window.location.href,
        })
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('Link kopiert!')
    }
  }

  // Loading state
  if (loading) {
    return <ProfileSkeleton />
  }

  // Error state
  if (error || !artist) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-white mb-4">
          {error || 'Künstler nicht gefunden'}
        </h1>
        <Button
          variant="primary"
          onClick={() => navigate('/artists')}
        >
          Zurück zur Übersicht
        </Button>
      </div>
    )
  }

  // Default images
  const coverImage = artist.cover_image_url ||
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop'
  const avatarImage = artist.profile_image_url ||
    'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=300&h=300&fit=crop'

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      {/* Profile Header / Hero */}
      <section className="relative">
        {/* Cover Photo */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={coverImage}
            alt={`${artist.kuenstlername} cover`}
            className="w-full h-full object-cover filter grayscale"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            >
              {isFavorite ? (
                <HeartFilledIcon size={20} className="text-accent-purple" />
              ) : (
                <HeartIcon size={20} />
              )}
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label="Profil teilen"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Avatar and Name */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-16 md:-mt-20 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-bg-primary ring-2 ring-accent-purple">
                <img
                  src={avatarImage}
                  alt={artist.kuenstlername}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Camera icon for edit mode */}
              {isEditMode && (
                <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center text-white">
                  <CameraIcon size={16} />
                </button>
              )}
            </div>

            {/* Name and Role */}
            <div className="pb-2">
              <h1 className="font-display text-4xl md:text-5xl text-white">
                {artist.kuenstlername || 'Unbekannter Künstler'}
              </h1>
              <p className="text-white/80 text-lg uppercase tracking-wide mt-1">
                {artist.jobbezeichnung || 'Künstler'}
              </p>
              {artist.is_verified && (
                <span className="inline-flex items-center gap-1 text-accent-purple text-sm mt-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verifiziert
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info Grid & Video */}
          <div className="lg:col-span-2 space-y-8">
            {/* Info Grid Section */}
            <section className="bg-bg-card/30 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                  <InfoRow label="Künstlername" value={artist.kuenstlername || '-'} />
                  <InfoRow label="Genre" value={artist.genre?.join(', ') || '-'} />
                  <InfoRow label="Location" value={artist.land || 'Deutschland'} />
                  <InfoRow label="Stadt" value={artist.stadt || artist.region || '-'} />
                  <InfoRow label="Jobbezeichnung" value={artist.jobbezeichnung || '-'} />
                </div>
                <div>
                  <InfoRow label="Preis pro Stunde" value={priceDisplay.hourly} />
                  {priceDisplay.flat && <InfoRow label="Preis pauschal" value={priceDisplay.flat} />}
                  {artist.tagged_with && artist.tagged_with.length > 0 && (
                    <InfoRow label="Tags" value={artist.tagged_with.join(', ')} />
                  )}
                  {artist.technik_vorhanden && (
                    <InfoRow label="Equipment" value={artist.technik_vorhanden} />
                  )}
                  {socialMediaDisplay && (
                    <InfoRow label="Social Media" value={socialMediaDisplay} />
                  )}
                </div>
              </div>
            </section>

            {/* Video Preview Section */}
            {artist.intro_video_url && (
              <section>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-bg-card group cursor-pointer">
                  <video
                    src={artist.intro_video_url}
                    className="w-full h-full object-cover"
                    poster={coverImage}
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                    <button
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-accent-purple to-accent-red flex items-center justify-center text-white transform group-hover:scale-110 transition-transform"
                      aria-label="Video abspielen"
                    >
                      <PlayIcon size={32} className="ml-1" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Audio Section */}
            {(artist.soundcloud_url || (artist.audio_urls && artist.audio_urls.length > 0)) && (
              <section>
                <AudioPlayer
                  title="LISTEN TO ME ON SOUNDCLOUD"
                />
              </section>
            )}

            {/* Bio Section */}
            {(artist.bio || artist.something_about_me) && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <SparkleIcon className="text-white/60 w-6 h-6" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                    Something About Me
                  </h3>
                </div>
                <div className="bg-bg-card/30 rounded-lg p-6">
                  <p className="text-white/80 leading-relaxed">
                    {artist.something_about_me || artist.bio}
                  </p>
                </div>
              </section>
            )}

            {/* Instagram Section */}
            {artist.instagram_profile && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <InstagramIcon size={24} className="text-white/60" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                    See Me On Instagram
                  </h3>
                </div>
                <a
                  href={`https://instagram.com/${artist.instagram_profile.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent-purple hover:text-white transition-colors"
                >
                  @{artist.instagram_profile.replace('@', '')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </section>
            )}
          </div>

          {/* Right Column - Calendar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ArtistCalendar
                bookedDates={calendarDates.bookedDates}
                pendingDates={calendarDates.pendingDates}
                eventDates={calendarDates.eventDates}
              />

              {/* Book Now Button (Desktop - in sidebar) */}
              {artist.is_bookable && (
                <div className="hidden lg:block mt-8">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="py-4 text-base font-bold uppercase tracking-wider"
                  >
                    Anfrage Senden
                  </Button>
                  <p className="text-white/40 text-xs text-center mt-2">
                    {artist.total_bookings > 0 && (
                      <span>{artist.total_bookings} erfolgreiche Buchungen</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA Bar (Mobile) */}
      {artist.is_bookable && (
        <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur border-t border-white/10 p-4 lg:hidden z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium">{artist.kuenstlername}</p>
              <p className="text-white/60 text-sm">Ab {priceDisplay.hourly}</p>
            </div>
            <Button
              variant="primary"
              size="md"
              className="px-8 font-bold uppercase tracking-wider"
            >
              Buchen
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
