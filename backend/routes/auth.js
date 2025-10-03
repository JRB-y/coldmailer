import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'
import {
  checkLoginLockout,
  recordFailedLogin,
  resetFailedLogin,
} from '../middleware/loginLockout.js'

const router = express.Router()

// POST /api/auth/register - User registration
router.post('/register', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
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

export default router
