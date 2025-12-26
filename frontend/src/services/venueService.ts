// ============================================
// PHASE 12: VENUE SERVICE LAYER
// ============================================

import { supabase } from '@/lib/supabase';
import type {
  Venue,
  VenueCreateInput,
  VenueUpdateInput,
  VenueGalleryItem,
  VenueEquipment,
  VenueEquipmentInput,
  VenueRoom,
  VenueRoomInput,
  VenueHours,
  VenueHoursInput,
  VenueSpecialHours,
  VenueAmenity,
  VenueStaff,
  VenueReview,
  VenueReviewInput,
  VenueRating,
  VenueFavorite,
  VenueSearchParams,
  VenueSearchResult,
  VenueCardData,
} from '@/types/venue';

// ============================================
// VENUE CRUD OPERATIONS
// ============================================

/**
 * Create a new venue
 */
export async function createVenue(input: VenueCreateInput): Promise<Venue> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('venues')
    .insert({
      ...input,
      owner_id: user.user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get venue by ID
 */
export async function getVenueById(id: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Get venue by slug
 */
export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Get full venue profile with all relations
 */
export async function getVenueProfile(slug: string): Promise<Venue | null> {
  const { data: venue, error } = await supabase
    .from('venues')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !venue) return null;

  // Fetch all related data in parallel
  const [gallery, equipment, rooms, hours, amenities, reviews, rating] = await Promise.all([
    getVenueGallery(venue.id),
    getVenueEquipment(venue.id),
    getVenueRooms(venue.id),
    getVenueHours(venue.id),
    getVenueAmenities(venue.id),
    getVenueReviews(venue.id),
    getVenueRating(venue.id),
  ]);

  return {
    ...venue,
    gallery,
    equipment,
    rooms,
    hours,
    amenities,
    reviews,
    rating,
  };
}

/**
 * Update venue
 */
export async function updateVenue(input: VenueUpdateInput): Promise<Venue> {
  const { id, ...updates } = input;

  const { data, error } = await supabase
    .from('venues')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete venue (soft delete - sets is_active to false)
 */
export async function deleteVenue(id: string): Promise<void> {
  const { error } = await supabase
    .from('venues')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Get venues owned by current user
 */
export async function getMyVenues(): Promise<Venue[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('owner_id', user.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ============================================
// VENUE SEARCH
// ============================================

/**
 * Search venues with filters
 */
export async function searchVenues(params: VenueSearchParams): Promise<VenueSearchResult> {
  const {
    query,
    venue_type,
    city,
    min_capacity,
    max_capacity,
    price_range,
    is_verified,
    sort_by = 'created_at',
    sort_order = 'desc',
    page = 1,
    limit = 12,
  } = params;

  let queryBuilder = supabase
    .from('venues')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  // Apply filters
  if (query) {
    queryBuilder = queryBuilder.or(
      `name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`
    );
  }
  if (venue_type) {
    queryBuilder = queryBuilder.eq('venue_type', venue_type);
  }
  if (city) {
    queryBuilder = queryBuilder.ilike('city', `%${city}%`);
  }
  if (min_capacity) {
    queryBuilder = queryBuilder.gte('capacity_max', min_capacity);
  }
  if (max_capacity) {
    queryBuilder = queryBuilder.lte('capacity_min', max_capacity);
  }
  if (price_range) {
    queryBuilder = queryBuilder.eq('price_range', price_range);
  }
  if (is_verified !== undefined) {
    queryBuilder = queryBuilder.eq('is_verified', is_verified);
  }

  // Apply sorting
  const ascending = sort_order === 'asc';
  queryBuilder = queryBuilder.order(sort_by, { ascending });

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  queryBuilder = queryBuilder.range(from, to);

  const { data, error, count } = await queryBuilder;

  if (error) throw error;

  return {
    venues: data || [],
    total: count || 0,
    page,
    limit,
    has_more: (count || 0) > page * limit,
  };
}

/**
 * Get featured venues
 */
export async function getFeaturedVenues(limit = 6): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get venues for map view
 */
export async function getVenuesForMap(): Promise<VenueCardData[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, slug, tagline, city, venue_type, capacity_max, cover_image, is_verified, latitude, longitude')
    .eq('is_active', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) throw error;
  return data || [];
}

// ============================================
// VENUE GALLERY
// ============================================

/**
 * Get venue gallery images
 */
export async function getVenueGallery(venueId: string): Promise<VenueGalleryItem[]> {
  const { data, error } = await supabase
    .from('venue_gallery')
    .select('*')
    .eq('venue_id', venueId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Add image to venue gallery
 */
export async function addVenueGalleryImage(
  venueId: string,
  imageUrl: string,
  caption?: string,
  isCover = false
): Promise<VenueGalleryItem> {
  // If setting as cover, unset other covers
  if (isCover) {
    await supabase
      .from('venue_gallery')
      .update({ is_cover: false })
      .eq('venue_id', venueId);
  }

  const { data, error } = await supabase
    .from('venue_gallery')
    .insert({
      venue_id: venueId,
      image_url: imageUrl,
      caption,
      is_cover: isCover,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete gallery image
 */
export async function deleteVenueGalleryImage(imageId: string): Promise<void> {
  const { error } = await supabase
    .from('venue_gallery')
    .delete()
    .eq('id', imageId);

  if (error) throw error;
}

/**
 * Reorder gallery images
 */
export async function reorderVenueGallery(
  venueId: string,
  imageIds: string[]
): Promise<void> {
  const updates = imageIds.map((id, index) => ({
    id,
    sort_order: index,
  }));

  for (const update of updates) {
    await supabase
      .from('venue_gallery')
      .update({ sort_order: update.sort_order })
      .eq('id', update.id);
  }
}

// ============================================
// VENUE EQUIPMENT
// ============================================

/**
 * Get venue equipment
 */
export async function getVenueEquipment(venueId: string): Promise<VenueEquipment[]> {
  const { data, error } = await supabase
    .from('venue_equipment')
    .select('*')
    .eq('venue_id', venueId)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Add equipment to venue
 */
export async function addVenueEquipment(input: VenueEquipmentInput): Promise<VenueEquipment> {
  const { data, error } = await supabase
    .from('venue_equipment')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update equipment
 */
export async function updateVenueEquipment(
  id: string,
  updates: Partial<VenueEquipmentInput>
): Promise<VenueEquipment> {
  const { data, error } = await supabase
    .from('venue_equipment')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete equipment
 */
export async function deleteVenueEquipment(id: string): Promise<void> {
  const { error } = await supabase
    .from('venue_equipment')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// VENUE ROOMS
// ============================================

/**
 * Get venue rooms
 */
export async function getVenueRooms(venueId: string): Promise<VenueRoom[]> {
  const { data, error } = await supabase
    .from('venue_rooms')
    .select('*')
    .eq('venue_id', venueId)
    .order('room_type', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Add room to venue
 */
export async function addVenueRoom(input: VenueRoomInput): Promise<VenueRoom> {
  const { data, error } = await supabase
    .from('venue_rooms')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update room
 */
export async function updateVenueRoom(
  id: string,
  updates: Partial<VenueRoomInput>
): Promise<VenueRoom> {
  const { data, error } = await supabase
    .from('venue_rooms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete room
 */
export async function deleteVenueRoom(id: string): Promise<void> {
  const { error } = await supabase
    .from('venue_rooms')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// VENUE HOURS
// ============================================

/**
 * Get venue hours
 */
export async function getVenueHours(venueId: string): Promise<VenueHours[]> {
  const { data, error } = await supabase
    .from('venue_hours')
    .select('*')
    .eq('venue_id', venueId)
    .order('day_of_week', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Set venue hours (upsert)
 */
export async function setVenueHours(input: VenueHoursInput): Promise<VenueHours> {
  const { data, error } = await supabase
    .from('venue_hours')
    .upsert(input, {
      onConflict: 'venue_id,day_of_week',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Set all venue hours at once
 */
export async function setAllVenueHours(
  venueId: string,
  hours: Omit<VenueHoursInput, 'venue_id'>[]
): Promise<VenueHours[]> {
  const inputs = hours.map((h) => ({ ...h, venue_id: venueId }));

  const { data, error } = await supabase
    .from('venue_hours')
    .upsert(inputs, {
      onConflict: 'venue_id,day_of_week',
    })
    .select();

  if (error) throw error;
  return data || [];
}

/**
 * Get special hours for a venue
 */
export async function getVenueSpecialHours(
  venueId: string,
  startDate?: string,
  endDate?: string
): Promise<VenueSpecialHours[]> {
  let query = supabase
    .from('venue_special_hours')
    .select('*')
    .eq('venue_id', venueId)
    .order('date', { ascending: true });

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Add special hours
 */
export async function addVenueSpecialHours(
  venueId: string,
  date: string,
  openTime?: string,
  closeTime?: string,
  isClosed = false,
  reason?: string
): Promise<VenueSpecialHours> {
  const { data, error } = await supabase
    .from('venue_special_hours')
    .insert({
      venue_id: venueId,
      date,
      open_time: openTime,
      close_time: closeTime,
      is_closed: isClosed,
      reason,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// VENUE AMENITIES
// ============================================

/**
 * Get venue amenities
 */
export async function getVenueAmenities(venueId: string): Promise<VenueAmenity[]> {
  const { data, error } = await supabase
    .from('venue_amenities')
    .select('*')
    .eq('venue_id', venueId)
    .order('category', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Add amenity to venue
 */
export async function addVenueAmenity(
  venueId: string,
  category: string,
  name: string,
  description?: string,
  isIncluded = true,
  extraCost?: number
): Promise<VenueAmenity> {
  const { data, error } = await supabase
    .from('venue_amenities')
    .insert({
      venue_id: venueId,
      category,
      name,
      description,
      is_included: isIncluded,
      extra_cost: extraCost,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete amenity
 */
export async function deleteVenueAmenity(id: string): Promise<void> {
  const { error } = await supabase
    .from('venue_amenities')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// VENUE STAFF
// ============================================

/**
 * Get venue staff (owner only)
 */
export async function getVenueStaff(venueId: string): Promise<VenueStaff[]> {
  const { data, error } = await supabase
    .from('venue_staff')
    .select('*')
    .eq('venue_id', venueId)
    .order('is_primary_contact', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Add staff member
 */
export async function addVenueStaff(
  venueId: string,
  name: string,
  role?: string,
  email?: string,
  phone?: string,
  isPrimaryContact = false
): Promise<VenueStaff> {
  const { data, error } = await supabase
    .from('venue_staff')
    .insert({
      venue_id: venueId,
      name,
      role,
      email,
      phone,
      is_primary_contact: isPrimaryContact,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update staff member
 */
export async function updateVenueStaff(
  id: string,
  updates: Partial<Omit<VenueStaff, 'id' | 'venue_id' | 'created_at'>>
): Promise<VenueStaff> {
  const { data, error } = await supabase
    .from('venue_staff')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete staff member
 */
export async function deleteVenueStaff(id: string): Promise<void> {
  const { error } = await supabase
    .from('venue_staff')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// VENUE REVIEWS
// ============================================

/**
 * Get venue reviews
 */
export async function getVenueReviews(venueId: string): Promise<VenueReview[]> {
  const { data, error } = await supabase
    .from('venue_reviews')
    .select(`
      *,
      reviewer:profiles(id, display_name, avatar_url)
    `)
    .eq('venue_id', venueId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get venue rating (aggregated)
 */
export async function getVenueRating(venueId: string): Promise<VenueRating | null> {
  const { data, error } = await supabase
    .rpc('get_venue_rating', { venue_uuid: venueId });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return data[0];
}

/**
 * Create venue review
 */
export async function createVenueReview(input: VenueReviewInput): Promise<VenueReview> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('venue_reviews')
    .insert({
      ...input,
      reviewer_id: user.user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update venue review
 */
export async function updateVenueReview(
  id: string,
  updates: Partial<VenueReviewInput>
): Promise<VenueReview> {
  const { data, error } = await supabase
    .from('venue_reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Respond to review (venue owner)
 */
export async function respondToVenueReview(
  reviewId: string,
  response: string
): Promise<VenueReview> {
  const { data, error } = await supabase
    .from('venue_reviews')
    .update({
      response,
      response_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// VENUE FAVORITES
// ============================================

/**
 * Check if venue is favorited
 */
export async function isVenueFavorited(venueId: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const { data, error } = await supabase
    .from('venue_favorites')
    .select('id')
    .eq('user_id', user.user.id)
    .eq('venue_id', venueId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

/**
 * Toggle venue favorite
 */
export async function toggleVenueFavorite(venueId: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const isFavorited = await isVenueFavorited(venueId);

  if (isFavorited) {
    // Remove favorite
    const { error } = await supabase
      .from('venue_favorites')
      .delete()
      .eq('user_id', user.user.id)
      .eq('venue_id', venueId);

    if (error) throw error;
    return false;
  } else {
    // Add favorite
    const { error } = await supabase
      .from('venue_favorites')
      .insert({
        user_id: user.user.id,
        venue_id: venueId,
      });

    if (error) throw error;
    return true;
  }
}

/**
 * Get user's favorite venues
 */
export async function getMyFavoriteVenues(): Promise<Venue[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data, error } = await supabase
    .from('venue_favorites')
    .select(`
      venue:venues(*)
    `)
    .eq('user_id', user.user.id);

  if (error) throw error;
  return data?.map((f: { venue: Venue }) => f.venue).filter(Boolean) || [];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Upload venue image to storage
 */
export async function uploadVenueImage(
  venueId: string,
  file: File,
  type: 'cover' | 'logo' | 'gallery' = 'gallery'
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${venueId}/${type}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('venues')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('venues').getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Delete venue image from storage
 */
export async function deleteVenueImage(imageUrl: string): Promise<void> {
  const path = imageUrl.split('/venues/')[1];
  if (!path) return;

  const { error } = await supabase.storage.from('venues').remove([path]);
  if (error) throw error;
}
