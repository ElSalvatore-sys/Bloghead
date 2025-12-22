import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, Navigation, Loader2, AlertCircle } from 'lucide-react'
import {
  getArtistsWithLocations,
  getCurrentPosition,
  findArtistsInRadius,
  getMarkerCategory,
  MARKER_COLORS,
  MARKER_EMOJIS,
  type ArtistLocation
} from '../../services/mapService'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

interface ArtistMapViewSimpleProps {
  userType?: 'artist' | 'service_provider' | null
  onArtistClick?: (artist: ArtistLocation) => void
  className?: string
  initialCenter?: [number, number]
  initialZoom?: number
}

export function ArtistMapViewSimple({
  userType = 'artist',
  onArtistClick,
  className = '',
  initialCenter = [8.2275, 50.0782],
  initialZoom = 10,
}: ArtistMapViewSimpleProps) {
  const navigate = useNavigate()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const [artists, setArtists] = useState<ArtistLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)

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
    if (!mapContainer.current || !MAPBOX_TOKEN || map.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initialCenter,
      zoom: initialZoom,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [initialCenter, initialZoom])

  // Add markers when artists load - USING OFFICIAL MAPBOX PATTERN
  useEffect(() => {
    if (!map.current || artists.length === 0) return

    const addMarkers = () => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      artists.forEach(artist => {
        const category = getMarkerCategory(artist.genre, artist.user_type)
        const color = MARKER_COLORS[category]
        const emoji = MARKER_EMOJIS[category]

        const displayName = artist.kuenstlername || `${artist.vorname} ${artist.nachname}`
        const userTypeBadge = artist.user_type === 'service_provider'
          ? '<span style="background: #7C3AED; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; margin-left: 8px;">Service</span>'
          : '<span style="background: #EC4899; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; margin-left: 8px;">Artist</span>'

        // Create popup HTML
        const popupHTML = `
          <div style="
            padding: 16px;
            min-width: 220px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255,255,255,0.15);
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              ${artist.profile_image_url
                ? `<img src="${artist.profile_image_url}" alt="${displayName}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 3px solid ${color}; flex-shrink: 0;" onerror="this.style.display='none'" />`
                : `<div style="width: 50px; height: 50px; border-radius: 50%; background: ${color}; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 3px solid white; flex-shrink: 0;">${emoji}</div>`
              }
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; flex-wrap: wrap;">
                  <p style="font-weight: 700; color: white; margin: 0; font-size: 15px;">
                    ${displayName}
                  </p>
                  ${userTypeBadge}
                </div>
                ${artist.genre
                  ? `<p style="font-size: 12px; color: ${color}; margin: 4px 0 0 0; font-weight: 600;">${artist.genre}</p>`
                  : ''
                }
                ${artist.city
                  ? `<p style="font-size: 11px; color: #d1d5db; margin: 4px 0 0 0;">📍 ${artist.city}</p>`
                  : ''
                }
              </div>
            </div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
              <span style="font-size: 11px; color: #a855f7; font-weight: 500;">🔗 Klicken für Profil</span>
            </div>
          </div>
        `

        // Create popup FIRST - using official Mapbox pattern
        // offset: 25 pixels above the marker anchor point
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
          maxWidth: '300px'
        }).setHTML(popupHTML)

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
          background-color: ${color};
          border: 3px solid white;
        `
        el.innerHTML = emoji

        // Create marker WITH popup attached (official Mapbox pattern)
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([artist.longitude, artist.latitude])
          .setPopup(popup) // ATTACH popup to marker - Mapbox handles positioning!
          .addTo(map.current!)

        // Hover events - use togglePopup for proper positioning
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.15)'
          el.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.6)'
          el.style.zIndex = '1000'

          // Show popup if not already showing
          if (!marker.getPopup().isOpen()) {
            marker.togglePopup()
          }
        })

        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)'
          el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)'
          el.style.zIndex = '1'

          // Hide popup
          if (marker.getPopup().isOpen()) {
            marker.togglePopup()
          }
        })

        // Click: navigate to artist profile
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          e.preventDefault()

          if (onArtistClick) {
            onArtistClick(artist)
          } else {
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
  }, [artists, onArtistClick, navigate])

  // Locate me function
  const handleLocateMe = async () => {
    if (!map.current) return

    setIsLocating(true)
    setError(null)

    try {
      const position = await getCurrentPosition()
      const { latitude, longitude } = position.coords

      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        essential: true
      })

      new mapboxgl.Marker({ color: '#22C55E' })
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML('<p style="color: white; margin: 0; padding: 8px;">📍 Dein Standort</p>')
        )
        .addTo(map.current)

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
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`bg-bg-card rounded-xl p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Mapbox nicht konfiguriert</h3>
        <p className="text-white/60 text-sm">
          Bitte füge VITE_MAPBOX_ACCESS_TOKEN in .env.local hinzu
        </p>
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

      {/* Popup Styles - minimal override */}
      <style>{`
        .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
          border-radius: 12px !important;
        }
        .mapboxgl-popup-tip {
          display: none !important;
        }
        .mapboxgl-popup {
          z-index: 999 !important;
        }
      `}</style>
    </div>
  )
}

export default ArtistMapViewSimple
