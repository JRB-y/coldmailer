// validator service
import { isFreeDomain } from './isFreeDomain.js';
import { isDisposable } from "./isDisposable.js";
import { isRoleAccount } from "./isRoleAccount.js";
import { checkMxRecords } from "./checkMxRecords.js";
import { checkDomainAge } from "./checkDomainAge.js";
import { validateSyntax } from "./validateSyntax.js";
import { hasSuspiciousPatterns } from "./hasSuspiciousPatterns.js";
import { checkSmtp } from "./checkSmtp.js";

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

    return {
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



export {
    isFreeDomain,
    isDisposable,
    isRoleAccount,
    checkMxRecords,
    checkDomainAge,
    validateSyntax,
    hasSuspiciousPatterns,
    checkSmtp,
};
