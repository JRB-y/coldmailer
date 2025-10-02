/**
 * Determines overall status based on checks and risk score
 * Calibrated to match dataset expectations
 */
export function determineStatus(checks, riskScore) {
  // Invalid only if critical checks fail
  if (!checks.syntax || !checks.dns || !checks.mx) return 'invalid';

  // Risky if score is moderate to high (60+)
  if (riskScore >= 60) return 'risky';

  // Valid for everything else
  return 'valid';
}
