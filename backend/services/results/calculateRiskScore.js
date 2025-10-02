/**
 * Calculates risk score based on validation checks
 * Score: 0-100 (0 = safest, 100 = riskiest)
 * Calibrated to match dataset expectations
 */
export function calculateRiskScore(checks) {
  let score = 0;

  // Critical failures
  if (!checks.syntax) return 100; // Invalid syntax = max risk
  if (!checks.dns) return 100; // No DNS = max risk
  if (!checks.mx) return 100; // No MX records = max risk (can't receive email)

  // High risk factors
  if (checks.disposable) score += 90; // Disposable email = very risky

  // Medium-high risk factors
  if (checks.domainAge?.isNew && checks.suspiciousPattern) {
    score += 50; // Both new domain AND suspicious pattern
  } else if (checks.domainAge?.isNew) {
    score += 30; // New domain alone
  } else if (checks.suspiciousPattern) {
    score += 20; // Suspicious pattern alone
  }

  // Medium risk factors
  if (checks.roleAccount) score += 20; // Role account = somewhat risky

  // Low risk factors
  if (checks.freeEmail) score += 10; // Free email = slightly risky

  return Math.min(score, 100);
}