import {
  checkDomainAge,
  checkMxRecords,
  hasSuspiciousPatterns,
  isDisposable,
  isFreeDomain,
  isRoleAccount,
  validateSyntax,
} from '../services/validator/index.js'

import { runTests } from './simple.test.js'

// Mock validators object
const validators = {
  validateSyntax,
  isDisposable,
  isFreeDomain,
  isRoleAccount,
  hasSuspiciousPatterns,
  checkMxRecords,
  checkDomainAge,
}

// Run the tests
runTests(validators)
