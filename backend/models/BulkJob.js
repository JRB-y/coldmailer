import mongoose from 'mongoose'

const bulkJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      required: true,
      index: true,
    },
    filePath: {
      type: String,
      default: null,
    },
    resultPath: {
      type: String,
      default: null,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    counts: {
      total: {
        type: Number,
        default: 0,
      },
      valid: {
        type: Number,
        default: 0,
      },
      invalid: {
        type: Number,
        default: 0,
      },
      risky: {
        type: Number,
        default: 0,
      },
      unknown: {
        type: Number,
        default: 0,
      },
    },
    error: {
      type: String,
      default: null,
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
bulkJobSchema.index({ userId: 1, createdAt: -1 })
bulkJobSchema.index({ status: 1, createdAt: 1 })

const BulkJob = mongoose.model('BulkJob', bulkJobSchema)

export default BulkJob
