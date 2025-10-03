import express from 'express'
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
} from '../services/validator/index.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { email, action } = req.body

    if (!email || !action) {
      return res.status(400).json({ error: 'Email and action are required' })
    }

    const [, domain] = email.split('@')

    let result
    switch (action) {
      case 'checkDns':
        result = await checkDns(domain)
        break
      case 'checkDomainAge':
        result = await checkDomainAge(domain)
        break
      case 'checkMxRecords':
        result = await checkMxRecords(domain)
        break
      case 'checkSmtp':
        result = await checkSmtp(email, domain, await checkMxRecords(domain))
        break
      case 'hasSuspiciousPatterns':
        result = hasSuspiciousPatterns(email, domain)
        break
      case 'isDisposable':
        result = isDisposable(domain, email)
        break
      case 'isFreeDomain':
        result = isFreeDomain(domain)
        break
      case 'isRoleAccount':
        result = isRoleAccount(email)
        break
      case 'validateSyntax':
        result = validateSyntax(email)
        break
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }

    res.json({ email, action, result })
  } catch (error) {
    console.error('Diagnostic error:', error)
    res.status(500).json({ error: 'Diagnostic failed' })
  }
})

export default router
