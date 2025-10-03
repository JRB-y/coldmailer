import { determineStatus } from './determineStatus.js'
import { generateReason } from './generateReason.js'
import { calculateRiskScore } from './calculateRiskScore.js'

export { determineStatus, generateReason, calculateRiskScore }

export function getRiskScore(checks) {
  const riskScore = calculateRiskScore(checks)
  const status = determineStatus(checks, riskScore)
  const reason = generateReason(status, checks)

  return {
    reason,
    status,
    riskScore,
  }
}
