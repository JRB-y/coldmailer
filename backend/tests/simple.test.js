// Test cases for email validation system

const testCases = {
  // 1. validateSyntax.js - Basic email format validation
  syntaxTests: [
    {
      email: 'valid@example.com',
      domain: 'example.com',
      expected: true,
      description: 'Valid standard email',
    },
    {
      email: 'user.name@company.co.uk',
      domain: 'company.co.uk',
      expected: true,
      description: 'Valid with dot in local part',
    },
    {
      email: 'test_user+tag@domain.org',
      domain: 'domain.org',
      expected: true,
      description: 'Valid with underscore and plus',
    },
    { email: 'invalid@', domain: '', expected: false, description: 'Missing domain' },
    {
      email: '@example.com',
      domain: 'example.com',
      expected: false,
      description: 'Missing local part',
    },
    { email: 'user@domain', domain: 'domain', expected: false, description: 'Missing TLD' },
    {
      email: 'user @domain.com',
      domain: 'domain.com',
      expected: false,
      description: 'Space in email',
    },
    {
      email: 'user@@domain.com',
      domain: 'domain.com',
      expected: false,
      description: 'Double @ symbol',
    },
    {
      email: 'user..name@domain.com',
      domain: 'domain.com',
      expected: false,
      description: 'Consecutive dots',
    },
    {
      email: '.user@domain.com',
      domain: 'domain.com',
      expected: false,
      description: 'Leading dot',
    },
    {
      email: 'user.@domain.com',
      domain: 'domain.com',
      expected: false,
      description: 'Trailing dot in local',
    },
    {
      email: 'user@domain..com',
      domain: 'domain..com',
      expected: false,
      description: 'Consecutive dots in domain',
    },
  ],

  // 2. isDisposable.js - Temporary/disposable email detection
  disposableTests: [
    {
      email: 'user@guerrillamail.com',
      domain: 'guerrillamail.com',
      expected: true,
      description: 'Known disposable provider',
    },
    {
      email: 'test@tempmail.com',
      domain: 'tempmail.com',
      expected: true,
      description: 'Temporary email service',
    },
    {
      email: 'throwaway@10minutemail.com',
      domain: '10minutemail.com',
      expected: true,
      description: '10 minute mail service',
    },
    {
      email: 'user@mailinator.com',
      domain: 'mailinator.com',
      expected: true,
      description: 'Mailinator disposable',
    },
    {
      email: 'legit@gmail.com',
      domain: 'gmail.com',
      expected: false,
      description: 'Legitimate provider',
    },
    {
      email: 'business@company.com',
      domain: 'company.com',
      expected: false,
      description: 'Business email',
    },
    {
      email: 'admin@outlook.com',
      domain: 'outlook.com',
      expected: false,
      description: 'Major email provider',
    },
  ],

  // 3. isFreeDomain.js - Free email provider detection
  freeDomainTests: [
    {
      email: 'user@gmail.com',
      domain: 'gmail.com',
      expected: true,
      description: 'Gmail free account',
    },
    {
      email: 'person@yahoo.com',
      domain: 'yahoo.com',
      expected: true,
      description: 'Yahoo free account',
    },
    {
      email: 'someone@hotmail.com',
      domain: 'hotmail.com',
      expected: true,
      description: 'Hotmail free account',
    },
    {
      email: 'test@outlook.com',
      domain: 'outlook.com',
      expected: true,
      description: 'Outlook free account',
    },
    {
      email: 'user@protonmail.com',
      domain: 'protonmail.com',
      expected: true,
      description: 'ProtonMail free tier',
    },
    {
      email: 'admin@mycompany.com',
      domain: 'mycompany.com',
      expected: false,
      description: 'Business domain',
    },
    {
      email: 'contact@enterprise.org',
      domain: 'enterprise.org',
      expected: false,
      description: 'Custom domain',
    },
  ],

  // 4. isRoleAccount.js - Generic role-based email detection
  roleAccountTests: [
    {
      email: 'admin@company.com',
      domain: 'company.com',
      expected: true,
      description: 'Admin role account',
    },
    {
      email: 'info@business.com',
      domain: 'business.com',
      expected: true,
      description: 'Info role account',
    },
    {
      email: 'support@website.com',
      domain: 'website.com',
      expected: true,
      description: 'Support role account',
    },
    {
      email: 'noreply@service.com',
      domain: 'service.com',
      expected: true,
      description: 'No-reply role account',
    },
    {
      email: 'sales@company.com',
      domain: 'company.com',
      expected: true,
      description: 'Sales role account',
    },
    {
      email: 'contact@business.com',
      domain: 'business.com',
      expected: true,
      description: 'Contact role account',
    },
    {
      email: 'help@support.com',
      domain: 'support.com',
      expected: true,
      description: 'Help role account',
    },
    {
      email: 'john.doe@company.com',
      domain: 'company.com',
      expected: false,
      description: 'Personal name email',
    },
    {
      email: 'jsmith@business.com',
      domain: 'business.com',
      expected: false,
      description: 'Individual user email',
    },
  ],

  // 5. hasSuspiciousPatterns.js - Suspicious email pattern detection
  suspiciousPatternTests: [
    {
      email: 'user123456789@domain.com',
      domain: 'domain.com',
      expected: true,
      description: 'Too many consecutive numbers',
    },
    {
      email: 'aaaaaaaa@domain.com',
      domain: 'domain.com',
      expected: true,
      description: 'Too many repeated characters',
    },
    {
      email: 'randomxyz123@domain.com',
      domain: 'domain.com',
      expected: true,
      description: "Contains 'random' keyword",
    },
    {
      email: 'test@domain.com',
      domain: 'domain.com',
      expected: true,
      description: "Contains 'test' keyword",
    },
    {
      email: 'fake@domain.com',
      domain: 'domain.com',
      expected: true,
      description: "Contains 'fake' keyword",
    },
    {
      email: 'qwerty@domain.com',
      domain: 'domain.com',
      expected: true,
      description: 'Keyboard pattern',
    },
    {
      email: 'asdfgh@domain.com',
      domain: 'domain.com',
      expected: true,
      description: 'Another keyboard pattern',
    },
    {
      email: 'john.smith@company.com',
      domain: 'company.com',
      expected: false,
      description: 'Normal name pattern',
    },
    {
      email: 'j.doe42@business.com',
      domain: 'business.com',
      expected: false,
      description: 'Reasonable user email',
    },
  ],

  // 6. checkMxRecords.js - MX record validation (DNS check)
  mxRecordTests: [
    {
      email: 'user@gmail.com',
      domain: 'gmail.com',
      expected: true,
      description: 'Valid MX records exist',
    },
    {
      email: 'contact@microsoft.com',
      domain: 'microsoft.com',
      expected: true,
      description: 'Corporate domain with MX',
    },
    {
      email: 'test@nonexistentdomain12345xyz.com',
      domain: 'nonexistentdomain12345xyz.com',
      expected: false,
      description: "Domain doesn't exist",
    },
    {
      email: 'user@example.invalid',
      domain: 'example.invalid',
      expected: false,
      description: 'Invalid TLD',
    },
    {
      email: 'admin@localdomain.local',
      domain: 'localdomain.local',
      expected: false,
      description: 'Local domain without MX',
    },
  ],

  // 7. checkDomainAge.js - Domain age verification
  domainAgeTests: [
    {
      email: 'user@google.com',
      domain: 'google.com',
      expected: true,
      description: 'Well-established domain (old)',
    },
    {
      email: 'contact@amazon.com',
      domain: 'amazon.com',
      expected: true,
      description: 'Old trusted domain',
    },
    {
      email: 'info@newstartup2024.com',
      domain: 'newstartup2024.com',
      expected: false,
      description: 'Recently registered domain',
    },
    {
      email: 'user@brandnewsite.io',
      domain: 'brandnewsite.io',
      expected: false,
      description: 'Fresh domain registration',
    },
    {
      email: 'test@temporarysite.xyz',
      domain: 'temporarysite.xyz',
      expected: false,
      description: 'Suspicious new domain',
    },
  ],

  // Combined validation scenarios
  integrationTests: [
    {
      email: 'admin@10minutemail.com',
      domain: '10minutemail.com',
      checks: {
        syntax: true,
        disposable: true,
        free: true,
        role: true,
        suspicious: false,
        mx: true,
        domainAge: false,
      },
      overall: false,
      description: 'Role account on disposable domain',
    },
    {
      email: 'john.smith@mycompany.com',
      domain: 'mycompany.com',
      checks: {
        syntax: true,
        disposable: false,
        free: false,
        role: false,
        suspicious: false,
        mx: true,
        domainAge: true,
      },
      overall: true,
      description: 'Legitimate business email',
    },
    {
      email: 'test123456@gmail.com',
      domain: 'gmail.com',
      checks: {
        syntax: true,
        disposable: false,
        free: true,
        role: false,
        suspicious: true,
        mx: true,
        domainAge: true,
      },
      overall: false,
      description: 'Suspicious pattern on free domain',
    },
    {
      email: 'info@newcompany.com',
      domain: 'newcompany.com',
      checks: {
        syntax: true,
        disposable: false,
        free: false,
        role: true,
        suspicious: false,
        mx: true,
        domainAge: false,
      },
      overall: false,
      description: 'Role account on new domain',
    },
  ],
}

// Example usage function
function runTests(validators) {
  console.log('=== SYNTAX VALIDATION TESTS ===')
  testCases.syntaxTests.forEach((test) => {
    const result = validators.validateSyntax(test.email)
    console.log(`${test.email}: ${result === test.expected ? '✓' : '✗'} - ${test.description}`)
  })

  console.log('\n=== DISPOSABLE EMAIL TESTS ===')
  testCases.disposableTests.forEach((test) => {
    const result = validators.isDisposable(test.email)
    console.log(`${test.email}: ${result === test.expected ? '✓' : '✗'} - ${test.description}`)
  })

  console.log('\n=== FREE DOMAIN TESTS ===')
  testCases.freeDomainTests.forEach((test) => {
    const result = validators.isFreeDomain(test.email)
    console.log(`${test.email}: ${result === test.expected ? '✓' : '✗'} - ${test.description}`)
  })

  console.log('\n=== ROLE ACCOUNT TESTS ===')
  testCases.roleAccountTests.forEach((test) => {
    const result = validators.isRoleAccount(test.email)
    console.log(`${test.email}: ${result === test.expected ? '✓' : '✗'} - ${test.description}`)
  })

  console.log('\n=== SUSPICIOUS PATTERN TESTS ===')
  testCases.suspiciousPatternTests.forEach((test) => {
    const result = validators.hasSuspiciousPatterns(test.email, test.domain)
    console.log(`${test.email}: ${result === test.expected ? '✓' : '✗'} - ${test.description}`)
  })

  console.log('\n=== MX RECORD TESTS ===')
  testCases.mxRecordTests.forEach(async (test) => {
    const result = await validators.checkMxRecords(test.email)
    console.log(`${test.email}: ${result === test.expected ? '✓' : '✗'} - ${test.description}`)
  })

  console.log('\n=== DOMAIN AGE TESTS ===')
  testCases.domainAgeTests.forEach(async (test) => {
    const result = await validators.checkDomainAge(test.email)
    console.log(`${test.email}: ${result === test.expected ? '✓' : '✗'} - ${test.description}`)
  })
}

// Export for use in your testing framework
export { testCases, runTests }
