import { supabase } from '../lib/supabase'

export interface ServiceProviderFilters {
  category?: string
  city?: string
  radiusKm?: number
  priceRange?: string
  minGuests?: number
  maxGuests?: number
  searchQuery?: string
  limit?: number
  offset?: number
}

export interface ServiceCategory {
  id: string
  name: string
  name_de: string
  slug: string
  icon: string | null
  description: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
}

export interface ServiceProviderListItem {
  id: string
  user_id: string
  business_name: string
  description: string | null
  city: string | null
  postal_code: string | null
  country: string
  service_radius_km: number
  profile_image_url: string | null
  gallery_urls: string[] | null
  price_range: string | null
  min_price: number | null
  max_price: number | null
  min_guests: number | null
  max_guests: number | null
  avg_rating: number
  total_reviews: number
  is_verified: boolean
  is_newcomer: boolean
  service_category: ServiceCategory | null
}

// Get service categories
export async function getServiceCategories() {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  return { data, error }
}

// Get service providers with filters
export async function getServiceProviders(filters: ServiceProviderFilters = {}) {
  let query = supabase
    .from('service_provider_profiles')
    .select(`
      *,
      service_categories (
        id,
        name,
        name_de,
        slug,
        icon
      )
    `)
    .eq('profile_completed', true)

  // Apply filters
  if (filters.category) {
    // Filter by category ID
    query = query.eq('service_category_id', filters.category)
  }

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  if (filters.priceRange) {
    query = query.eq('price_range', filters.priceRange)
  }

  if (filters.minGuests !== undefined) {
    query = query.gte('max_guests', filters.minGuests)
  }

  if (filters.maxGuests !== undefined) {
    query = query.lte('min_guests', filters.maxGuests)
  }

  if (filters.searchQuery) {
    query = query.or(`business_name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`)
  }

  // Pagination
  const limit = filters.limit || 20
  const offset = filters.offset || 0
  query = query.range(offset, offset + limit - 1)

  // Order: newcomers first, then by rating
  query = query.order('is_newcomer', { ascending: false })
    .order('avg_rating', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching service providers:', error)
    return { data: null, error }
  }

  // Transform data to flatten service_categories
  const transformedData = data?.map(provider => ({
    ...provider,
    service_category: provider.service_categories,
    service_categories: undefined,
  })) || []

  return { data: transformedData, error: null }
}

// Get single service provider by ID
export async function getServiceProviderById(providerId: string) {
  const { data, error } = await supabase
    .from('service_provider_profiles')
    .select(`
      *,
      service_categories (
        id,
        name,
        name_de,
        slug,
        icon,
        description
      )
    `)
    .eq('id', providerId)
    .single()

  if (error) {
    console.error('Error fetching service provider:', error)
    return { data: null, error }
  }

  return {
    data: {
      ...data,
      service_category: data.service_categories,
      service_categories: undefined,
    },
    error: null
  }
}

// Get provider availability
export async function getProviderAvailability(providerId: string, month?: number, year?: number) {
  const now = new Date()
  const targetMonth = month ?? now.getMonth() + 1
  const targetYear = year ?? now.getFullYear()

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`
  const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('provider_availability')
    .select('*')
    .eq('provider_id', providerId)
    .eq('provider_type', 'service_provider')
    .gte('date', startDate)
    .lte('date', endDate)

  return { data, error }
}

// Get unique cities for filter
export async function getProviderCities() {
  const { data, error } = await supabase
    .from('service_provider_profiles')
    .select('city')
    .eq('profile_completed', true)
    .not('city', 'is', null)

  if (error || !data) return { data: [], error }

  const uniqueCities = [...new Set(data.map(d => d.city))].filter(Boolean).sort()

  return { data: uniqueCities as string[], error: null }
}
