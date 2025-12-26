// ============================================
// VENUE EQUIPMENT LIST COMPONENT
// Display equipment catalog by category
// ============================================

import React from 'react';
import {
  Speaker,
  Lightbulb,
  Monitor,
  Video,
  Music,
  Disc,
  Box,
  Check,
  Euro
} from 'lucide-react';
import type { VenueEquipment, EquipmentCategory } from '@/types/venue';
import { EQUIPMENT_CATEGORY_LABELS } from '@/types/venue';

interface VenueEquipmentListProps {
  equipment: VenueEquipment[];
  showPricing?: boolean;
}

const CATEGORY_ICONS: Record<EquipmentCategory, React.ComponentType<{ className?: string }>> = {
  audio: Speaker,
  lighting: Lightbulb,
  stage: Monitor,
  video: Video,
  backline: Music,
  dj_equipment: Disc,
  other: Box,
};

export function VenueEquipmentList({
  equipment,
  showPricing = true
}: VenueEquipmentListProps) {
  // Group equipment by category
  const groupedEquipment = equipment.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, VenueEquipment[]>);

  const categories = Object.keys(groupedEquipment) as EquipmentCategory[];

  if (equipment.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        Keine Equipment-Informationen verfügbar
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const Icon = CATEGORY_ICONS[category] || Box;
        const items = groupedEquipment[category];

        return (
          <div key={category} className="bg-bg-card rounded-xl p-4 border border-white/5">
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-accent-purple/10 rounded-lg">
                <Icon className="w-5 h-5 text-accent-purple" />
              </div>
              <h3 className="font-semibold text-text-primary">
                {EQUIPMENT_CATEGORY_LABELS[category]}
              </h3>
              <span className="text-sm text-text-muted">({items.length})</span>
            </div>

            {/* Equipment Items */}
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <div>
                      <p className="text-text-primary">
                        {item.quantity > 1 && `${item.quantity}x `}
                        {item.name}
                      </p>
                      {(item.brand || item.model) && (
                        <p className="text-sm text-text-muted">
                          {[item.brand, item.model].filter(Boolean).join(' ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {showPricing && (
                    <div className="text-right shrink-0">
                      {item.is_included ? (
                        <span className="text-sm text-green-500">Inklusive</span>
                      ) : item.extra_cost ? (
                        <span className="text-sm text-text-secondary flex items-center gap-1">
                          <Euro className="w-3 h-3" />
                          {item.extra_cost}
                        </span>
                      ) : (
                        <span className="text-sm text-text-muted">Auf Anfrage</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VenueEquipmentList;
