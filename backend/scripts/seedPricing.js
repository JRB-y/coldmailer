import dotenv from 'dotenv'
import { connectDB } from '../db.js'
import PricingPlan from '../models/PricingPlan.js'

dotenv.config()

const pricingPlans = [
  {
    name: 'Starter',
    credits: 10000,
    priceUSDC: 29,
    description: 'Perfect for small teams and freelancers',
    features: [
      '10,000 email validations',
      'Bulk CSV upload',
      'API access',
      'Basic support',
      'Detailed validation reports',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    credits: 50000,
    priceUSDC: 99,
    description: 'Best for growing agencies',
    features: [
      '50,000 email validations',
      'Bulk CSV upload',
      'Priority API access',
      'Priority support',
      'Advanced analytics',
      'Team collaboration',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    credits: 200000,
    priceUSDC: 299,
    description: 'For large-scale operations',
    features: [
      '200,000 email validations',
      'Unlimited bulk uploads',
      'Dedicated API access',
      '24/7 priority support',
      'Custom integrations',
      'Advanced analytics & reporting',
      'Dedicated account manager',
    ],
    popular: false,
  },
]

async function seedPricing() {
  try {
    await connectDB()

    console.log('🌱 Seeding pricing plans...')

    // Clear existing plans
    await PricingPlan.deleteMany({})
    console.log('✓ Cleared existing pricing plans')

    // Insert new plans
    const inserted = await PricingPlan.insertMany(pricingPlans)
    console.log(`✓ Inserted ${inserted.length} pricing plans`)

    console.log('\n📋 Pricing Plans:')
    inserted.forEach((plan) => {
      console.log(`  - ${plan.name}: ${plan.credits.toLocaleString()} credits for $${plan.priceUSDC} USDC`)
    })

    console.log('\n✅ Pricing plans seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding pricing plans:', error)
    process.exit(1)
  }
}

seedPricing()
