import { InMemoryCache } from './InMemoryCache.js'

/**
 * Cache TTL Constants (in milliseconds)
 */
export const CacheTTL = {
  DNS: 60 * 60 * 1000, // 1 hour
  MX: 6 * 60 * 60 * 1000, // 6 hours
}

/**
 * Global cache instance
 * Shared across all validations (single and bulk)
 */
let cacheInstance = null

/**
 * Cache Provider Factory
 *
 * Creates and returns a cache provider based on environment configuration.
 * Defaults to InMemoryCache.
 *
 * @returns {CacheProvider} - Cache provider instance
 */
export function getCacheProvider() {
  if (cacheInstance) {
    return cacheInstance
  }

  const cacheType = process.env.CACHE_PROVIDER || 'inmemory'

  switch (cacheType.toLowerCase()) {
    case 'inmemory':
      cacheInstance = new InMemoryCache()
      break

    // Future implementations:
    // case 'redis':
    //   cacheInstance = new RedisCache(process.env.REDIS_URL)
    //   break

    default:
      console.warn(`Unknown cache provider: ${cacheType}, falling back to in-memory`)
      cacheInstance = new InMemoryCache()
  }

  console.log(`✅ Cache provider initialized: ${cacheType}`)
  return cacheInstance
}

/**
 * Reset cache instance (useful for testing)
 */
export async function resetCache() {
  if (cacheInstance) {
    await cacheInstance.clear()
    cacheInstance = null
  }
}

// Export for direct use
export { InMemoryCache }
