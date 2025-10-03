import mongoose from 'mongoose'

const creditTransactionSchema = new mongoose.Schema(
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
      default: null,
    },
    type: {
      type: String,
      enum: ['purchase', 'bonus', 'refund', 'deduction'],
      required: true,
      default: 'purchase',
    },
    credits: {
      type: Number,
      required: true,
    },
    amountUSDC: {
      type: Number,
      default: 0,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
      index: true,
    },
    transactionHash: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient querying
creditTransactionSchema.index({ userId: 1, createdAt: -1 })
creditTransactionSchema.index({ status: 1, createdAt: -1 })

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema)

export default CreditTransaction
