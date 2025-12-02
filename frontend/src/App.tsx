import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import { HomePage, ArtistsPage, ArtistProfilePage, EventsPage, AboutPage, ProfileEditPage } from './pages'
import ImpressumPage from './pages/ImpressumPage'
import KontaktPage from './pages/KontaktPage'
import DatenschutzPage from './pages/DatenschutzPage'
import { CookieConsent } from './components/ui/CookieConsent'

function App() {
  return (
    <BrowserRouter>
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
        </Routes>
      </Layout>
      <CookieConsent />
    </BrowserRouter>
  )
}

export default App
