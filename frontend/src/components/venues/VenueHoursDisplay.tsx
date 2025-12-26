// ============================================
// VENUE HOURS DISPLAY COMPONENT
// Show opening hours with today highlighted
// ============================================

import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import type { VenueHours } from '@/types/venue';
import { DAY_NAMES_DE } from '@/types/venue';

interface VenueHoursDisplayProps {
  hours: VenueHours[];
  compact?: boolean;
}

export function VenueHoursDisplay({ hours, compact = false }: VenueHoursDisplayProps) {
  const today = new Date().getDay(); // 0 = Sunday

  // Sort hours by day (Monday first in German convention)
  const sortedHours = [...hours].sort((a, b) => {
    // Convert Sunday=0 to end of week
    const dayA = a.day_of_week === 0 ? 7 : a.day_of_week;
    const dayB = b.day_of_week === 0 ? 7 : b.day_of_week;
    return dayA - dayB;
  });

  const formatTime = (time: string | null | undefined): string => {
    if (!time) return '';
    // Convert HH:MM:SS to HH:MM
    return time.slice(0, 5);
  };

  const getHoursString = (hour: VenueHours): string => {
    if (hour.is_closed) return 'Geschlossen';
    if (!hour.open_time || !hour.close_time) return 'Geschlossen';
    return `${formatTime(hour.open_time)} - ${formatTime(hour.close_time)}`;
  };

  if (hours.length === 0) {
    return (
      <div className="flex items-center gap-2 text-text-muted">
        <AlertCircle className="w-4 h-4" />
        <span>Keine Öffnungszeiten angegeben</span>
      </div>
    );
  }

  // Compact view - just show today
  if (compact) {
    const todayHours = hours.find((h) => h.day_of_week === today);
    const isOpen = todayHours && !todayHours.is_closed && todayHours.open_time;

    return (
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-text-muted" />
        <span className={isOpen ? 'text-green-500' : 'text-text-muted'}>
          Heute: {todayHours ? getHoursString(todayHours) : 'Geschlossen'}
        </span>
      </div>
    );
  }

  // Full view - show all days
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-accent-purple" />
        <h3 className="font-semibold text-text-primary">Öffnungszeiten</h3>
      </div>

      <div className="bg-bg-card rounded-xl p-4 border border-white/5">
        {sortedHours.map((hour) => {
          const isToday = hour.day_of_week === today;
          const dayName = DAY_NAMES_DE[hour.day_of_week];

          return (
            <div
              key={hour.day_of_week}
              className={`flex items-center justify-between py-2 border-b border-white/5 last:border-0 ${
                isToday ? 'bg-accent-purple/5 -mx-4 px-4 rounded' : ''
              }`}
            >
              <span className={`${isToday ? 'font-semibold text-accent-purple' : 'text-text-secondary'}`}>
                {dayName}
                {isToday && <span className="ml-2 text-xs">(Heute)</span>}
              </span>
              <span
                className={`${
                  hour.is_closed
                    ? 'text-text-muted'
                    : isToday
                    ? 'font-semibold text-text-primary'
                    : 'text-text-primary'
                }`}
              >
                {getHoursString(hour)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VenueHoursDisplay;
