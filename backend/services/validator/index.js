// validator service
import { isFreeDomain } from './isFreeDomain.js';
import { isDisposable } from "./isDisposable.js";
import { isRoleAccount } from "./isRoleAccount.js";
import { checkDns } from "./checkDns.js";
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

    // DNS and MX are separate checks
    const dnsValid = syntaxValid ? await checkDns(domain) : false;
    const mxRecords = syntaxValid ? await checkMxRecords(domain) : null;
    const mxValid = mxRecords !== null;

    // SMTP check only if MX records exist
    const smtpValid = syntaxValid && mxValid
      ? (await checkSmtp(email, domain, mxRecords)) ?? false
      : false;

    // Independent checks - run if syntax is valid (don't need DNS/MX)
    const isDisposableEmail = syntaxValid ? isDisposable(domain, email) : false;
    const isFree = syntaxValid ? isFreeDomain(domain) : false;
    const isRole = syntaxValid ? isRoleAccount(email) : false;
    const suspiciousPattern = syntaxValid ? hasSuspiciousPatterns(email, domain) : false;

    // DNS-dependent checks - only run if DNS is valid
    const domainAge = dnsValid ? await checkDomainAge(domain) : null;

    return {
      syntax: syntaxValid,
      dns: dnsValid,
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
    checkDns,
    checkMxRecords,
    checkDomainAge,
    validateSyntax,
    hasSuspiciousPatterns,
    checkSmtp,
};
