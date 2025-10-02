import { checkSmtp } from '../services/validator/checkSmtp.js';
import { checkMxRecords } from '../services/validator/checkMxRecords.js';

async function testSmtp() {
  console.log('Testing SMTP validation...\n');

  const testCases = [
    { email: 'test@gmail.com', domain: 'gmail.com', expected: 'should fail (mailbox doesn\'t exist)' },
    { email: 'support@google.com', domain: 'google.com', expected: 'likely true or uncertain' },
    { email: 'nonexistent@yahoo.com', domain: 'yahoo.com', expected: 'should fail' },
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.email}`);
    console.log(`Expected: ${testCase.expected}`);

    try {
      // Get MX records first (no duplicate resolution)
      const mxRecords = await checkMxRecords(testCase.domain);
      console.log(`MX Records: ${mxRecords ? mxRecords.map(r => r.exchange).join(', ') : 'none'}`);

      // Pass MX records to SMTP check
      const result = await checkSmtp(testCase.email, testCase.domain, mxRecords);
      console.log(`Result: ${result}`);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }

    console.log('---\n');
  }
}

testSmtp().then(() => {
  console.log('Tests completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
