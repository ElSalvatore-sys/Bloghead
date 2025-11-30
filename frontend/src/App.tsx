import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import { HomePage, ArtistsPage, ArtistProfilePage, EventsPage, AboutPage, ProfileEditPage } from './pages'

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
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
