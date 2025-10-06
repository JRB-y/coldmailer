import express from 'express'
import { checkMxRecords } from '../services/validator/checkMxRecords.js'
import { freePublicRateLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

/**
 * POST /api/free/check-mx
 * Public endpoint to check MX records for a domain (no authentication required)
 * Very strict rate limiting: 3 requests per hour per IP
 */
router.post('/check-mx', freePublicRateLimiter, async (req, res) => {
  try {
    const { email } = req.body

    // Validate request
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Email address is required',
      })
    }

    // Extract domain from email
    const emailPattern = /^[^\s@]+@([^\s@]+)$/
    const match = email.trim().match(emailPattern)

    if (!match) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address',
      })
    }

    const domain = match[1].toLowerCase()

    // Check MX records
    const startTime = Date.now()
    const mxRecords = await checkMxRecords(domain)
    const executionTime = Date.now() - startTime

    // Determine result
    const hasMxRecords = mxRecords !== null && mxRecords.length > 0
    const status = hasMxRecords ? 'valid' : 'invalid'

    res.json({
      email,
      domain,
      hasMxRecords,
      status,
      mxRecords: hasMxRecords ? mxRecords : null,
      executionTime,
      message: hasMxRecords
        ? 'Domain has valid MX records and can receive emails'
        : 'Domain has no MX records and cannot receive emails',
    })
  } catch (error) {
    console.error('Free MX check endpoint error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while checking MX records',
    })
  }
})

export default router
