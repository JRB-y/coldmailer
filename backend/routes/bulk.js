import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../config/multer.js'
import { bulkUploadRateLimiter, bulkJobRateLimiter } from '../middleware/rateLimiter.js'
import BulkJob from '../models/BulkJob.js'
import Validation from '../models/Validation.js'
import fs from 'fs'
import csvParser from 'csv-parser'

const router = express.Router()

/**
 * Helper function to count emails in CSV
 */
function countEmailsInCSV(filePath) {
  return new Promise((resolve, reject) => {
    const emails = []

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        // Try to find email in the row
        const email =
          row.email || row.Email || row.EMAIL || row.emailAddress || Object.values(row)[0]

        if (email && typeof email === 'string' && email.includes('@')) {
          emails.push(email.trim().toLowerCase())
        }
      })
      .on('end', () => {
        resolve(emails.length)
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

/**
 * POST /api/bulk/upload
 * Upload a CSV file for bulk email validation
 */
router.post(
  '/upload',
  authenticate,
  bulkUploadRateLimiter,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please upload a CSV file',
        })
      }

      // Count emails in the CSV file
      const emailCount = await countEmailsInCSV(req.file.path)

      if (emailCount === 0) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path)
        return res.status(400).json({
          error: 'No valid emails found',
          message: 'The CSV file does not contain any valid email addresses',
        })
      }

      // Check if user has enough credits
      if (req.user.credits < emailCount) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path)
        return res.status(402).json({
          error: 'Insufficient credits',
          message: `You need ${emailCount} credits to validate this file, but you only have ${req.user.credits} credits available`,
          required: emailCount,
          available: req.user.credits,
        })
      }

      // Create a new bulk job with the total count
      const bulkJob = new BulkJob({
        userId: req.user._id,
        filePath: req.file.path,
        status: 'pending',
        counts: {
          total: emailCount,
          valid: 0,
          invalid: 0,
          risky: 0,
          unknown: 0,
        },
      })

      await bulkJob.save()

      res.json({
        jobId: bulkJob._id,
        status: bulkJob.status,
        emailCount: emailCount,
        creditsRequired: emailCount,
        message: 'File uploaded successfully. Processing will begin shortly.',
      })
    } catch (error) {
      console.error('Upload error:', error)

      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }

      res.status(500).json({
        error: 'Upload failed',
        message: 'An error occurred while uploading the file',
      })
    }
  }
)

/**
 * GET /api/bulk/jobs
 * Get all bulk validation jobs for the current user
 * Optional query param: status (e.g., ?status=pending,processing)
 */
router.get('/jobs', authenticate, bulkJobRateLimiter, async (req, res) => {
  try {
    const query = { userId: req.user._id }

    // Filter by status if provided
    if (req.query.status) {
      const statuses = req.query.status.split(',').map((s) => s.trim())
      query.status = { $in: statuses }
    }

    const jobs = await BulkJob.find(query)
      .sort({ createdAt: -1 })
      .select('status progress counts error executionTime createdAt updatedAt resultPath')

    res.json({
      jobs: jobs.map((job) => ({
        id: job._id,
        status: job.status,
        progress: job.progress,
        counts: job.counts,
        error: job.error,
        executionTime: job.executionTime,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        hasResults: !!job.resultPath,
      })),
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    res.status(500).json({
      error: 'Failed to retrieve jobs',
      message: 'An error occurred while fetching your jobs',
    })
  }
})

/**
 * GET /api/bulk/jobs/:id
 * Get detailed information for a specific job
 */
router.get('/jobs/:id', authenticate, bulkJobRateLimiter, async (req, res) => {
  console.log('Fetching job with ID:', req.params.id)
  const { all } = req.query

  let filter = {
    _id: req.params.id,
    userId: req.user._id,
    status: { $nin: ['completed'] },
  }

  if (all === 'true') {
    filter = {
      _id: req.params.id,
      userId: req.user._id,
    }
  }

  try {
    const job = await BulkJob.findOne(filter)

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'The requested job does not exist or does not belong to you',
      })
    }

    res.json({
      id: job._id,
      status: job.status,
      progress: job.progress,
      counts: job.counts,
      error: job.error,
      executionTime: job.executionTime,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      hasResults: !!job.resultPath,
    })
  } catch (error) {
    console.error('Get job error:', error)
    res.status(500).json({
      error: 'Failed to retrieve job',
      message: 'An error occurred while fetching the job details',
    })
  }
})

/**
 * GET /api/bulk/jobs/:id/validations
 * Get all validations for a specific bulk job (paginated)
 */
router.get('/jobs/:id/validations', authenticate, bulkJobRateLimiter, async (req, res) => {
  try {
    // Verify job belongs to user
    const job = await BulkJob.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'The requested job does not exist or does not belong to you',
      })
    }

    const { page = 1, limit = 50 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Get validations for this job
    const validations = await Validation.find({ jobId: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('email status riskScore checks reason executionTime createdAt')

    const total = await Validation.countDocuments({ jobId: req.params.id })

    res.json({
      validations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      job: {
        id: job._id,
        status: job.status,
        progress: job.progress,
        counts: job.counts,
      },
    })
  } catch (error) {
    console.error('Get job validations error:', error)
    res.status(500).json({
      error: 'Failed to retrieve validations',
      message: 'An error occurred while fetching job validations',
    })
  }
})

/**
 * GET /api/bulk/jobs/:id/download
 * Download the validated results as a CSV file
 */
router.get('/jobs/:id/download', authenticate, async (req, res) => {
  try {
    const job = await BulkJob.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'The requested job does not exist or does not belong to you',
      })
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        error: 'Job not completed',
        message: 'The job is not yet completed. Please wait for it to finish.',
        status: job.status,
        progress: job.progress,
      })
    }

    if (!job.resultPath || !fs.existsSync(job.resultPath)) {
      return res.status(404).json({
        error: 'Results not found',
        message: 'The results file could not be found',
      })
    }

    // Stream the file to the client
    const filename = `validated-results-${job._id}.csv`
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    const readStream = fs.createReadStream(job.resultPath)
    readStream.pipe(res)
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({
      error: 'Download failed',
      message: 'An error occurred while downloading the results',
    })
  }
})

export default router
