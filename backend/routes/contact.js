import express from 'express'
import jwt from 'jsonwebtoken'
import Contact from '../models/Contact.js'
import User from '../models/User.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {}

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' })
    }

    let userId = null

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const jwtSecret = process.env.JWT_SECRET
        if (jwtSecret) {
          const decoded = jwt.verify(token, jwtSecret)
          if (decoded && decoded.userId) {
            const user = await User.findById(decoded.userId).select('_id')
            if (user) {
              userId = user._id
            }
          }
        }
      } catch (err) {
        console.warn('Optional auth check failed for contact form:', err?.message || err)
      }
    }

    const contact = await Contact.create({
      userId,
      name,
      email,
      subject: subject || '',
      message,
    })

    res.status(201).json({
      message: 'Contact request received successfully.',
      contactId: contact._id,
    })
  } catch (err) {
    console.error('Failed to create contact request:', err)
    res.status(500).json({ error: 'Failed to submit contact request.' })
  }
})

export default router
