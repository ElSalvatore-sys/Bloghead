import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, Navigation, Loader2, AlertCircle } from 'lucide-react'
import {
  getArtistsWithLocations,
  findArtistsInRadius,
  getCurrentPosition,
  getMarkerCategory,
  MARKER_COLORS,
  MARKER_EMOJIS,
  type ArtistLocation
} from '../../services/mapService'

// Get token from env
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

interface ArtistMapViewProps {
  userType?: 'artist' | 'service_provider' | null
  onArtistClick?: (artist: ArtistLocation) => void
  className?: string
  initialCenter?: [number, number] // [lng, lat]
  initialZoom?: number
}

export function ArtistMapView({
  userType = 'artist',
  onArtistClick,
  className = '',
  initialCenter = [8.2275, 50.0782], // Wiesbaden default
  initialZoom = 10,
}: ArtistMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const [artists, setArtists] = useState<ArtistLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [, setSelectedArtist] = useState<ArtistLocation | null>(null)

  // Load artists
  useEffect(() => {
    async function loadArtists() {
      try {
        setIsLoading(true)
        const data = await getArtistsWithLocations(userType, 200)
        setArtists(data)
      } catch (err) {
        console.error('Error loading artists:', err)
        setError('Fehler beim Laden der Künstler')
      } finally {
        setIsLoading(false)
      }
    }

    loadArtists()
  }, [userType])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark theme
      center: initialCenter,
      zoom: initialZoom,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
    }
  }, [initialCenter, initialZoom])

  // Add markers when artists load
  useEffect(() => {
    if (!map.current || artists.length === 0) return

    // Wait for map to be loaded
    const addMarkers = () => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Add new markers
      artists.forEach(artist => {
        const category = getMarkerCategory(artist.genre, artist.user_type)
        const color = MARKER_COLORS[category]
        const emoji = MARKER_EMOJIS[category]

        // Create custom marker element
        const el = document.createElement('div')
        el.className = 'artist-marker'
        el.style.cssText = `
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: transform 0.2s ease;
          background-color: ${color};
        `
        el.innerHTML = emoji
        el.onmouseenter = () => { el.style.transform = 'scale(1.1)' }
        el.onmouseleave = () => { el.style.transform = 'scale(1)' }

        // Create popup content
        const popupContent = `
          <div style="padding: 8px; min-width: 200px; background: #1a1a2e; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              ${artist.profile_image_url
                ? `<img src="${artist.profile_image_url}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" />`
                : `<div style="width: 48px; height: 48px; border-radius: 50%; background: #374151; display: flex; align-items: center; justify-content: center; font-size: 20px;">${emoji}</div>`
              }
              <div>
                <p style="font-weight: 600; color: white; margin: 0;">
                  ${artist.kuenstlername || `${artist.vorname} ${artist.nachname}`}
                </p>
                ${artist.genre ? `<p style="font-size: 14px; color: #9ca3af; margin: 4px 0 0 0;">${artist.genre}</p>` : ''}
                ${artist.city ? `<p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">📍 ${artist.city}</p>` : ''}
                ${artist.distance_km ? `<p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">${artist.distance_km} km entfernt</p>` : ''}
              </div>
            </div>
          </div>
        `

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: 'artist-popup'
        }).setHTML(popupContent)

        // Create and add marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([artist.longitude, artist.latitude])
          .setPopup(popup)
          .addTo(map.current!)

        // Handle click
        el.addEventListener('click', () => {
          setSelectedArtist(artist)
          if (onArtistClick) {
            onArtistClick(artist)
          }
        })

        markersRef.current.push(marker)
      })

      // Fit bounds to show all markers
      if (artists.length > 1) {
        const bounds = new mapboxgl.LngLatBounds()
        artists.forEach(a => bounds.extend([a.longitude, a.latitude]))
        map.current?.fitBounds(bounds, { padding: 50, maxZoom: 12 })
      }
    }

    if (map.current.loaded()) {
      addMarkers()
    } else {
      map.current.on('load', addMarkers)
    }
  }, [artists, onArtistClick])

  // Locate me function
  const handleLocateMe = useCallback(async () => {
    if (!map.current) return

    setIsLocating(true)
    setError(null)

    try {
      const position = await getCurrentPosition()
      const { latitude, longitude } = position.coords

      // Fly to user location
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        essential: true
      })

      // Add user marker
      new mapboxgl.Marker({ color: '#22C55E' })
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML('<p style="color: white; margin: 0; padding: 8px;">📍 Dein Standort</p>')
        )
        .addTo(map.current)

      // Find nearby artists
      const nearbyArtists = await findArtistsInRadius(
        latitude,
        longitude,
        50,
        userType || 'artist'
      )
      if (nearbyArtists.length > 0) {
        setArtists(nearbyArtists)
      }
    } catch (err) {
      console.error('Geolocation error:', err)
      setError('Standort konnte nicht ermittelt werden')
    } finally {
      setIsLocating(false)
    }
  }, [userType])

  // No token warning
  if (!MAPBOX_TOKEN) {
    return (
      <div className={`bg-bg-card rounded-xl p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Mapbox nicht konfiguriert</h3>
        <p className="text-white/60 text-sm">
          Bitte füge VITE_MAPBOX_ACCESS_TOKEN in .env.local hinzu
        </p>
        <div className="mt-4 p-4 bg-white/5 rounded-lg text-left">
          <p className="text-xs text-white/40 font-mono">
            1. Gehe zu mapbox.com und erstelle einen Account<br />
            2. Kopiere deinen Access Token<br />
            3. Füge ihn in frontend/.env.local ein:<br />
            <span className="text-accent-purple">VITE_MAPBOX_ACCESS_TOKEN=pk.xxx</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-[500px] lg:h-[600px]" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-bg-primary/80 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-accent-purple animate-spin mx-auto mb-2" />
            <p className="text-white/60">Karte wird geladen...</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* Locate Me Button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="flex items-center gap-2 px-4 py-2 bg-bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span className="text-sm">Mein Standort</span>
        </button>

        {/* Artist Count */}
        <div className="px-4 py-2 bg-bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg">
          <p className="text-sm text-white/60">
            <MapPin className="w-4 h-4 inline mr-1" />
            {artists.length} {userType === 'service_provider' ? 'Dienstleister' : 'Künstler'}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 px-4 py-3 bg-bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg">
        <p className="text-xs text-white/40 mb-2">Kategorien:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(MARKER_EMOJIS).slice(0, 6).map(([key, emoji]) => (
            <span key={key} className="text-sm" title={key}>
              {emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-4 right-4 px-4 py-2 bg-red-500/90 text-white rounded-lg text-sm animate-pulse">
          {error}
        </div>
      )}

      {/* Popup Styles */}
      <style>{`
        .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .mapboxgl-popup-tip {
          display: none !important;
        }
      `}</style>
    </div>
  )
}

export default ArtistMapView
