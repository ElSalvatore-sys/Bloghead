import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import { HomePage, ArtistsPage, ArtistProfilePage, EventsPage, EventDetailPage, AboutPage, ProfileEditPage, ServiceProvidersPage, ServiceProviderProfilePage } from './pages'
import ImpressumPage from './pages/ImpressumPage'
import KontaktPage from './pages/KontaktPage'
import DatenschutzPage from './pages/DatenschutzPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import { MyProfilePage, MyRequestsPage, MyBookingsPage, MyCalendarPage, MyCommunityPage, MyChatPage, MyCoinsPage } from './pages/dashboard'
import { CookieConsent } from './components/ui/CookieConsent'
import { ProtectedRoute } from './components/auth'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/artists" element={<ArtistsPage />} />
            <Route path="/artists/:id" element={<ArtistProfilePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/services" element={<ServiceProvidersPage />} />
            <Route path="/services/:id" element={<ServiceProviderProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/kontakt" element={<KontaktPage />} />
            <Route path="/datenschutz" element={<DatenschutzPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            {/* Dashboard Routes - Protected */}
            <Route path="/dashboard/profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard/requests" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
            <Route path="/dashboard/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/dashboard/calendar" element={<ProtectedRoute><MyCalendarPage /></ProtectedRoute>} />
            <Route path="/dashboard/community" element={<ProtectedRoute><MyCommunityPage /></ProtectedRoute>} />
            <Route path="/dashboard/chat" element={<ProtectedRoute><MyChatPage /></ProtectedRoute>} />
            <Route path="/dashboard/coins" element={<ProtectedRoute><MyCoinsPage /></ProtectedRoute>} />
          </Routes>
        </Layout>
        <CookieConsent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
