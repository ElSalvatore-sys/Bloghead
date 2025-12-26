/**
 * SEO utilities for dynamic meta tag updates
 */

interface SEOProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  noindex?: boolean
}

const BASE_URL = 'https://blogyydev.xyz'
const DEFAULT_IMAGE = `${BASE_URL}/images/alexandre-st-louis-IlfpKwRMln0-unsplash.webp`
const SITE_NAME = 'Bloghead'

/**
 * Update page meta tags dynamically
 * Call this in useEffect on each page
 */
export function updatePageMeta({
  title,
  description,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
}: SEOProps): void {
  // Update document title
  document.title = `${title} | ${SITE_NAME}`

  // Helper to update or create meta tag
  const setMeta = (selector: string, content: string, attribute = 'content') => {
    const element = document.querySelector(selector)
    if (element) {
      element.setAttribute(attribute, content)
    }
  }

  // Primary meta tags
  setMeta('meta[name="title"]', `${title} | ${SITE_NAME}`)
  setMeta('meta[name="description"]', description)
  setMeta('meta[name="robots"]', noindex ? 'noindex, nofollow' : 'index, follow')

  // Open Graph
  setMeta('meta[property="og:title"]', `${title} | ${SITE_NAME}`)
  setMeta('meta[property="og:description"]', description)
  setMeta('meta[property="og:image"]', image)
  setMeta('meta[property="og:type"]', type)
  if (url) {
    setMeta('meta[property="og:url"]', `${BASE_URL}${url}`)
  }

  // Twitter
  setMeta('meta[name="twitter:title"]', `${title} | ${SITE_NAME}`)
  setMeta('meta[name="twitter:description"]', description)
  setMeta('meta[name="twitter:image"]', image)

  // Canonical URL
  if (url) {
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      canonical.setAttribute('href', `${BASE_URL}${url}`)
    }
  }
}

/**
 * Page-specific SEO configurations
 */
export const pageSEO = {
  home: {
    title: 'Kuenstler & Event-Services buchen',
    description:
      'Finde und buche DJs, Saenger, Bands und Event-Dienstleister fuer deine Veranstaltung. Die Plattform fuer unvergessliche Events in Deutschland.',
    url: '/',
  },
  artists: {
    title: 'Kuenstler finden',
    description:
      'Entdecke talentierte DJs, Saenger, Bands und Performer fuer dein Event. Durchsuche Profile, hoere Musikproben und buche direkt.',
    url: '/artists',
  },
  events: {
    title: 'Events entdecken',
    description:
      'Finde spannende Events und Veranstaltungen in deiner Naehe. Konzerte, Partys, Festivals und mehr.',
    url: '/events',
  },
  services: {
    title: 'Event-Dienstleister',
    description:
      'Finde professionelle Dienstleister fuer dein Event: Catering, Fotografie, Dekoration, Technik und mehr.',
    url: '/services',
  },
  about: {
    title: 'Ueber uns',
    description:
      'Erfahre mehr ueber Bloghead - die Plattform, die Kuenstler und Event-Planer zusammenbringt.',
    url: '/about',
  },
  kontakt: {
    title: 'Kontakt',
    description:
      'Kontaktiere das Bloghead-Team. Wir helfen dir bei Fragen zu Buchungen, deinem Profil oder der Plattform.',
    url: '/kontakt',
  },
  impressum: {
    title: 'Impressum',
    description: 'Rechtliche Informationen und Impressum von Bloghead.',
    url: '/impressum',
  },
  datenschutz: {
    title: 'Datenschutz',
    description:
      'Datenschutzerklaerung von Bloghead. Informationen zur Verarbeitung deiner Daten.',
    url: '/datenschutz',
  },
  venues: {
    title: 'Locations finden',
    description:
      'Entdecke Clubs, Bars, Konzerthallen und weitere Veranstaltungsorte in Deutschland. Finde die perfekte Location fuer dein Event.',
    url: '/venues',
  },
}

/**
 * Generate structured data for a page (JSON-LD)
 */
export function generateStructuredData(
  type: 'Organization' | 'WebSite' | 'Event' | 'Person',
  data: Record<string, unknown>
): string {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }
  return JSON.stringify(baseData)
}

/**
 * Inject structured data into the page
 */
export function injectStructuredData(jsonLd: string): void {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]')
  if (existing) {
    existing.remove()
  }

  // Add new structured data
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = jsonLd
  document.head.appendChild(script)
}

/**
 * Organization structured data for the homepage
 */
export const organizationSchema = generateStructuredData('Organization', {
  name: 'Bloghead',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'Plattform fuer Kuenstler und Event-Services in Deutschland',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'DE',
  },
  sameAs: [
    // Add social media links when available
  ],
})

/**
 * Website structured data
 */
export const websiteSchema = generateStructuredData('WebSite', {
  name: 'Bloghead',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/artists?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
})
