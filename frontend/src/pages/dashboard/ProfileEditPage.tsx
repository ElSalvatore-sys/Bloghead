import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import { fadeInUp, staggerContainer, staggerItem } from '../../lib/animations'
import { Input } from '../../components/ui/Input'
import {
  ImageUpload,
  GalleryUpload,
  SocialLinksInput,
  PriceRangeInput,
  SearchableMultiSelect
} from '../../components/forms'
import {
  GENRE_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
  EVENT_TYPE_OPTIONS,
  EQUIPMENT_OPTIONS,
  AMENITY_OPTIONS,
  LANGUAGE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  AVAILABILITY_OPTIONS,
  TRAVEL_RADIUS_OPTIONS,
  VENUE_TYPE_OPTIONS,
  GERMAN_CITIES
} from '../../constants/profileOptions'

// Profile Section Tabs by User Type
const SECTION_TABS = {
  common: [
    { id: 'basic', label: 'Basisdaten', icon: 'user' },
    { id: 'contact', label: 'Kontakt', icon: 'phone' },
    { id: 'social', label: 'Social Media', icon: 'share' },
    { id: 'bio', label: 'Über mich', icon: 'info' },
  ],
  artist: [
    { id: 'performance', label: 'Performance', icon: 'music' },
    { id: 'pricing', label: 'Preise', icon: 'euro' },
    { id: 'media', label: 'Medien', icon: 'image' },
    { id: 'availability', label: 'Verfügbarkeit', icon: 'calendar' },
    { id: 'equipment', label: 'Equipment', icon: 'settings' },
    { id: 'experience', label: 'Erfahrung', icon: 'award' },
  ],
  service_provider: [
    { id: 'services', label: 'Leistungen', icon: 'briefcase' },
    { id: 'business', label: 'Geschäft', icon: 'building' },
    { id: 'portfolio', label: 'Portfolio', icon: 'folder' },
  ],
  event_organizer: [
    { id: 'company', label: 'Firma', icon: 'building' },
    { id: 'venue', label: 'Location', icon: 'map-pin' },
    { id: 'events', label: 'Events', icon: 'calendar' },
  ],
  veranstalter: [
    { id: 'company', label: 'Firma', icon: 'building' },
    { id: 'venue', label: 'Location', icon: 'map-pin' },
    { id: 'events', label: 'Events', icon: 'calendar' },
  ],
  fan: [
    { id: 'preferences', label: 'Vorlieben', icon: 'heart' },
  ],
}

// Tab Icon component
const TabIcon = ({ icon, className = '' }: { icon: string; className?: string }) => {
  const iconClasses = `w-5 h-5 ${className}`

  switch (icon) {
    case 'user':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    case 'phone':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
    case 'share':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
    case 'info':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'music':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
    case 'euro':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'image':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    case 'calendar':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    case 'settings':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    case 'award':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
    case 'briefcase':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    case 'building':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    case 'folder':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
    case 'map-pin':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    case 'heart':
      return <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    default:
      return null
  }
}

type UserType = 'fan' | 'artist' | 'service_provider' | 'event_organizer' | 'veranstalter'

interface FormData {
  // Basic Info
  membername: string
  vorname: string
  nachname: string
  profile_image_url: string | null
  cover_image_url: string | null

  // Contact
  telefonnummer: string
  email: string
  stadt: string

  // Social Links
  social_links: { platform: string; url: string }[]
  website_url: string

  // Bio
  bio: string
  about_me: string

  // Artist specific
  kuenstlername: string
  genre: string[]
  preis_pro_stunde: number | null
  preis_pro_veranstaltung: number | null
  preis_minimum: number | null
  audio_urls: string[]
  video_urls: string[]
  intro_video_url: string
  technik_vorhanden: string[]
  technik_benoetigt: string[]
  experience_level: string
  experience_years: number | null
  availability: string[]
  travel_radius: string
  languages: string[]

  // Service Provider specific
  business_name: string
  service_category: string
  service_description: string
  min_price: number | null
  max_price: number | null
  gallery_urls: string[]

  // Event Organizer specific
  company_name: string
  venue_name: string
  venue_type: string
  venue_capacity: number | null
  venue_amenities: string[]
  preferred_event_types: string[]
  preferred_genres: string[]

  // Fan specific
  favorite_genres: string[]
  location_city: string
}

const initialFormData: FormData = {
  membername: '',
  vorname: '',
  nachname: '',
  profile_image_url: null,
  cover_image_url: null,
  telefonnummer: '',
  email: '',
  stadt: '',
  social_links: [],
  website_url: '',
  bio: '',
  about_me: '',
  kuenstlername: '',
  genre: [],
  preis_pro_stunde: null,
  preis_pro_veranstaltung: null,
  preis_minimum: null,
  audio_urls: [],
  video_urls: [],
  intro_video_url: '',
  technik_vorhanden: [],
  technik_benoetigt: [],
  experience_level: '',
  experience_years: null,
  availability: [],
  travel_radius: '',
  languages: [],
  business_name: '',
  service_category: '',
  service_description: '',
  min_price: null,
  max_price: null,
  gallery_urls: [],
  company_name: '',
  venue_name: '',
  venue_type: '',
  venue_capacity: null,
  venue_amenities: [],
  preferred_event_types: [],
  preferred_genres: [],
  favorite_genres: [],
  location_city: '',
}

export default function ProfileEditPage() {
  const { userProfile } = useAuth()
  const { userData, profile, loading, saving, error, loadProfile, saveProfile } = useProfile()

  const [activeSection, setActiveSection] = useState('basic')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const userType = (userProfile?.user_type || 'fan') as UserType

  // Get tabs for current user type
  const tabs = [
    ...SECTION_TABS.common,
    ...(SECTION_TABS[userType] || [])
  ]

  // Load profile data
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Populate form when data loads
  useEffect(() => {
    if (userData || profile) {
      const newFormData: FormData = {
        ...initialFormData,
        // User data
        membername: (userData?.membername as string) || '',
        vorname: (userData?.vorname as string) || '',
        nachname: (userData?.nachname as string) || '',
        profile_image_url: (userData?.profile_image_url as string) || null,
        cover_image_url: (userData?.cover_image_url as string) || null,
        telefonnummer: (userData?.telefonnummer as string) || '',
        email: (userData?.email as string) || '',
        // Profile data (varies by type)
        ...(profile ? mapProfileToForm(profile, userType) : {})
      }
      setFormData(newFormData)
    }
  }, [userData, profile, userType])

  // Map profile data to form fields based on user type
  const mapProfileToForm = (profileData: Record<string, unknown>, type: UserType): Partial<FormData> => {
    const mapped: Partial<FormData> = {}

    switch (type) {
      case 'artist':
        mapped.kuenstlername = (profileData.kuenstlername as string) || ''
        mapped.bio = (profileData.bio as string) || ''
        mapped.stadt = (profileData.stadt as string) || ''
        mapped.genre = (profileData.genre as string[]) || []
        mapped.preis_pro_stunde = (profileData.preis_pro_stunde as number) || null
        mapped.preis_pro_veranstaltung = (profileData.preis_pro_veranstaltung as number) || null
        mapped.preis_minimum = (profileData.preis_minimum as number) || null
        mapped.audio_urls = (profileData.audio_urls as string[]) || []
        mapped.video_urls = (profileData.video_urls as string[]) || []
        mapped.intro_video_url = (profileData.intro_video_url as string) || ''
        mapped.technik_vorhanden = (profileData.technik_vorhanden as string[]) || []
        mapped.technik_benoetigt = (profileData.technik_benoetigt as string[]) || []
        mapped.website_url = (profileData.website_url as string) || ''
        // Map social links from individual fields
        const artistSocials: { platform: string; url: string }[] = []
        if (profileData.instagram_profile) artistSocials.push({ platform: 'instagram', url: profileData.instagram_profile as string })
        if (profileData.soundcloud_url) artistSocials.push({ platform: 'soundcloud', url: profileData.soundcloud_url as string })
        mapped.social_links = artistSocials
        break

      case 'service_provider':
        mapped.business_name = (profileData.business_name as string) || ''
        mapped.service_description = (profileData.description as string) || ''
        mapped.stadt = (profileData.city as string) || ''
        mapped.min_price = (profileData.min_price as number) || null
        mapped.max_price = (profileData.max_price as number) || null
        mapped.gallery_urls = (profileData.gallery_urls as string[]) || []
        mapped.website_url = (profileData.website_url as string) || ''
        const spSocials: { platform: string; url: string }[] = []
        if (profileData.instagram_handle) spSocials.push({ platform: 'instagram', url: profileData.instagram_handle as string })
        mapped.social_links = spSocials
        break

      case 'event_organizer':
      case 'veranstalter':
        mapped.company_name = (profileData.business_name as string) || (profileData.company_name as string) || ''
        mapped.venue_name = (profileData.venue_name as string) || ''
        mapped.stadt = (profileData.city as string) || ''
        mapped.website_url = (profileData.website_url as string) || ''
        const eoSocials: { platform: string; url: string }[] = []
        if (profileData.instagram_handle) eoSocials.push({ platform: 'instagram', url: profileData.instagram_handle as string })
        mapped.social_links = eoSocials
        break

      case 'fan':
        mapped.favorite_genres = (profileData.favorite_genres as string[]) || []
        mapped.about_me = (profileData.about_me as string) || ''
        mapped.location_city = (profileData.location_city as string) || ''
        if (profileData.social_links) {
          mapped.social_links = profileData.social_links as { platform: string; url: string }[]
        }
        break
    }

    return mapped
  }

  // Update form field
  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setSaveSuccess(false)
  }, [])

  // Handle save
  const handleSave = async () => {
    // Map form data to userData and profileData based on user type
    const userData = {
      membername: formData.membername,
      vorname: formData.vorname,
      nachname: formData.nachname,
      profile_image_url: formData.profile_image_url,
      cover_image_url: formData.cover_image_url,
      telefonnummer: formData.telefonnummer,
    }

    let profileData: Record<string, unknown> = {}

    switch (userType) {
      case 'artist':
        profileData = {
          kuenstlername: formData.kuenstlername,
          bio: formData.bio,
          stadt: formData.stadt,
          genre: formData.genre,
          preis_pro_stunde: formData.preis_pro_stunde,
          preis_pro_veranstaltung: formData.preis_pro_veranstaltung,
          preis_minimum: formData.preis_minimum,
          audio_urls: formData.audio_urls,
          video_urls: formData.video_urls,
          intro_video_url: formData.intro_video_url,
          technik_vorhanden: formData.technik_vorhanden,
          technik_benoetigt: formData.technik_benoetigt,
          website_url: formData.website_url,
          instagram_profile: formData.social_links.find(l => l.platform === 'instagram')?.url || null,
          soundcloud_url: formData.social_links.find(l => l.platform === 'soundcloud')?.url || null,
        }
        break

      case 'service_provider':
        profileData = {
          business_name: formData.business_name,
          description: formData.service_description,
          city: formData.stadt,
          min_price: formData.min_price,
          max_price: formData.max_price,
          gallery_urls: formData.gallery_urls,
          website_url: formData.website_url,
          instagram_handle: formData.social_links.find(l => l.platform === 'instagram')?.url || null,
        }
        break

      case 'event_organizer':
      case 'veranstalter':
        profileData = {
          business_name: formData.company_name,
          venue_name: formData.venue_name,
          city: formData.stadt,
          website_url: formData.website_url,
          instagram_handle: formData.social_links.find(l => l.platform === 'instagram')?.url || null,
        }
        break

      case 'fan':
        profileData = {
          favorite_genres: formData.favorite_genres,
          about_me: formData.about_me,
          location_city: formData.location_city,
          social_links: formData.social_links,
        }
        break
    }

    const success = await saveProfile(userData, profileData)
    if (success) {
      setHasChanges(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'basic':
        return <BasicInfoSection formData={formData} updateField={updateField} userType={userType} />
      case 'contact':
        return <ContactSection formData={formData} updateField={updateField} />
      case 'social':
        return <SocialSection formData={formData} updateField={updateField} />
      case 'bio':
        return <BioSection formData={formData} updateField={updateField} userType={userType} />
      case 'performance':
        return <PerformanceSection formData={formData} updateField={updateField} />
      case 'pricing':
        return <PricingSection formData={formData} updateField={updateField} userType={userType} />
      case 'media':
        return <MediaSection formData={formData} updateField={updateField} />
      case 'availability':
        return <AvailabilitySection formData={formData} updateField={updateField} />
      case 'equipment':
        return <EquipmentSection formData={formData} updateField={updateField} />
      case 'experience':
        return <ExperienceSection formData={formData} updateField={updateField} />
      case 'services':
        return <ServicesSection formData={formData} updateField={updateField} />
      case 'business':
        return <BusinessSection formData={formData} updateField={updateField} />
      case 'portfolio':
        return <PortfolioSection formData={formData} updateField={updateField} />
      case 'company':
        return <CompanySection formData={formData} updateField={updateField} />
      case 'venue':
        return <VenueSection formData={formData} updateField={updateField} />
      case 'events':
        return <EventsSection formData={formData} updateField={updateField} />
      case 'preferences':
        return <PreferencesSection formData={formData} updateField={updateField} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#610AD1] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#171717] pb-24">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-gradient-to-r from-[#610AD1]/20 to-[#FB7A43]/20 border-b border-gray-800"
      >
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white">Profil bearbeiten</h1>
          <p className="text-gray-400 mt-2">
            Vervollständige dein Profil, um mehr Sichtbarkeit zu erhalten
          </p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-20 bg-[#171717]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all ${
                  activeSection === tab.id
                    ? 'bg-[#610AD1] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <TabIcon icon={tab.icon} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderSectionContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Save Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/95 backdrop-blur-sm border-t border-gray-800 py-4 z-30"
          >
            <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Du hast ungespeicherte Änderungen
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    loadProfile()
                    setHasChanges(false)
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Verwerfen
                </button>
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-[#610AD1] text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    'Speichern'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Änderungen gespeichert
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Section Components
interface SectionProps {
  formData: FormData
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void
  userType?: UserType
}

function BasicInfoSection({ formData, updateField, userType }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Profilbilder</h2>

        <div className="space-y-6">
          <ImageUpload
            value={formData.profile_image_url}
            onChange={(url) => updateField('profile_image_url', url)}
            bucket="avatars"
            label="Profilbild"
            helpText="Wird als Avatar angezeigt. Empfohlen: Quadratisches Bild, min. 400x400px"
            aspectRatio="square"
            className="max-w-xs"
          />

          <ImageUpload
            value={formData.cover_image_url}
            onChange={(url) => updateField('cover_image_url', url)}
            bucket="covers"
            label="Titelbild"
            helpText="Wird als Banner auf deinem Profil angezeigt. Empfohlen: 1200x400px"
            aspectRatio="cover"
          />
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Persönliche Daten</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Benutzername"
            value={formData.membername}
            onChange={(e) => updateField('membername', e.target.value)}
            placeholder="Dein öffentlicher Name"
          />

          {userType === 'artist' && (
            <Input
              label="Künstlername"
              value={formData.kuenstlername}
              onChange={(e) => updateField('kuenstlername', e.target.value)}
              placeholder="Dein Künstlername"
            />
          )}

          <Input
            label="Vorname"
            value={formData.vorname}
            onChange={(e) => updateField('vorname', e.target.value)}
            placeholder="Dein Vorname"
          />

          <Input
            label="Nachname"
            value={formData.nachname}
            onChange={(e) => updateField('nachname', e.target.value)}
            placeholder="Dein Nachname"
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

function ContactSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Kontaktdaten</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="E-Mail"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="deine@email.de"
            disabled
            helperText="E-Mail kann nicht geändert werden"
          />

          <Input
            label="Telefon"
            type="tel"
            value={formData.telefonnummer}
            onChange={(e) => updateField('telefonnummer', e.target.value)}
            placeholder="+49 123 456789"
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-200 mb-2">Stadt</label>
            <select
              value={formData.stadt}
              onChange={(e) => updateField('stadt', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
            >
              <option value="">Stadt auswählen...</option>
              {GERMAN_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SocialSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Social Media</h2>

        <SocialLinksInput
          value={formData.social_links}
          onChange={(links) => updateField('social_links', links)}
          label="Profile verknüpfen"
          helpText="Füge deine Social Media Profile hinzu, um deine Reichweite zu zeigen"
        />

        <div className="mt-6">
          <Input
            label="Webseite"
            type="url"
            value={formData.website_url}
            onChange={(e) => updateField('website_url', e.target.value)}
            placeholder="https://deine-webseite.de"
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

function BioSection({ formData, updateField, userType }: SectionProps) {
  const bioField = userType === 'fan' ? 'about_me' : 'bio'
  const bioValue = userType === 'fan' ? formData.about_me : formData.bio

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Über mich</h2>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            {userType === 'artist' ? 'Biografie' : 'Beschreibung'}
          </label>
          <textarea
            value={bioValue}
            onChange={(e) => updateField(bioField as keyof FormData, e.target.value)}
            placeholder={
              userType === 'artist'
                ? 'Erzähle etwas über dich, deine Musik und deinen Stil...'
                : 'Erzähle etwas über dich...'
            }
            rows={6}
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#610AD1] resize-none"
          />
          <p className="mt-2 text-xs text-gray-500">
            {bioValue.length}/1000 Zeichen
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function PerformanceSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Genres & Stil</h2>

        <SearchableMultiSelect
          options={GENRE_OPTIONS}
          value={formData.genre}
          onChange={(val) => updateField('genre', val)}
          label="Genres"
          placeholder="Genre suchen..."
          helpText="Wähle die Genres, in denen du auftrittst"
          maxSelections={10}
          allowCustom
          customPlaceholder="Eigenes Genre hinzufügen..."
        />
      </motion.div>

      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Sprachen</h2>

        <SearchableMultiSelect
          options={LANGUAGE_OPTIONS}
          value={formData.languages}
          onChange={(val) => updateField('languages', val)}
          label="Sprachen"
          placeholder="Sprache suchen..."
          helpText="Sprachen, die du bei Auftritten sprichst"
          maxSelections={5}
        />
      </motion.div>
    </motion.div>
  )
}

function PricingSection({ formData, updateField, userType }: SectionProps) {
  if (userType === 'artist') {
    return (
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
        <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-6">Preisgestaltung</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Pro Stunde</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                <input
                  type="number"
                  min="0"
                  value={formData.preis_pro_stunde ?? ''}
                  onChange={(e) => updateField('preis_pro_stunde', e.target.value ? Number(e.target.value) : null)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Pro Veranstaltung</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                <input
                  type="number"
                  min="0"
                  value={formData.preis_pro_veranstaltung ?? ''}
                  onChange={(e) => updateField('preis_pro_veranstaltung', e.target.value ? Number(e.target.value) : null)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Mindestgage</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                <input
                  type="number"
                  min="0"
                  value={formData.preis_minimum ?? ''}
                  onChange={(e) => updateField('preis_minimum', e.target.value ? Number(e.target.value) : null)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
                />
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Preise sind Richtwerte. Du kannst individuelle Angebote in der Buchungsanfrage erstellen.
          </p>
        </motion.div>
      </motion.div>
    )
  }

  // Service Provider pricing
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Preisrahmen</h2>

        <PriceRangeInput
          minValue={formData.min_price}
          maxValue={formData.max_price}
          onMinChange={(val) => updateField('min_price', val)}
          onMaxChange={(val) => updateField('max_price', val)}
          label="Preisspanne"
          helpText="Gib deine ungefähre Preisspanne an"
        />
      </motion.div>
    </motion.div>
  )
}

function MediaSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Intro-Video</h2>

        <Input
          label="Video URL"
          type="url"
          value={formData.intro_video_url}
          onChange={(e) => updateField('intro_video_url', e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          helperText="YouTube oder Vimeo Link zu deinem Intro-Video"
        />
      </motion.div>

      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Galerie</h2>

        <GalleryUpload
          value={formData.gallery_urls}
          onChange={(urls) => updateField('gallery_urls', urls)}
          bucket="gallery"
          label="Bilder"
          helpText="Lade Fotos von deinen Auftritten hoch. Ziehe zum Sortieren."
          maxImages={12}
        />
      </motion.div>
    </motion.div>
  )
}

function AvailabilitySection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Verfügbarkeit</h2>

        <SearchableMultiSelect
          options={AVAILABILITY_OPTIONS}
          value={formData.availability}
          onChange={(val) => updateField('availability', val)}
          label="Wann bist du verfügbar?"
          placeholder="Verfügbarkeit auswählen..."
          helpText="Wähle alle zutreffenden Optionen"
        />
      </motion.div>

      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Einsatzgebiet</h2>

        <label className="block text-sm font-medium text-gray-200 mb-2">Reiseradius</label>
        <select
          value={formData.travel_radius}
          onChange={(e) => updateField('travel_radius', e.target.value)}
          className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
        >
          <option value="">Reiseradius auswählen...</option>
          {TRAVEL_RADIUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </motion.div>
    </motion.div>
  )
}

function EquipmentSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Eigenes Equipment</h2>

        <SearchableMultiSelect
          options={EQUIPMENT_OPTIONS}
          value={formData.technik_vorhanden}
          onChange={(val) => updateField('technik_vorhanden', val)}
          label="Vorhandene Technik"
          placeholder="Equipment suchen..."
          helpText="Equipment, das du selbst mitbringst"
          allowCustom
          customPlaceholder="Eigenes Equipment hinzufügen..."
        />
      </motion.div>

      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Benötigte Technik</h2>

        <SearchableMultiSelect
          options={EQUIPMENT_OPTIONS}
          value={formData.technik_benoetigt}
          onChange={(val) => updateField('technik_benoetigt', val)}
          label="Benötigte Technik"
          placeholder="Equipment suchen..."
          helpText="Equipment, das vom Veranstalter gestellt werden muss"
          allowCustom
          customPlaceholder="Benötigtes Equipment hinzufügen..."
        />
      </motion.div>
    </motion.div>
  )
}

function ExperienceSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Erfahrung</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Erfahrungslevel</label>
            <select
              value={formData.experience_level}
              onChange={(e) => updateField('experience_level', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
            >
              <option value="">Level auswählen...</option>
              {EXPERIENCE_LEVEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Jahre Erfahrung</label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.experience_years ?? ''}
              onChange={(e) => updateField('experience_years', e.target.value ? Number(e.target.value) : null)}
              placeholder="z.B. 5"
              className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ServicesSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Dienstleistung</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Kategorie</label>
            <select
              value={formData.service_category}
              onChange={(e) => updateField('service_category', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
            >
              <option value="">Kategorie auswählen...</option>
              {SERVICE_CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Beschreibung</label>
            <textarea
              value={formData.service_description}
              onChange={(e) => updateField('service_description', e.target.value)}
              placeholder="Beschreibe deine Dienstleistungen im Detail..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#610AD1] resize-none"
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Preisrahmen</h2>

        <PriceRangeInput
          minValue={formData.min_price}
          maxValue={formData.max_price}
          onMinChange={(val) => updateField('min_price', val)}
          onMaxChange={(val) => updateField('max_price', val)}
          label="Preisspanne"
          helpText="Deine ungefähre Preisspanne für Anfragen"
        />
      </motion.div>
    </motion.div>
  )
}

function BusinessSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Geschäftsdaten</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Firmenname"
            value={formData.business_name}
            onChange={(e) => updateField('business_name', e.target.value)}
            placeholder="Name deines Unternehmens"
          />

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Stadt</label>
            <select
              value={formData.stadt}
              onChange={(e) => updateField('stadt', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
            >
              <option value="">Stadt auswählen...</option>
              {GERMAN_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function PortfolioSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Portfolio</h2>

        <GalleryUpload
          value={formData.gallery_urls}
          onChange={(urls) => updateField('gallery_urls', urls)}
          bucket="gallery"
          label="Arbeitsproben"
          helpText="Zeige deine besten Arbeiten. Ziehe zum Sortieren."
          maxImages={20}
        />
      </motion.div>
    </motion.div>
  )
}

function CompanySection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Firmendaten</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Firmenname"
            value={formData.company_name}
            onChange={(e) => updateField('company_name', e.target.value)}
            placeholder="Name deines Unternehmens"
          />

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Stadt</label>
            <select
              value={formData.stadt}
              onChange={(e) => updateField('stadt', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
            >
              <option value="">Stadt auswählen...</option>
              {GERMAN_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function VenueSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Location</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Name der Location"
            value={formData.venue_name}
            onChange={(e) => updateField('venue_name', e.target.value)}
            placeholder="z.B. Club XYZ"
          />

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Art der Location</label>
            <select
              value={formData.venue_type}
              onChange={(e) => updateField('venue_type', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
            >
              <option value="">Art auswählen...</option>
              {VENUE_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Kapazität</label>
            <input
              type="number"
              min="0"
              value={formData.venue_capacity ?? ''}
              onChange={(e) => updateField('venue_capacity', e.target.value ? Number(e.target.value) : null)}
              placeholder="z.B. 500"
              className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
            />
            <p className="mt-1 text-xs text-gray-500">Maximale Besucherzahl</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Ausstattung</h2>

        <SearchableMultiSelect
          options={AMENITY_OPTIONS}
          value={formData.venue_amenities}
          onChange={(val) => updateField('venue_amenities', val)}
          label="Vorhandene Ausstattung"
          placeholder="Ausstattung suchen..."
          helpText="Was bietet deine Location?"
          allowCustom
        />
      </motion.div>
    </motion.div>
  )
}

function EventsSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Event-Präferenzen</h2>

        <div className="space-y-6">
          <SearchableMultiSelect
            options={EVENT_TYPE_OPTIONS}
            value={formData.preferred_event_types}
            onChange={(val) => updateField('preferred_event_types', val)}
            label="Bevorzugte Event-Arten"
            placeholder="Event-Art suchen..."
            helpText="Welche Events organisierst du hauptsächlich?"
          />

          <SearchableMultiSelect
            options={GENRE_OPTIONS}
            value={formData.preferred_genres}
            onChange={(val) => updateField('preferred_genres', val)}
            label="Bevorzugte Musik-Genres"
            placeholder="Genre suchen..."
            helpText="Welche Musik-Genres buchst du bevorzugt?"
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

function PreferencesSection({ formData, updateField }: SectionProps) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Musikvorlieben</h2>

        <SearchableMultiSelect
          options={GENRE_OPTIONS}
          value={formData.favorite_genres}
          onChange={(val) => updateField('favorite_genres', val)}
          label="Lieblingsgenres"
          placeholder="Genre suchen..."
          helpText="Welche Musik hörst du am liebsten?"
          maxSelections={15}
          allowCustom
        />
      </motion.div>

      <motion.div variants={staggerItem} className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Standort</h2>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Stadt</label>
          <select
            value={formData.location_city}
            onChange={(e) => updateField('location_city', e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#610AD1]"
          >
            <option value="">Stadt auswählen...</option>
            {GERMAN_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Für lokale Event-Empfehlungen</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
