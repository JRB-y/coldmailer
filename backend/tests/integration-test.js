import { validateEmail } from '../services/validator/index.js'

async function testIntegration() {
  console.log('Testing full validation flow...\n')

  const testCases = [
    { email: 'test@gmail.com', label: 'Free email' },
    { email: 'support@google.com', label: 'Corporate email' },
  ]

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.email} (${testCase.label})`)

    try {
      const result = await validateEmail(testCase.email)
      console.log('Results:')
      console.log(`  - Syntax: ${result.syntax}`)
      console.log(`  - DNS/MX: ${result.dns}`)
      console.log(`  - SMTP: ${result.smtp}`)
      console.log(`  - Free Email: ${result.freeEmail}`)
      console.log(`  - Disposable: ${result.disposable}`)
      console.log(`  - Role Account: ${result.roleAccount}`)
    } catch (error) {
      console.log(`Error: ${error.message}`)
    }

    console.log('---\n')
  }
}

testIntegration()
  .then(() => {
    console.log('Integration tests completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Test failed:', error)
    process.exit(1)
  })
