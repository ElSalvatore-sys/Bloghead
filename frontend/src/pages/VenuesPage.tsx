// ============================================
// VENUES PAGE - Search & Listing
// Main page for browsing and searching venues
// ============================================

import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { updatePageMeta, pageSEO } from '../lib/seo';
import { motion } from 'framer-motion';
import { MapPin, AlertCircle, Grid3X3, Map } from 'lucide-react';
import {
  VenueSearchFilters,
  VenueGrid,
} from '../components/venues';

// Lazy load the map component
const VenueMapView = lazy(() => import('../components/venues').then(m => ({ default: m.VenueMapView })));
import {
  searchVenues,
  toggleVenueFavorite,
  getMyFavoriteVenues,
} from '../services/venueService';
import type {
  VenueSearchParams,
  VenueSearchResult,
  VenueCardData,
} from '../types/venue';
import { useAuth } from '../contexts/AuthContext';

export function VenuesPage() {
  // SEO
  useEffect(() => {
    updatePageMeta(pageSEO.venues);
  }, []);

  const { user } = useAuth();

  // Search and filter state
  const [filters, setFilters] = useState<VenueSearchParams>({
    page: 1,
    limit: 12,
  });

  // Data state
  const [venues, setVenues] = useState<VenueCardData[]>([]);
  const [searchResult, setSearchResult] = useState<VenueSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Favorites state
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Mobile filter visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // View mode (grid or map)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Load favorites on mount
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const favoriteVenues = await getMyFavoriteVenues();
      const ids = new Set(favoriteVenues.map((v) => v.venue_id));
      setFavoritedIds(ids);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Load venues based on filters
  useEffect(() => {
    loadVenues();
  }, [filters]);

  const loadVenues = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await searchVenues(filters);
      setSearchResult(result);
      setVenues(result.venues);
    } catch (err) {
      console.error('Failed to load venues:', err);
      setError('Fehler beim Laden der Locations. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: VenueSearchParams) => {
    setFilters(newFilters);
  }, []);

  // Handle favorite toggle
  const handleFavoriteToggle = async (venueId: string) => {
    if (!user) {
      // TODO: Show login modal
      alert('Bitte melden Sie sich an, um Favoriten zu speichern.');
      return;
    }

    try {
      const isFavorited = await toggleVenueFavorite(venueId);

      setFavoritedIds((prev) => {
        const newSet = new Set(prev);
        if (isFavorited) {
          newSet.add(venueId);
        } else {
          newSet.delete(venueId);
        }
        return newSet;
      });
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      alert('Fehler beim Speichern des Favoriten.');
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-accent-purple/10 to-bg-secondary py-16 md:py-24 border-b border-white/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-purple/10 rounded-full mb-6">
              <MapPin className="w-5 h-5 text-accent-purple" />
              <span className="text-accent-purple font-medium">Locations entdecken</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              Finde die perfekte Location
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
              Entdecke Clubs, Bars, Konzerthallen und weitere Veranstaltungsorte in Deutschland
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            <VenueSearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              showMobileFilters={showMobileFilters}
              onToggleMobileFilters={toggleMobileFilters}
            />
          </motion.div>

          {/* Results Summary & View Toggle */}
          {searchResult && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex items-center justify-between"
            >
              <p className="text-text-secondary">
                {searchResult.total} Location{searchResult.total !== 1 ? 's' : ''} gefunden
              </p>

              <div className="flex items-center gap-4">
                {searchResult.page && searchResult.total > 0 && (
                  <p className="text-text-muted text-sm hidden md:block">
                    Seite {searchResult.page} von {Math.ceil(searchResult.total / filters.limit)}
                  </p>
                )}

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-bg-card border border-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-accent-purple text-white'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    title="Gitteransicht"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Gitter</span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      viewMode === 'map'
                        ? 'bg-accent-purple text-white'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    title="Kartenansicht"
                  >
                    <Map className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Karte</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-red-500 font-semibold mb-1">Fehler</h3>
                  <p className="text-text-secondary text-sm">{error}</p>
                  <button
                    onClick={loadVenues}
                    className="mt-3 text-accent-purple hover:text-accent-purple/80 text-sm font-medium transition-colors"
                  >
                    Erneut versuchen
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Venues Grid or Map */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {viewMode === 'grid' ? (
              <VenueGrid
                venues={venues}
                onFavoriteToggle={handleFavoriteToggle}
                favoritedIds={favoritedIds}
                isLoading={isLoading}
              />
            ) : (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-[600px] bg-bg-card rounded-xl">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-white/20 border-t-accent-purple rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-text-secondary">Karte wird geladen...</p>
                    </div>
                  </div>
                }
              >
                <VenueMapView
                  venues={venues}
                  height="600px"
                  showControls={true}
                />
              </Suspense>
            )}
          </motion.div>

          {/* Pagination */}
          {searchResult && searchResult.has_more && !isLoading && venues.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 flex justify-center gap-2"
            >
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-bg-card border border-white/10 rounded-lg text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent-purple/50 transition-colors"
              >
                Zurück
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, Math.ceil(searchResult.total / filters.limit)) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          filters.page === pageNum
                            ? 'bg-accent-purple text-white'
                            : 'bg-bg-card border border-white/10 text-text-secondary hover:border-accent-purple/50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={!searchResult.has_more}
                className="px-4 py-2 bg-bg-card border border-white/10 rounded-lg text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent-purple/50 transition-colors"
              >
                Weiter
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

export default VenuesPage;
