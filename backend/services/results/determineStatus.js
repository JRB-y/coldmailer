/**
 * Determines overall status based on checks and risk score
 *
 * Mapping (calibrated to industry standards):
 * - 0-30:   valid   (safe to send)
 * - 30-70:  risky   (use with caution)
 * - 70-100: invalid (do not send)
 *
 * Targets:
 * - <5% legit Gmail flagged >50
 * - 90% disposables flagged >70
 * - 95% invalid MX/DNS/syntax ≥90
 */
export function determineStatus(checks, riskScore) {
  // Critical failures always map to invalid
  if (!checks.syntax || !checks.dns || !checks.mx) {
    return 'invalid'
  }

  // Map risk score to status using industry-standard thresholds
  if (riskScore >= 70) return 'invalid'
  if (riskScore >= 30) return 'risky'
  return 'valid'
}
