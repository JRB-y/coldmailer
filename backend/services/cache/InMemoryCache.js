import { CacheProvider } from './CacheProvider.js'

/**
 * In-Memory Cache Implementation
 *
 * Uses a Map to store cached values with TTL.
 * Good for single-server deployments.
 * For multi-server/distributed systems, use Redis instead.
 */
export class InMemoryCache extends CacheProvider {
  constructor() {
    super()
    this.cache = new Map()
    this.timers = new Map()
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached value or null if not found/expired
   */
  async get(key) {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      // Clean up expired entry
      this.cache.delete(key)
      const timer = this.timers.get(key)
      if (timer) {
        clearTimeout(timer)
        this.timers.delete(key)
      }
      return null
    }

    return entry.value
  }

  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttl) {
    // Clear existing timer if any
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Store value with expiry timestamp
    const expiry = Date.now() + ttl
    this.cache.set(key, { value, expiry })

    // Set cleanup timer
    const timer = setTimeout(() => {
      this.cache.delete(key)
      this.timers.delete(key)
    }, ttl)

    this.timers.set(key, timer)
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    this.cache.delete(key)

    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  /**
   * Clear all cached values
   * @returns {Promise<void>}
   */
  async clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }

    this.cache.clear()
    this.timers.clear()
  }

  /**
   * Get cache statistics
   * @returns {Object} - Stats object with size and keys
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}
