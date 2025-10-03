import { validateEmail } from '../services/validator/index.js'
import { calculateRiskScore, determineStatus, generateReason } from '../services/results/index.js'

async function testValidationFixes() {
  console.log('Testing Validation Logic Fixes...\n')
  console.log('='.repeat(80))

  const testCases = [
    {
      email: 'testuser@example.com',
      description: 'Domain exists but has no MX records',
      expected: {
        syntax: true,
        dns: true,
        mx: false,
        status: 'invalid',
        riskScore: 100,
      },
    },
    {
      email: 'user@nonexistentdomain9999.com',
      description: 'Domain does not exist',
      expected: {
        syntax: true,
        dns: false,
        mx: false,
        status: 'invalid',
        riskScore: 100,
      },
    },
    {
      email: 'john@gmail.com',
      description: 'Valid Gmail address',
      expected: {
        syntax: true,
        dns: true,
        mx: true,
        freeEmail: true,
        disposable: false,
        roleAccount: false,
        status: 'valid',
        riskScore: 10,
      },
    },
  ]

  for (const testCase of testCases) {
    console.log(`\nTest Case: ${testCase.email}`)
    console.log(`Description: ${testCase.description}`)
    console.log('-'.repeat(80))

    try {
      const checks = await validateEmail(testCase.email)
      const riskScore = calculateRiskScore(checks)
      const status = determineStatus(checks, riskScore)
      const reason = generateReason(status, checks)

      console.log('\nResults:')
      console.log(`  ✓ Format Valid: ${checks.syntax ? 'Pass' : 'Fail'}`)
      console.log(`  ${checks.dns ? '✓' : '✗'} DNS Valid: ${checks.dns ? 'Pass' : 'Fail'}`)
      console.log(`  ${checks.mx ? '✓' : '✗'} MX Records: ${checks.mx ? 'Pass' : 'Fail'}`)
      console.log(
        `  ${checks.smtp ? '✓' : '?'} SMTP Valid: ${checks.smtp ? 'Pass' : checks.mx ? 'Fail' : 'N/A'}`
      )
      console.log(
        `  ${!checks.disposable ? '✓' : '✗'} Not Disposable: ${!checks.disposable ? 'Pass' : 'Fail'}`
      )
      console.log(
        `  ${!checks.freeEmail ? '✓' : '✗'} Not Free Domain: ${!checks.freeEmail ? 'Pass' : 'Fail'}`
      )
      console.log(
        `  ${!checks.roleAccount ? '✓' : '✗'} Not Role Account: ${!checks.roleAccount ? 'Pass' : 'Fail'}`
      )
      console.log(
        `  ${checks.domainAge && !checks.domainAge.isNew && !checks.suspiciousPattern ? '✓' : checks.dns ? '✗' : '?'} Domain Age/Pattern: ${checks.domainAge && !checks.domainAge.isNew && !checks.suspiciousPattern ? 'Pass' : checks.dns ? 'Fail' : 'N/A'}`
      )

      console.log(`\n  Status: ${status.toUpperCase()}`)
      console.log(`  Risk Score: ${riskScore}/100`)
      if (reason) console.log(`  Reason: ${reason}`)

      // Validation
      console.log('\nValidation:')
      let allPassed = true

      if (testCase.expected.syntax !== undefined && checks.syntax !== testCase.expected.syntax) {
        console.log(`  ✗ Syntax: Expected ${testCase.expected.syntax}, got ${checks.syntax}`)
        allPassed = false
      }

      if (testCase.expected.dns !== undefined && checks.dns !== testCase.expected.dns) {
        console.log(`  ✗ DNS: Expected ${testCase.expected.dns}, got ${checks.dns}`)
        allPassed = false
      }

      if (testCase.expected.mx !== undefined && checks.mx !== testCase.expected.mx) {
        console.log(`  ✗ MX: Expected ${testCase.expected.mx}, got ${checks.mx}`)
        allPassed = false
      }

      if (
        testCase.expected.freeEmail !== undefined &&
        checks.freeEmail !== testCase.expected.freeEmail
      ) {
        console.log(
          `  ✗ Free Email: Expected ${testCase.expected.freeEmail}, got ${checks.freeEmail}`
        )
        allPassed = false
      }

      if (
        testCase.expected.disposable !== undefined &&
        checks.disposable !== testCase.expected.disposable
      ) {
        console.log(
          `  ✗ Disposable: Expected ${testCase.expected.disposable}, got ${checks.disposable}`
        )
        allPassed = false
      }

      if (
        testCase.expected.roleAccount !== undefined &&
        checks.roleAccount !== testCase.expected.roleAccount
      ) {
        console.log(
          `  ✗ Role Account: Expected ${testCase.expected.roleAccount}, got ${checks.roleAccount}`
        )
        allPassed = false
      }

      if (testCase.expected.status !== undefined && status !== testCase.expected.status) {
        console.log(`  ✗ Status: Expected ${testCase.expected.status}, got ${status}`)
        allPassed = false
      }

      if (testCase.expected.riskScore !== undefined && riskScore !== testCase.expected.riskScore) {
        console.log(`  ✗ Risk Score: Expected ${testCase.expected.riskScore}, got ${riskScore}`)
        allPassed = false
      }

      if (allPassed) {
        console.log(`  ✓ All checks passed!`)
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`)
    }

    console.log('='.repeat(80))
  }

  console.log('\n✓ Test suite completed!\n')
}

testValidationFixes()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Test failed:', error)
    process.exit(1)
  })
