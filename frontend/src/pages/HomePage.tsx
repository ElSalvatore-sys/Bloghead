import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
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
import { OnboardingModal } from '../components/auth/OnboardingModal'
import { useAuth } from '../contexts/AuthContext'

export function HomePage() {
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { needsOnboarding, completeOnboarding, user } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Check for onboarding query param (from OAuth callback)
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding')
    if (onboardingParam === 'true' && user && needsOnboarding) {
      setShowOnboarding(true)
      // Clean up URL
      navigate('/', { replace: true })
    }
  }, [searchParams, user, needsOnboarding, navigate])

  // Also show onboarding if needsOnboarding is true from context
  useEffect(() => {
    if (user && needsOnboarding && !showOnboarding) {
      setShowOnboarding(true)
    }
  }, [user, needsOnboarding, showOnboarding])

  const handleMemberClick = () => {
    setShowRegisterModal(true)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    completeOnboarding()
    // Redirect to profile edit page after onboarding
    navigate('/profile/edit')
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
        onLoginClick={() => {
          setShowRegisterModal(false)
          // Could open login modal here if needed
        }}
      />

      {/* OAuth Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </div>
  )
}
