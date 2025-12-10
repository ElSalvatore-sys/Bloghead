import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout, DashboardLayout, AdminLayout } from './components/layout'
import { HomePage } from './pages'
import { CookieConsent } from './components/ui/CookieConsent'
import { ProtectedRoute } from './components/auth'
import { AdminGuard } from './components/admin'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load all pages except HomePage for better initial load
// Using .then() to convert named exports to default exports for React.lazy()
const ArtistsPage = lazy(() => import('./pages/ArtistsPage').then(m => ({ default: m.ArtistsPage })))
const ArtistProfilePage = lazy(() => import('./pages/ArtistProfilePage').then(m => ({ default: m.ArtistProfilePage })))
const EventsPage = lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventsPage })))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })))
const ServiceProvidersPage = lazy(() => import('./pages/ServiceProvidersPage').then(m => ({ default: m.ServiceProvidersPage })))
const ServiceProviderProfilePage = lazy(() => import('./pages/ServiceProviderProfilePage').then(m => ({ default: m.ServiceProviderProfilePage })))
const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage').then(m => ({ default: m.ProfileEditPage })))
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
const BookingsPage = lazy(() => import('./pages/dashboard/BookingsPage').then(m => ({ default: m.BookingsPage })))
const CalendarPage = lazy(() => import('./pages/dashboard/CalendarPage').then(m => ({ default: m.CalendarPage })))
const ReviewsPage = lazy(() => import('./pages/dashboard/ReviewsPage').then(m => ({ default: m.ReviewsPage })))
const StatsPage = lazy(() => import('./pages/dashboard/StatsPage').then(m => ({ default: m.StatsPage })))
const OrdersPage = lazy(() => import('./pages/dashboard/OrdersPage').then(m => ({ default: m.OrdersPage })))
const MyEventsPage = lazy(() => import('./pages/dashboard/MyEventsPage').then(m => ({ default: m.MyEventsPage })))
const BookingRequestsPage = lazy(() => import('./pages/dashboard/BookingRequestsPage').then(m => ({ default: m.BookingRequestsPage })))
const BookedArtistsPage = lazy(() => import('./pages/dashboard/BookedArtistsPage').then(m => ({ default: m.BookedArtistsPage })))

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
                <Route path="/impressum" element={<ImpressumPage />} />
                <Route path="/kontakt" element={<KontaktPage />} />
                <Route path="/datenschutz" element={<DatenschutzPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                {/* Protected Routes with Layout */}
                <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
                <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
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

                {/* Fan pages */}
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="events-attended" element={<EventsAttendedPage />} />
                <Route path="my-reviews" element={<MyReviewsPage />} />

                {/* Artist pages */}
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="stats" element={<StatsPage />} />

                {/* Service Provider pages */}
                <Route path="orders" element={<OrdersPage />} />

                {/* Event Organizer pages */}
                <Route path="my-events" element={<MyEventsPage />} />
                <Route path="booking-requests" element={<BookingRequestsPage />} />
                <Route path="booked-artists" element={<BookedArtistsPage />} />

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
