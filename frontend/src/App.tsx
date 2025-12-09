import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import { HomePage } from './pages'
import { CookieConsent } from './components/ui/CookieConsent'
import { ProtectedRoute } from './components/auth'
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
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })))
const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage').then(m => ({ default: m.ProfileEditPage })))
const ImpressumPage = lazy(() => import('./pages/ImpressumPage'))
const KontaktPage = lazy(() => import('./pages/KontaktPage'))
const DatenschutzPage = lazy(() => import('./pages/DatenschutzPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))

// Dashboard pages (have default exports)
const MyProfilePage = lazy(() => import('./pages/dashboard/MyProfilePage'))
const MyRequestsPage = lazy(() => import('./pages/dashboard/MyRequestsPage'))
const MyBookingsPage = lazy(() => import('./pages/dashboard/MyBookingsPage'))
const MyCalendarPage = lazy(() => import('./pages/dashboard/MyCalendarPage'))
const MyCommunityPage = lazy(() => import('./pages/dashboard/MyCommunityPage'))
const MyChatPage = lazy(() => import('./pages/dashboard/MyChatPage'))
const MyCoinsPage = lazy(() => import('./pages/dashboard/MyCoinsPage'))

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
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/artists" element={<ArtistsPage />} />
                <Route path="/artists/:id" element={<ArtistProfilePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/services" element={<ServiceProvidersPage />} />
                <Route path="/services/:id" element={<ServiceProviderProfilePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/impressum" element={<ImpressumPage />} />
                <Route path="/kontakt" element={<KontaktPage />} />
                <Route path="/datenschutz" element={<DatenschutzPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                {/* Protected Routes */}
                <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />

                {/* Dashboard Routes - Protected */}
                <Route path="/dashboard/profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
                <Route path="/dashboard/requests" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
                <Route path="/dashboard/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
                <Route path="/dashboard/calendar" element={<ProtectedRoute><MyCalendarPage /></ProtectedRoute>} />
                <Route path="/dashboard/community" element={<ProtectedRoute><MyCommunityPage /></ProtectedRoute>} />
                <Route path="/dashboard/chat" element={<ProtectedRoute><MyChatPage /></ProtectedRoute>} />
                <Route path="/dashboard/coins" element={<ProtectedRoute><MyCoinsPage /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </Layout>
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
