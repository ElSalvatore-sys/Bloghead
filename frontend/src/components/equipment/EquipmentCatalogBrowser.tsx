// ============================================
// EQUIPMENT CATALOG BROWSER
// Browse equipment by category with search
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Plus, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import type {
  EquipmentCatalogItem,
  EquipmentCatalogGrouped,
  EquipmentCategory
} from '@/types/equipment';
import {
  EQUIPMENT_CATEGORY_LABELS,
  CATEGORY_ICONS
} from '@/types/equipment';
import { getEquipmentCatalogGrouped } from '@/services/equipmentService';

interface EquipmentCatalogBrowserProps {
  onSelect?: (item: EquipmentCatalogItem) => void;
  selectedIds?: string[];
  multiSelect?: boolean;
  showAddButton?: boolean;
}

export function EquipmentCatalogBrowser({
  onSelect,
  selectedIds = [],
  multiSelect = false,
  showAddButton = true,
}: EquipmentCatalogBrowserProps) {
  const [groups, setGroups] = useState<EquipmentCatalogGrouped[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<EquipmentCategory>>(
    new Set()
  );

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const data = await getEquipmentCatalogGrouped();
      setGroups(data);
      // Expand first category by default
      if (data.length > 0) {
        setExpandedCategories(new Set([data[0].category]));
      }
    } catch (error) {
      console.error('Error loading catalog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: EquipmentCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter items by search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;

    const query = searchQuery.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.common_brands?.some((b) => b.toLowerCase().includes(query))
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, searchQuery]);

  // Auto-expand categories with search results
  useEffect(() => {
    if (searchQuery.trim()) {
      const categoriesWithResults = new Set(
        filteredGroups.map((g) => g.category)
      );
      setExpandedCategories(categoriesWithResults);
    }
  }, [filteredGroups, searchQuery]);

  const isSelected = (id: string) => selectedIds.includes(id);

  const getCategoryIcon = (category: EquipmentCategory) => {
    const iconName = CATEGORY_ICONS[category];
    const IconComponent = (Icons as any)[iconName] || Icons.Box;
    return IconComponent;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-white/5 rounded-lg mb-2" />
            <div className="space-y-2 pl-4">
              <div className="h-10 bg-white/5 rounded-lg w-3/4" />
              <div className="h-10 bg-white/5 rounded-lg w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Equipment suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple/50"
        />
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {filteredGroups.map((group) => {
          const CategoryIcon = getCategoryIcon(group.category);
          const isExpanded = expandedCategories.has(group.category);

          return (
            <div
              key={group.category}
              className="bg-bg-card border border-white/5 rounded-xl overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(group.category)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon className="w-5 h-5 text-accent-purple" />
                  <span className="font-medium text-text-primary">
                    {group.label}
                  </span>
                  <span className="text-sm text-text-muted">
                    ({group.items.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-text-muted" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-text-muted" />
                )}
              </button>

              {/* Items */}
              {isExpanded && (
                <div className="border-t border-white/5">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className={`px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 ${
                        isSelected(item.id) ? 'bg-accent-purple/10' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-sm text-text-muted line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        {item.common_brands && item.common_brands.length > 0 && (
                          <p className="text-xs text-text-muted mt-1">
                            {item.common_brands.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </div>

                      {showAddButton && onSelect && (
                        <button
                          onClick={() => onSelect(item)}
                          className={`p-2 rounded-lg transition-colors ${
                            isSelected(item.id)
                              ? 'bg-accent-purple text-white'
                              : 'hover:bg-white/10 text-text-muted'
                          }`}
                        >
                          {isSelected(item.id) ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Keine Ergebnisse für "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EquipmentCatalogBrowser;
