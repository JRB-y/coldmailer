/**
 * Login Lockout Middleware
 * Tracks failed login attempts and implements temporary lockouts
 */

// In-memory storage for failed login attempts
// Structure: Map<key, { attempts: number, lockedUntil: Date | null, firstAttempt: Date }>
const failedAttempts = new Map()

// Configuration
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Generate a key for tracking attempts
 * Uses IP address as the primary identifier
 */
const getAttemptKey = (req) => {
  // Use IP for tracking (works for both authenticated and unauthenticated requests)
  const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection.remoteAddress
  return `ip:${ip}`
}

/**
 * Clean up expired entries to prevent memory leaks
 */
const cleanupExpiredEntries = () => {
  const now = Date.now()
  for (const [key, data] of failedAttempts.entries()) {
    // Remove if lockout has expired and no recent attempts
    if (data.lockedUntil && data.lockedUntil < now) {
      // If lockout expired, check if we should remove the entry entirely
      const timeSinceFirstAttempt = now - data.firstAttempt.getTime()
      if (timeSinceFirstAttempt > ATTEMPT_WINDOW_MS) {
        failedAttempts.delete(key)
      } else {
        // Reset the entry but keep tracking
        data.attempts = 0
        data.lockedUntil = null
      }
    } else if (!data.lockedUntil) {
      // If not locked, check if attempt window has expired
      const timeSinceFirstAttempt = now - data.firstAttempt.getTime()
      if (timeSinceFirstAttempt > ATTEMPT_WINDOW_MS) {
        failedAttempts.delete(key)
      }
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000)

/**
 * Middleware to check if an IP is currently locked out
 */
export const checkLoginLockout = (req, res, next) => {
  const key = getAttemptKey(req)
  const data = failedAttempts.get(key)

  if (!data) {
    // No attempts recorded, allow through
    return next()
  }

  const now = Date.now()

  // Check if currently locked out
  if (data.lockedUntil && data.lockedUntil > now) {
    const remainingMs = data.lockedUntil - now
    const remainingMinutes = Math.ceil(remainingMs / 60000)

    return res.status(429).json({
      error: 'Account temporarily locked',
      message: `Too many failed login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
      lockedUntil: new Date(data.lockedUntil).toISOString(),
      retryAfter: Math.ceil(remainingMs / 1000), // seconds
    })
  }

  // If lockout has expired, reset the data
  if (data.lockedUntil && data.lockedUntil <= now) {
    data.attempts = 0
    data.lockedUntil = null
    data.firstAttempt = new Date()
  }

  // Check if attempt window has expired
  const timeSinceFirstAttempt = now - data.firstAttempt.getTime()
  if (timeSinceFirstAttempt > ATTEMPT_WINDOW_MS) {
    // Reset the window
    failedAttempts.delete(key)
  }

  next()
}

/**
 * Record a failed login attempt
 * Call this from the login route handler when authentication fails
 */
export const recordFailedLogin = (req) => {
  const key = getAttemptKey(req)
  const now = new Date()

  let data = failedAttempts.get(key)

  if (!data) {
    // First failed attempt
    data = {
      attempts: 1,
      lockedUntil: null,
      firstAttempt: now,
    }
    failedAttempts.set(key, data)
    return { attempts: 1, remainingAttempts: MAX_ATTEMPTS - 1, locked: false }
  }

  // Check if we should reset the window
  const timeSinceFirstAttempt = now.getTime() - data.firstAttempt.getTime()
  if (timeSinceFirstAttempt > ATTEMPT_WINDOW_MS) {
    // Reset the window
    data.attempts = 1
    data.firstAttempt = now
    data.lockedUntil = null
    return { attempts: 1, remainingAttempts: MAX_ATTEMPTS - 1, locked: false }
  }

  // Increment attempts
  data.attempts++

  // Check if we should lock out
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS)
    return {
      attempts: data.attempts,
      remainingAttempts: 0,
      locked: true,
      lockedUntil: data.lockedUntil,
    }
  }

  return {
    attempts: data.attempts,
    remainingAttempts: MAX_ATTEMPTS - data.attempts,
    locked: false,
  }
}

/**
 * Reset failed attempts for a user (call on successful login)
 */
export const resetFailedLogin = (req) => {
  const key = getAttemptKey(req)
  failedAttempts.delete(key)
}

/**
 * Get current attempt status (useful for debugging/monitoring)
 */
export const getAttemptStatus = (req) => {
  const key = getAttemptKey(req)
  const data = failedAttempts.get(key)

  if (!data) {
    return { attempts: 0, locked: false }
  }

  const now = Date.now()
  const locked = data.lockedUntil && data.lockedUntil > now

  return {
    attempts: data.attempts,
    locked,
    lockedUntil: locked ? data.lockedUntil : null,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - data.attempts),
  }
}
