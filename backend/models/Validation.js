import mongoose from 'mongoose'

const validationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BulkJob',
      default: null,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['valid', 'invalid', 'risky', 'unknown'],
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
    },
    checks: {
      syntax: Boolean,
      dns: Boolean,
      mx: Boolean,
      smtp: Boolean,
      disposable: Boolean,
      freeEmail: Boolean,
      roleAccount: Boolean,
      domainAge: {
        isNew: { type: Boolean, default: null },
        daysOld: { type: Number, default: null },
      },
      suspiciousPattern: Boolean,
    },
    reason: {
      type: String,
      default: '',
    },
    creditsUsed: {
      type: Number,
      default: 1,
    },
    executionTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient querying
validationSchema.index({ userId: 1, createdAt: -1 })

const Validation = mongoose.model('Validation', validationSchema)

export default Validation
