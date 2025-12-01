import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { GradientBrush } from '../ui/GradientBrush'

interface Artist {
  id: string
  name: string
  description: string
  imageUrl: string
}

// Sample artist data - replace with real data from API
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

interface ArtistCardProps {
  artist: Artist
}

function ArtistCard({ artist }: ArtistCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      to={`/artists/${artist.id}`}
      className="relative flex-shrink-0 w-[200px] md:w-[220px] aspect-square group cursor-pointer"
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
        className={`
          absolute inset-0 flex flex-col justify-end p-4
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, rgba(97, 10, 209, 0.8) 0%, rgba(97, 10, 209, 0.95) 100%)',
        }}
      >
        <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-2">
          {artist.name}
        </h4>
        <p className="text-white/80 text-xs leading-relaxed line-clamp-3">
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

export function ArtistsCarouselSection({ artists = sampleArtists, onMemberClick }: ArtistsCarouselSectionProps) {
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
      const cardWidth = 240
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="bg-bg-primary py-16 md:py-20 overflow-hidden">
      {/* Main Artists Section with B&W Background */}
      <div className="relative">
        {/* B&W Background Image - Right Side */}
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          <img
            src="/images/SW-jazmin-quaynor-8ALMAJP0Ago-unsplash.jpg"
            alt="Artist performing"
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="mb-8">
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white mb-4">
              ARTISTS
            </h2>
            <GradientBrush className="w-32 md:w-40" size="md" />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Left Content */}
            <div className="max-w-lg">
              <h3 className="text-white font-bold text-xl md:text-2xl uppercase tracking-wide mb-6">
                UPGRADE YOUR BUSINESS
              </h3>
              <p className="text-white/70 text-base leading-relaxed mb-8">
                One of the most important challenges of each artist is not only to be an
                entrepreneur, but also be an influencer, content creator and others.
                We will help you achieve your goals.
              </p>
              <Link to="/artists">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-3 tracking-wider uppercase rounded-full"
                >
                  Find Out More
                </Button>
              </Link>
            </div>
          </div>

          {/* Artist Cards Carousel */}
          <div className="relative mt-8">
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
                -translate-x-1/2
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
                translate-x-1/2
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
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 py-4"
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
        </div>
      </div>

      {/* BE A MEMBER. BE A FAN. Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-16 md:mt-20 text-center">
        <h3 className="font-display text-3xl md:text-4xl text-white mb-6">
          BE A MEMBER. BE A FAN.
        </h3>
        <p className="text-white/70 max-w-2xl mx-auto text-base leading-relaxed mb-8">
          Was gibt es besseres als etwas, das einen an gute Zeiten erinnert?
          Wenn du also ein Konzert besuchen, eine Buchung anfragst oder ein großartiges
          Künstler-Erlebnis schaffen möchtest, registriere dich jetzt!
        </p>
      </div>

      {/* VORTEILE MEMBER Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12 md:mt-16 text-center">
        <h3 className="text-white font-bold text-xl md:text-2xl uppercase tracking-wide mb-8">
          VORTEILE MEMBER
        </h3>
        <p className="text-white/70 max-w-3xl mx-auto text-sm leading-relaxed mb-4">
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
        </p>
        <p className="text-white/70 max-w-3xl mx-auto text-sm leading-relaxed mb-8">
          Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
        </p>
        <Button
          variant="outline"
          onClick={onMemberClick}
          className="border-white text-white hover:bg-white/10 px-8 py-3 tracking-wider uppercase rounded-full"
        >
          MEMBER WERDEN
        </Button>
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
