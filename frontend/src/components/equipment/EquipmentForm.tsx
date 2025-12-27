// ============================================
// EQUIPMENT FORM
// Add/edit equipment or requirement
// ============================================

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import type {
  EquipmentCategory,
  EquipmentCondition,
  ArtistEquipmentInput,
  ArtistRequirementInput,
  EquipmentCatalogItem
} from '@/types/equipment';
import {
  EQUIPMENT_CATEGORY_LABELS,
  EQUIPMENT_CONDITION_LABELS,
  PRIORITY_LABELS,
} from '@/types/equipment';

type FormMode = 'equipment' | 'requirement';

interface EquipmentFormProps {
  mode: FormMode;
  initialData?: Partial<ArtistEquipmentInput | ArtistRequirementInput>;
  catalogItem?: EquipmentCatalogItem;
  onSubmit: (data: ArtistEquipmentInput | ArtistRequirementInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  isEditing?: boolean;
}

export function EquipmentForm({
  mode,
  initialData,
  catalogItem,
  onSubmit,
  onCancel,
  onDelete,
  isEditing = false,
}: EquipmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    catalog_id: catalogItem?.id || initialData?.catalog_id || null,
    custom_name: catalogItem?.name || initialData?.custom_name || '',
    category: catalogItem?.category || initialData?.category || 'audio' as EquipmentCategory,
    brand: (initialData as ArtistEquipmentInput)?.brand || '',
    model: (initialData as ArtistEquipmentInput)?.model || '',
    quantity: initialData?.quantity || 1,
    condition: (initialData as ArtistEquipmentInput)?.condition || 'good' as EquipmentCondition,
    transport_notes: (initialData as ArtistEquipmentInput)?.transport_notes || '',
    is_available: (initialData as ArtistEquipmentInput)?.is_available ?? true,
    is_required: (initialData as ArtistRequirementInput)?.is_required ?? true,
    priority: (initialData as ArtistRequirementInput)?.priority || 2,
    min_specs: (initialData as ArtistRequirementInput)?.min_specs || '',
    preferred_specs: (initialData as ArtistRequirementInput)?.preferred_specs || '',
    alternatives: (initialData as ArtistRequirementInput)?.alternatives || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'equipment') {
        await onSubmit({
          catalog_id: formData.catalog_id,
          custom_name: formData.custom_name || null,
          category: formData.category,
          brand: formData.brand || null,
          model: formData.model || null,
          quantity: formData.quantity,
          condition: formData.condition,
          transport_notes: formData.transport_notes || null,
          is_available: formData.is_available,
          notes: formData.notes || null,
        } as ArtistEquipmentInput);
      } else {
        await onSubmit({
          catalog_id: formData.catalog_id,
          custom_name: formData.custom_name || null,
          category: formData.category,
          is_required: formData.is_required,
          priority: formData.priority,
          quantity: formData.quantity,
          min_specs: formData.min_specs || null,
          preferred_specs: formData.preferred_specs || null,
          alternatives: formData.alternatives || null,
          notes: formData.notes || null,
        } as ArtistRequirementInput);
      }
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.custom_name}
            onChange={(e) => setFormData({ ...formData, custom_name: e.target.value })}
            placeholder="z.B. Pioneer CDJ-3000"
            className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Kategorie *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as EquipmentCategory })}
            className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
          >
            {Object.entries(EQUIPMENT_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment-specific fields */}
      {mode === 'equipment' && (
        <>
          {/* Brand & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Marke
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="z.B. Pioneer"
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Modell
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="z.B. CDJ-3000"
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
              />
            </div>
          </div>

          {/* Quantity & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Anzahl
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Zustand
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as EquipmentCondition })}
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
              >
                {Object.entries(EQUIPMENT_CONDITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transport Notes */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Transport-Hinweise
            </label>
            <input
              type="text"
              value={formData.transport_notes}
              onChange={(e) => setFormData({ ...formData, transport_notes: e.target.value })}
              placeholder="z.B. Passt in normalen PKW"
              className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
            />
          </div>

          {/* Available Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 bg-bg-secondary text-accent-purple focus:ring-accent-purple/50"
            />
            <span className="text-text-secondary">Verfügbar für Buchungen</span>
          </label>
        </>
      )}

      {/* Requirement-specific fields */}
      {mode === 'requirement' && (
        <>
          {/* Required & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Priorität
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
              >
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Anzahl
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
              />
            </div>
          </div>

          {/* Required Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_required}
              onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 bg-bg-secondary text-accent-purple focus:ring-accent-purple/50"
            />
            <span className="text-text-secondary">Unbedingt erforderlich</span>
          </label>

          {/* Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Minimum-Spezifikationen
              </label>
              <input
                type="text"
                value={formData.min_specs}
                onChange={(e) => setFormData({ ...formData, min_specs: e.target.value })}
                placeholder="z.B. 4 Kanäle, USB"
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Bevorzugte Spezifikationen
              </label>
              <input
                type="text"
                value={formData.preferred_specs}
                onChange={(e) => setFormData({ ...formData, preferred_specs: e.target.value })}
                placeholder="z.B. Pioneer DJM-900NXS2"
                className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
              />
            </div>
          </div>

          {/* Alternatives */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Alternativen
            </label>
            <input
              type="text"
              value={formData.alternatives}
              onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
              placeholder="z.B. Allen & Heath oder ähnlich"
              className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50"
            />
          </div>
        </>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Notizen
        </label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Zusätzliche Informationen..."
          className="w-full px-4 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple/50 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        {isEditing && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Löschen
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default EquipmentForm;
