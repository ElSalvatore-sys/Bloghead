// Dashboard pages - role-based navigation

// Common pages (all roles)
export { ProfilePage } from './ProfilePage'
export { SettingsPage } from './SettingsPage'

// Fan pages
export { FavoritesPage } from './FavoritesPage'
export { EventsAttendedPage } from './EventsAttendedPage'
export { MyReviewsPage } from './MyReviewsPage'

// Artist pages
export { BookingsPage } from './BookingsPage'
export { CalendarPage } from './CalendarPage'
export { AvailabilityPage } from './AvailabilityPage'
export { ReviewsPage } from './ReviewsPage'
export { StatsPage } from './StatsPage'

// Service Provider pages
export { OrdersPage } from './OrdersPage'

// Event Organizer pages
export { MyEventsPage } from './MyEventsPage'
export { BookingRequestsPage } from './BookingRequestsPage'
export { BookedArtistsPage } from './BookedArtistsPage'

// Legacy pages (for backward compatibility)
export { default as MyProfilePage } from './MyProfilePage'
export { default as MyRequestsPage } from './MyRequestsPage'
export { default as MyBookingsPage } from './MyBookingsPage'
export { default as MyCalendarPage } from './MyCalendarPage'
export { default as MyCommunityPage } from './MyCommunityPage'
export { default as MyChatPage } from './MyChatPage'
export { default as MyCoinsPage } from './MyCoinsPage'
