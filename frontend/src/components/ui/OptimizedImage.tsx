import { useState, useRef, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean // true = eager load (for above-fold / LCP)
  sizes?: string // responsive sizes hint
  quality?: number // 1-100, default 80
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'
  placeholder?: 'blur' | 'empty'
  onLoad?: () => void
  onError?: () => void
}

/**
 * Optimized image component with:
 * - Lazy loading by default (eager for priority images)
 * - WebP format detection
 * - Supabase storage optimization parameters
 * - Blur placeholder while loading
 * - Intersection Observer for better performance
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '100vw',
  quality = 80,
  objectFit = 'cover',
  placeholder = 'blur',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    )

    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [priority])

  // Optimize Supabase storage URLs
  const getOptimizedSrc = (originalSrc: string): string => {
    if (!originalSrc) return ''

    // Check if it's a Supabase storage URL
    if (originalSrc.includes('supabase.co/storage')) {
      const url = new URL(originalSrc)
      // Add transformation parameters
      if (width) url.searchParams.set('width', String(width))
      url.searchParams.set('quality', String(quality))
      return url.toString()
    }

    // Check if it's an Unsplash URL
    if (originalSrc.includes('unsplash.com')) {
      const url = new URL(originalSrc)
      if (width) url.searchParams.set('w', String(width))
      url.searchParams.set('q', String(quality))
      url.searchParams.set('auto', 'format')
      url.searchParams.set('fit', 'crop')
      return url.toString()
    }

    return originalSrc
  }

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  const optimizedSrc = getOptimizedSrc(src)

  // Generate srcset for responsive images
  const generateSrcSet = (): string | undefined => {
    if (!src || src.startsWith('data:')) return undefined

    // For local /images/ files, use pre-generated responsive versions
    if (src.startsWith('/images/') && src.endsWith('.webp') && !src.includes('/responsive/')) {
      const filename = src.replace('/images/', '').replace('.webp', '')
      const widths = [400, 800, 1200, 1600]
      const srcSet = widths
        .map((w) => `/images/responsive/${filename}-${w}w.webp ${w}w`)
        .join(', ')
      // Add original as largest size
      return `${srcSet}, ${src} 1920w`
    }

    // For external URLs (Supabase, Unsplash)
    const widths = [320, 640, 768, 1024, 1280, 1920]
    const srcSet = widths
      .filter((w) => !width || w <= width * 2)
      .map((w) => {
        const optimized = getOptimizedSrc(src)
        if (optimized.includes('?')) {
          return `${optimized.replace(/width=\d+/, `width=${w}`)} ${w}w`
        }
        return `${optimized}?width=${w}&quality=${quality} ${w}w`
      })
      .join(', ')

    return srcSet || undefined
  }

  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  }[objectFit]

  // Fallback/error state
  if (hasError) {
    return (
      <div
        className={`bg-white/5 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <span className="text-white/30 text-sm">Bild nicht verfuegbar</span>
      </div>
    )
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {(isInView || priority) && (
        <img
          src={optimizedSrc}
          srcSet={generateSrcSet()}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            ${objectFitClass}
            w-full h-full
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />
      )}
    </div>
  )
}

export default OptimizedImage
