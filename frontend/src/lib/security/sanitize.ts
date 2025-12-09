import DOMPurify from 'dompurify'

/**
 * Sanitize input by removing ALL HTML tags
 * Use for plain text fields like names, titles, etc.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim()
}

/**
 * Sanitize HTML allowing only safe formatting tags
 * Use for rich text fields like descriptions, bios
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') return ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  })
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email.trim())
}

/**
 * Validate phone number (German/international format)
 * Accepts: +49 123 456789, 0123 456789, +49123456789, etc.
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  // Remove all spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  // German mobile: 01xx, landline: 0xxx, international: +49
  const phoneRegex = /^(\+49|0049|0)[1-9][0-9]{6,14}$/
  return phoneRegex.test(cleaned)
}

/**
 * Sanitize filename for safe file uploads
 * Removes special characters, keeps extension
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return 'file'

  // Get extension
  const lastDot = filename.lastIndexOf('.')
  const name = lastDot > 0 ? filename.substring(0, lastDot) : filename
  const ext = lastDot > 0 ? filename.substring(lastDot) : ''

  // Clean name: only allow alphanumeric, dash, underscore
  const cleanName = name
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => {
      const map: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }
      return map[char] || char
    })
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)

  // Clean extension: only allow alphanumeric
  const cleanExt = ext.toLowerCase().replace(/[^a-z0-9.]/g, '').substring(0, 10)

  return (cleanName || 'file') + cleanExt
}

/**
 * Validate and sanitize URL
 * Blocks javascript:, data:, and other dangerous protocols
 */
export function sanitizeURL(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  const trimmed = url.trim()

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerUrl = trimmed.toLowerCase()

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return null
    }
  }

  // Must start with http://, https://, or be a relative URL
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('#')
  ) {
    // Try adding https://
    if (/^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
      return `https://${trimmed}`
    }
    return null
  }

  try {
    // Validate URL structure
    if (trimmed.startsWith('http')) {
      new URL(trimmed)
    }
    return trimmed
  } catch {
    return null
  }
}

/**
 * Validate password strength
 * Returns validation result with German error messages
 */
export interface PasswordValidation {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Passwort ist erforderlich.'], strength: 'weak' }
  }

  if (password.length < 8) {
    errors.push('Passwort muss mindestens 8 Zeichen lang sein.')
  }

  if (password.length > 128) {
    errors.push('Passwort darf maximal 128 Zeichen lang sein.')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten.')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Passwort muss mindestens einen Großbuchstaben enthalten.')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Passwort muss mindestens eine Zahl enthalten.')
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'passwort', '12345678', 'qwertyui', 'abcd1234',
    'password1', 'passwort1', 'bloghead', 'admin123'
  ]
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Dieses Passwort ist zu einfach.')
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (errors.length === 0) {
    if (password.length >= 12 && hasSpecial) {
      strength = 'strong'
    } else if (password.length >= 10 || hasSpecial) {
      strength = 'medium'
    } else {
      strength = 'medium'
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  }
}

/**
 * Sanitize search query to prevent injection
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return ''

  // Remove SQL injection patterns
  const sanitized = query
    .replace(/['"`;\\]/g, '') // Remove quotes and semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\b/gi, '') // Remove SQL keywords
    .trim()
    .substring(0, 200) // Limit length

  return sanitized
}

/**
 * Client-side rate limiting helper
 * Note: This is NOT a security measure, just UX improvement
 * Real rate limiting must be done server-side
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function isRateLimited(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return false
  }

  if (record.count >= maxRequests) {
    return true
  }

  record.count++
  return false
}

/**
 * Reset rate limit for a key (e.g., after successful login)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}

/**
 * Validate German postal code (PLZ)
 */
export function isValidPostalCode(plz: string): boolean {
  if (!plz || typeof plz !== 'string') return false
  return /^[0-9]{5}$/.test(plz.trim())
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number, min?: number, max?: number): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input

  if (isNaN(num) || !isFinite(num)) return null
  if (min !== undefined && num < min) return min
  if (max !== undefined && num > max) return max

  return num
}

/**
 * Check if a string contains potential XSS patterns
 */
export function containsXSSPatterns(input: string): boolean {
  if (!input || typeof input !== 'string') return false

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
  ]

  return xssPatterns.some(pattern => pattern.test(input))
}
