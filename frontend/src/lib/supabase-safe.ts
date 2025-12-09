import type { PostgrestError, AuthError } from '@supabase/supabase-js'

/**
 * German error messages for common Supabase/Postgres error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Postgres errors
  '23505': 'Dieser Eintrag existiert bereits.',
  '23503': 'Referenzierter Eintrag nicht gefunden.',
  '23502': 'Pflichtfeld fehlt.',
  '23514': 'Ungültiger Wert.',
  '42501': 'Keine Berechtigung für diese Aktion.',
  '42P01': 'Tabelle nicht gefunden.',
  '22P02': 'Ungültiges Datenformat.',

  // PostgREST errors
  PGRST116: 'Keine Ergebnisse gefunden.',
  PGRST301: 'Anfrage zu groß.',
  PGRST103: 'Ungültige Anfrage.',

  // Auth errors
  invalid_credentials: 'E-Mail oder Passwort falsch.',
  email_not_confirmed: 'Bitte bestätige zuerst deine E-Mail-Adresse.',
  user_already_exists: 'Ein Konto mit dieser E-Mail existiert bereits.',
  weak_password: 'Das Passwort ist zu schwach.',
  invalid_email: 'Ungültige E-Mail-Adresse.',
  signup_disabled: 'Registrierung ist momentan deaktiviert.',
  email_address_invalid: 'Ungültige E-Mail-Adresse.',
  over_request_rate_limit: 'Zu viele Anfragen. Bitte warte einen Moment.',
  user_not_found: 'Benutzer nicht gefunden.',
  session_not_found: 'Sitzung abgelaufen. Bitte melde dich erneut an.',

  // Network errors
  offline: 'Du bist offline. Bitte überprüfe deine Internetverbindung.',
  timeout: 'Anfrage hat zu lange gedauert. Bitte versuche es erneut.',
  network_error: 'Netzwerkfehler. Bitte überprüfe deine Verbindung.',

  // Generic
  unknown: 'Ein unbekannter Fehler ist aufgetreten.',
  rate_limited: 'Zu viele Anfragen. Bitte warte einen Moment.',
}

/**
 * Get German error message from error code or message
 */
export function getGermanErrorMessage(error: PostgrestError | AuthError | Error | null): string {
  if (!error) return ERROR_MESSAGES.unknown

  // Check if offline
  if (!navigator.onLine) {
    return ERROR_MESSAGES.offline
  }

  // PostgrestError has code property
  if ('code' in error && error.code) {
    const code = error.code.toString()
    if (ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code]
    }
  }

  // AuthError might have message with error type
  if ('message' in error && error.message) {
    // Check for known error patterns in message
    const message = error.message.toLowerCase()

    if (message.includes('invalid login credentials')) {
      return ERROR_MESSAGES.invalid_credentials
    }
    if (message.includes('email not confirmed')) {
      return ERROR_MESSAGES.email_not_confirmed
    }
    if (message.includes('user already registered')) {
      return ERROR_MESSAGES.user_already_exists
    }
    if (message.includes('rate limit')) {
      return ERROR_MESSAGES.over_request_rate_limit
    }
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_MESSAGES.network_error
    }
    if (message.includes('timeout')) {
      return ERROR_MESSAGES.timeout
    }
  }

  // Check for specific error name patterns
  if ('name' in error) {
    if (error.name === 'AuthApiError') {
      // Try to extract error type from message
      const msg = (error as AuthError).message || ''
      for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
        if (msg.toLowerCase().includes(key.replace(/_/g, ' '))) {
          return value
        }
      }
    }
  }

  return ERROR_MESSAGES.unknown
}

/**
 * Result type for safe queries
 */
export interface SafeQueryResult<T> {
  data: T | null
  error: string | null
  isOffline: boolean
  isRateLimited: boolean
  rawError?: PostgrestError | AuthError | Error | null
}

/**
 * Check if we're currently online
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Safe wrapper for Supabase queries
 * Provides offline detection, German error messages, and proper typing
 */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<SafeQueryResult<T>> {
  // Check offline status first
  if (!isOnline()) {
    return {
      data: null,
      error: ERROR_MESSAGES.offline,
      isOffline: true,
      isRateLimited: false,
    }
  }

  try {
    const { data, error } = await queryFn()

    if (error) {
      const isRateLimited =
        error.code === '429' ||
        error.message?.toLowerCase().includes('rate limit')

      return {
        data: null,
        error: getGermanErrorMessage(error),
        isOffline: false,
        isRateLimited,
        rawError: error,
      }
    }

    return {
      data,
      error: null,
      isOffline: false,
      isRateLimited: false,
    }
  } catch (err) {
    const error = err as Error

    // Check if it's a network error
    const isNetworkError =
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('fetch') ||
      error.name === 'TypeError'

    return {
      data: null,
      error: isNetworkError ? ERROR_MESSAGES.network_error : getGermanErrorMessage(error),
      isOffline: isNetworkError && !navigator.onLine,
      isRateLimited: false,
      rawError: error,
    }
  }
}

/**
 * Safe wrapper for Supabase auth calls
 */
export async function safeAuth<T>(
  authFn: () => Promise<{ data: T; error: AuthError | null }>
): Promise<SafeQueryResult<T>> {
  // Check offline status first
  if (!isOnline()) {
    return {
      data: null,
      error: ERROR_MESSAGES.offline,
      isOffline: true,
      isRateLimited: false,
    }
  }

  try {
    const { data, error } = await authFn()

    if (error) {
      const isRateLimited = error.message?.toLowerCase().includes('rate limit')

      return {
        data: null,
        error: getGermanErrorMessage(error),
        isOffline: false,
        isRateLimited,
        rawError: error,
      }
    }

    return {
      data,
      error: null,
      isOffline: false,
      isRateLimited: false,
    }
  } catch (err) {
    const error = err as Error

    return {
      data: null,
      error: getGermanErrorMessage(error),
      isOffline: !navigator.onLine,
      isRateLimited: false,
      rawError: error,
    }
  }
}

/**
 * Retry options for withRetry
 */
export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  retryOn?: (error: Error) => boolean
}

/**
 * Execute a function with exponential backoff retry
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    retryOn = () => true,
  } = options

  let lastError: Error | null = null
  let delay = initialDelayMs

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error

      // Don't retry if we're offline
      if (!navigator.onLine) {
        throw lastError
      }

      // Check if we should retry this error
      if (!retryOn(lastError)) {
        throw lastError
      }

      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay))
        delay = Math.min(delay * backoffMultiplier, maxDelayMs)
      }
    }
  }

  throw lastError
}

/**
 * Check Supabase connection health
 */
export async function checkSupabaseHealth(): Promise<{
  isHealthy: boolean
  isOnline: boolean
  latencyMs: number | null
}> {
  if (!navigator.onLine) {
    return { isHealthy: false, isOnline: false, latencyMs: null }
  }

  const start = performance.now()

  try {
    // Import supabase dynamically to avoid circular deps
    const { supabase } = await import('./supabase')

    // Simple health check - just try to get current session
    await supabase.auth.getSession()

    const latencyMs = Math.round(performance.now() - start)

    return { isHealthy: true, isOnline: true, latencyMs }
  } catch {
    return { isHealthy: false, isOnline: navigator.onLine, latencyMs: null }
  }
}

/**
 * Offline action queue for syncing later
 */
interface OfflineAction {
  id: string
  type: string
  payload: unknown
  timestamp: number
}

const OFFLINE_QUEUE_KEY = 'bloghead_offline_queue'

/**
 * Queue an action to be synced when back online
 */
export function queueOfflineAction(type: string, payload: unknown): void {
  const queue = getOfflineQueue()
  const action: OfflineAction = {
    id: crypto.randomUUID(),
    type,
    payload,
    timestamp: Date.now(),
  }
  queue.push(action)
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
}

/**
 * Get current offline queue
 */
export function getOfflineQueue(): OfflineAction[] {
  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Clear offline queue
 */
export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY)
}

/**
 * Remove a specific action from the queue
 */
export function removeFromOfflineQueue(actionId: string): void {
  const queue = getOfflineQueue().filter(a => a.id !== actionId)
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
}

/**
 * Sync offline queue when back online
 * Pass a handler function that processes each action type
 */
export async function syncOfflineQueue(
  handler: (action: OfflineAction) => Promise<boolean>
): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0 }
  }

  const queue = getOfflineQueue()
  let synced = 0
  let failed = 0

  for (const action of queue) {
    try {
      const success = await handler(action)
      if (success) {
        removeFromOfflineQueue(action.id)
        synced++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  return { synced, failed }
}

/**
 * Listen for online/offline events
 */
export function setupOnlineListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}
