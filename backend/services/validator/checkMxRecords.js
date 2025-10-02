import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

/**
 * Checks if the domain has valid MX records
 */
export async function checkMxRecords(domain) {
  try {
    // Set DNS timeout
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); // Use reliable DNS servers
    
    const records = await Promise.race([
      resolveMx(domain),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('DNS timeout')), 5000)
      )
    ]);
    
    return records && records.length > 0;
  } catch (error) {
    // If MX fails, check if domain has A record (some domains receive email without MX)
    try {
      const resolveA = promisify(dns.resolve4);
      const aRecords = await resolveA(domain);
      return aRecords && aRecords.length > 0;
    } catch {
      return false;
    }
  }
}
