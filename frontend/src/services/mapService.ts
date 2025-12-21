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

// =====================================================
// GERMAN CITY COORDINATES LOOKUP
// =====================================================

export const GERMAN_CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  // Major cities
  'berlin': { latitude: 52.5200, longitude: 13.4050 },
  'hamburg': { latitude: 53.5511, longitude: 9.9937 },
  'münchen': { latitude: 48.1351, longitude: 11.5820 },
  'munich': { latitude: 48.1351, longitude: 11.5820 },
  'köln': { latitude: 50.9375, longitude: 6.9603 },
  'cologne': { latitude: 50.9375, longitude: 6.9603 },
  'frankfurt': { latitude: 50.1109, longitude: 8.6821 },
  'frankfurt am main': { latitude: 50.1109, longitude: 8.6821 },
  'stuttgart': { latitude: 48.7758, longitude: 9.1829 },
  'düsseldorf': { latitude: 51.2277, longitude: 6.7735 },
  'dortmund': { latitude: 51.5136, longitude: 7.4653 },
  'essen': { latitude: 51.4556, longitude: 7.0116 },
  'leipzig': { latitude: 51.3397, longitude: 12.3731 },
  'bremen': { latitude: 53.0793, longitude: 8.8017 },
  'dresden': { latitude: 51.0504, longitude: 13.7373 },
  'hannover': { latitude: 52.3759, longitude: 9.7320 },
  'nürnberg': { latitude: 49.4521, longitude: 11.0767 },
  'nuremberg': { latitude: 49.4521, longitude: 11.0767 },
  'duisburg': { latitude: 51.4344, longitude: 6.7623 },
  'bochum': { latitude: 51.4818, longitude: 7.2162 },
  'wuppertal': { latitude: 51.2562, longitude: 7.1508 },
  'bielefeld': { latitude: 52.0302, longitude: 8.5325 },
  'bonn': { latitude: 50.7374, longitude: 7.0982 },
  'münster': { latitude: 51.9607, longitude: 7.6261 },
  'karlsruhe': { latitude: 49.0069, longitude: 8.4037 },
  'mannheim': { latitude: 49.4875, longitude: 8.4660 },
  'augsburg': { latitude: 48.3705, longitude: 10.8978 },
  'wiesbaden': { latitude: 50.0782, longitude: 8.2398 },
  'mainz': { latitude: 49.9929, longitude: 8.2473 },
  'aachen': { latitude: 50.7753, longitude: 6.0839 },
  'kiel': { latitude: 54.3233, longitude: 10.1228 },
  'freiburg': { latitude: 47.9990, longitude: 7.8421 },
  'lübeck': { latitude: 53.8655, longitude: 10.6866 },
  'heidelberg': { latitude: 49.3988, longitude: 8.6724 },
  'darmstadt': { latitude: 49.8728, longitude: 8.6512 },
  'potsdam': { latitude: 52.3906, longitude: 13.0645 },
  'würzburg': { latitude: 49.7913, longitude: 9.9534 },
  'regensburg': { latitude: 49.0134, longitude: 12.1016 },
  'rostock': { latitude: 54.0924, longitude: 12.0991 },
  'kassel': { latitude: 51.3127, longitude: 9.4797 },
  'offenbach': { latitude: 50.0956, longitude: 8.7761 },
  'ulm': { latitude: 48.4011, longitude: 9.9876 },
  'trier': { latitude: 49.7490, longitude: 6.6371 },
  'saarbrücken': { latitude: 49.2402, longitude: 6.9969 },
  'konstanz': { latitude: 47.6779, longitude: 9.1732 },
  'bamberg': { latitude: 49.8988, longitude: 10.9028 },
  'passau': { latitude: 48.5665, longitude: 13.4319 },
  'magdeburg': { latitude: 52.1205, longitude: 11.6276 },
  'erfurt': { latitude: 50.9848, longitude: 11.0299 },
  'chemnitz': { latitude: 50.8278, longitude: 12.9214 },
  'halle': { latitude: 51.4969, longitude: 11.9688 },
  'braunschweig': { latitude: 52.2689, longitude: 10.5268 },
  'göttingen': { latitude: 51.5413, longitude: 9.9158 },
  'osnabrück': { latitude: 52.2799, longitude: 8.0472 },
  'oldenburg': { latitude: 53.1435, longitude: 8.2146 },
  'paderborn': { latitude: 51.7189, longitude: 8.7544 },
  'siegen': { latitude: 50.8748, longitude: 8.0243 },
  'gießen': { latitude: 50.5840, longitude: 8.6784 },
  'marburg': { latitude: 50.8021, longitude: 8.7668 },
  'fulda': { latitude: 50.5528, longitude: 9.6757 },
  'coburg': { latitude: 50.2612, longitude: 10.9627 },
  'schwerin': { latitude: 53.6355, longitude: 11.4012 },
  'cottbus': { latitude: 51.7563, longitude: 14.3329 },
  'jena': { latitude: 50.9272, longitude: 11.5892 },
  'weimar': { latitude: 50.9795, longitude: 11.3235 },
  'zwickau': { latitude: 50.7189, longitude: 12.4964 },
  'gera': { latitude: 50.8810, longitude: 12.0833 },
  'dessau': { latitude: 51.8312, longitude: 12.2461 },
  'wolfsburg': { latitude: 52.4227, longitude: 10.7865 },
  'salzgitter': { latitude: 52.1547, longitude: 10.3285 },
  'hildesheim': { latitude: 52.1508, longitude: 9.9510 },
  'gütersloh': { latitude: 51.9032, longitude: 8.3858 },
  'ludwigshafen': { latitude: 49.4774, longitude: 8.4452 },
  'kaiserslautern': { latitude: 49.4401, longitude: 7.7491 },
  'koblenz': { latitude: 50.3569, longitude: 7.5890 },
  'hagen': { latitude: 51.3671, longitude: 7.4633 },
  'hamm': { latitude: 51.6739, longitude: 7.8160 },
  'krefeld': { latitude: 51.3388, longitude: 6.5853 },
  'mönchengladbach': { latitude: 51.1805, longitude: 6.4428 },
  'oberhausen': { latitude: 51.4963, longitude: 6.8635 },
  'gelsenkirchen': { latitude: 51.5177, longitude: 7.0857 },
  'solingen': { latitude: 51.1652, longitude: 7.0671 },
  'leverkusen': { latitude: 51.0459, longitude: 6.9844 },
  'neuss': { latitude: 51.2042, longitude: 6.6879 },
  'mülheim': { latitude: 51.4268, longitude: 6.8825 },
  'recklinghausen': { latitude: 51.6141, longitude: 7.1979 },
  'bottrop': { latitude: 51.5247, longitude: 6.9226 },
  'remscheid': { latitude: 51.1787, longitude: 7.1896 },
  'moers': { latitude: 51.4527, longitude: 6.6263 },
  'bergisch gladbach': { latitude: 50.9918, longitude: 7.1308 },
  'erlangen': { latitude: 49.5897, longitude: 11.0078 },
  'fürth': { latitude: 49.4774, longitude: 10.9886 },
  'ingolstadt': { latitude: 48.7665, longitude: 11.4258 },
  'pforzheim': { latitude: 48.8922, longitude: 8.6946 },
  'reutlingen': { latitude: 48.4914, longitude: 9.2043 },
  'heilbronn': { latitude: 49.1427, longitude: 9.2109 },
};

/**
 * Get coordinates for a German city (instant lookup, no API call)
 */
export function getCityCoordinates(city: string): { latitude: number; longitude: number } | null {
  if (!city) return null;

  // Normalize: lowercase, trim, remove extra spaces
  const normalized = city.toLowerCase().trim().replace(/\s+/g, ' ');

  // Direct lookup
  if (GERMAN_CITY_COORDINATES[normalized]) {
    return GERMAN_CITY_COORDINATES[normalized];
  }

  // Try partial match (city might have additions like "am Main")
  for (const [key, coords] of Object.entries(GERMAN_CITY_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }

  return null;
}

/**
 * Update user location from city name (uses lookup table first, falls back to geocoding)
 */
export async function updateUserLocationFromCity(
  userId: string,
  city: string,
  mapboxToken?: string
): Promise<{ latitude: number; longitude: number } | null> {
  // Try instant lookup first
  const coords = getCityCoordinates(city);

  if (coords) {
    await updateUserLocation(userId, coords.latitude, coords.longitude, city, city);
    return coords;
  }

  // Fallback to Mapbox geocoding if token provided
  if (mapboxToken) {
    const geocoded = await geocodeAddress(city, mapboxToken);
    if (geocoded) {
      await updateUserLocation(userId, geocoded.latitude, geocoded.longitude, city, geocoded.formatted);
      return { latitude: geocoded.latitude, longitude: geocoded.longitude };
    }
  }

  return null;
}
