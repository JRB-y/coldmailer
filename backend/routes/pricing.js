import express from 'express'
import PricingPlan from '../models/PricingPlan.js'

const router = express.Router()

/**
 * GET /api/pricing
 * Get all active pricing plans
 */
router.get('/', async (req, res) => {
  try {
    const plans = await PricingPlan.find({ isActive: true })
      .sort({ priceUSDC: 1 })
      .select('-__v')

    res.json({
      plans: plans.map((plan) => ({
        id: plan._id,
        name: plan.name,
        credits: plan.credits,
        priceUSDC: plan.priceUSDC,
        description: plan.description,
        features: plan.features,
        popular: plan.popular,
      })),
    })
  } catch (error) {
    console.error('Get pricing plans error:', error)
    res.status(500).json({
      error: 'Failed to retrieve pricing plans',
      message: 'An error occurred while fetching pricing plans',
    })
  }
})

export default router
