import { useState, useEffect, useRef } from 'react'
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
import { updatePageMeta, pageSEO, injectStructuredData, organizationSchema, websiteSchema } from '../lib/seo'

export function HomePage() {
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { needsOnboarding, completeOnboarding, user, userProfile, loading } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const onboardingTriggeredRef = useRef(false)

  // Debug logging for auth state
  useEffect(() => {
    console.log('[HomePage] Auth state:', {
      user: user?.email,
      userType: userProfile?.user_type,
      needsOnboarding,
      loading,
      showOnboarding,
      searchParams: searchParams.toString()
    })
  }, [user, userProfile, needsOnboarding, loading, showOnboarding, searchParams])

  // Check for onboarding query param (from OAuth callback)
  // This triggers immediately when URL has ?onboarding=true
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding')
    console.log('[HomePage] Checking onboarding param:', onboardingParam, 'user:', !!user, 'loading:', loading)

    if (onboardingParam === 'true' && user) {
      console.log('[HomePage] Onboarding param detected, showing modal')
      setShowOnboarding(true)
      onboardingTriggeredRef.current = true
      // Clean up URL param
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('onboarding')
      setSearchParams(newParams, { replace: true })
    }
  }, [searchParams, user, loading, setSearchParams])

  // Also show onboarding if needsOnboarding is true from context (after loading completes)
  useEffect(() => {
    // Don't trigger if already triggered by URL param
    if (onboardingTriggeredRef.current) return

    if (!loading && user && needsOnboarding && !showOnboarding) {
      // Check if user hasn't dismissed onboarding before
      const dismissed = localStorage.getItem(`onboarding_dismissed_${user.id}`)
      if (!dismissed) {
        console.log('[HomePage] needsOnboarding is true, showing modal')
        setShowOnboarding(true)
      }
    }
  }, [user, needsOnboarding, loading, showOnboarding])

  // SEO meta tags and structured data
  useEffect(() => {
    updatePageMeta(pageSEO.home)
    injectStructuredData(organizationSchema)
    injectStructuredData(websiteSchema)
  }, [])

  const handleMemberClick = () => {
    setShowRegisterModal(true)
  }

  const handleOnboardingComplete = () => {
    console.log('[HomePage] Onboarding complete, closing modal')
    setShowOnboarding(false)
    onboardingTriggeredRef.current = false
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
