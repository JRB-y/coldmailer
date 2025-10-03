import rateLimit from 'express-rate-limit'

/**
 * Rate limiter middleware factory
 * Creates rate limiters with configurable options for different endpoints
 */

/**
 * Key generator that supports both IP-based and user-based rate limiting
 */
const createKeyGenerator = (mode = 'ip') => {
  return (req) => {
    if (mode === 'user' && req.user?._id) {
      // For authenticated routes, rate limit by user ID
      return `user:${req.user._id}`
    }

    // Default to IP-based rate limiting using the helper to correctly
    // normalise IPv4/IPv6 (including forwarded headers when trust proxy is set)
    const ipKey =
      typeof rateLimit.ipKeyGenerator === 'function'
        ? rateLimit.ipKeyGenerator(req)
        : req.ip ||
          req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
          req.connection.remoteAddress

    return `ip:${ipKey}`
  }
}

/**
 * Standard rate limit handler - returns 429 with clear message
 */
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: req.rateLimit.resetTime
      ? new Date(req.rateLimit.resetTime).toISOString()
      : undefined,
  })
}

/**
 * Global rate limiter - applies to all requests
 * Generous limits to prevent overwhelming the server
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Max 1000 requests per window per IP
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: createKeyGenerator('ip'),
  handler: rateLimitHandler,
  message: 'Too many requests from this IP, please try again later',
})

/**
 * Strict rate limiter for authentication endpoints
 * Protects against credential stuffing and brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 login/register attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator('ip'),
  handler: rateLimitHandler,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  message: 'Too many authentication attempts, please try again later',
})

/**
 * Moderate rate limiter for validation endpoints
 * Prevents abuse while allowing legitimate high-volume usage
 */
export const validationRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Max 60 validations per minute per user
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator('user'), // Rate limit by user ID when authenticated
  handler: rateLimitHandler,
  skipFailedRequests: true, // Don't count failed requests (already handled by auth)
  message: 'Too many validation requests, please slow down',
})

/**
 * Very strict rate limiter for bulk upload endpoint
 * Bulk operations are resource-intensive and should be limited
 */
export const bulkUploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 bulk uploads per hour per user
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator('user'),
  handler: rateLimitHandler,
  skipFailedRequests: true,
  message: 'Too many bulk upload requests, please try again later',
})

/**
 * Moderate rate limiter for bulk job queries
 * Prevents excessive polling of job status
 */
export const bulkJobRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Max 30 job queries per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator('user'),
  handler: rateLimitHandler,
  message: 'Too many job status requests, please slow down',
})

/**
 * Factory function to create custom rate limiters
 * @param {Object} options - Rate limiter configuration
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.mode - 'ip' or 'user' based rate limiting
 * @param {string} options.message - Custom error message
 */
export const createRateLimiter = ({
  windowMs,
  max,
  mode = 'ip',
  message = 'Rate limit exceeded',
}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: createKeyGenerator(mode),
    handler: rateLimitHandler,
    message,
  })
}
