/**
 * Determines overall status based on checks and risk score
 */
export function determineStatus(checks, riskScore) {
  if (!checks.syntax || !checks.dns) return 'invalid';
  if (checks.disposable || checks.suspiciousPattern || riskScore >= 70) return 'risky';
  if (riskScore < 30) return 'valid';
  return 'risky';
}
