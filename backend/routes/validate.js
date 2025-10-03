import express from 'express'
import { validateEmail } from '../services/validator/index.js'
import { getRiskScore } from '../services/results/index.js'
import { authenticate } from '../middleware/auth.js'
import Validation from '../models/Validation.js'

const router = express.Router()

/**
 * POST /api/validate
 * Validates a single email address (requires authentication)
 */
router.post('/validate', authenticate, async (req, res) => {
  try {
    const { email } = req.body
    const user = req.user

    // Validate request
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Email address is required',
      })
    }

    // Check if user has credits
    if (user.credits < 1) {
      return res.status(402).json({
        error: 'Insufficient credits',
        message: 'You need at least 1 credit to validate an email',
        creditsRemaining: user.credits,
      })
    }

    // Validate email
    const checks = await validateEmail(email)

    const { riskScore, status, reason } = getRiskScore(checks)

    // Deduct 1 credit from user
    user.credits -= 1
    await user.save()

    // Save validation result to database
    const validationResult = new Validation({
      userId: user._id,
      email,
      status,
      riskScore,
      checks,
      reason,
      creditsUsed: 1,
    })

    await validationResult.save()

    res.json({
      email,
      isValid: status === 'valid',
      status,
      riskScore,
      checks,
      reason,
      creditsRemaining: user.credits,
    })
  } catch (error) {
    console.error('Validation endpoint error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while validating the email',
    })
  }
})

export default router
