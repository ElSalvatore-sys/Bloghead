import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  // Single shared popup instance - prevents jumping
  const popupRef = useRef<mapboxgl.Popup | null>(null)

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

  // Create single shared popup instance AFTER map loads
  useEffect(() => {
    if (!map.current) return

    const initPopup = () => {
      // Create ONE popup to reuse - key fix for stability
      popupRef.current = new mapboxgl.Popup({
        offset: [0, -22], // Offset above marker (marker is 44px, so -22 centers above)
        closeButton: false,
        closeOnClick: false,
        className: 'artist-popup',
        anchor: 'bottom', // Popup appears ABOVE the anchor point
        maxWidth: '300px'
      })
    }

    if (map.current.loaded()) {
      initPopup()
    } else {
      map.current.on('load', initPopup)
    }

    return () => {
      popupRef.current?.remove()
    }
  }, [])

  // Helper to generate popup HTML content
  const getPopupContent = useCallback((artist: ArtistLocation, color: string, emoji: string) => {
    const displayName = artist.kuenstlername || `${artist.vorname} ${artist.nachname}`
    const userTypeBadge = artist.user_type === 'service_provider'
      ? '<span style="background: #7C3AED; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; margin-left: 8px;">Service</span>'
      : '<span style="background: #EC4899; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; margin-left: 8px;">Artist</span>'

    return `
      <div class="popup-inner" style="
        padding: 16px;
        min-width: 240px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255,255,255,0.15);
      ">
        <div style="display: flex; align-items: center; gap: 14px;">
          ${artist.profile_image_url
            ? `<img src="${artist.profile_image_url}" alt="${displayName}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid ${color}; flex-shrink: 0;" onerror="this.style.display='none'" />`
            : `<div style="width: 60px; height: 60px; border-radius: 50%; background: ${color}; display: flex; align-items: center; justify-content: center; font-size: 28px; border: 3px solid white; flex-shrink: 0;">${emoji}</div>`
          }
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; flex-wrap: wrap;">
              <p style="font-weight: 700; color: white; margin: 0; font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${displayName}
              </p>
              ${userTypeBadge}
            </div>
            ${artist.genre
              ? `<p style="font-size: 13px; color: ${color}; margin: 6px 0 0 0; font-weight: 600;">${artist.genre}</p>`
              : `<p style="font-size: 13px; color: ${color}; margin: 6px 0 0 0; font-weight: 600;">${artist.user_type === 'service_provider' ? 'Dienstleister' : 'Künstler'}</p>`
            }
            ${artist.city
              ? `<p style="font-size: 12px; color: #d1d5db; margin: 6px 0 0 0;">📍 ${artist.city}</p>`
              : ''
            }
            ${artist.distance_km
              ? `<p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">↗ ${artist.distance_km} km entfernt</p>`
              : ''
            }
          </div>
        </div>
        <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
          <span style="font-size: 12px; color: #a855f7; font-weight: 500;">🔗 Klicken für Profil</span>
        </div>
      </div>
    `
  }, [])

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
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          background-color: ${color};
          border: 3px solid white;
          position: relative;
        `
        el.innerHTML = emoji

        // Create marker with stable anchor
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([artist.longitude, artist.latitude])
          .addTo(map.current!)

        // Hover: show shared popup with this artist's content
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.15)'
          el.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.6)'
          el.style.zIndex = '1000'

          // CRITICAL: Create popup if not exists, then set position BEFORE adding to map
          if (map.current) {
            // Create popup on-demand if it doesn't exist
            if (!popupRef.current) {
              popupRef.current = new mapboxgl.Popup({
                offset: [0, -22],
                closeButton: false,
                closeOnClick: false,
                className: 'artist-popup',
                anchor: 'bottom',
                maxWidth: '300px'
              })
            }

            // CORRECT ORDER: setLngLat FIRST, then setHTML, then addTo
            const content = getPopupContent(artist, color, emoji)
            popupRef.current
              .setLngLat([artist.longitude, artist.latitude]) // Position FIRST!
              .setHTML(content)
              .addTo(map.current)
          }
        })

        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)'
          el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)'
          el.style.zIndex = '1'

          // Hide popup (don't destroy, just remove from map)
          if (popupRef.current) {
            popupRef.current.remove()
          }
        })

        // Click: navigate to artist profile using React Router
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          e.preventDefault()
          setSelectedArtist(artist)

          if (onArtistClick) {
            onArtistClick(artist)
          } else {
            // Use React Router for SPA navigation
            navigate(`/artists/${artist.id}`)
          }
        })

        markersRef.current.push(marker)
      })

      // Fit bounds to show all markers
      if (artists.length > 1) {
        const bounds = new mapboxgl.LngLatBounds()
        artists.forEach(a => bounds.extend([a.longitude, a.latitude]))
        map.current?.fitBounds(bounds, { padding: 60, maxZoom: 11 })
      }
    }

    if (map.current.loaded()) {
      addMarkers()
    } else {
      map.current.on('load', addMarkers)
    }
  }, [artists, onArtistClick, navigate, getPopupContent])

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
