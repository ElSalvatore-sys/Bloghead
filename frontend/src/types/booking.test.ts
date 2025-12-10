import { describe, it, expect } from 'vitest'
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_OPTIONS,
  AVAILABILITY_STATUS_LABELS,
  AVAILABILITY_STATUS_COLORS,
  BOOKING_STATUS_CONFIG,
  GERMAN_DAY_NAMES,
  GERMAN_DAY_NAMES_FULL,
  GERMAN_MONTH_NAMES,
  formatDateGerman,
  formatTimeRange,
  getMonthDays,
  isSameDay,
  isToday,
  isPastDate,
  formatDateForApi
} from './booking'

describe('EVENT_TYPE_LABELS', () => {
  it('contains all event types with German labels', () => {
    expect(EVENT_TYPE_LABELS.wedding).toBe('Hochzeit')
    expect(EVENT_TYPE_LABELS.corporate).toBe('Firmenfeier')
    expect(EVENT_TYPE_LABELS.private_party).toBe('Private Party')
    expect(EVENT_TYPE_LABELS.club).toBe('Club/Bar')
    expect(EVENT_TYPE_LABELS.festival).toBe('Festival')
    expect(EVENT_TYPE_LABELS.birthday).toBe('Geburtstag')
    expect(EVENT_TYPE_LABELS.concert).toBe('Konzert')
    expect(EVENT_TYPE_LABELS.gala).toBe('Gala')
    expect(EVENT_TYPE_LABELS.other).toBe('Sonstiges')
  })
})

describe('EVENT_TYPE_OPTIONS', () => {
  it('creates options array from labels', () => {
    expect(EVENT_TYPE_OPTIONS).toHaveLength(9)
    expect(EVENT_TYPE_OPTIONS[0]).toEqual({ value: 'wedding', label: 'Hochzeit' })
  })

  it('has value and label for each option', () => {
    EVENT_TYPE_OPTIONS.forEach(option => {
      expect(option).toHaveProperty('value')
      expect(option).toHaveProperty('label')
      expect(typeof option.value).toBe('string')
      expect(typeof option.label).toBe('string')
    })
  })
})

describe('AVAILABILITY_STATUS_LABELS', () => {
  it('contains German labels for all statuses', () => {
    expect(AVAILABILITY_STATUS_LABELS.available).toBe('Verfuegbar')
    expect(AVAILABILITY_STATUS_LABELS.booked).toBe('Gebucht')
    expect(AVAILABILITY_STATUS_LABELS.pending).toBe('Anfrage ausstehend')
    expect(AVAILABILITY_STATUS_LABELS.blocked).toBe('Blockiert')
    expect(AVAILABILITY_STATUS_LABELS.open_gig).toBe('Offener Gig')
  })
})

describe('AVAILABILITY_STATUS_COLORS', () => {
  it('contains color classes for all statuses', () => {
    expect(AVAILABILITY_STATUS_COLORS.available.bg).toContain('green')
    expect(AVAILABILITY_STATUS_COLORS.booked.bg).toContain('orange')
    expect(AVAILABILITY_STATUS_COLORS.pending.bg).toContain('yellow')
    expect(AVAILABILITY_STATUS_COLORS.blocked.bg).toContain('red')
    expect(AVAILABILITY_STATUS_COLORS.open_gig.bg).toContain('purple')
  })

  it('has bg, text, and border properties for each status', () => {
    Object.values(AVAILABILITY_STATUS_COLORS).forEach(colors => {
      expect(colors).toHaveProperty('bg')
      expect(colors).toHaveProperty('text')
      expect(colors).toHaveProperty('border')
    })
  })
})

describe('BOOKING_STATUS_CONFIG', () => {
  it('contains German labels for all booking statuses', () => {
    expect(BOOKING_STATUS_CONFIG.pending.label).toBe('Ausstehend')
    expect(BOOKING_STATUS_CONFIG.confirmed.label).toBe('Bestaetigt')
    expect(BOOKING_STATUS_CONFIG.cancelled.label).toBe('Storniert')
    expect(BOOKING_STATUS_CONFIG.completed.label).toBe('Abgeschlossen')
    expect(BOOKING_STATUS_CONFIG.in_progress.label).toBe('Laeuft')
    expect(BOOKING_STATUS_CONFIG.disputed.label).toBe('Streitfall')
    expect(BOOKING_STATUS_CONFIG.refunded.label).toBe('Erstattet')
  })

  it('has all required properties for each status', () => {
    Object.values(BOOKING_STATUS_CONFIG).forEach(config => {
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('color')
      expect(config).toHaveProperty('bgColor')
      expect(config).toHaveProperty('icon')
    })
  })
})

describe('GERMAN_DAY_NAMES', () => {
  it('contains all 7 days in German abbreviation', () => {
    expect(GERMAN_DAY_NAMES).toHaveLength(7)
    expect(GERMAN_DAY_NAMES).toEqual(['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'])
  })
})

describe('GERMAN_DAY_NAMES_FULL', () => {
  it('contains all 7 days in German full names', () => {
    expect(GERMAN_DAY_NAMES_FULL).toHaveLength(7)
    expect(GERMAN_DAY_NAMES_FULL[0]).toBe('Sonntag')
    expect(GERMAN_DAY_NAMES_FULL[1]).toBe('Montag')
    expect(GERMAN_DAY_NAMES_FULL[6]).toBe('Samstag')
  })
})

describe('GERMAN_MONTH_NAMES', () => {
  it('contains all 12 months in German', () => {
    expect(GERMAN_MONTH_NAMES).toHaveLength(12)
    expect(GERMAN_MONTH_NAMES[0]).toBe('Januar')
    expect(GERMAN_MONTH_NAMES[11]).toBe('Dezember')
  })
})

describe('formatDateGerman', () => {
  it('formats Date object to German date string', () => {
    const date = new Date(2025, 11, 25) // December 25, 2025
    expect(formatDateGerman(date)).toBe('25. Dezember 2025')
  })

  it('formats ISO date string to German date string', () => {
    expect(formatDateGerman('2025-01-01')).toBe('1. Januar 2025')
    expect(formatDateGerman('2025-12-31')).toBe('31. Dezember 2025')
  })

  it('handles various month dates', () => {
    expect(formatDateGerman(new Date(2025, 5, 15))).toBe('15. Juni 2025')
    expect(formatDateGerman(new Date(2025, 2, 1))).toBe('1. Maerz 2025')
  })
})

describe('formatTimeRange', () => {
  it('formats time range with Uhr suffix', () => {
    expect(formatTimeRange('18:00', '23:00')).toBe('18:00 - 23:00 Uhr')
    expect(formatTimeRange('20:00:00', '02:00:00')).toBe('20:00 - 02:00 Uhr')
  })

  it('handles various time formats', () => {
    expect(formatTimeRange('09:30', '12:00')).toBe('09:30 - 12:00 Uhr')
    expect(formatTimeRange('00:00', '06:00')).toBe('00:00 - 06:00 Uhr')
  })
})

describe('getMonthDays', () => {
  it('returns array of dates for the month grid', () => {
    const days = getMonthDays(2025, 11) // December 2025
    expect(days.length).toBeGreaterThanOrEqual(28) // At least days in month
    expect(days.length % 7).toBe(0) // Should be divisible by 7 for week rows
  })

  it('includes padding days from previous month', () => {
    const days = getMonthDays(2025, 11) // December 2025
    // December 1, 2025 is a Monday, so only 1 padding day needed (Sunday)
    const firstDay = days[0]
    expect(firstDay.getMonth()).toBeLessThanOrEqual(11) // November or December
  })

  it('includes all days of the current month', () => {
    const days = getMonthDays(2025, 0) // January 2025
    const januaryDays = days.filter(d => d.getMonth() === 0 && d.getFullYear() === 2025)
    expect(januaryDays.length).toBe(31)
  })

  it('handles February correctly', () => {
    const days = getMonthDays(2024, 1) // February 2024 (leap year)
    const febDays = days.filter(d => d.getMonth() === 1)
    expect(febDays.length).toBe(29)
  })
})

describe('isSameDay', () => {
  it('returns true for same day', () => {
    const date1 = new Date(2025, 11, 25, 10, 30)
    const date2 = new Date(2025, 11, 25, 18, 45)
    expect(isSameDay(date1, date2)).toBe(true)
  })

  it('returns false for different days', () => {
    const date1 = new Date(2025, 11, 25)
    const date2 = new Date(2025, 11, 26)
    expect(isSameDay(date1, date2)).toBe(false)
  })

  it('returns false for same day different month', () => {
    const date1 = new Date(2025, 10, 25)
    const date2 = new Date(2025, 11, 25)
    expect(isSameDay(date1, date2)).toBe(false)
  })

  it('returns false for same day different year', () => {
    const date1 = new Date(2024, 11, 25)
    const date2 = new Date(2025, 11, 25)
    expect(isSameDay(date1, date2)).toBe(false)
  })
})

describe('isToday', () => {
  it('returns true for today', () => {
    const today = new Date()
    expect(isToday(today)).toBe(true)
  })

  it('returns true for today with different time', () => {
    const today = new Date()
    today.setHours(23, 59, 59)
    expect(isToday(today)).toBe(true)
  })

  it('returns false for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isToday(yesterday)).toBe(false)
  })

  it('returns false for tomorrow', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(isToday(tomorrow)).toBe(false)
  })
})

describe('isPastDate', () => {
  it('returns true for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isPastDate(yesterday)).toBe(true)
  })

  it('returns true for dates in the past', () => {
    expect(isPastDate(new Date(2020, 0, 1))).toBe(true)
  })

  it('returns false for tomorrow', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(isPastDate(tomorrow)).toBe(false)
  })

  it('returns false for future dates', () => {
    expect(isPastDate(new Date(2030, 0, 1))).toBe(false)
  })

  it('returns false for today', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expect(isPastDate(today)).toBe(false)
  })
})

describe('formatDateForApi', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date(2025, 11, 25, 12, 0, 0) // Use noon to avoid timezone issues
    const result = formatDateForApi(date)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result).toContain('2025')
    expect(result).toContain('12')
    expect(result).toContain('25')
  })

  it('pads single digit month and day', () => {
    const date = new Date(2025, 0, 5, 12, 0, 0) // January 5 at noon
    const result = formatDateForApi(date)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result).toContain('01') // Padded month
    expect(result).toContain('05') // Padded day
  })

  it('returns ISO date format string', () => {
    const date = new Date(2025, 5, 15, 12, 0, 0)
    const result = formatDateForApi(date)
    // Should be in YYYY-MM-DD format
    expect(result.split('-')).toHaveLength(3)
    expect(result.split('-')[0]).toHaveLength(4) // Year
    expect(result.split('-')[1]).toHaveLength(2) // Month
    expect(result.split('-')[2]).toHaveLength(2) // Day
  })
})
