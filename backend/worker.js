import dotenv from 'dotenv'
import { connectDB } from './db.js'
import BulkJob from './models/BulkJob.js'
import Validation from './models/Validation.js'
import User from './models/User.js'
import { validateEmail } from './services/validator/index.js'
import { getRiskScore } from './services/results/index.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import csvParser from 'csv-parser'
import { format } from 'fast-csv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config()

const POLL_INTERVAL = 5000 // Check for new jobs every 5 seconds
const BATCH_SIZE = 10 // Process 10 emails at a time
const UPDATE_INTERVAL = 5 // Update progress every 5 emails
const MAX_CONCURRENT_JOBS = 3 // Maximum number of jobs to process simultaneously

/**
 * Process a single bulk job
 */
async function processBulkJob(job) {
  console.log(`📧 Processing bulk job ${job._id}...`)

  const jobStartTime = Date.now()

  try {
    // Mark job as processing
    job.status = 'processing'
    await job.save()

    // Read CSV file and get all emails
    const emails = await readEmailsFromCSV(job.filePath)

    if (emails.length === 0) {
      throw new Error('No valid emails found in CSV file')
    }

    // Get user
    const user = await User.findById(job.userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Note: Credits check is done during upload, not here
    // This ensures users can't upload files they can't afford

    // Process emails in batches
    const results = []
    const resultsDir = path.join(__dirname, 'uploads', 'results')

    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true })
    }

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)

      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map((email) => processEmail(email, job._id, user._id))
      )

      // Collect results
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)

          // Update counts based on status
          const status = result.value.status
          if (status === 'valid') job.counts.valid++
          else if (status === 'invalid') job.counts.invalid++
          else if (status === 'risky') job.counts.risky++
          else job.counts.unknown++

          // Deduct credits
          user.credits -= 1
        } else {
          console.error('Error processing email:', result.reason)
          results.push({
            email: batch[0],
            status: 'unknown',
            riskScore: 100,
            reason: 'Processing error',
          })
          job.counts.unknown++
        }
      }

      // Update progress
      const progress = Math.round(((i + batch.length) / emails.length) * 100)
      job.progress = Math.min(progress, 100)
      await job.save()

      // Save user credits periodically
      if (i % UPDATE_INTERVAL === 0) {
        await user.save()
      }

      console.log(`📊 Progress: ${job.progress}% (${i + batch.length}/${emails.length})`)
    }

    // Save final credits
    await user.save()

    // Generate result CSV
    const resultPath = path.join(resultsDir, `result-${job._id}.csv`)
    await writeResultsToCSV(results, resultPath)

    // Update job with results
    job.resultPath = resultPath
    job.status = 'completed'
    job.progress = 100
    job.executionTime = Date.now() - jobStartTime
    await job.save()

    console.log(`✅ Bulk job ${job._id} completed successfully in ${job.executionTime}ms`)
  } catch (error) {
    console.error(`❌ Error processing bulk job ${job._id}:`, error)

    job.status = 'failed'
    job.error = error.message
    await job.save()
  }
}

/**
 * Process a single email
 */
async function processEmail(email, jobId, userId) {
  try {
    // Validate email and track execution time
    const startTime = Date.now()
    const checks = await validateEmail(email)
    const executionTime = Date.now() - startTime

    const { riskScore, status, reason } = getRiskScore(checks)

    // Save validation result
    const validationResult = new Validation({
      userId,
      jobId,
      email,
      status,
      riskScore,
      checks,
      reason,
      creditsUsed: 1,
      executionTime,
    })

    await validationResult.save()

    return {
      email,
      status,
      riskScore,
      checks,
      reason,
    }
  } catch (error) {
    console.error(`Error validating email ${email}:`, error)
    throw error
  }
}

/**
 * Read emails from CSV file
 */
function readEmailsFromCSV(filePath) {
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
        console.log(`📥 Read ${emails.length} emails from CSV`)
        resolve(emails)
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error)
        reject(error)
      })
  })
}

/**
 * Escape CSV values to prevent formula injection (Excel/Sheets)
 */
function escapeCsvValue(value) {
  if (typeof value !== 'string') return value
  // Si la valeur commence par =, +, -, @ → on préfixe par '
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`
  }
  return value
}

/**
 * Write results to CSV file (secure against CSV injection)
 */
function writeResultsToCSV(results, filePath) {
  return new Promise((resolve, reject) => {
    const csvStream = format({ headers: true })
    const writeStream = fs.createWriteStream(filePath)

    csvStream.pipe(writeStream)

    writeStream.on('finish', () => {
      console.log(`💾 Results saved to ${filePath}`)
      resolve()
    })

    writeStream.on('error', (error) => {
      console.error('Error writing CSV:', error)
      reject(error)
    })

    // Write each result, with escaping
    for (const result of results) {
      csvStream.write({
        email: escapeCsvValue(result.email),
        status: escapeCsvValue(result.status),
        riskScore: escapeCsvValue(String(result.riskScore)),
        reason: escapeCsvValue(result.reason || ''),
        syntax: result.checks?.syntax ? 'Yes' : 'No',
        dns: result.checks?.dns ? 'Yes' : 'No',
        mx: result.checks?.mx ? 'Yes' : 'No',
        smtp: result.checks?.smtp ? 'Yes' : 'No',
        disposable: result.checks?.disposable ? 'Yes' : 'No',
        freeEmail: result.checks?.freeEmail ? 'Yes' : 'No',
        roleAccount: result.checks?.roleAccount ? 'Yes' : 'No',
        suspiciousPattern: result.checks?.suspiciousPattern ? 'Yes' : 'No',
      })
    }

    csvStream.end()
  })
}

/**
 * Main worker loop with concurrent job processing
 */
async function startWorker() {
  console.log('🚀 Bulk validation worker started')
  console.log(`📊 Polling interval: ${POLL_INTERVAL}ms`)
  console.log(`📦 Batch size: ${BATCH_SIZE}`)
  console.log(`⚡ Max concurrent jobs: ${MAX_CONCURRENT_JOBS}`)

  // Connect to MongoDB
  await connectDB()

  // Track currently processing jobs
  const activeJobs = new Set()

  // Main loop
  while (true) {
    try {
      // Remove completed jobs from active set
      const completedJobs = []
      for (const jobId of activeJobs) {
        const job = await BulkJob.findById(jobId)
        if (!job || job.status !== 'processing') {
          completedJobs.push(jobId)
        }
      }
      completedJobs.forEach((jobId) => activeJobs.delete(jobId))

      // Check if we can process more jobs
      const availableSlots = MAX_CONCURRENT_JOBS - activeJobs.size

      if (availableSlots > 0) {
        // Find pending jobs that aren't being processed
        const pendingJobs = await BulkJob.find({ status: 'pending' })
          .sort({ createdAt: 1 })
          .limit(availableSlots)

        if (pendingJobs.length > 0) {
          console.log(
            `📥 Found ${pendingJobs.length} pending job(s). Currently processing: ${activeJobs.size}/${MAX_CONCURRENT_JOBS}`
          )

          // Start processing each job in parallel (don't await)
          for (const job of pendingJobs) {
            // Add to active set before processing starts
            activeJobs.add(job._id.toString())

            // Process job without blocking (fire and forget)
            processBulkJob(job)
              .then(() => {
                console.log(`✅ Job ${job._id} completed`)
                activeJobs.delete(job._id.toString())
              })
              .catch((error) => {
                console.error(`❌ Job ${job._id} failed:`, error)
                activeJobs.delete(job._id.toString())
              })
          }
        } else {
          console.log(
            `⏳ No pending jobs. Currently processing: ${activeJobs.size}/${MAX_CONCURRENT_JOBS}`
          )
        }
      } else {
        console.log(`⏸️  Max concurrent jobs reached (${MAX_CONCURRENT_JOBS}). Waiting...`)
      }

      // Wait before checking again
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
    } catch (error) {
      console.error('Worker error:', error)
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
    }
  }
}

// Start the worker
startWorker().catch((error) => {
  console.error('Failed to start worker:', error)
  process.exit(1)
})
