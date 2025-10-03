import express from 'express';
import {
  checkDns,
  checkDomainAge,
  checkMxRecords,
  checkSmtp,
  hasSuspiciousPatterns,
  isDisposable,
  isFreeDomain,
  isRoleAccount,
  validateSyntax,
} from '../services/validator/index.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, action } = req.body;

    if (!email || !action) {
      return res.status(400).json({ error: 'Email and action are required' });
    }

    let result;
    switch (action) {
      case 'checkDns':
        result = await checkDns(email);
        break;
      case 'checkDomainAge':
        result = await checkDomainAge(email);
        break;
      case 'checkMxRecords':
        result = await checkMxRecords(email);
        break;
      case 'checkSmtp':
        result = await checkSmtp(email);
        break;
      case 'hasSuspiciousPatterns':
        result = hasSuspiciousPatterns(email);
        break;
      case 'isDisposable':
        result = isDisposable(email);
        break;
      case 'isFreeDomain':
        result = isFreeDomain(email);
        break;
      case 'isRoleAccount':
        result = isRoleAccount(email);
        break;
      case 'validateSyntax':
        result = validateSyntax(email);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ email, action, result });
  } catch (error) {
    console.error('Diagnostic error:', error);
    res.status(500).json({ error: 'Diagnostic failed' });
  }
});

export default router;
