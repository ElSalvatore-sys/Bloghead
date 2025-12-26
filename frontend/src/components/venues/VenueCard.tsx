// ============================================
// VENUE CARD COMPONENT
// For venue listings and search results
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Star, CheckCircle, Heart } from 'lucide-react';
import type { Venue, VenueCardData } from '@/types/venue';
import { VENUE_TYPE_LABELS } from '@/types/venue';

interface VenueCardProps {
  venue: Venue | VenueCardData;
  onFavoriteToggle?: (venueId: string) => void;
  isFavorited?: boolean;
  showFavoriteButton?: boolean;
}

export const VenueCard = React.memo(function VenueCard({
  venue,
  onFavoriteToggle,
  isFavorited = false,
  showFavoriteButton = true,
}: VenueCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(venue.id);
  };

  return (
    <Link
      to={`/venues/${venue.slug}`}
      className="group block bg-bg-card rounded-xl overflow-hidden border border-white/5 hover:border-accent-purple/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent-purple/10"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {venue.cover_image ? (
          <img
            src={venue.cover_image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
            <MapPin className="w-12 h-12 text-text-muted" />
          </div>
        )}

        {/* Verified Badge */}
        {venue.is_verified && (
          <div className="absolute top-3 left-3 bg-accent-purple/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-white" />
            <span className="text-xs text-white font-medium">Verifiziert</span>
          </div>
        )}

        {/* Venue Type Badge */}
        {venue.venue_type && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-xs text-white">
              {VENUE_TYPE_LABELS[venue.venue_type]}
            </span>
          </div>
        )}

        {/* Favorite Button */}
        {showFavoriteButton && (
          <button
            onClick={handleFavoriteClick}
            className="absolute bottom-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors"
            aria-label={isFavorited ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name & Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-text-primary group-hover:text-accent-purple transition-colors line-clamp-1">
            {venue.name}
          </h3>
          {'rating' in venue && venue.rating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-text-primary">
                {typeof venue.rating === 'number' ? venue.rating.toFixed(1) : venue.rating}
              </span>
            </div>
          )}
        </div>

        {/* Tagline */}
        {venue.tagline && (
          <p className="text-sm text-text-secondary line-clamp-1 mb-3">
            {venue.tagline}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-text-muted">
          {/* Location */}
          {venue.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{venue.city}</span>
            </div>
          )}

          {/* Capacity */}
          {venue.capacity_max && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>bis {venue.capacity_max}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

export default VenueCard;
