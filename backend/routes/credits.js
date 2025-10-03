import express from 'express'
import { authenticate } from '../middleware/auth.js'
import PricingPlan from '../models/PricingPlan.js'
import CreditTransaction from '../models/CreditTransaction.js'
import User from '../models/User.js'

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

/**
 * POST /api/credits/purchase
 * Mock purchase credits (USDC payment integration to be added later)
 */
router.post('/purchase', authenticate, async (req, res) => {
  try {
    const { planId } = req.body

    if (!planId) {
      return res.status(400).json({
        error: 'Plan ID required',
        message: 'Please provide a planId',
      })
    }

    // Find the pricing plan
    const plan = await PricingPlan.findOne({ _id: planId, isActive: true })

    if (!plan) {
      return res.status(404).json({
        error: 'Plan not found',
        message: 'The requested pricing plan does not exist or is inactive',
      })
    }

    // Get user from database to ensure we have latest balance
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      })
    }

    const balanceBefore = user.credits

    // Add credits to user balance
    user.credits += plan.credits
    await user.save()

    const balanceAfter = user.credits

    // Log the transaction
    const transaction = new CreditTransaction({
      userId: user._id,
      planId: plan._id,
      type: 'purchase',
      credits: plan.credits,
      amountUSDC: plan.priceUSDC,
      balanceBefore,
      balanceAfter,
      status: 'completed',
      metadata: {
        planName: plan.name,
        mock: true, // This is a mock purchase
      },
    })

    await transaction.save()

    res.json({
      success: true,
      message: `Successfully purchased ${plan.credits.toLocaleString()} credits`,
      transaction: {
        id: transaction._id,
        credits: plan.credits,
        amountUSDC: plan.priceUSDC,
        balanceBefore,
        balanceAfter,
      },
      user: {
        credits: user.credits,
      },
    })
  } catch (error) {
    console.error('Purchase credits error:', error)
    res.status(500).json({
      error: 'Purchase failed',
      message: 'An error occurred while processing your purchase',
    })
  }
})

/**
 * GET /api/credits/history
 * Get credit transaction history
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * limit

    const transactions = await CreditTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('planId', 'name credits priceUSDC')

    const total = await CreditTransaction.countDocuments({ userId: req.user._id })

    res.json({
      transactions: transactions.map((t) => ({
        id: t._id,
        type: t.type,
        credits: t.credits,
        amountUSDC: t.amountUSDC,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
        status: t.status,
        plan: t.planId
          ? {
              name: t.planId.name,
              credits: t.planId.credits,
              priceUSDC: t.planId.priceUSDC,
            }
          : null,
        createdAt: t.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get credit history error:', error)
    res.status(500).json({
      error: 'Failed to retrieve credit history',
    })
  }
})

export default router
