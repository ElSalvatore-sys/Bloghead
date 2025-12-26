// ============================================
// VENUE ROOM CARD COMPONENT
// Display room/space information
// ============================================

import React, { useState } from 'react';
import {
  Users,
  Maximize,
  Wifi,
  Wind,
  Bath,
  Droplets,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { VenueRoom } from '@/types/venue';
import { ROOM_TYPE_LABELS } from '@/types/venue';

interface VenueRoomCardProps {
  room: VenueRoom;
  defaultExpanded?: boolean;
}

export function VenueRoomCard({ room, defaultExpanded = false }: VenueRoomCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const amenityIcons = [
    { key: 'has_wifi', icon: Wifi, label: 'WLAN' },
    { key: 'has_ac', icon: Wind, label: 'Klimaanlage' },
    { key: 'has_bathroom', icon: Bath, label: 'WC' },
    { key: 'has_shower', icon: Droplets, label: 'Dusche' },
  ];

  const activeAmenities = amenityIcons.filter(
    (a) => room[a.key as keyof VenueRoom] === true
  );

  return (
    <div className="bg-bg-card rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-purple/10 rounded-lg">
            <Maximize className="w-5 h-5 text-accent-purple" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-text-primary">{room.name}</h4>
            <p className="text-sm text-text-muted">
              {ROOM_TYPE_LABELS[room.room_type]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden sm:flex items-center gap-4 text-sm text-text-secondary">
            {room.capacity && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{room.capacity}</span>
              </div>
            )}
            {room.size_sqm && (
              <div className="flex items-center gap-1">
                <Maximize className="w-4 h-4" />
                <span>{room.size_sqm} m²</span>
              </div>
            )}
          </div>

          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5">
          {/* Stats */}
          <div className="flex flex-wrap gap-4 pt-4">
            {room.capacity && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Users className="w-4 h-4" />
                <span>Kapazität: {room.capacity} Personen</span>
              </div>
            )}
            {room.size_sqm && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Maximize className="w-4 h-4" />
                <span>Größe: {room.size_sqm} m²</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {activeAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeAmenities.map((amenity) => (
                <div
                  key={amenity.key}
                  className="flex items-center gap-1.5 px-2 py-1 bg-bg-secondary rounded-full text-sm"
                >
                  <amenity.icon className="w-3.5 h-3.5 text-accent-purple" />
                  <span className="text-text-secondary">{amenity.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Custom Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-bg-secondary rounded-full text-sm text-text-secondary"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {room.description && (
            <p className="text-text-secondary text-sm">{room.description}</p>
          )}

          {/* Photos */}
          {room.photos && room.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {room.photos.slice(0, 3).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${room.name} ${index + 1}`}
                  className="w-full aspect-video object-cover rounded-lg"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VenueRoomCard;
