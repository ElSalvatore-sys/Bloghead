import { useState } from 'react'
import {
  HeroSection,
  AboutSection,
  FeaturesSection,
  ArtistsCarouselSection,
  MemberCTASection,
  VorteileMemberSection,
  EventsSection,
  VRExperiencesSection,
} from '../components/sections'
import { RegisterModal } from '../components/auth'

export function HomePage() {
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const handleMemberClick = () => {
    setShowRegisterModal(true)
  }

  return (
    <div className="scroll-smooth">
      {/* Hero Section - Main banner with Bloghead branding */}
      <HeroSection onMemberClick={handleMemberClick} />

      {/* About Section - Introduction to the platform */}
      <AboutSection />

      {/* Features Section - Platform USP and benefits */}
      <FeaturesSection onRegisterClick={handleMemberClick} />

      {/* Artists Carousel Section - Featured artists with member benefits */}
      <ArtistsCarouselSection onMemberClick={handleMemberClick} />

      {/* Member CTA Section - Call to action for registration */}
      <MemberCTASection onMemberClick={handleMemberClick} />

      {/* Vorteile Member Section - Member benefits */}
      <VorteileMemberSection onMemberClick={handleMemberClick} />

      {/* Events Section - Upcoming events showcase */}
      <EventsSection />

      {/* VR Experiences Section - Virtual reality concerts */}
      <VRExperiencesSection />

      {/* Registration Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegister={(data) => {
          console.log('Register:', data)
          setShowRegisterModal(false)
        }}
        onLoginClick={() => {
          setShowRegisterModal(false)
          // Could open login modal here if needed
        }}
      />
    </div>
  )
}
