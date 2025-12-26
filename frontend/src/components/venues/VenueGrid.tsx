// ============================================
// VENUE GRID COMPONENT
// Responsive grid for venue listings
// ============================================

import React from 'react';
import { VenueCard } from './VenueCard';
import type { Venue, VenueCardData } from '@/types/venue';

interface VenueGridProps {
  venues: (Venue | VenueCardData)[];
  onFavoriteToggle?: (venueId: string) => void;
  favoritedIds?: Set<string>;
  showFavoriteButton?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function VenueGrid({
  venues,
  onFavoriteToggle,
  favoritedIds = new Set(),
  showFavoriteButton = true,
  emptyMessage = 'Keine Locations gefunden',
  isLoading = false,
}: VenueGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <VenueCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {venues.map((venue) => (
        <VenueCard
          key={venue.id}
          venue={venue}
          onFavoriteToggle={onFavoriteToggle}
          isFavorited={favoritedIds.has(venue.id)}
          showFavoriteButton={showFavoriteButton}
        />
      ))}
    </div>
  );
}

// Skeleton for loading state
function VenueCardSkeleton() {
  return (
    <div className="bg-bg-card rounded-xl overflow-hidden border border-white/5 animate-pulse">
      <div className="aspect-[16/10] bg-bg-secondary" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-bg-secondary rounded w-3/4" />
        <div className="h-4 bg-bg-secondary rounded w-1/2" />
        <div className="flex gap-4">
          <div className="h-4 bg-bg-secondary rounded w-20" />
          <div className="h-4 bg-bg-secondary rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export default VenueGrid;
