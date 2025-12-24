import { useState, useEffect, useCallback } from 'react'
import { Button } from '../components/ui/Button'
import { ServiceProviderCard, ServiceProviderCardSkeleton } from '../components/services'
import { getServiceProviders, getServiceCategories, getProviderCities } from '../services/serviceProviderService'
import type { ServiceProviderListItem, ServiceCategory } from '../services/serviceProviderService'

// Search icon
function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

// Filter icon
function FilterIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  utensils: '🍽️',
  camera: '📷',
  flower: '💐',
  speaker: '🔊',
  shield: '🛡️',
  video: '🎬',
  palette: '🎨',
  scissors: '✂️',
  sparkles: '✨',
  lightbulb: '💡',
  car: '🚗',
  star: '⭐',
  building: '🏛️',
  music: '🎵',
  disc: '💿',
}

export function ServiceProvidersPage() {
  // Data state
  const [providers, setProviders] = useState<ServiceProviderListItem[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch categories and cities on mount
  useEffect(() => {
    async function fetchFilterData() {
      const [categoriesResult, citiesResult] = await Promise.all([
        getServiceCategories(),
        getProviderCities()
      ])

      if (categoriesResult.data) {
        setCategories(categoriesResult.data as ServiceCategory[])
      }
      if (citiesResult.data) {
        setCities(citiesResult.data)
      }
    }
    fetchFilterData()
  }, [])

  // Fetch providers
  const fetchProviders = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await getServiceProviders({
      category: selectedCategory || undefined,
      city: selectedCity || undefined,
      searchQuery: searchQuery || undefined,
    })

    if (fetchError) {
      setError('Fehler beim Laden der Dienstleister')
      console.error(fetchError)
    } else {
      setProviders(data || [])
    }

    setLoading(false)
  }, [selectedCategory, selectedCity, searchQuery])

  // Fetch on mount and filter changes
  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProviders()
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedCity('')
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategory || selectedCity

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&h=600&fit=crop"
            alt="Services background"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover grayscale"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-bg-primary" />
        </div>

        {/* Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white tracking-wide mb-4">
            DIENSTLEISTER
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl">
            Finde professionelle Partner für dein Event - von Catering bis Technik
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-6 px-4 md:px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suche nach Name oder Beschreibung..."
                className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/20 rounded-full text-white placeholder-white/40 focus:outline-none focus:border-accent-purple transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-12 px-4 flex items-center gap-2 border rounded-full transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-accent-purple border-accent-purple text-white'
                  : 'bg-white/5 border-white/20 text-white/70 hover:border-white/40'
              }`}
            >
              <FilterIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-white rounded-full" />
              )}
            </button>
          </form>

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
              {/* Category Filter */}
              <div>
                <label className="block text-white/60 text-sm mb-2">Kategorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-11 px-4 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-accent-purple appearance-none cursor-pointer"
                >
                  <option value="">Alle Kategorien</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-bg-primary">
                      {cat.icon && CATEGORY_ICONS[cat.icon]} {cat.name_de}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-white/60 text-sm mb-2">Stadt</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full h-11 px-4 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-accent-purple appearance-none cursor-pointer"
                >
                  <option value="">Alle Städte</option>
                  {cities.map((city) => (
                    <option key={city} value={city} className="bg-bg-primary">
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                  className="rounded-full w-full sm:w-auto"
                >
                  Filter zurücksetzen
                </Button>
              </div>
            </div>
          )}

          {/* Category Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-accent-purple text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Alle
            </button>
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-accent-purple text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {cat.icon && <span>{CATEGORY_ICONS[cat.icon]}</span>}
                {cat.name_de}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Providers Grid Section */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
              <p className="text-white">{error}</p>
            </div>
          )}

          {/* Results Count */}
          <p className="text-text-muted text-sm mb-8">
            {loading ? 'Laden...' : `${providers.length} Dienstleister gefunden`}
          </p>

          {/* Loading State */}
          {loading && providers.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {[...Array(8)].map((_, i) => (
                <ServiceProviderCardSkeleton key={i} />
              ))}
            </div>
          ) : providers.length > 0 ? (
            /* Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {providers.map((provider) => (
                <ServiceProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <p className="text-text-muted text-lg mb-4">
                Keine Dienstleister gefunden
              </p>
              <p className="text-text-disabled text-sm mb-6">
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
        </div>
      </section>
    </div>
  )
}
