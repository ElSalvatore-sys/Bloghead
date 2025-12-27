// ============================================
// EQUIPMENT TEMPLATE CARD
// Display equipment template with items
// ============================================

import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { EquipmentTemplate } from '@/types/equipment';
import {
  TEMPLATE_TYPE_LABELS,
  TEMPLATE_ICONS,
  EQUIPMENT_CATEGORY_LABELS
} from '@/types/equipment';

interface EquipmentTemplateCardProps {
  template: EquipmentTemplate;
  isSelected?: boolean;
  onSelect?: (template: EquipmentTemplate) => void;
  showDetails?: boolean;
}

export function EquipmentTemplateCard({
  template,
  isSelected = false,
  onSelect,
  showDetails = true,
}: EquipmentTemplateCardProps) {
  const iconName = template.icon_name || TEMPLATE_ICONS[template.template_type];
  const IconComponent = (Icons as any)[iconName] || Icons.Box;

  const requiredItems = template.equipment_items.filter((i) => i.is_required);
  const optionalItems = template.equipment_items.filter((i) => !i.is_required);

  return (
    <div
      onClick={() => onSelect?.(template)}
      className={`
        bg-bg-card border rounded-xl overflow-hidden transition-all cursor-pointer
        ${isSelected
          ? 'border-accent-purple ring-2 ring-accent-purple/20'
          : 'border-white/5 hover:border-white/20'
        }
      `}
    >
      {/* Header */}
      <div className="p-4 flex items-start gap-4">
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${isSelected ? 'bg-accent-purple' : 'bg-bg-secondary'}
          `}
        >
          <IconComponent
            className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-accent-purple'}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-text-primary truncate">
              {template.name}
            </h3>
            {template.is_system && (
              <span className="px-2 py-0.5 bg-accent-purple/20 text-accent-purple text-xs rounded-full">
                Standard
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted">
            {TEMPLATE_TYPE_LABELS[template.template_type]}
          </p>
          {template.description && (
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">
              {template.description}
            </p>
          )}
        </div>

        {isSelected ? (
          <div className="w-6 h-6 bg-accent-purple rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        ) : (
          <ChevronRight className="w-5 h-5 text-text-muted" />
        )}
      </div>

      {/* Equipment List */}
      {showDetails && template.equipment_items.length > 0 && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          {/* Required */}
          {requiredItems.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-text-muted mb-1">
                Erforderlich ({requiredItems.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {requiredItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-accent-purple/10 text-accent-purple text-xs rounded-lg"
                  >
                    {item.quantity > 1 && `${item.quantity}× `}
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Optional */}
          {optionalItems.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted mb-1">
                Optional ({optionalItems.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {optionalItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-white/5 text-text-secondary text-xs rounded-lg"
                  >
                    {item.quantity > 1 && `${item.quantity}× `}
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EquipmentTemplateCard;
