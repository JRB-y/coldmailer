export function validateSyntax(email) {
  // RFC 5322 compliant regex (simplified but more robust)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email)) return false

  // Additional checks
  const [localPart, domain] = email.split('@')

  // Local part checks
  if (localPart.length > 64) return false // RFC 5321
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false
  if (localPart.includes('..')) return false // No consecutive dots

  // Domain checks
  if (domain.length > 255) return false // RFC 5321
  const tld = domain.split('.').pop()
  if (tld.length < 2) return false // TLD must be at least 2 chars

  return true
}
