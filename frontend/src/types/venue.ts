// ============================================
// PHASE 12: VENUE SYSTEM TYPES
// ============================================

// Venue Type Enum
export type VenueType =
  | 'club'
  | 'bar'
  | 'concert_hall'
  | 'theater'
  | 'outdoor'
  | 'festival'
  | 'private_venue'
  | 'restaurant'
  | 'hotel'
  | 'other';

// Price Range Enum
export type PriceRange = 'budget' | 'moderate' | 'premium' | 'luxury';

// Equipment Category Enum
export type EquipmentCategory =
  | 'audio'
  | 'lighting'
  | 'stage'
  | 'video'
  | 'backline'
  | 'dj_equipment'
  | 'other';

// Equipment Condition Enum
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'needs_maintenance';

// Room Type Enum
export type RoomType =
  | 'main_hall'
  | 'stage'
  | 'greenroom'
  | 'dressing_room'
  | 'vip_lounge'
  | 'backstage'
  | 'storage'
  | 'office'
  | 'other';

// Amenity Category Enum
export type AmenityCategory =
  | 'parking'
  | 'accessibility'
  | 'catering'
  | 'security'
  | 'technical'
  | 'comfort'
  | 'other';

// ============================================
// MAIN VENUE INTERFACE
// ============================================

export interface Venue {
  id: string;
  owner_id: string;

  // Basic Info
  name: string;
  slug: string;
  tagline?: string;
  description?: string;

  // Location
  address?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;

  // Contact
  phone?: string;
  email?: string;
  website?: string;

  // Social Media
  instagram?: string;
  facebook?: string;
  tiktok?: string;

  // Venue Details
  venue_type?: VenueType;
  capacity_min?: number;
  capacity_max?: number;
  price_range?: PriceRange;

  // Media
  cover_image?: string;
  logo_url?: string;

  // Status
  is_verified: boolean;
  is_active: boolean;
  is_featured: boolean;

  // Metadata
  created_at: string;
  updated_at: string;

  // Relations (populated via joins)
  gallery?: VenueGalleryItem[];
  equipment?: VenueEquipment[];
  rooms?: VenueRoom[];
  hours?: VenueHours[];
  amenities?: VenueAmenity[];
  reviews?: VenueReview[];
  rating?: VenueRating;
}

// ============================================
// VENUE GALLERY
// ============================================

export interface VenueGalleryItem {
  id: string;
  venue_id: string;
  image_url: string;
  caption?: string;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
}

// ============================================
// VENUE EQUIPMENT
// ============================================

export interface VenueEquipment {
  id: string;
  venue_id: string;
  category: EquipmentCategory;
  name: string;
  brand?: string;
  model?: string;
  quantity: number;
  condition?: EquipmentCondition;
  is_included: boolean;
  extra_cost?: number;
  specifications?: string;
  notes?: string;
  created_at: string;
}

// Equipment grouped by category (for display)
export interface VenueEquipmentGrouped {
  audio: VenueEquipment[];
  lighting: VenueEquipment[];
  stage: VenueEquipment[];
  video: VenueEquipment[];
  backline: VenueEquipment[];
  dj_equipment: VenueEquipment[];
  other: VenueEquipment[];
}

// ============================================
// VENUE ROOMS
// ============================================

export interface VenueRoom {
  id: string;
  venue_id: string;
  name: string;
  room_type: RoomType;
  capacity?: number;
  size_sqm?: number;
  floor_level: number;
  has_bathroom: boolean;
  has_shower: boolean;
  has_mirror: boolean;
  has_wifi: boolean;
  has_ac: boolean;
  amenities: string[];
  photos: string[];
  description?: string;
  created_at: string;
}

// ============================================
// VENUE HOURS
// ============================================

export interface VenueHours {
  id: string;
  venue_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  open_time?: string; // "HH:MM:SS"
  close_time?: string; // "HH:MM:SS"
  is_closed: boolean;
  notes?: string;
  created_at: string;
}

export interface VenueSpecialHours {
  id: string;
  venue_id: string;
  date: string; // "YYYY-MM-DD"
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
  reason?: string;
  created_at: string;
}

// Formatted hours for display
export interface VenueHoursFormatted {
  day: string; // "Monday", "Tuesday", etc.
  hours: string; // "18:00 - 02:00" or "Geschlossen"
  isToday: boolean;
}

// ============================================
// VENUE AMENITIES
// ============================================

export interface VenueAmenity {
  id: string;
  venue_id: string;
  category: AmenityCategory;
  name: string;
  description?: string;
  is_included: boolean;
  extra_cost?: number;
  created_at: string;
}

// Amenities grouped by category
export interface VenueAmenitiesGrouped {
  parking: VenueAmenity[];
  accessibility: VenueAmenity[];
  catering: VenueAmenity[];
  security: VenueAmenity[];
  technical: VenueAmenity[];
  comfort: VenueAmenity[];
  other: VenueAmenity[];
}

// ============================================
// VENUE STAFF
// ============================================

export interface VenueStaff {
  id: string;
  venue_id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  is_primary_contact: boolean;
  created_at: string;
}

// ============================================
// VENUE REVIEWS
// ============================================

export interface VenueReview {
  id: string;
  venue_id: string;
  reviewer_id: string;
  booking_id?: string;

  // Ratings
  rating: number; // 1-5
  communication_rating?: number;
  hospitality_rating?: number;
  equipment_rating?: number;
  ambience_rating?: number;

  // Content
  title?: string;
  content?: string;

  // Response
  response?: string;
  response_at?: string;

  // Status
  is_verified: boolean;
  is_visible: boolean;

  // Metadata
  created_at: string;
  updated_at: string;

  // Relations
  reviewer?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

// Aggregated rating data
export interface VenueRating {
  avg_rating: number;
  total_reviews: number;
  avg_communication: number;
  avg_hospitality: number;
  avg_equipment: number;
  avg_ambience: number;
}

// ============================================
// VENUE FAVORITES
// ============================================

export interface VenueFavorite {
  id: string;
  user_id: string;
  venue_id: string;
  created_at: string;
  venue?: Venue; // Populated via join
}

// ============================================
// FORM TYPES (for creating/updating)
// ============================================

export interface VenueCreateInput {
  name: string;
  tagline?: string;
  description?: string;
  venue_type?: VenueType;
  address?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  capacity_min?: number;
  capacity_max?: number;
  price_range?: PriceRange;
  cover_image?: string;
  logo_url?: string;
}

export interface VenueUpdateInput extends Partial<VenueCreateInput> {
  id: string;
}

export interface VenueEquipmentInput {
  venue_id: string;
  category: EquipmentCategory;
  name: string;
  brand?: string;
  model?: string;
  quantity?: number;
  condition?: EquipmentCondition;
  is_included?: boolean;
  extra_cost?: number;
  specifications?: string;
  notes?: string;
}

export interface VenueRoomInput {
  venue_id: string;
  name: string;
  room_type: RoomType;
  capacity?: number;
  size_sqm?: number;
  floor_level?: number;
  has_bathroom?: boolean;
  has_shower?: boolean;
  has_mirror?: boolean;
  has_wifi?: boolean;
  has_ac?: boolean;
  amenities?: string[];
  description?: string;
}

export interface VenueHoursInput {
  venue_id: string;
  day_of_week: number;
  open_time?: string;
  close_time?: string;
  is_closed?: boolean;
  notes?: string;
}

export interface VenueReviewInput {
  venue_id: string;
  booking_id?: string;
  rating: number;
  communication_rating?: number;
  hospitality_rating?: number;
  equipment_rating?: number;
  ambience_rating?: number;
  title?: string;
  content?: string;
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================

export interface VenueSearchParams {
  query?: string;
  venue_type?: VenueType;
  city?: string;
  min_capacity?: number;
  max_capacity?: number;
  price_range?: PriceRange;
  has_equipment?: EquipmentCategory[];
  is_verified?: boolean;
  sort_by?: 'name' | 'rating' | 'capacity' | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface VenueSearchResult {
  venues: Venue[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// ============================================
// UI HELPER TYPES
// ============================================

// For venue cards in listings
export interface VenueCardData {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  city?: string;
  venue_type?: VenueType;
  capacity_max?: number;
  cover_image?: string;
  is_verified: boolean;
  rating?: number;
  total_reviews?: number;
  latitude?: number;
  longitude?: number;
}

// Day names in German
export const DAY_NAMES_DE = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
] as const;

// Venue type labels in German
export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  club: 'Club',
  bar: 'Bar',
  concert_hall: 'Konzerthalle',
  theater: 'Theater',
  outdoor: 'Open Air',
  festival: 'Festival',
  private_venue: 'Private Location',
  restaurant: 'Restaurant',
  hotel: 'Hotel',
  other: 'Sonstiges',
};

// Equipment category labels in German
export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  audio: 'Audio',
  lighting: 'Beleuchtung',
  stage: 'Bühne',
  video: 'Video',
  backline: 'Backline',
  dj_equipment: 'DJ Equipment',
  other: 'Sonstiges',
};

// Room type labels in German
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  main_hall: 'Hauptraum',
  stage: 'Bühne',
  greenroom: 'Greenroom',
  dressing_room: 'Garderobe',
  vip_lounge: 'VIP Lounge',
  backstage: 'Backstage',
  storage: 'Lager',
  office: 'Büro',
  other: 'Sonstiges',
};

// Price range labels in German
export const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  budget: 'Budget',
  moderate: 'Moderat',
  premium: 'Premium',
  luxury: 'Luxus',
};

// Amenity category labels in German
export const AMENITY_CATEGORY_LABELS: Record<AmenityCategory, string> = {
  parking: 'Parken',
  accessibility: 'Barrierefreiheit',
  catering: 'Catering',
  security: 'Sicherheit',
  technical: 'Technik',
  comfort: 'Komfort',
  other: 'Sonstiges',
};
