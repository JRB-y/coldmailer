import express from 'express'
import crypto from 'crypto'
import PricingPlan from '../models/PricingPlan.js'
import Payment from '../models/Payment.js'
import { authenticate } from '../middleware/auth.js'
const router = express.Router()

// Coinbase payment integration
router.post('/create-payment', authenticate, async (req, res) => {
  try {
    const { planId } = req.body

    if (!planId) {
      return res.status(400).json({ error: 'planId is required' })
    }

    // Fetch the pricing plan from database
    const plan = await PricingPlan.findById(planId)
    if (!plan || !plan.isActive) {
      return res.status(404).json({ error: 'Pricing plan not found or inactive' })
    }

    console.log(
      `Creating Coinbase payment for plan: ${plan.name} (${plan.credits} credits, $${plan.priceUSDC})`
    )

    // ✅ Ensure amount is a proper decimal string without scientific notation
    const numAmount = Number(plan.priceUSDC)
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid plan amount' })
    }

    // Convert to string with 2 decimals, avoiding scientific notation
    const formattedAmount = numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    })

    const response = await fetch(process.env.COINBASE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify({
        name: `Valix - ${plan.name}`,
        description: `Purchase ${plan.credits.toLocaleString()} email validation credits`,
        pricing_type: 'fixed_price',
        local_price: {
          amount: req.user.email === 'jrb.youssef@gmail.com' ? 0.01 : formattedAmount, // TODO: cretic! this check is for testing remove it after
          currency: 'USD',
        },
        metadata: {
          userId: req.user._id.toString(),
          planId: plan._id.toString(),
          credits: plan.credits,
        },
        redirect_url: `${process.env.FRONTEND_URL}/dashboard`, // TODO: create theses pages
        cancel_url: `${process.env.FRONTEND_URL}/dashboard`, // TODO: create theses pages
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Coinbase error:', errorBody)
      return res.status(response.status).json({ error: 'Coinbase API failed' })
    }

    const data = await response.json()

    // Create payment record in database
    const payment = await Payment.create({
      userId: req.user._id,
      planId: plan._id,
      coinbaseChargeId: data.data.id,
      coinbaseChargeCode: data.data.code,
      amount: plan.priceUSDC,
      currency: 'USD',
      credits: plan.credits,
      hostedUrl: data.data.hosted_url,
      status: 'pending',
      metadata: {
        planName: plan.name,
      },
    })

    console.log(`Payment created with ID: ${payment._id}`)

    res.json(data)
  } catch (err) {
    console.error('Coinbase payment error:', err)
    res.status(500).json({ error: 'Failed to create payment' })
  }
})

const WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET

router.post('/coinbase-webhook', async (req, res) => {
  try {
    const signature = req.headers['x-cc-webhook-signature']
    const payload = req.body.toString()

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature')
      return res.status(400).send('Invalid signature')
    }

    const event = JSON.parse(payload)
    console.log('Received Coinbase event:', event.event.type, 'for charge:', event.event.data.code)

    const chargeId = event.event.data.id
    const eventType = event.event.type

    // Find the payment record
    const payment = await Payment.findOne({ coinbaseChargeId: chargeId })
    if (!payment) {
      console.error('Payment not found for charge:', chargeId)
      return res.status(404).send('Payment not found')
    }

    // Handle different event types
    switch (eventType) {
      case 'charge:confirmed': {
        // Payment confirmed - add credits to user
        if (payment.status === 'confirmed') {
          console.log('Payment already confirmed:', payment._id)
          return res.status(200).send('ok')
        }

        const User = (await import('../models/User.js')).default

        const user = await User.findById(payment.userId)
        if (!user) {
          console.error('User not found:', payment.userId)
          return res.status(404).send('User not found')
        }

        // Add credits to user
        user.credits += payment.credits
        await user.save()

        // Update payment status
        payment.status = 'confirmed'
        payment.confirmedAt = new Date()
        await payment.save()

        console.log(
          `✅ Payment confirmed: User ${user.email} received ${payment.credits} credits (new balance: ${user.credits})`
        )
        break
      }

      case 'charge:failed':
        payment.status = 'failed'
        await payment.save()
        console.log(`❌ Payment failed for charge: ${chargeId}`)
        break

      case 'charge:delayed':
        console.log(`⏳ Payment delayed for charge: ${chargeId}`)
        break

      case 'charge:pending':
        console.log(`⏳ Payment pending for charge: ${chargeId}`)
        break

      case 'charge:resolved':
        console.log(`✅ Payment resolved for charge: ${chargeId}`)
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    res.status(200).send('ok')
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(500).send('Internal server error')
  }
})

export default router
