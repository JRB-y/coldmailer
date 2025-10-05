import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PricingPlan',
      required: true,
    },
    coinbaseChargeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    coinbaseChargeCode: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    credits: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed', 'expired', 'cancelled'],
      default: 'pending',
      index: true,
    },
    hostedUrl: {
      type: String,
    },
    confirmedAt: {
      type: Date,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient querying
paymentSchema.index({ userId: 1, status: 1 })
paymentSchema.index({ coinbaseChargeId: 1 })

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment
