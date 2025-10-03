/**
 * Domain Age WHOIS Check with Caching
 * Checks domain age using WHOIS API with fail-safe error handling
 */

// In-memory cache for WHOIS lookups
// Structure: Map<domain, { result, timestamp }>
const whoisCache = new Map()

// Cache configuration
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const REQUEST_TIMEOUT_MS = 5000 // 5 seconds

/**
 * Clean up expired cache entries
 */
const cleanupExpiredCache = () => {
  const now = Date.now()
  for (const [domain, data] of whoisCache.entries()) {
    if (now - data.timestamp > CACHE_TTL_MS) {
      whoisCache.delete(domain)
    }
  }
}

// Run cache cleanup every hour
setInterval(cleanupExpiredCache, 60 * 60 * 1000)

/**
 * Fetch with timeout
 */
const fetchWithTimeout = async (url, options, timeout = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Check domain age using WHOIS API
 * @param {string} domain - The domain to check
 * @returns {Promise<Object>} - { isNew: boolean|'unknown', ageInDays: number|null, status: string }
 */
export async function checkDomainAge(domain) {
  // Check cache first
  const cached = whoisCache.get(domain)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result
  }

  // Check if API is configured
  if (!process.env.WHOIS_API_URL || !process.env.API_LAYER_API_KEY) {
    console.warn('WHOIS API not configured - domain age check skipped')
    return {
      isNew: 'unknown',
      ageInDays: null,
      status: 'not_configured',
    }
  }

  try {
    const url = `${process.env.WHOIS_API_URL}?domain=${encodeURIComponent(domain)}`
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          apikey: process.env.API_LAYER_API_KEY,
        },
      },
      REQUEST_TIMEOUT_MS
    )

    if (!response.ok) {
      // API error (rate limit, invalid key, etc.)
      console.error(`WHOIS API error for ${domain}: ${response.status} ${response.statusText}`)
      return {
        isNew: 'unknown',
        ageInDays: null,
        status: 'api_error',
      }
    }

    const data = await response.json()

    // Check if we got valid data
    if (!data || !data.created_date) {
      console.warn(`WHOIS data missing created_date for ${domain}`)
      const result = {
        isNew: 'unknown',
        ageInDays: null,
        status: 'no_data',
      }

      // Cache the unknown result to avoid repeated failed lookups
      whoisCache.set(domain, {
        result,
        timestamp: Date.now(),
      })

      return result
    }

    const createdDate = new Date(data.created_date)

    // Validate the date
    if (isNaN(createdDate.getTime())) {
      console.warn(`Invalid created_date for ${domain}: ${data.created_date}`)
      const result = {
        isNew: 'unknown',
        ageInDays: null,
        status: 'invalid_date',
      }

      whoisCache.set(domain, {
        result,
        timestamp: Date.now(),
      })

      return result
    }

    const ageInDays = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)

    const result = {
      isNew: ageInDays < 90, // Domain less than 3 months old
      ageInDays: Math.floor(ageInDays),
      status: 'success',
      createdDate: createdDate.toISOString(),
    }

    // Cache the successful result
    whoisCache.set(domain, {
      result,
      timestamp: Date.now(),
    })

    return result
  } catch (error) {
    // Fail-safe: return unknown instead of crashing
    const errorType = error.name === 'AbortError' ? 'timeout' : 'error'
    console.error(`WHOIS lookup ${errorType} for ${domain}:`, error.message)

    const result = {
      isNew: 'unknown',
      ageInDays: null,
      status: errorType,
      error: error.message,
    }

    // Cache the error result (shorter TTL for errors - 1 hour)
    whoisCache.set(domain, {
      result,
      timestamp: Date.now() - CACHE_TTL_MS + 60 * 60 * 1000, // Expire in 1 hour instead of 24
    })

    return result
  }
}

/**
 * Clear cache for a specific domain (useful for testing)
 */
export function clearDomainCache(domain) {
  whoisCache.delete(domain)
}

/**
 * Get cache statistics (useful for monitoring)
 */
export function getCacheStats() {
  return {
    size: whoisCache.size,
    entries: Array.from(whoisCache.keys()),
  }
}
