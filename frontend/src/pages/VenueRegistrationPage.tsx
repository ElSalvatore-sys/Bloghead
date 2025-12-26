// ============================================
// VENUE REGISTRATION PAGE - Multi-Step Wizard
// Complete registration flow for new venues
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
} from 'lucide-react';
import { createVenue, uploadVenueImage } from '@/services/venueService';
import type {
  VenueCreateInput,
  VenueType,
  PriceRange,
} from '@/types/venue';
import {
  VENUE_TYPE_LABELS,
  PRICE_RANGE_LABELS,
} from '@/types/venue';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

// Registration form data
interface RegistrationFormData extends Partial<VenueCreateInput> {
  cover_image_file?: File | null;
  gallery_files?: File[];
}

const STEPS = [
  { id: 1, title: 'Grundinformationen', description: 'Name, Typ und Standort' },
  { id: 2, title: 'Medien', description: 'Bilder hochladen' },
  { id: 3, title: 'Details', description: 'Beschreibung und Kapazität' },
  { id: 4, title: 'Fertig', description: 'Überprüfen und absenden' },
];

export function VenueRegistrationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    venue_type: undefined,
    city: '',
    address: '',
    postal_code: '',
    capacity_min: undefined,
    capacity_max: undefined,
    price_range: undefined,
    description: '',
    tagline: '',
    cover_image_file: null,
    gallery_files: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name?.trim()) {
        newErrors.name = 'Name ist erforderlich';
      }
      if (!formData.venue_type) {
        newErrors.venue_type = 'Bitte wählen Sie einen Typ';
      }
      if (!formData.city?.trim()) {
        newErrors.city = 'Stadt ist erforderlich';
      }
    } else if (step === 3) {
      if (!formData.description?.trim()) {
        newErrors.description = 'Beschreibung ist erforderlich';
      }
      if (formData.capacity_min && formData.capacity_max && formData.capacity_min > formData.capacity_max) {
        newErrors.capacity_max = 'Maximale Kapazität muss größer als minimale Kapazität sein';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  // Handle previous step
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Handle cover image upload
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData('cover_image_file', file);
    }
  };

  // Handle gallery images upload
  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updateFormData('gallery_files', [...(formData.gallery_files || []), ...files]);
  };

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    const newGalleryFiles = [...(formData.gallery_files || [])];
    newGalleryFiles.splice(index, 1);
    updateFormData('gallery_files', newGalleryFiles);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      alert('Bitte melden Sie sich an, um eine Location zu registrieren.');
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload cover image if provided
      let coverImageUrl = '';
      if (formData.cover_image_file) {
        coverImageUrl = await uploadVenueImage(formData.cover_image_file, 'cover');
      }

      // Prepare venue data
      const venueData: VenueCreateInput = {
        name: formData.name!,
        venue_type: formData.venue_type,
        city: formData.city,
        address: formData.address,
        postal_code: formData.postal_code,
        capacity_min: formData.capacity_min,
        capacity_max: formData.capacity_max,
        price_range: formData.price_range,
        description: formData.description,
        tagline: formData.tagline,
        cover_image: coverImageUrl || undefined,
      };

      // Create venue
      const newVenue = await createVenue(venueData);

      // TODO: Upload gallery images and link to venue

      // Redirect to venue profile or edit page
      navigate(`/venues/${newVenue.slug}`);
    } catch (err) {
      console.error('Failed to create venue:', err);
      alert('Fehler beim Erstellen der Location. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-purple/10 rounded-full mb-4">
              <MapPin className="w-5 h-5 text-accent-purple" />
              <span className="text-accent-purple font-medium">Neue Location</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
              Location registrieren
            </h1>
            <p className="text-text-secondary">
              Erstellen Sie Ihr Profil in wenigen Schritten
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    {/* Circle */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        step.id < currentStep
                          ? 'bg-accent-purple border-accent-purple'
                          : step.id === currentStep
                          ? 'border-accent-purple text-accent-purple'
                          : 'border-white/20 text-text-muted'
                      }`}
                    >
                      {step.id < currentStep ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <span className="font-semibold">{step.id}</span>
                      )}
                    </div>

                    {/* Text */}
                    <div className="hidden md:block text-center mt-2">
                      <p
                        className={`text-sm font-medium ${
                          step.id === currentStep ? 'text-accent-purple' : 'text-text-muted'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-text-muted">{step.description}</p>
                    </div>
                  </div>

                  {/* Line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-colors ${
                        step.id < currentStep ? 'bg-accent-purple' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-bg-card rounded-xl p-6 md:p-8 border border-white/5 mb-6"
            >
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">
                    Grundinformationen
                  </h2>

                  {/* Venue Name */}
                  <div>
                    <label className="block text-text-secondary mb-2">
                      Location Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="z.B. Club Mercury"
                      className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-colors ${
                        errors.name ? 'border-red-500' : 'border-white/10'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Venue Type */}
                  <div>
                    <label className="block text-text-secondary mb-2">
                      Typ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.venue_type || ''}
                      onChange={(e) => updateFormData('venue_type', e.target.value as VenueType)}
                      className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors ${
                        errors.venue_type ? 'border-red-500' : 'border-white/10'
                      }`}
                    >
                      <option value="">Bitte wählen</option>
                      {Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {errors.venue_type && (
                      <p className="text-red-500 text-sm mt-1">{errors.venue_type}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-text-secondary mb-2">
                      Stadt <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      placeholder="z.B. Berlin"
                      className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-colors ${
                        errors.city ? 'border-red-500' : 'border-white/10'
                      }`}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  {/* Address & Postal Code */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-text-secondary mb-2">Adresse</label>
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => updateFormData('address', e.target.value)}
                        placeholder="z.B. Hauptstraße 123"
                        className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary mb-2">PLZ</label>
                      <input
                        type="text"
                        value={formData.postal_code || ''}
                        onChange={(e) => updateFormData('postal_code', e.target.value)}
                        placeholder="10115"
                        className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-colors"
                      />
                    </div>
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block text-text-secondary mb-2">
                      Slogan (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.tagline || ''}
                      onChange={(e) => updateFormData('tagline', e.target.value)}
                      placeholder="z.B. Die beste Partylocaton in Berlin"
                      maxLength={100}
                      className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-colors"
                    />
                    <p className="text-text-muted text-xs mt-1">
                      {formData.tagline?.length || 0}/100 Zeichen
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Media */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">Medien hochladen</h2>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-text-secondary mb-2">Titelbild</label>
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-accent-purple/50 transition-colors">
                      {formData.cover_image_file ? (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(formData.cover_image_file)}
                            alt="Cover preview"
                            className="max-h-64 mx-auto rounded-lg"
                          />
                          <button
                            onClick={() => updateFormData('cover_image_file', null)}
                            className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="w-12 h-12 text-text-muted mx-auto mb-3" />
                          <p className="text-text-primary mb-1">Bild hochladen</p>
                          <p className="text-text-muted text-sm">PNG, JPG bis 5MB</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <label className="block text-text-secondary mb-2">
                      Galerie (optional)
                    </label>
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-accent-purple/50 transition-colors">
                      <label className="cursor-pointer">
                        <Upload className="w-12 h-12 text-text-muted mx-auto mb-3" />
                        <p className="text-text-primary mb-1">Weitere Bilder hochladen</p>
                        <p className="text-text-muted text-sm">Mehrere Dateien möglich</p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryImagesChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Gallery Preview */}
                    {formData.gallery_files && formData.gallery_files.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {formData.gallery_files.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Gallery ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">Details</h2>

                  {/* Description */}
                  <div>
                    <label className="block text-text-secondary mb-2">
                      Beschreibung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Beschreiben Sie Ihre Location..."
                      rows={6}
                      className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-colors resize-none ${
                        errors.description ? 'border-red-500' : 'border-white/10'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>

                  {/* Capacity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary mb-2">Min. Kapazität</label>
                      <input
                        type="number"
                        value={formData.capacity_min || ''}
                        onChange={(e) =>
                          updateFormData('capacity_min', e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="z.B. 50"
                        min="0"
                        className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary mb-2">Max. Kapazität</label>
                      <input
                        type="number"
                        value={formData.capacity_max || ''}
                        onChange={(e) =>
                          updateFormData('capacity_max', e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="z.B. 500"
                        min="0"
                        className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-colors ${
                          errors.capacity_max ? 'border-red-500' : 'border-white/10'
                        }`}
                      />
                      {errors.capacity_max && (
                        <p className="text-red-500 text-sm mt-1">{errors.capacity_max}</p>
                      )}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-text-secondary mb-2">Preisklasse</label>
                    <select
                      value={formData.price_range || ''}
                      onChange={(e) => updateFormData('price_range', e.target.value as PriceRange)}
                      className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                    >
                      <option value="">Bitte wählen</option>
                      {Object.entries(PRICE_RANGE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">
                    Überprüfen & Absenden
                  </h2>

                  <div className="space-y-4 text-text-secondary">
                    <div className="flex justify-between py-3 border-b border-white/10">
                      <span>Name:</span>
                      <span className="text-text-primary font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/10">
                      <span>Typ:</span>
                      <span className="text-text-primary font-medium">
                        {formData.venue_type && VENUE_TYPE_LABELS[formData.venue_type]}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/10">
                      <span>Stadt:</span>
                      <span className="text-text-primary font-medium">{formData.city}</span>
                    </div>
                    {formData.capacity_max && (
                      <div className="flex justify-between py-3 border-b border-white/10">
                        <span>Kapazität:</span>
                        <span className="text-text-primary font-medium">
                          {formData.capacity_min && `${formData.capacity_min} - `}
                          {formData.capacity_max} Personen
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-accent-purple/10 rounded-lg p-4 mt-6">
                    <p className="text-text-secondary text-sm">
                      Nach dem Absenden wird Ihre Location zur Überprüfung eingereicht.
                      Sie erhalten eine Benachrichtigung, sobald sie aktiviert wurde.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Zurück
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} disabled={isSubmitting}>
                Weiter
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Wird erstellt...' : 'Location erstellen'}
                <Check className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VenueRegistrationPage;
