/**
 * Calculates risk score based on validation checks
 * Score: 0-100 (0 = safest, 100 = riskiest)
 */
export function calculateRiskScore(checks) {
  let score = 0;

  if (!checks.syntax) score += 100; // Invalid syntax = max risk
  if (!checks.dns) score += 50; // No DNS/MX = very risky
  if (checks.disposable) score += 90; // Disposable email = very risky
  if (checks.domainAge?.isNew) score += 40; // NEW
  if (checks.suspiciousPattern) score += 35; // NEW
  if (checks.roleAccount) score += 30; // Role account = somewhat risky
  if (checks.freeEmail) score += 10; // Free email = slightly risky

  return Math.min(score, 100);
}