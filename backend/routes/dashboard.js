import express from 'express'
import { authenticate } from '../middleware/auth.js'
import Validation from '../models/Validation.js'
import BulkJob from '../models/BulkJob.js'

const router = express.Router()

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for the authenticated user
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id

    // Aggregate validation stats
    const stats = await Validation.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalValidations: { $sum: 1 },
          validCount: {
            $sum: { $cond: [{ $eq: ['$status', 'valid'] }, 1, 0] },
          },
          invalidCount: {
            $sum: { $cond: [{ $eq: ['$status', 'invalid'] }, 1, 0] },
          },
          riskyCount: {
            $sum: { $cond: [{ $eq: ['$status', 'risky'] }, 1, 0] },
          },
          unknownCount: {
            $sum: { $cond: [{ $eq: ['$status', 'unknown'] }, 1, 0] },
          },
        },
      },
    ])

    // Check if there's a running bulk job
    const runningJob = await BulkJob.findOne({
      userId,
      status: { $in: ['pending', 'processing'] },
    })
      .sort({ createdAt: -1 })
      .select('_id status progress counts createdAt')

    // Get recent validations (last 5)
    const recentValidations = await Validation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email status riskScore createdAt')

    const result = {
      totalValidations: stats[0]?.totalValidations || 0,
      validCount: stats[0]?.validCount || 0,
      invalidCount: stats[0]?.invalidCount || 0,
      riskyCount: stats[0]?.riskyCount || 0,
      unknownCount: stats[0]?.unknownCount || 0,
      hasRunningJob: !!runningJob,
      runningJob: runningJob
        ? {
            id: runningJob._id,
            status: runningJob.status,
            progress: runningJob.progress,
            counts: runningJob.counts,
            createdAt: runningJob.createdAt,
          }
        : null,
      recentValidations,
    }

    res.json(result)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({
      error: 'Failed to retrieve dashboard stats',
      message: error.message,
    })
  }
})

export default router
