// ============================================
// VENUE SEARCH FILTERS COMPONENT
// Filters for venue search page
// ============================================

import React from 'react';
import { Search, MapPin, Users, X, SlidersHorizontal } from 'lucide-react';
import type { VenueType, PriceRange, VenueSearchParams } from '@/types/venue';
import { VENUE_TYPE_LABELS, PRICE_RANGE_LABELS } from '@/types/venue';

interface VenueSearchFiltersProps {
  filters: VenueSearchParams;
  onFilterChange: (filters: VenueSearchParams) => void;
  showMobileFilters?: boolean;
  onToggleMobileFilters?: () => void;
}

export function VenueSearchFilters({
  filters,
  onFilterChange,
  showMobileFilters = false,
  onToggleMobileFilters,
}: VenueSearchFiltersProps) {
  const updateFilter = <K extends keyof VenueSearchParams>(
    key: K,
    value: VenueSearchParams[K]
  ) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onFilterChange({ page: 1, limit: filters.limit });
  };

  const hasActiveFilters =
    filters.query ||
    filters.venue_type ||
    filters.city ||
    filters.min_capacity ||
    filters.price_range;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Location suchen..."
            value={filters.query || ''}
            onChange={(e) => updateFilter('query', e.target.value || undefined)}
            className="w-full pl-10 pr-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple/50 transition-colors"
          />
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={onToggleMobileFilters}
          className="lg:hidden p-3 bg-bg-card border border-white/10 rounded-xl hover:border-accent-purple/50 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Filters - Desktop always visible, Mobile toggleable */}
      <div className={`space-y-4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="flex flex-wrap gap-3">
          {/* Venue Type */}
          <select
            value={filters.venue_type || ''}
            onChange={(e) =>
              updateFilter('venue_type', (e.target.value as VenueType) || undefined)
            }
            className="px-4 py-2 bg-bg-card border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors"
          >
            <option value="">Alle Typen</option>
            {Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* City */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Stadt"
              value={filters.city || ''}
              onChange={(e) => updateFilter('city', e.target.value || undefined)}
              className="pl-9 pr-4 py-2 w-40 bg-bg-card border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple/50 transition-colors"
            />
          </div>

          {/* Min Capacity */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="number"
              placeholder="Min. Kapazität"
              value={filters.min_capacity || ''}
              onChange={(e) =>
                updateFilter('min_capacity', e.target.value ? Number(e.target.value) : undefined)
              }
              className="pl-9 pr-4 py-2 w-36 bg-bg-card border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple/50 transition-colors"
            />
          </div>

          {/* Price Range */}
          <select
            value={filters.price_range || ''}
            onChange={(e) =>
              updateFilter('price_range', (e.target.value as PriceRange) || undefined)
            }
            className="px-4 py-2 bg-bg-card border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors"
          >
            <option value="">Alle Preisklassen</option>
            {Object.entries(PRICE_RANGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Verified Only */}
          <label className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-white/10 rounded-lg cursor-pointer hover:border-accent-purple/50 transition-colors">
            <input
              type="checkbox"
              checked={filters.is_verified || false}
              onChange={(e) =>
                updateFilter('is_verified', e.target.checked || undefined)
              }
              className="w-4 h-4 accent-accent-purple"
            />
            <span className="text-text-secondary text-sm">Nur Verifizierte</span>
          </label>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Filter zurücksetzen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VenueSearchFilters;
