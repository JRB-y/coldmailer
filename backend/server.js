import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import passport from 'passport'
import { connectDB } from './db.js'
import validateRouter from './routes/validate.js'
import authRouter from './routes/auth.js'
import bulkRouter from './routes/bulk.js'
import creditsRouter from './routes/credits.js'
import subscriptionsRouter from './routes/subscriptions.js'
import validationsRouter from './routes/validations.js'
import diagnosticRouter from './routes/diagnostic.js'
import pricingRouter from './routes/pricing.js'
import dashboardRouter from './routes/dashboard.js'
import { globalRateLimiter } from './middleware/rateLimiter.js'

// Load environment variables
dotenv.config()

const startServer = async () => {
  // Connect to MongoDB
  await connectDB()

  const app = express()
  const PORT = process.env.PORT || 4000

  // Middleware
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  )
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    })
  )
  app.disable('x-powered-by')

  app.use(express.json())

  // Initialize Passport
  app.use(passport.initialize())

  // Apply global rate limiter to all requests
  app.use(globalRateLimiter)

  // Routes
  app.use('/api', validateRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/bulk', bulkRouter)
  app.use('/api/credits', creditsRouter)
  app.use('/api/subscriptions', subscriptionsRouter)
  app.use('/api/validations', validationsRouter)
  app.use('/api/pricing', pricingRouter)
  app.use('/api/dashboard', dashboardRouter)

  // routes only available in development mode
  if (process.env.NODE_ENV === 'development') {
    app.use('/api/diagnostic', diagnosticRouter)
  }

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Valix API is running' })
  })

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found', message: 'Endpoint does not exist' })
  })

  // Error handler
  app.use((err, _req, res, _next) => {
    console.error('Server error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    })
  })

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`)
    console.log(`📧 Email validation API ready at http://localhost:${PORT}/api/validate`)
  })
}

startServer()
