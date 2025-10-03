export function hasSuspiciousPatterns(email, domain) {
  const [localPart] = email.split('@')

  // Check for overly random local part (like npaagpqyldgwxkbczu)
  const randomnessScore = calculateRandomness(localPart)
  if (randomnessScore > 0.8) return true // 80% random TODO: verify threshold to be good and not too strict or lenient (needs to be the best in the world)

  // Check for very short domains
  if (domain.length < 6 && !freeEmailProviders.includes(domain)) return true

  // Check for numeric-heavy domains
  const digitRatio = (domain.match(/\d/g) || []).length / domain.length
  if (digitRatio > 0.3) return true

  return false
}

function calculateRandomness(str) {
  // Remove common patterns
  str = str.toLowerCase()
  // Check for dictionary words
  const hasCommonWords = /^(test|demo|user|admin|john|jane|hello|contact)/i.test(str)
  if (hasCommonWords) return 0
  // Calculate entropy
  const chars = str.split('')
  const freq = {}
  chars.forEach((char) => (freq[char] = (freq[char] || 0) + 1))

  let entropy = 0
  for (let char in freq) {
    const p = freq[char] / str.length
    entropy -= p * Math.log2(p)
  }

  // Normalize entropy (max entropy for length)
  const maxEntropy = Math.log2(26) // assuming lowercase letters
  return Math.min(entropy / maxEntropy, 1)
}
