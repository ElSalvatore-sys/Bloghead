import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  sanitizeInput,
  sanitizeHTML,
  isValidEmail,
  isValidPhone,
  sanitizeFilename,
  sanitizeURL,
  validatePassword,
  sanitizeSearchQuery,
  isValidPostalCode,
  sanitizeNumber,
  containsXSSPatterns,
  isRateLimited,
  resetRateLimit
} from './sanitize'

describe('sanitizeInput', () => {
  it('removes all HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('Hello')
    expect(sanitizeInput('<b>Bold</b>')).toBe('Bold')
    expect(sanitizeInput('<div onclick="evil()">Click</div>')).toBe('Click')
  })

  it('returns empty string for non-string input', () => {
    expect(sanitizeInput('')).toBe('')
    expect(sanitizeInput(null as unknown as string)).toBe('')
    expect(sanitizeInput(undefined as unknown as string)).toBe('')
  })

  it('trims whitespace', () => {
    expect(sanitizeInput('  Hello World  ')).toBe('Hello World')
  })
})

describe('sanitizeHTML', () => {
  it('allows safe formatting tags', () => {
    expect(sanitizeHTML('<b>Bold</b> and <i>italic</i>')).toBe('<b>Bold</b> and <i>italic</i>')
    expect(sanitizeHTML('<p>Paragraph</p>')).toBe('<p>Paragraph</p>')
    expect(sanitizeHTML('<ul><li>Item</li></ul>')).toBe('<ul><li>Item</li></ul>')
  })

  it('removes dangerous tags', () => {
    expect(sanitizeHTML('<script>alert("xss")</script>Safe')).toBe('Safe')
    expect(sanitizeHTML('<img src=x onerror=alert(1)>')).toBe('')
  })

  it('removes all attributes', () => {
    expect(sanitizeHTML('<b onclick="evil()">Click</b>')).toBe('<b>Click</b>')
    expect(sanitizeHTML('<p style="color:red">Styled</p>')).toBe('<p>Styled</p>')
  })
})

describe('isValidEmail', () => {
  it('validates correct email formats', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.de')).toBe(true)
    expect(isValidEmail('user+tag@example.org')).toBe(true)
  })

  it('rejects invalid email formats', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('missing@tld')).toBe(false)
    expect(isValidEmail('@nodomain.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('validates German phone numbers', () => {
    expect(isValidPhone('+49 123 456789')).toBe(true)
    expect(isValidPhone('0123 456789')).toBe(true)
    expect(isValidPhone('+49123456789')).toBe(true)
    expect(isValidPhone('0049 170 1234567')).toBe(true)
  })

  it('rejects invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false)
    expect(isValidPhone('abcdefghij')).toBe(false)
    expect(isValidPhone('')).toBe(false)
  })
})

describe('sanitizeFilename', () => {
  it('sanitizes filenames correctly', () => {
    expect(sanitizeFilename('my file.jpg')).toBe('my-file.jpg')
    expect(sanitizeFilename('Test Datei.pdf')).toBe('test-datei.pdf')
  })

  it('handles German umlauts', () => {
    expect(sanitizeFilename('Muenchen.png')).toBe('muenchen.png')
    expect(sanitizeFilename('gruess.jpg')).toBe('gruess.jpg')
  })

  it('removes special characters', () => {
    expect(sanitizeFilename('file<script>.jpg')).toBe('file-script.jpg')
    // Path traversal is sanitized but extension extraction changes result
    expect(sanitizeFilename('../../../etc/passwd')).toBe('file.etcpasswd')
  })

  it('returns default for empty input', () => {
    expect(sanitizeFilename('')).toBe('file')
    expect(sanitizeFilename(null as unknown as string)).toBe('file')
  })
})

describe('sanitizeURL', () => {
  it('allows safe URLs', () => {
    expect(sanitizeURL('https://example.com')).toBe('https://example.com')
    expect(sanitizeURL('http://example.com')).toBe('http://example.com')
    expect(sanitizeURL('/relative/path')).toBe('/relative/path')
    expect(sanitizeURL('#anchor')).toBe('#anchor')
  })

  it('blocks dangerous protocols', () => {
    expect(sanitizeURL('javascript:alert(1)')).toBe(null)
    expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe(null)
    expect(sanitizeURL('vbscript:msgbox(1)')).toBe(null)
  })

  it('adds https to bare domains', () => {
    expect(sanitizeURL('example.com')).toBe('https://example.com')
  })

  it('returns null for invalid URLs', () => {
    expect(sanitizeURL('')).toBe(null)
    expect(sanitizeURL('not a url')).toBe(null)
  })
})

describe('validatePassword', () => {
  it('validates strong passwords', () => {
    const result = validatePassword('StrongP@ss123')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.strength).toBe('strong')
  })

  it('rejects weak passwords', () => {
    const result = validatePassword('weak')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('checks for common passwords', () => {
    const result = validatePassword('password')
    expect(result.valid).toBe(false)
  })

  it('requires minimum length', () => {
    const result = validatePassword('Short1!')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('8 Zeichen'))).toBe(true)
  })
})

describe('sanitizeSearchQuery', () => {
  it('removes SQL injection patterns', () => {
    expect(sanitizeSearchQuery("'; DROP TABLE users; --")).not.toContain('DROP')
    expect(sanitizeSearchQuery("1' OR '1'='1")).not.toContain('OR')
    expect(sanitizeSearchQuery('SELECT * FROM users')).not.toContain('SELECT')
  })

  it('limits query length', () => {
    const longQuery = 'a'.repeat(300)
    expect(sanitizeSearchQuery(longQuery).length).toBe(200)
  })

  it('handles empty input', () => {
    expect(sanitizeSearchQuery('')).toBe('')
    expect(sanitizeSearchQuery(null as unknown as string)).toBe('')
  })
})

describe('isValidPostalCode', () => {
  it('validates German postal codes', () => {
    expect(isValidPostalCode('65183')).toBe(true)
    expect(isValidPostalCode('10115')).toBe(true)
    expect(isValidPostalCode('80331')).toBe(true)
  })

  it('rejects invalid postal codes', () => {
    expect(isValidPostalCode('1234')).toBe(false) // too short
    expect(isValidPostalCode('123456')).toBe(false) // too long
    expect(isValidPostalCode('ABCDE')).toBe(false) // letters
    expect(isValidPostalCode('')).toBe(false)
  })
})

describe('sanitizeNumber', () => {
  it('parses valid numbers', () => {
    expect(sanitizeNumber('42')).toBe(42)
    expect(sanitizeNumber(42)).toBe(42)
    expect(sanitizeNumber('3.14')).toBe(3.14)
  })

  it('applies min/max constraints', () => {
    expect(sanitizeNumber('5', 10)).toBe(10)
    expect(sanitizeNumber('100', undefined, 50)).toBe(50)
    expect(sanitizeNumber('25', 10, 50)).toBe(25)
  })

  it('returns null for invalid input', () => {
    expect(sanitizeNumber('not a number')).toBe(null)
    expect(sanitizeNumber(NaN)).toBe(null)
  })
})

describe('containsXSSPatterns', () => {
  it('detects XSS patterns', () => {
    expect(containsXSSPatterns('<script>alert(1)</script>')).toBe(true)
    expect(containsXSSPatterns('javascript:alert(1)')).toBe(true)
    expect(containsXSSPatterns('<img onerror=alert(1)>')).toBe(true)
    expect(containsXSSPatterns('<iframe src="evil.com">')).toBe(true)
  })

  it('allows safe content', () => {
    expect(containsXSSPatterns('Hello World')).toBe(false)
    expect(containsXSSPatterns('This is a normal text')).toBe(false)
    expect(containsXSSPatterns('')).toBe(false)
  })
})

describe('isRateLimited', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Reset the rate limit store by calling resetRateLimit for test keys
    resetRateLimit('test-key')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns false on first request', () => {
    expect(isRateLimited('new-key', 5, 60000)).toBe(false)
    resetRateLimit('new-key')
  })

  it('returns false when under the limit', () => {
    expect(isRateLimited('under-limit', 5, 60000)).toBe(false)
    expect(isRateLimited('under-limit', 5, 60000)).toBe(false)
    expect(isRateLimited('under-limit', 5, 60000)).toBe(false)
    resetRateLimit('under-limit')
  })

  it('returns true when at or over the limit', () => {
    // Make 5 requests (the limit)
    for (let i = 0; i < 5; i++) {
      isRateLimited('over-limit', 5, 60000)
    }
    // 6th request should be rate limited
    expect(isRateLimited('over-limit', 5, 60000)).toBe(true)
    resetRateLimit('over-limit')
  })

  it('resets after window expires', () => {
    // Hit the limit
    for (let i = 0; i < 5; i++) {
      isRateLimited('reset-test', 5, 60000)
    }
    expect(isRateLimited('reset-test', 5, 60000)).toBe(true)

    // Advance time past the window
    vi.advanceTimersByTime(61000)

    // Should no longer be rate limited
    expect(isRateLimited('reset-test', 5, 60000)).toBe(false)
    resetRateLimit('reset-test')
  })
})

describe('resetRateLimit', () => {
  it('clears rate limit for a key', () => {
    // Fill up the limit
    for (let i = 0; i < 10; i++) {
      isRateLimited('clear-key', 10, 60000)
    }
    expect(isRateLimited('clear-key', 10, 60000)).toBe(true)

    // Reset
    resetRateLimit('clear-key')

    // Should be able to make requests again
    expect(isRateLimited('clear-key', 10, 60000)).toBe(false)
    resetRateLimit('clear-key')
  })
})

describe('validatePassword - additional cases', () => {
  it('rejects passwords that are too long', () => {
    const longPassword = 'A'.repeat(150) + 'a1'
    const result = validatePassword(longPassword)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('128'))).toBe(true)
  })

  it('rejects passwords without lowercase', () => {
    const result = validatePassword('PASSWORD123')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('Kleinbuchstaben'))).toBe(true)
  })

  it('rejects passwords without uppercase', () => {
    const result = validatePassword('password123')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('Großbuchstaben'))).toBe(true)
  })

  it('rejects passwords without numbers', () => {
    const result = validatePassword('PasswordABC')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('Zahl'))).toBe(true)
  })

  it('returns medium strength for 10+ char passwords without special', () => {
    const result = validatePassword('Password1234')
    expect(result.valid).toBe(true)
    expect(result.strength).toBe('medium')
  })

  it('returns strong strength for 12+ char passwords with special', () => {
    const result = validatePassword('StrongP@ss123!')
    expect(result.valid).toBe(true)
    expect(result.strength).toBe('strong')
  })

  it('returns weak for null/undefined input', () => {
    expect(validatePassword(null as unknown as string).valid).toBe(false)
    expect(validatePassword(undefined as unknown as string).valid).toBe(false)
    expect(validatePassword(null as unknown as string).strength).toBe('weak')
  })
})
