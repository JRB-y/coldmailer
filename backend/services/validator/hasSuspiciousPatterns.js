import { freeEmailProvider } from './isFreeDomain.js'

// Detect suspicious or fake-looking email patterns
export function hasSuspiciousPatterns(email, domain) {
  const [localPart] = email.split('@').map((p) => p.toLowerCase())

  const randomnessScore = calculateRandomness(localPart)
  const repetitionScore = repetitionFactor(localPart)
  const vowelRatio = (localPart.match(/[aeiou]/g) || []).length / localPart.length

  // Core heuristics
  if (randomnessScore > 0.8) return true // too random (e.g., xj93kdqg7)
  if (repetitionScore > 0.3) return true // too repetitive (e.g., fsdfsdfsd)
  if (vowelRatio < 0.2 && localPart.length > 8) return true // unnatural consonant cluster
  if (isNumericSuspicious(localPart)) return true // numeric anomalies

  // Domain-level checks
  if (domain.length < 6 && !freeEmailProviders.includes(domain)) return true
  const digitRatio = (domain.match(/\d/g) || []).length / domain.length
  if (digitRatio > 0.3) return true

  return false
}

// --- Helper functions ---

function calculateRandomness(str) {
  // Shannon entropy normalized between 0–1
  const freq = {}
  for (const c of str) freq[c] = (freq[c] || 0) + 1
  let entropy = 0
  for (const c in freq) {
    const p = freq[c] / str.length
    entropy -= p * Math.log2(p)
  }
  const maxEntropy = Math.log2(26) // assuming lowercase a–z
  return Math.min(entropy / maxEntropy, 1)
}

function repetitionFactor(str) {
  // Detect repeated consecutive characters (like fsdfsdfsd)
  let repeats = 0
  for (let i = 1; i < str.length; i++) {
    if (str[i] === str[i - 1]) repeats++
  }
  return repeats / str.length
}

function isNumericSuspicious(localPart) {
  const digitGroups = localPart.match(/\d+/g) || []

  // No digits → fine
  if (digitGroups.length === 0) return false

  // Single numeric group that looks like a birth year → fine
  if (digitGroups.length === 1) {
    const num = parseInt(digitGroups[0], 10)
    if (num >= 1900 && num <= 2099) return false
  }

  // Long numeric runs (>4 digits) → suspicious
  if (digitGroups.some((g) => g.length > 4)) return true

  // Multiple separate numeric groups → suspicious (e.g. usr23test45)
  if (digitGroups.length > 1) return true

  // Single short group but overall local part too short → suspicious
  if (digitGroups.length === 1 && localPart.length < 6) return true

  return false
}
