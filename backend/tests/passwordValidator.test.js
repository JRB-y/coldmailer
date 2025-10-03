/**
 * Simple test for password validator
 * Run with: node tests/passwordValidator.test.js
 */

import { validatePassword } from '../utils/passwordValidator.js'

const testCases = [
  {
    password: 'Short1!',
    expected: false,
    description: 'Too short (< 10 characters)',
  },
  {
    password: 'alllowercase123!',
    expected: false,
    description: 'No uppercase letter',
  },
  {
    password: 'ALLUPPERCASE!',
    expected: false,
    description: 'No number',
  },
  {
    password: 'NoSymbols123ABC',
    expected: false,
    description: 'No symbol',
  },
  {
    password: 'password123!',
    expected: false,
    description: 'Common password (blacklisted)',
  },
  {
    password: 'Password123!',
    expected: false,
    description: 'Common password variant (blacklisted)',
  },
  {
    password: 'ValidPass123!',
    expected: true,
    description: 'Valid password',
  },
  {
    password: 'MySecure#Pass2024',
    expected: true,
    description: 'Valid complex password',
  },
  {
    password: 'Str0ng!P@ssw0rd',
    expected: true,
    description: 'Valid password with multiple symbols',
  },
]

console.log('🧪 Running Password Validator Tests...\n')

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  const result = validatePassword(testCase.password)
  const testPassed = result.valid === testCase.expected

  if (testPassed) {
    console.log(`✅ Test ${index + 1}: ${testCase.description}`)
    passed++
  } else {
    console.log(`❌ Test ${index + 1}: ${testCase.description}`)
    console.log(`   Password: "${testCase.password}"`)
    console.log(`   Expected: ${testCase.expected ? 'valid' : 'invalid'}`)
    console.log(`   Got: ${result.valid ? 'valid' : 'invalid'}`)
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join(', ')}`)
    }
    failed++
  }
})

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exit(1)
} else {
  console.log('✨ All tests passed!')
  process.exit(0)
}
