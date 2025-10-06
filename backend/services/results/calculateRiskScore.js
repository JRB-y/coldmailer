/**
 * Calculates risk score based on validation checks
 * Output: 0–100 (0 = safest, 100 = riskiest)
 *
 * Calibrated to industry standards (Kickbox, ZeroBounce, Emailable):
 * - Critical failures (syntax, DNS, MX, SMTP): ≥90
 * - High-risk (disposable, bad keywords): 60-80
 * - Moderate (new domain, suspicious patterns): 40-60
 * - Contextual (role accounts): 20-40
 * - Low impact (free email): 5-15
 *
 * Uses weighted scoring with diminishing returns for multiple factors.
 */
export function calculateRiskScore(checks) {
  // === CRITICAL FAILURES (≥90) ===
  // Hard failures that make email invalid/unreachable
  if (!checks.syntax) return 100
  if (!checks.dns) return 95
  if (!checks.mx) return 90
  if (process.env.ENABLE_SMTP_CHECK === 'true' && checks.smtp === null) return 90 // SMTP check inconclusive
  // if (checks.smtp === false) return 90 // Explicit SMTP rejection

  // === WEIGHTED RISK FACTORS ===
  const factors = []

  // High-risk indicators (60-80 range)
  if (checks.disposable) factors.push(75)
  if (checks.badKeywords) factors.push(65)

  // Moderate-risk indicators (40-60 range)
  const hasNewDomain = checks.domainAge?.isNew === true
  if (hasNewDomain && checks.suspiciousPattern) {
    factors.push(50) // Combined red flag
  } else if (hasNewDomain) {
    factors.push(40)
  } else if (checks.suspiciousPattern) {
    factors.push(35)
  }

  // Contextual risk (20-40 range)
  if (checks.roleAccount) factors.push(25)

  // Low-impact risk (5-15 range)
  if (checks.freeEmail) factors.push(10)

  // No risk factors present
  if (factors.length === 0) return 0

  // === COMPUTE WEIGHTED SCORE ===
  // Sort by severity (highest first)
  factors.sort((a, b) => b - a)

  // Primary factor contributes fully
  let score = factors[0]

  // Additional factors contribute with exponential decay
  // This prevents over-penalization while accounting for multiple issues
  for (let i = 1; i < factors.length; i++) {
    score += factors[i] * Math.pow(0.5, i)
  }

  // === NORMALIZATION ===
  // Apply soft sigmoid to smooth curve and ensure 0-100 bounds
  // Formula: 100 * tanh(score/60)
  const normalized = 100 * Math.tanh(score / 60)

  return Math.min(Math.round(normalized), 100)
}
