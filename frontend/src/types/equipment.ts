// ============================================
// PHASE 13: TECHNICAL REQUIREMENTS TYPES
// Equipment catalog, templates, artist equipment,
// requirements, riders, booking equipment, conflicts
// ============================================

// ============================================
// ENUMS
// ============================================

export type EquipmentCategory =
  | 'audio'
  | 'lighting'
  | 'stage'
  | 'video'
  | 'backline'
  | 'dj_equipment'
  | 'instruments'
  | 'microphones'
  | 'monitoring'
  | 'other';

export type TemplateType =
  | 'dj'
  | 'band'
  | 'solo_artist'
  | 'speaker'
  | 'duo'
  | 'full_band'
  | 'acoustic'
  | 'electronic'
  | 'custom';

export type EquipmentCondition =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'needs_repair';

export type RiderType =
  | 'uploaded'
  | 'generated'
  | 'hybrid';

export type EquipmentSource =
  | 'artist_brings'
  | 'venue_provides'
  | 'rental_needed'
  | 'tbd';

export type BookingEquipmentStatus =
  | 'confirmed'
  | 'pending'
  | 'unavailable'
  | 'alternative_needed';

export type CostResponsibility =
  | 'artist'
  | 'venue'
  | 'split'
  | 'tbd';

export type ConflictType =
  | 'missing_required'
  | 'insufficient_quantity'
  | 'incompatible'
  | 'quality_mismatch';

export type ConflictSeverity =
  | 'critical'
  | 'warning'
  | 'info';

// ============================================
// EQUIPMENT CATALOG (Master list)
// ============================================

export interface EquipmentCatalogItem {
  id: string;
  category: EquipmentCategory;
  subcategory: string | null;
  name: string;
  description: string | null;
  common_brands: string[] | null;
  common_models: string[] | null;
  typical_specs: Record<string, any> | null;
  icon_name: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Grouped by category for UI
export interface EquipmentCatalogGrouped {
  category: EquipmentCategory;
  label: string;
  items: EquipmentCatalogItem[];
}

// ============================================
// EQUIPMENT TEMPLATES
// ============================================

export interface TemplateEquipmentItem {
  name: string;
  category: EquipmentCategory;
  catalog_id?: string;
  quantity: number;
  is_required: boolean;
  notes?: string;
}

export interface EquipmentTemplate {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  template_type: TemplateType;
  equipment_items: TemplateEquipmentItem[];
  icon_name: string | null;
  cover_image: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// ARTIST EQUIPMENT (What artist owns/brings)
// ============================================

export interface ArtistEquipment {
  id: string;
  artist_id: string;
  catalog_id: string | null;
  custom_name: string | null;
  category: EquipmentCategory;
  brand: string | null;
  model: string | null;
  quantity: number;
  condition: EquipmentCondition | null;
  transport_notes: string | null;
  is_available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Joined data
  catalog_item?: EquipmentCatalogItem;
}

export interface ArtistEquipmentInput {
  catalog_id?: string | null;
  custom_name?: string | null;
  category: EquipmentCategory;
  brand?: string | null;
  model?: string | null;
  quantity?: number;
  condition?: EquipmentCondition | null;
  transport_notes?: string | null;
  is_available?: boolean;
  notes?: string | null;
}

// ============================================
// ARTIST REQUIREMENTS (What artist needs)
// ============================================

export interface ArtistRequirement {
  id: string;
  artist_id: string;
  catalog_id: string | null;
  custom_name: string | null;
  category: EquipmentCategory;
  is_required: boolean;
  priority: number; // 1=Critical, 5=Optional
  quantity: number;
  min_specs: string | null;
  preferred_specs: string | null;
  alternatives: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Joined data
  catalog_item?: EquipmentCatalogItem;
}

export interface ArtistRequirementInput {
  catalog_id?: string | null;
  custom_name?: string | null;
  category: EquipmentCategory;
  is_required?: boolean;
  priority?: number;
  quantity?: number;
  min_specs?: string | null;
  preferred_specs?: string | null;
  alternatives?: string | null;
  notes?: string | null;
}

// ============================================
// TECHNICAL RIDERS
// ============================================

export interface InputListChannel {
  channel: number;
  instrument: string;
  mic: string | null;
  stand: string | null;
  di: boolean;
  phantom: boolean;
  notes: string | null;
}

export interface RiderContent {
  stage_width?: number;
  stage_depth?: number;
  power_requirements?: string;
  special_requests?: string[];
  hospitality?: string;
  [key: string]: any;
}

export interface TechnicalRider {
  id: string;
  artist_id: string;
  name: string;
  version: string;
  rider_type: RiderType;
  file_url: string | null;
  content: RiderContent | null;
  stage_plot_url: string | null;
  stage_plot_notes: string | null;
  input_list: InputListChannel[] | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TechnicalRiderInput {
  name?: string;
  version?: string;
  rider_type?: RiderType;
  file_url?: string | null;
  content?: RiderContent | null;
  stage_plot_url?: string | null;
  stage_plot_notes?: string | null;
  input_list?: InputListChannel[] | null;
  is_primary?: boolean;
  is_active?: boolean;
}

// ============================================
// BOOKING EQUIPMENT
// ============================================

export interface BookingEquipment {
  id: string;
  booking_id: string;
  source: EquipmentSource;
  catalog_id: string | null;
  custom_name: string | null;
  category: EquipmentCategory;
  brand: string | null;
  model: string | null;
  quantity: number;
  status: BookingEquipmentStatus;
  estimated_cost: number | null;
  actual_cost: number | null;
  cost_responsibility: CostResponsibility | null;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Joined data
  catalog_item?: EquipmentCatalogItem;
}

export interface BookingEquipmentInput {
  booking_id: string;
  source: EquipmentSource;
  catalog_id?: string | null;
  custom_name?: string | null;
  category: EquipmentCategory;
  brand?: string | null;
  model?: string | null;
  quantity?: number;
  status?: BookingEquipmentStatus;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  cost_responsibility?: CostResponsibility | null;
  notes?: string | null;
}

// ============================================
// EQUIPMENT CONFLICTS
// ============================================

export interface EquipmentConflict {
  id: string;
  booking_id: string;
  conflict_type: ConflictType;
  severity: ConflictSeverity;
  requirement_id: string | null;
  venue_equipment_id: string | null;
  description: string;
  suggested_resolution: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;

  // Joined data
  requirement?: ArtistRequirement;
}

export interface ConflictResolutionInput {
  is_resolved: boolean;
  resolution_notes?: string | null;
}

// ============================================
// EQUIPMENT MATCH RESULT (from RPC function)
// ============================================

export interface EquipmentMatchResult {
  requirement_name: string;
  requirement_category: EquipmentCategory;
  requirement_quantity: number;
  is_required: boolean;
  venue_has: boolean;
  venue_quantity: number;
  status: 'available' | 'missing_required' | 'missing_optional' | 'insufficient';
}

// ============================================
// ARTIST TECH PROFILE (Combined view)
// ============================================

export interface ArtistTechProfile {
  artist_id: string;
  equipment: ArtistEquipment[];
  requirements: ArtistRequirement[];
  riders: TechnicalRider[];
  primary_rider: TechnicalRider | null;
}

// ============================================
// GERMAN LABELS
// ============================================

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  audio: 'Audio',
  lighting: 'Beleuchtung',
  stage: 'Bühne',
  video: 'Video',
  backline: 'Backline',
  dj_equipment: 'DJ Equipment',
  instruments: 'Instrumente',
  microphones: 'Mikrofone',
  monitoring: 'Monitoring',
  other: 'Sonstiges',
};

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  dj: 'DJ',
  band: 'Band',
  solo_artist: 'Solo Künstler',
  speaker: 'Redner',
  duo: 'Duo',
  full_band: 'Vollständige Band',
  acoustic: 'Akustisch',
  electronic: 'Elektronisch',
  custom: 'Individuell',
};

export const EQUIPMENT_CONDITION_LABELS: Record<EquipmentCondition, string> = {
  excellent: 'Ausgezeichnet',
  good: 'Gut',
  fair: 'Befriedigend',
  needs_repair: 'Reparaturbedürftig',
};

export const RIDER_TYPE_LABELS: Record<RiderType, string> = {
  uploaded: 'Hochgeladen',
  generated: 'Generiert',
  hybrid: 'Kombiniert',
};

export const EQUIPMENT_SOURCE_LABELS: Record<EquipmentSource, string> = {
  artist_brings: 'Künstler bringt mit',
  venue_provides: 'Venue stellt bereit',
  rental_needed: 'Muss gemietet werden',
  tbd: 'Noch offen',
};

export const BOOKING_STATUS_LABELS: Record<BookingEquipmentStatus, string> = {
  confirmed: 'Bestätigt',
  pending: 'Ausstehend',
  unavailable: 'Nicht verfügbar',
  alternative_needed: 'Alternative benötigt',
};

export const COST_RESPONSIBILITY_LABELS: Record<CostResponsibility, string> = {
  artist: 'Künstler',
  venue: 'Venue',
  split: 'Geteilt',
  tbd: 'Noch offen',
};

export const CONFLICT_TYPE_LABELS: Record<ConflictType, string> = {
  missing_required: 'Fehlendes Equipment',
  insufficient_quantity: 'Unzureichende Menge',
  incompatible: 'Inkompatibel',
  quality_mismatch: 'Qualitätsunterschied',
};

export const CONFLICT_SEVERITY_LABELS: Record<ConflictSeverity, string> = {
  critical: 'Kritisch',
  warning: 'Warnung',
  info: 'Information',
};

export const PRIORITY_LABELS: Record<number, string> = {
  1: 'Kritisch',
  2: 'Hoch',
  3: 'Mittel',
  4: 'Niedrig',
  5: 'Optional',
};

// ============================================
// ICON MAPPING (Lucide icons)
// ============================================

export const CATEGORY_ICONS: Record<EquipmentCategory, string> = {
  audio: 'Speaker',
  lighting: 'Lightbulb',
  stage: 'Square',
  video: 'Monitor',
  backline: 'Music',
  dj_equipment: 'Disc',
  instruments: 'Guitar',
  microphones: 'Mic',
  monitoring: 'Headphones',
  other: 'Box',
};

export const TEMPLATE_ICONS: Record<TemplateType, string> = {
  dj: 'Disc',
  band: 'Music',
  solo_artist: 'User',
  speaker: 'Mic',
  duo: 'Users',
  full_band: 'Users',
  acoustic: 'Guitar',
  electronic: 'Zap',
  custom: 'Settings',
};
