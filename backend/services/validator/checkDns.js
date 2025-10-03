import dns from 'dns'
import { promisify } from 'util'

const resolve4 = promisify(dns.resolve4)
const resolve6 = promisify(dns.resolve6)

/**
 * Checks if the domain exists (has DNS A or AAAA records)
 * This is separate from MX record checking
 * Returns true if domain resolves, false otherwise
 */
export async function checkDns(domain) {
  try {
    // Set DNS timeout
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']) // Use reliable DNS servers

    // Try IPv4 (A record)
    try {
      const records = await Promise.race([
        resolve4(domain),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 5000)),
      ])

      if (records && records.length > 0) {
        return true
      }
    } catch (ipv4Error) {
      // IPv4 failed, try IPv6
    }

    // Try IPv6 (AAAA record)
    try {
      const records = await Promise.race([
        resolve6(domain),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 5000)),
      ])

      if (records && records.length > 0) {
        return true
      }
    } catch (ipv6Error) {
      // Both failed
      return false
    }

    return false
  } catch (error) {
    return false
  }
}
