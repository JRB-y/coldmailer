import mongoose from 'mongoose'

const pricingPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
    },
    priceUSDC: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    features: {
      type: [String],
      default: [],
    },
    popular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient querying
pricingPlanSchema.index({ isActive: 1, priceUSDC: 1 })

const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema)

export default PricingPlan
