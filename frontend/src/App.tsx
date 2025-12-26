import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout, DashboardLayout, AdminLayout } from './components/layout'
import { CookieConsent } from './components/ui/CookieConsent'
import { ProtectedRoute, RoleGuard } from './components/auth'
import { AdminGuard } from './components/admin'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load ALL pages (including HomePage) for optimal initial load performance
// Using .then() to convert named exports to default exports for React.lazy()
const HomePage = lazy(() => import('./pages').then(m => ({ default: m.HomePage })))
const ArtistsPage = lazy(() => import('./pages/ArtistsPage').then(m => ({ default: m.ArtistsPage })))
const ArtistProfilePage = lazy(() => import('./pages/ArtistProfilePage').then(m => ({ default: m.ArtistProfilePage })))
const EventsPage = lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventsPage })))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })))
const ServiceProvidersPage = lazy(() => import('./pages/ServiceProvidersPage').then(m => ({ default: m.ServiceProvidersPage })))
const ServiceProviderProfilePage = lazy(() => import('./pages/ServiceProviderProfilePage').then(m => ({ default: m.ServiceProviderProfilePage })))
const ProfileEditPage = lazy(() => import('./pages/dashboard/ProfileEditPage'))
const CreateEventPage = lazy(() => import('./pages/CreateEventPage').then(m => ({ default: m.CreateEventPage })))
const ImpressumPage = lazy(() => import('./pages/ImpressumPage'))
const KontaktPage = lazy(() => import('./pages/KontaktPage'))
const DatenschutzPage = lazy(() => import('./pages/DatenschutzPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))

// Role-based Dashboard pages (named exports)
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage').then(m => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage').then(m => ({ default: m.SettingsPage })))
const FavoritesPage = lazy(() => import('./pages/dashboard/FavoritesPage').then(m => ({ default: m.FavoritesPage })))
const EventsAttendedPage = lazy(() => import('./pages/dashboard/EventsAttendedPage').then(m => ({ default: m.EventsAttendedPage })))
const MyReviewsPage = lazy(() => import('./pages/dashboard/MyReviewsPage').then(m => ({ default: m.MyReviewsPage })))
const WriteReviewPage = lazy(() => import('./pages/dashboard/WriteReviewPage').then(m => ({ default: m.WriteReviewPage })))
const BookingsPage = lazy(() => import('./pages/dashboard/BookingsPage').then(m => ({ default: m.BookingsPage })))
const CalendarPage = lazy(() => import('./pages/dashboard/CalendarPage').then(m => ({ default: m.CalendarPage })))
const AvailabilityPage = lazy(() => import('./pages/dashboard/AvailabilityPage').then(m => ({ default: m.AvailabilityPage })))
const ReviewsPage = lazy(() => import('./pages/dashboard/ReviewsPage').then(m => ({ default: m.ReviewsPage })))
const StatsPage = lazy(() => import('./pages/dashboard/StatsPage').then(m => ({ default: m.StatsPage })))
const OrdersPage = lazy(() => import('./pages/dashboard/OrdersPage').then(m => ({ default: m.OrdersPage })))
const MyEventsPage = lazy(() => import('./pages/dashboard/MyEventsPage').then(m => ({ default: m.MyEventsPage })))
const BookingRequestsPage = lazy(() => import('./pages/dashboard/BookingRequestsPage').then(m => ({ default: m.BookingRequestsPage })))
const BookedArtistsPage = lazy(() => import('./pages/dashboard/BookedArtistsPage').then(m => ({ default: m.BookedArtistsPage })))
const ArtistAnalyticsPage = lazy(() => import('./pages/dashboard/ArtistAnalyticsPage').then(m => ({ default: m.ArtistAnalyticsPage })))
const FanAnalyticsPage = lazy(() => import('./pages/dashboard/FanAnalyticsPage').then(m => ({ default: m.FanAnalyticsPage })))

// Notification pages
const NotificationCenterPage = lazy(() => import('./pages/dashboard/NotificationCenterPage').then(m => ({ default: m.NotificationCenterPage })))
const NotificationPreferencesPage = lazy(() => import('./pages/dashboard/NotificationPreferencesPage').then(m => ({ default: m.NotificationPreferencesPage })))

// Venue pages
const VenuesPage = lazy(() => import('./pages/VenuesPage').then(m => ({ default: m.VenuesPage })))
const VenueProfilePage = lazy(() => import('./pages/VenueProfilePage').then(m => ({ default: m.VenueProfilePage })))
const VenueRegistrationPage = lazy(() => import('./pages/VenueRegistrationPage').then(m => ({ default: m.VenueRegistrationPage })))
const VenueEditPage = lazy(() => import('./pages/VenueEditPage').then(m => ({ default: m.VenueEditPage })))
const VenueDashboard = lazy(() => import('./pages/dashboard/VenueDashboard').then(m => ({ default: m.VenueDashboard })))

// Legacy Dashboard pages (default exports - keeping for backward compatibility)
const LegacyMyRequestsPage = lazy(() => import('./pages/dashboard/MyRequestsPage'))
const LegacyMyCommunityPage = lazy(() => import('./pages/dashboard/MyCommunityPage'))
const LegacyMyChatPage = lazy(() => import('./pages/dashboard/MyChatPage'))
const LegacyMyCoinsPage = lazy(() => import('./pages/dashboard/MyCoinsPage'))

// Admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })))
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/AdminAnnouncementsPage').then(m => ({ default: m.AdminAnnouncementsPage })))
const AdminTicketsPage = lazy(() => import('./pages/admin/AdminTicketsPage').then(m => ({ default: m.AdminTicketsPage })))
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })))
const AdminPayoutsPage = lazy(() => import('./pages/admin/AdminPayoutsPage').then(m => ({ default: m.AdminPayoutsPage })))
const AdminAuditLogPage = lazy(() => import('./pages/admin/AdminAuditLogPage').then(m => ({ default: m.AdminAuditLogPage })))

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-accent-purple rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Laden...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes - with Layout (Header/Footer) */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/artists" element={<ArtistsPage />} />
                <Route path="/artists/:id" element={<ArtistProfilePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/services" element={<ServiceProvidersPage />} />
                <Route path="/services/:id" element={<ServiceProviderProfilePage />} />
                <Route path="/venues" element={<VenuesPage />} />
                <Route path="/venues/:slug" element={<VenueProfilePage />} />
                <Route path="/impressum" element={<ImpressumPage />} />
                <Route path="/kontakt" element={<KontaktPage />} />
                <Route path="/datenschutz" element={<DatenschutzPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                {/* Protected Routes with Layout */}
                <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
                <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
                <Route path="/venues/register" element={<ProtectedRoute><VenueRegistrationPage /></ProtectedRoute>} />
                <Route path="/venues/:slug/edit" element={<ProtectedRoute><VenueEditPage /></ProtectedRoute>} />
              </Route>

              {/* Dashboard Routes - Protected with DashboardLayout (no Header/Footer) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Common pages (all roles) */}
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="notifications" element={<NotificationCenterPage />} />
                <Route path="settings/notifications" element={<NotificationPreferencesPage />} />

                {/* Venue Owner pages */}
                <Route path="venue" element={<VenueDashboard />} />

                {/* Fan pages - protected by user_type */}
                <Route path="favorites" element={<RoleGuard allowedUserTypes={['fan']}><FavoritesPage /></RoleGuard>} />
                <Route path="events-attended" element={<RoleGuard allowedUserTypes={['fan']}><EventsAttendedPage /></RoleGuard>} />
                <Route path="my-reviews" element={<RoleGuard allowedUserTypes={['fan']}><MyReviewsPage /></RoleGuard>} />
                <Route path="bookings/:bookingId/review" element={<RoleGuard allowedUserTypes={['fan']}><WriteReviewPage /></RoleGuard>} />
                <Route path="my-stats" element={<RoleGuard allowedUserTypes={['fan']}><FanAnalyticsPage /></RoleGuard>} />

                {/* Artist pages - protected by user_type */}
                <Route path="bookings" element={<RoleGuard allowedUserTypes={['artist']}><BookingsPage /></RoleGuard>} />
                <Route path="calendar" element={<RoleGuard allowedUserTypes={['artist']}><CalendarPage /></RoleGuard>} />
                <Route path="availability" element={<RoleGuard allowedUserTypes={['artist']}><AvailabilityPage /></RoleGuard>} />
                <Route path="reviews" element={<RoleGuard allowedUserTypes={['artist']}><ReviewsPage /></RoleGuard>} />
                <Route path="stats" element={<RoleGuard allowedUserTypes={['artist', 'service_provider', 'event_organizer', 'veranstalter']}><StatsPage /></RoleGuard>} />
                <Route path="analytics" element={<RoleGuard allowedUserTypes={['artist']}><ArtistAnalyticsPage /></RoleGuard>} />

                {/* Service Provider pages - protected by user_type */}
                <Route path="orders" element={<RoleGuard allowedUserTypes={['service_provider']}><OrdersPage /></RoleGuard>} />

                {/* Event Organizer pages - protected by user_type */}
                <Route path="my-events" element={<RoleGuard allowedUserTypes={['event_organizer', 'veranstalter']}><MyEventsPage /></RoleGuard>} />
                <Route path="booking-requests" element={<RoleGuard allowedUserTypes={['event_organizer', 'veranstalter']}><BookingRequestsPage /></RoleGuard>} />
                <Route path="booked-artists" element={<RoleGuard allowedUserTypes={['event_organizer', 'veranstalter']}><BookedArtistsPage /></RoleGuard>} />

                {/* Legacy routes - redirect to new routes or keep for compatibility */}
                <Route path="requests" element={<LegacyMyRequestsPage />} />
                <Route path="community" element={<LegacyMyCommunityPage />} />
                <Route path="chat" element={<LegacyMyChatPage />} />
                <Route path="coins" element={<LegacyMyCoinsPage />} />
              </Route>

              {/* Admin Routes - Protected with AdminGuard and AdminLayout */}
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="announcements" element={<AdminAnnouncementsPage />} />
                <Route path="tickets" element={<AdminTicketsPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="payouts" element={<AdminPayoutsPage />} />
                <Route path="audit" element={<AdminAuditLogPage />} />
              </Route>
            </Routes>
          </Suspense>
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
