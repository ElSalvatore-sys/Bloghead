// ============================================
// VENUE MAP VIEW - Leaflet Interactive Map
// ============================================

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Venue, VenueCardData } from '@/types/venue';
import { VENUE_TYPE_LABELS } from '@/types/venue';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create custom purple venue marker
function createVenueIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-venue-marker',
    html: `
      <div class="marker-inner" style="
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26],
  });
}

// Component to fit bounds to all markers
function FitBounds({ venues }: { venues: Array<{ latitude?: number; longitude?: number }> }) {
  const map = useMap();

  useEffect(() => {
    if (venues.length > 1) {
      const bounds = L.latLngBounds(
        venues.map(v => [v.latitude!, v.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    }
  }, [map, venues]);

  return null;
}

// Popup content component
function VenuePopupContent({ venue }: { venue: Venue | VenueCardData }) {
  const imageUrl = venue.cover_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(venue.name)}&background=7C3AED&color=fff&size=400`;

  const venueTypeLabel = venue.venue_type ? VENUE_TYPE_LABELS[venue.venue_type] : 'Location';
  const rating = 'rating' in venue && typeof venue.rating === 'number' ? venue.rating : undefined;
  const totalReviews = 'total_reviews' in venue ? venue.total_reviews : undefined;
  const capacity = venue.capacity_max;

  return (
    <div className="popup-content">
      <div className="popup-card">
        {/* Cover Image */}
        <div className="popup-image-wrap">
          <img
            src={imageUrl}
            alt={venue.name}
            className="popup-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(venue.name)}&background=7C3AED&color=fff&size=400`;
            }}
          />
          {venue.is_verified && (
            <div className="popup-verified-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Verifiziert</span>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="popup-info">
          {/* Name */}
          <h3 className="popup-name">{venue.name}</h3>

          {/* Tagline */}
          {venue.tagline && (
            <p className="popup-tagline">{venue.tagline}</p>
          )}

          {/* Type and City */}
          <div className="popup-meta">
            <span className="popup-type">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              {venueTypeLabel}
            </span>
            {venue.city && (
              <span className="popup-city">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {venue.city}
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="popup-stats">
            {capacity && (
              <div className="popup-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>bis {capacity} Personen</span>
              </div>
            )}
            {rating !== undefined && totalReviews !== undefined && (
              <div className="popup-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>{rating.toFixed(1)} ({totalReviews})</span>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="popup-divider" />

        {/* CTA Button */}
        <Link to={`/venues/${venue.slug}`} className="popup-cta">
          <span>Location ansehen</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

// Props interface
export interface VenueMapViewProps {
  venues: (Venue | VenueCardData)[];
  selectedVenueId?: string;
  onVenueSelect?: (venueId: string) => void;
  height?: string;
  showControls?: boolean;
}

export function VenueMapView({
  venues,
  selectedVenueId,
  onVenueSelect,
  height = '600px',
  showControls = true
}: VenueMapViewProps) {
  // Filter venues with valid coordinates
  const mappableVenues = useMemo(
    () => venues.filter((v) => v.latitude && v.longitude),
    [venues]
  );

  // Suppress unused var warnings
  void selectedVenueId;
  void onVenueSelect;

  // Default center: Germany (Frankfurt)
  const defaultCenter: [number, number] = [51.1657, 10.4515];
  const defaultZoom = 6;

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ height }}>
      {/* Venue count badge */}
      {showControls && (
        <div className="absolute top-4 left-4 z-[1000]">
          <div className="px-4 py-2 bg-bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg">
            <p className="text-sm text-white/60">
              <MapPin className="w-4 h-4 inline mr-1" />
              {mappableVenues.length} Location{mappableVenues.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        style={{ background: '#1a1a2e' }}
        zoomControl={true}
        attributionControl={true}
      >
        {/* Dark CARTO tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Fit bounds to markers */}
        {mappableVenues.length > 0 && <FitBounds venues={mappableVenues} />}

        {/* Venue markers */}
        {mappableVenues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitude!, venue.longitude!]}
            icon={createVenueIcon()}
          >
            <Popup>
              <VenuePopupContent venue={venue} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Custom Leaflet styles */}
      <style>{`
        /* ═══════════════════════════════════════════════════════════════
           GLASSMORPHISM POPUP - SHADCN INSPIRED
        ═══════════════════════════════════════════════════════════════ */

        .leaflet-popup-content-wrapper {
          padding: 0 !important;
          background: rgba(15, 23, 42, 0.92) !important;
          backdrop-filter: blur(16px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 16px !important;
          box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset !important;
          overflow: hidden;
        }

        .leaflet-popup-content {
          margin: 0 !important;
          width: 320px !important;
        }

        .leaflet-popup-tip-container {
          display: none !important;
        }

        .leaflet-popup-close-button {
          color: rgba(255, 255, 255, 0.7) !important;
          font-size: 18px !important;
          font-weight: 300 !important;
          top: 10px !important;
          right: 10px !important;
          width: 28px !important;
          height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: rgba(255, 255, 255, 0.08) !important;
          border-radius: 50% !important;
          transition: all 0.2s ease !important;
          z-index: 10;
        }
        .leaflet-popup-close-button:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.15) !important;
          transform: scale(1.1);
        }

        /* ═══════════════════════════════════════════════════════════════
           POPUP CARD CONTENT
        ═══════════════════════════════════════════════════════════════ */

        .popup-content {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .popup-card {
          overflow: hidden;
        }

        /* Cover Image */
        .popup-image-wrap {
          position: relative;
          width: 100%;
          height: 160px;
          overflow: hidden;
        }

        .popup-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .popup-verified-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: rgba(34, 197, 94, 0.95);
          backdrop-filter: blur(8px);
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        /* Info section */
        .popup-info {
          padding: 16px 20px;
        }

        .popup-name {
          font-size: 18px !important;
          font-weight: 700 !important;
          color: white !important;
          margin: 0 0 6px 0 !important;
          line-height: 1.3 !important;
        }

        .popup-tagline {
          font-size: 13px !important;
          color: rgba(255, 255, 255, 0.5) !important;
          margin: 0 0 12px 0 !important;
          line-height: 1.4 !important;
        }

        .popup-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .popup-type,
        .popup-city {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px !important;
          color: rgba(255, 255, 255, 0.6) !important;
        }

        .popup-type svg,
        .popup-city svg {
          flex-shrink: 0;
          opacity: 0.7;
        }

        .popup-stats {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .popup-stat {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px !important;
          color: rgba(255, 255, 255, 0.55) !important;
        }

        .popup-stat svg {
          flex-shrink: 0;
          color: rgba(124, 58, 237, 0.8);
        }

        /* Divider */
        .popup-divider {
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.1) 80%,
            transparent 100%
          );
          margin: 0;
        }

        /* CTA Button */
        .popup-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
          color: white;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .popup-cta:hover {
          filter: brightness(1.1);
        }

        .popup-cta svg {
          transition: transform 0.2s ease;
        }

        .popup-cta:hover svg {
          transform: translateX(3px);
        }

        /* ═══════════════════════════════════════════════════════════════
           LEAFLET BASE STYLES
        ═══════════════════════════════════════════════════════════════ */

        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
          background: #1a1a2e !important;
        }

        .custom-venue-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-venue-marker .marker-inner:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6);
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(26, 26, 46, 0.9) !important;
          color: white !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(255,255,255,0.1) !important;
        }

        .leaflet-control-attribution {
          background: rgba(26, 26, 46, 0.8) !important;
          color: rgba(255,255,255,0.4) !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: rgba(255,255,255,0.6) !important;
        }
      `}</style>
    </div>
  );
}

export default VenueMapView;
