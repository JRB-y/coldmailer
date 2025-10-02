/**
 * Generates reason message based on validation results
 */
export function generateReason(status, checks) {
  if (status === 'valid') return '';

  const reasons = [];
  if (!checks.syntax) reasons.push('Invalid email syntax');
  if (!checks.dns) reasons.push('Domain has no valid MX records');
  if (checks.disposable) reasons.push('Disposable email address');
  if (checks.suspiciousPattern) reasons.push('Suspicious email pattern detected');
  if (checks.domainAge?.isNew) reasons.push('Recently created domain (less than 90 days)');
  if (checks.roleAccount && status === 'risky') reasons.push('Role-based email account');

  return reasons.join(', ');
}
