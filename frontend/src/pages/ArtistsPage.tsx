import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { updatePageMeta, pageSEO } from '../lib/seo'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { StarRating } from '../components/ui/StarRating'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { ViewToggle, type ViewMode } from '../components/ui/ViewToggle'
import { FilterBar, type FilterBarFilters } from '../components/filters'
import { ArtistMapLeaflet } from '../components/map'
import { useArtists } from '../hooks/useArtists'
import type { ArtistListItem } from '../services/artistService'
import type { ArtistLocation } from '../services/mapService'

// Location icon
function LocationIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

// Artist Card Component - adapted for Supabase data
interface ArtistCardProps {
  artist: ArtistListItem
}

function ArtistCard({ artist }: ArtistCardProps) {
  // Format price range
  const priceRange = useMemo(() => {
    if (artist.preis_pro_stunde && artist.preis_pro_veranstaltung) {
      return `€${artist.preis_pro_stunde} - €${artist.preis_pro_veranstaltung}`
    } else if (artist.preis_pro_stunde) {
      return `ab €${artist.preis_pro_stunde}/Std`
    } else if (artist.preis_pro_veranstaltung) {
      return `ab €${artist.preis_pro_veranstaltung}/Event`
    }
    return 'Preis auf Anfrage'
  }, [artist.preis_pro_stunde, artist.preis_pro_veranstaltung])

  // Default image if none provided
  const imageUrl = artist.profile_image_url ||
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop'

  return (
    <motion.div
      className="group flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {/* Image Container */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={artist.kuenstlername || 'Künstler'}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Favorite Button */}
        <FavoriteButton
          itemId={artist.id}
          type="artist"
          size="sm"
          className="absolute top-3 right-3"
        />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        {/* Name */}
        <h3 className="text-white font-bold text-lg uppercase tracking-wide">
          {artist.kuenstlername || 'Unbekannter Künstler'}
        </h3>

        {/* Role */}
        <p className="text-text-secondary text-sm uppercase tracking-wider">
          {artist.jobbezeichnung || 'Künstler'}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-text-muted text-sm">
          <LocationIcon className="w-4 h-4" />
          <span>{artist.stadt || artist.region || 'Deutschland'}</span>
        </div>

        {/* Genre */}
        {artist.genre && artist.genre.length > 0 && (
          <p className="text-text-muted text-sm">
            {artist.genre.join(', ')}
          </p>
        )}

        {/* Price Range */}
        <p className="text-text-muted text-sm">
          {priceRange}
        </p>

        {/* Rating */}
        <div className="py-1">
          <StarRating rating={artist.star_rating || 0} size="sm" />
          {artist.total_ratings > 0 && (
            <span className="text-text-muted text-xs ml-2">
              ({artist.total_ratings})
            </span>
          )}
        </div>

        {/* CTA Button */}
        <Link to={`/artists/${artist.id}`}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              className="mt-3 rounded-full border-white/30 hover:border-white/50 uppercase tracking-wider"
            >
              Profil Ansehen
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  )
}

// Loading skeleton
function ArtistCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-square mb-4 bg-white/10 rounded-lg" />
      <div className="space-y-2">
        <div className="h-5 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-10 bg-white/10 rounded-full mt-4" />
      </div>
    </div>
  )
}

export function ArtistsPage() {
  const navigate = useNavigate()

  // Use the artists hook for real data
  const {
    artists,
    loading,
    error,
    genres,
    cities,
    updateFilters,
    clearFilters,
    loadMore,
    hasMore,
  } = useArtists()

  // SEO
  useEffect(() => {
    updatePageMeta(pageSEO.artists)
  }, [])

  // View mode state (grid or map)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Local filter state for FilterBar component
  const [filterBarFilters, setFilterBarFilters] = useState<FilterBarFilters>({
    name: '',
    genre: '',
    location: '',
    radius: 50,
    category: '',
  })

  // Handle filter application
  const handleApplyFilters = () => {
    updateFilters({
      searchQuery: filterBarFilters.name || undefined,
      genre: filterBarFilters.genre || undefined,
      city: filterBarFilters.location || undefined,
    })
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilterBarFilters({
      name: '',
      genre: '',
      location: '',
      radius: 50,
      category: '',
    })
    clearFilters()
  }

  // Handle artist click from map
  const handleArtistMapClick = (artist: ArtistLocation) => {
    navigate(`/artists/${artist.id}`)
  }

  // Note: genres and cities are available from useArtists() hook
  // for future FilterBar enhancement with dynamic options
  void genres
  void cities

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920&h=600&fit=crop"
            alt="Artists background"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover grayscale"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-bg-primary" />
        </div>

        {/* Title */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-6xl md:text-7xl lg:text-8xl text-white tracking-wide"
          >
            ARTISTS
          </motion.h1>
        </div>
      </section>

      {/* Filter Bar Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="py-8 px-4 md:px-6 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            {/* View Toggle */}
            <ViewToggle
              view={viewMode}
              onViewChange={setViewMode}
            />

            {/* Results Count */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-white/60 text-sm"
            >
              {loading ? 'Laden...' : `${artists.length} Künstler gefunden`}
            </motion.p>
          </div>

          {/* Filter Bar - only show in grid view */}
          <AnimatePresence mode="wait">
            {viewMode === 'grid' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FilterBar
                  filters={filterBarFilters}
                  onFiltersChange={setFilterBarFilters}
                  onApply={handleApplyFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Content Section */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
              <p className="text-white">{error}</p>
            </div>
          )}

          {/* Animated View Transition */}
          <AnimatePresence mode="wait">
            {viewMode === 'map' ? (
              /* Map View */
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <ArtistMapLeaflet
                  userType="artist"
                  onArtistClick={handleArtistMapClick}
                  className="shadow-2xl"
                />
                <p className="text-center text-white/40 text-sm mt-4">
                  Klicke auf einen Marker, um das Künstlerprofil zu öffnen
                </p>
              </motion.div>
            ) : (
              /* Grid View */
              <motion.div
                key="grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                {/* Loading State */}
                {loading && artists.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {[...Array(6)].map((_, i) => (
                      <ArtistCardSkeleton key={i} />
                    ))}
                  </div>
                ) : artists.length > 0 ? (
                  /* Grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {artists.map((artist) => (
                      <ArtistCard
                        key={artist.id}
                        artist={artist}
                      />
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-white/60 text-lg mb-4">
                      Keine Künstler gefunden
                    </p>
                    <p className="text-white/40 text-sm mb-6">
                      Versuche andere Filtereinstellungen
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleClearFilters}
                      className="rounded-full"
                    >
                      Filter zurücksetzen
                    </Button>
                  </div>
                )}

                {/* Load More Button */}
                {hasMore && artists.length > 0 && (
                  <div className="flex justify-center mt-12">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={loadMore}
                      disabled={loading}
                      className="rounded-full px-10 uppercase tracking-wider"
                    >
                      {loading ? 'Laden...' : 'Mehr Laden'}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
