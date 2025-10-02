import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// List of disposable email domains
const disposableDomains = [
  'guerrillamail.com',
  'tempmail.com',
  '10minutemail.com',
  'throwaway.email',
  'temp-mail.org',
  'mailinator.com',
  'maildrop.cc',
  'trashmail.com',
  'yopmail.com',
  'getnada.com'
];

// List of free email providers
const freeEmailProviders = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'mail.com',
  'zoho.com'
];

// List of role-based email prefixes
const roleBasedPrefixes = [
  'info',
  'admin',
  'support',
  'noreply',
  'no-reply',
  'sales',
  'marketing',
  'contact',
  'help',
  'service',
  'postmaster',
  'webmaster',
  'hostmaster'
];

/**
 * Validates email syntax using regex
 */
function validateSyntax(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks if domain has valid MX records
 */
async function checkMxRecords(domain) {
  try {
    const records = await resolveMx(domain);
    return records && records.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Checks if email is from a disposable domain
 */
function isDisposable(domain) {
  return disposableDomains.includes(domain.toLowerCase());
}

/**
 * Checks if email is from a free email provider
 */
function isFreeEmail(domain) {
  return freeEmailProviders.includes(domain.toLowerCase());
}

/**
 * Checks if email is a role-based account
 */
function isRoleAccount(email) {
  const localPart = email.split('@')[0].toLowerCase();
  return roleBasedPrefixes.includes(localPart);
}

/**
 * Calculates risk score based on validation checks
 * Score: 0-100 (0 = safest, 100 = riskiest)
 */
function calculateRiskScore(checks) {
  let score = 0;

  if (!checks.syntax) score += 100; // Invalid syntax = max risk
  if (!checks.dns) score += 50; // No DNS/MX = very risky
  if (checks.disposable) score += 80; // Disposable email = very risky
  if (checks.roleAccount) score += 30; // Role account = somewhat risky
  if (checks.freeEmail) score += 10; // Free email = slightly risky

  return Math.min(score, 100);
}

/**
 * Determines overall status based on checks and risk score
 */
function determineStatus(checks, riskScore) {
  if (!checks.syntax || !checks.dns) return 'invalid';
  if (checks.disposable || riskScore >= 70) return 'risky';
  if (riskScore < 30) return 'valid';
  return 'risky';
}

/**
 * Generates reason message based on validation results
 */
function generateReason(status, checks) {
  if (status === 'valid') return '';

  const reasons = [];
  if (!checks.syntax) reasons.push('Invalid email syntax');
  if (!checks.dns) reasons.push('Domain has no valid MX records');
  if (checks.disposable) reasons.push('Disposable email address');
  if (checks.roleAccount && status === 'risky') reasons.push('Role-based email account');

  return reasons.join(', ');
}

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
    const isDisposableEmail = syntaxValid ? isDisposable(domain) : false;
    const isFree = syntaxValid ? isFreeEmail(domain) : false;
    const isRole = syntaxValid ? isRoleAccount(email) : false;

    const checks = {
      syntax: syntaxValid,
      dns: mxValid,
      mx: mxValid,
      disposable: isDisposableEmail,
      freeEmail: isFree,
      roleAccount: isRole
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
      reason
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
