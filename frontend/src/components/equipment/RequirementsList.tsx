// ============================================
// REQUIREMENTS LIST
// Display and manage artist requirements
// ============================================

import React, { useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Plus,
  GripVertical
} from 'lucide-react';
import * as Icons from 'lucide-react';
import type { ArtistRequirement } from '@/types/equipment';
import {
  EQUIPMENT_CATEGORY_LABELS,
  PRIORITY_LABELS,
  CATEGORY_ICONS
} from '@/types/equipment';

interface RequirementsListProps {
  requirements: ArtistRequirement[];
  onEdit?: (requirement: ArtistRequirement) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  isLoading?: boolean;
  isEditable?: boolean;
}

export function RequirementsList({
  requirements,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false,
  isEditable = true,
}: RequirementsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    const iconName = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
    const IconComponent = (Icons as any)[iconName] || Icons.Box;
    return IconComponent;
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'text-red-400 bg-red-500/10';
      case 2:
        return 'text-orange-400 bg-orange-500/10';
      case 3:
        return 'text-yellow-400 bg-yellow-500/10';
      case 4:
        return 'text-blue-400 bg-blue-500/10';
      case 5:
        return 'text-gray-400 bg-gray-500/10';
      default:
        return 'text-text-muted bg-white/5';
    }
  };

  // Group by category
  const groupedRequirements = requirements.reduce((acc, req) => {
    if (!acc[req.category]) {
      acc[req.category] = [];
    }
    acc[req.category].push(req);
    return acc;
  }, {} as Record<string, ArtistRequirement[]>);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/5 rounded-xl h-16" />
        ))}
      </div>
    );
  }

  if (requirements.length === 0) {
    return (
      <div className="text-center py-12 bg-bg-card rounded-xl border border-white/5">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50" />
        <p className="text-text-secondary mb-2">
          Noch keine Anforderungen definiert
        </p>
        <p className="text-sm text-text-muted mb-4">
          Legen Sie fest, welches Equipment Sie für Auftritte benötigen
        </p>
        {isEditable && onAdd && (
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Anforderung hinzufügen
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Button */}
      {isEditable && onAdd && (
        <button
          onClick={onAdd}
          className="w-full py-3 border-2 border-dashed border-white/10 hover:border-accent-purple/50 rounded-xl text-text-muted hover:text-accent-purple transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Anforderung hinzufügen
        </button>
      )}

      {/* Grouped List */}
      {Object.entries(groupedRequirements).map(([category, items]) => {
        const CategoryIcon = getCategoryIcon(category);

        return (
          <div key={category} className="space-y-2">
            {/* Category Header */}
            <div className="flex items-center gap-2 px-2">
              <CategoryIcon className="w-4 h-4 text-accent-purple" />
              <span className="text-sm font-medium text-text-secondary">
                {EQUIPMENT_CATEGORY_LABELS[category as keyof typeof EQUIPMENT_CATEGORY_LABELS]}
              </span>
              <span className="text-xs text-text-muted">({items.length})</span>
            </div>

            {/* Items */}
            {items
              .sort((a, b) => a.priority - b.priority)
              .map((req) => {
                const isExpanded = expandedId === req.id;

                return (
                  <div
                    key={req.id}
                    className="bg-bg-card border border-white/5 rounded-xl overflow-hidden"
                  >
                    {/* Main Row */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      {isEditable && (
                        <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                      )}

                      {/* Priority Badge */}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(req.priority)}`}
                      >
                        {PRIORITY_LABELS[req.priority]}
                      </span>

                      {/* Name & Quantity */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary truncate">
                            {req.catalog_item?.name || req.custom_name}
                          </span>
                          {req.quantity > 1 && (
                            <span className="text-sm text-text-muted">
                              ×{req.quantity}
                            </span>
                          )}
                          {req.is_required && (
                            <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-xs rounded">
                              Pflicht
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand/Collapse */}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-muted" />
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-3">
                        {/* Specs */}
                        {(req.min_specs || req.preferred_specs) && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {req.min_specs && (
                              <div>
                                <p className="text-text-muted text-xs mb-1">Minimum</p>
                                <p className="text-text-secondary">{req.min_specs}</p>
                              </div>
                            )}
                            {req.preferred_specs && (
                              <div>
                                <p className="text-text-muted text-xs mb-1">Bevorzugt</p>
                                <p className="text-text-secondary">{req.preferred_specs}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Alternatives */}
                        {req.alternatives && (
                          <div className="text-sm">
                            <p className="text-text-muted text-xs mb-1">Alternativen</p>
                            <p className="text-text-secondary">{req.alternatives}</p>
                          </div>
                        )}

                        {/* Notes */}
                        {req.notes && (
                          <div className="text-sm">
                            <p className="text-text-muted text-xs mb-1">Notizen</p>
                            <p className="text-text-secondary">{req.notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        {isEditable && (
                          <div className="flex items-center gap-2 pt-2">
                            {onEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(req);
                                }}
                                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Bearbeiten
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(req.id);
                                }}
                                className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Löschen
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}

export default RequirementsList;
