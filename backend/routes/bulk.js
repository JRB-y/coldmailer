import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../config/multer.js'
import BulkJob from '../models/BulkJob.js'
import fs from 'fs'

const router = express.Router()

/**
 * POST /api/bulk/upload
 * Upload a CSV file for bulk email validation
 */
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a CSV file',
      })
    }

    // Create a new bulk job
    const bulkJob = new BulkJob({
      userId: req.user._id,
      filePath: req.file.path,
      status: 'pending',
    })

    await bulkJob.save()

    res.json({
      jobId: bulkJob._id,
      status: bulkJob.status,
      message: 'File uploaded successfully. Processing will begin shortly.',
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      error: 'Upload failed',
      message: 'An error occurred while uploading the file',
    })
  }
})

/**
 * GET /api/bulk/jobs
 * Get all bulk validation jobs for the current user
 */
router.get('/jobs', authenticate, async (req, res) => {
  try {
    const jobs = await BulkJob.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('status progress counts error createdAt updatedAt')

    res.json({
      jobs: jobs.map((job) => ({
        id: job._id,
        status: job.status,
        progress: job.progress,
        counts: job.counts,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
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
router.get('/jobs/:id', authenticate, async (req, res) => {
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

    res.json({
      id: job._id,
      status: job.status,
      progress: job.progress,
      counts: job.counts,
      error: job.error,
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
