/**
 * Abstract Cache Provider Interface
 *
 * This defines the contract for all cache implementations.
 * Providers can be in-memory, Redis, Memcached, etc.
 */
export class CacheProvider {
  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached value or null if not found/expired
   */
  async get(key) {
    throw new Error('Method get() must be implemented')
  }

  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttl) {
    throw new Error('Method set() must be implemented')
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    throw new Error('Method delete() must be implemented')
  }

  /**
   * Clear all cached values
   * @returns {Promise<void>}
   */
  async clear() {
    throw new Error('Method clear() must be implemented')
  }
}
