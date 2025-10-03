import { validateEmail } from '../services/validator/index.js'
import { calculateRiskScore, determineStatus, generateReason } from '../services/results/index.js'

/**
 * Quick test for example.com - the classic case
 * Domain exists (has DNS) but no MX records (can't receive email)
 */
async function testExampleCom() {
  console.log('Testing example.com validation...\n')

  const email = 'test@example.com'

  const checks = await validateEmail(email)
  const riskScore = calculateRiskScore(checks)
  const status = determineStatus(checks, riskScore)
  const reason = generateReason(status, checks)

  console.log(`Email: ${email}`)
  console.log('='.repeat(60))
  console.log(`\n✓ Format Valid: ${checks.syntax ? 'Pass' : 'Fail'}`)
  console.log(
    `${checks.dns ? '✓' : '✗'} DNS Valid: ${checks.dns ? 'Pass' : 'Fail'} (Domain exists: ${checks.dns ? 'YES' : 'NO'})`
  )
  console.log(
    `${checks.mx ? '✓' : '✗'} MX Records: ${checks.mx ? 'Pass' : 'Fail'} (Can receive email: ${checks.mx ? 'YES' : 'NO'})`
  )
  console.log(`\nStatus: ${status.toUpperCase()}`)
  console.log(`Risk Score: ${riskScore}/100`)
  if (reason) console.log(`Reason: ${reason}`)

  console.log('\n' + '='.repeat(60))

  // Validation
  if (checks.dns && !checks.mx && status === 'invalid' && riskScore === 100) {
    console.log(
      '\n✅ SUCCESS: example.com correctly shows DNS=Pass, MX=Fail, Status=Invalid, Risk=100'
    )
    console.log('   This proves DNS and MX are properly separated!')
  } else {
    console.log('\n❌ FAILURE: Unexpected results')
    console.log(`   Expected: DNS=true, MX=false, status=invalid, risk=100`)
    console.log(`   Got: DNS=${checks.dns}, MX=${checks.mx}, status=${status}, risk=${riskScore}`)
  }
}

testExampleCom()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Test failed:', error)
    process.exit(1)
  })
