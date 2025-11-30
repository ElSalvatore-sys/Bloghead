import { useState, useMemo } from 'react'
import { Button } from '../components/ui/Button'
import { StarRating } from '../components/ui/StarRating'
import { FilterBar, type FilterBarFilters } from '../components/filters'

// Heart icon for favorite button
function HeartIcon({ className = '', filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

// Location icon
function LocationIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

// Artist interface with extended properties
interface Artist {
  id: string
  name: string
  role: string
  genre: string
  location: string
  imageUrl: string
  rating: number
  priceRange: string
  isFavorite: boolean
}

// Mock data for 12 artists with German names/locations
const mockArtists: Artist[] = [
  {
    id: '1',
    name: 'SHANNON CUOMO',
    role: 'DJ, Sänger, Performer',
    genre: 'Electronic',
    location: 'Wiesbaden',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    rating: 5,
    priceRange: '€2.500 bis €3.500',
    isFavorite: false,
  },
  {
    id: '2',
    name: 'MAXIMILIAN BERG',
    role: 'DJ, Produzent',
    genre: 'Hip Hop',
    location: 'Frankfurt am Main',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    rating: 4,
    priceRange: '€1.500 bis €2.500',
    isFavorite: true,
  },
  {
    id: '3',
    name: 'LISA HARTMANN',
    role: 'Sängerin, Songwriter',
    genre: "R'n'B",
    location: 'Hamburg',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
    rating: 5,
    priceRange: '€3.000 bis €5.000',
    isFavorite: false,
  },
  {
    id: '4',
    name: 'FELIX WAGNER',
    role: 'Rapper, Performer',
    genre: 'Hip Hop',
    location: 'Berlin',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
    rating: 4,
    priceRange: '€2.000 bis €4.000',
    isFavorite: false,
  },
  {
    id: '5',
    name: 'ANNA SCHNEIDER',
    role: 'DJ, Musikerin',
    genre: 'Electronic',
    location: 'München',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    rating: 5,
    priceRange: '€1.800 bis €3.000',
    isFavorite: false,
  },
  {
    id: '6',
    name: 'TOBIAS MÜLLER',
    role: 'Sänger, Moderator',
    genre: 'Pop',
    location: 'Köln',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop',
    rating: 4,
    priceRange: '€1.500 bis €2.800',
    isFavorite: true,
  },
  {
    id: '7',
    name: 'SARAH WEBER',
    role: 'Band, Live-Act',
    genre: 'Rock',
    location: 'Stuttgart',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    rating: 5,
    priceRange: '€4.000 bis €6.000',
    isFavorite: false,
  },
  {
    id: '8',
    name: 'JULIAN KOCH',
    role: 'DJ, Produzent',
    genre: 'Electronic',
    location: 'Düsseldorf',
    imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop',
    rating: 4,
    priceRange: '€1.200 bis €2.000',
    isFavorite: false,
  },
  {
    id: '9',
    name: 'MARIE HOFFMANN',
    role: 'Sängerin, Performer',
    genre: 'Jazz',
    location: 'Leipzig',
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    rating: 5,
    priceRange: '€2.500 bis €4.500',
    isFavorite: false,
  },
  {
    id: '10',
    name: 'DAVID RICHTER',
    role: 'Rapper, Songwriter',
    genre: 'Hip Hop',
    location: 'Hannover',
    imageUrl: 'https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=400&h=400&fit=crop',
    rating: 4,
    priceRange: '€1.800 bis €3.200',
    isFavorite: false,
  },
  {
    id: '11',
    name: 'EMMA BECKER',
    role: 'DJ, Live-Act',
    genre: 'Electronic',
    location: 'Nürnberg',
    imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
    rating: 5,
    priceRange: '€2.000 bis €3.500',
    isFavorite: true,
  },
  {
    id: '12',
    name: 'LUKAS BRAUN',
    role: 'Sänger, Musiker',
    genre: 'Pop',
    location: 'Dresden',
    imageUrl: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=400&h=400&fit=crop',
    rating: 4,
    priceRange: '€1.500 bis €2.500',
    isFavorite: false,
  },
]

// Artist Card Component
interface ArtistCardProps {
  artist: Artist
  onFavoriteToggle: (id: string) => void
}

function ArtistCard({ artist, onFavoriteToggle }: ArtistCardProps) {
  return (
    <div className="group flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-square mb-4 overflow-hidden">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Favorite Button */}
        <button
          onClick={() => onFavoriteToggle(artist.id)}
          className={`
            absolute top-3 right-3 w-8 h-8 flex items-center justify-center
            transition-colors duration-200
            ${artist.isFavorite ? 'text-accent-purple' : 'text-white/70 hover:text-accent-purple'}
          `}
          aria-label={artist.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <HeartIcon className="w-6 h-6" filled={artist.isFavorite} />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        {/* Name */}
        <h3 className="text-white font-bold text-lg uppercase tracking-wide">
          {artist.name}
        </h3>

        {/* Role */}
        <p className="text-text-secondary text-sm uppercase tracking-wider">
          {artist.role}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-text-muted text-sm">
          <LocationIcon className="w-4 h-4" />
          <span>{artist.location}</span>
        </div>

        {/* Genre */}
        <p className="text-text-muted text-sm">
          {artist.genre}
        </p>

        {/* Price Range */}
        <p className="text-text-muted text-sm">
          {artist.priceRange}
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
          className="mt-3 rounded-full border-white/30 hover:border-white/50 uppercase tracking-wider"
        >
          Profil Ansehen
        </Button>
      </div>
    </div>
  )
}

// Pagination
const ITEMS_PER_PAGE = 9

export function ArtistsPage() {
  // Filter state
  const [filters, setFilters] = useState<FilterBarFilters>({
    name: '',
    genre: '',
    location: '',
    radius: 50,
    category: '',
  })

  // Artists state with favorites
  const [artists, setArtists] = useState<Artist[]>(mockArtists)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // Apply filters
  const filteredArtists = useMemo(() => {
    return artists.filter((artist) => {
      // Name filter
      if (filters.name && !artist.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false
      }

      // Genre filter
      if (filters.genre) {
        const genreMap: Record<string, string[]> = {
          'hip-hop': ['Hip Hop'],
          'rnb': ["R'n'B"],
          'electronic': ['Electronic'],
          'pop': ['Pop'],
          'rock': ['Rock'],
          'jazz': ['Jazz'],
        }
        const matchingGenres = genreMap[filters.genre] || []
        if (!matchingGenres.some((g) => artist.genre.includes(g))) {
          return false
        }
      }

      // Location filter (simple text match for now)
      if (filters.location && !artist.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }

      // Category filter
      if (filters.category) {
        const categoryMap: Record<string, string[]> = {
          'dj': ['DJ'],
          'singer': ['Sänger', 'Sängerin'],
          'band': ['Band'],
          'rapper': ['Rapper'],
          'musician': ['Musiker', 'Musikerin'],
          'producer': ['Produzent'],
        }
        const matchingCategories = categoryMap[filters.category] || []
        if (!matchingCategories.some((c) => artist.role.includes(c))) {
          return false
        }
      }

      return true
    })
  }, [artists, filters])

  // Paginated artists
  const paginatedArtists = useMemo(() => {
    const startIndex = 0
    const endIndex = currentPage * ITEMS_PER_PAGE
    return filteredArtists.slice(startIndex, endIndex)
  }, [filteredArtists, currentPage])

  const hasMore = paginatedArtists.length < filteredArtists.length

  // Handlers
  const handleApplyFilters = () => {
    setCurrentPage(1)
  }

  const handleFavoriteToggle = (id: string) => {
    setArtists((prev) =>
      prev.map((artist) =>
        artist.id === id ? { ...artist, isFavorite: !artist.isFavorite } : artist
      )
    )
  }

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920&h=600&fit=crop"
            alt="Artists background"
            className="w-full h-full object-cover grayscale"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-bg-primary" />
        </div>

        {/* Title */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-white tracking-wide">
            ARTISTS
          </h1>
        </div>
      </section>

      {/* Filter Bar Section */}
      <section className="py-8 px-4 md:px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilters}
          />
        </div>
      </section>

      {/* Artists Grid Section */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Results Count */}
          <p className="text-text-muted text-sm mb-8">
            {filteredArtists.length} {filteredArtists.length === 1 ? 'Künstler' : 'Künstler'} gefunden
          </p>

          {/* Grid */}
          {filteredArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {paginatedArtists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-text-muted text-lg mb-4">
                Keine Künstler gefunden
              </p>
              <p className="text-text-disabled text-sm mb-6">
                Versuche andere Filtereinstellungen
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ name: '', genre: '', location: '', radius: 50, category: '' })}
                className="rounded-full"
              >
                Filter zurücksetzen
              </Button>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-12">
              <Button
                variant="primary"
                size="lg"
                onClick={handleLoadMore}
                className="rounded-full px-10 uppercase tracking-wider"
              >
                Mehr Laden
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
