import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ImageUpload,
  FormSection,
  FormRow,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  TagsInput,
  SocialLinksInput,
  AudioUpload,
  FileUpload,
} from '../components/profile'
import { ArtistCalendar } from '../components/artist/ArtistCalendar'
import { Button } from '../components/ui'
import { InstagramIcon } from '../components/icons'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../contexts/AuthContext'

// Genre options
const genreOptions = [
  { value: '', label: 'Genre wählen' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'house', label: 'House' },
  { value: 'techno', label: 'Techno' },
  { value: 'hiphop', label: 'Hip Hop' },
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'klassik', label: 'Klassik' },
  { value: 'schlager', label: 'Schlager' },
  { value: 'other', label: 'Sonstiges' },
]

// Region options
const regionOptions = [
  { value: '', label: 'Region wählen' },
  { value: 'berlin', label: 'Berlin' },
  { value: 'hamburg', label: 'Hamburg' },
  { value: 'munich', label: 'München' },
  { value: 'cologne', label: 'Köln' },
  { value: 'frankfurt', label: 'Frankfurt' },
  { value: 'dusseldorf', label: 'Düsseldorf' },
  { value: 'stuttgart', label: 'Stuttgart' },
  { value: 'nationwide', label: 'Deutschlandweit' },
]

interface SocialLink {
  platform: string
  url: string
}

export function ProfileEditPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    userData,
    profile,
    userType,
    loading,
    saving,
    error,
    saveProfile,
    uploadImage,
    uploadAudio,
  } = useProfile()

  // State for form data
  const [coverImage, setCoverImage] = useState('')
  const [avatarImage, setAvatarImage] = useState('')

  // Personal data (from users table)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [birthDate, setBirthDate] = useState('')

  // Artist data (from artist_profiles table)
  const [artistName, setArtistName] = useState('')
  const [location, setLocation] = useState('')
  const [genre, setGenre] = useState('')
  const [region, setRegion] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [technique, setTechnique] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [eventRate, setEventRate] = useState('')

  // Business data
  const [companyName, setCompanyName] = useState('')
  const [companySeat, setCompanySeat] = useState('')
  const [taxNumber, setTaxNumber] = useState('')
  const [smallBusiness, setSmallBusiness] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [techRider, setTechRider] = useState<string>('')

  // Media
  const [bio, setBio] = useState('')
  const [audioSample, setAudioSample] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')

  // Calendar
  const [_selectedDates, setSelectedDates] = useState<number[]>([])
  const [bookedDates] = useState<number[]>([])
  const [pendingDates] = useState<number[]>([])
  const [eventDates] = useState<number[]>([])

  // Form state
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Populate form with loaded data
  useEffect(() => {
    if (userData) {
      setCoverImage((userData.cover_image_url as string) || '')
      setAvatarImage((userData.profile_image_url as string) || '')
      setFirstName((userData.vorname as string) || '')
      setLastName((userData.nachname as string) || '')
      setPhone((userData.telefonnummer as string) || '')
      setEmail((userData.email as string) || '')
      setBirthDate((userData.geburtsdatum as string) || '')
    }

    if (profile && userType === 'artist') {
      setArtistName((profile.kuenstlername as string) || '')
      setLocation((profile.stadt as string) || '')
      setGenre(((profile.genre as string[]) || [])[0] || '')
      setRegion((profile.region as string) || '')
      setJobTitle((profile.jobbezeichnung as string) || '')
      setTechnique((profile.technik_vorhanden as string) || '')
      setHourlyRate((profile.preis_pro_stunde as number)?.toString() || '')
      setEventRate((profile.preis_pro_veranstaltung as number)?.toString() || '')
      setCompanyName((profile.firmenname as string) || '')
      setCompanySeat((profile.sitz_der_firma as string) || '')
      setTaxNumber((profile.steuernummer as string) || '')
      setSmallBusiness((profile.kleinunternehmerregelung as boolean) || false)
      setTags((profile.tagged_with as string[]) || [])
      setBio((profile.bio as string) || '')
      setInstagramHandle((profile.instagram_profile as string) || '')

      // Parse social media from JSONB
      const socialMedia = profile.social_media as Record<string, string> | null
      if (socialMedia) {
        const links: SocialLink[] = Object.entries(socialMedia).map(([platform, url]) => ({
          platform,
          url,
        }))
        setSocialLinks(links)
      }

      // Parse audio URLs
      const audioUrls = profile.audio_urls as string[] | null
      if (audioUrls && audioUrls.length > 0) {
        setAudioSample(audioUrls[0])
      }

      // Parse tech rider
      setTechRider((profile.techwriter as string) || '')
    }
  }, [userData, profile, userType])

  const handleCoverImageSelect = async (file: File, previewUrl: string) => {
    setCoverImage(previewUrl)
    const url = await uploadImage(file, 'cover')
    if (url) {
      setCoverImage(url)
    }
  }

  const handleAvatarImageSelect = async (file: File, previewUrl: string) => {
    setAvatarImage(previewUrl)
    const url = await uploadImage(file, 'avatar')
    if (url) {
      setAvatarImage(url)
    }
  }

  const handleAudioSelect = async (file: File, _url: string) => {
    const url = await uploadAudio(file)
    if (url) {
      setAudioSample(url)
    }
  }

  const handleTechRiderSelect = (file: File) => {
    setTechRider(file.name)
  }

  const handleDateSelect = (date: number) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    )
  }

  const handleSave = async () => {
    setSaveError(null)
    setSaveSuccess(false)

    // Build user data object
    const userDataToSave = {
      vorname: firstName,
      nachname: lastName,
      telefonnummer: phone,
      geburtsdatum: birthDate || null,
      profile_image_url: avatarImage || null,
      cover_image_url: coverImage || null,
    }

    // Build profile data object (for artist)
    const profileDataToSave: Record<string, unknown> = {}

    if (userType === 'artist') {
      Object.assign(profileDataToSave, {
        kuenstlername: artistName,
        stadt: location,
        genre: genre ? [genre] : [],
        region: region,
        jobbezeichnung: jobTitle,
        technik_vorhanden: technique,
        preis_pro_stunde: hourlyRate ? parseFloat(hourlyRate) : null,
        preis_pro_veranstaltung: eventRate ? parseFloat(eventRate) : null,
        firmenname: companyName || null,
        sitz_der_firma: companySeat || null,
        steuernummer: taxNumber || null,
        kleinunternehmerregelung: smallBusiness,
        tagged_with: tags,
        bio: bio || null,
        instagram_profile: instagramHandle || null,
        techwriter: techRider || null,
        audio_urls: audioSample ? [audioSample] : [],
        social_media: socialLinks.reduce((acc, link) => {
          if (link.platform && link.url) {
            acc[link.platform] = link.url
          }
          return acc
        }, {} as Record<string, string>),
      })
    }

    const success = await saveProfile(userDataToSave, profileDataToSave)

    if (success) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      setSaveError('Profil konnte nicht gespeichert werden.')
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  // Redirect if not logged in
  if (!user && !loading) {
    navigate('/login')
    return null
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Profil wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Error/Success Messages */}
      {(error || saveError) && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg">
          {error || saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 text-white px-6 py-3 rounded-lg shadow-lg">
          Profil erfolgreich gespeichert!
        </div>
      )}

      {/* Cover Photo Section */}
      <div className="relative">
        <ImageUpload
          type="cover"
          currentImage={coverImage}
          onImageSelect={handleCoverImageSelect}
        />

        {/* Avatar - positioned at bottom of cover */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 md:-bottom-20">
          <ImageUpload
            type="avatar"
            currentImage={avatarImage}
            onImageSelect={handleAvatarImageSelect}
          />
        </div>
      </div>

      {/* Page Title */}
      <div className="pt-24 md:pt-28 pb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl text-white">
          PROFIL BEARBEITEN
        </h1>
        {userType && (
          <p className="text-white/60 mt-2 uppercase text-sm tracking-wider">
            {userType === 'artist' && 'Künstler'}
            {userType === 'fan' && 'Fan / Community'}
            {userType === 'veranstalter' && 'Veranstalter'}
            {userType === 'service_provider' && 'Dienstleister'}
            {userType === 'event_organizer' && 'Event Organizer'}
          </p>
        )}
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-4 pb-32">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-12">
          {/* Personal Data Section */}
          <FormSection title="PERSÖNLICHE DATEN">
            <FormRow>
              <FormInput
                label="Vorname"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Vorname"
              />
              <FormInput
                label="Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nachname"
              />
            </FormRow>

            <FormRow>
              <FormInput
                label="Telefonnummer"
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49 123 456789"
              />
              <FormInput
                label="E-Mail"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                disabled
              />
            </FormRow>

            <FormRow columns={1}>
              <FormInput
                label="Geburtsdatum"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </FormRow>
          </FormSection>

          {/* Artist Data Section - Only show for artists */}
          {userType === 'artist' && (
            <>
              <FormSection title="KÜNSTLER DATEN">
                <FormRow>
                  <FormInput
                    label="Künstlername"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Dein Künstlername"
                  />
                  <FormInput
                    label="Standort"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Stadt"
                  />
                </FormRow>

                <FormRow>
                  <FormSelect
                    label="Genre"
                    required
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    options={genreOptions}
                  />
                  <FormSelect
                    label="Region"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    options={regionOptions}
                  />
                </FormRow>

                <FormRow columns={1}>
                  <FormInput
                    label="Jobbezeichnung"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="z.B. DJ, Sänger, Band"
                  />
                </FormRow>

                <FormRow columns={1}>
                  <FormTextarea
                    label="Technik"
                    value={technique}
                    onChange={(e) => setTechnique(e.target.value)}
                    placeholder="Welche Technik nutzt du?"
                    rows={3}
                  />
                </FormRow>

                <FormRow>
                  <FormInput
                    label="Preis pro Stunde"
                    required
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="EUR"
                  />
                  <FormInput
                    label="Preis pro Veranstaltung"
                    type="number"
                    value={eventRate}
                    onChange={(e) => setEventRate(e.target.value)}
                    placeholder="EUR"
                  />
                </FormRow>
              </FormSection>

              {/* Business Data Section */}
              <FormSection title="GESCHÄFTSDATEN">
                <FormRow>
                  <FormInput
                    label="Firmenname"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Firmenname (optional)"
                  />
                  <FormInput
                    label="Sitz der Firma"
                    value={companySeat}
                    onChange={(e) => setCompanySeat(e.target.value)}
                    placeholder="Stadt"
                  />
                </FormRow>

                <FormRow columns={1}>
                  <FormInput
                    label="Steuernummer"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="DE123456789"
                  />
                </FormRow>

                <FormRow columns={1}>
                  <FormCheckbox
                    label="Kleinunternehmerregelung (§ 19 UStG)"
                    checked={smallBusiness}
                    onChange={(e) => setSmallBusiness(e.target.checked)}
                  />
                </FormRow>

                <FormRow columns={1}>
                  <TagsInput
                    label="Tagged With"
                    tags={tags}
                    onTagsChange={setTags}
                    placeholder="Tag hinzufügen..."
                  />
                </FormRow>

                <FormRow columns={1}>
                  <SocialLinksInput
                    label="Social Media"
                    links={socialLinks}
                    onLinksChange={setSocialLinks}
                  />
                </FormRow>

                <FormRow columns={1}>
                  <FileUpload
                    label="Techwriter / Rider"
                    accept=".pdf,.doc,.docx"
                    currentFile={techRider}
                    onFileSelect={handleTechRiderSelect}
                  />
                </FormRow>
              </FormSection>

              {/* Media Section */}
              <FormSection title="ÜBER MICH">
                <FormRow columns={1}>
                  <FormTextarea
                    label="Something About Me"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Erzähle etwas über dich..."
                    rows={5}
                  />
                </FormRow>

                <FormRow columns={1}>
                  <AudioUpload
                    label="Hörprobe hinzufügen"
                    audioUrl={audioSample}
                    onAudioSelect={handleAudioSelect}
                  />
                </FormRow>

                {/* Instagram Section */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <InstagramIcon size={24} className="text-white/60" />
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                      Instagram Profil hinzufügen
                    </label>
                  </div>

                  <FormInput
                    label="Instagram Handle"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@username"
                  />

                  {/* Instagram Preview Grid - Mock */}
                  {instagramHandle && (
                    <div className="mt-4">
                      <p className="text-xs text-white/40 mb-3">
                        Vorschau von @{instagramHandle}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="aspect-square bg-bg-card rounded overflow-hidden"
                          >
                            <img
                              src={`https://picsum.photos/200?random=${i}`}
                              alt={`Instagram post ${i}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormSection>

              {/* Calendar Section */}
              <FormSection title="VERFÜGBARKEIT">
                <p className="text-sm text-white/60 mb-4">
                  Klicke auf Tage, um deine Verfügbarkeit zu ändern.
                </p>
                <ArtistCalendar
                  bookedDates={bookedDates}
                  pendingDates={pendingDates}
                  eventDates={eventDates}
                  onDateSelect={handleDateSelect}
                />
              </FormSection>
            </>
          )}
        </form>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-white/10 py-4 px-4 z-30">
        <div className="max-w-4xl mx-auto flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            ABBRECHEN
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                WIRD GESPEICHERT...
              </span>
            ) : (
              'ÄNDERUNGEN SPEICHERN'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
