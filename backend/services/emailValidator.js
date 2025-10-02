import {
  hasSuspiciousPatterns,
  isDisposable,
  checkDomainAge,
  checkMxRecords,
  isFreeDomain,
  isRoleAccount,
  validateSyntax,
  checkSmtp
} from './validator/index.js';

import {
  calculateRiskScore,
  determineStatus,
  generateReason,
} from './results/index.js';

/**
 * Main validation function
 */
export async function validateEmail(email) {
  try {
    // Normalize email
    email = email.trim().toLowerCase();

    // Extract domain
    const [, domain] = email.split('@');

    // Perform all checks
    const syntaxValid = validateSyntax(email);
    const mxValid = syntaxValid ? await checkMxRecords(domain) : false;
    const smtpValid = syntaxValid && mxValid ? checkSmtp(email, domain) : false;
    const isDisposableEmail = syntaxValid ? isDisposable(domain, email) : false;
    const isFree = syntaxValid ? isFreeDomain(domain) : false;
    const isRole = syntaxValid ? isRoleAccount(email) : false;
    const domainAge = await checkDomainAge(domain);
    const suspiciousPattern = hasSuspiciousPatterns(email, domain);

    const checks = {
      syntax: syntaxValid,
      dns: mxValid,
      mx: mxValid,
      smtp: smtpValid,
      disposable: isDisposableEmail,
      freeEmail: isFree,
      roleAccount: isRole,
      domainAge: domainAge,
      suspiciousPattern: suspiciousPattern
    };

    const riskScore = calculateRiskScore(checks);
    const status = determineStatus(checks, riskScore);
    const reason = generateReason(status, checks);

    return {
      email,
      isValid: status === 'valid',
      status,
      riskScore,
      checks,
      reason,
    };
  } catch (error) {
    console.error('Email validation error:', error);
    return {
      email,
      isValid: false,
      status: 'unknown',
      riskScore: 100,
      checks: {
        syntax: false,
        dns: false,
        mx: false,
        disposable: false,
        freeEmail: false,
        roleAccount: false
      },
      reason: 'Validation error occurred'
    };
  }
}
