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
  const { needsOnboarding, completeOnboarding, user, loading } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const onboardingTriggeredRef = useRef(false)
  const pendingOnboardingRef = useRef(false) // Track if we're waiting for user to load


  // CRITICAL: Check for onboarding query param (from OAuth callback)
  // Must handle the case where user is not yet loaded (loading=true)
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding')

    if (onboardingParam === 'true') {
      // Mark that we want to show onboarding
      pendingOnboardingRef.current = true

      // Clean up URL param immediately to prevent loops
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('onboarding')
      setSearchParams(newParams, { replace: true })

      // If user is already loaded, show modal now
      if (user && !loading) {
        setShowOnboarding(true)
        onboardingTriggeredRef.current = true
        pendingOnboardingRef.current = false
      }
    }
  }, [searchParams, setSearchParams, user, loading])

  // CRITICAL: Show onboarding when user finishes loading (if pending)
  useEffect(() => {
    if (!loading && user && pendingOnboardingRef.current && !showOnboarding) {
      setShowOnboarding(true)
      onboardingTriggeredRef.current = true
      pendingOnboardingRef.current = false
    }
  }, [loading, user, showOnboarding])

  // Also show onboarding if needsOnboarding is true from context (after loading completes)
  useEffect(() => {
    // Don't trigger if already triggered by URL param or pending
    if (onboardingTriggeredRef.current || pendingOnboardingRef.current) return

    if (!loading && user && needsOnboarding && !showOnboarding) {
      // Check if user hasn't dismissed onboarding before
      const dismissed = localStorage.getItem(`onboarding_dismissed_${user.id}`)
      if (!dismissed) {
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
    setShowOnboarding(false)
    onboardingTriggeredRef.current = false
    completeOnboarding()
    // Redirect to profile edit page after onboarding
    navigate('/profile/edit')
  }

  return (
    <div className="scroll-smooth">
      {/* Hero Section - Main banner with Bloghead branding (No animation for better LCP) */}
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
