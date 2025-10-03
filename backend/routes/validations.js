import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Validation from '../models/Validation.js';

const router = express.Router();

/**
 * GET /api/validations
 * Get user's validation history (paginated)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const validations = await Validation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Validation.countDocuments({ userId: req.user._id });

    res.json({
      validations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get validations error:', error);
    res.status(500).json({ error: 'Failed to retrieve validation history' });
  }
});

/**
 * GET /api/validations/:id
 * Get single validation details
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const validation = await Validation.findOne({
      _id: req.params.id,
      userId: req.user._id, // Ensure user owns this validation
    }).select('-__v');

    if (!validation) {
      return res.status(404).json({ error: 'Validation not found' });
    }

    res.json({ validation });
  } catch (error) {
    console.error('Get validation error:', error);
    res.status(500).json({ error: 'Failed to retrieve validation' });
  }
});

export default router;
