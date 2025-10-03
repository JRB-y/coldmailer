import dns from 'dns'
import { promisify } from 'util'
import { getCacheProvider, CacheTTL } from '../cache/index.js'

const resolve4 = promisify(dns.resolve4)
const resolve6 = promisify(dns.resolve6)
const cache = getCacheProvider()

/**
 * Checks if the domain exists (has DNS A or AAAA records)
 * This is separate from MX record checking
 * Returns true if domain resolves, false otherwise
 */
export async function checkDns(domain) {
  // Check cache first
  const cacheKey = `dns:${domain}`
  const cached = await cache.get(cacheKey)

  if (cached !== null) {
    return cached
  }

  // Cache miss - perform DNS lookup
  try {
    // Set DNS timeout
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']) // Use reliable DNS servers

    let result = false

    // Try IPv4 (A record)
    try {
      const records = await Promise.race([
        resolve4(domain),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 5000)),
      ])

      if (records && records.length > 0) {
        result = true
      }
    } catch (ipv4Error) {
      // IPv4 failed, try IPv6
    }

    // Try IPv6 (AAAA record) if IPv4 failed
    if (!result) {
      try {
        const records = await Promise.race([
          resolve6(domain),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 5000)),
        ])

        if (records && records.length > 0) {
          result = true
        }
      } catch (ipv6Error) {
        // Both failed
        result = false
      }
    }

    // Cache the result (1 hour TTL)
    await cache.set(cacheKey, result, CacheTTL.DNS)

    return result
  } catch (error) {
    // Don't cache errors
    return false
  }
}
