import express from 'express';
import { validateEmail } from '../services/emailValidator.js';

const router = express.Router();

/**
 * POST /api/validate
 * Validates a single email address
 */
router.post('/validate', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate request
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Email address is required'
      });
    }

    // Validate email
    const result = await validateEmail(email);

    res.json(result);
  } catch (error) {
    console.error('Validation endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while validating the email'
    });
  }
});

export default router;
