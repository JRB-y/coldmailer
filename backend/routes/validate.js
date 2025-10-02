import express from 'express';
import { validateEmail } from '../services/validator/index.js';
import { getRiskScore } from '../services/results/index.js';

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
    const checks = await validateEmail(email);

    const { riskScore, status, reason } = getRiskScore(checks);

    res.json({
      email,
      isValid: status === 'valid',
      status,
      riskScore,
      checks,
      reason,
    });
  } catch (error) {
    console.error('Validation endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while validating the email'
    });
  }
});

export default router;
