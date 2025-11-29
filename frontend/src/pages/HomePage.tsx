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

export function HomePage() {
  return (
    <div className="scroll-smooth">
      {/* Hero Section - Main banner with Bloghead branding */}
      <HeroSection />

      {/* About Section - Introduction to the platform */}
      <AboutSection />

      {/* Features Section - Platform USP and benefits */}
      <FeaturesSection />

      {/* Artists Carousel Section - Featured artists slider */}
      <ArtistsCarouselSection />

      {/* Member CTA Section - Call to action for registration */}
      <MemberCTASection />

      {/* Vorteile Member Section - Member benefits */}
      <VorteileMemberSection />

      {/* Events Section - Upcoming events showcase */}
      <EventsSection />

      {/* VR Experiences Section - Virtual reality concerts */}
      <VRExperiencesSection />
    </div>
  )
}
