import { useState, useCallback } from 'react'
import { GradientBrush } from '../ui/GradientBrush'

interface EventImage {
  src: string
  alt: string
}

interface EventsSectionProps {
  className?: string
  images?: EventImage[]
  onImageClick?: (index: number) => void
}

// Default event images from the Bilder Website Vorläufig folder
const defaultImages: EventImage[] = [
  { src: '/images/flavio-gasperini-QO0hJHVUVso-unsplash.jpg', alt: 'Concert crowd with purple lights' },
  { src: '/images/german-lopez-sP45Es070zI-unsplash.jpg', alt: 'DJ performing live' },
  { src: '/images/pexels-wendy-wei-1699161.jpg', alt: 'Concert audience' },
  { src: '/images/luis-reynoso-J5a0MRXVnUI-unsplash.jpg', alt: 'Live music event' },
  { src: '/images/minh-pham-jSAb1ifwf8Y-unsplash.jpg', alt: 'VR experience' },
  { src: '/images/niclas-moser-OjWNwULqFek-unsplash.jpg', alt: 'Night event' },
]

export function EventsSection({
  className = '',
  images = defaultImages,
  onImageClick,
}: EventsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Calculate visible images (3 on desktop, 1 on mobile)
  const visibleCount = { mobile: 1, desktop: 3 }

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, images.length - visibleCount.desktop) : prev - 1
    )
  }, [images.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev >= images.length - visibleCount.desktop ? 0 : prev + 1
    )
  }, [images.length])

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
    onImageClick?.(index)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const lightboxPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const lightboxNext = () => {
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className={`py-16 md:py-24 px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            EVENTS
          </h2>
          <GradientBrush size="md" className="max-w-[200px] mx-auto" />
        </div>

        {/* Intro text */}
        <div className="text-center mb-12">
          <p className="font-display text-2xl md:text-3xl text-white mb-4">
            READY TO INSPIRE YOU.
          </p>
          <p className="text-white/70 max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* Image Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-bg-card/80 hover:bg-bg-card border border-white/20 flex items-center justify-center transition-all hover:scale-105"
            aria-label="Previous images"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-bg-card/80 hover:bg-bg-card border border-white/20 flex items-center justify-center transition-all hover:scale-105"
            aria-label="Next images"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Image Grid */}
          <div className="overflow-hidden mx-8 md:mx-10">
            <div
              className="flex gap-4 md:gap-6 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCount.desktop)}%)`,
              }}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full md:w-[calc(33.333%-1rem)] cursor-pointer group"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Zoom icon on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(images.length / visibleCount.desktop) }).map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * visibleCount.desktop)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    Math.floor(currentIndex / visibleCount.desktop) === index
                      ? 'w-6 bg-accent-purple'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              )
            )}
          </div>
        </div>

        {/* Additional info */}
        <div className="text-center mt-12">
          <p className="font-display text-xl md:text-2xl text-white mb-4">
            HIER STEHT ETWAS ZUM THEMA EVENTS.
          </p>
          <p className="text-white/70 max-w-2xl mx-auto">
            Entdecke einzigartige Events und unvergessliche Momente mit unseren Künstlern.
            Von intimen Akustik-Sessions bis zu großen Bühnenauftritten.
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close lightbox"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Previous button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              lightboxPrev()
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Previous image"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              lightboxNext()
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Next image"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Image */}
          <div
            className="max-w-5xl max-h-[80vh] px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>

          {/* Image counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  )
}
