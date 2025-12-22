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
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

          return (
            <Marker
              key={artist.id}
              position={[artist.latitude, artist.longitude]}
              icon={createCustomIcon(emoji, color)}
            >
              <Popup>
                <div className="min-w-[220px] -m-3">
                  {/* Header with image and info */}
                  <div
                    className="flex items-center gap-3 p-3"
                    style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
                  >
                    <img
                      src={imageUrl}
                      alt={name}
                      className="w-14 h-14 rounded-full object-cover"
                      style={{ border: `3px solid ${color}` }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {artist.genre || (artist.user_type === 'service_provider' ? 'Dienstleister' : 'Künstler')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {artist.city || 'Deutschland'}
                      </div>
                    </div>
                  </div>

                  {/* Profile link button */}
                  <Link
                    to={`/artists/${artist.id}`}
                    className="block text-center py-2.5 text-white text-xs font-medium hover:opacity-90 transition-opacity"
                    style={{ background: color }}
                  >
                    Profil ansehen →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Custom Leaflet styles */}
      <style>{`
        .leaflet-popup-content-wrapper {
          padding: 0 !important;
          background: transparent !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
          min-width: 220px !important;
        }
        .leaflet-popup-tip {
          background: #16213e !important;
        }
        .leaflet-popup-close-button {
          color: white !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
          right: 4px !important;
          top: 4px !important;
        }
        .leaflet-popup-close-button:hover {
          background: rgba(255,255,255,0.1) !important;
          border-radius: 4px;
        }
        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
          background: #1a1a2e !important;
        }
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

export default ArtistMapLeaflet;
