/**
 * Integration test for Domain Age with Risk Scoring
 * Run with: node tests/domainAge.integration.test.js
 */

import { calculateRiskScore } from '../services/results/calculateRiskScore.js'
import { generateReason } from '../services/results/generateReason.js'

console.log('🧪 Testing Domain Age Integration with Risk Scoring...\n')

// Test cases with different domain age scenarios
const testCases = [
  {
    name: 'New domain (< 90 days)',
    checks: {
      syntax: true,
      dns: true,
      mx: true,
      smtp: true,
      disposable: false,
      freeEmail: false,
      roleAccount: false,
      domainAge: { isNew: true, ageInDays: 30, status: 'success' },
      suspiciousPattern: false,
      badKeywords: false,
    },
    expectedMinScore: 30,
    expectedMaxScore: 30,
    shouldMentionDomainAge: false, // Status is 'valid', so no reason is generated
  },
  {
    name: 'Old domain (> 90 days)',
    checks: {
      syntax: true,
      dns: true,
      mx: true,
      smtp: true,
      disposable: false,
      freeEmail: false,
      roleAccount: false,
      domainAge: { isNew: false, ageInDays: 365, status: 'success' },
      suspiciousPattern: false,
      badKeywords: false,
    },
    expectedMinScore: 0,
    expectedMaxScore: 0,
    shouldMentionDomainAge: false,
  },
  {
    name: 'Unknown domain age (API error)',
    checks: {
      syntax: true,
      dns: true,
      mx: true,
      smtp: true,
      disposable: false,
      freeEmail: false,
      roleAccount: false,
      domainAge: { isNew: 'unknown', ageInDays: null, status: 'timeout' },
      suspiciousPattern: false,
      badKeywords: false,
    },
    expectedMinScore: 0,
    expectedMaxScore: 0,
    shouldMentionDomainAge: false,
  },
  {
    name: 'Unknown domain age (not configured)',
    checks: {
      syntax: true,
      dns: true,
      mx: true,
      smtp: true,
      disposable: false,
      freeEmail: false,
      roleAccount: false,
      domainAge: { isNew: 'unknown', ageInDays: null, status: 'not_configured' },
      suspiciousPattern: false,
      badKeywords: false,
    },
    expectedMinScore: 0,
    expectedMaxScore: 0,
    shouldMentionDomainAge: false,
  },
  {
    name: 'New domain + suspicious pattern',
    checks: {
      syntax: true,
      dns: true,
      mx: true,
      smtp: true,
      disposable: false,
      freeEmail: false,
      roleAccount: false,
      domainAge: { isNew: true, ageInDays: 15, status: 'success' },
      suspiciousPattern: true,
      badKeywords: false,
    },
    expectedMinScore: 50,
    expectedMaxScore: 50,
    shouldMentionDomainAge: true,
  },
  {
    name: 'Unknown domain age + suspicious pattern',
    checks: {
      syntax: true,
      dns: true,
      mx: true,
      smtp: true,
      disposable: false,
      freeEmail: false,
      roleAccount: false,
      domainAge: { isNew: 'unknown', ageInDays: null, status: 'error' },
      suspiciousPattern: true,
      badKeywords: false,
    },
    expectedMinScore: 20,
    expectedMaxScore: 20,
    shouldMentionDomainAge: false,
  },
  {
    name: 'Null domain age (DNS failed)',
    checks: {
      syntax: true,
      dns: false,
      mx: false,
      smtp: false,
      disposable: false,
      freeEmail: false,
      roleAccount: false,
      domainAge: null,
      suspiciousPattern: false,
      badKeywords: false,
    },
    expectedMinScore: 100,
    expectedMaxScore: 100,
    shouldMentionDomainAge: false,
  },
]

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  const score = calculateRiskScore(testCase.checks)
  const status = score >= 70 ? 'invalid' : score >= 40 ? 'risky' : 'valid'
  const reason = generateReason(status, testCase.checks)

  const scoreInRange = score >= testCase.expectedMinScore && score <= testCase.expectedMaxScore
  const domainAgeMentioned = reason.includes('Recently created domain')
  const domainAgeCorrect = domainAgeMentioned === testCase.shouldMentionDomainAge

  const testPassed = scoreInRange && domainAgeCorrect

  if (testPassed) {
    console.log(`✅ Test ${index + 1}: ${testCase.name}`)
    console.log(`   Score: ${score}, Status: ${status}`)
    if (reason) console.log(`   Reason: ${reason}`)
    passed++
  } else {
    console.log(`❌ Test ${index + 1}: ${testCase.name}`)
    console.log(`   Expected score: ${testCase.expectedMinScore}-${testCase.expectedMaxScore}`)
    console.log(`   Got score: ${score}`)
    console.log(`   Domain age mentioned: ${domainAgeMentioned} (expected: ${testCase.shouldMentionDomainAge})`)
    console.log(`   Reason: ${reason}`)
    failed++
  }
  console.log()
})

console.log(`📊 Results: ${passed} passed, ${failed} failed\n`)

if (failed > 0) {
  console.log('❌ Some tests failed')
  process.exit(1)
} else {
  console.log('✨ All integration tests passed!')
  console.log('\n📝 Summary:')
  console.log('  - New domains (< 90 days) increase risk score by 30')
  console.log('  - Unknown domain age is ignored (no impact on score)')
  console.log('  - API errors/timeouts fail-safe to unknown')
  console.log('  - Risk scoring continues to work even without domain age data')
  process.exit(0)
}
