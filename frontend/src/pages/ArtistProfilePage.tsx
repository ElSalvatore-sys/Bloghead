import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '../components/ui'
import { ArtistCalendar, AudioPlayer } from '../components/artist'
import {
  InstagramIcon,
  PlayIcon,
  CameraIcon,
  HeartIcon,
  HeartFilledIcon,
} from '../components/icons'

// Mock artist data
const mockArtist = {
  id: '1',
  name: 'SHANNON CUOMO',
  displayName: 'Hyperwave One',
  role: 'DJ, Singer, Performer',
  coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop',
  avatarImage: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=300&h=300&fit=crop',
  info: {
    kuenstlername: 'DJ SHANNON',
    genre: 'HIP HOP / R\'N\'B / 70-90ER',
    location: 'DEUTSCHLAND',
    city: 'WIESBADEN',
    jobbezeichnung: 'DJ / MUSIKER',
    preisProStunde: '100,00€/H',
    preisPauschal: '350,00€ PAUSCHAL',
    bestWith: 'INARA / VALENTINO / DJ ALEX',
    idNr: 'BH-2024-0042',
    socialMedia: 'YOUTUBE, INSTAGRAM',
    equipment: 'INKL. SOUND-ANLAGE',
    status: 'AKTIV',
  },
  bio: 'Hier sollte etwas über den Künstler stehen. Bühne/Feste/Party/Musik. Coole Facts. Was kann ich bieten. Was mache ich am liebsten. Mit über 10 Jahren Erfahrung in der Musikbranche bringe ich jeden Event zum Leben. Meine Spezialität sind Hip-Hop und R\'n\'B Events, aber ich bin flexibel und passe mich jedem Publikum an.',
  videoThumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
  instagramImages: [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1501612780327-45045538702b?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop',
  ],
  calendar: {
    bookedDates: [5, 6, 12, 13, 19, 20, 26, 27],
    pendingDates: [8, 15],
    eventDates: [12, 19, 26],
  },
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

export function ArtistProfilePage() {
  const { id: _artistId } = useParams<{ id: string }>()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isEditMode] = useState(false) // For future edit mode toggle

  // In a real app, fetch artist data based on ID (_artistId)
  const artist = mockArtist

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      {/* Profile Header / Hero */}
      <section className="relative">
        {/* Cover Photo */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={artist.coverImage}
            alt={`${artist.name} cover`}
            className="w-full h-full object-cover filter grayscale"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? (
                <HeartFilledIcon size={20} className="text-accent-purple" />
              ) : (
                <HeartIcon size={20} />
              )}
            </button>
            <button
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label="Share profile"
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
                  src={artist.avatarImage}
                  alt={artist.name}
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
                {artist.displayName}
              </h1>
              <p className="text-white/80 text-lg uppercase tracking-wide mt-1">
                {artist.role}
              </p>
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
                  <InfoRow label="Künstlername" value={artist.info.kuenstlername} />
                  <InfoRow label="Genre" value={artist.info.genre} />
                  <InfoRow label="Location" value={artist.info.location} />
                  <InfoRow label="Stadt" value={artist.info.city} />
                  <InfoRow label="Jobbezeichnung" value={artist.info.jobbezeichnung} />
                </div>
                <div>
                  <InfoRow label="Preis pro Stunde" value={artist.info.preisProStunde} />
                  <InfoRow label="Preis pauschal" value={artist.info.preisPauschal} />
                  <InfoRow label="Best With" value={artist.info.bestWith} />
                  <InfoRow label="Equipment" value={artist.info.equipment} />
                  <InfoRow label="Social Media" value={artist.info.socialMedia} />
                </div>
              </div>
            </section>

            {/* Video Preview Section */}
            <section>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-bg-card group cursor-pointer">
                <img
                  src={artist.videoThumbnail}
                  alt="Video preview"
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                  <button
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-accent-purple to-accent-red flex items-center justify-center text-white transform group-hover:scale-110 transition-transform"
                    aria-label="Play video"
                  >
                    <PlayIcon size={32} className="ml-1" />
                  </button>
                </div>
              </div>
            </section>

            {/* Audio Section */}
            <section>
              <AudioPlayer title="LISTEN TO ME ON SOUNDCLOUD" />
            </section>

            {/* Bio Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <SparkleIcon className="text-white/60 w-6 h-6" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                  Something About Me
                </h3>
              </div>
              <div className="bg-bg-card/30 rounded-lg p-6">
                <p className="text-white/80 leading-relaxed">
                  {artist.bio}
                </p>
              </div>
            </section>

            {/* Instagram Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <InstagramIcon size={24} className="text-white/60" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                  See Me On Instagram
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {artist.instagramImages.map((image, index) => (
                  <a
                    key={index}
                    href="#"
                    className="aspect-square rounded overflow-hidden group"
                  >
                    <img
                      src={image}
                      alt={`Instagram post ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </a>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Calendar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ArtistCalendar
                bookedDates={artist.calendar.bookedDates}
                pendingDates={artist.calendar.pendingDates}
                eventDates={artist.calendar.eventDates}
              />

              {/* Book Now Button (Desktop - in sidebar) */}
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
                  oder rufen Sie an: +49 123 456 789
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur border-t border-white/10 p-4 lg:hidden z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-medium">{artist.name}</p>
            <p className="text-white/60 text-sm">Ab {artist.info.preisProStunde}</p>
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
    </div>
  )
}
