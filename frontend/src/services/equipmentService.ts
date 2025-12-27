// ============================================
// PHASE 13: EQUIPMENT SERVICE
// CRUD operations for technical requirements
// ============================================

import { supabase } from '@/lib/supabase';
import type {
  EquipmentCatalogItem,
  EquipmentCatalogGrouped,
  EquipmentTemplate,
  ArtistEquipment,
  ArtistEquipmentInput,
  ArtistRequirement,
  ArtistRequirementInput,
  TechnicalRider,
  TechnicalRiderInput,
  BookingEquipment,
  BookingEquipmentInput,
  EquipmentConflict,
  ConflictResolutionInput,
  EquipmentMatchResult,
  ArtistTechProfile,
  EquipmentCategory,
  TemplateType,
} from '@/types/equipment';
import { EQUIPMENT_CATEGORY_LABELS } from '@/types/equipment';

// ============================================
// EQUIPMENT CATALOG
// ============================================

/**
 * Get all equipment catalog items
 */
export async function getEquipmentCatalog(): Promise<EquipmentCatalogItem[]> {
  const { data, error } = await supabase
    .from('equipment_catalog')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get equipment catalog grouped by category
 */
export async function getEquipmentCatalogGrouped(): Promise<EquipmentCatalogGrouped[]> {
  const items = await getEquipmentCatalog();

  const grouped: Record<EquipmentCategory, EquipmentCatalogItem[]> = {} as any;

  items.forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  return Object.entries(grouped).map(([category, items]) => ({
    category: category as EquipmentCategory,
    label: EQUIPMENT_CATEGORY_LABELS[category as EquipmentCategory],
    items,
  }));
}

/**
 * Get equipment catalog by category
 */
export async function getEquipmentByCategory(
  category: EquipmentCategory
): Promise<EquipmentCatalogItem[]> {
  const { data, error } = await supabase
    .from('equipment_catalog')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Search equipment catalog
 */
export async function searchEquipmentCatalog(
  query: string
): Promise<EquipmentCatalogItem[]> {
  const { data, error } = await supabase
    .from('equipment_catalog')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('sort_order', { ascending: true })
    .limit(20);

  if (error) throw error;
  return data || [];
}

// ============================================
// EQUIPMENT TEMPLATES
// ============================================

/**
 * Get all equipment templates
 */
export async function getEquipmentTemplates(): Promise<EquipmentTemplate[]> {
  const { data, error } = await supabase
    .from('equipment_templates')
    .select('*')
    .eq('is_active', true)
    .order('is_system', { ascending: false })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get templates by type
 */
export async function getTemplatesByType(
  templateType: TemplateType
): Promise<EquipmentTemplate[]> {
  const { data, error } = await supabase
    .from('equipment_templates')
    .select('*')
    .eq('template_type', templateType)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get template by slug
 */
export async function getTemplateBySlug(
  slug: string
): Promise<EquipmentTemplate | null> {
  const { data, error } = await supabase
    .from('equipment_templates')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Get template by ID
 */
export async function getTemplateById(
  id: string
): Promise<EquipmentTemplate | null> {
  const { data, error } = await supabase
    .from('equipment_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ============================================
// ARTIST EQUIPMENT (What artist owns)
// ============================================

/**
 * Get artist's equipment
 */
export async function getArtistEquipment(
  artistId: string
): Promise<ArtistEquipment[]> {
  const { data, error } = await supabase
    .from('artist_equipment')
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `)
    .eq('artist_id', artistId)
    .order('category', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get current user's equipment
 */
export async function getMyEquipment(): Promise<ArtistEquipment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return getArtistEquipment(user.id);
}

/**
 * Add equipment to artist
 */
export async function addArtistEquipment(
  input: ArtistEquipmentInput
): Promise<ArtistEquipment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('artist_equipment')
    .insert({
      artist_id: user.id,
      ...input,
    })
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update artist equipment
 */
export async function updateArtistEquipment(
  id: string,
  input: Partial<ArtistEquipmentInput>
): Promise<ArtistEquipment> {
  const { data, error } = await supabase
    .from('artist_equipment')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete artist equipment
 */
export async function deleteArtistEquipment(id: string): Promise<void> {
  const { error } = await supabase
    .from('artist_equipment')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Apply template to artist equipment
 */
export async function applyTemplateToEquipment(
  templateId: string
): Promise<ArtistEquipment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const template = await getTemplateById(templateId);
  if (!template) throw new Error('Template not found');

  const equipmentItems = template.equipment_items.map((item) => ({
    artist_id: user.id,
    catalog_id: item.catalog_id || null,
    custom_name: item.name,
    category: item.category,
    quantity: item.quantity,
    is_available: true,
  }));

  const { data, error } = await supabase
    .from('artist_equipment')
    .insert(equipmentItems)
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `);

  if (error) throw error;
  return data || [];
}

// ============================================
// ARTIST REQUIREMENTS (What artist needs)
// ============================================

/**
 * Get artist's requirements
 */
export async function getArtistRequirements(
  artistId: string
): Promise<ArtistRequirement[]> {
  const { data, error } = await supabase
    .from('artist_requirements')
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `)
    .eq('artist_id', artistId)
    .order('priority', { ascending: true })
    .order('category', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get current user's requirements
 */
export async function getMyRequirements(): Promise<ArtistRequirement[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return getArtistRequirements(user.id);
}

/**
 * Add requirement
 */
export async function addArtistRequirement(
  input: ArtistRequirementInput
): Promise<ArtistRequirement> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('artist_requirements')
    .insert({
      artist_id: user.id,
      ...input,
    })
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update requirement
 */
export async function updateArtistRequirement(
  id: string,
  input: Partial<ArtistRequirementInput>
): Promise<ArtistRequirement> {
  const { data, error } = await supabase
    .from('artist_requirements')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete requirement
 */
export async function deleteArtistRequirement(id: string): Promise<void> {
  const { error } = await supabase
    .from('artist_requirements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Apply template to requirements
 */
export async function applyTemplateToRequirements(
  templateId: string
): Promise<ArtistRequirement[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const template = await getTemplateById(templateId);
  if (!template) throw new Error('Template not found');

  const requirements = template.equipment_items.map((item) => ({
    artist_id: user.id,
    catalog_id: item.catalog_id || null,
    custom_name: item.name,
    category: item.category,
    is_required: item.is_required,
    priority: item.is_required ? 1 : 3,
    quantity: item.quantity,
    notes: item.notes || null,
  }));

  const { data, error } = await supabase
    .from('artist_requirements')
    .insert(requirements)
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `);

  if (error) throw error;
  return data || [];
}

// ============================================
// TECHNICAL RIDERS
// ============================================

/**
 * Get artist's riders
 */
export async function getArtistRiders(
  artistId: string
): Promise<TechnicalRider[]> {
  const { data, error } = await supabase
    .from('technical_riders')
    .select('*')
    .eq('artist_id', artistId)
    .eq('is_active', true)
    .order('is_primary', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get current user's riders
 */
export async function getMyRiders(): Promise<TechnicalRider[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return getArtistRiders(user.id);
}

/**
 * Get primary rider
 */
export async function getPrimaryRider(
  artistId: string
): Promise<TechnicalRider | null> {
  const { data, error } = await supabase
    .from('technical_riders')
    .select('*')
    .eq('artist_id', artistId)
    .eq('is_primary', true)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Get rider by ID
 */
export async function getRiderById(
  id: string
): Promise<TechnicalRider | null> {
  const { data, error } = await supabase
    .from('technical_riders')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Create rider
 */
export async function createRider(
  input: TechnicalRiderInput
): Promise<TechnicalRider> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // If setting as primary, unset other primary riders
  if (input.is_primary) {
    await supabase
      .from('technical_riders')
      .update({ is_primary: false })
      .eq('artist_id', user.id);
  }

  const { data, error } = await supabase
    .from('technical_riders')
    .insert({
      artist_id: user.id,
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update rider
 */
export async function updateRider(
  id: string,
  input: Partial<TechnicalRiderInput>
): Promise<TechnicalRider> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // If setting as primary, unset other primary riders
  if (input.is_primary) {
    await supabase
      .from('technical_riders')
      .update({ is_primary: false })
      .eq('artist_id', user.id)
      .neq('id', id);
  }

  const { data, error } = await supabase
    .from('technical_riders')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete rider
 */
export async function deleteRider(id: string): Promise<void> {
  const { error } = await supabase
    .from('technical_riders')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Upload rider PDF
 */
export async function uploadRiderPDF(
  file: File
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('riders')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('riders')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Upload stage plot image
 */
export async function uploadStagePlot(
  file: File
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/stage-plot-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('riders')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('riders')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// ============================================
// BOOKING EQUIPMENT
// ============================================

/**
 * Get booking equipment
 */
export async function getBookingEquipment(
  bookingId: string
): Promise<BookingEquipment[]> {
  const { data, error } = await supabase
    .from('booking_equipment')
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `)
    .eq('booking_id', bookingId)
    .order('source', { ascending: true })
    .order('category', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Add booking equipment
 */
export async function addBookingEquipment(
  input: BookingEquipmentInput
): Promise<BookingEquipment> {
  const { data, error } = await supabase
    .from('booking_equipment')
    .insert(input)
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update booking equipment
 */
export async function updateBookingEquipment(
  id: string,
  input: Partial<BookingEquipmentInput>
): Promise<BookingEquipment> {
  const { data, error } = await supabase
    .from('booking_equipment')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete booking equipment
 */
export async function deleteBookingEquipment(id: string): Promise<void> {
  const { error } = await supabase
    .from('booking_equipment')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Initialize booking equipment from artist requirements and venue equipment
 */
export async function initializeBookingEquipment(
  bookingId: string,
  artistId: string,
  venueId: string
): Promise<BookingEquipment[]> {
  // Get artist requirements
  const requirements = await getArtistRequirements(artistId);

  // Get venue equipment
  const { data: venueEquipment } = await supabase
    .from('venue_equipment')
    .select('*')
    .eq('venue_id', venueId);

  const bookingItems: BookingEquipmentInput[] = [];

  for (const req of requirements) {
    // Check if venue has this equipment
    const venueHas = venueEquipment?.find(
      (ve) => ve.category === req.category ||
              ve.name?.toLowerCase().includes((req.custom_name || '').toLowerCase())
    );

    bookingItems.push({
      booking_id: bookingId,
      source: venueHas ? 'venue_provides' : 'tbd',
      catalog_id: req.catalog_id,
      custom_name: req.custom_name,
      category: req.category,
      quantity: req.quantity,
      status: venueHas ? 'pending' : 'alternative_needed',
    });
  }

  if (bookingItems.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('booking_equipment')
    .insert(bookingItems)
    .select(`
      *,
      catalog_item:equipment_catalog(*)
    `);

  if (error) throw error;
  return data || [];
}

// ============================================
// EQUIPMENT CONFLICTS
// ============================================

/**
 * Get booking conflicts
 */
export async function getBookingConflicts(
  bookingId: string
): Promise<EquipmentConflict[]> {
  const { data, error } = await supabase
    .from('equipment_conflicts')
    .select(`
      *,
      requirement:artist_requirements(*)
    `)
    .eq('booking_id', bookingId)
    .order('severity', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Check and create conflicts for booking
 */
export async function checkBookingConflicts(
  bookingId: string
): Promise<EquipmentConflict[]> {
  const { data, error } = await supabase
    .rpc('check_booking_conflicts', { p_booking_id: bookingId });

  if (error) throw error;
  return data || [];
}

/**
 * Resolve conflict
 */
export async function resolveConflict(
  id: string,
  input: ConflictResolutionInput
): Promise<EquipmentConflict> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('equipment_conflicts')
    .update({
      is_resolved: input.is_resolved,
      resolution_notes: input.resolution_notes,
      resolved_at: input.is_resolved ? new Date().toISOString() : null,
      resolved_by: input.is_resolved ? user.id : null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// EQUIPMENT MATCHING (RPC)
// ============================================

/**
 * Match artist requirements with venue equipment
 */
export async function matchEquipment(
  artistId: string,
  venueId: string
): Promise<EquipmentMatchResult[]> {
  const { data, error } = await supabase
    .rpc('match_equipment', {
      p_artist_id: artistId,
      p_venue_id: venueId,
    });

  if (error) throw error;
  return data || [];
}

// ============================================
// ARTIST TECH PROFILE (Combined)
// ============================================

/**
 * Get complete artist tech profile
 */
export async function getArtistTechProfile(
  artistId: string
): Promise<ArtistTechProfile> {
  const [equipment, requirements, riders] = await Promise.all([
    getArtistEquipment(artistId),
    getArtistRequirements(artistId),
    getArtistRiders(artistId),
  ]);

  const primaryRider = riders.find((r) => r.is_primary) || null;

  return {
    artist_id: artistId,
    equipment,
    requirements,
    riders,
    primary_rider: primaryRider,
  };
}

/**
 * Get current user's tech profile
 */
export async function getMyTechProfile(): Promise<ArtistTechProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return getArtistTechProfile(user.id);
}

/**
 * Clear all artist requirements (before applying template)
 */
export async function clearArtistRequirements(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('artist_requirements')
    .delete()
    .eq('artist_id', user.id);

  if (error) throw error;
}

/**
 * Clear all artist equipment (before applying template)
 */
export async function clearArtistEquipment(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('artist_equipment')
    .delete()
    .eq('artist_id', user.id);

  if (error) throw error;
}
