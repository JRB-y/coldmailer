/**
 * Password Validation Utility
 * Enforces strong password policy
 */

// Common passwords blacklist (top weak passwords)
const BLACKLISTED_PASSWORDS = new Set([
  'password',
  'password123',
  'password1234',
  'password123!',
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty',
  'qwertyuiop',
  'qwerty123',
  'abc123',
  'abcdefgh',
  'password!',
  'Password1',
  'Password123',
  'password123!',
  'Welcome1',
  'Welcome123',
  'welcome123!',
  'Admin123',
  'admin123',
  'admin123!',
  'letmein',
  'monkey',
  'dragon',
  'master',
  'sunshine',
  'princess',
  'iloveyou',
  '123123',
  'welcome',
  'login',
  'passw0rd',
  'football',
  'baseball',
  'starwars',
])

/**
 * Password policy configuration
 */
const PASSWORD_POLICY = {
  minLength: 10,
  requireUppercase: true,
  requireNumber: true,
  requireSymbol: true,
}

/**
 * Validate password against policy
 * @param {string} password - The password to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = []

  // Check if password exists
  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      errors: ['Password is required'],
    }
  }

  // Check minimum length
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`)
  }

  // Check for uppercase letter
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  // Check for number
  if (PASSWORD_POLICY.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  // Check for symbol/special character
  if (PASSWORD_POLICY.requireSymbol && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one symbol ( )')
  }

  // Check against blacklist (case-insensitive)
  if (BLACKLISTED_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common and cannot be used')
  }

  // Check for simple patterns
  if (/^(.)\1+$/.test(password)) {
    // All same character (e.g., "aaaaaaaaaa")
    errors.push('Password cannot consist of repeating characters')
  }

  if (
    /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+$/i.test(
      password
    )
  ) {
    // Sequential patterns
    errors.push('Password cannot consist of sequential characters')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get password requirements for display
 * @returns {Object} - Requirements object
 */
export const getPasswordRequirements = () => {
  return {
    minLength: PASSWORD_POLICY.minLength,
    requireUppercase: PASSWORD_POLICY.requireUppercase,
    requireNumber: PASSWORD_POLICY.requireNumber,
    requireSymbol: PASSWORD_POLICY.requireSymbol,
    requirements: [
      `At least ${PASSWORD_POLICY.minLength} characters long`,
      'At least one uppercase letter (A-Z)',
      'At least one number (0-9)',
      'At least one symbol ( )',
      'Not a common or weak password',
    ],
  }
}

/**
 * Check individual password requirements for real-time feedback
 * @param {string} password - The password to check
 * @returns {Object} - Status of each requirement
 */
export const checkPasswordRequirements = (password) => {
  if (!password) {
    return {
      length: false,
      uppercase: false,
      number: false,
      symbol: false,
      notCommon: false,
    }
  }

  return {
    length: password.length >= PASSWORD_POLICY.minLength,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notCommon: !BLACKLISTED_PASSWORDS.has(password.toLowerCase()),
  }
}
