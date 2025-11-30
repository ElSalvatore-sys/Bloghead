import { useState } from 'react'
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

// Mock data for pre-filling the form
const mockProfileData = {
  // Cover and avatar
  coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
  avatarImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',

  // Personal data
  firstName: 'Max',
  lastName: 'Mustermann',
  street: 'Musterstraße',
  houseNumber: '123',
  postalCode: '10115',
  city: 'Berlin',
  phone: '+49 123 456789',
  email: 'max@example.com',
  birthDate: '1990-05-15',

  // Artist data
  artistName: 'DJ Maximus',
  location: 'Berlin',
  genre: 'electronic',
  region: 'berlin',
  jobTitle: 'DJ / Producer',
  technique: 'Pioneer CDJ-3000, DJM-900NXS2, Ableton Live, Native Instruments Traktor',
  hourlyRate: '150',
  eventRate: '800',

  // Business data
  companyName: 'Max Mustermann Entertainment',
  companySeat: 'Berlin',
  taxNumber: 'DE123456789',
  smallBusiness: false,
  tags: ['DJ', 'Electronic', 'House', 'Techno'],
  socialLinks: [
    { platform: 'instagram', url: 'https://instagram.com/djmaximus' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/djmaximus' },
  ],

  // Media
  bio: 'Seit über 10 Jahren bringe ich Menschen mit meiner Musik zum Tanzen. Mein Stil verbindet melodischen House mit treibendem Techno. Ich habe auf Festivals wie dem Fusion und in Clubs wie dem Berghain aufgelegt.',
  audioSample: '',
  instagramHandle: 'djmaximus',

  // Calendar - mock booked/pending dates
  bookedDates: [5, 12, 19],
  pendingDates: [8, 15],
  eventDates: [5, 19],
  availableDates: [1, 2, 3, 6, 7, 9, 10, 11, 13, 14, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
}

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

  // State for form data
  const [coverImage, setCoverImage] = useState(mockProfileData.coverImage)
  const [avatarImage, setAvatarImage] = useState(mockProfileData.avatarImage)

  // Personal data
  const [firstName, setFirstName] = useState(mockProfileData.firstName)
  const [lastName, setLastName] = useState(mockProfileData.lastName)
  const [street, setStreet] = useState(mockProfileData.street)
  const [houseNumber, setHouseNumber] = useState(mockProfileData.houseNumber)
  const [postalCode, setPostalCode] = useState(mockProfileData.postalCode)
  const [city, setCity] = useState(mockProfileData.city)
  const [phone, setPhone] = useState(mockProfileData.phone)
  const [email, setEmail] = useState(mockProfileData.email)
  const [birthDate, setBirthDate] = useState(mockProfileData.birthDate)

  // Artist data
  const [artistName, setArtistName] = useState(mockProfileData.artistName)
  const [location, setLocation] = useState(mockProfileData.location)
  const [genre, setGenre] = useState(mockProfileData.genre)
  const [region, setRegion] = useState(mockProfileData.region)
  const [jobTitle, setJobTitle] = useState(mockProfileData.jobTitle)
  const [technique, setTechnique] = useState(mockProfileData.technique)
  const [hourlyRate, setHourlyRate] = useState(mockProfileData.hourlyRate)
  const [eventRate, setEventRate] = useState(mockProfileData.eventRate)

  // Business data
  const [companyName, setCompanyName] = useState(mockProfileData.companyName)
  const [companySeat, setCompanySeat] = useState(mockProfileData.companySeat)
  const [taxNumber, setTaxNumber] = useState(mockProfileData.taxNumber)
  const [smallBusiness, setSmallBusiness] = useState(mockProfileData.smallBusiness)
  const [tags, setTags] = useState(mockProfileData.tags)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(mockProfileData.socialLinks)
  const [techRider, setTechRider] = useState<string>('')

  // Media
  const [bio, setBio] = useState(mockProfileData.bio)
  const [audioSample, setAudioSample] = useState(mockProfileData.audioSample)
  const [instagramHandle, setInstagramHandle] = useState(mockProfileData.instagramHandle)

  // Calendar
  const [selectedDates, setSelectedDates] = useState<number[]>(mockProfileData.availableDates)

  const handleCoverImageSelect = (_file: File, previewUrl: string) => {
    setCoverImage(previewUrl)
  }

  const handleAvatarImageSelect = (_file: File, previewUrl: string) => {
    setAvatarImage(previewUrl)
  }

  const handleAudioSelect = (_file: File, url: string) => {
    setAudioSample(url)
  }

  const handleTechRiderSelect = (file: File) => {
    setTechRider(file.name)
  }

  const handleDateSelect = (date: number) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    )
  }

  const handleSave = () => {
    // Here we would save to Supabase
    console.log('Saving profile...', {
      coverImage,
      avatarImage,
      firstName,
      lastName,
      street,
      houseNumber,
      postalCode,
      city,
      phone,
      email,
      birthDate,
      artistName,
      location,
      genre,
      region,
      jobTitle,
      technique,
      hourlyRate,
      eventRate,
      companyName,
      companySeat,
      taxNumber,
      smallBusiness,
      tags,
      socialLinks,
      techRider,
      bio,
      audioSample,
      instagramHandle,
      selectedDates,
    })
    // Show success message or navigate
    alert('Profil gespeichert!')
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
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
                label="Straße"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Straße"
              />
              <FormInput
                label="Hausnummer"
                required
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="Nr."
              />
            </FormRow>

            <FormRow>
              <FormInput
                label="PLZ"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="PLZ"
              />
              <FormInput
                label="Wohnort"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Stadt"
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
              />
            </FormRow>

            <FormRow columns={1}>
              <FormInput
                label="Geburtsdatum"
                required
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </FormRow>
          </FormSection>

          {/* Artist Data Section */}
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
                required
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
              bookedDates={mockProfileData.bookedDates}
              pendingDates={mockProfileData.pendingDates}
              eventDates={mockProfileData.eventDates}
              onDateSelect={handleDateSelect}
            />
          </FormSection>
        </form>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-white/10 py-4 px-4 z-30">
        <div className="max-w-4xl mx-auto flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            ABBRECHEN
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
          >
            ÄNDERUNGEN SPEICHERN
          </Button>
        </div>
      </div>
    </div>
  )
}
