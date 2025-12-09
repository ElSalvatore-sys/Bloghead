import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

interface Artist {
  id: string
  name: string
  description: string
  imageUrl: string
}

// Sample artist data
const sampleArtists: Artist[] = [
  {
    id: '1',
    name: 'DJ MARCUS',
    description: 'dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    imageUrl: '/images/alexander-popov-f3e6YNo3Y98-unsplash.jpg',
  },
  {
    id: '2',
    name: 'LISA VOICE',
    description: 'dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    imageUrl: '/images/jazmin-quaynor-8ALMAJP0Ago-unsplash.jpg',
  },
  {
    id: '3',
    name: 'MIKE BEATS',
    description: 'dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    imageUrl: '/images/thiago-borrere-alvim-bf8APnBxoCk-unsplash.jpg',
  },
  {
    id: '4',
    name: 'ANNA STRINGS',
    description: 'dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    imageUrl: '/images/0df1b407-55a7-4251-99e9-b54723369de6.jpeg',
  },
  {
    id: '5',
    name: 'TOM WAVE',
    description: 'dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    imageUrl: '/images/curtis-potvin-XBqp-UxhCVs-unsplash.jpg',
  },
]

// Arrow icons
function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

// Artist Card with purple hover overlay
function ArtistCard({ artist }: { artist: Artist }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      to={`/artists/${artist.id}`}
      className="relative flex-shrink-0 w-[180px] md:w-[200px] aspect-square group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base Image */}
      <img
        src={artist.imageUrl}
        alt={artist.name}
        className="w-full h-full object-cover"
      />

      {/* Purple Hover Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end p-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'linear-gradient(180deg, rgba(97, 10, 209, 0.8) 0%, rgba(97, 10, 209, 0.95) 100%)',
        }}
      >
        <h4
          className="text-white font-bold text-sm uppercase tracking-wide mb-2"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {artist.name}
        </h4>
        <p
          className="text-white/80 text-xs leading-relaxed line-clamp-3"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {artist.description}
        </p>
      </div>
    </Link>
  )
}

interface ArtistsCarouselSectionProps {
  artists?: Artist[]
  onMemberClick?: () => void
}

export function ArtistsCarouselSection({ artists = sampleArtists }: ArtistsCarouselSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
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
      const scrollAmount = direction === 'left' ? -220 : 220
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="relative bg-bg-primary overflow-hidden">
      {/* Purple accent bar at top */}
      <div
        className="w-full h-2 md:h-3 relative z-20"
        style={{ backgroundColor: '#610AD1' }}
      />

      {/* Full-width Grayscale Background Image */}
      <div className="absolute inset-0 top-3">
        <img
          src="/images/latrach-med-jamil-VD0LgaqFf4U-unsplash.webp"
          alt="Artist background"
          className="w-full h-full object-cover"
          style={{ filter: 'grayscale(100%)' }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        {/* Section Title - Hyperwave italic */}
        <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-8 italic">
          Artists
        </h2>

        {/* Content: Left text, artist cards on bottom */}
        <div className="max-w-lg mb-12">
          <h3
            className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide mb-4"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Upgrade Your Business
          </h3>
          <p
            className="text-white/70 text-sm md:text-base leading-relaxed mb-6"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            One of the most important challenges of each artist is not only to be an
            entrepreneur, but also be an influencer, content creator and others.
            We will help you achieve your goals.
          </p>
          <Link to="/artists">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-3 tracking-wider uppercase rounded-full text-sm font-bold"
            >
              Find Out More
            </Button>
          </Link>
        </div>

        {/* Artist Cards Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all -translate-x-1/2 ${
              canScrollLeft ? 'text-white hover:bg-black/80 cursor-pointer' : 'text-white/30 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all translate-x-1/2 ${
              canScrollRight ? 'text-white hover:bg-black/80 cursor-pointer' : 'text-white/30 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Scrollable Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      </div>

      {/* Hide scrollbar */}
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}
