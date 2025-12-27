// ============================================
// EQUIPMENT MATCHER
// Show match between artist needs and venue has
// ============================================

import React from 'react';
import {
  Check,
  X,
  AlertTriangle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import type { EquipmentMatchResult } from '@/types/equipment';
import { EQUIPMENT_CATEGORY_LABELS } from '@/types/equipment';

interface EquipmentMatcherProps {
  matches: EquipmentMatchResult[];
  isLoading?: boolean;
  showSummary?: boolean;
}

export function EquipmentMatcher({
  matches,
  isLoading = false,
  showSummary = true,
}: EquipmentMatcherProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/5 rounded-xl h-14" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Keine Anforderungen zum Abgleichen</p>
      </div>
    );
  }

  // Calculate summary stats
  const stats = {
    total: matches.length,
    available: matches.filter((m) => m.status === 'available').length,
    missing_required: matches.filter((m) => m.status === 'missing_required').length,
    missing_optional: matches.filter((m) => m.status === 'missing_optional').length,
    insufficient: matches.filter((m) => m.status === 'insufficient').length,
  };

  const getStatusIcon = (status: EquipmentMatchResult['status']) => {
    switch (status) {
      case 'available':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'missing_required':
        return <X className="w-5 h-5 text-red-400" />;
      case 'missing_optional':
        return <HelpCircle className="w-5 h-5 text-yellow-400" />;
      case 'insufficient':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
    }
  };

  const getStatusBg = (status: EquipmentMatchResult['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 border-green-500/20';
      case 'missing_required':
        return 'bg-red-500/10 border-red-500/20';
      case 'missing_optional':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'insufficient':
        return 'bg-orange-500/10 border-orange-500/20';
    }
  };

  const getStatusLabel = (status: EquipmentMatchResult['status']) => {
    switch (status) {
      case 'available':
        return 'Verfügbar';
      case 'missing_required':
        return 'Fehlt (Pflicht)';
      case 'missing_optional':
        return 'Fehlt (Optional)';
      case 'insufficient':
        return 'Unzureichend';
    }
  };

  // Group by status for better visibility
  const sortedMatches = [...matches].sort((a, b) => {
    const statusOrder = {
      missing_required: 0,
      insufficient: 1,
      missing_optional: 2,
      available: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="space-y-4">
      {/* Summary */}
      {showSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.available}</p>
            <p className="text-xs text-green-400/70">Verfügbar</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.missing_required}</p>
            <p className="text-xs text-red-400/70">Fehlt (Pflicht)</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.insufficient}</p>
            <p className="text-xs text-orange-400/70">Unzureichend</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.missing_optional}</p>
            <p className="text-xs text-yellow-400/70">Optional fehlt</p>
          </div>
        </div>
      )}

      {/* Overall Score */}
      {showSummary && (
        <div className="bg-bg-card border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Kompatibilität</span>
            <span className="text-lg font-bold text-text-primary">
              {Math.round((stats.available / stats.total) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-purple to-green-500 transition-all"
              style={{
                width: `${(stats.available / stats.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Match List */}
      <div className="space-y-2">
        {sortedMatches.map((match, idx) => (
          <div
            key={idx}
            className={`border rounded-xl p-3 flex items-center gap-3 ${getStatusBg(match.status)}`}
          >
            {getStatusIcon(match.status)}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary truncate">
                  {match.requirement_name}
                </span>
                <span className="text-xs text-text-muted px-1.5 py-0.5 bg-white/5 rounded">
                  {EQUIPMENT_CATEGORY_LABELS[match.requirement_category]}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm mt-1">
                <span className="text-text-muted">
                  Benötigt: {match.requirement_quantity}
                </span>
                <ArrowRight className="w-3 h-3 text-text-muted" />
                <span className={match.venue_has ? 'text-green-400' : 'text-red-400'}>
                  Vorhanden: {match.venue_quantity}
                </span>
              </div>
            </div>

            <span
              className={`text-xs px-2 py-1 rounded-full ${
                match.status === 'available'
                  ? 'bg-green-500/20 text-green-400'
                  : match.status === 'missing_required'
                  ? 'bg-red-500/20 text-red-400'
                  : match.status === 'insufficient'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {getStatusLabel(match.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EquipmentMatcher;
