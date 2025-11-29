import { useRef, useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { StarRating } from '../ui/StarRating'
import { GradientBrush } from '../ui/GradientBrush'

interface Artist {
  id: string
  name: string
  role: string
  imageUrl: string
  rating: number
}

// Sample artist data - replace with real data from API
const sampleArtists: Artist[] = [
  {
    id: '1',
    name: 'DJ MARCUS',
    role: 'ELECTRONIC DJ',
    imageUrl: '',
    rating: 5,
  },
  {
    id: '2',
    name: 'LISA VOICE',
    role: 'SINGER',
    imageUrl: '',
    rating: 4,
  },
  {
    id: '3',
    name: 'MIKE BEATS',
    role: 'HIP-HOP PRODUCER',
    imageUrl: '',
    rating: 5,
  },
  {
    id: '4',
    name: 'ANNA STRINGS',
    role: 'VIOLINIST',
    imageUrl: '',
    rating: 4,
  },
  {
    id: '5',
    name: 'TOM WAVE',
    role: 'TECHNO DJ',
    imageUrl: '',
    rating: 5,
  },
  {
    id: '6',
    name: 'SARAH SOUL',
    role: 'JAZZ SINGER',
    imageUrl: '',
    rating: 4,
  },
]

// Arrow icons
function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

// Heart icon for favorite button
function HeartIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

interface ArtistCardProps {
  artist: Artist
}

function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <div className="flex-shrink-0 w-[260px] md:w-[280px] group">
      {/* Image Container */}
      <div className="relative aspect-square mb-4 overflow-hidden">
        {/* Placeholder or actual image */}
        {artist.imageUrl ? (
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-bg-card flex items-center justify-center">
            <div className="text-text-muted text-6xl opacity-30">
              <svg viewBox="0 0 48 48" className="w-24 h-24" fill="currentColor">
                <path d="M24.7,23.9c5.6,0,10.1-4.4,10.1-10.1S30.3,3.7,24.7,3.7S14.6,8.2,14.6,13.8S19.1,23.9,24.7,23.9z M24.7,6.5c4,0,7.2,3.1,7.2,7.2S28.8,21,24.7,21s-7.2-3.1-7.2-7.2S20.7,6.5,24.7,6.5z M26.2,26.8h-2.9c-8.8,0-15.9,7.1-15.9,15.8C7.4,43.4,8,44,8.9,44h31.7c0.9,0,1.5-0.6,1.5-1.5C42,33.8,34.9,26.8,26.2,26.8z" />
              </svg>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/70 hover:text-accent-purple transition-colors"
          aria-label="Add to favorites"
        >
          <HeartIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Name */}
        <h3 className="text-white font-bold text-lg uppercase tracking-wide">
          {artist.name}
        </h3>

        {/* Role */}
        <p className="text-text-secondary text-sm uppercase tracking-wider">
          {artist.role}
        </p>

        {/* Rating */}
        <div className="py-1">
          <StarRating rating={artist.rating} size="sm" />
        </div>

        {/* CTA Button */}
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          className="mt-4 rounded-full border-white/30 hover:border-white/50"
        >
          PROFIL ANSEHEN
        </Button>
      </div>
    </div>
  )
}

interface ArtistsCarouselSectionProps {
  artists?: Artist[]
}

export function ArtistsCarouselSection({ artists = sampleArtists }: ArtistsCarouselSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      )
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      checkScrollButtons()
      container.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)

      return () => {
        container.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (container) {
      const cardWidth = 300 // Approximate card width + gap
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="bg-bg-primary py-16 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            ARTISTS
          </h2>
          <div className="flex justify-center">
            <GradientBrush className="w-32 md:w-40" size="md" />
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 md:w-12 md:h-12 rounded-full
              bg-bg-card/80 backdrop-blur-sm
              flex items-center justify-center
              transition-all duration-200
              -translate-x-1/2 md:-translate-x-0
              ${canScrollLeft
                ? 'text-white hover:bg-bg-card-hover cursor-pointer'
                : 'text-text-disabled cursor-not-allowed opacity-50'
              }
            `}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`
              absolute right-0 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 md:w-12 md:h-12 rounded-full
              bg-bg-card/80 backdrop-blur-sm
              flex items-center justify-center
              transition-all duration-200
              translate-x-1/2 md:translate-x-0
              ${canScrollRight
                ? 'text-white hover:bg-bg-card-hover cursor-pointer'
                : 'text-text-disabled cursor-not-allowed opacity-50'
              }
            `}
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Scrollable Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-2 md:px-8 py-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-10 md:mt-12">
          <Button variant="primary" size="md" className="rounded-full px-8">
            ALLE ARTISTS ANSEHEN
          </Button>
        </div>
      </div>

      {/* Hide scrollbar globally for this component */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
