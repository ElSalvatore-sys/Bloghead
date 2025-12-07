import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import { HomePage, ArtistsPage, ArtistProfilePage, EventsPage, AboutPage, ProfileEditPage } from './pages'
import ImpressumPage from './pages/ImpressumPage'
import KontaktPage from './pages/KontaktPage'
import DatenschutzPage from './pages/DatenschutzPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import { MyProfilePage, MyRequestsPage, MyBookingsPage, MyCalendarPage, MyCommunityPage } from './pages/dashboard'
import { CookieConsent } from './components/ui/CookieConsent'
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
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/kontakt" element={<KontaktPage />} />
            <Route path="/datenschutz" element={<DatenschutzPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            {/* Dashboard Routes */}
            <Route path="/dashboard/profile" element={<MyProfilePage />} />
            <Route path="/dashboard/requests" element={<MyRequestsPage />} />
            <Route path="/dashboard/bookings" element={<MyBookingsPage />} />
            <Route path="/dashboard/calendar" element={<MyCalendarPage />} />
            <Route path="/dashboard/community" element={<MyCommunityPage />} />
          </Routes>
        </Layout>
        <CookieConsent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
