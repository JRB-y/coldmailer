import dns from 'dns'
import { promisify } from 'util'
import { getCacheProvider, CacheTTL } from '../cache/index.js'

const resolveMx = promisify(dns.resolveMx)
const cache = getCacheProvider()

/**
 * Checks if the domain has valid MX records
 * Returns the MX records array, or null if none found
 */
export async function checkMxRecords(domain) {
  // Check cache first
  const cacheKey = `mx:${domain}`
  const cached = await cache.get(cacheKey)

  if (cached !== null) {
    return cached
  }

  // Cache miss - perform MX lookup
  try {
    // Set DNS timeout
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']) // Use reliable DNS servers

    let records = await Promise.race([
      resolveMx(domain),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 5000)),
    ])

    records = records.filter((record) => record && record.exchange)

    const result = records && records.length > 0 ? records : null

    // If MX lookup succeeded, cache and return
    if (result) {
      await cache.set(cacheKey, result, CacheTTL.MX)
      return result
    }

    // If MX fails, check if domain has A record (some domains receive email without MX)
    try {
      const resolveA = promisify(dns.resolve4)
      const aRecords = await resolveA(domain)
      // Return a synthetic MX record using the A record
      const syntheticMx = aRecords && aRecords.length > 0 ? [{ exchange: domain, priority: 0 }] : null

      // Cache the result (6 hours TTL)
      await cache.set(cacheKey, syntheticMx, CacheTTL.MX)

      return syntheticMx
    } catch {
      // Cache null result to avoid repeated lookups
      await cache.set(cacheKey, null, CacheTTL.MX)
      return null
    }
  } catch (error) {
    // If MX fails, check if domain has A record (some domains receive email without MX)
    try {
      const resolveA = promisify(dns.resolve4)
      const aRecords = await resolveA(domain)
      // Return a synthetic MX record using the A record
      const syntheticMx = aRecords && aRecords.length > 0 ? [{ exchange: domain, priority: 0 }] : null

      // Cache the result (6 hours TTL)
      await cache.set(cacheKey, syntheticMx, CacheTTL.MX)

      return syntheticMx
    } catch {
      // Cache null result to avoid repeated lookups
      await cache.set(cacheKey, null, CacheTTL.MX)
      return null
    }
  }
}
