// Role-based navigation configuration for Bloghead

export type UserRole = 'fan' | 'artist' | 'service_provider' | 'event_organizer'

export interface NavItem {
  label: string
  path: string
  icon?: string
}

// Navigation items for each user role
export const roleNavigation: Record<UserRole, NavItem[]> = {
  fan: [
    { label: 'Mein Profil', path: '/dashboard/profile', icon: 'user' },
    { label: 'Einstellungen', path: '/dashboard/settings', icon: 'settings' },
    { label: 'Meine Favoriten', path: '/dashboard/favorites', icon: 'heart' },
    { label: 'Besuchte Events', path: '/dashboard/events-attended', icon: 'calendar' },
    { label: 'Meine Bewertungen', path: '/dashboard/my-reviews', icon: 'star' },
  ],
  artist: [
    { label: 'Mein Profil', path: '/dashboard/profile', icon: 'user' },
    { label: 'Einstellungen', path: '/dashboard/settings', icon: 'settings' },
    { label: 'Meine Buchungen', path: '/dashboard/bookings', icon: 'book' },
    { label: 'Mein Kalender', path: '/dashboard/calendar', icon: 'calendar' },
    { label: 'Verfügbarkeit', path: '/dashboard/availability', icon: 'clock' },
    { label: 'Bewertungen', path: '/dashboard/reviews', icon: 'star' },
    { label: 'Statistiken', path: '/dashboard/stats', icon: 'chart' },
  ],
  service_provider: [
    { label: 'Mein Profil', path: '/dashboard/profile', icon: 'user' },
    { label: 'Einstellungen', path: '/dashboard/settings', icon: 'settings' },
    { label: 'Meine Aufträge', path: '/dashboard/orders', icon: 'clipboard' },
    { label: 'Mein Kalender', path: '/dashboard/calendar', icon: 'calendar' },
    { label: 'Verfügbarkeit', path: '/dashboard/availability', icon: 'clock' },
    { label: 'Bewertungen', path: '/dashboard/reviews', icon: 'star' },
    { label: 'Statistiken', path: '/dashboard/stats', icon: 'chart' },
  ],
  event_organizer: [
    { label: 'Mein Profil', path: '/dashboard/profile', icon: 'user' },
    { label: 'Einstellungen', path: '/dashboard/settings', icon: 'settings' },
    { label: 'Meine Events', path: '/dashboard/my-events', icon: 'calendar-plus' },
    { label: 'Buchungsanfragen', path: '/dashboard/booking-requests', icon: 'inbox' },
    { label: 'Gebuchte Künstler', path: '/dashboard/booked-artists', icon: 'users' },
    { label: 'Statistiken', path: '/dashboard/stats', icon: 'chart' },
  ],
}

// Common navigation items for all authenticated users
export const commonNavItems: NavItem[] = [
  { label: 'Support', path: '/support', icon: 'help-circle' },
]

// Get navigation items for a specific role
export function getNavigationForRole(role: UserRole | undefined): NavItem[] {
  if (!role) {
    // Default to fan navigation if no role specified
    return roleNavigation.fan
  }
  return roleNavigation[role] || roleNavigation.fan
}

// Get all navigation items including common ones
export function getFullNavigationForRole(role: UserRole | undefined): NavItem[] {
  const roleItems = getNavigationForRole(role)
  return [...roleItems, ...commonNavItems]
}
