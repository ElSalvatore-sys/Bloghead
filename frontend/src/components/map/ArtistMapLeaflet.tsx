import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Loader2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getArtistsWithLocations,
  getCurrentPosition,
  getMarkerCategory,
  MARKER_COLORS,
  MARKER_EMOJIS,
  type ArtistLocation
} from '../../services/mapService';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create custom emoji icon
function createCustomIcon(emoji: string, color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-artist-marker',
    html: `
      <div class="marker-inner" style="
        width: 44px;
        height: 44px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      ">${emoji}</div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26],
  });
}

// Location button component (inside map)
function LocationButton({ onLocate, locating }: { onLocate: () => void; locating: boolean }) {
  return (
    <button
      onClick={onLocate}
      disabled={locating}
      className="flex items-center gap-2 px-4 py-2 bg-bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50"
    >
      {locating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Navigation className="w-4 h-4" />
      )}
      <span className="text-sm">Mein Standort</span>
    </button>
  );
}

// Component to fly to user location
function FlyToLocation({ position }: { position: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 12, { duration: 1.5 });
    }
  }, [map, position]);

  return null;
}

// Component to fit bounds to all markers
function FitBounds({ artists }: { artists: ArtistLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (artists.length > 1) {
      const bounds = L.latLngBounds(
        artists.map(a => [a.latitude, a.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    }
  }, [map, artists]);

  return null;
}

interface ArtistMapLeafletProps {
  userType?: 'artist' | 'service_provider' | null;
  onArtistClick?: (artist: ArtistLocation) => void;
  className?: string;
}

export function ArtistMapLeaflet({
  userType = 'artist',
  onArtistClick,
  className = ''
}: ArtistMapLeafletProps) {
  const [artists, setArtists] = useState<ArtistLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  // Load artists
  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoading(true);
        const data = await getArtistsWithLocations(userType, 200);
        console.log('[ArtistMapLeaflet] Loaded artists:', data.length);
        setArtists(data);
      } catch (err) {
        console.error('[ArtistMapLeaflet] Error loading artists:', err);
        setError('Fehler beim Laden der Künstler');
      } finally {
        setLoading(false);
      }
    };
    loadArtists();
  }, [userType]);

  // Locate user
  const handleLocate = useCallback(async () => {
    try {
      setLocating(true);
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      setUserPosition([latitude, longitude]);
    } catch (err) {
      console.error('[ArtistMapLeaflet] Geolocation error:', err);
      setError('Standort konnte nicht ermittelt werden');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLocating(false);
    }
  }, []);

  // Suppress unused var warning
  void onArtistClick;

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-[500px] lg:h-[600px] bg-gray-900 rounded-xl ${className}`}>
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden ${className}`}>
      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg z-[1000]">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-[1000]">
        {/* Locate button */}
        <LocationButton onLocate={handleLocate} locating={locating} />

        {/* Artist count badge */}
        <div className="px-4 py-2 bg-bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg">
          <p className="text-sm text-white/60">
            <MapPin className="w-4 h-4 inline mr-1" />
            {artists.length} {userType === 'service_provider' ? 'Dienstleister' : 'Künstler'}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 px-4 py-3 bg-bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg z-[1000]">
        <p className="text-xs text-white/40 mb-2">Kategorien:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(MARKER_EMOJIS).slice(0, 6).map(([key, emoji]) => (
            <span key={key} className="text-sm" title={key}>
              {emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[50.0782, 8.2275]} // Wiesbaden
        zoom={9}
        className="w-full h-full"
        style={{ background: '#1a1a2e' }}
        zoomControl={true}
        attributionControl={true}
      >
        {/* Dark CARTO tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Fit bounds to markers */}
        <FitBounds artists={artists} />

        {/* Fly to user location */}
        <FlyToLocation position={userPosition} />

        {/* User location marker */}
        {userPosition && (
          <Marker
            position={userPosition}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background: #22c55e;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 10px rgba(34,197,94,0.5);
                "></div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          />
        )}

        {/* Artist markers */}
        {artists.map((artist) => {
          const category = getMarkerCategory(artist.genre, artist.user_type);
          const color = MARKER_COLORS[category];
          const emoji = MARKER_EMOJIS[category];
          const name = artist.kuenstlername || `${artist.vorname} ${artist.nachname}`;
          const imageUrl = artist.profile_image_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;

          return (
            <Marker
              key={artist.id}
              position={[artist.latitude, artist.longitude]}
              icon={createCustomIcon(emoji, color)}
            >
              <Popup>
                <div className="popup-content">
                  {/* Shadcn-inspired floating card */}
                  <div className="popup-card">
                    {/* Main content row */}
                    <div className="popup-main">
                      {/* Profile image */}
                      <div className="popup-avatar-wrap">
                        <img
                          src={imageUrl}
                          alt={name}
                          className="popup-avatar"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=200`;
                          }}
                        />
                        <div className="popup-avatar-ring" style={{ borderColor: color }} />
                      </div>

                      {/* Info section */}
                      <div className="popup-info">
                        {/* Name */}
                        <div className="popup-name-row">
                          <h3 className="popup-name">{name}</h3>
                        </div>

                        {/* Role with emoji */}
                        <p className="popup-role">
                          <span className="popup-role-emoji">{emoji}</span>
                          {artist.genre || (artist.user_type === 'service_provider' ? 'Dienstleister' : 'Künstler')}
                        </p>

                        {/* Location */}
                        <p className="popup-location">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {artist.city || 'Deutschland'}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="popup-divider" />

                    {/* CTA Button */}
                    <Link to={`/artists/${artist.id}`} className="popup-cta">
                      <span>Profil ansehen</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Custom Leaflet styles */}
      <style>{`
        /* ═══════════════════════════════════════════════════════════════
           GLASSMORPHISM POPUP - SHADCN INSPIRED
           No arrow tip, floating card appearance
        ═══════════════════════════════════════════════════════════════ */

        /* Popup wrapper - glassmorphism effect */
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
          width: 280px !important;
        }

        /* HIDE THE ARROW/TIP COMPLETELY */
        .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-popup-tip {
          display: none !important;
        }

        /* Close button - circular, subtle */
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
          padding: 20px;
        }

        /* Main row - avatar + info side by side */
        .popup-main {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        /* Avatar with ring */
        .popup-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .popup-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }

        .popup-avatar-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid;
          opacity: 0.8;
        }

        /* Info section */
        .popup-info {
          flex: 1;
          min-width: 0;
          padding-top: 2px;
        }

        .popup-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .popup-name {
          font-size: 16px !important;
          font-weight: 600 !important;
          color: white !important;
          margin: 0 !important;
          line-height: 1.3 !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .popup-role {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px !important;
          color: rgba(255, 255, 255, 0.6) !important;
          margin: 0 0 6px 0 !important;
        }

        .popup-role-emoji {
          font-size: 14px;
        }

        .popup-location {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px !important;
          color: rgba(255, 255, 255, 0.45) !important;
          margin: 0 !important;
        }

        .popup-location svg {
          flex-shrink: 0;
          opacity: 0.6;
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
          margin: 16px 0;
        }

        /* CTA Button */
        .popup-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-radius: 10px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .popup-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          filter: brightness(1.05);
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

        /* Custom markers */
        .custom-artist-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-artist-marker .marker-inner:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        }
        .user-location-marker {
          background: transparent !important;
          border: none !important;
        }

        /* Zoom controls */
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

        /* Attribution */
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

export default ArtistMapLeaflet;
