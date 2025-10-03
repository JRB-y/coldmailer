import net from 'net'
import dns from 'dns'

// SMTP probing is DISABLED by default for security and privacy reasons
// Only enable if you understand the implications and have proper authorization
const ENABLE_SMTP_CHECK = String(process.env.ENABLE_SMTP_CHECK || 'false').toLowerCase() === 'true'
const MAX_CONCURRENT_SMTP = Math.max(
  parseInt(process.env.SMTP_CHECK_MAX_CONCURRENCY || '5', 10),
  1
)
const SMTP_TIMEOUT_MS = Math.min(
  Math.max(parseInt(process.env.SMTP_CHECK_TIMEOUT_MS || '8000', 10), 5000),
  10000
)

// Log SMTP check configuration at startup
if (ENABLE_SMTP_CHECK) {
  console.warn('⚠️  SMTP PROBING IS ENABLED')
  console.warn('   This will make outbound connections to mail servers')
  console.warn(`   Max concurrent: ${MAX_CONCURRENT_SMTP}, Timeout: ${SMTP_TIMEOUT_MS}ms`)
} else {
  console.info('ℹ️  SMTP probing is disabled (default). Set ENABLE_SMTP_CHECK=true to enable.')
}

const dnsLookup = dns.promises.lookup

let activeConnections = 0
const waitQueue = []

// SMTP connection monitoring
const smtpConnectionLog = []
const MAX_LOG_ENTRIES = 1000 // Keep last 1000 connections in memory

/**
 * Log outbound SMTP connection attempt for monitoring
 */
function logSmtpConnection(domain, targetIP, email, result) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    domain,
    targetIP,
    email: email.replace(/^(.{3}).*(@.*)$/, '$1***$2'), // Partially redact email for privacy
    result,
  }

  // Log to console for monitoring
  console.log(`[SMTP] ${domain} -> ${targetIP} | ${logEntry.email} | Result: ${result}`)

  // Keep in-memory log (circular buffer)
  smtpConnectionLog.push(logEntry)
  if (smtpConnectionLog.length > MAX_LOG_ENTRIES) {
    smtpConnectionLog.shift()
  }
}

/**
 * Get recent SMTP connection logs (for monitoring/debugging)
 */
export function getSmtpConnectionLogs(limit = 100) {
  return smtpConnectionLog.slice(-limit)
}

async function acquireSlot() {
  if (activeConnections < MAX_CONCURRENT_SMTP) {
    activeConnections += 1
    return
  }

  await new Promise((resolve) => waitQueue.push(resolve))
  activeConnections += 1
}

function releaseSlot() {
  activeConnections = Math.max(0, activeConnections - 1)
  const next = waitQueue.shift()
  if (next) {
    next()
  }
}

function isPrivateIPv4(address) {
  const octets = address.split('.').map((part) => Number.parseInt(part, 10))
  if (octets.length !== 4 || octets.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false
  }

  const [o1, o2] = octets
  if (o1 === 10) return true
  if (o1 === 127) return true
  if (o1 === 0) return true
  if (o1 === 192 && o2 === 168) return true
  if (o1 === 172 && o2 >= 16 && o2 <= 31) return true
  if (o1 === 169 && o2 === 254) return true
  if (o1 >= 224) return true // multicast & reserved
  return false
}

function isPrivateIPv6(address) {
  const normalized = address.toLowerCase()
  if (normalized === '::1' || normalized === '::') return true

  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.split(':').pop()
    if (mapped && mapped.includes('.')) {
      return isPrivateIPv4(mapped)
    }
  }

  const firstSegment = normalized.split(':')[0]
  if (firstSegment.startsWith('fc') || firstSegment.startsWith('fd')) return true // unique local
  if (firstSegment.startsWith('fe8') || firstSegment.startsWith('fe9') || firstSegment.startsWith('fea') || firstSegment.startsWith('feb')) {
    return true // link-local
  }

  return false
}

function isPrivateAddress(address) {
  const family = net.isIP(address)
  if (family === 4) return isPrivateIPv4(address)
  if (family === 6) return isPrivateIPv6(address)
  return true
}

async function resolveSafeTargets(mxHost) {
  try {
    const records = await dnsLookup(mxHost, { all: true })
    return records
      .filter((record) => record && record.address && !isPrivateAddress(record.address))
      .map((record) => record.address)
  } catch (error) {
    return []
  }
}

/**
 * SMTP validation check with network safety controls.
 * @param {string} email
 * @param {string} domain
 * @param {Array} mxRecords
 */
export async function checkSmtp(email, domain, mxRecords) {
  if (!ENABLE_SMTP_CHECK) {
    return false
  }

  try {
    if (!mxRecords || mxRecords.length === 0) {
      return false
    }

    const sortedMx = [...mxRecords].sort((a, b) => a.priority - b.priority)

    for (const mx of sortedMx.slice(0, 3)) {
      const targets = await resolveSafeTargets(mx.exchange)
      for (const target of targets) {
        try {
          const result = await verifySMTP(target, email, domain)
          if (result !== false && result !== null) {
            return result
          }
        } catch (_err) {
          continue
        }
      }
    }

    return false
  } catch (_error) {
    return false
  }
}

/**
 * Verify email via SMTP connection
 * Returns true if mailbox exists, false if not, null if uncertain
 */
async function verifySMTP(targetHost, email, domain) {
  await acquireSlot()

  return new Promise((resolve) => {
    let settled = false
    let socket

    const finish = (result) => {
      if (settled) return
      settled = true

      // Log the SMTP connection attempt for monitoring
      logSmtpConnection(domain, targetHost, email, result)

      if (socket) {
        socket.removeAllListeners()
        if (!socket.destroyed) {
          socket.destroy()
        }
      }
      releaseSlot()
      resolve(result)
    }

    try {
      socket = net.createConnection({ port: 25, host: targetHost })
    } catch (_connectionError) {
      finish(null)
      return
    }

    socket.setTimeout(SMTP_TIMEOUT_MS, () => finish(null))

    let step = 0
    let buffer = ''

    socket.on('data', (data) => {
      buffer += data.toString()

      const lines = buffer.split('\r\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const code = Number.parseInt(line.substring(0, 3), 10)
        if (Number.isNaN(code)) {
          continue
        }

        if (step === 0 && code === 220) {
          step = 1
          socket.write(`HELO ${domain}\r\n`)
        } else if (step === 1 && code === 250) {
          step = 2
          socket.write(`MAIL FROM:<verify@${domain}>\r\n`)
        } else if (step === 2 && code === 250) {
          step = 3
          socket.write(`RCPT TO:<${email}>\r\n`)
        } else if (step === 3) {
          if (code === 250 || code === 251) {
            finish(true)
          } else if (code === 550 || code === 551 || code === 553 || code === 554) {
            finish(false)
          } else {
            finish(null)
          }
          return
        } else if (code >= 400) {
          finish(null)
          return
        }
      }
    })

    socket.on('error', () => finish(null))
    socket.on('timeout', () => finish(null))
    socket.on('end', () => finish(null))
    socket.on('close', () => finish(null))
  })
}
