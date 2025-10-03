import express from 'express'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/credits
 * Get user's current credit balance
 */
router.get('/', authenticate, async (req, res) => {
  try {
    res.json({
      credits: req.user.credits,
      email: req.user.email,
    })
  } catch (error) {
    console.error('Get credits error:', error)
    res.status(500).json({ error: 'Failed to retrieve credit balance' })
  }
})

// TODO: Future endpoints
// - POST /api/credits/purchase - Purchase additional credits (Stripe integration)
// - GET /api/credits/history - Get credit usage history

export default router
