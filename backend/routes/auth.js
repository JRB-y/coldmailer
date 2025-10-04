import express from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'
import {
  checkLoginLockout,
  recordFailedLogin,
  resetFailedLogin,
} from '../middleware/loginLockout.js'
import { validatePassword, getPasswordRequirements } from '../utils/passwordValidator.js'

dotenv.config()

const router = express.Router()

const googleAuthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

// Configure Google OAuth Strategy
if (googleAuthEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await User.findOne({ googleId: profile.id })

          if (!user) {
            // Check if user exists with this email
            user = await User.findOne({ email: profile.emails[0].value.toLowerCase() })

            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id
              await user.save()
            } else {
              // Create new user
              user = new User({
                email: profile.emails[0].value.toLowerCase(),
                googleId: profile.id,
              })
              await user.save()
            }
          }

          done(null, user)
        } catch (error) {
          done(error, null)
        }
      }
    )
  )
}

// GET /api/auth/password-requirements - Get password policy
router.get('/password-requirements', (req, res) => {
  res.json(getPasswordRequirements())
})

// POST /api/auth/register - User registration
router.post('/register', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Validate password against policy
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors,
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      // default credit is set in the User model
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        credits: user.credits,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login - User login
router.post('/login', authRateLimiter, checkLoginLockout, async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Record failed login attempt
      const lockoutInfo = recordFailedLogin(req)
      const response = { error: 'Invalid email or password' }

      // Add warning if approaching lockout
      if (lockoutInfo.remainingAttempts > 0 && lockoutInfo.remainingAttempts <= 2) {
        response.warning = `${lockoutInfo.remainingAttempts} attempt${lockoutInfo.remainingAttempts > 1 ? 's' : ''} remaining before temporary lockout`
      }

      return res.status(401).json(response)
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      // Record failed login attempt
      const lockoutInfo = recordFailedLogin(req)
      const response = { error: 'Invalid email or password' }

      // Add warning if approaching lockout
      if (lockoutInfo.remainingAttempts > 0 && lockoutInfo.remainingAttempts <= 2) {
        response.warning = `${lockoutInfo.remainingAttempts} attempt${lockoutInfo.remainingAttempts > 1 ? 's' : ''} remaining before temporary lockout`
      }

      return res.status(401).json(response)
    }

    // Reset failed login attempts on successful login
    resetFailedLogin(req)

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        credits: user.credits,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        credits: req.user.credits,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user information' })
  }
})

// POST /api/auth/logout - Logout (optional - JWT is stateless)
router.post('/logout', authenticate, (req, res) => {
  // With JWT, logout is typically handled client-side by removing the token
  res.json({ message: 'Logout successful. Please remove the token from client.' })
})

// Google OAuth routes
if (googleAuthEnabled) {
  // GET /api/auth/google - Initiate Google OAuth
  router.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })
  )

  // GET /api/auth/google/callback - Google OAuth callback
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }),
    (req, res) => {
      try {
        // Generate JWT token
        const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        })

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
      } catch (error) {
        console.error('Google callback error:', error)
        res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=auth_failed`
        )
      }
    }
  )
} else {
  router.get('/google', (req, res) => {
    res.status(503).json({ error: 'Google OAuth is not configured' })
  })

  router.get('/google/callback', (req, res) => {
    res.status(503).json({ error: 'Google OAuth is not configured' })
  })
}

export default router
