import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getArtistsWithLocations,
  getCurrentPosition,
  getMarkerCategory,
  MARKER_COLORS,
  MARKER_EMOJIS,
  type ArtistLocation
} from '../../services/mapService';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface ArtistMapViewProps {
  userType?: 'artist' | 'service_provider' | null;
  onArtistClick?: (artist: ArtistLocation) => void;
  className?: string;
}

export function ArtistMapView({
  userType = 'artist',
  onArtistClick,
  className = ''
}: ArtistMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();

  const [artists, setArtists] = useState<ArtistLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Load artists
  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoading(true);
        const data = await getArtistsWithLocations(userType, 200);
        setArtists(data);
      } catch {
        setError('Fehler beim Laden der Künstler');
      } finally {
        setLoading(false);
      }
    };
    loadArtists();
  }, [userType]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [8.2275, 50.0782], // Wiesbaden
      zoom: 9,
      attributionControl: false
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add markers when artists load
  useEffect(() => {
    if (!map.current || artists.length === 0) return;

    const addMarkers = () => {
      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      artists.forEach(artist => {
        const category = getMarkerCategory(artist.genre, artist.user_type);
        const color = MARKER_COLORS[category];
        const emoji = MARKER_EMOJIS[category];
        const name = artist.kuenstlername || `${artist.vorname} ${artist.nachname}`;
        const imageUrl = artist.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

        // Create popup with rich content
        const popupHTML = `
          <div style="
            min-width: 220px;
            padding: 0;
            font-family: system-ui, -apple-system, sans-serif;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              border-radius: 8px 8px 0 0;
            ">
              <img
                src="${imageUrl}"
                alt="${name}"
                style="
                  width: 56px;
                  height: 56px;
                  border-radius: 50%;
                  border: 3px solid ${color};
                  object-fit: cover;
                "
                onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random'"
              />
              <div style="flex: 1; min-width: 0;">
                <div style="
                  font-weight: 600;
                  font-size: 14px;
                  color: white;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                ">${name}</div>
                <div style="
                  font-size: 12px;
                  color: #94a3b8;
                  margin-top: 2px;
                ">${artist.genre || (artist.user_type === 'service_provider' ? 'Dienstleister' : 'Künstler')}</div>
                <div style="
                  font-size: 11px;
                  color: #64748b;
                  margin-top: 4px;
                ">📍 ${artist.city || 'Deutschland'}</div>
              </div>
            </div>
            <a
              href="/artists/${artist.id}"
              style="
                display: block;
                text-align: center;
                padding: 10px;
                background: ${color};
                color: white;
                text-decoration: none;
                font-size: 12px;
                font-weight: 500;
                border-radius: 0 0 8px 8px;
              "
            >
              Profil ansehen →
            </a>
          </div>
        `;

        // Create popup - attached to marker (CLICK to open)
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: true,
          maxWidth: '280px',
          className: 'artist-popup'
        }).setHTML(popupHTML);

        // Create marker element
        const el = document.createElement('div');
        el.className = 'artist-marker';
        el.style.cssText = `
          width: 44px;
          height: 44px;
          background: ${color};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        `;
        el.innerHTML = emoji;
        el.title = name;

        // Hover effect (visual only, no popup)
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.15)';
          el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
          el.style.zIndex = '100';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          el.style.zIndex = '1';
        });

        // Create marker with popup attached (CLICK to open)
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([artist.longitude, artist.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });

      // Fit bounds to show all markers
      if (artists.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        artists.forEach(a => bounds.extend([a.longitude, a.latitude]));
        map.current?.fitBounds(bounds, { padding: 60, maxZoom: 12 });
      }
    };

    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.on('load', addMarkers);
    }
  }, [artists, navigate, onArtistClick]);

  // Locate user
  const handleLocate = useCallback(async () => {
    if (!map.current) return;

    try {
      setLocating(true);
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        duration: 1500
      });

      // Add user location marker
      new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

    } catch {
      setError('Standort konnte nicht ermittelt werden');
    } finally {
      setLocating(false);
    }
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-900 rounded-xl ${className}`}>
        <p className="text-gray-400">Mapbox Token fehlt</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden ${className}`}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg z-10">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        {/* Locate button */}
        <button
          onClick={handleLocate}
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

        {/* Artist count badge */}
        {!loading && (
          <div className="px-4 py-2 bg-bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg">
            <p className="text-sm text-white/60">
              <MapPin className="w-4 h-4 inline mr-1" />
              {artists.length} {userType === 'service_provider' ? 'Dienstleister' : 'Künstler'}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 px-4 py-3 bg-bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg z-10">
        <p className="text-xs text-white/40 mb-2">Kategorien:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(MARKER_EMOJIS).slice(0, 6).map(([key, emoji]) => (
            <span key={key} className="text-sm" title={key}>
              {emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Custom popup styles */}
      <style>{`
        .mapboxgl-popup-content {
          padding: 0 !important;
          background: transparent !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .mapboxgl-popup-tip {
          border-top-color: #16213e !important;
        }
        .mapboxgl-popup-close-button {
          color: white !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
          right: 4px !important;
          top: 4px !important;
        }
        .mapboxgl-popup-close-button:hover {
          background: rgba(255,255,255,0.1) !important;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export default ArtistMapView;
