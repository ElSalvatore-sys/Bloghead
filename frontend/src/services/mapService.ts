import { supabase } from '../lib/supabase';

// =====================================================
// MAP SERVICE - Artist Location Queries
// =====================================================

export interface ArtistLocation {
  id: string;
  vorname: string;
  nachname: string;
  kuenstlername: string | null;
  profile_image_url: string | null;
  city: string | null;
  genre: string | null;
  latitude: number;
  longitude: number;
  user_type?: string;
  distance_km?: number;
}

/**
 * Get all artists with location data for map display
 */
export async function getArtistsWithLocations(
  userType: 'artist' | 'service_provider' | null = null,
  limit: number = 100
): Promise<ArtistLocation[]> {
  // Try RPC first, fallback to direct query if it fails
  try {
    const { data, error } = await supabase
      .rpc('get_artists_with_locations', {
        p_user_type: userType,
        p_limit: limit
      });

    if (error) {
      console.warn('[MapService] RPC failed, using direct query:', error.message);
      return await getArtistsWithLocationsDirect(userType, limit);
    }

    return data || [];
  } catch (err) {
    console.warn('[MapService] RPC exception, using direct query');
    return await getArtistsWithLocationsDirect(userType, limit);
  }
}

/**
 * Direct query fallback for artists with locations
 */
async function getArtistsWithLocationsDirect(
  userType: 'artist' | 'service_provider' | null = null,
  limit: number = 100
): Promise<ArtistLocation[]> {
  let query = supabase
    .from('users')
    .select('id, vorname, nachname, kuenstlername, profile_image_url, stadt, genre, latitude, longitude, user_type')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(limit);

  if (userType) {
    query = query.eq('user_type', userType);
  } else {
    query = query.in('user_type', ['artist', 'service_provider']);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[MapService] Direct query error:', error);
    return [];
  }

  // Map stadt to city for consistency
  return (data || []).map(user => ({
    ...user,
    city: user.stadt,
    genre: Array.isArray(user.genre) ? user.genre.join(', ') : user.genre
  })) as ArtistLocation[];
}

/**
 * Find artists within radius of a point
 */
export async function findArtistsInRadius(
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  userType: 'artist' | 'service_provider' = 'artist'
): Promise<ArtistLocation[]> {
  try {
    const { data, error } = await supabase
      .rpc('find_artists_in_radius', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_radius_km: radiusKm,
        p_user_type: userType
      });

    if (error) {
      console.warn('[MapService] RPC radius search failed, using client-side filter:', error.message);
      // Fallback: get all and filter client-side
      const all = await getArtistsWithLocations(userType, 200);
      return all.filter(a => {
        const dist = haversineDistance(latitude, longitude, a.latitude, a.longitude);
        return dist <= radiusKm;
      }).map(a => ({
        ...a,
        distance_km: haversineDistance(latitude, longitude, a.latitude, a.longitude)
      })).sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    }

    return data || [];
  } catch (err) {
    console.error('[MapService] Radius search failed:', err);
    return [];
  }
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Update user's location coordinates
 */
export async function updateUserLocation(
  userId: string,
  latitude: number,
  longitude: number,
  address?: string,
  formatted?: string
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      latitude,
      longitude,
      location_address: address,
      location_formatted: formatted,
    })
    .eq('id', userId);

  if (error) {
    console.error('[MapService] Error updating location:', error);
    throw error;
  }
}

/**
 * Geocode an address using Mapbox Geocoding API
 */
export async function geocodeAddress(
  address: string,
  accessToken: string
): Promise<{ latitude: number; longitude: number; formatted: string } | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${accessToken}&country=de&limit=1`
    );

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return {
        latitude,
        longitude,
        formatted: data.features[0].place_name
      };
    }

    return null;
  } catch (error) {
    console.error('[MapService] Geocoding error:', error);
    return null;
  }
}

/**
 * Get user's current location via browser geolocation
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    });
  });
}

// =====================================================
// MARKER CATEGORY HELPERS
// =====================================================

export type MarkerCategory =
  | 'dj'
  | 'band'
  | 'solo'
  | 'singer'
  | 'fotograf'
  | 'videograf'
  | 'moderator'
  | 'service'
  | 'default';

export function getMarkerCategory(genre: string | null, userType?: string): MarkerCategory {
  if (!genre) return userType === 'service_provider' ? 'service' : 'default';

  const g = genre.toLowerCase();

  if (g.includes('dj')) return 'dj';
  if (g.includes('band')) return 'band';
  if (g.includes('solo') || g.includes('künstler')) return 'solo';
  if (g.includes('sänger') || g.includes('singer') || g.includes('gesang')) return 'singer';
  if (g.includes('foto')) return 'fotograf';
  if (g.includes('video') || g.includes('film')) return 'videograf';
  if (g.includes('moderator') || g.includes('sprecher')) return 'moderator';

  return 'default';
}

export const MARKER_COLORS: Record<MarkerCategory, string> = {
  dj: '#8B5CF6',        // Purple
  band: '#EF4444',      // Red
  solo: '#F59E0B',      // Amber
  singer: '#EC4899',    // Pink
  fotograf: '#10B981',  // Emerald
  videograf: '#3B82F6', // Blue
  moderator: '#6366F1', // Indigo
  service: '#14B8A6',   // Teal
  default: '#6B7280',   // Gray
};

export const MARKER_EMOJIS: Record<MarkerCategory, string> = {
  dj: '🎧',
  band: '🎸',
  solo: '🎤',
  singer: '🎵',
  fotograf: '📷',
  videograf: '🎬',
  moderator: '🎙️',
  service: '⚡',
  default: '📍',
};
