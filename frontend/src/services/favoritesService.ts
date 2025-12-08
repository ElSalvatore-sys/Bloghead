import { supabase } from '../lib/supabase'

export interface Favorite {
  id: string
  user_id: string
  artist_id: string | null
  provider_id: string | null
  notes: string | null
  created_at: string
}

export interface FavoriteWithDetails extends Favorite {
  artist?: {
    id: string
    kuenstlername: string
    jobbezeichnung: string | null
    profile_image_url: string | null
    stadt: string | null
    star_rating: number | null
  } | null
  provider?: {
    id: string
    business_name: string
    profile_image_url: string | null
    city: string | null
    avg_rating: number | null
    service_category: {
      name_de: string
      icon: string | null
    } | null
  } | null
}

/**
 * Check if an item is favorited by the user
 */
export async function checkIsFavorited(
  userId: string,
  itemId: string,
  type: 'artist' | 'provider'
): Promise<boolean> {
  const column = type === 'artist' ? 'artist_id' : 'provider_id'

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq(column, itemId)
    .maybeSingle()

  return !error && !!data
}

/**
 * Add an item to favorites
 */
export async function addToFavorites(
  userId: string,
  itemId: string,
  type: 'artist' | 'provider'
) {
  const data: Record<string, string> = {
    user_id: userId,
  }

  if (type === 'artist') {
    data.artist_id = itemId
  } else {
    data.provider_id = itemId
  }

  const { error } = await supabase.from('favorites').insert(data)

  return { error }
}

/**
 * Remove an item from favorites
 */
export async function removeFromFavorites(
  userId: string,
  itemId: string,
  type: 'artist' | 'provider'
) {
  const column = type === 'artist' ? 'artist_id' : 'provider_id'

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq(column, itemId)

  return { error }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  userId: string,
  itemId: string,
  type: 'artist' | 'provider'
): Promise<{ isFavorited: boolean; error: Error | null }> {
  const isFav = await checkIsFavorited(userId, itemId, type)

  if (isFav) {
    const { error } = await removeFromFavorites(userId, itemId, type)
    return { isFavorited: false, error }
  } else {
    const { error } = await addToFavorites(userId, itemId, type)
    return { isFavorited: true, error }
  }
}

/**
 * Get all favorites for a user
 */
export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      artist:artist_profiles(
        id,
        kuenstlername,
        jobbezeichnung,
        profile_image_url,
        stadt,
        star_rating
      ),
      provider:service_provider_profiles(
        id,
        business_name,
        profile_image_url,
        city,
        avg_rating,
        service_category:service_categories(name_de, icon)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: data as FavoriteWithDetails[] | null, error }
}

/**
 * Get favorite artists for a user
 */
export async function getFavoriteArtists(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      artist:artist_profiles(
        id,
        kuenstlername,
        jobbezeichnung,
        profile_image_url,
        stadt,
        region,
        genre,
        star_rating,
        total_ratings,
        preis_pro_stunde,
        preis_pro_veranstaltung
      )
    `)
    .eq('user_id', userId)
    .not('artist_id', 'is', null)
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Get favorite providers for a user
 */
export async function getFavoriteProviders(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      provider:service_provider_profiles(
        id,
        business_name,
        profile_image_url,
        city,
        avg_rating,
        total_reviews,
        min_price,
        max_price,
        pricing_unit,
        is_verified,
        service_category:service_categories(name_de, icon)
      )
    `)
    .eq('user_id', userId)
    .not('provider_id', 'is', null)
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Get count of favorites for a user
 */
export async function getFavoritesCount(userId: string) {
  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return { count: count || 0, error }
}
